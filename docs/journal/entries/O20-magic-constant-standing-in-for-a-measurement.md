---
id: O20
kind: observation
title: A magic constant standing in for a measurement is a bug waiting for its first long input
found: 2026-09-11
session: 2026-09-11 static-hosting + browser-LLM PM + roadmap swarm
status: adopted
importance: medium
category: graphics
refs: [L16, L28, O11]
---

**`js/themes/wordprocessor.js` computed its text-wrap width as
`(pw - marginX * 2) / (fontSize * 0.62)`. Press Start 2P is monospace with an advance of
exactly `1.0 × fontSize` — measured in a real browser via `ctx.measureText` over a 20-char
run: 16px/char at 16px, 23px/char at 23px. Line length was therefore overestimated by ~61%.**

It had shipped and gone unnoticed because **it is invisible at the default EXPERIENCE tier**:
at 1× the L25 coda's visible text never needs to wrap, so the wrap width is never exercised.
At 1.5× and above — where the coda deliberately grows longer — the document ran past the
paper's right edge, slid *under* the reserved top-right HUD stats region, and spilled off
canvas, violating the theme layout contract in `visual-validation.md`.

Three things worth keeping:

- **A magic constant standing in for a measurement is a bug waiting for its first input long
  enough to expose it.** `0.62` is a plausible-looking number; nothing about it announces
  that it is wrong. `ctx.measureText` is available, exact, and costs nothing at this scale —
  and it stays correct for the `monospace` fallback (which is *not* 1.0) during the frames
  before the webfont loads, which a hardcoded constant cannot do for both.
- **Settings that scale content are a distinct test axis.** The bug lived entirely in the
  space the difficulty levers open up. Anything whose size grows with EXPERIENCE, word
  length, or card count needs verifying at the *top* of its range, not just the default.
  The lane that found it did so only because it ran the capture at all four tiers.
- **It was found by a screenshot tool, not a test.** No assertion covers "text stayed inside
  the page," and writing one is awkward. Rendering it at the extremes and *looking* is what
  worked — which is the same reason `visual-validation.md` exists at all.
