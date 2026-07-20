---
feature: select-screen
code: [js/ui/cabinet-art.js]
rules: [.claude/rules/levels.md]
screenshots: docs/screenshots/acts/
capture: node docs/screenshots/capture-all.js
verified: 2026-07-19
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

Typing `wopr`, `wargames`, or `shallweplayagame` on the title/ready screen sets
`state.selectBypass = true` before rendering this screen — every cabinet becomes
selectable regardless of saved progress, without mutating `maxUnlockedLevel` itself.
See [[easter-eggs]].

## Related

[[save-slots]] (the slot picker that now precedes this screen for returning players;
`maxUnlockedLevel` is seeded from the active slot) · [[curriculum-data]] (the level/act
data this screen visualizes) · [[engine-flow]] (key-routing owner) · [[easter-eggs]]
(WOPR bypass)
