---
feature: free-play
code: [js/freeplay.js]
rules: [.claude/rules/product.md]
screenshots: docs/screenshots/freeplay/
capture: node docs/screenshots/capture-freeplay.js
verified: 2026-09-15
---

# Free Play

Full-keyboard, real-sentence typing on any unlocked cabinet, with live WPM. Toggled by
`F` on the select screen (a toggle, not one-way — `F` again turns it back off;
`Escape` also resets it).

## Content

- `FREEPLAY_KEYS` — the entire keyboard: all 26 letters, `; , . /`, digits 0-9,
  `- = [ ] \ ` '`, plus `Shift`, `' '` (space), `Backspace`.
- `SENTENCES` — ~40 shared early-reader sentences.
- `THEMED` — 4 cabinet-flavored sentences per level, for all 25 levels.
- `buildFreePlayPatterns(level)` returns `[...shuffled themed, ...shuffled shared]`,
  each sentence tokenized one engine-token per character (spaces become `' '` tokens,
  uppercase letters preserved for Shift matching).

## Integration (in `js/main.js`)

`buildFreePlayLevel()` builds a shallow "effective level" view: spreads the real level
(so its theme/art/era still apply) but overrides `keys: FREEPLAY_KEYS`, `newKeys: []`,
`intro: []`, `pool: buildFreePlayPatterns(...)`. **`LEVELS` is never mutated.** The
cache is keyed by `state.level` and force-cleared at the top of every `startGame()` so
each session reshuffles fresh, even replaying the same cabinet.

Minimum patterns to complete a session: **5 sentences**
(`minPatterns = state.freePlay ? 5 : level.intro.length`), combined with the theme's
own win condition (`themeComplete`) — see [[level-themes]].

## WPM

`computeWPM(state)` (`js/ui/hud.js`):
```js
elapsedMin = (Date.now() - state.startTime) / 60000
if (elapsedMin < 10/60) return null   // not enough signal yet — displays "--"
return Math.round((state.totalCorrect / 5) / elapsedMin)
```
Standard convention: 1 "word" = 5 correct keystrokes. Shown live in the HUD
(`hud-wpm-line`, visible only when `state.freePlay`) and again on the level-complete
overlay (`final-wpm-row`).

## Survival interaction

Free Play and Survival are genuinely orthogonal — not mutually exclusive. Survival's
per-pattern timer operates on whatever Free Play's `getNextPattern()` returns. One
guarded edge case: if a Survival timeout fires after Free Play's (larger) initial
pattern list is exhausted, the timeout handler must not write out-of-bounds into
`state.patterns[currentPattern]` — it renders the freshly-drawn replacement directly
instead. See [[settings-survival]].

## Completion

Never triggers act cinematics, never advances curriculum progress
(`recordLevelComplete` is skipped when `state.freePlay`), and never shows an *arcade*
history card (`HISTORY_CARDS` stays curriculum-only). Level-complete overlay reads
"FREE PLAY COMPLETE" / "PRESS SPACE FOR THE ARCADE" and always returns to the select
screen (never advances to "next level").

**⚠️ Amended 2026-09-14 — Free Play is no longer card-free.** Once a save has
`furthestLevel >= 15` (the whole keyboard unlocked), the "FREE PLAY COMPLETE" panel
CAN carry an **act card** — the one bank ([[history-cards]]'s `ACT_CARDS`) that reveals
*only* in Free Play and nowhere else. `startGame()` splices the chosen act's word into
the sentence pool near the front (before the shuffled themed/shared sentences), and the
session cannot end until that word has been typed — the same guaranteed-card contract
as a curriculum level. **This briefly made a Free Play session unwinnable** (the
mid-play "word typed" latch that clears the gate was guarded by `!state.freePlay`,
which the act-card layer never accounted for) — fixed 2026-09-15, see
`docs/testing/FINDINGS.md` **TF-A1** and [[engine-flow]]'s `cardPending` section.
Verified live: a Free Play session on Level 1 with `furthestLevel: 20` completes
normally and reveals `QUARTER · THE COIN DOOR · CARD 1 OF 4`.

## Related

[[curriculum-data]] (LEVELS this borrows era/theme from) · [[settings-survival]]
(orthogonal composition) · [[history-cards]] (the arcade bank stays excluded from Free
Play; the act bank reveals *only* here) · [[hud-keyboard-guide]] (WPM display,
full-keyboard guide rendering) · [[engine-flow]] (the act-card splice/win-gate lives in
`js/main.js` `startGame`/`handleGameKey`, not in `js/freeplay.js`)
