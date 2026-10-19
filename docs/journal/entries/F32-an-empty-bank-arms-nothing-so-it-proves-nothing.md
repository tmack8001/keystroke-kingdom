---
id: F32
kind: failure
title: An empty bank arms nothing — so it proved nothing, and shipping "mechanism only" deferred three defects onto the content author
found: 2026-09-15
session: 2026-09-15 card-content session
status: addressed
addressed-by: "The three defects are fixed in js/main.js (the free-play moment-word latch, the double splice, the bank-scoped counter) and in js/hardware/hub.js (the station card reveal, which did not exist). New guards: docs/testing/FINDINGS.md TF-A1, INV-103/INV-104 in docs/testing/STRATEGY.md, tests/integration/act-cards.test.mjs (plays a real Free Play session to completion), the INV-104 bank-hygiene tests, and a `--at=hardware:<station>` playtest target for a wing that had none."
addressed-date: 2026-09-15
importance: high
category: testing
refs: [F23, F26, F28, F30, INV-102]
---

## What happened

Three card banks shipped on 2026-09-14 as **mechanism only**, with their arrays deliberately
empty. That was written up — in the commit message, in the ROADMAP, and in three separate code
comments — as the careful, honest choice: the mechanism is real, the facts are not written yet,
and a child-facing historical claim is never invented to fill a gap. All of that reasoning was
correct and none of it is being retracted.

The next session wrote the first content into those banks. Three defects became reachable
immediately, and a fourth thing turned out never to have been built at all:

1. **A Free Play session could never be won.** `js/main.js` latched "the moment word was typed"
   behind `!state.freePlay` — correct for years, because only curriculum levels had cards — while
   the win gate (`cardPending`) carried no such exclusion. With a non-empty `ACT_CARDS` the gate
   armed and never cleared. No timer, no failure message, nothing on screen: a child types
   sentences until an adult closes the tab. This is the One Rule failing by omission, and it is
   the single most severe class of bug this game has. (`FINDINGS.md` **TF-A1**.)
2. **The guaranteed word was spliced twice**, because the act branch did its own injection and
   the generic card-injection block then acted on the same `state.currentCard`.
3. **The level-complete counter tested only for `'wing'`**, so an act card would have been
   counted against the arcade bank and read its total.
4. **THE HARDWARE had no card reveal at all.** `wakeUp()` wrote the card id into the save and
   drew nothing. The bookkeeping was perfect and the reward was missing — a player would have
   collected cards they never read, in a game whose entire collection rests on the ritual *you
   type the word, you get the story*.

Every gate was green on both sides of all four. `make test-fast`, `make test-integration`,
`static-host-check`, and a security review all passed the day the mechanism shipped, and passed
again the morning the content was written.

## Why nothing caught it

**Because an empty collection satisfies every assertion vacuously.** An empty pool arms no gate,
so nothing can hang. It injects nothing, so nothing can double-inject. It counts to zero
correctly against any denominator. Each test was doing exactly its job and each was being handed
a case with no content in it.

There is a sharper version of this worth keeping. The INV-102 invariant — *"an act card can never
hang a session"* — had been written **specifically to guard this hazard**, and its own text even
says "an empty bank arms nothing, so the layer is provably inert until content lands". That
sentence is true, and it was read as reassurance when it was actually a warning with a date on it:
*the proof expires the moment someone writes a card.* The invariant existed, was correct, and
still did not fire, because nothing connected "the bank stopped being empty" to "so go and run it".

## The lesson

**Emptiness is not a proof of safety. It is an absence of evidence that reads exactly like one.**

A feature gated off by having no data sits in the most dangerous state a feature can occupy: it
looks shipped, it looks tested, and every hazard inside it is postponed to a future session that
has no reason to be suspicious. "Mechanism only, content later" does not de-risk the mechanism —
it **transfers the risk to whoever writes the first content**, and hands them a green suite and a
set of confident comments saying the hard part is done.

So the rule: **the moment a bank, registry, table, or list stops being empty is the moment its
mechanism is genuinely run for the first time. That moment needs a PLAY, not a re-run.** Writing
the first entry is commissioning untested machinery, not authoring data.

This is the fourth outing for the same shape and the family is now unmistakable — **F23** (Level 8
shipped unwinnable because nothing had ever tried to win it), **F26** (the published build shipped
broken because nothing had ever tried to load it), **F30** (four themes drew at the centre because
nobody had looked at a frame with the panels present), and now this. Every one is *a capability
nobody exercised is a capability nobody verified.* The new wrinkle F32 adds is that the capability
can be **hidden behind its own emptiness**, so the usual prompt to go and exercise it never fires.

## What was also true, and worth not over-correcting

Two of the findings here were only findable by playing, and one — the missing reveal — is not a
bug in any technical sense. The code did exactly what it said. It banked the card and drew
nothing, and no assertion anywhere would ever call that wrong. It took looking at the screen and
noticing the reward was absent. `playtest.md` already says this (*"a green suite is a claim about
correctness, never about quality"*); the wing simply had **no playtest target**, so the cheap path
to looking did not exist. It has one now (`--at=hardware:<station>`, defaulting to two visits so a
non-rotating pool cannot masquerade as variety).

And a smaller repeat of **F28**, three times in one session: the new playtest target reported *"no
card revealed"* about a card that was on screen (a stray Return walked past the celebration); a new
integration test reported an unwinnable session about a session that had never begun (`F` toggles
Free Play, it does not start it); and the same test later reported *both* "the card revealed" and
"the session never completed", a contradiction that could only be the instrument — the harness was
typing past the win, and `#history-card` keeps its own visibility class after its parent overlay
is dismissed. **When the evidence is self-contradictory, the instrument is the suspect.**
