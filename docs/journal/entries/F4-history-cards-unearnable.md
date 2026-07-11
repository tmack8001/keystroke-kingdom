---
id: F4
kind: failure
title: History cards were routinely unearnable
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: addressed
importance: high
category: game-design
addressed-by: Injection immediately after intro drills + level-completion gated on the word having appeared (js/main.js), per L4
addressed-date: 2026-07-11
refs: [L4]
---

**F4 — History cards were routinely unearnable.** Injection at 70% of the pattern
list sat beyond the typical level-win point; a level could end before its educational
moment appeared. Caught by QA reading the win-gate math, not by playtesting. (→ L4)
