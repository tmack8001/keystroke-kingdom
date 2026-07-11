---
id: L16
kind: learning
title: Align canvas art to canvas space, not DOM space
found: 2026-06-25
session: 2026-07-11 transcript recon over past sessions (2026-06-22 → 2026-06-25)
status: adopted
importance: medium
category: graphics
refs: []
---

**L16 — Align canvas art to canvas space, not DOM space.** `getBoundingClientRect()` on
a flex-centered element gave a mid-viewport answer for "where is the keyboard guide";
the fix that stuck was a canvas-height fraction (`0.82 * H`), like every other theme.
