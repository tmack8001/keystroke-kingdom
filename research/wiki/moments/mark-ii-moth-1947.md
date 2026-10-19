---
title: The Mark II Moth (1947)
type: moment
tags: [computing-history, moment, history-card, easter-egg, proposed-content]
level: 13
sources: 9
verified: 2026-09-18
---

On the afternoon of September 9, 1947, operators at Harvard's Computation Laboratory
traced a fault in the **Harvard Mark II** — an electromechanical machine built out of
high-speed electromagnetic relays — to a **moth caught between a relay's contacts**.
They removed it, taped it into the operations logbook, and captioned it *"First actual
case of bug being found."* The page, moth still attached, is in the collection of the
Smithsonian's National Museum of American History. **It is not the origin of the word
"bug"** — Thomas Edison was using the word for technical faults in 1878, and by 1934
Webster's was defining it — and **it is not a software bug**: the Mark II ran on
relays, and the moth was a physical obstruction in one of them. The joke in the caption
only lands *because* everyone already said "bug."

## In this game

**Two cards, two different stories about one object.** This page now serves both.

- **BUILT — Level 13, `grace` ("GRACE HOPPER").** That card is about the **person and
  the popularising**: Hopper did not find the moth and the logbook "was probably not
  Hopper's," but she told the story for forty-five years until it became hers. Its facts
  live on [[grace-hopper]].
- **PROPOSED — Level 11, `moth`.** Trevor's request (2026-09-17): a card at the level
  where the letters unlock. `moth` needs **M**, which arrives at Level 11 (V, M); O, T
  and H are already in hand at Levels 9, 8 and 5 — so Level 11 is the earliest level
  that can spell it, which is where INV-56 attaches it. **Its subject is deliberately
  NOT Hopper.** It is the **artifact and the day**: a real insect, a real machine full
  of clicking switches, a real notebook page you can still go and look at. Same object
  as the L13 card, different lesson — exactly the split between the arcade's
  [[floppy-disk]] (the 1971 *medium*) and the wing's [[disk-ii-drive]] (the 1978
  *drive*). **Card-ready facts are below; the game copy is Trevor's to write.**

The moment is also the source of two built easter eggs: the Level 20 terminal whisper
`> MOTH: 1947`, and the **select-screen moth** — a pixel moth that settles on a lit
cabinet after ~12 seconds of stillness and, when clicked, quotes the logbook caption and
nothing more (`js/ui/cabinet-art.js`; `.claude/rules/easter-eggs.md`). That egg was
built to this page's discipline: it credits no one, and claims no coinage.

Related: [[grace-hopper]], [[hacker-culture]], [[proposed-egg-references]],
[[rubber-duck-debugging]].

## The facts

- **The date and the machine.** September 9, 1947, Harvard Mark II, Cambridge,
  Massachusetts. The Computer History Museum's *This Day in History* entry describes
  *"a moth caught between the relay contacts of the Harvard Mark II computer"*; the team
  *"taped the dead moth into the logbook for the computer"* with a note reading
  *"First actual case of bug being found."* Wikipedia's *Harvard Mark II* article gives
  the same date and the same caption (*"first actual case of [a] bug being found"*) and
  says the insect was *"extracted from the machine's electronics and taped to the log
  book."*
- **⚠️ It was NOT a software bug — the Mark II had no software in the modern sense.**
  Wikipedia's *Harvard Mark II* article: it was an *"electromechanical computer"* that
  *"was constructed with high-speed electromagnetic relays instead of the
  electro-mechanical counters used in the Mark I,"* built under **Howard Aiken** at
  Harvard, completed in 1947 and delivered to the US Navy Proving Ground at Dahlgren,
  Virginia in March 1948. JSTOR Daily is explicit about the nature of the fault: the
  moth *"had squeezed into one of the machine's components,"* making it *"a mechanical
  obstruction rather than a software bug."* **A relay is a switch; the moth stopped a
  switch closing. Calling it "the first software bug" is wrong twice — wrong about
  "first" and wrong about "software."**
- **⚠️ It did NOT coin the word "bug," and this is the page's central caution.**
  The Computer History Museum states the term *"originated with Thomas Edison in the
  1800s"* and *"is still used widely to describe a mistake or failure in a technical
  system."* IEEE Spectrum says Edison *"coined the phrase 140 years ago to describe
  technical problems during the process of innovation,"* and that *"Hopper's bug was not
  a new term."* JSTOR Daily adds the paper trail: an 1878 Edison letter, an 1889 *Pall
  Mall Gazette* article, and **by 1934 Webster's New International Dictionary already
  defined "bug" as "a defect in an apparatus or its operation."**
- **Edison's own words, dated.** The Edison Papers' "Edison and the Bug" page collects
  them: a summer 1876 notebook (*"These shew where the mysterious bug was…"*);
  13 March 1878 to William Orton (*"You were partly correct, I did find a 'bug' in my
  apparatus, but it was not in the telephone proper…"*); 19 May 1878 to William Preece
  (*"If the static charge is the bug I will go for a compensation"*); and 13 November
  1878, the definitional one: ***"'Bugs' — as such little faults and difficulties are
  called — show themselves…"*** Wikipedia's *Software bug* etymology quotes the same
  1878 sentence.
- **What the caption actually claims.** Read plainly, *"First actual case of bug being
  found"* is a pun: the first time the long-standing jargon word turned out to describe
  a literal animal. Wikipedia's *Software bug* article puts it the same way — the
  operators were *"making a pun by conflating the two meanings."* **This is the honest
  angle for a card: the first actual bug, not the first use of the word.**
- **Where the artifact is now.** The logbook page, moth and tape intact, is held by the
  **Smithsonian's National Museum of American History**, catalogued as object
  **NMAH 334663**. (The museum's own object page returned HTTP 403 every time it was
  fetched this session — see References #9 — so this is carried by Wikipedia's *Software
  bug* article plus the record's own text as quoted by JSTOR Daily. It is not on
  permanent display; it rotates through computing-history exhibitions.)
- **Whose logbook, and who found it.** The Smithsonian's object record states the
  logbook *"was probably not Hopper's"* (quoted verbatim by JSTOR Daily, which fetched
  cleanly). JSTOR Daily attributes the find to *"a team of engineers"* without naming
  an individual. Wikipedia's *Software bug* article names **William "Bill" Burke** among
  the operators who discovered and logged it — **singly sourced here; do not put a name
  on a card.**
- **Hopper's own retelling, in her words.** Quoted by EDN: *"…we were working on it at
  night, of course, and all the bugs in the world came in. And one night she (Mark II)
  conked out and we went to look for the bug and found an actual large moth, about four
  inches in wing span, in one of the relays beaten to death, and we took it out and put
  it in the log book and pasted Scotch tape over it."* Note the **"we"** — this is
  precisely why the story attached itself to her, and it does not contradict her
  separate, repeated statement that she personally did not find or log it. Note also the
  **"at night"**, which sits oddly against the logbook's own afternoon timestamp (see
  Unsourceable below).
- **The Level 13 card's correction still stands** — the line "She taped it into the
  logbook" is unsupported; replacement copy is on [[grace-hopper]].

## Card-ready facts

*For the PROPOSED Level 11 `moth` card. Each is a complete child-facing sentence; the
bank's measured norm is 105–211 characters, median 163. None of them mentions Grace
Hopper, so the L13 card keeps its own story.*

1. *"In 1947 a computer stopped working, and the people fixing it found a real moth
   stuck inside. They taped it into their notebook — and that page is still in a museum
   today."* (170 chars) — supports: Computer History Museum *This Day in History*
   **[fetched]** (*"a moth caught between the relay contacts… taped the dead moth into
   the logbook"*) + Wikipedia *Harvard Mark II* **[fetched]** (*"extracted from the
   machine's electronics and taped to the log book"*) + Wikipedia *Software bug*
   **[fetched]** (the logbook *"is housed at the Smithsonian Institution's National
   Museum of American History"*). ⚠️ The museum clause is the weakest link — the
   Smithsonian's own object page 403'd this session. If Trevor wants every clause
   institution-backed, use variant **1b** below.

   **1b (no museum clause):** *"In 1947 a computer stopped working, and the people
   fixing it found a real moth stuck inside one of its switches. They taped it into
   their notebook to remember it."* (163 chars) — supports: the same two **[fetched]**
   sources, both of which state the taping directly.

2. *"People had been calling machine problems 'bugs' for almost seventy years already.
   So when a real one turned up, they wrote: 'First actual case of bug being found.'"*
   (163 chars) — supports: Computer History Museum **[fetched]** (the term
   *"originated with Thomas Edison in the 1800s"*, and the caption verbatim) + IEEE
   Spectrum **[fetched]** (*"Hopper's bug was not a new term"*; Edison coined it) +
   JSTOR Daily **[fetched]** (1878 Edison letter; Webster's 1934 definition). **This is
   the sentence that keeps the card honest** — the caption is a joke about a word that
   already existed, and the card says so.

3. *"That computer was full of little switches called relays that clicked open and
   shut. The moth got wedged in one, so the switch could not close. The bug was a real
   bug."* (166 chars) — supports: Wikipedia *Harvard Mark II* **[fetched]**
   (*"electromechanical computer… constructed with high-speed electromagnetic relays"*)
   + Computer History Museum **[fetched]** (*"caught between the relay contacts"*) +
   JSTOR Daily **[fetched]** (*"a mechanical obstruction rather than a software bug"*).

4. *"September 9, 1947. A team at Harvard spent the day hunting for what was wrong with
   their computer. The answer was a moth — and somebody thought to keep it."*
   (152 chars) — supports: Computer History Museum **[fetched]** (date, team, machine) +
   JSTOR Daily **[fetched]** (*"a team of engineers"*, September 9 1947) + Wikipedia
   *Harvard Mark II* **[fetched]** (date and taping). A quieter alternative to #1 for a
   card slot that wants the *day* rather than the *artifact*.

**Not card-able, and why:** "the first software bug" (false — see The facts);
"the first computer bug" unqualified (false — the word predates it by ~70 years);
any named finder (singly sourced); "Panel F, Relay #70" (see Unsourceable); the moth's
four-inch wingspan (Hopper's memory only, and the logbook does not record a size).

## References

1. [September 9: First Instance of Actual Computer Bug Being Found — Computer History Museum, This Day in History](https://www.computerhistory.org/tdih/september/9/) —
   institutional. The date, the Harvard Mark II, the moth *"caught between the relay
   contacts"*, the team taping it in, the caption verbatim, Hopper *"present and made the
   incident famous later on in her many public lectures"*, and the key negative: the term
   *"predates 1947"* and *"originated with Thomas Edison in the 1800s."* **[fetched]**
2. [The Bug in the Computer Bug Story — JSTOR Daily](https://daily.jstor.org/the-bug-in-the-computer-bug-story/) —
   the date and machine; quotes the Smithsonian object record's *"was probably not
   Hopper's"*; the 1878 Edison letter, the 1889 *Pall Mall Gazette*, and Webster's 1934
   definition; and the explicit statement that this was *"a mechanical obstruction rather
   than a software bug."* **[fetched]**
3. [Harvard Mark II — Wikipedia](https://en.wikipedia.org/wiki/Harvard_Mark_II) —
   the machine: *"electromechanical computer"* built from *"high-speed electromagnetic
   relays"*, Aiken, completed 1947, delivered to Dahlgren March 1948; the September 9
   1947 log entry and the taping. One of several, never alone. **[fetched]**
4. [Software bug — Wikipedia](https://en.wikipedia.org/wiki/Software_bug) —
   etymology section: Edison's 1878 sentence verbatim; the operators *"making a pun by
   conflating the two meanings"*; the logbook housed at the Smithsonian's National Museum
   of American History; names William "Bill" Burke (**singly sourced — not used on a
   card**). One of several, never alone. **[fetched]**
5. [Did You Know? Edison Coined the Term "Bug" — IEEE Spectrum](https://spectrum.ieee.org/did-you-know-edison-coined-the-term-bug) —
   IEEE. Edison *"coined the phrase 140 years ago"*; the March and November 1878 letters;
   and, directly on point, *"Hopper's bug was not a new term."* **[fetched]**
6. [Edison Invents the Technical 'Bug' — Edison Papers (Juncture Digital)](https://www.juncture-digital.org/edisonpapers/edison-and-the-bug) —
   the dated corpus of Edison's own uses: summer 1876 notebook, 13 March 1878 (Orton),
   19 May 1878 (Preece), 13 November 1878 (the definitional one). ⚠️ The page is served
   on the Juncture publishing platform and **does not name its publishing institution in
   the fetched body**; treat it as a strong corroborating source for the Edison quotes,
   which IEEE Spectrum and JSTOR Daily independently carry, rather than as a standalone
   authority. **[fetched]**
7. [1st actual computer bug found, September 9, 1947 — EDN](https://www.edn.com/1st-actual-computer-bug-found-september-9-1947/) —
   trade press; carries Hopper's own first-person retelling verbatim (the "four inches in
   wing span" / "we took it out and put it in the log book" passage) and notes that
   engineers including Edison used "bug" before 1947. **[fetched]**
8. [1947 — Timeline of Computer History, Computer History Museum](https://www.computerhistory.org/timeline/1947/) —
   ⚠️ **Cited as a CONTRADICTION, not as support.** This CHM page says *"Grace Hopper
   records what she jokingly called the first actual computer bug"* — attributing the log
   entry to Hopper, which CHM's **own** *This Day in History* page (#1) and the
   Smithsonian both decline to do. Recorded so a future pass does not "find" this page and
   quietly upgrade the attribution. **[fetched]**
9. [Log Book With Computer Bug — Smithsonian National Museum of American History](https://americanhistory.si.edu/collections/object/nmah_334663) —
   the institutional holder of the artifact, object **NMAH 334663**, and the origin of the
   *"was probably not Hopper's"* line. ⚠️ **UNUSABLE THIS SESSION: HTTP 403 on fetch**,
   both at this URL and at the `si.edu/object/log-book-computer-bug:nmah_334663` mirror.
   Listed so a future pass knows the exact page; explicitly **not cited as if read** — its
   text reaches this page only as quoted by #2. *(not fetched — 403)*

## See also

[[grace-hopper]] — the person, the popularising, and the Level 13 card's correction.
[[rubber-duck-debugging]] — the other "how programmers actually find bugs" page, and the
other built easter egg that lives on the select screen.
[[floppy-disk]] / [[disk-ii-drive]] — the worked precedent for two cards about one object
told from two angles.
[[y2k-bug]] — the other "famous bug, calmly explained" card.

## Corrections from citation pass (2026-09-18)

- **"the first software bug" — REJECTED.** Trevor's framing in the 2026-09-17 request.
  The Harvard Mark II was an **electromechanical relay machine** (Wikipedia, **[fetched]**)
  and JSTOR Daily (**[fetched]**) calls the incident *"a mechanical obstruction rather
  than a software bug."* Neither word survives: not *first*, not *software*. The card
  should say what it was — an insect jamming a switch.
- **Summary paragraph rewritten.** The 2026-07 version called the moment *"the literal
  origin of the term 'computer bug' in the popular imagination"* — a hedge that still
  reads as an origin claim at a glance. It now leads with what the machine was and states
  the Edison/Webster's chronology up front.
- **CHM contradicts CHM.** The Computer History Museum's 1947 *timeline* page credits the
  log entry to Hopper (*"Grace Hopper records…"*) while its *This Day in History* page for
  the same event says only that she *"was present and made the incident famous."* Both
  fetched this session. Recorded as reference #8 so the weaker page cannot later be
  mistaken for new evidence. **The Smithsonian's own record remains the tiebreaker, and
  it says the logbook "was probably not Hopper's."**
- **`sources:` raised 4 → 9; `verified:` 2026-07-11 → 2026-09-18.** References 1, 2 and
  the Silicon Canals entry were carried over; #2 was re-fetched and re-verified verbatim,
  #1 was re-fetched, and the Silicon Canals citation was **dropped** in favour of
  institutional sources — its URL is a search-engine-generated slug that asserts Hopper
  *"pulled a moth out"* in the URL string itself, which is the claim this page exists to
  correct. Its useful line ("she told the story so well for 45 years that it became hers")
  is retained on [[grace-hopper]], where it is about her and not about the artifact.

## Unsourceable / weakly-sourced items

- **"Panel F, Relay #70" and the 15:45 timestamp.** These appear consistently in search
  summaries and are almost certainly right — they are transcriptions of the logbook page
  itself — but **every page carrying them 403'd or returned no body this session**
  (Atlas Obscura, Britannica's *Today in History*, missedhistory.com,
  historyofinformation.com). Not asserted here and **not card-able** until a fetchable
  source carries them.
- **The moth's size ("about four inches in wing span").** Comes from Hopper's own spoken
  recollection decades later (EDN, **[fetched]**), not from the log. A memory, not a
  measurement.
- **Time of day.** Hopper remembered working *"at night"*; the logbook is widely
  transcribed with an afternoon timestamp. The discrepancy is genuinely interesting and
  genuinely unresolved here, because the timestamp is unfetched (above). Left open.
- **The named finder.** William "Bill" Burke appears only in Wikipedia's *Software bug*
  article among sources fetched this session. Singly sourced.
- **Whether the page is currently on display.** Secondary sources say it rotates in and
  out of computing exhibitions; the Smithsonian's own page could not be fetched to
  confirm. A card should say *"is kept in a museum"*, never *"you can go and see it"*.
