# Agent Ops Kit — Lite

The D.O.E. framework (**Directive / Orchestration / Execution**) for running AI
coding agents — Claude Code, Cursor, Codex, Gemini CLI — reliably on real work.

**The problem:** an LLM is probabilistic; your business logic isn't. If the agent
executes every step itself, errors compound — 90 % per step is 59 % over five
steps. D.O.E. moves the deterministic work into scripts and leaves the agent one
job: deciding what to run next. Then it makes the system *self-annealing*: every
failure becomes a test, a rule, and a lint.

## What's in the lite version (free, MIT)

| File | What it is |
|---|---|
| `CLAUDE.md` | The agent's operating instructions: the 3 layers, 6 operating principles, the self-annealing loop, mandatory directive checks. Cursor: paste into `.cursorrules`; Codex/Gemini: `AGENTS.md` / `GEMINI.md`. |
| `directives/core/operating-principles.md` | The non-negotiables, written to sync unchanged into every repo you run |
| `directives/00_template.md` | The directive layout (Goal · Inputs · Execution tools · Outputs · Edge cases · Verification) |
| `executions/lint_secrets.py` | Catches hard-coded API keys/tokens before they reach git (Stripe, GitHub, AWS, Slack, OpenAI, Anthropic, private keys). Zero dependencies. |

```
python executions/lint_secrets.py          # exit 1 on any finding
```

## Quick start

1. Copy `CLAUDE.md` and `directives/` into your repo root.
2. Write your first directive from `directives/00_template.md`, named after the job
   (`deploy_api.md`). Reference the script that will do the work.
3. Tell the agent: *"Read CLAUDE.md, then <job>."* Watch what it appends to the
   directive's *Edge cases & learnings* — that section is the return on investment.

## The full kit ($29)

The paid **Agent Ops Kit** adds everything CLAUDE.md's mandatory-checks table refers to:

- 3 more core directives: self-annealing loop, bug-fix standard, agent governance
- 3 complete example directives: deploy a service, QA a website, scrape a site
- 6 more scripts: script template (argparse/.env/retries/exit codes), directive↔script
  linter, anneal log, headless QA/SEO crawler, SSH deploy with CRLF/BOM fix,
  robots-aware scraper — with tests
- 3 Claude Code skills (qa-test, deploy, project-status)
- PM + worker agent templates, agent registry schema
- Guides: why D.O.E. works, adopting it in an existing codebase, running a fleet

→ **https://skibuff22.github.io/calyx-ai-site/** — instant download, free updates, 14-day refund.

Built and used daily to run a small engineering company's CRM, invoicing, inventory
and calibration platform with a fleet of agents. Every governance rule in the full
kit is a real incident turned into a standard.
