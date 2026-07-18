---
id: F23
kind: failure
title: Level 8 shipped unwinnable — nothing had ever tried to win it
found: 2026-07-12
session: 2026-07-12 recorder debug + second wave
status: addressed
importance: critical
category: game-design
addressed-by: "Tetris redesign per Trevor's spec (AND-gate: >=8 sequences AND >=4 rows, win latching ONLY on a row-clear event; optimal-but-organic placement; adventure WIPE vs survival fill; accurate NEXT preview) + main.js getNextPattern() now persists past-pool draws at their index. Verified: 2x recorder gold runs exit 0 with rejectedPresses=0, 6000-run simulation 0 failures, win-on-clear probe clean + sloppy, survival + wipe paths confirmed. Reachability audit of all 24 other themes: none at risk, none fire between-beats."
addressed-date: 2026-07-12
refs: [F24, L30, O4, L4]
---

**F23 — Level 8 shipped unwinnable.** tetris.js spawned every piece at one fixed
column (`x = COLS/2 - 1`, never moved horizontally), so a complete 10-wide row — and
the 3-line win gate — was geometrically impossible; `patternComplete()` could never
report won. Compounding engine bug: after the pattern pool exhausts, `getNextPattern()`
returned a fresh independent random draw on every call, desyncing the displayed word
from the word being judged (instrumented: keyboard highlight flipping E→A→I→H across
consecutive reads). Survived every screenshot pass, smoke test, and partial QA because
those verify presence, not victory — it was caught only when the full-game recorder
became the first entity to ever attempt to WIN all 25 levels in sequence. Fix in
flight (sequence-count win gate per Trevor's design + draw-once pattern stability).
(→ F24, L30, O4; the win-gate class was already named in theme-authoring.md — this is
its founding disaster.)
