---
title: The Period / Full Stop / Dot (the mark, its names, and its job in code)
type: entity
tags: [punctuation, programming-language, etymology, keyboard-card, level-14, player-facing-claim]
level: 14
sources: 4
verified: 2026-11-04
---

The key right of the comma is `.` — called a **period** in North American English, a **full stop**
in Commonwealth English, a **full point**, and, in computing, a **dot**. In writing it **ends
declarative sentences** (not questions or exclamations, which have `?` and `!`), follows many
abbreviations, and serves as the **decimal point** in English-speaking countries. In code it is
the delimiter in **web addresses, file names and version numbers**, and the "member access"
mark in several languages. Its descent from Aristophanes of Byzantium's dots is real but easy
to garble — the sentence-ending dot was originally the **high** one (see Corrections).

## In this game

- Key arrives **Level 14**; *period* needs `p` (L10), so the name is spellable from **L10** —
  card level **14**, code level 20 (spec §5.9).
- **The name is not withheld today:** `js/ui/hud.js` `SMALL_GLYPH_CAPTION['.']` already prints
  `PERIOD`. `levels/act3.md` frames it "The period says: done."
- Do **not** reuse the line "ends a sentence" for `;` ([[semicolon]] §5) — and keep the
  period's role "can end a sentence," since `?` and `!` also do.

## The facts

### 1. Names

- Full stop in Commonwealth English, period in North American English, full point; **dot** in
  computing; "baseline dot" distinguishes it from the interpunct. [Ref 1]
- "Period" is first attested as a Latin loanword (*peridos*) in Ælfric of Eynsham's Old English
  grammar, and shifted to mean the dot marking a full stop in the works of **16th-century
  grammarians.** Both terms appear in 19th-century texts; one source says "full stop" was used only
  for the sentence-ending dot, and 2015's *Fowler's* treats them as synonyms. [Ref 1]
- Greek *periodos* ("a way around / circuit") is the root of *period* (search-result summaries; the
  Wikipedia chain above is the fetched support). [Ref 1]

### 2. Origin — the dot system

- Aristophanes of Byzantium (3rd-century BCE Alexandria per the *Full stop* article; "after 200
  BC" per *Punctuation* — the two fetched pages disagree on phrasing, so no exact year is safe)
  placed a single dot at one of three heights: **high dot = a sentence (*periodos*), mid dot = a
  clause, low dot = a *komma*.** [Refs 1, 2]
- Scribes mostly kept the terminal dot, and **from the 9th century it was written low on the
  baseline**; printing made the low dot universal. [Ref 1]
- Not established by anything fetched: a single inventor of the *modern* period. The sourced verb is
  "descends from," not "invented."

### 3. Its job in English

- Wikipedia: *"Full stops indicate the end of declarative sentences, in contrast to questions or
  exclamations."* It follows many abbreviations (American style more often than British) and marks
  the decimal separator in English-speaking countries (much of Europe reverses comma and point).
  [Ref 1]

### 4. In code

- Wikipedia: the dot separates parts of DNS lookups, web addresses, file names and versions
  (`www.wikipedia.org`, `192.168.0.1`); it separates a file name from its extension; it accesses
  members in C, C++, Java, Python; it concatenates strings in Perl and PHP. One dot = this folder,
  two dots = parent folder in Unix-like systems and Windows. [Ref 1]
- RFC 1034 (via a reading copy): when a user types a domain name, *"the length of each label is
  omitted and the labels are separated by dots."* [Ref 3]
- **Safe wording:** "Web addresses use a period, read aloud as *dot*, between parts." **Not
  safe:** "all programmers…", or any "ends a line" claim (that is the `;` story).

## Corrections from citation pass (2026-11-04)

- **Myth pre-empted: "the low dot of ancient Greece became our period."** Per both fetched pages, in
  Aristophanes' system the **high** dot ended a sentence and the **low** dot marked the small unit;
  scribes later *wrote* the terminal dot low (from the 9th century). Do not print "Aristophanes
  invented the period."
- **"Period" and "full stop" are not wrong or American-only misnomers** — both date from the
  16th–19th centuries in English; avoid ranking them.

## Unsourceable / weakly-sourced items

- Exact first date of the modern low-dot period: none; recommend card `year` = `UNKNOWN`.
- Second half of Wikipedia's *Full stop* page (chars 100k+) not read.
- RFC 1034's own date (November 1987) comes from a search-result summary; the fetched reading copy
  did not state it.

## References

1. [Wikipedia — Full stop](https://en.wikipedia.org/wiki/Full_stop) — names, Ælfric/16th-century "period," Aristophanes, 9th-century baseline, sentence/abbreviation/decimal uses, dot in DNS/files/versions. **[fetched]**
2. [Wikipedia — Punctuation](https://en.wikipedia.org/wiki/Punctuation) — three-height dot system (low = komma, mid = kōlon, high = periodos), "after 200 BC." **[fetched]**
3. [RFC 1034 §3.1 (Connected: An Internet Encyclopedia)](https://freesoft.org/CIE/RFC/1034/8.htm) — domain-name labels separated by dots; trailing dot = root. **[fetched]**
4. [Full stop — Cavacopedia mirror](https://cavac.at/cavacopedia/Full_stop) — duplicate of Wikipedia text; *(search result only, not fetched)*
