---
feature: engine-flow
code: [js/main.js, index.html]
rules: [.claude/rules/tech.md, .claude/rules/security.md, .claude/rules/easter-eggs.md]
screenshots: docs/screenshots/screens/
capture: node docs/screenshots/capture-screens.js && node docs/screenshots/capture-eggs.js
verified: 2026-07-13
---

**Graph gap note:** the Name Moment's golden flourish (below) has no screenshot set —
it's a transient CSS animation over the existing game screen, not a distinct screen
state. It could someday join `docs/screenshots/screens/` if a still-frame capture
technique is worked out; flagging here rather than silently leaving it unvalidated.

# Engine Flow

`js/main.js` (1598 lines) is the single state machine: screen routing, the input
contract, the Survival wrapper, returning-player persistence, the Name Moment, and
the EXPERIENCE gate. `index.html` is the one markup file for every screen.

## Screens (`state.screen`)

`title → continue (returning players only) → ready → keyboard-preview → game →
victory → complete → (next ready, or a cinematic, or back to title)`, plus
`settings`, `gameover` (Survival only), and the four cinematic screens
(`mystery`/`basement`/`commandcenter`/`fullcircle` — see [[cinematics]]). One giant
`document.addEventListener('keydown', ...)` switches on `state.screen`; there is no
per-screen module owning its own listener.

## Name entry — the `#player-name-input` reveal sites

Three places reveal the same `#player-name-input` field, always prefilled with
`settings.playerName` (or `'PLAYER ONE'`): the title screen's coin-insert (`case
'title':`, `!state.coinInserted` branch), the ready screen's `Escape` (back to
name entry), and the select screen's `Enter`/`Space` on an unlocked cabinet
(`case 'select':` — this is the "select-screen rename" path; it re-enters the
title-screen name-entry UI rather than owning separate markup).

**Fixed 2026-07-13 (docs/testing/FINDINGS.md TF-H1):** all three sites now call
`.select()` on the input immediately after `.focus()`, so the prefilled default
is shown selected — matching onboarding.md's "selected and ready to be
overwritten" and transitions.md's "any key press clears the default." Before
this fix only the ready-screen `Escape` path called `.select()`; the title
coin-insert path set `.focus()` with no selection, and the select-screen path
was missing the prefill assignment entirely (so it would occasionally show a
stale or empty value first-frame). A first keystroke now natively replaces the
whole default (typing `O` produces `"O"`, not `"PLAYER ONEO"`); Backspace-first
clears the whole selection at once (native `<input>` selection behavior — a
valid reading of "Backspace works normally," though the doc doesn't spell out
the all-at-once nuance); an empty `Enter` keeps `'PLAYER ONE'` unchanged.

TF-H2 (16-char cap vs. the documented 12) and TF-H3 (Space doesn't confirm
name entry — only `Enter` does, unlike every other screen) remain open per
FINDINGS.md; not touched by this fix.

## The input contract (`handleGameKey`)

Pattern tokens: lowercase chars/digits/symbols, uppercase A-Z (Shift+letter, exact-case
match), `' '`, `'Backspace'`. Regex gate:
`/^[a-zA-Z;,./0-9\-=\[\]\\'\`]$/`. Pure modifier keydowns and unrecognized multi-char
keys are ignored entirely (never counted as a mistake). Case rule: an uppercase A-Z
expected token requires an exact match (Shift held); every other token is compared
lowercase, so CapsLock never affects levels 1-23.

**Correct key**: advance `currentIndex`; on pattern completion, check the history-card
glint (see [[history-cards]]), advance `currentPattern`/`patternsCompleted`, ask the
active theme's `patternComplete()` ([[level-themes]]); level ends only when
`themeComplete && patternsCompleted >= minPatterns && !cardPending`.

**Wrong key**: `state.mistakes[expected]++`, `streak = 0`, theme's `miss()` fires,
`Audio.wrong()`, gentle 300ms `.wrong` flash — **the letter never advances**. This is
the One Rule, unconditional, matching CLAUDE.md exactly.

`getNextPattern()` persists any past-the-list random draw at its index
(`state.patterns[state.currentPattern]`) so repeated reads (render vs. validate) never
diverge — the fix for the Level 8/Tetris "unwinnable because a fresh random draw each
call disagreed with the rendered word" class of bug.

## Survival wrapper

`state.survival` (`active, quartersRemaining, quartersTotal, survivalStreak,
patternDeadline, patternDuration, remainingAtPause, rafId, lettersTyped`) — always
additive, never read/written unless `settings.playStyle === 'survival'`. Per-pattern
countdown via `requestAnimationFrame`; timeout **replaces the current pattern**
(`drawRandomPattern()`) without penalizing progress — wrong keys never cost time or
quarters, only the clock does. Mercy: every 15-correct-streak returns one quarter (up
to the starting count, `maybeAwardMercyQuarter()`). Zero quarters →
`showGameOver()`. See [[settings-survival]].

## Returning-player persistence — `kk-progress`

`{ furthestLevel: 1-25, completed: { "<n>": true, ... } }`. `recordLevelComplete(n)`
never regresses `furthestLevel`; Free Play never records. `hasProgress()` gates
`boot()`'s choice between the continue screen and the first-time cold-open/title flow.
`eraseProgress()` is the single shared erase helper (clears `kk-progress` + `kk-cards`,
deliberately preserves `kk-settings`) — called identically by the continue screen's
`R→Y` and Settings' "ERASE ALL PROGRESS" row. See [[onboarding-continue]].

## Level 24 — Shift capitals

`buildPlayerNamePattern(playerName)` title-cases each space-separated word (first
letter upper, rest lower), strips non-letters, joins with no separator (space isn't
taught until Level 25), and splices the result into `state.patterns` **twice** — once
right after the intro drills, once again at the pattern-list midpoint — alongside the
level's own history-card word injection (`'Eniac'`), which lands later so neither
displaces the other.

## The Name Moment (personalization, pre-Shift)

The player's own name becomes typeable content the instant the level's unlocked key
set can spell it — often long before Level 24's capitalized ceremony (e.g. "oona" is
spellable at Level 12, since O/N/A land earlier than the still-locked letters).
Lowercase only; never for the untouched default "PLAYER ONE"; independent of the
history-card gate (both can guarantee an injection on the same level without
displacing each other).

- `nameWordsFor(playerName)` sanitizes exactly like `buildPlayerNamePattern`
  (security.md rule 3): strips each space-separated word to `[a-zA-Z]`, lowercases,
  drops empties. Returns `[]` for the default name or a name with no letters — both
  mean "no name moment" downstream.
- `wordSpellableAtLevel(word, n)` / `firstSpellableLevel(word)` (search 1..23 only —
  24/25 are excluded as "the moment" target, since 24 owns the capitalized ceremony)
  find the first curriculum level whose cumulative `LEVELS[n].keys` cover every
  letter in the word.
- `nameWordForLevel(playerName, levelNum)` — the name-word (first match wins if
  several share a first-spellable level) whose first-spellable level IS this level.
  That word gets the **guaranteed injection + golden flourish**, exactly once ever.
- `spellableNameWords(playerName, levelNum)` — every name-word already spellable
  by this level (first-spellable ≤ level, excluding the guaranteed-moment level
  itself). These are eligible as a **low-frequency "familiar visitor"** woven into
  `buildPatterns`'s pool at low odds on later levels — ambient, not guaranteed.

**Persistence** — `kk-progress.nameMoment: { name: "<sanitized words joined by space>" }`.
`nameMomentFired(playerName)` compares the current sanitized name against the stored
one; a renamed player earns a fresh moment (the flourish re-fires). Once fired, all
later levels treat the word as an ordinary low-frequency visitor only.

**In `startGame()`**: before `buildPatterns`, `state.nameMomentWord` is set to the
qualifying word only if `nameMomentFired()` is false; `state.nameMomentDone` resets
to `false`. If set, the word is spliced into `state.patterns` right after the intro
drills (after the history-card word, if any, so neither displaces the other) —
guaranteeing it's reached in real play, mirroring the history-card injection
technique exactly.

**Win-gate**: `namePending = !freePlay && state.nameMomentWord && !state.nameMomentDone`
joins `cardPending` in the level-completion condition in `handleGameKey` — the level
cannot end until the name word is typed, same guarantee shape as a history card, but
a fully independent gate. On match (`patternMatchesName`), `fireNameFlourish()` fires
once (`Audio.coin()`, `.prompt-area.name-flourish` CSS bloom, each `.prompt-letter`
gilded left-to-right via a staggered `--name-gold-delay`, a bounded 6-sparkle
`.name-spark` burst per letter, self-clearing after 1.6s) and `markNameMomentFired`
persists it. No pause, no modal — a richer completion effect only (One Rule).
CSS: `css/screens.css` `.name-flourish`/`.name-gold`/`.name-spark` keyframes.

## EXPERIENCE (win-ratio) gate scaling

`js/settings.js`'s `getWinRatio()` (tiers `1 | 1.5 | 2.25 | 3.5`, labeled FIRST
QUARTER/REGULAR/HOTSHOT/WIZARD — see [[settings-survival]]) scales how much typing a
curriculum level requires before it can end. In `handleGameKey`'s pattern-completion
branch:

```js
const minPatterns = state.freePlay
  ? 5
  : Math.ceil(level.intro.length * getWinRatio());
```

At the default 1x this is byte-identical to pre-EXPERIENCE behavior. Free Play keeps
its own fixed minimum of 5 (its own confidence gate, untouched by the setting). The
ratio only ever *raises* the minimum — more play, never a penalty — and
`getNextPattern()` refills the pool infinitely so a higher minimum is always
structurally reachable. The history-card and Name Moment gates are unaffected: both
are still guaranteed at every ratio, independent of `minPatterns`.

Themes with their own internal win targets read the same `getWinRatio()` directly
(never the settings object) so the engine's minimum and a theme's internal target
scale together — see [[level-themes]] for Tetris's `MIN_SEQUENCES` and Q\*bert's
extra-sequence floor, both wired this way.

## The word-length DIFFICULTY lever (landed 2026-07-13)

`js/settings.js`'s `getWordLengthRange()` (MIN/MAX WORD LENGTH rows, both default
ANY — see [[settings-survival]]) scales which REAL WORDS from a level's `pool` are
drawable, the content-axis sibling of the EXPERIENCE ratio above. `drawablePool(level)`
is the sole gate:

```js
function drawablePool(level) {
  const pool = level.pool;
  if (!pool || pool.length === 0) return pool || [];
  const { min, max } = getWordLengthRange();
  if (min <= 1 && max === Infinity) return pool; // no-op fast path (default ANY/ANY)
  const filtered = pool.filter(p => p.length >= min && p.length <= max);
  return filtered.length ? filtered : pool; // winnability fallback — never empties a level
}
```

Word length = token-array length (patterns are arrays of single-char tokens, so this
is letter count, not display width). Two call sites:

- **`buildPatterns`**: `drawablePool(level)` replaces the raw `level.pool` before the
  shuffle-and-splice that also mixes in generated wordgen words (below) and the
  low-frequency Name Moment "familiar visitor" draw.
- **`drawRandomPattern`**: the same filtered-or-fallback set is redrawn from once the
  initial pattern list is exhausted, so the lever stays honored (and safe) on levels
  that run past their fixed pattern list (e.g. Tetris/Q\*bert win-gates). Free Play
  draws from its own unfiltered pool (state.freePlay branch) — the lever is EXEMPT
  there, same exemption as EXPERIENCE.

**The winnability fallback is the hard floor**: if a chosen `(min, max)` would filter
a level's pool to empty (e.g. a high MIN on an early level whose few keys can't spell
long words), `drawablePool` falls back to that level's full unfiltered pool rather
than ever hand the engine an empty draw set — the One Rule is never traded for this
setting. `drawRandomPattern` also guards the fully-empty case defensively (falls back
to the level's last intro pattern) in case a future pool is ever malformed.

**Exempt content** — never routed through `drawablePool`, added elsewhere in the pipe:
intro drills (`level.intro`, always fixed-order), the history-card moment word, the
Name Moment guaranteed word, the Level 24 player-name pattern, and anything Free Play
draws. Filtering guaranteed content would break a win-gate or the personalization
pedagogy, so the filter only ever touches the shuffled real-word pool.

Resolved fresh on every call (never cached at module load) — a mid-session Settings
change takes effect on the next level build or next random draw, mirroring how
`getWinRatio()` is consumed.

## Local-LLM wordgen integration (client side)

`js/wordgen.js` (see [[wordgen]] for the full client/server contract) is imported as
`initWordgen`, `prefetch` (aliased `wordgenPrefetch`), `takeWords` (aliased
`wordgenTakeWords`). Three call sites in this file:

1. **Boot**: `initWordgen()` fires once, fire-and-forget, near the end of the boot
   sequence — a one-shot health probe that never blocks page load. On static hosting
   (no Go server) this fails fast once and wordgen stays silently dormant for the
   session.
2. **`buildPatterns`**: `wordgenTakeWords(state.level, { keys, wrapSample })` is
   called to fetch any already-ready generated batch for the CURRENT level and splice
   it in to *augment* (never replace) the WORD-LENGTH-filtered `drawablePool(level)`
   result above — reducing repeatability so the child trains muscle memory, not
   memorization of a fixed word list. Words are re-validated against the level's own
   key set here (defense-in-depth; the client never trusts even its own server).
   Generated words are already length-bounded server-side against the same live
   `getWordLengthRange()` (via `js/wordgen.js`'s own request-building — see
   [[wordgen]]), so they join the shuffle as-is with no second client-side length
   filter needed here.
3. **`startGame()`**: `wordgenPrefetch(state.level + 1)` warms the **next** level's
   batch while the current one plays (skipped for Free Play), so a batch is usually
   ready by the time the player reaches it. Fire-and-forget; gameplay never waits on
   generation.

If wordgen is inactive (no server, no Ollama, or the batch isn't ready yet),
`takeWords` returns `[]` and the static pool plays completely unchanged — zero
behavior difference, zero console noise, no loading pause anywhere.

## Easter eggs & WOPR bypass

`EGGS`, `SECRET_PHRASES`, and the Konami handler all live in this file — full catalog
at [[easter-eggs]]. The eighth key is never rendered as "semicolon" anywhere in this
file (`;` → "THE EIGHTH KEY" wherever a label is built). `[data-enter-key]` elements
are swapped to "RETURN" on Mac / "ENTER" elsewhere via `navigator.platform` detection
at module load — the event handler itself stays `e.key === 'Enter'` on every platform.

## Victory-window timing (`showLevelComplete`)

The active theme's `victory()` may return its celebration's duration in ms; the
LEVEL COMPLETE card (`#complete-overlay`) is shown right as that animation lands
rather than after a fixed dead-air hold. A non-finite or missing return value falls
back to the historical `4000`; any declared value is clamped to `1200-6000` so a bad
theme return can neither stall the card nor clip the beat mid-animation
(`victoryMs = Math.min(6000, Math.max(1200, declared))`). All 25 themes now export
`victory()`; see [[level-themes]] for the per-theme celebration contract.

## Replay (landed 2026-07-12)

`case 'complete':` handles `r`/`R` by hiding `#complete-overlay`, calling `stopAll()`,
then `startGame()` to restart the **current level** fresh — `kk-progress` is
untouched (replaying never regresses `furthestLevel`), the history-card gate is
re-armed and the level's moment word re-injected, but an already-collected card is not
re-awarded (`collectCard` is collect-once). Offered only at this natural pause point
(after the history card has been presented), never mid-flow. `index.html`'s
`#complete-overlay` carries `.complete-replay` ("PRESS R TO REPLAY");
`#gameover-overlay` (Survival only) reads `.gameover-prompt` ("PRESS SPACE TO REPLAY")
/ `.gameover-replay` ("PRESS ESC FOR THE ARCADE") — `case 'gameover':` handles `Space`
the same way (`startGame()`) and `Escape` returns to the select screen.

## Related

[[curriculum-data]] (LEVELS/FINGER_MAP this file drives, and the length-expanded
word-bank pools `drawablePool` filters) · [[hud-keyboard-guide]]
(render calls: `updateHUD`, `renderPrompt`, `renderKeyboard`) · [[level-themes]]
(theme module contract this file invokes; also consumes `getWinRatio()` directly) ·
[[cinematics]] (four trigger sites) · [[settings-survival]] (EXPERIENCE row,
`getWinRatio` source; MIN/MAX WORD LENGTH rows, `getWordLengthRange` source) ·
[[wordgen]] (client integration points above; word-length range also travels to the
wordgen request) · [[history-cards]] · [[free-play]] · [[easter-eggs]] ·
[[select-screen]] · [[onboarding-continue]] · [[visual-styling]] (z-index/CRT
contract this file's screen-hiding relies on)
