---
title: The Comma (the mark, its name, and its job in code)
type: entity
tags: [punctuation, programming-language, etymology, keyboard-card, level-13, player-facing-claim]
level: 13
sources: 6
verified: 2026-11-04
---

The comma is the mark `,` on the key right of M (right middle finger, Level 13). Its **name** comes
from Greek *kómma*, "a piece cut off" (from *kóptō*, "I cut"): first a short chunk of a sentence,
then the mark that sets such chunks apart. In English writing its plainest job is **separating
items in a list** (three or more) and **joining two sentences with a small word like "and" or
"but."** The mark's ancestor is the medieval slanted stroke *virgula* ("twig"); the modern comma
shape is **credited to** Aldus Manutius's press in Venice, by lowering that stroke (credited, not
proven — see Corrections). In code, **many** languages and data files use it to **separate items**
(CSV files, list literals). Sibling card: [[semicolon]] (same level, the card the beat teaches
first); the slash shares this page's ancestor — see [[slash]].

## In this game

- Key arrives **Level 13** (`levels.js` `newKeys: ['c', ',']`); the word *comma* needs `c`, so the
  name is spellable at **L13** — card level 13, **the same level as `;`**, so it waits one play
  (spec §5.9).
- **The name is not withheld today:** `js/ui/hud.js` `SMALL_GLYPH_CAPTION[',']` already prints
  `COMMA` under the prompt, and Free Play has *"A comma is a breath."* (`js/freeplay.js:140`),
  echoing `levels/act3.md` ("A comma is a breath"). So the beat teaches **role + origin**, not a
  hidden word.
- "A comma is a breath" is a fair *historical* shorthand (the ancient dots were aids to reading
  aloud) but **not** a reliable modern rule — see Facts §3.

## The facts

### 1. The name — "a piece cut off"

- *Comma* is Latin, borrowed from Ancient Greek *kómma*, from *kóptō*, "to cut." Wiktionary's
  typographic definition: the mark used to separate parts of a sentence or items in a list. [Ref 2]
- In Aristophanes of Byzantium's dot system (adopted by Greek scribes **after 200 BC**), the *komma*
  was the smallest unit — marked by a **low dot on the baseline**; a *kōlon* (clause) took a
  mid-height dot; a *periodos* (full sentence) a high dot. So the **word** "comma" first named a
  *piece of text*, and later the *mark*. [Ref 1]
- Safe kid-line: "Comma comes from a Greek word meaning *a piece cut off*." [Refs 1, 2]

### 2. The mark's shape — credited, not invented

- The mark descends from the **virgula suspensiva**, a slash (or slash with a midpoint dot) added in
  the **late Middle Ages** (a 13th–17th-century pause mark, per search-result summaries). Wiktionary
  records an early English description of printers' "short oblique stroke, called a virgil" (1828
  text describing earlier practice). [Refs 1, 2]
- Wikipedia's *Punctuation* article says Aldus Manutius and his grandson are credited with several
  changes, including **"creating the modern comma by lowering the virgule"**; a 19th-century
  typography manual puts the change in the **late 15th century**. No finer date than "late 1400s /
  around 1500" is supportable here, and the Aldus attribution rests on one fetched page plus a
  19th-century manual it quotes (for the semicolon's Aldus dates, see [[semicolon]]). Verb to use:
  **"credited with"**, never "invented." [Ref 1]

### 3. Its job in English

- Purdue OWL: *"Use commas to separate three or more words, phrases, or clauses written in a
  series."* and *"Use commas to separate independent clauses when they are joined by any of these
  seven coordinating conjunctions"* (and, but, for, or, nor, so, yet). [Ref 3]
- **The pause myth.** "Put a comma where you pause" is a common classroom shorthand; a university
  handout (UNLV, search-result snippet only) says students are told this but *"this is not a
  reliable rule."* The game's "a breath" line should be framed as old reading-aloud history, not
  as the rule for placing commas. *(search result only, not fetched)*

### 4. In code — a separator, in many places

- **CSV:** RFC 4180 (October 2005, an *Informational* RFC, not a standard) says records have fields
  *"separated by commas."* The RFC itself notes implementations vary. [Ref 4]
- **Lists:** Python list literals are written inside square brackets with items separated by
  commas (tutorial search-result summaries; Google's Python class page, fetched, confirms the
  square-bracket literal). [Refs 5, 6]
- **Limits to state if challenged:** the comma is also an *operator* in C and a mere decoration in
  some languages; locales that use the comma as the decimal mark often use `;` as the CSV separator
  (search-result summary of the CSV Wikipedia page). None falsifies "many."
- **Safe wording:** "Many coders separate items with a comma." **Not safe:** "every list," "all
  languages."

## Corrections from citation pass (2026-11-04)

- No existing comma claim was wrong. Two **traps pre-empted:** (a) "the comma was invented by Aldus
  in 1494" — the date is the unattested semicolon-adjacent figure; use "credited, late 1400s"; (b)
  "a comma is a pause" taught as the *rule* — historical shorthand only.
- The popular-blog claim that Isidore of Seville rearranged dots into comma/colon/period (search
  results) was **not** verified — do not print it.

## Unsourceable / weakly-sourced items

- Exact year/place of the first comma-shaped mark: only the Wikipedia/MacKellar "late 15th
  century" chain; blogs give "1490s." Unconfirmed → card `year` should be `UNKNOWN`.
- Etymonline's comma entry returned 403 (not read). Britannica not consulted.

## References

1. [Wikipedia — Punctuation](https://en.wikipedia.org/wiki/Punctuation) — Aristophanes' dot system (komma = low dot), virgula suspensiva, Aldus lowering the virgule, late-15th-century dating. **[fetched]**
2. [Wiktionary — comma](https://en.wiktionary.org/wiki/comma) — Greek *kómma* from *kóptō* "to cut"; typographic definition; 1828 "virgil" citation. **[fetched]**
3. [Purdue OWL — Extended rules for commas](https://owl.purdue.edu/owl/general_writing/punctuation/commas/extended_rules_for_commas.html) — lists/series; independent clauses with a conjunction. **[fetched]**
4. [RFC 4180 — CSV](https://www.rfc-editor.org/rfc/rfc4180) — fields separated by commas; Informational, October 2005. **[fetched]**
5. [Google for Education — Python Lists](https://developers.google.com/edu/python/lists?csw=1) — list literals in square brackets. **[fetched]**
6. [UNLV — Commas handout](https://www.unlv.edu/sites/default/files/media/document/2026-03/Commas.pdf) — pause-as-rule is unreliable. *(search result only, not fetched)*
