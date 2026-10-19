---
description: Write a new D.O.E. directive (SOP) for a job, from the template
argument-hint: <job, e.g. "deploy the API">
allowed-tools: Read, Write, Glob, Grep
---

Write a directive for this job: **$ARGUMENTS**

1. Read `directives/00_template.md` (or `${CLAUDE_PLUGIN_ROOT}/directives/00_template.md` if the repo has none)
   and `directives/core/operating-principles.md` if present.
2. Investigate how this job is actually done in this repo today: scripts, CI config, Makefile/package.json
   targets, READMEs, recent commits. Do not invent steps you cannot find evidence for; list open
   questions instead.
3. Write `directives/<snake_case_job>.md` with every template section filled: Goal, Inputs (with
   sources), Execution tools (existing script paths only; mark scripts that should exist but don't as
   `TODO: write executions/<name>.py`), Outputs, Edge cases & learnings (seed with real failure modes
   you found in history), Verification (a command that proves success).
4. Show the user the file and the open questions.
