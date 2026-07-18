#!/usr/bin/env bash
# Claude Code Stop hook — doc-currency enforcement for Keystroke Kingdom.
#
# Fires when Claude stops. Two independent checks, each once-per-session:
#
# 1. Doc-currency: if game code (js/, css/, index.html, main.go) has changed
#    more recently than docs/ROADMAP.md, blocks with instructions to bring
#    the docs current. Silent if docs are already newer than code.
#    To clear legitimately: update (or touch) docs/ROADMAP.md.
#
# 2. Rules-file size budget (journal F21): if any .claude/rules/*.md OR
#    .claude/rules/levels/*.md exceeds 40,000 bytes, blocks naming the file(s)
#    and size(s), with instructions to split by concern (see how transitions.md
#    and the per-act levels/act1-5.md files were split out of levels.md).
#    Silent if all rules files are under budget.
#
# 3. Content-librarian dispatch: if scripts/impacted-manifest-hook.sh recorded
#    game-file changes this session (.git/claude-impacted-files), blocks once
#    naming the changed files, with instructions to dispatch the
#    content-librarian agent (which maps paths -> features via
#    scripts/feature-map.json and refreshes docs/features/ + screenshot sets),
#    then truncate the manifest.
#
# All checks share the "reminded once per session" convention: state kept
# in .git/, never committed, never a nag loop.
set -u
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
ROADMAP="$ROOT/docs/ROADMAP.md"
STATE="$ROOT/.git/claude-docs-nag"
SIZE_STATE="$ROOT/.git/claude-docs-size-nag"
LIB_STATE="$ROOT/.git/claude-librarian-nag"
MANIFEST="$ROOT/.git/claude-impacted-files"
SIZE_BUDGET=40000

INPUT="$(cat 2>/dev/null || true)"
SID="$(printf '%s' "$INPUT" | jq -r '.session_id // "unknown"' 2>/dev/null || echo unknown)"

# --- Check 2: rules-file size budget -----------------------------------
if [ -d "$ROOT/.claude/rules" ] && ! { [ -f "$SIZE_STATE" ] && grep -qx "$SID" "$SIZE_STATE" 2>/dev/null; }; then
  OVERSIZED=""
  for f in "$ROOT"/.claude/rules/*.md "$ROOT"/.claude/rules/levels/*.md; do
    [ -f "$f" ] || continue
    SZ="$(wc -c < "$f" | tr -d ' ')"
    if [ "$SZ" -gt "$SIZE_BUDGET" ]; then
      OVERSIZED="${OVERSIZED}${f#$ROOT/} (${SZ} bytes); "
    fi
  done
  if [ -n "$OVERSIZED" ]; then
    echo "$SID" >> "$SIZE_STATE" 2>/dev/null || true
    REASON="Rules-file size budget (once per session): the following .claude/rules/*.md file(s) exceed the 40,000-byte budget: ${OVERSIZED}Re-split by concern — move a cohesive section (an act, a subsystem) into a new file under .claude/rules/, leave a summary + pointer behind, and add the new file to CLAUDE.md's 'Also load when relevant' line. See transitions.md and the per-act .claude/rules/levels/act1-5.md files for the pattern. Preserve all content; move, never delete."
    jq -cn --arg r "$REASON" '{"decision":"block","reason":$r}'
    exit 0
  fi
fi

# --- Check 3: content-librarian dispatch --------------------------------
if [ -s "$MANIFEST" ] && ! { [ -f "$LIB_STATE" ] && grep -qx "$SID" "$LIB_STATE" 2>/dev/null; }; then
  echo "$SID" >> "$LIB_STATE" 2>/dev/null || true
  CHANGED="$(tr '\n' ' ' < "$MANIFEST")"
  REASON="Content-librarian check (once per session): game files changed this session: ${CHANGED}. Dispatch the content-librarian agent (.claude/agents/content-librarian.md) with this file list — it maps paths to features via scripts/feature-map.json and refreshes the impacted docs/features/ pages and screenshot reference sets. After dispatching (or if the docs are genuinely current), clear the manifest: : > .git/claude-impacted-files. Then stop."
  jq -cn --arg r "$REASON" '{"decision":"block","reason":$r}'
  exit 0
fi

# --- Check 1: doc currency ----------------------------------------------
[ -f "$ROADMAP" ] || exit 0

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
