---
id: L6
kind: learning
title: Karpathy's llm-wiki scales down gracefully
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: adopted
importance: medium
category: tooling
refs: [L7]
---

**L6 — Karpathy's llm-wiki scales down gracefully.** At ≤100 pages, index-first
navigation + zero-dependency BM25 is the right tool (the gist says so itself);
embeddings are a later, pluggable upgrade. Folder taxonomy + basename wikilinks means
reorganizing never breaks links (Obsidian shortest-path resolution). (→ L7)
