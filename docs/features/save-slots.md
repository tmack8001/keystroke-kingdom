---
feature: save-slots
code: [js/slots.js]
rules: [.claude/rules/security.md]
screenshots: docs/screenshots/screens/
capture: node docs/screenshots/capture-screens.js
verified: 2026-07-19
---

# Save Slots — "CHOOSE YOUR GAME"

**New 2026-07-19.** `js/slots.js` is the single source of truth for **multiple
independent saved games** on one machine. A "saved game" used to be one global thing
spread across three localStorage keys (`kk-progress` + `kk-cards` +
`settings.playerName`) — a shared family computer could only ever hold one child's
progress. Now each game ("slot") bundles its own name, curriculum progress, Act-6
text-world progress, the once-ever Name Moment, and its own collected history-card set
+ per-level card rotation (see [[history-cards]]). File carries no DOM, no rendering —
pure state module (mirrors `freeplay.js`/`history-cards.js`'s "data + helpers only"
pattern); `js/main.js` calls it, `js/ui/screens.js` renders it (see
[[onboarding-continue]]).

## No fixed cap

There is **no limit on the number of saved games** (Trevor, 2026-07-19: "a family may
have more than 3 members — there is no reason to limit"). `slots` is a plain, growable
array; the picker lists every existing game plus a trailing **"+ NEW GAME"** row and is
meant to scroll once the list is long. *(Finding, at time of writing: `.slots-list` in
`css/screens.css` has no `overflow`/`max-height` rule yet, and `#slots-screen` doesn't
set `overflow: auto` either — a long list currently just grows past the viewport rather
than scrolling. Flag for the CSS/screenshot-tooling owner; not something this doc's
owning file, `js/slots.js`, controls.)*

## Storage — `kk-slots`

```js
{ v: 1, active: <index> | null, slots: [ <game>, <game>, ... ] }  // dense array, any length
```
Each `<game>`:
```js
{
  name, furthestLevel, completed, nameMoment, textWorlds, // == the old kk-progress shape
  cards,          // [<card id>, ...] — this game's collected history cards (js/history-cards.js)
  cardRotation,   // { "<level>": <int> } — per-level replay-variety counter
}
```
`readState()` parses inside try/catch and **drops** anything malformed
(`normalizeSlot()` returns `null` for a bad entry, and the read path filters nulls out —
a corrupted game is simply omitted from the list, never crashes the picker). An
`active` pointer outside `[0, slots.length)` is treated as `null`. Absence of the
`kk-slots` key entirely is NOT the same as an empty array — it's what keeps a genuine
first-time machine on the untouched cold-open/title flow (`anySlotExists()` gates this
in `main.js`'s `boot()`).

**PII floor unchanged** (security.md rule 8): the only personal datum per game is the
display name, same floor as before — multiple games just means multiple names.

## Migration — folding the old single save forward

`ensureMigrated(legacyName)` runs once, before the boot decision, and is a no-op if
`kk-slots` already exists. If a legacy `kk-progress` (with real progress) or `kk-cards`
(non-empty) is found, it becomes the **first** entry in the new `slots` array — with its
name from the passed-in `legacyName` (i.e. whatever `kk-settings.playerName` already
was) and its cards remapped id-for-id via `legacyLevelToCardId()` (see
[[history-cards]] — the old model stored collected LEVEL NUMBERS; the new model needs
stable card ids). The migrated game is **not auto-activated** — the slot picker is the
front door now, so even a returning player with exactly one prior save sees the picker
and explicitly picks/resumes it. The legacy `kk-progress`/`kk-cards` keys are removed
afterward so a later stale read can't resurrect them. A genuine first-timer (no real
progress, no cards) is left alone — nothing is written, and the untouched cold-open
plays exactly as before.

## Lifecycle API

- `anySlotExists()` / `count()` — whether/how many games exist.
- `listSlots()` — `[{ name, furthestLevel, cardsFound }, ...]`, one per existing game
  (dense — no null padding since there's no fixed slot count anymore).
- `getActive()` / `setActive(i)` — the active game pointer.
- `createSlot(name)` — **appends** a brand-new game, makes it active, returns its
  index. No index argument anymore (there's nothing to target — it always lands at the
  end of the list).
- `eraseSlot(i)` — removes that game from the array (`splice`), re-indexing everything
  after it. If the erased game WAS active, the active pointer clears (back to the
  picker); if an earlier game was erased, the active pointer shifts down by one so it
  keeps pointing at the same still-existing game.
- `eraseActiveSlot()` — erases whichever game is currently active (public API; not
  currently wired to a UI — the picker's per-game X uses `eraseSlot(i)` directly).
- `eraseAll()` — **factory reset**: removes the whole `kk-slots` key (every saved game),
  keeping `kk-settings`. The Settings screen's "ERASE ALL PROGRESS / ERASE EVERYTHING?" row
  calls this (via `main.js` `eraseProgress()`); a reload afterward cold-opens as a
  brand-new machine. Distinct from the picker's per-game erase.
- `setActiveName(name)` / `activeName()` — rename the active game (used when a player
  re-enters name entry via the ready screen's Escape, on an already-active game).

## Progress + card collection, scoped to the active game

`getProgress()`/`saveProgress(p)` mirror the exact shape `main.js` has always used —
every existing call site in [[engine-flow]] is unchanged. With no active game (e.g. the
WOPR dev bypass before any game is chosen), `getProgress()` returns a safe fresh default
and `saveProgress`/card-collect calls become silent no-ops (the dev path just doesn't
persist).

`collectedIds()` / `collectedCount()` / `collectCardId(id)` (idempotent — returns `true`
only the first time) operate on the active game; `slotCards(i)` reads any game's cards
by index without switching which one is active (used by the read-only collection
gallery, see [[history-cards]]). `getCardRotation(level)` / `bumpCardRotation(level)`
drive the per-level "different card each replay" rotation.

## The slot picker screen (`state.screen === 'slots'`)

Rendering lives in `js/ui/screens.js`'s `renderSlotsScreen()`; key routing lives in
`js/main.js`'s `case 'slots':` — see [[onboarding-continue]] for the render-side detail.
Behaviorally:

- **Boot**: `boot()` calls `Slots.ensureMigrated()` then, if `Slots.anySlotExists()`,
  shows the picker (`showSlotsScreen()`) instead of the old continue screen. A brand-new
  machine (no games at all) falls straight through to the cold-open title/name flow,
  which creates the first game on that flow's own name confirm.
- **Rows**: one per existing game, PLUS an always-present trailing **"+ NEW GAME"**
  row (`rows = slots.length + 1`). `state.slotsSelected` ranges over `[0, rows)` and
  wraps on ArrowUp/ArrowDown; number keys `1`-`9` jump directly to that game (not to the
  NEW GAME row, and only if that many games exist).
- **Space/Enter**: on a game row, resumes it — `Slots.setActive()`, seeds
  `state.playerName`/`state.maxUnlockedLevel`/`state.level` from its progress, and goes
  straight to the READY screen (not the select screen). On the NEW GAME row, routes into
  name entry (`startNewGameFlow()`, below).
- **N**: starts a new game directly, regardless of which row is highlighted.
- **X**: on a game row, shows a Y/N erase confirmation sub-panel (`slots-erase`,
  toggled with `slots-hint`, matching the old continue screen's "never show two
  conflicting instructions" rule). Only `Y`/`y` erases; any other key backs out —
  the child is never trapped.
- **C**: opens the read-only collection gallery for the highlighted game (see
  [[history-cards]] "Collection gallery").
- **Escape**: back to the attract title screen.

### Starting a new game — the shared name-entry funnel

`startNewGameFlow()` sets `state.pendingNewGame = true` and re-enters the SAME
`#name-setup` UI the first-time cold open uses (skipping past "INSERT COIN"), with the
input cleared (not prefilled — a fresh name for a fresh game, unlike the returning-name
prefill elsewhere). On `Enter`, `main.js`'s name-confirm handler resolves which of four
cases applies, in order:
1. `state.pendingNewGame` → `Slots.createSlot(name)` (append a new game).
2. `Slots.getActive() !== null` → `Slots.setActiveName(name)` (renaming the
   already-active game — the ready screen's Escape path).
3. `!Slots.anySlotExists()` → `Slots.createSlot(name)` (the genuine first-time player,
   still on the untouched cold open — this is how the very first game gets created).
4. Otherwise → the WOPR dev/parent bypass with no active game: the name is set on
   `state`/`settings` only, nothing is persisted to any slot.

## Related

[[history-cards]] (per-game collection + rotation this module owns) ·
[[onboarding-continue]] (the render + generic screen-switching side of the picker and
collection gallery, and the retired continue-screen history) · [[engine-flow]]
(`getProgress`/`saveProgress`/`eraseProgress` delegation, boot sequencing) ·
[[select-screen]] (`maxUnlockedLevel` seeded from the active game) · [[settings-survival]]
(ERASE ALL PROGRESS row → `eraseAll()` factory reset)
