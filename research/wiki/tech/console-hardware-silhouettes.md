---
title: Console hardware silhouettes — drawing the machine instead of a cabinet
type: concept
tags: [video-game-history, hardware, cabinet, act7, act2, theme-authoring]
sources: 14
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

## Which machine to draw: the one it DEBUTED on

*(Trevor, 2026-09-13: "Of course many of these were later created into arcade games, but most
(Mario) were home first and later ported to an arcade cabinet after finding popularity and
arcade nostalgia.")*

He is right, and it is the rule that decides every station in Acts 2–4:

> **Draw the platform the game shipped on FIRST. A later arcade conversion does not change
> what the game was.**

The worked case is the one he named. *Super Mario Bros.* shipped for the Famicom/NES on
**13 September 1985**; **VS. Super Mario Bros.** — Nintendo's own arcade version, running NES
hardware inside a cabinet — followed in **February 1986** ([[nintendo-vs-system]]). So an
arcade Super Mario Bros. genuinely exists, and Level 9 is still an **NES**, because that is
where the game was born and where a child met it.

This also keeps two existing rules from fighting each other. [[home-games-in-cabinets]] says a
licensed arcade conversion is real and may be drawn — that page exists because a "no cabinet
exists" claim was once shipped wrongly. This page says which one to draw *here*. Both hold:
**the conversion is real; the debut platform is what this game depicts.**

Two consequences worth stating, because they are not symmetrical:

- **Arcade-first titles stay cabinets even when they had famous home ports.** Donkey Kong
  (1981), Dragon's Lair (1983), Street Fighter II (1991), Out Run, Q*bert and Missile Command
  are coin-ops that later reached living rooms. They are drawn as cabinets.
- **Home-first titles stay machines even when they later reached an arcade.** Super Mario Bros.,
  Zelda, Sonic, Donkey Kong Country, Pokémon, Myst.

And where a title is genuinely ambiguous or the debut is contested, **say so on its page rather
than picking** — the ordering is a factual claim like any other and needs its citation.

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

### Sega Genesis, Model 1 (North America, 1989) — draw at 16-bit

The machine [[sonic-the-hedgehog]] shipped on. **Photograph-verified 2026-09-13.**

- **Black, low and wedge-shaped**, with a **ridged vent strip** running along the top-left.
- **The identifier is the circular raised cartridge bay** at the right of the top surface,
  carrying a **red `GENESIS` badge and `16-BIT`**. Nothing else in this era looks like it.
- **Silhouette at 56×80:** a black slab; one lighter ridged band top-left; a **dark circle**
  right of centre with a **red pixel-run** across it. The red-on-black badge is the whole
  message at this size.
- **⚠️ Not the Japanese Mega Drive and not the Model 2.** The JP Mk1 and the 1993 Model 2 are
  different objects; Sonic in a North American living room is the Model 1.

### Super Nintendo (North America, 1991) — the photograph, added

Text notes are above; the photograph confirms and sharpens them.

- **Light grey, boxy**, with a darker grey recessed panel across the top.
- **The identifier is the pair of PURPLE sliding switches** on the front face — power and
  reset, side by side, unmistakable at any size.
- Two controller ports on the angled lower front.
- **Silhouette at 56×80:** a pale grey box, a darker inset band on top, and **two purple pixel
  blocks** low on the front.

### Game Boy Pocket (1996) — draw at 4-shade dot-matrix

`.claude/rules/levels/act3.md` names this exact model for L15: *"A Game Boy Pocket on a backlit
stand."* **Photograph-verified 2026-09-13.**

- **Silver-grey, portrait**, notably slimmer than the original 1989 Game Boy.
- **A grey-green LCD** high on the face inside a slightly lighter bezel.
- **Black cross D-pad lower-left**; **two round grey buttons lower-right**, labelled B then A
  (B is to the LEFT of A); two small slanted SELECT/START pills between them, below.
- **Speaker holes** in the lower-right corner.
- **Silhouette at 56×80:** a tall pale rectangle; a grey-green screen block in its upper half;
  a black cross and two dots below. The portrait orientation alone distinguishes it from every
  other machine on this page.

### Nintendo 64 (1996) — draw at early-3D fidelity

- **Dark charcoal, curved and organic** — the only console here that is not a rectangle.
- **Cartridge slot on the top surface.**
- **The identifier is four controller ports in a CURVED ROW across the front**, and the
  `NINTENDO 64` logo with its multicoloured 3D "64" in the centre front.
- **Silhouette at 56×80:** a dark rounded mass with **four pale notches along its front edge**
  and a small colour fleck at centre. Four ports is the fact — every other console here has
  two.

### Sony PlayStation (SCPH-1000/1001, 1994/95) — the photograph, added

- **GREY.** Photograph-confirmed, which matters because this wiki records a summariser
  asserting mid-research that the original PlayStation was black. **Black is the PS2.**
- A flat wide box with a **round CD lid** occupying most of the top surface.
- Controller: grey, D-pad left, the **four-symbol face buttons** right.
- **Silhouette at 56×80:** a pale grey slab with a **circle** on top. The circle is the message.
- **⚠️ Model note:** the photograph is an **SCPH-1000 (Japanese launch)**. The North American
  SCPH-1001 is the same industrial design and the same grey; where a claim depends on port or
  badge detail rather than shape and colour, source the NA unit.

### Apple II / Apple IIe (1977–1986, beige) — draw at 8-bit

The machine [[stickybear]] actually ran on, and therefore the honest object for any
Stickybear set dressing. **There is no Stickybear arcade cabinet and there never was**
([[bear-on-a-blue-screen]]) — this is the thing to draw instead.

- **The computer IS the keyboard.** A low beige wedge with the keys sunk into its top
  surface; there is no separate keyboard and no separate box. Everything else sits on it.
- **The monitor sits ON TOP of the wedge** — a deep-bezelled beige CRT, roughly as wide as
  the machine under it.
- **The Disk II drive stands alongside**, and it is the fastest identifier in the whole
  silhouette: a small beige box with a **BLACK front face**, a horizontal slot with a
  fold-down door, a small red IN USE lamp, and the rainbow Apple logo on the face.
- **The rainbow Apple stripes** (green, yellow, orange, red, purple, blue, top to bottom)
  on a recessed badge at the wedge's front-left, with `//e` beside it.
- **Colour: beige, not grey.** Wikipedia records the 1984 case revision as *"dyed plastic
  mold in a slightly darker beige"* with *"more-professional-looking print on darker
  keycaps (small black lettering, versus large white print)"*. **The light-grey machine is
  the 1987 "Platinum" IIe** — a different, later object. Stickybear's 1982–88 run belongs
  to the beige one.
- **Silhouette at 56×80:** beige wedge across the lower third with three short rows of
  darker keycaps; monitor as a beige rectangle above it with a dark inset screen; a narrow
  beige box to the right with a black lower half. Three details survive at that size — the
  **rainbow stripe run**, the **black drive face**, and the **screen colour**.
- **What is on the screen matters:** for Stickybear it is **blue**, which is the line's
  Apple II house palette ([[bear-on-a-blue-screen]]) — not the green phosphor of the mono
  monitor in the photograph below.

### A period beige PC (late 1980s – mid 1990s) — draw at VGA fidelity

The honest object for an MS-DOS game — [[gizmos-and-gadgets]] (1993) is the case this was
sourced for. **This section replaces an earlier `[unverified]` note** that recorded no
description at all and warned against inventing one.

- **A horizontal desktop case with the CRT sitting ON TOP of it**, and the keyboard on the
  desk in front. This is the defining arrangement — a tower beside the desk is a different,
  later look.
- **Everything is the same beige**: case, monitor, keyboard.
- **The front face carries the drives**, grouped to one side: a **wide 5.25-inch slot** and
  a **smaller 3.5-inch slot**, with a small power lamp beside them. Vents or a badge fill
  the rest of the face.
- **Silhouette at 56×80:** three stacked beige blocks — monitor, case, keyboard — with two
  dark horizontal slots of *different widths* on the case's front. The differing slot
  widths are what say "floppy era" rather than "any beige box".
- **Honest limit:** the photograph below is a mid-1990s Packard Bell, not a specifically
  1993 machine, and it carries CD-ROM and Windows 95 markers that a 1993 DOS scene should
  not. What it verifies is the **form** — horizontal case, monitor on top, keyboard in
  front, drives on the front face — not the model.

### A modern sim rig — **[unverified] / under-documented**

The sim terminus wants a **wheel-and-pedal rig**, and no description of one was sourced. (The
period-PC half of this gap was **closed 2026-09-13** — see the section above.) **Do not invent
hardware detail from feel** — the same failure mode that produced the "no cabinet exists" error.

The one thing that *is* established: [[f1-25]] and modern sims are genuinely played on **wheel
and pedal rigs**, and force feedback is a documented consumer technology from the late 1990s
(`research/racing-games-by-era.md` §11). A wheel clamped to a desk in front of a monitor is a
real object and a safe thing to draw.

## Media

Reference photographs, stored in the vault so the drawing claims above stay auditable
(research/WIKI.md §Media). Both are freely licensed and safe to redistribute.

### `apple-iie-system.jpg`
![An Apple IIe system: the beige wedge with the keyboard built in, the monitor sitting on top, and the Disk II drive alongside with its black front face](../media/console-hardware-silhouettes/apple-iie-system.jpg)
- **Shows:** the whole arrangement in one frame — wedge, monitor-on-top, Disk II with its
  black face, slot and rainbow logo, and the recessed `apple //e` badge. This image is the
  direct source of the silhouette notes above.
- **Source:** [File:Iie-system.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Iie-system.jpg)
- **Author:** Pratyeka (own work, 2016-12-18)
- **Licence:** CC BY-SA 4.0
- **Retrieved:** 2026-09-13

### `nes-console-and-controller.jpg`
![A Nintendo Entertainment System: a light-grey two-tone box with a flat front-loading cartridge door, a dark stripe on the right, red Nintendo lettering on the lower band, beside its grey controller with a black cross D-pad and two red buttons](../media/console-hardware-silhouettes/nes-console-and-controller.jpg)
- **Shows:** the details that survive at 56×80 and that the Level 9 station is drawn from —
  two-tone grey, the flat cartridge door, the dark right stripe, the red wordmark run, and the
  controller's black cross plus two red buttons. Drawn from this frame, not from the text
  notes above, per journal F29.
- **Source:** [File:NES-Console-Set.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:NES-Console-Set.jpg)
- **Author:** Evan-Amos
- **Licence:** Public domain
- **Retrieved:** 2026-09-13

### `sega-genesis-model-1.jpg`
![A North American Sega Genesis Model 1: a low black console with a ridged vent strip, a circular raised cartridge bay carrying a red GENESIS 16-BIT badge, and its controller](../media/console-hardware-silhouettes/sega-genesis-model-1.jpg)
- **Shows:** the circular cartridge bay and the red GENESIS / 16-BIT badge — the two details
  that survive at cabinet scale.
- **Source:** [File:Sega-Genesis-Mod1-Set.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Sega-Genesis-Mod1-Set.jpg)
- **Author:** Evan-Amos
- **Licence:** Public domain
- **Retrieved:** 2026-09-13

### `super-nintendo-na.jpg`
![A North American Super Nintendo: a light grey boxy console with a darker recessed top panel and two purple sliding switches on the front](../media/console-hardware-silhouettes/super-nintendo-na.jpg)
- **Shows:** the two purple sliding switches, which are the fastest identifier at any size.
- **Source:** [File:Nintendo-Super-NES-Console-FL.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Nintendo-Super-NES-Console-FL.jpg)
- **Author:** Evan-Amos
- **Licence:** Public domain
- **Retrieved:** 2026-09-13

### `game-boy-pocket.jpg`
![A Game Boy Pocket: a slim silver-grey portrait handheld with a grey-green LCD high on the face, a black cross D-pad lower-left and two round buttons lower-right](../media/console-hardware-silhouettes/game-boy-pocket.jpg)
- **Shows:** the exact model `act3.md` names for Level 15, and its portrait proportions.
- **Source:** [File:Game-Boy-Pocket-FL.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Game-Boy-Pocket-FL.jpg)
- **Author:** Evan-Amos
- **Licence:** Public domain
- **Retrieved:** 2026-09-13

### `nintendo-64.jpg`
![A Nintendo 64: a dark charcoal console with curved organic edges, a cartridge slot on top, and four controller ports in a curved row across the front](../media/console-hardware-silhouettes/nintendo-64.jpg)
- **Shows:** the four front ports in their curved row — the count that distinguishes it from
  every two-port console on this page.
- **Source:** [File:Nintendo-64-Console-FL.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Nintendo-64-Console-FL.jpg)
- **Author:** Evan-Amos
- **Licence:** Public domain
- **Retrieved:** 2026-09-13

### `sony-playstation-scph-1000.jpg`
![A Sony PlayStation SCPH-1000: a flat wide GREY console with a round CD lid on top, beside its grey controller](../media/console-hardware-silhouettes/sony-playstation-scph-1000.jpg)
- **Shows:** that it is **grey**, and the round CD lid. Stored partly as standing evidence
  against the black-PlayStation error this wiki already had to correct once.
- **Source:** [File:PlayStation-SCPH-1000-with-Controller.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:PlayStation-SCPH-1000-with-Controller.jpg)
- **Author:** Evan-Amos
- **Licence:** Public domain
- **Retrieved:** 2026-09-13

### `beige-desktop-pc-monitor-on-top.jpg`
![A beige horizontal desktop PC with the CRT monitor sitting on top of the case and the keyboard in front, drive slots on the case's front face](../media/console-hardware-silhouettes/beige-desktop-pc-monitor-on-top.jpg)
- **Shows:** the form this section describes — horizontal case, monitor on top, keyboard in
  front, drives on the front face. **Caveat, repeated from above:** it is a mid-1990s
  Packard Bell with CD-ROM and Windows 95 on the desk, so it verifies the arrangement, not
  a 1993 model.
- **Source:** [File:Old packard bell pc.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Old_packard_bell_pc.jpg)
- **Author:** Spacekid (own work, 2003-07-21)
- **Licence:** CC0 (public domain dedication)
- **Retrieved:** 2026-09-13

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
7. [Apple IIe — Wikipedia (raw wikitext)](https://en.wikipedia.org/w/index.php?title=Apple_IIe&action=raw) — the 1984 case revision as "dyed plastic mold in a slightly darker beige" with "darker keycaps (small black lettering, versus large white print)"; the January 1987 "Platinum IIe" colour change to light grey; the recessed metal ID badges showing the Apple logo with "//e". **[fetched]**
8. [File:Iie-system.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Iie-system.jpg) and [File:Old packard bell pc.jpg](https://commons.wikimedia.org/wiki/File:Old_packard_bell_pc.jpg) — the two reference photographs, stored in this vault under `wiki/media/console-hardware-silhouettes/` with their licences. Every silhouette detail above was read off these frames. **[images viewed]**
9. [File:NES-Console-Set.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:NES-Console-Set.jpg) — Evan-Amos's public-domain hardware photography; the reference for the Level 9 console station. **[image viewed]**
10. [File:Sega-Genesis-Mod1-Set.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Sega-Genesis-Mod1-Set.jpg) — Evan-Amos, public domain. North American Genesis Model 1. **[image viewed]**
11. [File:Nintendo-Super-NES-Console-FL.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Nintendo-Super-NES-Console-FL.jpg) — Evan-Amos, public domain. NA Super Nintendo; the purple switches. **[image viewed]**
12. [File:Game-Boy-Pocket-FL.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Game-Boy-Pocket-FL.jpg) — Evan-Amos, public domain. The Game Boy Pocket named in act3.md. **[image viewed]**
13. [File:Nintendo-64-Console-FL.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Nintendo-64-Console-FL.jpg) — Evan-Amos, public domain. Four front controller ports. **[image viewed]**
14. [File:PlayStation-SCPH-1000-with-Controller.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:PlayStation-SCPH-1000-with-Controller.jpg) — Evan-Amos, public domain. Confirms the original PlayStation is grey. **[image viewed]**
