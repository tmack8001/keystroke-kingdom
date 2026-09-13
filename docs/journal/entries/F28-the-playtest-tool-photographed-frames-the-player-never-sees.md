---
id: F28
kind: failure
title: The playtest tool photographed frames the player never sees — and a working feature looked broken
found: 2026-09-13
session: 2026-09-13 edutainment history cards
status: addressed
addressed-by: "settleAnimations(page) in scripts/playtest.mjs, awaited inside shot() before every capture. Awaits document.getAnimations() entries that are running AND finite (iterations !== Infinity, so the arcade's deliberate infinite animations — readyPulse, the blinking INSERT COIN, cursor blinks — are skipped by construction and cannot hang it). Capped at 1200ms and wrapped in try/catch: a screenshot must never be the thing that breaks a playtest run."
addressed-date: 2026-09-13
importance: high
category: tooling
refs: [F24, L36, F26]
---

## What happened

Five new history cards were added and played through the real route — win Level 7,
look at the LEVEL COMPLETE card. The captured frame showed the card **buried under
Dragon's Lair's victory sprites**, the cream business card washed out to nothing,
its text illegible behind a knight and a princess.

It looked exactly like a theme layout-contract violation, and the theme's own
comment invited that reading: the hero pair is staged center-frame *"(the engine
fades the gameplay UI for the victory window)"*. Real bug, real culprit, real
quote. I went looking for a z-index defect.

**There was no bug.** `.complete-overlay` is `z-index: 100` over a `z-index: 1`
canvas; `elementFromPoint` at the card's centre returns `history-card-title`. The
stacking was correct the whole time.

The actual cause: every `waitFor*` predicate in `playtest.mjs` fires the instant a
`hidden` class comes off, and `shot()` screenshots immediately after. But
`.complete-overlay` carries `fadeIn 0.4s` and `.history-card` carries
`cardDrop 0.4s`. **The tool was photographing the overlay at roughly 30% opacity**,
over a theme mid-victory-bloom that composites additively at full brightness. A
perfectly good card photographs as garbage.

The probe that settled it also *described* it, if I had read it as evidence rather
than noise: both elements measured `opacity: "0"`.

## Why this one matters more than it looks

`playtest.md` exists because a green suite is a claim about correctness, never
about quality — and its instruction is **"Looked at the frames. Reading the code is
not looking."** The whole rule rests on the frames being true.

**They weren't.** The tool built to end a class of failure had quietly joined it.
And the failure mode is worse than a missing check, because it is *confident*: it
produces an artifact that looks like proof, so it survives review. Journal F24 is
the same shape (the recorder synthesised success while stalled); L36 is the same
shape (code that looks animated rendering identical frames). This is the first time
it ran the other way — **synthesising a failure** — which is the more expensive
direction, because a false negative sends someone hunting a bug that does not
exist, and can get a correct implementation "fixed."

## The lesson

**A screenshot is a claim about a moment, and the moment has to be chosen.** Any
capture harness that waits on *visibility* is waiting on the wrong signal: CSS
transitions and animations mean an element is visible for hundreds of milliseconds
before it is *finished*. Wait for the thing to be **done**, not present.

`document.getAnimations()` makes this general and cheap — no per-screen timing
constants to tune and drift. The one real trap is that a retro arcade is full of
animations that never end on purpose, so filtering to finite ones is not an
optimisation, it is what stops the fix from hanging the tool forever.

And the meta-lesson, which is the same one this session already learned once from
the Stickybear research pass: **when the evidence says something is broken, check
whether the instrument is broken first.** A dead end in the tooling and a dead end
in the artifact look identical in a report.
