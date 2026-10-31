---
feature: keyboard-preview
code: [js/ui/keyboard-preview.js]
rules: [.claude/rules/visual-validation.md]
screenshots: docs/screenshots/screens/
capture: node docs/screenshots/capture-screens.js
verified: 2026-10-31 (eighth-key word-withholding note updated; no code change; earlier 2026-10-30: ; glyph)
---

# Keyboard Preview ("KNOW YOUR KEYS")

The canvas screen shown before each level's gameplay, teaching the level's new keys
via reach arrows and animated pixel hands. Invoked from `showKeyboardPreview()` in
`js/main.js` — see [[engine-flow]].

## Geometry — derives from hud.js, never redefines a layout

```js
import { KEY_REACH } from '../levels.js';
import { getKeyGeometry, KEYBOARD_UNITS_PER_ROW } from './hud.js';

const KB_LAYOUT = getKeyGeometry()
  .filter(k => k.key !== null)
  .map(k => ({ key: k.key, label: previewLabel(k.key), row: k.row, col: k.col, w: k.w, never: k.never }));
```
Only the *label* is local to this file — geometry is 100% shared with
[[hud-keyboard-guide]]'s `KEY_LAYOUT`. A code comment records the bug this prevents: an
early build shipped this preview with no number row because the layout was
independently duplicated (journal F5) — now structurally impossible to drift.

## Labels — `previewLabel(key)`

`';'` is no longer masked — it shows the mark printed on its keycap (the WORD "semicolon" stays withheld until the Level 13 key-name beat teaches it; 2026-10-30), `Backspace → ⌫`, `Shift → SHIFT`, `' ' → SPACE`,
`Tab`/`Caps` spelled out literally, lowercase letters uppercased. `Enter` resolves
to a module-level `ENTER_LABEL` constant — `/Mac/.test(navigator.platform ||
navigator.userAgent) ? 'RETURN' : 'ENTER'` — computed once at load (platform never
changes at runtime), since canvas text can't be reached by the DOM `[data-enter-key]`
swap in `js/main.js` that handles every other on-screen instance of the word
(defensive fix, FINDINGS.md TF-3, 2026-07-13). **In practice this label is never
painted today**: `Enter` is one of the three `never: true` structural keys
(alongside `Tab`/`Caps`) in `getKeyGeometry()` (`js/ui/hud.js`), and `never: true`
keys always render as permanent fog with no label drawn at all (see "Three-tier key
coloring" below) — so `previewLabel('Enter')` is dead code on the only path that
currently reaches it. The fix is correct and future-proofed (if `Enter` is ever
taught/highlighted, its label will already be platform-aware) but changes nothing
observable today.

Marks Press Start 2P draws as a few pixels (`isSmallMark` from `hud.js` — `` ` ' , . - = ; ``) are
drawn at `max(9, unitSize*0.56)` instead of the usual `unitSize*0.32`.

## Three-tier key coloring

`never: true` (Tab/Caps/Enter) → always fog, can never be learned/highlighted. Key ∈
`newKeys` → bright `--level-accent` with a pulsing glow. Key ∈ `knownKeys` → dim
`--level-accent-dim`, no glow. Otherwise → fog (`#080808` fill, no label drawn).
Colors are read live via `getComputedStyle` on CSS custom properties, so the screen
automatically matches each level's palette (see [[visual-styling]]).

## Reach visualization

`drawReachArrow()`: for each new key with `KEY_REACH[key].reach === true`, draws a
dashed, bobbing, glowing arrow from the home key (`f` left hand, `j` right hand) to
the target. `drawPixelHand()`: two top-down pixel hands below the keyboard, finger
x-positions anchored to actual home-key columns from `KB_LAYOUT`; the reaching finger
(mapped via `KEY_REACH[key].finger`, with a right-hand index inversion) slides and
lifts toward the target key, animated by a sine wave.

Label priority above the keyboard: the level's own `hint` string → a generated
"STRETCH YOUR \<FINGER\> FINGERS" line → "NEW KEYS: X AND Y" (plain `toUpperCase()` —
the `; → ?` substitution was removed 2026-10-30, so the eighth key reads `;`). Blinking "PRESS SPACE TO CONTINUE" at the bottom.

## Interaction

None in this file — no keydown listener. Space-to-continue is handled entirely by
`js/main.js`'s central per-screen dispatcher (`case 'keyboard-preview':`). The only
listener here is `window resize`, to keep the canvas sized to the viewport while active.

## API

`start(knownKeys, newKeys, hint = null)` — sizes canvas, resets frame counter, starts
the render loop. `stop()` — halts the loop, clears the canvas.

## Related

[[hud-keyboard-guide]] (geometry source of truth) · [[curriculum-data]] (`KEY_REACH`
data) · [[engine-flow]] (invocation, Space handling) · [[visual-styling]] (CSS custom
property palette)
