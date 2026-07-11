#!/usr/bin/env bash
# Claude Code UserPromptSubmit hook — injects knowledge-graph awareness ONLY
# when the prompt looks like applicable work (content, history, research,
# facts, pedagogy). Stays silent for non-applicable work (bug fixing, logic,
# refactoring) so context isn't wasted where the wiki adds nothing.
set -u
INPUT="$(cat 2>/dev/null || true)"
PROMPT="$(printf '%s' "$INPUT" | jq -r '.prompt // ""' 2>/dev/null | tr '[:upper:]' '[:lower:]')"
[ -n "$PROMPT" ] || exit 0

# Applicable-work signals: content/research/history/facts/pedagogy domains
if ! printf '%s' "$PROMPT" | grep -qE 'research|histor|history card|easter|egg|wiki|citation|reference|fact|trivia|lyria|music|pedagog|curriculum|word bank|cabinet|arcade-historian|moment in time|1979|era\b|act 6|knowledge graph'; then
  exit 0
fi

cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"This work looks wiki-applicable. The repo has a verified research knowledge graph: research/ (schema research/WIKI.md, catalog research/index.md, ~90 atomic pages in wiki/{people,games,tech,culture,moments,pedagogy}/ — every claim carries 2-4 live-verified citations). Search it BEFORE web or memory: `node scripts/wiki-search.mjs \"query\"`. Use it for: history cards, easter eggs, cabinet/game/era facts, pedagogy decisions, Lyria era research, any historical claim. New historical facts must come from the wiki or the arcade-historian agent (which writes findings back) — never from model memory. Not applicable to pure bug/logic work; ignore if this fired spuriously."}}
JSON
exit 0
