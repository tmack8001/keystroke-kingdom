---
title: Virtua Racing
type: entity
tags: [video-game-history, game, arcade, racing, act7, cabinet]
sources: 8
verified: 2026-09-13
---

Virtua Racing (Sega AM2, August 1992), directed by Yu Suzuki and designed by Toshihiro Nagoshi,
is the game that made real-time 3D polygon racing *look good enough to matter* — 6,500 flat-shaded
polygons per frame on the Sega Model 1 — and introduced the four-camera "V.R. View System" now
universal in racing games. It was **not** the first 3D-polygon racing game.

## In this game

The flat-shaded-polygon step in the recommended **Act 7 — Speed / Racing** spine
(`research/racing-games-by-era.md` §6, §15). Its look — bright solid-colour facets, **no textures
at all** — is visually distinct from both the Mode 7 of [[f-zero]] before it and the
texture-mapped [[ridge-racer]] after it, which is exactly why the hub doc insists that "3D" is
three different rendering steps rather than one. Related: [[early-3d-era]], [[super-scaler]]
(the pseudo-3D approach it superseded).

## The facts

- Developer: **Sega AM2**. Director **Yu Suzuki**, artist/designer **Toshihiro Nagoshi**,
  composer Takenobu Mitsuyoshi.
- Release: **August 1992** (Japan arcade), **October 1992** (North America).
- Hardware: the **Sega Model 1**, developed internally at Sega between 1990 and 1991. Initially
  rendered **6,500 polygons per frame**, at roughly 30 fps.
- **Correction to a very common claim:** Virtua Racing was **not** the first racing game to use
  3D polygons — **Winning Run** (Namco, 1988) and **Hard Drivin'** (Atari Games, February 1989)
  both precede it. Virtua Racing's defensible first is *polygon count, frame rate and scene
  complexity* — it is where polygon racing became immersive rather than merely novel.
- Innovation: the **"V.R. View System"** — four selectable camera angles switchable during play,
  subsequently adopted across Sega's racing portfolio and then the genre.
- Cabinets: Twin (two-player), upright single-player, a DX motion variant, and **Virtua
  Formula** — full-motion hydraulic rigs linking **up to eight machines over fibre optic**.
- Recognition: among the highest-grossing arcade games of 1992–93 in Japan and North America;
  won the AMOA award for Most Innovative New Technology.
- **Punishment mechanics:** the arcade coin contract — a countdown timer with checkpoints, and
  the race ending when the clock reaches zero.

## The cabinet build (Act 7 track spec) — added 2026-09-13

*Everything a `js/speedway/tracks/virtua-racing.js` renderer needs. Companion spec:
[[daytona-usa]] — the two are a deliberate **pair**, and the visible difference between them
is the whole proof of the era render kit's ladder (see "The flatpoly/texpoly line" below).*

**Render tier: `flatpoly`.** This is the tier that has `flatPoly` and `painterSort` and
**does not have `texturedPoly`**. That absence is historically correct, not a limitation:
the Sega Model 1 drew **untextured, flat-shaded facets**. A Virtua Racing surface is one
solid colour with a hard colour step at every edge to the next facet. It physically cannot
carry a picture, a logo, a word, or a road grain.

**Rendering technique, precisely.**
- Hardware: **Sega Model 1**, developed in-house 1990–91; Virtua Racing was its launch title
  and began life as a *proof-of-concept* for the board that was too good not to ship.
- Throughput: **~6,500 polygons per frame at roughly 30 fps** (Wikipedia), which a separate
  technical analysis frames as **"up to 180,000 flat-shaded PPS in-game… at 30 frames
  per-second," full v-sync**. Those two figures agree (6,500 × 30 ≈ 195k) and should be
  quoted together, never separately as if they were rival claims.
  - *Do not confuse:* the same analysis gives the **Mega Drive port** a ~6,500 **polygons
    per second** budget. 6,500/frame (arcade) and 6,500/second (Mega Drive) are different
    numbers that look identical. This is exactly the fluent-error class this project keeps
    catching.
- Shading: **flat** — one light value per facet, no per-vertex interpolation, no texture.
- Visibility: painter's-algorithm face sorting, the era's only solution.
- Video: a commonly circulated Model 1 spec sheet gives **496×384 with 65,536 colours**
  at 60 Hz, but the sources carrying it are community compilations, so treat the exact
  numbers as **[unverified]**. What *is* solidly sourced is the DX cabinet's aspect ratio
  (below) and the flat-shaded, untextured look.

**Road / track geometry the player saw.**
- **Three circuits of rising difficulty: Big Forest** (beginner, an amusement park beside
  the track — the ferris wheel is its landmark), **Bay Bridge** (intermediate, a bridge
  structure), **Acropolis** (expert, tight hairpins). Open-wheel Formula cars, not stock cars.
- The road is a **closed circuit built from real polygons in a real 3D world**, not a
  scaled-sprite road. That is the break from [[hang-on]] and [[pole-position]]: the horizon
  is wherever the camera is pointing, corners have actual banking and elevation, and scenery
  objects have volume and occlude each other.
- **The "V.R. View System"** — four camera angles the player switches **during the race**.
  This is Virtua Racing's genuine first, and it is the feature most worth reproducing: it is
  the moment a racing game stopped being a fixed viewpoint and became a *camera*.

**The signature visual moment.** An open-wheel car rendered as a couple of dozen bright,
solid, untextured facets — the huge rear wing reading as two flat trapezoids — with every
facet edge a visible hard seam, against a plain-colour sky and a plain-colour ground. Then
the player taps the view button mid-corner and the whole world swings to a new camera.
Nothing on screen has a texture on it; the beauty is the *geometry itself*. (A retrospective
puts it well: "the rawness of its bare flat-shaded polygons possess an 'honest' quality."
That is a critic's framing, not a fact — but it is the right art direction note.)

**Completion / celebration state.** Honest answer: **not documented in any source fetched
this pass.** The documented end-of-race machinery is the arcade coin contract (timer,
checkpoints, race ends at zero). Treat any specific Virtua Racing finish-line celebration as
**[unverified]** until sourced. Two safe anchors the act can use instead: the earliest
verified on-screen **checkered flag** is [[pole-position]] (1982), and [[daytona-usa]]'s
Victory Lane (1994) is the documented staged celebration of this hardware family — see the
victory-research findings carried on [[monaco-gp]] and [[f-zero]].

**Punishment mechanics to strip** (format matching `racing-games-by-era.md` §12):

| What the cabinet did | Why it violates the One Rule | Reframe |
|---|---|---|
| Countdown timer; checkpoints buy more time; race **ends** at zero | The coin contract — time consumes the player | Typing *produces* road; nothing consumes it |
| Finishing position / rank against the AI field | Placement is a ranked loss condition | The field is alive and fallible; it is never scored against the player |
| Collisions and spins costing time | Mistake → lost progress | The field spins comically and recovers; the player's car has no failure state |

**Cabinet art notes** (faithful, never gimmicky — the standing project rule). Four documented
machines, and they are *physically* different objects:
- **Twin** — the standard two-player cabinet, **force-feedback steering**, 25-inch monitors in
  North America and 29-inch Nanao monitors elsewhere.
- **Upright** — single-player.
- **DX (Deluxe)** — single-player with a **16:9 widescreen monitor**, described by Wikipedia as
  **the first arcade game to use that aspect ratio**; **six airbags** for haptic feedback and
  pneumatic steering cylinders.
- **Virtua Formula** — a full-motion hydraulic rig with a **Formula One replica cockpit** and a
  **50-inch screen**, linkable **up to eight machines over fibre optic**.

If Act 7 ever draws a Virtua Racing cabinet, the DX widescreen or the Virtua Formula rig is the
honest, striking choice; both are genuinely strange-looking machines and need no invention.

**Era-appropriate palette (authoring recommendation, derived — not a sourced palette record).**
Model 1 games are described as "bright, crisp, colourful." Author as **saturated flat fills with
no gradients and no dithering**: a single flat sky blue, a single flat grass green, a mid-grey
road with a pure-white edge line, and cars in unmixed primaries (red, yellow, cobalt, white).
Every surface is ONE colour; depth reads from facet edges and from shade steps between facets of
the same object, never from a gradient. The `flatpoly` tier's `freeColor: true` allows any CSS
colour — the discipline is self-imposed: **no texture, no gradient, no blur.**

### The flatpoly/texpoly line — what a player VISIBLY sees between this and [[daytona-usa]]

Five differences, in the order a child would notice them:
1. **Pictures on things.** Virtua Racing's surfaces are blank colour. Daytona's surfaces carry
   **bitmap images** — asphalt has grain, grandstands have a painted crowd, the car has livery.
   Virtua Racing literally cannot show a logo on a wall; Daytona's Model 2 is built to.
2. **Softness.** Daytona applies **texture filtering** (plus texture anti-aliasing and trilinear
   filtering), so a texture *blurs smoothly* as it scales toward the camera. Virtua Racing has
   nothing to filter. In kit terms: `bilinear` first exists at `texpoly`, and every tier below
   composites with `imageSmoothingEnabled = false`.
3. **Edges.** Flat shading means every Virtua Racing facet boundary is a hard colour step you can
   count. Daytona's smoother shading over textured surfaces softens those seams.
4. **Density.** ~6,500 polys/frame (Model 1) vs **up to 300,000 texture-mapped polygons per
   second** on Model 2, "nearly double that of the previous Model 1" — more objects, more
   scenery, more crowd.
5. **Scale of the field.** Virtua Racing's world is a clean circuit; Daytona starts you **last
   of up to 40 cars**. The screen is simply fuller.

**The one-sentence version for a theme author:** *Virtua Racing is shapes; Daytona USA is
shapes with photographs stretched over them, and the photographs go soft as they come at you.*

## References

1. [Virtua Racing — Wikipedia](https://en.wikipedia.org/wiki/Virtua_Racing) — Sega AM2; Yu Suzuki director, Toshihiro Nagoshi artist, Takenobu Mitsuyoshi composer; August 1992 Japan / October 1992 North America; Sega Model 1 developed 1990–91 and 6,500 polygons per frame; explicit statement that Namco's Winning Run (1988) and Atari Games' Hard Drivin' (1989) predate it in 3D-polygon use; the V.R. View four-camera system and its later adoption; the three circuits Big Forest / Bay Bridge / Acropolis with the amusement park, bridge and hairpins; the Twin cabinet's force-feedback steering and 25-inch NA / 29-inch Nanao monitors; the DX cabinet's 16:9 widescreen monitor as the first arcade game to use that aspect ratio, its six airbags and pneumatic steering cylinders; Virtua Formula's hydraulic full-motion F1 replica cockpit, 50-inch screen and up-to-eight fibre-optic linking. **[fetched]**
2. [Virtua Racing — Museum of the Game (arcade-museum.com/KLOV)](https://www.arcade-museum.com/Videogame/virtua-racing) — institutional arcade record for the Sega cabinet. *(search result only — arcade-museum.com returned HTTP 403 for every fetch attempt this session; retained as a pointer, not read)*
3. [Virtua Racing (1992) — MobyGames](https://www.mobygames.com/game/8131/virtua-racing/) — corroborating credits and release metadata. *(search result only, not fetched)*
4. [Retro Tech Analysis: Virtua Racing (MD vs 32X) — IQGamer](http://imagequalitymatters.blogspot.com/2011/01/retro-tech-analysis-virtua-racing-md-vs.html) — technical analysis stating the arcade Model 1 version delivered "up to 180,000 flat-shaded PPS in-game" at "30 frames per-second" with full v-sync, and giving the Mega Drive port's ~6,500 PPS and the 32X's ~50,000 PPS for contrast (the source of the 6,500-per-frame vs 6,500-per-second confusion flagged above). **[fetched]**
5. [New FPGA Model 1 Emulator Core Runs Sega's Virtua Racing With Remarkable Precision — Time Extension](https://www.timeextension.com/news/2026/09/new-fpga-model-1-emulator-core-runs-segas-virtua-racing-with-remarkable-precision) — games-journalism description of the Model 1 look: flat-shaded 3D models that were "bright, crisp, colorful, fast, and plentiful," 60 FPS board capability, multiplayer and multiple camera angles; Model 1 developed 1990–92 as Sega's first board for flat-shaded polygonal 3D, with Virtua Racing as launch title and original proof-of-concept. *(search result only, not fetched)*
6. [Virtua Racing: Sega's 1992 Powerhouse Arcade Classic — Retroheadz](https://www.retroheadz.com/retro-games/virtua-racing-powerhouse-arcade/) — retrospective naming the three courses ("Big Forest," "Bay Bridge," "Acropolis") and describing the flat-shaded polygon look. **Note:** this source also repeats the false "first racing game fully rendered with shaded, filled polygon graphics" claim that Wikipedia itself contradicts (Winning Run 1988, Hard Drivin' 1989) — used only for the course names and the visual description. *(search result only, not fetched)*
7. [Sega Ages 2500 Series Vol. 8: Virtua Racing -FlatOut- — Kimimi The Game-Eating She-Monster](https://kimimithegameeatingshemonster.com/2022/11/24/sega-ages-2500-series-vol-8-virtua-racing-flatout/) — the "rawness of its bare flat-shaded polygons possess an 'honest' quality" framing quoted above as an art-direction note (a critic's judgement, labelled as such). *(search result only, not fetched)*
8. [Model 1 — HFS DB](https://db.hfsplay.fr/systems/29689-sega-model-1?lang=en) — hardware database record for the Sega Model 1 board; the circulating 496×384 / 65,536-colour figures trace to compilations of this kind and are marked **[unverified]** above. *(search result only, not fetched)*

## Corrections from citation pass (2026-09-13)

1. **"Virtua Racing rendered 6,500 polygons per second."** No — **per frame**, at ~30 fps
   (≈180,000–195,000/sec). 6,500 **per second** is the *Mega Drive port's* figure. Two real
   numbers that look like one.
2. **"Virtua Racing was the first racing game fully rendered with filled polygons."** Still
   false, and still circulating (a retrospective fetched this pass repeats it). Winning Run
   (Namco, 1988) and Hard Drivin' (Atari Games, February 1989) precede it, per Wikipedia's own
   Virtua Racing article. The defensible first is **polygon count, frame rate and scene
   complexity** — and, separately and solidly, **the four-camera V.R. View System** and the
   **DX cabinet's 16:9 screen**.
3. **Sega Model 1 resolution/colour figures are not institutionally sourced.** Demoted to
   **[unverified]**; the previously implied precision was community-compilation grade.
