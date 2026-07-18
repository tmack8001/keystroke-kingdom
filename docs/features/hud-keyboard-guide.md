---
feature: hud-keyboard-guide
code: [js/ui/hud.js]
rules: [.claude/rules/visual-validation.md]
screenshots: docs/screenshots/levels/
capture: node docs/screenshots/capture-all.js
verified: 2026-07-12
---

# HUD & Keyboard Guide

`js/ui/hud.js` (328 lines) owns the in-game HUD, the ANSI keyboard guide with
fog-of-war, and the prompt renderer. It is **the single source of truth for keyboard
geometry** — [[keyboard-preview]] derives from it rather than redefining a layout.

## HUD elements

`.hud` panel (dim scrim, brightens on hover): `#hud-name` (never hidden, set via
`textContent`), `#hud-accuracy-line` (shown unless stats/mistakes hidden by settings),
`#hud-mistakes-line` ("MISSES", visible only when `mistakeDisplay === 'prominent'`),
`#hud-streak` (always shown), `#hud-wpm-line` (Free Play only — see [[free-play]]),
`#hud-quarters-line` + `#hud-bonus` (Survival only — see [[settings-survival]]).
`updateHUD(state, settings)` computes accuracy (`round(totalCorrect/totalAttempts*100)`,
100 by default) and total mistake count from `state.mistakes`.

## `KEY_LAYOUT` / `getKeyGeometry()` — the one source of truth

`KEY_LAYOUT` models a true ANSI keyboard as 5 rows of `{ k, w?, never? }` specs, each
row summing to exactly **15 units** (`KEYBOARD_UNITS_PER_ROW`): number row (backtick
through `=`, Backspace w:2), qwerty row (Tab w:1.5 `never`, through `\` w:1.5), home
row (Caps w:1.75 `never`, through `'`, Enter w:2.25 `never`), bottom row (Shift w:2.25,
through Shift w:2.75), space row (spacers + Space w:6.25). `getKeyGeometry()` flattens
this into `{ key, row, col, w, never }` descriptors by accumulating widths
left-to-right — this exact function is what [[keyboard-preview]] imports and filters,
never a redefinition.

## Fog of war (`renderKeyboard`)

Class priority per key: `wrong-key` → `active-key` → `fog` (not `never` and not in
`level.keys` — renders shape only, **no label**) → `mystery` (only `;` at Level 4,
purple pulse) → `highlight` (learned, shows label). Structural `never` keys (Tab, Caps,
Enter) are permanent fog regardless of level. Shift dual-highlights both Shift boxes
plus the target letter when the active token is uppercase.

## The eighth key

`displayKey(k)`: `';' → '?'`, `'Shift' → '⇧'`, `' ' → '␣'`, `'Backspace' → '⌫'`,
everything else uppercased. `promptDisplay(token)` is the case-preserving prompt-side
variant (needed for Level 24/25). Neither function, nor any string literal in this
file, ever renders "semicolon".

## `SMALL_GLYPH_BOOST`

Fix for Press Start 2P's near-invisible small punctuation (backtick renders as a
single stray pixel at normal size — journal O11):
`new Set(['`', "'", ',', '.', '-', '='])`. These get class `small-glyph` (64px
font-size + glow) in the active prompt. Four genuinely ambiguous marks
(`` ` ' , . ``) additionally get a quiet caption (`SMALL_GLYPH_CAPTION`, e.g. "TICK
MARK") under the prompt, shown only for the currently active character, via a lazily
created `#kk-prompt-caption` element. Styles are injected once via a dedicated
`<style>` tag rather than added to `css/screens.css`.

## `renderPrompt(state, level, pattern)`

Maps each token to a `.prompt-letter` div (classes `completed`/`active` by position,
`glyph` for `␣ ⌫ ⇧`, `small-glyph` per the boost set), sets the glyph caption, and
calls `renderKeyboard`. Both the prompt panel and keyboard guide sit on `rgba(0,0,0,
0.72)` scrim panels for contrast over any theme's canvas art — see [[visual-styling]].

## Related

[[curriculum-data]] (FINGER_MAP, the data this renders) · [[keyboard-preview]]
(consumes `getKeyGeometry()`) · [[level-themes]] (glyph coverage caveats apply
per-theme too) · [[engine-flow]] (calls `updateHUD`/`renderPrompt`/`renderKeyboard`
from the input handler) · [[visual-styling]] (scrim-panel contrast system)
