---
id: L33
kind: learning
title: Local-LLM content for a child needs a constraint chain, not trust
found: 2026-07-12
session: 2026-07-12 wordgen build (Trevor's indeterminism design)
status: adopted
importance: high
category: engine
refs: [L4, L32]
---

**L33 — Local-LLM content for a child needs a constraint chain, not trust.** The
wordgen feature (optional Ollama on the game's own server; static fallback everywhere
else) shipped safe because every layer assumes the model's output is garbage until
proven otherwise: charset allowlist = exactly the level's unlocked keys (structurally
caps what can be spelled), length caps, kid-strict blocklist, dedup vs the static pool,
THEN variability filters (max 2 per 2-letter tail, seeded from the static pool so
batches diversify AGAINST it — Trevor's -ly/-er/-s cluster catch), all server-side and
table-tested, re-validated client-side. Architecture lessons that generalize:
(1) deduce-vs-retry — availability is DEDUCED cheaply from a health endpoint (absence
is never retried); only transient 500/timeout gets exponential backoff; (2) generation
never blocks gameplay — background goroutine + cache + next-level prefetch; empty
batches are valid answers; (3) generated content AUGMENTS curated content, never
replaces it, so the fallback path stays byte-identical; (4) privacy by construction —
the request carries the level number, never the player name (the name-moment feature
stayed client-side for exactly this reason). Bonus discovery: generation exposed that
Level 3's charset (jfdksl, no vowels) admits NO real words — the docs' "first real
words at L3" premise was never implementable; first words actually arrive with A at
Level 4 (docs discrepancy flagged to Trevor). (→ L4, L32)
