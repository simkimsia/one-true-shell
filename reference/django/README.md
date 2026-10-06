# One True Shell: Django reference implementation

spec: 0.1

Django + SQLite, server-rendered templates, and one vanilla-JS file (`shell/static/shell/shell.js`) for shortcuts, the palette, tabs, and optimistic writes.

- Entities are read from `schema/entities.yaml` at runtime. There is one generic `Record` model (`entity`, `rid`, JSON `data`), so new entities need no migration.
- `POST /api/<entity>` creates (the client picks the id, so the row can render before the server answers). `POST /api/<entity>/<id>` updates. Both validate against the schema.
- Tabs live in `localStorage`. Keys pressed while a page is still loading are replayed on the next page.

```sh
./run.sh            # resets data to schema/seed.json, serves on ${PORT:-8000}
```

Set `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` and `DJANGO_DEBUG` for anything beyond local use. `run.sh` uses Django's dev server.
