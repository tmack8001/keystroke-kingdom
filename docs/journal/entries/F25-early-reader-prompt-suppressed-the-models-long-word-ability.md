---
id: F25
kind: failure
title: I claimed the LLM couldn't make long words — it was the prompt suppressing it
found: 2026-07-13
session: 2026-07-13 word-length WIZARD tier + wordgen ceiling
status: addressed
importance: high
category: research-integrity
addressed-by: "buildGenPrompt (main.go) made length-aware: a long-word floor (minL>=8) drops the 'early-reader / a 5-year-old would recognize' framing and asks for 'real, common, recognizable English words — longer is good' for 'an older, skilled typist'; minL>=6 is a middle tier; safety + charset rules hold at every tier (enforced downstream regardless). Wordgen ceiling raised 12→24, MIN extended to single-steps ANY→12 so a player can demand long words. Go test TestGeneratePromptFramingAgesWithLength asserts the adaptation. Verified: server pipeline now returns real long words (dissatisfied, heterogeneous, etc.)."
addressed-date: 2026-07-13
refs: [L38, F6, L39]
---

**F25 — "the LLM can't reliably make valid 16–24 letter in-key words" was my
assertion, written into the code comments and product.md as fact. Trevor challenged
it ("I would disagree — let's test that theory instead of claiming it"), and the test
proved me wrong.** The model was never the limit; the *prompt* was.

The wordgen prompt was hardcoded to "a typing game for a young child learning to
read … simple, common, kid-friendly early-reader words … real English words a
5-year-old would recognize." When the word-length difficulty setting asks for long
words (min 13+), that framing directly contradicts the length rule — and the model
resolves the contradiction toward the *audience*, not the length. Measured A/B on
llama3.2, same key set, same "13 to 24 letters" rule:

- Early-reader framing: **1 of 111** words were ≥13 letters (able, base, beds, bee…).
  The min-length filter then drops all the short ones → the server returned **0**.
- Length-aware framing ("older, skilled typist, hard challenge"): **17 of 17**
  ≥13 letters, all real (accomplishments, disproportionate, pharmacological…).

Direct generation is fast (~8s) and rich (Anticipatory, Uncommunicative,
Electrophoresis…). Through the server it works too — a patient probe returned
`dissatisfied`, `heterogeneous` — with two real caveats that made it *look* broken
while I debugged: (a) cold llama load after a server restart can push first-generation
past a short read window (be patient, ~40s, on a cold model), and (b) the wordgen
cache is keyed by level+charset but NOT by the length window (a known follow-up), so
hammering one key during testing serves stale batches. Neither is a code bug in the
feature; both are pre-existing traits of the optional, static-fallback-backed wordgen
path.

**The lesson (same family as F6, fabricated historical justification):** don't assert
a capability limit — especially a model's — as fact in code or docs. Test it. And when
an LLM "won't" do something, suspect the prompt before the model: a constraint in the
framing (audience, tone, persona) will silently override an explicit rule. Here the
fix is that the prompt must **age with the player** the same way the game does — the
framing scales with the requested difficulty (see L38, refs).

**Update 2026-07-13 — the two "pre-existing traits" caveats above are now fixed
(L39).** The cache is keyed by the full length window, so hammering one key no
longer serves stale cross-window batches; and cold-load latency is handled by model
warmup (`keep_alive` + `maybeWarm()`) plus a wider background budget, so the first
generation after a restart no longer times out to empty. Both were reworked into a
two-tier supply (fresh buffer + model-down fallback reservoir); details in L39 and
docs/ROADMAP.md §3.
