---
id: L10
kind: learning
title: Registries load at session start
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: adopted
importance: medium
category: agent-process
refs: []
---

**L10 — Registries load at session start.** Hooks (settings watcher), custom agents
(`.claude/agents/`), and MCP servers all connect when a session begins — same-session
availability is not guaranteed. Plan for "live next session," verify with a smoke call.
