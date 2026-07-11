---
title: Early 3D Era (PS1/N64)
type: concept
tags: [video-game-history, era, hardware, history-card]
sources: 2
verified: 2026-07-11
---

The early real-time 3D era (roughly 1993–2000, PS1/N64-generation hardware) is defined by
two different, incompatible sets of technical compromises: the PlayStation's lack of a
hardware z-buffer and its affine (non-perspective-correct) texture mapping causing
characteristic "wobble," versus the N64's genuine hardware z-buffering and
perspective-correct texturing undercut by only 4KB of texture memory, forcing blurry
low-res dithered textures.

## In this game

This concept is Keystroke Kingdom's **Act 4 ("The Command Center")** visual target (Levels
16–20): "Early real-time 3D: flat-shaded/textured polys, low-poly + dithering, perspective
cameras." Canvas grammar: true projection math (pinhole camera, isometric extrusion,
vanishing points), flat-shaded faces, painter's algorithm, polygon-shard particles, no soft
shadows. Act 4's cabinets — [[simcity-2000]] (Level 16), [[goldeneye-007]] (Level 17, N64),
[[age-of-empires]] (Level 18), [[final-fantasy-vii]] (Level 19, PlayStation), and the
Level 20 terminal/binary reveal — all sit within this hardware period, with
[[goldeneye-007]] and [[final-fantasy-vii]] as the era's flagship examples of N64 and PS1
constraints respectively. Also relevant: [[time-crisis]] (1995 arcade, ahead of both
consoles) and [[metal-slug]] (Neo Geo, a contemporaneous 2D-sprite holdout). See
`research/video-game-history.md`, Era fidelity targets table, Act 4 row.

## The facts

- PS1: no hardware z-buffer, forcing CPU-side painter's-algorithm depth sorting; affine
  (non-perspective-correct) texture mapping causes the characteristic texture "wobble" on
  shallow-angle polygons; no mipmapping causes distant-texture flicker.
- N64: genuine hardware z-buffering and perspective-correct texture mapping (fixing PS1's
  wobble problem), but constrained by only 4KB of texture memory — pushing developers
  toward blurry low-res textures, flat/Gouraud shading, and hardware dithering to fake
  extra color depth.
- Final Fantasy VII (1997) began development in 1994 targeting Super Famicom/Nintendo 64
  before moving to PlayStation specifically for CD-ROM storage capacity.
- Time Crisis (1995, arcade) predates both consoles' mainstream 3D and required its
  PlayStation port to reduce polygons, halve frame rate, delay enemy spawns, and eliminate
  off-screen rendering to compensate for the arcade original's superior hardware.

## References

1. [Hackaday — "Why PlayStation Graphics Wobble, Flicker And Twitch"](https://hackaday.com/2026/02/06/why-playstation-graphics-wobble-flicker-and-twitch/) — technical explainer of the PS1's lack of hardware z-buffer and affine texture mapping.
2. [Copetti.org — "Nintendo 64 Architecture: A Practical Analysis"](https://www.copetti.org/writings/consoles/nintendo-64/) — deep hardware-level reference confirming N64's z-buffering/perspective-correct texturing versus its 4KB texture memory constraint.
