---
id: L28
kind: learning
title: Shared-canvas 2D state leaks between screens — set text state explicitly
found: 2026-07-11
session: 2026-07-11 follow-up wave (cosmetics agent, Level 20 terminal clip)
status: adopted
importance: medium
category: graphics
refs: [L16, L9]
---

**L28 — Shared-canvas 2D state leaks between screens; set text state explicitly.** The
Level 20 terminal's left-column text clipped off-screen because keyboard-preview.js set
`ctx.textAlign = 'center'` on the shared canvas and never reset it — terminal.js relied
on the default `'left'` and drew centered on its left margin instead. Same class:
`textBaseline` default clipped the progress readout at the top edge. Rule: every theme's
draw function must set `textAlign`/`textBaseline` (and any other inherited ctx state it
depends on) before drawing text — never trust what the previous screen left behind. The
diagnosing agent also burned a detour on ad-hoc scripts silently falling back to the
stale `.dev-url` server — L9's own-server rule applies to every diagnostic invocation,
not just the main validation run.
