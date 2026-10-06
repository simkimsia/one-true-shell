# One True Shell

A testable contract for the One True SaaS Layout: six regions, keyboard-first behavior,
tabs, and optimistic updates — for any entities, on any stack.

Layout credit: [Nan Yu](https://x.com/thenanyu/status/2105704619704029435).
The behavior contract is this project's addition.

- `VISION.md` — what is in and out of scope (one rule per heading)
- `SPEC.md` — the contract (v0.2.0)
- `conformance/` — Playwright suite; the tests *are* the contract
- `schema/` — sample entities and seed data
- `reference/` — empty workspace the optional loop below builds into
- `IMPLEMENTATIONS.md` — every conformant implementation; add yours

## Build one in your stack

Implementations live in their own repos. The first one,
[one-true-shell-django](https://github.com/simkimsia/one-true-shell-django), passes 14/14 and
its CI runs this suite against itself; copy its workflow. Pick any stack, add a `run.sh`,
and run the suite against it (below). When it passes, open a PR adding it to
[IMPLEMENTATIONS.md](IMPLEMENTATIONS.md).

## Run the loop (Claude Code)

Requirements: git, Node 18+, Python 3.11+, Claude Code CLI, and a sandbox
(container, VM, or devcontainer) because the agent runs without permission prompts.

```bash
I_AM_IN_A_SANDBOX=1 ./ralph.sh
```

Tunables: `MAX_ITER` (25), `MODEL` (claude-opus-5-5), `MAX_TURNS` (80 per session),
`ITER_TIMEOUT` (45m per session), `IMPL_DIR` (reference/django).

Watch progress in `progress.md`, `features.json`, and `git log`.

## Test any implementation

```bash
cd conformance && npm install && npx playwright install chromium
IMPL_DIR=../path/to/your/impl npx playwright test
```

Your implementation needs a `run.sh` (see SPEC.md section 6).

## License

MIT for code. Spec text: MIT for now; "conformant" means passing this suite at a declared version.
