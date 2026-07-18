---
feature: curriculum-data
code: [js/levels.js]
rules: [.claude/rules/levels.md, .claude/rules/levels/act5.md]
screenshots: docs/screenshots/levels/
capture: node docs/screenshots/capture-all.js
verified: 2026-07-13
---

# Curriculum Data

`js/levels.js` (1558 lines, grew from 1320 on 2026-07-13) is pure data — no DOM, no
state — exporting exactly three constants consumed throughout the engine.

## `FINGER_MAP`

Character → uppercase English finger description (e.g. `'f': 'LEFT INDEX FINGER'`,
`' ': 'THUMB — THE BIG KEY'`, `'Backspace': 'RIGHT PINKY — TOP CORNER'`). `FINGER_MAP[';']
= 'RIGHT PINKY FINGER'` — the word "semicolon" never appears in this file. Consumed by
`showFingerHint()` in [[hud-keyboard-guide]].

## `KEY_REACH`

Character → `{ hand: 'left'|'right', finger: 0-3 (pinky-index), reach: boolean }`.
Home-position keys (`f j d k s l a ;`) have `reach: false`; everything else `true`.
Consumed by [[keyboard-preview]] for the reach-arrow and pixel-hand animation. `' '`
and `'Backspace'` have no entry.

## `LEVELS`

Object keyed by level number 1-25. Per-level shape:
```js
{
  name: 'LEVEL N', era: string,
  keys: string[],       // cumulative — every key known through this level
  newKeys: string[],    // keys introduced this level
  hint: string,          // coaching line for the preview screen
  intro: string[][],     // fixed-order warm-up drills
  pool: string[][],      // word bank, shuffled at game start
}
```
Every pattern token: lowercase char/digit/symbol, uppercase A-Z (Shift-typed, exact-case
match required), `' '`, `'Backspace'`.

### Content by stage
- L1-3: pattern drills only (`['j','f','j']`, `['s','l','s','l']`), no real words — L3's
  key set (J F D K S L) has no vowel, so nothing is spellable yet.
- L4-5: first home-row words, once `a` unlocks (`dad`, `lad`, `flask`, `falls`, `salad`).
- L6-12: growing early-reader vocabulary per new key pair.

**Word-length spectrum expansion (2026-07-13):** the real-word `pool` arrays for
every level from 4 through 25 gained additional longer entries (respecting each
level's cumulative key closure — no new key is ever required by an added word)
alongside the pre-existing shorter ones, so the settings-driven MIN/MAX WORD LENGTH
difficulty lever (see [[settings-survival]], [[engine-flow]] "The word-length
DIFFICULTY lever") has real content to select at both ends — short/early-reader
words for a lower MAX, and genuinely harder multi-syllable words (up to 13 letters
at the top end, e.g. `['e','x','t','r','a','o','r','d','i','n','a','r','y']`; also
Level 9's `['t','h','r','e','s','h','o','l','d']`,
`['y','e','s','t','e','r','d','a','y']`; Level 10's
`['t','y','p','e','w','r','i','t','e','r']`) for a higher MIN — note this exceeds
the wordgen server's 12-char `maxPlayWordLen` ceiling (see [[wordgen]]), which
bounds only LLM-generated words; the static curated pool has no such cap. This is
additive
only — no existing pattern was removed or reordered, and `intro` arrays (fixed-order
warm-up drills, always shown first and never subject to the length filter) are
untouched. `[[curriculum-data]]`'s own key-closure invariant (a word never uses a
key beyond that level's cumulative `keys`) was verified to still hold for every
added entry.
- L13: comma introduced as a literal token (`['c','a','r','e',',']`).
- L14: period introduced — first sentence-like prompts (`skill.`, `learn.`).
- L15: `z`/`/` — includes the foreshadowing token run `keyboard/world`.
- L16-20: themed letter+digit mixes per cabinet (SimCity's `city5`, terminal's `hello`/
  `world`). **Level 20's binary→HELLO beat exists only as the plain words
  `hello`/`world` in this data — no literal binary-string tokens.**
- L21: hyphen compounds (`zig-zag`) and subtraction equations as token arrays
  (`['2','-','1','=','1']`).
- L22: bracketed words (`[ok]`), backslash drills (`a\b`), and `\o/`.
- L23: apostrophe contractions (`don't`) and backtick-wrapped code words (`` `run` ``).
- L24 (`newKeys: ['Shift']`, hint "HOLD SHIFT WITH ONE HAND, PRESS WITH THE OTHER"):
  bare-capital drills, title-case name pool (Sun, Moon, Star, Ada, Zoe...). Uppercase
  tokens are just the literal uppercase character — Shift is inferred from case, never
  detected via `e.shiftKey` (see [[engine-flow]]).
- L25 (`newKeys: [' ', 'Backspace']`, hint "THUMBS AND THE TOP CORNER"): fixed sentences
  (`the end`, `i can type`) plus scripted self-correction drills
  (`['j','o','k','Backspace','Backspace','b']`). **Backspace is matched as a literal
  expected token, not real deletion** — no code path removes previously-typed
  characters from any buffer; the "self-correction" is a scripted pedagogical
  simulation, not free-type. There is no free-type paragraph mode built (product.md's
  word-processor finale is a ROADMAP gap).

### The eighth key
Represented in data only as the literal character `';'` — display substitution to the
glyph **`?`** happens entirely downstream in [[hud-keyboard-guide]]/[[keyboard-preview]].
Introduced at Level 4 alongside `a` (hint: "THE FINAL TWO KEYS"); gets a purple-pulse
`mystery` CSS treatment in the guide during Level 4 only.

## Related

[[engine-flow]] (pattern-generation pipeline: `buildPatterns`, `getNextPattern`,
history-card/name injection, `drawablePool`'s word-length filter over this file's
`pool` arrays) · [[settings-survival]] (MIN/MAX WORD LENGTH — the difficulty lever
this file's 2026-07-13 length-spectrum expansion exists to serve) ·
[[hud-keyboard-guide]] (FINGER_MAP, key display) ·
[[keyboard-preview]] (KEY_REACH) · [[level-themes]] (per-level canvas art matched 1:1
to this data) · [[free-play]] (borrows era/theme, replaces `keys`/`pool`) ·
[[wordgen]] (the manifest server-side is derived from this file's `keys`/`pool` shape)
