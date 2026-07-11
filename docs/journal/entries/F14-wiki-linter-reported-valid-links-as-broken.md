---
id: F14
kind: failure
title: The wiki linter reported valid links as broken
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: addressed
importance: medium
category: tooling
addressed-by: Fixed the linter's parser regex to handle escaped-pipe table links, per L7
addressed-date: 2026-07-11
refs: [L7]
---

**F14 — The wiki linter reported valid links as broken.** Obsidian's escaped-pipe
table form `[[page\|label]]` wasn't handled by the first parser regex. Fixed the
parser, not the content — when a tool disagrees with a convention, check which one
is authoritative. (→ L7)
