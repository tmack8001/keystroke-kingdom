#!/usr/bin/env bash
# Claude Code PostToolUse hook — impacted-feature manifest for Keystroke Kingdom.
#
# Silently records every game file (js/**, css/**, index.html, main.go) touched
# by Edit/Write this session into .git/claude-impacted-files (deduped, repo-
# relative). The doc-currency Stop hook reads this manifest to tell the session
# which features need the content-librarian; the librarian maps paths to
# features via scripts/feature-map.json. Never blocks, never outputs.
set -u
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
MANIFEST="$ROOT/.git/claude-impacted-files"

INPUT="$(cat 2>/dev/null || true)"
FILE="$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // ""' 2>/dev/null || echo "")"
[ -n "$FILE" ] || exit 0

# Normalize to repo-relative
REL="${FILE#"$ROOT"/}"

case "$REL" in
  js/*|css/*|index.html|main.go) : ;;
  *) exit 0 ;;
esac

if ! { [ -f "$MANIFEST" ] && grep -qx "$REL" "$MANIFEST" 2>/dev/null; }; then
  echo "$REL" >> "$MANIFEST" 2>/dev/null || true
fi
exit 0
