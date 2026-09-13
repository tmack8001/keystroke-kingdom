---
title: Gran Turismo
type: entity
tags: [video-game-history, game, console, racing, simulation, act7, cabinet, history-card]
sources: 10
verified: 2026-09-13
---

Gran Turismo (Polys Entertainment / Sony, December 23 1997, PlayStation) is the game that took
"The Real Driving Simulator" mainstream — five years and roughly $5 million under **Kazunori
Yamauchi**, 140 cars, physics reviewers called "sophisticated and believable," and 10.85 million
copies, making it the best-selling PlayStation title.

## In this game

The simulation-turn station in the recommended **Act 7 — Speed / Racing** spine
(`research/racing-games-by-era.md` §7, §15). It matters here for one mechanic above all: the
**licence tests** — a structured, graded curriculum of driving exercises that *teach* braking
points and racing lines and gate content behind them. That is a pedagogy system living inside a
racing game, and it is the closest thing in the genre's history to what Keystroke Kingdom already
does. **But it grades gold / silver / bronze / FAIL, and a fail withholds the car.** Take the
curriculum; delete the fail state. Era: [[early-3d-era]].

## The facts

- Developer: **Polys Entertainment**, with assistance from Cyberhead — **re-established as
  Polyphony Digital in April 1998**, *after* the game shipped. (Crediting the 1997 release to
  "Polyphony Digital" is a common small error.)
- Credits: **Kazunori Yamauchi** director and co-producer, with Shuhei Yoshida co-producing.
- Releases: **December 23 1997** (Japan), **May 8 1998** (Europe), **May 12 1998** (North
  America), PlayStation.
- Development: five years and a ~$5 million budget. Yamauchi: *"I would wake up at work, go to
  sleep at work,"* estimating he was home about four days a year during production.
- Content: **140 cars and 11 tracks** (plus reversed variants).
- **Signature mechanic — the licence tests:** a Simulation Mode examination system (licences B, A
  and International A), each comprising a series of focused driving exercises graded **gold,
  silver, bronze or fail**, unlocking cars and events. Some reviewers found the tests "more
  difficult than winning the race which that license unlocks."
- Reception and sales: 96/100 Metacritic; Console Racing Game of the Year at the 2nd Annual
  Interactive Achievement Awards; **10.85 million copies shipped worldwide**, the best-selling
  PlayStation title (2.55M Japan, 4.3M Europe, 3.99M North America).
- Tagline: **"The Real Driving Simulator."**
- Rating: the series is consistently **ESRB E for Everyone**.

## The cabinet build (Act 7 track spec) — added 2026-09-13

*Everything a `js/speedway/tracks/gran-turismo.js` renderer needs. This is the act's
**simulation turn** and the tier where a car stops being a sprite and becomes a model.*

**Render tier: `ps1`.** `modelledMesh` on top of the flat/textured polygon vocabulary. The kit
projects vertex meshes and painter-sorts the faces — which is, almost exactly, what the real
console did.

**Rendering technique, precisely — and the artefacts ARE the era.**
The PlayStation's look is defined by four hardware limitations, and a Gran Turismo scene that
lacks them looks wrong:
1. **Affine texture mapping, no perspective correction.** The GPU interpolates UVs from screen
   (x, y) only, ignoring depth. Result: textures **swim and warp** across large polygons — the
   famous wobble. The kit's `texturedPoly` is deliberately affine for this reason.
2. **No Z-buffer.** Depth is resolved with an **Ordering Table** — a linked list sorting whole
   polygons by a *single average depth*, painter's-algorithm style. Result: visible **polygon
   pop-through and pop-in** when two surfaces are close.
3. **Fixed-point vertex snapping.** The GTE has **no floating-point unit**; vertices are snapped
   to integer screen positions with no sub-pixel precision. Result: **jitter** — geometry
   visibly shivers as it moves.
4. **Hardware dithering** (24-bit / 15-bit) applied automatically, producing a characteristic
   **stippled gradient** that cannot be switched off.
Plus **Gouraud shading** (per-vertex colour interpolated across a face — which is why PS1
characters can look smooth with no texture at all) and **no native mip-mapping**, so developers
hand-stored multiple texture resolutions. Native output is **4:3**; GT1 uses **nearest-neighbour /
minimal texture filtering** — the "bilinear" look is an *emulator enhancement*, not the original.

**The one-line direction:** *[[daytona-usa]] is smooth and stable; Gran Turismo is sharper,
denser and slightly unstable.* That regression in smoothness is real and is the point — home
hardware got more detailed and more *ambitious* before it got cleaner.

**Road / track geometry the player saw.** Real-world-style circuits and city courses — **11
tracks (plus reversed variants) and 140 cars** — driven in behind-the-car and bumper views, with
cars as **modelled meshes** carrying licensed shapes rather than generic racers. Tracks have
genuine elevation, run-off, armco, tyre walls, grandstands, tunnels and trackside advertising
hoardings. This is the first station in the act where the world is **built** rather than
suggested: the road is a ribbon of textured polygons with kerbs modelled as geometry, not
painted on.

**Ghost cars: not documented here.** A targeted check of the Wikipedia article for "ghost" and
"time trial" found **neither**; what reviewers praised was the **replay mode** ("multiple camera
views… likening the quality to live action video"). GT1's self-measurement instrument is the
**licence test**, not a ghost. Absence of mention is not proof of absence — treat "GT1 had no
ghost" as **[unverified]** and don't assert it either way. See [[ghost-car]].

**The signature visual moment.** The **garage / car-selection screen** — a single licensed road
car rotating slowly on a dark turntable under a spotlight, with its specifications listed
beside it. Gran Turismo's most famous image is a car **standing still**, and that is exactly
right for the act's slowest, most deliberate station. In motion, the signature is the
**replay camera**: a trackside shot of your own lap, cut like television.

**Completion / celebration state.** Two layers:
- **Arcade Mode** — win and you **unlock more cars and more tracks**. The reward is *more world*.
- **Simulation Mode** — winning a championship earns **credits, trophies and a prize car**
  (all championship events except the Gran Turismo World Cup award a prize car for finishing
  first overall). The celebration is an **acquisition**, not a podium.
- And the thing Act 7 actually cares about: **the licence tests.** Licences B, A and
  International A, each a series of short, focused driving exercises that *teach* braking
  points and racing lines, graded **gold / silver / bronze / FAIL**, gating cars and events
  behind them. Reviewers found the tests harder than the races they unlock.

**Gran Turismo is the closest thing in the entire genre to what Keystroke Kingdom already is:
a curriculum with a celebration attached.** Take the whole structure — short graded exercises,
each teaching one skill, unlocking the next thing. **Delete exactly one element: the FAIL.**
Bronze-and-above only; every attempt is a pass at some tier. That is the single most valuable
design transplant in this research corpus, and it needs one word removed to become
One-Rule-legal.

**Punishment mechanics to strip** (format matching `racing-games-by-era.md` §12):

| What the game did | Why it violates the One Rule | Reframe |
|---|---|---|
| Licence tests graded gold/silver/bronze/**FAIL**; a fail **withholds the car** | A graded, failable curriculum gate — the closest thing to punishing a *learner* in this whole act | **Take the curriculum, delete the grade.** Bronze is the floor; every attempt passes |
| Finishing position decides prize cars and progression | Placement as progression | Progression comes from *doing the thing*, never from beating a field |
| Credits/economy — you can be too poor to continue | A resource wall | No economy. Nothing is withheld |
| Tests reportedly harder than the races they unlock | Difficulty spike at the teaching layer | The teaching layer is the **gentlest** layer, always |

**Cabinet art notes.** No arcade cabinet exists — PlayStation, December 23 1997 (Japan) /
May 1998 (EU/NA). The faithful object is **a PlayStation and a television**, or the **jewel-case
disc**, matching how Act 4 already renders the PS1 era. If the act wants a *machine* for this
station, the honest one is not a cabinet at all but **a wheel-and-pedal rig in front of a TV** —
period-correct for 1998 consumer sim racing (see `racing-games-by-era.md` §11 on the Logitech
WingMan Formula line, whose exact model years are flagged **[unverified]** and must not go on a
card).

**Era-appropriate palette (authoring recommendation, derived).** Late-90s photographic
restraint, not arcade candy. Author as: **overcast or hazy daylight sky**, **desaturated grey
asphalt** with worn white lines, **olive/khaki grass** rather than emerald, **red-white kerbing**,
concrete-grey barriers, and cars in **real automotive paint colours** — silver, deep metallic
blue, British racing green, plain white — rendered with **Gouraud gradients and visible
dithering** rather than flat fills. The UI half of the palette is the opposite: **near-black
backgrounds with fine light-grey type and a single accent** (the specification-sheet aesthetic).
The whole station should read *serious* — it is the moment the act stops playing and starts
studying.

## References

1. [Gran Turismo (1997 video game) — Wikipedia](https://en.wikipedia.org/wiki/Gran_Turismo_(1997_video_game)) — Polys Entertainment (re-established as Polyphony Digital in April 1998) with Cyberhead; Kazunori Yamauchi director/co-producer and Shuhei Yoshida co-producer; December 23 1997 Japan, May 8 1998 Europe, May 12 1998 North America; five-year development and $5M budget with Yamauchi's "wake up at work" quote; 140 cars and 11 tracks; the Simulation Mode licensing examinations and reviewers finding them harder than the races they unlock; 10.85 million copies and best-selling PlayStation title with the regional breakdown; 96 Metacritic and the Interactive Achievement Award. **[fetched]**
2. [Origin Story: Kazunori Yamauchi & Shuhei Yoshida Look Back at Gran Turismo's Inception — PlayStation.Blog](https://blog.playstation.com/2017/10/13/origin-story-kazunori-yamauchi-shuhei-yoshida-look-back-at-gran-turismos-inception/) — first-party Sony account of the game's five-year origin and the team's founding. *(search result only, not fetched)*
3. [Gran Turismo — ESRB rating record](https://www.esrb.org/ratings/3213/gran-turismo/) — institutional ratings-board record: **E for Everyone**. *(search result only, not fetched)*
4. [How PlayStation Graphics & Visual Artefacts Work — Pikuma](https://pikuma.com/blog/how-to-make-ps1-graphics) — the technical reference for every PS1 artefact listed above: the GPU as "a 2D rasterization engine"; **affine texture mapping** producing the wobble because there is no per-pixel depth; the **Ordering Table** linked list replacing a Z-buffer and sorting whole polygons by a single average depth (hence pop-in); **fixed-point vertex snapping** to integer screen coordinates with no sub-pixel precision; **Gouraud shading** via per-vertex colour interpolation; automatic **24-bit/15-bit dithering**; and the absence of native mip-mapping. **[fetched]**
5. [DuckStation Settings for Gran Turismo (PS1 Emulator) — Project Cerbera](https://projectcerbera.com/gt/1/duckstation/) — enhancement-by-enhancement account of what GT1 does *natively*: 4:3 aspect (widescreen is a modification not in the original); bilinear filtering is an **added** enhancement, so the original used nearest-neighbour/minimal filtering; native dithering benefits from "Scaled Dithering"; and "wobbly geometry" is present, needing PGXP geometry correction to remove. **[fetched]**
6. [Why Did the PlayStation 1 Have Wobbly Graphics? — How-To Geek](https://www.howtogeek.com/why-did-the-playstation-1-have-wobbly-graphics/) — established-tech-press explanation corroborating the GTE's fixed-point arithmetic, the lack of an FPU, and coordinate snapping as the cause of vertex jitter. *(search result only, not fetched)*
7. [PlayStation 1 Affine Texture Mapping in Shader Code — Daniel Ilett](https://danielilett.com/2021-11-06-tut5-21-ps1-affine-textures/) — implementation-level description of PS1 affine UV interpolation ignoring the z-axis, useful as a direct model for the kit's `texturedPoly`. *(search result only, not fetched)*
8. [Building a PS1 style retro 3D renderer — David Colson](https://www.david-colson.com/2021/11/30/ps1-style-renderer.html) — a from-scratch reconstruction of the PS1 pipeline, corroborating the same artefact set. *(search result only, not fetched)*
9. [Prize Car — Gran Turismo Wiki](https://gran-turismo.fandom.com/wiki/Prize_Car) — the series' prize-car mechanic: all championship events except the Gran Turismo World Cup award a prize car for finishing first overall. Community wiki, corroborating only. *(search result only — fandom.com returned HTTP 402 on fetch this session; not read)*
10. [Gran Turismo (PlayStation)/Arcade Mode — Gran Turismo Wiki](https://gran-turismo.fandom.com/wiki/Gran_Turismo_(PlayStation)/Arcade_Mode) — Arcade Mode's structure: free choice of car and track, with wins unlocking further cars and tracks. Community wiki, corroborating only. *(search result only, not fetched)*

## Corrections from citation pass (2026-09-13)

1. **"Gran Turismo looked smooth."** It looked *detailed*, not smooth. GT1 renders with
   **nearest-neighbour/minimal texture filtering** (bilinear is an emulator enhancement),
   **affine texture warping**, **vertex jitter** and **hardware dithering**. A Gran Turismo
   scene drawn cleaner than [[daytona-usa]] is historically backwards: Model 2 had **texture
   filtering** in 1994 and the PlayStation did not.
2. **"Gran Turismo ends on a podium."** The documented celebrations are an **unlock** (Arcade
   Mode) and a **prize car plus credits and trophies** (Simulation Mode). The reward is an
   acquisition, not a ceremony. No podium sequence was located this pass.
3. **Prize-car and Arcade-Mode detail is community-wiki sourced** (fandom, unfetched — 402).
   The licence-test system and the 140-cars/11-tracks figures are the Wikipedia-sourced,
   fetched facts and should carry any card text.
