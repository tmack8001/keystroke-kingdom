---
title: Console hardware silhouettes — drawing the machine instead of a cabinet
type: concept
tags: [video-game-history, hardware, cabinet, act7, act2, theme-authoring]
sources: 6
verified: 2026-09-13
---

When a Keystroke Kingdom station is a **console or PC game**, the honest object to draw is **the
machine it actually ran on** — and the game has been doing this since Act 2 shipped. This page is
the drawing reference: for each machine, the **silhouette** and the **two or three unmistakable
details** that survive at cabinet-art scale (roughly 56×80 pixels on the select screen), plus the
era/bit-depth each should be rendered at. It is deliberately not a spec sheet — at that size,
colour and outline are the whole message.

## In this game

The principle lives on [[home-games-in-cabinets]]: **draw a real thing** — a real cabinet where
one exists, the real console where one does not. This page supplies the "real console" half.

**The vocabulary already exists in the design bible.** `.claude/rules/levels/act2.md` sets the
Computer Wing as *"A long room behind the Mystery Cabinet. **Computers and consoles from
different eras line the walls, each one running a classic game.**"* — and the act files name the
specific object per level: *"The NES in the center of the room"* (L9 Super Mario Bros),
*"A gold-cartridge NES beside a wooden TV"* (L10 Zelda), *"A computer running the original"*
(L8 Tetris), *"A computer running the first great CD-ROM game"* (L13 Myst), *"A Game Boy Pocket
on a backlit stand"* (L15 Pokémon). Act 7 can simply use the same grammar.

Related: [[home-games-in-cabinets]] · [[nintendo-vs-system]] · [[nes-hardware]] ·
[[mario-kart]] · [[gran-turismo]] · [[excitebike]] · [[need-for-speed-underground]] · [[f1-25]] ·
[[sixteen-bit-era]] · [[early-3d-era]] · `.claude/rules/theme-authoring.md`

## The facts — machine by machine

### Nintendo Entertainment System (North America, 1985/86) — draw at 8-bit

- **Two-tone grey with a black stripe and red lettering.** The signature is the **front-loading,
  zero-insertion-force cartridge slot, modelled on a videocassette recorder**, behind a small
  hinged door. Nintendo chose the VCR look deliberately so the machine read as consumer
  electronics rather than a toy — which is itself a lovely fact for this project.
- **Detachable controllers** plug into two seven-pin ports on the front (unlike the Famicom).
- Dates: North America **18 October 1985** (test market), **27 September 1986** nationwide.
- **The Japanese Famicom is a different drawing:** *"predominantly white plastic with a dark red
  trim,"* **top-loading**, with **hardwired controllers stored in moulded pockets** on the case.
  Do not mix the two.
- **Silhouette at 56×80:** a low, wide grey slab; the black stripe as one dark horizontal band;
  the cartridge door as a lighter rectangle in the lower front; one red pixel-run for the
  lettering. Palette guidance: [[nes-hardware]].

### Super Nintendo Entertainment System (North America, 1991) — draw at 16-bit

- **The North American model is boxy**, with **purple sliding switches** and a **dark grey eject
  lever**; the loading bay has a curved top surface deliberately shaped to discourage stacking
  things on it. Designed by **Lance Barr**.
- **The controller is the fastest identifier:** the diamond layout with **lavender concave X/Y**
  and **purple convex A/B** — an arrangement that became the basis for many later controllers.
- **The Japanese Super Famicom and the PAL SNES share a different, rounder design** with darker
  grey accents and buttons. If the scene is meant to be a North American living room, draw the
  boxy purple-switched one.
- Dates: Japan **21 November 1990**, North America **23 August 1991**.
- **Silhouette at 56×80:** a pale grey box, slightly taller-fronted than the NES, with **two
  purple dots** (the sliding switches) as the read-at-a-glance detail and a dark eject lever
  between them. The cartridge sits proud on top.

### Sony PlayStation (1994/95) — draw at PS1-era fidelity

- **A grey case** — the retail original (SCPH-1000/1001 family) was grey through the late 1990s.
  **Do not draw it black**; black is the later PS2, and a "black original PlayStation" is exactly
  the plausible-looking error this project keeps catching. *(A summary of the main Wikipedia
  article produced "black exterior" during this very pass; the `PlayStation models` article was
  fetched specifically to correct it.)*
- **Top-opening CD lid** with **front-mounted power and open buttons** — the lid is the
  silhouette. Original dimensions roughly **45 × 260 × 185 mm**.
- **The controller's four face buttons are geometric symbols** — green triangle, red circle,
  blue cross, pink square — per designer Teiyu Goto. At small scale, four coloured dots in a
  diamond is instantly legible as "PlayStation."
- Dates: Japan **3 December 1994**, North America **9 September 1995**, Europe **29 September
  1995**.
- The **PS one** redesign (**7 July 2000**) is smaller (≈38 × 193 × 144 mm) and **white** — a
  different object; only draw it if the scene is post-2000.

### PlayStation 2 (2000) — draw at sixth-generation fidelity

- **Matte black slab**, horizontal by default, standable vertically on an optional stand; a
  **tray-loading disc drive** and **two USB ports** on the front. Sony shipped many colour
  variants (ceramic white, aqua, metallic silver, navy blue), but matte black is the default
  reading.
- Dates: Japan **4 March 2000**, North America **26 October 2000**, Europe **24 November 2000**.
  The **Slimline** redesign arrived **November 2004** (NA 25 November 2004): much smaller,
  **top-loading**, with a built-in Ethernet port.
- **Silhouette at 56×80:** a black rectangle standing on end, with **one thin blue-lit slot** and
  a pair of tiny USB squares. The blue light is the whole identity.

### A period PC, and a modern sim rig — **[unverified] / under-documented**

Act 7's PC-era stations ([[need-for-speed-underground]] on PC, [[f1-25]] on PC) and the sim
terminus want a **beige-or-black tower plus a monitor**, or a **wheel-and-pedal rig**. This pass
sourced **no** description of either object, because the web-search budget was exhausted before
reaching them. Two honest options for an author:

1. Reuse the game's **existing** computer renderings — Act 2's Computer Wing and Act 4's Command
   Center already draw era machines, and Act 4 is explicitly a late-90s server room.
2. Commission a follow-up pass. **Do not invent hardware detail from feel** — the same failure
   mode that produced the "no cabinet exists" error.

The one thing that *is* established: [[f1-25]] and modern sims are genuinely played on **wheel
and pedal rigs**, and force feedback is a documented consumer technology from the late 1990s
(`research/racing-games-by-era.md` §11). A wheel clamped to a desk in front of a monitor is a
real object and a safe thing to draw.

## Bit-depth mapping (for Trevor's "8-bit / 16-bit / 24-bit renderings")

| Machine | Era to render at | Kit tier it sits beside |
|---|---|---|
| NES / Famicom | 8-bit, ~52-colour NES palette ([[nes-hardware]]) | `8bit` |
| SNES / Super Famicom | 16-bit, warm SNES palette ([[sixteen-bit-era]]) | `mode7` |
| PlayStation | early 3D, dithered low-colour ([[early-3d-era]]) | `ps1` |
| PlayStation 2 / period PC | sixth-gen; "24-bit" reads as true-colour — lighting and glow do the work | `modern` |
| Wheel rig / modern PC | present day | `modern` |

*Note on "24-bit": it is a **colour-depth** term (8 bits per RGB channel = 16.7 million colours),
not a console generation, and no 1990s console was marketed as 24-bit. Used as Trevor used it —
"the era where the picture stops being palette-limited" — it maps cleanly to the PS2/PC step
above. Worth saying plainly so nobody writes "the 24-bit era" on a history card.* **[unverified]
as a historical term of art — treat it as an authoring shorthand, not a fact.**

## References

1. [Nintendo Entertainment System — Wikipedia](https://en.wikipedia.org/wiki/Nintendo_Entertainment_System) — the NES's "two-tone gray color scheme with a black stripe and red lettering"; the "front-loading, zero insertion force slot modeled after a videocassette recorder"; two seven-pin controller ports; the deliberate consumer-electronics (not toy) positioning; the Famicom's "predominantly white plastic with a dark red trim," top-loading slot and hardwired controllers in moulded pockets; Famicom 15 July 1983, NES 18 October 1985 test market / 27 September 1986 nationwide. **[fetched]**
2. [Super Nintendo Entertainment System — Wikipedia](https://en.wikipedia.org/wiki/Super_Nintendo_Entertainment_System) — the boxy North American model with purple sliding switches and dark grey eject lever, designed by Lance Barr, and its curved loading-bay surface; the lavender concave X/Y and purple convex A/B buttons; the rounder, darker-accented Super Famicom/PAL design; the regional cartridge-shape difference; Japan 21 November 1990, NA 23 August 1991, UK/Ireland/France 11 April 1992. **[fetched]**
3. [PlayStation models — Wikipedia](https://en.wikipedia.org/wiki/PlayStation_models) — **the source that settles the colour**: the original SCPH-1000/1001 models had a **grey case**, with a top-loading CD mechanism and front power/open buttons, dimensions ≈45 × 260 × 185 mm; the PS one (2000) is smaller (≈38 × 193 × 144 mm) and white. **[fetched]**
4. [PlayStation (console) — Wikipedia](https://en.wikipedia.org/wiki/PlayStation_(console)) — the controller's four geometric face buttons (green triangle, red circle, blue cross, pink square) and Teiyu Goto's explanation of them; the PS one redesign date of 7 July 2000; release dates Japan 3 December 1994, NA 9 September 1995, Europe 29 September 1995, Australia 15 November 1995. Note: a summary of this page produced an **incorrect** "black exterior" for the original console — the colour claim on this wiki page rests on reference 3, not this one. **[fetched]**
5. [PlayStation 2 — Wikipedia](https://en.wikipedia.org/wiki/PlayStation_2) — matte black default finish with many colour variants; horizontal slab with optional vertical stand; tray-loading drive; two USB ports; Japan 4 March 2000, NA 26 October 2000, Europe 24 November 2000; the Slimline redesign of November 2004 (NA 25 November 2004) with top-loading drive and built-in Ethernet. **[fetched]**
6. Internal design sources (not web): `.claude/rules/levels/act2.md` (the Computer Wing's "computers and consoles from different eras line the walls" framing, and the per-level machine descriptions at L8–L10), `.claude/rules/levels/act3.md` (L13 Myst's computer, L15's "Game Boy Pocket on a backlit stand"), `.claude/rules/theme-authoring.md` (faithful-not-gimmicky, era fidelity). **[read in-repo]**

## Corrections from this pass (2026-09-13)

1. **"The original PlayStation was black."** False, and it was generated live during this pass by
   a summariser reading the main PlayStation article. The retail original is **grey**; black is
   the PS2. Logged here because it is a textbook adjacent-fact bleed, of exactly the
   Myst/Riven class this project's calibration list already warns about.
2. **"24-bit" is not a console generation.** It is a colour depth. Fine as authoring shorthand;
   never as a historical claim.

## Unsourceable / weakly-sourced items

- **Period PC towers, monitors and modern sim rigs** — no description sourced this pass. Flagged
  above; needs a follow-up pass before anyone draws one from feel.
- **Nintendo 64, GameCube, Xbox and Game Boy hardware appearance** — not researched here. The
  Game Boy Pocket already appears in `.claude/rules/levels/act3.md` as design intent, but this
  wiki carries **no sourced physical description** of it.
