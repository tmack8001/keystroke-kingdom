---
id: O17
kind: observation
title: Commit partitioning — split by independent coherent additions
found: 2026-07-12
session: 2026-07-12 wordgen/API hardening (Trevor's direction)
status: addressed
importance: medium
category: docs-process
refs: [L33]
addressed-by: "Practised for the first time at scale on the 2026-09-11..13 branch: 14 commits split by independent coherent addition — fix(static-host), fix(safety) x2, feat(engine), feat(eggs), fix(themes), feat(mobile), fix(tooling), docs, research, feat(act7). Each names its own reasoning and evidence rather than listing files. Two were authored days apart on the same subsystem (the blocklist over-block, then the compound gap the fix reopened) and deliberately kept SEPARATE so the record shows the oscillation and why the second fix is shaped as it is — squashing them would have hidden the lesson journal F27 exists to record."
addressed-date: 2026-09-13
---

**O17 — Commit partitioning: split by independent coherent additions.** Trevor's
direction for when the act5-full-circle tree finally gets committed: don't land it as
one monolith. Split by whatever independent units exist — and he specifically called
out that **the source graph (docs/features/ + scripts/feature-map.json + the
impacted-manifest/doc-currency hooks + content-librarian agent) is a sizable, coherent
addition worth its own commit message**. Expect a lot of overlap between candidate
splits (engine changes thread through themes, docs, screenshots); overlap is fine —
the bar is that each commit message describes ONE coherent addition, not that the
diffs are perfectly disjoint. Candidate partition when the time comes: (1) engine +
persistence + replay + EXPERIENCE; (2) tetris/qbert/theme fixes + cinematic redesigns;
(3) recorder + transcripts + winability validation artifacts; (4) source graph +
librarian + hooks; (5) wordgen (Go API + client + Brewfile/Makefile/Dockerfile);
(6) docs restructure (levels/act*.md split, first-words fix) + journal. Status stays
open until the commits are actually cut. (→ L33)
