---
title: Space Invaders
type: entity
tags: [video-game-history, game, arcade, history-card, cabinet]
level: 2
sources: 3
verified: 2026-07-11
---

Space Invaders (Taito, 1978), designed by Tomohiro Nishikado, is the fixed shooter widely
credited with launching the golden age of arcade games — and the source of gaming's most
famous hardware accident: alien movement speeding up as the Intel 8080 CPU had fewer
sprites left to draw.

## In this game

Space Invaders is the **Level 2 cabinet**, teaching D and K. Its black-background,
single-color silhouette sprites with early marching motion define Act 1's second visual
step — more shapes than [[breakout]], still no faces or personality. See
`.claude/rules/levels.md` Level 2.

## The facts

- Developer: Taito, designed by Tomohiro Nishikado. Released July 1978 (Japan), November
  1978 (North America).
- Visual style: black background, white sprites; color achieved via transparent colored
  cellophane strips over screen regions (orange/green), later electronically generated.
  Alien designs modeled after squids, crabs, and octopuses.
- Input: two-way joystick (left/right) plus fire button.
- Technical: Intel 8080 CPU, bitmapped framebuffer (raster graphics), monaural sound via
  analog circuitry + Texas Instruments SN76477 sound chip.
- The iconic speed-up as aliens are destroyed is the accepted historical explanation for an
  **unintentional hardware accident**: the 8080 rendered fewer sprites faster as the
  invader count dropped. Nishikado is documented as having kept the effect once he noticed
  it because it added tension.

## References

1. [Space Invaders — Wikipedia](https://en.wikipedia.org/wiki/Space_Invaders) — Tomohiro Nishikado design credit, Taito 1978 release, and the Intel 8080 frame-render explanation for the alien speed-up (cross-checked against the two sources below; not used alone).
2. Tom's Hardware technical retrospective on the Intel 8080 bottleneck ("Space Invaders arcade game ran faster as enemies died due to Intel 8080 bottleneck") — corroborates the hardware-accident explanation; found via search, page did not fully render on fetch so treat as corroborating rather than primary.
3. RedHotCyber technical writeup ("The secret behind Space Invaders' speed: a technical limitation of the hardware") — independent corroboration; found via search, URL returned an error on direct fetch, so verify accessibility before citing as primary.
