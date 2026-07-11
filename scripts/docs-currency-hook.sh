#!/usr/bin/env bash
# Claude Code Stop hook — doc-currency enforcement for Keystroke Kingdom.
#
# Fires when Claude stops. If game code (js/, css/, index.html, main.go) has
# changed more recently than docs/ROADMAP.md, blocks the stop ONCE PER SESSION
# with instructions to bring the docs current. Silent in all other cases:
#   - docs are already newer than code (nothing to do)
#   - this session was already reminded (state kept in .git/, never committed)
# To clear the check legitimately after reviewing: update (or touch) docs/ROADMAP.md.
set -u
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
ROADMAP="$ROOT/docs/ROADMAP.md"
STATE="$ROOT/.git/claude-docs-nag"

[ -f "$ROADMAP" ] || exit 0

INPUT="$(cat 2>/dev/null || true)"
SID="$(printf '%s' "$INPUT" | jq -r '.session_id // "unknown"' 2>/dev/null || echo unknown)"

# Only one reminder per session — never a nag loop.
if [ -f "$STATE" ] && grep -qx "$SID" "$STATE" 2>/dev/null; then
  exit 0
fi

# Any game-code file newer than the roadmap?
NEWER="$(find "$ROOT/js" "$ROOT/css" "$ROOT/index.html" "$ROOT/main.go" -type f -newer "$ROADMAP" -print -quit 2>/dev/null || true)"
[ -n "$NEWER" ] || exit 0

echo "$SID" >> "$STATE" 2>/dev/null || true

cat <<'JSON'
{"decision":"block","reason":"Doc-currency check (once per session): game code changed after docs/ROADMAP.md was last touched. Before ending the session, update docs/ROADMAP.md — and any affected docs (CLAUDE.md, .claude/rules/*, research/*, README.md) — to reflect this session's work, then stop. If the docs are genuinely current already, touch docs/ROADMAP.md to clear this check."}
JSON
exit 0
