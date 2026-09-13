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

## Organization — folders are the human taxonomy, types are the semantic kind

| Folder | What lives there | Examples |
|---|---|---|
| `wiki/people/` | The humans behind the machines | `ada-lovelace`, `warren-robinett`, `hedy-lamarr` |
| `wiki/games/` | Video games — arcade cabinets, consoles, text adventures | `q-bert`, `tetris`, `colossal-cave-adventure` |
| `wiki/tech/` | Machines, formats, and era-hardware concepts | `eniac`, `ascii`, `nes-hardware`, `pre-rendered-3d` |
| `wiki/culture/` | Hacker and gaming folklore | `konami-code`, `xyzzy`, `wopr-wargames`, `the-eighth-key` |
| `wiki/moments/` | Dated events | `arpanet-first-message-1969`, `mark-ii-moth-1947` |
| `wiki/pedagogy/` | Typing tutors and teaching concepts | `mario-teaches-typing`, `letter-frequency` |
| `research/` root | The five narrative hub docs (Maps of Content) — they tell the story and link into the atomic pages | `video-game-history`, `hacker-culture` |

Placement rules: a page goes in exactly one folder — pick by what the page is *about*
(HAL 9000 is folklore → `culture/`, not `tech/`; ELIZA is a real program → `tech/`).
Fictional things and references → `culture/`. When a topic could split (person + their
event, like Grace Hopper + the moth), make two cross-linked pages in their own folders.
New folders are allowed when a genuine new domain appears (e.g. `music/` for the Lyria
work) — add the folder to `FOLDER_ORDER`/`FOLDER_BLURB` in `scripts/wiki-search.mjs` and
document it here.

**Linking is folder-independent:** Obsidian resolves `[[name]]` by shortest path, and the
search/lint tooling matches basenames — so wikilinks never include folder prefixes and
moving a page between folders breaks nothing.

Each page still declares its semantic kind in frontmatter:
`type: entity` (a person/game/machine/artifact) | `concept` (cross-cutting synthesis) |
`moment` (a dated event).

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

## Media — the imagery layer *(added 2026-09-13, Trevor)*

*"We haven't had imagery in the knowledge graph / research documentation yet — to make sure
this keeps consistent, is auditable and keeps research pinned in the Obsidian vault, let's
make sure these media files are stored in the vault as references to the markdown research
file they are associated with."*

**Why:** several claims in this wiki were established by LOOKING at a picture — the Apple
IIe's black Disk II front face, Stickybear's blue Apple II palette, the next-key highlight on
a 1985 typing tutor, Missile Command's trackball sitting to the RIGHT of its fire buttons.
Before this layer the picture was thrown away and only the conclusion survived, which is
unauditable: a reader could not check the claim without redoing the search. **An image is
evidence, and evidence belongs in the vault beside the claim it supports.**

**Where:** `research/wiki/media/<page-slug>/<descriptive-name>.<ext>` — the folder name IS the
page the image belongs to, so a file can never drift away from its claim.

**How to embed:** a normal markdown image with a relative path, e.g.
`![alt text](../media/<page-slug>/<file>.jpg)` — this renders in **both** Obsidian and GitHub,
unlike `![[wikilink]]` embeds. Write real alt text describing what is in the frame; it is what
a future agent reads when it cannot see.

**Every image carries a credit block**, keyed by its own filename in backticks:

```markdown
### `apple-iie-system.jpg`
![what is actually in the frame](../media/console-hardware-silhouettes/apple-iie-system.jpg)
- **Shows:** which claim on this page it supports
- **Source:** [File:… — Wikimedia Commons](url)
- **Author:** name (date)
- **Licence:** CC BY-SA 4.0
- **Retrieved:** 2026-09-13
```

`Source`, `Licence` and `Retrieved` are **required** — `node scripts/wiki-search.mjs --lint`
fails without them. It also fails on an image no page embeds (ORPHAN MEDIA), an embed with no
file (BROKEN MEDIA), and a file embedded by a page other than its folder's (MISPLACED MEDIA).

**A source you cannot store is still a source.** Non-free imagery gets a **reference-only
entry** — same page, same audit trail, no bytes:

```markdown
### Looked at, not stored — `numskull-space-invaders-quarter-size`
- **Source:** [Official Space Invaders Quarter Size Arcade Cabinet — Numskull](url)
- **Shows:** a white ball-top stick and three buttons on the panel
- **Rights:** commercial product photography — reference link only, not stored
- **Weight:** replica, therefore a SECONDARY source; cannot establish the original's layout
- **Retrieved:** 2026-09-13
```

The lint does not police these (there is no file to check), so the discipline is yours: say
what you looked at, what it showed, and how much it is worth. A reader who wants to see it
follows the link. **"I could not store it" is never a reason to omit the citation.**

**Two source rules that are not about licensing:**

1. **Non-free imagery may be LOOKED AT but never stored.** Commercial product photography,
   press shots and most retailer imagery are all-rights-reserved. Consulting one to check a
   drawing is fine and ordinary research; committing it is redistribution. Cite the URL and
   what it showed you, and keep the bytes out of the repo. (Trevor raised this himself about
   Numskull's cabinet range — *"not sure about the licensing of their photos though"* — and
   he was right to.)
2. **A later revision is evidence for ITSELF, never for the thing it descends from.** This is
   one trap wearing many costumes, and this project has now walked into it in three different
   domains:
   - **Replicas and remakes.** Quarter-size and mini cabinets, "faithful" reissues and themed
     merchandise are built to read right at a glance and to fit modern parts. Worked example
     on [[arcade-control-panels]]: a licensed quarter-scale Space Invaders cabinet shows one
     stick and **three** buttons; the original takes a 2-way stick and **one** fire button.
     The product copy said *"everything from the artwork, shape and buttons match the
     original"* — **marketing copy is not a citation.** (Postscript worth keeping: when the
     original was finally photographed, the replica turned out to be faithful after all. **A
     replica is not distrusted because it is usually wrong — it is distrusted because you
     cannot tell from the replica whether it is right.**)
   - **Later hardware revisions of the same machine.** The 1987 **Platinum** Apple IIe is
     light grey; the machine Stickybear shipped for is **beige**
     ([[console-hardware-silhouettes]]). Photograph the right year.
   - **Later models in the same line.** The original PlayStation is **grey**; black is the
     PS2 — an error a summariser asserted mid-research and that
     `.claude/rules/theme-authoring.md` now warns about by name.

   **Look for a restoration source first.** A restorer photographing an unrestored machine is
   the best class of evidence there is: a real unit, documented *before* anything was
   "improved" toward what a modern eye expects. [[arcade-control-panels]] cites one.

   **The rule:** name the exact year and revision your image shows, and only let it support a
   claim about *that*. Otherwise photograph the real thing, or mark the entry a gap. A gap is
   honest; a confident wrong detail is what ships.

**Licensing is not optional bookkeeping.** GitHub Pages serves this repo's root, so anything
committed here is published. Prefer freely-licensed sources (Wikimedia Commons records the
licence in `extmetadata` — fetch it, don't guess). Where an image is **not** free — emulator
screenshots of copyrighted software are the recurring case — say so in the block
(`**Rights:** … research reference, not freely licensed` / `**Licence:** none claimed`) rather
than shipping it quietly. Keep images small; resize to ~1000px on the long edge.

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
- `node scripts/wiki-search.mjs --lint` — orphans, broken links, uncited pages, and the media rules above

At the current scale (~100 pages), lexical search + the index is the right tool (the
LLM-wiki pattern's own guidance). If the corpus grows past a few hundred pages, add an
embedding backend behind the same CLI. For humans: Obsidian's graph view + the
Smart Connections plugin provide the semantic layer visually.

## Obsidian setup (human side)

**Open the repo root as the vault** — one graph spans the research wiki, the shared-learning
journal (`docs/journal/`), the ROADMAP, and the design bible (`.claude/rules/`). Code and
asset directories are excluded from indexing via `.obsidian/app.json`.

A baseline plugin set SHIPS WITH THE REPO in `.obsidian/plugins/` (Obsidian will ask you to
trust and enable community plugins on first open — say yes):
- **Dataview** — query frontmatter (e.g. `type = moment` sorted by `verified`)
- **Templater** — `templates/wiki-page.md` scaffolds a schema-correct page
- **Smart Connections** — semantic related-notes (its local embeddings cache `.smart-env/`
  and its `data.json` settings are gitignored; personal)

Volatile state (`workspace.json`) stays personal via .gitignore; the shared baseline
(plugin code, community-plugins.json, app.json excludes) is the committed team setup.

## The journal is part of the graph

`docs/journal/{learnings,observations,failures}.md` are append-only project memory —
cross-referenced by `L#`/`O#`/`F#` IDs and `[[wikilinks]]` into the wiki. They're indexed
by the search CLI and listed in `index.md` ("Journal & planning"), but the full page schema
(frontmatter/References) is enforced only on `wiki/` pages. A Stop hook
(`scripts/journal-hook.sh`) enforces a session entry whenever meaningful work happened.
