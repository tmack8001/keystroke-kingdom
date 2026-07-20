---
id: L44
kind: learning
title: The One Rule makes any level safely auto-playable by cycling its candidate keys
found: 2026-07-19
session: 2026-07-19 History Cards 2.0 + Save Slots + Collection
status: adopted
importance: medium
category: tooling
refs: [L36, F23, F24]
---

## What happened

Validating that a CARDED level still plays to completion and reveals its card
under the rebuilt rotating-card + save-slots code, I needed to drive a real
level to a real win in a headless browser — but the prompt DOM exposes only the
*display glyph* of the expected token (`promptDisplay`), not the raw token, and
the pattern stream is shuffled + card-injected + name-injected, so it can't be
predicted from outside the engine without reaching into private state.

The clean way through turned out to fall straight out of the game's core design.
**Wrong keypresses never cost anything and the letter just waits (the One Rule).**
So a validator doesn't need to know *which* key is expected at each step — it can
just cycle the level's whole candidate key set (`a s d f j k l ;` for level 4)
over and over. Every wrong press is a harmless no-op; every correct one advances.
Level 4 completed, the card glinted mid-play, the complete overlay revealed
"ADA — CARD 1 OF 42", and it persisted into the active slot's collection — all
with zero coupling to the pattern stream or any private state.

## The lesson

The One Rule (wrong keys are consequence-free) doubles as a **fuzzing guarantee**:
any level can be auto-won by mashing its unlocked key set until the complete
overlay appears, with no knowledge of the shuffled/injected pattern order. This
is the input-side complement to the video-derived-proof rule (L36): drive the
real engine to a real win, observe the real overlay — but you can do it *without*
a bespoke recorder that knows the expected sequence.

Practical recipe for any level-N validation:
- Seed a save slot at `furthestLevel: N`, resume it, Space through
  ready → keyboard-preview → game.
- Loop: press each key in `LEVELS[N].keys` (Shift-chord the capitals for L24,
  Space/Backspace for L25); after each round check whether `#game-screen
  .game-area` went hidden (victory) or `#complete-overlay` is visible.
- Then assert the observable payoff (overlay text, the history card, the
  persisted collection) — never internal state.

Corollary: this only works *because* the One Rule holds. If a future change ever
made a wrong key advance, skip, or penalize, this technique would break — which
makes it a passive tripwire on the One Rule itself, the same way F23 showed a
level that *couldn't* be won is a One Rule violation nothing had tried to catch.
