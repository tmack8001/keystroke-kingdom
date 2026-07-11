---
title: NES Hardware
type: concept
tags: [video-game-history, era, hardware, history-card]
sources: 3
verified: 2026-07-11
---

The NES's Picture Processing Unit (PPU) addresses a 64-value palette register, but
duplicate/near-duplicate entries mean the practical master palette is commonly reported as
52–55 distinguishable colors — while only **25 colors** (13 background + 12 sprite) can
appear on screen simultaneously, a materially smaller and distinct number from the master
palette size.

## In this game

NES-class hardware is Keystroke Kingdom's **Act 2 ("The Computer Wing")** visual target
(Levels 6–10): "~52-55 color master palette (25 on-screen simultaneously), tile/sprite
engines, parallax via layered scroll speeds, personality sprites." The canvas grammar calls
for dithered/banded skies (never smooth gradients), multi-speed scroll layers, multi-frame
walk cycles, and torch-glow pools. Act 2's cabinets — [[donkey-kong]] (Level 6, whose
tilemap lineage traces to [[galaxian]]), [[dragons-lair]] (Level 7), [[tetris]] (Level 8),
[[super-mario-bros]] (Level 9), and [[legend-of-zelda]] (Level 10) — are all bound by this
palette and rendering ceiling. See `research/video-game-history.md`, Era fidelity targets
table, Act 2 row.

## The facts

- **Correction applied:** an earlier draft's "~52-color palette" claim could be misread as
  the number of simultaneous on-screen colors. That is wrong — 25 colors (13 background +
  12 sprite) is the true on-screen-simultaneous figure, smaller than the ~52-55 master
  palette size. Both figures are now distinguished explicitly.
- The NES PPU's 64-value palette register contains duplicate/near-duplicate entries,
  explaining why the practical distinguishable master palette is smaller than 64.

## References

1. [NESdev Wiki — PPU palettes](https://www.nesdev.org/wiki/PPU_palettes) — authoritative technical reference: the NES PPU addresses a 64-value palette register; duplicate/near-duplicate entries yield a practical master palette of 52–55 distinguishable colors.
2. [Wikipedia — List of video game console palettes](https://en.wikipedia.org/wiki/List_of_video_game_console_palettes) — "The NES can create 54 colors... allowing for a total of 25 on-screen colors" — source of the "~52-color" figure and the 25-on-screen (13 background + 12 sprite) clarification.
3. [NESDev Forum — "Why only 52 colors instead of 256?"](https://forums.nesdev.org/viewtopic.php?t=16054) — community technical corroboration of the master-palette figure and the duplicate-color explanation.
