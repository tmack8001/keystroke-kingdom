# docs/features/ — the source graph

An LLM-wiki over the game's code (Trevor's "code-llmwiki"), sibling to the research
knowledge graph in `research/`. One atomic page per game surface, documenting
**implemented** behavior — keybindings, screens/states, localStorage keys, engine
interactions, edge cases — never design intent (that lives in `.claude/rules/**` and
is linked, not restated).

Each page's YAML frontmatter (`feature`, `code`, `rules`, `screenshots`, `capture`,
`verified`) IS the map: `scripts/feature-map.json` is a generated artifact of this
frontmatter for hook/jq consumption, and `scripts/wiki-search.mjs` indexes/searches/
lints this directory alongside `research/` and `docs/journal/`.

Maintained by the `content-librarian` agent (`.claude/agents/content-librarian.md`) —
dispatch it after game-file changes to refresh impacted pages, or for a full rebuild.
