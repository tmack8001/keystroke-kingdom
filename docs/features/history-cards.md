---
feature: history-cards
code: [js/history-cards.js]
rules: [research/computing-history-moments.md]
screenshots: docs/screenshots/history-cards/
capture: node docs/screenshots/capture-cards.js
verified: 2026-07-12
---

# History Cards

17 computing-history moments hidden in the curriculum, guaranteed to appear during
normal play and never missable. `js/history-cards.js` is pure data + helpers (no DOM,
no state) — the injection, detection, and gating logic all live in `js/main.js`.

## Data

`HISTORY_CARDS` — object keyed by level number, **17 of 25 levels** have an entry (not
every level hides one — levels 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 22,
24, 25). Each entry: `{ word, title, year, fact }`. Notable: level 22's word is
`'\o/'` (the celebratory ASCII emoticon); level 25's word is `'hello world'` — the only
card word containing a space. `TOTAL_CARDS = Object.keys(HISTORY_CARDS).length`.

## The guaranteed mechanic

In `startGame()` (`main.js`), for curriculum levels with a card, `wordToTokens(word)`
tokenizes the moment word and **splices it directly into `state.patterns`** right
after the intro drills:
```js
state.patterns.splice(level.intro.length, 0, cardTokens);
```
This forces the word into the sequence early — it is not drawn randomly. The
level-completion gate in `handleGameKey` separately enforces it:
```js
const cardPending = !state.freePlay && HISTORY_CARDS[state.level] && !state.cardWordTyped;
if (themeComplete && state.patternsCompleted >= minPatterns && !cardPending) { /* end level */ }
```
Even if the theme's win condition and pattern-count minimum are satisfied, the level
cannot end while `cardPending` is true. Level 24 is special: both the player's-name
pattern (Shift capitals) and the card word (`'Eniac'`) are injected without colliding
— the name lands near front/middle, the card word lands later.

## Mid-play detection ("gold glint")

When a completed pattern's tokens array-match the card's `wordToTokens(card.word)`
(via `patternMatchesCard`), `state.cardWordTyped = true` and a `card-glint` CSS class
is force-retriggered on `.prompt-area`. Purely ambient — no text, no sound, never
pauses input. Flow is never interrupted per the One Rule.

## Level-complete pickup

`showLevelComplete()` populates the `#history-card` panel via `textContent`: word
(uppercased), title, year, fact, and `"CARD {collectedCount()} OF {TOTAL_CARDS}"`, plus
a "NEW!" tag when `collectCard()` reports the card wasn't previously owned. Never shown
in Free Play.

## Persistence

localStorage key **`kk-cards`** — a JSON array of collected level numbers, e.g.
`[4, 5, 8]`. `readCollected()` parses defensively (`[]` on any error/non-array).
`collectCard(level)` is idempotent and try/catch-wrapped (silent no-op if storage
fails — collection just doesn't persist that session). `collectedCount()` returns the
array length. Erased alongside `kk-progress` by the shared `eraseProgress()` in
`main.js` — see [[onboarding-continue]].

## Related

[[curriculum-data]] (the `level.intro` length this splices after) · [[engine-flow]]
(owns all injection/detection/gating logic) · [[free-play]] (cards deliberately
excluded)
