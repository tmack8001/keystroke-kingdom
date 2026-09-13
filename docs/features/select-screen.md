---
feature: select-screen
code: [js/ui/cabinet-art.js]
rules: [.claude/rules/levels.md]
screenshots: docs/screenshots/acts/
capture: node docs/screenshots/capture-all.js
verified: 2026-09-11
---

# Select Screen ("GREETINGS PROFESSOR FALKEN")

The level-select screen. Five acts (`ACTS`, cabinet-art.js:3-9), each showing five
cabinets at a time: Act 1 The Arcade (1-5), Act 2 The Computer Wing (6-10), Act 3 The
Basement (11-15), Act 4 The Command Center (16-20), Act 5 Full Circle (21-25).
`renderSelectScreen(state)` fully rebuilds `#select-cabinets` on every call.

## Cabinet art system

Two-layer canvas draw, `drawCabinet(canvas, levelNum, scale=2)`:
- **Shell** (generic, shared): body, marquee, bezel, control panel with a red button
  + two accent buttons, joystick, speaker grilles, side-edge glow.
- **Screen** (bespoke per level): `CABINET_DATA[levelNum].drawScreen(ctx, x, y, w, h)`
  hand-draws that game's iconography in raw canvas primitives at a fixed 56×80
  internal resolution — e.g. Breakout bricks, a Space Invaders pixel sprite, Q*bert's
  isometric pyramid, Missile Command's defensive-only "cities never destroyed" scene.
  Cabinets recreate the real game faithfully — no key-glyph puns (see also
  [[level-themes]], which follows the same rule for gameplay canvases).
- **Body set dressing** (optional, added 2026-09-11): after the shell and screen,
  `drawCabinet` calls `CABINET_DATA[levelNum].drawExtras(ctx, w, h)` if that cabinet
  defines one — for art on the cabinet BODY rather than its screen. Exactly one
  cabinet uses it today: **Level 20 (the terminal) carries a rubber duck** on its
  control panel (`drawRubberDuck`, a 7×8 pixel duck at cabinet-space `39,49`; four
  fixed colour constants). It is set dressing, never interactive, and — like the rest
  of the cabinet — renders dark while the level is still a locked silhouette. Catalog
  entry (and the Level-22 `STUCK? TELL THE DUCK.` hint line that is its other half,
  which lives in `js/main.js`): [[easter-eggs]].

## Lit vs. locked

`isLevelLocked(state, levelNum)`: locked when `levelNum > (state.maxUnlockedLevel || 1)`
— UNLESS `state.selectBypass` is true (WOPR dev/parent bypass), in which case nothing
is ever locked. Locked cabinets get CSS class `locked`, label forced to `'???'`, keys
text blanked, and no click listener — dark and inert. `state.maxUnlockedLevel` is
seeded from the **active save slot's** progress (`js/slots.js`'s `getProgress()` —
see [[save-slots]]) at boot and whenever a game is resumed from the slot picker (owned
by [[engine-flow]]).

## Boot path (landed 2026-07-19)

Reaching this screen for a returning player now routes through the slot picker first —
see [[save-slots]]. `boot()` migrates any pre-slots single save into Slot 1, then shows
the slot picker (`CHOOSE YOUR GAME`) if any save slot exists; picking a slot resumes
straight to the ready screen (not this screen) with that slot's `maxUnlockedLevel`
already seeded, and the select screen is reached exactly as it always was — via the
ready screen's Escape or a level's own Escape path. A first-time machine (no slots at
all) is unaffected: it still falls through to the untouched cold-open/title flow.

## Navigation

- `ArrowLeft`/`ArrowRight` → `navigateWithinAct(state, ±1)` — moves among the 5
  cabinets in the current act; refuses to land on a locked cabinet.
- `ArrowUp`/`ArrowDown` → `navigateAct(state, ±1)` — moves between acts, clamped to
  `[0, ACTS.length)`; walks backward via `firstUnlockedAtOrBelow` so the cursor never
  strands on a locked cabinet.
- `1`-`5` → `selectByPosition(state, pos)` — jump directly to the pos-th cabinet in
  the current act (1-indexed); no-ops if locked.
- `F` → toggles Free Play (see [[free-play]]).
- `Enter`/`Space` → enters the selected cabinet (guarded again against locked levels).
- `Escape` → clears Free Play, returns to title.

All key bindings live in `js/main.js`'s `case 'select':` block, not in this file —
`cabinet-art.js` is pure render/navigation-helper, operating on the shared `state`
object (`maxUnlockedLevel`, `selectBypass`, `selectedLevel`, `freePlay`).

## WOPR bypass

Typing `wopr`, `wargames`, `shallweplayagame`, or `joshua` on the title/ready screen
sets `state.selectBypass = true` before rendering this screen — every cabinet becomes
selectable regardless of saved progress, without mutating `maxUnlockedLevel` itself.
(All four phrases also award the secret WarGames history card to the active slot.)
See [[easter-eggs]].

## The moth (added 2026-09-11)

The one thing on this screen that happens on its own, and the only mouse-driven
interaction anywhere in the game. Design intent + the cited 1947 history (and the
attribution it deliberately withholds): `.claude/rules/easter-eggs.md`. Implemented
behavior, all in `js/ui/cabinet-art.js`:

- **Loop.** `renderSelectScreen()` calls `mothStart()` (idempotent — one `rAF` loop,
  started once). `mothTick` dismisses the moth and stops the loop whenever
  `#select-screen` is hidden, with a ~1500ms grace period because
  `renderSelectScreen` legitimately runs a frame or two before `showScreen`.
- **Stillness is the trigger.** `mothNoteActivity()` stamps "the player is here" from
  `renderSelectScreen`, `updateSelectHighlight`, and a module-level `window` `keydown`
  listener (read-only: it never inspects the key, never `preventDefault`s, never stops
  propagation, so keyboard navigation is untouched). Arrival needs `MOTH_IDLE_MS`
  (12s) of stillness, then one roll per `MOTH_ROLL_MS` (1s) at `MOTH_CHANCE` (0.03).
  Any activity while it is resting flips it straight to the `leave` phase.
- **Lit cabinets only.** It picks at random from
  `#select-cabinets .select-cabinet[data-level]:not(.locked)` — never a dark, unearned
  cabinet, and never the door view (which carries no `data-level`). It rests somewhere
  on that cabinet's screen glass, in the cabinet canvas's own 56×80 space (journal
  L16 — canvas space, never DOM space).
- **Phases.** `arrive` 2200ms (smoothstep toward the rest point with a wobble that
  fades as it lands) → `rest` 16000ms (wings flat, an occasional shiver) → `leave`
  1600ms (flutters up and off), then it must earn its way back with a fresh idle
  stretch and a fresh roll. Each frame `mothDraw` redraws the host cabinet and paints
  a 7×8 pixel moth over it, so nothing else on the screen is disturbed.
- **Finding it.** One capture-phase `click` listener on `#select-cabinets`, wired once
  (`mothWireClick`). It returns immediately unless the moth is active and the click
  landed on the moth's own cabinet canvas within `MOTH_HIT_R` (9 in cabinet space,
  generous for small hands; `offsetX/Y` is scaled into canvas space, which survives the
  `.selected` CSS scale). On a hit it calls `e.stopPropagation()` so **finding the moth
  never moves the player's cabinet cursor**, sets `moth.found` (a per-page-load latch —
  it stops coming after one find), sends the moth away, and shows `#moth-found-line`:
  the Mark II logbook caption + date, `textContent` from a fixed literal (security.md
  rules 1–2), `pointer-events:none`, fading out after `MOTH_MESSAGE_MS` (7s).
- **It never gates anything.** No pause, no keypress stolen, no progress recorded,
  nothing collectible; missing it costs nothing.

## Related

[[save-slots]] (the slot picker that now precedes this screen for returning players;
`maxUnlockedLevel` is seeded from the active slot) · [[curriculum-data]] (the level/act
data this screen visualizes) · [[engine-flow]] (key-routing owner; also owns the duck's
Level-22 hint line) · [[easter-eggs]] (WOPR bypass, the moth, the rubber duck)

## Reference frames

`docs/screenshots/acts/*.png` — one per act, regenerate a single act page with
`node docs/screenshots/capture-all.js <act-slug> --acts-only` (the `--acts-only` flag
was added 2026-09-11 so a cabinet-art change doesn't drag that act's five gameplay
shots along). `acts/act4-command-center.png` was regenerated 2026-09-11 and now shows
the rubber duck on the Level 20 cabinet. The moth has **no reference frame**: it
appears only after 12s of stillness at a 3%/second roll, and no capture script drives
it — flagged here rather than left silently unvalidated.
