# Video Game History Reference
## Research behind the era progression, cabinet assignments, and graphics fidelity targets

*Compiled across the Act 5 + progressive-graphics sessions (2026-06 → 2026-07-11).
The playable assignments live in `.claude/rules/levels.md`; the original cabinet-era survey
is `research/arcade-cabinets-by-era.md`. This file records the history research that drove
the visual escalation and the newer cabinet picks.*

## The core principle it serves
Graphics fidelity escalates act-by-act because that's what actually happened, 1976→present.
A child learning her first two keys sees 1976; by full sentences she sees the modern era.
The game teaches gaming history *while* teaching the keyboard (levels.md "Progressive
Graphic Quality").

## Era fidelity targets (as implemented, 2026-07-11)

| Act | Years | Historical reality | Our canvas grammar |
|---|---|---|---|
| 1 Arcade | 1976-82 | Discrete-logic → early sprite hardware; 1-8 colors; motion IS the spectacle | Flat fills, blocky rects, no anti-aliasing, no gradients |
| 2 Computer Wing | 1981-86 | NES-class: ~52-color palette, tile/sprite engines, parallax via layered scroll speeds, personality sprites (DK's shrug was NEW in 1981) | Dithered/banded skies (never smooth gradients), multi-speed scroll layers, multi-frame walk cycles, torch-glow pools |
| 3 Basement | 1991-96 | 16-bit wars: Genesis FM + SNES Mode 7 era; big sprites (SF2's scale was the shock), pre-rendered 3D (DKC's SGI trick), CD-ROM photographic stills (Myst) | Gradients allowed, 2-3 depth parallax, 80-112px sprites with shading maps, god-rays, screen-flash battle drama |
| 4 Command Center | 1993-2000 | Early real-time 3D: flat-shaded/textured polys, low-poly + dithering, perspective cameras (PS1/N64) | True projection math (pinhole camera, isometric extrusion, vanishing points), flat-shaded faces, painter's algorithm, polygon-shard particles, NO soft shadows |
| 5 Full Circle | present | Modern rendering | Particles, volumetric light, eased motion, soft shadows — but levels 21-23 (Corner Cabinets) deliberately regress to Act-1 fidelity as a narrative beat |

## Cabinet assignments — history notes for the newer picks
(Original 20 are surveyed in arcade-cabinets-by-era.md and levels.md; these were added
for Act 5 in this cycle.)

| Lvl | Game | Why it earned the cabinet |
|---|---|---|
| 21 | **Out Run** (Sega AM2 / Yu Suzuki, 1986) | The definitive super-scaler road racer — sprite-scaling pseudo-3D, radio-station soundtrack choice, arcade-luxury fantasy. Faithful pixel art: sunset gradient, palms, red convertible |
| 22 | **Q*bert** (Gottlieb, 1982; Warren Davis/Jeff Lee) | Isometric cube pyramid — one of the most visually distinct cabinets ever; instantly readable to a child |
| 23 | **Missile Command** (Atari, 1980; Dave Theurer) | Trackball defense classic. IMPORTANT adaptation: in our version cities architecturally cannot be destroyed (no-punishment rule) — keystrokes only intercept; fireworks, not war |
| 24 | High-score entry screen (the AAA initials ritual) | Not a licensed game — the shared cultural memory of typing three initials; here the player types their whole name via Shift |
| 25 | Word processor | The keyboard's destination: writing. Modern, calm, paper-white |

**Corner Cabinets rationale (21-23):** the leftover physical keys (`- = [ ] \ ` '`) are the
keyboard's corners; the levels that teach them are the arcade's forgotten corner machines —
early-80s cabinets rediscovered late. The fidelity regression is intentional and narrative
("the room carries its own history"), and it makes the modern finale (24-25) land harder.

**Rules that governed selection** (unchanged): one game per cabinet, no title reuse across
levels; era-authentic to its level; faithful pixel-art recreation of the real game — never
justified by gimmicks (e.g., key-glyph resemblance was explicitly rejected).

## Parked: Act 6 "mastery wing"
Post-graduation act discussed 2026-07-10: **Mario Kart** and **Tron** cabinets (Trevor's
childhood list; the other four — Zelda, GoldenEye, DKC, FF7 — already own cabinets).
No new keys remain, so it's a speed/sentence "greatest hits" wing at modern fidelity;
historical-ordering rules deliberately loosened. See docs/ROADMAP.md §2.
