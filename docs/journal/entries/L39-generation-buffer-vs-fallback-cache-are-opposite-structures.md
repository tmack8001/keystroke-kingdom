---
id: L39
kind: learning
title: A generation buffer and a fallback cache are opposite structures — don't conflate them
found: 2026-07-13
session: 2026-07-13 wordgen two-tier supply (fresh buffer + model-down reservoir) + warmup
status: adopted
importance: medium
category: engine
refs: [F25, L38]
---

**The wordgen "cache" was doing two jobs with opposite requirements, and the
conflation caused both open follow-ups at once.** One job was a *generation
hand-off buffer*: the client prefetches the next level, an async generation lands
somewhere, the client consumes it and it's cleared. The other job — the one
Trevor actually wanted — was a *fallback cache*: something to draw on only when the
model can't currently generate, so the game still feels alive through a hiccup.
A single `map[string][]string{}` keyed by `(level, charset)` was pretending to be
both, and it was wrong for each.

The two roles want OPPOSITE keying and lifecycle:

- The **buffer** must be keyed by the *entire request*, including the length
  window. Freshness is the whole point (the LLM exists to make play
  ever-changing), so a buffered batch is served once and never replayed — and a
  batch generated under one `[min,max]` window must never answer a request
  declaring another. Keying by `(level, charset)` alone let a short-word batch
  serve a long-word request until it refilled (the window-staleness follow-up, and
  what made long-word GENERATION testing flaky — see F25).
- The **fallback** must be keyed *coarsely* (level + charset only) and filtered at
  serve time, because its whole value is accumulating a reusable pool across many
  generations and answering *any* window from it. It must be read ONLY when the
  model is down — read it while the model is healthy and you've turned your
  freshness engine back into a static dictionary, exactly the thing the LLM was
  chosen to avoid.

Splitting them fixed both follow-ups cleanly: `cache` (the buffer) is now keyed by
`(level, charset, minLen, maxLen)` and always fresh; `resPool` (the reservoir) is a
bounded/deduped pool fed from every successful generation and served —
window-filtered, shuffled — only when `modelReachable` is false. The design tenet:
**name a structure by its role and let the role dictate its keying and lifecycle;
a hand-off buffer and a reuse cache are not the same object wearing two hats.**

The operational companion lesson, from the same change: **an async generation
budget must exceed the worst-case COLD-START latency of the thing it calls, or the
first request silently fails behind the fallback.** The background gen budget was
30s; a cold llama load is ~40s (F25 measured it), so the very first batch after
a cold model *always* timed out to empty — invisible only because the static pool
covers it. The fix is two-part: warm the model ahead of first use (`keep_alive` on
generate + a rate-limited `maybeWarm()` fired at startup and on every
health→available transition, which the client's act-transition health nudges keep
topped up), and widen the budget (30s→60s) so even an unwarmed cold gen completes.
Warmup is the real fix; the budget bump is the belt.
