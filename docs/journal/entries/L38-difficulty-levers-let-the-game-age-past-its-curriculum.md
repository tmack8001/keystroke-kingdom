---
id: L38
kind: learning
title: Difficulty levers let the game age past the end of its curriculum
found: 2026-07-13
session: 2026-07-13 word-length difficulty setting
status: adopted
importance: high
category: game-design
refs: [L35]
---

**L38 — Player-set difficulty levers are how "grows with the child" survives past
Level 25.** Keystroke Kingdom was founded early-reader-friendly, and its "grows with
the player" DNA lived in the *fixed* curriculum arc — keys unlock across 25 levels,
graphics improve per act. But that arc has an END. Trevor's tenet (2026-07-13): the
game must **age with the player** regardless of age or keyboard savvy — it stays fun
for an older Oona or a keyboard-savvy adult, true to the arcade analogy (arcades were
for adults and kids alike). The mechanism is a *family* of player-set difficulty
settings that scale the game past the curriculum: **EXPERIENCE** (win-ratio: how much
a level demands) was the first; **MIN/MAX WORD LENGTH** (shorter=easier, longer=harder)
is the second. Lean toward adding to this family, not treating the curriculum as the
ceiling. (Saved as the durable tenet `game-ages-with-the-player` in agent memory.)

Two implementation lessons from building the word-length lever, both worth reusing for
future difficulty knobs:

1. **A difficulty lever is a best-effort suggestion, never a wall — winnability is the
   One Rule floor and is never traded for it.** A global word-length range can't be met
   at every level (an early level's few keys literally can't spell long words). So the
   filter falls back to a level's own words rather than empty its pool; guaranteed
   content (intro drills, history-card words, the player's name) is never filtered; and
   the latent unguarded empty-pool draw (`level.pool[rand*0]→undefined`) got fixed as
   part of the same change, because the filter made it reachable. Route the initial
   build AND every infinite redraw through ONE filtered-with-fallback helper so the
   drawn-from set is provably never empty. A level that can't end is a One Rule
   violation — the test that proves an *impossible* range still WINS is the load-bearing
   one (INV-39).

2. **A content axis needs content on both ends before the lever has teeth.** Raising the
   hard ceiling (wordgen 8→12) and adding a MAX-of-12 setting does nothing if the word
   banks top out at early-reader lengths. The static dictionary had to be expanded
   across the full length spectrum (rich short words for the young default AND genuinely
   harder long real words where each level's keys permit) — guarded automatically by the
   existing curriculum key-closure test (INV-16), which is what let a content-expansion
   lane run safely in parallel. Where keys can't reach (L4–L5, few letters), leaving the
   level short-dominated is correct — the lever just doesn't bite there, and the
   fallback covers it.

Same shape as L35's lesson from the other side: the test suite (INV-16 key-closure,
INV-38..41 the lever) is what made a 4-lane parallel build of an engine/settings/
server/content feature safe to run and verify.
