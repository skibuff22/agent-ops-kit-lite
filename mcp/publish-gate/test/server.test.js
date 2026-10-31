import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { checkNumbers, checkLinks } from "../server.js";

const FACTS = "- Publish Gate costs $19 one-time.\n- It has 8 tests.\n";

test("numbers in facts pass, others fail", () => {
  assert.deepEqual(checkNumbers("---\ntitle: x 99\n---\nIt costs $19 and has 8 tests.\n", FACTS), []);
  const f = checkNumbers("It has 12 tests.\n", FACTS);
  assert.equal(f.length, 1);
  assert.match(f[0], /'12'/);
});

test("years, versions, list numbering and [src:] lines are exempt", () => {
  assert.deepEqual(checkNumbers("1. In 2026, Python 3.9 at 08:15.\nIt grew 40% [src: https://example.com]\n", FACTS), []);
});

test("checkout link without utm_source fails; HTTP errors fail", async () => {
  const fetchFn = async (u) => ({ status: u.includes("gone") ? 404 : 200 });
  const f = await checkLinks("Buy https://x.test/checkout.php?sku=A and https://x.test/gone.", { fetchFn });
  assert.equal(f.length, 2);
  assert.deepEqual(await checkLinks("https://x.test/checkout.php?sku=A&utm_source=devto", { fetchFn }), []);
});

test("stdio: initialize, tools/list, tools/call", async () => {
  const p = spawn(process.execPath, [new URL("../server.js", import.meta.url).pathname]);
  const out = [];
  p.stdout.on("data", (d) => out.push(...d.toString().trim().split("\n")));
  const send = (m) => p.stdin.write(JSON.stringify({ jsonrpc: "2.0", ...m }) + "\n");
  send({ id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } });
  send({ method: "notifications/initialized" });
  send({ id: 2, method: "tools/list" });
  send({ id: 3, method: "tools/call", params: { name: "check_numbers", arguments: { draft_text: "12 tests", facts_text: FACTS } } });
  await new Promise((r) => setTimeout(r, 500));
  p.kill();
  const res = out.map((l) => JSON.parse(l));
  assert.equal(res.length, 3);
  assert.equal(res[0].result.serverInfo.name, "publish-gate");
  assert.deepEqual(res[1].result.tools.map((t) => t.name), ["check_numbers", "check_links"]);
  assert.match(res[2].result.content[0].text, /^FAIL \(1\)/);
});

test("stdio: unknown tool and missing draft are protocol errors; unreadable file is a tool error", async () => {
  const p = spawn(process.execPath, [new URL("../server.js", import.meta.url).pathname]);
  const out = [];
  p.stdout.on("data", (d) => out.push(...d.toString().trim().split("\n")));
  const send = (m) => p.stdin.write(JSON.stringify({ jsonrpc: "2.0", ...m }) + "\n");
  send({ id: 1, method: "tools/call", params: { name: "no_such_tool", arguments: { draft_text: "x" } } });
  send({ id: 2, method: "tools/call", params: { name: "check_numbers", arguments: { facts_text: FACTS } } });
  send({ id: 3, method: "tools/call", params: { name: "check_numbers", arguments: { draft_path: "/nonexistent/draft.md", facts_text: FACTS } } });
  send({ id: 4, method: "nope" });
  await new Promise((r) => setTimeout(r, 500));
  p.kill();
  const res = Object.fromEntries(out.map((l) => JSON.parse(l)).map((m) => [m.id, m]));
  assert.equal(res[1].error.code, -32602);
  assert.equal(res[2].error.code, -32602);
  assert.equal(res[3].result.isError, true);
  assert.match(res[3].result.content[0].text, /^error: /);
  assert.equal(res[4].error.code, -32601);
});
