#!/bin/bash
# Daily snapshot wrapper for ai-crawl-report.mjs.
# Appends one JSON line per day to data/ai-crawl-daily.jsonl, so we can
# accumulate a longitudinal time-series the Free-plan 24h window doesn't
# preserve. After ~14 days, we can do real per-page delta analysis a la
# Glasp's Firestore pipeline.
#
# Triggered by launchd plist at ~/Library/LaunchAgents/co.loudface.ai-crawl-daily.plist
# Or run manually: bash scripts/ai-crawl-daily-snapshot.sh

set -euo pipefail

ROOT="/Users/arnel/Code Projects/LoudFace Agency/loudface-website"
LEDGER="$ROOT/data/ai-crawl-daily.jsonl"
LOG="$ROOT/data/ai-crawl-daily.log"

cd "$ROOT"

# Add Node + PATH defaults (launchd runs with a minimal env)
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

# Build one JSON payload — both core report and demand signal in one pass.
# `--json --demand` returns a single structured object. We wrap it with
# capturedAt for time-series indexing.
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
TMPFILE="$(mktemp)"

{
  echo "[$TIMESTAMP] Running daily snapshot..."

  if ! node scripts/ai-crawl-report.mjs --json --demand > "$TMPFILE" 2>>"$LOG"; then
    echo "[$TIMESTAMP] FAILED (see $LOG)"
    rm -f "$TMPFILE"
    exit 1
  fi

  # Wrap with capturedAt key + write as a single line
  python3 -c "
import json, sys, datetime
with open('$TMPFILE') as f: data = json.load(f)
wrapped = {'capturedAt': '$TIMESTAMP', **data}
print(json.dumps(wrapped))
" >> "$LEDGER"

  echo "[$TIMESTAMP] OK — appended one row to $LEDGER (now $(wc -l < "$LEDGER") rows total)"
} | tee -a "$LOG"

rm -f "$TMPFILE"
