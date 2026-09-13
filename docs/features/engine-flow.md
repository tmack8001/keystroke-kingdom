---
feature: engine-flow
code: [js/main.js, js/finale-quote.js, js/keyboard-story.js, js/keyboard-story-gen.js, js/keyboard-story-cache.js, index.html]
rules: [.claude/rules/tech.md, .claude/rules/security.md, .claude/rules/easter-eggs.md, research/wiki/culture/hacker-manifesto.md]
screenshots: docs/screenshots/screens/
capture: node docs/screenshots/capture-screens.js && node docs/screenshots/capture-eggs.js
verified: 2026-09-11
---

**Graph gap note:** three surfaces documented here have no reference frame, flagged
rather than silently left unvalidated. (1) The Name Moment's golden flourish — a
transient CSS animation over the existing game screen, not a distinct screen state.
(2) The eighth-key confession on the level-complete card — `capture-screens.js` shoots
`level-complete-overlay.png` at Level 1, and no script drives a first-ever Level 20
completion. (3) The duck hint line — needs a wrong keypress at Level 22+. All three
could join `docs/screenshots/screens/` if `capture-screens.js` grows the capture paths.
Adaptive pacing needs none: it is observable as `data-pace`, never visual.

# Engine Flow

`js/main.js` (2334 lines) is the single state machine: screen routing, the input
contract, adaptive pacing, the Survival wrapper, returning-player persistence, the
Name Moment, and the EXPERIENCE gate. `index.html` is the one markup file for every
screen.

**`index.html` asset references are relative, never root-absolute** (fixed
2026-09-11): the favicon / apple-touch-icon `href`s were `/favicon.ico` etc., which
resolve to the *domain root* on the published GitHub Pages project page — they 404'd
on the live site while passing every local check. They now match the `css/`/`js/`
references' relative form. Root-absolute paths are forbidden in `index.html` and in js
endpoint constants and import specifiers; the rule, the three-environment table, and
the `scripts/static-host-check.mjs` gate that enforces it live in
`.claude/rules/visual-validation.md` §The Three Environments.

## Screens (`state.screen`)

`title → slots (returning players only, replaces the old single continue screen —
see [[save-slots]]) → ready → keyboard-preview → game → victory → complete → (next
ready, or a cinematic, or back to title)`, plus `collection` (read-only card gallery,
reached from `slots`), `settings`, `gameover` (Survival only), and the four cinematic
screens (`mystery`/`basement`/`commandcenter`/`fullcircle` — see [[cinematics]]). One
giant `document.addEventListener('keydown', ...)` switches on `state.screen`; there is
no per-screen module owning its own listener.

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

TF-H2 (name cap) and TF-H3 (Space at name entry) were both ruled **BY-DESIGN**
(Trevor triage 2026-07-13) and are resolved: the **16-char cap is intended**
("16 characters should be the largest word limit" — roomy for two-word names), and
**Space types a literal space** at name entry with only Return confirming (multi-word
names like the "PLAYER ONE" default need it — name entry is the one screen where Space
is content, not the quick-advance command). `transitions.md` §Phase 3, `onboarding.md`,
and INV-24 all say 16 + Space-types-space, and `persistence-onboarding.test.mjs` carries
passing assertions for both (`TF-H2 by-design: … caps at 16`, `TF-H3 by-design: Space
types a literal space … and does not confirm`).

## The input contract (`handleGameKey`)

Pattern tokens: lowercase chars/digits/symbols, uppercase A-Z (Shift+letter, exact-case
match), `' '`, `'Backspace'`. Regex gate:
`/^[a-zA-Z;,./0-9\-=\[\]\\'\`]$/`. Pure modifier keydowns and unrecognized multi-char
keys are ignored entirely (never counted as a mistake). Case rule: an uppercase A-Z
expected token requires an exact match (Shift held); every other token is compared
lowercase, so CapsLock never affects levels 1-23.

**Correct key**: advance `currentIndex`; on pattern completion, check the history-card
glint against `state.currentCard` (see [[history-cards]]), advance
`currentPattern`/`patternsCompleted`, ask the active theme's `patternComplete()`
([[level-themes]]); level ends only when `themeComplete && patternsCompleted >=
minPatterns && !cardPending && !namePending && !l24NamePending` — the "normal target"
(see `normalTargetMet` below; `l24NamePending` is Level 24's own guaranteed-name gate,
added 2026-09-11 — see "Level 24" below — and is always false on every other level).
**Except on Level 25**, where reaching this normal target launches the "MY STORY"
coda instead of ending the level; the level then ends only once the whole coda has been
typed. `cardPending` is
`!freePlay && state.currentCard && !state.cardWordTyped` — the "exactly one guaranteed
card per play" invariant is unchanged by the 2026-07-19 history-cards rebuild (a level
may now hide a *pool* of several cards, but `pickGuaranteedCard()` still resolves the
pool down to exactly one card, stashed as `state.currentCard`, before the level starts —
see [[history-cards]]). See "Level 25 finale — the walk-the-keyboard coda" below for the
Level 25 exception and its own guaranteed-completion gate.

**Wrong key**: `state.mistakes[expected]++`, `streak = 0`, theme's `miss()` fires,
`Audio.wrong()`, gentle 300ms `.wrong` flash — **the letter never advances**. This is
the One Rule, unconditional, matching CLAUDE.md exactly.

`getNextPattern()` persists any past-the-list random draw at its index
(`state.patterns[state.currentPattern]`) so repeated reads (render vs. validate) never
diverge — the fix for the Level 8/Tetris "unwinnable because a fresh random draw each
call disagreed with the rendered word" class of bug.

## Adaptive pacing (built 2026-09-11 — `tech.md`'s designed-but-unbuilt feature)

`tech.md` §Adaptive Pacing has specified this since the first design pass ("track
average time between correct keypresses … player slows down → game slows down with
them … no hard timer — pace is always derived from the player"); until now nothing
implemented it. It is now the engine's only time-derived behavior outside Survival.

**What "prompt display speed" means in this engine.** There are exactly two places the
base engine decides how fast the game moves on, both in `handleGameKey`: the beat
before the NEXT PATTERN renders (historically a flat `300`ms) and the beat before the
next letter inside a pattern lights up (historically `150`ms). Nothing else in the base
engine is time-driven at all — so those two pauses ARE the prompt display speed, and
they are what adapts, via `paced(baseMs)` → `Math.round(baseMs * state.paceScale)`.

**State + constants** (all in `js/main.js`):

| Name | Role |
|---|---|
| `state.paceSamples` | rolling window of recent inter-keystroke intervals |
| `state.paceScale` | the derived multiplier, `1` at baseline |
| `state.lastCorrectAt` | timestamp of the previous correct keypress |
| `PACE_BASELINE_MS` = 400 | the cadence the 300/150ms pauses were hand-tuned for |
| `PACE_SAMPLE_CAP_MS` = 4000 | one long think can't dominate the average |
| `PACE_WINDOW` = 8 | how many recent intervals the average covers |
| `PACE_MAX_SCALE` = 2 | the gentlest the game will ever get — pauses at most double |

`recordPaceSample(now, sampleable)` runs at the top of the correct-key branch;
`resetPace()` runs in `startGame()`, so a level played months later never inherits a
stale rhythm. `publishPace()` writes `state.paceScale.toFixed(2)` to **`data-pace` on
`#game-screen`** — observable state for tests, never rendered to the player (a visible
"speed" readout would be exactly the pressure the game refuses; product.md §6).

**Why this can never become pressure** — the four properties that make it One-Rule-safe,
and the ones to preserve if it is ever touched:

1. **Clamped to `[1, PACE_MAX_SCALE]`** — it can only ever make a pause LONGER, never
   shorter than the hand-tuned baseline. A player at or above baseline cadence gets
   byte-identical behavior (`data-pace` stays `1.00`). `tech.md`'s "player speeds up →
   game can *optionally* increase pace" is the half deliberately declined: speeding up
   for a fast child is the one direction that could feel like being chased.
2. **It gates nothing.** No prompt is withdrawn, no input window closes, no state
   advances on a clock. The letter still stays and waits forever.
3. **Intervals spanning a MISTAKE are never sampled.** `recordPaceSample` is called
   *before* `wrongOnCurrent` is cleared and passes
   `sampleable = state.currentIndex > 0 && !state.wrongOnCurrent`, so neither the miss
   nor a slow self-correction moves the pace in either direction — the wrong-keypress
   contract stays entirely outside this system. The first key of a pattern is skipped
   too (that interval is render-pause + reading, not typing).
4. **Bounded memory** — an 8-sample window with each sample capped at 4s, so walking
   away and coming back can't distort the feel of the next word.

**Survival**, the one mode with a clock, adapts in the same single direction:
`survivalPatternDuration()` multiplies its allowance by `state.paceScale`, so a slower
typist gets MORE time, never less — "if they're slow, the game slows with them"
(product.md §1) is most load-bearing where a clock exists at all. At baseline this is
byte-identical to the historical formula. Invariants: **INV-70**, **INV-71**; tests in
`tests/integration/adaptive-pacing.test.mjs`.

## Survival wrapper

`state.survival` (`active, quartersRemaining, quartersTotal, survivalStreak,
patternDeadline, patternDuration, remainingAtPause, rafId, lettersTyped`) — always
additive, never read/written unless `settings.playStyle === 'survival'`. Per-pattern
countdown via `requestAnimationFrame`; timeout **replaces the current pattern**
(`drawRandomPattern()`) without penalizing progress — wrong keys never cost time or
quarters, only the clock does. Mercy: every 15-correct-streak returns one quarter (up
to the starting count, `maybeAwardMercyQuarter()`). Zero quarters →
`showGameOver()`. See [[settings-survival]].

## Returning-player persistence — now per save slot (`js/slots.js`)

**Rebuilt 2026-07-19.** Progress used to be one global `kk-progress` localStorage key.
It now lives inside whichever save slot is active (`Slots.getProgress()` /
`Slots.saveProgress(p)`, `js/slots.js`, localStorage key `kk-slots` — full model at
[[save-slots]]); `main.js`'s local `getProgress()`/`saveProgress()` wrappers just
delegate to `Slots`, so every existing call site in this file (`{ furthestLevel: 1-25,
completed: { "<n>": true, ... }, nameMoment, textWorlds }`) is unchanged in shape.
`recordLevelComplete(n)` never regresses `furthestLevel`; Free Play never records.
`Slots.anySlotExists()` gates `boot()`'s choice between the slot picker and the
first-time cold-open/title flow (see [[save-slots]] for the picker itself and the
one-time `kk-progress`/`kk-cards` → `kk-slots` migration). `eraseProgress()` is the
single shared erase helper — it now calls `Slots.eraseActiveSlot()` (clears the active
slot's progress AND its collected cards together, deliberately preserves
`kk-settings` and every OTHER slot) — called identically by Settings' "ERASE ALL
PROGRESS" row and the slot picker's own per-slot `X→Y/N` erase. See [[save-slots]].

## Level 24 — Shift capitals (reworked 2026-09-11)

`buildPlayerNamePattern(playerName)` title-cases each space-separated word (first
letter upper, rest lower), strips non-letters (security.md rule 3), and joins with no
separator (space isn't taught until Level 25). Level 24 is *"the player types their own
name"* (act5.md) — so that pattern is now **guaranteed content with its own win gate**,
not an arithmetic accident.

**The problem it replaced** (ROADMAP §3, "Level 24 pattern crowding"). The name used to
be spliced **twice**: once right after the intro drills and once at the pattern list's
midpoint. Four things were wrong, all of ordering and proportion, none of removal:

1. The midpoint slot (~index 17 of ~35) sits **past where the level actually ends at
   three of the four EXPERIENCE tiers** — Level 24's win is driven by the high-score
   theme's character gate, reached around pattern 11 — so the second copy was
   unreachable dead weight at the default settings.
2. The surviving copy landed at the index immediately after the history-card word, so
   the level's marquee moment was sandwiched between `Eniac` and the first word the
   level teaches.
3. `buildPatterns`'s low-frequency lowercase "familiar visitor" name draw could also
   fire here — a lowercase copy of the name on the **capitals** level, undercutting its
   one lesson.
4. **Nothing win-gated the name at all.** It was reached only because the arithmetic
   happened to work out; a longer history-card word would have silently let the name
   level be won without the name ever appearing.

**What it does now**, in `startGame()`:

- `state.l24NameWord` / `state.l24NameTyped` are reset every play, and set only when
  `state.level === 24 && !state.freePlay` and the sanitized pattern is non-empty.
- The name joins the level's own shuffled pool as **one more capitalized word** — a
  familiar face competing on equal terms with Sun/Moon/Star — spliced at a random index
  at or after `level.intro.length + 3`. This is done FIRST (higher index) so the
  guaranteed splice below can't shift it out from under the calculation.
- The **guaranteed** copy is then spliced at `level.intro.length` — the first pattern
  after the warm-up drills. Both splices use `namePattern.slice()` (independent copies).
- The history-card word's splice index becomes
  `level.intro.length + (state.l24NameWord ? 2 : 0)`, so at Level 24 the card lands two
  slots later with one of the level's own words between them — the player never meets
  two guaranteed injections back to back. Safe by construction: `cardPending` holds the
  level open until the moment word is typed, wherever it sits.
- `buildPatterns` now skips the lowercase familiar-visitor draw entirely when
  `state.level === 24`.

**The win gate.** `patternsEqual(a, b)` (exact token-array equality — needed because
the Level 24 pattern contains uppercase/Shift tokens that `patternMatchesName`'s
lowercase comparison can't handle) sets `state.l24NameTyped` the moment the pattern is
completed. `l24NamePending = !freePlay && state.l24NameWord && !state.l24NameTyped`
joins `cardPending`/`namePending` in `normalTargetMet`, so **the level cannot end until
the capitalized name has actually been typed** — the same never-missable guarantee a
history card has. Always satisfiable: the name is served long before any win is
possible. Completing it fires the theme's normal word celebration, not the golden
flourish (that belongs to the pre-Shift Name Moment below, once ever). Invariant:
**INV-74**; tests in `tests/integration/level24-name.test.mjs`.

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
  **Level 24 is excluded from this draw** (added 2026-09-11): it is the capitals
  ceremony and already injects the name in title case, so a lowercase copy landing among
  the drills both crowded the level and undercut its one lesson. See "Level 24" above.

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

## Level 25 finale — the "MY STORY" coda (REDESIGNED 2026-07-28)

*(Landed 2026-07-27 as an up-front manifesto splice; REDESIGNED 2026-07-28 — this
section describes the current, redesigned behavior only. The old up-front splice is
gone; `js/finale-quote.js` survives, but only as the manifesto DATA module the coda
pulls its capstone lines from.)*

Level 25 (the Word Processor "MY STORY" theme) no longer front-loads its finale. The
level now plays its **normal pool to the traditional win target** exactly like every
other level, and only THEN — once that target is first met — extends **past** it into
an earned **coda**: a short, readable "walk the keyboard" STORY the player types,
covering every letter A-Z, that includes a scripted typo-\>Backspace-\>correct gag
(L25 is where Backspace is taught) and whose FINAL line(s) are the EXPERIENCE-tier
Hacker Manifesto excerpt as its capstone. The coda ROTATES a different story per play
(per-slot `storyRotation`) and gets LONGER at higher EXPERIENCE tiers. This is a guaranteed,
never-missable **post-target** win-gate — the traditional history-card/Name-Moment gates
still fire during normal play, before the coda even begins.

- **Two new data/logic modules, mirroring [[history-cards]]'s shape (pure data + pure
  helpers, no DOM/state/storage):**
  - `js/finale-quote.js` — unchanged in shape from the original 2026-07-27 build, now
    consumed ONLY as the coda's capstone source. `finaleLinesForRatio(winRatio)` still
    resolves four distinct, strictly-increasing tiers (7 → 13 → 17 → 40 lines):
    winRatio 1 (FIRST QUARTER) → "...the beauty of the baud." only; 1.5 (REGULAR) → +
    the truncated belonging line; 2.25 (HOTSHOT) → + "Yes, I am a criminal. My crime is
    that of curiosity."; 3.5 (WIZARD) → its OWN ordered set — the manifesto's
    near-**entire** closing passage verbatim (full belonging line, anti-prejudice
    lines, "...outsmarting you...", "I am a hacker, and this is my manifesto.", "You
    may stop this individual...we're all alike."). The "atomic bombs / wage wars /
    murder" sentence is intentionally omitted at EVERY tier including WIZARD
    (kid-safety); the self-declared-"criminal" content is gated to HOTSHOT+. Verbatim
    source: `research/wiki/culture/hacker-manifesto.md` "Verbatim excerpts." Lines are
    pre-broken into ≤17-char prompt sub-lines; WIZARD's added lines carry straight-ASCII
    apostrophes (`can't`, `we're`, the Level-23 key) — never a curly smart-quote.
  - `js/keyboard-story.js` (NEW) — the coda assembler. `STATIC_STORIES` is a bank of 6
    all-26-letter "pangram" stories (`{ id, base, extra: [...] }`; each `base` alone
    covers every letter, so coverage holds even at the shortest tier and fully
    offline); `TYPO_BEATS` is a small bank of choreographed typo→Backspace→correct
    token beats (e.g. `we cna` → ⌫⌫⌫ → `can do it`) — SCRIPTED content where every
    token is the expected key at its position, so the sacred wrong-keypress contract is
    untouched; `storyBodyForRatio`/`beatCountForRatio` scale the story length and beat
    count up at each EXPERIENCE step (base only at 1×, +1/+2/+3 extra sentences at
    1.5/2.25/3.5; more beats at higher tiers) — more typing, never a penalty
    (product.md §Word Length). `pickKeyboardStory`/`pickTypoBeats` are deterministic
    on the per-slot `storyRotation` counter (no `Math.random`, mirrors the history-card
    rotation) so a different story/beat set surfaces each replay.
    `assembleCoda(story, winRatio, rotation)` composes the final ordered coda as engine
    token lines: `[base sub-lines] + [typo beats] + [extra sub-lines] + [manifesto
    capstone from finale-quote.js]`. `validateGeneratedStory`/`buildStoryPool` validate
    untrusted LLM-generated stories (security.md rules 6-7: charset allowlist, all-26
    coverage on the base, length caps, a safety-word blocklist) — a bad generated story
    is dropped and the static bank is the fallback floor.
- **Optional local-LLM variety (`js/keyboard-story-gen.js`, NEW) + server endpoint:**
  mirrors `js/wordgen.js`'s shape but far simpler — a single fire-and-forget fetch to
  the game's own `/api/keyboard-story?tier=&count=` (main.go `handleKeyboardStory`,
  same-origin only, no player-identifying data) is kicked when Level 25 starts
  (`prefetchKeyboardStories`), and its validated result (or `[]`) is read when the coda
  is assembled a few seconds later. Server-side generation is validated independently
  (charset/coverage/length/blocklist, mirroring the client) before being returned; a
  missing/erroring Ollama yields an empty batch, never a 500. If nothing is ready by
  the time the coda starts, the coda plays entirely on `STATIC_STORIES` — the always-
  working offline floor. This is an enhancement-only layer; **static hosting (no Go
  server) is fully supported with zero behavior loss.** That is not a hypothetical
  fallback: the published GitHub Pages build has **no `/api/*` backend at all**, so the
  coda plays entirely on `STATIC_STORIES` for every player of the free public game — a
  read-only lane verified this session that the coda is winnable there from the static
  bank. `STORY_URL` was changed to the RELATIVE `'api/keyboard-story'` on 2026-09-11
  (same reason as `js/wordgen.js` and `js/chat.js`: a root-absolute path escapes the
  `/keystroke-kingdom/` project-page prefix and hits the shared domain root). See
  `.claude/rules/visual-validation.md` §The Three Environments.
- **Wiring in `js/main.js` — `startCoda()`:** once the level's traditional win target
  is FIRST met (`normalTargetMet` — `themeComplete && patternsCompleted >= minPatterns
  && !cardPending && !namePending && !l24NamePending`, the last of which is always false
  outside Level 24), the engine calls `startCoda()` instead of ending
  the level: it picks a story (`pickKeyboardStory` against `Slots.getStoryRotation(25)`),
  builds the coda via `assembleCoda`, bumps the slot's rotation
  (`Slots.bumpStoryRotation(25)`), TRUNCATES any un-reached normal patterns from
  `state.patterns`, and APPENDS the coda's token lines as the new tail — so the very
  next prompt is the coda's first line, served through the engine's existing
  `getNextPattern()` index mechanism. `state.codaActive`/`state.codaTyped`/
  `state.codaLines`/`state.codaSubLens` track progress. In `handleGameKey`'s
  pattern-completion branch, Level 25 branches specially: if `normalTargetMet &&
  !state.codaActive`, call `startCoda()`; if `state.codaActive && state.codaTyped >=
  state.codaLines.length`, the level ends — otherwise (still in normal play, or
  mid-coda) it falls through to the next prompt. Free Play and every non-25 level are
  untouched (no coda, `codaActive` always false).
- **Rendered via a fresh document paragraph (`js/themes/wordprocessor.js`
  `beginFinale(subLens)`):** the moment the first coda line becomes the active prompt,
  `js/main.js` `maybeSignalCoda()` fires once and calls the theme's `beginFinale()`
  hook with `state.codaSubLens` (the ordered non-Backspace token count per coda line —
  a dynamic, rotating, tier-scaled sequence the theme can no longer derive from
  `finale-quote.js` alone, since it now includes story/typo-beat lines too). The theme
  breaks the document to a fresh paragraph and clamps the visible "story" to a top band
  above the prompt, inserting a display-only space at each sub-line boundary, so the
  accumulated coda (story + resolved typo + manifesto) reads as natural prose instead
  of wrapping behind the prompt or running sub-lines together. This is a render-side
  newline, NOT a typed Enter. `victory()` clears the coda render state for the normal
  centered "THE END." beat.
- **Winnability holds at every tier:** the coda is finite, fully typeable with Level
  25's complete unlocked-key closure, and sits ahead of any pool draw — the One Rule
  floor is intact at winRatio 1 AND 3.5, and `STATIC_STORIES` alone guarantees a
  non-empty, all-26-letter coda with zero server.
- Invariants: INV-62 (manifesto capstone tier escalation/typeability/no-wording-drift),
  INV-63 (guaranteed post-target win-gate), INV-64 (A-Z coverage at every tier,
  offline-guaranteed), INV-65 (tier-scaled length/rotation/typo-beat well-formedness),
  INV-66 (server-side generated-story validation, Go) in `docs/testing/STRATEGY.md`.

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
at [[easter-eggs]]. The 2026-09-11 hidden-layer wave added three more surfaces here,
all deliberately small and all obeying "never interrupt flow":

- **Two more magic words** in `EGGS` — `sudo` and `allyourbase`. Plain table entries;
  no new mechanism, listener, or matching logic.
- **`EIGHTH_KEY_CONFESSION`** — a two-line couplet rendered onto the level-complete
  card by `renderEighthKeyConfession(show)`, the FIRST time a saved game finishes Level
  20. The one-time latch is *derived*, not stored:
  `!state.freePlay && state.level === 20 && !getProgress().completed['20']`, evaluated
  in `showLevelComplete()` **before** `recordLevelComplete` writes that flag — so no new
  persisted field exists and the latch is naturally per saved game. The couplet ends
  with the eighth key's character without ever naming it, so the anonymity rule below
  stays intact. `textContent` + inline styles, `white-space:pre-line`, full-opacity
  muted green rather than element opacity (journal L2/F3). **INV-73**.
- **`DUCK_HINT` / `maybeShowDuckHint()`** — from Level 22 on, the first finger hint
  earned after a wrong keypress carries `STUCK? TELL THE DUCK.` appended beneath it,
  once per page load (`duckHintShown`). It is called immediately after
  `showFingerHint(expected)` in the wrong-key branch and **bails out if `#finger-hint`
  has no `firstChild`**, so it can never replace a hint or appear unprompted — the
  opening finger guide remains the game's single sanctioned unprompted hint. **INV-75**.

Tests for all three: `tests/integration/hidden-layer.test.mjs`.

The eighth key is never rendered as "semicolon" anywhere in this file (`;` → "THE
EIGHTH KEY" wherever a label is built). `[data-enter-key]` elements are swapped to
"RETURN" on Mac / "ENTER" elsewhere via `navigator.platform` detection at module load —
the event handler itself stays `e.key === 'Enter'` on every platform.

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
[[select-screen]] · [[save-slots]] (progress/card persistence owner + the slot picker
that now precedes the returning-player flow, including the L25 `storyRotation` counter
`startCoda` reads) · [[visual-styling]] (z-index/CRT contract this file's
screen-hiding relies on) · `js/finale-quote.js` (Level 25 coda's manifesto-capstone
data module) · `js/keyboard-story.js` (Level 25 coda assembler: static story bank,
typo beats, tier scaling, generated-story validation) · `js/keyboard-story-gen.js`
(Level 25 coda's optional local-LLM prefetch client) — see "Level 25 finale — the
'MY STORY' coda" above; grounded in `research/wiki/culture/hacker-manifesto.md`
