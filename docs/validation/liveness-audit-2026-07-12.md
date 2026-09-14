# Mechanics-Fidelity & Liveness Audit — 2026-07-12

> # ⚠️ SUPERSEDED. DO NOT CITE THIS DOCUMENT'S FINDINGS AS CURRENT.
>
> **Every theme this audit scored was rewritten six days after it was written.** Commit
> `9ca6932` (2026-07-18, "era-progressive theme graphics") substantially rewrote **20
> theme files** — including every level scored WEAK here: Pac-Man, Tetris, Sonic, Street
> Fighter II, GoldenEye and Out Run. Sonic gained 399 changed lines, Donkey Kong Country
> 673, and the diff adds the exact thing this audit said was missing:
> *"DK RUNS through the world — a weighty knuckle-lope that actually translates"*,
> `dkVX`, `dkPhase`, `dkBob`.
>
> **Re-verified 2026-09-13** by typing 40 keystrokes and capturing time-separated frames:
> **Level 11's Sonic moves** in a spin attack with afterimage trails and speed streaks,
> and **Level 14's Kong runs** with a visible lope cycle, bananas and a shadow. Both are
> the opposite of what this document records.
>
> **This document is kept for its RUBRIC and its METHOD, which are good, and as the record
> of a real moment. Its per-level verdicts are history.**
>
> **Status of every WEAK verdict, re-checked 2026-09-13:**
>
> | Level | July verdict | Now |
> |---|---|---|
> | 3 Pac-Man | "all four ghosts render as the same pale blue" | **FIXED.** Verified personally: outside the frightened window the ghosts are red/pink/cyan/orange, matching the wiki. `GHOST_COLORS` was always correct; the bug was that a power pellet fired on EVERY pattern completion, and early patterns are 1-2 keys, so they were blue almost constantly. `pacman.js` now frightens every 4th completion and says so in a comment. Blue ghosts are correct Pac-Man behaviour *during* that window. |
> | 8 Tetris | "pieces vanish rather than stack" | **FIXED 2026-09-13.** The stack always worked — the whole well was drawn at dead centre, behind the prompt panel and keyboard guide. Moved to the left margin. Journal F30. |
> | 11 Sonic | "no speed/motion despite speed being the sourced core pillar" | **FIXED.** Verified personally: spin attack with afterimage trails and speed streaks. Journal F31. |
> | 14 Donkey Kong Country | "the protagonist sprite does not move at all" | **FIXED.** Verified personally: runs with a lope cycle, bananas, shadow. Journal F31. |
> | 12 Street Fighter II | "no fight at all, decorative-motion-only" | **Re-scored STRONG** by a 2026-09-13 audit lane with mid-play and victory frames: two fighters, health bars, a FIGHT!/K.O./YOU WIN sequence with a genuine pose change between frames. Not personally re-verified. |
> | 21 Out Run | "fully static road" | **Re-scored fine** by a 2026-09-13 lane: victory frames show the car driving forward and the sun panning. Not personally re-verified mid-play. |
> | 17 GoldenEye | "no player characters, no weapons, no visible shooting" | **RESOLVED 2026-09-14 — and JULY WAS RIGHT.** Two later audits disagreed because they were scoring different things: one saw a faithful split-screen LAYOUT and called it STRONG. Trevor broke the tie by naming what the mode was actually FOR — four players in ONE arena, seeing and reacting to each other. The theme had four quadrants showing four DIFFERENT levels, which is four people playing alone side by side. Rebuilt: one shared arena, every quadrant drawing all four agents with name tags, features to explore (grate, stairs, cells, silo), and a proximity beat when two players meet. |
>
> **Why this warning is this loud:** on 2026-09-13 a fresh audit lane scored Sonic and DKC
> WEAK from idle-and-victory frames only — it never typed — and then found this document
> and cited it as corroboration. A stale finding confirmed a wrong fresh one, and two
> wrongs read as certainty. Journal **F31**.


Read-only scene audit of Levels 1–5, 8, 9, 11, 12, 14–25 (21 levels). **Levels 6, 7, 10, 13
are EXCLUDED — mid-rework by other agents at audit time (donkeykong.js, dragonlair.js,
zelda.js, myst.js).** This audit does not touch any js/ or css/ file; it is evidence for
upgrade agents to act on.

## Context and rubric (superseding the original ALIVE/RESPONSIVE-ONLY/DEAD brief)

Trevor's playtest, 2026-07-12: Tetris pieces didn't fall; Donkey Kong "doesn't even move,
and vines just show up near him — there isn't much of a game being played" (vines are also
the wrong game — DK Jr, not DK 1981). Both shipped because static screenshots can't
distinguish a rendered scene from a playing one.

Per orchestrator direction, the verdict is now **game-mechanics fidelity**, with liveness as
the evidence layer, not the verdict:

- **STRONG** — the original's documented signature mechanic is visibly operating on screen.
- **WEAK** — things move, but what happens is not representative of how the original
  actually played (ambient/decorative motion standing in for the mechanic, or wrong-game
  elements).
- **NONE** — not much happening at all (static scene, no mechanic visible).

**Grounding rule enforced in this pass:** every "original's signature mechanic" claim below
is sourced from `research/wiki/games/*.md` and/or `research/arcade-cabinets-by-era.md`
(which carries an explicit "Gameplay Objective" field for the arcade titles) — never from
model memory. Where a game's wiki page does **not** document its gameplay loop in comparable
detail, the row is marked **"wiki gap"** and the level is listed in the Wiki Gaps section
below rather than scored against an unsourced mechanic description.

## Method

For each level: `scripts/kk-playwright.js` (`goToLevel`) navigation to the game screen, then
canvas-signature sampling (`#invaders-canvas.toDataURL()` → sha1, isolates theme motion from
CSS/CRT overlay effects) at ~1s intervals for 6s idle, 4 correct keystrokes at ~600ms spacing
(read from the live `.prompt-letter.active` DOM element), 4 more seconds of idle sampling,
plus 3 full screenshots (idle-start, mid-idle, after-keys) per level for the eyeball pass.
Own static server on port 8110; own browser instance, one at a time. No wins attempted, no
recorder runs — this is a scene audit, not a winability audit.

Canvas-hash summary: **every in-scope level's canvas hash changed continuously during the
idle window** (6/6 unique samples) **except Level 25** (1/6 unique — a static
word-processor page by design, see below). Every level's 4 keystrokes produced 4 distinct
canvas hashes (engine input is being received and rendered in all cases) — the audit finding
is about what that motion/response actually depicts, not whether the canvas updates at all.

Artifacts: `/private/tmp/claude-501/-Users-trevormack-dev-keystroke-kingdom/656c2989-19a9-479e-834e-87edec6c3c19/scratchpad/liveness-audit/L<NN>/` — `idle-start.png`, `mid-idle.png`,
`after-keys.png`, `result.json` (hashes + console errors) per level.

---

## Results table

| Lvl | Game | Original's signature mechanic (source) | What our theme actually does | Keystroke response | Verdict |
|---|---|---|---|---|---|
| 1 | Breakout | "Bounce a ball off a paddle into a wall of bricks to destroy them all." (`arcade-cabinets-by-era.md` Gameplay Objective) | Ball visibly bouncing continuously; brick rows visibly thinning between frames (top row went from 6 bricks to 4); streak 0→4 on keypresses | Immediate — streak counter and brick state changed within the keystroke window | **STRONG** |
| 2 | Space Invaders | "Eliminate all aliens in the formation by shooting them before they reach the bottom." Formation marches, speeds up as aliens die (`arcade-cabinets-by-era.md`; `wiki/games/space-invaders.md`) | Full-color invader formation marches/shifts position continuously; an invader explosion visible mid-formation; player cannon moves; streak 0→4 | Immediate | **STRONG** |
| 3 | Pac-Man | "Eat all 240 dots in the maze while avoiding four ghosts. Power Pellets temporarily make ghosts vulnerable (they turn blue)." Ghosts are **distinctly colored**: red Blinky, pink Pinky, cyan Inky, orange Clyde (`arcade-cabinets-by-era.md`; `wiki/games/pac-man.md`) | Pac-Man and ghosts move; a cherry bonus-fruit appears — but no dot-eating is visible (only maze-wall squares, no pellets), and all four ghosts render as the **same pale blue**, not the four distinct colors the wiki documents | Streak 0→4, positions changed | **WEAK** — motion present but the core "eat dots, avoid 4 distinctly-colored ghosts" mechanic isn't visibly operating; **fidelity flag**: ghost palette contradicts the wiki's explicit red/pink/cyan/orange spec |
| 4 | Galaga | "Destroy all aliens in each wave. Aliens fly in from the top/sides into formation, then dive-attack." (`arcade-cabinets-by-era.md`) | Rainbow formation rows visibly thin (invaders destroyed between frames); one green enemy breaks formation, appearing below/outside the main block (dive-attack pose); player ship moves; streak 0→4 | Immediate | **STRONG** |
| 5 | Joust | "Joust rival knights by colliding with them while positioned higher on-screen... Survive waves of enemy Bounder, Hunter, and Shadow Lord knights. Avoid the lava." (`arcade-cabinets-by-era.md`) | Knight visibly flies/walks from far-left platform to far-right platform across the sample window; buzzard enemies change platform position; lava glows; score 000000→000650 | Immediate | **STRONG** |
| 8 | Tetris | "Rotate and position falling tetromino pieces to complete horizontal lines without gaps. Completed lines disappear... game ends when pieces stack to the top." (`arcade-cabinets-by-era.md`, Tetris 1988 arcade row) | A cyan T-piece visible at the top of the well in idle-start **has vanished with nothing landed or stacked** by mid-idle (6s later, board totally empty); after 4 keystrokes, "LINES 0/4→1/4" and a magenta piece appears at the bottom alongside scattered stray colored dots (not a clean stack) | Words/score/lines counters do increment on keypress | **WEAK** — counters track progress, but the piece that should fall-and-land visibly disappears instead of visibly stacking; this is close to (but distinct from) Trevor's original "pieces didn't fall" report — the piece IS gone (something happens) but not in a way that reads as landing/stacking, and the mid-idle empty board plus scattered dots after typing reads as pieces despawning rather than accumulating |
| 9 | Super Mario Bros | "side-scrolling platformer" (wiki only phrase found; **no explicit run/jump gameplay-loop description located** — see Wiki Gaps) | Mario visibly walks from one screen position into direct collision with a Goomba over the idle window (position changes confirmed frame-to-frame); clouds drift; flagpole flag animates from vertical to raised; score 0→400 on keypresses | Immediate | **STRONG** against the observable "run/traverse the world, collide with enemies" behavior, but scored against a **wiki gap** — no sourced description of SMB's actual platforming loop (jumping, stomping, power-ups) to verify against; flag for arcade-historian follow-up |
| 11 | Sonic the Hedgehog | "made speed itself the core design pillar" — Naka's curved-movement algorithm "to let Sonic move faster... while staying readable" (`wiki/games/sonic-the-hedgehog.md`). **No sourced description of rings/loops/momentum-platforming as a concrete mechanic** — see Wiki Gaps | Rings counter 0/20→4/20 (rings visibly collected — several ring sprites disappear between frames); badnik enemies reposition; Sonic's sprite itself shows only a small position drift (~25px) over the full sample window — no visible fast-running motion or speed blur | Immediate (ring count) | **WEAK** — ring-collection is present and correct as a mechanic, but the wiki's own documented core design pillar is **speed**, and Sonic is nearly stationary on screen; the one attribute the source material calls out explicitly is the one most absent |
| 12 | Street Fighter II | "One-on-one fighting. Drain opponent's health bar or have more health when time expires." (`arcade-cabinets-by-era.md`) | Both fighters and both health bars are **pixel-identical** between idle-start and after 4 correct keystrokes (streak 0→4) — no attack animation, no health-bar depletion, no hit reaction of any kind; only ambient crowd/torch flicker changes the canvas hash | Streak counter increments; nothing else visibly changes | **WEAK**, bordering **NONE** for the mechanic itself — this is the clearest "vines" pattern in the set: motion exists (canvas hash changes every sample) but none of it is the fight; matches the DK complaint pattern exactly |
| 14 | Donkey Kong Country | **No sourced description of DKC's platforming/jumping/barrel-rolling gameplay loop** — the wiki page documents the SGI pre-rendered-3D pipeline in depth but not the play mechanic itself; the excluded Level 6 (`donkey-kong`, 1981) DOES have a sourced Gameplay Objective ("climb...jump over obstacles...use hammers...remove rivets") but that is a **different game** and not transferable — see Wiki Gaps | The gorilla-headed character is in the **exact same pixel position** across the full 6s+ idle window and after 4 keystrokes (only a moon/shading element shifts slightly); a cannon/barrel prop is likewise static; banana counter 0/22→4/22 on keypress | Counter only; character does not move | **WEAK/NONE** — matches the "doesn't even move" pattern Trevor flagged for the sibling DK level; scored primarily on liveness since no sourced DKC-specific mechanic exists to compare against — flag for arcade-historian follow-up on DKC's actual play loop, then a fidelity re-check |
| 15 | Pokémon Red/Blue | **No sourced description of the turn-based battle mechanic** in `wiki/games/pokemon-red-blue.md` (page covers development history only) — see Wiki Gaps | Pikachu's HP bar visibly depletes (~100%→~85%) between frames; battle text box updates ("Wild PIKACHU appeared!" → "It's super effective!"); sprites themselves are static (consistent with a menu/text-driven battle, which is how Pokémon battles are commonly known to work, but that specific claim is not in the cited wiki page) | Immediate (HP bar, text) | **STRONG** as observed, but the "turn-based battle" comparison point is a **wiki gap** — flagging rather than asserting from memory |
| 16 | SimCity 2000 | "introduced isometric city-building... underground infrastructure layers" (`wiki/games/simcity-2000.md`) — city-building confirmed, but no explicit "gameplay objective" sentence comparable to the arcade table | Buildings visibly change: a yellow high-rise becomes two smaller tan buildings on one lot; a new purple building complex appears on a previously-smaller lot; "ZONES 0/25→4/25" with progress bar filling | Immediate | **STRONG** against the sourced "isometric city-building" description |
| 17 | GoldenEye 007 | "credited with setting the standard for multiplayer console combat... famous four-player split-screen mode" (`wiki/games/goldeneye-007.md`) — split-screen confirmed; **no sourced description of the FPS shooting/mission mechanic itself** — see Wiki Gaps | Four-quadrant split-screen radar-style display labeled P1–P4 with real GoldenEye level names (Facility, Archives, Surface, Temple); "TARGETS 0/25→4/25"; a small pickup/target icon appears near one quadrant | Immediate | **WEAK** against the sourced split-screen fact alone — the split-screen structure is faithfully represented, but there are no player characters, no weapons, no visible shooting, so the FPS combat itself (GoldenEye's actual gameplay) is not depicted; partially a wiki gap since the shooting mechanic isn't sourced to confirm against, but the absence of any character/shooting representation is visible regardless |
| 18 | Age of Empires | "one of the first history-themed... real-time strategy games" (`wiki/games/age-of-empires.md`) — RTS genre confirmed; **no sourced description of the resource-gathering/unit-building loop specifically** — see Wiki Gaps | New small unit sprites appear on the map between frames; four resource counters (wood/gold/food/stone-style, labeled with single letters) each increment 0→1; "...PIRE 0/25→4/25" progress bar | Immediate | **STRONG** against the general "RTS" genre fact (units + resources appearing is representative of RTS play), though the specific AoE loop is a **wiki gap** |
| 19 | Final Fantasy VII | "numbers as drama and stakes, via HP/MP bars" (act5.md act-file description, not a wiki source — flagged); wiki page documents dev/production facts only, **no battle-mechanic description** — see Wiki Gaps | Sephiroth's HP bar and number visibly deplete (999/999 → 850/999) with a floating "44" damage number popping up on a keystroke; hits counter 0/25→4/25; ATB gauge changes | Immediate | **STRONG** as observed (HP depletion + damage numbers is a recognizable JRPG battle convention), but the specific "FF7 uses ATB/turn-based combat with HP/MP" comparison is a **wiki gap** — the act-file's own framing ("numbers as drama") is design language, not a sourced gameplay claim, so it cannot itself ground the verdict |
| 20 | Terminal / command line | N/A — not a licensed game; a "terminal" concept level (act4.md) | Terminal echoes new lines of scrolling text as keys are typed ("SYSTEM READY" / "TYPE TO CONTINUE..." → new lines "11" and "LOG: OK1" appended, cursor blinks) | Immediate | **STRONG** — faithfully represents its own stated concept (a terminal you type into); no external wiki mechanic to compare against since this isn't a licensed game |
| 21 | Out Run | "Reach the finish line before the timer expires. At each stage's end, the road forks — choose your route." (`arcade-cabinets-by-era.md`) — fundamentally a **driving/scrolling-road** game | The road, car, sun, and roadside silhouette are **pixel-identical** across the full idle window (6s+) and remain unchanged through 4 correct keystrokes; only "DISTANCE 0/30→4/30" counter changes | Counter only; no visual driving motion | **WEAK/NONE** — for a game whose entire visual identity is a scrolling road rushing toward the player, a static road is close to definitionally the opposite of Out Run; matches the DK "doesn't move" pattern |
| 22 | Q\*bert | "Hop Q\*bert across all 28 cubes in the pyramid to change them to the target color. Avoid enemies descending the pyramid." (`arcade-cabinets-by-era.md`) | The orange hopping character visibly moves down a diagonal, and a full diagonal strip of cubes changes from teal to orange (color-changed) between frames; a purple enemy (Coily-like) repositions; "CUBES 0/28→4/28" | Immediate | **STRONG** — precise match to the sourced hop-and-recolor mechanic |
| 23 | Missile Command | "the player uses a trackball... to defend six cities from ICBMs launched from three bases" (`video-game-history.md`, Missile Command sourced entry) — our version is a documented reimagining where cities cannot be destroyed (act5.md, explicit no-punishment adaptation) | Incoming missile trails visible from the top of the screen; green intercept lines with impact markers appear between frames; city skyline along the bottom is intact in both frames; "SAVED 0/28→4/28" | Immediate | **STRONG** — matches both the sourced original mechanic (intercepting ICBMs before they reach cities) and the documented no-punishment reimagining (cities always survive, tracked as "SAVED" not "DESTROYED") |
| 24 | High Score Entry (own concept, not a licensed game) | N/A — arcade high-score-table convention, not a specific title | Rank-1 score slot changes from placeholder ("— — —") to "99999" as the player's name is entered; "ENTRY 0/24→4/24" | Immediate | **STRONG** — faithful arcade high-score-table convention |
| 25 | Word Processor (own concept, not a licensed game) | N/A | Idle canvas is **completely static for the full 6s+ idle window** (1/6 unique hash) — appropriate, since a word processor has no ambient motion by design; typed text appears on the page and Backspace visibly removes it ("j" → "jf" → "j" after backspace), "WORDS 0/30→4/30" | Immediate and correct (typed text, deletion both visible) | **STRONG** for what it is — a word processor is expected to be idle-static; this is a deliberate design choice, not a liveness bug. Flagging only that this is the one level where "no ambient motion" is the *correct* answer, so it should not be swept up by any blanket "add idle animation" follow-up |

---

## Summary counts

- **STRONG:** 1 (Breakout), 2 (Space Invaders), 4 (Galaga), 5 (Joust), 9 (Super Mario Bros, wiki-gap-qualified), 15 (Pokémon, wiki-gap-qualified), 16 (SimCity 2000), 18 (Age of Empires, wiki-gap-qualified), 19 (FF7, wiki-gap-qualified), 20 (Terminal), 22 (Q\*bert), 23 (Missile Command), 24 (High Score Entry), 25 (Word Processor) — **14 of 21**
- **WEAK:** 3 (Pac-Man — ghost palette fidelity flag), 8 (Tetris — pieces vanish rather than stack), 11 (Sonic — no speed/motion despite speed being the sourced core pillar), 12 (Street Fighter II — no fight at all, decorative-motion-only), 17 (GoldenEye — split-screen structure present, no shooting/characters), 21 (Out Run — fully static road) — **6 of 21**
- **NONE:** 0 outright, though 12 (SFII) and 21 (Out Run) are WEAK bordering NONE for the mechanic itself
- **Console errors (non-404):** none in the final, stable samples. Level 17 threw one transient `Identifier 'JUMP_FRAMES' has already been declared` pageerror on a single early sample — traced to `donkeykong.js` (owned by another concurrently-editing agent, imported by the shared `js/themes/index.js` registry) being mid-save when the page loaded; re-running the same sample immediately after showed a clean load and normal motion. Not a GoldenEye bug — noted here only so it isn't mistakenly re-investigated as one.

## Priority fix list (worst first)

1. **Level 12 — Street Fighter II**: no fight happens at all. Health bars and fighter poses are byte-identical before and after correct keystrokes. This is the starkest "vines" case in the set — a decorated static image, not a fighting game.
2. **Level 21 — Out Run**: the road, car, and scenery are completely frozen for the entire sample window. A driving game with a non-scrolling road is close to a contradiction in terms.
3. **Level 14 — Donkey Kong Country**: the protagonist sprite does not move at all across 6+ idle seconds or after keystrokes; only a background element shifts. Same "doesn't move" pattern Trevor already flagged on the sibling DK (Level 6, excluded from this pass but instructive).
4. **Level 8 — Tetris**: improved since Trevor's original report (lines/words/score all track correctly now), but the falling piece visibly disappears between idle samples rather than landing and stacking — the board is empty at 6s despite a piece having been visible at 0s, and only scattered/disconnected blocks appear after keystrokes. Worth a focused look at whether pieces are actually landing in the well or being discarded.
5. **Level 11 — Sonic**: ring collection works, but Sonic himself barely moves, and the wiki's own explicit description of the game centers speed as the core design pillar — the one thing that's absent.
6. **Level 17 — GoldenEye**: the split-screen radar structure is a nice touch, but there is no character, weapon, or shooting represented — currently reads as an abstract HUD demo rather than an FPS.
7. **Level 3 — Pac-Man**: fidelity-only flag. Motion and dot-adjacent gameplay both check out, but all four ghosts render in the same pale blue instead of the wiki's explicitly documented four distinct colors (red Blinky, pink Pinky, cyan Inky, orange Clyde).

## Wiki gaps (arcade-historian follow-ups needed)

The following games' wiki pages (`research/wiki/games/*.md`) document developer/technical/
historical facts thoroughly but do **not** describe the actual gameplay loop/mechanic in
comparable detail to the "Gameplay Objective" field `research/arcade-cabinets-by-era.md`
carries for the arcade-era titles. Per the coordinator's explicit instruction, these rows
were scored only against what IS documented (or left unscored where nothing usable exists),
not filled from model memory:

- **Super Mario Bros** (Level 9) — no sourced run/jump/stomp/power-up mechanic description.
- **Sonic the Hedgehog** (Level 11) — "speed as core design pillar" is sourced, but no
  sourced description of rings, loops, or the actual momentum-platforming mechanic.
- **Donkey Kong Country** (Level 14) — page covers the SGI pre-rendered-3D pipeline in depth,
  nothing on the platforming/barrel-rolling gameplay itself.
- **Pokémon Red/Blue** (Level 15) — no sourced description of the turn-based battle system.
- **GoldenEye 007** (Level 17) — split-screen fact is sourced; the FPS shooting/mission
  mechanic is not.
- **Age of Empires** (Level 18) — RTS genre is sourced; the specific
  resource-gathering/villager/unit-building loop is not.
- **Final Fantasy VII** (Level 19) — no sourced battle-system description (ATB, HP/MP combat
  mechanics). Note: `.claude/rules/levels/act4.md` describes "numbers as drama and stakes,
  via HP/MP bars" — this is internal design language, not a wiki/research citation, and per
  the coordinator's direction the act file cannot itself ground a mechanics verdict where the
  wiki is silent.

Recommend dispatching `arcade-historian` against these seven titles specifically for their
core gameplay-loop mechanic (not developer/tech history, which is already well covered), so
future fidelity audits have a citable comparison point instead of a gap.

## Act-file vs. wiki discrepancies

None found. Where both `.claude/rules/levels/actN.md` and a wiki page describe the same game,
their claims agreed in every case checked (era, palette, key assignment, general visual
description). The act files simply don't carry gameplay-mechanic claims at the level of
detail this audit needed, which is why the wiki gaps above exist as a separate category
rather than a contradiction.

## Notes on scope and process

- Levels 6 (Donkey Kong), 7 (Dragon's Lair), 10 (Zelda), 13 (Myst) were never loaded or read,
  per instructions — they are mid-rework by other agents.
- No `js/` or `css/` file was edited. No `git commit`, no `go build`. Own static server on
  port 8110 (`python3 -m http.server 8110 --directory /Users/trevormack/dev/keystroke-kingdom`),
  one browser instance at a time throughout.
- Sampling script: `/private/tmp/claude-501/-Users-trevormack-dev-keystroke-kingdom/656c2989-19a9-479e-834e-87edec6c3c19/scratchpad/liveness-audit/sample.js` (scratch tooling, not
  committed to the repo).
