You are one session in a loop that implements the contract in SPEC.md.
You have no memory of earlier sessions; the repo is your memory.

1. Read AGENTS.md, then progress.md, then features.json, then `git log --oneline -15`,
   then .last-run.txt (the latest suite output).
2. Pick the lowest-numbered feature in features.json with "passes": false.
3. Read its test in conformance/tests/shell.spec.ts and the matching rule in SPEC.md.
4. Implement it in reference/django/. Run that test until it passes, then the full suite to
   make sure nothing regressed.
5. Commit with the feature ID in the message, append notes to progress.md, and stop.

Do one feature only. Never modify the contract files listed in AGENTS.md.
