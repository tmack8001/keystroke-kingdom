# Discrete Mathematics & Code Notation
*The research hub for a new content domain in the history-card bank: mathematics a child can
picture, and the notation programmers had to invent when mathematics' own signs ran out.
Opened 2026-09-15.*

**How to verify.** Every claim in this document and in the seven atomic pages it links follows
the arcade-historian citation standard (`.claude/agents/arcade-historian.md`): 2–4 references
per item; preference order institutional/primary → established journalism → Wikipedia as one
of several and never alone; **no URL written from memory** — every link below appeared in a
live search result or was fetched in-session, and each is labelled **[fetched]** or marked
unusable. Claims that could not be sourced are named in each page's *Unsourceable /
weakly-sourced items* section rather than smoothed over. The detail lives on the atomic pages;
this file is the map.

---

## Why this domain exists

Trevor, 2026-09-15, looking at a card the bank had already shipped:

> *"We should also drop in references to discrete math, coding/engineering code references."*
> *"Maybe each card could help decipher these differences — as we have each one discoverable."*

The prompt was a genuine defect in an otherwise good card. [[equals-sign]] (`1=1`, Level 21,
Robert Recorde 1557) is **unambiguously right as mathematics and wrong as code**: typed into
TypeScript, C or Python, `1=1` is a syntax error, because in those languages `=` means
*assignment* and you cannot assign to the number 1. The card is not wrong — it is a card about
mathematics — but a child who learns `1=1` from it and later types it into an editor will get
a red squiggle and no explanation.

The fix Trevor proposed is better than a correction: **because the collection is discovered one
card at a time, each card can decode exactly one idea, and the collection teaches the
differences cumulatively.** So `1=1` keeps its job (where the sign came from, 1557) and a
second card, `1==1`, does the other half (why code needed a second sign). **The existing
`1=1` card is not to be changed.**

The same logic opened the door to a small set of **discrete-mathematics** cards. The bank is
otherwise entirely computing and gaming history; this is a deliberate widening, of the kind
[[equals-sign]] already flagged when it shipped. The house rule that keeps it honest: **an
abstract idea only earns a card if it can arrive as a picture** — *dots joined by lines*, *a
clock that starts over*, *share the pile between two and see what is left*. A definition is
not a card.

---

## The seven pages, and where each lands

Each word is verified character-by-character against the cumulative alphabet of its level
(`.claude/rules/levels.md`), and each **contains at least one of that level's NEW characters**
— the INV-56 rule, which is what makes a card *attach* to a level rather than merely be
typeable there. None collides with the 68 words already in `js/history-cards.js`.

| Word | Lands | Gating char | Page | Subject |
|---|---|---|---|---|
| `edge` | **L6** | `e` (new L6) | [[eulers-polyhedron-formula]] | V − E + F = 2 — count a box and always get 2 |
| `odd` | **L9** | `o` (new L9) | [[odd-and-even]] | Euclid, *Elements* VII, c. 300 BC |
| `graph` | **L10** | `p` (new L10) | [[seven-bridges-of-konigsberg]] | Euler, 1735 — a town becomes dots and lines |
| `prime` | **L11** | `m` (new L11) | [[prime-numbers]] | Euclid, *Elements* IX.20 — they never run out |
| `modulo` | **L11** | `m` (new L11) | [[modular-arithmetic]] | Gauss, 1801 — and a new sign to avoid ambiguity |
| `boolean` | **L12** | `b`, `n` (both new L12) | [[george-boole]] | Boole, 1847/1854 — true and false as algebra |
| `1==1` | **L21** | `=` (new L21) | [[equality-vs-assignment]] | why code needed a second equals sign |

**Pool-density note for whoever ships these.** The batch is not evenly spread, and it cannot
be — the level a word lands on is decided by its letters, not by taste. Current counts against
proposed additions: L6 3→4, L9 4→5, **L10 3→4**, **L11 5→7**, **L12 6→7**, **L21 2→3**. Levels
11 and 12 are already the two densest in the bank. If the batch has to be thinned, the pages
say which of each pair is the stronger card and why.

---

## The through-line: notation is invented by people who ran out of signs

The batch has an accidental spine, and it is the most valuable thing in it.

**Gauss, 1801.** Writing *Disquisitiones Arithmeticae*, Gauss needed to say "these two numbers
leave the same remainder." Legendre had been writing that with the ordinary equals sign. Gauss
refused, and drew **≡** instead — deliberately similar, deliberately different — *"because of
the great analogy that exists between equality and congruence"*, and, in his own words, **"to
prevent any ambiguity."**

**Bell Labs, 1972.** Ken Thompson's *Users' Reference to B* documents a language where `=`
had been given a different job entirely: *"The assignment operator `=` merely evaluates the
rvalue and stores the result in the lvalue."* Which left no sign for the question — so:
*"The equality operators `==` (equal to) and `!=` (not equal to) perform similarly to the
relation operators."*

**Same problem, 171 years apart, same answer: when one sign has two jobs, draw another one.**
A child who finds [[modular-arithmetic]] and [[equality-vs-assignment]] in the same collection
has been handed a genuine pattern about how human notation grows, without anybody lecturing
them. That is the argument for shipping `modulo` even though Level 11 is crowded.

**References for this section:** [Wikisource, *Disquisitiones Arithmeticae*, First Section](https://en.wikisource.org/wiki/Translation:Disquisitiones_Arithmeticae/First_Section) —
the primary work in translation; Gauss's ≡, his analogy, and *"to prevent any ambiguity."*
**[fetched]** · [Users' Reference to B, Ken Thompson, 7 January 1972 (TUHS mirror)](https://minnie.tuhs.org/Mirrors/Dennis/kbman.html) —
both operator definitions verbatim. **[fetched]** · [The Development of the C Language, Dennis M. Ritchie (TUHS mirror)](https://minnie.tuhs.org/Mirrors/Dennis/chist.html) —
*"a matter of taste, and some remain controversial, for example the decision to use the single
character `=` for assignment instead of `:=`."* **[fetched]**

---

## Downstream flags (research does not edit `js/`)

1. **`js/history-cards.js` — the highest-priority flag, and it is an ADDITION, not an edit.**
   Seven new card entries are proposed; the per-card `word` / `level` / `title` / `year` and
   the ≤160-character `fact` sentences are written out verbatim in each page's
   `## Card-ready facts` block, ready to paste. **Nothing existing should change.**
2. **`js/history-cards.js` — the `1=1` card stays exactly as it is.** Its current text reads:
   *"Before 1557 you had to write out "is equal to" every single time. A Welsh teacher got
   tired of it and drew two twin lines the same length instead. That is the = key."* Trevor's
   direction is explicit: do not change it. The new `1==1` card is designed to rotate against
   it in the same Level 21 pool, and the pair is the teaching device.
3. **No collision risk between `1=1` and `1==1`.** `1=1` is not a substring of `1==1`
   (`1==1`'s substrings are `1=`, `==`, `=1`, `1==`, `==1`, `1==1`), so no pattern matcher can
   confuse the two words.
4. **`.claude/rules/levels.md` / `levels/act5.md`** — no correction needed, but worth noting
   that Level 21's documented content is *"simple equations using only digits, `-`, and `=`
   (2-1=1, 5-4=1, 10-5=5)"*, which is why both equals-sign cards belong there and read as part
   of the drill rather than as an interruption.
5. **Date guidance that a card writer will otherwise get wrong** (all three are
   created-vs-published traps, the exact fluent-error class the project keeps catching):
   - **Königsberg is 1735, not 1736.** Euler presented it to the St Petersburg Academy on
     26 August 1735 and it was published in 1741; "1736" is the *volume year* of the
     proceedings. The task brief that commissioned this batch carried 1736.
   - **Euler's polyhedron formula: 1750** (the year he wrote about it). Publication year is
     disputed between fetched and searched sources (1752 vs 1758) — leave it off.
   - **Shannon's thesis has three years in circulation** (submitted 1937 / paper 1938 / MIT's
     own record says degree issued 1940). Put no Shannon date on a card.
6. **Attribution verbs.** [[eulers-polyhedron-formula]] must not say Euler *discovered* it
   (UC Irvine: *"(re)discovered"*; Maurolico 1537, Descartes c. 1630). [[odd-and-even]] and
   [[prime-numbers]] must not say Euclid *invented* odd/even or primes — he *wrote down* the
   definitions and the proof that survived.

---

## Corrections from citation pass (2026-09-15)

- **"Euler and the Seven Bridges of Königsberg, 1736"** (as given in the commissioning brief)
  → **1735**. Presented 26 August 1735, published 1741; 1736 is the proceedings volume year.
  Sourced on [[seven-bridges-of-konigsberg]] to the Euler Archive (Written 1735 / Published
  1741) and Science News (26 August 1735).
- **"whether any language designer wrote about it afterwards as a mistake or a regret"** →
  **no.** Ritchie's actual words are *"a matter of taste, and some remain controversial."*
  The card and the page say *controversial*, not *regret*.
- **"SQL uses `=` for comparison, not assignment"** (flagged by Trevor as unverified) →
  **confirmed**, three vendor documentation sources: Oracle (*"Equality test"*), PostgreSQL
  (`datatype = datatype → boolean`, *"Equal"*), MySQL (the documented example
  `SELECT 1 = 0;` → `0`). ⚠️ No fetched page prints `1 = 1` → `1`; the card says `=` still
  asks a question rather than quoting a result nobody photographed.
- **`proof` (L10) and `truth` (L8), `sum` (L11), `xor` (L14), `node`/`even`/`bit`/`base`/
  `binary` (L12), `logic` (L13)** → **dropped**, not researched to card depth. Reasoning under
  *Dropped* below.

---

## Dropped, and why

- **`proof` (L10)** — as a subject it is a definition, not a story, and Level 10 already
  receives [[seven-bridges-of-konigsberg]] from this batch. The *idea* of a proof survives
  inside [[prime-numbers]]' third card sentence, attached to a word a child can read.
- **`truth` (L8)** — truth tables are genuinely interesting (Peirce c. 1893, Wittgenstein
  1921, Post 1921) but the attribution is contested, the subject is abstract with no physical
  picture, and Level 8 already holds **six** cards — the most in the bank. Not researched.
- **`sum` (L11)** — the obvious story is the schoolboy-Gauss-sums-1-to-100 anecdote, which is
  exactly the sort of too-good-to-check tale this project has been burned by, and Gauss
  already appears in the batch via [[modular-arithmetic]]. Deliberately not pursued.
- **`xor` (L14)** — a real operator with a genuinely kid-friendly picture (*cake or ice cream,
  but not both*), but no person, date or institutional record behind it, and Trevor's brief
  asked to prefer subjects that have all three. **The best remaining candidate if this batch
  ever gets a sequel**, and Level 14 is card-poor (2), which is the strongest argument for it.
- **`binary` / `bit` / `base` / `node` / `even` (L12), `logic` (L13)** — the bank already
  tells the binary story at Levels 20–22 ([[ascii]], [[arpanet-first-message-1969]],
  [[unix-epoch-1970]], plus Level 20's binary→HELLO reveal), and `logic` would duplicate
  [[george-boole]]. Avoided on the "do not tell a story the bank already tells" rule.

---

## Unsourceable / weakly-sourced items (batch-wide)

Each page carries its own list; these are the ones a future pass should pick up first.

- **FORTRAN as the origin of `=`-for-assignment.** The Computer History Museum hosts the
  primary — *The FORTRAN Automatic Coding System for the IBM 704 EDPM: Programmer's Reference
  Manual*, 15 October 1956 — and the fetch returned its **title and date but not its body**.
  The strongest single citation still missing from [[equality-vs-assignment]].
- **"The word *graph* was coined by J. J. Sylvester in 1878 in *Nature*."** Repeated in search
  summaries; no primary or institutional page fetched. A lovely potential card (*the idea came
  143 years before the word*) that is **not yet a fact**.
- **Whether ALGOL 60's `:=` was chosen specifically to avoid the ambiguity.** The Revised
  Report states the notation and gives no motive. Not asserted.
- **Hosts that failed this session, recorded so nobody re-spends a turn:**
  `nokia.com/bell-labs/…` (403, the canonical B manual and Ritchie mirror — use the TUHS
  mirror instead), `old.maa.org` (521, twice, the MAA Convergence Königsberg article),
  `www.ams.org` (403, the AMS feature column on Euler's formula), `web.archive.org` (refused
  by the fetch tool outright), and **every PDF tried** (the CHM FORTRAN manual, Ritchie's
  `c-history.pdf`, Keith Conrad's modular-arithmetic notes) — PDF bodies did not extract in
  this session at all.

---

## Related documents

- [[computing-history-moments]] — the main history-card research hub; this file is its
  discrete-mathematics annexe.
- [[equals-sign]] — the card that started this, and the one page here that is already shipped.
- `.claude/rules/levels.md` — the per-level key unlock order every word above was checked
  against.
- `js/history-cards.js` — the destination. **Not edited by this pass.**
