---
id: L51
kind: learning
title: A rule about a WORD was built as a mask on the GLYPH — and the test that guarded it could only see the word
found: 2026-10-30
session: 2026-10-29 persona playtest wave
status: adopted
importance: high
category: pedagogy
refs: [F29, F34]
---

## What happened

CLAUDE.md said the eighth key is "never called semicolon in-game." Somewhere along the way that was
implemented as a **display mask**: `displayKey` and `promptDisplay` in `js/ui/hud.js` rendered the
`;` token as `?` on the prompt and every on-screen keyboard. INV-29 guarded the rule by grepping
player-facing strings for the *word* — so it stayed green forever, because the mask hid the glyph
and the word was never written.

A 5-year-old persona tester noticed the consequence: a child hunting for "?" on her real keyboard
cannot find it on the right pinky key. Trevor's clarification: the rule was only ever about not
teaching the WORD (and its name) before the game teaches it; the glyph is just a key to learn.

## Why it matters

The rule's *intent* (a mystery the game teaches) and its *implementation* (hide the character) had
drifted apart for months, and the one test around it checked the thing that was never in danger.
A guard that can only see the word cannot tell you the child is looking for the wrong symbol.

## What to do

- When a rule is about a word/name, say so in the rule: "the WORD is withheld; the glyph is shown."
  CLAUDE.md, easter-eggs.md, levels.md and act1.md now do.
- When you implement a withholding, test **what the player can actually do** (find the key), not
  only that a string is absent.
- A persona who cannot read yet is the cheapest detector for this class: ask what they would
  look for on a real keyboard.
