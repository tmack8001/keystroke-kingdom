---
id: L15
kind: learning
title: Long-running agents die; their work usually doesn't
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: adopted
importance: medium
category: agent-process
refs: [F10, F11, F12, O6]
---

**L15 — Long-running agents die; their work usually doesn't.** API drops, stalls, and
session limits killed three agents this build — in every case the files on disk were
fine and only the final report was lost. Assess repo state before re-running anything.
(→ F10–F12, O6)
