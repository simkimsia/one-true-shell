# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: how the contract is changed, tested, and released, plus sharp-edge notes that should travel with it.

The contract is owned by [SPEC.md](SPEC.md) and the suite in [conformance/](conformance/). Scope is owned by [VISION.md](VISION.md). Follow those instead of restating them here.

- [VISION.md](VISION.md) is the product scope: structure and behavior of the shell only, tests are the contract, and the contract never depends on one stack.
- This repo holds the contract only. Implementations live in their own repos and are listed in [IMPLEMENTATIONS.md](IMPLEMENTATIONS.md); [one-true-shell-django](https://github.com/simkimsia/one-true-shell-django) is the worked example.

## Changing the contract

- A new MUST gets a row in `SPEC.md` section 5, a test whose title starts with its ID, and prose in the section it belongs to, all in one commit.
- Adding behaviors is a minor bump (`0.x` to `0.x+1`). Bump the version in `SPEC.md`, `README.md`, `conformance/package.json`, `conformance/package-lock.json`, the test file header, and the `spec:` line in `IMPLEMENTATIONS.md`.
- Release by tagging `vX.Y.Z` on the commit that changes the contract. Implementations pin that tag in CI, so never move a published tag.
- Before tagging, run the new suite against every listed implementation; a behavior no implementation can pass is a spec question, not a release.

## Sharp edges

- "Immediately" in B11/B12 means the UI updates within 700 ms while every non-GET request is delayed 2 s. A plain form post that waits for the server fails.
- Tests press keys right after a key that navigates (B06: Escape, j, Enter). Implementations that do full page loads must not drop those keys.
- Single-key shortcuts must not fire while focus is in an `input`, `textarea`, `select`, or `contenteditable` element, except `Escape` ([SPEC.md section 5](SPEC.md)).

## Development

```sh
cd conformance && npm ci && npx playwright install chromium
IMPL_DIR=/path/to/impl npx playwright test
```

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
