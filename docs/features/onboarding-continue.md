---
feature: onboarding-continue
code: [js/ui/screens.js]
rules: [.claude/rules/levels.md, .claude/rules/transitions.md]
screenshots: docs/screenshots/screens/
capture: node docs/screenshots/capture-screens.js
verified: 2026-07-19
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
`{ name, furthestLevel, cardsFound }`, one per existing saved game (no fixed count, no
null padding — see [[save-slots]] "no fixed cap"). Rebuilds `#slots-list` from scratch
on every call, via `createElement`/`textContent` only (never `innerHTML` for the
player-chosen name — security.md rule 1): one row per game (cursor, number, name,
`LV <furthestLevel>`, `★ <cardsFound>`), highlighted when `i === state.slotsSelected`,
**plus an always-appended trailing "+ NEW GAME" row** (`.slot-row.slot-new`,
highlighted when `state.slotsSelected === slots.length`). The erase-confirm sub-panel
(`#slots-erase`) and the action hint (`#slots-hint`) are mutually exclusive — showing
one hides the other, so the child is never shown two conflicting instructions at once
(the same rule the old continue screen's erase-confirm followed).

## The collection gallery (`collection` screen)

`renderCollectionScreen(state, cards, collectedSet)` — `cards` is
`allCards()` (all history cards, including the secret one — see [[history-cards]]),
`collectedSet` a `Set` of collected ids for whichever game the picker's `C` key was
pressed on. Rebuilds `#collection-grid`: each card becomes a cell — owned cards show
their word (uppercase) + title, `.owned` styled (green border/glow if `card.secret`);
unfound cards show a `???` silhouette, `.locked` styled and dimmed. Header
`#collection-count` reads `★ {found} / {total}`. Read-only — opening it never changes
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
