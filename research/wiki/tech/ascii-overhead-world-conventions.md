---
title: ASCII Overhead World Conventions — Movement Controls, Scale, and NPC Interaction
type: concept
tags: [computing-history, game-genre, ascii, roguelike, megazeux, mud, keyboard-controls, act6, ux-history]
sources: 22
verified: 2026-07-17
---

*Commissioned 2026-07-17: Trevor flagged that Act 6's two tile worlds (THE GLIMMER
DEEP, THE WHISPERWOOD — `js/textworld/tileworld.js` + `tile-worlds.js`) use controls
and a map scale that don't match any of the ASCII-world families the design already
draws on ([[megazeux]], [[roguelike]], [[mud]], [[nethack]]). This page answers five
grounding questions in one pass, three added mid-session by Trevor: (1) what were the
ACTUAL period-authentic movement controls across roguelikes, MUDs, MegaZeux/ZZT, and
BBS door games; (2) how big and detailed were the worlds those games actually built;
(3) where and when did WASD actually originate, and is it era-appropriate here;
(4) what's the historical precedent for making the CHILD TYPE a direction as a command,
rather than press a real-time key; (5) what's the precedent for NPCs posing riddles/
questions the player answers by typing. **How to verify:** every claim below was
checked this session against a live web search and roughly half were confirmed by a
direct page fetch — **[fetched]** vs *(search result only, not fetched)* is marked on
every reference, per the arcade-historian standard (CLAUDE.md). This page extends
rather than restates [[roguelike]], [[nethack]], [[megazeux]], [[mud]], [[asciiroth]],
[[legend-of-the-red-dragon]], [[bbs-door-games]], [[zork]], and
[[colossal-cave-adventure]] — read those first for the fuller histories; only new
facts researched this session are recorded here.*

Four distinct ASCII/text-world families each solved "how do you move a character" and
"how big is the world" differently, and a fifth, much later family (1990s 3D shooters)
gave us the control scheme that actually *feels* native to a modern hand. Keystroke
Kingdom's current Act 6 tile-world engine matches none of the period-authentic families
cleanly — real-time single presses of the literal letters `n`/`s`/`e`/`w` is
MUD-style compass VOCABULARY borrowed as roguelike-style real-time keystroke
movement, a hybrid no historical family actually used — on a 15×9-tile map, roughly
two orders of magnitude smaller than a MegaZeux board and about a fifth the area of a
single roguelike dungeon level.

## In this game

**The core finding, stated plainly:** every family below picked its controls for a
specific, sourced reason (terminal hardware, typing pedagogy, or genre convention) —
and Keystroke Kingdom, being a *typing game first*, has a legitimate reason to depart
from all of them. The recommendation section below lays out the options with their
tradeoffs; **the final choice belongs to Trevor**, not this research pass. See
"Downstream design flags" for exactly what in `js/textworld/tileworld.js` and
`tile-worlds.js` a resolution would touch (this agent reads and cites only — it does
not edit game code).

## The facts

### Q1 — Movement / control schemes, by family

**Roguelikes (Rogue 1980, NetHack, Angband, ADOM) — `hjkl` + `yubn` vi-keys, or
numpad, chosen by TERMINAL HARDWARE, not aesthetic preference.** The scheme's root
cause predates gaming entirely: Bill Joy built `vi` (1976) around `h j k l` because
his Lear Siegler ADM-3A terminal had **no arrow keys at all** — those four letters
were physically inscribed with arrows on that terminal's keycaps, and Joy additionally
wanted terse, home-row, single-character commands to stay productive over a slow
300-baud connection [2]. Rogue's authors (Michael Toy and Glenn Wichman, UC Santa
Cruz, 1980) inherited `vi`'s screen-handling code and, with it, its `hjkl` convention
— then extended it with `yubn` for the four diagonals (`y`=NW, `u`=NE, `b`=SW,
`n`=SE), because their own terminals likewise lacked dedicated arrow/diagonal keys
[3][6]. NetHack's official Guidebook documents the resulting eight-direction
`[yuhjklbn]` scheme verbatim, plus a **numeric-keypad equivalent** (`number_pad`
option: 7-8-9 / 4-.-6 / 1-2-3, with 5 as "wait") and capital-letter variants for
continuous run-until-obstacle movement [1]. Angband's own manual documents the exact
same duality by design: a default numpad-based keyset, an alternative "roguelike"
`yuhjklbn` keyset for players without a numpad, and **arrow keys working identically
in both** as a third option layered on top [7]. ADOM (Thomas Biskup, Linux 1994 /
DOS-Windows Jan 28 1996) is numpad-centric by its own Wikipedia entry, to the point
that keyboards without a numpad are called out as a real usability problem [8]. The
throughline: **every one of these schemes exists because of a specific keyboard's
missing arrow keys**, not because letters were considered more "roguelike" in spirit
— once terminals commonly had arrow keys, every one of these games added them as an
option rather than replacing `hjkl`.

**MUDs (MUD1, AberMUD, DikuMUD/LPMud lineage) — movement is a TYPED COMPASS
COMMAND, entered like a sentence, not a single real-time keystroke.** This is already
fully documented on [[mud]] (verified 2026-07-13): the player reads a room
description, then types `north` or its abbreviation `n` (plus verb-object commands
like `attack dragon`) and presses Return to submit — the world does not update in
real time between keystrokes the way an arcade game or a roguelike's `hjkl` press
does [see [[mud]] references 1-2]. This is the crux distinction the current
`tileworld.js` blurs: it borrows the *letters* `n`/`s`/`e`/`w` from this family's
vocabulary but applies them with THIS family's mechanics gone — no Return, no typed
word, just an instant single keypress, which is roguelike/MegaZeux REAL-TIME
movement wearing MUD-style compass-letter clothing.

**MegaZeux / ZZT — real-time ARROW-KEY movement, confirmed directly from primary
documentation.** MegaZeux's own current help file and community wiki describe arrow
keys as the standard movement input during play (the same keys used to move the
cursor in the editor) [9][10]; the underlying scripting language, Robotic, even
lets an author command an NPC "robot" to `GO north`/`GO south`/`GO n`/`GO up` etc. —
so MegaZeux's own DSL treats compass *words* as a scripting convenience while the
*player's* input stays arrow-key, real-time [13]. ZZT (Tim Sweeney, released
January 15, 1991 for MS-DOS) is the direct ancestor MegaZeux improved on: Wikipedia's
own description is "a white smiley face on a navy blue rectangle that can move around
in four directions," and the game renders everything from the IBM PC's 255-character
set with a 16-color palette (7 colorable per object) [12]. Both are unambiguously
**real-time, arrow-key, single-player action** — the closest period match to what
`tileworld.js` currently *feels* like to play, even though it doesn't use arrow keys.

**BBS door games (LORD, 1989) — a LETTERED MENU, not directional movement at all.**
Already fully documented on [[legend-of-the-red-dragon]] (verified 2026-07-13): the
original Legend of the Red Dragon's interface was single-keystroke letter choices
from a location-specific menu ("F" for Forest, "S" for Slaughter, etc.), not compass
movement on a visible map [see that page's own reference list]. This family is
included for completeness/contrast — it is NOT a movement scheme in the sense the
other three are, and it's already the documented basis for the wing's prose-menu
world ("THE GREEN DRAGON," `engine.js`), not the tile-grid worlds this page is about.

*(All Q1 numbered citations are consolidated in the "References" section below.
[[mud]] and [[legend-of-the-red-dragon]] carry their own already-verified reference
lists for the MUD and BBS-door claims above — not re-cited here.)*

### THE FINDING (Q1)

Our current `n`/`s`/`e`/`w` scheme is a genuine hybrid with no historical antecedent:
it takes MUD-style compass-direction *vocabulary* and applies it with roguelike/
MegaZeux-style real-time single-keystroke *mechanics*. That's not wrong on its own
terms (nothing says a kids' typing game must be a museum piece), but it means the
current implementation can't honestly claim fidelity to any one of the three real
movement families above — it's an invented fourth thing wearing one family's letters.

### Recommendation and the design tension (Q1)

Three historically-defensible directions, with tradeoffs:

1. **`hjkl` (+ optional `yubn` diagonals)** — the most roguelike-authentic choice,
   and it has a real pedagogical bonus this game cares about: all four keys sit on
   the home row (J and K are two of the very first keys taught in Level 1/2), so
   movement literally reinforces finger position rather than pulling hands away from
   it. The cost: it's the LEAST intuitive to a first-time adult, let alone a child,
   with zero modern-game precedent to lean on (nobody who didn't grow up on Rogue
   guesses `hjkl` unprompted).
2. **Arrow keys** — the actual MegaZeux/ZZT-authentic choice for this specific
   aesthetic lineage (`research/wiki/tech/megazeux.md` is the game's own stated
   grounding reference for these worlds), intuitive to essentially everyone, but
   teaches no typing at all — arrow keys are the one input this game otherwise never
   asks a player to use.
3. **WASD** — familiar to any modern player raised on games, but per Q3 below it is
   **anachronistic** for this aesthetic by about fifteen years; using it here would
   be the same kind of era-mismatch the design rules elsewhere explicitly guard
   against (era-progressive graphics, `.claude/rules/theme-authoring.md`).

**The tension for Trevor to resolve:** option 1 is the only one that's simultaneously
period-authentic to roguelikes AND advances the game's typing mission, but it is the
least discoverable without a hint; option 2 is period-authentic to the *other*
grounding reference (MegaZeux) and is the most discoverable, but doesn't teach
anything; option 3 is discoverable and familiar but era-wrong. A blended answer this
research surfaces without prescribing it: Q4 below documents a completely different,
also-authentic axis — TYPED compass words as commands (not real-time keys at all) —
which sidesteps the hjkl-vs-arrows tension entirely by making movement itself a
typing exercise, at the cost of losing the "walk around freely" feel real-time
movement gives a young child exploring a world. All three (plus the typed-command
option) are laid out here **for Trevor to choose from**, not resolved by this pass.

### Q2 — World scale & detail

**MegaZeux — boards from full-screen (80×25) up to 32767×32767, with a rich,
period-documented tile vocabulary.** A board defaults to the full 80-column ×
25-row DOS text screen, but MegaZeux's own board editor allows anywhere from 1×1 up
to a genuinely enormous 32767×32767 tiles, with a scrolling **Viewport** that tracks
the player and can be resized/repositioned independently of the board itself
[9][10][11]. A world caps out at **250 boards**, connected via an explicit "Board
Exits" dialog (`X` key) that links a board's four screen edges to other boards —
walking off an edge deposits the player at the matching edge of the linked board —
plus in-world transport objects (stairs, caves, whirlpools) and scripted
`teleport player <board> X Y` calls for non-edge transitions [9]. The element
vocabulary is large and genuinely varied: the help file documents roughly **40-50
distinct terrain/item/creature/puzzle-piece categories** — terrain (Space, Solid,
Tree, Line, Breakaway, Fake, Carpet, Floor, Tiles, Web, Forest), items (Gem, Health,
Key, Lock, Coin, Chest, Potion, Ring), creatures (Snake, Ghost, Dragon, Spider,
Goblin, Bear), puzzle mechanics (Boulder, Crate, Pusher, Slider), and transport
(Stairs, Cave, Whirlpool, Rotators) [9]. **No fog-of-war, torch, or line-of-sight
mechanic is documented anywhere in MegaZeux's own help file** — every tile on a
board is always fully visible; MegaZeux's "discovery" comes entirely from board SIZE
and multi-board connection, not from hidden/revealed vision [9].

**ZZT — a much smaller, fixed-size board (60×25), many per world.** ZZT's own board
is a fixed 60×25 grid of elements (smaller than MegaZeux's default full-screen board,
since ZZT reserved screen space for its sidebar HUD), with up to roughly 100+ boards
documented in fan/community play (search-corroborated, not independently confirmed
this session with an exact ceiling figure) [12][14]. Boards link by edge, though the
wiki notes edge-links are **not automatically reciprocal** in the built-in editor — an
author has to wire both directions by hand [14]. Super ZZT (the sequel) specifically
added scrolling map screens to allow boards LARGER than the original's fixed size,
which is itself evidence that 60×25 felt constraining even to ZZT's own creator [12].

**Roguelike dungeons — a level is roughly 80×24 to 80×21 characters, one screenful,
discovered progressively via LIT/DARK line-of-sight, not board-to-board travel.**
Rogue's own original documentation ("A Guide to the Dungeons of Doom," the game's
1980 manual, preserved in 4.4BSD's Unix documentation set) specifies a minimum
**24-line × 80-column** terminal screen for the map [5] — the dungeon level fills
essentially one full terminal screen, generated by dividing that screen into a 3×3
grid of areas, each holding one room sized **4×4 to 25×7 characters (walls
included)**, connected by corridors that turn at most twice per link [3][4]. NetHack
inherited and tightened this: its Guidebook and community documentation put the
absolute maximum level size at **79×21**, the *displayed* map area at 80×21, and
most actual generated levels closer to **77×19** once border rows are excluded [1]
[16]. Rather than one big always-visible board (MegaZeux's model) or many small
discrete boards (ZZT's model), a roguelike level is discovered through a **lit/dark
line-of-sight system**: a lit room and anything within the player's sight line
renders fully, a dark area only renders within one tile of the player (extendable
with a light source), walls and corridors stay drawn once seen (permanent memory),
but **unlit floor tiles fade from the display once they're both dark and out of
current sight range** — the map is "remembered" structurally (walls/corridors) but
transient for open floor [15]. The glyph vocabulary that fills that single screen is
large: `.` floor, `|`/`-` walls, `+` doors/spellbooks, `#` corridors/sinks/
drawbridges, `<`/`>` stairs, `{` fountains, `_` altars/chains, `\` thrones, `}` pools/
moats/lava, `^` discovered traps, `)`/`[`/`$` weapons/armor/gold, and a-z/A-Z for
every monster [3][15].

**Concrete recommendation for a redesigned tile world:** the current 15×9 maps are
roughly 5-10% the area of a single roguelike dungeon screen and well under 1% of a
default 80×25 MegaZeux board — there is genuine headroom to grow by an order of
magnitude while staying inside EITHER reference's documented norms. A period-faithful
redesign could plausibly: (a) size a single "screen" at roughly **70-80 columns ×
20-25 rows** (matching both the roguelike terminal norm and MegaZeux's default board),
(b) chain 2-4 such screens together via edge-exits (MegaZeux's own board-linking
model) rather than one giant scrollable canvas, giving a sense of DISTINCT connected
areas (cave mouth → deep cavern → crystal hall, say) the way MegaZeux worlds and
roguelike branches both do, and (c) expand the glyph vocabulary well past the current
`#`/`.`/`@`/`k`/`*` five symbols — water, a door, a treasure glint, a sign/rune tile,
and simple terrain variety (rubble, moss, a bridge) are all period-authentic and
would make a bigger map read as detailed rather than merely empty. **A lit/dark
line-of-sight fog-of-war (the roguelike mechanic) is the single highest-value
addition for making a BIGGER map feel wondrous rather than sparse** — it turns "walk
across a big empty grid" into "discover what's actually here, room by room," which is
also the closest match to this wing's own "surprisingly amazing reveal" design intent
already built into `tileworld.js`'s `triggerReveal()`. None of this requires
death/combat/permadeath — MegaZeux's board-linking and roguelike's fog-of-war are
both purely structural/visual conventions, fully separable from the punishing
mechanics already flagged for stripping on [[nethack]] and [[roguelike]].

*(All Q2 numbered citations are consolidated in the "References" section below.)*

### Q3 — WASD: origin, era, and whether it's anachronistic here

WASD is **a mid-to-late-1990s FPS convention, roughly fifteen years younger than
Rogue and roughly three to seven years younger than MegaZeux/ZZT** — using it for
this aesthetic would be a genuine era-mismatch. Early PC first-person shooters
(Wolfenstein 3D 1992, Doom 1993) defaulted to **arrow keys**, clustered on the
right side of the keyboard, because most players didn't yet have or use a mouse for
aiming. Dennis "Thresh" Fong is widely credited with popularizing WASD specifically
for mouse-plus-keyboard play, using it to win the first nationwide Quake tournament
in **1997**; id Software's John Carmack bundled Thresh's config with Quake II later
that year, but Quake II still shipped with arrow keys as its OWN default. The
watershed moment cited across sources is **Half-Life, 1998** — Valve's own
Doom/Quake-veteran developers set WASD as the default keyboard-and-mouse
configuration, which is what actually cemented it as the FPS-genre standard [17].
Every one of MegaZeux (1994), ZZT (1991), Rogue (1980), NetHack (1987), and Angband's
1993 public release [see Q1's roguelike lineage citations] predates this convention
by anywhere from 4 to 18 years. **Verdict: WASD is familiar-but-era-wrong for this
specific aesthetic** — it belongs to 3D shooters a decade-plus later, not to
overhead ASCII exploration.

*(The Q3 numbered citation is consolidated in the "References" section below.)*

### Q4 — Typed directional movement: real historical precedent for "type your direction as a command"

This is not a hypothetical design — it is, in fact, the **older** of the two
movement conventions researched here. Colossal Cave Adventure (Will Crowther,
c. 1975-76; expanded by Don Woods, 1977) used a one-or-two-word parser where
**compass directions abbreviated to single letters (`n`, `s`, `e`, `w`, etc.)
became, per Wikipedia's own framing, "standard in interactive fiction titles"**
from that point forward [19] — the player TYPED the direction and pressed Return;
nothing moved until the word was submitted. Zork (MIT, 1977-1979) inherited and
extended this directly, adding full-sentence understanding on top of the same
compass vocabulary, and contains its own "type the right word" puzzle precedent:
the **Loud Room**, solvable only by typing the single word `echo` [18]. MUD1
(1978) and the entire DikuMUD/LPMud lineage standardized the identical typed-
compass-command convention for a genuinely multiplayer, simultaneous world (already
fully documented on [[mud]]). **This is real, well-attested precedent for a design
where the child TYPES `n`/`north`/`left` etc. as a submitted command rather than
tapping a real-time key** — arguably MORE historically apt for a typing-pedagogy
game than any of the real-time schemes in Q1, since it's the one family where
typing the direction WAS the entire interaction, not an add-on to it. The tradeoff,
named honestly: typed-command movement is turn-based and deliberate by nature (read,
type, submit, read again) — it trades away the "just walk around freely" feel a
young child gets from real-time arrow/hjkl movement, in exchange for making every
single step of exploration itself a typing rep.

*(The Q4 numbered citations are consolidated in the "References" section below.
[[mud]] carries its own already-verified reference list for the MUD1/DikuMUD
typed-compass-command claim, not re-cited here.)*

### Q5 — NPCs, riddles, and puzzles: precedent for a creature posing a question the player types an answer to

Four independent, genre-spanning precedents support "explore a big ASCII world,
meet a creature, read what it says, TYPE your answer":

- **NetHack's Oracle** is a named, standing NPC the player reaches specifically to
  consult — accessed via the `#chat` command while carrying gold, offering "minor"
  (a true rumor) and "major" (an extended, riddle-flavored description of some game
  aspect) consultations for a payment in zorkmids, explicitly modeled on the Pythia,
  the historical priestess of the Oracle of Delphi (the game even greets the player
  with "Delphi" on her level) [20][21]. NetHack's own homepage independently
  describes her domain as a place where "the Oracle speaks with utmost clarity" [20]
  — a direct, primary confirmation that a riddle/consultation-speaking NPC is core,
  documented content in this exact genre, not an invented embellishment.
- **Zork's Loud Room** (Q4 above) is the sibling precedent from the interactive-
  fiction branch: a location itself effectively "asks" the player to find and type
  the one correct word (`echo`) to proceed [18].
- **MUDs' quest-giver/verb-object convention** — already documented on [[mud]] —
  generalizes naturally to "a creature offers something, you type a word/command
  back to it," the same structural shape a riddle-and-answer exchange would take.
- **The broader literary "answer/say-the-right-word-to-pass" trope predates
  computer games entirely** and is worth naming for its own kid-safe warmth: the
  Doors of Durin in Tolkien's *The Lord of the Rings* bear the riddle-like
  inscription "Speak, friend, and enter" — solved not by force but by simply saying
  the Elvish word for "friend" (`mellon`) [22]. This is offered as the literary
  root of the pattern generally, not a claim of direct causal influence on any
  specific computer game researched here — that influence link was not found or
  fetched this session.

**Kid-safe framing considerations:** NetHack's Oracle consultation costs real
in-game currency and her "major consultation" pool includes genuinely difficult,
sometimes dark, high-level game lore (not researched or reproduced here); a
kid-facing version should keep only the WARM shape — a friendly creature that poses
a gentle, always-solvable riddle or question, answered by typing a word, with no
cost, no wrong-answer penalty, and no loss state — consistent with every other
One-Rule strip-list already on file for this genre family ([[nethack]],
[[roguelike]], [[legend-of-the-red-dragon]]). "Nothing is ever taken away for a
wrong guess" extends the exact same wrong-keypress contract (`CLAUDE.md`) the whole
game already runs on — a wrong answer is simply a gentle nudge, and the creature
waits, exactly like a wrong letter.

*(All Q5 numbered citations are consolidated in the "References" section below.
[[mud]]'s quest/verb-object convention is already cited there, not re-cited here.)*

## Downstream design flags — game code (read-only; not edited by this agent)

Per the arcade-historian boundary rule, this agent may only write under `research/`.
Everything below is a **flag for whoever next touches `js/textworld/tileworld.js` /
`tile-worlds.js`**, not a change made here.

- **Current movement code** (`tileworld.js`, `handleKey()`): `const dir = { n:
  [-1,0], s: [1,0], e: [0,1], w: [0,-1] }[String(e.key).toLowerCase()]` — a literal,
  real-time, single-keypress lowercase-letter scheme. Per the Q1 finding, this
  matches no historical family cleanly. **Proposed options** (Trevor's call, per the
  recommendation above): switch the key-map to `hjkl` (+ optionally `yubn`
  diagonals) for roguelike fidelity and typing reinforcement; switch to arrow keys
  for MegaZeux/ZZT fidelity and maximum discoverability; or restructure movement
  entirely around a typed-word command buffer (à la Colossal Cave Adventure/Zork/
  MUD) for the strongest typing-pedagogy fit, at the cost of real-time "free
  walking" feel. The on-screen hint line (`'move:   N   S   E   W'` in
  `drawChrome()`) would need to change in lockstep with whichever is chosen.
- **Current map scale**: both `GlimmerDeep` and `Whisperwood` in `tile-worlds.js`
  are 15 columns × 9 rows. Per Q2, a single roguelike "screen" runs roughly
  70-80×20-25 characters and a MegaZeux board defaults to a full 80×25 (with headroom
  to 32767×32767); either reference supports growing the current maps by 4-6× in
  each dimension while staying inside a single "screen," or chaining 2-4 linked
  screens (MegaZeux's board-exit model) for a bigger, more explorable whole world.
- **Current glyph vocabulary**: five symbols total (`#` wall, `.`/`·` floor, `@`
  player, `k` companion, `*` goal). Per Q2, both reference families use noticeably
  larger vocabularies (doors, water, terrain variety, treasure/sign tiles) —
  expanding this is flagged as a concrete, low-risk way to make a bigger map read as
  detailed rather than sparse.
- **No fog-of-war/line-of-sight exists in the current engine** — the whole (small)
  map renders at all times. Per Q2's recommendation, this is flagged as the
  single highest-value addition if the map grows, since it's what would make
  discovery feel earned on a larger world rather than the player simply seeing
  everything from the start.
- **NPC/riddle interaction has since shipped** *(update, 2026-07-18 — this line was
  accurate when written on 2026-07-17 but is now stale within a day, per Trevor's
  tile-world redesign landing the same window)*: `js/textworld/tile-worlds.js` now
  has authored, curated (no-LLM) riddle NPCs per world — confirming Q5's precedent was
  acted on essentially as researched: gentle, always-solvable, typed-answer riddles,
  zero cost, zero wrong-answer penalty (hint after 2 tries, answer after 3, per the
  wrong-keypress contract). See [[act6-riddle-bank]] (`research/act6-riddle-bank.md`)
  for a large proposed EXTENSION bank of new logic/word-play riddles (as opposed to
  the shipped riddles' "what am I" creature-identity style) grounded directly in this
  page's Q5 precedent.

## Corrections from citation pass

None — this page extends existing wiki entries with newly-researched facts; no
prior claim on [[roguelike]], [[megazeux]], [[mud]], [[nethack]], [[asciiroth]], or
[[legend-of-the-red-dragon]] was found to be incorrect during this pass.

## Unsourceable / weakly-sourced items

- The exact NetHack level-dimension figures (79×21 max, 80×21 display, 77×19
  typical) are corroborated across several independent official Guidebook version
  mirrors via WebSearch synthesis but were not independently re-fetched and
  re-confirmed as a single directly-read page this session — treat as
  well-corroborated but not individually **[fetched]**.
- MegaZeux's exact default Viewport dimension (80×25) and ZZT's exact maximum
  boards-per-world figure were reported via WebSearch synthesis rather than a
  direct fetch this session; both are plausible and consistent with everything
  independently fetched (the 80×25 default board size, the 60×25 ZZT board size)
  but are flagged as the weaker tier of citation.
- Whether Trevor's own "arrows for the left hand" recollection of WASD's
  intuitiveness maps to any SPECIFIC childhood memory of a game (as opposed to the
  general FPS-era convention) cannot be confirmed or denied by this research —
  only the origin timeline (1990s) itself is sourced.
- No direct causal link between Tolkien's "Speak, friend, and enter" riddle-gate and
  any specific computer adventure game's design was found or fetched this session —
  offered only as the literary root of the general trope, explicitly not as a
  sourced influence claim.
- MegaZeux Deathmatch's multiplayer mechanism (already flagged on [[megazeux]]) and
  the exact ceiling on ZZT boards-per-world remain open questions this session did
  not resolve further.

## References

1. [NetHack 3.6.6 Guidebook](https://www.nethack.org/v366/Guidebook.html) — `[yuhjklbn]` direction table, numpad equivalents, capital-letter continuous run; NetHack level dimensions. **[fetched]**
2. [Vi (text editor) — Wikipedia](https://en.wikipedia.org/wiki/Vi_(text_editor)) — ADM-3A terminal's inscribed arrows on hjkl, Bill Joy's 300-baud/home-row rationale. **[fetched]**
3. [Rogue (video game) — Wikipedia](https://en.wikipedia.org/wiki/Rogue_(video_game)) — Toy/Wichman 1980, hjkl inherited from vi's screen code, `@`/letter-monster/`.`-`|`-`-`+` glyph vocabulary. **[fetched]**
4. [Decoded: Rogue — maizure.org](https://www.maizure.org/projects/decoded-rogue/index.html) — 3×3 grid partition, 4×4–25×7 room sizes, corridor-turn rules. **[fetched]**
5. ["A Guide to the Dungeons of Doom" — Rogue's original manual, FreeBSD docs archive](https://docs-archive.freebsd.org/44doc/usd/30.rogue/paper-notes.html) — primary source, 24×80 minimum screen. **[fetched]**
6. [RogueBasin — User interface features](https://www.roguebasin.com/index.php?title=User_interface_features) — hjkl as roguelike tradition, numpad 8462/7913 layout, Rogue supporting both simultaneously. *(search result only — direct fetch returned 403)*
7. [Angband Manual — Command Descriptions](https://angband.readthedocs.io/en/latest/command.html) — default numpad keyset, alternative roguelike `yuhjklbn` keyset, arrow keys valid in both. **[fetched]**
8. [Ancient Domains of Mystery — Wikipedia](https://en.wikipedia.org/wiki/Ancient_Domains_of_Mystery) — Thomas Biskup, 1994 Linux / Jan 28 1996 DOS-Windows, numpad-centric controls, ASCII rendering. **[fetched]**
9. [MegaZeux 2.93d Help File](https://www.digitalmzx.com/mzx_help.html) — arrow-key movement, element categories, 32767×32767 max board, 250 boards/world, board-exits/viewport mechanics, no fog-of-war documented. **[fetched]**
10. [Board — MZXWiki](https://www.digitalmzx.com/wiki/Board) — 1×1 to 32767×32767 board range, per-board object caps. **[fetched]**
11. MZXWiki Viewport page — default 80×25 viewport dimension, corroborated via WebSearch synthesis. *(search result only, not fetched)*
12. [ZZT — Wikipedia](https://en.wikipedia.org/wiki/ZZT) — Tim Sweeney, Jan 15 1991, four-direction movement, 255-character IBM PC glyph set, 16-color palette, Super ZZT's larger scrolling boards. **[fetched]**
13. [Robotic — MZXWiki](https://www.digitalmzx.com/wiki/Robotic) + corroborating community summaries — `GO [dir]` robot-movement command accepting `NORTH`/`SOUTH`/`EAST`/`WEST`/`N`/`UP`/etc. synonyms. *(search result only, not fetched)*
14. [Board — Wiki of ZZT](https://wiki.zzt.org/wiki/Board) — 60×25 board size, non-reciprocal edge-linking. **[fetched]**
15. [Doctor Kildeer's Guide to NetHack — Map Features](https://www.alt.org/nethack/mirror/www.geocities.com/TimesSquare/Portal/2416/map.html) — glyph vocabulary, lit/dark line-of-sight, floor-memory-fade mechanic. **[fetched]**
16. NetHack maximum/typical level dimensions (79×21 max, 80×21 display, 77×19 typical), corroborated across multiple official NetHack Guidebook version mirrors (v3.6.x, v5.0.0) via WebSearch synthesis. *(search result only — this specific figure was not independently re-fetched this session beyond the movement-focused fetch of reference 1)*
17. Multiple corroborating accounts of WASD's history — [How WASD became the standard PC control scheme — PC Gamer](https://www.pcgamer.com/how-wasd-became-the-standard-pc-control-scheme/), [Gamers WASD Keys History — xahlee.info](http://xahlee.info/kbd/wasd_key.html), [WASD Keys History — neoteo.com](https://www.neoteo.com/en/why-gamers-use-wasd-history) — all converge on the same Wolfenstein/Doom-arrow-keys → Thresh/Quake-1997 → Half-Life-1998 timeline. *(search result only — none independently fetched successfully this session; PC Gamer returned only nav-menu content, xahlee.info returned a TLS error — treat as multi-source-corroborated search synthesis rather than a single directly-read primary account)*
18. [Zork — Wikipedia](https://en.wikipedia.org/wiki/Zork) — 1977-1979 MIT timeline, compound-command parser, the Loud Room "echo" puzzle. **[fetched]**
19. [Colossal Cave Adventure — Wikipedia](https://en.wikipedia.org/wiki/Colossal_Cave_Adventure) — one/two-word parser, single-letter compass abbreviations becoming "standard in interactive fiction titles," 1976/1977 Crowther/Woods timeline. **[fetched]**
20. [NetHack Home Page (nethack.org)](https://www.nethack.org/) — "the Oracle speaks with utmost clarity" tagline confirming the Oracle as documented, primary game content. **[fetched]**
21. NetHack Wiki pages ("Oracle (monster)," "Chat," "Zorkmid," "List of major consultations") — `#chat` mechanic, zorkmids payment, minor/major consultation structure, Pythia/Delphi basis. *(search result only — nethackwiki.com returned 403/402 to direct fetch this session, same access issue already noted on [[nethack]])*
22. [Doors of Durin — Tolkien Gateway](https://tolkiengateway.net/wiki/Doors_of_Durin) and [Doors of Durin — The One Wiki to Rule Them All](https://lotr.fandom.com/wiki/Doors_of_Durin) — the "Speak, friend, and enter" riddle-gate literary precedent. *(search result only, not fetched)*

[[mud]] and [[legend-of-the-red-dragon]] carry their own already-verified reference
lists for the MUD/BBS-door claims cited above — not duplicated in this list.

## See also

[[roguelike]], [[nethack]] — the hjkl/yubn/numpad movement family and its dungeon
scale/glyph vocabulary. [[megazeux]] — the arrow-key, large-board, rich-tile-
vocabulary family this page's Q2 leans on most heavily. [[mud]] — the typed-compass-
command family Q4 grounds. [[asciiroth]] — the adjacent hobbyist single-player ASCII
realm, aesthetically similar but not separately re-researched here.
[[legend-of-the-red-dragon]], [[bbs-door-games]] — the lettered-menu (non-directional)
contrast family. [[zork]], [[colossal-cave-adventure]] — the typed-command/parser
lineage Q4 and Q5 both draw on. `.claude/rules/theme-authoring.md` — the game's own
era-fidelity discipline this page's Q3 finding (WASD is anachronistic here) directly
supports. `docs/features/text-worlds.md` — the current implementation this page's
downstream flags describe (code-graph page, not edited by this agent).
