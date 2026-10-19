---
title: Prime Numbers — and Euclid's Proof They Never Run Out
type: concept
tags: [mathematics, discrete-math, euclid, proof, history-card, proposed-content]
level: 11
sources: 4
verified: 2026-09-15
---

A **prime** is a number that cannot be built by multiplying smaller numbers together — 2, 3,
5, 7, 11. Euclid's *Elements* (c. 300 BC) defines it in five words: *"A prime number is that
which is measured by a unit alone"* (Book VII, Definition 11) — measured by 1 and nothing
else. And in Book IX, Proposition 20, Euclid proves the thing that makes primes worth a
history card: **there is no last one.** The proposition, in Heath's translation, reads *"Prime
numbers are more than any assigned multitude of prime numbers"* — name any finite list of
primes you like, and the proof hands you one you missed. It is, per MacTutor, *"one of the
first proofs known which uses the method of contradiction."*

## In this game

**Not yet built. Proposed as a Level 11 history card**, part of the discrete-mathematics batch
commissioned 2026-09-15 (hub: [[discrete-math-and-code-notation]]).

**Moment word: `prime`.** Character-by-character against Level 11's cumulative alphabet (all
of the home and top rows, plus V and M): `p` ✓ (L10), `r` ✓ (L7), `i` ✓ (L6), `m` ✓ (**L11,
new**), `e` ✓ (L6). The `m` is the gate, so it attaches exactly at Level 11 and contains one
of that level's new characters (INV-56). Not among the 68 spent card words.

**What this card is really teaching is what a PROOF is** — the idea the task brief wanted
under the word `proof`, delivered under a word a child can actually read. A check is "I tried
lots of numbers and it kept working." A proof is "it must work, and here is why, forever." A
five-year-old can hold that distinction if it arrives as a dare: *name the biggest prime you
can think of, and I will find a bigger one.*

⚠️ **Level 11 is already the bank's second-densest level** (5 cards: `mouse`, `email`, `mod`,
`levy`, `spam`) and this batch proposes **two** more there (`prime` and [[modular-arithmetic]]
`modulo`), because both words are gated on the same new key `m`. Flagged for Trevor: if only
one should land, `prime` is the more child-legible of the two and `modulo` is the one that
links to the flagship [[equality-vs-assignment]] card.

Related: [[odd-and-even]] (Euclid, three books earlier), [[discrete-math-and-code-notation]],
[[sonic-the-hedgehog]] (Level 11's cabinet).

## The facts

- **Euclid's definition, Book VII, Definition 11:** *"A prime number is that which is measured
  by a unit alone."* Definition 13, for contrast: *"A composite number is that which is
  measured by some number."* Joyce's guide restates it in modern terms: a prime has only 1 as
  a proper divisor — *"examples including 2, 3, 5, 7, and 11"* — while composites (4, 6, 8, 9,
  10) have others.
  ⚠️ "Measured by" is Euclid's word for "divides evenly into." A card should translate it,
  not reproduce it without a gloss.
- **Book IX, Proposition 20, the enunciation:** *"Prime numbers are more than any assigned
  multitude of prime numbers."* Confirmed **twice, independently** — Clark University's
  edition and the Perseus Digital Library's hosting of Heath's translation render it
  identically.
- **What that sentence means.** Joyce's guide: *"This proposition states that there are more
  than any finite number of prime numbers, that is to say, there are infinitely many primes."*
  ⚠️ **Euclid does not say "infinite."** He avoids the word and phrases it as "more than any
  assigned multitude" — a genuinely interesting precision point, and the reason the card
  should say **"they never run out"** rather than "there are infinitely many."
- **How the proof works**, per Joyce's guide: take any finite list of primes, form the least
  common multiple and add one; the result is either prime itself, or has a prime divisor not
  in the original list — *"thus yielding at least one additional prime beyond any finite
  collection."* Heath's text ends: *"Therefore the prime numbers A, B, C, G have been found
  which are more than the assigned multitude of A, B, C."*
- **Its place in the history of proof.** MacTutor (University of St Andrews): *"In Book IX of
  the Elements, Euclid proves that there are infinitely many prime numbers. This is one of the
  first proofs known which uses the method of contradiction to establish a result."*
  ⚠️ MacTutor says *"one of the first"*, not *"the first"*. Keep the hedge.
- **The date.** MacTutor: *"By the time Euclid's Elements appeared in about 300 BC, several
  important results about primes had been proved."* So primes were being studied **before**
  Euclid; he is the one who wrote down the proof that survived. Same attribution discipline as
  [[odd-and-even]]: he *wrote it down*.

## Card-ready facts

1. *"Some numbers cannot be split into equal groups at all. 2, 3, 5, 7, 11 — try sharing 7
   sweets fairly and you never can. Those are prime numbers."* (145 chars)
   — supports: Clark University, *Elements* VII Def. 11 **[fetched]** (*"measured by a unit
   alone"*; the 2, 3, 5, 7, 11 examples) + Perseus / Heath **[fetched]** (the same text).
2. *"Over 2,000 years ago Euclid proved that prime numbers never run out. Name the biggest one
   you can think of and his proof will find you a bigger one. Every time."* (162 chars)
   — supports: Clark University, *Elements* IX.20 **[fetched]** (enunciation + guide:
   *"there are infinitely many primes"*) + Perseus / Heath **[fetched]** (independent text) +
   MacTutor **[fetched]** (*"proves that there are infinitely many prime numbers"*, c. 300 BC).
3. *"Checking is not the same as proving. Euclid did not test lots of numbers — he showed why
   there must always be one more, forever. That is what a proof is."* (155 chars)
   — supports: MacTutor **[fetched]** (*"one of the first proofs known which uses the method
   of contradiction"*) + Clark University's guide **[fetched]** (the construction that yields
   a prime outside any finite list).

## References

1. [Euclid's *Elements*, Book IX, Proposition 20 — David E. Joyce, Clark University](https://mathcs.clarku.edu/~djoyce/java/elements/bookIX/propIX20.html) —
   INSTITUTIONAL (university; the standard online *Elements*). The enunciation verbatim; the
   guide's gloss *"there are infinitely many primes"*; and the construction (LCM plus one)
   behind the proof. **[fetched]**
2. [Euclid, *Elements*, Book IX, Proposition 20 — Perseus Digital Library, Tufts University (Heath translation)](https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0086:book%3D9:type%3DProp:number%3D20) —
   INSTITUTIONAL / PRIMARY TEXT (Tufts; Sir Thomas Little Heath's translation). Independently
   confirms the enunciation and supplies the proof's closing line. **[fetched]**
3. [Euclid's *Elements*, Book VII, Definitions 11 through 14 — David E. Joyce, Clark University](https://mathcs.clarku.edu/~djoyce/java/elements/bookVII/defVII11.html) —
   INSTITUTIONAL (university). Definition 11 (*prime*) and Definition 13 (*composite*)
   verbatim, plus the modern restatement and the 2/3/5/7/11 and 4/6/8/9/10 examples.
   **[fetched]**
4. [Prime numbers — MacTutor History of Mathematics Archive, University of St Andrews](https://mathshistory.st-andrews.ac.uk/HistTopics/Prime_numbers/) —
   INSTITUTIONAL (university). *"In Book IX of the Elements, Euclid proves that there are
   infinitely many prime numbers. This is one of the first proofs known which uses the method
   of contradiction to establish a result."*; the *Elements* dated to *"about 300 BC"*; and
   the note that important results about primes predate it. ⚠️ Does **not** define a prime
   number — refs 1 and 3 carry that. **[fetched]**

## See also

[[odd-and-even]] — Euclid, Book VII, and the batch's gentlest card.
[[modular-arithmetic]] — the other Level 11 proposal in this batch (same gating key, `m`).
[[seven-bridges-of-konigsberg]] · [[eulers-polyhedron-formula]] — the Euler half of the batch.
[[discrete-math-and-code-notation]] — the hub.

## Unsourceable / weakly-sourced items

- **`proof` as its own card word** (which also lands at Level 10). Researched *as a subject* it
  is a definition, not a story, and Level 10 already receives [[seven-bridges-of-konigsberg]]
  from this batch. **Dropped** — the idea of a proof is carried inside this card's third
  sentence instead, attached to a word a child can read.
- **Any modern prime-numbers-in-cryptography angle.** Nothing fetched; nothing claimed. It is
  also a poor fit for the audience and would collide with nothing currently in the bank, so a
  future pass could research it properly rather than have this page gesture at it.
