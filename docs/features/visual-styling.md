---
feature: visual-styling
code: [css/base.css, css/screens.css, css/levels.css]
rules: [.claude/rules/visual-validation.md]
screenshots: docs/screenshots/levels/
capture: node docs/screenshots/capture-all.js
verified: 2026-09-13 (back-wall door labels, #speedway-screen cards, the touch keyboard notice)
---

# Visual Styling

The CSS chrome layer (UI, CRT effect, era-accent colors). Heavy era-fidelity graphics
(sprites, backgrounds, animation) live entirely in canvas — see [[level-themes]]; CSS
carries only the UI/chrome/accent-color layer of era progression.

## CRT scanline effect

`css/base.css`, on `.crt-overlay` (fixed full-viewport div, `z-index: 1000`,
`pointer-events: none`). Two parts: a `repeating-linear-gradient` (0deg) alternating
1px `rgba(0,0,0,0.15)` bands with 2px transparent gaps (the scanlines), plus a
`::after` radial-gradient vignette (transparent center 50% → `rgba(0,0,0,0.4)` edges).
No `filter`/`box-shadow` used here. Toggle: `html.no-crt .crt-overlay { display: none;
}` — applied to `<html>`, deliberately not `<body>`, because `applyLevelTheme()`
resets `body.className` on every level change (see [[onboarding-continue]]). Wired
from [[settings-survival]]'s `crtEffects` field.

## Z-index layering

Confirmed current values: `.screen` = 2, `.invaders-canvas` = 1, `.crt-overlay` =
1000, `.arcade-dots` = -1. Matches the documented "UI above canvas" contract in
`visual-validation.md` exactly.

## Font

Press Start 2P loaded remotely via Google Fonts `<link>` in `index.html` (no local
`@font-face`, no self-hosting), applied globally: `body { font-family: 'Press Start
2P', monospace; }`. See [[level-themes]] for glyph-coverage caveats
(`SMALL_GLYPH_BOOST` in hud.js) — this font silently drops or shrinks some symbols.

## Scrim panels (a11y)

Not one reusable class — the same pattern applied independently to `.prompt-area`,
`.keyboard-guide`, and HUD elements in `css/screens.css`: `background: rgba(0,0,0,
0.72)` + `border: 1px solid rgba(255,255,255,0.08)`, explicitly commented as keeping
text/keys readable over any canvas theme background regardless of that level's
brightness. `css/levels.css` has several follow-up fixes where an individual level's
era-accent color still measured below WCAG contrast even through the base scrim (one
cites 2.43:1) — those strengthen the scrim on that specific level rather than changing
the era-faithful accent color. See [[hud-keyboard-guide]] and `docs/a11y/audit.js`.

## Era-progressive palette (CSS layer)

Per-level, not per-act: `body.level-N { --level-accent: #hex; --level-accent-dim:
#hex; }` blocks in `css/levels.css` for levels 2-25, plus per-level star/dot
decorations and occasional level-specific `@keyframes`. **Level 1 has no
`body.level-1` block** — it falls through to `:root` defaults (`--level-accent:
#39ff14`, CRT green), fitting for Breakout's 1-bit aesthetic. Consumers of
`--level-accent`/`--level-accent-dim`: `.prompt-letter.active`, `.survival-timer-bar`,
`.key-box.active-key`, and others.

## Accessibility

No `prefers-reduced-motion`/`prefers-contrast`/`prefers-color-scheme` media queries
exist anywhere — motion/contrast accommodation is entirely manual (the CRT toggle,
the scrim-panel fixes above). `--atari-dim` was changed from `#555` to `#8a8a8a`
after measuring ~2.3:1 contrast on black (failing WCAG); noted inline in `base.css`.

## Collection gallery card labels (fixed 2026-07-28)

`.collection-cell-label` (the card WORD shown on an owned cell in the [[history-cards]]
collection gallery) previously clipped multi-word words with a CSS ellipsis —
`RUBBER DU…`, `HELLO WOR…` — since it had no wrap rule. It now wraps to a centered
second line instead: `white-space: normal; overflow-wrap: break-word; text-align:
center; line-height: 1.3`, with `max-width: 96px` unchanged, so `RUBBER DUCK` and
`HELLO WORLD` render in full on two lines while single-word labels (which have no
space to break on) stay on one line exactly as before. Cells keep their fixed size —
only the label's own wrap behavior changed. Verified via a regenerated
`docs/screenshots/screens/collection-gallery.png` (synthetic fully-collected slot);
see [[history-cards]] for the before/after detail.

## Back-wall door labels + `#speedway-screen` cards (added 2026-09-13)

Two small additions in `css/screens.css` came with Act 7 ([[speedway]]):

- `.select-door .cabinet-label` — `max-width: 130px; line-height: 1.6; text-align:
  center`. The back wall's doors stand in the cabinet row but carry longer,
  sentence-style labels (`THE GREEN DRAGON · a text world`), so each keeps a column of
  its own instead of stretching the row once two or more doors are open (see
  [[select-screen]] for the registry that made "two or more" possible).
- `.speedway-card` / `.speedway-title` / `.speedway-line` / `.speedway-prompt` — the
  two DOM-only states of the Act 7 wing (`#speedway-loading`, `#speedway-unbuilt`),
  the only parts of that wing that are NOT canvas. Pit-lane amber to match the door:
  `background: rgba(10, 6, 4, 0.86)` + `border: 2px solid var(--crt-amber-dim)` — a
  **scrim panel with full-opacity text over it, never element opacity** (journal
  L2/F3), the same a11y pattern as the prompt/keyboard scrims above. `.speedway-prompt`
  reuses the shared `blink` keyframes.

## Touch-device keyboard notice (added 2026-09-11)

`.keyboard-notice` + `-title`/`-body`/`-hint` style the title-screen card that tells a
touch-primary visitor this cabinet needs a physical keyboard (detection, the
self-dismiss-on-first-keydown behavior, and the "informs, never gates" rule live in
[[engine-flow]]). Same scrim idiom: `rgba(0,0,0,0.55)` plate, `2px solid
var(--crt-green-dim)` border, full-opacity text. It is plain flow content inside
`#title-screen`, directly below `#insert-coin` (`max-width: 460px`, centred by
`margin: 0 auto 34px`) — **not an overlay**: it never covers anything and never blocks
input, which is what makes "informs, never gates" true at the CSS layer too.

## Related

[[level-themes]] (canvas-side era fidelity, glyph coverage) · [[hud-keyboard-guide]]
(scrim consumers) · [[settings-survival]] (CRT toggle owner) · [[easter-eggs]]
(console banner styling, separate from this CSS layer) · [[history-cards]] (the
collection gallery this CSS layer's card-label wrap fix serves) ·
[[onboarding-continue]] (renders the collection gallery screen this CSS styles) ·
[[select-screen]] (the back wall whose door labels this layer sizes) · [[speedway]]
(the wing behind `#speedway-screen`'s two cards)
