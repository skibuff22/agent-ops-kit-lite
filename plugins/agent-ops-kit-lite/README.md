# Agent Ops Kit Lite

A Claude Code plugin for the D.O.E. operating model (**Directive / Orchestration / Execution**):
written SOPs (directives) say what to do, deterministic scripts (executions) do the work, and the
agent decides which to run next. Every failure becomes a test, a rule and a lint.

## Install

```
/plugin install agent-ops-kit-lite --marketplace skibuff22/agent-ops-kit-lite
```

## Commands and skills

- `/agent-ops-kit-lite:aok-init` scaffolds `CLAUDE.md`, `directives/` and a zero-dependency
  secrets linter into the current repo. It never overwrites an existing file, and you approve
  each file it writes.
- `/agent-ops-kit-lite:aok-directive <job>` writes a directive for a job, based on what is
  actually in the repo (scripts, CI config, history), and lists open questions instead of guessing.
- `/agent-ops-kit-lite:verify-claims <draft>` checks a draft post, README or reply claim by claim
  against your `facts.md` and reports a PASS/FAIL table. It only reads; it does not edit the draft.
- `/agent-ops-kit-lite:aok-upgrade` describes what the paid Agent Ops Kit adds.

## What the plugin contains

- `templates/CLAUDE.md`: operating instructions (the three layers, operating principles,
  the self-annealing loop) that `aok-init` copies into your repo.
- `templates/directives/`: the directive template and the core operating principles.
- `templates/executions/lint_secrets.py`: scans source files for hard-coded API keys and tokens
  (Stripe, GitHub, AWS, Slack, OpenAI, Anthropic, private keys). Standard library only.

The plugin reads no credentials and keeps no data, and its scripts make no network calls.
`verify-claims` may open the links in your draft to check that they load, if your session
allows web fetches. All files it writes go into the repository you run it in.

Source, issues and the companion MCP server: https://github.com/skibuff22/agent-ops-kit-lite

MIT licensed. Published by Calyx AI (Quality Tester Solutions LLC), https://calyx-ai.net/
