# One True Shell — Spec v0.2.0

A testable contract for the "One True SaaS Layout"
(layout after [Nan Yu's post](https://x.com/thenanyu/status/2105704619704029435)).
This spec adds a **behavior contract** on top of that layout.

**The conformance suite in `conformance/` is the contract.** If this document
and a test disagree, the test wins and this document gets fixed.

The spec covers **structure and behavior only**. It says nothing about content,
branding, colors, KPI cards, upsell boxes, or mystery icons.

---

## 1. Regions

Every page MUST render these regions, marked with `data-shell` attributes:

| Region      | Attribute                  | Element / role                          |
|-------------|----------------------------|-----------------------------------------|
| Left rail   | `data-shell="rail"`        | `<nav>` or `role="navigation"`          |
| Sidebar     | `data-shell="sidebar"`     | any                                     |
| Tabs        | `data-shell="tabs"`        | any (may be empty)                      |
| Main        | `data-shell="main"`        | `<main>` or `role="main"`               |
| Right aside | `data-shell="aside"`       | any; MAY be hidden when nothing is open |
| Status bar  | `data-shell="statusbar"`   | any                                     |

Optional: `data-shell="topbar"`. Implementations may add a top bar; tests never require one.

Overlays (rendered only when open):

| Overlay           | Attribute                                   |
|-------------------|---------------------------------------------|
| Command palette   | `data-shell="palette"`, `role="dialog"`     |
| Palette input     | `data-shell-palette-input` (text input)     |
| Shortcut sheet    | `data-shell="shortcuts"`, `role="dialog"`   |
| Create form       | `data-shell="create"`                       |

## 2. Entities, routing, data

- Entities are defined in `schema/entities.yaml`. Seed data is in `schema/seed.json`.
- Starting the app (`run.sh`, section 6) MUST reset data to the seed.
- List route: `/<entity>` (e.g. `/customers`). Record route: `/<entity>/<id>`.
- Sidebar entries: `data-shell-nav="<entity>"`, one per entity. The entry for the entity being shown
  (its list, or the record in the active tab) has `aria-current="page"`; no other entry does.
- List container: `data-shell-list`. Rows: `data-shell-row` with `data-id="<id>"`.
- Lists are ordered oldest-created first (seed order, then new records at the end).
- Exactly one row is selected at a time, marked `aria-selected="true"`. On list load, the first row is selected.

## 3. Record view

- Opening a record navigates to `/<entity>/<id>`.
- `main` shows an `<h1>` containing the record's title field.
- `aside` becomes visible and shows one element per field:
  `data-shell-field="<field>"`, containing an editable `<input>` or `<select>`.

## 4. Tabs

- Tabs represent open records, and only records. A list is never a tab. Element: `data-shell-tab` with `data-id="<entity>/<id>"`.
  The active tab has `aria-selected="true"`. Each tab has a close control: `data-shell-tab-close`.
- Opening a record opens its tab, or activates it if already open.
- Clicking a tab navigates to that record.
- Closing the active tab navigates to another open tab, or to the entity list if none remain.
- Open tabs MUST survive a page reload in the same browser.
- Showing a list (sidebar, palette, or `Escape`) keeps every open tab open, and no tab is active.
- The sidebar follows the tabs: when a tab becomes active, its entity's sidebar entry becomes current.

## 5. Behaviors (each maps to a test ID)

| ID  | MUST |
|-----|------|
| L01 | All six regions are present on `/` and on `/customers`. |
| L02 | Rail is a navigation landmark; main is a main landmark. |
| B01 | `Control+K` and `Meta+K` open the palette with the input focused; `Escape` closes it. |
| B02 | Palette lists one navigation command per entity (its plural label); typing filters; `Enter` runs the top match. |
| B03 | Clicking a sidebar entry shows that entity's list. |
| B04 | On a list, `j` selects the next row and `k` the previous one. |
| B05 | `Enter` opens the selected record. On a record, `Escape` returns to the list with that row selected. |
| B06 | Tabs open, activate, switch, and close as in section 4. |
| B07 | Open tabs are restored after reload. |
| B08 | `?` opens the shortcut sheet; `Escape` closes it. Single-key shortcuts are ignored while focus is in a text field. |
| B09 | `[` toggles the sidebar's visibility. |
| B10 | Deep links work: loading `/<entity>/<id>` directly shows the record, the aside, and its active tab. |
| B11 | Palette command `Create <Label>` opens the create form (inputs named by field). Submitting shows the new record **immediately**, before the server responds (optimistic), and it persists. |
| B12 | Editing a field in the aside and pressing `Enter` updates the `<h1>` **immediately** (optimistic), and the change persists. |
| B13 | Lists are never tabs: going to a list from the sidebar or palette keeps all open tabs and leaves none active. |
| B14 | The sidebar entry of the shown entity has `aria-current="page"`, on lists and records, and it follows the active tab. |

Shortcuts are bound at the document level and MUST NOT fire while focus is in an `input`, `textarea`, `select`, or `contenteditable` element (except `Escape`).

"Immediately" is tested by delaying every non-GET request by 2 seconds and requiring the UI to update within 700 ms.

## 6. Running an implementation

Each implementation directory MUST contain an executable `run.sh` that:

1. resets data to the seed,
2. starts the app on `0.0.0.0:${PORT:-8000}`,
3. blocks (stays in the foreground).

## 7. Extensions

Anything beyond this spec is allowed, as long as all tests still pass.
Extension attributes use the `data-shell-x-*` prefix.

## 8. Versioning

Semantic versioning. No breaking changes to tests within a minor version.
Implementations declare the version they target in their README: `spec: 0.2`.
