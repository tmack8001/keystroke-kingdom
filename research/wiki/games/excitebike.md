---
title: Excitebike
type: entity
tags: [video-game-history, game, console, arcade, racing, act7, cabinet, history-card]
sources: 8
verified: 2026-09-13
---

Excitebike (Nintendo, Famicom November 30 1984; NES North America October 18 1985), directed,
designed and produced by Shigeru Miyamoto, is the side-scrolling motocross racer built around an
**engine temperature gauge** — and, remarkably for 1984, a built-in **track editor**. Its
smooth-acceleration scrolling engine fed directly into [[super-mario-bros]] the following year.

## In this game

Trevor's named starting anchor for **Act 7 — Speed / Racing**. The research recommendation
(`research/racing-games-by-era.md` §3) is to **keep it and move it**: it is an excellent station
— its Design Mode rhymes directly with Act 6's "Your Own World" maker, and its overheat gauge is
the act's most interesting One-Rule reframe problem — but as an *opening* it starts the
generational arc ten years late, skipping the [[discrete-logic-era]] decade that Keystroke
Kingdom's Act 1 already renders. Recommended opener instead: [[monaco-gp]] (1979). The
Excitebike → [[super-mario-bros]] acceleration lineage is a cross-link the curriculum can cash,
since Super Mario Bros. is already Level 9.

## The facts

- Developer: **Nintendo R&D4** (per Wikipedia's infobox). **Note:** several secondary summaries
  say "R&D1" — the safe attribution is "Nintendo, directed, designed and produced by **Shigeru
  Miyamoto**," which every source agrees on.
- Releases: **Famicom, November 30 1984** (Japan). **NES, October 18 1985** (North America).
  Arcade **VS. Excitebike** on the Nintendo VS. System, **December 1984** (Japan) / **March 1985**
  (North America) per Wikipedia. *(A community wiki gives the more precise December 5 1984 /
  February 1985; the two sources disagree, so prefer the month-level Wikipedia dates.)*
  Nintendo's own store listing describes it as "a motorcycle racing game released by Nintendo in
  1984."
- Genre precision: it is **motocross**, side-on, with jumps where landing angle matters — not a
  car racer.
- **Signature mechanic — the temperature gauge:** turbo is a button press, but it "overheats the
  engine if it is used for too long, forcing an immobile cooldown period." Driving over arrow
  tiles on the track resets the engine temperature.
- **Design Mode:** a built-in track editor offering **19 types of hurdles** — a rarely-seen
  feature at the time. **Saving is the created-vs-shipped catch:** the North American **NES
  version could not save tracks at all**; saving required the **Famicom Data Recorder**, a
  peripheral never released outside Japan (the Famicom Disk System version, 1988, supported it).
  The arcade VS. version omits both two-player and track creation entirely, per Nintendo's own
  description.
- Legacy: Excitebike's side-scrolling engine directly influenced **Super Mario Bros.** (1985),
  enabling "Mario to smoothly accelerate from a walk to a run, rather than move at a constant
  speed."
- **Punishment mechanics:** the overheat cooldown is an enforced input lockout; crashing and
  landing at a bad angle both cost speed; the game gates on qualifying times.

## The cabinet build (Act 7 track spec) — added 2026-09-13

*Everything a `js/speedway/tracks/excitebike.js` renderer needs. This is the odd one out in
the act — the only station that is neither a car nor a first-person road.*

**Render tier: `8bit`.** `tileLayer` + `spriteSheet` over the `ttl`/`scaler` base: a tiled
background layer and sprites drawn on top, no alpha, no polygons, no scaling. That IS the NES.

**Rendering technique, precisely.**
- Resolution: **256×240**, with NTSC televisions cutting the top and bottom 8 rows (so the
  safe area is effectively **256×224**).
- Colour: a fixed **system palette of 56 colours**; on screen a game gets roughly **13 for
  sprites and 13 for background tiles**, organised as **four 4-colour palettes each**, with one
  shared transparent/backdrop entry.
- Structure: **one** background tile layer, 256 tiles of 8×8 in VRAM at a time, and a hard
  constraint that **every 16×16 pixel area of the background must use a single one of the four
  palettes** — the origin of the blocky-colour look of NES backgrounds.
- Sprites: up to **64 on screen**, but **only 8 per scanline** before dropout/flicker;
  horizontal and vertical flipping is free (which is why the bike and rider are drawn once and
  mirrored).
- The screen can be **split horizontally at any scanline** for an independent status strip —
  which is how Excitebike shows its gauge and timing without touching the track layer.
- **Nothing scales, nothing rotates.** Distance in Excitebike is not simulated at all; it is a
  flat side-on plane with four fixed lanes.

**Road / track geometry the player saw.** Pure **side-scrolling side-on view**, motocross, four
horizontal lanes the rider hops between. Obstacles are **ramps, hills, mud/slow strips, and
arrow tiles**; the track scrolls right-to-left in one plane, no horizon, no vanishing point, no
depth cues beyond the stadium wall drawn behind. Landing **angle** matters: the rider's pitch in
the air is the whole skill of the game. The timing information is displayed in the world —
**the time to beat for first place is written on the stadium walls**, with third place's time in
the lower-left corner.

**The signature visual moment.** The bike leaving a ramp, the rider **pitched nose-up against
the stadium wall**, and the player tapping to level the bike before landing — plus, in the
status strip, the **temperature gauge** creeping toward the red while turbo is held. Those two
things happening at once *is* Excitebike.

**Completion / celebration state.** A race is against a **time target**, not a pack. Finishing
**third place or better in the challenge (preliminary) race qualifies you for the Excitebike
championship race**. When the player takes first, the game prints **"It's a new record!"** and
awards extra points for beating the previous best time. There is no podium, no trophy and no
cutscene — the celebration is a **printed record line and a new number**, which is very 1984
and, notably, is the one celebration in this whole act that rewards *you against yourself*
rather than against a field. **That makes it the single best fit for Act 7's ghost-car design**:
Excitebike already believed the opponent was your own previous time.

**Punishment mechanics to strip** (format matching `racing-games-by-era.md` §12):

| What the game did | Why it violates the One Rule | Reframe |
|---|---|---|
| **Overheat forces an immobile cooldown** — input does nothing until it clears | An enforced input lockout is a flow-stop, the most direct One Rule violation in the act | Turbo becomes an **earned accuracy bonus that simply fades**. Never lock input. Keep the gauge as a *visual* that fills and empties |
| Crashing throws the rider off; a badly angled landing costs speed | Mistake → lost progress | A comic tumble that costs nothing and auto-recovers; the bike is always moving forward |
| Colliding with a CPU rider from behind throws you off | Other racers as hazards | The field is scenery: alive, fallible, never in your way |
| Must place **3rd or better to qualify** for the championship | A gate you can fail | Never gate. The championship always follows |
| Time limit per race | Timer | No timer; typing produces track |

**Cabinet art notes.** Excitebike is a **home console game first** — Famicom November 30 1984,
NES North America October 18 1985 — so its "cabinet" in an arcade row is an honest problem.
Two faithful options, both documented:
- Draw the **Nintendo VS. System cabinet** (**VS. Excitebike**, arcade, December 1984 Japan /
  March 1985 NA). This is real, and it is the only true Excitebike *cabinet*. Nintendo's own
  store listing confirms the arcade version **omits two-player and the track-creation function**
  — so if the act's cabinet art shows the VS. machine, the track editor should not be part of
  what that cabinet advertises.
- Or draw the **console as the object** the way Act 2 already does for [[super-mario-bros]] —
  an NES and a television — which is the honest framing for the 1985 home release.

**Era-appropriate palette (authoring recommendation, derived from the NES constraint).** Work
in **four fixed 4-colour background palettes** and don't cheat: a flat sky blue behind the
stadium; the **stadium wall as a mid-grey/white band carrying the record time**; the track
surface in two greys or two tans with a darker lane divider; ramps picked out in a single
accent; the rider and bike in white/red with a black outline; the mud/slow strips in a distinctly
darker brown. **No gradients, no anti-aliasing, hard 16×16 colour regions.** The `8bit` tier's
16-ink NES-derived palette is already the right box — the discipline is to keep any 16×16 tile
block to one sub-palette.

## References

1. [Excitebike — Wikipedia](https://en.wikipedia.org/wiki/Excitebike) — Nintendo R&D4 developer; Famicom November 30 1984, NES NA October 18 1985, VS. arcade December 1984 (JP) / March 1985 (NA); Miyamoto as director, designer and producer; the temperature gauge, turbo overheat cooldown and arrow-tile reset; Design Mode's 19 hurdle types; the NES version's lack of save vs the Famicom Data Recorder; crash and bad-landing speed loss; the Super Mario Bros. smooth-acceleration lineage. **[fetched]**
2. [Arcade Archives EXCITEBIKE — Nintendo official store](https://www.nintendo.com/us/store/products/arcade-archives-excitebike-switch/) — first-party: "a motorcycle racing game released by Nintendo in 1984"; confirms the Nintendo VS.SYSTEM version excludes two-player mode and the track creation function; describes the solo qualifying race and final race structure. **[fetched]**
3. [Arcade Archives VS. Excitebike (Switch) review — Nintendo World Report](http://www.nintendoworldreport.com/review/48474/arcade-archives-vs-excitebike-switch-review) — corroborates the VS. arcade version's differences from the NES game (solo qualification, bonus game, knocking riders off their bikes). *(search result only, not fetched)*
4. [VS. Excitebike — Nintendo Wiki (miraheze)](https://nintendo.miraheze.org/wiki/VS._Excitebike) — corroborating arcade release dates (December 5 1984 Japan / February 1985 NA). Community-maintained; used only as a corroborating source. *(search result only, not fetched)*
5. [NES Graphical Specs — BitBeamCannon](https://bitbeamcannon.com/nes-graphical-specs/) — the hardware constraints this track must respect: 256×224 (NTSC) / 256×240 (PAL); a 56-colour system palette with ~13 colours each for sprites and backgrounds; 256 8×8 tiles in VRAM; up to 64 sprites on screen but only 8 per scanline before flicker; free horizontal/vertical sprite flipping; a single background tile layer where every 16×16 pixel area must share one of four palettes; horizontal screen splits at any scanline for status strips and parallax. **[fetched]**
6. [PPU palettes — NESdev Wiki](https://www.nesdev.org/wiki/PPU_palettes) — the hardware reference of record for the NES picture processing unit's palette organisation (four 4-colour background palettes, four 4-colour sprite palettes, shared backdrop entry). *(search result only, not fetched)*
7. [Excitebike — StrategyWiki](https://strategywiki.org/wiki/Excitebike) — player-documentation source for Selection A (solo) vs Selection B (with CPU riders), the third-place-or-better qualification into the championship race, the time-to-beat displayed on the stadium walls (1st) and in the lower-left corner (3rd), the eight-second gap between them, CPU riders knocking the player off from behind, and the **"It's a new record!"** message with bonus points for beating the previous time. *(search result only — strategywiki.org returned HTTP 403 on fetch this session; not read)*
8. [Excitebike — The Spriters Resource](https://www.spriters-resource.com/nes/excitebike/) — ripped sprite/tile sheets, usable as a direct visual reference for the bike, rider, ramps and track tiles. *(search result only, not fetched)*

## Corrections from citation pass (2026-09-13)

1. **"Excitebike's races are against the other riders."** No — even in Selection B the CPU
   riders are **obstacles**, and the actual opponent is a **time target** (first-place and
   third-place times posted in-world). Excitebike is a **time-trial game with traffic**, which
   is why it maps onto Act 7's ghost car better than any other station here.
2. **"Excitebike is 256×240."** True of the framebuffer; **NTSC televisions cut 8 rows top and
   bottom**, so the composed safe area is **256×224**. Compose to 224.
3. The **StrategyWiki** page carrying the qualification/record-message detail **403'd on fetch**
   and is labelled unfetched; it corroborates, it does not stand alone (Nintendo's own store
   listing independently describes the solo qualifying race and the final race).
