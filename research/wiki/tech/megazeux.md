---
title: MegaZeux
type: entity
tags: [computing-history, game-creation-system, ascii, ansi, dos, single-player, community]
sources: 12
verified: 2026-07-17
---

MegaZeux is a DOS game-creation system built by **Alexis Janson**, first uploaded to
AOL as version 1.00g on **December 4, 1994** — the same day its flagship pack-in game,
*Zeux 2: Caverns of Zeux*, shipped. It renders worlds as extended ASCII/ANSI text
characters standing in for tiles, characters, and items (walls as `#`, the player as a
smiley, monsters and items as other glyphs) and is scripted via **Robotic**, an
object-oriented language derived from ZZT's ZZT-OOP but considerably more advanced.
The MegaZeux community, still active today around the **DigitalMZX** archive/forum,
overwhelmingly built **single-player** action-RPGs and adventures — MegaZeux's own
official documentation confirms the engine never shipped native network/multiplayer
support, despite it being "definitely possible" and a perennial community wish.

## In this game

**Grounds one candidate aesthetic anchor for a possible Act 6 "ASCII world" cabinet** —
requested by Trevor after pointing at three specific realm-defining references
(this page, [[asciiroth]], and the general hobbyist ASCII-RPG scene). MegaZeux is the
closest documented match to "an overhead, ANSI-colored text-character RPG world you
could actually walk around in and fight things in, made by a hobbyist community" —
see [[ascii]] and [[ansi-escape-codes]] for the display technology and [[roguelike]]
for the sibling ASCII-dungeon lineage. **Crucially for the clans/EverQuest memory
this research thread is also chasing (see [[early-graphical-mmorpgs-1990s]]): MegaZeux
itself is not the answer.** Every sourced account of the engine, including its own
official help documentation, confirms it never shipped true networked multiplayer —
see "The multiplayer verdict" below.

## The facts

### Origin and authorship
- **December 4, 1994:** MegaZeux 1.00g uploaded to AOL by Alexis Janson, founder of
  the now-defunct Software Visions. Janson and other Software Visions members had
  previously made games for **ZZT** (Tim Sweeney/Epic MegaGames' earlier DOS
  text-character game-creation system) — MegaZeux was explicitly built as ZZT's
  successor/improvement, adding digital sound/music support, an editable character
  set, and adjustable board sizes.
- **Zeux 2: Caverns of Zeux**, also released December 4, 1994 by "Tromdage"
  (the community's account credits this as Janson's own pack-in showcase title —
  see reference 4), was the first MegaZeux game ever released, shipped bundled with
  every MegaZeux release through version 2.51, and remains the game MegaZeux loads by
  default (`CAVERNS.MZX`) to this day. It is an action-adventure, explicitly
  single-player.
- **1995, version 2.00:** a near-total rewrite — an editable 16-color EGA palette,
  a restyled interface, and a more versatile world editor/Robotic language.
- Still actively developed as open-source (GNU GPL) software today, ported well
  beyond its original DOS home to Windows, Linux, macOS, Wii, PSP, DS, and others.

### Robotic — the scripting language
- Robotic is MegaZeux's object-oriented scripting language, built on the concepts of
  ZZT's ZZT-OOP but substantially more advanced: commands compile to bytecode rather
  than staying as plain interpreted text, error-checking happens in the editor rather
  than at runtime, and it supports real arithmetic/variable operations ZZT-OOP lacked.
  This is what let the community build full RPGs (inventory systems, stat tracking,
  branching dialogue, custom combat) rather than just ZZT-style puzzle rooms.

### The ASCII/ANSI "graphics"
- MegaZeux worlds are built from an extended character set — not the strict 7-bit
  ASCII of [[ascii]], but the same lineage of "every visible thing is a text
  character with a foreground/background color," with a fully user-editable
  character set (custom glyph shapes) and 16-color EGA-era palettes. This is the
  aesthetic Trevor is pointing at: overhead maps made of colored text glyphs, not
  sprite art — the DOS/ANSI text-mode RPG look.

### What the community built
- Community output skewed heavily toward **RPGs and action-adventures** — the
  DigitalMZX archive's own "Essential Selection" and the Zeux series itself
  (Caverns of Zeux and its four sequels, all by Janson) set the genre template the
  community followed for decades. A representative later community RPG,
  *MZX Adventure RPG* (ThDPro, 2012), is described on its own DigitalMZX page as
  "a vast world (with scaled map), many enemies and tasks" on "a single gigantic
  overworld board," combat with stats improving through fighting and upgrades, and
  weapons including swords, bows, and magic — a genuinely game-shaped, exploration-
  and-combat ASCII RPG, and explicitly single-player.
- **DigitalMZX** (digitalmzx.com) is, by its own description, home to "the largest
  available archive of MegaZeux games and the only known active MegaZeux message
  board" — an "enormous collection" of user-made games plus a long-running forum and
  Discord community. No source found this session gives an exact total game count.

### The multiplayer verdict
- MegaZeux's own official help documentation (`mzx_help.html`, current version)
  states plainly on the question of network play: **"It's definitely possible, and
  possible to do soundly, but developers don't have netplay as a high priority."**
  It further explains the obstacle isn't technical impossibility but "thorny
  implementation issues" — how a MegaZeux world's own Robotic scripting would need
  to be restructured to accommodate network state at all.
- A 2009 DigitalMZX forum thread ("Networked Mzx") shows a community member (`ajs`)
  had built a working *prototype* — two clients loading the same world to the title
  screen, one hosting via an IP-address handshake, keypresses synchronized over UDP
  with cycle numbers in a deterministic, emulator-netplay-style architecture — but an
  administrator's own reply ("Its our annual netmzx topic! OMFG") signals this was a
  recurring community wish that never shipped as a stable, general-purpose feature.
- **One single-game exception exists and proves the rule:** *MegaZeux Deathmatch*
  (ChargingMoose, May 15, 1999) is tagged "Multiplayer" on DigitalMZX and built
  entirely inside the Robotic scripting layer of one specific game — not an engine
  feature. No source found describes its multiplayer mechanism in detail (likely
  hotseat/shared-keyboard play, consistent with 1990s DOS shareware conventions, but
  this session found no confirming detail — flagged as unconfirmed below).
- **Bottom line: MegaZeux, as an engine, never had native networked/shared-world
  multiplayer.** The community layer around it — DigitalMZX's forums, shared game
  archives, collaborative editors and playthrough culture — is real and large, but
  it is a *sharing and making* community, not a *playing together in one live world*
  community. See [[early-graphical-mmorpgs-1990s]] for why this rules MegaZeux out
  as the direct source of a "joined a clan and adventured together" memory.

## Scale and movement (added 2026-07-17)

Researched directly for a possible Keystroke Kingdom Act 6 tile-world redesign (see
[[ascii-overhead-world-conventions]] for the full cross-family comparison). A
MegaZeux **board** defaults to the full 80-column × 25-row DOS text screen but can be
resized anywhere from 1×1 up to a genuinely enormous **32767×32767 tiles**, with a
scrolling **Viewport** that tracks the player and can be resized/repositioned
independently of the board itself. A **world caps at 250 boards**, connected via an
explicit "Board Exits" dialog (the `X` key in the editor) that links each of a
board's four screen edges to another board — walking off an edge deposits the
player at the matching edge of the linked board — plus in-world transport objects
(stairs, caves, whirlpools) and a scripted `teleport player <board> X Y` call for
non-edge transitions. The element vocabulary is large: the current help file
documents roughly **40-50 distinct terrain/item/creature/puzzle-piece categories**
(terrain like Space/Solid/Tree/Fake/Carpet/Floor/Web/Forest; items like Gem/Health/
Key/Lock/Coin/Chest/Potion/Ring; creatures like Snake/Ghost/Dragon/Spider/Goblin/
Bear; puzzle mechanics like Boulder/Crate/Pusher/Slider; transport like Stairs/Cave/
Whirlpool/Rotators). **No fog-of-war, torch, or line-of-sight mechanic is documented
anywhere in the help file** — every tile on a board is always fully visible; a
MegaZeux world's sense of discovery comes entirely from board SIZE and multi-board
connection, never hidden/revealed vision. **Movement itself is real-time arrow keys**
(the same keys used to move the editor cursor) — the Robotic scripting language
separately lets an author command an NPC "robot" to `GO north`/`GO south`/`GO n`/
`GO up` etc., so MegaZeux's own DSL treats compass *words* as a scripting
convenience even while the *player's* input stays arrow-key and real-time.

**References:** [MegaZeux 2.93d Help File](https://www.digitalmzx.com/mzx_help.html) — board size range, 250-boards-per-world cap, element categories, board-exits/viewport mechanics, no fog-of-war documented. **[fetched]** · [Board — MZXWiki](https://www.digitalmzx.com/wiki/Board) — 1×1 to 32767×32767 board range, per-board object caps. **[fetched]**

## Downstream design flags — One Rule and kid-safety

MegaZeux community RPGs (per the sourced *MZX Adventure RPG* example) center on
stat-driven combat against enemies, matching the same pattern already flagged on
[[nethack]] and [[roguelike]]: **STRIP** any death/combat-loss mechanic entirely;
**KEEP** the overhead ANSI-text exploration aesthetic, the sense of a hand-made,
personal little world (a strong match for the "typing unlocks a whole world" theme
already core to this game — see product.md), and the colorful glyph-based visual
language. No permadeath, no PvP, no monster-letter combat as the primary verb — same
treatment as every prior ASCII-genre reference in this wiki.

## Unsourceable / weakly-sourced items

- No English Wikipedia article for MegaZeux resolved via direct fetch this session
  (404); grounding instead comes from the community-maintained MZXWiki, Libregamewiki,
  and a WebSearch synthesis of Wikipedia's own indexed content — treat "Wikipedia"
  claims below as search-result corroboration, not directly fetched.
- *MegaZeux Deathmatch*'s exact multiplayer mechanism (hotseat vs. modem-link vs.
  something else) could not be confirmed this session — its DigitalMZX page carries
  a "Multiplayer" tag with no further mechanical description in what was fetched.
- The precise total count of games in the DigitalMZX archive was not found in any
  fetched page this session.
- Whether *Zeux 2: Caverns of Zeux*'s credited author "Tromdage" (per its DigitalMZX
  listing) and creator Alexis Janson are the same person under a handle, or Janson
  and Tromdage collaborated, could not be disambiguated from the pages fetched this
  session — both the MZXWiki ("Alexis Janson... uploaded... December 4, 1994") and the
  DigitalMZX game listing ("Tromdage released this game... December 4, 1994") were
  fetched and both cited verbatim; the same-day release date corroborates they
  describe the same launch event even if the authorship attribution differs by source.

## The wider hobbyist ASCII-RPG realm

Trevor's third reference — the "Great And Legendary As-of-Yet-Untitled ASCII RPG
Project" blog post (ummagummagames.wordpress.com, first posted September 1, 2011) —
is a different, later, and much smaller example of the same realm: a solo hobbyist
building a turn-based ASCII RPG in **QB64** (a modern QuickBASIC extension), explicitly
citing early Final Fantasy as a visual/structural touchstone but replacing random
encounters with on-screen enemy contact. The developer's own words — "practically all
ascii-based games that I am aware of are ugly as hell," aiming to do better — frame
this as one more entry in a recognized, ongoing hobbyist tradition of DOS/ANSI
text-character RPGs, not an isolated one-off. Like every other title in this realm
(MegaZeux community games, Asciiroth), it is **single-player**, with a 144×44-symbol
map, a completed map editor, and planned features (tree-planting/felling, digging,
bridge-building) that read as more Ultima/Dwarf-Fortress-adjacent sandbox systems than
combat-grind. No further public releases, screenshots, or completion status for this
specific project were found or fetched this session beyond the single blog post
Trevor supplied — treat it as one representative anecdote of the realm rather than a
project with its own independent verification trail.

## References

1. [MegaZeux — MZXWiki](https://www.digitalmzx.com/wiki/MegaZeux) — creation by Alexis Janson, December 4, 1994 upload date, ZZT lineage, Robotic language description, 1995 v2.00 rewrite. **[fetched]**
2. [MegaZeux 2.93d — Help File (mzx_help.html)](https://www.digitalmzx.com/mzx_help.html) — official documentation's own statement on network play: "definitely possible... but developers don't have netplay as a high priority," and the "thorny implementation issues" explanation. **[fetched]**
3. [Networked Mzx — dMZX Forums](https://www.digitalmzx.com/forums/index.php?showtopic=14384) — 2009 community thread documenting a working prototype (ajs), its UDP/deterministic-cycle architecture, and the "annual netmzx topic" characterization confirming no stable multiplayer ever shipped. **[fetched]**
4. [Zeux 2: Caverns of Zeux — DigitalMZX](https://www.digitalmzx.com/show.php?id=182) — first MegaZeux game ever released, Dec 4 1994, single-player action-adventure, bundled through v2.51, still the default-loaded world. **[fetched]**
5. [MZX Adventure RPG — DigitalMZX](https://www.digitalmzx.com/show.php?id=1976) — representative community RPG (ThDPro, Dec 10 2012), single-player, overworld-board structure, stat-driven combat — the specific page Trevor supplied as a reference. **[fetched]**
6. [MegaZeux Deathmatch — DigitalMZX](https://www.digitalmzx.com/show.php?id=1126) — ChargingMoose, May 15 1999, tagged Multiplayer, the one located exception to the engine's single-player norm (mechanism unconfirmed). **[fetched]**
7. [MegaZeux — Libregamewiki](https://libregamewiki.org/MegaZeux) — corroborates 1994 origin, Software Visions/Alexis Janson, shareware distribution model with free world editor. **[fetched]**
8. [MegaZeux: Game creation system released in 1994 and still being developed today — Hacker News discussion](https://news.ycombinator.com/item?id=21858188) — community corroboration of the 1994 release date and ongoing active development. *(search result only, not fetched)*
9. [Home — DigitalMZX](https://www.digitalmzx.com/) — "the largest available archive of MegaZeux games and the only known active MegaZeux message board." **[fetched]**
10. [The Great And Legendary As-of-Yet-Untitled ASCII RPG Project — ummagummagames.wordpress.com](https://ummagummagames.wordpress.com/2011/09/01/ascii-rpg-project/) — Sept 1 2011 hobbyist blog post, QB64 platform, single-player turn-based ASCII RPG, the third reference Trevor supplied for "the wider hobbyist realm." **[fetched]**
11. [Board — MZXWiki](https://www.digitalmzx.com/wiki/Board) — board dimension range (1×1 to 32767×32767), per-board object caps (255 sensors/robots, 255 signs+scrolls). **[fetched]** (2026-07-17 addition)
12. [MegaZeux 2.93d Help File](https://www.digitalmzx.com/mzx_help.html) — refetched 2026-07-17 for board-scale/element-vocabulary detail: default 80×25 board, 250-board world cap, ~40-50 element categories, board-exits (`X`) and viewport (`Alt+P`) mechanics, no fog-of-war/torch/line-of-sight documented. **[fetched]**

## See also

[[asciiroth]] — the second reference Trevor supplied, a different but aesthetically
adjacent single-player browser ASCII game, hosted on icculus.org rather than
DigitalMZX. [[ascii]] — the underlying character-code standard. [[ansi-escape-codes]]
— the color/terminal-formatting layer MegaZeux's palette lineage descends from.
[[roguelike]] — the sibling ASCII-dungeon genre (Rogue/Hack/NetHack) with its own,
separately confirmed, single-player-by-design history. [[nethack]] — the closest
previously-researched comparison for "single-player game, communal culture"
reconciliation language. [[mud]] — the genuinely multiplayer, prose-only sibling
archetype MegaZeux is NOT. [[early-graphical-mmorpgs-1990s]] — the active research
thread this page reports back to on the clans/EverQuest memory.
[[ascii-overhead-world-conventions]] — cross-family movement/scale/NPC-riddle
comparison researched 2026-07-17 for a possible Act 6 tile-world redesign; this
page's "Scale and movement" section is one of its inputs.
