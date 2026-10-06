Read SPEC.md, AGENTS.md, schema/entities.yaml and schema/seed.json.

Scaffold the reference implementation in reference/django/:

- Django (latest stable) with SQLite; models generated from schema/entities.yaml, using the
  seed ids ("c1", "p1"...) as primary keys.
- Server-rendered templates for the shell, plus one small vanilla-JS module for keyboard
  shortcuts, the palette, tabs, and optimistic updates (spec B11/B12 require the UI to update
  before the server responds, so plain form posts are not enough).
- A JSON or form endpoint for create and update.
- An executable run.sh that: creates a venv if missing, installs requirements, deletes and
  recreates the database, loads schema/seed.json, then runs the server on
  0.0.0.0:${PORT:-8000} in the foreground.
- Render the six regions from SPEC.md section 1 on every page.

Do not try to pass every test now. Get run.sh working and L01 passing:
cd conformance && npx playwright test -g "L01"

Commit, then write a short progress.md describing the structure you chose.
