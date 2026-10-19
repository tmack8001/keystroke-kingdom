---
title: The Bumps on F and J
type: entity
tags: [typing-pedagogy, hardware, keyboard, history-card, proposed-content]
level: 1
sources: 7
verified: 2026-09-14
---

Almost every keyboard made in the last forty years carries two tiny raised marks, one on
**F** and one on **J** — the "home row tactile indicators" or "homing bumps." What they
are *for* is uncontroversial and well documented: they let the two index fingers find home
position by touch, so the other eight fingers line up without anyone looking down.
**Who put them there first, and when, is genuinely murky** — and this page says so rather
than filling the silence. The most-repeated origin story on the internet (*"patented in
2002 by June E. Botich"*) is checkably wrong about what that patent claims, and the
second-most-repeated (*"ISO 9995 standardises them"*) could not be verified from anything
fetchable this session.

## In this game

**Not yet built — and it closes a measured gap.** `docs/specs/act-exclusive-cards.md`
§0.2 and §4.2 name it precisely: **Levels 1–3 have no history cards at all**, because a
card is found by typing its word and `J F D K S L` contains no vowel, so nothing is
spellable. A five-year-old replays those three cabinets more than anything else in the
game and the collect-them-all loop does not exist for her there. The spec's own proposed
fix is this card:

> *"A card attached to the token `jf`, about the two raised bumps under her index fingers,
> asks her to type exactly what Level 1 already asks her to type."*

**Moment word: `jf`.** Level 1's documented content is literally *"j, f, jf, fj"*
(`.claude/rules/levels/act1.md`), so the word is drawn from the drill the level already
runs. Precedent for non-word card tokens exists in the bank: `\o/`, `386`, `56k`, `1969`,
`asdf`. `jf` does not collide with `asdf` or with any of the 60 spent card words
(`docs/specs/hardware-wing.md` §5.4.6). **This is a LEVEL card on the existing axis
(`level: 1`), not an act card** — it is governed by INV-56, and `jf` is typeable at
Level 1, the earliest level, which is exactly where it attaches.

It also lands on the one hint this game shows unprompted: `showHomeRowDiagram()` in
`js/ui/hud.js` draws two hands on the home row **with F and J lit** at the very first
prompt (`.claude/rules/levels/onboarding.md`). The card is the story of the two keys that
diagram is pointing at. Related: [[touch-typing-pedagogy]], [[qwerty-keyboard]],
[[the-eighth-key]], [[apple-iie]].

## The facts

- **What they are for.** Wikipedia's *Touch typing* article: *"Most modern computer
  keyboards have a raised dot or bar on the home keys for the index fingers to help touch
  typists maintain and rediscover the correct positioning of the fingers on the keyboard
  keys."* And: *"The keys F and J frequently contain some surface features that allow the
  typist to recognize them by touch alone."* Note the hedging in the source's own wording
  — *"most"*, *"frequently"* — and keep it.
- **The home row they anchor.** Same article: *"The 'home row' is the center row of keys
  on a typewriter or computer keyboard"*; on QWERTY the home keys are **ASDF** and
  **JKL;** — the eight keys this game spends all of Act 1 teaching.
- **Their proper name.** Ratatype's typing-education article: *"The official name for
  these bumps is tactile home position indicators"*, and *"They mark the F and J keys as
  'home' points for the index fingers of the left and right hands respectively."* BGR
  gives the other common trade term: *"Tactile bumps (also known as 'homing bars/bumps')
  on the 'F' and 'J' keys help you quickly navigate your keyboard when touch-typing."*
- **The form varies.** The same sources describe them variously as a raised **dot**, a
  raised **bar**, or a **ridge**; keyboard-enthusiast practice also includes a deepened
  or "scooped" keycap as a homing treatment instead of a bump. **The bump is a convention
  with several physical implementations, not one specified shape** — at least, not one
  this research could pin to a specified shape.
- **⚠️ The origin is not established, and the popular answer is wrong.** The most widely
  repeated claim is that the bumps were invented/patented by **June E. Botich** in 2002.
  The patent exists and was read this session — **US 6,667,697 B2, "Modified keys on a
  keyboard," filed 23 April 2002, granted 23 December 2003** — and it is **not a patent
  on the F/J bumps**:
  - Its *own* background section describes pre-existing commercial tactile home-row aids
    as prior art: *"'Quickeys' by CE Software Inc. present Home-row Indicators that are
    small adhesive-backed labels… A raised bump in the center of the indicators serves as
    a tactile guide for placing the fingers."* Raised home-row bumps therefore **predate
    the patent**, by the patent's own account.
  - What it actually claims is a *different, larger* idea: raised tactile **edges** on the
    outer home keys — *"the left edge of key A and the right edge of key F… and the left
    edge of key J and the right edge of the ';'"* — forming a cradle around all four
    fingers of each hand. That design is not what shipped on keyboards.
  - Popular articles also routinely date it **"April 2002"**, which is the **filing**
    date; the grant is **December 2003**. Created-vs-shipped, in miniature.
- **⚠️ The standards claim could not be verified.** Many secondary sources assert that
  **ISO/IEC 9995** specifies tactile identifiers on the home keys. This session could not
  confirm it: `iso.org` returned HTTP 403 on fetch, the free preview host returned no
  body, and **Wikipedia's own ISO/IEC 9995 article — read in full — does not mention
  tactile marks, homing keys, the home row, or the F and J keys anywhere.** Treat
  "ISO 9995 standardises the bumps" as **unverified**, not as background knowledge.
- **⚠️ Two independent articles specifically about this topic contain no history at all.**
  Ratatype's piece *"does not attribute the bumps' invention to any specific person or
  date"* and its reference list (hagley.org, britannica.com, wikipedia.org, hackaday.com)
  is not tied to the origin claim. BGR's piece provides **no** information on who invented
  them, when, any patent, or any standard, and **cites no sources at all** for its factual
  claims. *That two dedicated articles cannot source the origin is itself the finding.*
- **Community accounts exist and disagree.** Keyboard-enthusiast forum discussion
  (Deskthority) variously claims the earliest F/J homing bumps appeared on a **Commodore
  128 (1985)**, that **IBM PC keyboards had none**, that F/J homing was already *"common
  in the 1970s"*, and that **Apple used D and K** rather than F and J. These are
  contradictory, unevidenced forum posts, and **the site returned HTTP 403 when fetched**
  — they are recorded here only as evidence that the question is genuinely open, and **not
  one of them may be written onto a card.**

## Card-ready facts

1. *"Feel the top of the F key and the J key. There is a tiny bump on each one. That is
   how your two pointer fingers find their way home without ever looking down."*
   (157 chars) — supports: Wikipedia *Touch typing* **[fetched]** (*"a raised dot or bar
   on the home keys for the index fingers to help touch typists maintain and rediscover
   the correct positioning"*) + Ratatype **[fetched]** (*"'home' points for the index
   fingers of the left and right hands"*).
2. *"The bumps have a grown-up name: tactile home position indicators. Two little ridges,
   one for each pointer finger, and all your other fingers line up from there."*
   (159 chars) — supports: Ratatype **[fetched]** (the name, verbatim) + Wikipedia
   *Touch typing* **[fetched]** (the home row as ASDF / JKL; anchored by the index keys).
3. *"Nobody wrote down who put the first bumps on F and J. They just quietly turned up on
   keyboards, everywhere, and never left."* (128 chars) — supports: **an absence of
   evidence, not a source.** Two dedicated articles (Ratatype, BGR, both **[fetched]**)
   give no origin, and the patent most often credited for it turns out to claim something
   else (US 6,667,697 B2, **[fetched]**). ⚠️ **This card asserts a negative. Ship it only
   if Trevor is happy with a card that says "nobody knows" — which is arguably the most
   honest and most interesting thing on the shelf, but it is a different kind of claim
   from the other three.**

## References

1. [Touch typing — Wikipedia](https://en.wikipedia.org/wiki/Touch_typing) — the home row
   definition, ASDF/JKL; as the home keys, and the two hedged sentences about raised
   dots/bars on the index-finger home keys and F/J surface features. One of several, never
   alone. **[fetched]**
2. [US 6,667,697 B2 — "Modified keys on a keyboard" (June E. Botich) — Google Patents](https://patents.google.com/patent/US6667697B2/en) —
   PRIMARY. Filed 23 April 2002, granted 23 December 2003. Establishes (a) that raised
   home-row tactile bumps existed as prior art before the patent, via its own background
   description of CE Software's "Quickeys" Home-row Indicators, and (b) that the claimed
   invention is raised tactile *edges* on A/F and J/`;`, not the F/J bumps. This is the
   page that corrects the internet's favourite origin story. **[fetched]**
3. [Why do the F and J keys have raised bumps… — Ratatype](https://www.ratatype.com/typing-tips/0205-why-do-the-f-and-j-keys-have-raised-bumps-and-why-does-the-keyboard-look-the-way-it-does/) —
   typing-education publisher: the term *"tactile home position indicators"* and the
   index-finger home-point framing. Also evidence for the gap: it offers **no** origin,
   inventor or date. **[fetched]**
4. [The Reason Why Your Keyboard's 'F' And 'J' Keys Have Little Bumps On Them — BGR](https://www.bgr.com/2113249/why-keyboard-f-and-j-keys-have-bumps/) —
   the *"homing bars/bumps"* term and the purpose. Cited chiefly as the second
   independent demonstration that a dedicated article on this subject contains no
   sourced history and **no citations at all**. **[fetched]**
5. [ISO/IEC 9995 — Wikipedia](https://en.wikipedia.org/wiki/ISO/IEC_9995) — read in full
   to test the "ISO 9995 standardises the bumps" claim. **It does not mention tactile
   marks, homing keys, the home row, or F and J anywhere.** Cited as a negative result.
   **[fetched]**
6. [ISO/IEC 9995-2:2009 — ISO](https://www.iso.org/standard/51644.html) —
   **⚠️ UNUSABLE THIS SESSION: HTTP 403 on fetch.** Listed so a future pass knows the
   exact page to try; explicitly NOT cited as if read. The standard's text is paywalled.
7. [homing bumps on other keys! — Deskthority forum](https://deskthority.net/viewtopic.php?t=11822) —
   **⚠️ UNUSABLE THIS SESSION: HTTP 403 on fetch.** Search snippets surfaced the
   contradictory community claims summarised above (Commodore 128 1985; no bumps on IBM
   PC keyboards; F/J homing "common in the 1970s"; Apple using D and K). Recorded as
   evidence of disagreement only. *(search result only, not fetched)*

## See also

[[touch-typing-pedagogy]] — why home row is taught first at all, with its own sources.
[[qwerty-keyboard]] — why F and J are where they are.
[[the-eighth-key]] — the other home-row key this game has opinions about.
[[apple-iie]] — the machine THE HARDWARE wing teaches typing on; the D-and-K homing claim
lives here as an open question, not there as a fact.

## Corrections from research pass (2026-09-14)

- **"The F/J bumps were patented by June E. Botich in April 2002."** Widely repeated and
  **wrong twice over.** US 6,667,697 B2 was *filed* 23 April 2002 and *granted*
  23 December 2003; and it does not claim the F/J bumps — its own prior-art section
  describes existing raised home-row bumps, and its invention is raised tactile *edges* on
  the outer home keys (A, F, J, `;`) forming a finger cradle, a design that did not become
  standard. Recorded before it could reach a card.
- **"ISO 9995 standardises the home-row tactile indicators."** Downgraded from
  background knowledge to **unverified**. Wikipedia's ISO/IEC 9995 article does not mention
  them; iso.org is unfetchable and paywalled.

## Unsourceable / weakly-sourced items

- **Who first put bumps on F and J, and in what year.** Not sourced. Deliberately left
  open. This is the honest core of the page.
- **Whether any published standard actually specifies them.** Not verified (see above).
- **The IBM Selectric (1961) "popularised them" claim**, which appeared in search
  summaries from typing-tutor blogs, is **not** supported by any page fetched this session
  and is not repeated on this page.
- **"Early typists filed notches into their own F and J keycaps."** A charming and
  frequently-repeated story; no source located this session, and the two dedicated
  articles that would carry it cite nothing. Not asserted.
- **Apple using D and K as homing keys.** Community claim, source unfetchable. Open
  question, not a fact.
