---
feature: visual-styling
code: [css/base.css, css/screens.css, css/levels.css]
rules: [.claude/rules/visual-validation.md]
screenshots: docs/screenshots/levels/
capture: node docs/screenshots/capture-all.js
verified: 2026-10-31 (key-name beat styles; earlier 2026-10-30: complete-card opacity/cue blink)
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

## Collection shelves + scroll markers (added 2026-10-19)

The gallery became shelves ([[history-cards]], [[onboarding-continue]]), and `css/screens.css`
gained: `.collection-scroll-wrap` / `.collection-shelves` (one scrolling column, top padding, a retro
webkit scrollbar that is a bonus only), `.collection-shelf-head` / `-name` / `-count` (each shelf
prints only its own bank's `n / total`), and `.collection-more` / `.collection-more-up` (the
bottom/top fade + `▼ MORE BELOW` / `▲ MORE ABOVE` markers — the real scroll affordance, since a macOS
overlay scrollbar is invisible). `docs/screenshots/screens/collection-gallery.png` regenerated
2026-10-29.

## The key-name beat styles (added 2026-10-31)

`css/screens.css` gained one tint, `--key-name-tint: #d8c4ff` (pale lilac; deliberately not
`--nudge-red`, not the Name Moment's gold, not welcome-green, and not blue, which vanished against
Level 13's slate-blue accent), used by: `.key-name-caption` / `-line` (scrim box anchored under the
prompt panel, ~12:1 contrast, opacity used ONLY for the fade), `#keyboard-guide .key-box.key-name-glow`
(outline ring + pulsing box-shadow, no scale), `.prompt-letter.key-name-flourish` (1.2 s lilac lift,
staggered by `--key-name-delay`), and `.collection-cell-glyph` (the grey mark on a locked KEYBOARD tile).
Behavior: [[hud-keyboard-guide]], [[engine-flow]], [[history-cards]] Bank 4.

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

## Level-complete card, slot picker and settings-confirm styling (2026-10-30, persona playtests)

All in `css/screens.css`; none touches a theme or the z-index stack.

- **`.complete-overlay`** background `rgba(0,0,0,0.75)` -> `0.9`: theme art read through around the
  card (a clipped fragment of Level 4's scene sat under its bottom edge). The inner **card**
  (`.complete-modal`) is now fully opaque `#000` (was `0.92`) — Level 25's "THE END." and credits
  ghosted through the stats — and is width-capped (`box-sizing: border-box; max-width: min(960px,
  94vw)`) because Level 21+ KEYS MASTERED rows grew the card to the viewport and wrapped a lone `=`.
  The KEYS MASTERED row uses `text-wrap: balance`.
- **The next-level cue** (`.complete-prompt`) uses a new `cueBlink` (1.6 s, lit from frame one, dark
  only the last quarter) instead of the shared 50/50 `blink`, so the cue is never absent when a player
  or a screenshot lands on the card.
- **History card text** gets explicit `line-height`s (1.4-1.9), `text-wrap: balance` on title/body, a
  tighter title margin, and `#history-card-year { white-space: nowrap }` so a year range never breaks at
  its dash — Press Start 2P's `normal` line-height is exactly 1em, so any wrapped line touched the next
  ("UNKNOWN" printed into the title under JF). Checked by rendering all 84 cards: 10 collided before, 0
  after.
- **Slot picker:** the last grid column widened (`grid-template-columns: 18px 20px 210px 66px 108px`) and
  `.slot-cards { white-space: nowrap }` so `★ 14 / 76` fits; `.slots-erase-name` styles the new
  "NAME · LV n" line in the erase confirm.
- **Settings confirms:** `.settings-harder-confirm` (amber, glow) for the Survival Y/N and
  `.settings-erase-sub` (7px, dim) for "YOUR SETTINGS STAY" under the erase question.

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
