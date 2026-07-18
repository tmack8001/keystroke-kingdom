---
feature: onboarding-continue
code: [js/ui/screens.js]
rules: [.claude/rules/levels.md, .claude/rules/transitions.md]
screenshots: docs/screenshots/screens/
capture: node docs/screenshots/capture-screens.js
verified: 2026-07-12
---

# Onboarding & Continue Screen

`js/ui/screens.js` holds generic screen-switching plus the ready/continue screen
renderers. Key routing for all of these lives in `js/main.js` (see [[engine-flow]]),
not here.

## Screen switching primitives

- `showScreen(name, state)` — hides every `.screen`, unhides `#${name}-screen`, sets
  `state.screen`. Used for every screen transition in the game.
- `applyLevelTheme(level)` — resets `document.body.className`, adds `level-${level}`
  (level > 1 only) so `css/levels.css` per-level palettes apply, then calls
  `updateArcadeDots(level)`.
- `updateArcadeDots(level)` — only does something at level 3 (Pac-Man): populates
  `#arcade-dots` with 30 dots, ~15% chance each of a `.power` (power-pellet) variant.

## Ready screen

`renderReadyScreen(state, level)` fills `#level-intro`. Free Play shows a simplified
block (name/era/"FREE PLAY"/WPM teaser). Curriculum levels show the level name/era, a
"HOME ROW KEYS" (level 1 only) or "NEW KEYS" line, the full key list (new keys styled
distinctly), and `level.hint`. New-key labels: `;` → **"THE EIGHTH KEY"** (never
"semicolon"), `Shift` → "SHIFT", `' '` → "SPACE", `Backspace` → "BACKSPACE". `main.js`
wraps this in `renderReadyScreenWithSurvivalTag()` to also show/hide the
`#survival-tag` badge per the current play style.

## Continue screen (returning player)

`renderContinueScreen(state, level, learnedKeys)` — sets `#continue-name`
(`state.playerName`), `#continue-level` (`"{level.name} — {newKeyLabels}"`, same
eighth-key labeling as the ready screen), and `#continue-learned`
(`KEYS LEARNED: <learned keys>` or empty). Resets the erase-confirm sub-panel visible
state on every render. `showContinueEraseConfirm(show)` toggles the "ERASE ALL
PROGRESS?" sub-panel and inversely hides the normal continue/restart prompts — the
child is never shown two conflicting instructions at once.

**Key handling (in `js/main.js`'s `case 'continue':`)**:
- `Space` → resumes at `state.maxUnlockedLevel` (reads `kk-progress`).
- `R` → shows the Y/N erase confirmation.
- Inside confirmation: **only** `y`/`Y` erases; any other key cancels back to the
  continue screen (never traps the player).

`showContinueScreen()` (main.js) assembles the whole flow: re-reads progress via
`getProgress()`, sets `state.level = p.furthestLevel`, forces `state.freePlay = false`,
calls `renderContinueScreen`, `applyLevelTheme(1)` (continue screen deliberately uses
arcade/level-1 chrome, not the resume level's), `showScreen('continue', state)`.

## localStorage

- **`kk-progress`** (owned by `js/main.js`, read here only via the state object) —
  `{ furthestLevel: 1-25, completed: { "<levelNum>": true, ... } }`.
  `hasProgress()` (`furthestLevel > 1 || completed` non-empty) gates whether `boot()`
  shows this screen at all — a player with no real progress falls through to the
  normal cold-open/title flow instead.
- **`kk-cards`** — erased alongside `kk-progress` by `main.js`'s shared
  `eraseProgress()`, called by both this screen's `R→Y` path and the Settings
  "ERASE ALL PROGRESS" row, so their semantics can't drift apart. `kk-settings`
  (name + preferences) is deliberately untouched by either erase path.

## Related

[[select-screen]] (shares the `maxUnlockedLevel` gate) · [[curriculum-data]] (the
`LEVELS` data these screens render) · [[engine-flow]] (owns all key routing +
`kk-progress` read/write) · [[settings-survival]] (shares the erase mechanic)
