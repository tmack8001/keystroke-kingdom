---
id: F29
kind: failure
title: A cited source's SILENCE is not a licence to default — three wrong cabinet panels, three different ways
found: 2026-09-13
session: 2026-09-13 control panels + the media layer
status: addressed
addressed-by: "research/wiki/tech/arcade-control-panels.md marks every cabinet TEXT or TEXT + IMAGERY and names the GAPs; research/WIKI.md gains the media layer (imagery stored beside the claim, credited and licence-checked, lint-enforced) plus the reference-only form for non-free sources; js/ui/cabinet-art.js `controls` descriptors carry an inline citation each, and absence means 'not sourced', never 'assume a joystick'. The three failure modes below are named so they can be looked for."
addressed-date: 2026-09-13
importance: high
category: research-integrity
refs: [F28, F7, L36]
---

## What happened

Cabinet control panels were rebuilt from the wiki's own cited text — a real improvement, since
every cabinet had previously shared one generic joystick-and-two-buttons panel and **Breakout
has no joystick at all**. Then Trevor raised the bar mid-pass: *"make sure we base them on
actual discovered text AND imagery of an arcade cabinet."*

Photographs were found for three of them. **All three drawings were wrong**, and each was
wrong in a different way. That is the useful part.

## The three failure modes

**1. SILENCE FILLED BY DEFAULT — Missile Command.**
The source says *"trackball + three fire buttons."* True, and complete as a sentence. It says
nothing about **position, size or colour**, so I supplied all three from habit: trackball on
the left, three small buttons in the cabinet's accent colour on the right. The photograph shows
**the trackball on the RIGHT and three large YELLOW rectangles on the LEFT**. Nothing I drew
was contradicted by the text — it was simply never in it, and the finished art presented the
whole panel as sourced. **Where a source is silent, either find imagery or mark the entry
under-specified. Do not fill the gap and then inherit the citation's authority for it.**

**2. A CITED DETAIL DROPPED BECAUSE IT WAS AWKWARD TO DRAW — Out Run.**
The source says *"steering wheel + stick shift (high/low gear) + accelerator/brake pedals."*
I drew the wheel and the shifter and silently dropped the **pedals**, because the 56×80 shell
is an upright and pedals had nowhere obvious to go. This is worse than (1): the source *did*
say it. The photograph made the omission obvious, and the fix was easy once it was named — the
pedals sit on the cabinet base. **An inconvenient cited detail is a composition problem to
solve, never a detail to quietly lose. If it genuinely cannot be drawn, record the compromise.**

**3. A RULE APPLIED INCONSISTENTLY WITHIN ONE DOCUMENT — Space Invaders.**
Assessing a quarter-scale replica, I counted its three buttons against a text source that
mentions only a fire button and declared a contradiction. Two paragraphs earlier, on Pac-Man,
I had written down the exact distinction that dissolves it: **start buttons are not gameplay
buttons.** When a restoration photograph of a real Taito upright (serial 000871) finally
surfaced, the original's panel was **stick + one large pale fire button + two red START
buttons** — i.e. the replica was faithful, and my "worked example" of replica unreliability was
a worked example of my own inconsistency. I had used a bad argument to discredit a good source.

## What survived, and what changed

The replica rule survives, restated correctly: **a replica is not distrusted because it is
usually wrong — it is distrusted because you cannot tell from the replica whether it is right.**
Here it was right. The only way to know was to find the original.

And a better source class was discovered: **a restorer photographing an UNRESTORED machine.**
Nothing has been "improved" toward what a modern eye expects, and an early serial is as close
to original spec as evidence gets. Look for one of those first.

## The exposure this audit implies — flagged, not fixed

**Only the control panels have been checked against photographs.** Everything else in
`js/ui/cabinet-art.js` — all 25 cabinet SCREENS, and the console/computer silhouettes on
[[console-hardware-silhouettes]] — was authored from text descriptions, by the same hand, under
the same habit that produced all three failures above. I have no reason to believe those are
wrong and no evidence that they are right. That is the honest statement of where this stands;
it is recorded on the control-panels page and in `.claude/rules/theme-authoring.md` rather than
left implied.

## Relationship to F28

F28 (same day) was *the instrument lied* — a screenshot harness photographed a frame the player
never sees, and a correct feature looked broken. This is the mirror image: **the source was
silent, and wrong art looked sourced.** Both are failures of evidence rather than of code, and
both were invisible until someone looked at a picture. That is now two entries in one session
arguing the same thing from opposite directions: *when a claim rests on seeing something, go
and see it.*
