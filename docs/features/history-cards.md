---
feature: history-cards
code: [js/history-cards.js]
rules: [research/computing-history-moments.md]
screenshots: docs/screenshots/history-cards/
capture: node docs/screenshots/capture-cards.js
verified: 2026-07-19
---

# History Cards

Computing/gaming-history moments hidden in the curriculum, guaranteed to appear during
normal play and never missable. `js/history-cards.js` is pure data + helpers (no DOM,
no state) — the injection, detection, and gating logic live in `js/main.js`; the
collection **persistence** lives in `js/slots.js` (see [[save-slots]]).

## The model — a flat list, a pool per level, a completionist loop

**Rebuilt 2026-07-19** from a one-card-per-level object into a **flat list**,
`HISTORY_CARDS`, of **41 curriculum cards + 1 secret card** (`TOTAL_CARDS =
HISTORY_CARDS.length`). Each entry: `{ id, level, word, title, year, fact,
legacyLevel?, secret? }`.

- **`id`** — a stable slug (`'ada-lovelace'`, `'qwerty-keyboard'`, …), the collection key
  going forward (levels are no longer the key — a level can hide several cards now).
- **`level`** — the **earliest** curriculum level whose unlocked keys can spell the
  card's word. Multiple cards can share a level (a *pool*): e.g. level 4 carries both
  `ada-lovelace` and `qwerty-keyboard`; level 8 carries `hedy-lamarr`, `atari-founded`,
  and `altair-8800`. Levels 1–3 carry no card by design (no vowel is spellable there).
- **`legacyLevel`** — set only on the original 17 cards, tagging which level they used
  to live at under the old one-per-level model. Purely a migration aid (below); has no
  effect on gameplay.
- **`secret: true`, `level: null`** — never injected into any level's pool; found only
  by typing a magic word. Currently one: `wargames-joshua` (see Easter Eggs, below).
  Still counts toward `TOTAL_CARDS` — a complete collection includes it.

Pure helpers: `allCards()`, `cardsForLevel(level)`, `cardById(id)`,
`legacyLevelToCardId(level)` (migration), `wordToTokens(word)`, `patternMatchesCard`.

## The guaranteed mechanic — exactly one card per play, chosen from the level's pool

`pickGuaranteedCard(level, collectedIds, rotation)` is deterministic (no `Math.random`)
and picks the **one** card a given play of a level will guarantee:
1. Filter `cardsForLevel(level)` to cards **not yet collected** in the active slot; if
   that leaves nothing (the level's pool is already fully collected), fall back to the
   full pool so a level always has a guaranteed card to show.
2. Index into that candidate set with the slot's **per-level rotation counter**
   (`Slots.getCardRotation(level)`, an int starting at 0) so repeat visits — even to an
   already-fully-collected level — cycle through the pool for variety, mirroring Act
   6's riddle-rotation pattern (`js/textworld/riddles.js`'s `_ri`).

In `startGame()` (`main.js`), for curriculum levels the chosen card is stashed as
`state.currentCard` and its word tokenized and **spliced directly into
`state.patterns`** right after the intro drills:
```js
state.patterns.splice(level.intro.length, 0, cardTokens);
```
`Slots.bumpCardRotation(state.level)` advances the counter immediately so the *next*
visit surfaces a different candidate. The level-completion gate in `handleGameKey`
enforces the guarantee:
```js
const cardPending = !state.freePlay && state.currentCard && !state.cardWordTyped;
if (themeComplete && state.patternsCompleted >= minPatterns && !cardPending && !namePending) { /* end level */ }
```
Even if the theme's win condition and pattern-count minimum are satisfied, the level
cannot end while `cardPending` is true. Level 24 is special: both the player's-name
pattern (Shift capitals) and the card word (from level 24's pool, e.g. `'IBM'`) are
injected without colliding — the name lands near front/middle, the card word lands
later.

A level with N cards in its pool takes roughly N visits (replays) to collect them all —
a Skulltula-style completionist loop that rewards replaying a level, not just
progressing past it.

## Mid-play detection ("gold glint")

When a completed pattern's tokens array-match `state.currentCard`'s
`wordToTokens(card.word)` (via `patternMatchesCard`), `state.cardWordTyped = true` and a
`card-glint` CSS class is force-retriggered on `.prompt-area`. Purely ambient — no text,
no sound, never pauses input. Flow is never interrupted per the One Rule.

## Level-complete pickup

`showLevelComplete()` populates the `#history-card` panel via `textContent`: word
(uppercased), title, year, fact, and `"CARD {Slots.collectedCount()} OF {TOTAL_CARDS}"`,
plus a "NEW!" tag when `Slots.collectCardId(card.id)` reports the card wasn't previously
owned **in the active save slot**. Never shown in Free Play.

## Persistence — per save slot

Collection used to be one global `kk-cards` localStorage array of level numbers. It is
now owned by `js/slots.js` (see [[save-slots]]): each save slot carries its own
`cards: [<id>, ...]` array (collected card ids, deduped) and its own
`cardRotation: { "<level>": <int> }` map. `Slots.collectCardId(id)` is idempotent;
`Slots.collectedIds()` / `Slots.collectedCount()` read the **active** slot;
`Slots.slotCards(i)` reads any slot by index (used by the read-only collection gallery
without switching the active game). Two children on one machine now keep two entirely
separate collections.

**Migration**: `legacyLevelToCardId(level)` maps a pre-slots `kk-cards` level number to
that level's original card id via the `legacyLevel` tag, so `Slots.ensureMigrated()` can
fold an old single-save collection into the new Slot 1 without losing it.

Erasing a slot (Settings' "ERASE ALL PROGRESS" row, or the slot picker's per-slot X→Y/N)
clears that slot's cards along with its curriculum progress — see [[save-slots]].

## Collection gallery

A read-only grid (`collection` screen, reached with `C` from the slot picker) over
`allCards()`: an owned card reveals its word (uppercase) + title; an unfound card shows
a `???` silhouette. Secret cards render in green when owned. Header shows
`★ {found} / {total}`. See [[save-slots]] for the screen's key handling and screenshots.

## Easter egg — the secret WarGames card

Typing `joshua` (added 2026-07-19 alongside the existing `shallweplayagame` / `wopr` /
`wargames` WOPR phrases — see [[easter-eggs]]) both triggers the WOPR select-screen
bypass **and** calls `Slots.collectCardId('wargames-joshua')`, awarding the secret card
to whichever slot is currently active (a no-op, harmlessly, if no slot is active yet —
the pre-name-entry dev-bypass path).

## Related

[[curriculum-data]] (the `level.intro` length this splices after) · [[engine-flow]]
(owns all injection/detection/gating logic) · [[save-slots]] (collection persistence,
the slot picker, and the collection gallery screen) · [[easter-eggs]] (`joshua` +
the secret card) · [[free-play]] (cards deliberately excluded)
