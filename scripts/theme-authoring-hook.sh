#!/usr/bin/env bash
# Claude Code PostToolUse hook — theme-authoring reminder for Keystroke Kingdom.
#
# Fires after a successful Edit/Write. If the touched file is a canvas-drawing
# game file (js/themes/*.js or js/ui/*.js), injects a once-per-session reminder
# to follow .claude/rules/theme-authoring.md and run the visual-validation
# check, including layout-contract check #5.
#
# Shares the project convention: once-per-session state in .git/ (never
# committed), silent on non-matching files, never a nag loop.
set -u
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE="$ROOT/.git/claude-theme-nag"

INPUT="$(cat 2>/dev/null || true)"
SID="$(printf '%s' "$INPUT" | jq -r '.session_id // "unknown"' 2>/dev/null || echo unknown)"
FILE="$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // ""' 2>/dev/null || echo "")"

case "$FILE" in
  */js/themes/*.js|*/js/ui/*.js) : ;;
  *) exit 0 ;;
esac

if [ -f "$STATE" ] && grep -qx "$SID" "$STATE" 2>/dev/null; then
  exit 0
fi
echo "$SID" >> "$STATE" 2>/dev/null || true

jq -cn '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"Theme/UI canvas file edited — once-per-session reminder: follow .claude/rules/theme-authoring.md. Key rules: the layout contract (UI owns the center; theme owns the frame — focal art in the stage regions only), canvas-space positioning never DOM-space (journal L16), set ctx.textAlign/textBaseline explicitly in every draw (L28), clamp all frame-driven math (F1), bounded particle/entity pools, separate win-gate vs display accumulators. Before reporting this work done, run the visual-validation check from .claude/rules/visual-validation.md on your OWN static server — including check #5 (scene composed in the stage regions, not buried behind panels)."}}'
exit 0
