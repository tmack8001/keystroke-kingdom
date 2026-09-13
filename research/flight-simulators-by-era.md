# Flight Simulators by Era — and the climb to orbit
## Research for a standalone flight/space act: the generational spine, the keyboard-as-cockpit thesis, the combat verdict, the space arc, and the NASA↔computing connection

*Compiled 2026-09-12 by the arcade-historian. This began as the non-car half of
[racing-games-by-era.md](racing-games-by-era.md) (Act 7 — Speed / Racing) and was pulled out
mid-lane on Trevor's instruction: **"maybe the flight sims could be pulled out into a new act in
and of themselves as I'm sure there are a bunch of those and that might be mixing the theme of this
new act anyways."** He was right, and the evidence below says he was more right than he knew — the
two acts have **different theses**, and this one's is stronger.*

*Then it grew twice more, both times usefully: **"flights could even include moving up into
astronaut flights… a space exploration level which would go over really well with kids as they
learn about moon, stars, sun and planets in 1st/2nd grade"** (§8, §10, §12 — and the NGSS check in
§10 says he is right about the grade), and **"NASA was also where the idea of computer science as a
career came from anyways! so a perfect fit into our hacker/tech culture"** (§11 — substantially
true in a specific, documentable form, and the reason this act belongs to the game's spine rather
than beside it).*

**How to verify.** Every claim follows the arcade-historian citation standard
(`.claude/agents/arcade-historian.md`): 2–4 references per item, institutional/primary preferred,
Wikipedia never alone, and **no URL written from memory** — every link appeared in a live search
result or was fetched this session. References are labelled **[fetched]** (read, and confirmed to
support the specific claim) or *(search result only, not fetched)*. Well over half of the URLs here
were directly fetched, including every load-bearing one. Five URLs returned **HTTP 403** and are
listed as unusable in §14 rather than cited as read.

**Related:** [racing-games-by-era.md](racing-games-by-era.md) (the ground-racing act) ·
[vehicle-games-beyond-cars.md](vehicle-games-beyond-cars.md) (bikes, boats, trains — Act 7's
companion) · [automotive-vocabulary.md](automotive-vocabulary.md) (the car word layer this file's
§12 is built to merge with) · [hacker-culture.md](hacker-culture.md) ·
[computing-history-moments.md](computing-history-moments.md) · `.claude/rules/levels.md` ·
`docs/ROADMAP.md` §2

Atomic wiki pages: [[keyboard-as-cockpit]] · [[flight-sim-rendering-eras]] ·
[[flight-simulator-fs1]] · [[microsoft-flight-simulator]] ·
[[chuck-yeagers-advanced-flight-trainer]] · [[falcon-flight-sim]] · [[pilotwings]] ·
[[flight-unlimited]] · [[pilotwings-64]] · [[x-plane]] · [[lunar-lander-1979]] ·
[[kerbal-space-program]] · [[apollo-guidance-computer-dsky]] · [[margaret-hamilton]] ·
[[katherine-johnson]] · [[human-computers]] · [[apollo-11-moon-landing-1969]] ·
[[ngss-space-standards]] · [[arpa-ipto-funding]] · [[battlezone]]

---

## 0. The five things to read first

1. **The keyboard-as-cockpit claim is REAL, and it is the strongest in-genre justification for a
   typing act anywhere in this project.** Publishers shipped **printed keyboard command reference
   cards in the box** — two survive as scanned primary artifacts (Microsoft's own **FS 4.0 Quick
   Reference Card, 1989**; **Falcon 3.0's, 1991**, listing ~80–90 key commands across ~14
   categories). §3. **But one specific romantic detail is NOT verified** — plastic overlays sitting
   physically over the keys. Say "quick reference cards." §3 and [[keyboard-as-cockpit]].
2. **The act's thesis is not speed.** Act 7's thesis is *typing speed and accuracy are the
   throttle*. This act's is **typing COMMANDS to operate a machine** — flaps, gear, trim, radio —
   which is structurally closer to Act 6's Green Dragon than to a race. Two different acts, and
   the split Trevor proposed is the right one. §1.
3. **No combat.** Not on ratings grounds — Microsoft Combat Flight Simulator is **ESRB E** — but on
   register. And the alternatives are excellent and well-documented: gliders, aerobatics with an
   instructor, licence lessons, bush flying, and MSFS 2024's **aerial firefighting and search &
   rescue** career. §6.
4. **The arc has one axis and it is ALTITUDE, and the rendering climbs with it for free.** Runway →
   air → orbit → Moon. Wireframe (1980) → filled polygons (1982) → textured (1993) → hardware 3D
   (1996) → photogrammetry of the real Earth (2020) → real imagery of real planets. §2, §8, §9.
5. **Trevor's NASA↔computing hunch is substantially right in one specific form and wrong in
   another.** *"NASA invented computer science"* — no. **"The space program is where software
   became a named engineering profession"** — yes: the Computer History Museum states that
   [[margaret-hamilton]] *"made up the term 'software engineering'"* while leading Apollo's flight
   software. §11.

---

## 1. Why this is its own act — the thesis test

| | **Act 7 — Speed / Racing** | **This act — Flight / Space** |
|---|---|---|
| Typing means | **Throttle.** Faster + more accurate typing ⇒ faster vehicle | **Command.** A typed word *operates a system* — gear, flaps, trim, radio |
| Closest existing act | Free Play / WPM | **Act 6 Green Dragon** (typed commands, no clock) |
| Axis of progression | Calendar years, 1974→now | **Altitude** — and the calendar climbs with it |
| Emotional register | Exhilaration | **Wonder**, then competence |
| Failure in the source material | Crashes, timers, elimination | Crashes — but the modern flagship **cuts to black with an explanation** (§9) |

The two would genuinely have muddied each other. A racing act wants a finish line; a flight act
wants a *destination* and a checklist. Keep them apart.

**One sentence a spec lane can build on:** *in a racing game you type to go faster; in a flight
game you type to make the machine do a thing, and the thing is how you get home.*

---

## 2. The atmospheric arc — the generational spine, with rendering per era

Full per-era rendering detail (and the canvas grammar a theme author needs) lives on
[[flight-sim-rendering-eras]]. Summary:

| # | Station | Date | Platform | Rendering | Why it earns the slot |
|---|---|---|---|---|---|
| 1 | [[flight-simulator-fs1]] | **Jan 1980** (Apple II); TRS-80 later 1980 | Apple II / TRS-80 | **Wireframe**, black & white; **36 tiles in a 6×6 grid**; composite-artifact colour | Where home flight simulation begins. A rendering technique the game owns nowhere else |
| 2 | [[microsoft-flight-simulator]] **1.0** | **Nov 1982** | IBM PC | **Solid-filled colour polygons** (CGA); Artwick replaced the Apple wireframe | The PC-compatibility yardstick (§5). Cessna 182 from **Meigs Field** |
| 3 | [[chuck-yeagers-advanced-flight-trainer]] | **1987** | C64, Apple II, DOS, ZX Spectrum, MSX, Amstrad, Mac | 8-bit/16-bit solids; **10 viewpoints**, zoom to 256× | The great **civilian** 8-bit sim — a real aviator, real aerodynamics, **no combat** |
| — | *[[falcon-flight-sim]]* | *1987 / 1991* | *Mac, DOS* | *VGA solids; math coprocessor for the real flight model* | ***Documented, recommended AGAINST.*** Its reference card is the act's best artifact (§3, §6) |
| 4 | [[pilotwings]] | **Dec 1990** JP / **Aug 1991** NA | SNES (launch title) | **Mode 7** — one rotated/scaled raster plane, no polygons | Civilian; light plane, hang glider, skydive, rocket belt; **a lesson curriculum**. ESRB E |
| 5 | [[flight-unlimited]] | **7 Jun 1995** | MS-DOS | **Stereophotogrammetry** terrain from aerial photos (~11 sq mi areas) + **real-time computational fluid dynamics** | **No combat, deliberately** — and a *simulated instructor teaches you*. 780k copies |
| 6 | [[pilotwings-64]] | **Sep 1996** NA | Nintendo 64 (launch title) | **Hardware 3D**: LOD, mipmapping, z-buffering, texture filtering, anti-aliasing | Co-developed by **Paradigm Simulation**, who built *actual military flight trainers*. ESRB E |
| 7 | [[x-plane]] | **1995 →** | Win/Mac/Linux | Not a look — a *model*: **blade element theory** in real time | **FAA-certified** professional version. "Is it real?" — yes, real enough to log hours |
| 8 | [[microsoft-flight-simulator]] **(2020)** | **18 Aug 2020** | PC / Xbox | **Streamed photogrammetry**: >2.5 PB of Bing data on Azure; 37,000 airports, 1.5B buildings, 2T trees | The whole planet. **ESRB E. No combat.** Crash = cut to black with an explanation |
| 8b | **MSFS 2024** | **19 Nov 2024** | PC / Xbox | As above, evolved | **Career Mode**: medevac, cargo, **aerial firefighting**, **search & rescue**. ESRB E |

**The one-sentence version for a child:** *the first flight simulator drew the world with about
thirty-six squares. The newest one draws the whole planet.*

### References — §2
All eight stations carry their full citation sets on their own wiki pages (linked above); the
load-bearing sources, all **[fetched]**, are:
- [Flight Simulator (1980 video game) — Wikipedia](https://en.wikipedia.org/wiki/Flight_Simulator_(1980_video_game)) — FS1 Apple II January 1980, TRS-80 1980; wireframe; the 36-tile 6×6 world; the "British Ace" dogfight mode. **[fetched]**
- [The Dream of Flight — The Digital Antiquarian](https://www.filfre.net/2021/01/the-dream-of-flight/) — Artwick's May 1976 PLATO/PDP-11 thesis; subLogic founded early 1977 with Stu Moment; wireframe → solid-filled colour for the IBM PC. **[fetched]**
- [History of Microsoft Flight Simulator — Wikipedia](https://en.wikipedia.org/wiki/History_of_Microsoft_Flight_Simulator) — the full version/graphics ladder including texture mapping first in FS 5.0 (1993) and DirectX 3D in FS98. **[fetched]**
- [Microsoft Flight Simulator (1982 video game) — Wikipedia](https://en.wikipedia.org/wiki/Microsoft_Flight_Simulator_(1982_video_game)) — November 1982, Cessna 182, Meigs Field, the Europe 1917 mode, the Lotus 1-2-3 compatibility test, the 2021 Hall of Fame induction. **[fetched]**
- [Chuck Yeager's Advanced Flight Trainer — Wikipedia](https://en.wikipedia.org/wiki/Chuck_Yeager's_Advanced_Flight_Trainer) — EA/Lerner Research 1987; the Microsoft trademark rename; 12 real + 3 experimental aircraft; SPA Platinum May 1988. **[fetched]**
- [Pilotwings — Wikipedia](https://en.wikipedia.org/wiki/Pilotwings) — Nintendo EAD; Dec 21 1990 JP / Aug 23 1991 NA launch title; Mode 7; the four disciplines and the licence lessons. **[fetched]**
- [Flight Unlimited — Wikipedia](https://en.wikipedia.org/wiki/Flight_Unlimited) — LookingGlass, June 7 1995; Blackley's real-time CFD; stereophotogrammetry terrain; the simulated instructor; **no combat**; 780k copies. **[fetched]**
- [Pilotwings 64 — Wikipedia](https://en.wikipedia.org/wiki/Pilotwings_64) — Nintendo EAD/R&D3/**Paradigm Simulation** ("military vehicle and flight simulators"); Sep 29 1996 NA launch; LOD/mipmapping/z-buffering/texture filtering/anti-aliasing; bronze/silver/gold licences scored partly on **landing softness**. **[fetched]**
- [X-Plane (simulator) — Wikipedia](https://en.wikipedia.org/wiki/X-Plane_(simulator)) — Laminar Research/Austin Meyer 1995; blade element theory; FAA certification of the professional X-Plane 12 and its hardware conditions. **[fetched]**
- [Microsoft Flight Simulator: The Future of Game Development — Microsoft, first-party](https://developer.microsoft.com/en-us/games/articles/2021/07/microsoft-flight-simulator-the-future-of-game-development/) — >2.5 PB Bing dataset, 37,000 airports, 2M cities, 1.5B buildings, 2T trees, 117M lakes; Azure ML; meteoblue weather and FlightAware traffic. **[fetched]**
- [Microsoft Flight Simulator (2020 video game) — Wikipedia](https://en.wikipedia.org/wiki/Microsoft_Flight_Simulator_(2020_video_game)) — Asobo/Xbox Game Studios; Aug 18 2020; 30–40 handcrafted airports; **no combat**; crashes cut to black with an explanatory message. **[fetched]**

---

## 3. ⚠️ The keyboard IS the interface — the finding this act rests on

**Short answer: yes, and it is documentable — but one popular detail of the story is not.**

**What the evidence supports.** Flight simulators bind essentially every aircraft *system* to a
key. A joystick moves the stick; `G` lowers the gear. Publishers shipped **printed quick reference
cards** in the box because players could not be expected to remember them all:

- **Microsoft Flight Simulator 4.0 (Microsoft, 1989) — "Quick Reference Card."** A scanned primary
  artifact on the Internet Archive, catalogued as *"Reference Card for MS Flight Simulator 4.0."*
- **Falcon 3.0 (1991) — "Quick Reference Card."** The scanned text lists roughly **80–90 distinct
  key commands across ~14 categories**: map, stick, throttle/afterburner, weapons, radar,
  **13 separate view keys**, zoom/rotation, countermeasures, flight controls (autopilot, brakes,
  flaps, gear, ejection), AVTR/replay, stores, **14 wingman-order keys**, comms, misc.
- Even ordinary civilian flight needed dozens: Jonathan M. Stern's published *Microsoft Flight
  Simulator Handbook* documents **40+ keyboard commands** across flight controls, flaps/spoilers,
  throttle and propeller, mixture, EGT bug, instrument calibration, gear and brakes, lights and
  autopilot.
- Modern sims got bigger, not smaller — MSFS 2020 ships several hundred default bindings.
- Period retrospectives are blunt about the cost: players had to *"memorize what each key did,"*
  and in most early sims you could not take off without reading the manual.

**What is NOT verified, and must not be written.** The romantic version — *plastic keyboard
overlays that sat over the keys, in every flight-sim box.* Search surfaced a "full colour keyboard
map overlay" associated with **Jane's AH-64D Longbow (1995)**, but the period review fetched this
session does not mention it and retail listings are not a source. **Write "printed quick reference
cards."** (Exactly the plausible-but-invented-justification class that already caught this project
with the 1979 pinball NOVICE/EXPERT switch.)

**And the real ancestor is not a game at all.** Apollo astronauts operated the
[[apollo-guidance-computer-dsky]] — a **numeric keyboard** — by typing two-number **verb–noun**
commands. *Display velocity* was something you typed. The line runs **Apollo (1960s) → flight
simulators (1980s–90s) → this act**, and it is literal.

### References — §3
- [Microsoft Flight Simulator (v4.0) (1989) — Quick Reference Card — Internet Archive](https://archive.org/details/microsoft-flight-simulator-v-4.0-1989-quick-reference-card-en) — primary artifact: Microsoft, 1989, "Reference Card for MS Flight Simulator 4.0." **[fetched]**
- [Falcon 3.0 Quick Reference Card — Internet Archive](https://archive.org/details/falcon-3.0-quick-reference-card) — primary artifact; the ~80–90 commands and ~14 categories itemised above come from its scanned text. **[fetched]**
- [Keyboard Controls — *Microsoft Flight Simulator Handbook*, Jonathan M. Stern](https://www.flightsimbooks.com/flightsimhandbook/keyboardcontrols.php) — published reference book; 40+ commands grouped by aircraft system. **[fetched]**
- [Before Drones and DualShocks: The Forgotten Flight Sim Craze of the '80s — Old School Gamer Magazine](https://www.oldschoolgamermagazine.com/before-drones-and-dualshocks-the-forgotten-flight-sim-craze-of-the-80s/) — "you had to memorize what each key did." **[fetched]**
- [Keyboard, Display (DSKY), Apollo Guidance Computer — Smithsonian NASM, object nasm_A19760744000](https://airandspace.si.edu/collection-objects/keyboard-display-dsky-apollo-guidance-computer/nasm_A19760744000) — the museum's record: numerical keyboard, "verb–noun" numerical codes, two DSKYs in the CM and one in the LM, Raytheon design. *(**HTTP 403 to automated fetch** — the wording is the museum's indexed record text from live search; see §14)*
- [Microsoft Flight Simulator 2020 keyboard controls — GamesRadar+](https://www.gamesradar.com/microsoft-flight-simulator-2020-keyboard-controls/) — the modern default binding set. *(search result only — fetch returned truncated content)*

---

## 4. The cabinet-collision check

Checked against the full 25-level assignment table in `.claude/rules/levels.md`, plus the ~11
stations `racing-games-by-era.md` §15 claims for Act 7.

| Candidate | Status |
|---|---|
| [[flight-simulator-fs1]], [[microsoft-flight-simulator]], [[chuck-yeagers-advanced-flight-trainer]], [[flight-unlimited]], [[x-plane]], [[falcon-flight-sim]] | **Free.** No collision with any of the 25, nor with Act 7 |
| [[pilotwings]] **and** [[pilotwings-64]] | **Free of the 25** — but they are the **same franchise**. The cabinet rule permits "clearly distinct games in the same franchise" (Pac-Man / Ms. Pac-Man precedent), and Mode 7 SNES vs N64 3D is clearly distinct. **The only franchise doubling in this act — flag for Trevor** |
| Nintendo generally | Already heavy across the 25 — [[donkey-kong]] L6, [[super-mario-bros]] L9, [[legend-of-zelda]] L10, [[donkey-kong-country]] L14, [[pokemon-red-blue]] L15 — plus [[mario-kart]] in Act 7. Pilotwings is a **distinct franchise**, so no rule breach, but this act adds two more Nintendo cabinets |
| [[lunar-lander-1979]] | **Free**, and the best fit in the whole survey (§8). Atari — but a distinct game from [[breakout]] L1 and Missile Command L23 |
| [[kerbal-space-program]] | **Free** |
| [[battlezone]] | **Free**, but **recommended against** on register (tank / military trainer) — §6 |
| **Microsoft Combat Flight Simulator, Ace Combat** | Free; **recommended against** — §6 |
| **Out Run** | Still the Level 21 hard collision flagged by the sibling lane. Not relevant to this act, but restated so nobody re-proposes it |

Nothing in this act collides with an assigned cabinet.

---

## 5. The fact that makes this act belong to Keystroke Kingdom

**Microsoft Flight Simulator was the test for whether a computer was a real computer.**

> *"If a computer could run Microsoft Flight Simulator and Lotus 1-2-3, it was 100% IBM
> PC-compatible."*

In the early clone era, the industry used two unofficial yardsticks: **Lotus 1-2-3** for general
application compatibility and **Flight Simulator for graphics compatibility.** A *game* was how you
proved a machine was a machine. For a project whose whole thesis is *typing unlocks computing*,
that is a first-class history card, and it requires no invention at all.

Two more of the same species:
- It is **Microsoft's longest-running software product line, predating Windows by three years** —
  and the *software lineage* is older still, beginning with subLOGIC's FS1 in January 1980.
- Inducted into **The Strong's World Video Game Hall of Fame, 2021**, alongside Animal Crossing,
  StarCraft and Where in the World Is Carmen Sandiego?

### References — §5
- [Microsoft Flight Simulator (1982 video game) — Wikipedia](https://en.wikipedia.org/wiki/Microsoft_Flight_Simulator_(1982_video_game)) — the Lotus 1-2-3 / Flight Simulator compatibility test sentence, verbatim; the 2021 Hall of Fame induction. **[fetched]**
- [Lotus 1-2-3 — Wikipedia](https://en.wikipedia.org/wiki/Lotus_1-2-3) — the same two-application compatibility test from the spreadsheet's side, with Flight Simulator specifically testing **graphics** compatibility. *(search result only, not fetched)*
- [Microsoft Flight Simulator — Wikipedia](https://en.wikipedia.org/wiki/Microsoft_Flight_Simulator) — "Microsoft's longest-running software product line, predating Windows by three years"; seven Guinness records in the 2008 Gamer's Edition; 21 million units by June 1999. **[fetched]**
- [2021 World Video Game Hall of Fame Inductees Announced — The Strong National Museum of Play](https://www.museumofplay.org/press-release/2021-world-video-game-hall-of-fame-inductees-announced/) — institutional: "the most popular, longest lasting, and most influential flying sim of all time." **[fetched]**

---

## 6. ⚠️ Combat flight simulators — the straight answer

**Recommendation: no combat flight sim as a station, in any form — not Falcon, not Ace Combat, not
Microsoft Combat Flight Simulator, not Battlezone.** Document them; do not fly them.

**This is NOT a ratings argument, and I want that stated plainly because the ratings surprise
cuts the other way.** Unlike the sibling lane's GTA verdict — which rested on an ESRB M rating, an
unprecedented retroactive AO re-rating and an **FTC consent order** — the combat flight canon is
mostly *rated fine*:

| Title | ESRB |
|---|---|
| **Microsoft Combat Flight Simulator** | **E** — descriptor: *Animated Violence* |
| Microsoft Flight Simulator (2020) | **E** — no descriptors |
| Microsoft Flight Simulator 2024 | **E** |
| Pilotwings (SNES) | **E** — *Mild Violence* |
| Pilotwings 64 | **E** |
| Wave Race 64 | **E** — no descriptors |
| **Ace Combat 7: Skies Unknown** | **T** — *Language, Mild Blood, Violence* |

So the honest verdict is about **register**, not permission:

1. **The verb is wrong.** Keystroke Kingdom's whole design is that nothing is destroyed and nobody
   loses. Level 23 already sets the precedent: **Missile Command is rendered defensively — the
   cities can never be hit** (`.claude/rules/levels/act5.md`). A game that reframes *Missile
   Command* cannot then hand a child a missile.
2. **Mission failure is a punishment mechanic, structurally.** Falcon 3.0's campaign engine runs on
   *"limited supplies of pilots, aircraft and weapons"* — attrition is the design. That is the
   opposite end of the spectrum from "the letter waits."
3. **Even so, be honest in the doc:** the very first flight simulator shipped with combat.
   [[flight-simulator-fs1]] was marketed as *"A2-FS1 Flight Simulator with British Ace — 3D Aerial
   Battle,"* and [[microsoft-flight-simulator]] 1.0 carried a **"Europe 1917"** Sopwith Camel
   dogfight mode. The genre did not acquire combat later; it was born with it, and the act should
   simply use the other half rather than pretend the half doesn't exist.

**The alternatives are real, documented, and in several cases better games.** In recommendation
order:

1. **Aerobatics with a teacher** — [[flight-unlimited]] (1995) has **no combat by deliberate
   design**, and its structure is a **simulated instructor giving real-time guidance** through
   rudder turns up to Immelmann turns and tailslides. This is the act's pedagogical template.
2. **Gliders / soaring** — Flight Unlimited ships the **Grob G103 sailplane**; [[pilotwings]] has
   hang gliding. Unpowered flight is the most obviously non-violent thing an aircraft can do.
3. **Licence lessons** — [[pilotwings]] and [[pilotwings-64]] are literally curricula, and
   Pilotwings 64 scores **landing softness**, which is a metric that rewards gentleness.
4. **Test-piloting** — [[chuck-yeagers-advanced-flight-trainer]] (1987): 15 aircraft, formation and
   stunt flying, racing an AI, a real aviator's voice, zero combat.
5. **Civilian careers that HELP people** — **MSFS 2024's Career Mode**: **Medevac, Remote Cargo
   Ops, Aerial Firefighting, Search & Rescue**, up to Airline Transport Pilot, with ~54 training
   courses and a per-mission difficulty rating *"to prevent non-experienced pilots from ending up
   in complex scenarios."* Microsoft's own words. **This is the single best terminal station for a
   children's flight act that exists** — the missions are heroic, the register is *helping*, and
   the rating is E.
6. **Bush flying** — real in MSFS 2024 (it will not let you put a Cessna down in the wild; you need
   a bush plane), though this claim came from press coverage rather than a first-party doc.

### References — §6
- [Microsoft Combat Flight Simulator — ESRB](https://www.esrb.org/ratings/3528/microsoft-combat-flight-simulator/) — **E**, Animated Violence. **[fetched]**
- [Microsoft Flight Simulator — ESRB](https://www.esrb.org/ratings/36840/microsoft-flight-simulator/) — **E**, no descriptors. **[fetched]**
- [ACE COMBAT 7: SKIES UNKNOWN — ESRB](https://www.esrb.org/ratings/35821/ace-combattm-7-skies-unknown/) — **T**: Language, Mild Blood, Violence; the rating summary describing dogfights, missiles, machine guns, bombs and blood on a pilot's helmet. *(search result only, not fetched)*
- [PilotWings — ESRB](https://www.esrb.org/ratings/22037/pilotwings/) — **E**, Mild Violence. *(search result only, not fetched)*
- [Pilotwings 64 — ESRB](https://www.esrb.org/ratings/1866/pilotwings-64/) — **E**. *(search result only, not fetched)*
- [Wave Race 64 — ESRB](https://www.esrb.org/ratings/23138/wave-race-64/) — **E**, no descriptors. **[fetched]**
- [Microsoft Flight Simulator 2024 — ESRB](https://www.esrb.org/ratings/40136/microsoft-flight-simulator-2024/) — **E**. *(search result only, not fetched)*
- [Flight Unlimited — Wikipedia](https://en.wikipedia.org/wiki/Flight_Unlimited) — no combat as a deliberate choice; the simulated instructor and the lesson range; the Grob sailplane. **[fetched]**
- [Falcon 3.0 — Wikipedia](https://en.wikipedia.org/wiki/Falcon_3.0) — the campaign engine's finite, periodically replenished pilots/aircraft/weapons. **[fetched]**
- [Flight Simulator (1980 video game) — Wikipedia](https://en.wikipedia.org/wiki/Flight_Simulator_(1980_video_game)) — the "British Ace — 3D Aerial Battle" marketing. **[fetched]**
- [Microsoft Flight Simulator (1982 video game) — Wikipedia](https://en.wikipedia.org/wiki/Microsoft_Flight_Simulator_(1982_video_game)) — the "Europe 1917" Sopwith Camel dogfight mode. **[fetched]**
- [Microsoft Flight Simulator 2024: Creating a Career Mode for All Types of Players — Xbox Wire](https://news.xbox.com/en-us/2024/11/15/microsoft-flight-simulator-2024-creating-career-mode-for-all-players/) — first-party: the Medevac/Cargo/Aerial Firefighting/Search & Rescue/ATP activity list, ~54 training courses, and the per-mission difficulty rating protecting inexperienced pilots. **[fetched]**
- [As real as it gets: Pilots lend their expertise… — Microsoft Source](https://news.microsoft.com/source/features/work-life/as-real-as-it-gets-the-most-authentic-flight-sim-on-the-market/) — first-party feature on the real-aviation consultation behind the career activities. *(search result only, not fetched — URL surfaced in search; treat as unconfirmed)*

---

## 7. The Pilotwings/Gran Turismo problem — a curriculum with a grade

Both halves of this research programme keep hitting the same design object: a **real teaching
system inside a vehicle game, with a fail state bolted on.**

- [[gran-turismo]]'s licence tests (racing act, §7 of the sibling doc) grade **gold / silver /
  bronze / FAIL**, and FAIL withholds the car.
- [[pilotwings]] awards **pilot licences** through lessons, with score thresholds gating progress.
- [[pilotwings-64]] grades **bronze / silver / gold** on time, accuracy and **landing softness**.
- **MSFS 2024** runs **~54 training courses** with certification exams.

**The reframe is the same in every case and it is already project doctrine: take the curriculum,
delete the grade.** Every attempt is a pass at some tier; the only question is which flourish you
get. Pilotwings 64's **landing softness** metric is worth stealing outright — a score that rewards
*gentleness* is almost unheard-of, and it is exactly the right value for a game whose One Rule is
about never being harsh with a child.

---

## 8. The climb to orbit — where the act leaves the atmosphere

Trevor's altitude instinct gives the act its hinge, and there is a perfect cabinet sitting on it.

### [[lunar-lander-1979]] — Atari, **August 1979**, arcade
**The best-fitting single find in this entire research pass.** It is **1979** — the year Keystroke
Kingdom's arcade is set in. It is the **Moon**. It is **vector graphics**, a technique the game owns
nowhere. It is **not** an assigned cabinet. And its lineage is a computing-history story in
miniature:

1. **1969** — *Lunar Landing Game*: a **text** game in **FOCAL** on a **DEC PDP-8**, written by
   **Jim Storer** as a high-school student. **David H. Ahl** converted it to BASIC and printed
   three versions in *101 BASIC Computer Games* (1973).
2. **1973** — **DEC commissioned** *Moonlander* from **Jack Burness** to demo the **GT40 graphics
   terminal**.
3. **1979** — **Wendi Allen** (credited on release as Howard Delman) had seen Moonlander *while
   touring **NASA's Ames Research Center***; with **Rich Moore** she turned it into Atari's first
   vector cabinet, with a **big physical throttle lever** chosen for *"more physicality."*

**And its coin mechanic is startlingly One-Rule-compatible for 1979:** *inserting a coin bought
more fuel*, so play could continue indefinitely. That is structurally the game's existing **mercy
quarters**, in an actual 1979 cabinet.

### The upper stations
| # | Station | Date | Rendering | Note |
|---|---|---|---|---|
| 9 | [[lunar-lander-1979]] | **Aug 1979** | **Vector** wireframe, multi-perspective zoom | The hinge. 1979, the Moon, and a coin buys fuel |
| 10 | [[kerbal-space-program]] | **27 Apr 2015** | Modern 3D | **Real orbital mechanics** (Hohmann, bi-elliptic transfers), **ESRB E**, and failure is *comedy* — the friendliest fail model in this whole survey |
| 11 | **Real imagery** — the Apollo/ISS/rover era as the act's final "render" | 1969 → now | **Actual photographs of actual worlds** | The rendering ladder's honest terminus: the act stops simulating and shows the real thing |

**On station 11:** this is a design suggestion, not a game. The rendering arc runs wireframe →
polygons → textures → photogrammetry of Earth; the only place left to climb is **real imagery of
real places that are not Earth**. That is also where the history cards live (§9, §12).

*Other space-sim candidates checked and set aside:* **Orbiter** (Martin Schweiger) — free, highly
regarded, but **[unverified]** in this pass, no page written; **Elite** (1984) and the 1990s space-
combat canon (Wing Commander, X-Wing) — genuine landmarks but **combat**, ruled out by §6;
**Microsoft Space Simulator** (1994, also Artwick) — a tantalising continuity with §2's spine but
**[unverified]** here. All three are worth a follow-up pass; none should be written from memory.

### References — §8
- [Lunar Lander (1979 video game) — Wikipedia](https://en.wikipedia.org/wiki/Lunar_Lander_(1979_video_game)) — August 1979, Atari's first vector game and first multiple-perspective game; Wendi Allen (credited as Howard Delman) and Rich Moore; the throttle handle and "more physicality"; the Storer 1969 FOCAL/PDP-8 and Burness 1973 GT40 Moonlander lineage; the NASA Ames tour; coins buying fuel; 4,830 cabinets; the first 300 Asteroids cabinets shipping in Lunar Lander cases. **[fetched]**
- [Lunar Lander (video game genre) — Wikipedia](https://en.wikipedia.org/wiki/Lunar_Lander_(video_game_genre)) — the 1969 → 1973 → 1979 lineage and Ahl's *101 BASIC Computer Games*. *(search result only, not fetched)*
- [Forty Years of Lunar Lander — Technologizer (Harry McCracken)](https://technologizer.com/2009/07/19/lunar-lander/index.html) — technology-journalism retrospective corroborating the lineage. *(search result only, not fetched)*
- [Kerbal Space Program — Wikipedia](https://en.wikipedia.org/wiki/Kerbal_Space_Program) — Squad; out of beta 27 April 2015; realistic orbital physics with Hohmann and bi-elliptic transfers; the 2022 Boeing/ISS STEM acknowledgement. *(search result only, not fetched)*
- [Kerbal Space Program 2 — ESRB](https://www.esrb.org/ratings/39140/kerbal-space-program-2/) — institutional record for the series' E band. *(search result only, not fetched)*

---

## 9. The punishment ledger — flight and space

Matching `racing-games-by-era.md` §12's format. *"The game should only ever stop a player's flow
with joy, never with punishment."*

| Era / Title | What the real thing does to you | Why it violates the One Rule | Suggested reframe |
|---|---|---|---|
| [[flight-simulator-fs1]] (1980) | Crash; and a **WWI dogfight mode** in the box | Combat, and a hard crash-out | Fly the free-flight half. A crash is a **gentle reset to the runway**, never a loss |
| [[microsoft-flight-simulator]] 1.0 (1982) | Crash; **"Europe 1917"** Sopwith Camel dogfighting | As above | As above. Card the **compatibility test** (§5) instead of the dogfight |
| [[chuck-yeagers-advanced-flight-trainer]] (1987) | You crash and **Yeager says something dry** — *"You sure bought the farm on that one"* | Barely a violation at all | **Keep it almost as-is.** A warm voice acknowledging a mistake without consequence is *exactly* the game's nudge sound, in 1987 |
| [[falcon-flight-sim]] (1987/1991) | **Shot down**; **mission failure**; a campaign with **finite pilots, aircraft and weapons** (attrition) | Combat + permanent loss of resources | **Do not use.** §6 |
| [[pilotwings]] (1990) | Score thresholds gate the next lesson; failed lessons repeat; attack-helicopter bonus stages | A **failable gate** on a curriculum | Take the lessons; **every attempt passes at some tier**. Drop the helicopter |
| [[flight-unlimited]] (1995) | You can crash. No campaign, no lives, no mission to fail | Almost none | **This is the template.** Add the instructor; keep nothing else |
| [[pilotwings-64]] (1996) | **Bronze / silver / gold** licences; below-threshold runs do not certify | Graded gate again | **Steal the "landing softness" score** and delete the floor — gentleness as a reward, never a bar |
| [[x-plane]] (1995→) | Nothing structurally — a sandbox | None | Use it for the "is it real?" beat |
| [[lunar-lander-1979]] | Crash on a hard landing; **fuel runs out** | Resource starvation ends the run | **Fuel is bought with a coin in the real cabinet** — that is already mercy quarters. Better still: **typing produces fuel** |
| MSFS (2020) | Crash **cuts to black with a message explaining the cause** — no damage animation, no collision shown | *Arguably not a violation.* The most humane failure in this survey | **Adopt the pattern wholesale**: explain, don't punish, don't dramatise |
| MSFS 2024 Career | Certification **exams**; reputation; missions carry a difficulty rating | Exams are pass/fail | Keep the **difficulty rating protecting the inexperienced** — that is adaptive pacing. Delete the exam |
| [[kerbal-space-program]] (2015) | Rockets explode, constantly | The game **treats this as the point** | **Study this.** Failure rendered as comedy and data is the closest any commercial game gets to the One Rule |
| [[battlezone]] (1980) | Destroyed by enemy tanks | Combat; military-trainer heritage | **Do not use.** §6 |

**Three mechanics worth STEALING, matching the sibling lane's two:**
1. **Lunar Lander's coin-for-fuel** (1979) — a resource you top up rather than a life you lose.
2. **Pilotwings 64's landing-softness score** (1996) — a metric that rewards gentleness.
3. **MSFS 2020's crash handling** (2020) — *cut to black, explain what happened, offer to go again.*
   No spectacle of failure. This is, almost word for word, the game's wrong-keypress doctrine
   applied to an aircraft.

---

## 10. Curriculum alignment — checked against the standards, not assumed

Trevor: *"kids learn about moon, stars, sun and planets in 1st/2nd grade."* **Verified, and
specifically FIRST grade.** Full detail on [[ngss-space-standards]].

**NGSS 1-ESS1-1 (Grade 1), verbatim:** *"Use observations of the sun, moon, and stars to describe
patterns that can be predicted."* Clarification statement: *"Examples of patterns could include
that the sun and moon appear to rise in one part of the sky, move across the sky, and set; and
stars other than our sun are visible at night but not during the day."* Disciplinary core idea
**ESS1.A**: *"Patterns of the motion of the sun, moon, and stars in the sky can be observed,
described, and predicted."* Grade 1 also carries **1-ESS1-2** (seasonal sunrise/sunset patterns),
and NGSS groups both under the topic **"1. Space Systems: Patterns and Cycles."**

**But be precise about what that licenses, because the honest version is better for this game:**
- **Kindergarten NGSS has no space strand.** "From kindergarten" would be false.
- **Grade 1 is about observable PATTERNS, not astronomy.** Planets, the solar system, gravity and
  rockets are **not** grade-1 content — 1-ESS1-1 articulates forward to **5.ESS1.B**. So the true
  claim is: ***sun, moon and stars are first-grade words; planets, orbits and gravity are words a
  child grows into across elementary school.*** That is a perfect match for a game explicitly
  designed to **age with the player** (`product.md` §Word Length).
- NGSS is **voluntary and adopted state-by-state**. Don't say "what every US child learns."
- **[unverified]:** grade-2 space content specifically was not checked. Claim grade 1.

### References — §10
- [1-ESS1-1 Earth's Place in the Universe — NGSS](https://www.nextgenscience.org/pe/1-ess1-1-earths-place-universe) — the standards body's own page: grade 1, the exact PE / clarification / assessment-boundary wording, DCI ESS1.A, and the articulation to 5.ESS1.B. **[fetched]**
- [1. Space Systems: Patterns and Cycles — NGSS topic arrangement](https://www.nextgenscience.org/topic-arrangement/1space-systems-patterns-and-cycles) — the grade-1 topic grouping containing 1-ESS1-1 and 1-ESS1-2. *(search result only, not fetched)*
- [1-ESS1-1 (Science, CA NGSS) — California Department of Education](https://www2.cde.ca.gov/cacs/id/web/28982) — a state adoption record of the same standard. *(search result only, not fetched)*

---

## 11. ⚠️ Why this act belongs to the game's computing-history spine

Two Trevor hypotheses, tested. **One is substantially right in a narrower form than stated; one is
partly wrong in a way that makes the story better.**

### 11a. *"NASA was also where the idea of computer science as a career came from"*

**The overclaim — "NASA invented computer science" — is false and no source supports it.** Computer
science as a discipline predates Apollo, and this project's own card bank already carries
[[ada-lovelace]] (1840s), [[eniac]] (1940s) and [[grace-hopper]] (1950s).

**The defensible version is sharper and, honestly, more moving: the space program is where software
became a NAMED ENGINEERING PROFESSION.** The Computer History Museum, institutionally, states that
[[margaret-hamilton]] — Director of the **Software Engineering Division** at MIT's Instrumentation
Laboratory, leading the team that wrote Apollo's on-board flight software — ***"made up the term
'software engineering' to distinguish it from other kinds of engineering,"*** wanting to give the
work *"legitimacy"* comparable to the other engineering around her. MIT's own account phrases it
as *"credited with popularizing the concept of software engineering itself."* NASA's own page says
the concepts she and her team created *"became the building blocks for modern 'software
engineering'"* and that her *"asynchronous software, priority scheduling, end-to-end testing, and
man-in-the-loop decision capability… became the foundation for ultra-reliable software design."*

**Attribute with the right verb** (this project's standing failure mode — Hopper told the moth
story, she didn't tape the moth): **CHM says *coined*; MIT says *popularized*. Both institutions
agree she is the reason the phrase exists.** Safe card phrasing: *"she coined the term 'software
engineering' — and fought for it."*

And the second half of the story, which the game is *built* to tell: **before the machines took the
name, "computer" was a job title** — people, overwhelmingly women, who computed by hand at
NACA/NASA. [[katherine-johnson]] checked John Glenn's orbital numbers **because he asked her to**
(*"If she says they're good, then I'm ready to go"*); **Dorothy Vaughan** taught herself **FORTRAN**
and became an expert in it. See [[human-computers]].

**So: the space act does not sit beside the hacker/computing-history card layer. It is where that
layer's two oldest threads — who programmed, and what programming is called — get their answer.**

### 11b. *"in the 60–90s was where all true innovation was landing and not in the private sector"*

**The 1960s–90s framing holds. "Not in the private sector" does not, and the sources are
unambiguous about it.** Two of the era's crown jewels are corporate: **[[unix]] and C at Bell
Labs**, and **the GUI, Ethernet and the modern mouse at Xerox PARC** ([[xerox-alto-gui]],
[[engelbart-mouse]]). This game's own card bank already celebrates the Bell Labs one — *"Two
programmers at Bell Labs, Ken and Dennis…"*

**The honest axis is funding model, time horizon and motive — not ownership.** See
[[arpa-ipto-funding]]:
- **ARPA's IPTO, founded 1962** under **J.C.R. Licklider**, is estimated to have funded
  **~70% of all US computer-science research** during his tenure; its **$15 million 1965 budget**
  *"dwarfed other agencies such as ONR"*, and *"during the 1960s, ARPA and IPTO had more effect on
  the science and technology of computing than any other single government agency."*
- That money went **into universities and labs** — *"centers of scientific and engineering
  excellence (such as MIT, Carnegie Mellon University, and Stanford University)"* — not into a
  government computer works. NASA likewise contracted **MIT** for Apollo guidance in 1961.
- **The transfer mechanism was people, not patents:** researchers trained under ARPA funding
  *"moved into the workforce"*, carrying the approaches and tools with them.

**The honest phrasing, and the better story:** *for about thirty years, a lot of computing was paid
for to find something out or to go somewhere — not to sell something. The selling came after, built
by the people those programmes trained.* That survives scrutiny, it is true of Bell Labs and PARC
as much as of ARPA, and it carries **admiration rather than grievance** — which is the only
register a children's game should use about it.

**The child-facing one-sentence version** (material for a spec lane, not final copy):
> *People built computers so they could go to the Moon. Everything you're typing on came after
> that.*

**Consequence for the proposed MMORPG act** (`docs/ROADMAP.md` §2 — EverQuest/WoW era, where typing
IS the social layer): **recorded, not researched here.** Trevor positions that era as later and
derivative. Structurally that is a gift: the space/flight act becomes the game's *"where it came
from"* chapter and an MMO wing becomes its *"what it turned into"* chapter — **people used the
network the space-and-research era built to go and live in imaginary worlds together, and they got
there by typing.** Two acts, one arc. Do not write the MMO act from this file.

### References — §11
- [Margaret Hamilton — Computer History Museum](https://computerhistory.org/profile/margaret-hamilton/) — institutional: led the Apollo CM/LM flight-software team; Director of the Software Engineering Division at MIT Instrumentation Laboratory; **"made up the term 'software engineering' to distinguish it from other kinds of engineering"** for "legitimacy"; NASA Exceptional Space Act Award 2003; Presidential Medal of Freedom 2016. **[fetched]**
- [Margaret Hamilton — NASA Apollo Lunar Surface Journal (NASA-hosted)](https://nasa.gov/wp-content/uploads/static/history/alsj/a11/a11Hamilton.html) — NASA primary: "asynchronous software, priority scheduling, end-to-end testing, and man-in-the-loop decision capability… became the foundation for ultra-reliable software design"; "the building blocks for modern 'software engineering'"; the ~3-minutes-before-touchdown radar-priority override. **[fetched]**
- [Scene at MIT: Margaret Hamilton's Apollo code — MIT News](https://news.mit.edu/2016/scene-at-mit-margaret-hamilton-apollo-code-0817) — MIT primary: the 1961 NASA contract, the famous code-stack photograph and its original caption, "credited with popularizing the concept of software engineering itself," and her 2009 reflections. **[fetched]**
- [Katherine Johnson Biography — NASA Langley](https://www.nasa.gov/centers-and-facilities/langley/katherine-johnson-biography/) — NASA primary: the West Area Computing human-computer section; the Glenn "get the girl to run the same numbers… by hand" and "if she says they're good, then I'm ready to go" quotations; her Apollo LM/CSM synchronisation work; 26 reports; 2015 Presidential Medal of Freedom. **[fetched]**
- [The Organization of Federal Support: A Historical Review — *Funding a Revolution*, National Academies Press](https://www.nationalacademies.org/read/6323/chapter/6) — institutional: IPTO established 1962; Licklider from October 1962 and "man-computer symbiosis"; the $15M 1965 budget dwarfing ONR; "more effect on the science and technology of computing than any other single government agency"; concentration on MIT/CMU/Stanford; researchers moving into the workforce as the dissemination mechanism. **[fetched]**
- [*Funding a Revolution* ch. 11 — National Academies Press](https://www.nationalacademies.org/read/6323/chapter/11) — the ~70%-of-US-CS-research and eight-of-nine-time-sharing figures. *(search result only, not fetched)*
- [The Story of NASA's Real "Hidden Figures" — Scientific American](https://www.scientificamerican.com/article/the-story-of-nasas-real-ldquo-hidden-figures-rdquo/) — the West Computers becoming engineers, programmers and Langley's first Black managers. *(search result only, not fetched)*
- Existing, already citation-verified in-wiki: [[unix]], [[xerox-alto-gui]], [[engelbart-mouse]], [[arpanet-first-message-1969]], [[eniac]], [[ada-lovelace]], [[grace-hopper]].

---

## 12. The aviation & astronomy vocabulary layer

*Written in `automotive-vocabulary.md`'s exact format so the two merge cleanly. That file is the
car layer and belongs to another lane — **this is a separate, additive layer, not a rewrite.**
The bike/boat/rail words live in the companion file,
[vehicle-games-beyond-cars.md](vehicle-games-beyond-cars.md) §4, because they belong to Act 7.*

**Tiers** (identical to the car file, mapping onto `getWordLengthRange()` / MIN–MAX WORD LENGTH):
**EASY** 3–5 letters, decodable, concrete · **MEDIUM** 5–7 letters or one irregular element ·
**HARD** 8+, multi-syllable, usually Latinate. **Decodable?** **Y** / **partly** / **N**.

### 12a. ⚠️ Blocklist collisions — check this BEFORE designing around generation

Verified this session by reading `js/word-blocklist.json` (the exact-word floor) and
`main.go`'s `wordgenSubstringExtras` (the additive **substring** layer, which gates **only** the
`/api/wordgen` LLM path — **curated static banks are never filtered by it**).

**The finding is severe for an aviation act, and completely non-obvious:**

| Word | Blocked by substring | Consequence |
|---|---|---|
| **altitude** | `tit` (al-**tit**-ude) | **The single most on-theme word in the act cannot be LLM-generated.** Static bank only |
| **attitude** (attitude indicator — a primary flight instrument) | `tit` (a-**tti-t**… → `tit` at 3–5) | Same |
| **latitude** | `tit` | Same |
| **airspeed**, **groundspeed**, **windspeed** | `pee` (air-s-**pee**-d) | Same — and note the sibling lane already found plain **speed** blocked the same way |
| **cockpit** | `cock` | Same (already flagged in the car file) |
| **compass** | `ass` | Same |
| **mass** (weight & balance) | `ass` | Same |
| **warning**, **forward** | `war` | Same |
| **gravity assist** | `ass` (in *assist*) | Same |
| **dead reckoning**, **deadstick** | `dead` — **floor word**, exact-match AND substring | Avoid entirely; also wrong register |

**Recommendation, matching the sibling lane's: change nothing in the blocklist.** The over-blocking
is deliberate and the safety invariant is worth more than any word. Put `altitude`, `attitude`,
`airspeed` and `compass` in the **curated static bank**, which the substring layer never touches.
Whoever writes the act's spec must know this before designing around generation.

**Astronomy words checked and CLEAR of both layers:** sun, moon, star, orbit, rocket, launch,
planet, comet, crater, gravity, asteroid, astronaut, telescope, galaxy, eclipse, meteor, nebula,
solar, lunar, satellite, module, capsule, booster, thruster, countdown, liftoff, payload,
spacewalk, universe, apollo, gemini, voyager, hubble, mars, saturn, jupiter, venus, mercury,
neptune, pluto, earth, shuttle, rover, probe, station, docking, apogee, perigee, constellation.

**One tone flag, not a blocklist flag: `uranus`.** Nothing filters it and nothing is wrong with it,
but it is a famous playground joke and this is a game for six-year-olds with a parent in the room.
Flagged so it is a decision rather than an accident.

**Tone flags (no filter catches these — they are One Rule judgements):** `crash`, `stall`, `spin`,
`eject`, `bail`, `mayday`, `wreck`, `explode`, `abort`, `failure`, `disaster`. A flight act that
never crashes is the same choice as Missile Command's cities that can never be hit
(`.claude/rules/levels/act5.md` L23). Recommend they simply never enter the pool.

### 12b. Aviation — flight controls & parts

| Word | Len | Tier | Decodable? | Child-true definition |
|---|---|---|---|---|
| jet | 3 | EASY | Y | A plane pushed along by a blast of hot air out the back. |
| fin | 3 | EASY | Y | The upright blade on a plane's tail that keeps it pointing straight. |
| tip | 3 | EASY | Y | The very end of a wing. |
| wing | 4 | EASY | Y | The flat part that holds the plane up by cutting through the air. |
| tail | 4 | EASY | Y | The back end, with the small wings that steer. |
| nose | 4 | EASY | partly | The front of the plane. |
| prop | 4 | EASY | Y | Short for propeller — the spinning blades that pull a plane forward. |
| trim | 4 | MEDIUM | Y | A tiny adjustment that makes the plane fly straight without you holding it. |
| yaw | 3 | MEDIUM | partly | Swinging the nose left or right, like shaking your head *no*. |
| roll | 4 | EASY | Y | Tipping one wing up and one wing down. |
| gear | 4 | EASY | Y | The wheels. They fold up inside once you're flying. |
| flap | 4 | EASY | Y | A panel on the back of the wing you lower to fly slowly and land gently. |
| lift | 4 | EASY | Y | The upward push the wings make. It's what holds a plane up. |
| drag | 4 | EASY | Y | The air pushing back against you. Everything that moves has some. |
| hull | 4 | EASY | Y | The body of a flying boat, or a ship. |
| pitch | 5 | MEDIUM | partly | Pointing the nose up or down, like nodding *yes*. |
| cabin | 5 | MEDIUM | Y | The room inside where the people sit. |
| radar | 5 | MEDIUM | Y | Bouncing radio off things to find out where they are. |
| knots | 5 | MEDIUM | N (silent k) | How fast a plane or boat goes. One knot is one sea-mile every hour. |
| pilot | 5 | MEDIUM | partly | The person flying. |
| glide | 5 | MEDIUM | partly | To fly along without any engine, riding the air. |
| gauge | 5 | MEDIUM | N | A dial that shows you how much of something there is. |
| rudder | 6 | MEDIUM | Y | The flap on the tail fin that swings the nose left and right. |
| hangar | 6 | MEDIUM | partly | The big shed where planes sleep. *(Not "hanger" — that's for coats.)* |
| thrust | 6 | MEDIUM | Y | The forward push from the engine or propeller. |
| runway | 6 | MEDIUM | Y | The long strip of ground planes take off from and land on. |
| glider | 6 | MEDIUM | partly | A plane with no engine at all. It stays up by finding rising air. |
| cowling | 7 | HARD | Y | The smooth cover over the engine. |
| aileron | 7 | HARD | N (French) | The flap near each wingtip. One goes up, the other goes down, and the plane rolls. |
| taxiway | 7 | HARD | Y | The little road planes drive along on the ground. |
| horizon | 7 | HARD | partly | The line where the sky meets the ground. Pilots fly by it. |
| beacon | 6 | MEDIUM | partly | A light that flashes to say *here I am*. |
| airfoil | 7 | HARD | partly | The curved shape of a wing — the shape that makes lift. |
| propeller | 9 | HARD | partly | Spinning blades that screw the plane forward through the air. |
| altimeter | 9 | HARD | N | The dial that shows how high up you are. |
| autopilot | 9 | HARD | Y | A helper that holds the plane steady so the pilot can do other jobs. |
| fuselage | 8 | HARD | N (French) | The long tube of the plane that everything else attaches to. |
| checklist | 9 | HARD | Y | The list a pilot reads out loud before every flight, every single time. |
| elevator | 8 | HARD | partly | The flap on the tail that tips the nose up or down. *(Not the kind in a building — same word, different job.)* |
| sailplane | 9 | HARD | partly | A long-winged glider built to stay up for hours. |
| stabilizer | 10 | HARD | N | The small fixed wings on the tail that keep the plane steady. |
| turbulence | 10 | HARD | N | Bumpy air. It's normal, and planes are built for it. |
| aerodynamics | 12 | HARD | N | How air moves around a moving thing — and how a shape can use it. *(Shared with the car layer.)* |
| **altitude** | 8 | MEDIUM | partly | How high up you are. ⚠ substring-blocked — static bank only |
| **attitude** | 8 | HARD | partly | Which way the plane is pointed. ⚠ substring-blocked |
| **airspeed** | 8 | MEDIUM | Y | How fast the air is going past you. ⚠ substring-blocked |
| **compass** | 7 | MEDIUM | Y | The dial that always knows which way is north. ⚠ substring-blocked |
| **cockpit** | 7 | MEDIUM | Y | The little room at the front where the pilot sits. ⚠ substring-blocked |

**Tier counts (aviation):** EASY 14 · MEDIUM 17 · HARD 17 · **48 entries** (5 of them
substring-blocked from generation).

### 12c. Astronomy & spaceflight

*Citations for the four forces and the control axes are institutional — NASA Glenn and the
Smithsonian — and are listed under §12e. Ordinary-noun definitions (`moon`, `star`) are
deliberately uncited, matching the car file's convention: citing "the moon is the big round thing
in the night sky" would be citation theatre.*

| Word | Len | Tier | Decodable? | Child-true definition |
|---|---|---|---|---|
| sun | 3 | EASY | Y | Our own star. Every bit of daylight comes from it. |
| sky | 3 | EASY | partly | Everything above you. |
| moon | 4 | EASY | Y | The big round rock that goes around the Earth. People have walked on it. |
| star | 4 | EASY | Y | A sun, very far away. |
| mars | 4 | EASY | Y | The red planet. Robots are driving around on it right now. |
| dark | 4 | EASY | Y | Space has no air to catch the light, so it looks black even in daylight. |
| moons | 5 | EASY | Y | Other planets have them too. Jupiter has dozens. |
| orbit | 5 | EASY | Y | Going round and round something, forever, without falling down. |
| solar | 5 | MEDIUM | Y | To do with the sun. |
| lunar | 5 | MEDIUM | Y | To do with the moon. |
| comet | 5 | MEDIUM | Y | A ball of ice and dust that grows a long bright tail near the sun. |
| earth | 5 | MEDIUM | partly | Our planet. The only one anybody lives on. |
| space | 5 | MEDIUM | partly | Everything above the sky, where there's no air. |
| venus | 5 | MEDIUM | Y | The planet next door, and the brightest thing in the sky after the sun and moon. |
| orbit | 5 | EASY | Y | *(see above)* |
| rocket | 6 | MEDIUM | Y | An engine that pushes by throwing fire out the back — the only kind that works with no air. |
| planet | 6 | MEDIUM | Y | A big round world going around a star. |
| launch | 6 | MEDIUM | partly | The moment a rocket leaves the ground. |
| crater | 6 | MEDIUM | partly | A round dent made when something crashed into a moon or planet long ago. |
| meteor | 6 | MEDIUM | partly | A bit of space rock burning up as it falls. People call them shooting stars. |
| saturn | 6 | MEDIUM | Y | The planet with the rings. |
| nebula | 6 | HARD | partly | A huge cloud of gas and dust in space. New stars are born inside them. |
| gravity | 7 | MEDIUM | partly | The pull that holds you on the ground and holds the moon near the Earth. |
| capsule | 7 | MEDIUM | partly | The small room astronauts ride in. |
| jupiter | 7 | HARD | partly | The biggest planet. You could fit every other planet inside it. |
| shuttle | 7 | MEDIUM | Y | A spacecraft built to fly up and come back and go again. |
| eclipse | 7 | HARD | partly | When one thing slides in front of another and hides it — like the moon in front of the sun. |
| liftoff | 7 | MEDIUM | Y | The instant the rocket lets go of the ground. |
| booster | 7 | MEDIUM | Y | The big extra rocket that gets you started, then drops away. |
| galaxy | 6 | MEDIUM | partly | A gigantic family of stars. Ours is called the Milky Way. |
| asteroid | 8 | HARD | partly | A rock in space that's too small to be a planet. |
| spacesuit | 9 | HARD | Y | A whole tiny spaceship shaped like clothes. |
| telescope | 9 | HARD | partly | A tube that gathers faint light so you can see things too far away for your eyes. |
| astronaut | 9 | HARD | partly | A person who goes to space. The word means "star sailor." |
| countdown | 9 | HARD | Y | Counting backwards to zero, so everybody does their job at the same second. |
| spacewalk | 9 | HARD | Y | Going outside the spacecraft, with a rope so you don't drift away. |
| satellite | 9 | HARD | N | Anything going round a planet. The moon is one. So are the machines we put up there. |
| weightless | 10 | HARD | partly | Floating — not because gravity stopped, but because you're falling around the Earth. |
| constellation | 13 | HARD | N | A picture people made up by joining stars with imaginary lines. |

**Tier counts (astronomy/spaceflight):** EASY 8 · MEDIUM 17 · HARD 13 · **38 entries**
(`orbit` listed twice for grouping; count it once). **Zero blocklist collisions.**

**Why this layer is unusually good for this game:** `sun`, `sky`, `moon`, `star`, `mars` are
**3–4 letters, fully decodable, and first-grade curriculum** (§10) — genuinely the easiest useful
words in any Act 7/flight vocabulary set — while `constellation` (13) and `weightless` (10) sit at
the top of the MAX-WORD-LENGTH lever. **One theme spans the entire difficulty range**, which is
exactly the "ages with the player" property `product.md` asks for.

### 12d. Combined totals

| Layer | EASY | MEDIUM | HARD | Total |
|---|---|---|---|---|
| Aviation (§12b) | 14 | 17 | 17 | 48 |
| Astronomy/spaceflight (§12c) | 8 | 17 | 13 | 38 |
| **This file** | **22** | **34** | **30** | **86** |
| *(Bikes/boats/rail — Act 7's file, §4 there)* | *9* | *14* | *9* | *32* |

### 12e. References — §12
1. [Rotation — Control Axes — NASA Glenn Research Center, Beginner's Guide to Aeronautics](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/rotation-control-axes/) — institutional/primary: the yaw axis "perpendicular to the plane of the wings… a movement of the nose from side to side"; the pitch axis "an up or down movement of the nose"; the roll axis "an up and down movement of the wing tips"; ailerons/spoilers producing roll, the elevator pitch, the rudder yaw. **[fetched]**
2. [Airplane Parts and Function — NASA Glenn Research Center, Beginner's Guide to Aeronautics](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/airplane-parts-function/) — institutional: the elevator as the hinged part of the horizontal stabilizer, ailerons as hinged outboard wing sections working in opposition. *(search result only, not fetched)*
3. [How Things Fly — Smithsonian National Air and Space Museum](https://howthingsfly.si.edu/) — institutional: the four forces of flight named as **Lift, Weight, Thrust, Drag**; "Thrust is the force that propels a flying machine in the direction of motion"; "Weight is the force of gravity… toward the center of the Earth." **[fetched]** *(homepage confirmed; the per-force definition pages were not individually fetched)*
4. [Smithsonian's National Air and Space Museum Launches "How Things Fly" Online Exhibition — Smithsonian Institution](https://www.si.edu/newsdesk/releases/smithsonian-s-national-air-and-space-museum-launches-how-things-fly-online-exhibition) — institutional press release corroborating the exhibition's four-forces framing and its stated purpose of explaining flight to a general/young audience. *(search result only, not fetched)*
5. `js/word-blocklist.json` and `main.go` `wordgenSubstringExtras` / `isBlocked` — **read directly this session** for §12a. Not a URL; the collisions above were computed against the actual lists, not assumed.
6. The FAA's *Pilot's Handbook of Aeronautical Knowledge* would be the ideal primary source for the control surfaces and was **dropped** — both the landing page and the PDF returned **HTTP 403**. NASA Glenn (refs 1–2) replaces it. See §14.

---

## 13. History-card candidates

Card rules (`js/history-cards.js`, `CLAUDE.md`): a card's **moment word** must be typeable with
exactly the keys unlocked at its level, and `level` is the **EARLIEST** level where that becomes
true. Levels below were computed against the unlock table in `.claude/rules/levels.md`. Draft copy
is ≤160 characters in the existing warm kid tone. **Flagged, not written — `js/` is outside this
lane.**

**Register rule for every card in this act: WONDER, NOT TRAGEDY.** Real spaceflight history
contains genuine disasters. They are **not** history-card material for this game. Stated here
explicitly so nobody proposes one later.

| Word | Earliest level | The moment | Wiki page |
|---|---|---|---|
| `eagle` | **6** (e,a,g,l) | *"The Eagle has landed"* — July 20, 1969 | [[apollo-11-moon-landing-1969]] |
| `star` | **8** (s,t,a,r) | Stars other than our sun are only visible at night — the first thing a scientist ever notices | [[ngss-space-standards]] |
| `dsky` | **8** (d,s,k,y) | Apollo's keyboard: astronauts typed to fly | [[apollo-guidance-computer-dsky]] |
| `sky` | **8** | The first flight simulator's whole world was 36 squares | [[flight-simulator-fs1]] |
| `apollo` | **10** (a,p,o,l) | The program, and the guidance computer at the heart of it | [[apollo-guidance-computer-dsky]] |
| `gravity` | **11** (v) | Why the moon keeps going around and never falls | — |
| `moon` / `sun` / `orbit` | **12** (n) | The first-grade sky, and why it makes patterns | [[ngss-space-standards]] |
| `hamilton` | **12** (n is the bottleneck) | Margaret Hamilton named the job of writing software | [[margaret-hamilton]] |
| `rocket` | **13** (c) | [[lunar-lander-1979]] — a coin bought you more fuel | [[lunar-lander-1979]] |

**Proposed card copy (draft — do not paste without Trevor's read; character counts in brackets):**

- `eagle` — "On July 20, 1969, two people landed on the Moon and said four words: 'The Eagle has
  landed.' Everyone on Earth was listening." *(131)*
- `dsky` — "Astronauts flew to the Moon by TYPING. Their computer had a little keyboard, and they
  typed numbers into it to tell the spaceship what to do." *(139)*
- `hamilton` — "Margaret Hamilton wrote the code that landed on the Moon — and invented the words
  for her own job: software engineer." *(120)*
- `rocket` — "In 1979 an arcade game let you land on the Moon. Run out of fuel? Put in another
  coin and you got more. Nobody ever had to stop." *(135)*
- `sky` — "The very first flight simulator, in 1980, had a whole world made of 36 squares. Today's
  one draws the entire planet." *(120)*
- `star` — "Your sun is a star. It only looks bigger than the others because it's the one standing
  closest to you." *(106)*
- `gravity` — "The Moon is falling toward the Earth all the time. It also keeps missing. That's
  what going around something means." *(122)*

**Also strong, needing its own level computation by the card lane:** the **compatibility test**
(§5) — *"For years, there was one way to tell if a computer was really a computer: could it run
Flight Simulator?"* The obvious moment words (`flight`, `lotus`) need checking against the unlock
table.

**Already-carded seam to extend, not duplicate:** the bank's existing **Unix** card (Level 14)
reads *"Two programmers at Bell Labs, Ken and Dennis, built a whole new kind of computer system
the same summer astronauts walked on the moon."* The space cards should **pay that line off**, not
repeat it.

### References — §13
All card facts are cited on their linked wiki pages. The load-bearing primaries:
[July 20, 1969: One Giant Leap For Mankind — NASA](https://www.nasa.gov/history/july-20-1969-one-giant-leap-for-mankind/) **[fetched]**;
[Margaret Hamilton — Computer History Museum](https://computerhistory.org/profile/margaret-hamilton/) **[fetched]**;
[Lunar Lander (1979) — Wikipedia](https://en.wikipedia.org/wiki/Lunar_Lander_(1979_video_game)) **[fetched]**;
[1-ESS1-1 — NGSS](https://www.nextgenscience.org/pe/1-ess1-1-earths-place-universe) **[fetched]**.

---

## 14. Corrections from this research pass (2026-09-12)

1. **"FS1 was released in 1979."** Artwick *wrote* it in 1979; the **Apple II release was January
   1980**, TRS-80 later in 1980. Created-vs-shipped — the same class as Atari's Adventure egg
   (hidden 1979, shipped March 1980).
2. **"Microsoft Flight Simulator started in 1982."** *Microsoft's* involvement did. The software
   line starts with subLOGIC's FS1 in 1980. The precise, sourced claim is **"Microsoft's
   longest-running software product line, predating Windows by three years."**
3. **The Strong's own 2021 press release contradicts itself** — body text says the game launched
   **1982**; the quotation from assistant VP Jeremy Saucier says it *"debuted in 1983."* **Use
   1982.** (An institutional source disagreeing with itself, caught only by fetching it.)
4. **"Flight sims shipped plastic keyboard OVERLAYS."** **Not verified.** What is verified is
   printed **quick reference cards** (two surviving scanned artifacts). Do not upgrade the claim.
5. **Lunar Lander's developer.** Wikipedia credits **Wendi Allen (credited as Howard Delman)** —
   the developer transitioned. Cite her name; note the original screen credit rather than silently
   using only the 1979 one.
6. **Battlezone's release date is unsettled.** A widely circulated figure is **June 1, 1980**;
   Wikipedia says **November 1980**. KLOV could arbitrate but returned HTTP 403. Say "1980."
7. **Densha de Go! is 1997, not 1996.** It was *demonstrated* at the 1996 Amusement Machine Show;
   the arcade cabinet **shipped March 1997**. Created-vs-shipped again.
8. **Paperboy's title screen says 1984; the cabinet shipped April 1985.** Both dates are "right."
9. **Chuck Yeager's game has two correct titles.** It shipped as *Advanced Flight **Simulator***,
   was pulled, and was renamed *Advanced Flight **Trainer*** after a **Microsoft trademark
   dispute over "Flight Simulator."**
10. **"Combat flight sims are disqualified by their ratings."** **False, and worth knowing.**
    **Microsoft Combat Flight Simulator is ESRB E** (Animated Violence). The case against combat
    here is **register**, not rating — argue it honestly (§6).
11. **"NASA invented computer science"** (implied by the brief). Not supportable. The defensible
    claim is that the space program is where **software became a named engineering profession** —
    [[margaret-hamilton]] and the term "software engineering" (§11a).
12. **"All true innovation in the 60s–90s was NOT in the private sector"** (the brief's framing).
    **Refuted by the sources:** Bell Labs ([[unix]]) and Xerox PARC ([[xerox-alto-gui]]) are
    private-sector labs squarely in that window, and this game's own card bank already celebrates
    the first. The surviving, sharper thesis is about **funding model, motive and time horizon**
    (§11b).
13. **X-Plane's FAA status needs its qualifiers.** It is the **professional version of X-Plane 12**,
    and logging training hours requires the **computer and all associated hardware to be tested
    and FAA-certified**. "X-Plane is FAA-approved" is an overclaim.
14. **Apollo 11's first-step DATE depends on the clock you use.** **July 20, 1969** (10:56 p.m.
    EDT) and **July 21, 1969** (02:56:15 UTC) are both correct. Say which one you mean.
15. **Do not quote Apollo alarm codes or fuel-remaining figures on a card.** NASA's own page
    describes the alarms without codes; the secondary web gives 25s / 30s / 45s of remaining fuel
    across three sites that all read like machine-generated content. Sourceable version: *"the
    computer was overloaded, and the software was written to keep the important jobs running."*

---

## 15. Unsourceable / weakly-sourced items

- **Keyboard overlays (as distinct from reference cards).** §3. `[unverified]`.
- **"MSFS 2020 has 303 default keyboard shortcuts."** Community shortcut databases only; no
  Microsoft document found. Say "several hundred." `[unverified]`.
- **Seamus Blackley's later Xbox association.** Almost certainly true, **not verified in this
  pass**. Do not assert it in game text without its own sourcing.
- **NASA endorsement of Kerbal Space Program.** Searches surfaced a 2022 **Boeing**/ISS STEM
  acknowledgement, **not** a NASA endorsement. Do not claim NASA endorses it. `[unverified]`.
- **[[kerbal-space-program]] and [[paperboy]] have no fetched URL** — both pages say so on their
  face. Consistent across independent results; re-verify before child-facing use.
- **Orbiter, Elite (1984), Microsoft Space Simulator (1994).** Named in §8 as candidates only;
  **not researched**. No page written, nothing asserted. A follow-up pass should cover them —
  Microsoft Space Simulator especially, since it would extend §2's spine into §8's arc under one
  author.
- **Grade-2 NGSS space content.** Not checked. Claim grade 1 (§10). `[unverified]`.
- **Dorothy Vaughan's FORTRAN expertise** rests on museum/journalism sources here, not a fetched
  NASA primary page. Directionally solid; don't card the specifics.
- **MSFS 2024 bush-flying constraint** ("a Cessna can't land in the wild; you need a bush plane")
  comes from press coverage, not a first-party document. `[unverified]`.

### URLs dropped as unusable in this pass (HTTP 403 — never cited as read)

| URL | What it would have supported | Replacement |
|---|---|---|
| `faa.gov/regulations_policies/handbooks_manuals/aviation/phak` | FAA *Pilot's Handbook of Aeronautical Knowledge* — control surfaces, axes, flaps, trim, angle of attack | **NASA Glenn's Beginner's Guide to Aeronautics** (fetched cleanly) |
| `faa.gov/sites/faa.gov/files/pilots/pilot_handbook.pdf` | as above (the PDF itself) | as above |
| `airandspace.si.edu/collection-objects/…/nasm_A19760744000` | The DSKY object record | Its indexed record text from live search — **labelled as unfetched** on [[apollo-guidance-computer-dsky]] |
| `si.edu/object/keyboard-display-dsky-…` | The same record via the si.edu mirror | as above |
| `arcade-museum.com/Videogame/battlezone` | KLOV arbitration of Battlezone's release date | None found; date left as "1980" (§14 item 6) |

Also **fetched but dropped as non-supporting**: `combatsim.com`'s Jane's Longbow review — read
cleanly, but did **not** contain the keyboard-overlay claim it was sought for, so it is not cited.
And **four content-farm sites** surfaced for the Apollo 1202-alarm story (siliconcanals,
terradaily, scienceblog, spacedaily) were **discarded entirely** — mutually contradictory, and
they read as machine-generated. NASA's own page was used instead.

---

## 16. Downstream flags (this lane may not edit these files)

1. **`js/history-cards.js`** — **no existing card text is wrong.** This is an **addition**
   proposal: nine candidate cards with draft copy in §13. Each is citation-verified on its wiki
   page. **The existing Unix card (L14) is the seam** — *"…the same summer astronauts walked on the
   moon"* — and the new cards should pay it off rather than repeat it. Nothing written to `js/`.
2. **`main.go` — `wordgenSubstringExtras`.** An aviation act **cannot generate `altitude`,
   `attitude`, `airspeed` or `compass`** (§12a). **Recommendation: change nothing** — put them in
   the curated static bank, which the substring layer never touches. The spec lane must know this
   before designing around generation.
3. **`.claude/rules/levels.md` / a future act file** — **no assigned cabinet's facts were
   contradicted** by this pass, and **no collision** was found (§4). The one judgement call for
   Trevor is [[pilotwings]] + [[pilotwings-64]] as two cabinets in one franchise.
4. **`docs/ROADMAP.md` §2 (the proposed MMORPG act)** — **framing consequence only, recorded not
   researched** (§11b): a flight/space act becomes the game's *"where computing came from"*
   chapter, which makes an MMO wing its *"what it turned into"* chapter. A nice structural
   relationship between two proposed acts, captured while fresh.
5. **`research/racing-games-by-era.md` and `research/automotive-vocabulary.md`** — **not edited**
   (another lane owns them). This file links to them; §12 is written in the vocabulary file's exact
   format so the layers merge without a rewrite.
6. **`research/index.md`** — **not hand-edited**, and **could not be regenerated**: `Bash` was
   disabled for this session, so `node scripts/wiki-search.mjs --index` and `--lint` **did not
   run.** See the report.

---

*Related: [[keyboard-as-cockpit]] · [[flight-sim-rendering-eras]] · [[apollo-guidance-computer-dsky]] ·
[[margaret-hamilton]] · [[katherine-johnson]] · [[human-computers]] · [[ngss-space-standards]] ·
[[arpa-ipto-funding]] · [racing-games-by-era.md](racing-games-by-era.md) ·
[vehicle-games-beyond-cars.md](vehicle-games-beyond-cars.md) ·
[automotive-vocabulary.md](automotive-vocabulary.md) · [hacker-culture.md](hacker-culture.md).*
