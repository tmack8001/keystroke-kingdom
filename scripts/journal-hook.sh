#!/usr/bin/env bash
# Claude Code Stop hook — the shared-learning journal enforcement.
# If meaningful work happened this session (game code, design docs, research,
# or agents/hooks changed after the journal was last written), block the stop
# ONCE PER SESSION with instructions to append to docs/journal/
# {learnings,observations,failures}.md. Append-only, cross-referenced —
# so human and agents learn together across sessions.
set -u
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
JDIR="$ROOT/docs/journal"
STATE="$ROOT/.git/claude-journal-nag"
[ -d "$JDIR" ] || exit 0

INPUT="$(cat 2>/dev/null || true)"
SID="$(printf '%s' "$INPUT" | jq -r '.session_id // "unknown"' 2>/dev/null || echo unknown)"

if [ -f "$STATE" ] && grep -qx "$SID" "$STATE" 2>/dev/null; then
  exit 0
fi

# Newest journal mtime as the reference point
NEWEST_JOURNAL="$JDIR/learnings.md"
for f in "$JDIR"/*.md; do [ "$f" -nt "$NEWEST_JOURNAL" ] && NEWEST_JOURNAL="$f"; done

# Did meaningful work happen after the last journal write?
CHANGED="$(find "$ROOT/js" "$ROOT/css" "$ROOT/index.html" "$ROOT/main.go" \
  "$ROOT/.claude" "$ROOT/research" "$ROOT/scripts" \
  -type f \( -name '*.md' -o -name '*.js' -o -name '*.mjs' -o -name '*.css' -o -name '*.go' -o -name '*.html' -o -name '*.json' -o -name '*.sh' \) \
  -newer "$NEWEST_JOURNAL" -print -quit 2>/dev/null || true)"
[ -n "$CHANGED" ] || exit 0

echo "$SID" >> "$STATE" 2>/dev/null || true

cat <<'JSON'
{"decision":"block","reason":"Shared-learning journal (once per session): meaningful work happened since the journal was last written. Append this session's entries to docs/journal/learnings.md (what we now know that we didn't), observations.md (patterns noticed in how we work), and failures.md (what went wrong and why) — append-only, use the next L#/O#/F# IDs, date each entry, cross-reference related entries (e.g. 'see F4') and file paths. Only genuinely new insight — no padding; skip a file if nothing belongs in it this session, and say so in the entry-free file's session line. Then stop."}
JSON
exit 0
