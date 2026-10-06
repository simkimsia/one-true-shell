# One True Shell for design systems, designers, and PMs

This page is for people who own how a product looks and behaves, not how it is built: design-system maintainers, product designers, and product managers.
You will not run the tests yourself. You will decide what "conformant" means for your product and make sure your system makes it easy.

## What the contract gives you, and what it never touches

The contract fixes **structure and behavior**: six regions, keyboard shortcuts, a command palette, tabs of open records, and saves that show up instantly.
It never says anything about **colors, typography, spacing, icons, branding, or content**. [VISION.md](../VISION.md) rules those out on purpose.

So your design system keeps its whole visual language.
The contract is the skeleton underneath it, plus a test suite that proves an app has that skeleton.

## Map your design system onto the six regions

Most design systems already have an app-shell component. Map its parts to the regions the tests look for:

| Region | Attribute | Usually called in a design system | Notes |
|---|---|---|---|
| Left rail | `data-shell="rail"` | Nav rail, app switcher, icon bar | Must be a navigation landmark (`<nav>`). |
| Sidebar | `data-shell="sidebar"` | Side nav, section nav | One entry per entity, with `data-shell-nav="<entity>"`. The entry for what is on screen gets `aria-current="page"`. |
| Tabs | `data-shell="tabs"` | Tab bar, document tabs | Tabs are open **records** only, never lists. |
| Main | `data-shell="main"` | Content area, page body | Must be a main landmark (`<main>`). Your page skeleton (cards, grids) lives inside it unchanged. |
| Right aside | `data-shell="aside"` | Drawer, detail panel, inspector, offcanvas | Shows the open record's fields. May be hidden when nothing is open. |
| Status bar | `data-shell="statusbar"` | Footer bar, status strip | Can be quiet: a section name and a shortcut hint is enough. |

A top bar is optional. The tests never require one and never forbid one, so a product that needs a header can keep it.

If your system has no component for a region yet, that gap is the first design task.

## Build it into the shell component, once

The highest-leverage move is to make conformance a property of your design system, not something each product team re-proves.

1. Add the `data-shell` attributes inside your shell components (rail, sidebar, tabs, main, aside, status bar). They are invisible to users and do not affect styling.
2. Ship the keyboard behavior with the shell: `j`/`k` to move through a list, `Enter` to open, `Escape` to go back, `Ctrl+K`/`Cmd+K` for the palette, `?` for the shortcut sheet, `[` to hide the sidebar.
3. Keep a small demo app in the design-system repo that uses the shell with the sample data in [`schema/`](../schema/), and run the suite against it in CI, the way [one-true-shell-django](https://github.com/simkimsia/one-true-shell-django) does.
4. Show the result: a CI badge on the design-system docs, and a row in [IMPLEMENTATIONS.md](../IMPLEMENTATIONS.md).

Every product built on that shell then starts from a conformant base.

## Use it as acceptance criteria

The behavior table in [SPEC.md](../SPEC.md#5-behaviors-each-maps-to-a-test-id) is already written as "the app MUST do X", one test per line.
In a PRD or ticket, one line can stand in for a page of interaction specs:

> The app shell conforms to One True Shell spec 0.2 (all 16 behaviors pass in CI).

If a product only needs part of it, name the behaviors: "L01, L02, B01 to B05 must pass." Engineering cannot read that two ways, because each ID is a test.

## Figma

Figma can carry the **structure** but not the **behavior**.

- Name the shell frames and components after the regions (`rail`, `sidebar`, `tabs`, `main`, `aside`, `statusbar`), so design and code use the same words and handoff loses less.
- Put the `data-shell` names in Dev Mode annotations, or in Code Connect if you use it, so whoever builds the screen uses the names the tests look for.
- The keyboard and tab behavior cannot be checked in a prototype. That half is proven only once there is code and the suite runs against it.

A Figma plugin that inserts a starter frame and lints a design for missing regions would fit here. It does not exist yet; open an issue if you want it.

## The decisions the contract makes you make

Most UI specs never say whether a list can be a tab, or whether the sidebar follows the active tab, so engineers guess and products drift apart.
The contract turns each of those into an explicit, numbered decision.

Example: someone asked "how does the sidebar connect to the tabs?" Spec 0.2 answered it with two behaviors: lists are never tabs (B13), and the sidebar marks the entity on screen and follows the active tab (B14).

That is the natural role for a designer or PM here: notice an unanswered interaction question, propose the rule in an issue, and see it become a behavior with a test.
See [CONTRIBUTING.md](../CONTRIBUTING.md#changing-the-contract).

## Adding your own regions

Anything beyond the spec is allowed, as long as the tests still pass.
Mark your own regions and controls with the `data-shell-x-*` prefix (for example `data-shell-x="notifications"`), so they never collide with a future version of the spec.

## Design review checklist

- All six regions exist on every screen, and the aside appears when a record is open.
- The sidebar highlights the entity on screen, and follows the active tab.
- Tabs hold records only; browsing a list keeps them open.
- Every action is reachable from `Ctrl+K`, and `?` lists the shortcuts.
- Edits and new records show up immediately, before the server answers.
- Nothing visual was forced by the contract: if a visual choice is only there "for the spec", it is not.

## Current limit

The suite is written against the sample entities (customers and projects).
A design-system demo app can load that sample data easily, but an existing product with its own entities cannot yet point the suite at itself.
Making the tests read entities from the implementation is the planned next step for the spec.
