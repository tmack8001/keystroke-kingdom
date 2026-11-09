---
title: The Slash (forward slash, solidus, virgule — and its job in code)
type: entity
tags: [punctuation, programming-language, etymology, keyboard-card, level-15, player-facing-claim]
level: 15
sources: 4
verified: 2026-11-04
---

The key right of the period is `/`. It has **many names**: **slash** (the American and computing
name — the one this game should use), **forward slash** (a retronym coined to tell it apart from the
backslash), **solidus** (its official Unicode/ISO name), **oblique** (the 18th-century English
name), **stroke** (British), **virgule** (the medieval ancestor, Latin *virgula*, "twig"). In
writing it often means **"or"** (*yes/no*, *he/she*) and appears in dates, fractions and
abbreviations (*c/o*, *24/7*). In computing it **separates folders in a path and parts of a web
address**, and most languages use it for **division**. It shares an ancestor with the comma — see
[[comma]] — and has a mirror twin, [[backslash]].

## In this game

- Key arrives **Level 15**; *slash* needs only `h` (L5) → spellable from **L5**; card level
  **15**, code level 20 (spec §5.9).
- **Overlap warning (spec):** a planned math-vs-code **`//`** card (comments) would also be a slash
  card — whichever ships first owns "comments"; this page deliberately gives the *path* fact, not
  the comment fact.
- Nothing in `js/` currently prints "slash"/"solidus" (verified by grep, 2026-11-04) — the name is
  unprinted today.

## The facts

### 1. Names, with dates

- *Slash*: "recent term" — **not in Webster's Dictionary until the Third Edition (1961)**; it gained
  wide use through computing. *Oblique* was the usual English name in the 18th century; *stroke*
  (from "oblique stroke") is the British name and was used in telegraphy; *shilling mark/solidus*
  in the 19th and early 20th centuries (from the abbreviation for the shilling). [Ref 1]
- Unicode calls U+002F **SOLIDUS**; ASCII originally called it "slant." [Ref 1]
- **Forward slash** is a retronym coined to distinguish it from the backslash of MS-DOS/Windows. [Ref 1]

### 2. Origin

- The modern mark descends from the **medieval virgule**, used as a full stop, a scratch comma and
  a caesura mark (its comma use was especially common in France). Wikipedia's *Punctuation* article
  names the *virgula suspensiva* as a late-medieval pause mark — the same stroke the comma was
  later "lowered" from. [Refs 1, 2]
- Fractions: attested in England and Mexico in the 18th century; the division slash developed from
  the fraction slash in the late 18th/early 19th century. [Ref 1]

### 3. Its job in English

- Wikipedia: often stands in for "or," usually exclusive (*Y/N*); gender-neutral *he/she*;
  dates; abbreviations like *c/o*, *n/a*, *24/7*. [Ref 1]
- Kid-safe line: **"It often means *or*, like yes/no."**

### 4. In code

- File paths separate levels in a hierarchy (Unix and Unix-like systems use it for the root
  directory); web addresses; IP prefix sizes (`/29`); division in most languages; `//` begins a
  comment in many; DOS/Windows use `/` for command switches (`dir/w`). [Ref 1]
- **Berners-Lee and the `//` in web addresses.** The W3C FAQ (his own page): he copied the double
  slash from the Apollo domain system (*"So I just copied Apollo"*) to separate the host name from
  the path, and says *"now I regret that the syntax is so clumsy"* and that the full form is seldom
  needed. Secondary press reports have him calling the slashes "unnecessary" / "a mistake"; **only
  the "regret…clumsy" wording is verified at the primary source.** [Ref 3]
- **Safe wording:** "Computers use it between folder names." **Not safe:** "every address…",
  or "Berners-Lee says the slashes were a mistake" (use his W3C wording).

## Corrections from citation pass (2026-11-04)

- **"Virgule" ≠ "slash" in a single exact sense:** one dictionary cited in the search results says
  neither historical nor official usage supports reserving *virgule* and *solidus* for different
  jobs. Don't teach a virgule/solidus distinction.
- **"Slash" is a modern American/computing name,** not an old one — don't back-date it.
- The Berners-Lee "mistake" wording is press paraphrase, not the primary text (see above).

## Unsourceable / weakly-sourced items

- Last 28k characters of the Wikipedia *Slash* page were not read.
- The press quotes (NYT/PC Pro) were search-result only.

## References

1. [Wikipedia — Slash (punctuation)](https://en.wikipedia.org/wiki/Slash_(punctuation)) — names and dates, Unicode SOLIDUS, uses in writing and computing. **[fetched]** (first 100k of 128k chars)
2. [Wikipedia — Punctuation](https://en.wikipedia.org/wiki/Punctuation) — virgula suspensiva (late Middle Ages). **[fetched]**
3. [Tim Berners-Lee — FAQ, "Why the //, #, etc?" (W3C)](https://www.w3.org/People/Berners-Lee/FAQ.html) — "I just copied Apollo"; "now I regret that the syntax is so clumsy." **[fetched]**
4. [Sorry about the "//", says Tim Berners-Lee (iTnews)](https://www.itnews.com.au/news/sorry-about-the-says-tim-berners-lee-158135) — press coverage of the regret. *(search result only, not fetched)*
