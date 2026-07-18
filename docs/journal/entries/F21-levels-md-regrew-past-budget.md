---
id: F21
kind: failure
title: levels.md regrew past the 40k budget that motivated its own split
found: 2026-07-11
session: 2026-07-11 transcript recon over past sessions (2026-06-22 → 2026-06-25)
status: addressed
importance: medium
category: docs-process
refs: [L22]
addressed-by: re-split levels.md by concern (Levels 21-25 detail moved to new .claude/rules/act5-full-circle.md, mirroring the transitions.md split; levels.md 40,970 -> 37,088 bytes) + added a size-budget check to scripts/docs-currency-hook.sh that warns once per session, naming file and size, when any .claude/rules/*.md exceeds 40,000 bytes
addressed-date: 2026-07-11
---

**F21 — levels.md regrew past the 40k budget that motivated its own split** (currently
40,970 bytes; split at 2026-06-25 specifically to get under 40k). No enforcement
exists; added to docs/ROADMAP.md tech debt. Budgets without checks silently regress.

**Updates:**
- 2026-07-11 — Addressed. Split semantically per L22 (by concern, not arbitrary byte-cutting):
  Act 5's per-level detail (Levels 21-25 — corner cabinets, Shift, Space/Backspace) moved to
  new `.claude/rules/act5-full-circle.md`, leaving a summary + pointer in levels.md. The
  cross-act summary tables (Complete Game Assignment Table, Word Bank Expansion, Milestones)
  stayed in levels.md since they span all five acts, not just Act 5. levels.md is now 37,088
  bytes; act5-full-circle.md is 5,234 bytes. CLAUDE.md's "Also load when relevant" pointer
  list updated to include the new file. Enforcement added this time (the gap the original
  finding called out): `scripts/docs-currency-hook.sh` now runs a second, independent
  once-per-session check across all `.claude/rules/*.md` and blocks naming any file over the
  40,000-byte budget, with instructions to re-split by concern. Verified quiet on current
  (in-budget) state and firing correctly against a synthesized 40,001-byte file.
