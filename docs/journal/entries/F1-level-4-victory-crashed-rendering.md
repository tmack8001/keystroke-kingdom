---
id: F1
kind: failure
title: Level 4 victory crashed rendering for every player
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: addressed
importance: critical
category: engine
addressed-by: Clamped animation frames at the consumer in fighter.js (sentinel frame 9999 no longer fed into arc-radius math)
addressed-date: 2026-07-11
refs: [O4]
---

**F1 — Level 4 victory crashed rendering for every player.** `fighter.js` used a
sentinel frame (9999) for the victory hold pose; it fed an arc radius of −9959 and
threw `IndexSizeError` every victory frame. Shipped for weeks; found only when QA
played to an actual win. Fix: clamp animation frames at the consumer. (→ O4)
