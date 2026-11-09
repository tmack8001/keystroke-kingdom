---
title: The Backslash (a computer-era mark with no everyday writing job)
type: entity
tags: [punctuation, programming-language, ascii, keyboard-card, level-22, player-facing-claim]
level: 22
sources: 5
verified: 2026-11-04
---

The key above Enter is `\` — **backslash** (Unicode: **REVERSE SOLIDUS**, U+005C; also called
whack, slosh, reverse slash and others). It is the mirror image of the [[slash]]. **It has no
job in ordinary English writing** — Wikipedia calls it *"a mark used mainly in computing and
mathematics."* In computing it separates folder names on **Windows** (a 1983 compromise, below),
and in **many** programming languages it is the **escape character** (`\n` = new line). The
history is a classic popularizer-vs-inventor trap: **Bob Bemer got it into ASCII (proposed
September 1961); he did not invent it** — Teletype used it earlier.

## In this game

- Key arrives **Level 22**; *backslash* needs `c` (L13) → spellable from **L13**; card level
  **22**, post-terminal (code level 22). Spec §5.9: **never retell the `\n` card** (`newline-crlf`,
  L22, `js/history-cards.js:254`) or `\o/`. That is why this page proposes the **Windows-path**
  fact, not the escape fact, for the code line.
- **No player-facing string** names the backslash today (grep, 2026-11-04; only code comments).
- **Literacy honesty:** there is no sourced writing role to teach. The card's "writing" line is
  therefore a *name-and-shape* line ("it leans the other way from slash"), not a punctuation rule.

## The facts

### 1. Names and shape

- Unicode name: **REVERSE SOLIDUS** (Unicode 1.0 name: BACKSLASH); Wikipedia lists hack, whack,
  escape, reverse slash, slosh, downwhack, backslant, backwhack, bash, reverse slant, reversed
  virgule. It is *"the mirror image of the common slash /."* [Refs 1, 4]

### 2. Origin — standardized by Bemer, used earlier by Teletype

- The **earliest documented reference may be a 1937 Teletype Corporation maintenance manual**; in
  1945 Teletype called it a "diagonal key." In **June 1960** IBM's *extended character set
  standard* included it at code 0x19. In **September 1961** IBM's Bob Bemer asked the X3.2 committee
  to standardize `[`, `]` and `\`, calling the backslash a *"reverse division operator"* and citing
  Teletype's use; the goal was to build ALGOL's logical operators from `/\` and `\/`. The committee
  adopted it in **November 1961**, in the draft that became ASCII. Wikipedia's article **does not
  credit Bemer with inventing it.** [Ref 1]
- The Computer History Museum's finding aid for his papers: *"Bemer was responsible for six
  characters in ASCII, most notably the escape and backslash characters."* — a **standardization**
  credit. [Ref 2]
- Verbs: Bemer **"added it to ASCII" / "proposed it for ASCII,"** never "invented." The 1959 date
  from a blog (Shady Characters, 403 — not read) is unverified.

### 3. Windows paths — the 1983 compromise

- Wikipedia: MS-DOS 2.0 (1983) borrowed hierarchical directories from Unix (which uses `/`);
  Microsoft adopted the backslash, *"possibly on the insistence of IBM,"* mainly to avoid conflict
  with MS-DOS 1.0 where `/` marked command options (`DIR/W`). [Ref 1]
- OS/2 Museum (a specialist history blog — good, not institutional): PC DOS 1.0/1.1 already used
  `/` as an option marker; **Microsoft reportedly wanted `/` for paths and IBM rejected it** because
  it would have broken DOS 1.x batch files; the author attributes the *choice of backslash* mainly
  to ergonomics on the IBM Model F keyboard, and says plainly that *who chose it and why is not
  fully documented* and the slash-as-switch lineage (TOPS-10) is circumstantial. [Ref 3]
- **Safe wording:** "Windows uses it between folder names." **Not safe:** any "because…" sentence
  on a child card.

### 4. The escape character (not for this card, recorded for the wiki)

- In C, Perl, PHP, Python, Unix scripting and JSON a backslash signals that the next character is
  special or literal (`\n` = newline, `\\` = one backslash); it also appears in regular
  expressions and as a markup start character in TeX/RTF. [Ref 1]

## Corrections from citation pass (2026-11-04)

- **"Bob Bemer invented the backslash"** (very widely repeated; also the CHM/IEEE honorific
  summaries are looser) → **standardized/added to ASCII**; earlier Teletype use is documented.
- **"The backslash was invented for programming"** → it is attested in telecom (1937 manual) before
  ALGOL; ALGOL's `/\ \/` is why it entered **ASCII**.
- **"Windows uses backslash because of a deliberate design choice by Microsoft"** → the sourced
  account is a compatibility compromise with IBM's DOS 1.x switch syntax; details are contested.

## Unsourceable / weakly-sourced items

- The 1937 Teletype manual reference: Wikipedia only ("may be"), not independently verified.
- IEEE Computer Society profile listed Bemer's characters (search-result summary); fetch failed
  (SSL handshake error) — dropped.
- Exact adoption month/day (September 18 vs "September 1961") varies by source; print "1961."

## References

1. [Wikipedia — Backslash](https://en.wikipedia.org/wiki/Backslash) — Teletype 1937/1945, IBM 1960, Bemer September 1961, ASCII November 1961, escape character, MS-DOS 2.0 paths. **[fetched]**
2. [Computer History Museum — Robert (Bob) Bemer papers](https://www.computerhistory.org/collections/catalog/102724781/) — "responsible for six characters in ASCII, most notably the escape and backslash." **[fetched]**
3. [OS/2 Museum — Why does Windows really use backslash as path separator](http://www.os2museum.com/wp/why-does-windows-really-use-backslash-as-path-separator/) — DOS 1.x switch history, IBM's objection, Model F keyboard theory, the uncertainty. **[fetched]**
4. [codepoints.net — U+005C](https://codepoints.net/U+005C) — REVERSE SOLIDUS; Unicode 1.0 name BACKSLASH; aliases. **[fetched]**
5. [IEEE Computer Society — Robert Bemer profile](https://info.computer.org/profiles/robert-bemer) — characters he contributed, incl. `[ ] \`. *(search result only, not fetched — SSL handshake failed)*
