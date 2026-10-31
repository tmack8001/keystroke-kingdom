---
id: F35
kind: failure
title: Survival's timeout replaced the current prompt — and silently deleted any guaranteed word that happened to be it, so the level could never end
found: 2026-10-31
session: 2026-10-30 semicolon-teaching-beat spec
status: addressed
addressed-by: "js/main.js requeueGuaranteedPattern: a timeout still costs its quarter and replaces the pattern, but an unmet guaranteed word (history-card word, Free Play act card, key-name beat, Name Moment, Level 24 name) is put back as the very next prompt; clock and quarter accounting unchanged. Tests: tests/integration/survival-guaranteed-word.test.mjs (INV-170), TF-V1 resolved."
addressed-date: 2026-10-31
importance: high
category: engine
refs: [F23, L52]
---

## What happened

A product-manager read `handleSurvivalTimeout` while specifying a new guaranteed word and noticed a
timeout overwrites `state.patterns[state.currentPattern]` with a random pattern. Guaranteed words
(a level's history-card moment word, the Name Moment, Level 24's name) exist only as one-off splices
in that list, and the refill draws only from the level pool — so if the clock expired while one of
them was the current prompt, it was gone and `cardPending` / `namePending` stayed set forever.

It was a hypothesis from reading code. A test-engineer then **played it** (a skewed clock expiring
exactly on the word, real key events): `ada` on Level 4 and a Name Moment both stranded the level
(250 presses, no win); Level 24 only if both copies were hit. No existing test crossed
"Survival timeout" with "guaranteed word".

## Why it matters

Survival is opt-in, but the One Rule's floor ("a level must always be winnable") applies to it too.
Two correct mechanisms — a clock that replaces a stale prompt, and a gate that holds a level open
until a guaranteed word is typed — were each fine alone; the defect lived only in their interaction.
Same family as F23 (a level nobody had tried to win).

## What to do

- Any "replace the current prompt" path must ask what else only exists as that prompt.
- Test the cross-product of every clock/timer mechanism with every guarantee mechanism.
- The first version of the intended test ("expire on every appearance") could not pass under the
  ruling that keeps the clock — each expiry costs a quarter and the purse ends in a normal game over.
  Encode the *intended* contract (win after a bounded number of expiries; game over at 0 quarters),
  not an impossible one.
