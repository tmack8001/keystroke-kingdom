---
feature: history-cards
code: [js/history-cards.js]
rules: [research/computing-history-moments.md, research/hacker-culture.md]
screenshots: docs/screenshots/history-cards/
capture: node docs/screenshots/capture-cards.js
verified: 2026-07-28
---

# History Cards

Computing/gaming-history moments hidden in the curriculum, guaranteed to appear during
normal play and never missable. `js/history-cards.js` is pure data + helpers (no DOM,
no state) — the injection, detection, and gating logic live in `js/main.js`; the
collection **persistence** lives in `js/slots.js` (see [[save-slots]]).

## The model — a flat list, a pool per level, a completionist loop

**Rebuilt 2026-07-19** from a one-card-per-level object into a **flat list**,
`HISTORY_CARDS` (`TOTAL_CARDS = HISTORY_CARDS.length`). Each entry: `{ id, level,
word, title, year, fact, legacyLevel?, secret? }`.

- **2026-07-19 rebuild:** 17 → 41 curriculum cards + 1 secret (42 total).
- **2026-07-27 expansion:** +13 more curriculum cards — a 1970s–90s hacker/phreak/
  underground-culture batch (war dialing, trashing/dumpster-diving, Legion of Doom,
  phone phreaking, Masters of Deception, the Hacker Ethic, the origin of "spam," the
  first BBS, the Hacker Manifesto, Phrack, the word "cyberpunk," the acoustic
  coupler, and *2600: The Hacker Quarterly*) — citation-verified by the
  arcade-historian in `research/hacker-culture.md` +
  `research/wiki/culture/*`, `research/wiki/people/*`, `research/wiki/moments/*`.
  Same "curiosity, not crime" editorial framing as the rest of the bank — these
  are stories about relentless curiosity toward machines, told the way the game's
  own ethos already frames the mystery cabinet and the console banner easter eggs.
  New cards land on levels 6, 8, 9 (×2), 11 (×3), 12 (×2), 13 (×3), and 20 —
  each at its earliest-typeable level (INV-56), so an already-carded level's pool
  simply grows (e.g. level 11's pool went from one card to four).
- **Current total: 54 curriculum cards + 1 secret card = 55** (`TOTAL_CARDS === 55`).

Field shape per entry:
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

**Verified against all 55 cards (2026-07-27):** a fully-collected gallery screenshot
(`docs/screenshots/screens/collection-gallery.png`) shows `★ 55 / 55`, all 13 new
hacker-culture cards render with no clipping, and the secret `JOSHUA` card still
renders in green.

**Multi-word label truncation — fixed 2026-07-28.** The prior finding (the two-word
card WORDS `rubber duck` and `hello world` truncating with an ellipsis, `RUBBER DU…` /
`HELLO WOR…`, since `.collection-cell-label` had no wrap rule) is resolved:
`css/screens.css`'s `.collection-cell-label` now wraps a multi-word label to a
centered second line (`white-space: normal; overflow-wrap: break-word`) instead of
ellipsis-clipping; single-word labels are unaffected and cells keep their fixed size.
Owned by [[visual-styling]] (outside this page's `code:` scope) — see that page for
the rule itself. `docs/screenshots/screens/collection-gallery.png` was regenerated
(synthetic fully-collected slot, same recipe as the 2026-07-27 verification pass) and
now shows both `RUBBER DUCK` and `HELLO WORLD` in full, two-line, no clipping;
`★ 55 / 55` and zero `scrollHeight` overflow reconfirmed.

**Capture tooling — `capture-cards.js` fixed (2026-07-27/28).** The script was
previously broken independent of any content change (its wire-check assumed the
pre-2026-07-19 object-keyed `HISTORY_CARDS` shape and an object-keyed `Object.keys()`
scan against what is now a flat array, plus a stale `CARD_LEVELS` list) — it exited
fatally on any invocation. It has since been rewritten for the flat-array/pool model
(pulls the live `HISTORY_CARDS` array in-page, derives its expected set and the
"CARD n OF N" check from that data rather than a literal) and re-run in full:
`docs/screenshots/history-cards/` now holds all **54 pooled cards** as
`<level>-<id>.png` (e.g. `13-colossal-cave.png`, `25-hello-world.png`,
`25-rubber-duck.png`) plus the one secret card as `secret-wargames-joshua.png` — 55
files total, zero console errors, zero guaranteed-capture failures.

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
