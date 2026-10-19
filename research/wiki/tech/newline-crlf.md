---
title: The New Line (CR, LF, and \n)
type: concept
tags: [computing-history, ascii, typewriter, teleprinter, history-card, proposed-content]
level: 22
sources: 4
verified: 2026-09-15
---

On a mechanical typewriter, one push of the carriage-return lever did **two** things at
once: it threw the carriage back to the left margin *and* rolled the paper up a line.
Machines that printed by telegraph split those two motions into two separate characters
— **CR** (carriage return, come back) and **LF** (line feed, go down) — and computers
inherited the split. This is why text files still argue about line endings today: Unix
and Multics chose **LF alone**, while CP/M and then MS-DOS kept **CR+LF**. In most
programming languages that single line-ending character is written **`\n`** — a
backslash and an `n`, for "new line."

## In this game

**Not yet built. Proposed as Level 22's SECOND history card.** L22 currently holds
exactly one — `\o/`, ASCII — so its pool cannot rotate.

**Moment word: `\n`.** Character-by-character against Level 22's cumulative alphabet
(all letters, `; , . /`, all digits, `-` `=`, and `[` `]` `\`): `\` ✓ (**Level 22,
new**), `n` ✓ (Level 12). The backslash is the gate, so it attaches exactly at Level 22
(INV-56). Not among the spent card words, and it sits naturally beside the level's
documented backslash drills — *"a\b, fun\run, up\down"* and `\o/` itself
(`.claude/rules/levels/act5.md`).

**It is the most on-theme card in the bank for a typing game.** Every other card teaches
computing history; this one explains a thing the child's own hands are doing, and traces
it back to a typewriter lever. Related: [[ascii]], [[qwerty-keyboard]],
[[home-row-bumps]].

## The facts

- **The typewriter did it in one motion.** Wikipedia's *Carriage return*: the lever
  *"would also usually **feed** the paper to advance to the next line"* as well as
  returning the carriage — one push, both results.
- **The split is older than ASCII, and older than the Teletype 33.** Wikipedia's
  *Carriage return*: *"As early as 1901, Baudot code contained separate carriage return
  and line feed characters."* ⚠️ **This is the precision guard on this page.** The
  famous Teletype Model 33 story explains why CR+LF *persisted into computing*; it does
  **not** explain where the two characters came from. Do not write "the Teletype invented
  the newline."
- **Why keep them separate?** Two documented reasons. (a) **Usefulness:** Wikipedia's
  *Newline* — *"A CR by itself was useful to overprint the current line to make
  double-struck bold or underscores. A LF going straight down was mechanically simpler."*
  (b) **Timing:** *"the print head could not return from the far right to the beginning
  of the next line in time to print the next character,"* so *"the solution was to make
  the newline two characters: CR to move the carriage to column one, and LF to move the
  paper up."* Sending two characters cost no extra time, because the machine was slower
  than the wire.
- **The machine everyone means.** The **Teletype Model 33** — the Computer History
  Museum holds one (catalogue 102752152, *circa 1963*), describing *"a data terminal
  with a QWERTY keyboard and integrated printing and paper tape capabilities,"* with a
  paper-tape reader and punch on the left. This is the object the whole CR+LF convention
  is attached to: an electromechanical printer that *was* the screen and keyboard of an
  early computer. ⚠️ The Model 33's **1963 introduction date and its early ASCII support**
  came from a search summary, not from the fetched CHM record, which gives only *"circa
  1963"*. Do not put "May 1963" on a card.
- **Then everyone chose differently.** Wikipedia's *Newline*: **Unix and Multics adopted
  LF alone** — Multics *"used a device driver to translate this character to whatever
  sequence a printer needed"* — while *"MS-DOS (1981) adopted CP/M's CR+LF in order to be
  compatible."* That decision is why a file written on one kind of machine can still
  arrive on another with its lines wrong.
- **The standards were undecided at the time.** *"During the period of 1963 to 1968, the
  ISO draft standards supported the use of either carriage return plus line feed (CR+LF)
  or LF alone as a newline, while the ASA drafts supported only CR+LF."* The ambiguity is
  not a later mess — it was in the drafts from the start.
- **⚠️ `\n` itself is not sourced on this page.** That the escape sequence `\n` denotes a
  newline in C and its descendants is domain-canonical and uncontroversial, but **no page
  fetched this session states it**. The card below is written so its *claims* rest on the
  fetched sources and `\n` appears only as the thing being named. A future pass should
  cite the C standard or Kernighan & Ritchie directly.

## Card-ready facts

1. *"On a typewriter, one push of the lever sent the paper back to the left AND down one
   line. Computers split that into two moves: come back, then go down."* (152 chars)
   — supports: Wikipedia *Carriage return* **[fetched]** (the lever *"would also usually
   feed the paper to advance to the next line"*) + Wikipedia *Newline* **[fetched]**
   (*"CR to move the carriage to column one, and LF to move the paper up"*).
2. *"Old printing machines were slow. The carriage could not get back across the page in
   time, so computers sent two characters instead of one — and we never stopped."*
   (163 chars) — supports: Wikipedia *Newline* **[fetched]** (*"the print head could not
   return from the far right to the beginning of the next line in time to print the next
   character"*) + Computer History Museum, Teletype ASR 33 **[fetched]** (the physical
   printing terminal this describes).
3. *"Computers still disagree about how to end a line. One family says go down. The other
   says come back AND go down. Both have been right since 1963."* (146 chars)
   — supports: Wikipedia *Newline* **[fetched]** (Unix and Multics chose LF alone; MS-DOS
   kept CP/M's CR+LF; the 1963–68 drafts allowed either) + [[ascii]] (ASA X3.4-1963, the
   standard that assigned both characters their numbers).

## References

1. [Newline — Wikipedia](https://en.wikipedia.org/wiki/Newline) —
   one of several, never alone. The two-character solution and its mechanical reason; CR
   useful alone for overprinting; LF *"mechanically simpler"*; Unix/Multics LF vs
   MS-DOS/CP/M CR+LF; the 1963–68 ISO/ASA draft divergence. **[fetched]**
2. [Carriage return — Wikipedia](https://en.wikipedia.org/wiki/Carriage_return) —
   one of several. The typewriter lever doing **both** motions in one action, and the
   crucial precision point that **Baudot code already had separate CR and LF characters
   as early as 1901** — which stops this page from crediting the Teletype 33 with the
   split. **[fetched]**
3. [Teletype ASR 33 Terminal — Computer History Museum, catalogue 102752152](https://www.computerhistory.org/collections/catalog/102752152) —
   INSTITUTIONAL object record. *Circa 1963*, Teletype Corp.; *"a data terminal with a
   QWERTY keyboard and integrated printing and paper tape capabilities"*; the paper-tape
   reader and punch and their labelled controls. The physical object the convention hangs
   on. **[fetched]**
4. [Teletype Model 33 — Wikipedia](https://en.wikipedia.org/wiki/Teletype_Model_33) —
   surfaced in search as the source of the *"introduced May 1963"* date and the claim
   that the Model 33 was among the first devices to support 7-bit ASCII. **Not fetched**;
   those two specifics are therefore **not asserted** above. *(search result only, not
   fetched)*

## See also

[[ascii]] — Level 22's existing card (`\o/`); the standard that gave CR and LF their
numbers, and the card this one is proposed to rotate against. The two are the same key
(`\`) telling two halves of one story.
[[qwerty-keyboard]] — the other place this game traces a computer habit back to a
typewriter.
[[home-row-bumps]] — Level 1's proposed card; the same instinct (explain the thing under
the child's fingers) at the other end of the curriculum.
[[ansi-escape-codes]] — what terminals later layered on top of these control characters.

## Unsourceable / weakly-sourced items

- **`\n` as the C-family escape sequence for newline.** Domain-canonical, unsourced here.
  Cite the C standard or K&R before a card *defines* `\n` rather than merely using it.
- **"0.2 seconds — the time to print two characters."** A specific and appealing figure
  that appeared in a **search summary** only; the fetched *Newline* article gives the
  qualitative reason without the number. **Do not card the number.**
- **Teletype Model 33 introduced May 1963 / first ASCII device.** Search summary only.
- **Whether the typewriter lever is the *ancestor* of CR+LF or merely a parallel.** The
  fetched *Newline* article notes that telegraphy and typewriters *"generally considered
  starting a new line a single action"* — i.e. the split was a **departure from** the
  typewriter, not an inheritance of it. The card above is worded to say exactly that
  (typewriter did one thing, computers split it) and must not be loosened into
  "computers inherited two keys from typewriters," which would be backwards.
