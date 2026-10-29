---
feature: level-themes
code: [js/themes/]
rules: [.claude/rules/theme-authoring.md, .claude/rules/levels.md, .claude/rules/levels/act5.md]
screenshots: docs/screenshots/levels/
capture: node docs/screenshots/capture-all.js
verified: 2026-10-29 (L19 + L20 victory celebrations)
---

# Level Themes

25 canvas modules under `js/themes/`, one per level, registered in `js/themes/index.js`'s
`Themes` map (`{ 1: Breakout, 2: Invaders, ... 25: WordProcessor }`) and dispatched via
`activeTheme(level)`/`stopAll()`. Full authoring rules (layout contract, canvas
discipline, win-gate pitfalls, security boundary): `.claude/rules/theme-authoring.md` —
this page documents what's actually implemented, not the authoring checklist itself.

## The module contract

Every theme exports the same six functions, called from [[engine-flow]]'s
`handleGameKey`/`startGame`/`showLevelComplete`:
- `start()` — grabs `#invaders-canvas`, sizes it, resets internal state, begins its own
  `requestAnimationFrame` loop.
- `stop()` — halts the loop, clears the canvas.
- `keystroke(key)` — called on every correct keypress; the visible, immediate reward
  (theme-authoring.md: within 1-2 seconds of a keystroke).
- `miss()` — called on every wrong keypress; gentle/ambient at most, never punishing
  (some themes, e.g. `highscore.js`, `wordprocessor.js`, implement this as a no-op).
- `patternComplete()` — called once per completed word/pattern; returns a boolean, and
  **once true it must stay true on repeated calls** ("won stays won" — the engine may
  re-ask). This return value is one half of the level-completion gate in
  [[engine-flow]] (the other half: minimum pattern count, and — where present — the
  history-card gate).
- `victory()` — called once when the level is confirmed complete; typically switches
  the theme into a celebratory idle/victory-loop render mode. May return its
  celebration's duration in ms — [[engine-flow]]'s `showLevelComplete` uses this to
  land the LEVEL COMPLETE card right as the animation finishes (clamped 1200-6000ms;
  a missing/non-finite return falls back to a fixed 4000ms hold). All 25 themes now
  export this.

All 25 themes draw exclusively on the shared `#invaders-canvas` — never their own
canvas element — so `stopAll()` (called before every `theme.start()`) can reliably
clear whichever theme was previously active.

## The `getWinRatio()` contract (EXPERIENCE, landed 2026-07-12)

A theme with its own internal win target (a counter separate from the engine's
`patternsCompleted`) MUST import `getWinRatio()` from `js/settings.js` directly —
never read the settings object itself, never cache the ratio across `start()` calls —
so the theme's internal target and the engine's `minPatterns` gate (see
[[engine-flow]]) always scale together under the same live setting. Recompute the
scaled target fresh in `start()`, not at module load, since settings can change
between levels. The contract has one hard rule: **at the default ratio (1x), the
scaled target must be identical to the theme's pre-EXPERIENCE behavior** — EXPERIENCE
is additive tuning, not a new mechanic, matching the settings.js house law ("settings
are toggles, not defaults"). Two current implementations, both verified 1x-identical:
Tetris's `MIN_SEQUENCES` (below) and Q\*bert's `minSequences` extra-word floor. See
[[settings-survival]] for the full tier table (labels, descriptors, values) and the
other themes' consumption is currently limited to these two.

## Layout — "the UI owns the center; the theme owns the frame"

The fixed DOM UI (prompt panel, keyboard guide, HUD badges) permanently reserves the
center of the screen. Themes compose focal art in the side margins, top band, the
~0.43-0.49H gap band, and the bottom strip — full measured fractions in
`.claude/rules/visual-validation.md`. Ambient fill (sky, walls, starfields) may
continue behind the panels; nothing the player must *see* may live there. This
contract was retrofitted across ten themes in a 2026-07-11 rework after screenshot
review found focal art buried behind the prompt panel.

## Tetris (Level 8) — the flagship win-gate example, redesigned 2026-07-12

`js/themes/tetris.js` is the most heavily documented theme in-file (891 lines as of
2026-09-13; the file was already 890 lines by 2026-07-18, so the page's prior "852
lines" figure was stale independent of any 2026-09-13 change) and the
canonical worked example of the win-gate pitfall. Its win condition is a **conjunction
with a guaranteed reachable moment**:

```
WIN = (completed sequences >= MIN_SEQUENCES) AND (rows cleared >= MIN_ROWS) AND the
      current placement just cleared a row.
```

`MIN_SEQUENCES` is `BASE_MIN_SEQUENCES` (8) scaled by the EXPERIENCE setting —
`MIN_SEQUENCES = Math.ceil(BASE_MIN_SEQUENCES * getWinRatio())`, recomputed fresh in
`start()` — the primary, binding constraint on the win condition at any ratio (see
the `getWinRatio()` contract above and [[settings-survival]]). At the default 1x this
is exactly 8, matching pre-EXPERIENCE behavior byte-for-byte. `MIN_ROWS` is a fixed 4
(spectacle pacing, never scaled by EXPERIENCE — see the contract above).

Rationale (from the file's own header comment): "the winning moment is always a line
clear" — never a bare piece-lock — so completion reads as a satisfying game-objective
beat, not an arbitrary counter hitting zero. Implementation:
- Only two tetrominoes are used — the I (4-wide) and O (2×2 square), the only shapes
  that tile a 10-wide row with no rotation and no holes (`4+4+2=10`).
- `pickNextShape()` chooses I vs O based on the current "fill-line" (the lowest
  incomplete row's run of matching-height columns), so rows actually complete instead
  of stalling on an unfillable gap.
- Placement has two modes: normal play biases toward organic-looking (occasionally
  imperfect) fill order; once both minimums are within one row of being met, placement
  turns **eager** — it biases toward completing the next row so the winning clear
  arrives promptly rather than stalling indefinitely.
- **Adventure vs Survival diverge on overflow**: `readSurvival()` reads `kk-settings`
  directly (read-only, tolerates garbage) — the one datum this theme needs from
  outside. In Adventure, `maybeWipe()` clears the top few settled rows before the well
  tops out, framed as ambient maintenance, never failure. In Survival, the wipe never
  fires — the authentic stack-pressure tension is preserved.
- `drawNextPiece()` shows an accurate preview of the actual next-spawning piece (not a
  decorative placeholder).
- `hasWon` latches permanently once the conjunction is satisfied on a clearing
  placement — satisfies the "won stays won" contract even though `patternComplete()`
  is called again on every subsequent completed word that session.

This redesign replaced an earlier version that spawned every piece at a fixed center
column with no horizontal movement — a full 10-wide row was geometrically impossible,
so Level 8 could never end (a One Rule violation, caught by the full-game recorder).
The old failure mode and the new design are both documented inline in the file — read
it directly if debugging a similar reachability issue in another theme.

### Continuous gravity (added post-redesign, same 2026-07-12 pass)

Following a Trevor playtest, the piece is no longer a glyph that teleports on
keystroke — it releases from the top and **falls continuously** via
`performance.now()`-based deltas (frame-rate independent): `FALL_MS_PER_CELL` (650ms,
era-authentic rest pace) governs vertical descent, `DRIFT_MS_PER_STEP` (130ms) governs
lateral drift one column at a time toward the piece's chosen `targetX` — mimicking a
player tapping left/right. A correct keystroke (`keystroke()`) shaves `NUDGE_FALL_MS`
(90ms) off the fall clock and nudges one lateral step; completing a full letter
sequence (`patternComplete()`) still fast-drops and locks the piece immediately, as
before. A slow typist's piece lands organically wherever gravity/drift left it — no
punishment, ever.

The **engagement gate** (journal L20) lives here at the theme level: `maybeRelease()`
only releases a new on-deck piece if a keystroke arrived within the last
`ENGAGEMENT_MS` (10s); an in-flight piece is allowed to finish falling and lock, but an
unattended tab never spawns, stacks, or wipes further on its own. `RELEASE_DELAY_MS`
(700ms) adds a small breathing gap after a lock before the next piece is eligible.

### Victory: the Game Boy Tetris rocket launch

`victory()` returns `VICTORY_MS` (3500ms, clamped by the engine to 1200-6000 —
[[engine-flow]]'s `showLevelComplete` timing contract). *(2026-09-11: comment-only
correction in `tetris.js` — its header still claimed the engine "currently ignores the
return value; a follow-up will consume it." The engine has consumed it since
2026-07-12; the code was always correct, only the comment had rotted. No behavior
change, and the Level 8 reference frame was NOT regenerated.)* Two phases, both driven by
clamped elapsed-time math (never raw frame counters — the F1 sentinel-frame crash
class this file's comments explicitly guard against): Phase 1 (~900ms,
`VICTORY_CLEAR_MS`) flashes and erases the board bottom-up; Phase 2 (remaining
~2.6s) lifts a small blocky pixel rocket off the well floor with a bounded
(≤90-particle) exhaust-trail pool, easing in from ignition to full lift speed.

## Pac-Man (Level 3) — `miss()` ghost double-take (landed 2026-07-13, FINDINGS.md TF-4)

`js/themes/pacman.js` previously had no `miss()` implementation (a no-op gap flagged
by the theme audit). It now gives a single, bounded, comic response grounded in the
game's own iconic mechanic — the power-pellet reversal — rather than inventing new
behavior:

- Finds the **nearest non-eaten ghost** to Pac-Man (Manhattan distance over the
  ghost array; `Infinity`-seeded min-scan, same pattern as the nearest-dot search in
  `patternComplete()`).
- Reverses that one ghost's direction (`(dir + 2) % 4` — the exact flip every ghost
  performs the instant a power pellet is eaten) and sets a `flinch` counter
  (clamped to a max of 24 frames, `Math.min(24, target.flinch + 24)` — cannot
  accumulate across rapid mistakes into a longer or more alarming effect).
- `drawGhosts()` tints a flinching ghost toward the frightened-blue palette for the
  duration of `flinch` (`(flinch % 8 < 4) ? '#5a6cff' : g.color'` — a flicker, not a
  solid color swap), distinct from the real `blue` frightened state that follows the
  every-4th-completion power-pellet moment.
- Touches exactly one ghost, never the win-gate dots, never the letter prompt, and
  self-resolves in well under a second (`flinch` decrements every frame in
  `updateGhosts()`) — nothing punishing, nothing that could stack into chaos under
  repeated misses, matching the theme-authoring rule that `miss()` gets at most a
  gentle ambient response.
- No-ops when `!active || victoryMode`, same guard pattern as every other theme's
  lifecycle-sensitive function.

Grounded in `research/wiki/games/pac-man.md`'s documentation of the power-pellet
chase-reversal as Pac-Man's own signature mechanic — the response is faithful
recreation, not an invented gimmick (matching the house cabinet-art rule).

## Q\*bert (Level 22) — the EXPERIENCE extra-sequence floor

`js/themes/qbert.js`'s base win condition is unchanged from before EXPERIENCE landed:
flip every cube on the isometric pyramid (`flippedCount >= WIN_CUBES_TARGET`). The
EXPERIENCE tier adds an *extra words beyond the pyramid* floor on top of that:

```js
minSequences = Math.round(BASE_EXTRA_SEQUENCES * (getWinRatio() - 1)); // start()
patternComplete(): sequencesPlaced++; return flippedCount >= WIN_CUBES_TARGET
                    && sequencesPlaced >= minSequences;
```

`BASE_EXTRA_SEQUENCES` is 5. At the default 1x, `getWinRatio() - 1 === 0`, so
`minSequences` is exactly 0 and the win condition is byte-identical to
pre-EXPERIENCE Q\*bert (pyramid flip only, no extra-words requirement). Higher tiers
add a rounded multiple of 5 extra completed words on top of the pyramid — same
"more play, never a penalty" law as Tetris's scaling above.

## Act 4 victories — Level 19 (FF7) and Level 20 (terminal), added 2026-10-19

- **`ff7.js` `victory()`** returns `VICTORY_MS = 4200`. A blue FF7-style **VICTORY** results panel
  (header band, double border) slides up from the bottom-right stage (`px ≈ 0.52W`), and three rows
  count up with ease-out: **EXP** → 2970, **AP** → 90, **GIL** → 1997 (the cabinet's year). The HP
  bars are hidden while it plays. Resets in `start()`.
- **`terminal.js` `victory()`** returns `VICTORY_MS = 4800`. The scrolling log is cleared and the
  Level 20 payoff is drawn live: the five binary bytes `01001000 01000101 01001100 01001100
  01001111` type out, then `H E L L O` pop in beneath them in bright green with a bloom, then
  `YOUR FIRST PROGRAM` fades in and a `>` cursor blinks. The binary/H E L L O lines were formerly
  pushed into the scroll log in `victory()`; they are now this animation. Both draw under the
  barrel-glass pass and use explicit `textAlign`/`textBaseline`.

## Act 4 (Levels 16-20) — the shared white rabbit + the Y2K clock (added 2026-09-11)

The five Command Center themes gained two easter eggs; the catalog and design rules
live at [[easter-eggs]] and `.claude/rules/easter-eggs.md`. What matters at the theme
layer is the **sharing pattern**, which is the first of its kind in `js/themes/`:

- `js/themes/terminal.js` exports `resetWhiteRabbit()` / `maybeWhiteRabbit(won)` /
  `drawWhiteRabbit(c, W, H)`, and `simcity.js`, `goldeneye.js`, `ageofempires.js`, and
  `ff7.js` **import them from it** — one rabbit for the whole act rather than five
  copies. This is a theme-to-theme import (not a shared util module) because
  `terminal.js` is already the act's hidden-history host, and it is safe because only
  one theme is ever active at a time, so the single module-level rabbit state cannot be
  contended.
- Wiring is identical in all five: `resetWhiteRabbit()` in `start()`,
  `maybeWhiteRabbit(won)` in `patternComplete()` with the theme's own win boolean (the
  return value discarded — it never gates or delays the win, and each theme's
  `patternComplete()` still returns exactly what it did before), and
  `drawWhiteRabbit(ctx, W, H)` late in `render()`.
- Placement respects each theme's own transforms: `ff7.js` draws it outside the
  battle-camera push-in and `simcity.js` outside the camera bob (so the rabbit crosses
  the real screen, not the moving stage); `goldeneye.js` draws it over the split-screen
  grid; `terminal.js` draws it under the barrel-glass pass.
- It lives at `0.89-0.95H` — the bottom strip, below the keyboard guide's measured
  `0.823H` edge — obeying the layout contract, and its frame-driven position is clamped
  (journal F1).
- `terminal.js` additionally draws the frozen **Y2K clock** (`12/31/99 11:59 PM`) in
  the bottom-right stage corner every frame — a fixed literal via `fillText`, with
  explicit `textAlign`/`textBaseline` (journal L28). Visible in that level's reference
  frame.

**Superseded 2026-10-19 for two themes:** `terminal.js` and `ff7.js` now carry real
`victory()` celebrations (below). Neither egg changes any win gate, any `victory()` duration, or any theme's exported
contract. Only `levels/act4-command-center/20-terminal.png` was regenerated for this
change (the Y2K clock is always on screen); levels 16-19 were **not** re-shot — the
rabbit rolls 1-in-150 at a pattern boundary and is never present in an opening-chrome
frame, so re-capturing them would produce churn with no documented difference.

## Word Processor (Level 25) — the "MY STORY" coda + the `hello world` egg (REDESIGNED 2026-07-28)

`js/themes/wordprocessor.js` renders the "MY STORY" document players accumulate at
Level 25. As of the 2026-07-28 redesign, the level plays its normal pool to the
traditional win target first (unchanged UI), then EXTENDS past it into an earned
**coda** — see [[engine-flow]] "Level 25 finale — the 'MY STORY' coda" for the full
engine-side flow (`js/keyboard-story.js`, `js/keyboard-story-gen.js`,
`js/main.js` `startCoda`/`maybeSignalCoda`). This theme's own responsibilities:

- **`beginFinale(subLens)`.** Called once by `maybeSignalCoda()` the moment the coda's
  first line becomes the active prompt. Breaks the accumulated document to a fresh
  paragraph and switches the theme's render mode to a top-band clamp (above the prompt
  panel) so the coda — a pangram "walk the keyboard" story, a scripted typo-\>Backspace-\>
  correct beat, and the EXPERIENCE-tier manifesto capstone, which can run to 53 lines
  at WIZARD — reads as its own clean scrolling block instead of wrapping behind the
  prompt. `subLens` (the per-line non-Backspace token count for the WHOLE assembled
  coda — story sub-lines, typo beats, and the manifesto lines together) is passed in
  fresh by `js/main.js` on every play, since the coda is now a dynamic, rotating,
  tier-scaled sequence the theme can no longer derive from `js/finale-quote.js` alone
  (a legacy/defensive fallback still exists for a missing `subLens`). This is a
  render-side newline, NOT a typed Enter — themes never gate input
  (theme-authoring.md). `victory()` clears the coda render state for the normal
  centered "THE END." beat.
- **Measured wrap width (fixed 2026-09-11).** `maxCharsPerLine` is derived from
  `ctx.measureText('M').width` (falling back to `fontSize` if measurement returns 0),
  not from a hard-coded `fontSize * 0.62`. Press Start 2P's advance is exactly 1.0x
  fontSize, so the old constant overestimated line length by ~61%: invisible at the
  default EXPERIENCE tier (the coda's visible text never needs to wrap there), but at
  1.5x and above the document ran past the paper's right edge, under the reserved
  top-right HUD stats region and off-canvas — a theme layout contract violation
  (`.claude/rules/visual-validation.md`). `measureText` also covers the `monospace`
  fallback font (whose advance is NOT 1.0), so the wrap stays correct on the first
  frames before the webfont loads. Journal O20 is the general lesson: a magic constant
  standing in for a measurement.
- **Sub-line join spacing.** Coda lines arrive with no trailing space (so the
  player-typed prompt and its win-gate stay exact-match); the theme inserts exactly
  one space into the accumulated DISPLAY text at each sub-line boundary (tracked via
  `finaleSubLens`/`finaleSubIdx`/`finaleCharsInSub`) so the story and manifesto both
  read as natural prose (`"outsmarting you"`, not `"outsmartingyou"`). Purely
  display-side: the prompt and the win-gate (`progressCount`) are untouched.
- **`hello world` easter egg** (`.claude/rules/easter-eggs.md`, former proposal #6,
  Implemented — see [[easter-eggs]]). The guaranteed Level 25 history-card word
  `hello world` (see [[history-cards]]) gets typed into the document during NORMAL
  play (before the coda begins). The first time the accumulated text contains it
  (case-insensitive), the theme fades in a one-time warm-gold line in the desk's
  bottom strip: `★ EVERY PROGRAMMER'S FIRST WORDS. WELCOME TO THE CLUB. ★` (~5s fade
  in/hold/out, `HELLO_EGG_FRAMES`). Latched (fires at most once per play), a fixed
  literal drawn via `fillText` only (never a DOM sink — security.md rule 1), and never
  gates, pauses, or interrupts flow — independent of the card's own gold-glint and the
  coda.

Screenshot: `docs/screenshots/levels/act5-full-circle/25-word-processor.png` —
**captured by `node docs/screenshots/capture-all.js 25`, like every other level**
(regenerated 2026-09-11). The 2026-07-28 "ad-hoc script, don't let a full rebuild
revert this" exception is **RETIRED**: `capture-all.js` now carries a real coda-driving
path for Level 25 (`lvl.coda`), so the listed `capture:` command is authoritative again
and a LIBRARY-scope rebuild can no longer silently replace this frame with pre-game
chrome. How that path works, since L25 is the one level whose reference frame is not a
chrome shot:

- It **plays the level for real** — a typist reads the expected token out of the live
  prompt DOM and presses it, following the prompt rather than any dictionary (which is
  what lets it sail through the scripted `we cna` → ⌫⌫⌫ → `can do it` beat instead of
  fighting it). Nothing pokes game state into the coda (journal L36).
- It is **deterministic**: it pins the active slot's `storyRotation['25']` to
  `CODA_ROTATION = 0` and clears the `kk-stories` generated cache, so the pool is the
  STATIC bank — `STATIC_STORIES[0]` (the "quick brown fox" pangram) + `TYPO_BEATS[0]`.
  That is also the shipping offline default on a plain static server.
- It **predicts and verifies**: it imports `js/keyboard-story.js` in-page (pure data +
  pure helpers) to compute the exact coda the engine must serve, then matches each
  served pattern against that prediction in order — a mismatch fails loudly rather than
  screenshotting the wrong story.
- The **capture point** is the first manifesto-capstone line, so the frame shows the
  accumulated document (pangram + the RESOLVED typo beat) flowing into the manifesto in
  the prompt panel. It then keeps typing to the real LEVEL COMPLETE overlay — "the
  capture succeeded" and "the coda is winnable" are the same check.
- `CODA_WIN_RATIO=3.5 node docs/screenshots/capture-all.js 25` captures the coda at
  another EXPERIENCE tier for verification; **the committed reference PNG is the 1x
  tier**.

## Roster (level → game → developer/year)

| L | Theme file | Game | Year |
|---|---|---|---|
| 1 | breakout.js | Breakout | 1976 |
| 2 | invaders.js | Space Invaders | 1978 |
| 3 | pacman.js | Pac-Man | 1980 |
| 4 | fighter.js | Galaga | 1981 |
| 5 | joust.js | Joust | 1982 |
| 6 | donkeykong.js | Donkey Kong | 1981 |
| 7 | dragonlair.js | Dragon's Lair | 1983 |
| 8 | tetris.js | Tetris | 1984 |
| 9 | mario.js | Super Mario Bros | 1985 |
| 10 | zelda.js | The Legend of Zelda | 1986 |
| 11 | sonic.js | Sonic the Hedgehog | 1991 |
| 12 | streetfighter.js | Street Fighter II | 1991 |
| 13 | myst.js | Myst | 1993 |
| 14 | dkc.js | Donkey Kong Country | 1994 |
| 15 | pokemon.js | Pokémon Red/Blue | 1996 |
| 16 | simcity.js | SimCity 2000 | 1993 |
| 17 | goldeneye.js | GoldenEye 007 | 1997 |
| 18 | ageofempires.js | Age of Empires | 1997 |
| 19 | ff7.js | Final Fantasy VII | 1997 |
| 20 | terminal.js | Terminal / Command Line | — |
| 21 | outrun.js | Out Run | 1986 |
| 22 | qbert.js | Q\*bert | 1982 |
| 23 | missilecommand.js | Missile Command | 1980 |
| 24 | highscore.js | High Score Entry (player's own name) | — |
| 25 | wordprocessor.js | Word Processor (first sentences) | — |

Cabinet art recreates each game faithfully — see [[select-screen]] for the
select-screen cabinet renders of the same 25 games. Both surfaces follow the same
house rule: faithful recreation of the real game, no key-glyph puns.

## Per-theme artifacts (screenshot + research grounding)

**Canonical source for `scripts/feature-map.json`'s `themes` map** — keep the two in
sync. Each theme file resolves to its ONE level screenshot (regenerate with
`capture-all.js <L>` for minimal blast radius — never the all-levels capture for a
single-theme change) and the `research/wiki/games/*.md` page that grounds its signature
mechanic. Theme-authoring's wiki-fidelity rule judges a theme's scene against its
research page, never model memory; when a theme changes, re-check it against that page.

Every entry below, **Level 25 included**, is regenerated with `capture-all.js <L>`;
L25 alone runs the coda-playing path described above rather than a chrome shot. Two
flags narrow the blast radius further when a filter token would over-capture:
`--acts-only` / `--levels-only` (added 2026-09-11) — see [[select-screen]].

| L | Theme file | Level screenshot | Research grounding |
|---|---|---|---|
| 1 | breakout.js | levels/act1-arcade/01-breakout.png | games/breakout.md |
| 2 | invaders.js | levels/act1-arcade/02-space-invaders.png | games/space-invaders.md |
| 3 | pacman.js | levels/act1-arcade/03-pac-man.png | games/pac-man.md |
| 4 | fighter.js | levels/act1-arcade/04-galaga.png | games/galaga.md |
| 5 | joust.js | levels/act1-arcade/05-joust.png | games/joust.md |
| 6 | donkeykong.js | levels/act2-computer-wing/06-donkey-kong.png | games/donkey-kong.md |
| 7 | dragonlair.js | levels/act2-computer-wing/07-dragons-lair.png | games/dragons-lair.md |
| 8 | tetris.js | levels/act2-computer-wing/08-tetris.png | games/tetris.md |
| 9 | mario.js | levels/act2-computer-wing/09-super-mario-bros.png | games/super-mario-bros.md |
| 10 | zelda.js | levels/act2-computer-wing/10-legend-of-zelda.png | games/legend-of-zelda.md |
| 11 | sonic.js | levels/act3-basement/11-sonic.png | games/sonic-the-hedgehog.md |
| 12 | streetfighter.js | levels/act3-basement/12-street-fighter-ii.png | games/street-fighter-ii.md |
| 13 | myst.js | levels/act3-basement/13-myst.png | games/myst.md |
| 14 | dkc.js | levels/act3-basement/14-donkey-kong-country.png | games/donkey-kong-country.md |
| 15 | pokemon.js | levels/act3-basement/15-pokemon.png | games/pokemon-red-blue.md |
| 16 | simcity.js | levels/act4-command-center/16-simcity-2000.png | games/simcity-2000.md |
| 17 | goldeneye.js | levels/act4-command-center/17-goldeneye-007.png | games/goldeneye-007.md |
| 18 | ageofempires.js | levels/act4-command-center/18-age-of-empires.png | games/age-of-empires.md |
| 19 | ff7.js | levels/act4-command-center/19-final-fantasy-vii.png | games/final-fantasy-vii.md |
| 20 | terminal.js | levels/act4-command-center/20-terminal.png | — (command line, not a game; primary feature is [[easter-eggs]]) |
| 21 | outrun.js | levels/act5-full-circle/21-out-run.png | games/out-run.md |
| 22 | qbert.js | levels/act5-full-circle/22-qbert.png | games/q-bert.md |
| 23 | missilecommand.js | levels/act5-full-circle/23-missile-command.png | **GAP** — no games/missile-command.md yet (arcade-historian follow-up) |
| 24 | highscore.js | levels/act5-full-circle/24-high-score-entry.png | — (player types own name, not a game) |
| 25 | wordprocessor.js | levels/act5-full-circle/25-word-processor.png | — (first sentences, not a game) |

Paths are under `docs/screenshots/` and `research/wiki/` respectively. Known research
gap: **Missile Command (L23)** has no wiki page — flag to the `arcade-historian` agent
before trusting any mechanics claim in `missilecommand.js`.

## Glyph coverage

Press Start 2P silently drops or shrinks some symbols theme canvases render directly
(arrows, backtick). Screenshot any symbol a theme renders. Small prompt glyphs are
handled centrally by [[hud-keyboard-guide]]'s `SMALL_GLYPH_BOOST` — themes should not
re-solve this per-file.

## Security boundary

Themes draw via `fillText`/canvas shapes only — never `innerHTML` or other DOM sinks.
Where a theme needs user-typed text (Level 24 `highscore.js`, Level 25
`wordprocessor.js`), it arrives pre-sanitized through the engine's pattern token
stream and is rendered with canvas text only — see `.claude/rules/security.md`.

## Related

[[curriculum-data]] (the per-level `keys`/`pool` data each theme's content matches) ·
[[engine-flow]] (the `keystroke`/`miss`/`patternComplete`/`victory` call sites, and
the parallel `minPatterns` EXPERIENCE scaling) · [[settings-survival]] (`getWinRatio`
source, tier table) · [[hud-keyboard-guide]] (shared glyph-boost handling) ·
[[select-screen]] (parallel cabinet-art recreation of the same 25 games) ·
[[visual-styling]] (the CSS-level era-accent layer themes' canvas art complements) ·
[[cinematics]] (the four non-theme-contract transition modules between acts) ·
[[history-cards]] (the guaranteed `hello world` word the Word Processor egg detects) ·
[[easter-eggs]] (the `hello world` egg's catalog entry)
