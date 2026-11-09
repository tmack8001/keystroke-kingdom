---
title: The Apostrophe (missing letters, belonging, and a disputed birth)
type: entity
tags: [punctuation, programming-language, etymology, keyboard-card, level-23, player-facing-claim]
level: 23
sources: 6
verified: 2026-11-04
---

The key right of the eighth key is `'` — the **apostrophe** (in code also called the **single
quote**; ASCII 0x27 is the straight, typewriter form). In English it does **two jobs**: it shows
where **letters are missing** (*don't*, *it's*) and it shows **belonging** (*Oona's*). The mark
entered English in the **1500s**, from French printing, as an **elision** mark; its possessive
job arrived later, sporadically in the 1600s and codified in the 1800s. Who first printed it is
**disputed** (Geoffroy Tory's 1529 French book is the usual credit). In code, **many** languages
use a pair of them to wrap text.

## In this game

- Key arrives **Level 23**; *apostrophe* needs `p` (L10), `h` (L5) → spellable from **L10**; card
  level **23**, post-terminal (code level 23). Level 23's content *is* contractions (*don't, it's,
  we're*) — the card's writing line mirrors it. L23 holds two symbols → two plays.
- **The name is not withheld:** `js/ui/hud.js` `SMALL_GLYPH_CAPTION["'"]` already prints
  `APOSTROPHE`. The beat adds role + origin, not a hidden word. `js/history-cards.js:261`
  (`o'reilly`) already exercises this key without telling its story.

## The facts

### 1. Names

- *Apostrophe* is Greek *apostrophos* ("turning away"): the mark began as the *apostrophos
  prosoidia*, a small curve in Greek poetry showing where a syllable was dropped; Latin
  *apostrophus*, French *apostrophe*. [Ref 2]
- ASCII 0x27 is named APOSTROPHE; Kuhn notes it is a neutral typewriter-style glyph that doubles as
  a quotation mark, and that the *preferred* apostrophe character is U+2019 (the curly one). The key
  produces 0x27. [Ref 5]

### 2. Origin — disputed, so hedge

- The mark **entered English in the 1500s**, first as a mark of omission. The first OED citation for
  the **word** meaning the punctuation mark is *Love's Labour's Lost* (1588): *"You finde not the
  apostraphas, and so misse the accent."* — **a first citation of the word, not the mark's birth
  date** (the same trap as 1494/1496 for the semicolon). The rhetorical-figure sense is cited from
  Thomas More (1533). [Ref 1]
- Geoffroy Tory, French printer, is **often credited** with using it in French in **1529** (*Champ
  fleury*); *Quick and Dirty Tips*: "some attribute it to the French or the Italians instead," and
  it reached English about thirty years later (late 1550s). Oikofuge: Tory first used "a raised
  comma as an apostrophe in French," after which it spread into English typesetting (no date
  given). A search-result summary lists a 1509 Italian Petrarch as a rival first. [Refs 2, 3]
- Verbs: **"often credited to," "came into English from French printing in the 1500s."** Never
  "Tory invented the apostrophe."

### 3. Its job in English

- Dictionary.com: *"It's is a contraction of the words it is or it has"*; *"Its is a possessive form
  of the pronoun it, meaning belonging to it"* — and English does not use apostrophes for
  possessive personal pronouns. [Ref 4]
- Possessive history: in Shakespeare's First Folio (1623) only about **4%** of words that would
  take a possessive apostrophe now had one (two fetched sources agree); used "sporadically" by the
  1600s and codified in the 19th century. The popular story that `'s` marks a dropped *e* from Old
  English *-es* is presented by historians as **a theory**; a competing story (misheard "his")
  exists — **do not print either as fact.** [Refs 2, 3, 1]
- Kid-safe line: **"It shows missing letters, like don't."**

### 4. In code — a pair wraps text

- MDN: template literals are *"enclosed by backtick characters instead of double or single
  quotes"* — i.e., ordinary JavaScript strings use single or double quotes. CPython's tutorial
  (mirror, search result): strings may be written in *"single quotes ('...') or double quotes
  ("...") with the same result."* [Ref 6]
- **Safe wording:** "Many coders put text between a pair of them." **Not safe:** "in code it
  means a quotation" (the glyph is a quote delimiter, not a quotation).

## Corrections from citation pass (2026-11-04)

- **"Apostrophe 1588"** → first OED citation of the *word* for the mark, not its introduction.
- **"The apostrophe came from Tory in 1529"** → credited, disputed; hedged above.
- **Pre-empted myth:** *its/it's* — the apostrophe in *it's* is only ever a contraction.

## Unsourceable / weakly-sourced items

- Purdue OWL apostrophe page: archived copy returned an empty body — **unusable**, dropped.
  Merriam-Webster's apostrophe-history page and Britannica's Tory entry returned 403 — dropped.
- Italian 1509 Petrarch claim: search-result summary only.
- Exact English first use of the mark: unknown; "1500s" only.

## References

1. [Grammarphobia — Apostrophe](https://grammarphobia.com/blog/2010/09/apostrophe.html) — entered English in the 1500s; OED 1533/1588 citations; possessive theory. **[fetched]**
2. [Oikofuge — Apostrophe, Part 1](https://oikofuge.com/apostrophe-part-1/) — Greek *apostrophos*, Tory, elision, possessive by the 17th century. **[fetched]**
3. [Quick and Dirty Tips — The History of the Apostrophe](https://quickanddirtytips.com/?p=57543) — Tory 1529 credit and rivals, English late 1550s, First Folio 4%. **[fetched]**
4. [Dictionary.com — its vs. it's](https://www.dictionary.com/articles/its-vs-its) — contraction vs possessive. **[fetched]**
5. [Markus Kuhn — ASCII and Unicode quotation marks](https://www.cl.cam.ac.uk/~mgk25/ucs/quotes.html) — 0x27 APOSTROPHE; U+2019 preferred. **[fetched]**
6. [MDN — Template literals](https://developer.mozilla.org/en-US/docs/JavaScript_templates) — backticks "instead of double or single quotes." **[fetched]**; CPython tutorial mirror (Doc/tutorial/introduction.rst) for single/double quotes: *(search result only, not fetched)*
