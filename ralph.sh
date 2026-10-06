#!/usr/bin/env bash
# Ralph loop: run the suite, let the agent fix one failing behavior, repeat.
# Stops when everything passes or MAX_ITER is reached.
set -uo pipefail
cd "$(dirname "$0")"

MAX_ITER="${MAX_ITER:-25}"
MODEL="${MODEL:-claude-opus-5-5}"
IMPL_DIR="${IMPL_DIR:-reference/django}"
MAX_TURNS="${MAX_TURNS:-80}"
ITER_TIMEOUT="${ITER_TIMEOUT:-45m}"
# Contract files are restored from the newest spec tag (v*), or from contract-baseline in a fresh clone without tags.
PROTECTED="SPEC.md VISION.md schema conformance/tests conformance/playwright.config.ts scripts ralph.sh AGENTS.md CLAUDE.md PROMPT.md INIT_PROMPT.md"

if [ "${I_AM_IN_A_SANDBOX:-}" != "1" ]; then
  echo "This runs the agent without permission prompts."
  echo "Run it inside a container or VM, then: I_AM_IN_A_SANDBOX=1 ./ralph.sh"
  exit 1
fi

TIMEOUT_BIN="$(command -v timeout || command -v gtimeout || true)"
run_claude() {
  local prompt_file="$1"
  local cmd=(claude -p "$(cat "$prompt_file")" --model "$MODEL" --max-turns "$MAX_TURNS" --dangerously-skip-permissions)
  if [ -n "$TIMEOUT_BIN" ]; then "$TIMEOUT_BIN" "$ITER_TIMEOUT" "${cmd[@]}"; else "${cmd[@]}"; fi
}

run_suite() {
  rm -f conformance/results.json
  (cd conformance && IMPL_DIR="../$IMPL_DIR" npx playwright test > ../.last-run.txt 2>&1)
  node scripts/update-features.mjs conformance/results.json features.json
}

enforce_ratchet() {
  if ! git diff --quiet "$BASELINE" -- $PROTECTED; then
    echo "$(date -u +%FT%TZ) ratchet: agent changed protected files; restored from $BASELINE" | tee -a progress.md
    git checkout "$BASELINE" -- $PROTECTED
    git add -A && git commit -qm "ratchet: restore contract files"
  fi
}

# --- setup -------------------------------------------------------------
git rev-parse --git-dir >/dev/null 2>&1 || { git init -q && git add -A && git commit -qm "contract v0.1.0"; }
BASELINE="$(git describe --tags --abbrev=0 --match 'v*' 2>/dev/null || true)"
if [ -z "$BASELINE" ]; then
  git rev-parse -q --verify contract-baseline >/dev/null || git tag contract-baseline
  BASELINE=contract-baseline
fi
(cd conformance && npm install --silent && npx playwright install chromium >/dev/null)
touch progress.md

if [ ! -x "$IMPL_DIR/run.sh" ]; then
  echo "== init: scaffolding $IMPL_DIR"
  run_claude INIT_PROMPT.md
  enforce_ratchet
fi

# --- loop --------------------------------------------------------------
for i in $(seq 1 "$MAX_ITER"); do
  echo "== iteration $i/$MAX_ITER"
  if summary="$(run_suite)"; then
    echo "$summary"
    echo "$(date -u +%FT%TZ) DONE: $summary" >> progress.md
    git add -A && git commit -qm "all conformance tests pass" || true
    exit 0
  fi
  echo "$summary"
  echo "$(date -u +%FT%TZ) iter $i start: $summary" >> progress.md
  git add -A && git commit -qm "iter $i: suite results" || true

  run_claude PROMPT.md
  enforce_ratchet
done

echo "Reached MAX_ITER=$MAX_ITER without full conformance. See progress.md and .last-run.txt."
run_suite
exit 3
