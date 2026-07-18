---
feature: visual-styling
code: [css/base.css, css/screens.css, css/levels.css]
rules: [.claude/rules/visual-validation.md]
screenshots: docs/screenshots/levels/
capture: node docs/screenshots/capture-all.js
verified: 2026-07-12
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

## Related

[[level-themes]] (canvas-side era fidelity, glyph coverage) · [[hud-keyboard-guide]]
(scrim consumers) · [[settings-survival]] (CRT toggle owner) · [[easter-eggs]]
(console banner styling, separate from this CSS layer)
