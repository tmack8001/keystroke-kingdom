---
id: L26
kind: learning
title: settings.json hook edits take effect immediately when the watcher is already active
found: 2026-07-11
session: 2026-07-11 vault/hooks/journal build (session close)
status: adopted
importance: medium
category: tooling
refs: [L10]
---

**L26 — settings.json hook edits take effect immediately when the settings watcher is
already active** (a settings file existed at session start), refining L10: the
next-session rule holds for agent definitions and MCP servers, but hooks added
mid-session fired live — including on their own author, this same session.
