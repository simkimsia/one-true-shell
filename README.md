# One True Shell

A testable contract for the One True SaaS Layout: six regions, keyboard-first behavior,
tabs, and optimistic updates — for any entities, on any stack.

Layout credit: [Nan Yu](https://x.com/thenanyu/status/2105704619704029435).
The behavior contract is this project's addition.

[![Nan Yu's One True SaaS Layout: left rail, sidebar, tabs, main content, right side bar, bottom bar](docs/one-true-saas-layout.png)](https://x.com/thenanyu/status/2105704619704029435)

Each region in the drawing maps to one `data-shell` attribute the tests look for:

| In the drawing | In the spec |
|---|---|
| left rail | `data-shell="rail"` |
| sidebar | `data-shell="sidebar"` |
| tabs | `data-shell="tabs"` |
| main content | `data-shell="main"` |
| right side bar | `data-shell="aside"` |
| bottom bar | `data-shell="statusbar"` |

- `VISION.md` — what is in and out of scope (one rule per heading)
- `SPEC.md` — the contract (v0.3.0)
- `conformance/` — Playwright suite; the tests *are* the contract
- `schema/` — sample entities and seed data
- `IMPLEMENTATIONS.md` — every conformant implementation; add yours

## Scenarios

Who uses the contract, and where to start:

- **You are building a new app, in any stack.** Add a `run.sh`, run the suite until it passes, and list it. Start at [Build one in your stack](#build-one-in-your-stack).
- **You own a design system, or you are a designer or PM.** Build the six regions and the keyboard behavior into your shell component once, use the behavior IDs as acceptance criteria, and carry the region names into Figma. Read [One True Shell for design systems, designers, and PMs](docs/for-design-systems.md).
- **You have an existing app and want to make it better.** Score it against the 16 behaviors, adopt them in tiers (layout, navigation, palette, tabs, instant saves), and run the suite against your own entities as you go. Read [Make an existing app better with One True Shell](docs/for-existing-apps.md).
- **You design in Figma.** Figma can carry the structure (name frames after the regions) but not the behavior, which is proven only once there is code. See [the Figma section](docs/for-design-systems.md#figma).

## Build one in your stack

Implementations live in their own repos. The first one,
[one-true-shell-django](https://github.com/simkimsia/one-true-shell-django), passes 16/16 and
its CI runs this suite against itself; copy its workflow. Pick any stack, add a `run.sh`,
and run the suite against it (below). When it passes, open a PR adding it to
[IMPLEMENTATIONS.md](IMPLEMENTATIONS.md).

### Official

Reference implementations maintained by this project, proving the contract builds on a real stack:

| Implementation | Version | Runtime | Framework | Data | Frontend | Spec | Passing |
|---|---|---|---|---|---|---|---|
| [one-true-shell-django](https://github.com/simkimsia/one-true-shell-django) | 0.1.0 | Python 3.12 | Django 6.0.8 | SQLite (Python stdlib) | vanilla JS, no build step | 0.3 | 16/16 |

### Community

Implementations built and maintained by the community:

| Implementation | Author | Version | Runtime | Framework | Data | Frontend | Spec | Passing |
|---|---|---|---|---|---|---|---|---|
| **Ruby on Rails** | *waiting for you to implement* ([add yours](IMPLEMENTATIONS.md#add-yours)) | | | | | | | |
| **Laravel** | *waiting for you to implement* ([add yours](IMPLEMENTATIONS.md#add-yours)) | | | | | | | |
| **Next.js** | *waiting for you to implement* ([add yours](IMPLEMENTATIONS.md#add-yours)) | | | | | | | |

[IMPLEMENTATIONS.md](IMPLEMENTATIONS.md) is the source of truth; this copy is updated with it.

## Test any implementation

```bash
cd conformance && npm ci && npx playwright install chromium
IMPL_DIR=/path/to/your/impl npx playwright test
```

Your implementation needs a `run.sh` (see SPEC.md section 6).

## Contributing

PRs to `main` are raised through [no-mistakes](https://github.com/kunchenguid/no-mistakes); see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT for code. Spec text: MIT for now; "conformant" means passing this suite at a declared version.
