---
title: Roguelike
type: concept
tags: [computing-history, game-genre, ascii, terminal]
sources: 8
verified: 2026-07-17
---

Roguelike is the genre named for Rogue (1980) — ASCII-rendered, turn-based,
grid-based dungeon crawlers with procedurally generated levels and permadeath. The
canonical lineage (Rogue → Hack → NetHack, and separately Moria → Angband) is
**single-player by original design**; genuine multiplayer roguelikes exist only as
later derivative forks — see [[mangband]]. For the specific case of a raw-telnet,
publicly-watched dungeon crawl — the confirmed reference for Trevor's own childhood
memory — see [[nethack]], whose public server nethack.alt.org made a single-player
game into a communal, spectated experience without changing its ruleset.

## In this game

Grounding research for a possible Keystroke Kingdom Level 20 / bonus text-adventure
wing direction: "ASCII graphical, overhead-view, multiplayer" worlds a kid's parent
might remember reaching by telnet/dialup in the 1990s. The roguelike lineage is the
correct visual reference (the `@` player glyph, letter-monsters, an overhead ASCII
grid that reads visually like a top-down [[legend-of-zelda|Zelda]]-style map) but the
**multiplayer** half of that memory does not belong to Rogue/NetHack/Angband as
*games* — each is single-player by design. It belongs either to a later multiplayer
fork, chiefly [[mangband]] (1997), or — confirmed as the actual match, per Trevor's
own recollection of raw `telnet` access with others watching/chatting — to the
**public-server culture** around NetHack itself: see [[nethack]] for how
nethack.alt.org made a strictly single-player game into a communal, spectated
experience. See [[mud]] for the third archetype (pure prose, no picture, and
*inherently* multiplayer from 1978 onward). Downstream design flags (permadeath vs.
the One Rule) are in [[nethack]], [[mangband]], and [[mud]], since those are the
pages a theme would actually draw from.

## The facts

- **Rogue (1980):** created by Michael Toy and Glenn Wichman at UC Santa Cruz for
  Unix; text-mode display using letters/symbols for the player, monsters, and terrain
  on a fixed-character grid; turn-based; inspired by *Star Trek* (1971), Colossal Cave
  Adventure (1976), and Dungeons & Dragons. Distributed with 4.2BSD Unix (1983),
  spreading across university networks. **Single-player.**
- **Hack (1984) → NetHack (1987):** Hack forked/rewrote Rogue; NetHack is Mike
  Stephenson's DevTeam fork of Hack, named for its collaborative USENET development —
  "Net" refers to the development process, not multiplayer gameplay. NetHack is
  explicitly documented as **single-player**, with permadeath ("expired characters
  cannot be revived"). The player is the `@` glyph; monsters are letters; items and
  terrain are other ASCII symbols.
- **Moria (1983) → Angband (1990):** the parallel branch. Angband, created by Alex
  Cutler and Andy Astrand at the University of Warwick, is likewise
  single-player-by-design — its public release (v2.4.frog_knows) was April 11, 1993.
- **The Berlin Interpretation (2008):** the roguelike community's own definition,
  drafted at the International Roguelike Development Conference in Berlin. Nine
  "high-value" factors include random dungeon generation, permadeath, turn-based
  play, and grid-based movement. It does not require single-player, but the
  "canonical" roguelikes it names (Rogue, NetHack, Angband, Crawl, ADOM) are all
  single-player at their core; it separately acknowledges "multi-player turn-based
  derivatives such as TomeNET, MAngband, and Crossfire" as existing exceptions built
  on top of the single-player canon — precisely the "was it multiplayer?" distinction
  this research thread turns on.
- **What was NOT ASCII, contra a common false memory:** Crossfire (1992, University
  of Oslo) is frequently misremembered as an ASCII roguelike because RogueBasin
  classifies it alongside NetHack/Ultima/Gauntlet influences — but Crossfire's actual
  display is **tile-based with a pseudo-isometric perspective**, not ASCII text. It
  IS genuinely multiplayer (any number of players on public servers) — see the
  cabinet-art rule against conflating "influenced by" with "looks like."

## Movement conventions (added 2026-07-17)

Roguelike movement is `hjkl` (vi-keys) plus `yubn` diagonals, or a numeric-keypad
equivalent — and the reason is terminal hardware, not aesthetics. `vi` (Bill Joy,
1976) put cursor movement on `h j k l` because his Lear Siegler ADM-3A terminal had
those four letters physically inscribed with arrows and **no dedicated arrow keys at
all**. Rogue inherited vi's own screen-handling code along with its `hjkl`
convention, then added `y`/`u`/`b`/`n` for the four diagonals for the same reason —
1980-era terminals commonly lacked arrow/diagonal keys. NetHack's official Guidebook
documents the resulting `[yuhjklbn]` eight-direction scheme plus a numpad equivalent
(`number_pad` option: 7-8-9/4-.-6/1-2-3). Angband's own manual offers the identical
choice — default numpad keyset, alternative "roguelike" `yuhjklbn` keyset, arrow keys
valid in either — and ADOM (Thomas Biskup, 1994/1996) leans numpad-centric enough
that a missing numpad is called out as a real usability issue. **The throughline: every
one of these schemes exists because a specific historical keyboard lacked arrow
keys — once terminals commonly had them, every family added arrows as an option
rather than replacing its letter scheme.** Full comparison against MUD/MegaZeux/BBS-
door movement conventions, plus scale and NPC-riddle research for a possible
Keystroke Kingdom Act 6 redesign: [[ascii-overhead-world-conventions]].

**References:** [Vi (text editor) — Wikipedia](https://en.wikipedia.org/wiki/Vi_(text_editor)) — ADM-3A hjkl origin. **[fetched]** · [NetHack 3.6.6 Guidebook](https://www.nethack.org/v366/Guidebook.html) — `[yuhjklbn]`/numpad direction table. **[fetched]** · [Angband Manual — Command Descriptions](https://angband.readthedocs.io/en/latest/command.html) — numpad + roguelike keyset + arrow-key duality. **[fetched]** · [Ancient Domains of Mystery — Wikipedia](https://en.wikipedia.org/wiki/Ancient_Domains_of_Mystery) — numpad-centric controls. **[fetched]**

## See also

[[ascii-overhead-world-conventions]] — movement-scheme comparison across roguelikes,
MUDs, MegaZeux/ZZT, and BBS door games, plus world-scale and NPC-riddle research for
a possible Act 6 tile-world redesign. [[early-graphical-mmorpgs-1990s]] — a separate
research thread for a different
childhood memory (ASCII/graphical overhead world with named clans/factions you
JOINED, early-EverQuest feel), which the single-player roguelike lineage and its
MAngband/NetHack multiplayer derivatives do not satisfy as well as the commercial
dial-up MMORPG candidates researched there. [[megazeux]], [[asciiroth]] — a
sibling ASCII-text realm (game-CREATION systems and hobbyist RPGs rather than
dungeon-crawl roguelikes proper) that shares the same overhead-text-glyph visual
grammar and the same single-player-by-design verdict; see that page's "wider
hobbyist ASCII-RPG realm" section for the closest analog to Trevor's third supplied
reference (the ummagumma QB64 ASCII RPG project).

## Unsourceable / weakly-sourced items

- Whether Trevor's specific 1990s memory maps to Angband/NetHack directly, versus a
  multiplayer fork, versus a graphical MUD misremembered as ASCII — no source can
  confirm a personal memory with certainty, but Trevor's own follow-up confirmation
  (raw `telnet` access, others watching/chatting) strongly points to
  [[nethack]]'s public-server culture over the [[mangband]] candidate, which
  requires a dedicated client rather than raw telnet — see [[nethack]] for the
  full reconciliation.

## References

1. [Rogue (video game) — Wikipedia](https://en.wikipedia.org/wiki/Rogue_(video_game)) — creation by Toy/Wichman at UC Santa Cruz, 1980, ASCII text-mode grid, BSD Unix distribution. **[fetched]**
2. [NetHack — Wikipedia](https://en.wikipedia.org/wiki/NetHack) — confirms single-player, 1987 release, `@` player glyph, permadeath, Hack/Rogue lineage. **[fetched]**
3. [Roguelike — Wikipedia](https://en.wikipedia.org/wiki/Roguelike) — Berlin Interpretation summary; explicitly states Rogue/Hack/NetHack/Moria/Angband are single-player, naming "TomeNET, MAngband, and Crossfire" as the multiplayer exceptions. **[fetched]**
4. [Angband (video game) — Wikipedia](https://en.wikipedia.org/wiki/Angband_(video_game)) — 1990 creation at University of Warwick by Cutler/Astrand, April 11 1993 public release, names MAngband (1997) as "a multiplayer variant." **[fetched]**
5. [Crossfire (1992 video game) — Wikipedia](https://en.wikipedia.org/wiki/Crossfire_(1992_video_game)) — confirms tile-based pseudo-isometric graphics (not ASCII) and genuine multiplayer support. **[fetched]**
