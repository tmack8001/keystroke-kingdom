---
id: L11
kind: learning
title: Once-per-session state for Stop hooks lives well in .git/
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: adopted
importance: medium
category: tooling
refs: []
---

**L11 — Once-per-session state for Stop hooks lives well in `.git/`** — never
committed, survives the session, keyed by `session_id` from the hook's stdin JSON.
The check-then-act pattern needs a post-write verify when parallel writers exist.
