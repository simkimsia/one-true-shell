# Implementations

Implementations that pass the conformance suite at a declared spec version.
Community implementations are added by PR; a maintainer runs the suite against each one before merge.
Versions are the exact ones the implementation's CI tests with, so a row is reproducible.

## Official

Reference implementations maintained by this project, proving the contract builds on a real stack:

| Implementation | Version | Runtime | Framework | Data | Frontend | Spec | Passing |
|---|---|---|---|---|---|---|---|
| [one-true-shell-django](https://github.com/simkimsia/one-true-shell-django) | 0.1.0 | Python 3.12 | Django 6.0.8 | SQLite (Python stdlib) | vanilla JS, no build step | 0.2 | 16/16 |

## Community

Implementations built and maintained by the community:

| Implementation | Author | Version | Runtime | Framework | Data | Frontend | Spec | Passing |
|---|---|---|---|---|---|---|---|---|
| **Ruby on Rails** | *waiting for you to implement* ([add yours](#add-yours)) | | | | | | | |
| **Laravel** | *waiting for you to implement* ([add yours](#add-yours)) | | | | | | | |
| **Next.js** | *waiting for you to implement* ([add yours](#add-yours)) | | | | | | | |

## Add yours

1. Build the shell in any stack. Read `SPEC.md`; the tests in `conformance/tests/shell.spec.ts` are the contract.
2. Add an executable `run.sh` that resets data to `schema/seed.json` and serves on `${PORT:-8000}` in the foreground.
3. Run the suite against it:

   ```sh
   cd conformance && npm ci && npx playwright install chromium
   IMPL_DIR=/path/to/your/impl npx playwright test
   ```

4. Put `spec: 0.2` in your README and open a PR adding your row to the Community table (replace a "waiting" row if it is your stack).
   Raise the PR through [no-mistakes](CONTRIBUTING.md); PRs without its signature are not merged. Your code lives in your own repo; link to it.
   Fill in your implementation's own version and the exact versions you test with: runtime, framework, data store, and frontend (framework and version, or "vanilla JS").
   Ideally your app also reports them at runtime; the Django implementation's `GET /api/version` shows one way.

To have CI prove it on every push, copy the
[conformance workflow](https://github.com/simkimsia/one-true-shell-django/blob/main/.github/workflows/conformance.yml)
from the Django implementation. It checks out this repo at a spec tag and points the suite at your checkout.

Stacks nobody has done yet are the most useful: Rails, Laravel, Phoenix LiveView, Next.js, SvelteKit, htmx, Go, .NET.
