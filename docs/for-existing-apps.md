# Make an existing app better with One True Shell

This page is for teams with an app already in production, usually an internal tool or a B2B product where people spend hours a day, who want it to feel faster and more predictable.
You do not have to rebuild anything or adopt all of it. Each behavior in the spec is a small, testable improvement, and you can take them one at a time.

## What your users gain

| Improvement | Behaviors | Who notices |
|---|---|---|
| The same layout on every screen, with record details in a side panel instead of a new page | L01, L02, B03, B09, B14 | Everyone, on day one |
| Move through lists with `j`/`k`, open with `Enter`, go back with `Escape`, and share a link to any record | B04, B05, B10 | People who work through queues all day |
| `Ctrl+K` to jump anywhere or run any action, and `?` to see every shortcut | B01, B02, B08 | New users (discoverability) and power users (speed) |
| Several records open in tabs that survive a reload | B06, B07, B13 | Anyone comparing or juggling records |
| Edits and new records appear instantly, before the server answers | B11, B12 | Everyone on a slow or distant connection |

And one gain for the team: once a behavior is adopted, a test keeps it from quietly breaking in a later release.

## Score your app first

Before changing anything, walk through your app with these questions. Each "no" is a candidate improvement.

- Does every screen have the same rail, sidebar, main area, and status bar in the same places?
- Does the sidebar show which section you are in, and does it follow you when you switch records?
- Can you move through a list and open a record without touching the mouse?
- Does every record have its own URL that opens it directly?
- Can you reach every section and every "create" action from one search box?
- Can you keep two records open and switch between them?
- When you save, does the change show up before the spinner would have finished?

## Adopt in tiers

Take the tiers in order; each one is useful on its own, and later tiers build on earlier ones.

1. **Layout** (L01, L02, B03, B09, B14). Add the six regions to your base template and the `data-shell` names to them. Most apps already have a `main` and some kind of drawer or detail panel; those become `main` and `aside`. Cheap, and the most visible change.
2. **Navigation** (B04, B05, B10). Give each record its own `/<entity>/<id>` URL, then add list selection with `j`/`k`/`Enter`/`Escape`. If a record today only opens in a modal or drawer with no URL, this tier fixes that.
3. **Palette and shortcuts** (B01, B02, B08). One command palette listing every section and every create action, and a shortcut sheet. Shortcuts must stay quiet while someone is typing in a field.
4. **Tabs** (B06, B07, B13). Worth it only if your users really work on several records at once. Tabs hold records, never lists.
5. **Instant saves** (B11, B12). Show the change immediately and reconcile when the server answers, undoing it if the save fails.

Not every app needs every tier. A tool people visit once a week may stop after tier 2; a tool people live in all day usually wants all five.

## Map what you already have

| You have | It becomes |
|---|---|
| A top navigation bar | The rail and sidebar. A top bar can stay; the spec allows one but does not require it. |
| A drawer, offcanvas, or inspector showing a record | The `aside`, plus a record URL so the same view opens directly. |
| A modal for viewing a record | A record URL with the details in `main` and the fields in the `aside`. |
| Toasts | Keep them; the status bar is a separate, always-visible strip. |
| A footer | Often a good place for the status bar. |

If your pages swap content without a full reload (HTMX, Turbo, an SPA router), attach the keyboard and tab behavior so it survives each swap. If they do full page loads, make sure keys pressed while a page is loading are not dropped: the suite presses `Escape`, `j`, `Enter` in quick succession.

## Run the suite against your own app

Since spec 0.3 the suite runs against your own entities, so you can prove each tier as you adopt it.

1. **Describe two or more of your entities** in `schema/entities.yaml`, with only the fields the shell needs:

   ```yaml
   entities:
     tickets:
       label: Ticket
       plural: Tickets
       fields:
         subject: { type: string, required: true, title: true }
         status:  { type: enum, values: [open, pending, closed], required: true }
         account: { type: ref, to: accounts }
     accounts:
       label: Account
       plural: Accounts
       fields:
         name: { type: string, required: true, title: true }
   ```

2. **Add a small seed** in `schema/seed.json`: at least 3 records of the first entity and 2 of the second. [SPEC.md section 2](../SPEC.md#2-entities-routing-data) lists every rule; the suite checks them and names any it finds broken.
3. **Write a `run.sh`** that starts your app in a test mode against a throwaway database loaded from that seed, on `${PORT:-8000}`, in the foreground. The suite passes the schema directory in `SHELL_SCHEMA_DIR` if you want to read it from there.
4. **Run only the behaviors you have adopted**, and widen the list as you go:

   ```sh
   cd conformance && npm ci && npx playwright install chromium
   IMPL_DIR=/path/to/your/app npx playwright test -g "L01|L02|B03|B09|B14"
   ```

5. **Put it in CI**, pinned to a spec tag, by copying the [conformance workflow](https://github.com/simkimsia/one-true-shell-django/blob/main/.github/workflows/conformance.yml) from the Django implementation and changing the test command to your current tier.

## When not to adopt it

- The app has only one kind of record. Most of the shell exists to move between entities and records.
- The pages are public or marketing pages. The shell is for people who work inside an app.
- The app is mobile-first. The contract assumes a desktop window with a keyboard.

## Claim it

When all 16 behaviors pass, say so: a CI badge in your README, and if the app is open source, a row in the Community table of [IMPLEMENTATIONS.md](../IMPLEMENTATIONS.md).
A closed-source app can still run the suite in its own CI; conformance does not require being listed.
