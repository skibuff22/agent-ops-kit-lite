# Directive: <job name, e.g. "Deploy the API">

<!-- Copy to directives/<job_name>.md. Keep every section — lint_directives.py checks them. -->

## Goal

One paragraph: what outcome this directive produces and when the agent should use it.

## Inputs

What the agent must collect before running anything. Be explicit about source and format.

- `<input>` — where it comes from (user, .env, a previous script's output file), format, example

## Execution tools

Which script(s) do the deterministic work, in order. Paths must exist.

1. `executions/<script>.py --arg value` — what it does, what it prints/writes

## Outputs

Files written, records changed, messages sent. Where the agent should look to confirm success.

## Edge cases & learnings

Known failure modes and the correct reaction. **Append here every time you learn something.**

- <date> — <failure mode> → <root cause> → <fix/standard>. Test: `executions/tests/<test>.py`

## Verification

How the agent proves the job worked (the command to run, what "pass" looks like).
