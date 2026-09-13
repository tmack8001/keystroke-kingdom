---
feature: cinematics
code: [js/mystery.js, js/basement.js, js/commandcenter.js, js/fullcircle.js]
rules: [.claude/rules/transitions.md]
screenshots: docs/screenshots/cinematics/
capture: node docs/screenshots/capture-cinematics.js && node docs/screenshots/capture-fullcircle.js
verified: 2026-09-11 (dial-up handshake chirp in mystery.js phase 5)
---

# Act-Transition Cinematics

Four self-contained modules, one per act boundary, triggered from Level-complete's
Space handler in `js/main.js` (`case 'complete':`, checking `state.level === 5/10/15/20`).
Full narrative/design intent: `.claude/rules/transitions.md`. This page covers
**implemented** behavior only, which diverges from that design doc in several places
(noted below).

| File | Trigger | Act boundary |
|---|---|---|
| `js/mystery.js` | Level 5 complete | 1 → 2, the Mystery Cabinet reveal |
| `js/basement.js` | Level 10 complete | 2 → 3, the Basement opens |
| `js/commandcenter.js` | Level 15 complete | 3 → 4, the Command Center |
| `js/fullcircle.js` | Level 20 complete | 4 → 5, the finale (binary→HELLO, montage, arcade lit, Level 21 begins) |

## Common architecture (all four)

None follow the `js/themes/*.js` module contract
([[level-themes]] — `start/stop/keystroke/miss/patternComplete/victory`). They share a
different, self-consistent contract instead: `start(callback)`, `confirm()`, `stop()`
(mystery.js additionally exports a standalone `skip()`, folded into `confirm()` in the
other three). Every module: a `P`/`PHASE_ORDER` timing table (ms offsets), a shared
`getPhase(ms)`/`phaseT(phaseIdx, ms)` pair, a `hideAllScreens()`/`restoreHiddenScreens()`
belt-and-suspenders DOM guard (verbatim comment across all four files), and a
`window.resize` handler that keeps the shared `#invaders-canvas` sized to the viewport
while active. `js/main.js`'s global keydown switch calls `.confirm()` unconditionally
on **any** keydown while `state.screen` is one of `mystery`/`basement`/`commandcenter`/
`fullcircle` — dispatch is not Space/Escape-specific at the routing level; each
module's own `confirm()` decides skip-vs-advance from the current phase.

### Skip behavior — diverges from the design doc

`confirm()` in every module: if not yet on the final phase, time-warps
`startTime` so the next frame renders the final phase immediately (skip). If already
on the final phase, calls `stop()` and the `onDone` callback. **There is no
localStorage-backed "seen it once" flag anywhere in these four files** — the design
doc's "skippable after first completion" is not implemented; every playthrough,
first-time or repeat, is skippable on the very first keypress.

### Replayability — aspirational, not built

No Stats Cabinet exists anywhere in the codebase. Each module's `start()` is called
from exactly one hardcoded site in `main.js`. "Replayable at any time from the Stats
Cabinet" (transitions.md) has no implementation.

### localStorage

None of the four files read or write localStorage directly. `fullcircle.js` calls
`getSettings()` (from [[settings-survival]]) to read `playerName` for its final
"READY [NAME]!" phase — rendered via canvas `fillText` only, re-sanitized on top of
whatever `settings.js` already validates (allowlist strip, trim, 16-char cap,
fallback to "PLAYER ONE").

## Per-module phase tables (as coded)

- **mystery.js**: `SILENCE(0-3s) → PULL(3-9s) → CURTAIN(9-13s) → TERMINAL(13-25s) →
  DOOR(25-33s) → TITLECARD(33s+)`. Phase names in code are `SILENCE`/`PULL`/`CURTAIN`/
  `TERMINAL`/`DOOR`/`TITLECARD`; the `TERMINAL` and `DOOR` phases implement the revised
  2026-07-12 spec beats "The Approach" and "The Secret Door" (transitions.md), described
  in detail below.
- **basement.js**: `MILESTONE(0-5s) → SEAM(5-11s) → DROP(11-18s) → TITLECARD(18s+)`.
  Milestone phase cascades the top-row keys (`QWERTYUIOP`) lighting in sequence.
- **commandcenter.js**: `MILESTONE(0-8s) → TEXT(8-14s) → STAIRCASE(14-24s) →
  TITLECARD(24s+)`. Milestone rolls a lit-key wave across all three letter rows.
- **fullcircle.js**: `TERMINAL(0-12s) → RETURN(12-24s) → ARCADE(24-34s) →
  OPENING(34s+, open-ended until Space)`. RETURN subdivides into 4 equal "room flash"
  beats (Command Center, Basement, Computer Wing, Arcade door), each with its own
  fade-in/hold/fade-out envelope and 2-3 note audio motif. ARCADE draws all 5 Act-1
  cabinets running live pixel-art impressions plus the 3 dim/flickering Act-5 Corner
  Cabinets. OPENING is not a title card — it hands off directly into Level 21's ready
  flow (no separate "press space to continue" beat), matching the design doc's "the
  transition *becomes* the level."

Both mystery.js and fullcircle.js contain inline comments documenting bugs found and
fixed during development (fullcircle.js: a terminal-block centering fix and a Corner
Cabinets row-collision "black box" artifact fix) — read those files' comments directly
for the specifics if debugging similar layout issues.

## The Mystery Beat, redesigned (2026-07-12) — "The Approach" and "The Secret Door"

`mystery.js`'s `TERMINAL` and `DOOR` phases were rebuilt to match a revised spec
(transitions.md "Act 1 → 2 Transition" Phases 4-5). The old separate "door opens in the
back wall" beat is gone; the cabinet itself is now the door.

**Cabinet geometry is scale-parameterized, single source of truth.** `cabinetRect(W, H,
scale)` computes the cabinet's body/screen rect at any `scale` (1 = corner-of-the-room
size used by phases 1-3); every phase, including the dolly and the hinge-swing, derives
its geometry by calling this one function — never recomputing `cw`/`ch`/`sx`/`sy`
independently. `drawCabinetBase(W, H, glowAlpha, scale)` draws the cabinet body from that
rect and is the only place cabinet visuals are drawn.

**Phase 4 — "The Approach" (12s, ms range `P.TERMINAL`).** A dolly-in: the cabinet scales
from `scale=1` (corner size) up to `DOLLY.MAX_SCALE = 2.5` (frame-dominant) over the
phase, via `dollyScale(u)` — a smoothstep ease so it reads as a steady walk that settles,
not a zoom. The terminal text ("HELLO." / "YOU FOUND ME." / "COME IN.", typed
character-by-character with keyclick sounds, same as before) starts as an out-of-focus
phosphor smear and resolves to crisp CRT text as a *function of dolly scale*
(`blurForScale`), not a separate timer — so a paused frame anywhere in the approach still
reads as a coherent distance. `crispScale()` derives the scale at which blur hits exactly
0 from the terminal's own line timings, so full crispness lands exactly as "COME IN."
finishes typing, automatically surviving future copy/timing edits. Terminal font sizing
(`fitTerminalFontSize`) is scale-invariant and defensively re-measured every frame — text
containment cannot break at any dolly position by construction.

**Phase 5 — "The Secret Door" (8s, ms range `P.DOOR`).** The cabinet hinges open like a
bookcase secret passage about its **left edge** (a true door: the hinge edge stays fixed
and perfectly vertical). This is implemented as pure horizontal foreshortening — `X' = cx
+ (X - cx) * cos(openAngle)`, `Y' = Y` — applied via a canvas `translate/scale/translate`
around the hinge line, never a screen-plane rotation, so every vertical line in the
cabinet stays exactly vertical at every opening angle. Behind the cabinet, a hidden room
blooms in: 3 depth ranks of machine silhouettes (`ROOM_MACHINES`, back/middle/front)
receding and shrinking, each with its own tinted glowing screen (mix of cool blue and
warm amber, a couple subtly flickering), a cartridge-shelf side wall, and a perspective
floor with a light-spill horizon line. The doorway occupies exactly the footprint the
cabinet stood in (`gHome = cabinetRect(W, H, DOLLY.MAX_SCALE)`), drawn first so the still
partially-closed cabinet correctly occludes the not-yet-revealed part of the room as it
swings — the reveal is the door actually turning, not a cross-fade. A receding-face shade
plus a bright free-edge light catch sell the turn as physical light, not just geometry.
Audio: `playHingeSlide()` — two low gliding oscillators, deliberately warm and
non-percussive per the spec's "not triumphant, not a fanfare — just arrival."

**The dial-up handshake (added 2026-09-11, `js/mystery.js` only).** In the same
`!chordStarted` one-shot block that starts the chord, stops the CRT hum, and plays the
hinge slide, `mystery.js` now also calls `Audio.modemChirp(0.45)` — half a second of
modem riding *under* the opening door (synthesis detail: [[audio]]; catalog entry and
its cited history: `.claude/rules/easter-eggs.md`). Three properties matter here:

- **First entry to the Computer Wing only.** `isFirstEntryToComputerWing()` derives the
  latch from progress the game already keeps — `Slots.getProgress().completed['6']`,
  Level 6 being the first cabinet *inside* the wing. No new persisted field, and
  nothing is written. (`furthestLevel`/`completed['5']` can't distinguish a first run
  from a replay: `js/main.js` records Level 5 complete *before* this cinematic starts.)
  This is the only reason `js/mystery.js` imports `js/slots.js` at all — see
  [[save-slots]].
- **Reads defensively** (security.md rule 4): a throw or a malformed shape falls
  through to "not first time" — the quiet outcome. A missing slot (the WOPR bypass)
  reads as first time.
- **Purely decorative.** It is offset 0.45s so it sits inside the door's swell rather
  than in front of it, it can never gate or delay the sequence, and with sound off (or
  no WebAudio) Phase 5 plays byte-identically. The other three cinematics are untouched.

## Milestone hold fixes (2026-07-12) — basement.js and commandcenter.js

Both files' `MILESTONE` phase (basement's key cascade, commandcenter's rolling wave) had
the same bug: the banner-text fade-out began *before* the key-lighting animation
finished, so the canonical "every key in this row is lit, held at full brightness" frame
never actually existed — only ever-so-slightly-still-cascading frames did. Caught by the
new `docs/screenshots/milestones/` reference set (Trevor: I/O/P visibly dark under "TOP
ROW UNLOCKED" in the old capture).

Fixed by retiming both phases so the animation completes with real headroom before the
fade starts:
- **basement.js**: the `QWERTYUIOP` cascade (`lightAt = 0.10 + i * 0.055`) now finishes
  by `t ≈ 0.66`; the "TOP ROW UNLOCKED" banner text fade starts at `t = 0.92` (was
  starting before the cascade completed). The fade's `globalAlpha` is now scoped
  strictly to the banner text draw call — previously it leaked onto the key row itself,
  dimming already-lit keys during the hold.
- **commandcenter.js**: the 26-key rolling wave (`lightAt = 0.05 + (globalIdx/26) *
  0.55`) now finishes by `t ≈ 0.68`; the "FULL KEYBOARD UNLOCKED" banner fade starts at
  `t = 0.90` (was `0.70`, before the wave even finished).

Both fixes leave a genuine full-brightness hold window (~0.66–0.92 basement, ~0.68–0.90
commandcenter) where every key in the row and the banner are simultaneously at full
strength — the frame the design doc's "lights up completely... holds for a beat" always
described but the code never actually produced until now.

## Screenshot sets

`docs/screenshots/cinematics/{mystery,basement,commandcenter,fullcircle}/` — one
subdirectory per module, named-phase PNGs (see the per-module phase tables above for
what each phase does). Since the 2026-07-12 mystery redesign, `mystery/` additionally
contains two animated references: `approach.gif` (the Phase 4 dolly-in + blur-resolve,
start to crisp) and `secret-door.gif` (the Phase 5 hinge-swing + room reveal, start to
full-open hold) — static PNGs alone can't validate a scale/blur function or a
progressive foreshortening swing, so these two phases get a GIF sibling alongside their
still frames (`phase3-approach-{far,mid,crisp}.png`, `phase4-secret-door.png`). Follow
this **gif-sibling rule** for any future cinematic phase whose correctness depends on
watching continuous motion rather than a single frame.

`docs/screenshots/milestones/` (new 2026-07-12) is a small **cross-cutting validation
set**, not owned exclusively by this page — it exists specifically to catch the
"animation didn't actually finish before the hold" class of bug described above by
placing all four row-unlock milestones side by side as an explicit "this is what correct
looks like" baseline:
- `01-home-row.png` — Level 4's `#complete-overlay` ("HOME ROW COMPLETE"), captured via
  a real driven playthrough, not a state injection.
- `02-top-row.png` (+ `02-top-row.gif`) — basement.js `MILESTONE` phase's held-full
  frame; duplicates `cinematics/basement/phase0-milestone.png` so this set stands alone.
- `03-full-keyboard.png` (+ `03-full-keyboard.gif`) — commandcenter.js `MILESTONE`
  phase's held-full frame; duplicates `cinematics/commandcenter/phase0-milestone.png`.
- `04-number-row.png` — Level 20's `#complete-overlay` ("NUMBERS UNLOCKED"), also via a
  real playthrough.

01/04 belong conceptually to level-complete/engine-flow territory rather than pure
cinematics (no page currently claims them), which is why this set isn't folded into this
page's `screenshots:`/`capture:` frontmatter fields — it spans two features. Captured via
`docs/screenshots/capture-milestones.js`.

## Related

[[curriculum-data]] (the act-boundary levels these key off) · [[engine-flow]] (the
trigger/dispatch site) · [[settings-survival]] (fullcircle.js's one dependency) ·
[[audio]] (`modemChirp`'s synthesis) · [[save-slots]] (`Slots.getProgress()`, the
dial-up chirp's first-time latch source) · [[easter-eggs]] (the chirp's catalog entry)
