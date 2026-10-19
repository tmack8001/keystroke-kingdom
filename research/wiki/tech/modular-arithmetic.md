---
title: Modular Arithmetic — Gauss and the Clock That Starts Over
type: concept
tags: [mathematics, discrete-math, gauss, notation, history-card, proposed-content]
level: 11
sources: 4
verified: 2026-09-15
---

**Modulo** is counting that wraps around. A clock face only knows twelve numbers, so four
hours after eleven o'clock is three, not fifteen. **Carl Friedrich Gauss** gave that idea its
modern shape in *Disquisitiones Arithmeticae* — written in **1798** when he was 21, published
in **1801** when he was 24 — whose very first section is *On Congruent Numbers in General*:
*"If a number a divides the difference of two numbers b and c, then b and c are said to be
congruent modulo a."* And here is the detail that makes this a card for **this** game: Gauss
needed a **new symbol**, because Legendre had been using the ordinary equals sign for it.
Gauss picked **≡** — three lines instead of two — *"because of the great analogy that exists
between equality and congruence"*, and, in his own words, **"to prevent any ambiguity."**
That is precisely the problem programmers would hit 170 years later, and precisely the same
answer: when one sign has two jobs, draw another sign.

## In this game

**Not yet built. Proposed as a Level 11 history card**, part of the discrete-mathematics batch
commissioned 2026-09-15 (hub: [[discrete-math-and-code-notation]]).

**Moment word: `modulo`.** Character-by-character against Level 11's cumulative alphabet (home
row + top row + V and M): `m` ✓ (**L11, new**), `o` ✓ (L9), `d` ✓ (L2), `u` ✓ (L7), `l` ✓
(L3), `o` ✓ (L9). The `m` is the gate, so it attaches exactly at Level 11 and contains one of
that level's new characters (INV-56). Not among the 68 spent card words.

**Why this page exists at all: it is the historical twin of the flagship card.**
[[equality-vs-assignment]] (`1==1`, Level 21) tells a child that programmers needed a second
equals sign because the first one had been given another job. This card shows the same thing
happening in 1801, in pure mathematics, for the same stated reason — *to prevent any
ambiguity*. A collector who finds both has independently discovered a pattern in how notation
grows. That is a much better thing to give a child than either card alone, and it is the
strongest argument for shipping `modulo` even though Level 11 is crowded.

⚠️ **Level 11 crowding.** The bank already holds 5 cards at Level 11 and this batch proposes
two more there ([[prime-numbers]] `prime` and this one), because both are gated on the same
new key `m`. Trevor's call. If only one ships, `prime` reads more easily to a five-year-old;
`modulo` is the one that pays off the flagship.

Related: [[equality-vs-assignment]], [[equals-sign]], [[prime-numbers]],
[[discrete-math-and-code-notation]], [[unix-epoch-1970]] (the bank's existing card about
counting time as one long number — a nice, unforced contrast with a clock that starts over).

## The facts

- **The book.** *Disquisitiones Arithmeticae*, Carl Friedrich Gauss. **Written 1798, when
  Gauss was 21; published 1801, when he was 24.** MacTutor gives publication *"in the summer
  of 1801"* and says there were **seven sections**, all but the last devoted to number theory.
  ⚠️ **Created-vs-published:** 1798 and 1801 are different facts. A card should say 1801
  (published) or say both.
- **Gauss's dates:** born **30 April 1777**, died **23 February 1855** (MacTutor).
- **Section I is *"On Congruent Numbers in General"*** (Wikipedia's contents listing; the
  Wikisource translation heads it *First Section: On Congruent Numbers in General*).
- **The definition, Article 1, in translation:** *"If a number a divides the difference of two
  numbers b and c, then b and c are said to be congruent modulo a."* The number *a* is called
  the **modulus** of the congruence.
- **The symbol, Article 2, and the reason for it.** Gauss introduces **≡**, writing examples
  such as **−16 ≡ 9 (mod 5)**. His stated rationale: *"We adopted this symbol because of the
  great analogy that exists between equality and congruence."* He notes that **Legendre had
  used the equals sign itself** for congruence, and that he chose ≡ instead **"to prevent any
  ambiguity."**
  ⚠️ This is the single most valuable sentence on the page and the reason it links to
  [[equality-vs-assignment]]. Quote it carefully: Gauss's complaint is about *ambiguity*, and
  his solution is a *new glyph that deliberately resembles the old one*.
- **The clock.** ⚠️ **The clock illustration is NOT from a fetched source** — it appears in
  search summaries and in every classroom in the world, but no page fetched this session
  states it. It is, however, a direct and checkable instance of the cited definition: with
  *a* = 12, *b* = 15 and *c* = 3, 12 divides 15 − 3, so **15 ≡ 3 (mod 12)** — four hours past
  eleven o'clock reads as three. The card may use the clock as a *picture of the definition*;
  it must not claim Gauss used it.
- **What is NOT claimed.** That Gauss *invented* modular arithmetic. He did not — remainders
  are ancient, and Legendre was already working with congruences (Gauss says so himself when
  explaining why he changed the symbol). What Gauss supplied is the **definition, the word
  *modulus*, and the notation** — which is a precise, sourceable, and honest claim, and the
  same popularizer-vs-inventor discipline applied on [[odd-and-even]] and
  [[eulers-polyhedron-formula]].

## Card-ready facts

1. *"A clock only knows twelve numbers. Four hours after eleven is three, not fifteen.
   Counting that wraps around and starts over is called modulo."* (147 chars)
   — supports: Wikisource translation of *Disquisitiones Arithmeticae* Art. 1 **[fetched]**
   (the definition of congruence modulo a number, from which 15 ≡ 3 (mod 12) follows
   directly). ⚠️ The clock is this page's illustration of the cited definition, not a quoted
   claim — see "The facts" above.
2. *"In 1801 Carl Gauss wrote a book about numbers that wrap around. He needed a sign for it,
   and the equals sign was already busy — so he drew three lines instead of two."*
   (168 chars) — supports: Wikisource, Art. 2 **[fetched]** (the ≡ symbol, and that Legendre
   had used `=` for it) + MacTutor Gauss biography **[fetched]** (published summer 1801) +
   MacTutor *Disquisitiones* extras **[fetched]** (1801, Gauss aged 24).
3. *"Gauss said he picked a sign that looks like the equals sign on purpose, because the two
   ideas are so alike — but a different one, so nobody could get muddled."* (155 chars)
   — supports: Wikisource, Art. 2 **[fetched]** — *"We adopted this symbol because of the
   great analogy that exists between equality and congruence"* and *"to prevent any
   ambiguity."*

## References

1. [Translation:Disquisitiones Arithmeticae / First Section — Wikisource](https://en.wikisource.org/wiki/Translation:Disquisitiones_Arithmeticae/First_Section) —
   THE PRIMARY WORK ITSELF, in translation. Article 1's definition of congruence and the word
   *modulus*; Article 2's introduction of ≡ with the example −16 ≡ 9 (mod 5); Gauss's stated
   reasons — *"because of the great analogy that exists between equality and congruence"* and
   *"to prevent any ambiguity"* — and the note that Legendre had used the equals sign.
   ⚠️ A community translation, not a published scholarly edition; it is cited as the primary
   *text* because it is the only full text fetched. A future pass should corroborate Article 2
   against Clarke's or Waterhouse's published English translation. **[fetched]**
2. [Carl Friedrich Gauss — MacTutor History of Mathematics Archive, University of St Andrews](https://mathshistory.st-andrews.ac.uk/Biographies/Gauss/) —
   INSTITUTIONAL (university). Born 30 April 1777, died 23 February 1855; *Disquisitiones
   Arithmeticae* published *"in the summer of 1801"*; seven sections, all but the last on
   number theory. ⚠️ Does **not** mention congruences or the ≡ symbol. **[fetched]**
3. [Gauss: *Disquisitiones Arithmeticae* — MacTutor Extras, University of St Andrews](https://mathshistory.st-andrews.ac.uk/Extras/Gauss_Disquisitiones/) —
   INSTITUTIONAL (university). Publication 1801, Gauss aged 24; reproduces Gauss's dedication
   and preface and notes on the 1870 second edition. ⚠️ Reproduces the **front matter only** —
   not Section I — so it corroborates the date, not the mathematics. **[fetched]**
4. [Disquisitiones Arithmeticae — Wikipedia](https://en.wikipedia.org/wiki/Disquisitiones_Arithmeticae) —
   one of several, never alone. *"written in Latin by Carl Friedrich Gauss in 1798, when Gauss
   was 21, and published in 1801, when he was 24"* — the created-vs-published pair — and the
   contents listing giving Section I as *"Congruent Numbers in General."* ⚠️ Contains **no**
   statement attributing ≡ or the term *modulus* to Gauss; ref 1 carries that. **[fetched]**

## See also

[[equality-vs-assignment]] — the flagship card this one rhymes with: same problem (one sign,
two meanings), same solution (draw a new one), 170 years apart.
[[equals-sign]] — the sign Gauss deliberately declined to reuse.
[[prime-numbers]] — the other Level 11 proposal in this batch.
[[discrete-math-and-code-notation]] — the hub.

## Unsourceable / weakly-sourced items

- **The clock illustration as Gauss's own.** Search summaries say *Disquisitiones* "uses the
  hours of a clock as an example"; **no fetched source confirms this**, and the card must
  present the clock as a picture of the rule, never as Gauss's example.
- **The November 1801 / exact publication month** beyond MacTutor's *"summer of 1801"*.
- **[Keith Conrad, "Modular Arithmetic" (University of Connecticut)](https://kconrad.math.uconn.edu/blurbs/ugradnumthy/modarith.pdf)**
  — surfaced in search as a university-hosted expository PDF; **not fetched** (PDFs did not
  extract in this session). The natural third institutional citation for a future pass.
