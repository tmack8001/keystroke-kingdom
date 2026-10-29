---
id: F34
kind: failure
title: Five personas, one backdoor — every tester reached the levels through `wopr`, so the unlock gates nobody can see were never played
found: 2026-10-29
session: 2026-10-29 persona playtest wave
status: open
importance: high
category: testing
refs: [L36, F23, F26, F28]
---

## What happened

We dispatched five persona testers (5-year-old, frustrated beginner, parent on a shared machine,
fast typist, 8-year-old explorer on the static-host shape) to confirm the branch is playable,
fair and winnable. Each wrote its own driver and each, independently, got to the screen it wanted
the same way: the `wopr` easter egg (or a seeded `kk-slots`). That egg sets `selectBypass=true`,
and `doorUnlocked` returns true whenever it is set (`js/ui/cabinet-art.js:91-93`).

So the thing this branch changed most — per-wing unlock levels (Hardware at 20, Speedway/Text
Worlds at 25) and the natural level ladder — was **never observed locked by any tester**. Tester E
went looking for a player route to the arcade select screen from the returning-player picker and
found none (`js/main.js` ~1698/1713 set `selectBypass=false`; the other callers are `wopr`, wing
returns, a Survival-only game-over Escape, and Free Play completion).

The same backdoor also cost a family its data: tester C, pressing Escape from the Ready screen and
typing `wopr` at name entry, silently renamed the active saved game (DAD → WOPR, then GRAM too).

## Why it matters

Five different personas gave the *appearance* of five independent checks. They shared one
upstream shortcut, so they shared one blind spot — the same shape as F23 (a level nobody had tried
to win) and F26 (a published build nobody had tried to load). Diversity of persona is not
diversity of route.

## What to do

- Make a persona harness (`--persona`) declare its **route** (natural ladder vs seeded) and print it
  in the report banner; a report that says "seeded" must name the gate it therefore did not test.
- Decide whether a returning player SHOULD have an in-UI path to the arcade select screen. If yes,
  that is the route to test; if no, record that the locked state is untestable by design.
- Fix the name-entry rename: `wopr` typed at name entry must not rename the active slot.
