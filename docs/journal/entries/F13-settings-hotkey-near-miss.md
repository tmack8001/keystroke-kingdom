---
id: F13
kind: failure
title: "Near-miss: the settings hotkey was almost 'S'"
found: 2026-07-11
session: 2026-07-10 → 2026-07-11 mega-build (prepopulated)
status: addressed
importance: low
category: game-design
addressed-by: Caught at spec time; shipped as Tab instead of S
addressed-date: 2026-07-11
refs: []
---

**F13 — Near-miss: the settings hotkey was almost 'S'.** It would have collided with
typing `shallweplayagame` on the title screen (the WOPR secret). Caught at spec time;
shipped as Tab. Hidden input listeners make every new hotkey a collision risk —
grep the secret phrases before binding anything.
