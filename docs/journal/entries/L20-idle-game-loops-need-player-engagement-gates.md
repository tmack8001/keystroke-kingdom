---
id: L20
kind: learning
title: Idle game loops need player-engagement gates
found: 2026-06-25
session: 2026-07-11 transcript recon over past sessions (2026-06-22 → 2026-06-25)
status: adopted
importance: medium
category: engine
refs: []
---

**L20 — Idle game loops need player-engagement gates.** Vultures died on their own in
unattended tabs until collisions were gated on a post-keystroke attack window
(`js/themes/joust.js:368`). Background simulation must not progress the game.
