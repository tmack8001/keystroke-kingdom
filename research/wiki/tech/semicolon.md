---
title: The Semicolon (the mark, its name, and its job in code)
type: entity
tags: [punctuation, programming-language, etymology, eighth-key, level-13, player-facing-claim]
level: 13
sources: 15
verified: 2026-10-31
---

The semicolon is the mark `;` — the character on the key the game calls "the eighth key." The
**name** is *semi-* ("half") + *colon*, because the mark is a colon whose lower dot has become a
comma. The **mark** first appears in print in Venice, in Pietro Bembo's *De Aetna*, printed by
Aldus Manutius's press in **February 1496** (the widely repeated "1494" has no attested source —
see Contested). In English writing it mainly **joins two closely related sentences** that could
each stand alone. In **programming** it is the mark many languages use to **end an instruction**
(C, Java, Rust) — but "every language" and "every line" are both false: Pascal and ALGOL 60 use it
to *separate* statements, Python needs it only to squeeze two statements onto one line, and
JavaScript and Go insert it for you. The one kid-safe code sentence is **"many languages," not
"all"** and **"instruction," not "line."**

## In this game

- This is the research behind the planned **Level 13 teaching moment** (Trevor): C — the last
  letter of s-e-m-i-c-o-l-o-n — unlocks there (the others arrive earlier: S/L at 3, E/I at 6, O at 9, M at 11, N at 12; C at 13), and
  the comma ("a breath") is taught in the same level. The page supports the NAME and the CODE
  MEANING for an early reader who has typed the key since Level 4. See [[the-eighth-key]] for the
  key's role in the game.
- **Existing card scope — do not retell:** the arcade already has `jdk` (JAVA — see
  [[java-language]]), `ls` (the Unix list command — see [[unix]]) and the `1=1` / `1==1` pair
  (see [[equals-sign]]). Nothing below tells those stories; the code claim is deliberately
  language-general. The `js/history-cards.js` header's "never retell a cross-referenced card" rule
  applies.
- **Collides with the current game text:** `EIGHTH_KEY_CONFESSION` in `js/main.js` says
  *"PROGRAMMERS END EVERY LINE WITH IT;"* — **"every line" is false** (see Corrections and
  Downstream flags).

## The facts

### 1. The name

- *Semicolon* = *semi-* ("half," Latin *sēmi-*) + *colon* (Greek *kôlon* via Latin). The mark is
  described as a colon with its lower dot replaced by a comma. Wiktionary (whose entry cites the
  OED for the word) lists no earlier English attestation than Ben Jonson's *The English Grammar*
  (written 1638, published 1692): *"A Semicolon is a distinction of an imperfect Sentence."*
  Merriam-Webster's "first known use" is **1644** (search-result snippet only; the page returned
  403 and was not read). So: the English *word* is a **17th-century** word. No finer date than
  "1600s" is safe to print. [Refs 1, 2]
- Safe: "semi means half." Not safe to claim as a *kid-facing fact*: "half colon, half comma,"
  stated as exact — it is a description of the shape, which is accurate, but "semi = half" is the
  load-bearing, sourced part.

### 2. The mark in print — what is and is not established

- **Established:** Bembo's *De Aetna* was printed by Aldo Manuzio (Aldus Manutius) in Venice and
  carries the earliest attested printed semicolon; the roman type was cut for Aldus by Francesco
  Griffo (Grolier Club record: a *"new Roman font designed and cut for Aldus"* by Griffo; the
  Aldine Press article says Griffo's roman *"first appeared in February 1496 in Pietro Bembo's De
  Aetna"* and credits the book with the first printed semicolon; the type was revived by Monotype
  in 1928–29 as **Bembo**). [Refs 3, 4, 5]
- **Date — created vs shipped vs folklore:** The book dates itself February **1496** (Gregorian).
  A Cambridge University Library result gives "February 1495 *more Veneto*" — the same month, the
  Venetian new-year calendar (search result only, not fetched). **1494** is the figure in Cecelia
  Watson's popular account ("born in Venice in 1494") and is repeated widely; Wikipedia states that
  1494 *has no attested source* and that the dialogue recalls a **September 1494 conversation**
  that the book is set around — a plausible origin of the confusion (conversation date, not print
  date). **Do not print 1494.** [Refs 3, 5, 6]
- **Invention is NOT established.** One reading of Watson's book (a review, search result only)
  says she does not credit Aldus with *creating* the mark, only with the first *printed* use, and
  traces its roots to manuscript marks. Treat "Aldus invented the semicolon" as popularizer-vs-
  inventor overreach; the sourced verb is "**first printed**." [Refs 5, 6]
- **Spread:** Aldus's grandson, Aldo Manuzio the Younger, explained the semicolon (placing it
  between comma and colon) in *Orthographiae ratio* (1561); Henry Denham was using it "with
  propriety" in English texts by about 1580. [Ref 5]

### 3. Its job in English (plain)

- Purdue OWL: *"Use a semicolon when you link two independent clauses with no connecting words."*
  Wikipedia adds the second job — separating list items that already contain commas (a "super
  comma"). [Refs 5, 7]
- The "pause stronger than a comma, weaker than a colon/period" account is the **traditional
  (Renaissance) pause model** — consistent with the 1561 placement "between comma and colon" [Ref
  5] — but it is a *historical* description, not what modern guides lead with. For a child, the
  "joins two sentences that belong together" wording is the one with a fetched modern source; the
  pause wording is acceptable as the old teaching shorthand and pairs naturally with Level 13's
  "a comma is a breath."

### 4. In code — terminator, separator, optional

Verified against each language's own documentation or standard where it was reachable:

| Language | What `;` does | Source |
|---|---|---|
| **Java** | Ends a statement: expressions *"can be made into a statement by terminating the expression with a semicolon"* | Oracle Java Tutorial [Ref 8] |
| **C** | Ends statements — but only some forms: compound statements end with `}`, and *"every statement-producing rule that doesn't end in 'statement' ends in semicolon"* (so a `{ … }` block or an `if (…)` header carries none of its own) | Wikipedia comparison [Ref 9]; 1984 comp.lang.c post, quoted (a mailing-list post, **not** the standard — weakest ref here) [Ref 10] |
| **Rust** | Terminator | Wikipedia comparison [Ref 9] |
| **ALGOL 60** (1960) | **Separator**: `<compound tail> ::= <statement> end \| <statement> ; <compound tail>` — the last statement before `end` has none | ALGOL 60 Revised Report, §4.1.1 [Ref 11] |
| **Pascal** | Separator (so none is needed before `end`) | Wikipedia comparison [Ref 9]; community wiki statement not read (offline) |
| **Python** | **Optional**: newline ends a statement; *"Several simple statements may occur on a single line separated by semicolons"* | Python Language Reference [Ref 12] |
| **JavaScript** | Formally required for some statements, but *"JavaScript is able to automatically insert semicolons"* | MDN [Ref 13] |
| **Go** | *"The formal syntax uses semicolons as terminators… Go programs may omit most of these semicolons"* (inserted by the compiler) | Go Language Specification [Ref 14] |

- **Wikipedia's synthesis** (Ref 5): the separator-vs-terminator question was argued from the
  1960s to the 1980s and *"semicolons as terminators has largely won out"*; the semicolon is
  optional in BCPL, Python, R, Eiffel and Go; **ALGOL 60 originated** the use of the semicolon to
  mark statement boundaries. (ALGOL 60 is the origin of the *statement-boundary* role, **not** of
  the mark itself — do not blur these.)
- **What this licenses.** Safe: *"In many programming languages, a semicolon marks the end of an
  instruction."* (The word "instruction" sidesteps the separator/terminator technicality.) **Not
  safe:** "programmers end every line with it" (blank lines, `{`/`}` lines, `if (…)` lines,
  comments and — in C — `#include` lines carry none; Python programmers mostly never type one);
  "all languages"; "the key programmers use most" (the wording on [[the-eighth-key]]'s [[ada-lovelace]] line is
  anecdotal — no strong source found).
- **Limits to state if challenged:** terminator-vs-separator is a real design split; JavaScript
  and Go programmers *often write none* even though the grammar has them; the `for ( ; ; )` header
  in C-family languages uses `;` as a *divider inside a line*. None of that falsifies "many."

### 5. Misleading-to-a-child checks

- **Greek question mark.** In Greek, the question mark **looks identical** to `;`: Unicode's
  U+037E GREEK QUESTION MARK has a canonical decomposition to U+003B, so the two are canonically
  equivalent (Unicode 1.1, 1993). Wikipedia notes the same overlap in Greek and Church Slavonic.
  Relevant to a *parent* (a famous prank is swapping them in someone's code); **not relevant to
  the child caption** — it is a trap only if the game ever says "this mark asks questions
  somewhere." Don't mention it in-game. [Refs 5, 15]
- **Do not describe `;` as "ending a sentence."** In English it does *not* end a sentence (a period
  does); the code meaning is a different job for the same mark — exactly the "same symbol, two
  meanings" theme of [[equals-sign]]. A caption that says "end" for code and "join" for writing
  keeps the two apart.
- **"Semicolon" as a WORD in the game.** The game's rule withholds it until now ("the Lyria music
  tool cannot pronounce it" is a *music* constraint, not a text one — CLAUDE.md, [[the-eighth-key]]).
  A text caption is not affected by Lyria; the *rule change* is a design decision for Trevor.

## Corrections from citation pass (2026-10-31)

- **"PROGRAMMERS END EVERY LINE WITH IT;"** (`js/main.js` `EIGHTH_KEY_CONFESSION`; also
  `research/wiki/culture/the-eighth-key.md`, `proposed-egg-references.md`, `research/hacker-culture.md`
  §egg, `docs/features/easter-eggs.md`): **false as worded.** Only some lines of some languages
  end in `;`. The 2026-07 egg research took the line from the design bible, never from a source.
  Corrected wording below; `the-eighth-key.md` was amended in this pass.
- **"1494" as the semicolon's birth year** (popular, e.g. Watson): the print date is
  **February 1496**; 1494 has no attested source (Wikipedia, Grolier Club).
- **"Aldus invented the semicolon":** only "first printed" is sourced.

## Unsourceable / weakly-sourced items

- Exact first English use of the *word* — 1638 (Jonson, via Wiktionary) vs 1644 (M-W, snippet
  only); use "1600s" at most.
- ISO C text for "terminator": not read; C is supported via Wikipedia + a 1984 mailing-list post.
  Java's own tutorial and the Go spec are the strong refs for "terminator."
- Pascal "separator": Wikipedia comparison only; Jensen & Wirth manual and the Lazarus wiki were
  not readable. Weak, and Pascal is not needed for the player-facing sentence.
- Watson's own text (Paris Review essay / book) was not fetched; her claims are second-hand (Language
  Hat fetched for the 1494 quote; the "she does not credit Aldus" gloss is a search-result review).
- "The key programmers use most" — anecdotal — no strong source found.

## References

1. [Wiktionary — semicolon](https://en.wiktionary.org/wiki/semicolon) — etymology (semi- + colon), Jonson 1638/1692 earliest citation. **[fetched]**
2. [Merriam-Webster — semicolon](https://www.merriam-webster.com/dictionary/semicolon) — first known use 1644. *(search result only, not fetched — page returned 403)*
3. [Grolier Club — *Petri Bembi de Aetna*](https://grolierclub.omeka.net/items/show/185) — February 1496; new roman font cut by Griffo for Aldus. **[fetched]**
4. [Cambridge University Library — Bembo, De Aetna](https://exhibitions.lib.cam.ac.uk/manutius/?p=17) — Feb 1495 more Veneto; first Latin text printed by Aldus. *(search result only, not fetched — connection refused)*
5. [Wikipedia — Semicolon](https://en.wikipedia.org/wiki/Semicolon) — De Aetna, 1494 unattested vs Feb 1496, Orthographiae ratio 1561, Denham ~1580, English function, programming roles, Greek question mark. **[fetched]**
6. [Language Hat — the birth of the semicolon](https://languagehat.com/the-birth-of-the-semicolon/) — Watson's "born in Venice in 1494" framing, Griffo, De Aetna as dialogue about Etna. **[fetched]**
7. [Purdue OWL — Commas vs. semicolons](https://owl.purdue.edu/owl/general_writing/punctuation/commas/commas_vs_semicolons.html) — semicolon links two independent clauses with no connecting words. **[fetched]**
8. [Oracle Java Tutorials — Expressions, Statements, and Blocks](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/expressions.html) — expressions become statements "by terminating the expression with a semicolon." **[fetched]**
9. [Wikipedia — Comparison of programming languages (syntax)](https://en.wikipedia.org/wiki/Comparison_of_programming_languages_(syntax)) — terminator/separator table for C, Java, Rust, Pascal, ALGOL 60, Python, JavaScript, Go. **[fetched]**
10. [comp.lang.c 1984 — "Algol-style vs C-style semicolons"](https://www.tuhs.org/Usenet/comp.lang.c/1984-June/008978.html) — compound statements end in `}`; only some constructs end in `;`. **[fetched]** (informal source)
11. [Revised Report on ALGOL 60 (masswerk copy)](https://masswerk.at/algol60/report.htm) — §4.1.1 BNF with `;` between statements. **[fetched]** (the Computer History Museum copy at archive.computerhistory.org was reachable only as an index/images, so the text copy was used)
12. [Python Language Reference — Simple statements](https://docs.python.org/3/reference/simple_stmts.html) — semicolon separates several simple statements on one line. **[fetched]**
13. [MDN — Lexical grammar (automatic semicolon insertion)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar) — JavaScript inserts semicolons automatically. **[fetched]**
14. [The Go Programming Language Specification](https://go.dev/ref/spec) — "Semicolons" paragraph: terminators in the grammar, mostly omitted in source. **[fetched]**
15. [Codepoints — U+037E GREEK QUESTION MARK](https://codepoints.net/U+037E) — canonical decomposition to U+003B. **[fetched]**
