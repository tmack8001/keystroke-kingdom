---
title: F-Zero
type: entity
tags: [video-game-history, game, console, racing, act7]
sources: 7
verified: 2026-09-13
---

F-Zero (Nintendo EAD, November 21 1990) was one of two Super Famicom launch titles and the game
that proved **Mode 7** — the SNES's ability to rotate and scale a single raster plane freely —
could carry an entire game. It invented the futuristic anti-gravity racing subgenre that Wipeout
later inherited.

## In this game

The 16-bit / Mode 7 station in the recommended **Act 7 — Speed / Racing** spine
(`research/racing-games-by-era.md` §5, §15), sitting between [[hang-on]]'s sprite-scaled 1985 and
[[mario-kart]]'s 1992 split-screen. Mode 7 is a strong theme target precisely because it is
*visually unmistakable* and cheap in canvas — one affine transform on a ground texture plus
billboard sprites. Its era sits inside [[sixteen-bit-era]]. Its energy meter and lives system are
both One Rule violations and must be stripped (see the punishment ledger in the hub doc).

**Act 7 celebration research (2026-09-13).** Researched alongside [[monaco-gp]] to answer
Trevor's note that the Speedway win moment (`js/speedway/tracks/f-zero.js`) falls flat. Short
version: **most of F-Zero's completion structure is unusable here, because almost all of it is
placement** — and Act 7 has deliberately removed placement entirely. But two beats survive the
filter cleanly, and one of them is very good: the **per-lap Super Jet boost** (a reward that is a
*capability*, not a rank) and the **post-race camera move** (the game spins the camera side-on
onto your machine — spectacle with nobody to be better than). See "The win moment" below.

## The facts

- Developer: **Nintendo EAD**. **Shigeru Miyamoto** producer, **Kazunobu Shimizu** director (who
  also worked on art). Shimizu on the idea: *"I thought if we used that to make a racing game, it
  would shock everyone!"*
- Releases: **November 21 1990** (Japan, as one of two Super Famicom launch titles alongside
  Super Mario World); **August 23 1991** (North America); 1992 (Europe).
- Rendering: **Mode 7**, described as a texture-mapping technique that "allows a raster
  graphical plane to be rotated and scaled freely, simulating the appearance of 3D environments"
  — **without polygon processing**. Everything that is not the ground plane is a sprite.
- Design: **single-player only**, with no multiplayer mode and no save progression between
  races — both noted as limitations by contemporary reviewers. 15 tracks across three difficulty
  leagues, five laps per race.
- Legacy: credited with establishing standards for the racing genre and with inventing the
  **futuristic racing** subgenre, influencing the Wipeout series and [[daytona-usa]].
- **Punishment mechanics:** a **power meter** representing machine durability that depletes on
  every collision and recovers only in pit areas; a lives system; retirement when the meter
  empties.
- **No ghost car in the 1990 original.** Practice mode is a lap timer; nothing records or
  replays your run. Ghosts arrive in the N64 sequel **F-Zero X (1998)**, which Wikipedia
  describes as *"transparent re-enactments of Time Attack performances… recorded by the player
  or game developer"* (up to three at once, one saved recording per track). If Act 7 gives its
  F-Zero station a ghost, that is a **1998** borrow wearing 1990 clothes — fine, but know it.
  Lineage and the opaque-vs-translucent evidence: [[ghost-car]].

---

## The win moment — what F-Zero did, and what of it is usable

*Researched 2026-09-13 for the Act 7 celebration build.*

**Per lap (five laps to a race).** Wikipedia: *"For each lap completed, the player is rewarded
with an approximate four-second speed boost called the 'Super Jet' and a number of points
determined by place."* So every lap paid out **two** things — one earned by finishing the lap at
all (the boost) and one earned by beating other people (the points).

**Per race — the celebration is a camera move.** When you cross the line first, the game
*"seizes the chance to flex its graphical muscles a little by spinning the camera into a side-on
position"* over your machine. That is the whole of it: a Mode 7 flourish on the thing you were
driving. Nothing is thrown, nothing bursts, nobody cheers.

**Per Grand Prix — a replay reel and your times.** *"Your reward is footage of your craft zooming
around the track shot from various angles as your lap times are displayed — and that's it."*
Clearing a league on **Master** difficulty swaps that for *"a top-down view of your vehicle and…
some generic congratulatory message."* The retro-history write-up that documents this calls the
thinness of the payoff *"probably F-Zero's single biggest flaw"* — which is worth saying out loud
to the build lane: **Trevor's complaint that the win moment falls flat is a complaint the 1990
original also earned.** Act 7 is not obliged to reproduce an anticlimax.

**The part Act 7 cannot use, and why.** F-Zero's structure is placement all the way down:

| What the game did | Why it's unusable in Act 7 |
|---|---|
| Points awarded **by finishing position** each lap | Act 7 has no placement at all |
| *"The player must complete each lap in a successively higher place to avoid disqualification"* — a "safe" cutoff that starts around **15th** and tightens every lap | A tightening elimination threshold is a pure One-Rule violation *and* needs rivals to rank against |
| Drop below ~**20th** and the race **ends immediately** | Loss state; nothing in Keystroke Kingdom ends a player's run |
| *"Only the best three racers count as winners in the end"*; league standings by accumulated points | Comparative judgement of the child against others |
| Accumulated points buy **retries** of failed courses | Presupposes failing a course |
| **Power meter** depleting on every collision; the machine **explodes** when it empties | Punishment; also frightening imagery for a young player |

**The two beats that survive the filter:**

1. **The Super Jet.** Complete a unit of work → get about four seconds of *going faster*. It is
   self-referential (you versus the track), it is visible and loud, and it reads as a gift rather
   than a grade. This is the single most portable idea in the whole page: in Act 7 the "lap" is a
   line of typing, and the payoff is the road accelerating under you.
2. **The camera spin.** At the end, move the camera rather than the world — swing side-on onto
   the vehicle, hold, let the player look at the thing they drove. It costs one affine transform,
   it is unmistakably Mode 7, and it needs no opponent to exist.

**Optional third:** the **replay-with-your-times** reel. Times are a measurement of you against
yourself, so it is compatible in principle — but it is also the beat the source material calls
disappointing, so treat it as garnish rather than the celebration.

## Corrections & cautions — victory-research pass, 2026-09-13

- **Do not describe F-Zero as having a podium ceremony or a trophy presentation.** No source
  found supports one. What exists is a camera move, a replay with lap times, and (on Master) a
  top-down shot with a generic message. Anything more elaborate belongs to **later** F-Zero games,
  not the 1990 original — a classic adjacent-famous-fact bleed.
- **Confetti/fireworks: [unverified] for F-Zero and for the era generally.** Nothing found in any
  racing game 1974–1990. The nearest real precedent for a *staged* celebration scene is
  [[out-run]] (1986), whose five destination endings include being presented with a trophy — and
  Out Run is already Level 21, so Act 7 would be borrowing from its own game.
- **Checkered flag:** F-Zero is a futuristic anti-gravity racer and no fetched source describes a
  checkered flag graphic in it; do not assert one. The earliest verified on-screen checkered flag
  in a video game in this research belongs to [[pole-position]] (1982) — see the Corrections block
  on [[monaco-gp]] for the full flag verdict.
- **Source availability note:** `strategywiki.org`, `mutecity.org` (the F-Zero Wiki) and
  `gamefaqs.gamespot.com` all returned **HTTP 403** on direct fetch this session, so the
  placement/points detail here rests on Wikipedia plus Hardcore Gaming 101, both fetched.

**Downstream flag (research may not edit these):** `js/speedway/**`. If any Act 7 string,
card, or animation implies F-Zero ranked you against rivals, or reproduces the elimination
threshold, it contradicts the act's own no-placement design — quote and correct rather than
ship. Suggested kid-safe card text (≤160 chars): *"F-Zero (1990) gave you a four-second speed
boost every time you finished a lap. Going fast was the prize for going around."*

## References

1. [F-Zero (video game) — Wikipedia](https://en.wikipedia.org/wiki/F-Zero_(video_game)) — Nintendo EAD; Miyamoto producer, Shimizu director; November 21 1990 Japan / August 23 1991 NA / 1992 Europe; Mode 7 described as a freely rotatable and scalable raster plane simulating 3D without polygons; single-player-only design and the lack of save progression; power meter depleting on collisions and recovering in pits; 15 tracks, three leagues, five laps; credited with inventing the futuristic-racing subgenre and influencing Wipeout and Daytona USA. **[fetched]**
2. [Review: F-Zero — The Game That Sold Us Mode 7 — Nintendo Life](https://www.nintendolife.com/reviews/snes/f-zero) — carries Shimizu's "it would shock everyone!" quote and the SNES-launch-title framing. *(search result only, not fetched)*
3. [F-Zero (game) — NintendoWiki (NIWA)](https://niwanetwork.org/wiki/F-Zero_(game)) — corroborating production credits and release data. Community-maintained; used only as a corroborating source. *(search result only, not fetched)*

**Added by the victory-research pass, 2026-09-13:**

4. [F-Zero (video game) — Wikipedia, Gameplay section](https://en.wikipedia.org/wiki/F-Zero_(video_game)) — supports the five-lap race structure, *"The player must complete each lap in a successively higher place to avoid disqualification from the race,"* and *"For each lap completed, the player is rewarded with an approximate four-second speed boost called the 'Super Jet' and a number of points determined by place"*; points accumulating into extra retry chances; the power meter depleting on collisions and recovering at pit areas; Grand Prix and Practice modes. **[fetched]**
5. [F-Zero — Hardcore Gaming 101](https://www.hardcoregaming101.net/f-zero/) — supports *"only the best three racers count as winners in the end,"* the "safe" placement limit starting at 15th and tightening each round with disqualification at the finish line, the race ending immediately below 20th, being *"awarded a score according to your ranking,"* the three cups of five tracks, the boost strips and 500+ km/h speeds, the repair-strip energy recovery, and the machine exploding when energy empties. **[fetched]**
6. [F-Zero (SNES) — VGJUNK](http://retrovania-vgjunk.blogspot.com/2014/11/f-zero-snes.html) — the only located source that actually describes the *celebration*: the camera *"spinning… into a side-on position"* on the winning craft; the league reward being *"footage of your craft zooming around the track shot from various angles as your lap times are displayed — and that's it"*; the Master-difficulty ending being *"a top-down view of your vehicle and… some generic congratulatory message"*; and the judgement that the thin payoff is *"probably F-Zero's single biggest flaw."* Long-running retro-games blog — treated as the reference of record for this specific visual detail, flagged as single-source. **[fetched]**
7. [F-Zero X — Wikipedia](https://en.wikipedia.org/wiki/F-Zero_X) *(ghost-car pass, 2026-09-13)* — the 1998 sequel's Time Attack ghosts: *"Transparent re-enactments of Time Attack performances, allow racing against ghost racers, recorded by the player or game developer,"* up to three simultaneous player ghosts, one recording saved per track. Cited to date the ghost feature to the sequel, not the 1990 original. **[fetched]**
