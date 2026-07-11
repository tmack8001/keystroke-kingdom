---
id: L1
kind: learning
title: The Go binary embeds assets at compile time
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: adopted
importance: medium
category: engine
refs: []
---

**L1 — The Go binary embeds assets at compile time.** Any js/css/html change requires
`go build -o keystroke-kingdom .` + server restart or you are testing stale code. This
bit us repeatedly until it became a checklist item. (See CLAUDE.md build gotcha.)
