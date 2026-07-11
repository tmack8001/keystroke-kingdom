---
id: O1
kind: observation
title: Subagents are injection-suspicious by default, and that's good
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: adopted
importance: medium
category: agent-process
refs: []
---

**O1 — Subagents are injection-suspicious by default, and that's good.** Two agents
independently flagged sibling agents' edits as "changes I cannot vouch for" and one
refused to act on a coordinator message's authority. Right instinct, false alarms —
but plan coordination messages knowing peers will (correctly) distrust them.
