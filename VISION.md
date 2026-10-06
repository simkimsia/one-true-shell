# Vision

One True Shell is a testable contract for the One True SaaS Layout: six regions, keyboard-first behavior, tabs, and optimistic updates.
It serves any entities on any stack, and it owns the contract, not any one app built on it.

## Scope

The contract covers the structure and behavior of the shell only.
We accept rules about regions, routing, selection, keyboard shortcuts, the palette, tabs, persistence across reload, and optimistic writes.
We do not add rules about content, branding, colors, typography, KPI cards, upsell boxes, or icons.
We do not add rules that only make sense for one stack, one framework, or one entity set.
Anything beyond the contract belongs in an implementation as an extension, marked with the `data-shell-x-*` prefix.

## Contract

The conformance suite in `conformance/` is the contract, and `SPEC.md` describes it.
If `SPEC.md` and a test disagree, the test wins and `SPEC.md` gets fixed.
Every MUST in `SPEC.md` maps to exactly one test ID, and every test title starts with that ID.
We do not add a MUST without a test, or a test without a matching row in `SPEC.md` section 5.
Tests check only `data-shell*` attributes, ARIA roles and states, form field names, URLs, and visible text, never class names, markup layout, or styling.
Within a minor version, a change may add tests but must not make a previously conformant implementation fail.

## Implementations

An implementation is conformant when it passes the suite at a declared spec version.
The only integration point is an executable `run.sh` that resets data to `schema/seed.json` and serves on `${PORT:-8000}`.
The suite must run against any implementation, with that implementation's own entities, through `IMPL_DIR` without code changes to the suite.
Implementations live in their own repositories and are listed in `IMPLEMENTATIONS.md` once they pass at a declared version.
The contract never depends on Django, or on anything only one implementation provides.
We do not change the contract to make any one implementation easier to build.
