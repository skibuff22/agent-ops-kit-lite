# Core Directive: Operating Principles

> CORE FILE — keep one canonical copy and sync it unchanged into every project.
> Applies to every project, whatever its domain.

## The 3-layer D.O.E. model

- **Directive (what to do):** SOPs in this repo's `directives/*.md`. Read the
  relevant one before touching that area; update it in the same session you
  learn something.
- **Orchestration (the agent):** intelligent routing only — read directives,
  run execution scripts in order, handle errors, ask when genuinely blocked.
- **Execution (the work):** deterministic scripts in `executions/` (or `app/`,
  `scripts/`). Push complexity into code; check for an existing script before
  writing a new one.

## Non-negotiables

1. **Fix the root cause, not the symptom.** A reprocess/reset/retry is
   recovery, never a fix. If you can't name the mechanism that failed, you
   haven't found the root cause yet.
2. **Every bug fix gets a test and a standard.** A fix without a test is
   incomplete; a fix without a standard (directive update + lint where
   mechanically detectable) will be needed again.
3. **Repair before recovery.** Fix → deploy → verify on new inputs → THEN
   reprocess stuck data. Never the reverse.
4. **The record stays honest.** Shipped work is committed, pushed, documented,
   and tracked in the same session. A feature with no documentation is not
   done. If the tracker and reality disagree, reality wins.
5. **Blockers carry three fields:** owner, anticipated resolution, ETA.
   A blocker missing any of them is itself a finding.
6. **Secrets never enter code or chat.** `.env` only; `lint_secrets.py` before
   every commit; rotate immediately if one leaks.

## How the agent spends effort

- Read the directive → run the script → read its output → decide. Don't
  re-derive by hand what a script already computes.
- One question to the human per blocker, batched. Prefer stating the assumption
  you're proceeding on over waiting.
- Minimize tokens: wrap repeated multi-step work as a skill that calls a script.

## Environment constants

- Windows: `py`, never `python`. Linux/macOS: `python3` or the project venv.
- Author files with file tools against the real path; tool output can be
  truncated — never rebuild a file from it.
