---
description: Scaffold the D.O.E. framework (CLAUDE.md, directives/, secrets linter) into this repo
allowed-tools: Read, Write, Edit, Glob, Bash(ls:*), Bash(mkdir:*), Bash(cp:*), Bash(python:*), Bash(python3:*), Bash(py:*)
---

Set up the D.O.E. (Directive / Orchestration / Execution) framework in the current
repository using the files shipped with this plugin in `${CLAUDE_PLUGIN_ROOT}`.

1. Look at what already exists: `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `directives/`, `executions/`.
   Never overwrite an existing file.
2. If there is no `CLAUDE.md`, copy `${CLAUDE_PLUGIN_ROOT}/CLAUDE.md`. If one exists, read both and
   append only the D.O.E. sections the project's file is missing (the 3 layers, operating
   principles, self-annealing loop) under a heading `## D.O.E. operating model`. Show the user the diff.
3. Copy `${CLAUDE_PLUGIN_ROOT}/directives/00_template.md` and
   `${CLAUDE_PLUGIN_ROOT}/directives/core/operating-principles.md` into `directives/` (same relative paths).
4. Copy `${CLAUDE_PLUGIN_ROOT}/executions/lint_secrets.py` into `executions/` and run it once
   (`python3 executions/lint_secrets.py`, or `py` on Windows). Report any findings; do not edit them silently.
5. Finish with a short summary of what was added and suggest the first directive to write, based on
   the most repeated or most fragile job you can see in this repo (deploys, releases, migrations,
   data imports). Offer to run `/agent-ops-kit-lite:aok-directive <job>` for it.

$ARGUMENTS
