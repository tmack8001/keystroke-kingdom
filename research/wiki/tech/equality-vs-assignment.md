---
title: Equality vs Assignment — `=` and `==`
type: concept
tags: [programming-languages, notation, mathematics, discrete-math, history-card, proposed-content]
level: 21
sources: 9
verified: 2026-09-15
---

Mathematics has used `=` to mean *"these two things are the same"* since [[equals-sign|Robert
Recorde drew it in 1557]]. Programming took the same character and gave it a **different job**:
in FORTRAN, C, Python, JavaScript and most of that family, `=` means *"put this value into
that box."* That left the languages with no sign for the original question — so they invented
one. **`==` asks; `=` tells.** The split is documented in primary sources: **ALGOL 60** (1960)
dodged the clash by writing assignment as `:=` and keeping `=` for comparison; **Ken
Thompson's B manual of 7 January 1972** is the earliest document this research could fetch
that defines both jobs side by side — *"The assignment operator `=` merely evaluates the
rvalue and stores the result in the lvalue"* and *"The equality operators `==` (equal to) and
`!=` (not equal to) perform similarly to the relation operators."* C inherited it from B and
handed it to almost everything since. **Dennis Ritchie himself called the choice
controversial** — not a mistake, not a regret, but *"a matter of taste."* And **SQL never made
the swap at all**: there `=` is still a question, so `1=1` is a perfectly good thing to write.

## In this game

**Not yet built. Proposed as Level 21's THIRD history card**, deliberately paired with the
already-shipped `1=1` / THE EQUALS SIGN card ([[equals-sign]]) on the same level.

**Moment word: `1==1`.** Character-by-character against Level 21's cumulative alphabet: `1` ✓
(unlocked Level 20), `=` ✓ (**Level 21, new**), `=` ✓, `1` ✓. The `=` is the gate, so it
attaches exactly at Level 21, and it contains one of the level's own new characters (INV-56).
Lowercase-and-symbols only, no spaces. **Not a collision with the shipped `1=1` card:** the
string `1=1` is not a substring of `1==1` (`1==1`'s substrings are `1=`, `==`, `=1`, `1==`,
`==1`, `1==1`), so no matcher can confuse them.

**Why the pair is the whole point.** Trevor's observation, 2026-09-15: `1=1` is unambiguous
in mathematics and *wrong as code* — typed into TypeScript, C or Python, `1=1` is a syntax
error, because `=` there means assignment and you cannot assign to the number 1. The
collection is discovered one card at a time, so **each card can decode one idea**: `1=1`
teaches where the sign came from (1557), `1==1` teaches why code needed a second one. A child
who finds both has been taught the difference between *stating* and *asking* without anyone
using either word.

Related: [[equals-sign]], [[modular-arithmetic]] (Gauss hit the **identical** problem in 1801
and solved it the same way — a new sign to prevent ambiguity), [[unix]], [[ls-command]],
[[hello-world]], [[the-eighth-key]].

## The facts

- **Mathematics: `=` states.** Recorde, 1557 — see [[equals-sign]] for the sourced history.
  Nothing on this page disturbs that card.
- **ALGOL 60 kept the two jobs apart, and did it first among the sources fetched here.** The
  *Revised Report on the Algorithmic Language ALGOL 60* (editor Peter Naur; committee
  including Backus, Bauer, McCarthy, Perlis, Rutishauser, van Wijngaarden, Woodger) defines
  the assignment statement with `:=` — `<left part> ::= <variable> := | <procedure identifier>
  :=` — while `=` appears in a different list entirely: `<relational operator> ::= < | ≤ | = |
  ≥ | > | ≠`. **Two symbols, two jobs, in one standards document.**
- **B, 7 January 1972, Bell Labs, Ken Thompson.** *Users' Reference to B* defines both, and
  the wording is worth keeping verbatim:
  - *"The assignment operator `=` merely evaluates the rvalue and stores the result in the
    lvalue."*
  - *"The equality operators `==` (equal to) and `!=` (not equal to) perform similarly to the
    relation operators."*
  ⚠️ **This page does NOT claim B invented `==`.** It claims this is the earliest primary
  document fetched in this session that defines `==` as the equality operator. B's own
  ancestry (CPL, BCPL) was not read here; Ritchie says only that BCPL→B changes were made
  "as a matter of taste." Treat "the first language with `==`" as **unsourced**.
- **Ritchie called it controversial, not a mistake.** *The Development of the C Language*
  (Dennis M. Ritchie, presented at the Second History of Programming Languages conference,
  Cambridge, Mass., April 1993): *"Other fiddles in the transition from BCPL to B were
  introduced as a matter of taste, and some remain controversial, for example the decision to
  use the single character `=` for assignment instead of `:=`."* ⚠️ **Attribute the right
  verb.** He does not call it a regret or an error. The word on the page is *controversial*,
  and the framing is *taste*. (Same paper: BCPL was designed by Martin Richards in the
  mid-1960s; Thompson created B in 1969–70.)
- **Python, today, spells it out for beginners.** The official tutorial: *"The equal sign
  (`=`) is used to assign a value to a variable."* The language reference, §Value comparisons:
  *"The operators `<`, `>`, `==`, `>=`, `<=`, and `!=` compare the values of two objects."*
- **The confusion is real enough that compilers ship a warning for it.** GCC's `-Wparentheses`
  warns *"when there is an assignment in a context where a truth value is expected"* — i.e.
  when you wrote `=` and almost certainly meant `==` — and *"This warning is enabled by
  `-Wall`."* A compiler flag is an unusually honest artifact: the toolchain itself expects
  people to mix these two signs up.
- **⚠️ SQL is the exception, and Trevor's hunch was right.** SQL never took `=` for
  assignment in comparisons, so `=` there is still the question:
  - **Oracle** (*SQL Language Reference*, Comparison Conditions): *"Comparison conditions
    compare one expression with another. The result of such a comparison can be `TRUE`,
    `FALSE`, or `UNKNOWN`."* The table row for `=` reads simply: *"Equality test."*
  - **PostgreSQL** (Table 9.1, Comparison Operators): `datatype = datatype → boolean`,
    *"Equal"*.
  - **MySQL** documents a bare literal comparison as a whole query and prints its answer:
    `mysql> SELECT 1 = 0;` → `0`.
  So in SQL, `1=1` is not a syntax error — it is a question with the answer *yes*. **One
  string, valid in one language and broken in another.** ⚠️ Note the honest limit: the
  fetched docs show `SELECT 1 = 0` → `0`; no fetched page prints `1 = 1` → `1`. The card
  should say *"in the language databases speak, `=` still asks a question"* rather than quote
  a result nobody photographed.
- **What is NOT established here.** Which language *first* used `=` for assignment (FORTRAN is
  the usual answer and is very likely right — see the unusable-sources note below, the 1956
  IBM manual could not be read); which language *first* used `==`; and whether `:=` was chosen
  by the ALGOL committee *specifically* to avoid the ambiguity (the report states the notation,
  it does not explain the motive). Ritchie's sentence is evidence that the `=`-vs-`:=` choice
  was *argued about*, which is a weaker and safer claim than "ALGOL chose `:=` to avoid
  confusion."

## Card-ready facts

1. *"In maths, = means \"these are the same.\" In code it often means \"put this in here.\" So
   coders needed a second sign just to ask the question: == means \"are these the same?\""*
   (~168 chars) — supports: Python official tutorial **[fetched]** (`=` assigns) + Python
   language reference **[fetched]** (`==` compares) + Thompson's *Users' Reference to B*
   **[fetched]** (both definitions, 1972).
2. *"A 1972 computer manual gave two signs two jobs: one = to put a number somewhere, and two
   == to ask if things match. Nearly every language still does it that way."*
   (162 chars) — supports: Thompson, *Users' Reference to B*, 7 January 1972 **[fetched]**
   (verbatim definitions) + Ritchie, *The Development of the C Language* **[fetched]** (B→C
   lineage) + Python docs **[fetched]** (still true today).
3. *"One sign, two jobs, is a real problem. The people who built these languages argued about
   it, and databases never went along: there, = still means \"is it the same?\""*
   (159 chars) — supports: Ritchie **[fetched]** (*"remain controversial"*) + Oracle SQL
   Language Reference **[fetched]** (`=` is an "Equality test") + PostgreSQL **[fetched]**
   (`=` → boolean, "Equal").

## References

1. [Revised Report on the Algorithmic Language Algol 60 (transcription, masswerk.at)](https://www.masswerk.at/algol60/report.htm) —
   PRIMARY STANDARDS DOCUMENT (transcribed). Editor Peter Naur; the 13-author committee;
   January 1960 conference, April 1962 revised edition. Supplies the assignment syntax
   (`<left part> ::= <variable> := …`) and the separate relational-operator production
   (`< | ≤ | = | ≥ | > | ≠`). **[fetched]**
2. [Users' Reference to B — Ken Thompson, 7 January 1972 (TUHS mirror of Dennis Ritchie's home page)](https://minnie.tuhs.org/Mirrors/Dennis/kbman.html) —
   PRIMARY. Bell Labs technical memorandum. Both verbatim operator definitions quoted above.
   **[fetched]** *(The Nokia/Bell-Labs copy of the same file returns HTTP 403 — see below.)*
3. [The Development of the C Language — Dennis M. Ritchie (TUHS mirror)](https://minnie.tuhs.org/Mirrors/Dennis/chist.html) —
   PRIMARY (the language's author, HOPL-II, April 1993). The *"matter of taste … remain
   controversial … `=` for assignment instead of `:=`"* sentence; BCPL/Martin Richards
   mid-1960s; Thompson created B 1969–70. **[fetched]**
4. [The Python Tutorial — An Informal Introduction to Python](https://docs.python.org/3/tutorial/introduction.html) —
   OFFICIAL LANGUAGE DOCUMENTATION. *"The equal sign (`=`) is used to assign a value to a
   variable."* **[fetched]**
5. [The Python Language Reference — Expressions (§Value comparisons)](https://docs.python.org/3/reference/expressions.html) —
   OFFICIAL. *"The operators `<`, `>`, `==`, `>=`, `<=`, and `!=` compare the values of two
   objects."* **[fetched]**
6. [PostgreSQL — Comparison Functions and Operators (Table 9.1)](https://www.postgresql.org/docs/current/functions-comparison.html) —
   OFFICIAL. `datatype = datatype → boolean`, *"Equal"* — SQL's `=` is a comparison.
   **[fetched]**
7. [MySQL 8.4 Reference Manual — Comparison Functions and Operators](https://dev.mysql.com/doc/refman/8.4/en/comparison-operators.html) —
   OFFICIAL (vendor). The documented example `mysql> SELECT 1 = 0;` → `0`, showing a bare
   literal equality is a legal SQL expression with a value. **[fetched]**
8. [Oracle Database SQL Language Reference 19c — Comparison Conditions](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Comparison-Conditions.html) —
   OFFICIAL (vendor). *"Comparison conditions compare one expression with another. The result
   … can be `TRUE`, `FALSE`, or `UNKNOWN`."*; the `=` row: *"Equality test."* **[fetched]**
9. [GCC — Warning Options (`-Wparentheses`)](https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html) —
   OFFICIAL TOOL DOCUMENTATION. Warns *"when there is an assignment in a context where a truth
   value is expected"*; *"This warning is enabled by `-Wall`."* Evidence that `=`-for-`==` is a
   recognised, tooled-against mistake. **[fetched]**

## See also

[[equals-sign]] — the 1557 half of the pair; the card this one is designed to rotate against.
[[modular-arithmetic]] — Gauss, 1801, faced the same one-sign-two-meanings problem in pure
mathematics and solved it the same way: by drawing a new sign.
[[george-boole]] — where `TRUE` and `FALSE`, the thing `==` evaluates to, come from.
[[ls-command]] · [[unix]] — the same Bell Labs corridor, the same few years.

## Corrections from citation pass (2026-09-15)

- **The task brief suggested checking whether any designer wrote about `=`-for-assignment
  "afterwards as a mistake or a regret."** The evidence does not support *mistake* or
  *regret*. Ritchie's own words are *"a matter of taste, and some remain controversial."*
  Written as controversy, not remorse.
- **"ALGOL's `:=` was chosen to avoid exactly this ambiguity"** — plausible, widely repeated,
  and **not asserted here**. The Revised Report specifies the notation and gives no rationale;
  no fetched source supplies the committee's motive.
- **"B was the first language with `==`"** — appears in search summaries (attributed to
  Wikipedia's *Equals sign* article) and is **not asserted**. What is asserted is narrower and
  checkable: the 1972 B manual is the earliest fetched primary defining it.

## Unsourceable / weakly-sourced items

- **FORTRAN as the origin of `=`-for-assignment.** The Computer History Museum hosts the
  primary document — *The FORTRAN Automatic Coding System for the IBM 704 EDPM: Programmer's
  Reference Manual*, **15 October 1956** — at
  <https://archive.computerhistory.org/resources/text/Fortran/102649787.05.01.acc.pdf>.
  ⚠️ **The PDF's metadata (title and date) came back on fetch but its body did not extract.**
  So: the object exists and is dated, and **its contents are NOT cited here as read**. A future
  pass with a PDF-text tool should pull the "arithmetic formula" paragraph — it is the single
  strongest possible citation for this claim, and a genuinely good card in its own right.
- **Ritchie's *Development of the C Language* as PDF** —
  <https://www.math.uh.edu/~sanders/Math6378/Sp17/Documents/C_Lang/c-history.pdf> fetched but
  returned compressed binary, unreadable. The TUHS HTML mirror (ref 3) was used instead.
- **Thompson's B manual on Nokia/Bell Labs** —
  <https://www.nokia.com/bell-labs/about/dennis-m-ritchie/kbman.html> — **HTTP 403. Unusable
  this session**, recorded so a future pass knows the canonical copy is there. (The same host
  403'd on a different file in the 2026-09-15 starved-levels pass; assume the whole mirror is
  blocked.)
- **Internet Archive OCR of the B manual** — the item `users-ref-to-b` exists in search results
  but `…_djvu.txt` returned 404 after a redirect. Not cited.
- **web.archive.org** — this agent's fetch tool refuses the host outright. Noted so nobody
  else spends a turn on it.
- **The Computer History Museum's ALGOL 60 report PDF**
  (<https://softwarepreservation.computerhistory.org/ALGOL/report/Algol60_revised_report_CACM.pdf>)
  appeared in search results and was **not fetched** (PDF, and the masswerk transcription
  answered the question). It is the better institutional citation if a future pass can read it.
- **"Since assignment is about twice as frequent as equality testing in typical programs, it's
  appropriate that the operator be half as long."** A widely-quoted line, attributed in one
  secondary source to Ken Thompson via K&R's *The C Programming Language*. **Not verified
  against K&R this session — do not print it on a card.**
