#!/usr/bin/env bash
# Claude Code Stop hook — keeps the research knowledge graph healthy.
# 1. If any wiki/hub page is newer than research/index.md, silently
#    regenerate the index (deterministic, safe — auto-heal, no nagging).
# 2. Run lint; if it FAILS (orphans/broken links/uncited pages), block the
#    stop ONCE PER SESSION with the lint output so the problems get fixed.
set -u
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
INDEX="$ROOT/research/index.md"
STATE="$ROOT/.git/claude-wiki-nag"
[ -f "$INDEX" ] || exit 0
command -v node >/dev/null 2>&1 || exit 0

INPUT="$(cat 2>/dev/null || true)"
SID="$(printf '%s' "$INPUT" | jq -r '.session_id // "unknown"' 2>/dev/null || echo unknown)"

# Auto-heal the index if stale (any page newer than index.md)
STALE="$(find "$ROOT/research" -name '*.md' ! -name 'index.md' ! -name 'log.md' -newer "$INDEX" -print -quit 2>/dev/null || true)"
if [ -n "$STALE" ]; then
  node "$ROOT/scripts/wiki-search.mjs" --index >/dev/null 2>&1 || true
fi

# Lint — block once per session only on real problems
LINT_OUT="$(node "$ROOT/scripts/wiki-search.mjs" --lint 2>&1)"
if [ $? -eq 0 ] || printf '%s' "$LINT_OUT" | grep -q '^Lint clean'; then
  exit 0
fi
if [ -f "$STATE" ] && grep -qx "$SID" "$STATE" 2>/dev/null; then
  exit 0
fi
echo "$SID" >> "$STATE" 2>/dev/null || true
REASON="Knowledge-graph lint failed (once-per-session check). Fix these in research/ (schema: research/WIKI.md), then re-run 'node scripts/wiki-search.mjs --lint' until clean: $(printf '%s' "$LINT_OUT" | head -15 | tr '\n' '; ')"
jq -cn --arg r "$REASON" '{"decision":"block","reason":$r}'
exit 0
