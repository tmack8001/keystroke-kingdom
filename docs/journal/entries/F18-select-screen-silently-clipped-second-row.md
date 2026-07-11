---
id: F18
kind: failure
title: The 10-cabinet select screen silently clipped its second row
found: 2026-06-25
session: 2026-07-11 transcript recon over past sessions (2026-06-22 → 2026-06-25)
status: addressed
importance: medium
category: graphics
addressed-by: Replaced the scale-everything-down patch with the act-paged select screen (↑↓ between acts), per O10
addressed-date: 2026-06-25
refs: [O10]
---

**F18 — The 10-cabinet select screen silently clipped its second row** (`body
{overflow:hidden}`), and the first fix (scale everything down) was the wrong axis —
rejected on legibility, replaced by act paging. (→ O10)
