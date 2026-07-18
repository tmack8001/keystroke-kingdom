---
title: Sonic the Hedgehog
type: entity
tags: [video-game-history, game, console, history-card, cabinet]
level: 11
sources: 4
verified: 2026-07-12
---

Sonic the Hedgehog (Sega, June 23, 1991), developed under the internal codename "Defeat
Mario" by lead programmer Yuji Naka, character designer Naoto Ohshima, and lead designer
Hirokazu Yasuhara ("Sonic Team"), made speed itself the core design pillar — and helped the
Genesis briefly outsell the SNES roughly 2:1 in late 1991.

## In this game

Sonic the Hedgehog is the **Level 11 cabinet**, opening Act 3 (The Basement) and teaching V
and M. Its 16-bit Genesis FM visuals — speed-blur effects, multi-layer parallax — mark the
deliberate, dramatic jump from Act 2's NES palette described in the [[sixteen-bit-era]]
concept page. See `.claude/rules/levels.md` Level 11.

## The facts

- Lead programmer Yuji Naka, character designer Naoto Ohshima, level/lead designer Hirokazu
  Yasuhara — "Sonic Team." Released June 23, 1991, on Sega Genesis. Developed under the
  internal codename "Defeat Mario."
- Speed was the explicit core design pillar — Naka built a curved-movement algorithm
  specifically to let Sonic move faster than Super Mario Bros while staying readable.
- The Genesis briefly outsold the SNES roughly 2:1 in late 1991, and Sonic is widely
  credited as central to that swing — a genuine console-war counterpoint to [[super-mario-bros]].

## Gameplay

The player runs Sonic rightward through side-scrolling Zones (each split into three Acts
plus a boss), building speed on slopes and momentum-driven terrain rather than through
constant button presses — going downhill accelerates him, uphill slows him, and enough
speed is required to clear ramps and full vertical loops. Gold rings scattered through
each level are the core survival resource: holding at least one ring lets Sonic survive a
hit (he scatters his rings and can recollect them) instead of losing a life outright, and
collecting 100 rings grants an extra life. Sonic's only offensive move is the Spin
Attack — curling into a ball via jumping or rolling to damage enemies (robotic "Badniks")
and obstacles on contact. Note for our fidelity comparisons: the now-iconic Spin Dash
(charging the roll while stationary) was **not** in this 1991 original — it debuted in
Sonic the Hedgehog 2 (1992) — so momentum here comes purely from the terrain, not a
charge-up move. The signature mechanic the game is remembered for is exactly what its own
marketing promised: speed itself as the core design pillar, expressed through momentum
physics and looping, springs-and-slopes level geometry rather than combat.

*Downstream note: this directly explains the liveness audit's Level 11 finding (docs/
validation/liveness-audit-2026-07-12.md) — ring collection is implemented correctly, but
the wiki's own sourced "core design pillar" is speed/momentum, which our theme currently
does not visibly depict (Sonic drifts ~25px over 6+ seconds). No history-card text
currently asserts a Sonic mechanic claim, so nothing existing needs correcting — but any
new hint/card copy for Level 11 should reference momentum-on-slopes and the ring-survival
mechanic above, not spin dash (anachronistic for this specific 1991 game).*

## References

1. [Sonic the Hedgehog (1991 video game) — Wikipedia](https://en.wikipedia.org/wiki/Sonic_the_Hedgehog_(1991_video_game)) — designer credits, June 23, 1991 release, Genesis platform, "Defeat Mario" codename, speed-as-design-pillar quotes; ring/protection mechanic, spin attack, loops/springs/slopes level design. **[fetched]**
2. [Sonic the Hedgehog — The Strong National Museum of Play](https://www.museumofplay.org/games/sonic-the-hedgehog/) — institutional museum-induction source (2016) confirming 1991 release, the internal "Mr. Needlemouse" design contest, Sonic's role in the Sega/Nintendo console wars, and independently corroborates loop-the-loops/springs/slopes as the speed-preserving level design. **[fetched]**
3. [Spin Attack — Sonic Wiki Zone (Fandom)](https://sonic.fandom.com/wiki/Spin_Attack) — domain-canonical Sonic-franchise wiki confirming the Spin Attack as Sonic's primary offensive move (jump or roll to curl into a ball). *(search result only, not fetched)*
4. [Can You Spin Dash in the Original Sonic? — ACHIVX](https://achivx.com/can-you-spin-dash-in-the-original-sonic/) — corroborates that the Spin Dash was absent from the 1991 original and introduced in Sonic 2 (1992), the created-vs-later-feature distinction relevant to fidelity comparisons. *(search result only, not fetched)*
