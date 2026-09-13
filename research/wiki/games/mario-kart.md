---
title: Mario Kart
type: entity
tags: [video-game-history, game, console, racing, act7, cabinet, history-card]
sources: 14
verified: 2026-09-13
---

Super Mario Kart (Nintendo EAD, August 27, 1992, SNES) is credited with inventing the
"kart racing" subgenre of video games — developed under Shigeru Miyamoto as EAD general
manager, with Tadashi Sugiyama and Hideki Konno as directors.

## In this game

**Correction (2026-09-12):** this page previously described Mario Kart as "a parked candidate
cabinet for Keystroke Kingdom's Act 6 'mastery wing.'" Act 6 has since **shipped as the Text
Worlds wing** (the *no-speed* wing — typing as thought; see `CLAUDE.md`), and the speed/racing
wing Trevor originally described is now **Act 7**. Everything the old paragraph said about a
"speed/sentence greatest-hits wing at modern fidelity, with historical-ordering rules
deliberately loosened" applies to **Act 7**, not Act 6.

Mario Kart is a strong candidate station in the recommended Act 7 spine
(`research/racing-games-by-era.md` §5, §15), alongside [[tron]] from the same 2026-07-10
conversation. **It also donates the single most One-Rule-compatible mechanic in the genre's
history:** collected coins raise your top speed, **and when you're hit you lose coins instead of
spinning out** — a resource buffer that absorbs a mistake so the player never loses control.
Cabinet-rule note: [[super-mario-bros]] is already Level 9, but Super Mario Kart is a clearly
distinct game in the same franchise, which the one-game-per-cabinet rule explicitly permits
(the Pac-Man / Ms. Pac-Man precedent). See also `docs/ROADMAP.md` §2. Related racing pages:
[[f-zero]] (the Mode 7 game that preceded it), [[monaco-gp]], [[pole-position]], [[out-run]].

## The facts

- Developed by Nintendo EAD (Shigeru Miyamoto as EAD general manager overseeing
  development), released in Japan August 27, 1992, for SNES.
- "Credited with inventing the 'kart racing' subgenre of video games."
- Production credits corroborated by fan-maintained sources: Miyamoto producer;
  Tadashi Sugiyama/Hideki Konno directors.
- **Rendering:** Mode 7 — the SNES's freely rotatable and scalable raster plane. The team
  prioritised **simultaneous two-player display**, which led to simpler track designs than
  [[f-zero]]'s and drove the horizontal split-screen layout used even in single player. Its
  **DSP-1** chip became the most widely adopted DSP processor for SNES games.
- **Items and coins:** question-mark panels grant shells, bananas and invincibility stars.
  Coins scattered on the track **raise top speed**; when struck by a power-up or another kart,
  the player **loses coins instead of spinning out**.
- **Punishment mechanics** (all must be stripped under the One Rule): finishing **fifth or lower
  in a Grand Prix means being "ranked out"** — the race must be replayed using one of a limited
  pool of lives, and exhausting them ends the game. (Finishing in the same position three times
  consecutively awards an extra life.)
- Battle Mode: two players, three balloons each, pop the opponent's to win.
- **Time Trial — and NO ghost car.** *"In time trial mode, players race against the clock…
  attempting to set the fastest time possible"* — five laps, 100cc, no items and no coins. The
  word "ghost" appears nowhere in the Wikipedia article, and the Super Mario Wiki dates ghost
  data to **Mario Kart 64 (1996)**. The 1992 game's optional second kart in Time Trial
  (*"by pressing B Button on the second controller"*) is a **computer-controlled opponent**,
  not a recording of your run. Full lineage: [[ghost-car]].
- Sales: **8.76 million** copies, the fourth best-selling SNES title. The modern series entry
  **Mario Kart 8 / 8 Deluxe** is the **best-selling racing game of all time**, past 70 million
  units.

## The cabinet build (Act 7 track spec) — added 2026-09-13

*Everything a `js/speedway/tracks/super-mario-kart.js` renderer needs. Its tier-mate is
[[f-zero]], which is already BUILT — so this track's job is to look unmistakably like the
**other** kind of Mode 7 game, not like a recolour of the one beside it.*

**Render tier: `mode7`.** `affinePlane`, `billboard` and `withAlpha` over the base vocabulary.
The kit already implements the exact thing: one raster plane sampled per scanline, everything
else a billboard sprite.

**Rendering technique, precisely.**
- **Mode 7 is a single background layer** (BG1 on the SNES) that can have an **affine
  transformation** applied to it — translation, scaling, rotation, reflection and shearing,
  combinable into a perspective warp.
- The tilemap forms a **1024×1024 pixel square**, viewed through the screen's **256×224** window.
- The transform is four 8.8 fixed-point registers (**M7A/M7B/M7C/M7D**) plus a pivot point
  (M7X/M7Y) and post-transform scroll offsets.
- **The transform can be changed every scanline via HDMA** — that per-scanline change is what
  turns a flat rotated plane into a receding horizon. It is the whole trick.
- **No polygons anywhere.** Karts, item boxes, pipes, trees and Lakitu are all **sprites**.
- Super Mario Kart's extra hardware: the **DSP-1** coprocessor doing the maths, which went on to
  become the most widely adopted DSP in SNES games.

**Road / track geometry the player saw — and the one thing that must differ from [[f-zero]].**
Both games are one Mode 7 plane. The distinguishing design fact is documented and decisive:
Super Mario Kart was built **two-player-first**, and the **horizontal split-screen was the
primary constraint** — which is why **its tracks are simpler than F-Zero's** and why the split
is present **even in single player** (the lower half carries a map/status panel). So:
- **F-Zero** = one tall, fast, empty view; long sweeping futuristic circuits.
- **Super Mario Kart** = a **letterboxed upper play view with a second panel below it**, a
  slower and squatter camera closer to the ground, and simple, readable track shapes — flat
  ground plane, chunky painted road, obvious off-road borders.
- Course furniture is **billboard sprites standing on the plane**: item panels, pipes, trees,
  coins scattered on the road, dropped bananas.

**The signature visual moment.** A kart **sliding wide through a hairpin on a flat painted
plane** while the whole ground rotates around it — and coins lying on the track ahead. And the
second-best: the moment you are hit and **coins fly off you instead of you spinning out**.

**Completion / celebration state.** Super Mario Kart has the most **staged** celebration in the
act, and it is a genuine design problem:
- A **podium** appears beneath the top three karts; a **Cheep Cheep balloon** flies over and
  drops a **trophy** matching the finishing placement; the winner is handed **champagne bottles**
  and, when opened, the cork **pops the balloon and releases the gold trophy**. Each character
  has its own little bit of business with the bottles.
- **Gold, silver or bronze cup for 1st/2nd/3rd. Fourth or lower awards nothing** — and the
  player's character is shown **standing beside the podium, crying**, while the three CPU racers
  celebrate.
- *Sourcing note:* the podium/balloon/champagne/crying detail comes from Mario community wikis
  (mariokart.fandom, mario.fandom). The **mariowiki.com page fetched this pass confirms only the
  award-ceremony music cue**, not the visuals. Domain-canonical community sourcing; label it.

**For Act 7 this celebration is a trap and a gift at once.** The crying-in-fourth-place image is
one of the most on-the-nose One Rule violations in the entire research corpus — it is a
*drawn picture of a child being sad because they lost*. Strip it completely. But the **balloon →
cork → trophy** gag is pure, placement-free spectacle: a thing pops and a reward falls out. That
is directly reusable if the trophy is severed from the ranking. Also note **the celebration
does not need alcohol** — the popping is the joke, and a cork is not required to make a balloon
burst.

**Punishment mechanics to strip** (format matching `racing-games-by-era.md` §12):

| What the game did | Why it violates the One Rule | Reframe |
|---|---|---|
| **5th or worse = "ranked out"**; replay the race using one of a limited pool of **lives**; run out and the game ends | Elimination by placement, plus lives | Delete both entirely. Adventure mode only |
| **4th or lower gets no trophy, and your character is shown crying** beside the podium | A rendered image of the player's own failure | Cut the crying frame. **Everyone reaches the podium** |
| Shells, bananas and stars knock you over | Other racers attacking you | If items appear at all, they are **gifts you find**, never things thrown at you |
| Battle Mode: pop the opponent's three balloons | PvP elimination | Not applicable to Act 7 |
| **STEAL THIS ONE:** coins raise top speed, and being hit **costs coins instead of spinning you out** | — | Already the most One-Rule-compatible mechanic in the genre. Keep verbatim: a buffer that absorbs a mistake so control is never lost |

**Cabinet art notes** *(rewritten 2026-09-13 — the previous version was misleading; see
Corrections item 3 and [[mario-kart-arcade-gp]]).*

**The 1992 game is a console game.** *Super Mario Kart* itself — SNES, August 27 1992 — was not
released as a coin-op, and no source found this pass says otherwise. **But Mario Kart arcade
cabinets are real and always have been:** Namco developed and Nintendo published the
[[mario-kart-arcade-gp|Mario Kart Arcade GP]] line from **2005** on the Triforce board (running a
modified *Mario Kart: Double Dash!!* engine), and its descendant **Mario Kart Arcade GP DX** is a
**currently-sold** seated wheel-and-pedal cabinet with a 42-inch screen, listed on Bandai Namco
Amusement America's own site. So the franchise has cabinets; the *1992 title* does not.

**What to draw** (the rule, in full, lives on [[home-games-in-cabinets]]): **draw a real thing.**
For this station that means **an SNES and a television**, or the **cartridge** — Trevor's own
direction, 2026-09-13: *"computer terminals and game systems… 8-bit or 16-bit or 24-bit renderings
of the different game consoles."* That is already the game's established vocabulary
(`.claude/rules/levels/act2.md`: *"Computers and consoles from different eras line the walls, each
one running a classic game"*). Drawing detail — the boxy North American SNES with its **purple
sliding switches** and lavender/purple diamond controller — is on [[console-hardware-silhouettes]].
If a *cabinet* is wanted instead, draw a **real Mario Kart Arcade GP DX**, not an invented 1992
coin-op. The only thing ruled out is fabricating a machine that never existed and implying it did.

*(Cabinet-rule check: [[super-mario-bros]] is Level 9, but Super Mario Kart is a clearly distinct
game in the same franchise, which the one-game-per-cabinet rule explicitly permits — the
Pac-Man / Ms. Pac-Man precedent.)*

**Era-appropriate palette (authoring recommendation, derived).** SNES 16-bit warmth, and
deliberately **softer and rounder** than [[f-zero]]'s cold neon: sky blue with white cloud
sprites, a **cream/tan road** with a **white dashed centre line**, **bright green off-road
grass** or **sandy beige**, red-and-white striped kerbs, terracotta pipes, gold coins, and
karts in flat character-primary colours (Mario red, Luigi green, Peach pink, Bowser orange).
Where F-Zero uses violet/magenta/cyan on near-black, Mario Kart uses **daylight**. The `mode7`
tier's 16-ink palette holds both — the separation is which end of it each track lives in.

## Corrections from citation pass (2026-09-13)

1. **"Super Mario Kart's award ceremony is documented."** Only the **music** is, on
   mariowiki.com (fetched). The **podium, Cheep Cheep balloon, champagne, trophy and the
   crying fourth-place character** rest on a single community wiki. Safe to design against;
   **never state as fact on a child-facing card.**
2. **"Super Mario Kart's split screen is a two-player feature."** It is the **primary design
   constraint of the whole game** — Wikipedia states the two-player-first priority is why its
   tracks are simpler than [[f-zero]]'s, and the horizontal split is present **even in single
   player**. That is the visual signature that separates the two Mode 7 tracks; it is not a
   mode toggle.
3. ~~**There is no Super Mario Kart arcade cabinet. SNES only. Do not draw one.**~~
   **RETRACTED AND REPLACED 2026-09-13** — this is the sentence this page got wrong, and it is
   worth dwelling on because of *how* it was wrong.
   - **What was written:** an absolute, franchise-level claim with a prohibition attached.
   - **What is true:** the **1992 SNES title** was not released as a coin-op (still unrefuted).
     But **Mario Kart arcade cabinets exist** — Namco's *Mario Kart Arcade GP* line has run since
     **2005**, and **Mario Kart Arcade GP DX is in production and sold today** by Bandai Namco
     Amusement (manufacturer page fetched). This page never mentioned that line at all, and the
     wiki had no page for it.
   - **Why it mattered:** it was relayed upward as "Super Mario Kart has no arcade cabinet," which
     Trevor immediately and correctly pushed back on — modern arcades, resort arcades and FECs
     have these machines on the floor. Left uncorrected it would have steered Act 7's cabinet art
     with a false picture of what exists.
   - **The process lesson:** the right answer was *already in this paragraph* — *"The faithful
     object is an SNES and a television… or the cartridge itself"* — but it sat under a "do not
     draw one" headline, and the headline is what travelled. **A prohibition without its
     replacement beside it reads as "there is nothing to draw."** Write both halves, always.
   - New pages: [[mario-kart-arcade-gp]] (what actually exists) and [[home-games-in-cabinets]]
     (the general precedent and the "draw a real thing" rule).

## Corrections from citation pass (2026-09-13, third pass — the ghost car)

5. **"Mario Kart invented / introduced the ghost car."** Not this Mario Kart. **Super Mario
   Kart (1992) has no ghost** — its Time Trial races the clock, and the second kart you can
   summon on controller two is a **CPU racer**. Ghost data arrives with **Mario Kart 64
   (1996)**, where Nintendo's own manual calls it *"a recording of the course's best time"*
   drawn as *"a half visible character."* And the mechanic itself is older than both: Atari
   Games' **Hard Drivin' (1989)** already *"remembers the path of the car driven by the best
   driver on record."* This matters to Act 7, whose core loop is racing your own ghost —
   see [[ghost-car]] for the full evidence, including why its ghost must never read as a
   rival the way Hard Drivin's "grudge match" did.

## Corrections from citation pass (2026-09-13, second pass — cabinet precedent)

4. **The framing that a console game "is not a cabinet" is itself too strong.** Putting home
   games into coin-op cabinets is a documented industry practice from Nintendo's own
   [[nintendo-vs-system|VS. System]] (1984, the highest-grossing arcade machine of 1985) and
   PlayChoice-10 (1986) through today's Raw Thrills / Bandai Namco Amusement machines. The
   project's faithful-not-gimmicky rule is about **fidelity to the game**, never a requirement
   that the game shipped as a coin-op. See [[home-games-in-cabinets]].

## References

1. [Super Mario Kart — Wikipedia](https://en.wikipedia.org/wiki/Super_Mario_Kart) — developer/release date/platform, "credited with inventing the 'kart racing' subgenre" claim.
2. [Best Mario Kart Games Of All Time — Nintendo Life](https://www.nintendolife.com/guides/best-mario-kart-games-of-all-time) — "the game that birthed an entire genre."
3. [Super Mario Kart — Super Mario Wiki (mariowiki.com)](https://www.mariowiki.com/Super_Mario_Kart) — corroborating production credits (Miyamoto producer; Sugiyama/Konno directors). Fan-maintained; used only as a corroborating third source, not standalone.
4. [Super Mario Kart — Wikipedia](https://en.wikipedia.org/wiki/Super_Mario_Kart) *(mechanics pass, 2026-09-12)* — Mode 7 as a freely rotatable/scalable plane; the two-player-first design driving simpler tracks and the horizontal split-screen; item panels (shells, bananas, invincibility star) and character-specific AI abilities; coins raising top speed and being lost **instead of** spinning out when struck; "ranked out" at fifth or lower, the limited lives, game over on exhaustion, and the extra life for three consecutive same-position finishes; Battle Mode's three balloons; 8.76 million sales and fourth-best-selling SNES title; the DSP-1 as the most widely adopted SNES DSP. **[fetched]**
5. [Mario Kart 8 Deluxe Is Nintendo's Best-Selling Game Of All Time — GameSpot](https://www.gamespot.com/articles/mario-kart-8-deluxe-is-nintendo-best-selling-game-of-all-time/1100-6523297/) — supports the "best-selling racing game of all time" and 70M+ unit framing for the modern series entry. *(search result only, not fetched)*
6. [Mode 7 transform — SNESdev Wiki (NesDev.org)](https://snes.nesdev.org/wiki/Mode_7_transform) — the hardware reference of record: Mode 7 applies to **a single background layer (BG1)**; the tilemap forms a **1024×1024 pixel square** viewed through a **256×224** screen; the **M7A/M7B/M7C/M7D** 8.8 fixed-point matrix with M7X/M7Y pivot and M7HOFS/M7VOFS post-transform scroll; and the crucial detail that **the affine transformation can be changed every scanline via HDMA**, which is what produces pseudo-perspective. **[fetched]**
7. [Mode 7 — SnesLab](https://sneslab.net/wiki/Mode_7) — corroborating technical description of Mode 7 as an optimised tilemap format permitting translation, scaling, rotation, reflection and shearing, combinable into a perspective warp. *(search result only, not fetched)*
8. [Award Ceremony — Mario Kart Racing Wiki](https://mariokart.fandom.com/wiki/Award_Ceremony) — the community record of Super Mario Kart's celebration: a **podium** under the top three karts, a **Cheep Cheep balloon** delivering a **trophy** by placement, the winner's **champagne bottles** whose cork pops the balloon to release the gold trophy, character-specific business with the bottles, gold/silver/bronze for 1st–3rd, **nothing for 4th or lower**, and the losing character shown **crying** beside the podium. Domain-canonical community wiki; **no institutional source corroborates this**, so it is labelled as community sourcing throughout. *(search result only — fandom.com returned HTTP 402 on fetch this session; not read)*
9. [Awards Ceremony (1st – 3rd Place) — Super Mario Wiki](https://www.mariowiki.com/Awards_Ceremony_(1st_%E2%80%93_3rd_Place)) — fetched this pass and it **confirms only the music cue** ("plays during the cutscene in which the player is rewarded with a Trophy after placing first, second, or third place in a Grand Prix"); it does **not** describe the podium, balloon, champagne or the fourth-place outcome. Cited here precisely so a future reader knows the visual detail above rests on reference 8 alone. **[fetched]**
10. [Mario Kart Arcade GP — Wikipedia](https://en.wikipedia.org/wiki/Mario_Kart_Arcade_GP) *(cabinet-precedent pass, 2026-09-13)* — the Namco-developed, Nintendo-published arcade line: 2005 on the Triforce board, plus GP 2 (March 2007), GP DX (late 2013) and GP VR (14 July 2017); steering wheel, gas and brake pedals; NamCam; up to four linked machines. **[fetched]**
11. [Mario Kart Arcade GP DX — Bandai Namco Amusement America](https://bandainamco-am.com/collections/mario-kart-arcade-gp-dx) *(cabinet-precedent pass, 2026-09-13)* — the manufacturer's own commercial-product listing proving a licensed Mario Kart arcade cabinet is a real, currently-sold object: seated, rainbow-LED, 42″ HD monitor, four-cabinet linking. **[fetched]**
12. [Super Nintendo Entertainment System — Wikipedia](https://en.wikipedia.org/wiki/Super_Nintendo_Entertainment_System) *(cabinet-precedent pass, 2026-09-13)* — the physical description a cabinet-art author needs for the "draw the SNES" recommendation: the boxy North American model with purple sliding switches and dark grey eject lever (designer Lance Barr), the lavender/purple diamond controller, and the rounder Super Famicom/PAL variant. **[fetched]**
13. [Super Mario Kart — Super Mario Wiki (mariowiki.com)](https://www.mariowiki.com/Super_Mario_Kart) *(ghost-car pass, 2026-09-13)* — the Time Trial description (one player, five laps, 100cc, no items or coins; per-lap and total times recorded) and the key sentence: *"By pressing B Button on the second controller, a **computer-controlled opponent** can be chosen to race against."* No ghost feature appears anywhere on the page. **[fetched]**
14. [Time Trial — Super Mario Wiki (mariowiki.com)](https://www.mariowiki.com/Time_Trial) *(ghost-car pass, 2026-09-13)* — dates **ghost data to Mario Kart 64** as a new addition, with Mario Kart: Super Circuit later adding ghost swapping over the GBA link cable. **[fetched]**
