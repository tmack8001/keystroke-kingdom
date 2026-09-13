# Video Game History Reference
## Research behind the era progression, cabinet assignments, and graphics fidelity targets

*Compiled across the Act 5 + progressive-graphics sessions (2026-06 → 2026-07-11).
The playable assignments live in `.claude/rules/levels.md`; the original cabinet-era survey
is `research/arcade-cabinets-by-era.md`. This file records the history research that drove
the visual escalation and the newer cabinet picks.*

## The core principle it serves

*Internal design principle (see .claude/rules/levels.md "Progressive Graphic Quality");
the historical claims it rests on are cited under "Era fidelity targets" below.*
Graphics fidelity escalates act-by-act because that's what actually happened, 1976→present.
A child learning her first two keys sees 1976; by full sentences she sees the modern era.
The game teaches gaming history *while* teaching the keyboard (levels.md "Progressive
Graphic Quality").

## Era fidelity targets (as implemented, 2026-07-11)

| Act | Years | Historical reality | Our canvas grammar |
|---|---|---|---|
| 1 Arcade | 1976-82 | Discrete-logic → early sprite hardware; 1-8 colors; motion IS the spectacle | Flat fills, blocky rects, no anti-aliasing, no gradients |
| 2 Computer Wing | 1981-86 | NES-class: ~52-55 color master palette (25 on-screen simultaneously), tile/sprite engines, parallax via layered scroll speeds, personality sprites (DK's shrug was NEW in 1981) | Dithered/banded skies (never smooth gradients), multi-speed scroll layers, multi-frame walk cycles, torch-glow pools |
| 3 Basement | 1991-96 | 16-bit wars: Genesis FM + SNES Mode 7 era; big sprites (SF2's scale was the shock), pre-rendered 3D (DKC's SGI trick), CD-ROM photographic stills (Myst — Mac/StrataVision, not SGI; see correction below) | Gradients allowed, 2-3 depth parallax, 80-112px sprites with shading maps, god-rays, screen-flash battle drama |
| 4 Command Center | 1993-2000 | Early real-time 3D: flat-shaded/textured polys, low-poly + dithering, perspective cameras (PS1/N64) | True projection math (pinhole camera, isometric extrusion, vanishing points), flat-shaded faces, painter's algorithm, polygon-shard particles, NO soft shadows |
| 5 Full Circle | present | Modern rendering | Particles, volumetric light, eased motion, soft shadows — but levels 21-23 (Corner Cabinets) deliberately regress to Act-1 fidelity as a narrative beat |

### References — era/hardware claims

**Act 1 (discrete-logic → early sprite hardware):** covered per-game in `arcade-cabinets-by-era.md` (Breakout, Space Invaders, Pac-Man, Galaga, Donkey Kong all have dedicated References blocks there as of this citation pass).

**Act 2 (NES palette/tile hardware):**
- [NESdev Wiki — PPU palettes](https://www.nesdev.org/wiki/PPU_palettes) — authoritative technical reference: the NES PPU addresses a 64-value palette register, but duplicate/near-duplicate entries mean the practical master palette is commonly reported as 52–55 distinguishable colors.
- [Wikipedia — List of video game console palettes](https://en.wikipedia.org/wiki/List_of_video_game_console_palettes) — "The NES can create 54 colors... allowing for a total of 25 on-screen colors" — source of the "~52-color" figure; clarifies that only **25 colors** (13 background + 12 sprite) can appear on screen at once, a distinct number from the master palette size.
- [NESDev Forum — "Why only 52 colors instead of 256?"](https://forums.nesdev.org/viewtopic.php?t=16054) — community technical corroboration of the master-palette figure and the duplicate-color explanation.

*Correction applied: the table above previously read "~52-color palette" in a way that could be misread as simultaneous on-screen colors. That number (25 on-screen: 13 background + 12 sprite) is smaller than the ~52-55 master palette size — both figures are now distinguished above.*

**Act 3 (Genesis/SNES 16-bit era, SGI pre-rendering for DKC, Myst CD-ROM):**
- [Donkey Kong Country — Wikipedia](https://en.wikipedia.org/wiki/Donkey_Kong_Country) — confirms Rare's ~1992 investment in Silicon Graphics (SGI) Challenge workstations with Alias PowerAnimator software, used to model, texture, and animate 3D NURBS character models, then compress rendered frames down to SNES sprites via Rare's proprietary "ACM" (Advanced Computer Modelling) technique. **This SGI claim is accurate as stated.**
- [Why Donkey Kong Country was a Technical Marvel — GameGrin](https://www.gamegrin.com/articles/why-donkey-kong-country-was-a-technical-marvel/) — games-journalism corroboration of the same SGI/pre-rendered pipeline.
- [Myst — Wikipedia](https://en.wikipedia.org/wiki/Myst) — states the environments "were rendered in StrataVision 3D, with some additional modeling in Macromedia MacroModel," on **Apple Macintosh Quadra** computers — **no SGI hardware involved in Myst itself.**
- [Myst Behind the Scenes — Myst Journey](https://mystjourney.com/myst/making-of/) — corroborates the six-Macintosh-Quadra/StrataVision 3D production pipeline and production stats (~2,500 rendered images, ~2 years development).
- [StrataVision 3D — Wikipedia](https://en.wikipedia.org/wiki/StrataVision_3D) — background on the rendering software and its landmark association with Myst.

**CORRECTION (important): Myst was not rendered on Silicon Graphics workstations.** It was modeled and rendered on Apple Macintosh Quadra computers using StrataVision 3D software. SGI workstations (reportedly 13 SGI Indigo units) were used by Cyan for the 1997 **sequel**, *Riven* — not for the original 1993 Myst. This is a common and easy conflation between the two games' production pipelines; the table above has been corrected to note Myst is Mac/StrataVision, not SGI, distinguishing it from DKC's genuinely SGI-based pipeline in the same era row.

**Act 4 (PS1/N64 early 3D):**
- [Hackaday — "Why PlayStation Graphics Wobble, Flicker And Twitch"](https://hackaday.com/2026/02/06/why-playstation-graphics-wobble-flicker-and-twitch/) — technical explainer: the PS1 GPU has no hardware z-buffer (forcing CPU-side painter's-algorithm depth sorting) and uses affine (non-perspective-correct) texture mapping, causing the characteristic texture "wobble" on shallow-angle polygons; also explains the lack of mipmapping causing distant-texture flicker.
- [Copetti.org — "Nintendo 64 Architecture: A Practical Analysis"](https://www.copetti.org/writings/consoles/nintendo-64/) — deep hardware-level reference confirming the N64 had genuine hardware z-buffering and perspective-correct texture mapping (fixing PS1's wobble problem) but was constrained by only 4KB of texture memory, pushing developers toward blurry low-res textures, flat/Gouraud shading, and hardware dithering to fake extra color depth — the basis for the "low-poly + dithering" framing in the table above.

## Cabinet assignments — history notes for the newer picks
(Original 20 are surveyed in arcade-cabinets-by-era.md and levels.md; these were added
for Act 5 in this cycle.)

| Lvl | Game | Why it earned the cabinet |
|---|---|---|
| 21 | **[[out-run\|Out Run]]** (Sega / Yu Suzuki, 1986) | The definitive [[super-scaler]] road racer — sprite-scaling pseudo-3D, radio-station soundtrack choice, arcade-luxury fantasy. Faithful pixel art: sunset gradient, palms, red convertible |
| 22 | **[[q-bert\|Q\*bert]]** (Gottlieb, 1982; programmed/designed by Warren Davis from an original character concept by artist Jeff Lee) | Isometric cube pyramid — one of the most visually distinct cabinets ever; instantly readable to a child |
| 23 | **Missile Command** (Atari, 1980; Dave Theurer) | Trackball defense classic. IMPORTANT adaptation: in our version cities architecturally cannot be destroyed (no-punishment rule) — keystrokes only intercept; fireworks, not war |
| 24 | High-score entry screen (the AAA initials ritual) | Not a licensed game — the shared cultural memory of typing three initials; here the player types their whole name via Shift |
| 25 | Word processor | The keyboard's destination: writing. Modern, calm, paper-white |

*(Corner Cabinets rationale below is internal narrative design — no external citation applicable.)*

**Corner Cabinets rationale (21-23):** the leftover physical keys (`- = [ ] \ ` '`) are the
keyboard's corners; the levels that teach them are the arcade's forgotten corner machines —
early-80s cabinets rediscovered late. The fidelity regression is intentional and narrative
("the room carries its own history"), and it makes the modern finale (24-25) land harder.

**Rules that governed selection** (unchanged): one game per cabinet, no title reuse across
levels; era-authentic to its level; faithful pixel-art recreation of the real game — never
justified by gimmicks (e.g., key-glyph resemblance was explicitly rejected).

### References — Level 21-23 cabinets

**Out Run (Sega, 1986):**
- [Out Run — Wikipedia](https://en.wikipedia.org/wiki/Out_Run) — developer Sega, director/designer Yu Suzuki, September 1986 release; confirms the "Super Scaler" sprite-scaling technique (also used a year earlier in Hang-On), with a direct Suzuki quote: *"All the calculations in the system were 3D, even from Hang-On. I calculated the position, scale, and zoom rate in 3D and converted it backwards to 2D."*
- [OutRun — Hardcore Gaming 101](https://www.hardcoregaming101.net/outrun/) — corroborates the Super Scaler lineage across Sega's Hang-On/Space Harrier/Out Run/After Burner family.
- [Retro Revisited: Sega Super Scaler Games — Vintage is The New Old](https://www.vintageisthenewold.com/retro-revisited-sega-super-scaler-games) — corroborates "Super Scaler" as the umbrella term for this Sega sprite-scaling hardware generation.

*Note: could not independently verify the internal "Sega AM2" division credit in sources fetched this pass — all confirm "Sega" + "Yu Suzuki," but the AM2 sub-team label is widely repeated in enthusiast sources without a directly confirmed primary citation here. Not a contradiction, just unverified precision.*

**Q\*bert (Gottlieb, 1982):**
- [Q\*Bert Creator Warren Davis Reflects On 40 Years Of The Arcade Classic — Time Extension](https://www.timeextension.com/news/2022/11/interview-qbert-creator-warren-davis-reflects-on-40-years-of-the-arcade-classic) — primary interview with Davis clarifying the design-credit split: Davis wrote all the code and, per Gottlieb's internal convention (programmers = designers, artists were not credited as designers), held the official "designer" title; Lee created the original character/cube-pattern visual concept as an artist.
- [Genealogy of Q\*bert — jeffreyplee.com](https://www.jeffreyplee.com/history-of-qbert/) — Jeff Lee's own first-person account of originating the cube-pyramid character concept.
- [Q\*bert — Wikipedia](https://en.wikipedia.org/wiki/Q*bert) — corroborates: "conceived by Warren Davis and Jeff Lee, the latter of whom designed the titular protagonist and original concept, which was further developed and implemented by Davis."
- [Creating Q\*bert: A Conversation with Warren Davis — Fülle Circle Magazine (2011)](https://www.fullecirclemagazine.com/2011/11/creating-qbert-conversation-with-warren.html) — independent, earlier interview corroborating the same account.

*Correction applied: the flat "Warren Davis/Jeff Lee" co-designer credit has been refined above — Davis is the credited programmer/designer of record; Lee originated the visual character concept as an artist. Both contributions were real, but Gottlieb's own credit convention (and Davis's own account) draws this distinction, so the table entry now reflects it.*

**Missile Command (Atari, 1980):**
- [Missile Command — Museum of the Game (arcade-museum.com)](https://www.arcade-museum.com/Videogame/missile-command) — developer Atari, Dave Theurer credited as Designer/Programmer, 1980, trackball + three fire buttons, "defend your cities against incoming missiles."
- [Missile Command — Wikipedia](https://en.wikipedia.org/wiki/Missile_Command) — confirms June 1980 North American release; the player uses a trackball (chosen by Theurer for speed over a joystick) to defend six cities from ICBMs launched from three bases.
- [Dave Theurer — Museum of the Game (arcade-museum.com)](https://www.arcade-museum.com/people/Dave-Theurer-16) — designer-credit corroboration (also credits Theurer on Tempest, 1981).

## Parked: Act 7 "speed / racing wing"
*Retitled 2026-09-12: this paragraph described Act 6, but **Act 6 shipped as the Text
Worlds wing** (prose + tile worlds + the maker + the IM-friend). The speed/racing idea it
actually describes is **Act 7**. Full generational arc and the cabinet-collision analysis
now live in [[racing-games-by-era]].*

Post-graduation act discussed 2026-07-10: **Mario Kart** and **Tron** cabinets (Trevor's
childhood list; the other four — Zelda, GoldenEye, DKC, FF7 — already own cabinets).
No new keys remain, so it's a speed/sentence "greatest hits" wing at modern fidelity;
historical-ordering rules deliberately loosened. See docs/ROADMAP.md §2.

**Note (2026-09-12):** Tron is still free (no assigned cabinet) but **Out Run is Level 21**,
so the racing wing cannot reuse it — [[racing-games-by-era]] substitutes **Hang-On** (1985),
which is better history anyway: it is the *first* Super Scaler game, not the famous one.

### References — Act 7 parked mentions

**[[mario-kart|Mario Kart]]** (likely candidate: the original *Super Mario Kart*, Nintendo, SNES, 1992):
- [Super Mario Kart — Wikipedia](https://en.wikipedia.org/wiki/Super_Mario_Kart) — developed by Nintendo EAD (Shigeru Miyamoto as EAD general manager overseeing development), released in Japan August 27, 1992, for SNES; "credited with inventing the 'kart racing' subgenre of video games."
- [Best Mario Kart Games Of All Time — Nintendo Life](https://www.nintendolife.com/guides/best-mario-kart-games-of-all-time) — "the game that birthed an entire genre."
- [Super Mario Kart — Super Mario Wiki (mariowiki.com)](https://www.mariowiki.com/Super_Mario_Kart) — corroborating production credits (Miyamoto producer; Tadashi Sugiyama/Hideki Konno directors). Fan-maintained; used only as a corroborating third source, not standalone.

**[[tron|Tron]]** (Bally Midway, 1982) — already has a full entry in `arcade-cabinets-by-era.md`; citations there apply. Summary: developer Bally Midway, released August 1982, licensed from the 1982 Disney film, four sub-games (naming varies slightly by source — "I/O Tower" per Wikipedia vs. "Grid Bugs" per arcade-museum.com for one segment), blacklight-lit glowing cabinet, ~10,000 units sold.
- [Tron — Museum of the Game (arcade-museum.com)](https://www.arcade-museum.com/Videogame/tron)
- [Tron (video game) — Wikipedia](https://en.wikipedia.org/wiki/Tron_(video_game))

---

## Levels.md curriculum games — citations

The games below are assigned to specific levels in `.claude/rules/levels.md` (read-only
reference; not edited by this pass) but did not yet have dedicated citations in either
research file — `arcade-cabinets-by-era.md` is a general arcade-cabinet survey and doesn't
1:1 match the curriculum, and several of these are console/CD-ROM titles outside its scope.
Recorded here per level for completeness.

### Level 5 — [[joust|Joust]] (Williams Electronics, 1982)

- Developer/publisher: Williams Electronics, Inc., released 1982. Lead designer: **John Newcomer** (his first game at Williams); full credited team: programmer Bill Pfutzenreuter, artist Janice "Jan" Woldenberg-Miller, cabinet art by Python Anghelo, audio by Tim Murphy and John Kotlarik.
- Controls: one "Flap" button + 2-way joystick (left/right only, no up/down) — repeated flapping makes the mount ascend/hover/descend.
- Two-player mode allows cooperative play against enemy waves or optional player-vs-player combat — one of the earliest arcade games to offer this choice.
- The "Lava Troll" (a giant hand rising from the lava) drags down any mount flying too low; a periodic pterodactyl adds bonus-point risk.
- ~26,000 cabinets shipped.

**References**
- [Joust — Museum of the Game (International Arcade Museum / KLOV)](https://www.arcade-museum.com/Videogame/joust) — Williams Electronics, 1982 release, flap-button/2-way-joystick controls, Lava Troll mechanic.
- [John Newcomer interview — Pluralsight](https://www.pluralsight.com/resources/blog/software-development/interview-legendary-game-designer-john-newcomer) — Newcomer's own account of designing Joust at Williams (1982).
- [John Newcomer — Joustmaster.com](https://joustmaster.com/developers/john-newcomer/) — dedicated Joust developer archive corroborating the full credited dev team.
- [Joust (video game) — Wikipedia](https://en.wikipedia.org/wiki/Joust_(video_game)) — corroborates co-op/versus dual mode, pterodactyl hazard, ~26,000 units shipped. Used alongside the museum/interview sources, not alone.

*Note: this is a new entry — Joust previously had no detail in `arcade-cabinets-by-era.md` despite being Level 5's cabinet. Recommend adding a full table entry there matching the file's existing per-game format; the facts above are ready to drop in.*

### Level 7 — [[dragons-lair|Dragon's Lair]] (Cinematronics / Advanced Microcomputer Systems, 1983)

- Developed by Advanced Microcomputer Systems, published by Cinematronics, released June 1983.
- Conceived by **Rick Dyer**, who brought in **Don Bluth's** animation studio (ex-Disney) — ~22 minutes of animation, ~50,000 drawings, ~$1.3M of the ~$3M total budget.
- Used laserdisc (Pioneer NTSC player) playback for full-motion-video branching gameplay, decision points roughly every 1.5 seconds.
- **50-cents-per-play claim confirmed but not verifiably "first ever":** Dragon's Lair is famous for charging 50 cents instead of the standard quarter, reflecting its unprecedented production cost — well documented. However, it was likely not the literal first game to do so (Missile Command briefly shipped with a factory 50-cent default before reverting to 25 cents; some accounts also cite Pole Position at 50 cents around the same period). Recommend phrasing as "became famous for" rather than "was the first game to."

**References**
- [Dragon's Lair and the Laser Game Craze — The Dot Eaters](https://thedoteaters.com/?bitstory=bitstory-article-2/dragons-lair-and-the-laser-game-craze) — detailed history: Dyer's concept, Cinematronics' financial situation, Don Bluth animation stats, laserdisc technology.
- [Dragon's Lair (1983 video game) — Wikipedia](https://en.wikipedia.org/wiki/Dragon's_Lair_(1983_video_game)) — confirms the 50-cent price point and earnings figures ($32M, ~$103M inflation-adjusted). Used alongside a second source, not alone.
- [40 years later, I finally beat the arcade game that financially destroyed me as a child — PC Gamer](https://www.pcgamer.com/games/action/40-years-later-i-finally-beat-the-arcade-game-that-financially-destroyed-me-as-a-child/) — games-journalism corroboration of the 50-cent pricing and player experience.

### Level 9 — [[super-mario-bros|Super Mario Bros]] (Nintendo, 1985)

- Directed/designed by **Shigeru Miyamoto**, co-designed with **Takashi Tezuka**, programmed by Toshihiko Nakago. Released in Japan September 13, 1985, for the Famicom/NES.
- The "saved the industry" framing is the accepted historical narrative and specifically refers to the North American video game crash of 1983 — Super Mario Bros. and the NES are widely credited with reviving the market.

**References**
- [Super Mario Bros. — Wikipedia](https://en.wikipedia.org/wiki/Super_Mario_Bros.) — director/designer credits, September 13, 1985 Japan release, and the "resurrected the video game industry after the market crash of 1983" claim (cited there to a further source).
- [Computer History Museum — "Nintendo Ups the Ante"](https://www.computerhistory.org/revolution/computer-games/16/194) — independently corroborates the 1983 market collapse and Nintendo's NES/Super Mario Bros.-led revival.
- [Nintendo Life — "Mario History: Super Mario Bros. – 1985"](https://www.nintendolife.com/news/2015/08/mario_history_super_mario_bros_-_1985) — development history, Miyamoto/Tezuka roles.

### Level 10 — [[legend-of-zelda|The Legend of Zelda]] (Nintendo, 1986)

- Designed and directed by **Shigeru Miyamoto** and **Takashi Tezuka** (Miyamoto produced; Tezuka wrote story/script). Released in Japan February 1986 as a Family Computer Disk System launch title; the North American NES cartridge release followed more than a year later (1987).
- The gold-colored cartridge and cutaway box design were specific to the North American NES cartridge release, not the original 1986 Japanese Famicom Disk System version.
- The North American cartridge was one of the first NES games with an internal battery for saving game data — genuinely significant and confirmed.

**References**
- [The Legend of Zelda (video game) — Wikipedia](https://en.wikipedia.org/wiki/The_Legend_of_Zelda_(video_game)) — release dates (Japan Feb 1986 Disk System; NA 1987 cartridge), gold cartridge, battery save, designer credits.
- [Cave Gamers — "Going for Gold: The Legend of Zelda's Colored Cartridges"](https://cavegamers.com/blogs/video-game-history/going-for-gold-the-legend-of-zeldas-colored-cartridges) — gold cartridge packaging detail specific to the NA release.

*Note: if `levels.md`'s Level 10 entry implies the gold cartridge was part of the original 1986 release, that's an NA-specific detail from the later cartridge version, not the original Japanese Disk System launch — flagged for awareness, not edited here.*

### Level 11 — [[sonic-the-hedgehog|Sonic the Hedgehog]] (Sega, 1991)

- Lead programmer **Yuji Naka**, character designer **Naoto Ohshima**, level/lead designer **Hirokazu Yasuhara** — collectively "Sonic Team." Released June 23, 1991, on Sega Genesis. Developed under the internal codename "Defeat Mario."
- Speed was the explicit core design pillar — Naka built a curved-movement algorithm specifically to let Sonic move faster than Super Mario Bros. while staying readable.
- The Genesis briefly outsold the SNES roughly 2:1 in late 1991, and Sonic is widely credited as central to that swing — a genuine console-war counterpoint to Nintendo's Mario.

**References**
- [Sonic the Hedgehog (1991 video game) — Wikipedia](https://en.wikipedia.org/wiki/Sonic_the_Hedgehog_(1991_video_game)) — designer credits, June 23, 1991 release, Genesis platform, "Defeat Mario" codename, speed-as-design-pillar quotes.
- [Sonic the Hedgehog — The Strong National Museum of Play](https://www.museumofplay.org/games/sonic-the-hedgehog/) — institutional museum-induction source (2016) confirming 1991 release, the internal "Mr. Needlemouse" design contest, and Sonic's role in the Sega/Nintendo console wars. Does not name Naka/Ohshima individually — pair with the Wikipedia source for designer credits.

### Level 13 — [[myst|Myst]] (Cyan, Inc., 1993)

- Created by brothers **Rand and Robyn Miller** at Cyan, Inc. (Spokane, WA), published by Brøderbund, released September 24, 1993, for CD-ROM.
- **Rendered on Apple Macintosh Quadra computers using StrataVision 3D** (by Strata, Inc.), with additional modeling in Macromedia MacroModel, image editing in Photoshop, video work in Adobe Premiere — roughly 2,500 rendered images and ~40-66 minutes of QuickTime animation. **Not Silicon Graphics** (see Act 3 correction above — SGI was used for the 1997 sequel Riven, not the original Myst).

**References**
- [Myst — Wikipedia](https://en.wikipedia.org/wiki/Myst) — Miller brothers/Cyan Inc., September 24, 1993 release, CD-ROM platform, StrataVision 3D on Macintosh Quadra (not SGI).
- [Myst Behind the Scenes — Myst Journey](https://mystjourney.com/myst/making-of/) — corroborates the six-Macintosh-Quadra/StrataVision 3D pipeline and production stats.
- [StrataVision 3D — Wikipedia](https://en.wikipedia.org/wiki/StrataVision_3D) — background on the rendering software itself.

### Level 14 — [[donkey-kong-country|Donkey Kong Country]] (Rare, SNES, 1994)

- Developed by Rare, published by Nintendo, released November 1994. Rare invested NES-era profits (~1992) in Silicon Graphics (SGI) Challenge workstations running Alias PowerAnimator, building 3D NURBS character models that were textured, animated, rendered frame-by-frame, and compressed down to 2D sprites for the SNES via Rare's proprietary "ACM" (Advanced Computer Modelling) technique. **This SGI claim is accurate and well-documented** — unlike the frequently-confused Myst claim above.

**References**
- [Donkey Kong Country — Wikipedia](https://en.wikipedia.org/wiki/Donkey_Kong_Country) — Rare/Nintendo, 1994, SGI Challenge workstations + Alias PowerAnimator + NURBS modeling + ACM compression technique.
- [Why Donkey Kong Country was a Technical Marvel — GameGrin](https://www.gamegrin.com/articles/why-donkey-kong-country-was-a-technical-marvel/) — games-journalism corroboration.

### Level 15 — [[pokemon-red-blue|Pokémon Red/Green and Red/Blue]] (Game Freak, 1996 Japan / 1998 US)

- Developed by Game Freak, published by Nintendo, designed/created by **Satoshi Tajiri** with character/art direction by **Ken Sugimori**. Development took roughly six years and nearly bankrupted Game Freak.
- **Pokémon Red and Green** released in Japan February 27, 1996; recombined and localized as **Pokémon Red and Blue** for North America in 1998.

**References**
- [Pokémon Red, Blue, and Yellow — Wikipedia](https://en.wikipedia.org/wiki/Pok%C3%A9mon_Red,_Blue,_and_Yellow) — Game Freak/Nintendo, Game Boy platform, Japan Feb 27 1996 release (Red/Green), North America/Australia 1998 release (Red/Blue).
- [Satoshi Tajiri — Wikipedia](https://en.wikipedia.org/wiki/Satoshi_Tajiri) — Tajiri as designer/creator, six-year development period, Game Freak's near-bankruptcy during production.
- [Pokémon Red and Green Versions — Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Red_and_Green_Versions) — Pokémon-specialist reference corroborating release dates and regional naming. Used as a corroborating source, not standalone.

*Gap flagged: no Smithsonian/Strong Museum of Play source was located specifically for Pokémon Red/Blue's release history in this pass — worth a follow-up search if an institutional citation is required for this entry specifically.*

### Level 16 — [[simcity-2000|SimCity 2000]] (Maxis, 1993)

- Designed by **Will Wright**, co-developed with **Fred Haslam** at Maxis. Macintosh version released December 1993; MS-DOS version February 1994. Maxis both developed and published (distinct from the original 1989 SimCity, which Brøderbund distributed).
- Introduced isometric view (replacing the original's top-down perspective), underground infrastructure layers, and an expanded on-screen color palette.

**References**
- [SimCity 2000 — Wikipedia](https://en.wikipedia.org/wiki/SimCity_2000) — designer credits (Wright/Haslam), 1993 release, Mac/DOS platforms.
- ["SimCity" — The Strong National Museum of Play](https://www.museumofplay.org/games/simcity/) — Wright/Maxis, Brøderbund's role on the original SimCity, World Video Game Hall of Fame induction, historical significance.
- ["Will Wright. SimCity 2000. 1993" — MoMA Collection](https://www.moma.org/collection/works/152406) — MoMA's permanent collection entry crediting Will Wright, 1993 date. Found via search, not independently fetched — use as a supplementary third source.

### Level 17 — [[goldeneye-007|GoldenEye 007]] (Rare, Nintendo 64, 1997)

- Developed by Rare, published by Nintendo, released 1997 for N64. Lead designer **Martin Hollis**; development began January 1995 (~2.5 years).
- **Correction:** four-player split-screen multiplayer was **not part of the original plan** — it was added late in development (starting ~March/April 1997), primarily implemented by programmer Steve Ellis, and was nearly cut for time. It is nonetheless genuinely credited as pioneering/notable for console FPS: Edge magazine (via Wikipedia) says it "set the standard for multiplayer console combat" until Halo (2001) surpassed it, and The Strong Museum calls it "still considered one of the best multiplayer experiences ever produced on a Nintendo system."

**References**
- [GoldenEye 007 — Wikipedia](https://en.wikipedia.org/wiki/GoldenEye_007) — Rare/Martin Hollis/1997/N64, and the Edge magazine quote on split-screen significance.
- ["Goldeneye 007" — The Strong National Museum of Play](https://www.museumofplay.org/games/goldeneye-007/) — N64 "killer app" status, split-screen significance, 8M+ units sold, 2025 World Video Game Hall of Fame induction.

*Correction applied: any doc language implying split-screen was planned from the start should read instead that it was a late, near-cut addition — flagged here for accuracy.*

### Level 18 — [[age-of-empires|Age of Empires]] (Ensemble Studios, 1997)

- Developed by Ensemble Studios, published by Microsoft, released October 15, 1997 — first major Ensemble release, built on their in-house "Genie" engine (programmer Matt Pritchard). Design credits: Bruce Shelley, Rick Goodman, Tony Goodman (art), Dave Pottinger (AI). Real-time strategy genre, notable as one of the first history-themed (rather than sci-fi/fantasy) RTS games. Named 1998 "Computer Strategy Game of the Year" by the Academy of Interactive Arts & Sciences.

**References**
- [Age of Empires (video game) — Wikipedia](https://en.wikipedia.org/wiki/Age_of_Empires_(video_game)) — developer/publisher/date/genre, design credits, AIAS award.
- ["Age of Empires" — Encyclopaedia Britannica](https://www.britannica.com/topic/Age-of-Empires) — independent corroboration of RTS genre, historical setting, Microsoft publishing.
- [World Video Game Hall of Fame inducted games — The Strong National Museum of Play](https://www.museumofplay.org/exhibits/world-video-game-hall-of-fame/inducted-games/) — confirms institutional recognition; the Strong also holds an Age of Empires archival collection.

*Gap flagged: the exact October 15, 1997 date and Microsoft-as-publisher were sourced via Wikipedia only in this pass (not independently corroborated by a second primary source) — recommend a follow-up confirmation if precision on the exact date matters.*

### Level 19 — [[final-fantasy-vii|Final Fantasy VII]] (Square, 1997)

- Developed and published by **Square** (now Square Enix), released January 1997 in Japan for PlayStation. Director **Yoshinori Kitase**; producer Hironobu Sakaguchi; composer Nobuo Uematsu; character design Tetsuya Nomura.
- First mainline Final Fantasy with 3D character models over pre-rendered 2D backgrounds and full-motion video. Development began in 1994, originally targeting Super Famicom/Nintendo 64 before moving to PlayStation for CD-ROM capacity.
- Director Kitase has stated in period interviews that the move to 3D-rendered characters (replacing the earlier "nitoushin"/chibi sprite style) was intended to achieve "a completely unified" visual style now that characters would render in real time.

**References**
- [Final Fantasy VII — Wikipedia](https://en.wikipedia.org/wiki/Final_Fantasy_VII) — developer/director/producer/composer/release date/platform, pre-rendered background + 3D model detail.
- [Final Fantasy VII – 1997 Developer Interviews — shmuplations.com](https://shmuplations.com/ff7/) — primary-source translated 1997 Japanese developer interviews (Kitase, art director Naora) directly supporting the "why 3D / why pre-rendered backgrounds" design rationale.
- ["Final Fantasy VII" — The Strong National Museum of Play](https://www.museumofplay.org/games/final-fantasy-vii/) — Square, 1997, PlayStation, JRPG mainstreaming in the West, sales/marketing figures ($30M Sony/Square marketing campaign, 10M+ copies sold).

---

## Corrections from citation pass (2026-07)

Fact corrections made while adding citations to this file. Each is sourced in its section
above; listed together here for a quick scan.

1. **Myst — rendering hardware (highest-priority correction).** The Act 3 era table and prior notes implied Myst used SGI (Silicon Graphics) pre-rendering, echoing Donkey Kong Country's pipeline. This is **false** — Myst was modeled and rendered on Apple Macintosh Quadra computers using StrataVision 3D software (confirmed by Wikipedia and mystjourney.com's making-of account). Silicon Graphics workstations were used by Cyan for the 1997 sequel *Riven*, not the original 1993 Myst. The era table and the Level 13 entry have both been corrected to state Myst is Mac/StrataVision, distinguishing it from DKC's genuinely SGI-based pipeline in the same table row.
2. **Q\*bert — design credit**, same correction as logged in `arcade-cabinets-by-era.md`: "Warren Davis/Jeff Lee" flat co-design credit refined to "programmed/designed by Davis, from an original character concept by artist Lee," per Gottlieb's own crediting convention and Davis's own account. Applied to the Level 21-23 cabinet table entry in this file.
3. **NES color palette — "~52-color palette" claim.** This figure describes the NES PPU's total *master* palette (52-55 distinguishable values out of a 64-value register, after removing duplicates), not how many colors can appear on screen at once. Only 25 colors (13 background + 12 sprite) can be displayed simultaneously. The Act 2 era-table row and its References subsection now distinguish these two numbers explicitly.
4. **GoldenEye 007 — split-screen multiplayer origin.** Corrected an implicit "planned from the start" framing: four-player split-screen was added late in development (~March/April 1997), primarily by programmer Steve Ellis, and was nearly cut for time. The claim that it was pioneering/notable for console FPS is independently confirmed (Edge magazine via Wikipedia; The Strong National Museum of Play) and remains accurate — only the "was it planned" framing needed correction.
5. **Street Fighter II — combo system framing**, same correction as logged in `arcade-cabinets-by-era.md` (its full entry lives there): "unintended bug" softened to "unintended discovery" per director Akira Nishitani's own account.
6. **Dragon's Lair — 50-cents-per-play claim.** Confirmed real and well-documented, but likely not verifiably the literal *first* arcade game to charge 50 cents (Missile Command briefly used a factory 50-cent default; some accounts also cite Pole Position). Recommend "became famous for" rather than "was the first to."
7. **No changes needed** for: Breakout (era-claims Act 1 all covered per-game in `arcade-cabinets-by-era.md`), Super Mario Bros, The Legend of Zelda, Sonic the Hedgehog, Donkey Kong Country, Pokémon Red/Blue, SimCity 2000, Age of Empires, Final Fantasy VII, Out Run, Missile Command, Tron, or Super Mario Kart — all core facts (developers, designers, years, core technology claims) were independently confirmed across multiple sources with no contradictions found.

### Flagged for the doc owner (not edited in this pass, per task instructions)

- **`.claude/rules/levels.md` (Level 8) and `CLAUDE.md`'s level table** credit Tetris as "Pajitnov / Nintendo, 1984" or similar shorthand — this conflates Pajitnov's 1984 Soviet original (no Nintendo involvement) with Nintendo's 1989 Game Boy release, five years later via a separate license. Full explanation and sourcing in `arcade-cabinets-by-era.md`'s Tetris entry and corrections section. Recommend splitting into two dated facts rather than one merged credit line.
- **`.claude/rules/levels.md` (Level 10)**, if it implies Zelda's gold cartridge was part of the original 1986 release: the gold cartridge and cutaway box are North America-specific details from the later 1987 NES cartridge release, not the original February 1986 Japanese Famicom Disk System launch. Not necessarily an error in levels.md as currently written (it doesn't specify the cartridge color), but worth awareness if that detail is ever added.

### Unsourceable / gaps flagged, not fabricated

- No Smithsonian or Computer History Museum page was located covering Breakout, Space Invaders, Pac-Man, Galaga, Donkey Kong, Joust, or Dragon's Lair specifically (Act 1-2 research pass) — institutional coverage of these titles didn't surface in search results despite genuine attempts; Computer History Museum's general "Revolution" exhibit pages were used where relevant instead.
- No Smithsonian/Strong Museum of Play source was located specifically for Pokémon Red/Blue's release history.
- Age of Empires' exact release date (October 15, 1997) and Microsoft-as-publisher were confirmed via Wikipedia only in this pass, not independently corroborated by a second primary source — flagged rather than treated as fully verified.
- Out Run's internal "Sega AM2" division credit could not be independently confirmed in sources checked (all confirm "Sega" + Yu Suzuki, not the AM2 sub-team label specifically) — left in the cabinet table as commonly repeated but unverified precision, not removed, since "Sega" itself is solidly confirmed.

*Citations and corrections added July 2026.*
