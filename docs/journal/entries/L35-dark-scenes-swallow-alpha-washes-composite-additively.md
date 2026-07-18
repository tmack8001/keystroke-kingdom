---
id: L35
kind: learning
title: Dark scenes swallow alpha washes — composite celebrations additively
found: 2026-07-13
session: 2026-07-12/13 victory-celebration waves
status: adopted
importance: medium
category: graphics
refs: [L34, F24]
---

**L35 — Dark scenes swallow alpha washes; composite celebrations additively.** Two
independent victory-celebration agents (Dragon's Lair, Missile Command) produced the
same failure: the code plainly draws a "golden light wash flooding the room" / "spark
clusters blooming in reds and greens," the report describes it in those words, and the
rendered frame shows a near-black scene with faint dots — because normal
source-over alpha drawing MULTIPLIES into the dark base coat these era scenes are
built on, and the effect vanishes. The fix both revisions converged on:
`globalCompositeOperation: 'lighter'` (inside save/restore) for glow/burst/wash
layers, saturated per-element colors with white-hot cores, and sizes ~3-4x the first
instinct. Two process rules fall out: (1) any celebration or light effect over a dark
scene starts from additive compositing, not alpha — put this in the brief, don't let
the agent discover it; (2) the acceptance test is the PEAK frame under Trevor's
six-year-old test — "would a six-year-old point at the screen?" — judged by the
reviewer from the extracted frame, never from the report's prose (F24's lesson
applied to art: reports describe intent, frames show truth). (→ L34, F24)
