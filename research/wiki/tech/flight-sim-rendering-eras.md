---
title: Flight Simulator Rendering Eras
type: concept
tags: [video-game-history, flight-simulator, graphics, act7, era-fidelity]
sources: 8
verified: 2026-09-12
---

The flight simulator is the cleanest single line in games through which to watch rendering
technology climb, because one product line — [[microsoft-flight-simulator]] — spans the whole arc
under one name: **wireframe (1980) → filled colour polygons (1982) → EGA/VGA solids (1988–91) →
texture mapping (1993) → hardware 3D (1997) → streamed photogrammetry of the actual Earth
(2020).** This page is the theme author's cheat sheet, written so an Act 7 flight station can be
drawn at the right fidelity for its year rather than defaulting to 8-bit.

## In this game

Trevor's hard constraint for Act 7 (2026-09-12): *"I want to make sure the graphics for games is
progressing through the eras with them — they all shouldn't be 8-bit graphics."* The car arc's
equivalent table lives in `research/racing-games-by-era.md` §13; this is its aviation companion,
and it covers **two rendering steps the car arc does not**: monochrome **vector** line graphics
([[battlezone]], 1980) and **wireframe** 3D ([[flight-simulator-fs1]], 1980).

Cross-links: [[keyboard-as-cockpit]] · [[discrete-logic-era]] · [[early-3d-era]] ·
[[pre-rendered-3d]] · [[super-scaler]] · [[sixteen-bit-era]].

## The facts

| Era | Years | Representative | Rendering technique | Canvas grammar for a theme |
|---|---|---|---|---|
| **Wireframe** | 1980 | [[flight-simulator-fs1]] (Apple II) | Black-and-white **wireframe** line drawing; scenery of just **36 tiles** in a 6×6 grid; composite-artifact colour tricks on the Apple II | Stroked lines only, no fills. A horizon line, a runway trapezoid, one mountain triangle, one bridge |
| **Vector** | 1980 | [[battlezone]] (arcade) | True **vector monitor** — the beam draws lines directly; black-and-white tube with a coloured plastic overlay for the "green ground / red horizon" look | Glowing thin strokes with bloom; colour applied as flat bands, not per-object |
| **Filled polygons** | 1982–1989 | [[microsoft-flight-simulator]] 1.0 → 4.0 | Artwick replaced the Apple wireframe with **solid-filled colour** for the IBM PC; CGA, later EGA high-resolution and dynamic scenery | Flat-filled convex polygons, painter's-algorithm depth, no shading gradient |
| **VGA solids + real flight model** | 1991 | [[falcon-flight-sim]] (Falcon 3.0) | VGA; demanded a **math coprocessor** for the high-fidelity flight mode and a 386+ to be playable | 256-colour flat shading, an instrument-dense HUD overlay drawn in strokes |
| **Texture mapping** | 1993–1995 | Microsoft Flight Simulator **5.0** (1993); [[flight-unlimited]] (1995) | FS 5.0 is the **first** version in the line with texture mapping; FS 5.1 added satellite imagery. Flight Unlimited built terrain by **stereophotogrammetry** from real aerial photographs of ~11-square-mile areas | Textured quads; ground as a photo stretched over an elevation mesh |
| **Hardware 3D** | 1996–1999 | [[pilotwings-64]] (1996); Microsoft FS98 (1997) | N64-class hardware features — **level of detail, mipmapping, z-buffering, texture filtering, anti-aliasing**; FS98 moved to DirectX 3D | Perspective-correct textures, distance fog/LOD popping, clean filtering (no PS1 affine wobble) |
| **Physics-first sim** | 1995–now | [[x-plane]] | Not a rendering step but a *modelling* step: **blade element theory** computes forces on the airframe in real time instead of reading a pre-computed lookup table | Visualise as force arrows / data channels rather than prettier pixels |
| **Planet-scale photogrammetry** | 2020–now | Microsoft Flight Simulator (2020) | Streams a **>2.5-petabyte** Bing Maps dataset from Azure — photogrammetry 3D buildings, AI-generated from 2D satellite imagery; 37,000 airports, 2M cities, 1.5B buildings, 2T trees, 117M lakes; live weather and live air traffic | Out of reach for canvas. Suggest the **map/satellite-tile aesthetic** — a world assembling itself out of imagery tiles — rather than chasing photorealism |

**The one-sentence version for a child:** *the first flight simulator drew the world with about
thirty-six squares; the newest one draws the whole planet.*

## References

1. [Flight Simulator (1980 video game) — Wikipedia](https://en.wikipedia.org/wiki/Flight_Simulator_(1980_video_game)) — FS1's black-and-white wireframe graphics and the 36-tile (6×6) scenery. **[fetched]**
2. [The Dream of Flight — The Digital Antiquarian (Jimmy Maher)](https://www.filfre.net/2021/01/the-dream-of-flight/) — Apple II composite-artifact colour; Artwick replacing wireframe with solid-filled colour for the IBM PC version. **[fetched]**
3. [History of Microsoft Flight Simulator — Wikipedia](https://en.wikipedia.org/wiki/History_of_Microsoft_Flight_Simulator) — the version-by-version graphics ladder: CGA (1.0, 1982), EGA high-resolution (3.0, 1988), dynamic scenery (4.0, 1989), **texture mapping first in 5.0 (1993)**, satellite imagery (5.1), DirectX 3D (FS98), 3D elevation/GPS (FS2000). **[fetched]**
4. [Battlezone (1980 video game) — Wikipedia](https://en.wikipedia.org/wiki/Battlezone_(1980_video_game)) — wireframe **vector** graphics on a black-and-white monitor with a coloured overlay. **[fetched]**
5. [Falcon 3.0 — Wikipedia](https://en.wikipedia.org/wiki/Falcon_3.0) — VGA graphics; math coprocessor required for high-fidelity flight mode; "virtually unplayable" below a 386. **[fetched]**
6. [Flight Unlimited — Wikipedia](https://en.wikipedia.org/wiki/Flight_Unlimited) — stereophotogrammetry from aerial photographs of France and the United States producing ~11-square-mile photorealistic terrain areas. **[fetched]**
7. [Pilotwings 64 — Wikipedia](https://en.wikipedia.org/wiki/Pilotwings_64) — level of detail, mipmapping, z-buffering, texture filtering and anti-aliasing used to render large environments on N64 hardware. **[fetched]**
8. [Microsoft Flight Simulator: The Future of Game Development — Microsoft (first-party)](https://developer.microsoft.com/en-us/games/articles/2021/07/microsoft-flight-simulator-the-future-of-game-development/) — >2.5 petabytes of Bing Maps data, 37,000 airports, 2M cities, 1.5B buildings, 2T trees, 117M lakes; photogrammetry and ML-trained placement on Azure; live weather (meteoblue) and live traffic (FlightAware); streaming architecture. **[fetched]**
9. [X-Plane (simulator) — Wikipedia](https://en.wikipedia.org/wiki/X-Plane_(simulator)) — blade element theory as a real-time alternative to lookup-table flight models. **[fetched]**
