# Implementations

Implementations that pass the conformance suite at a declared spec version.
Open a PR adding a row; a maintainer runs the suite against it before merge.

| Implementation | Stack | Spec | Passing | Maintainer |
|---|---|---|---|---|
| [reference/django](reference/django/) | Django, SQLite, vanilla JS | 0.1 | 14/14 | this repo |

## Add yours

1. Build the shell in any stack. Read `SPEC.md`; the tests in `conformance/tests/shell.spec.ts` are the contract.
2. Add an executable `run.sh` that resets data to `schema/seed.json` and serves on `${PORT:-8000}` in the foreground.
3. Run the suite against it:

   ```sh
   cd conformance && npm install && npx playwright install chromium
   IMPL_DIR=/path/to/your/impl npx playwright test
   ```

4. Put `spec: 0.1` in your README and open a PR adding your row above. Your code can live in your own repo; link to it.

Stacks nobody has done yet are the most useful: Rails, Laravel, Phoenix LiveView, Next.js, SvelteKit, htmx, Go, .NET.
