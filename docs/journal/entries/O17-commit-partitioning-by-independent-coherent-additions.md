---
id: O17
kind: observation
title: Commit partitioning — split by independent coherent additions
found: 2026-07-12
session: 2026-07-12 wordgen/API hardening (Trevor's direction)
status: open
importance: medium
category: docs-process
refs: [L33]
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
