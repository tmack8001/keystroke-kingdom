---
feature: speedway
code: [js/speedway/hub.js, js/speedway/track.js, js/speedway/ghost.js, js/speedway/words.js, js/speedway/render/kit.js, js/speedway/tracks/index.js, js/speedway/tracks/monaco-gp.js, js/speedway/tracks/f-zero.js, js/speedway/]
rules: [.claude/rules/product.md, .claude/rules/security.md, .claude/rules/theme-authoring.md, docs/specs/act7-speed-racing.md]
screenshots: docs/screenshots/speedway/
capture: node docs/screenshots/capture-speedway.js
verified: 2026-09-13
---

# Act 7 — THE SPEEDWAY

The second bonus wing, behind the **second back-wall door** on the select screen
(the first is Act 6, [[text-worlds]]). Where the 25-level curriculum deliberately
never pressures speed or accuracy, Act 7 makes them the throttle: you race a
**ghost of your own previous lap** on that track, and typing faster is literally
driving faster. It teaches no new keys and claims none.

Design source (never restated here): `docs/specs/act7-speed-racing.md`; the
invariant catalog it is built against is `docs/testing/STRATEGY.md` §"Act 7"
(**INV-76 … INV-91**). Research ground truth for the two tracks:
`research/racing-games-by-era.md` + `research/wiki/games/{monaco-gp,f-zero}.md`;
the word bank's vetted vocabulary: `research/automotive-vocabulary.md`.

Act 7 is a **parallel input path**: it never touches `handleGameKey` /
`buildPatterns` in `js/main.js`, exactly like Act 6. The consequence is stated in
the banner at the top of `js/speedway/track.js` and is the single most important
fact on this page — **the sacred wrong-keypress contract is re-implemented there,
clause for clause**, because it is not inherited.

## Entry, exit, and the lazy import (`js/main.js`)

- **The door.** `js/ui/cabinet-art.js`'s `BACK_WALL_DOORS` registry carries
  `{ id: 'speedway', label: 'THE SPEEDWAY · race yourself', hint: 'TYPE TO ENTER',
  art: drawSpeedwayDoor, unlock: doorUnlocked }` — index **1** on the back wall.
  Unlock is the same gate as Act 6: `state.maxUnlockedLevel >= 25`
  (`DOOR_UNLOCK_LEVEL`) or `state.selectBypass` (the WOPR bypass). Navigation +
  rendering of the back wall belong to [[select-screen]].
- **Entering.** Space/Enter at the focused door runs `DOOR_ENTRY['speedway']` →
  `enterSpeedway()` (`js/main.js`). It `stopAll()`s, shows `#speedway-screen`'s
  `speedway-loading` card, and **dynamically imports** both
  `./speedway/hub.js` and `./speedway/tracks/index.js` via one `Promise.all`. On
  success it calls `mod.setTracks(tracksMod.TRACKS)`, hides every `.screen`, sets
  `state.screen = 'speedway'` and hands the shared `#invaders-canvas` to
  `Speedway.start(canvas, { onExit: returnToArcadeFromSpeedway })`.
- **Why lazy, and what it buys.** A bonus room must never be able to take the
  whole game down: on a static host a missing/404'ing `js/speedway/*` in a STATIC
  import would abort `main.js`'s module graph and brick all 25 levels. Loaded on
  demand, a failure costs exactly one warm `speedway-unbuilt` card
  ("THIS TRACK IS STILL BEING BUILT."), which **any key** walks out of. Both
  specifiers inside the dynamic import are static strings, so
  `scripts/static-host-check.mjs` still crawls the subtree and a missing track file
  is caught by the gate instead of shipping as a live 404.
- **Re-entrancy.** `speedwayLoading` latches so a second Space during the load
  can't re-enter; `Speedway` caches the namespace so the second visit skips the
  import entirely. If the player walked out mid-load (`state.screen !== 'speedway'`)
  the resolved hub is simply not started.
- **Key routing.** `case 'speedway':` in the global keydown switch
  `preventDefault()`s and forwards to `Speedway.handleKey(e)` whenever the hub is
  active. While the hub is NOT up: on the "still being built" card **any** key
  calls `returnToArcadeFromSpeedway()`; while still loading, Escape does.
- **Leaving.** `returnToArcadeFromSpeedway()` stops the hub, calls
  `focusDoor(state, 'speedway')` so the cursor lands back on the door it came
  through, and re-shows the select screen.
- **No survival timer is ever started here** — the wing structurally inherits zero
  time pressure, same as Act 6.

## The hub (`js/speedway/hub.js`) — the track chooser

Structurally a sibling of `js/textworld/hub.js`: a small canvas-drawn menu,
`mode` is `'menu'` or `'track'`.

- **Injected registry, never a hard import.** The hub imports only `track.js` and
  `ghost.js`; the track list arrives via `setTracks(list)` or
  `start(canvas, { tracks })`. `normalizeTracks` keeps only rows with a non-empty
  string `id` and `title` — a half-built renderer costs its own row, never the
  wing. With nothing registered it falls back to a single built-in **TEST OVAL**
  (`id: 'test-oval'`, `lapChars: 60`), so the door never opens on an empty room;
  its record is stored under its own id and can't pollute a real track's ghost.
- **Menu keys.** `ArrowUp`/`ArrowDown` wrap the cursor, `Enter`/`Space` enters the
  focused track, `Escape` calls `onExit` (→ the arcade door).
- **In a track.** The hub intercepts `Escape` itself, unconditionally, before
  `Track.handleKey` ever runs — `returnToMenu()`. Every other key goes to the race
  engine.
- **Crediting a lap however you leave it — no completion hook, and deliberately
  none (removed 2026-09-13).** The hub previously carried an `options.onComplete`
  hook, shaped after Act 6's `recordTextWorldComplete`, calling it from
  `returnToMenu()` on `Track.hasWon()`. Nothing ever passed it — `js/main.js` wired
  only `onExit` — so the credit path was dead code that *looked* wired, which the
  in-code comment now calls out as worse than an outright absence (the next reader
  assumes completion is tracked through it). Both `onComplete` and `Track.hasWon()`
  are now deleted. The TF-T1 lesson (leaving must never silently drop something the
  player actually did) is honoured differently here than in Act 6: **`Ghost.commitLap`
  writes the track's record to `kk-slots[i].speedway` inside `crossTheLine()`** the
  moment a lap actually finishes, not the moment the player leaves — so the record is
  already safe on every exit path (Space off the pit board, or Escape mid-race) before
  `returnToMenu()` ever runs. The ghost record IS the record of play; there is no
  separate wing-completion flag.
- **The keepsake line** under each track: `never driven — your first lap sets the
  pace`, else `N LAPS   BEST m:ss.t`. Facts only — never a placement, never a
  comparison, and structurally incapable of showing a minus (see INV-83 below).

## The race engine (`js/speedway/track.js`) — one file, every track

A track module supplies only its data row and its `drawScene`; **all** of the
act's rules live here once.

### The sacred wrong-keypress contract, re-implemented (INV-77)

Copied clause-for-clause from CLAUDE.md §"Wrong Keypress Behavior" / product.md §3,
with `handleGameKey`'s token rules:

1. Wrong key → `Audio.wrong()` (gentle nudge) and `wrongFlashMs = 260`.
2. The letter **stays on screen and waits** — `charIndex` does not move.
3. The mistake is logged quietly to `mistakes[expected]`; nothing alarming is
   displayed (there is no on-screen mistake or streak counter in this act at all).
4. The correct key advances normally — a single `wrongOnCurrent` latch means
   repeated wrong keys on one letter cost **one** attempt, not one each.
5. `e.key.length > 1` (modifiers, arrows, function keys) is ignored entirely and is
   never a mistake; `Tab` and `Escape` return `false` without `preventDefault`.

Token normalization mirrors the engine exactly — the same single-character class the
pattern engine accepts (letters, digits, and the symbol keys Act 5 taught, the eighth
key included) — plus `Backspace` and `' '` as named tokens (Act 7 words contain
neither, so both fall through to the token test and are rejected as
out-of-alphabet). Case-sensitivity applies only when the expected token is
uppercase; Act 7's pools are lowercase, so SHIFT-typing still works and CapsLock
never matters.

**Act 7's own addition:** a wrong key never reduces charge, speed, lap progress,
the odometer, the lap count or the clean-run best. `cleanRun` (the current
consecutive-correct run) resets, but `cleanRunBest` is a `Math.max` and only rises.

### The throttle: a floor that can't move, a ceiling that only adds

- **The floor (INV-78).** Every correct keystroke advances the lap by exactly
  `1/lapChars`. Nothing modulates it — not rate, accuracy, charge, ghost,
  EXPERIENCE, word length or track. That is why every track is finishable by
  anyone at any rate.
- **The ceiling — CHARGE (INV-79).** `charge += CHARGE_PER_KEY` (0.16) on a
  correct key, clamped to 1; it decays continuously as
  `charge * Math.exp(-dt / CHARGE_TAU_MS)` (τ = 1400 ms), floored at 0. **Charge
  adds no distance** — it is the speedometer (gauge, speed lines, the world's
  scroll rate via `s.speed = 0.3 + 0.7 * charge`). A wrong key costs exactly zero
  charge: while the letter waits, the meter is simply not being added to, and it
  decays at the same rate as during flawless play.

### No clock can end a run (INV-76)

A lap is **N CHARACTERS, never N seconds**. `crossTheLine()` fires only from
`onCorrect()` when `charsTyped >= lapChars`. Elapsed time is a measurement, never
a budget, and it is **time-on-task**: past `IDLE_GRACE_MS` (5000) the frame loop
stops advancing `lapMs`, the charge decay, the field and the ghost recorder
entirely — the race waits, and the prompt shows `THE RACE IS WAITING FOR YOU`.
That can only make a lap time better or equal, and it keeps an unattended tab from
simulating anything (journal L20).

### Lap length and EXPERIENCE (INV-88)

`startTrack` resolves `target = Math.max(8, Math.ceil(track.lapChars * getWinRatio()))`
once, then `buildLapWords(track, target)` draws whole words until the total reaches
it — so a lap always ends **on a completed word**, and `lapChars` is the returned
list's own character sum (never the requested target). EXPERIENCE therefore scales
the **road**, never a demand: at the default tier behavior is identical to the
track's declared length.

### Phases and keys

| phase | what's on screen | keys |
|---|---|---|
| `grid` | start-line card: title, year, and either `YOUR LAST LAP IS OUT THERE WITH YOU` or `FIRST LAP — YOU SET THE PACE` | Space/Enter → race · Escape → hub |
| `racing` | the engine's one panel (see below) over the track's scene | the word · Escape → hub |
| `finish` | **the TRACK owns the whole screen** for a per-track `celebrationMs` (clamped 1200–6000, exactly like a theme's `victory()`); the engine keeps to its band with a compact checkered ribbon. Monaco GP 2800 ms, F-Zero 3200 ms. *Changed 2026-09-13: was `FINISH_FANFARE_MS` = 700 ms, which slammed the pit board over a frozen scene — covering the player's own vehicle at the moment it crossed the line.* | Space/Enter → the pit board (it does NOT auto-settle) |
| `pit` | the pit board | Space/Enter → hub · Escape → hub |

**The `finish` and `pit` footers are deliberately different strings** — the celebration
ribbon draws `SPACE — THE PIT BOARD`, the board draws `SPACE — BACK TO THE PITS`. That is
the supported way to tell the two phases apart from outside (a test or a capture script),
and it is why **leaving a track now takes two Space presses, not one.**

`hasWon()` is `phase === 'pit' || phase === 'finish'`. `inspect()` is the act's one
sanctioned read-only observable-state accessor (the wing is canvas-only, so there
is no DOM for a test or capture script to read); nothing in the act branches on it.

### The layout division

`RESERVED = { promptTop: 0.70, promptBottom: 0.94 }` (canvas-height fractions) is
the **only** band the engine draws in — an opaque scrim panel (full-opacity muted
colours over a dark plate, never element opacity: journal L2/F3). Everything else
on the canvas belongs to the track's renderer, which receives the band as
`s.reserved` and must keep its own title plate, gauge and ghost label outside it.
This is `visual-validation.md`'s "the UI owns the centre; the theme owns the frame"
applied to a wing with no DOM UI. A track with no `drawScene` gets a plain
placeholder road plus a nameplate — a missing renderer costs the scenery, never
the lap.

**The band is a RACING-phase contract, not an all-phase one.** The two full cards —
`drawStartLineCard` (y ≈ 0.34–0.64H) and `drawPitBoard` (y ≈ 0.18–0.80H) — are
deliberately drawn outside it, centred over the scene, because in those phases there
is nothing to read behind them. The visible consequence is cosmetic and expected: on
Monaco GP the start-line card covers the right-margin CHARGE rail's caption
(`05-monaco-gp-ghost-start-line.png`). Only `drawPrompt` is confined to
`promptTop..promptBottom`, which is the phase where the player is actually reading the
track.

The panel carries three rows: (A) the ghost identity line
`GHOST · YOU · LAST TIME` (or `FIRST LAP · YOU SET THE PACE`) plus a lap-progress
bar that only ever fills, with a ghost tick on it; (B) the word, letter by letter
(done = green, current = amber on a lit plate, red while `wrongFlashMs` runs);
(C) the plain CHARGE bar, the always-present floor under whatever era gauge the
track draws.

### The field is atmosphere (INV-82)

`FIELD_SIZE` = 6, allocated once in `buildField()` (no per-frame allocation). Each
car carries `{ lane, progress, spin, speed, mult, wobble, spinMs }`. Their pace
derives from the **player's own** rolling pace (`charsTyped / lapChars / activeSec`,
clamped to 0.004–0.2 laps/s) times a per-car band multiplier — so a slow player is
never alone and a fast one never drives through parked cars. They spin comically and
recover (`spinMs`); **the player's vehicle has no crash state at all**. The field is
never scored, never ranked, never compared, and nothing about it is stored.

### The pit board — no minus sign is reachable (INV-83)

Structural, not stylistic:

- `formatLapTime(ms)` clamps at zero before formatting, so it cannot emit `-`.
- The improvement line is built only inside `if (improvedMs > 0)`; `commitLap`
  returns `improvedMs = 0` for a slower lap. There is **no "slower by" branch
  anywhere in the file** to reach.
- A slower lap simply omits the line, and the facts below move up to fill the space
  (`hasWarmLine`), so the absence never reads as a blank.
- Rows: `YOUR TIME`, `YOUR BEST`, `LETTERS TYPED`, `LONGEST CLEAN RUN`, `LAPS`,
  `ODOMETER`, and `WPM` **only when `computeWPM` returns non-null** — it returns
  `null` below 10 seconds elapsed (`js/ui/hud.js`), so every real human lap shows
  it and a machine-fast capture lap does not.
- No placement, position, finish order, ranking or defeat string exists anywhere in
  the act, on screen or in storage. The field never appears on this board.

## The ghost (`js/speedway/ghost.js`) — you, last time

- **You race your LAST run, never your best.** Racing an all-time best means a
  child who had one great day loses to herself forever; racing last time means a
  learner beats it most sessions. **Best is a keepsake on the pit board, never an
  opponent on track.**
- **Format:** `SPLIT_COUNT` = **64** integers — the millisecond at which the run
  first reached `i/63` of the lap. Splits store the OBSERVED RESULT, so they stay
  true across tuning; storing keystroke timings and re-deriving them through the
  speed function would make every saved lap change meaning the first time anyone
  tunes the charge curve (journal O20's hazard class).
- **Recorder.** `newRecorder()` is fed `(progress, ms)` every frame and on every
  correct keystroke; it writes the first time each milestone is reached and carries
  the running max forward, so the table is non-decreasing **by construction**.
  `finish(ms, keys, acc)` closes it out to the line.
- **`commitLap(trackId, ghost, stats)`** returns
  `{ record, previous, improvedMs, isBest, firstLap }` so no caller ever compares
  ghosts itself. Counters are monotonic by construction (laps/chars add,
  `cleanBest` is a `Math.max`) — iRacing's permanent record of your mistakes,
  inverted into a permanent record of your driving. If the store declines a ghost,
  the previous one is **put back** (read-back check, not a copy of slots.js's
  limits). With no active saved game, the board still shows this lap's true facts;
  it just won't be there next time.
- **Replay.** `ghostProgressAt(ghost, ms)` binary-searches the bracketing
  milestones and interpolates; once it reaches 1 it **stays at 1** — the ghost
  parks at the finish line and waits there, cheering, until the player arrives.
  That clamp is the most load-bearing line in the file. `ghostHasFinished` lets a
  renderer switch to its cheering pose without guessing from a float.
- **Validation lives in `js/slots.js`, deliberately not here** (one definition of
  "valid", one file — journal L41). A corrupt ghost comes back as `last: null`,
  which is the SAME path as a genuine first lap: the player gets a warm
  "FIRST LAP — YOU SET THE PACE" and never learns anything went wrong. There is no
  error state to reach.
- Two values are pinned by comment on both sides: `SPLIT_COUNT` and the record's
  `v` (asserted by `slots.test.mjs`).

Storage shape, caps, eviction and the erase paths: [[save-slots]].

## The word banks (`js/speedway/words.js`) — INV-87

- **Static by design.** The published build is a static host with no backend, so
  `/api/wordgen` would be dead code for most players; a curated, era-appropriate
  racing vocabulary is also better content. Every word is hand-picked from
  `research/automotive-vocabulary.md` and tiered `EASY` (2–5 letters) / `MEDIUM`
  (4–7) / `HARD` (7+). **No Act 7 code path issues any network request.**
- **Two safety layers.** (1) the shared exact-word floor,
  `js/word-blocklist.json` via `isBlockedWord` — re-checked by `isSafeWord()` so a
  future edit to either list can't smuggle one through (see [[wordgen]]); (2)
  `NEVER_WORDS` — a **tone** judgement, not a safety filter: `crash`, `wreck`,
  `collision`, `burnout`, `spinout`, `dnf`, `dead`, `die`, `kill`, matched as
  substrings, deliberately over-blocking (so `diesel` never sneaks in either). A
  racing act that never crashes is the same choice as Missile Command's cities that
  can never be hit (`levels/act5.md` L23).
- **Pools.** `TRACK_POOLS` keys a pool per track id (Monaco GP gets `EASY` only,
  F-Zero `EASY+MEDIUM`, a future modern-F1 track `HARD`); an unlisted id falls back
  to its render tier's `TIER_BAND`, then to `EASY+MEDIUM`. Lookups use
  `Object.prototype.hasOwnProperty` — a track id of `constructor`/`__proto__` would
  otherwise resolve to an inherited member and be returned as a "pool" (found by
  `/security-review` 2026-09-13; the same guard `readSpeedway` uses).
- **MIN/MAX WORD LENGTH is best-effort, never a wall.** `poolForTrack` filters by
  `getWordLengthRange()` and falls back to the track's own words if the range
  empties the pool — winnability is the floor and is never traded for a lever
  (journal L38 / INV-38, same contract as the 25-level engine).
- `buildLapWords(track, targetChars)` keeps drawing until the total reaches the
  target, so the lap's real length is that sum and a lap always ends on a whole
  word.

## The era render kit (`js/speedway/render/kit.js`) — INV-85

Act 7 recapitulates the whole graphic-quality arc (product.md §5) inside one wing,
so the climb is **architecturally enforced, not hoped for**. `kitFor(tier)` hands a
renderer only the drawing vocabulary its era possessed:

| tier | adds | internal res |
|---|---|---|
| `ttl` | `rect` · `hline` · `blit1bit` · `text` — no gradient, no alpha, no curve | 240px |
| `scaler` | `scaleSprite` · `horizonShift` | 320px |
| `8bit` | `tileLayer` · `spriteSheet` | 256px |
| `mode7` | `affinePlane` · `billboard` · `withAlpha` | 320px |
| `flatpoly` | `flatPoly` · `painterSort` — **no `texturedPoly`; that is the point** | 400px |
| `texpoly` | `texturedPoly` · `gouraud` · `bilinear` (filtering first appears here) | 512px |
| `ps1` | `modelledMesh` | 640px |
| `modern` | `gradient` · `bloom` · `particles` | native |

Three mechanisms make the ladder real:

1. **Absence.** The pen is composed from the tier chain up to the renderer's own
   tier, then frozen with a null prototype. `p.gradient` at `ttl` is `undefined` —
   calling it is a TypeError, not a code review. **Virtua Racing (`flatpoly`)
   physically cannot texture a polygon.**
2. **The guard.** Because `drawScene` is still handed the raw shared 2D context,
   for the duration of each frame the era-forbidden members of both the context and
   the era buffer are replaced with **throwing tripwires** (gradients, patterns,
   filters, shadows, composite ops, curves, and below `mode7` any `globalAlpha`
   but 1). Kit primitives that legitimately need one internally hold originals
   captured before the guard.
3. **Resolution + filtering.** Each tier renders into an offscreen buffer at its
   era's internal width and composites up with `imageSmoothingEnabled` false until
   `texpoly`. The chunky upscale is the kit's doing, not the renderer's.

The kit draws its own 5×7 bitmap font rather than `fillText` — the honest way a
discrete-logic cabinet made letters, and it sidesteps the Press Start 2P glyph
coverage trap (journal O11) outright: an unauthored glyph draws as a blank cell,
never a surprise. `readScene(s)` normalizes and clamps the engine's state into one
reused module-level object (no per-frame allocation; a partial state draws a calm
scene instead of throwing — journal F1), and it accepts `reserved` as either
`{promptTop, promptBottom}` (what the engine sends) or `{top, bottom}` (what the
renderers read).

## The track registry (`js/speedway/tracks/index.js`)

One row per track; `allTracks()` sorts by `eraRank`, `trackById(id)` looks one up.
The row shape is
`{ id, title, developer, year, tier, variant, eraRank, vehicle, tagline, lapChars, drawScene }`.
Two static rules hold over the table and are cheap to test (INV-85): `eraRank`
never decreases when tracks are ordered by `year`, and no two tracks share a
`(tier, variant)` pair.

| id | title | dev · year | tier · variant | eraRank | lapChars | word pool |
|---|---|---|---|---|---|---|
| `monaco-gp` | MONACO GP | Sega · 1979 | `ttl` · `discrete-logic` | 1 | 120 | `EASY` |
| `f-zero` | F-ZERO | Nintendo EAD · 1990 | `mode7` · `raster-plane` | 5 | 220 | `EASY+MEDIUM` |

- **Monaco GP** — overhead, one ink on black, no CPU in the real cabinet. The
  cabinet's **five areas** are kept as pure visual escalation: the road narrows and
  the surface turns to ice, then gravel. Its clock and every punishment are gone;
  grip is never modelled. The ghost is dithered (1979's only translucency), the
  field spins by flipping between two sprite orientations (how a machine with no
  rotation hardware showed a spin), and a marshal waves at the line. Its road band
  lives in the LEFT margin with the course board and a segmented CHARGE rail in the
  right margin, composing around the engine's panel.
- **F-Zero** — Mode 7: a raster ground plane rotated and scaled, everything else a
  sprite, dusk sky drawn as raster **bands** (the tier has no gradient). F-Zero's
  power meter, lives and retirement are all gone; the craft has no damage state.
  Vanishing point at 0.34W — deliberately off horizontal centre (journal L17).

These two ship together on purpose: eleven years and four hardware generations
apart, so the act's graphics climb is visible from the first two tracks rather than
settling into one retro look.

## The One Rule, and the anti-trap chain (INV-86)

Escape always makes progress toward the arcade, from **every** state in the act:
still-loading card → out; "still being built" card → out (any key); start line /
mid-lap / pit board → the hub; the hub → the arcade door. There is no state from
which Escape fails and no state that can be entered without a way out. Nothing in
the act is on a clock, nothing can be lost, and the player's vehicle has no failure
state.

## Related

[[select-screen]] (the back-wall door registry and its navigation) ·
[[text-worlds]] (Act 6, the sibling wing and the pattern this one follows) ·
[[save-slots]] (`kk-slots[i].speedway` — where ghosts live) ·
[[engine-flow]] (screen routing, `DOOR_ENTRY`, the global keydown switch) ·
[[wordgen]] (the shared kid-safety blocklist floor) ·
[[settings-survival]] (`getWinRatio`, MIN/MAX WORD LENGTH — the two levers Act 7
consumes) · [[visual-styling]] (`#speedway-screen`'s two cards)

## Reference frames

`docs/screenshots/speedway/*.png`, regenerated with
`node docs/screenshots/capture-speedway.js [subset]` (subsets: `door`, `hub`,
`monaco-start`, `monaco-racing`, `monaco-lap`, `fzero-start`, `fzero-racing`).

| file | what it validates |
|---|---|
| `00-the-speedway-door.png` | the back wall with BOTH doors, SPEEDWAY focused |
| `01-the-hub.png` | the chooser: two tracks, each `never driven — your first lap sets the pace` |
| `02-monaco-gp-start-line.png` | the grid card, first-lap wording |
| `03-monaco-gp-racing.png` | `ttl` scene + the engine panel: AREA 2/5, the segment CHARGE rail, `FIRST LAP · YOU SET THE PACE` |
| `04-monaco-gp-pit-board.png` | a completed lap's board — no minus sign, no placement, AREA 5/5 |
| `05-monaco-gp-ghost-start-line.png` | the second lap's card: `YOUR LAST LAP IS OUT THERE WITH YOU` |
| `06-monaco-gp-racing-the-ghost.png` | the dithered ghost car on track + the ghost tick on the lap bar |
| `07-f-zero-start-line.png` | the `mode7` scene behind the grid card |
| `08-f-zero-racing.png` | the era climb made visible: raster plane, banded sky, MODE 7 dashboard |

The capture script drives real laps by typing the real prompt word, reconstructed
from a `fillText` recorder (text content only — never a pixel, position or colour
assertion; `.claude/rules/testing.md` rule 4). Because Playwright types far faster
than a child, the pit-board frame shows a ~2.8 s lap and therefore **no WPM row**
(`computeWPM` returns null under 10 s) — a real lap shows one.
