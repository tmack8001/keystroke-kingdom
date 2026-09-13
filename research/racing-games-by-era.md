# Racing Games by Era
## The generational spine of the driving game, 1974 → now — research for Act 7 ("Speed / Racing")

*Compiled 2026-09-12 by the arcade-historian for Trevor's Act 7 design. Act 6 (Text Worlds)
is the **no-speed** wing — typing as thought. Act 7 is its complement: **typing AT speed,
framed as racing**. This document is the factual spine a product spec gets built on; it is
deliberately heavier on **what the player actually DID** and **how each game punished them**
than on trivia, because the punishment column is the part that has to be redesigned before
any of it can enter Keystroke Kingdom.*

**How to verify.** Every claim below follows the arcade-historian citation standard
(`.claude/agents/arcade-historian.md`): 2–4 references per item, preference order
institutional/primary → established journalism → Wikipedia-as-one-of-several (never alone);
**no URL written from memory** — every link appeared in a live search result or was fetched
this session. References are labelled **[fetched]** (read and confirmed to support the claim)
or *(search result only, not fetched)*. Roughly half of the URLs here were directly fetched.
Atomic per-game pages live in `research/wiki/games/`; the technical definition of "sim" lives
in [[sim-racing]]; the typing-as-racing precedent lives in [[typing-as-racing]].

**Update 2026-09-13 — read §16 first if you are building a track.** Act 7 "THE SPEEDWAY"
shipped with [[monaco-gp]] and [[f-zero]] playable. §1–§15 below are the *arc*; **§16 is the
cabinet-build depth** for the nine remaining stations (rendering technique, road geometry,
signature moment, completion state, punishment to strip, cabinet appearance, palette), plus the
two open decisions settled with evidence — and **three ratings corrections to §8, §9, §11 and
§15 of this document**, made after discovering that ESRB rates **per platform** and this
document had been quoting Game Boy Advance ports' ratings as if they were the console games'.

**Update 2026-09-13 (second) — §17 is new and corrects §16.** A cabinet-precedent pass found that
this document (§16c item 6) and [[mario-kart]] both stated *"no arcade Super Mario Kart exists"*
as an absolute with a "do not draw one" instruction attached. **Licensed Mario Kart arcade
cabinets have existed since 2005 and are sold new today** ([[mario-kart-arcade-gp]]). §17 carries
the correction, the documented precedent for building home games into cabinets
([[home-games-in-cabinets]]), and a **per-station "what to draw" table** for Act 7's console/PC
entries ([[console-hardware-silhouettes]]).

**Related:** [[video-game-history]] · [[arcade-cabinets-by-era]] · [[super-scaler]] ·
[[early-3d-era]] · [[discrete-logic-era]] · [[sixteen-bit-era]] · [[home-games-in-cabinets]] ·
[[mario-kart-arcade-gp]] · [[nintendo-vs-system]] · [[console-hardware-silhouettes]] ·
`.claude/rules/levels.md` · `docs/ROADMAP.md` §2

---

## 0. The four things to read first

1. **Excitebike is a great station but a weak *opening* station.** It is real, it is
   Nintendo, it is 1984 — but a generational arc that starts in 1984 skips the entire
   first decade of the genre, including the two things Keystroke Kingdom already cares
   about most: 1979 and discrete logic. See §1 and the Excitebike verdict in §3.
2. **Out Run is already Level 21.** The Super Scaler era must be represented by a
   *different* cabinet. [[hang-on]] (Sega, July 1985) is the correct substitute — it is
   Out Run's direct technological parent, not a reskin. See §11.
3. **Grand Theft Auto should not be in this act.** Not on taste — on evidence: ESRB
   M 17+, an unprecedented retroactive Adults Only re-rating, and an FTC enforcement
   action. Worse for the design, GTA is the game that *left* the racing genre. See §9.
4. **Typing genuinely exists in racing, and the precedent is strong.** TypeRacer (2008)
   is a racing game whose only input is typing, and it has been the dominant model for a
   generation of school typing practice. Act 7 is not inventing a metaphor — it is
   reclaiming one. See §10 and [[typing-as-racing]].

---

## 1. The pre-history nobody skips to (1974–1980) — discrete logic, overhead, one colour

The genre is older than Excitebike by a decade, and its first decade is **exactly the
graphic-fidelity bar Keystroke Kingdom's Act 1 already draws** — TTL logic, monochrome CRTs,
colour faked with cellophane, rectangles for cars. That is not a coincidence to waste.

### [[gran-trak-10]] — Atari, May 1974, arcade
- **The first.** The first arcade car-driving video game, and the first video game to use a
  **steering wheel**. It shipped with a wheel, accelerator *and* brake pedals, and a four-position
  gear stick (R/1/2/3) — the full driving-controls vocabulary, present at the genre's birth.
- **Rendering:** monochrome, overhead, fixed single-screen track built from pylon walls.
  Believed to contain the **first use of integrated-circuit (mask ROM) memory in an arcade
  game** to store its graphics — a real computing-history beat, not just a car beat.
- **Punishment:** a countdown timer starting at 78 seconds; hitting a pylon wall crashes and
  spins the car.
- **Footnote worth telling a grown-up:** Atari mispriced it and lost about $100 per cabinet,
  contributing to a ~$500,000 fiscal-year loss — roughly everything the company had made the
  year before.

### [[speed-race]] — Taito, November 1974, arcade (designer: Tomohiro Nishikado)
- **What it changed:** **scrolling.** Nishikado animated the road and modulated oncoming-car
  speed to make the world move past a fixed player car — the first vertically scrolling video
  game, and the ancestor of every scrolling game that follows. (The same designer later made
  [[space-invaders]], which is already Level 2.)
- **Punishment — the worst offender in this whole document:** colliding with a car "resets the
  player's speed and starts them at the beginning of the track." A 90-second timer, extendable
  by points. Total-progress-loss on a mistake. This is the precise mechanic the One Rule exists
  to forbid.

### [[night-driver]] — Atari, October 1976, arcade (lead: Dave Shepperd)
- **What it changed:** **first-person.** Among the first published video games with real-time
  first-person graphics — the road drawn as scaled white rectangles ("pylons") receding into
  black, with the car's hood painted on a **plastic overlay taped to the monitor** rather than
  drawn. A gorgeous, honestly cheap trick, and trivially recreatable in canvas.
- **Precision point:** it was *inspired by* an earlier German coin-op, **Nürburgring 1**
  (Reiner Foerst, earlier in 1976), so "the first first-person driving game" is an
  overclaim — say "one of the first," or "the first American one."
- **Punishment:** timed session; leaving the road crashes you.

### [[monaco-gp]] — Sega, November 1979, arcade
- **Why this matters more than any other entry here:** it is **1979** — the year Keystroke
  Kingdom's arcade is set in — and it is **one of the last Sega arcade games built from TTL
  discrete logic instead of a CPU** (over 100 chips across two boards). It is era-authentic to
  the game's own fiction *and* to Act 1's rendering bar, with no compromise.
- **Rendering:** overhead, scrolling road, five areas; difficulty escalates as rival cars speed
  up, the road narrows, and the surface changes to ice and gravel — an early ancestor of the
  surface-friction idea [[sega-rally-championship]] would formalise sixteen years later. Three
  cabinet styles including a padded-wheel sit-down cockpit.
- **Commercial:** top-three highest-grossing game in Japan in 1979; the top-grossing driving
  game in the US in 1981.
- **Punishment:** race against a clock; collisions destroy your car.

**References — §1**
- [Gran Trak 10 — Wikipedia](https://en.wikipedia.org/wiki/Gran_Trak_10) — May 1974 Atari release; wheel/pedals/gear stick; first driving game and first steering wheel; mask-ROM graphics; 78-second timer; the $500,000 loss. **[fetched]**
- [Gran Trak 10 — Museum of the Game (arcade-museum.com/KLOV)](https://www.arcade-museum.com/Videogame/gran-trak-10) — institutional arcade record for the 1974 Atari release. *(search result only, not fetched)*
- [Gran Trak 10 (1974) — arcade-history.com](https://www.arcade-history.com/?n=gran-trak-10&page=detail&id=3376) — corroborating cabinet/controls record. *(search result only, not fetched)*
- [Speed Race — Wikipedia](https://en.wikipedia.org/wiki/Speed_Race) — Taito, November 1974, Nishikado; the scrolling-road technique; 90-second extendable timer; collision resets speed and returns the player to the start; Midway's *Racer*/*Wheels* rebrands. **[fetched]**
- [Vertically scrolling video game — Wikipedia](https://en.wikipedia.org/wiki/Vertically_scrolling_video_game) — corroborates Speed Race (November 1974) as the first vertically scrolling video game. *(search result only, not fetched)*
- [Speed Race — Giant Bomb](https://giantbomb.com/wiki/Games/Speed_Race) — corroborating metadata for the 1974 Taito release. *(search result only, not fetched)*
- [Night Driver — Wikipedia](https://en.wikipedia.org/wiki/Night_Driver_(video_game)) — Atari, October 1976, Dave Shepperd; "one of the first" real-time first-person games; scaled-rectangle pylons + painted plastic hood overlay; the Nürburgring 1 precedence. **[fetched]**
- [Night Driver (1976) — arcade-history.com](https://www.arcade-history.com/game/26054/night-driver-upright-model) — corroborating cabinet record. *(search result only, not fetched)*
- [The (Pre) History of Night Driver — The Golden Age Arcade Historian](http://allincolorforaquarter.blogspot.com/2014/07/the-pre-history-of-night-driver-part-6.html) — long-form historian treatment of the Nürburgring 1 → Night Driver lineage. *(search result only, not fetched)*
- [Monaco GP — Wikipedia](https://en.wikipedia.org/wiki/Monaco_GP_(video_game)) — Sega, November 1979 Japan/US; one of Sega's last TTL discrete-logic arcade games (100+ chips, two boards); five areas with narrowing road and ice/gravel; three cabinet styles; 1979/1981 grossing claims. **[fetched]**
- [Monaco GP (1979) — MobyGames](https://www.mobygames.com/game/82587/monaco-gp/) — corroborating release metadata. *(search result only, not fetched)*
- [1979 in video games — Wikipedia](https://en.wikipedia.org/wiki/1979_in_video_games) — corroborates Monaco GP's place in the 1979 arcade year. *(search result only, not fetched)*

---

## 2. The sprite-scaled road (1982) — the shape racing games kept for a decade

### [[pole-position]] — Namco, September 16 1982 (Japan) / November 30 1982 (NA, licensed to Atari)
- **What it changed:** it invented the *picture* of a racing game — the **third-person rear
  view down a receding road whose vanishing point sways side to side through corners**, drawn
  with full-colour **scaling sprites**. Virtually every road racer for the next decade, Out Run
  included, is a descendant of this frame.
- **First real circuit:** the first racing video game with a track based on a **real racing
  circuit** — Fuji Speedway, in its 1982 configuration.
- **Commercial:** the highest-grossing arcade game in North America in **both 1983 and 1984**,
  and the most popular coin-op internationally in 1983.
- **Punishment (heavy, and structural):** a **qualifying lap** — you must beat a time on a
  one-lap trial *before you are allowed to race at all*; the race itself runs on a timer topped
  up per lap; hitting a roadside billboard **destroys the car in an explosion** and costs you a
  delay while a new one is placed.
- **Note on the arc:** Pole Position sits between Monaco GP's overhead 1979 and Hang-On's 1985
  Super Scaler hardware. It is the single most *important* pre-1985 racing game and the most
  recognisable to a parent.

**References — §2**
- [Pole Position — Wikipedia](https://en.wikipedia.org/wiki/Pole_Position) — Namco developer, Atari NA licence; September 16 1982 Japan / November 30 1982 NA; qualifying lap and per-lap time top-ups; billboards destroying the car; scaling sprites and the swaying vanishing point; first real-circuit (Fuji Speedway) claim; highest-grossing 1983 and 1984. **[fetched]**
- [Racing Game History: Namco's Pole Position (1982) — Podium Life](https://podiumlife.com/racing-game-history-namcos-pole-position-1982/) — genre-history treatment corroborating the real-circuit first and the game's influence on the decade that followed. *(search result only, not fetched)*
- [Pole Position — Namco Wiki](https://namco.fandom.com/wiki/Pole_Position) — corroborating publisher/port metadata; fan-maintained, used only as a third corroborating source. *(search result only, not fetched)*

---

## 3. The 8-bit console racer (1984–1985) — Excitebike, and why it is a station rather than the start

### [[excitebike]] — Nintendo, November 30 1984 (Famicom) / October 18 1985 (NES, North America)
**Verified facts** (Trevor's anchor, checked rather than assumed):
- **Developer:** Nintendo **R&D4** (per Wikipedia's infobox) — *not* R&D1, which several search
  summaries assert. Treat the division label as the one soft spot in the entry; "Nintendo,
  directed/designed/produced by **Shigeru Miyamoto**" is safe and is corroborated everywhere.
- **Dates and platforms are as Trevor remembered them, and then some:** Famicom
  **November 30 1984**; NES North America **October 18 1985**; and an *arcade* version,
  **VS. Excitebike** on the Nintendo VS. System, **December 1984** (Japan) / **March 1985**
  (NA) per Wikipedia. *(A community wiki gives the more precise December 5 1984 / February 1985;
  the two do not agree, so use the month-level Wikipedia dates.)* Nintendo's own current store
  listing calls it "a motorcycle racing game released by
  Nintendo in **1984**" and confirms the arcade version **omits two-player and the track
  creation function**.
- **It is motocross, not cars** — side-on, jumps, landing angle matters. Worth saying out loud
  because an "arc of racing games" that opens on a dirt bike reads differently from one that
  opens on a car.
- **Signature mechanic:** the **temperature gauge**. Turbo is a button; hold it too long and the
  engine overheats and forces an immobile cooldown. Driving over arrow tiles resets the
  temperature. Crashes and badly-angled landings cost speed.
- **The genuinely remarkable feature:** **Design Mode** — a built-in track editor with 19 hurdle
  types, in 1984. In Japan tracks could be **saved to cassette via the Famicom Data Recorder**;
  the North American NES version **could not save at all**, because the Data Recorder never
  shipped outside Japan. (This is the kind of created-vs-shipped precision this project keeps
  getting burned by — the editor existed everywhere, the *saving* did not.)
- **Side effect worth a history card:** Excitebike's smooth-acceleration side-scrolling engine
  fed directly into **Super Mario Bros.** (1985) — the reason Mario accelerates from a walk to a
  run instead of moving at a constant speed. Super Mario Bros. is already Level 9, so this is a
  cross-link the curriculum can actually cash.

**Verdict on Excitebike as the opening anchor:** keep it, move it. It is a superb *station* —
the level editor alone rhymes with Act 6's "Your Own World" maker, and the overheat gauge is the
most interesting reframe problem in the act. But as an **opening** it starts the arc ten years
late and skips the discrete-logic decade that Keystroke Kingdom's own Act 1 already renders
beautifully. **Open on [[monaco-gp]] (Sega, November 1979)** — same year as the game's fiction,
same TTL-era art bar, and a straight line from there to Pole Position → Excitebike. If a
one-station cold open is wanted instead, [[gran-trak-10]] (1974) is the "this is where it all
began" pick. Excitebike then lands as station 3, where it is strongest.

**References — §3**
- [Excitebike — Wikipedia](https://en.wikipedia.org/wiki/Excitebike) — Nintendo R&D4; Famicom November 30 1984, NES NA October 18 1985, VS. arcade December 1984/March 1985; Miyamoto director/designer/producer; the temperature/overheat gauge and arrow resets; Design Mode's 19 hurdle types; NES-can't-save vs Famicom Data Recorder; the Super Mario Bros. acceleration lineage. **[fetched]**
- [Arcade Archives EXCITEBIKE — Nintendo official store](https://www.nintendo.com/us/store/products/arcade-archives-excitebike-switch/) — Nintendo's own words: "a motorcycle racing game released by Nintendo in 1984"; confirms the VS.SYSTEM version lacks two-player and track creation. **[fetched]**
- [Arcade Archives VS. Excitebike review — Nintendo World Report](http://www.nintendoworldreport.com/review/48474/arcade-archives-vs-excitebike-switch-review) — corroborates the VS. arcade variant's differences from the NES game. *(search result only, not fetched)*
- [VS. Excitebike — Nintendo Wiki (miraheze)](https://nintendo.miraheze.org/wiki/VS._Excitebike) — corroborating arcade release dates (December 5 1984 Japan / February 1985 NA). *(search result only, not fetched)*

---

## 4. Super Scaler (1985–1988) — the era Out Run owns, so use its parent

### [[hang-on]] — Sega, July 2 1985 (Japan) / July 22 1985 (NA)
- **What it changed:** two things at once. Technologically, it is the **first Super Scaler
  game** — Yu Suzuki's sprite-scaling hardware that computes true 3D position/scale/zoom and
  converts the result back into fast 2D sprites (the technique described in full on
  [[super-scaler]], and the direct ancestor of [[out-run]]). Physically, its deluxe cabinet is a
  **ride-on motorcycle you lean** — the start of Sega's "taikan" (body-sensation) motion-cabinet
  line.
- **Rendering:** one of the first arcade games with 16-bit graphics; high frame rate was the
  selling point.
- **Punishment:** a race against time across five stages; reaching a checkpoint **extends** the
  clock and carries leftover time forward; running off the track crashes the bike and launches
  the rider into the air.
- **Cabinet-rule note:** Hang-On is a *distinct game* from Out Run (different vehicle, different
  hardware generation, different designer intent), so it does not collide with Level 21 under
  the one-game-per-cabinet rule. Using Out Run's *era* without using Out Run is exactly what
  this substitution is for.
- **Small correction for the record:** one search summary attributed Hang-On to "Studio 128";
  Wikipedia's infobox says **Sega R&D1**. Use "Sega, conceived by Yu Suzuki."

**References — §4**
- [Hang-On — Wikipedia](https://en.wikipedia.org/wiki/Hang-On) — Sega R&D1; July 2 1985 Japan / July 22 1985 NA; 16-bit graphics and the Super Scaler board; the ride-on motion cabinet and the "taikan" trend; five stages with checkpoint time extension; crash behaviour. **[fetched]**
- [Super Scaler (concept) — Giant Bomb](https://www.giantbomb.com/super-scaler/3015-8389/games/) — corroborates Hang-On as the first title on the Super Scaler hardware family. *(search result only, not fetched)*
- [Hang-On — Internet Archive (playable arcade record)](https://archive.org/details/arcade_hangon) — archival record of the 1985 Sega arcade release. *(search result only, not fetched)*
- Existing in-wiki: [[super-scaler]] and [[out-run]] — Suzuki's own quote on the 3D→2D conversion, already citation-verified 2026-07-11.

---

## 5. Mode 7 and the 16-bit racer (1990–1992) — the console answer

### [[f-zero]] — Nintendo EAD, November 21 1990 (Japan, SNES launch title) / August 23 1991 (NA)
- **What it changed:** proved **Mode 7** — the SNES's ability to rotate and scale a single
  raster plane freely — could carry a whole game. Director Kazunobu Shimizu: *"I thought if we
  used that to make a racing game, it would shock everyone!"* It also invented the
  **futuristic/anti-gravity racer** subgenre that Wipeout later inherited.
- **Rendering:** one scaled-and-rotated ground plane + sprite scenery. No polygons. This is
  reproducible in canvas with an affine transform and is *visually unmistakable* — a strong
  theme target.
- **Punishment:** single-player only; a **power meter** that depletes on every collision and
  refills only in pit areas; a lives system; five laps per race across three leagues.

### [[mario-kart]] (Super Mario Kart) — Nintendo EAD, August 27 1992, SNES
*(page already exists, verified 2026-07-11 — extended this pass with mechanics and the Act 7 framing)*
- **What it changed:** invented **kart racing**. Mode 7 again, but with **horizontal split-screen
  two-player as the primary design constraint** — which is why its tracks are simpler than
  F-Zero's. The DSP-1 chip that made its maths work became the most widely used SNES DSP.
- **The coin mechanic is the single best design idea in this document for Keystroke Kingdom:**
  collected coins raise top speed, **and when you're hit you lose coins instead of spinning
  out.** A buffer that converts a penalty into a resource loss. That is a One-Rule-compatible
  shape, off the shelf, from 1992.
- **Punishment:** finish **5th or worse in a Grand Prix and you are "ranked out"** — replay the
  race using one of a limited pool of lives; run out and the game ends. Shells and bananas knock
  you over.
- **Franchise note:** ~8.76M copies (4th best-selling SNES title); the modern series entry
  **Mario Kart 8 / 8 Deluxe** is the **best-selling racing game ever**, past 70 million units.

**References — §5**
- [F-Zero (video game) — Wikipedia](https://en.wikipedia.org/wiki/F-Zero_(video_game)) — Nintendo EAD, Miyamoto producer / Shimizu director; November 21 1990 Japan, August 23 1991 NA, 1992 EU; Mode 7 described as a rotatable/scalable raster plane simulating 3D without polygons; single-player only; power meter and pit recovery; 15 tracks / three leagues / five laps; credited with inventing the futuristic-racing subgenre. **[fetched]**
- [Review: F-Zero — The Game That Sold Us Mode 7 — Nintendo Life](https://www.nintendolife.com/reviews/snes/f-zero) — carries Shimizu's "it would shock everyone" quote and the SNES-launch framing. *(search result only, not fetched)*
- [F-Zero (game) — NintendoWiki (NIWA)](https://niwanetwork.org/wiki/F-Zero_(game)) — corroborating credits/release data. *(search result only, not fetched)*
- [Super Mario Kart — Wikipedia](https://en.wikipedia.org/wiki/Super_Mario_Kart) — Mode 7 + the two-player-first design driving simpler tracks and the split-screen layout; item panels; the coins-raise-top-speed and lose-coins-instead-of-spinning mechanic; "ranked out" at 5th or worse, lives, extra life for three consecutive same-position finishes; Battle Mode balloons; 8.76M sales; the DSP-1 chip. **[fetched]**
- [Mario Kart 8 Deluxe Is Nintendo's Best-Selling Game Of All Time — GameSpot](https://www.gamespot.com/articles/mario-kart-8-deluxe-is-nintendo-best-selling-game-of-all-time/1100-6523297/) — the best-selling-racing-game framing and Switch sales context. *(search result only, not fetched)*
- [Updated Switch game sales figures put Mario Kart 8 Deluxe at nearly 70 million units — Nintendo Wire](https://nintendowire.com/news/2025/11/04/updated-switch-game-sales-figures-put-mario-kart-8-deluxe-at-nearly-70-million-units/) — corroborating unit figures. *(search result only, not fetched)*

---

## 6. Real polygons arrive (1988–1995) — three distinct rendering steps, not one

This is the era most likely to get compressed into a single "3D" station by mistake. There are
**three visually different things** here and a theme author should be told which one they're
drawing.

| Step | Game | Date | Rendering |
|---|---|---|---|
| Flat-shaded polygons, low count | Winning Run (Namco) | 1988 | First 3D-polygon racing arcade game |
| Flat-shaded + force-feedback sim cabinet | Hard Drivin' (Atari Games) | February 1989 | First 3D-polygon *driving simulator*; haptic wheel |
| Flat-shaded polygons at scale | [[virtua-racing]] (Sega AM2) | August 1992 | 6,500 polys/frame, ~30fps, four selectable camera views |
| **Texture-mapped** polygons + Gouraud shading | [[ridge-racer]] (Namco) | October 1993 | First arcade game with 3D texture mapping |
| Texture **filtering**, 8 linked cabinets | [[daytona-usa]] (Sega AM2) | March 1994 | Model 2 (built with GE Aerospace), ~300k textured polys/sec |
| Multi-**surface friction** | [[sega-rally-championship]] (Sega AM3) | February 1995 | First racer where asphalt/gravel/mud handle differently |

- **[[virtua-racing]]** is the flat-shaded, untextured look — bright solid-colour facets, no
  textures at all. Directed by Yu Suzuki, designed by Toshihiro Nagoshi, on the Sega Model 1.
  It introduced the **"V.R. View System"** — four selectable camera angles mid-race, now
  universal. Its Virtua Formula cabinet linked **up to eight** hydraulic motion rigs over
  fibre optic.
  **Correction to a very common claim:** Virtua Racing was *not* the first 3D-polygon racing
  game. Namco's **Winning Run (1988)** and Atari Games' **Hard Drivin' (1989)** both precede it.
  Virtua Racing's real first is *scale and smoothness*, not polygons per se.
- **[[ridge-racer]]** is where surfaces get **pictures on them** — the first arcade video game
  with 3D texture-mapped graphics and Gouraud shading, on Namco System 22. Its signature
  mechanic is **drifting**, modelled on Japanese mountain-road car culture. It became a
  PlayStation launch title (Japan December 3 1994; NA September 9 1995) and is a large part of
  why the PS1 beat the Saturn out of the gate.
- **[[daytona-usa]]** is the spectacle peak: Sega partnered with **GE Aerospace** (flight-
  simulator people) to build the Model 2, up to 300,000 texture-mapped polygons per second with
  texture filtering, and up to **eight players on linked cabinets**. Three courses. One of the
  highest-grossing arcade games of all time.
- **[[sega-rally-championship]]** (Sega AM3, February 1995) is the first racing game where
  **the road surface changes how the car behaves** — asphalt, gravel and mud with different
  friction. Every rally and off-road game since is downstream of it.
  **Correction:** commonly dated 1994 and credited to "AM5"; Wikipedia gives **AM3, February
  1995 (Japan)**.

**Punishment across this whole block:** the arcade coin-op contract — **a countdown timer,
checkpoints that grant more time, and the race simply ENDING when the clock hits zero.**
Daytona USA adds adaptive AI that helps weak players and actively blocks strong ones.

**References — §6**
- [Virtua Racing — Wikipedia](https://en.wikipedia.org/wiki/Virtua_Racing) — Sega AM2, Yu Suzuki director, Toshihiro Nagoshi artist; August 1992 Japan / October 1992 NA; Sega Model 1 developed 1990–91; 6,500 polygons per frame; explicitly states Winning Run (1988) and Hard Drivin' (1989) predate it; the V.R. View four-camera system; Virtua Formula linking up to eight motion cabinets over fibre optic. **[fetched]**
- [Hard Drivin' — Wikipedia](https://en.wikipedia.org/wiki/Hard_Drivin') — Atari Games, February 1989; first driving *simulator* with 3D polygons; haptic vibrating wheel; second arcade game overall to use 3D polygons, after Winning Run. *(search result only, not fetched)*
- [Hard Drivin' — Museum of the Game (KLOV)](https://www.arcade-museum.com/Videogame/hard-drivin) — institutional arcade record for the 1989 Atari Games cabinet. *(search result only, not fetched)*
- [Ridge Racer (1993) — Wikipedia](https://en.wikipedia.org/wiki/Ridge_Racer_(1993_video_game)) — Namco, October 1993 Japan / November 30 1993 NA; System 22; first arcade game with 3D texture-mapped graphics + Gouraud shading; drifting as the core handling model and its Japanese mountain-road origin; time limit with checkpoint extensions; PlayStation launch-title dates. **[fetched]**
- [Ridge Racer (1993) — arcade-history.com](https://www.arcade-history.com/?id=2217&page=detail) — corroborating arcade hardware/release record. *(search result only, not fetched)*
- [Daytona USA — Wikipedia](https://en.wikipedia.org/wiki/Daytona_USA) — Sega AM2, March 1994 Japan/NA, April 1994 worldwide; the GE Aerospace partnership and Model 2; 300,000 texture-mapped polygons per second; texture filtering; up to eight linked cabinets; three named courses; highest-grossing-of-all-time framing; checkpoint-extends-the-timer loop and the adaptive-difficulty AI. **[fetched]**
- [Daytona USA case study — Brown University CS196-2 course materials (PDF)](https://cs.brown.edu/courses/cs196-2/2008/Course_Info_files/case_study_daytona.pdf) — university course case study of Daytona USA as a design/technology artefact. *(search result only, not fetched)*
- [Sega Rally Championship — Wikipedia](https://en.wikipedia.org/wiki/Sega_Rally_Championship) — Sega AM3, February 1995 Japan, Sega Model 2; the multiple-surface friction feature and the "first racing game to incorporate this" milestone claim; the carried-position stage structure and per-stage time limits. **[fetched]**
- [Sega Rally Championship — Museum of the Game (KLOV)](https://www.arcade-museum.com/Videogame/sega-rally-championship) — institutional arcade record. *(search result only, not fetched)*

---

## 7. The split: arcade racer vs simulator (1989–1998)

From here the genre forks, and Act 7's back half has to choose a side per station. The
simulation branch is the one Trevor's "ending on an F1 simulation" instinct is reaching for,
and it is **older than most people think — it starts in 1989, on a PC, not in an arcade.**

### [[indianapolis-500-the-simulation]] — Papyrus Design Group / Electronic Arts, 1989, MS-DOS
- Widely regarded as the personal computer's **first true auto-racing simulation**: a car you
  **set up** (tyres, shocks, wings) whose setup genuinely changes how it handles, with changes
  applied live in practice and only in the pits during a race, plus a six-camera, 20-second
  replay system. Designed by **David Kaemmer** and Omar Khudari.
- **Straight line to the present:** this is the first game by the organisation that becomes
  **[[iracing]]**. One studio lineage runs 1989 → NASCAR Racing → Grand Prix Legends → iRacing,
  and it is the cleanest possible narrative spine for the "sim" half of the act.
- *Caution:* Wikipedia does **not** itself assert "first true auto racing simulation" — that
  framing comes from genre-history sources. Attribute it as "widely regarded as," not as fact.

### [[formula-one-grand-prix]] (Geoff Crammond / MicroProse, 1991, Amiga/Atari ST/PC)
- The **first authentic simulation of the Formula One World Championship** — the real cars and
  all 16 circuits of the 1991 calendar — modelling tyre wear and damage, with manual or
  automatic gears and a driving-line aid. The direct ancestor of every licensed F1 game.
- *(This entry is documented here in the hub rather than as its own wiki page — see
  "Unsourceable / weakly-sourced" below for why its sourcing is one notch thinner than the rest.)*

### [[nascar-racing-1994]] — Papyrus, November 2 1994 (MS-DOS; Virgin Interactive)
- The game that proved **ultra-realistic racing was not a niche market**: >1 million units for
  the original, >2 million for it and its sequel by March 1998. PC Gamer's editors called it
  "the best racing game ever created" at the time.
- This is the **correct, era-honest home for Trevor's "NASCAR" anchor** — and note that
  [[daytona-usa]] (March 1994) is the *arcade* NASCAR-flavoured answer to the same cultural
  moment, eight months earlier. Two very different games about the same sport, in the same year:
  a genuinely lovely pairing for an act about arcade-vs-simulation.

### [[grand-prix-legends]] — Papyrus / Sierra Sports, October 1998, Windows
- Papyrus scrapped and rebuilt its physics engine from scratch for this; it recreates the
  **1967 Formula One season**, with developers visiting town halls to obtain blueprints of
  tracks that no longer existed. Cult status for ultra-realistic physics and brutal difficulty;
  it sold only ~200,000 copies by 2004 and is *still* modded today.
- **For the One Rule this is the cautionary extreme:** its defining quality is that it is
  punishingly hard, on purpose, and that is exactly the thing Keystroke Kingdom exists to not
  be. Cite it as history; do not imitate its feel.

### [[gran-turismo]] — Polys Entertainment (later Polyphony Digital) / Sony, December 23 1997 (Japan), May 1998 (EU/NA), PlayStation
- Tagline: **"The Real Driving Simulator."** Five years and ~$5M of development under
  **Kazunori Yamauchi**; 140 cars and 11 tracks; praised for "sophisticated and believable
  physics"; 10.85 million copies — the best-selling PlayStation title.
- **The mechanic Act 7 must look at hardest: the licence tests.** A structured curriculum of
  graded driving exercises that *teach* braking points and racing lines, and gate content behind
  them. It is a pedagogy system inside a racing game — the closest thing in this whole document
  to what Keystroke Kingdom already does. **But it grades you gold / silver / bronze / FAIL,
  and fail means you don't get the car.** Take the curriculum; delete the fail state. (See §12.)

**References — §7**
- [Indianapolis 500: The Simulation — Wikipedia](https://en.wikipedia.org/wiki/Indianapolis_500:_The_Simulation) — Papyrus Design Group, EA publisher, 1989 MS-DOS / 1990 Amiga; realistic car setup affecting handling, practice-vs-pit adjustment rules; six camera angles and 20-second replay; "the first game developed by the organisation that would later become iRacing." **[fetched]**
- [Indianapolis 500: The Simulation — MobyGames](https://www.mobygames.com/game/5/indianapolis-500-the-simulation/) — corroborating credits (Kaemmer, Khudari) and release metadata. *(search result only, not fetched)*
- [Indianapolis 500: The Simulation — Retro365](https://retro365.blog/2023/08/22/indianapolis-500-the-simulation/) — long-form retrospective corroborating the tyre-contact-patch/grip physics framing and December 1989 EA release. *(search result only, not fetched)*
- [Indianapolis 500: The Simulation — DOS Days](https://www.dosdays.co.uk/topics/Games/game_indy500.php) — corroborating platform/publisher record. *(search result only, not fetched)*
- [Formula One Grand Prix (video game) — Wikipedia](https://en.wikipedia.org/wiki/Formula_One_Grand_Prix_(video_game)) — Geoff Crammond / MicroProse 1991; Amiga, Atari ST, PC; the 1991 calendar's 16 circuits. *(search result only, not fetched)*
- [The Making Of Geoff Crammond's Formula One Grand Prix Series — Time Extension](https://www.timeextension.com/features/best-of-2025-the-making-of-geoff-crammonds-formula-one-grand-prix-series) — games-journalism making-of corroborating the series' landmark status and feature set (tyre wear, damage, driving line). *(search result only, not fetched)*
- [NASCAR Racing (video game) — Wikipedia](https://en.wikipedia.org/wiki/NASCAR_Racing_(video_game)) — Papyrus; November 2 1994 MS-DOS, Virgin Interactive; 350k units by December 1995, >1M by 2004, >2M for the series by March 1998; PC Gamer's "best racing game ever created" and 1994 Best Sports Game award. **[fetched]**
- [History of Papyrus Racing Games — GameSpot](https://www.gamespot.com/articles/history-of-papyrus-racing-games/1100-6103365/) — established-journalism history of the Papyrus studio lineage. *(search result only, not fetched)*
- [Grand Prix Legends — Wikipedia](https://en.wikipedia.org/wiki/Grand_Prix_Legends) — Papyrus / Sierra Sports, October 1998, Windows; the 1967 F1 season; three-year development, 25–30 people, town-hall blueprint research; from-scratch physics rebuild; ~84% GameRankings but only ~200,000 sales by 2004; enduring mod community. **[fetched]**
- [Gran Turismo (1997) — Wikipedia](https://en.wikipedia.org/wiki/Gran_Turismo_(1997_video_game)) — Polys Entertainment → Polyphony Digital; Kazunori Yamauchi director; December 23 1997 Japan / May 8 1998 EU / May 12 1998 NA; five years and $5M; 140 cars, 11 tracks; the licence-test system and reviewers finding it harder than the races it unlocks; 10.85M copies, best-selling PlayStation title; 96 Metacritic. **[fetched]**
- [Origin Story: Kazunori Yamauchi & Shuhei Yoshida Look Back at Gran Turismo's Inception — PlayStation.Blog](https://blog.playstation.com/2017/10/13/origin-story-kazunori-yamauchi-shuhei-yoshida-look-back-at-gran-turismos-inception/) — first-party account of the game's five-year origin. *(search result only, not fetched)*
- [Why Gran Turismo was a true game changer — RacingGames.gg](https://racinggames.gg/article/why-gran-turismo-was-a-true-game-changer) — corroborates "The Real Driving Simulator" positioning and the licence-test design. *(search result only, not fetched)*

---

## 8. The modern era (1999–2014) — where Trevor's third anchor lives

This is the slot Trevor described as "Grand Theft Auto / Need for Speed / NASCAR." Two of those
three are straightforward; the third is §9.

### [[need-for-speed]] (Road & Track Presents: The Need for Speed) — Pioneer Productions / EA Canada, December 1994, 3DO
- The *first* NFS is older than people remember and is a **quasi-simulation**: EA partnered with
  **Road & Track** magazine for precise vehicle data, down to reproducing the sound of each car's
  gear lever, and shipped each of the eight licensed cars with commentary and real video footage.
- **Signature mechanic:** **police pursuit** on point-to-point roads. Getting caught issues a
  ticket; three tickets and you're arrested.
- The series later swung hard to arcade street racing — **Need for Speed: Underground** (2003),
  which is ESRB **E for Everyone (Mild Lyrics)** and is the era-correct, kid-safe choice if a
  2000s street-racing station is wanted.

### The rest of the modern menu, with ratings checked
| Title | Year | Why it might fit | ESRB |
|---|---|---|---|
| Midnight Club: Street Racing | Oct 26 2000 | Open-city street racing, Angel Studios / Rockstar San Diego | **E** |
| Burnout (series) | 2001– | Speed + spectacle; crash and takedown mechanics | Burnout 3 **T**; Burnout Paradise **E10+** (Language, Violence) |
| Crazy Taxi | 1999 | Arcade driving, joyful, timer-driven | **E10+** (Language, Mild Violence) |
| Need for Speed: Underground | 2003 | The 2000s street-racer, era-defining | **E** (Mild Lyrics) |
| Forza Horizon | Oct 23 2012 | Modern open-world driving at festival scale | **T** — Drug Reference, Language, Suggestive Themes |
| Gran Turismo (series) | 1997– | Simulation | **E** throughout |
| Mario Kart 8 Deluxe | 2017 | Best-selling racing game ever | (Nintendo E-rated series) |

**Note the surprise in that table:** **Forza Horizon is T-rated**, for drug references and
profanity in its dialogue — the ESRB summary quotes "drug-fueled jerks" and two profanities. It
is *not* a drop-in kid-safe alternative to GTA, and it is exactly the kind of
"plausible-but-wrong" assumption this project keeps catching. **Midnight Club: Street Racing
(E)** and **Need for Speed: Underground (E)** are the rating-clean open-road picks.

**References — §8**
- [The Need for Speed — Wikipedia](https://en.wikipedia.org/wiki/The_Need_for_Speed) — EA Canada / Pioneer Productions, December 1994, 3DO; the Road & Track partnership and the vehicle data it supplied; eight licensed cars with commentary and video; the ticket/arrest police-pursuit mechanic; three point-to-point courses. **[fetched]**
- [Road & Track Presents: The Need for Speed (DOS) — The Cutting Room Floor](https://tcrf.net/Road_&_Track_Presents:_The_Need_for_Speed_(DOS)) — technical/archival corroboration of the DOS release and its content. *(search result only, not fetched)*
- [Forza Horizon — ESRB rating record](https://www.esrb.org/ratings/32420/forza-horizon/) — institutional: **T (Teen)**, Drug Reference / Language / Suggestive Themes, with the quoted rating summary. **[fetched]**
- [Need for Speed Underground — ESRB rating record](https://www.esrb.org/ratings/9569/need-for-speed-underground/) — institutional: **E**, Mild Lyrics. *(search result only, not fetched)*
- [Burnout Paradise — ESRB rating record](https://www.esrb.org/ratings/23925/burnout-paradise/) — institutional: **E10+**, Language, Violence. *(search result only, not fetched)*
- [Crazy Taxi — ESRB rating record](https://www.esrb.org/ratings/29583/crazy-taxi/) — institutional: **E10+**, Language, Mild Violence. *(search result only, not fetched)*
- [Midnight Club Street Racing — ESRB rating record](https://www.esrb.org/ratings/6916/midnight-club-street-racing/) — institutional: **E — but this record is the GAME BOY ADVANCE port.** The PlayStation 2 game is **T (Animated Violence)**. Corrected 2026-09-13; see §16. *(search result only, not fetched)*
- [Gran Turismo — ESRB rating record](https://www.esrb.org/ratings/3213/gran-turismo/) — institutional: **E**. *(search result only, not fetched)*
- [Midnight Club: Street Racing — Wikipedia](https://en.wikipedia.org/wiki/Midnight_Club:_Street_Racing) — Angel Studios (later Rockstar San Diego), PS2 October 26 2000 NA. *(search result only, not fetched)*
- [Burnout (series) — Wikipedia](https://en.wikipedia.org/wiki/Burnout_(series)) — Criterion Games; the 2001 original's near-miss/risk reward loop; Crash mode arriving in Burnout 2; Takedowns arriving in Burnout 3. *(search result only, not fetched)*
- [Forza Horizon — Wikipedia](https://en.wikipedia.org/wiki/Forza_Horizon) — Playground Games / Microsoft Studios, Xbox 360, October 23 2012; open world; the fictional Horizon Festival. *(search result only, not fetched)*

---

## 9. ⚠️ Grand Theft Auto — the straight answer

**Recommendation: do not put Grand Theft Auto in Act 7, in any form — not as a cabinet, not as
a history card, not as an easter egg.** This is not squeamishness; it is three independent
findings, two of them from regulators.

**Finding 1 — the ratings record is disqualifying on its face.**
[[grand-theft-auto]] III is rated **M for Mature 17+** by the ESRB with descriptors **Blood,
Strong Language, Violence** (verified on ESRB's own record). That alone places it outside a game
built for a child learning to read.

**Finding 2 — the franchise is the *only* major retail release in ESRB history to be
retroactively re-rated Adults Only, and it drew a federal enforcement action.** On July 20 2005
the ESRB revoked San Andreas's M rating and reclassified it **AO (Adults Only 18+)** after
concluding sexually explicit content existed in fully rendered form on the shipped discs. On
June 8 2006 Rockstar and Take-Two **settled FTC charges** that they failed to disclose that
content; the settlement required a disabling patch, re-labelling/recall costing $24.5 million,
an M-rated re-release, mandatory content-review systems, and civil penalties up to $11,000 per
future violation. Keystroke Kingdom's easter-egg rules already require every reference to be
"harmless to a child who stumbles on it," and already reject content with the wrong emotional
register. A franchise with a *federal consent order about undisclosed sexual content* is not a
close call.

**Finding 3 — and this is the part that should actually settle it for a historian:
GTA is not a racing game, and its own history says so out loud.** It began at DMA Design in
March 1995 as **"Race'n'Chase,"** whose design document described "a fun, addictive, fast-paced
multiplayer car racing and crashing game" with cannonball-run and demolition-derby modes. The
team then *deliberately left the racing genre*: creative director Gary Penn's summary is
"nobody wants to be the cop, it's more fun to be bad." The thing GTA is famous for is precisely
the thing it became *after* it stopped being a racing game. Its real, durable contributions to
driving games — persistent open-world driving and **in-car radio stations** — are both things
Act 7 can teach without it: the radio-station idea is documented as running from **[[out-run]]
(1986) → GTA**, and Out Run is already Level 21. *Keystroke Kingdom therefore already owns the
ancestor of the one GTA feature worth citing.*

**What to put in that slot instead**, in order of recommendation:
1. ~~**Midnight Club: Street Racing** (2000, **ESRB E**)~~ **SUPERSEDED 2026-09-13 — the PS2 game is ESRB T (Animated Violence); the E record is the GBA port. Use NFS: Underground instead (§16).** The era-correct open-city night-racing
   game, and it is rating-clean.
2. **Need for Speed: Underground** (2003, **ESRB E**) — the definitive 2000s street racer, and
   it keeps Trevor's "Need for Speed" anchor while landing on the series' kid-safe entry.
3. **Burnout Paradise** (**E10+**) — if open-world *speed* is the feeling wanted; note the
   Violence descriptor and that the series' signature mechanics are literally called "Crash" and
   "Takedown," which need heavy reframing under the One Rule.
4. **Crazy Taxi** (**E10+**) — closest to arcade joy, but timer-driven to its bones.
5. *Not* Forza Horizon as a naive "safe" substitute — it is **T-rated** (see §8).

**If Trevor wants the open-world-driving *idea* preserved without the game**, the honest,
kid-safe framing is: *"in the 1990s, driving games stopped having a finish line and started
having a city"* — a true statement about the genre that needs no GTA cabinet to make it.

**References — §9**
- [Grand Theft Auto III — ESRB rating record](https://www.esrb.org/ratings/34293/grand-theft-auto-iii/) — institutional/primary: M for Mature 17+, descriptors Blood, Strong Language, Violence. **[fetched]**
- [Makers of Grand Theft Auto: San Andreas Settle FTC Charges — U.S. Federal Trade Commission](https://www.ftc.gov/news-events/news/press-releases/2006/06/makers-grand-theft-auto-san-andreas-settle-ftc-charges) — institutional/primary: the June 8 2006 settlement, the undisclosed content, the ESRB's AO re-rating, the $24.5M re-labelling cost and the $11,000-per-violation penalty term. **[fetched]**
- [ESRB Concludes Investigation Into Grand Theft Auto: San Andreas, Revokes M (Mature) Rating — ESRB](https://www.esrb.org/blog/esrb-concludes-investigation-into-grand-theft-auto-san-andreas-revokes-m-mature-rating/) — the ratings board's own statement of the AO re-rating and its reasoning. *(search result only, not fetched)*
- [San Andreas rated AO, Take-Two suspends production — GameSpot](https://www.gamespot.com/articles/san-andreas-rated-ao-take-two-suspends-production/1100-6129500/) — contemporaneous journalism dating the July 20 2005 re-rating and the retail withdrawal. *(search result only, not fetched)*
- [FTC, Take-Two Settle Over GTA Hot Coffee Mod — Game Developer](https://www.gamedeveloper.com/game-platforms/ftc-take-two-settle-over-i-gta-i-hot-coffee-mod) — trade-press corroboration of the settlement terms. *(search result only, not fetched)*
- [Grand Theft Auto (video game) — Wikipedia](https://en.wikipedia.org/wiki/Grand_Theft_Auto_(video_game)) — DMA Design; the "Race 'n' Chase" origin as a police-pursuit/racing concept and Gary Penn's "nobody wants to be the cop" reframing; top-down perspective; in-game radio stations composed in-house; Max Clifford's controversy-led marketing; November/December 1997 release dates. **[fetched]**
- [Race'n'Chase — Grand Theft Wiki](https://www.grandtheftwiki.com/Race'n'Chase) — domain-canonical community wiki quoting the original design document's "fun, addictive, fast-paced multiplayer car racing and crashing game" wording and its cannonball-run/demolition-derby modes. *(search result only, not fetched)*
- [Read The Humble Beginnings of Grand Theft Auto From 16 Years Ago — Kotaku](https://kotaku.com/read-the-humble-beginnings-of-grand-theft-auto-from-16-5784228) — journalism reproducing the Race'n'Chase design-document material. *(search result only, not fetched)*
- [List of AO-rated video games — Wikipedia](https://en.wikipedia.org/wiki/List_of_AO-rated_video_games) — corroborates San Andreas's place as the landmark retroactive AO re-rating. *(search result only, not fetched)*
- Existing in-wiki: [[out-run]] — already documents the in-game radio-selection first "later adopted by Grand Theft Auto."

---

## 10. Did typing ever genuinely feature in racing? — **Yes, and it is the act's best precedent**

Honest answer: not in the commercial console/arcade racing canon. But in the **browser typing-
game canon, racing is the dominant metaphor**, and it has been for nearly twenty years.

- **TypeRacer** (Alex Epshteyn, **March 2008**) is a racing game whose *only* input is typing:
  each player drives a small car that advances as they type a passage, first to the finish line
  wins. It claims to be the first multiplayer typing game on the web, took its passages from
  books, films, songs and games, and made PC Magazine's "Top 100 Undiscovered Web Sites of
  2008." Epshteyn's stated motivation: the shareware typing tutor he learned on had no
  multiplayer.
- **Nitro Type** (Teaching.com, **2011**) took the same idea into classrooms with teacher
  dashboards, rostering and Google Classroom/Clever sign-on — the model most American
  schoolchildren actually meet. *(Sourcing here is thinner — see the weak-sources section.)*
- **The Typing of the Dead** (WOW Entertainment / Sega, **1999**, NAOMI arcade; Dreamcast 2000)
  is the other direction: not racing, but the canonical proof that **swapping a game's input
  device for a keyboard is a legitimate design move** — it is *The House of the Dead 2* with the
  light gun replaced by a keyboard, and in-fiction the agents carry keyboards wired to
  backpack Dreamcasts. It is also a good reminder of what *not* to import: its pressure loop is
  "type fast or the zombie reaches you."

**What this means for Act 7:** the "your car moves when you type" mechanic is not a novelty
Trevor is inventing — it is the field-tested standard, with a seventeen-year track record in
schools. Act 7's genuine originality will be in **removing the race-against-others pressure**
that TypeRacer and Nitro Type are built on, while keeping the forward motion. Full detail and
citations: [[typing-as-racing]].

---

## 11. The terminal point — what "F1 simulation" actually means

Trevor's instinct to end on an F1 sim is historically sound: the genre's fork that began with
Indianapolis 500 in 1989 terminates, today, in software that real racing teams and drivers use.
The technical definition matters, because "sim" is a marketing word most of the time.

**A game is a simulation, technically, when it models at minimum:**
1. **A tyre model** — not just grip, but temperature, wear and surface damage. Assetto Corsa's
   developer-written feature list names **"tyre flat spots, heat cycles including graining and
   blistering."** This is the single clearest dividing line: an arcade racer has friction, a sim
   has tyre *chemistry*.
2. **Fuel, wear and pit strategy as live variables** — Geoff Crammond's *Formula One Grand Prix*
   (1991) already modelled tyre wear and damage; a modern F1 title carries fuel load, energy
   recovery and ERS/KERS deployment.
3. **Aerodynamics as a live system** — Assetto Corsa advertises "active movable aerodynamics
   parts controlled in real time by telemetry input channels."
4. **Telemetry** — the game exports the same channel data an engineer reads (Assetto Corsa:
   "advanced setup options and telemetry for data analysis").
5. **Surveyed geometry** — modern sims **laser-scan (LIDAR)** real circuits to millimetre
   accuracy rather than modelling them by eye. iRacing is built on LIDAR-scanned cars and tracks;
   Kunos laser-scanned circuits with a survey truck.
6. **Force feedback** — the wheel pushes back. Consumer force feedback arrived at the end of the
   1990s: Logitech's WingMan Formula (1998) was its first wheel, with the force-feedback
   **WingMan Formula Force** following in 1999 using Immersion's I-Force technology over the
   then-new USB.

**Genuinely simulation** (by the above): the Papyrus line (Indianapolis 500 → NASCAR Racing →
Grand Prix Legends), Geoff Crammond's Grand Prix series, Gran Turismo (self-described "The Real
Driving Simulator"), **iRacing** (launched **August 26 2008**, by Papyrus co-founder **Dave
Kaemmer** with John W. Henry; subscription, server-hosted, LIDAR-scanned, with a licence
progression Rookie→D→C→B→A→Pro and official partnerships with **NASCAR, IMSA, World of Outlaws,
Porsche and the FIA**), and **[[assetto-corsa]]** (Kunos Simulazioni, **December 19 2014**,
developed at an R&D office inside the Vallelunga circuit with real drivers and teams).

**Arcade, not simulation**, whatever the box says: Daytona USA, Ridge Racer, Sega Rally, Need
for Speed (post-1994), Burnout, Mario Kart, F-Zero.

**The official F1 games specifically:** Codemasters has produced the official Formula 1 game
**since 2009**, under a licence running to 2025; **EA acquired Codemasters in a ~$1.2bn deal
completed February 2021**. The **F1 Esports Series launched in 2017**. And the ratings news is
good: **F1 23 and F1 24 are both ESRB E for Everyone** (Mild Language; Users Interact; In-Game
Purchases) — meaning **a genuine modern F1 simulation is, by rating, the most kid-appropriate
terminal station in the whole arc.** That is an unusually clean landing for Trevor's instinct.

**References — §11**
- [Assetto Corsa — Steam store page (Kunos Simulazioni's own product description)](https://store.steampowered.com/app/244210/Assetto_Corsa/) — primary developer text: December 19 2014 release; laser-scan track accuracy; tyre flat spots, heat cycles, graining and blistering; real-time active aerodynamics driven by telemetry channels; KERS/energy recovery; advanced setup and telemetry; development at the Vallelunga R&D office with real drivers and teams. **[fetched]**
- [iRacing — Wikipedia](https://en.wikipedia.org/wiki/IRacing) — Dave Kaemmer (Papyrus co-founder) with John W. Henry, FIRST.net LLC formed 2004; public launch August 26 2008; LIDAR-scanned cars and tracks; subscription + server-hosted sessions; incident points and the Rookie/D/C/B/A/Pro licence ladder; official partnerships with NASCAR, IMSA, World of Outlaws, Porsche and the FIA. **[fetched]**
- [How iRacing came to be — the Papyrus Design Group story — Traxion](https://traxion.gg/how-iracing-came-to-be-the-papyrus-design-group-story/) — corroborates the 1989→2008 studio lineage from Indianapolis 500 to iRacing. *(search result only, not fetched)*
- [The Evolution of Sim Racing Part 5: Modern Sim Racing — Fanatec](https://www.fanatec.com/us/en/explorer/games/gaming-tips/evolution-of-sim-racing-part-5/) — industry-side overview corroborating the modern-sim feature set (laser scanning, tyre models, direct-drive force feedback). *(search result only, not fetched)*
- [Hands on with Assetto Corsa, a racing simulator made using lasers — PCGamesN](https://www.pcgamesn.com/assetto-corsa/hands-on-with-assetto-corsa) — journalism describing the laser-survey truck and millimetre-accurate circuit capture. *(search result only, not fetched)*
- [Controller: Logitech WingMan Formula — PCGamingWiki](https://www.pcgamingwiki.com/wiki/Controller:Logitech_WingMan_Formula) — Logitech's first racing wheel (1998, no force feedback); the single-motor gear-driven WingMan Formula Force following in 1999. *(search result only, not fetched)*
- [WingMan Formula Force GP manual (PDF) — Logitech](https://download01.logitech.com/web/ftp/pub/pdf/gaming/wmformulaforcegp.pdf) — primary manufacturer document for the early consumer force-feedback wheel line. *(search result only, not fetched)*
- [EA agrees US$1.2bn deal for F1 video game developer Codemasters — SportsPro](https://www.sportspro.com/news/electronic-arts-codemasters-deal-f1-video-game-esports/) — the acquisition value and the F1 Esports context. *(search result only, not fetched)*
- [EA completes takeover of F1 video game developer Codemasters — Autosport](https://www.autosport.com/f1/news/ea-completes-takeover-of-f1-video-game-developer-codemasters-5477435/5477435/) — completion of the deal in February 2021; Codemasters as official F1 game developer since 2009. *(search result only, not fetched)*
- [F1 23 — ESRB rating record](https://www.esrb.org/ratings/39246/f1-23/) — institutional: **E for Everyone**, Mild Language. *(search result only, not fetched)*
- [F1 24 — ESRB rating record](https://www.esrb.org/ratings/39861/f1-24/) — institutional: **E for Everyone**, Mild Language. *(search result only, not fetched)*
- [Formula One Grand Prix (video game) — Wikipedia](https://en.wikipedia.org/wiki/Formula_One_Grand_Prix_(video_game)) — the 1991 MicroProse title's tyre-wear and damage modelling as the first authentic F1 championship simulation. *(search result only, not fetched)*

---

## 12. The punishment ledger — the most important table in this document

**Every one of these is a One Rule violation as it stands.** This column exists so the spec lane
never has to guess what has to be stripped. *"The game should only ever stop a player's flow with
joy, never with punishment."*

| Era / Game | What the real game did to you | Why it violates the One Rule | Suggested reframe |
|---|---|---|---|
| Gran Trak 10 (1974) | 78-second countdown; crash-and-spin on walls | Hard timer; failure state | Timer becomes **road ahead**; typing adds road. Crash → a comic one-second wobble, zero progress lost |
| Speed Race (1974) | Collision **resets you to the start of the track**; 90s timer | Total progress loss on one mistake — the worst example here | Never reset. The car simply waits, exactly as a letter waits |
| Night Driver (1976) | Timed session; crash on leaving the road | Timer + failure | Same reframe; the road edge is a guide, not a wall |
| Monaco GP (1979) | Race the clock; collisions destroy the car; road narrows with difficulty | Timer + destruction; escalating difficulty is not opt-in | Keep the *narrowing road* as visual escalation only; remove the clock |
| Pole Position (1982) | **Qualifying lap gates the race**; per-lap timer; billboards explode the car | Gating content behind a speed test is the most anti-pedagogical mechanic in the genre | Never gate. "Qualifying" becomes a warm-up drill you cannot fail |
| Excitebike (1984) | **Overheat forces an immobile cooldown**; crashes cost speed; qualifying time | An enforced input lockout is a flow-stop | Turbo becomes an *earned* accuracy bonus; **never lock out input** — the boost simply fades |
| Hang-On (1985) | Checkpoints extend a clock; off-track crashes launch the rider | Timer-based elimination | Keep checkpoints as **gifts** ("another stretch of road"), never as deadlines |
| F-Zero (1990) | Power meter depletes on collision; **lives**; retirement | Lives + attrition | No meter, no lives. Adventure mode only |
| Super Mario Kart (1992) | **5th or worse = "ranked out"**, costs a life; run out = game over | Elimination by placement | Delete placement failure. **Steal the coin mechanic instead** (below) |
| Virtua Racing / Daytona / Ridge Racer (1992–94) | Countdown timer; checkpoints buy time; race ENDS at zero | The arcade coin contract itself | The classic conversion: distance is produced by typing, not consumed by time |
| Sega Rally (1995) | Per-stage time limits; position carries between stages | Cumulative pressure | Surfaces change how the *scene* looks/feels; nothing is timed |
| Need for Speed (1994) | Police pursuit; three tickets = arrest | Authority-figure punishment; wrong register for a child | Cut entirely |
| Gran Turismo (1997) | Licence tests graded gold/silver/bronze/**FAIL**; failing withholds content | A graded, failable curriculum gate | **Take the curriculum, delete the grade.** Bronze-and-above-only: every attempt is a pass at some tier |
| Grand Prix Legends (1998) | Brutal difficulty as the entire design thesis | Directly opposed to "leave every session feeling capable" | History card only. Never a model for feel |
| Burnout (2001–) | Crash mode and "Takedowns" — wrecking others *is* the reward | Reward loop built on destruction | If used at all, the spectacle stays and the target is scenery, never a character |
| iRacing (2008–) | **Incident points** and licence demotion for off-track excursions | A permanent record of your mistakes | Invert it: a **clean-laps counter that only ever goes up**. Never a demotion |

**Two mechanics worth *stealing* rather than stripping:**
1. **Super Mario Kart's coins.** Collected coins raise your top speed, **and being hit costs you
   coins instead of spinning you out.** A resource buffer that absorbs a mistake so the player
   never loses control. This is the most One-Rule-compatible idea in the genre's history and it
   is thirty-plus years old.
2. **Daytona USA's adaptive AI** — weaker players get help from the field, stronger players get
   actively challenged. That is already Keystroke Kingdom's adaptive-pacing tenet
   (`tech.md` §Adaptive Pacing), implemented in an arcade cabinet in 1994.

---

## 13. Rendering technique by era — the theme author's cheat sheet

| Era | Years | Technique | Canvas grammar |
|---|---|---|---|
| Discrete logic | 1974–1980 | TTL chips, no CPU; monochrome CRT; colour via cellophane overlay; overhead view | 1–2 colours, rectangles, hard pixels, no anti-aliasing. See [[discrete-logic-era]] |
| First-person pylons | 1976 | Scaled white rectangles receding into black; car drawn on a **plastic overlay on the glass** | Rows of shrinking rectangles + a static foreground sprite |
| Scaling-sprite road | 1982–1988 | Sprite scaling; third-person rear view; vanishing point that sways in corners | Scale a sprite by distance; shift the horizon's x with steering. See [[super-scaler]] |
| Mode 7 | 1990–1993 | One raster plane rotated and scaled; sprites for everything else | An affine transform on a ground texture + billboard sprites |
| Flat-shaded polygons | 1988–1992 | Untextured solid-colour facets; painter's algorithm | Filled polygons, no textures, visible facet edges. See [[early-3d-era]] |
| Texture-mapped polygons | 1993–1994 | Texture mapping + Gouraud shading (Ridge Racer); texture filtering (Daytona) | Textured quads; affine wobble is era-correct for PS1-adjacent looks |
| Surface physics | 1995– | Per-surface friction changing handling | Visual: different particle/dust behaviour per surface |
| Photoreal sim | 2008– | LIDAR/laser-scanned geometry, PBR materials, telemetry-driven aero | Out of scope for canvas; suggest a **telemetry-trace aesthetic** (line graphs, data channels) instead of chasing photorealism |

---

## 14. Cabinet-collision check against the 25 assigned levels

Checked against `.claude/rules/levels.md`'s full assignment table:

- **[[out-run]] — Level 21. HARD COLLISION. Do not reuse.** Substitute [[hang-on]] (§4).
- **[[super-mario-bros]] — Level 9.** [[mario-kart]] is a *clearly distinct game in the same
  franchise*, which the cabinet rule explicitly permits (the Pac-Man / Ms. Pac-Man precedent).
  No collision — but flag it for Trevor's eye anyway, since it is the only franchise overlap.
- **[[sonic-the-hedgehog]] — Level 11 (Sega).** Sonic-branded kart racers exist; avoid them, as
  they are the one case where "same franchise" would read as reuse to a player.
- **[[donkey-kong-country]] — Level 14 (Rare).** *Diddy Kong Racing* (Rare, 1997) is a distinct
  game but shares cast; usable, low priority.
- **[[tron]]** has a wiki page and light-cycle racing, and is **not** an assigned cabinet — it is
  free, and Trevor's own memory note already pairs it with this act.
- No other racing title researched here collides with any of the 25.

---

## 15. The recommended spine (for the product-manager lane to cut down)

| # | Station | Date | Era / rendering | Why it earns the slot |
|---|---|---|---|---|
| 1 | [[monaco-gp]] | Nov 1979 | TTL discrete logic, overhead | **1979** — the game's own year; Act-1 art bar for free |
| 2 | [[pole-position]] | Sep 1982 | Scaling sprites, rear view | Invented the *picture* of a racing game; first real circuit |
| 3 | [[excitebike]] | Nov 1984 | 8-bit side-scroll | Trevor's anchor; the **track editor** rhymes with Act 6's maker |
| 4 | [[hang-on]] | Jul 1985 | Super Scaler, ride-on cabinet | The Super Scaler era **without** re-using Out Run |
| 5 | [[f-zero]] | Nov 1990 | Mode 7 | The 16-bit leap, visually unmistakable |
| 6 | [[mario-kart]] | Aug 1992 | Mode 7 + split screen | Invented kart racing; **donates the coin mechanic** |
| 7 | [[virtua-racing]] or [[daytona-usa]] | 1992 / 1994 | Flat-shaded → textured polygons | The polygon step; Daytona also carries the NASCAR beat |
| 8 | [[gran-turismo]] | Dec 1997 | Early 3D, PS1 | The simulation turn; licence tests = a curriculum |
| 9 | *Modern open-road* — **NFS: Underground (2003, ESRB E)** — Midnight Club RULED OUT (PS2 is T; §16) | 2003 | Early modern | Trevor's "Need for Speed" anchor, rating-clean. **Not GTA** |
| 10 | **Modern F1 sim** ([[sim-racing]] — Codemasters/EA F1, [[iracing]], [[assetto-corsa]]) | 2008–now | Photoreal, telemetry | Trevor's terminal point, and **ESRB E** |

**Where this differs from Trevor's named anchors:**
- **Starts earlier** (1979 Monaco GP, not 1984 Excitebike) — because the discrete-logic decade is
  both real and already within the game's rendering vocabulary.
- **Adds Hang-On** — forced by the Out Run cabinet collision, and a genuine improvement (it is
  the *first* Super Scaler game, not the famous one).
- **Drops Grand Theft Auto** — §9, with regulator sources.
- **Keeps NASCAR but relocates it** — the era-honest NASCAR beat is 1994, and it comes in two
  flavours ([[daytona-usa]] arcade / [[nascar-racing-1994]] sim) in the *same year*, which is a
  better story than a modern NASCAR game would be.
- **Confirms the F1 ending**, and adds the happy finding that modern official F1 games are
  ESRB E.

---

## 16. Cabinet-build depth — the nine unbuilt tracks *(added 2026-09-13)*

*Act 7 "THE SPEEDWAY" shipped 2026-09-13 with two stations playable: **[[monaco-gp]]** (`ttl`)
and **[[f-zero]]** (`mode7`). The arc-level work in §1–§15 is done; what the build lane needed
and did not have was **cabinet-build depth** — the level of specificity a renderer consumes.
This section is the index to that depth. The detail itself lives on each game's wiki page under
a heading called **"The cabinet build (Act 7 track spec)"**, because it belongs next to that
game's own citations, not in a table that drifts away from them.*

**What "build depth" means here**, per station: the exact rendering technique (what the hardware
could and could not do), the road/track geometry the player actually saw, the signature visual
moment, the completion/celebration state, the punishment mechanics to strip (§12's format), the
cabinet's physical appearance where documented, and an era-appropriate palette concrete enough
to author from.

| # | Station | Date | Render tier | Page with the build spec |
|---|---|---|---|---|
| 1 | [[monaco-gp]] | Nov 1979 | `ttl` | **BUILT** — `js/speedway/tracks/monaco-gp.js` |
| 2 | [[pole-position]] | Sep 1982 | `scaler` | [[pole-position]] |
| 3 | [[excitebike]] | Nov 1984 | `8bit` | [[excitebike]] |
| 4 | [[hang-on]] | Jul 1985 | `scaler` | [[hang-on]] |
| 5 | [[f-zero]] | Nov 1990 | `mode7` | **BUILT** — `js/speedway/tracks/f-zero.js` |
| 6 | [[mario-kart]] (Super Mario Kart) | Aug 1992 | `mode7` | [[mario-kart]] |
| 7 | [[virtua-racing]] | Aug 1992 | `flatpoly` | [[virtua-racing]] |
| 8 | [[daytona-usa]] | Mar 1994 | `texpoly` | [[daytona-usa]] |
| 9 | [[gran-turismo]] | Dec 1997 | `ps1` | [[gran-turismo]] |
| 10 | [[need-for-speed-underground]] | Nov 2003 | `modern` | [[need-for-speed-underground]] |
| 11 | [[f1-25]] | May 2025 | `modern` | [[f1-25]] |

### 16a. The flatpoly/texpoly pair is the render kit's whole proof

`js/speedway/render/kit.js` was built so that a `flatpoly` renderer **cannot texture a polygon**
(`texturedPoly` is simply not on its pen) and a `texpoly` renderer can, and additionally gets
`bilinear`. [[virtua-racing]] and [[daytona-usa]] are the pair that makes that architectural
rule *visible to a child*, and they are only twenty months apart in real history — which is the
point. In one sentence:

> **Virtua Racing is shapes. Daytona USA is shapes with photographs stretched over them, and
> the photographs go soft as they come at you.**

Five visible differences, sourced and detailed on [[virtua-racing]]: pictures on surfaces
(texture mapping), softness (texture filtering / anti-aliasing / trilinear), edge hardness
(flat vs smooth shading), density (~6,500 polys/frame on Model 1 vs **up to 300,000
texture-mapped polygons per second** on Model 2, "nearly double"), and field size (a clean
circuit vs starting last of forty).

### 16b. The two open decisions, settled with evidence

**The modern open-road track → [[need-for-speed-underground]] (2003), not Midnight Club.**
The deciding evidence is a ratings correction this pass had to make against §8 and §9 of this
very document:

| Game | ESRB record | Platform on that record |
|---|---|---|
| Midnight Club **(the PS2 game)** | **T — Teen**, Animated Violence | PlayStation 2 |
| "Midnight Club Street Racing" | E — Everyone, no descriptors | **Game Boy Advance** |
| Need for Speed Underground | **E — Everyone**, Mild Language + Suggestive Themes | **GameCube, Online, PC, PlayStation 2, Xbox** |
| Need for Speed Underground | E — Everyone, Mild Lyrics | **Game Boy Advance** |

**§8's table, §9's substitute list and §15's spine row all state "Midnight Club: Street Racing
(2000, ESRB E)". That is the GBA port's rating. The console game is T.** Full evidence,
both records fetched, on [[midnight-club-street-racing]]. Underground also wins on design: its
core loop is a **garage** (the car visibly becomes the player's own — an unlock structure that
maps directly onto Keystroke Kingdom's per-slot collection), not **police pursuit**, which §12
already says must be cut entirely.

*The general lesson, now a rule for this wiki:* **ESRB rates per platform. Every ESRB citation
must state the platform list shown on the record.** This pass found the same mistake twice in a
row, on two different games, from two correctly-fetched institutional pages.

**The modern F1 sim → [[f1-25]] (Codemasters / EA Sports, May 30 2025). ESRB E — verified.**
Descriptors **Mild Language** *and* **Use of Alcohol** (podium champagne, per ESRB's own
summary), interactive elements Users Interact and In-Game Purchases. So the earlier finding
holds — **a genuine modern F1 simulation really is, by rating, the most age-appropriate
terminal station in the whole arc** — with one refinement: §11's flat "F1 23 and F1 24 are both
ESRB E (Mild Language)" is true of those two entries and **already out of date for F1 25**,
which added the alcohol descriptor. State the year with the rating, always, and re-check each
annual release. F1 25 also brings two genuinely useful build facts: **five LiDAR-scanned
circuits** (Bahrain, Miami, Melbourne, Suzuka, Imola — scanned during real Grand Prix weekends)
and **the series' first reverse layouts** (Silverstone, Zandvoort, Red Bull Ring — reworked, not
mirrored), which makes an Act 7 "run it backwards" idea era-accurate rather than a liberty.

### 16c. Findings the spec lane should read before anything else

1. **[[excitebike]] is a time-trial game, not a pack race.** Even in Selection B the CPU riders
   are *obstacles*; the real opponent is a posted time (first place written on the stadium wall,
   third place in the corner). Its celebration is the printed line **"It's a new record!"** —
   **a celebration for beating yourself.** That makes it the best possible fit for Act 7's
   ghost-car design, and it is the only station in the act that already believed in it.
2. **[[gran-turismo]]'s licence tests are a curriculum with one illegal word in it.** Graded
   exercises that teach one skill each and unlock the next thing — take the whole structure,
   **delete the FAIL grade**. Bronze is the floor. This is the single most valuable design
   transplant in the corpus and it needs exactly one element removed.
3. **[[daytona-usa]]'s victory lap is the most portable celebration in the genre.** Not a
   placement, not a trophy, not a rank: *go round once more, slowly, with everyone watching.*
   A lap you cannot fail. Real 1994 arcade behaviour, One-Rule-native as-is — **except** that
   the original gates it on finishing third or better. Keep the lap, delete the gate.
4. **[[mario-kart]]'s award ceremony contains a drawn picture of the player crying.** Finish
   fourth or lower in a Grand Prix and your character stands beside the podium in tears while
   the CPU racers celebrate. That is the most direct One Rule violation anywhere in this
   research. Strip it completely — but the **balloon → cork → trophy** gag is placement-free
   spectacle and is reusable once severed from the ranking. (It also involves champagne, the
   same beat ESRB flags on [[f1-25]] — Act 7 should pop the balloon some other way.)
5. **Two stations have no celebration documented at all.** [[virtua-racing]] and [[hang-on]]:
   no fetched source this pass describes what either did at the finish. Marked **[unverified]**
   on both pages. Do not invent one. The act's verified anchors are the **checkered flag from
   [[pole-position]] (1982) onward** and [[daytona-usa]]'s Victory Lane (1994) — and the
   victory-research lane separately established that **a checkered flag is NOT era-accurate for
   1979 [[monaco-gp]]**, which had no win state at all.
6. **Three of the nine are not arcade cabinets and must not be drawn as one.** [[excitebike]]
   (the real cabinet is **VS. Excitebike** on the Nintendo VS. System, which omits two-player
   *and* the track editor), ~~[[mario-kart]] (SNES only — no arcade Super Mario Kart exists)~~
   **← SUPERSEDED 2026-09-13, see §17: the 1992 SNES *title* had no coin-op, but licensed
   [[mario-kart-arcade-gp|Mario Kart arcade cabinets]] have existed since 2005 and are sold
   today**, [[gran-turismo]] / [[need-for-speed-underground]] / [[f1-25]] (console and PC). Draw
   the console, the television, the cartridge or the wheel rig. Inventing a coin-op for a home
   game is exactly the gimmickry the cabinet rule forbids — **but so is refusing to draw the real
   machine the game ran on.** The complete rule and a per-station table are in §17.
7. **The act's best cabinet-art subject is [[hang-on]]** — a cabinet **shaped like a
   motorcycle**, screen mounted in the windscreen, which the player **physically leans**. Second
   best is [[virtua-racing]]'s **DX**, which Wikipedia calls **the first arcade game to use a
   16:9 widescreen monitor**, with six airbags for haptics; or its **Virtua Formula**, a
   hydraulic F1 replica cockpit with a 50-inch screen, linkable eight-wide over fibre optic.
8. **Trademark hygiene.** [[pole-position]]'s billboards carried real Pepsi/Marlboro/Canon
   advertising; [[need-for-speed-underground]] shipped 52 real aftermarket brands; [[f1-25]] is
   an actively licensed property with real team liveries. Draw generic boards, generic parts and
   *a* Formula car — the same judgement `research/automotive-vocabulary.md` reached about car
   brands, and more important here.

### 16d. Rendering-technique quick sheet for the nine

| Station | Technique in one line | The artefact that proves the era |
|---|---|---|
| [[pole-position]] | Scaling sprites over a full-colour backdrop; 256×224 @ ~60.6 Hz | Vanishing point **swaying sideways** through corners; nothing rotates |
| [[excitebike]] | NES tiles + sprites; 256×240 (224 safe), 56-colour system palette | Every **16×16 background block** shares one 4-colour palette; 8 sprites per scanline |
| [[hang-on]] | Super Scaler — maths done in 3D, drawn back out as 2D sprites | Density and **frame rate**, not new primitives; the sky changes colour per stage |
| [[mario-kart]] | Mode 7: one BG layer, 1024×1024 tilemap, affine matrix re-set **per scanline via HDMA** | The **horizontal split screen even in single player** — the two-player-first constraint made visible |
| [[virtua-racing]] | Flat-shaded untextured facets, painter-sorted; ~6,500 polys/frame @ ~30 fps | **Hard colour steps** at every facet edge; no picture on any surface |
| [[daytona-usa]] | Texture-mapped polygons with filtering; up to 300,000/sec on Model 2 | Textures that **soften as they scale toward you** |
| [[gran-turismo]] | PS1: affine UVs, Ordering Table instead of a Z-buffer, fixed-point vertex snapping, hardware dithering | **Texture swim, polygon pop-through, and jitter** — sharper than Daytona and *less* stable |
| [[need-for-speed-underground]] | Sixth-gen console lighting: wet specular, bloom, motion blur | **Night.** Every light source blooms; the road is a mirror |
| [[f1-25]] | PBR + path tracing; geometry from **LiDAR-measured** circuits | Reality itself as the asset — and for canvas, a **telemetry-trace** aesthetic instead |

### 16e. Corrections this build-depth pass made

Detail and sources live in each page's own "Corrections from citation pass (2026-09-13)"
section; summarised here so the hub carries the diff:

1. **Midnight Club: Street Racing is ESRB E.** False for the PS2 game (**T**, Animated
   Violence); the E is the **GBA** port. Corrects §8, §9 and §15 of this document.
2. **NFS: Underground is "E (Mild Lyrics)".** That is the **GBA** record; the console/PC record
   is **E (Mild Language, Suggestive Themes)**. Corrects §8 and §9.
3. **"The official F1 games are E (Mild Language)."** True of F1 23/24; **F1 25 adds
   `Use of Alcohol`**. Corrects §11.
4. **"Virtua Racing rendered 6,500 polygons per second."** Per **frame**, at ~30 fps. 6,500 per
   *second* is the Mega Drive port. Two real numbers that look identical.
5. **"Virtua Racing was the first racing game fully rendered with filled polygons."** Still
   false (Winning Run 1988, Hard Drivin' 1989) and still circulating in retrospectives fetched
   this pass. Restates §6's existing correction because it keeps coming back.
6. **Sega Model 1's 496×384 / 65,536-colour figures are community-compilation grade** —
   demoted to **[unverified]**. Model 2's 496×384 is better corroborated (three independent
   hardware records) but still not primary.
7. **Hang-On's "five stages" are unnamed.** Wikipedia names none; the circulating
   "Alps / Grand Canyon / City / Night / Seaside" list is plausibly bleeding in from
   **Super Hang-On (1987)**, which does have named courses. Marked **[unverified]**.
8. **Pole Position's upright cabinet had no brake pedal** — accelerator only. Separate
   accelerator and brake pedals were a **cockpit-cabinet** feature. And the **"Prepare to
   qualify" voice performer is undocumented** — never attribute a name.
9. **Excitebike's races are against a time, not the field** (see 16c.1). Also: 256×240 is the
   framebuffer, **256×224 is the NTSC safe area** — compose to 224.
10. **Gran Turismo did not look smooth.** GT1 uses nearest-neighbour/minimal filtering (bilinear
    is an *emulator enhancement*), plus affine warping, vertex jitter and hardware dithering.
    A Gran Turismo scene drawn cleaner than [[daytona-usa]] is historically backwards — Model 2
    had texture filtering in 1994 and the PlayStation did not.
11. **Super Mario Kart's podium visuals rest on a single community wiki.** The mariowiki.com
    page fetched this pass confirms **only the music cue**. Safe to design against; never state
    as fact on a child-facing card.
12. **Daytona USA's Victory Lane is community-sourced too** (TV Tropes, GameFAQs, Digital
    Press) — consistent across them, no institutional confirmation. Same rule.

**Sources that were unavailable all session and are cited nowhere as if read:**
arcade-museum.com (KLOV) **403**, mobygames.com **403**, fandom.com **402**, segaretro.org
**403**, system16.com **403**, strategywiki.org **403**. Where one of these is the only pointer
to a record, it is retained **explicitly labelled unfetched**, and a fetchable source carries
the claim instead (the MAME Arcade Database machine record replaced system16 for
[[pole-position]]'s video specification, and is the better source anyway).

---

## 17. What to draw for a console game — the cabinet precedent *(added 2026-09-13)*

*Added after Trevor pushed back on a claim this document and [[mario-kart]] both carried. The
claim was narrow and defensible; the way it was written was not, and it would have steered Act 7's
cabinet art wrong. This section corrects it and replaces it with a rule.*

### 17a. The correction

**§16c item 6 says: "[[mario-kart]] (SNES only — no arcade Super Mario Kart exists)."** The first
half is right and the second half is misleading. The **1992 SNES title** was not released as a
coin-op — nothing found contradicts that. But **Mario Kart arcade cabinets are real, licensed and
currently in production**: Namco developed and Nintendo published *Mario Kart Arcade GP* in
**2005** on the Triforce board (running a modified *Mario Kart: Double Dash!!* engine), followed
by **GP 2** (March 2007), **GP DX** (late 2013) and **GP VR** (14 July 2017). **Mario Kart Arcade
GP DX** is listed today on **Bandai Namco Amusement America's own commercial-products site** — a
seated cabinet with steering wheel and pedals, a 42-inch HD monitor, rainbow LED trim, and linking
for up to four cabinets. Full detail: [[mario-kart-arcade-gp]].

Trevor's framing, which is the right one: *"as we move beyond the arcade we venture into a wider
more digital era of video game culture which is deeply rooted in cabinet play."* Home games get
built into cabinets constantly — it is a documented practice running from Nintendo's own
[[nintendo-vs-system|VS. System]] (1984; **the highest-grossing arcade machine of 1985** in the
US) and PlayChoice-10 (1986), through the Mario Kart arcade line, to today's Raw Thrills /
Play Mechanix and Bandai Namco Amusement machines built from console and PC franchises — and back
the other way, with Arcade1Up selling licensed cabinets *into homes* since 2018. Written up with
citations on [[home-games-in-cabinets]].

### 17b. The rule

> **Draw a real thing.** A real cabinet where one exists; the real console, computer or handheld
> where one does not. The only ruled-out option is inventing a coin-op that never existed and
> implying it did.

This is the project's existing faithful-not-gimmicky rule stated completely. That rule is about
**fidelity to the game** — it was never a requirement that a game shipped as a coin-op. Both
halves bite: fabricating a 1992 Super Mario Kart cabinet is gimmickry, *and* so is refusing to
draw the SNES the game really ran on.

**Trevor's design answer (2026-09-13), which the game already speaks:**

> *"In the back of the arcade there can be computer terminals and game systems which wouldn't be
> gimmicky at all and would stay on brand — having 8-bit or 16-bit or 24-bit renderings of the
> different game consoles would be cool."*

Compare `.claude/rules/levels/act2.md`, shipped long before this conversation: *"A long room
behind the Mystery Cabinet. **Computers and consoles from different eras line the walls, each one
running a classic game.**"* The act files already name the object per level — the NES at L9, *"a
gold-cartridge NES beside a wooden TV"* at L10, a computer at L8 and L13, *"a Game Boy Pocket on a
backlit stand"* at L15. **Act 7 never reached for a vocabulary the game invented five acts ago.**

### 17c. Per-station recommendation for Act 7's console/PC entries

Drawing detail (silhouettes, the two or three details that survive at 56×80 px, era palettes) is
on [[console-hardware-silhouettes]].

| Station | What it really is | **Draw this** | Render at | Tier |
|---|---|---|---|---|
| [[excitebike]] | NES 1984/85 — **VS. Excitebike is a real cabinet**, but per Nintendo's own listing it omits two-player *and* the track editor | **NES + period TV** (the honest object). A VS. UniSystem upright is a legitimate alternative if a cabinet is wanted — just don't imply it has the editor | 8-bit; two-tone grey, black stripe, VCR-style front-loading door | `8bit` |
| [[mario-kart]] | SNES, 27 Aug 1992 | **SNES + TV**, or the cartridge. Boxy NA model: **purple sliding switches**, grey eject lever, lavender/purple diamond controller | 16-bit SNES warmth | `mode7` |
| [[gran-turismo]] | PlayStation, Dec 1997 | **The original PlayStation — GREY, not black** — with its top-opening CD lid; controller's four coloured geometric buttons | Early-3D/PS1 | `ps1` |
| [[need-for-speed-underground]] | PS2/Xbox/GC/PC, Nov 2003 | **PlayStation 2**: matte-black slab, blue-lit tray, two USB squares. (Or a period PC tower + CRT — but see the unsourced note below) | Sixth-gen; the game is night-set, let the screen glow carry it | `modern` |
| [[f1-25]] | PS5/Xbox Series/PC, 2025 | **A wheel-and-pedal sim rig** in front of a monitor — a real object, and the one a modern F1 player actually uses. Not a coin-op | Present day | `modern` |
| *(alternative)* | If a Mario Kart **cabinet** is wanted | **[[mario-kart-arcade-gp|Mario Kart Arcade GP DX]]** — seated, wheel + pedals, 42″ screen, rainbow LED trim | 2013–present | — |

Stations that genuinely were coin-ops — [[monaco-gp]], [[pole-position]], [[hang-on]],
[[virtua-racing]], [[daytona-usa]] — are unaffected; keep their cabinets.

### 17d. Boundary: Vegas slots are precedent, not content

Trevor named casino machines as evidence and fenced them off in the same breath: *"not that we are
building slots or adding gambling into this — just precedent for cabinet builds of classic at home
entertainment games."* Recorded as one sentence and no more: licensed video-game IP **is**
routinely put into casino cabinets (Gamblit Gaming announced **PAC-MAN Battle Casino** with
**Bandai Namco Entertainment** on **26 September 2017**; Scientific Games launched a skill-based
Space Invaders game in Atlantic City) — evidence that the cabinet form outlived the arcade era.
**No gambling mechanics were researched and none belong in a children's game.** Also:
**this pass found no evidence of any Nintendo- or Mario Kart-licensed slot machine** — if that was
the memory, it is **[unverified]**, and the precedent stands without it.

### 17e. Left unsourced by this pass

- **Period PC towers, monitors, and modern sim rigs** — no sourced physical description. Flagged
  on [[console-hardware-silhouettes]]; needs a follow-up pass rather than invention.
- **"Great Wolf Lodge has a Mario Kart machine"** — the resort's own arcade pages **name no
  titles** (fetched and checked). True by observation; not sourceable this way. The sourced
  version is *"Mario Kart Arcade GP DX is in production and sold to arcade and FEC operators."*
- **The Triforce board's Nintendo/Sega/Namco joint origin** — widely repeated, unverified here
  (web-search budget exhausted). Safe claim: "Triforce, an arcade board in the GameCube family."
- **Halo: Fireteam Raven as a Raw Thrills / Play Mechanix title** — search-summary only.
  Minecraft Dungeons Arcade carries the same point with a fetched source.
- **Mario Kart Arcade GP's exact release month** — three sources give three different
  region/month orderings. **Say "2005."**

**References — §17** *(full annotation on the atomic pages)*
- [Mario Kart Arcade GP — Wikipedia](https://en.wikipedia.org/wiki/Mario_Kart_Arcade_GP) — the series, dates, Triforce board, wheel/pedals, NamCam, four linked machines. **[fetched]**
- [Mario Kart Arcade GP DX — Bandai Namco Amusement America](https://bandainamco-am.com/collections/mario-kart-arcade-gp-dx) — the manufacturer's own listing: a currently-sold seated arcade cabinet. **[fetched]**
- [Mario Kart Arcade GP (2005) — Nintendo Life](https://www.nintendolife.com/games/triforce/mario_kart_arcade_gp) — 2-player dedicated cabinet linkable for four; 24 courses; NamCam 2; "the first" Namco/Nintendo team-up bringing "a proven consumer franchise for the arcade." **[fetched]**
- [Nintendo VS. System — Wikipedia](https://en.wikipedia.org/wiki/Nintendo_VS._System) — 1984 Famicom-based arcade platform; UniSystem/DualSystem cabinets and conversion kits; console-conversion library; highest-grossing arcade machine of 1985. **[fetched]**
- [PlayChoice-10 — Wikipedia](https://en.wikipedia.org/wiki/PlayChoice-10) — August 1986; ten NES games in one cabinet; the timed-session coin model. **[fetched]**
- [Big Buck Hunter — Wikipedia](https://en.wikipedia.org/wiki/Big_Buck_Hunter) — Play Mechanix (George Petro) designs, Raw Thrills produces and distributes, from January 2006. **[fetched]**
- [Raw Thrills Minecraft Dungeons Arcade — Game Room Shop](https://www.gameroomshop.com/products/raw-thrills-minecraft-dungeons-arcade) — "an adaptation of the popular console and computer game Minecraft Dungeons"; 42″ cabinet that vends a collectible card every play. **[fetched]**
- [Super Nintendo Entertainment System — Wikipedia](https://en.wikipedia.org/wiki/Super_Nintendo_Entertainment_System) · [Nintendo Entertainment System — Wikipedia](https://en.wikipedia.org/wiki/Nintendo_Entertainment_System) · [PlayStation models — Wikipedia](https://en.wikipedia.org/wiki/PlayStation_models) · [PlayStation (console) — Wikipedia](https://en.wikipedia.org/wiki/PlayStation_(console)) · [PlayStation 2 — Wikipedia](https://en.wikipedia.org/wiki/PlayStation_2) — the hardware appearance detail behind §17c. All **[fetched]**.
- [Pop Culture Phenomenon, PAC-MAN Battles its way into Casinos… — PR Newswire](https://www.prnewswire.com/news-releases/pop-culture-phenomenon-pac-man-battles-its-way-into-casinos-as-bandai-namco-entertainment-inc-joins-forces-with-gamblit-gaming-300525630.html) and [Las Vegas Sun](https://lasvegassun.com/news/2017/sep/26/pac-man-arcade-classic-being-adapted-as-a-slot-mac/) — the 26 September 2017 licensed-casino-game announcement, supporting §17d's single sentence. *(search results only, not fetched)*
- [Northern Lights Arcade — Great Wolf Lodge (official)](https://www.greatwolf.com/southern-california/waterpark-attractions/attractions/northern-lights-arcade) — fetched **to establish that it names no titles**, marking the Great Wolf detail unsourced rather than supporting it. **[fetched]**

---

## Corrections from this research pass (2026-09-12)

1. **"Excitebike was developed by Nintendo R&D1."** Widely repeated in search summaries;
   Wikipedia's infobox says **Nintendo R&D4**. Use "Nintendo, directed and designed by Shigeru
   Miyamoto" and avoid the division label.
2. **"Excitebike let you save your custom tracks."** True in Japan only. The **NES version could
   not save**; saving required the **Famicom Data Recorder**, never released outside Japan. A
   created-vs-shipped distinction of exactly the class this project has been burned by before.
3. **"Virtua Racing was the first 3D-polygon racing game."** False. **Winning Run** (Namco, 1988)
   and **Hard Drivin'** (Atari Games, February 1989) both precede it. Virtua Racing's defensible
   first is polygon *count, frame rate and scene complexity* — not polygons.
4. **"Night Driver was the first first-person driving game."** Overclaim. It is *one of the
   first*, and it was inspired by the German coin-op **Nürburgring 1**, released earlier in 1976.
5. **"Sega Rally Championship, 1994, Sega AM5."** Wikipedia gives **Sega AM3, February 1995
   (Japan)**, Model 2. The 1994 date and AM5 credit both appear in circulating summaries.
6. **"Hang-On was developed by Studio 128."** A search-summary claim; Wikipedia's infobox says
   **Sega R&D1**. Safe phrasing: "Sega, conceived by Yu Suzuki."
7. **"Forza Horizon is a kid-safe alternative to GTA."** It is **ESRB T**, for Drug Reference,
   Language and Suggestive Themes — ESRB's own summary quotes "drug-fueled jerks" and two
   profanities. The rating-clean alternative is Need for Speed: Underground (E on console/PC) — NOT Midnight Club, whose PS2 release is T; see §16. Superseded text: the rating-clean alternatives are Midnight Club: Street Racing (E) and Need for
   Speed: Underground (E).
8. **"Crash mode and Takedowns are Burnout-original-game features."** Crash mode arrived in
   **Burnout 2**; Takedowns in **Burnout 3**. The 2001 original's loop was near-misses and risk.
9. **"Gran Turismo was made by Polyphony Digital."** At ship time the studio was **Polys
   Entertainment**; it was re-established as Polyphony Digital in **April 1998**, months after
   the December 23 1997 Japanese release.
10. **"The Need for Speed was a Distinctive Software game."** Sources fetched this pass credit
    **EA Canada and Pioneer Productions**. Distinctive Software was EA Canada's predecessor name;
    do not use it for the 1994 credit line without a stronger source.

## Corrections applied to existing wiki pages this pass

- **`research/wiki/games/mario-kart.md`** previously framed Super Mario Kart as "a parked
  candidate cabinet for Keystroke Kingdom's Act 6 'mastery wing'." Act 6 has since shipped as the
  **Text Worlds** wing (`CLAUDE.md`), and the speed/racing wing is now **Act 7**. The page's
  "In this game" section was corrected and extended with its mechanics; its original references
  were preserved.

## Downstream flags (not edited by this lane — research/ only)

- **`research/video-game-history.md` §"Parked: Act 6 'mastery wing'"** carries the same stale
  framing corrected on the Mario Kart page. Current text: *"Post-graduation act discussed
  2026-07-10: **Mario Kart** and **Tron** cabinets… No new keys remain by that point in the
  curriculum, so Act 6 is envisioned as a speed/sentence 'greatest hits' wing."* Act 6 is now the
  Text Worlds wing; this paragraph describes what is now **Act 7**. Recommend retitling to
  "Parked: Act 7 'speed / racing wing'" and cross-linking `research/racing-games-by-era.md`.
- **`research/wiki/games/out-run.md`** describes Level 21 as part of the *"parked* Act 5/Corner
  Cabinets plan." Act 5 shipped (`.claude/rules/levels/act5.md`); "parked" is stale. Minor.
- **`js/history-cards.js`** — three card candidates surfaced here, all verified, all needing the
  card lane to check word/key typeability before use:
  - *Excitebike's track editor (1984)* — "In 1984 a racing game let you **build your own track**.
    In Japan you could save it to a cassette tape. Everywhere else, it vanished when you switched
    off." (Sources: Wikipedia **[fetched]**, Nintendo store page **[fetched]**.)
  - *Pole Position's Fuji Speedway (1982)* — the first racing game built from a **real** race
    track. (Source: Wikipedia **[fetched]**.)
  - *TypeRacer (2008)* — "A racing game where the only pedal is your keyboard." (Source:
    Wikipedia **[fetched]**.)
- **`.claude/rules/levels.md`** needs no change from this pass — no assigned cabinet's facts were
  contradicted. The only cabinet-rule consequence is the Out Run collision, handled in §14.

## Unsourceable / weakly-sourced items

- **Nitro Type's 2011 launch and its founder attribution (Austin Butler, Teaching.com)** rest on
  **nitrotype.blog**, a first-party blog, plus educator-review sites. Treat the *year* as
  reasonably sound and the *founder name* as **[unverified]** until a second independent source
  is found. Do not put the founder's name on a history card.
- **Formula One Grand Prix (1991)** is documented here from Wikipedia plus games journalism
  (Time Extension); it did not get its own fetched primary source this pass. Its core facts
  (Crammond, MicroProse, 1991, the 1991 calendar, tyre wear and damage modelling) are consistent
  across sources but are one notch below the rest of this document. Marked **[unverified]** on
  release *month* specifically.
- **Winning Run (Namco, 1988)** appears here only as a precedence claim inside fetched Virtua
  Racing and Hard Drivin' sources. It has no page of its own and was not independently verified.
  Safe to state as "Namco's Winning Run (1988) preceded it," per those sources; do not assert
  further detail.
- **Nürburgring 1 (Reiner Foerst, 1976)** likewise appears only inside the fetched Night Driver
  article. Sufficient to defuse the "first first-person" overclaim; not sufficient for a card.
- **"Excitebike is the first console racing game with a level editor"** — plausible, repeatedly
  implied, but **no source found this pass states it as a first**. Say "a rarely-seen feature at
  the time" (which the sources do support), not "the first."
- **Indianapolis 500 as "the first true auto racing simulation"** — genre-history sources say it;
  Wikipedia does not. Attribute as "widely regarded as," never as flat fact.
- **Force-feedback chronology** (Logitech WingMan Formula 1998 → Formula Force 1999, Immersion
  I-Force) comes from PCGamingWiki plus a Logitech manual PDF surfaced in search but not fetched.
  Directionally safe; do not put exact model years on a child-facing card.
