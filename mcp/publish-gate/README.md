# publish-gate-mcp

MCP server with two checks to run on a draft (post, article, README, reply) before it goes out.
Zero dependencies, Node 18+.

| Tool | Fails when |
|---|---|
| `check_numbers` | a number in the draft is not in your `facts.md` and its line has no `[src: URL]` (years, times, versions, list numbering exempt) |
| `check_links` | a URL errors or returns HTTP 400+, or a checkout link has no `utm_source` |

## Use with Claude Code
```
claude mcp add publish-gate -- npx -y publish-gate-mcp
```
Then: "run check_numbers on post.md against facts.md".

For the claim-by-claim check, install the free Claude Code plugin in this repo
(`/agent-ops-kit-lite:verify-claims`).

## Pro
These are two of the checks in Publish Gate. The paid kit adds stock-phrase and voice
rules, an LLM claim check that fails closed, a sha256 lock written on PASS, and
publishers that refuse a changed or unverified draft. $19 one-time:
https://calyx-ai.net/?utm_source=npm&utm_medium=readme#publish-gate
(sold by Quality Tester Solutions LLC).

MIT.
