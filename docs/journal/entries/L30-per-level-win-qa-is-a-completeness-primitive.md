---
id: L30
kind: learning
title: Per-level win QA is a completeness primitive; scope the player agent explicitly
found: 2026-07-12
session: 2026-07-12 recorder debug + second wave (Trevor's direction)
status: adopted
importance: high
category: agent-process
refs: [F23, F24, O4]
---

**L30 — Per-level win QA is a completeness primitive; scope the player agent
explicitly.** The full-game film found unwinnable Level 8 by brute completeness (2
hours), but a scoped `--single-level=8` run would have caught it in ~2 minutes — the
recorder's exit code IS a win-gate test (0 = won; 3 = stalled/desynced with video
evidence). "Is every level winnable?" is now a cheap 25-way parallel sweep of exit
codes; a level nobody has ever beaten is a level that may not be beatable. Corollary
(Trevor): when a game-player task arrives without scope, the agent must ASK (which
levels/acts, QA vs film, profile, destination) or return a clarification request —
never guess its way into a 25-level recording. Both rules encoded in
`.claude/agents/game-player.md` ("Scope first" + "Per-level win QA" sections). O4
graduates: screenshots verify presence, QA-that-plays verifies function, and only
QA-that-WINS verifies completability. (→ F23, F24, O4)
