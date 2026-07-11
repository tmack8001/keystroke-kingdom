---
id: O6
kind: observation
title: Agent failure modes seen this build
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: adopted
importance: medium
category: agent-process
refs: [L15, F10, F11, F12]
---

**O6 — Agent failure modes seen this build:** API connection drop mid-report (twice),
600s stall on resume, hard session-limit kill with zero output. Distinguish "work
lost" from "report lost" before redoing anything. (→ L15, F10–F12)
