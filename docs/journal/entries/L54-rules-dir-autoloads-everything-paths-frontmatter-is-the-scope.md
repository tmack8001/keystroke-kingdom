---
id: L54
kind: learning
title: Everything in .claude/rules/ auto-loads; CLAUDE.md said "not auto-included" and 238k chars of rules were front-loaded every session
found: 2026-11-24
session: 2026-11-24 context-budget trim
status: adopted
importance: medium
category: tooling
refs: [L53]
---

## What happened

Claude Code warned that 19 instruction files totalled 237.9k chars against a 150k limit. CLAUDE.md
claimed most rule files were "not auto-included — load when relevant", but that was false: every
`.claude/rules/*.md` (and subdirectory) loads at session start unless it carries `paths:` frontmatter.
Three of them were additionally `@`-imported, which loads them unconditionally even if scoped.

The claim survived because it was a comment about behaviour, written once and never measured (L53's
shape: the prose asserted a property nobody re-checked).

## What was done

- Added `paths:` globs to every rule except `product.md`, mapped to the files each governs (themes,
  cinematic modules, `tests/**`, playtest scripts, ROADMAP files). No files moved, so every cited path
  and the one test that reads `levels.md` at runtime stay valid.
- Removed the three `@` imports from CLAUDE.md; moved its Built Features Quick Map verbatim to
  `docs/features/QUICK-MAP.md`.
- Always-loaded: ~238k -> ~39k chars.

## What to do

- Scope a rule with `paths:` rather than relocating it; relocation breaks cross-references.
- Never `@`-import a file you also scope — the import defeats the scope.
- Path-scoped rules fire on reads of matching files, so a brand-new file may not trigger its rule;
  keep a hook or a one-line pointer in CLAUDE.md for the must-read ones.
- Unverified at write time: node was broken on this machine (simdjson dylib), so `/memory` was not
  re-checked for the new total and `--index` was not regenerated.
