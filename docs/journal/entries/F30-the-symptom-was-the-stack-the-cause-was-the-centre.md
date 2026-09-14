---
id: F30
kind: failure
title: Four defects, one shape — theme art drawn at the centre, where the UI has always lived
found: 2026-09-13
session: 2026-09-13 eight-lane audit wave
status: addressed
addressed-by: "Tetris's well moved out of dead centre into the left margin (GRID_X/GRID_Y were `(canvas - grid) / 2`); Galaga's formation shrunk per-theme and raised fully above 0.19H, and its capture beam stopped above the keyboard guide; Levels 18/19 given explicit textAlign/textBaseline (journal L28) and all three top-left counters moved out of the HUD badge's reserved zone. Every fix verified by capturing the frame and opening it."
addressed-date: 2026-09-13
importance: high
category: graphics
refs: [L17, L28, L29, F28]
---

## What happened

An eight-lane audit reported four separate visual defects across four levels. They
read as four unrelated bugs. They are one bug, wearing four costumes:

| Level | Reported as | Actually |
|---|---|---|
| 8 Tetris | "the well never shows a stack" | the whole well was drawn at dead centre, behind the prompt panel AND the keyboard guide |
| 4 Galaga | "the prompt letter is unreadable" | the formation was drawn over the prompt panel |
| 18/19 | "the counter is clipped at the canvas edge" | drawn at x = 0.02W with a LEAKED `textAlign:'center'`, so a left edge was used as a centre |
| 20 | "the counter is clipped at the top" | not clipped at all — occluded by the HUD badge it was drawn underneath |

**Every one is theme art placed where the DOM UI permanently lives.**
`visual-validation.md` has said so since 2026-07-11 — *"the UI owns the centre; the
theme owns the frame"* — with measured fractions for every reserved region. The rule
was written after exactly this, and it happened again in four more places.

## The one worth staring at

Tetris's symptom was *"shows a falling piece but never any locked/stacked blocks,
even though the LINES counter has advanced."* That sounds like a game-logic bug —
a stack that is not accumulating, a `lockPiece` that never fires.

The stack was accumulating perfectly. `grid`, `lockPiece`, the column-height scan and
the clear-flash all worked, and had always worked. **The well was simply behind the
UI.** The cause was one line:

```js
GRID_X = Math.floor((W - COLS * CELL) / 2);
GRID_Y = Math.floor((H - ROWS * CELL) / 2);
```

At 1280x800 that is a 400x640 playfield at 0.34-0.66W by 0.10-0.90H — inside the
prompt panel and inside the keyboard guide, simultaneously. Tetris's signature
mechanic ran for months where nobody could watch it.

## Two lessons, and the second is the useful one

**1. A visual symptom is not a diagnosis.** Three of the four reports named a cause
("clipped", "never shows a stack") and two of those causes were wrong. Reproducing
each one — a `fillText` probe for the counters, a mid-play capture for Tetris —
took minutes and moved every fix to a different place than the report implied. This
is F28's lesson from the other side: there, the instrument lied about the frame;
here, the reader lied about the cause. **Both are cured by going and looking.**

**2. The escape hatch was inside the comment that refused it.** Galaga's layout
carried an honest note: *"a 5-row formation cannot fit entirely above 0.19H WITHOUT
SHRINKING SPRITES GAME-WIDE, so this is the tightest fit."* The sprite scale is
**per-theme** — it is a local `const px` in that file. The previous author wrote down
the exact thing that would work, believed it was out of reach, and shipped the
compromise. And Tetris's centring is the same move: *of course* a playfield goes in
the middle of the screen — except in this game the middle is spoken for, and the
margins are where a tall narrow well actually wants to be.

**When a comment says a constraint cannot be met, check whether the thing it says is
impossible is actually local.** Both of these were.

## Why no test catches this class

`testing.md` rule 4 forbids canvas pixel and geometry assertions, deliberately —
those tests couple to implementation and rot. So the entire theme layer's *placement*
is unguarded by construction, and always will be. The compensating control is not a
test: it is `.claude/rules/playtest.md`'s instruction to capture the frame and open
it. Four defects in one afternoon is the measure of how much that control was owed.
