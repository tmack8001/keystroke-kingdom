---
id: F22
kind: failure
title: Second wikilink-parser blind spot in one day
found: 2026-07-11
session: 2026-07-11 vault/hooks/journal build (session close)
status: addressed
importance: medium
category: tooling
addressed-by: Fixed by stripping code spans before link extraction
addressed-date: 2026-07-11
refs: [F14]
---

**F22 — Second wikilink-parser blind spot in one day.** After the escaped-pipe fix
(F14), the linter false-flagged `[[page]]` examples written inside backtick code spans
in the journal headers themselves. Same lesson class, second instance: Obsidian link
syntax has a long tail (tables, code spans, aliases, headings) — parse against real
documents, not imagined ones. Fixed by stripping code spans before link extraction.
