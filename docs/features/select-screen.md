---
feature: select-screen
code: [js/ui/cabinet-art.js]
rules: [.claude/rules/levels.md]
screenshots: docs/screenshots/acts/
capture: node docs/screenshots/capture-all.js
verified: 2026-09-13 (console-station cabinet art overhaul + control panels + screen/year fixes — see git log js/ui/cabinet-art.js)
---

# Select Screen ("GREETINGS PROFESSOR FALKEN")

The level-select screen. Five acts (`ACTS`, cabinet-art.js:3-9), each showing five
cabinets at a time: Act 1 The Arcade (1-5), Act 2 The Computer Wing (6-10), Act 3 The
Basement (11-15), Act 4 The Command Center (16-20), Act 5 Full Circle (21-25).
`renderSelectScreen(state)` fully rebuilds `#select-cabinets` on every call.

## Cabinet art system

`drawCabinet(canvas, levelNum, scale=2)` dispatches on `CABINET_DATA[levelNum].shell`:
absent (the default) draws an upright **arcade cabinet** (`drawCabinetArt`); `shell:
'console'` draws a **console/computer station** instead (`drawConsoleStation`, below).
Both share the same 56×80 internal canvas resolution and the same
`data.drawScreen(ctx, x, y, w, h)` contract for the game iconography itself.

**Rebuilt 2026-09-13** (journal F29 / `docs/ROADMAP.md` §3): Levels 8–19 were, until
this wave, drawn as upright arcade cabinets regardless of what the design bible
(`.claude/rules/levels/act2.md`, `act3.md`, `act4.md`) actually names for that slot —
an Elektronika 60, an NES-and-wooden-TV, a Genesis, a beige PC, an SNES, a Game Boy
Pocket, an N64/PlayStation on a 90s plastic CRT. `theme-authoring.md`'s "draw a real
thing" rule now holds for the select screen, not just gameplay canvases. **Levels 12
and 20 stay upright arcade cabinets on purpose** (Street Fighter II was a real coin-op;
the terminal is the room's own machine, not a console) — the shell field is decided
per level, not "8–19 uniformly."

### Arcade cabinets (`drawCabinetArt`, no `shell` field)
- **Shell**: body, marquee, bezel, control panel, speaker grilles, side-edge glow.
- **Screen**: `data.drawScreen` hand-draws the game's iconography — e.g. Breakout
  bricks, a Space Invaders pixel sprite, Q*bert's isometric pyramid, Missile Command's
  defensive-only "cities never destroyed" scene.
- **Per-cabinet control panel** (`data.controls`, e.g. `{ stick, buttons, stickSide?,
  buttonColor?, buttonShape?, pedals? }`), rendered by `drawControlPanel` — faithful to
  each cabinet's real panel rather than a shared generic joystick+button block:
  Breakout is a rotary **knob**, zero buttons (a paddle controller — never a
  joystick); Pac-Man is a **4-way stick, zero gameplay buttons**; Street Fighter II
  carries **six** buttons; Missile Command's **trackball sits on the right** with
  **three wide yellow buttons on the left**; Out Run is a **wheel** with a shifter and
  **floor pedals** (`data.controls.pedals`, drawn separately from the panel since the
  cabinet base was overpainting them). A level with no `controls` field falls back to
  the original generic joystick+button shell.
- **Body set dressing** (optional, added 2026-09-11): `drawCabinet` calls
  `CABINET_DATA[levelNum].drawExtras(ctx, w, h)` if that cabinet defines one — art on
  the cabinet BODY rather than its screen. Exactly one cabinet uses it today:
  **Level 20 (the terminal) carries a rubber duck** on its control panel
  (`drawRubberDuck`, a 7×8 pixel duck at cabinet-space `39,49`; four fixed colour
  constants). It is set dressing, never interactive, and — like the rest of the
  cabinet — renders dark while the level is still a locked silhouette. Catalog entry
  (and the Level-22 `STUCK? TELL THE DUCK.` hint line that is its other half, which
  lives in `js/main.js`): [[easter-eggs]].

### Console/computer stations (`drawConsoleStation`, `shell: 'console'`)
Levels 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19 (`machine:` names the object —
`elektronika-60`, `nes`, `genesis`, `pc`, `snes`, `gameboy-pocket`, `n64`,
`playstation`). Drawn as a small room vignette rather than a cabinet shell: a floor/
shelf band, and either a TV/monitor/CRT housing (a console plugs into a **television**,
a computer sits on a **monitor** — `data.machine === 'pc'` distinguishes them) or, for
the Elektronika 60, a bespoke charcoal-CRT-and-drive-bay chassis. `display: 'crt90s'`
(Levels 17, 19) swaps the housing to moulded grey 90s plastic instead of the
wood-veneer television used for the earlier NES/Genesis-era sets (Levels 9–11).
`data.drawStationScreen(ctx, x, y, w, h)`, if present, paints the station's own
miniature in place of `drawScreen` — Level 8 is the only user today: the wall machine
shows the 1984 Elektronika 60's actual TEXT display (BRACKETS forming the falling
piece), while `js/themes/tetris.js` still plays the familiar coloured-tetromino look —
two different true things about the same game, reconciled without touching the theme
file. Cited against photographs, not silhouette notes alone (journal F29):
`research/wiki/tech/console-hardware-silhouettes.md` §Media.

### Screen and era corrections (2026-09-13)
Four cabinet **screens** were wrong and are now fixed: **Level 4** was drawing Street
Fighter II's fighters instead of Galaga (now shows Galaga's alien formation and tractor
beam); **Breakout (L1)** and **Space Invaders (L2)** had colours their original
hardware never had (Breakout's CRT was monochrome — colour now arrives via cellophane-
strip-style horizontal bands per research/wiki/games/breakout.md, not four flat green
rows; Space Invaders' overlay is corrected to its real Taito-vs-Midway panel per
`research/` cited in commit `c0a8d72`); **Dragon's Lair (L7)** now draws its dragon,
previously absent. Separately, four of Act 1's five cabinet **years** were wrong and
are now fixed to match `.claude/rules/levels/act1.md` (1976/1978/1980/1981/1982) —
pinned by the new invariant `INV-93`.

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
- `ArrowUp`/`ArrowDown` → `navigateAct(state, ±1)` — moves between acts; walks
  backward via `firstUnlockedAtOrBelow` so the cursor never strands on a locked
  cabinet. `ArrowDown` past the LAST act steps into the **back wall** (below).
- `1`-`5` → `selectByPosition(state, pos)` — jump directly to the pos-th cabinet in
  the current act (1-indexed); no-ops if locked. **No-op at the back wall.**
- `F` → toggles Free Play (see [[free-play]]). **No-op at the back wall.**
- `Enter`/`Space` → enters the selected cabinet (guarded again against locked
  levels) — or, at the back wall, the focused door's wing.
- `Escape` → clears Free Play, calls `clearDoorFocus(state)`, returns to title.

All key bindings live in `js/main.js`'s `case 'select':` block, not in this file —
`cabinet-art.js` is pure render/navigation-helper, operating on the shared `state`
object (`maxUnlockedLevel`, `selectBypass`, `selectedLevel`, `freePlay`).

## The back wall — the doors to the bonus wings (registry, 2026-09-13)

Past the last act, the cursor steps DOWN into the back of the arcade, where
diegetic doors lead to the bonus wings. **This was a single hard-coded door and a
`state.doorFocused` boolean until 2026-09-13; both are gone.** It is now a
registry, and the select-screen sub-state is **`state.doorIndex`**
(`null` | `0..N-1`, declared in `js/main.js`'s `state`), read only through
`focusedDoor(state)`.

```js
const BACK_WALL_DOORS = [
  { id: 'textworld', label: 'THE GREEN DRAGON · a text world', hint: 'TYPE TO ENTER', art: drawTextWorldDoor, unlock: doorUnlocked },
  { id: 'speedway',  label: 'THE SPEEDWAY · race yourself',    hint: 'TYPE TO ENTER', art: drawSpeedwayDoor,  unlock: doorUnlocked },
];
```

- **Unlock.** `doorUnlocked(state)` = `state.selectBypass || state.maxUnlockedLevel
  >= 25` (`DOOR_UNLOCK_LEVEL`). `availableDoors(state)` filters the registry by each
  row's own `unlock`, so a future wing can carry a different gate.
- **Exports** (all consumed by `js/main.js`): `focusedDoor(state)` — the focused row
  or `null`, tolerating a stale/out-of-range index; `focusDoor(state, id)` — park the
  cursor on a named door (an unknown or still-locked id CLEARS focus, so the cursor
  lands among the cabinets rather than nowhere — this is how each wing hands control
  back through the door it was entered by); `clearDoorFocus(state)`.
- **Rendering** (`renderDoorView`, called from `renderSelectScreen` whenever
  `focusedDoor` is truthy): every unlocked door is drawn **side by side**, in the
  cabinet grid's place, focused one highlighted — the back wall reads as a room with
  doors in it, not one door at a time. The act label becomes
  `◈   THE BACK OF THE ARCADE   ◈`; the prompt is
  `Doors hum softly.   ◀ ▶: CHOOSE   ·   SPACE: ENTER   ·   ↑: BACK` when more than
  one door is open, and `A door hums softly.   SPACE: ENTER   ·   ↑: BACK` when only
  one is. The prev/next lines show the neighbouring door's label (or, above door 0,
  the last act). Door tiles carry `data-door` and **never `data-level`** — which is
  what keeps the moth (below) off them. Each tile is clickable (`focusDoor` + re-render).
- **Navigation can never strand the cursor** (the One Rule): `navigateAct` walks
  `doorIndex` by ±1 and `ArrowUp` from door 0 calls `clearDoorFocus` back into the
  acts; `navigateWithinAct` walks `◀ ▶` between doors and refuses to step off either
  end; Escape leaves the select screen entirely from anywhere.
- **Door art.** `drawDoorShell(canvas, scale, glowTop, glowBottom, spill)` is the
  shared 56×80 shell (dark back wall, stone frame, glowing doorway, light spilling on
  the floor) — the same footprint as `drawCabinet`. Act 6's `drawTextWorldDoor` is an
  emerald doorway with a gold handle and two faint dragon-eyes; Act 7's
  `drawSpeedwayDoor` is a pit-lane roll-up: chequered header board, sunset glow,
  headlights idling in it.
- **Adding a third wing is ONE data row here plus one entry in `js/main.js`'s
  `DOOR_ENTRY` map** — never another edit to `renderDoorView` or `navigateAct`. CSS
  for the longer, sentence-style door labels: `.select-door .cabinet-label` in
  `css/screens.css` (see [[visual-styling]]).

Where each door leads: [[text-worlds]] (Act 6) · [[speedway]] (Act 7).

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
data this screen visualizes) · [[engine-flow]] (key-routing owner + the `DOOR_ENTRY`
map; also owns the duck's Level-22 hint line) · [[easter-eggs]] (WOPR bypass, the moth,
the rubber duck) · [[text-worlds]] and [[speedway]] (the two wings behind the back
wall's doors)

## Reference frames

`docs/screenshots/acts/*.png` — one per act, regenerate a single act page with
`node docs/screenshots/capture-all.js <act-slug> --acts-only` (the `--acts-only` flag
was added 2026-09-11 so a cabinet-art change doesn't drag that act's five gameplay
shots along). `acts/act4-command-center.png` was regenerated 2026-09-11 and now shows
the rubber duck on the Level 20 cabinet. The moth has **no reference frame**: it
appears only after 12s of stillness at a 3%/second roll, and no capture script drives
it — flagged here rather than left silently unvalidated.

**The back wall has no frame in `acts/`** — `capture-all.js` shoots the five act pages
only, and the door view is a sub-state below them. The current reference frames for it
live in the two wings' own sets, and both were regenerated 2026-09-13 when the registry
landed: `docs/screenshots/textworlds/door-standalone.png` (GREEN DRAGON focused,
`capture-textworlds.js door`) and `docs/screenshots/speedway/00-the-speedway-door.png`
(SPEEDWAY focused, `capture-speedway.js door`).

**`acts/*.png` are now STALE (flagged 2026-09-13, not regenerated by this pass —
screenshot regeneration is out of scope for a docs-currency audit).** The note above
("act view unchanged … `CABINET_DATA` are byte-identical") was true only for the
BACK_WALL_DOORS-registry commit earlier the same day; later 2026-09-13 commits
(`d01ce21`, `19228ce`, `781020a`, `f58a1ab`, `8a2672b`, `c0a8d72`, `95ef483`, `97213fa`)
rebuilt `CABINET_DATA` substantially — console-station shells for Levels 8–11 and
13–19, per-cabinet control panels, four corrected cabinet screens (L1/L2/L4/L7), and
corrected Act 1 years. All five `docs/screenshots/acts/*.png` predate this (four from
Jul 18, one from Sep 11) and no longer depict the cabinet art the code now renders.
Regenerate with `node docs/screenshots/capture-all.js` (or per-act with `<act-slug>
--acts-only`) once no other lane is driving a browser against this page's DOM.
