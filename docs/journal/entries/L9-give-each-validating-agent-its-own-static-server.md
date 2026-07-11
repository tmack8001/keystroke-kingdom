---
id: L9
kind: learning
title: Give each validating agent its own static server
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: adopted
importance: medium
category: agent-process
refs: []
---

**L9 — Give each validating agent its own static server.** `python3 -m http.server
<unique port>` per agent lets everyone screenshot/iterate without fighting over the
real dev server (which stays untouched until final QA).
