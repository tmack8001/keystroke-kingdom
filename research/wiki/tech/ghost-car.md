---
title: Ghost Car
type: concept
tags: [video-game-history, technique, racing, act7, time-trial, speedway]
sources: 15
verified: 2026-09-13
---

A **ghost car** is a recording of a driving run played back as a second car you race beside.
The mechanic is older than the word: **Atari Games' Hard Drivin' (arcade, 1989)** already
"remembers the path of the car driven by the best driver on record" and stores that race in
battery-backed RAM inside the cabinet — but Atari called it the **"challenge lap," or
internally the "grudge match,"** and pitched it as a head-to-head against the *previous
winner*. The version the world actually remembers — the word **"Ghost,"** a recording of
**your own** best run, rendered **semi-transparent** and **passing straight through you** — is
Nintendo's, and it arrives in **Mario Kart 64 (1996)**, not in Super Mario Kart (1992).

## In this game

Act 7 **THE SPEEDWAY** (`docs/features/speedway.md`; the research arc doc is
`research/racing-games-by-era.md`) races the player against a ghost of their own previous lap.
The act's thesis is *"did you beat YOU?"* — never *"did you beat them?"* — and it carries no
placement, position or finish order anywhere (INV-82). This page exists because Trevor
attributed the ghost car to Mario Kart (2026-09-13) and proposed making Act 7's ghost
**opaque** rather than translucent, and neither half of that should be built from memory.

The short answers the build lane wants:

- **The Mario Kart attribution is right about the franchise and wrong about the title.**
  Super Mario Kart (1992) has a Time Trial, but its "opponent" is the clock, and the second
  kart you can summon there is a *computer-controlled* racer, not a recording. The ghost is a
  **Mario Kart 64 (1996)** feature.
- **Every documented ghost whose appearance we could source is see-through.** Nintendo's own
  N64 manual says *"a half visible character,"* the Super Mario Wiki says *"semi-transparent
  characters,"* and Wikipedia describes F-Zero X's as *"transparent re-enactments."* The
  history does **not** support opaque as a period convention — see the opaque verdict below,
  which is nonetheless *not* a "don't do it."
- **The load-bearing convention is not transparency — it is that the ghost cannot touch you.**
  Nintendo's ghosts *"cannot be touched and pass through karts, bikes, and obstacles."* That
  property costs nothing at any render tier, including [[monaco-gp]]'s alpha-less `ttl`.
- **The origin's framing is the one thing Act 7 must not borrow.** Hard Drivin's ghost is
  another person's record, announced as a challenge and called a grudge match. That is a
  rival. Act 7's ghost is you-from-last-time.

Related: [[excitebike]] (the only station in the act whose real 1984 celebration already
rewarded beating your own time) · [[mario-kart]] · [[f-zero]] · [[gran-turismo]] ·
[[pole-position]] · [[monaco-gp]] · [[sim-racing]]

## The facts

### 1989 — the origin, and it was not called a ghost

**Hard Drivin'**, Atari Games, arcade, **1989** — the game Wikipedia credits with *"one of the
first 3D polygon driving environments via a simulator cabinet."* Atari's **own operator's
manual** describes the feature in plain language:

> *"Skilled drivers will find the ultimate competition in the 'challenge' lap (or 'grudge
> match' as we at Atari Games like to call it). **The game remembers the path of the car
> driven by the best driver on record.** When a driver beats the qualifying lap time, he
> challenges the car of the past winner in a head-to-head race."*

That is a ghost car, described three years before Super Mario Kart and seven before Mario Kart
64. It is corroborated at the **hardware** level by the sequel's manual, which documents
*"extra non-volatile RAM for remembering the Championship Lap"* and a diagnostic for *"the
additional non-volatile RAM used for storing the race of the Challenge Lap champion."* The
recorded run was a physical thing living in battery-backed memory in the cabinet, and the
operator statistics page even counts it: *"Champ Laps is the number of times drivers qualify
to race a championship lap. Wins is the number of times drivers win championship laps."*

Precision notes:
- **Atari never uses the word "ghost" anywhere in either manual.** Searched; absent.
- The car's on-screen name, **"Phantom Photon,"** comes from Wikipedia, which describes it as
  *"the computer-controlled Phantom Photon car"* that you race *"if the player scores in the
  top 10 during certain modes."* The manual instead gates it on **beating the qualifying lap
  time**. The two accounts differ; treat "top 10" and "beat the qualifying time" as
  **[unverified]** against each other and don't state either as the rule.
- Wikipedia calling it *"computer-controlled"* sits in tension with Atari's *"remembers the
  path"* — a replayed path is not an AI driver. **Atari's own manual is the better source**,
  and it is unambiguous that a recording is stored and raced.
- **Created vs shipped:** the Internet Archive's scan of the operator's manual is catalogued
  **1988 — Atari**, while the game is a **1989** release. Manual first, cabinet after. Say
  "1989" for the game.
- **Whose run is it?** *"The best driver on record"* — the machine's champion, who is usually
  **somebody else**. This is a high-score ghost, not a personal-best ghost.
- **We could not source what it looked like.** No fetched source describes the challenge car's
  colour, solidity, transparency or collision behaviour. Several likely sources were
  unreachable this session (see Unsourceable, below). **[unverified]** — do not let anyone
  write "Hard Drivin's ghost was opaque" on the strength of it being 1989.

### 1992 — what Super Mario Kart actually had

**Super Mario Kart** (SNES, August 27 1992) has a Time Trial, and Wikipedia describes it
exactly: *"In time trial mode, players race against the clock through the same tracks that are
present in Mario Kart GP mode, attempting to set the fastest time possible."* **The word
"ghost" does not appear in the article at all.** The Super Mario Wiki's own description is
five laps, 100cc, no items and no coins — and the second kart that trips people's memory is
this: *"By pressing B Button on the second controller, a computer-controlled opponent can be
chosen to race against."*

A second kart on the track in Time Trial, summoned by a secret button press — it is easy to
see how that becomes "Super Mario Kart had ghosts" in memory. **It is a CPU racer, not a
recording.** Three sources (Wikipedia's article, the Super Mario Wiki's article, and the
Super Mario Wiki's Time Trial page) agree, and none of them attaches a ghost to the 1992 game.

### 1996 — Mario Kart 64, and the ghost as everyone pictures it

The Super Mario Wiki's Time Trial page records ghost data as a **new addition in Mario Kart
64** (Japan December 14 1996; North America February 10 1997). **Nintendo's own instruction
booklet** is the best source on the wiki for what a ghost *is* and what it *looks like*:

> *"Your Ghost is 'A recording of the course's best time'"* … *"a **half visible character**
> will drive exactly in the same manner as the stored data."*

Everything else in the booklet is the plumbing, and it is charmingly concrete:
- You save one by finishing without pausing, then choosing **"SAVE GHOST"** on the results
  screen. The Super Mario Wiki adds the full disqualifying list: **no pausing, crashing,
  driving in reverse, or falling off the road.**
- *"If you reach the finish line before the ghost, the newer data will be saved for the
  ghost"* — **the ghost overwrites itself with your better run.** The ghost *is* your last
  best, always.
- *"Two Ghosts from the same course cannot be saved."* One per course.
- It needs **121 pages** of a Controller Pak (the earliest release needed **123 pages / 7.87
  KB — the entire pak**). A ghost cost you your whole memory card. It loads automatically when
  you pick that course, and can be erased with **"ERASE GHOST FROM THIS COURSE."**
- Mario Kart 64 also shipped **three built-in staff ghosts**, on the raceway courses:
  **Luigi 1:48.37 on Luigi Raceway, Mario 1:27.16 on Mario Raceway, Peach 2:38.55 on Royal
  Raceway.** *(Wikipedia instead credits **Mario Kart: Double Dash!! (2003)** with
  introducing "Staff Ghosts" as a named, every-course feature — both can be true; the sources
  disagree on **first**, so say "Double Dash gave every course one.")*

The Super Mario Wiki's dedicated Ghost page supplies the two properties the build lane needs
most, and they are franchise-wide: ghost drivers are **"semi-transparent characters,"** and
**"these drivers cannot be touched and pass through karts, bikes, and obstacles."** The ghost
drives **your character** ("a ghost of their character-of-choice"), not a special ghost model,
and it carries no on-screen label in any source found — the Time Trial context *is* the label.

### 1998 — F-Zero X confirms the convention

[[f-zero]]'s 1990 original had no ghost (Practice was a lap timer). Its N64 sequel, **F-Zero X
(1998)**, is described by Wikipedia as offering *"**transparent re-enactments** of Time Attack
performances, allow racing against ghost racers, recorded by the player or game developer"* —
up to three player ghosts at once, one recording saved per track. Same decade, same platform,
same rendering choice: **see-through**, and developer-recorded ghosts as a benchmark.

### The word "ghost"

Earliest **primary** use located this pass is Nintendo's Mario Kart 64 booklet (1996/97),
where **"Ghost"** is already a capitalised proper noun for a menu item — i.e. by 1996 the term
needed no explanation. Atari in 1989 had no word for it beyond "challenge lap." Wikipedia's
generic description lives in the **Time trial** article — *"Racing games often feature 'ghost
cars' which are saved when the player sets a record time. In subsequent races, the ghost car
follows the path the player took when setting that record"* — and is worth knowing about
because **that passage is tagged `[citation needed]` on Wikipedia itself.** It is a fine
definition and a bad citation; do not lean on it.

A full-text search of Wikipedia for *"ghost car"* returns its earliest game clusters in
**1996–1997** (Mario Kart 64, MRC: Multi-Racing Championship, Top Gear Rally) and nothing
earlier, which is consistent with the term being a mid-90s console-era coinage. Motorsport
**broadcast** "ghost car" graphics (NASCAR qualifying overlays) appear in the same search only
from **2019** — the games had the word first. Wikipedia has **no article** on the mechanic at
all; the only encyclopedic entry is a line in the *Glossary of video game terms*, whose sole
citation is a Red Bull feature titled *"From Arcade To The iPhone 5 — The History Of The
Gaming Ghost Car"* that is **now a dead link** (see Unsourceable).

### What it looked like — the evidence, in one table

| Game | Year | Look | Collides? | Whose run? | Confidence |
|---|---|---|---|---|---|
| Hard Drivin' ("challenge lap" / "Phantom Photon") | 1989 | **no source found** | **no source found** | the machine's **best driver on record** | appearance **[unverified]**; the recording itself is primary-sourced |
| Super Mario Kart Time Trial | 1992 | *no ghost exists*; the optional second kart is a CPU racer | yes (a real kart) | nobody's — it's an AI | good (3 sources) |
| Mario Kart 64 | 1996 | **"a half visible character"** — your own character model | **no** (franchise-wide: passes through karts and obstacles) | **yours**, auto-overwritten by any better run | **primary** (Nintendo's manual) |
| F-Zero X | 1998 | **"transparent re-enactments"** | not stated | yours, or the developers' | good (Wikipedia) |
| Mario Kart (franchise, modern) | 2003– | "semi-transparent," staff ghosts on every course from Double Dash, ghosts shared online | no | yours / staff / other players' | good |

**Nobody in the sourced record labels the ghost on screen.** It is identified by being
see-through, by being intangible, and by the mode you are in.

### Other racers, only as far as the sources go

- **[[pole-position]] (1982)** — the qualifying lap is a pure time trial (beat a time before
  you may race), but the opposition is the clock and the traffic. **No ghost.** The
  pre-1989 convention is *a number to beat*, never *a car to watch*.
- **Winning Run** (Namco, 1988), the other pre-1989 3D candidate: its Wikipedia article
  describes a qualifying lap and twelve opponents, and **says nothing about ghosts, replays
  or time trials.** No evidence it predates Hard Drivin'.
- **[[excitebike]] (1984)** — no ghost, but the *idea* is there in 1984: the time to beat is
  painted on the stadium wall and the celebration is the printed line **"It's a new record!"**
  A record line is a ghost with no car attached.
- **[[gran-turismo]] (1997)** — **no ghost documented** in the fetched article, which praises
  its *replay mode* (multiple camera angles, "likening the quality to live action video")
  instead. GT's famous self-measurement is the **licence test**, not a ghost. Absence of
  mention is not proof of absence — **[unverified]**, do not assert either way.
- **Modern practice** (all from Wikipedia article text, corroborating breadth rather than
  detail): ghosts became **shareable data** — Mario Kart: Super Circuit swapped them over the
  GBA link cable, Mario Kart online shares Time Trial ghosts, Daytona USA 2001 uploaded and
  downloaded "best times and ghost car information," TrackMania lets you download and race any
  ranked player's ghost, and NASCAR The Game let you chase a **real driver's** real lap.
  The mechanic's whole modern life is *a recorded lap is a file you can send someone*.

### The opaque question — the straight answer

**No sourced game rendered its ghost opaque.** Every appearance we could source is
transparent, and the transparency is doing a job: it says *this is a record, not a racer*.

But the sourced record also shows the *other* signal carrying at least as much weight —
**intangibility**. Nintendo's ghosts pass through you, through other karts and through
obstacles. A ghost you cannot crash into is not a rival no matter how solid it looks, and
that property is free at every render tier, including [[monaco-gp]]'s `ttl`, which has no
alpha primitive at all.

So: **the history does not endorse opaque, and it does not forbid it either.** What it says is
that if you take the transparency away you must put a different "I am a recording" signal in
its place. Documented candidates, in order of evidential strength: **pass-through with no
collision** (primary, franchise-wide), **it drives your own character/car** (primary — the
sameness is a feature; it is literally you), and **a mode context that makes it obvious**
(universal). Undocumented but era-honest at the `ttl` tier: a **flat single-ink silhouette or
outline** of the player's car — 1979 hardware could not have drawn a translucent one, so a
1979-looking ghost being solid is *more* faithful, not less. Nothing in the research supports
drawing it in a rival's livery, giving it a different driver, or numbering it.

**The one convention Act 7 must refuse** is the origin's: Hard Drivin' announced its ghost as
a **challenge from the previous winner** and Atari called it a **grudge match**. Same
technology, opposite emotion. Act 7's ghost is the player's own last lap and carries no
placement (INV-82) — so no "CHALLENGER," no "vs," no rival name, and nothing that implies the
ghost is a person who might beat the child.

### Unanswered by any source found

- **What Hard Drivin's challenge car looked like.** The crux question for an opaque build, and
  the sources that would settle it were all unreachable this session.
- **A ghost that waits at the finish line and cheers.** No documented precedent in any racing
  game found this pass. The nearest relatives are Mario Kart's **staff ghosts** (a friendly
  benchmark presence authored by the developers) and Excitebike's **"It's a new record!"**
  Act 7's cheering ghost appears to be an original, which is fine — just don't cite history
  for it.
- **Whether ghosts were ever labelled on screen.** Nothing found. Assume not.

## Downstream flags (research may not edit these)

- **`js/speedway/**`** — if any Act 7 string, card or animation calls the ghost a rival,
  challenger, opponent, or "the car to beat," it contradicts both INV-82 and this page's
  reading of the history. The ghost is *you, last time*.
- **`js/history-cards.js`** — two kid-safe candidates, both ≤160 chars, both resting on
  primary sources (the card lane must still check word/key typeability):
  - *"In 1989 an arcade game started remembering how you drove. Beat the time and you raced a
    car made of your own best lap."* (Atari's Hard Drivin' operator's manual **[fetched]**.)
  - *"A racing 'ghost' is a recording of your best lap. Nintendo's manual called it 'a half
    visible character' that drives exactly like you did."* (Mario Kart 64 instruction booklet
    **[fetched]**.)
- **`research/racing-games-by-era.md`** — §16c item 1 says Excitebike *"is the only station in
  the act that already believed in"* the ghost-car design. Still true as written (it is about
  *celebrating beating yourself*), but the doc has no ghost-car lineage anywhere; it should
  link here. Not edited by this lane.

## References

1. [Hard Drivin' Operator's Manual (1988, Atari) — Internet Archive, Arcade Manual Archive](https://archive.org/details/arcademanual_hard-drivin) — **the primary source for the origin claim.** Full text searched: the *"challenge lap" / "grudge match"* passage, *"The game remembers the path of the car driven by the best driver on record,"* the head-to-head framing gated on beating the qualifying lap time, *"Champ Laps is the number of times drivers qualify to race a championship lap,"* the instant-replay-on-crash feature, and the high-score table options. Confirms the words "ghost," "phantom" and "photon" appear **nowhere** in the manual. Catalogued 1988; the game shipped 1989. **[fetched]** (full text at `…/arcademanual_hard-drivin/Hard_Drivin-_-_1988_-_Atari_djvu.txt`)
2. [Race Drivin' Operator's Manual — Internet Archive, Arcade Manual Archive](https://archive.org/details/arcademanual_race-driven) — hardware corroboration that the recorded run was stored in the cabinet: *"extra non-volatile RAM for remembering the Championship Lap"* and *"DSK ZRAM test — the additional non-volatile RAM used for storing the race of the Challenge Lap champion."* Also confirms no use of "phantom," "photon" or "ghost." **[fetched]**
3. [Hard Drivin' — Wikipedia](https://en.wikipedia.org/wiki/Hard_Drivin%27) — Atari Games, 1989; *"one of the first 3D polygon driving environments via a simulator cabinet"*; the full Gameplay section including *"If the player scores in the top 10 during certain modes, they race alongside the computer-controlled Phantom Photon car"*; the ten-second crash instant replay; the TMS34010 ×2 / 68010 / DSP hardware and haptic wheel. The **only** located source for the name "Phantom Photon," and the source that conflicts with Atari's manual on how the challenge is triggered. **[fetched]**
4. [Mario Kart 64 instruction booklet (English) — Internet Archive, Nintendo 64 Manuals](https://archive.org/details/manual-nintendo-64-mario-kart-64-en) — **the primary source for what a ghost is and looks like:** *"Your Ghost is 'A recording of the course's best time'"*; *"a half visible character will drive exactly in the same manner as the stored data"*; the SAVE GHOST flow and no-pausing condition; *"If you reach the finish line before the ghost, the newer data will be saved for the ghost"*; *"two Ghosts from the same course cannot be saved"*; the **121 PAGES** Controller Pak requirement; automatic loading; ERASE GHOST FROM THIS COURSE. **[fetched]** (full text at `…/manual-nintendo-64-mario-kart-64-en/Manual_Nintendo64_MarioKart64_EN_djvu.txt`)
5. [Ghost (Mario Kart) — Super Mario Wiki (mariowiki.com)](https://www.mariowiki.com/Ghost_(Mario_Kart)) — the franchise-wide appearance and physics facts: a Ghost is *"the recording of a player's driving performance in the Mario Kart series"*; ghost drivers are **"semi-transparent characters"**; *"these drivers cannot be touched and pass through karts, bikes, and obstacles"*; staff ghosts on every course from *Mario Kart: Double Dash!!*, normal/expert variants in Wii and 7, 150cc/200cc ghosts in 8 Deluxe, and staff-ghost characters matching each course's theme. Domain-canonical community wiki, corroborated on the transparency point by Nintendo's own manual (ref 4). **[fetched]**
6. [Mario Kart 64 — Super Mario Wiki (mariowiki.com)](https://www.mariowiki.com/Mario_Kart_64) — *"challenge that record and race against themselves, represented by a ghost of their character-of-choice"*; the save-invalidating actions (pausing, crashing, reversing, falling off); **123 pages / 7.87 KB** on the original release vs 121 pages later; ghost recording impossible on Wii/Wii U Virtual Console and the Nintendo Classics app (no Controller Pak emulation); the three staff ghosts and their exact times (Luigi 1:48.37, Mario 1:27.16, Peach 2:38.55). **[fetched]**
7. [Time Trial — Super Mario Wiki (mariowiki.com)](https://www.mariowiki.com/Time_Trial) — records **ghost data as a new addition in Mario Kart 64**, and Mario Kart: Super Circuit adding ghost-data swapping over the Game Boy Advance link cable. The load-bearing source for "not Super Mario Kart." **[fetched]**
8. [Super Mario Kart — Super Mario Wiki (mariowiki.com)](https://www.mariowiki.com/Super_Mario_Kart) — the 1992 Time Trial described in full (one player, five laps, 100cc, no items or coins, per-lap and total times recorded) and the sentence that explains the misremembering: *"By pressing B Button on the second controller, a **computer-controlled opponent** can be chosen to race against."* No ghost anywhere on the page. **[fetched]**
9. [Super Mario Kart — Wikipedia](https://en.wikipedia.org/wiki/Super_Mario_Kart) — *"In time trial mode, players race against the clock… attempting to set the fastest time possible"*; the full mode list (Mario Kart GP, Time Trial, Match Race, Battle Mode) and the 50/100/150cc tiers. **The word "ghost" does not appear in the article.** **[fetched]**
10. [Mario Kart 64 — Wikipedia](https://en.wikipedia.org/wiki/Mario_Kart_64) — release dates (Japan December 14 1996; North America February 10 1997; Europe June 24 1997); *"In Time Trials, the player races on any of the 16 tracks with the aim of achieving the lowest time across three laps"*; and *"The player can race against another player's time by sharing 'ghost' data using the Controller Pak."* **[fetched]**
11. [Mario Kart — Wikipedia (franchise article)](https://en.wikipedia.org/wiki/Mario_Kart) — *"The best time is then saved as a ghost, which the player can race against in later trials"*; *"Mario Kart: Double Dash!! introduced Staff Ghosts, which are ghosts set by members of the Nintendo development team"*; and online Time Trial ghost sharing. The source of the Double Dash / Mario Kart 64 staff-ghost disagreement noted above. **[fetched]**
12. [F-Zero X — Wikipedia](https://en.wikipedia.org/wiki/F-Zero_X) — 1998; *"Transparent re-enactments of Time Attack performances, allow racing against ghost racers, recorded by the player or game developer,"* up to three player ghosts simultaneously, one recording saved per track. The second independent "ghosts are see-through" datapoint. **[fetched]**
13. [Time trial — Wikipedia](https://en.wikipedia.org/wiki/Time_trial) — the generic definition (*"Racing games often feature 'ghost cars' which are saved when the player sets a record time. In subsequent races, the ghost car follows the path the player took when setting that record"*) and the storage/sharing framing. **Cited with a warning: the entire video-games subsection is tagged `[citation needed]` on Wikipedia itself** — used here for vocabulary, never as evidence. **[fetched]**
14. [Gran Turismo (1997 video game) — Wikipedia](https://en.wikipedia.org/wiki/Gran_Turismo_(1997_video_game)) — checked specifically for ghosts and time trials: **no mention of either.** What the critics praised was the **replay mode** — *"lauding the usage of multiple camera views and likening the quality to live action video."* Supports only the negative, and weakly. **[fetched]**
15. [Winning Run — Wikipedia](https://en.wikipedia.org/wiki/Winning_Run) — checked as the main pre-1989 3D candidate: a qualifying lap and twelve opponents, **no ghost, replay or time-trial feature described.** **[fetched]**

*Discovery note:* this pass ran with the session's web-search budget exhausted, so candidates
were found by fetching the MediaWiki full-text search API (`en.wikipedia.org/w/api.php?
action=query&list=search&srsearch="ghost car" racing`) and the Internet Archive's
`advancedsearch`/`metadata` APIs, then fetching each candidate page directly. Every URL cited
above was fetched and read this session; the two manuals were read as full OCR text.

## Corrections from citation pass (2026-09-13)

1. **"The ghost car came from Mario Kart."** Half right, and the half that's wrong is the
   title. **Super Mario Kart (1992) has no ghost** — Wikipedia's article never uses the word,
   and the Super Mario Wiki's Time Trial page dates ghost data to **Mario Kart 64 (1996)**.
   What 1992 *does* have is a Time Trial with an optional **computer-controlled** second kart
   summoned on controller two, which is almost certainly the memory being reached for.
2. **"Mario Kart invented the ghost car."** No. **Atari Games' Hard Drivin' (1989)** was
   recording the best driver's path and racing it head-to-head seven years earlier, per
   Atari's own operator's manual — and its sequel's manual documents the non-volatile RAM the
   recording lived in. Nintendo's contribution is the **name**, the **you-versus-you framing**,
   the **transparency**, and the **intangibility** — which is a large contribution, but it is
   popularising, not inventing. *(Stated as "earliest documented this pass," not as "the
   first": no source found makes a first-ever claim, and the superlative is unproven.)*
3. **"Ghost cars are translucent because that's what they are."** They are translucent because
   **Nintendo drew them that way on hardware that could**, and the sources say so in those
   words. The property that actually defines a ghost in the documented record is that it
   **cannot be collided with**. This distinction is the whole answer to the opaque question.
4. **"Hard Drivin's ghost was an AI opponent."** Wikipedia says *"computer-controlled Phantom
   Photon car,"* but **Atari's own manual says the game "remembers the path"** of a real
   driver's run. Where a primary manufacturer document and an encyclopedia summary disagree
   about a machine's own feature, the manual wins. Flagged rather than silently resolved.

## Unsourceable / weakly-sourced items

- **The on-screen appearance of Hard Drivin's challenge / "Phantom Photon" car.** Genuinely
  unresolved. Every route tried failed: `hardcoregaming101.net/hard-drivin/` **404**;
  `uk.ign.com` **blocked by the fetch tool**; `arcade-history.com` **403**; `segaretro.org`
  **403**; `retrocdn.net` (GamePro 18 PDF) **403**; the *Commodore User* issue 72 scan's OCR
  text **HTTP 500** at its archive mirror; `solvalou.com`'s review page returned an unrelated
  index; the `ausretrogamer` review never mentions it. **Do not fill this gap with inference.**
- **The Red Bull feature *"From Arcade To The iPhone 5 — The History Of The Gaming Ghost
  Car"***, which is the *only* citation Wikipedia's *Glossary of video game terms* offers for
  the ghost entry: the original `redbull.com` URL returns **404**, and although the Wayback
  availability API reports a snapshot (2021-02-25), **web.archive.org is not fetchable by this
  tool**, so it was never read. Recorded here as a lead for a future pass — **not cited as
  evidence**, and nothing on this page rests on it.
- **The Glossary of video game terms' "Ghost" entry itself** was only ever seen as a **search
  snippet** returned by the MediaWiki API (*"A feature included in time attack or time trial
  modes in video games allowing the player to review their previous rounds. In racing games,
  for example, a 'ghost car' may follow the last or fastest path a player took around…"*); two
  direct fetches of the page returned truncated content that did not include the G section. Do
  not quote it as a read source.
- **Whether Gran Turismo (1997) had a ghost.** Only the silence of its Wikipedia article
  supports "no." **[unverified]** in both directions.
- **The "top 10" trigger for Hard Drivin's challenge lap** (Wikipedia) versus **"beats the
  qualifying lap time"** (Atari's manual). Unreconciled; state neither as the rule.
- **Whether Mario Kart 64 or Double Dash!! "introduced" staff ghosts.** The Super Mario Wiki
  documents three built-in ghosts in MK64; Wikipedia credits Double Dash!! with introducing
  Staff Ghosts. Safe phrasing: *Double Dash gave every course one.*
