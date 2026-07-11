---
id: L17
kind: learning
title: Never place theme geometry at horizontal center
found: 2026-06-25
session: 2026-07-11 transcript recon over past sessions (2026-06-22 → 2026-06-25)
status: adopted
importance: medium
category: graphics
refs: []
---

**L17 — Never place theme geometry at horizontal center.** Anything drawn at `W*0.5`
collides with the centered letter prompt; edge-anchored elements never do. This bit the
Joust build three times in one session before becoming a rule.
