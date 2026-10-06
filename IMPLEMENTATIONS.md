# Implementations

Implementations that pass the conformance suite at a declared spec version.
Open a PR adding a row; a maintainer runs the suite against it before merge.

| Implementation | Stack | Spec | Passing | Maintainer |
|---|---|---|---|---|
| [one-true-shell-django](https://github.com/simkimsia/one-true-shell-django) | Django, SQLite, vanilla JS | 0.2 | 16/16 | @simkimsia |

## Add yours

1. Build the shell in any stack. Read `SPEC.md`; the tests in `conformance/tests/shell.spec.ts` are the contract.
2. Add an executable `run.sh` that resets data to `schema/seed.json` and serves on `${PORT:-8000}` in the foreground.
3. Run the suite against it:

   ```sh
   cd conformance && npm install && npx playwright install chromium
   IMPL_DIR=/path/to/your/impl npx playwright test
   ```

4. Put `spec: 0.2` in your README and open a PR adding your row above. Your code lives in your own repo; link to it.

To have CI prove it on every push, copy the
[conformance workflow](https://github.com/simkimsia/one-true-shell-django/blob/main/.github/workflows/conformance.yml)
from the Django implementation. It checks out this repo at a spec tag and points the suite at your checkout.

Stacks nobody has done yet are the most useful: Rails, Laravel, Phoenix LiveView, Next.js, SvelteKit, htmx, Go, .NET.
