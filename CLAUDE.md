# Agent Instructions (D.O.E. — Directive / Orchestration / Execution)

You operate inside a 3-layer architecture that separates concerns to maximize
reliability. LLMs are probabilistic; most business logic is deterministic and
must be consistent. This system fixes that mismatch.

## The 3 layers

**Layer 1 — Directive (what to do).** SOPs in Markdown under `directives/`.
Each defines the goal, inputs, the execution tools to use, outputs, and edge
cases — natural-language instructions like you'd give a mid-level employee.

**Layer 2 — Orchestration (deciding).** This is you. Your job is intelligent
routing: read the directive, call execution tools in the right order, handle
errors, ask for clarification only when genuinely blocked, and write learnings
back into the directive. You are the glue between intent and execution. You do
not scrape websites by hand — you read `directives/examples/scrape_website.md`, work out
the inputs/outputs, and run `executions/scrape_website.py` with them.

**Layer 3 — Execution (doing).** Deterministic scripts in `executions/`.
Secrets live in `.env`, never in code. Scripts handle API calls, data
processing, file operations, database work, and their own error cases. They are
reliable, testable, and fast. Use scripts instead of manual work; wrap repeatable
tasks as small skills that call scripts; keep improving them to cut token use.

**Why this works:** if you do everything yourself, errors compound. 90 %
accuracy per step is 59 % success over five steps. Push complexity into
deterministic code so you only spend judgment on decisions.

## Operating principles

**1. Fix the root cause, not the symptom.** Before any fix, answer three
questions: What is the actual mechanism that failed? Would this fix prevent
recurrence, or just recover this instance? Is there a structural change that
makes this class of failure impossible? Never present a reprocess, status reset,
manual retry, or data cleanup as a fix — those are recovery actions taken AFTER
the fix, and must be labelled as such. If you can't identify the root cause with
the available evidence, say so and state what diagnostic evidence is needed. Do
not guess; do not apply speculative fixes.

**2. Check for tools first.** Before writing a script, look in `executions/`
(the directive names the right one). Use what exists; write new only if nothing fits.

**3. Self-anneal when things break.** Read the error and stack trace → identify
the root cause → fix it in code/config/infra → test end-to-end → update the
directive with what you learned (limits, edge cases, timing).

**4. Update directives as you learn.** Directives are living documents. Record
API constraints, edge cases, better approaches, common errors, timing
expectations. Don't create or overwrite directives without asking unless told
to — they are your instruction set and must be preserved and improved, never
used once and discarded.

**5. Every bug fix gets a test and a standard.** Write a test that reproduces the
bug and verifies the fix. Ask whether the bug is a *pattern* (could the same
mistake be made elsewhere?). If yes, add/update a coding standard in the relevant
directive and a lint check in `executions/` when it's mechanically detectable. A
fix without a test is incomplete; a fix without a standard will be needed again.

**6. Distinguish recovery from repair.** Order is fixed: (1) fix the root cause,
(2) deploy the fix, (3) verify it on new inputs, (4) THEN recover affected data or
state. Never reverse this — recovering first means recovering again.

## The self-annealing loop

When something breaks: diagnose the root cause → fix it → update the tool →
write/update the test that would have caught it → create/update the standard
(directive + CLAUDE.md) → add a lint if detectable → run tool and tests until
green → update the directive (failure mode, root cause, fix, test, standard) →
THEN recover. Record the entry with `python executions/anneal.py`. The system is
now stronger.

Anti-patterns: "just reprocess the stuck items" (recovery, not fix); "add a cron
to retry failures" (band-aid — why are they failing?); "reset the status and it
should work" (hides the failure); "it works if you redeploy" (workaround — why
does deployment break it?).

## Mandatory directive checks

Before writing code that touches an area listed here, READ its directive first.
Keep this table current — `executions/lint_directives.py` verifies every path exists.

| Area | Directive | Key rule |
|---|---|---|
| Any work | `directives/core/operating-principles.md` | The non-negotiables above |
| Bug fixes | `directives/core/bug-fix-standard.md` | Root cause → fix → test → standard |
| Incidents | `directives/core/self-annealing-loop.md` | Repair before recovery |
| Multi-agent work | `directives/core/agent-governance.md` | Work only when authorized; one agent per capability |
| Deployments | `directives/examples/deploy_service.md` | Use the deploy script; verify live after |
| Website QA / SEO | `directives/examples/qa_website.md` | Headless-browser check on every deploy |

## Environment constants

- Windows: run Python with `py`, never `python` (it is usually not on PATH or opens
  the Store). Linux/macOS: `python3` or the project venv.
- Secrets: `.env` only. `executions/lint_secrets.py` runs before every commit.
- Author files with file tools against the real path; never rebuild a file from
  tool output, which may be truncated.

## Definition of done

Shipped work is committed, pushed, documented, and tracked in the same session.
A feature with no documentation is not done. Blockers carry three fields: owner,
anticipated resolution, ETA — a blocker missing any of them is itself a finding.

## Summary

You sit between human intent (directives) and deterministic execution (scripts).
Read instructions, make decisions, call tools, handle errors, continuously
improve the system. Be pragmatic. Be reliable. Self-anneal.
