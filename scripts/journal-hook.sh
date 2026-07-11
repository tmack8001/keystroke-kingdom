#!/usr/bin/env bash
# Claude Code Stop hook — shared-learning journal enforcement (entry-file era).
# If meaningful work happened after the newest journal entry was written, block
# the stop ONCE PER SESSION with instructions to add entries per the schema in
# docs/journal/JOURNAL.md (one file per entry, frontmatter metadata, append-only
# narratives). Learn together, structurally.
set -u
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
EDIR="$ROOT/docs/journal/entries"
STATE="$ROOT/.git/claude-journal-nag"
[ -d "$EDIR" ] || exit 0

INPUT="$(cat 2>/dev/null || true)"
SID="$(printf '%s' "$INPUT" | jq -r '.session_id // "unknown"' 2>/dev/null || echo unknown)"

if [ -f "$STATE" ] && grep -qx "$SID" "$STATE" 2>/dev/null; then
  exit 0
fi

# Newest journal entry mtime as the reference point
NEWEST="$(ls -t "$EDIR"/*.md 2>/dev/null | head -1)"
[ -n "$NEWEST" ] || exit 0

# Did meaningful work happen after the last journal write?
CHANGED="$(find "$ROOT/js" "$ROOT/css" "$ROOT/index.html" "$ROOT/main.go" \
  "$ROOT/.claude" "$ROOT/research" "$ROOT/scripts" \
  -type f \( -name '*.md' -o -name '*.js' -o -name '*.mjs' -o -name '*.css' -o -name '*.go' -o -name '*.html' -o -name '*.json' -o -name '*.sh' \) \
  -newer "$NEWEST" -print -quit 2>/dev/null || true)"
[ -n "$CHANGED" ] || exit 0

echo "$SID" >> "$STATE" 2>/dev/null || true

cat <<'JSON'
{"decision":"block","reason":"Shared-learning journal (once per session): meaningful work happened since the last journal entry. Per docs/journal/JOURNAL.md: run 'node scripts/wiki-search.mjs --journal' for the next L#/O#/F# IDs, then create docs/journal/entries/<ID>-<slug>.md files with full frontmatter (id, kind, title, found, session, status, importance, category, refs) for genuinely NEW insight only — no padding; skip kinds with nothing new. If this session ADDRESSED any open entry, update that entry's frontmatter (status/addressed-by/addressed-date) instead of or in addition to adding. Then regenerate views: node scripts/wiki-search.mjs --index. Then stop."}
JSON
exit 0
