# The Research Wiki — Schema
## How this knowledge base is structured, read, and written

*This is the schema layer of an LLM-maintained wiki (pattern: Karpathy's "LLM Wiki",
https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). Humans browse it as an
Obsidian vault (open the `research/` folder in Obsidian); agents read and write it as plain
markdown. The tedious part of a knowledge base is the bookkeeping — agents do the
bookkeeping, humans do the curating.*

## The three layers

1. **Sources (immutable):** the cited URLs inside each page's References block — found via
   live search, labeled `[fetched]` or `(search result only, not fetched)`, never invented.
   (A future `raw/` directory may hold snapshots; today the citations are the source layer.)
2. **The wiki (agent-maintained):** `wiki/*.md` atomic pages + the five narrative hub docs
   + `index.md` + `log.md`.
3. **The schema (this file):** structure, conventions, and the three workflows below.

## Page types

| Type | Lives in | What it is |
|---|---|---|
| `entity` | `wiki/` | One page per person, game, machine, or artifact (e.g. `ada-lovelace`, `q-bert`, `commodore-64`) |
| `concept` | `wiki/` | Cross-cutting synthesis (e.g. `easter-egg-culture`, `nes-hardware`, `touch-typing-pedagogy`) |
| `moment` | `wiki/` | A dated event (e.g. `arpanet-first-message-1969`, `mark-ii-moth-1947`) |
| `hub` | `research/` root | The five narrative Maps of Content (video-game-history, computing-history-moments, hacker-culture, typing-pedagogy, arcade-cabinets-by-era) — they tell the story and link into the atomic pages |

## Page format (every `wiki/` page)

```markdown
---
title: Ada Lovelace
type: entity            # entity | concept | moment
tags: [computing-history, person, history-card]
level: 4                # game level(s) this touches, if any
sources: 3              # count of references on this page
verified: 2026-07-11    # date of last citation pass
---

One-paragraph summary a future agent can trust without reading further.

## In this game
How Keystroke Kingdom uses this (card text, easter egg, cabinet, era claim) — with
[[wikilinks]] to related pages.

## The facts
Dated, precise claims. Distinguish created-vs-shipped, popularizer-vs-inventor
(see the fluent-error calibration in .claude/agents/arcade-historian.md).

## References
1. [Title](url) — what it supports. **[fetched]** or (search result only, not fetched)
```

Conventions: kebab-case filenames; `[[wikilink]]` targets are filenames without `.md`;
every page links to at least one other page (no orphans); citations move WITH facts when
content is atomized — a claim never becomes uncited by relocation.

## The three workflows

**Ingest** (new research): search the wiki FIRST (`node scripts/wiki-search.mjs "<query>"`)
to find what exists; research the gap per the arcade-historian standard; write/update
atomic pages; add [[wikilinks]] both directions; regenerate the index
(`node scripts/wiki-search.mjs --index`); append one line to `log.md`.

**Query** (answering from the wiki): read `index.md` first; `wiki-search.mjs` to narrow;
read only the pages you need; if the synthesis is durable and non-obvious, write it back
as a `concept` page (queries compound into knowledge).

**Lint** (periodic health): check for orphan pages, contradictions between pages, stale
`verified:` dates, claims without adjacent references, broken [[wikilinks]]
(`node scripts/wiki-search.mjs --lint`). Log the pass in `log.md`.

## Search

`scripts/wiki-search.mjs` — zero-dependency BM25 over all wiki + hub pages, with
frontmatter/title/link-text boosts. Commands:
- `node scripts/wiki-search.mjs "phrase or keywords"` — ranked results with snippets
- `node scripts/wiki-search.mjs --index` — regenerate `index.md` from frontmatter
- `node scripts/wiki-search.mjs --lint` — orphans, broken links, uncited pages

At the current scale (~100 pages), lexical search + the index is the right tool (the
LLM-wiki pattern's own guidance). If the corpus grows past a few hundred pages, add an
embedding backend behind the same CLI. For humans: Obsidian's graph view + the
Smart Connections plugin provide the semantic layer visually.

## Obsidian setup (human side)

Open `research/` as a vault. Recommended community plugins: **Smart Connections**
(semantic related-notes), **Dataview** (query the frontmatter — e.g. all pages where
`type = moment` sorted by `verified`), **Templater or Smart Templates** (new-page template
mirroring the format above). The `.obsidian/` folder is gitignored — plugin choices are
personal; this schema is the contract.
