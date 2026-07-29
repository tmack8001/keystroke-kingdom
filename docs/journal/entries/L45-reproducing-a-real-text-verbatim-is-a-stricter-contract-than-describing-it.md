---
id: L45
kind: lesson
title: Reproducing a real text verbatim is a stricter contract than describing it
found: 2026-07-27
session: 2026-07-27 hacker-culture history cards + Level 25 Hacker Manifesto finale
status: adopted
importance: medium
category: research-integrity
refs: [F25, L38]
---

**When game content DESCRIBES history, paraphrase-from-verified-facts is fine; when it
REPRODUCES a real text on screen, only the verbatim, citation-verified string will do —
and any downstream constraint must be checked against that literal string, not the
gist.**

This session added 13 hacker-culture history cards (research → arcade-historian →
kid-friendly prose I wrote myself) and then a Level 25 finale where the player *types*
the famous line from *Hackers* (1995) that is itself quoted from *The Conscience of a
Hacker* (The Mentor, 1986). Two different reliability contracts surfaced:

- **Cards** — the card *fact* is prose I author from verified facts. Paraphrase is
  correct here; a "moment word" only has to be true and typeable.
- **Finale** — the game will render a real 1986 text *character for character*. I
  caught myself about to hardcode a remembered/paraphrased version (my option previews
  even used an em dash and "without nationality, skin color, or religious bias" — both
  wrong: the source uses an ellipsis and different wording). Sent the historian back
  for the exact string instead.

Two compounding reasons verbatim matters, not one:
1. **Historical integrity** — same rule as everywhere else in this repo (no
   history from model memory; see F25), but sharper: a paraphrase of a *described*
   fact is still honest; a paraphrase presented *as the quote* is a misquote.
2. **Typeability** — this game types on a constrained keyboard. The literal string
   decides winnability: an em dash (—) isn't a key; the source's ellipsis (`...`) is
   three period presses and IS typeable. Checking "is the topic typeable" against the
   gist would have passed while the real characters failed.

**The adopted checkpoint:** before shipping any reproduced artifact (a quote, a spec
line, an API signature, a legal clause), ask *"am I describing this or copying it?"*
If copying, the verification target moves from the claim to the exact characters, and
every downstream constraint (here: the L25 key closure) is re-checked against those
characters. Related: the finale's delicate "…my crime is that of curiosity" lines are
gated to the highest opt-in EXPERIENCE tier only — verbatim fidelity and
age-appropriateness are handled as separate axes.
