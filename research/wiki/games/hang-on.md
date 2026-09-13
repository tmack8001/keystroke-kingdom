---
title: Hang-On
type: entity
tags: [video-game-history, game, arcade, racing, act7, cabinet]
sources: 8
verified: 2026-09-13
---

Hang-On (Sega, July 2 1985), conceived by Yu Suzuki, is the first game built on Sega's
[[super-scaler]] sprite-scaling hardware and the origin of the "taikan" (body-sensation) motion
cabinet — a deluxe machine shaped like a motorcycle that the player physically leans. It is
[[out-run]]'s direct technological parent.

## In this game

**The recommended Super Scaler station for Act 7 — Speed / Racing**, because
[[out-run]] is already the **Level 21** cabinet and the one-game-per-cabinet rule forbids reusing
it (`research/racing-games-by-era.md` §4, §14). Hang-On is a clearly distinct game — different
vehicle, earlier hardware generation, different design intent — so it lets Act 7 teach the
sprite-scaling era without touching Level 21. It is also, arguably, the better history: it is the
*first* Super Scaler game rather than the famous one.

## The facts

- Developer/publisher: **Sega** (Wikipedia's infobox credits **Sega R&D1**; Yu Suzuki conceived
  the game and specified the hardware). **Note:** one circulating search summary attributes it to
  "Studio 128" — prefer "Sega, conceived by Yu Suzuki."
- Release: **July 2 1985** (Japan), **July 22 1985** (North America).
- Technical: one of the first arcade games to use **16-bit graphics**, on Sega's **Super Scaler**
  arcade board — sprite-scaling that produces a pseudo-3D effect at a high frame rate. Suzuki's
  own account of the technique (via [[out-run]]): *"All the calculations in the system were 3D,
  even from Hang-On. I calculated the position, scale, and zoom rate in 3D and converted it
  backwards to 2D."*
- Cabinets: three designs — a handlebar-and-brake-lever upright, a seated upright, and the
  famous **ride-on motorcycle** deluxe cabinet where "the player's body movement on a large
  motorbike-shaped cabinet corresponds with the player character's movements on screen." This
  started Sega's motion-simulator "taikan" trend.
- **Punishment mechanics:** a race against time across five stages; **reaching a checkpoint
  extends the time limit**, carrying remaining time over; the run ends when time expires. Running
  off the track crashes the motorcycle and launches the rider into the air.

## The cabinet build (Act 7 track spec) — added 2026-09-13

*Everything a `js/speedway/tracks/hang-on.js` renderer needs. Its neighbour on the ladder is
[[pole-position]] (same tier, three years earlier, far cruder) — the pair is how the act shows
that "sprite scaling" got a decade of refinement, not one invention.*

**Render tier: `scaler`.** Same kit vocabulary as [[pole-position]] — `scaleSprite` and
`horizonShift` — but Hang-On should look *dramatically* better inside the same budget: more
sprites, bigger sprites, smoother scaling steps, a faster horizon. The lesson the tier teaches
is that **the technique didn't change; the hardware got good at it.**

**Rendering technique, precisely.**
- Hardware: the **Sega Hang-On board** — Sega's first **Super Scaler** system, built up from the
  earlier VCO Object hardware, with a **Motorola 68000** and multiple CPUs plus DSP assistance.
  The same board later ran *Space Harrier* and *Enduro Racer*.
- It is described as **one of the first arcade games to use true 16-bit graphics**, and the
  selling point was **frame rate** — "high frame rate" is named in the sources as the thing
  Super Scaler bought.
- The technique, in Yu Suzuki's own words (carried on [[super-scaler]] and [[out-run]]):
  *"All the calculations in the system were 3D, even from Hang-On. I calculated the position,
  scale, and zoom rate in 3D and converted it backwards to 2D."* That is the precise thing to
  reproduce: **do the maths in 3D, then draw a 2D sprite at the resulting size.** It is not
  fake 3D that guesses; it is real 3D that renders as sprites.
- No polygons, no textures, no alpha. Resolution and palette figures for this specific board
  were **not located from a usable source this pass** — treat any specific numbers as
  **[unverified]** and author to the `scaler` tier's 320px/eight-ink budget.

**Road / track geometry the player saw.** **Behind-the-motorcycle third person** — the rider's
back and the bike fill the lower centre of the frame and lean with the turns, which is the whole
identity of the view. **One continuous track, assembled in segments, divided into five stages**,
with a checkpoint at the end of each. The road sways through corners exactly as
[[pole-position]] does, but faster and with far denser roadside furniture. Sources describe the
course passing through **grasslands, seaside, valleys, a night-time cityscape, mountains, cities
and deserts** — the scenery *changes as you progress*, which is the era's way of showing
distance travelled.
- *Precision note:* a set of named stages ("Alps, Grand Canyon, City, Night, Seaside Circuit")
  circulates in secondary write-ups. **Wikipedia does not name the stages**, and the naming may
  be bleeding across from *Super Hang-On* (1987), which has explicitly named continents. Treat
  the stage NAMES as **[unverified]**; the scenery *types* above are corroborated.

**The signature visual moment.** The rider **leaning the bike hard into a corner with a knee
out**, the whole sprite tilting while the horizon slides the other way — and the road ahead
crowded with signs and rival bikes scaling up toward you. On the deluxe cabinet, the player is
doing the same lean *with their own body*, which is the point of the machine.

**Completion / celebration state.** Five stages; **each checkpoint extends the time limit and
carries the remaining time forward**; the run ends when time expires **or all five stages are
completed**. **What happens visually on completing stage five is not documented in any source
located this pass — mark it [unverified] and do not invent a trophy.** If Act 7 needs a finish
image for this cabinet, the honest options are (a) the checkered flag, verified from
[[pole-position]] 1982 onward, or (b) [[out-run]]'s 1986 destination endings with their trophy
presentation — which the act cannot use, because Out Run is Level 21.

**Punishment mechanics to strip** (format matching `racing-games-by-era.md` §12):

| What the cabinet did | Why it violates the One Rule | Reframe |
|---|---|---|
| Race against a clock across five stages; run ends at zero | Timer-based elimination | Checkpoints become **gifts** ("another stretch of road"), never deadlines |
| Running off the track **crashes the bike and launches the rider into the air** | Spectacular failure imagery for one mistake | The bike wobbles and rejoins; the rider is never thrown. Keep the *comedy* of the wobble, delete the ejection |
| Remaining time carried forward (banked pressure) | Makes earlier mistakes compound later | Nothing carries; every stage starts whole |

**Cabinet art notes** (faithful, never gimmicky — and this is the act's best cabinet-art
subject by a wide margin). **Three documented designs:**
- **Upright** with **handlebars and brake levers** bolted to the panel.
- **Seated upright** — the same, with a seat added.
- **The ride-on** — a cabinet **shaped like a full motorcycle**, with the **screen mounted in
  the windscreen area** of the bike. **The player physically leans the machine to steer**, and
  the on-screen rider mirrors their body. This is the origin of Sega's **"taikan"
  (body-sensation)** motion-cabinet line, and it is the only cabinet in Act 7's research where
  the *furniture* is the innovation.
- Documented ambition worth a footnote: **Yu Suzuki wanted more** — including gyroscope
  simulation — and budget constraints prevented it.

**Era-appropriate palette (authoring recommendation, derived).** Mid-80s Sega arcade colour is
brighter and warmer than 1982 Namco. Author as: a **saturated sky that changes per stage**
(clear blue → sunset orange → deep night blue with lit windows), grey road with **bold white
dashes and red-and-white rumble strips**, green verge or sand verge by stage, dense roadside
sprites (signs, trees, poles, banners) in strong single colours, and the player bike in
**white/red/blue racing livery** with the rider in a contrasting suit. The visual story of the
track is **the sky changing colour** as stages pass — that is how 1985 said "you have travelled
far," and it costs almost nothing to draw.

## References

1. [Hang-On — Wikipedia](https://en.wikipedia.org/wiki/Hang-On) — Sega R&D1; July 2 1985 Japan and July 22 1985 North America; "one of the first arcade games to use 16-bit graphics" on the Super Scaler board with Yu Suzuki specifying the hardware for 3D effects via sprite scaling; the three cabinet designs and the ride-on motion cabinet starting the "taikan" trend; five stages with checkpoint time extension, time-expiry failure, and off-track crashes launching the rider. **[fetched]**
2. [Super Scaler (concept) — Giant Bomb](https://www.giantbomb.com/super-scaler/3015-8389/games/) — corroborates Hang-On as the first title on the Super Scaler hardware family. *(search result only, not fetched)*
3. [Hang-On — Internet Archive (arcade record)](https://archive.org/details/arcade_hangon) — archival record of the 1985 Sega arcade release. *(search result only, not fetched)*
4. [Hang-On — Wikipedia (build-depth pass, 2026-09-13)](https://en.wikipedia.org/wiki/Hang-On) — the **behind-the-motorcycle perspective** and lean-to-steer control; **one track pieced together in segments, divided into five stages**; checkpoints at the end of each segment extending the time limit with remaining time carried into the next stage; the run ending on time expiry **or** on completing all five stages; running off the track crashing the bike and launching the rider into the air; the basic handlebars-and-levers cabinet plus the deluxe full-motorcycle cabinet that tilts; **Yu Suzuki wanting gyroscope simulation that budget prevented**; and — the negative finding — **no stage names and no end-of-game celebration are described**. **[fetched]**
5. [Hang-On (Game) — Giant Bomb](https://giantbomb.com/wiki/Games/Hang_On) — corroborating description of the Super Scaler board (enhanced from the VCO Object hardware, multiple CPUs with DSP assistance, 16-bit graphics, 68000) and the three cabinet designs including the seated variant. *(search result only, not fetched)*
6. [Hang-On (1985) — MobyGames](https://www.mobygames.com/game/10651/hang-on/) — corroborating release metadata and the scenery progression (grasslands, seaside, valleys, night cityscape). *(search result only — mobygames.com has returned HTTP 403 to this project's fetches all session; not read)*
7. [Hang-On (Arcade) — The Cutting Room Floor](https://tcrf.net/Hang-On_(Arcade)) — technical/archival record of the arcade ROM, usable for unused-content and asset detail. *(search result only, not fetched)*
8. [Super Hang-On — Wikipedia](https://en.wikipedia.org/wiki/Super_Hang-On) — the 1987 sequel whose **named continental courses** are the likely origin of the "Alps / Grand Canyon / City / Night / Seaside" stage-name list that circulates misattributed to the 1985 original. *(search result only, not fetched)*

*(The Suzuki 3D→2D quotation is carried, already citation-verified 2026-07-11, on [[super-scaler]]
and [[out-run]].)*

## Corrections from citation pass (2026-09-13)

1. **"Hang-On's five stages are Alps, Grand Canyon, City, Night and Seaside Circuit."** Marked
   **[unverified]**. Wikipedia's article names **no stages at all**; the named list appears only
   in secondary write-ups and is plausibly bleeding in from **Super Hang-On (1987)**, which does
   have named courses. Use the corroborated scenery *types* instead.
2. **"Hang-On had a finish celebration."** No source located this pass describes one. Wikipedia
   documents only that the game "ends if the time runs out or all five stages are completed."
   **Do not draw a trophy or flag for this cabinet without new evidence** — the act already has
   a verified flag ([[pole-position]], 1982) and a verified trophy ([[out-run]], 1986, which is
   Level 21 and therefore off-limits).
3. **Resolution and colour figures for the Hang-On board were not found in a usable source.**
   Previously implied precision removed; author to the tier budget instead.
