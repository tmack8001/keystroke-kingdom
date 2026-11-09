---
title: The Hyphen (the key is "hyphen-minus": a hyphen, a minus, and a stand-in dash)
type: entity
tags: [punctuation, programming-language, unicode, keyboard-card, level-21, player-facing-claim]
level: 21
sources: 4
verified: 2026-11-04
---

The key right of `0` is `-`. Its character is formally the **hyphen-minus** (U+002D): one
ASCII/typewriter key standing in for **three** different marks — a **hyphen** (joins words:
*zig-zag*, *forty-six*), a **minus sign** (subtraction), and a **dash** (a longer, separate mark —
the en dash and em dash — that the key only imitates). For a child, **"hyphen"** is the right name
for what the key does in writing; in code it is **minus**, and in command lines it starts options.
Real dashes are different characters with their own jobs.

## In this game

- Key arrives **Level 21** (`-` and `=`); *hyphen* needs `n` (L12) → spellable from **L12**; card
  level **21**, **post-terminal** — code level 21 (spec §5.9), so the caption can carry hyphen +
  code together.
- **Must not retell** the arcade `wi-fi` card (and `1=1` / `1==1` own `=`, which this page
  deliberately omits).
- ⚠️ **Naming collision in the docs:** `.claude/rules/levels/act5.md` titles Level 21 **"Dash &
  Equals"** ("the dash and equals"). The key is not a *dash* in the typographic sense — see
  Corrections. Not found in any `js/` string (grep, 2026-11-04), so docs-only for now.

## The facts

### 1. Why one key does three jobs

- Wikipedia: early typewriters and encodings used one code for several similar marks — *"a single
  key/code was almost always used for hyphen, minus, various dashes, and strikethrough."* The
  character's name comes from ASCII, where it was called **"hyphen (minus)."** *"On most keyboards,
  it is the only character that resembles a minus sign or a dash."* [Ref 1]
- Chicago Manual of Style's *Shop Talk*: the hyphen is the only one of hyphen/en dash/em dash with
  its own key (right of zero on QWERTY); the key produces U+002D HYPHEN-MINUS, so called because it
  was interchangeable with the minus sign before Unicode (1991). [Ref 2]
- Unicode keeps them apart: U+2010 HYPHEN, U+2212 MINUS SIGN, U+2013 EN DASH, U+2014 EM DASH;
  *"the standard itself uses the hyphen-minus as its hyphen character."* [Ref 1]

### 2. Its job in English

- Chicago (via Shop Talk): the hyphen is *"the punctuation mark that appears between words in
  certain compound constructions,"* e.g. *well-edited manuscript*, *fifty-three*; the en dash marks
  ranges (3–5); the em dash sets off text. [Ref 2]
- Purdue OWL: compounds may be written separately, as one word, or *"connected by hyphens"*;
  *"Use a hyphen to join two or more words serving as a single adjective before a noun"*; *"Use a
  hyphen with compound numbers"* (*forty-six*). [Ref 3]
- Kid-safe line: **"It joins words, like zig-zag."**

### 3. In code

- Languages use it for subtraction and negation; Unix short options start with it (`-R`), long ones
  with `--`; in diff output a leading `-` marks a deleted line; MySQL uses `--` for comments. It is
  *"rarely used to indicate a range, due to ambiguity with subtraction."* [Ref 1]
- Not on the fetched page: snake/kebab-case (the page mentions neither) → do not cite for naming
  conventions without a new source.
- **Safe wording:** "Many coders use it as a minus sign." **Not safe:** "it is always minus."

## Corrections from citation pass (2026-11-04)

- **"The - key is a dash."** Colloquial, but the key makes a hyphen-minus; true dashes (– —) need
  other characters, and Chicago recommends replacing hyphens typed as dashes. In the card, use
  *hyphen*; if Trevor keeps "Dash & Equals" as the level title, record it as informal.
- A date for ASCII's "hyphen (minus)" (e.g. 1963) was **not** confirmed on the fetched page — the
  cited standard is X3.4-1977; do not print a 1963 date from memory.

## Unsourceable / weakly-sourced items

- Origin of the hyphen *mark*: no fetched source dates it. Wikipedia's *Hyphen* article not read.
  Card `year` = `UNKNOWN` recommended.
- Unicode U+2010 "preferred" status: search-result summary only.

## References

1. [Wikipedia — Hyphen-minus](https://en.wikipedia.org/wiki/Hyphen-minus) — one key for hyphen/minus/dash, ASCII name "hyphen (minus)," Unicode siblings, command-line and subtraction uses. **[fetched]**
2. [Chicago Manual of Style — Shop Talk: Hyphens and Dashes, a Refresher](https://cmosshoptalk.com/2024/01/23/hyphens-and-dashes-a-refresher/) — hyphen vs en/em dash; key sits right of zero; U+002D. **[fetched]**
3. [Purdue OWL — Hyphen use](https://owl.purdue.edu/owl/general_writing/punctuation/hyphen_use.html) — compounds, compound modifiers, compound numbers. **[fetched]**
4. [Unicode mailing list / reference summaries on U+002D, U+2010](https://corp.unicode.org/pipermail/unicode/2015-June/001992.html) — hyphen-minus vs true hyphen. *(search result only, not fetched)*
