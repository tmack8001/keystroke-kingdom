---
id: F31
kind: failure
title: A stale finding in the record corroborated a wrong fresh one — and two wrongs read as certainty
found: 2026-09-13
session: 2026-09-13 eight-lane audit wave
status: addressed
addressed-by: "docs/validation/liveness-audit-2026-07-12.md now opens with a loud SUPERSEDED banner naming the commit that invalidated it (9ca6932, 2026-07-18, 20 theme files rewritten) and the 2026-09-13 re-verification; the two wiki downstream notes that propagated its verdicts are marked STALE in place, keeping the sourced MECHANIC (still the right bar) and correcting only the claim about our build."
addressed-date: 2026-09-13
importance: high
category: agent-process
refs: [F28, F30, L36]
---

## What happened

A theme-audit lane scored Level 11 (Sonic) and Level 14 (Donkey Kong Country) **WEAK** on
mechanics fidelity, reporting the characters as "essentially static". It supported this
two ways: with its own captured frames, and by citing
`docs/validation/liveness-audit-2026-07-12.md`, which said the same thing. It reported
them as *"PRE-EXISTING, ALREADY-DOCUMENTED open findings... confirmed STILL TRUE today."*

Both characters move. Sonic performs a spin attack with afterimage trails and speed
streaks; the Kong runs with a visible lope cycle, bananas and a shadow. Verified by typing
40 keystrokes and capturing time-separated frames.

**Two independent errors lined up and looked like confirmation.**

## Error one: the lane never typed

Its evidence was `level11/01-level-11-run-1.png` and a victory burst. The first is the
**first prompt** — before any input. The second is the **celebration** — after play has
ended. Neither is mid-play. Both themes gate motion on keystrokes, by design (journal L20:
"background simulation must not progress the game state in an unattended tab"). The lane
sampled exactly the two moments where a keystroke-driven scene is legitimately still.

The sibling lane covering Levels 1–10 wrote its own mid-play script and captured
post-keypress frames. Same brief, same instruction to "idle 3+ seconds AND type keys" —
one lane did, one didn't, and the one that didn't produced the false finding.

## Error two: the record it checked against was five days out of date

`liveness-audit-2026-07-12.md` was correct **on 2026-07-12**. Six days later, commit
`9ca6932` ("era-progressive theme graphics") rewrote **20 theme files** — including every
level that audit scored WEAK. Sonic gained 399 changed lines; DKC 673. The diff adds, in
as many words, the thing the audit said was missing:

> *"DK RUNS through the world — a weighty knuckle-lope that actually translates"* —
> plus `dkVX`, `dkPhase`, `dkBob`.

Nobody marked the audit superseded. Worse, its verdicts had been **copied outward** into
two wiki pages as "downstream notes", so the stale claim existed in three places and
looked like an established fact with citations.

## Why this one is worth its own entry

F28 was *the instrument lied*. F30 was *the reader misdiagnosed a real symptom*. This is
the dangerous compound: **a wrong fresh observation met a stale record that agreed with
it, and the agreement was read as verification.** Neither error alone would have survived
five minutes of checking. Together they produced a confident, cited, doubly-sourced
finding that was simply false — and it would have cost a day of "fixing" two themes that
work.

## The rules that follow

1. **A dated audit is a snapshot, not a fact.** Before citing one, check whether the code
   it examined has changed since. `git log --since=<audit date> -- <path>` is the whole
   check and it takes seconds.
2. **When a finding is fixed, go back and mark the document that recorded it.** This is
   the same lesson as the four false "capture-cards.js is broken" reports on the same day:
   *the words a reader lands on first are the ones that travel*. A verdict with no
   supersession note beside it will be re-reported as current, indefinitely.
3. **Agreement between a new observation and an old record is not corroboration** if the
   old record was an input to the new observation's interpretation. The lane read the note
   and then saw what the note described.
4. **A keystroke-driven scene must be sampled mid-keystroke.** Entry and victory frames
   cannot prove a game is dead, only that it is quiet when nobody is playing — which is
   required behaviour here, not a defect.
