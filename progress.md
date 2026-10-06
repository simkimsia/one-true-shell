2026-10-06: Built reference/django by hand (no ralph loop). 14/14 pass, 70/70 with --repeat-each 5.
Structure: one generic Record model driven by schema/entities.yaml; shell.js owns keys, palette, tabs (localStorage), optimistic create/edit.
Trap: tests press keys right after a navigation-triggering key (B06 "Escape j Enter"); shell.js buffers keys during page loads and replays them.
Next: publish the repo, then add CI that runs the suite on PRs to IMPLEMENTATIONS.md.
