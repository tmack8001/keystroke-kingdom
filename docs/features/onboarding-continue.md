---
feature: onboarding-continue
code: [js/ui/screens.js]
rules: [.claude/rules/levels.md, .claude/rules/transitions.md]
screenshots: docs/screenshots/screens/
capture: node docs/screenshots/capture-screens.js
verified: 2026-10-30 (picker `★ found / total`, R RENAME, erase names the game, context-aware hint, name-field label; earlier 2026-10-29: shelved collection gallery)
---

# Onboarding, the Slot Picker & Collection Gallery

`js/ui/screens.js` holds generic screen-switching plus the ready/slot-picker/collection
screen renderers. Key routing for all of these lives in `js/main.js` (see
[[engine-flow]]), not here. The **model and persistence** behind the slot picker (the
save-slot data itself, migration, erase semantics) is owned by `js/slots.js` — see
[[save-slots]], the primary page for that side of this feature.

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

## The slot picker — "CHOOSE YOUR GAME" (returning-player front door, replaces the retired continue screen)

**Landed 2026-07-19**, replacing the old single-save continue screen entirely (that
screen, and its `kk-progress`-only model, no longer exist). Full behavior — boot
routing, row semantics, the four-case name-entry funnel for a new game, erase, the
collection gallery's data — lives at [[save-slots]]; this section covers only what
`js/ui/screens.js` itself renders.

`renderSlotsScreen(state, slots)` — `slots` is `Slots.listSlots()`: an array of
`{ name, furthestLevel, cardsFound }` (main.js's `pickerSlots()` adds `arcade: { found, total }`), one per existing saved game (no fixed count, no
null padding — see [[save-slots]] "no fixed cap"). Rebuilds `#slots-list` from scratch
on every call, via `createElement`/`textContent` only (never `innerHTML` for the
player-chosen name — security.md rule 1): one row per game (cursor, number, name,
`LV <furthestLevel>`, `★ <found> / <total>` for the arcade bank — falls back to the bare `★ <cardsFound>` only for an older caller that supplies no `arcade`, since `cardsFound` counts every bank and over `TOTAL_CARDS` it would print the `CARD 63 OF 60` defect, INV-100), highlighted when `i === state.slotsSelected`,
**plus an always-appended trailing "+ NEW GAME" row** (`.slot-row.slot-new`,
highlighted when `state.slotsSelected === slots.length`). The erase-confirm sub-panel
(`#slots-erase`) and the action hint (`#slots-hint`) are mutually exclusive — showing
one hides the other, so the child is never shown two conflicting instructions at once
(the same rule the old continue screen's erase-confirm followed). *(2026-10-30)* The erase panel also fills `#slots-erase-name` (`NAME · LV n`, `textContent`), and `#slots-hint` is set per row: `SPACE PLAY · N NEW · R RENAME · C CARDS · X ERASE` on a game, `SPACE START A NEW GAME` on the NEW GAME row or an empty list. The name field's `#name-label` / `#name-confirm-verb` (`index.html`) are set by `main.js` — `ENTER YOUR NAME … TO START` vs `RENAME THIS GAME … TO SAVE`.

## The collection gallery (`collection` screen)

`renderCollectionScreen(state, shelves, collectedSet)` — `shelves` is the output of
`collectionShelves({furthestLevel, collectedIds, bypass})` (one shelf per card bank: THE CABINETS
= the 76-card arcade bank incl. the secret, THE HARDWARE from Level 20, ACT n shelves from
Level 15; see [[history-cards]] "Collection gallery"), `collectedSet` a `Set` of collected ids for
whichever game the picker's `C` key was pressed on (`furthestLevel` comes from that slot, not the
active game). Rebuilds `#collection-shelves`: each shelf gets a head (`.collection-shelf-name` +
`.collection-shelf-count` `glyph found / total`, scoped to its own bank) and a grid of cells —
owned cards show their word (uppercase) + title, `.owned` styled (green if `card.secret`); unfound
show `???`, `.locked`. There is deliberately **no single headline total** (the old
`#collection-count` was removed). The shelves scroll as one column: ↑/↓/PgUp/PgDn/Home/End via
`scrollCollection`, `revealCollection()` (called after `showScreen`) resets scroll and measures the
`▲ MORE ABOVE` / `▼ MORE BELOW` markers; hint line `↑ ↓ SCROLL · ★ FOUND · ??? KEEP PLAYING · ESC
BACK`. Read-only — opening it never changes
which game is active. All text is fixed literal card data (never user input), so
`textContent` is used for consistency with the picker's convention rather than any
security necessity here.

## localStorage

- **`kk-slots`** — owned entirely by `js/slots.js`; see [[save-slots]] for the full
  shape, migration, and lifecycle API. `js/ui/screens.js` never touches localStorage
  directly — it only renders whatever `main.js` hands it from `Slots.*`.
- **Retired**: `kk-progress` and `kk-cards` (the old single-save keys) are migrated into
  `kk-slots` once, then deleted (`Slots.ensureMigrated()`). `kk-settings` (name +
  preferences) is untouched by any of this — it's a separate concern (the *default*
  name prefill on a genuinely fresh cold open, before any game exists).

## Related

[[save-slots]] (the model/persistence/key-routing this screen renders — start here for
full behavior) · [[select-screen]] (shares the `maxUnlockedLevel` gate, now seeded from
the active save) · [[curriculum-data]] (the `LEVELS` data these screens render) ·
[[engine-flow]] (owns all key routing + `Slots` delegation) · [[history-cards]]
(collection gallery data) · [[settings-survival]] (shares the erase mechanic)
