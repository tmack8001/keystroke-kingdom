---
id: L23
kind: learning
title: Wrapper shrink-wrap defeats width:100%
found: 2026-06-25
session: 2026-07-11 transcript recon over past sessions (2026-06-22 → 2026-06-25)
status: adopted
importance: medium
category: engine
refs: []
---

**L23 — Wrapper shrink-wrap defeats `width:100%`.** An anonymous wrapper div under
`align-items:center` shrink-wraps, so a child's `100%` resolves against overflow width.
Fix: remove the wrapper and drive size via a JS-computed `--key-size` CSS variable.
