---
title: Euler's Polyhedron Formula (V − E + F = 2)
type: concept
tags: [mathematics, discrete-math, topology, euler, history-card, proposed-content]
level: 6
sources: 3
verified: 2026-09-15
---

Take any ordinary solid shape with flat faces — a cube, a pyramid, a football made of
pentagons. Count its **corners** (V, for vertices), its **edges** (E), and its **faces** (F).
Then work out **V − E + F**. The answer is **2**. Every time. A cube: 8 − 12 + 6 = 2. It is
called **Euler's formula**, because Leonhard Euler wrote about it twice in **1750** — though
the honest history is messier and better: **Euler re-discovered it**, Descartes had an
equivalent result around **1630** that he never published, Maurolico had stated it for the
Platonic solids in **1537**, and the first complete *proof* took another century of work by
Legendre and Cauchy. This is the other great "dots and lines" idea, and the reason the word
**edge** is worth a history card.

## In this game

**Not yet built. Proposed as a Level 6 history card**, part of the discrete-mathematics batch
commissioned 2026-09-15 (hub: [[discrete-math-and-code-notation]]).

**Moment word: `edge`.** Character-by-character against Level 6's cumulative alphabet (home
row A S D F G H J K L `;` plus E and I): `e` ✓ (**L6, new**), `d` ✓ (L2), `g` ✓ (L5), `e` ✓.
The `e` is the gate, so it attaches exactly at Level 6 and contains one of that level's new
characters (INV-56). Not among the 68 spent card words, and a genuinely easy early-reader
word — four letters, no blends, all on the home row plus one reach.

**This is the batch's only card a child can go and CHECK.** Everything else in the collection
is something that happened to other people; this one is a dare. Find a box. Count its corners,
its edges, its faces. Subtract, add, and get 2. That is a real, repeatable mathematical
experiment inside a ≤160-character card, and Level 6 is early enough that a five-year-old
gets it years before the rest of the batch.

⚠️ **Attribution caution for the card writer.** Do **not** write "Euler discovered this."
David Eppstein's (UC Irvine) page says the formula was ***"(re)discovered"*** by Euler, and
Cambridge's *Plus* says outright that *"it wasn't in fact Euler who came up with the first
complete proof."* The card should say the formula **carries his name**, or simply skip the
attribution and give the child the trick. This is the popularizer-vs-inventor trap the
project has already been bitten by once (Grace Hopper and the moth).

Related: [[seven-bridges-of-konigsberg]] (same man, same instinct — count the connections,
ignore the shapes), [[discrete-math-and-code-notation]], [[odd-and-even]].

## The facts

- **The statement.** UC Irvine: *"for any convex polyhedron, the number of vertices and faces
  together is exactly two more than the number of edges. Symbolically V−E+F=2."*
  ⚠️ Note the word **convex** — the formula is not true for every conceivable solid (a shape
  with a hole through it gives a different number). A card for a five-year-old should say
  *"an ordinary solid shape"* or name real examples (a box, a pyramid), never "any shape."
- **The worked example, verbatim from Cambridge's *Plus*:** *"The cube, for example, has 8
  vertices, so V = 8. Next, count the number of edges the polyhedron has, and call this number
  E. The cube has 12 edges, so in the case of the cube E = 12. Finally, count the number of
  faces and call it F. In the case of the cube, F = 6."* And the sum: *"V - E + F = 8 - 12 + 6
  = 14 - 12 = 2."*
- **Euler's date: 1750.** UC Irvine: *"The formula V−E+F=2 was (re)discovered by Euler; he
  wrote about it twice in 1750, and in 1752 published the result."* ⚠️ **The publication year
  is disputed across sources** — search summaries give the papers as read to the St Petersburg
  Academy on 25 November 1750 and 9 September 1751, appearing in the proceedings *for*
  1752–53 but **published in 1758**, which is the same volume-year-versus-print-year confusion
  documented on [[seven-bridges-of-konigsberg]]. **Use 1750** (the year Euler wrote about it,
  agreed by the fetched source) and leave publication off the card.
- **Euler was not first, and this is well documented.** UC Irvine: *"Another version of the
  formula dates over 100 years earlier than Euler, to Descartes in 1630. Descartes gives a
  discrete form of the Gauss-Bonnet theorem, stating that the sum of the face angles of a
  polyhedron is 2π(V−2), from which he infers that the number of plane angles is 2F+2V−4."*
  And: *"Francesco Maurolico stated the formula for Platonic solids in 1537."*
- **Nor did he prove it.** Cambridge's *Plus*: *"it wasn't in fact Euler who came up with the
  first complete proof"*, describing a history *"spanning 200 years"* involving **Descartes,
  Euler, Legendre and Cauchy**.
- **The Goldbach letter.** Search summaries repeatedly place the first sketch in a **November
  1750 letter to Christian Goldbach**. ⚠️ No fetched source confirms the letter specifically —
  UC Irvine says only "wrote about it twice in 1750." **Do not name Goldbach on a card.**

## Card-ready facts

1. *"Find a box. Count the corners, count the edges, count the flat sides. Now do corners
   minus edges plus sides: 8 - 12 + 6 = 2. You always get 2. Try it on anything."*
   (162 chars) — supports: Plus / University of Cambridge **[fetched]** (the cube worked
   example verbatim, and the sum) + UC Irvine **[fetched]** (*"V−E+F=2"* for any convex
   polyhedron).
2. *"This trick is called Euler's formula. It works on a cube, a pyramid, a football — any
   ordinary solid shape. Nobody expects a rule about counting to be that stubborn."*
   (161 chars) — supports: UC Irvine **[fetched]** (statement for any convex polyhedron;
   the name) + Plus **[fetched]** (the formula's name and the cube example).
3. *"Euler's name is on it, but he was not first: Maurolico wrote it for some shapes in 1537
   and Descartes found a version around 1630 and never published it."* (150 chars)
   — supports: UC Irvine **[fetched]** (*"(re)discovered by Euler"*; Maurolico 1537;
   Descartes 1630, and that Descartes' version was a different formulation) + Plus
   **[fetched]** (*"it wasn't in fact Euler who came up with the first complete proof"*).
   ⚠️ Says "found a version … and never published it" — UC Irvine calls Descartes' result
   *another version of the formula*; the "unpublished manuscript" detail is search-summary
   only, so the safest card sentence drops "and never published it."

## References

1. [Euler's polyhedron formula — *Plus* magazine, Millennium Mathematics Project, University of Cambridge](https://plus.maths.org/content/eulers-polyhedron-formula) —
   INSTITUTIONAL (University of Cambridge; the footer reads *"Plus is part of the family of
   activities in the Millennium Mathematics Project. Copyright © 1997 - 2026. University of
   Cambridge."*). The cube worked example verbatim, the arithmetic `8 - 12 + 6 = 2`, and the
   200-year Descartes→Euler→Legendre→Cauchy proof history including *"it wasn't in fact Euler
   who came up with the first complete proof."* **[fetched]**
2. [Twenty-one Proofs of Euler's Formula: V−E+F=2 — David Eppstein, Donald Bren School of Information and Computer Sciences, University of California Irvine](https://ics.uci.edu/~eppstein/junkyard/euler/) —
   INSTITUTIONAL (university faculty page, the long-running "Geometry Junkyard"). The
   statement for convex polyhedra; *"(re)discovered by Euler; he wrote about it twice in 1750,
   and in 1752 published the result"*; Descartes 1630 with the angle-sum formulation;
   Maurolico 1537 for the Platonic solids. **[fetched]**
3. [Leonhard Euler — MacTutor History of Mathematics Archive, University of St Andrews](https://mathshistory.st-andrews.ac.uk/Biographies/Euler/) —
   INSTITUTIONAL (university). Euler's dates (born 15 April 1707, died 18 September 1783) and
   *"Other geometric investigations led him to fundamental ideas in topology such as the Euler
   characteristic of a polyhedron"* — the only MacTutor sentence touching this formula; it
   gives **no date and does not state V − E + F = 2**, which is why refs 1–2 carry the claim.
   **[fetched]**

## See also

[[seven-bridges-of-konigsberg]] — Euler's other dots-and-lines result, proposed as the `graph`
card at Level 10.
[[discrete-math-and-code-notation]] — the hub for this batch.
[[odd-and-even]] · [[prime-numbers]] — the other countable, checkable cards.

## Unsourceable / weakly-sourced items

- **The November 1750 letter to Goldbach.** Search-summary only; not fetched. Not asserted.
- **Publication in 1758** (vs. UC Irvine's "1752"). Two fetched/searched figures disagree; the
  page states neither as fact and the card states neither at all.
- **[AMS Feature Column — "Euler's Polyhedral Formula"](https://www.ams.org/publicoutreach/feature-column/fcarc-eulers-formula)**
  — ⚠️ **UNUSABLE THIS SESSION: HTTP 403 on fetch.** Recorded because the American
  Mathematical Society would be the strongest institutional citation available for this topic;
  a future pass should retry it.
