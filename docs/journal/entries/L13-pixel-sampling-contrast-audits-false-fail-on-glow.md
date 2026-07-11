---
id: L13
kind: learning
title: Pixel-sampling contrast audits false-FAIL on glow
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: adopted
importance: medium
category: a11y
refs: [O3]
---

**L13 — Pixel-sampling contrast audits false-FAIL on glow.** Text with big same-hue
text-shadows measures against its own halo; label-less boxes measure as noise. Strip
`text-shadow` before sampling or route decorated elements to visual review. (→ O3)
