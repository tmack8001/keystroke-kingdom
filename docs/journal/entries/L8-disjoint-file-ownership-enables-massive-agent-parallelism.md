---
id: L8
kind: learning
title: Disjoint file ownership enables massive agent parallelism
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: adopted
importance: medium
category: agent-process
refs: []
---

**L8 — Disjoint file ownership enables massive agent parallelism.** Five build agents
in parallel with zero merge conflicts because ownership was file-partitioned in the
spec; features sharing files (Free Play → cards → settings) ran as sequential waves.
