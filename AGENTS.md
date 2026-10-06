# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: the loop rules, build and test commands, and sharp-edge notes that should travel with the code.
Loop sessions (`PROMPT.md`, `INIT_PROMPT.md`) read it first.

The contract is owned by [SPEC.md](SPEC.md) and the suite in [conformance/](conformance/). How to run the loop is owned by [README.md](README.md). Follow those instead of restating them here.

- [VISION.md](VISION.md) is the product scope: structure and behavior of the shell only, tests are the contract, and the contract never depends on one stack.

## Rules for agents working in this repo

1. `SPEC.md` and `conformance/` are the contract. **Never edit, delete, or skip anything in
   `SPEC.md`, `VISION.md`, `schema/`, `conformance/tests/`, `conformance/playwright.config.ts`,
   `scripts/`, or the prompt files.** Changes are reverted automatically. If you believe a test
   is wrong, write it up under `## Spec questions` in `progress.md` and move on.
2. Only write code inside the implementation directory (`reference/django/` by default).
3. Work on **one failing behavior per session**: the lowest-numbered failing ID in `features.json`.
4. Done means the test passes, not that you think it works. Run it:
   `cd conformance && npx playwright test -g "<ID>"`. Then run the full suite to check for regressions.
5. Commit when the behavior passes, with the ID in the message: `B04: j/k selection`.
6. Before ending, append 2–5 lines to `progress.md`: what you did, what's next, any traps.
7. Keep `run.sh` working: it must reset data to `schema/seed.json` and serve on `${PORT:-8000}`.

## Sharp edges

- `features.json` is written by `scripts/update-features.mjs` from `conformance/results.json`. Do not hand-flip `passes`.
- "Immediately" in B11/B12 means the UI updates within 700 ms while every non-GET request is delayed 2 s. A plain form post that waits for the server fails.
- Single-key shortcuts must not fire while focus is in an `input`, `textarea`, `select`, or `contenteditable` element, except `Escape` ([SPEC.md section 5](SPEC.md)).
- `ralph.sh` restores the protected files from the `contract-baseline` tag after every session, so edits to them are lost.

## Development

```sh
cd conformance && npm install && npx playwright install chromium
IMPL_DIR=../reference/django npx playwright test
I_AM_IN_A_SANDBOX=1 ./ralph.sh
```

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
Loop sessions must not edit this file (rule 1); a human or a non-loop session maintains it.
