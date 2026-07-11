---
id: O8
kind: observation
title: Hooks work as designed when tested like code
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: adopted
importance: medium
category: tooling
refs: []
---

**O8 — Hooks work as designed when tested like code.** The doc-currency Stop hook's
first live firing correctly caught a genuine gap (game-code change not yet reflected
in ROADMAP) and cleared after a real doc update. Pipe-testing hooks with synthesized
stdin before wiring them is what made that boring instead of surprising.
