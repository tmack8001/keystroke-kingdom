---
feature: settings-survival
code: [js/settings.js]
rules: [.claude/rules/product.md]
screenshots: docs/screenshots/screens/
capture: node docs/screenshots/capture-screens.js
verified: 2026-07-13
---

# Settings & Survival Mode

*(Includes the 2026-07-12 EXPERIENCE win-ratio addition and the 2026-07-13 MIN/MAX
WORD LENGTH addition — see below.)*

`js/settings.js` owns the settings data model, persistence, and the declarative row
table the Settings screen renders from. The Survival *runtime* wrapper (timers,
quarters countdown) lives in `js/main.js`'s `state.survival` — see [[engine-flow]].

## Data model — `kk-settings` (localStorage)

```js
{
  playStyle: 'adventure',   // 'adventure' | 'survival'
  lives: 3,                 // 1-5, survival only
  difficulty: 'novice',     // 'novice' | 'arcade' | 'expert', survival only
  hintStyle: 'moderate',    // 'subtle' | 'moderate' | 'obvious'
  mistakeDisplay: 'small',  // 'hidden' | 'small' | 'prominent'
  sound: true,
  crtEffects: true,
  statsVisible: true,
  winRatio: 1,              // 1 | 1.5 | 2.25 | 3.5 — EXPERIENCE, see below
  minWordLen: 0,            // 0 (ANY) | 3 | 4 | 5 | 6 | 7 — WORD LENGTH floor, see below
  maxWordLen: 0,            // 0 (ANY) | 4 | 5 | 6 | 7 | 8 | 10 | 12 — WORD LENGTH cap, see below
  playerName: 'PLAYER ONE',
}
```

`sanitize(raw)` merges onto these defaults and validates every field against its
enum/range on load AND save — any garbage or missing field silently falls back to the
default (never throws). `playerName` trims and caps to **16 characters** in this file
(note: the name-entry UI itself caps at a different length — see [[engine-flow]]).
Defaults reproduce the exact pre-settings-feature behavior — a player who never opens
Settings sees zero change.

`loadSettings()` / `saveSettings(s)` / `getSettings()` (cached) are the only exports
touching `localStorage`, wrapped in try/catch — private-mode/storage-full failures
degrade to in-memory-only for that session, never block play.

## EXPERIENCE (win-ratio) — landed 2026-07-12

A multiplier on how much typing a level requires before it can be won — scaling to a
player's typing *experience*, never their age, and never a penalty (higher only ever
means more play). Default is **1x**, byte-identical to pre-feature behavior (the same
"settings are toggles, not defaults" law as everything else here).

```js
export const WIN_RATIO_VALUES = [1, 1.5, 2.25, 3.5];
export const WIN_RATIO_LABEL = {
  1: 'FIRST QUARTER', 1.5: 'REGULAR', 2.25: 'HOTSHOT', 3.5: 'WIZARD',
};
export const WIN_RATIO_DESCRIPTOR = {
  1: 'JUST RIGHT FOR A NEW HAND', 1.5: 'YOU KNOW THIS ROOM NOW',
  2.25: 'FAST FINGERS WANT MORE', 3.5: 'GO THE DISTANCE',
};
```

Labels are aspirational and arcade-voiced — badges of pride, never judgmental tiers.
`getWinRatio()` is **the single source of truth for the live multiplier**: it reads
the cached settings, tolerates garbage, and always returns a valid tier value (falls
back to `1`). Both the engine and individual themes import `getWinRatio()` directly
— never the raw settings object — so the engine's minimum-patterns gate and a
theme's internal win target always scale together. Consumers, all read-only:

- `js/main.js`'s level-completion gate: `minPatterns = Math.ceil(level.intro.length * getWinRatio())`
  (see [[engine-flow]] "EXPERIENCE gate scaling"). Free Play is exempt (fixed
  minimum of 5).
- `js/themes/tetris.js`: `MIN_SEQUENCES = Math.ceil(BASE_MIN_SEQUENCES * getWinRatio())`
  (base 8), the primary binding constraint on Tetris's line-clear win condition.
- `js/themes/qbert.js`: `minSequences = Math.round(BASE_EXTRA_SEQUENCES * (getWinRatio() - 1))`
  (base 5 extra words beyond the pyramid) — at 1x this floor is exactly 0, so the win
  condition is byte-identical to pre-EXPERIENCE Q\*bert (pyramid flip only).

The `EXPERIENCE` row sits in the settings screen between `difficulty` and `hintStyle`
and is **always active** (not gated to Survival — it applies in both play styles).

## MIN/MAX WORD LENGTH — landed 2026-07-13

The word-content sibling of EXPERIENCE: a player-set difficulty lever on which real
words the engine draws from a level's pool, so the game "ages with the player" past
the fixed Level 1-25 curriculum arc (design tenet: `.claude/rules/product.md` §Word
Length, INV-38..41 in `docs/testing/STRATEGY.md`). Shorter words = easier
(younger/newer hands); longer words = harder (older/keyboard-savvy). Two independent
rows, both defaulting to **ANY** (0 = no bound) — an untouched Settings screen changes
nothing.

```js
export const MIN_WORD_LEN_VALUES = [0, 3, 4, 5, 6, 7];
export const MAX_WORD_LEN_VALUES = [4, 5, 6, 7, 8, 10, 12, 0];
```

`getWordLengthRange()` is the single source of truth for the live range — same
pattern as `getWinRatio()`: reads cached settings, tolerates garbage, always returns
a valid `{ min, max }` as plain numbers (ANY-floor → `min: 1`, ANY-cap → `max:
Infinity`, so every pattern length passes by default). `sanitize()` additionally
coerces an inverted bounded range (`minWordLen > maxWordLen`, both non-zero) by
swapping the two — the setting screen can never persist a self-contradictory range.
If sanitize's swap were somehow bypassed, `getWordLengthRange()` has its own
independent min>max guard that degrades to the no-filter range rather than ever
produce an empty window.

`js/main.js`'s `drawablePool(level)` is the sole consumer: it filters a level's
`pool` (real-word entries, not `intro` drills) to lengths in `[min, max]`, with a
**hard winnability fallback** — an emptied filter result falls back to the level's
full unfiltered pool, so no (min, max) combination the UI allows can ever make a
level unwinnable (the One Rule floor is never traded for this setting). Guaranteed
content (intro drills, the history-card word, the Name Moment word, Free Play) is
never routed through the filter at all — see [[engine-flow]] "The word-length
DIFFICULTY lever" for the full consumption detail. `js/levels.js`'s word-bank pools
were expanded across levels 4-25 with longer real words (in addition to the existing
short ones) so the MAX end has real content to select past the early-reader ceiling
of 8, up to 12.

The two rows sit in the settings screen immediately after `EXPERIENCE` and before
`hintStyle`, both **always active** (not gated to Survival, same as EXPERIENCE).

## Difficulty tuning (Survival only)

```js
DIFFICULTY_MULTIPLIER = { novice: 1.6, arcade: 1.1, expert: 0.85 }
DIFFICULTY_LABEL      = { novice: 'NOVICE', arcade: 'ARCADE', expert: 'EXPERT' }
DIFFICULTY_DESCRIPTOR = { novice: 'PLENTY OF TIME', arcade: 'THE CLASSIC PACE', expert: 'FOR SHOWOFFS' }
```
Higher multiplier = more time per pattern (applied in `main.js`'s
`survivalPatternDuration()`). The mercy-quarter mechanic (15-streak → quarter back) is
**not** in this file — it's `js/main.js`'s `state.survival.survivalStreak` +
`maybeAwardMercyQuarter()`.

## Settings rows (`getRows()`)

Twelve declarative rows, in display order: `playStyle`, `lives`, `difficulty`,
`winRatio` (EXPERIENCE), `minWordLen` (MIN WORD LENGTH), `maxWordLen` (MAX WORD
LENGTH), `hintStyle`, `mistakeDisplay`, `sound`, `crtEffects`, `statsVisible`,
`erase`. Each row
has `label`, `values`, `display(v)`, `descriptor(v)`, `active(settings)` (whether
interactive right now — `lives`/`difficulty` are active only when
`playStyle === 'survival'`), and optionally `action: true` (only `erase` — a trigger,
not a cycling value). `applyRowChange(settings, rowIndex, dir)` is the pure
state-transition helper `main.js`'s Settings controller calls on `ArrowLeft`/`Right`;
no-ops on inactive/action rows, otherwise cycles the value and persists immediately.

## Invocation

`Tab` opens Settings from the title screen or the in-game pause overlay
(`state.settingsReturn` tracks which, so `Escape`/`Tab` inside Settings returns to the
right place). `ArrowUp`/`Down` moves the row cursor, `ArrowLeft`/`Right` cycles a
value, `Enter`/`Space` triggers the `erase` row's Y/N confirmation, `Escape`/`Tab`
saves and closes.

Screenshots: `docs/screenshots/screens/settings-adventure-default.png` and
`settings-survival-active.png` both show the MIN WORD LENGTH / MAX WORD LENGTH rows
(both at their ANY default) directly beneath EXPERIENCE — regenerated 2026-07-13.

## Related

[[engine-flow]] (Survival runtime wrapper, mercy quarters, key routing, EXPERIENCE
gate consumption, `drawablePool` word-length filter consumption) · [[level-themes]]
(Tetris/Q\*bert `getWinRatio()` consumers) · [[onboarding-continue]] (shares the
erase-progress mechanic) · [[free-play]] (Survival + Free Play compose
independently; Free Play is exempt from both EXPERIENCE and WORD LENGTH) ·
[[curriculum-data]] (the expanded-length word-bank pools the filter draws from) ·
[[wordgen]] (min/max word length is also declared on the wordgen request wire)
