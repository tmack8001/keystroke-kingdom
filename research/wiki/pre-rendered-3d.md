---
title: Pre-rendered 3D (the DKC technique)
type: concept
tags: [video-game-history, technique, hardware, history-card]
sources: 2
verified: 2026-07-11
---

Pre-rendered 3D is the technique [[donkey-kong-country]] made famous in 1994: modeling,
texturing, and animating 3D characters on powerful workstations, rendering them frame by
frame, then compressing the output down into 2D sprites for a much less powerful target
console — producing visual results the target hardware could never have generated in real
time.

## In this game

This is the technique behind [[donkey-kong-country]] (Level 14, Act 3 "The Basement"). Rare
invested NES-era profits (~1992) in Silicon Graphics (SGI) Challenge workstations running
Alias PowerAnimator, building 3D NURBS character models that were textured, animated,
rendered frame-by-frame, and compressed to SNES sprites via Rare's proprietary "ACM"
(Advanced Computer Modelling) technique. **This page exists specifically to distinguish DKC's
genuine SGI pipeline from [[myst]]'s frequently-confused Mac/StrataVision pipeline** — the
two are easy to conflate because both are 1993-96-era CD-ROM/cartridge titles with unusually
high visual fidelity for their release windows, but only DKC's pipeline used SGI hardware.
See `research/video-game-history.md`, Act 3 references and the "Corrections from citation
pass" section (correction #1).

## The facts

- Donkey Kong Country (Rare, November 1994): SGI Challenge workstations + Alias
  PowerAnimator + 3D NURBS modeling + frame-by-frame rendering + "ACM" compression to SNES
  sprites. This claim is accurate and well-documented.
- Myst (Cyan, 1993): modeled and rendered on Apple **Macintosh Quadra** computers using
  **StrataVision 3D** — no SGI hardware involved in the original Myst. SGI workstations
  (reportedly 13 SGI Indigo units) were used by Cyan for the 1997 sequel Riven, not the
  1993 original. See [[myst]] for the full correction.

## References

1. [Donkey Kong Country — Wikipedia](https://en.wikipedia.org/wiki/Donkey_Kong_Country) — confirms the SGI Challenge workstation pipeline, Alias PowerAnimator, NURBS modeling, and ACM compression technique.
2. [Why Donkey Kong Country was a Technical Marvel — GameGrin](https://www.gamegrin.com/articles/why-donkey-kong-country-was-a-technical-marvel/) — games-journalism corroboration of the same SGI/pre-rendered pipeline.
