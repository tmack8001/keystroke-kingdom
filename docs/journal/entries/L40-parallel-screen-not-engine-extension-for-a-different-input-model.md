---
id: L40
kind: learning
title: A different input model wants a parallel screen, not an engine extension
found: 2026-07-13
session: 2026-07-13 Act 6 Text Worlds — Green Dragon first slice
status: adopted
importance: high
category: engine
refs: [L28, L16]
---

**L40 — When a new mode's INPUT MODEL differs from the core engine's, add a parallel
screen/input path; don't stretch the engine to cover both.** Act 6's text worlds are
typed-command adventures: you read a room and type one of the commands it OFFERS, and the
world BRANCHES on your choice. The 25-level engine is the opposite shape — strictly
per-keystroke expected-token matching (`handleGameKey`), with the prompt stream pre-built
by `startGame`/`buildPatterns` from `levels.js`. Trying to shoehorn a branching text world
into `LEVELS[26+]` + a theme would have meant bending the engine's contract in every
direction. Instead the first slice landed as a **parallel `'textworld'` screen** that
reuses the ACT CINEMATIC pattern (hide `.screen` nodes, draw on the shared canvas, own
`case` in the keydown router) — so `handleGameKey`, `levels.js`, and the whole pattern
pipeline were **never touched**. On a dirty multi-pool tree that "zero core edits" property
is worth as much as the cleaner design. Rules that generalize: (1) match the integration
SEAM to the difference — a mode that differs only in CONTENT plugs into the theme registry;
a mode that differs in INPUT MODEL gets its own screen + input handler and reuses primitives
(audio, the wrong-key feel, persistence helpers) rather than the engine's control flow. (2)
Reuse by COPY, not by refactor, when the shared code is hot and owned by another lane: I
built a self-contained emerald CRT renderer instead of extracting `terminal.js`'s pipeline
— slightly duplicative, but it left Level 20 byte-identical and dodged a merge fight (the
extraction is a noted later follow-up). (3) The guided command-matcher — accept a key only
if the buffer stays a PREFIX of some authored offered command — delivers the One-Rule
wrong-key contract (gentle nudge, the line waits, never advances) AND keeps ZERO
untrusted-input surface for free (the player types the game's OWN command allowlist, never
free text; the free-text parser and its security boundary are a deliberately separate later
slice). Canvas text still obeys L28 (explicit textAlign/textBaseline every draw) and
measured word-wrap, because long narrative lines clipped the right margin until wrapped.
(→ L28, L16)
