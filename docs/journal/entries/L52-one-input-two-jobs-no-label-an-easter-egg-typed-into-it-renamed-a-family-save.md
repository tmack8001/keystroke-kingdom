---
id: L52
kind: learning
title: One input surface, two jobs, no label — an easter egg typed into it silently renamed a family's saved game
found: 2026-10-30
session: 2026-10-29 persona playtest wave
status: adopted
importance: high
category: game-design
refs: [F34, L51]
---

## What happened

Name entry served two purposes: *"who are you?"* for a brand-new player and *"rename this game"*
for an existing one (reached by pressing Escape on the READY screen). Nothing on screen said which
one you were in. A parent tester, unsure where they were, typed the `wopr` easter egg into the
field and pressed Return — and the active saved game was renamed DAD → WOPR, silently, twice.

The existing comment in `js/main.js` even called it out ("Escape-from-ready re-entry -> rename").
It was a *deliberate* feature with a trap affordance, not a stray bug, which is why no one fixed it.

## Why it matters

A destructive-ish action (changing the label of a family member's save) hid behind a key
(Escape) a child or parent presses to *leave* a screen. Escape should never lead to a place where
typing changes saved data.

## What to do

- Give every input surface exactly one job; a second job gets its own labelled entry
  (now: **R RENAME** on the picker, field titled RENAME THIS GAME).
- Make "leave" keys go somewhere inert (Escape on READY now reaches the arcade).
- The same persona wave found this only because a *parent* persona existed; the child persona
  never pressed Escape there. Personas find different bugs because they use different keys.
