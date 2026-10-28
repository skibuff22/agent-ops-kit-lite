#!/usr/bin/env node
// publish-gate-mcp: MCP stdio server (JSON-RPC 2.0, one message per line), no dependencies.
// Tools: check_numbers (every number in a draft must appear in facts.md or carry [src: URL])
//        check_links   (every URL loads; checkout links carry utm_source)
// Same rules as Publish Gate's verify_post.py; the paid kit adds style/voice checks,
// an LLM claim check that fails closed, a sha256 lock and publishers.
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";

const VERSION = "0.1.0";
const NUM_RE = /(?<![\w./-])\$?\d[\d,]*(?:\.\d+)?%?(?![\w./-])/g;
const EXEMPT_NUM_CTX = /(\b(19|20)\d{2}\b|\d{1,2}:\d{2}|\bv?\d+\.\d+(\.\d+)?\b|^\s*\d+[.)]\s)/g;
const URL_RE = /https?:\/\/[^\s)>\]"']+/g;
const norm = (n) => n.replace(/,/g, "").replace(/^\$/, "").replace(/%$/, "");

export function stripFrontMatter(text) {
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  return end === -1 ? text : text.slice(end + 4).replace(/^\n+/, "");
}

export function checkNumbers(draft, facts) {
  const allowed = new Set([...facts.matchAll(NUM_RE)].map((m) => norm(m[0])));
  const fails = [];
  for (const line of stripFrontMatter(draft).split("\n")) {
    if (line.includes("[src:")) continue;
    const probe = line.replace(EXEMPT_NUM_CTX, " ");
    for (const m of probe.matchAll(NUM_RE)) {
      if (!allowed.has(norm(m[0]))) fails.push(`number '${m[0]}' not in facts.md and no [src: ] on line: '${line.trim().slice(0, 70)}'`);
    }
  }
  return fails;
}

export async function checkLinks(draft, { checkoutMarker = "checkout", timeoutMs = 15000, fetchFn = fetch } = {}) {
  const fails = [];
  const urls = [...new Set(stripFrontMatter(draft).match(URL_RE) || [])].map((u) => u.replace(/[.,;:]+$/, "")).sort();
  for (const u of urls) {
    if (checkoutMarker && u.includes(checkoutMarker) && !u.includes("utm_source=")) fails.push(`checkout link without utm_source: ${u}`);
    try {
      const r = await fetchFn(u, { redirect: "follow", signal: AbortSignal.timeout(timeoutMs), headers: { "User-Agent": "publish-gate-mcp" } });
      if (r.status >= 400) fails.push(`link ${u} -> HTTP ${r.status}`);
    } catch (e) {
      fails.push(`link ${u} unreachable: ${e.message}`);
    }
  }
  return fails;
}

const read = (args, textKey, pathKey) => (args[textKey] ?? (args[pathKey] ? readFileSync(args[pathKey], "utf8") : null));

const TOOLS = [
  {
    name: "check_numbers",
    description: "Fail every number in a draft that does not appear in the facts file and has no [src: URL] on its line. Years, times, version strings and list numbering are exempt. Pass text or a path for each.",
    inputSchema: { type: "object", properties: {
      draft_text: { type: "string" }, draft_path: { type: "string" },
      facts_text: { type: "string" }, facts_path: { type: "string", description: "default ./facts.md" } } },
  },
  {
    name: "check_links",
    description: "Fetch every URL in a draft; fail any that errors or returns HTTP >= 400, and any checkout link without utm_source.",
    inputSchema: { type: "object", properties: { draft_text: { type: "string" }, draft_path: { type: "string" } } },
  },
];

async function callTool(name, args = {}) {
  const draft = read(args, "draft_text", "draft_path");
  if (draft == null) throw new Error("give draft_text or draft_path");
  let fails;
  if (name === "check_numbers") {
    const facts = read(args, "facts_text", "facts_path") ?? readFileSync("facts.md", "utf8");
    fails = checkNumbers(draft, facts);
  } else if (name === "check_links") {
    fails = await checkLinks(draft);
  } else throw new Error(`unknown tool ${name}`);
  const text = fails.length ? `FAIL (${fails.length})\n- ${fails.join("\n- ")}` : "PASS";
  return { content: [{ type: "text", text }], isError: false };
}

async function handle(msg) {
  const { id, method, params } = msg;
  switch (method) {
    case "initialize":
      return { protocolVersion: params?.protocolVersion ?? "2025-06-18", capabilities: { tools: {} },
        serverInfo: { name: "publish-gate", version: VERSION } };
    case "tools/list": return { tools: TOOLS };
    case "tools/call":
      try { return await callTool(params.name, params.arguments); }
      catch (e) { return { content: [{ type: "text", text: `error: ${e.message}` }], isError: true }; }
    case "ping": return {};
    default:
      if (id === undefined) return undefined; // notification
      throw Object.assign(new Error(`method not found: ${method}`), { code: -32601 });
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("publish-gate-mcp")) {
  const rl = createInterface({ input: process.stdin });
  rl.on("line", async (line) => {
    if (!line.trim()) return;
    let msg;
    try { msg = JSON.parse(line); } catch { return; }
    try {
      const result = await handle(msg);
      if (msg.id !== undefined && result !== undefined) process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: msg.id, result }) + "\n");
    } catch (e) {
      if (msg.id !== undefined) process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: msg.id, error: { code: e.code ?? -32603, message: e.message } }) + "\n");
    }
  });
}
