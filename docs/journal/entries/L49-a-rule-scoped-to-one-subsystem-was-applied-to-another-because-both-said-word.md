---
id: L49
kind: learning
title: A rule scoped to one subsystem got applied to another because both said "word" — and it cost the beginner levels their collect loop for fourteen months
found: 2026-09-15
session: 2026-09-15 replay-payout sweep
status: adopted
importance: high
category: docs-process
refs: [L48, F32, INV-56]
---

## What happened

`research/computing-history-moments.md` said, of Levels 1–3:

> *No English word, name, or common initialism is spellable without a vowel from this letter set.*

…and concluded that those levels could not receive a history card. That conclusion stood for
fourteen months. Its consequence was measured on 2026-09-14: **Levels 1–3 had no cards at all**,
so the collect-them-all loop — the thing `product.md` calls the deliberate replay hook, the thing
Trevor asked for because *"the kids love the cards"* — did not exist at the three levels a
five-year-old replays more than anything else in the game. Act 1 had 4 cards across 5 levels; Act
3 had 22.

The premise is true. The conclusion does not follow, and the gap between them is one word.

**`product.md`'s Word Bank Principle governs the WORD bank — what a child READS.** That is where
the vowel rule lives and it is exactly right there: `J F D K S L` has no vowel, nothing is
spellable, so Levels 1–3 are pattern drills and inventing a fake word would be a pedagogical lie.

**A history card's moment word is a different thing entirely — it is what a child TYPES.** It has
only two requirements: typeable with that level's keys, and citable. It was never required to be
an English word, and the bank *already knew that* when the sentence was written: `\o/`, `386`,
`56k`, `1969` and `` `hack` `` were all shipped, and not one of them is a word.

So the vowel rule was carried across a subsystem boundary on the strength of a shared noun. Both
things are called a "word". Only one of them has to be one.

Three counterexamples now exist — `jf` (the bumps on F and J), `jdk` (Java), `ls` (the Unix list
command) — and **two of them are initialisms, the exact category the sentence explicitly ruled
out.** They were not hard to find once the question was asked correctly.

## The lesson

**When a design doc states a constraint, it constrains the subsystem it was written about — and
nothing else. Check the scope before you inherit the conclusion.**

The failure mode is quiet and it does not look like an error. Nobody misread the sentence; the
sentence is true. What happened is that a later reader met a superficially-similar question
("can Levels 1–3 have a card?"), found a documented-looking answer to an adjacent question ("can
Levels 1–3 have a word?"), and stopped. The shared vocabulary made the two questions look like
one question.

Two practical habits:

1. **When a rule is cited to close a question, re-read the rule at its source and ask what it is
   a rule ABOUT.** Here, one click to `product.md` would have shown a section titled *Word Bank
   Principle* sitting under a discussion of what the player reads — not what a card is.
2. **When one project noun means two things, say which one every time.** This repo now has "word"
   meaning a pool entry, a card's moment word, and an act-card word, with three different
   constraints. The fix applied here was to write the distinction into the three places a future
   agent would actually look: the research doc (a dated SUPERSEDED box), `levels/act1.md` (the
   sentence most likely to be cited next), and `js/history-cards.js` (beside the cards).

## The tell worth remembering

**A prohibition that has never been retested is not a finding, it is a rumour with a citation.**
This one had the shape of rigour — it named a real constraint, it was in a research document, and
it was true about something. What it never had was anyone asking whether the constraint it named
was the constraint that applied. Cheap to check; fourteen months to notice.

Related: **L48** (a test can cite a design source and still be coupled to content — the same
failure of *citation present, scope unchecked*, one layer down) and **F32** (an empty bank proved
nothing — the same failure of *an absence read as an answer*).
