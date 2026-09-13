---
title: Pole Position
type: entity
tags: [video-game-history, game, arcade, racing, act7, cabinet, history-card]
sources: 8
verified: 2026-09-13
---

Pole Position (Namco, September 16 1982; licensed to Atari for North America) invented the
*picture* of a racing game — the third-person rear view down a receding road whose vanishing
point sways side to side through corners, drawn with full-colour scaling sprites — and was the
first racing video game built on a **real** racing circuit, Fuji Speedway.

## In this game

A core station in the recommended **Act 7 — Speed / Racing** spine
(`research/racing-games-by-era.md` §2, §15), sitting between [[monaco-gp]]'s 1979 overhead view
and [[hang-on]]'s 1985 [[super-scaler]] hardware. It is the most historically important
pre-1985 racing game and the one a parent will recognise instantly. Its qualifying-lap gate is
also the act's clearest example of a mechanic that **must** be stripped: gating content behind a
speed test is directly opposed to the One Rule. Candidate history card: the first racing game
built from a real race track.

## The facts

- Developer: **Namco**. Published by Namco in Japan/Europe and by **Atari, Inc.** in North
  America and France. Arcade release **September 16 1982** (Japan), **November 30 1982** (North
  America), late 1982 (Europe); home ports 1983–1988.
- Rendering: **scaling sprites** (race cars, roadside signs) over full-colour landscapes, in a
  **pseudo-3D third-person rear perspective**, with the road's vanishing point swaying side to
  side as the player approaches corners.
- Circuit: "the first racing video game to feature a track based on a real racing circuit" —
  **Fuji Speedway**, as configured in 1982.
- Commercial: the most popular coin-operated arcade video game internationally in 1983, and the
  **highest-grossing arcade game in North America in both 1983 and 1984**.
- **Punishment mechanics** (all three need reframing under the One Rule):
  1. A **qualifying lap** — a one-lap time trial that must be beaten *before the player is
     allowed to race at all*; the qualifying time also sets the starting position among seven
     computer opponents.
  2. A **race timer**, with a set allowance at the start and more granted after each lap.
  3. Running onto the grass slows the car; **hitting a roadside billboard destroys it** in an
     explosion, costing a delay while a new car is placed.

## The cabinet build (Act 7 track spec) — added 2026-09-13

*Everything a `js/speedway/tracks/pole-position.js` renderer needs. This is the track that
teaches what the whole genre looked like for a decade.*

**Render tier: `scaler`.** The tier that adds `scaleSprite` and `horizonShift` to the `ttl`
vocabulary and nothing else — no polygons, no alpha, no textures. That is exactly right for
1982: Pole Position has no 3D geometry anywhere in it.

**Rendering technique, precisely.**
- Hardware: the **Namco Pole Position** board, 1982 — a Zilog **Z80** main CPU at ~3.1 MHz with
  **two Z8002** 16-bit secondary CPUs at ~3.1 MHz each, plus a Fujitsu MB8844 microcontroller;
  Namco custom graphics chips (02xx shifter, 03xx playfield data buffer, 04xx address buffer,
  09xx sprite RAM buffer). Sprite data is 4 bits per pixel.
- Video (MAME machine record, the most precise figure located): **256×224 at ~60.61 Hz**,
  horizontal orientation, colour raster.
- Technique: **sprite scaling**. Cars, roadside signs and scenery are single sprites drawn at
  many sizes by distance over full-colour landscape backdrops — a **pseudo-3D, third-person,
  rear perspective**. Nothing is projected; the "3D" is a size table and a horizon.
- Precision point for the renderer: the road is **not** a scaled sprite. It is drawn as
  horizontal bands whose width and colour change per scanline, with the **vanishing point
  swaying side to side as a corner approaches**. `horizonShift` in the kit exists for exactly
  this. The sway is the corner — there is no camera rotation.

**Road / track geometry the player saw.** A closed circuit — **Fuji Speedway in its 1982
configuration**, the first racing video game built from a **real** circuit. Rear view down a
receding ribbon of road with white edge stripes and a red-and-white kerb; **billboards flanking
both sides carrying real brand advertising** (Pepsi, Marlboro, Canon — an early product-placement
landmark, and worth noting that the act should draw *generic* boards rather than reproduce
trademarks). Horizon is a single flat line; the backdrop behind it holds Mount Fuji and the
landscape. Corners are conveyed entirely by lateral horizon sway plus road-band curvature.

**The signature visual moment.** **"Prepare to qualify."** Pole Position was among the first
arcade games to use **speech** for its announcements, and that line, spoken before a single
wheel has turned, is the single most recognisable thing about the cabinet for anyone who was in
an arcade in 1983. Its partner line on success is **"Good driving, you've qualified the race!"**
*(Note: the voice performer is undocumented — several forum threads have tried; do not name
anyone.)* Visually, the moment is the vanishing point sliding hard to one side as a corner
arrives, with a full grid of scaled cars ahead.

**Completion / celebration state.** The run ends one of three ways: time expires during
qualifying, time expires during the race, or **all race laps are completed**. On finishing,
**bonus points are awarded for cars passed and for remaining time on the clock** —
and the victory-research lane has separately established that Pole Position carries the
**earliest verified on-screen checkered flag** in this act's arc (1982, 200 points per unused
second), which matters because the checkered flag is **not** era-accurate for 1979
[[monaco-gp]]. If Act 7 wants a flag, this is the cabinet that earns it.

**Punishment mechanics to strip** (format matching `racing-games-by-era.md` §12):

| What the cabinet did | Why it violates the One Rule | Reframe |
|---|---|---|
| **The qualifying lap gates the race** — beat a time or you never race | Gating content behind a speed test is the most anti-pedagogical mechanic in the genre | "Qualifying" becomes a warm-up drill that **cannot** be failed; the race always follows |
| Qualifying time also **sets your grid position** | Ranks the player before play begins | No grid position exists |
| Race timer topped up per lap | The coin contract | Typing produces road |
| **Hitting a roadside billboard destroys the car in an explosion**, costing a delay | Destruction + lost time for one mistake | Boards are scenery you pass; nothing explodes, nothing is delayed |
| Driving onto the grass slows you | Punishing the edge | The road edge is a **guide**, never a wall (the same inversion Missile Command got at Level 23) |

**Cabinet art notes** (faithful, never gimmicky). Two documented machines:
- **Upright** — steering wheel, gear shifter (hi/lo), and **an accelerator only** (no brake pedal).
- **Environmental / sit-down cockpit** — you climb *in*; wheel, gear shifter, and **separate
  accelerator and brake pedals**. Wikipedia notes the cockpit version was **the more popular of
  the two** during the arcade era, which is the one to draw.
- Marquee/side art in the period is racing-livery graphic art, not cartoon — keep it.

**Era-appropriate palette (authoring recommendation, derived).** Pole Position is where the
genre gets *colour*. Author from the documented "full-colour landscapes": a clear blue sky
graded down to a pale haze at the horizon, **mid-grey road**, **white edge lines**, red-and-white
kerbing, saturated green grass verges, and the field's cars in bold primary reds, yellows and
blues so each is legible at tiny scale. Billboards are flat rectangles in strong single colours —
the brightest objects in the frame after the cars. 4bpp sprites mean **16 colours per sprite,
hard-edged, no blending**; the `scaler` tier's fixed eight-ink palette is a deliberate
simplification of that.

## References

1. [Pole Position — Wikipedia](https://en.wikipedia.org/wiki/Pole_Position) — Namco developer with Atari as the North American publisher; September 16 1982 Japan / November 30 1982 NA / late 1982 Europe; the one-lap qualifying gate and its bonus-points/starting-position role; the per-lap time top-up; grass slowdown and billboard-destroys-the-car; scaling sprites and the swaying vanishing point in a pseudo-3D rear view; "the first racing video game to feature a track based on a real racing circuit" (Fuji Speedway, 1982 configuration); most popular coin-op internationally in 1983 and highest-grossing in NA in 1983 and 1984. **[fetched]**
2. [Racing Game History: Namco's Pole Position (1982) — Podium Life](https://podiumlife.com/racing-game-history-namcos-pole-position-1982/) — genre-history treatment corroborating the real-circuit first, the 1983 grossing record, and the game's decade-long influence on the genre's visual template. *(search result only, not fetched)*
3. [Pole Position — Namco Wiki](https://namco.fandom.com/wiki/Pole_Position) — corroborating publisher, cabinet and port metadata. Fan-maintained; used only as a third corroborating source, never alone. *(search result only — fandom.com returned HTTP 402 on fetch this session; not read)*
4. [Pole Position (World) — MAME machine record, Arcade Database](http://adb.arcadeitalia.net/dettaglio_mame.php?game_name=polepos) — the precise video specification: **256×224 @ 60.606061 Hz, CRT 15 kHz**, horizontal orientation; Namco, 1982; one player; steering-wheel dial plus accelerator pedal, one button, two coin slots; Z80 + 2× Z8002 + Fujitsu CPUs; Namco WSG sound. **[fetched]**
5. [Pole Position — Wikipedia (visual/cabinet pass, 2026-09-13)](https://en.wikipedia.org/wiki/Pole_Position) — "full-colour landscapes with scaling sprites" in a pseudo-3D third-person rear perspective with the vanishing point swaying through corners; trackside billboards carrying real brand advertising (Pepsi, Marlboro, Canon) as early product placement; the two cabinet configurations — upright with accelerator only, environmental/cockpit with separate accelerator and brake pedals, the cockpit being the more popular; the qualifying lap awarding bonus points and setting grid position among seven computer opponents; the run ending on time expiry in either phase or on completing all laps; bonus points for cars passed and remaining time. **[fetched]**
6. [mame/src/mame/namco/polepos.cpp — MAMEdev on GitHub](https://github.com/mamedev/mame/blob/master/src/mame/namco/polepos.cpp) — the emulator driver source itself, the reference of record for the board's sprite format (4 bits per pixel) and custom-chip complement. *(search result only, not fetched)*
7. [Pole Position, Part 1 — Paul Lefebvre, Goto 10](https://www.goto10retro.com/p/pole-position-part-1) — retro-computing retrospective corroborating "scaleable foreground objects and speech" and the "Prepare to Qualify" line as the game's signature audio moment. *(search result only, not fetched)*
8. [For Sale: A 1982 Atari Pole Position Arcade Game — Silodrome](https://silodrome.com/atari-pole-position-arcade-game/) — photographic record of a surviving cabinet (controls, art, layout) for cabinet-art reference. *(search result only, not fetched)*

## Corrections from citation pass (2026-09-13)

1. **"Both Pole Position cabinets had brake pedals."** No — the **upright had an accelerator
   only**; separate accelerator and brake pedals were a **cockpit-cabinet** feature.
2. **The "Prepare to qualify" voice performer is undocumented.** Forum threads on AtariAge and
   the Museum of the Game have repeatedly asked and not resolved it. Never attribute a name.
3. **system16.com** (a hardware reference that would have given fuller board specs) returned
   **HTTP 403** this session and is deliberately *not* cited. The MAME machine record was used
   instead, and it is the better source anyway.
