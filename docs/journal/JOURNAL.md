# The Journal — Schema
## Shared project memory: learnings, observations, failures — tracked, not just logged

*Companion to the wiki schema ([[WIKI]]). The journal records HOW we build; the wiki
records WHAT is true. One file per entry in `entries/`; metadata lives in frontmatter
(queryable via Dataview in Obsidian and `node scripts/wiki-search.mjs --journal` for
agents); the narrative body is append-only — you may add an "Updates" line, never rewrite
history. Status changes are frontmatter edits, which is exactly why metadata and narrative
are separated.*

## Entry format — `entries/<ID>-<kebab-slug>.md`

```markdown
---
id: F4
kind: failure            # learning | observation | failure
title: History cards were routinely unearnable
found: 2026-07-11        # date discovered (session date for recon'd items)
session: 2026-07-10 mega-build   # human label for the originating session
status: addressed        # open | addressed | adopted | monitoring | superseded
importance: high         # low | medium | high | critical
category: game-design    # see taxonomy below
addressed-by: injection-after-intro + completion gate (js/main.js), commit 9b912d9
addressed-date: 2026-07-11
refs: [L4, O4]           # related entry IDs
---

What happened / what we saw / what we learned — the narrative, with [[wikilinks]]
and file paths. APPEND-ONLY below this line.

**Updates:**
- 2026-07-12 — regressed in X, reopened. (status flipped in frontmatter)
```

## Status vocabulary

| Status | Meaning | Typical kind |
|---|---|---|
| `open` | Known, not yet dealt with — the actionable queue | failures |
| `addressed` | A concrete fix/change resolved it (say what, in `addressed-by`) | failures |
| `adopted` | Absorbed into how we work (rules, hooks, agent prompts, habits) | learnings, observations |
| `monitoring` | True but watching for recurrence / not yet load-bearing | any |
| `superseded` | A later entry replaces it (point to it in `refs`) | any |

`importance` is most meaningful for `open` items (triage order); for resolved items it
records how much it mattered. `critical` = player-facing harm or data loss.

## Category taxonomy

`engine` · `game-design` · `pedagogy` · `graphics` · `a11y` · `research-integrity` ·
`agent-process` (how agents/subagents behave) · `tooling` (scripts, hooks, tests) ·
`docs-process` (docs, wiki, journal itself)

## Workflows

**Add** (the Stop hook enforces once per session when meaningful work happened):
create `entries/<next-ID>-<slug>.md` with full frontmatter. IDs are monotonic per kind
(L/O/F); find the next with `node scripts/wiki-search.mjs --journal` (it prints the max).
Genuinely new insight only — no padding.

**Address / adopt**: when work resolves an entry, update its frontmatter (`status`,
`addressed-by`, `addressed-date`) and add an Updates line. Never rewrite the narrative.

**Review**: `node scripts/wiki-search.mjs --journal` — status board for agents (open items
by importance, recent, counts). Humans: [[dashboard]] renders the same live via Dataview.

**Views**: `docs/journal/{learnings,observations,failures}.md` are GENERATED per-kind
tables (`--index` rebuilds them) — never edit by hand.
