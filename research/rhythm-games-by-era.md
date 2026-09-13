# Rhythm Games by Era
## The music/dance genre, 1974 → now — and the honest question of whether a never-punish typing game can borrow any of it

*Compiled 2026-09-13 by the arcade-historian, for Trevor's proposed music/dance act
("dance dance revolution, karaoke, guitar hero, band hero, etc.").*

*This document is deliberately NOT organised as "here is the genre, here are the cabinets."
It is organised around the one problem that decides whether the act can exist at all: **every
rhythm game ever made is built on a deadline, and this game's founding law forbids deadlines.**
The arc is in §2–§4; the argument is in §5–§9; the ledger the spec lane actually needs is §7.*

**How to verify.** Every claim follows the arcade-historian citation standard
(`.claude/agents/arcade-historian.md`): institutional/primary → established journalism →
Wikipedia-as-one-of-several, and **no URL written from memory**.

⚠️ **Sourcing conditions for this pass, stated up front.** This lane ran with the session's
**WebSearch budget already exhausted (200/200 spent by earlier lanes)**. Every URL below was
therefore reached by **direct WebFetch** and is labelled **[fetched]** — meaning it resolved
and was read *this session*. Nothing here is "search result only." The trade-off is coverage:
without search I could not discover non-obvious secondary sources, so several pages rest on
**one Wikipedia article plus one primary/official page**, and a handful rest on Wikipedia alone.
Every such case is marked **[single-source]** on its own wiki page and listed in §12.
`arcade-museum.com` (KLOV), `mobygames.com` and `fandom.com` have returned 403/402 all session;
`bbc.co.uk` is **unfetchable by this tooling** (second failure — see §6d);
`osu.ppy.sh` returned 403; `museumofplay.org` per-game slugs for Guitar Hero and Simon 404.

**Related:** [[video-game-history]] · [[arcade-cabinets-by-era]] · [[racing-games-by-era]] ·
[[dance-dance-revolution]] · [[dance-mat-typing]] · [[touch-typing-pedagogy]] ·
[[error-feedback-pedagogy]] · [[typing-as-racing]] · [[call-and-response]] ·
[[karaoke-reading-support]] · [[rhythm-on-a-keyboard]] · [[music-licensing-in-games]] ·
`.claude/rules/product.md` · `docs/ROADMAP.md` §1.4

---

## 0. The six things to read first

1. **The fit is real, and so is the collision — and they are the same sentence.** A rhythm
   game is *"press the right input at the right moment, in time with music."* Keystroke
   Kingdom's sacred contract is *"the letter stays on screen and waits."* **In a rhythm game
   the music is the clock. In this game the player is the clock.** These are not reconcilable
   by widening a timing window: widen it to infinity and you have a typing game with a
   soundtrack, which is a fine thing and is not a rhythm game. §5.
2. **But the genre has TWO lineages, and only one of them is built on a deadline.**
   The note-highway line ([[beatmania]] → [[dance-dance-revolution]] → [[guitarfreaks]] →
   [[guitar-hero]] → [[rock-band]] → [[beat-saber]]) *is* the deadline; strip it and nothing
   remains. The **call-and-response** line ([[touch-me-atari]] 1974 → [[simon-electronic-game]]
   1978 → [[parappa-the-rapper]] 1996 → [[space-channel-5]] 1999 → [[rhythm-heaven]] 2006)
   has a **wait built into its grammar**: the machine performs, then stops and waits for you.
   That lineage is older, it is a *teaching* form, and it survives the strip intact. §6, §8,
   and [[call-and-response]].
3. **The act can open in 1979 after all.** The genre proper starts in 1996–98, which would
   have forced a late-act placement — except that Wikipedia's own music-video-game article
   calls **Simon (1978) "the earliest example of a rhythm game,"** and Simon was built by
   **Ralph H. Baer** from an **Atari arcade cabinet, *Touch Me* (1974)** — four big circular
   buttons, repeat the sequence. That is a real coin-op, in the discrete-logic era, from the
   company that already owns Level 1. **[[touch-me-atari]] is this act's Monaco GP.** §2.
4. **Karaoke is the best fit in the project — but only its SCREEN, not its game.** Karaoke's
   *input is the human voice* and does not translate to a keyboard at all. Its *output* —
   lyrics that scroll and highlight in syllable-sync — is a reading-support device with real
   institutional backing under the name **Same Language Subtitling** (World Bank 2002, USAID
   2012, Library of Congress International Literacy Prize 2013), and an ancestor 47 years
   older than karaoke: the Fleischers' **"Follow the Bouncing Ball," 1924**. Adopt the screen,
   not the microphone, and call it what it is: assisted reading with a keyboard. §9 and
   [[karaoke-reading-support]].
5. **The genre already shipped the Adventure/Survival architecture, and the market voted for
   it.** [[rocksmith]] (2011) **cannot be failed** and adapts note density to the player —
   which is `tech.md` §Adaptive Pacing, in a commercial music game. [[just-dance]] (2009) has
   **no fail state in normal play** and puts elimination in an **opt-in mode**; it is the one
   franchise that survived the genre's collapse, past **90 million units**. §8.
6. **Music is not a nice-to-have here, it is the feature.** `docs/ROADMAP.md` §1.4: **zero
   tracks integrated**; audio is procedural WebAudio only. Worse, `Settings → Sound: OFF` is a
   supported option — and **a rhythm act with sound off is not a game.** That is a live
   conflict with a shipped setting and needs Trevor's decision, not an agent's. §10.

---

## 1. What the graph already had

One page: [[dance-dance-revolution]] (written 2026-07-11 for the typing-pedagogy work, verified,
4 refs). It records Konami/Bemani, **September 26 1998** (Japan), the pressure-pad platform, and
two corrections already made — that the "November 1998" date belongs to the *Internet Ranking
Version* revision, and that the 1998 original graded **S/A/B/C/D** (AAA arrived in 5thMix, 2001).
Nothing existed on Guitar Hero, Rock Band, karaoke games, or the genre as a form. This pass
added **23 pages** and extended DDR's.

---

## 2. Before the genre existed (1974–1987) — and why this is the act's opening, not its prologue

### [[touch-me-atari]] — Atari, **1974**, arcade cabinet (handheld 1978)
- **A short arcade cabinet with four large circular buttons.** The machine blinks a sequence;
  you repeat it in order; each round adds one more. A digital display counts completed
  sequences. **Three mistakes ends the game.**
- This is the memory/sequence form that the whole call-and-response lineage descends from, and
  it is an **Atari coin-op in the discrete-logic decade** — the exact rendering bar Act 1
  already draws ([[discrete-logic-era]], [[atari-inc]]).
- **No cabinet collision:** Atari already owns Level 1 (Breakout) and Level 23 (Missile
  Command), but *Touch Me* is a clearly distinct game, which the one-game-per-cabinet rule
  explicitly permits.

### [[simon-electronic-game]] — Ralph H. Baer & Howard J. Morrison (Marvin Glass & Associates) / Milton Bradley, **1978**
- **Launched in 1978 at Studio 54 in New York City.** Four colour-coded buttons, each with a
  fixed tone — the original sounded an **A-major triad in second inversion** (red A, blue E,
  yellow C♯, green E an octave lower), chosen to resemble a trumpet fanfare. Some 1978 units
  used a B♭-minor triad instead.
- **Baer built it from *Touch Me***, which he judged: *"Terrible execution. Visually boring.
  Miserable, rasping sounds."* Simon's whole innovation was making the feedback **musical and
  pleasant** — which is, almost word for word, this project's audio design brief.
- Wikipedia's music-video-game article calls Simon **"the earliest example of a rhythm game."**
- **Failure mechanic (the only thing to strip):** one wrong press, or exceeding the response
  time limit, and the game ends.
- ⚠️ **Date discrepancy, disclosed:** Simon's article says Baer encountered *Touch Me* in
  **1976**; *Touch Me*'s article says **1977**. Both were fetched this session and they
  disagree. Say "the mid-1970s" or cite both.

### [[dance-aerobics]] — Human Entertainment / Bandai (JP) & Nintendo (NA), **26 February 1987** (JP) / **March 1989** (NA), NES + Power Pad
- Feet on a **3×4 mat**; step the pads as the instructor demonstrates. Wikipedia places it as a
  precursor to "a genre that would later explode into the mainstream gaming market at the tail
  end of the 1990s."
- **Quiet prize:** it shipped an **"Aerobics Mode" for continuous practice with no level
  progression** — a practice mode with nothing to lose, in 1987.

---

## 3. The genre proper (1996–2001) — five games, five different input devices

| Year | Title | Developer | Input device | What it introduced |
|---|---|---|---|---|
| 6 Dec 1996 (JP) / 17 Nov 1997 (NA) | [[parappa-the-rapper]] | NanaOn-Sha / Sony | PlayStation face buttons | The scrolling icon bar; **call-and-response with a teacher**; "considered the first true rhythm game" |
| 10 Dec 1997 | [[beatmania]] | Konami G.M.D. | **5 piano-style keys** + turntable | The falling-note highway into a judgement line; named the **Bemani** brand |
| 26 Sep 1998 | [[dance-dance-revolution]] | Konami (Bemani) | **Feet**, 4 pressure pads | Full-body play; the genre's mainstream breakout |
| 16 Feb 1999 | [[guitarfreaks]] | Konami (Bemani) | Guitar-shaped, 3 neck buttons + pick lever | The guitar controller; **the direct ancestor of Guitar Hero** |
| 16 Dec 1999 | [[space-channel-5]] | Sega AM9 / United Game Artists | Dreamcast d-pad + buttons | Pure **Simon-says** structure with a character issuing the call |
| 21 Feb 2001 | [[taiko-no-tatsujin]] | Namco | **Drum + sticks**, 2 inputs (don/ka) | **A miss does not interrupt the music** — see §8 |

**The thing to notice in that table is the column headings, not the rows.** Face buttons,
piano keys, feet, a guitar neck, a d-pad, a drum. Six games, six input devices, and **only one
of them (Beatmania) is anything like a keyboard.** That is §6.

---

## 4. The plastic-instrument boom and bust (2003–2015)

| Date | Title | Developer / Publisher | Input | Note |
|---|---|---|---|---|
| 4 Nov 2003 | [[karaoke-revolution]] | **Harmonix** dev / **Konami** pub | Microphone (**pitch**, not words) | Cover recordings, not masters, at launch |
| May 2004 | [[singstar]] | London Studio / Sony | Two USB microphones | **No traditional fail state** — you always finish |
| 8 Nov 2005 | [[guitar-hero]] | **Harmonix** dev / **RedOctane** pub | 5 fret buttons + strum bar + whammy | **30 covers** (WaveGroup Sound) + 17 masters |
| 20 Nov 2007 | [[rock-band]] | Harmonix / MTV Games / EA | Guitar + 4-pad drums + mic | 51 of 58 songs were **masters**; band rescue mechanic |
| 9 Sep 2009 | The Beatles: Rock Band | Harmonix / MTV Games | Same | **17 months** of licensing talks; **$10M–$40M** guaranteed royalties |
| 3 Nov 2009 | [[band-hero]] | Neversoft / Activision | Same as Guitar Hero 5 | The family/pop-facing spin-off Trevor named |
| 17 Nov 2009 | [[just-dance]] | Ubisoft Paris | **Wii Remote — no peripheral** | No fail in normal play; **90M+ units by Nov 2024** |
| 18 Oct 2011 | [[rocksmith]] | Ubisoft San Francisco | **A real guitar** (Real Tone Cable) | **Cannot be failed**; difficulty adapts to you |
| 26 Oct 2010 | Rock Band 3 | Harmonix | + **25-key MIDI keyboard**, Pro modes | The genre's only literal keyboard — and it is a *musical* one |

**The collapse, with figures.** Rhythm-game revenue fell from **$1.47 billion (2008) to $700
million (2009)** — roughly 50% short of projections. In **February 2011** Activision **disbanded
its Guitar Hero business unit**, citing "continued declines in the music genre," having sold
**25 million units for $2 billion** across the series (Guitar Hero III alone was the first
single game to pass **$1 billion at retail**). [[guitar-hero]] Live's 2015 reboot — a six-button,
two-row controller meant to "mimic actual guitar fingering" — undersold and led to layoffs.

**What survived the collapse is the finding.** Not the $1bn plastic-guitar franchise. The
survivors are the **peripheral-free, fail-free, family-facing** ones: [[just-dance]] (90M+
units) and [[taiko-no-tatsujin]] (10M+ console copies as of 2019, still running). That is not a
moral; it is a market result that happens to point the same direction as the One Rule.

---

## 5. ⚠️ The structural collision — read this before designing anything

> *"The game should only ever stop a player's flow with joy, never with punishment."*
> — `CLAUDE.md`, The One Rule
>
> *Wrong key pressed → gentle nudge sound → the letter **stays on screen and waits** → player
> hits the correct key → advance normally, no double penalty.*
> — `CLAUDE.md`, Wrong Keypress Behavior ("critical, never change without discussion")

A rhythm game's note **arrives on a schedule the player does not control**, and its judgement
(Marvelous / Perfect / Great / Good / Miss) is *a measurement of the gap between the schedule
and the player.* Remove the gap and there is nothing left to measure.

**So the sacred contract and the note highway are mutually exclusive, and no amount of tuning
fixes it.** A note that scrolls past you has advanced without you. Widening the timing window
to one second, five seconds, or a whole bar does not change the kind of thing it is — it only
moves the moment of betrayal further out. At an infinite window, the note is just a letter
waiting on screen, which is the game we already have.

**The resolution is not a wider window. It is to make the MUSIC wait.** Three sourced forms of
music-that-waits exist in the genre's own history:

1. **Call-and-response** — the machine plays a phrase and then **does nothing until you
   answer**. [[touch-me-atari]] (1974) literally idles. [[simon-electronic-game]] (1978) idles.
   [[parappa-the-rapper]] (1996) alternates teacher-line / player-line. [[space-channel-5]]
   (1999) is Simon-says with a plot. **A pause is part of the form, not a concession to it.**
   See [[call-and-response]].
2. **Adaptive density, not adaptive deadline** — [[rocksmith]] splits a song into phases and
   serves a **denser or sparser note pattern** based on how the last phase went, and **you
   cannot fail**. Ubisoft's own store copy: it *"adapts to your skill level… ensuring you
   progress quickly, no matter where you start."* That is `tech.md` §Adaptive Pacing, already
   in the design bible, already shipped by somebody else, in 2011.
3. **Decoupling the miss from the music** — [[taiko-no-tatsujin]]: *"missing a note does not
   result in off-key sounds or interruptions to the background track."* Namco decided in 2001
   that the song should not punish you. Contrast [[guitar-hero]], where a missed note makes an
   ugly sound and a sustained failure **mutes your instrument out of the mix** ([[rock-band]]).

---

## 6. ⚠️ The input-device problem — the act's central obstacle, title by title

**None of the named games is played with a keyboard.** DDR is feet. Guitar Hero is a plastic
guitar. Karaoke is a voice. Here is the honest per-title translation table; the "does it
translate" column is the one that matters, and three rows say **no**.

| Title | How it mapped music → input | Does it translate to a keyboard? |
|---|---|---|
| [[touch-me-atari]] (1974) | 4 lit buttons; repeat the sequence | **Yes, perfectly.** 4 buttons = 4 keys. No scrolling, no window — only a response timer to delete |
| [[simon-electronic-game]] (1978) | 4 buttons, each a fixed pitch; repeat | **Yes, perfectly** — and it adds the idea that *each key has its own note*, which a typing game can take literally |
| [[dance-aerobics]] (1987) | Feet on a 3×4 mat | **No.** Whole-body. Only its practice mode transfers |
| [[parappa-the-rapper]] (1996) | Symbols on a scrolling bar → face buttons, answering a teacher | **Yes, and well.** Arbitrary glyph → button *is* letter → key. The call-and-response half is the transferable half |
| [[beatmania]] (1997) | **5 keys in a zigzag, coloured like piano keys** + a turntable | **Partly.** The five keys are the closest physical analogue to a computer keyboard in the genre. The turntable is not a keyboard gesture and should be dropped, not faked |
| [[dance-dance-revolution]] (1998) | Feet, 4 pressure pads | **Not in its own terms** — but [[stepmania]]'s own site advertises *"keyboard and 'dance pad' support,"* so keyboard DDR is real, official, and MIT-licensed. See [[rhythm-on-a-keyboard]] |
| [[guitarfreaks]] (1999) | 3 neck buttons + pick lever (hold, then strum) | **Only by emulation.** But the two-hand "hold one thing while doing another" *is* Level 24's Shift, which is interesting |
| [[space-channel-5]] (1999) | D-pad/buttons echoing an on-screen caller | **Yes** — pure call-and-response |
| [[taiko-no-tatsujin]] (2001) | **Two inputs**: drum face (don) / rim (ka) | **Yes, trivially** — two keys, left hand / right hand. This is Level 1 (J and F) with a drum skin on it |
| [[karaoke-revolution]] (2003) | **The human voice**, judged on *pitch*, not words | **No. Not at all.** There is no keyboard mapping for singing. See §9 |
| [[singstar]] (2004) | Two microphones, pitch vs a stave | **No** — same reason |
| [[guitar-hero]] (2005) | 5 frets + strum bar; hold the fret, toggle the strum | **Only by emulation** — and [[frets-on-fire]] did exactly that, on a keyboard, in 2006 |
| [[rock-band]] (2007) | Guitar + drums + mic, three players | **No, as a band.** One keyboard is one instrument |
| Rock Band 3 (2010) | **A real 25-key MIDI keyboard** | ⚠️ **Beware this one.** Yes, it is a keyboard — a *musical* one. Its mapping is **pitch → key**, not **letter → key**. It is not the precedent it looks like |
| [[just-dance]] (2009) | Whole body + one Wii Remote | **No** |
| [[rocksmith]] (2011) | An actual electric guitar | **No** as input — **completely** as pedagogy (§5, §8) |
| [[crypt-of-the-necrodancer]] (2015) | Keyboard / gamepad / dance pad; move on the beat | **Yes — natively keyboard** |
| [[beat-saber]] (2018) | Two VR controllers, 4×3 grid | **No** |

### 6a. The one thing that does translate: emulation — and its ceiling
**[[frets-on-fire]] (Unreal Voodoo, 3 August 2006, GPL)** is the proof. Its own SourceForge
page: *"Frets on Fire is a game of musical skill and fast fingers. The aim of the game is to
**play guitar with the keyboard** as accurately as possible."* Its documentation gives the
default binding outright: **F1–F5 are the five frets, Enter picks.** It won the Assembly 2006
game-development competition and was downloaded **over 14 million times** on SourceForge
between 2007 and May 2017. [[stepmania]] (Chris Danford, 2001, MIT) does the same for DDR;
osu!mania maps falling columns to keys; [[crypt-of-the-necrodancer]] is keyboard-first.

**But notice what all four have in common: the keyboard is standing in for something else.**
F1–F5 are *pretending to be frets*. Arrow keys are *pretending to be a dance pad*. In every
keyboard rhythm game that exists, the keyboard is a cheap controller, not the instrument.

### 6b. The gap, stated plainly
**No commercial or open-source rhythm game found this pass treats letters as the notes.** There
is no precedent to borrow tuning, difficulty curves or note-chart conventions from. The nearest
relative is *The Typing of the Dead* (WOW Entertainment / Sega, 1999) — already documented in
[[typing-as-racing]] — which swapped a light gun for a keyboard and kept the game; and its
pressure loop is *"type fast or the zombie reaches you,"* i.e. precisely the thing forbidden
here. **This act would be inventing its form, not reviving one.** That is a legitimate thing to
do and it should be done with eyes open.

### 6c. Two-input games are the honest starting point
If a rhythm cabinet is built, the two **2-input** ancestors are the ones that fit a
home-row-learning game without distortion: [[taiko-no-tatsujin]] (don/ka = two keys, two hands)
and [[touch-me-atari]]/[[simon-electronic-game]] (four buttons, four tones). J and F are
already the first two keys the child learns. A don/ka drill on J and F is era-honest, mechanic-
honest, and needs exactly one thing removed (the gauge).

### 6d. ⚠️ The Dance Mat Typing question — I could not answer it, and nobody should assert it
The brief asks what the BBC's **[[dance-mat-typing]]** kept from DDR and what it dropped. **I
cannot source this.** `bbc.co.uk` is **unfetchable by this project's tooling** — the same
failure the existing page recorded on **2026-07-11**, reproduced again **2026-09-13**. The
existing page documents only that it is a BBC child-facing home-row-first tutor, corroborated
through two third-party institutional pages. The intuition that "the BBC borrowed DDR's visual
language for a keyboard" is **plausible, undocumented, and exactly the shape of the
plausible-but-invented justification this project keeps catching** (the "1979 pinball NOVICE/
EXPERT switch" class). **Do not write it into any doc or card until somebody clicks the BBC
page by hand.** Marked **[unverified]** on [[dance-mat-typing]].

---

## 7. The punishment ledger — the table the spec lane needs

*Format follows [[racing-games-by-era]] §12. **Every row is a One Rule violation as it stands.***

| Era / Game | What the real game did to you | Why it violates the One Rule | Reframe |
|---|---|---|---|
| [[touch-me-atari]] (1974) | **Three mistakes and the game ends**; a response time limit | Failure state + deadline | Delete both. The sequence simply waits — which is what the letter already does |
| [[simon-electronic-game]] (1978) | **One wrong press ends the game**; response timer | The harshest single-mistake rule in this document | Keep the four tones and the growing sequence; **a wrong press replays the phrase, it does not end it** |
| [[dance-aerobics]] (1987) | Graded aerobics "classes" of increasing difficulty | Grading | Keep its own **Aerobics Mode** (practice, no progression) as the default, not the extra |
| [[parappa-the-rapper]] (1996) | **COOL / GOOD / BAD / AWFUL**; two bad lines in a row demotes you; ending on Bad or Awful **fails the song and you start over** | Grade + demotion + restart-from-zero | Take the teacher/student structure whole; **delete the ladder.** Every answer is an answer |
| [[beatmania]] (1997) | **Groove gauge** empties → song can end early; p-great/great/good/bad/**poor** judgement per note | Depleting meter + per-note grading | Invert the gauge: fill-only, never drains (see Taiko below) |
| [[dance-dance-revolution]] (1998) | Dance gauge drains on misses; empty = **"the player will fail the song, and the game will be over"**; letter grade on the results screen | Life bar + letter grades | The visual grammar (arrows rising to receptors) can stay; the gauge and the grade cannot |
| [[guitarfreaks]] (1999) | Groove Gauge depletes on misses; Perfect/Great/Good/OK/**Miss** | Same class | Same |
| [[space-channel-5]] (1999) | Ratings meter falls on mistakes; **ratings at zero = failure**; boss fights give one heart per mistake | Failure + hearts (lives by another name) | Keep the caller/echo structure and the characters; delete the meter and the hearts |
| [[taiko-no-tatsujin]] (2001) | Spirit gauge must be **filled past a target** to clear a song | ⚠️ **The mildest offender here, and half-inverted already** — it is a *fill* meter, not a drain, and **a miss never interrupts the music.** Only the clear-threshold is a gate | Keep the fill meter as a progress bar; delete the threshold. This is one deletion away from compliant |
| [[karaoke-revolution]] (2003) | Crowd meter; **poor singing gets you booed and a game over**; gold/platinum record tiers | Booing a child is the wrong emotional register outright | Delete the crowd entirely. See §9 — take the screen, not the game |
| [[singstar]] (2004) | Score for pitch accuracy; **no traditional fail state** | ⚠️ **Nearly compliant as shipped** — scoring without failure | Keep the shape; the remaining problem is the score itself |
| [[guitar-hero]] (2005) | **Rock Meter** — "if the meter drops too low the song will prematurely end in failure"; score multipliers for streaks; Star Power doubles them | Life bar + combo multiplier + mid-song ejection | Multipliers are the same class of thing as placement (**INV-82**'s spirit). Strip them |
| [[rock-band]] (2007) | Fall to the bottom of the **Band Meter** and you fail out and **your instrument is muted from the mix**; a bandmate can rescue you with Overdrive — **but only twice; the third failure is permanent** | Public failure in front of your friends, with a hard cap on mercy | ⚠️ **Best invert candidate in the genre: keep the rescue, delete the cap.** Uncapped mutual rescue is a One-Rule-native co-op mechanic |
| [[band-hero]] (2009) | Inherits Guitar Hero 5's Rock Meter and scoring | Same | Same |
| [[just-dance]] (2009) | X / OK / Great judgements; **"Last One Standing" mode gives seven lives and eliminates you** — but players **can always complete songs in standard play** | ⚠️ **Already the Adventure/Survival split**: failure exists only inside an opt-in mode | Adopt wholesale. This is the architecture `product.md` already mandates, shipped in 2009 |
| [[rocksmith]] (2011) | **Nothing. You cannot fail.** Difficulty adapts per phrase | ⚠️ **Zero violations found.** The only entry in this document with an empty punishment column | Adopt the mechanic, not just the spirit: adapt *density*, never deadline |
| [[crypt-of-the-necrodancer]] (2015) | Missing the beat *"does not directly harm the character in most situations, but does reset the scoring multiplier"*; **Bard** ignores rhythm entirely; **"No Beat" mode** for all characters added **July 2022** | Only a multiplier reset — and it shipped its own opt-out | Keep the multiplier-reset-instead-of-damage inversion; keep No Beat as the default, not the option |
| [[beat-saber]] (2018) | Energy bar depletes on misses/bombs → level ends. **"No Fail" modifier lets you finish — *but the final rank will be lowered*** | ⚠️ **The trap to name out loud.** Even the genre's no-fail modes keep the punishment and just move it into the grade | If this act ever ships a "no fail" toggle, it must not cost rank. A mode that is safe but scored lower is still a punishment |

**Three mechanics worth *stealing* rather than stripping:**
1. **Taiko's decoupling (2001)** — a miss never interrupts the backing track. This is the single
   most directly adoptable idea here, and it is the exact audio analogue of "the letter waits."
2. **Rock Band's Overdrive rescue (2007)** — a *teammate* pulls you back in. Uncapped, this is a
   sibling/parent co-op mechanic with no loser in it.
3. **Rocksmith's phrase-level adaptive density (2011)** — the game's own §Adaptive Pacing tenet,
   proven at commercial scale, in the closest genre.

---

## 8. Does any rhythm game survive the strip? — the straight answer

**Take away timing windows, fail-out and grades, and the note-highway genre is gone. There is
nothing left. Beatmania → DDR → GuitarFreaks → Guitar Hero → Rock Band → Beat Saber IS the
timing window; the falling-note display exists for no other purpose than to make a deadline
legible in advance.** ~~Anyone who tells Trevor that a Guitar Hero cabinet can be "made gentle"
is describing a different game with Guitar Hero's wallpaper.~~

> **⚠️ CORRECTED 2026-09-13 by Trevor — the struck sentence applied a standard this project has
> never used, and the correction reopens the whole plastic-instrument era.** He said:
> *"making guitar hero 'gentle' doesn't defeat that guitar hero inspired the cabinet we made into
> a typing game — after all we aren't byte for byte recreating these original games."*
>
> **He is right, and "a different game with the original's wallpaper" describes every level
> already shipped.** Breakout at L1 does not play like Breakout — you type `j` and `f`. Tetris at
> L8 does not play like Tetris — pieces fall while you type. Donkey Kong's barrels roll and are
> jumped by nobody's thumb. **Every one of the 25 cabinets is a typing game wearing a classic
> game's clothes, and that IS the design.**
>
> The project's actual bar is `.claude/rules/theme-authoring.md` §"Mechanics fidelity": *"the
> **SCENE** must show the original game's SIGNATURE MECHANIC actually **operating** — pieces
> falling, barrels rolling and being jumped, formations diving."* **That is a standard about what
> the scene DEPICTS, never about what the player's hands DO.** The input contract is separate and
> absolute: the letter waits.
>
> So a Guitar Hero station is not merely permissible, it is straightforward: **the note highway
> scrolls** — the signature mechanic, visibly operating, at STRONG fidelity — **and the player
> types.** Notes arriving is spectacle; notes *punishing* is the part that never crosses over,
> exactly as Tetris's falling pieces cross over while Tetris's game-over does not.
>
> **What the section below still gets right, read with this correction in hand:** call-and-response
> is a better *mechanical* fit, because the machine already waits by nature and needs nothing
> stripped. That remains the recommendation. But it is now a choice between two workable options,
> **not a rescue from an impossible one** — and the plastic-instrument era is back on the table as
> a cabinet, with its note highway as scenery and its failure economy left in 2005.

**But the answer to "is there a rhythm game left" is still yes, because the genre has a second
lineage that never needed a deadline.**

### What survives, in order of confidence

1. **Call-and-response — the whole form, intact.** [[touch-me-atari]] 1974 → Simon 1978 →
   PaRappa 1996 → Space Channel 5 1999 → [[rhythm-heaven]] 2006. The machine performs; the
   machine **waits**; the child answers; the machine celebrates and performs the next one. There
   is no scrolling note to miss, because nothing is scrolling. Strip Simon's one-mistake rule
   and Simon is *already* a One-Rule-compliant game. Full treatment: [[call-and-response]].
   **And the project already specified this**: `product.md` Level 3 — *"Call-and-response
   melody — left hand (S,D,F) answered by right hand (L,K,J)."* The act would be cashing a
   design promise already written, not importing a foreign one.
2. **Karaoke's scrolling highlight, as pure reading support with no scoring.** §9.
3. **The practice/free-play mode, which real games shipped.** [[dance-aerobics]]'s Aerobics
   Mode (1987, no progression); [[rocksmith]]'s Guitarcade and its unfailable songs;
   [[rhythm-heaven]]'s skip-after-three-Try-Agains; [[crypt-of-the-necrodancer]]'s Bard and No
   Beat mode; LEGO Rock Band's **"Super Easy" difficulty, added specifically for younger
   players**. The genre has been quietly building escape hatches for children for decades —
   this act's job is to make the escape hatch the front door.
4. **Ensemble play where nobody loses.** [[rock-band]]'s Overdrive rescue with the two-save cap
   deleted; [[just-dance]]'s up-to-six-player party mode; [[singstar]]'s "Pass the Mic" (up to
   eight people, two teams). A Keystroke Kingdom version — a parent and a child typing
   alternating lines of the same song — has direct precedent and no loser.
5. **The tone-per-key idea.** Simon's four buttons each sound a note of a chord, so *playing
   correctly is itself music*. A keyboard has more buttons than Simon by a factor of twenty.
   Assigning pitches so that a correctly-typed word is a pleasant phrase is a genuine,
   sourced, 1978-vintage idea and it interrupts nothing.

### What does NOT survive, and must be named so it is not smuggled back in
- **Timing windows** of any width.
- **Life bars / groove gauges / rock meters / energy bars** — the same object under six names.
- **Letter grades and per-note judgement words** (S/A/B/C/D; Marvelous→Miss; COOL→AWFUL;
  p-great→poor). These are placement by another mechanism — the same class of thing **INV-82**
  removed from Act 7.
- **Combo/streak multipliers.** A multiplier makes the *next* mistake cost more than the last
  one. That is a compounding penalty aimed squarely at a child who is still learning.
- **Booing, muting, ejection.** [[karaoke-revolution]] boos; [[rock-band]] mutes you out of the
  mix in front of your friends. Wrong register, full stop.
- **"No fail" toggles that lower your rank** ([[beat-saber]]). If mercy is scored, it is not
  mercy.

---

## 9. Karaoke — the verdict Trevor asked for

**Question:** is scrolling-highlighted text genuinely the best reading-support fit in this
project, or is that a nice story the sources do not support?

**Answer, in three parts:**

**(a) The mechanic is real, it is old, and it predates karaoke by 47 years.** Max and Dave
Fleischer's **Song Car-Tunes** — 47 shorts between **1924 and 1927**, the first
(*"Come Take a Trip on My Airship"*) on **9 March 1924** — put song lyrics on screen with a
**bouncing ball tracking each word** so a whole theatre could sing together. That is the
scrolling highlight, in a cinema, before sound film was standard. [[karaoke-reading-support]].

**(b) The literacy evidence is real and institutionally endorsed — but it is filed under a
different name and it is about reading *along*, not about playing a game.** The research
tradition is **Same Language Subtitling (SLS)**: song lyrics subtitled in the same language as
the audio, with — in the specification's own words — text that **"should change colors in
syllabic synchronization to audio."** Developed by **Brij Kothari** at **IIM Ahmedabad** from
1996, piloted on Gujarati TV in 1999, national on Doordarshan from 2002. A **Nielsen-ORG study
(2002–2007)** reported schoolchildren's reading ability moving from **25% to 56%** with 30
minutes a week of subtitled song programming. Recognition is institutional and independent:
**World Bank Development Marketplace (2002)**, **USAID All Children Reading Grand Challenge
(2012)**, **Library of Congress International Literacy Prize (2013)**, Schwab/UNDP Social
Entrepreneur of the Year (2009), funding from **Google.org**.

**(c) The caveats, because this is the claim most likely to be over-told.**
- The **25% → 56%** figure reaches this document **through Wikipedia's summary of the
  Nielsen-ORG study**, which I could not fetch directly, and PlanetRead is the programme's own
  promoter. The *direction* of the finding is endorsed by three independent institutions; the
  *number* should not go on a child's history card without a primary read. **[unverified] at
  the numeric level.**
- **Negative finding, stated plainly:** an **ERIC** search for *"same language subtitling
  reading"* returned only interlingual/foreign-language-learning studies, and *"karaoke reading
  fluency"* returned a single, unrelated TESOL volume. **"Karaoke builds reading fluency" is
  NOT an ERIC-indexed classroom finding.** It is a mass-media/SLS finding. Do not upgrade it.
- **And the design caveat that decides the act:** karaoke's *input* is the voice, which this
  game cannot use and should not pretend to. What transfers is the **display**. A Keystroke
  Kingdom "karaoke cabinet" would be a screen where the words light up **as the child types
  them** — which is not karaoke, it is **assisted reading with a keyboard**. Name it honestly
  and it is excellent; call it karaoke and the first person to ask "where's the microphone?"
  is the six-year-old.

**Verdict: yes — with the noun corrected.** Scrolling, syllable-synchronised highlighted text
is the best reading-support artefact in the entire genre, and it is *the only part of the genre
whose value does not depend on a timing window at all*. It is a reading device, not a rhythm
device. Adopt the screen; leave the microphone, the crowd meter and the gold-record tiers in
2003.

---

## 10. The music dependency — scale it honestly before committing

**The gap.** `docs/ROADMAP.md` §1.4: *"Zero tracks integrated; audio is procedural WebAudio
only. Per-level Lyria prompt drafts already exist inline in `.claude/rules/levels.md`."* Every
other act in this game degrades gracefully without music. **A rhythm act does not exist without
it.** This is the first proposed feature whose core loop is blocked on §1.4.

**And it is bigger than "one track per level."** A rhythm act needs, at minimum:
1. **A track** (Lyria, per level — the existing plan).
2. **A beat-map / note chart** per track: a time-stamped list of events. Nobody in the genre
   ships music without one; [[stepmania]]'s editor and [[frets-on-fire]]'s community charts
   exist precisely because charting is separate, laborious work.
3. **A stable audio clock.** Browser audio latency varies by machine, browser and output
   device. Every serious rhythm game ships **calibration**: [[crypt-of-the-necrodancer]]
   advertises an expanded accuracy window *and* **autocalibration** "to reduce frustration."
   A call-and-response design (§8) mercifully needs far less of this than a note highway does —
   another argument for the older lineage.
4. **A decision about `Settings → Sound: OFF`.** ⚠️ It is a shipped, documented accessibility
   setting (`product.md` Settings table). A rhythm cabinet played silently is unplayable. This
   is a **product decision for Trevor** — options include a visual-only call-and-response mode
   (the machine flashes the phrase rather than playing it, which is literally how
   [[touch-me-atari]] worked), or excluding the act from the toggle with a warm explanation.
   **Flagged, not decided; no file outside `research/` touched.**

**What the genre's licensing history implies for us — and it is good news.**
- [[guitar-hero]] launched with **30 cover versions re-recorded by WaveGroup Sound** and only
  17 masters, because master recordings were not affordable or available to a new franchise.
  Masters only became the default at **World Tour (2008)**, at the peak of a billion-dollar
  business.
- **The Beatles: Rock Band** needed **17 months of negotiation**, plus **a further six months**
  for Apple Corps' lawyers to complete *"the complex agreements and paperwork over the
  copyrights, trademarks, and publishing issues,"* against a guaranteed royalty minimum of
  **$10 million** rising to **$40 million** on sales projections. Sony/ATV chairman Martin
  Bandier's assessment: *"not even comparable to anything that has been done before."*
- **Implication:** a father-and-daughter browser game cannot license a catalogue, and does not
  need to. **Original, generated music is not this project's compromise — it is the same path
  the genre's biggest hit took at launch, for the same reason.** Lyria is the plan, and the
  history says the plan is correct. Full detail: [[music-licensing-in-games]].
- One further caution: the boom's collapse ($1.47bn → $700m, 2008→2009; Activision shutting the
  Guitar Hero unit in February 2011) is usually told as a story about *too many sequels*, but
  the cost structure underneath it was **licensed music plus plastic peripherals**. The
  survivors carried neither.

---

## 11. Cabinet-collision check, and what to draw

Checked against `.claude/rules/levels.md`'s full 25-level assignment table: **no rhythm or music
game is assigned to any cabinet.** The act is clear. Two notes:

- **Atari** already owns Level 1 (Breakout) and Level 23 (Missile Command). **[[touch-me-atari]]
  is a clearly distinct game**, which the one-game-per-cabinet rule explicitly permits (the
  Pac-Man / Ms. Pac-Man precedent). Flag it for Trevor's eye anyway.
- **Konami** holds no assigned cabinet, so Beatmania / DDR / GuitarFreaks are all free.

**"Draw a real thing"** — the rule [[racing-games-by-era]] §17 established applies verbatim here,
and this genre makes it unusually easy to get wrong, because half these games are furniture and
half are plastic toys plugged into a television.

| Station | What to draw | Never draw |
|---|---|---|
| [[touch-me-atari]] | A **short arcade cabinet** with four large circular buttons | — (it is a genuine coin-op) |
| [[simon-electronic-game]] | The **round four-colour handheld toy**, on a shelf or a counter | An arcade cabinet. It never was one |
| [[dance-aerobics]] | An **NES + television + the Power Pad on the floor** ([[nes-hardware]], [[console-hardware-silhouettes]]) | A cabinet |
| [[beatmania]] | The real cabinet: **five zigzag piano-style keys + a turntable** | — |
| [[dance-dance-revolution]] | The real cabinet: neon frame, **illuminated translucent dance panels**, metal safety bar | — |
| [[guitarfreaks]] / [[taiko-no-tatsujin]] | Real cabinets (guitar controller; taiko drum + bachi sticks) | — |
| [[parappa-the-rapper]] / [[space-channel-5]] | **A PlayStation / Dreamcast and a television** | A coin-op |
| [[guitar-hero]] / [[rock-band]] / [[band-hero]] | **A console, a TV, and the plastic instruments on the floor** | A coin-op (Guitar Hero Arcade exists but is not these games) |
| [[karaoke-revolution]] / [[singstar]] | **A console, a TV, and a microphone on a stand** | — |
| [[frets-on-fire]] | **A computer and a keyboard held like a guitar** — which is the whole joke, and it is true | Any plastic instrument |

---

## 12. Corrections, and everything weakly sourced

### Corrections from this pass *(2026-09-13)*

1. **"PaRappa the Rapper invented the rhythm game" — popularizer, not inventor.** Wikipedia
   calls it *"the first true rhythm game,"* but **[[dance-aerobics]] (1987)** and
   **[[simon-electronic-game]] (1978)** both precede it, and Wikipedia's own music-video-game
   article names Simon *"the earliest example of a rhythm game."* Correct verb: PaRappa
   **set the template** the genre followed.
2. **"DDR started it" — no. Konami started it, with [[beatmania]], the year before.** Beatmania
   (10 December 1997) is the first Bemani game and the origin of the falling-note highway; DDR
   (26 September 1998) is the one that broke out.
3. **Guitar Hero's credits are routinely collapsed.** **Harmonix developed** it; **RedOctane
   published** it. (Harmonix's own current site does not list Guitar Hero at all — the
   trademark belongs to Activision, per Harmonix's own page footer.)
4. **Karaoke Revolution's credits are likewise split:** **Harmonix developed** the 2003–2007
   entries; **Konami published** all versions. Miscrediting it wholly to Konami is common.
5. **DDR's judgement words are not stable across versions.** The brief's *"GREAT/GOOD/BOO"* and
   `arcade-cabinets-by-era.md`'s *"Marvelous > Perfect > Great > Good > Miss"* both differ from
   the series article fetched today, which lists **Marvelous, Perfect, Great, Good, Almost,
   Miss**. **Which mixes used "Boo" versus "Almost" is [unverified]** — do not print a single
   canonical judgement list for DDR.
6. **Simon's inspiration date is contradictory in the sources.** Simon's article says Baer saw
   *Touch Me* in **1976**; *Touch Me*'s article says **1977**. Both fetched today. Say
   "the mid-1970s."
7. **"Rock Band has a No Fail mode"** is **thinly sourced.** The **Rock Band 3** article states
   *"a 'no-fail' option exists"*; the **Rock Band (series)** article does not mention one at
   all. Treat as probable, not established. By contrast **[[beat-saber]]'s** No Fail modifier is
   explicitly documented — *and it lowers your rank*, which is the more important fact.
8. **"Guitar Hero boos you off stage"** — the flavour is right, the wording is not sourced.
   What the article says is that if the Rock Meter drops too low *"the song will prematurely end
   in failure."* Do not print the booing line as a quotation.
9. **Rock Band 3's keyboard is not the precedent it appears to be.** It is a **25-key
   velocity-sensitive MIDI musical keyboard**, mapping **pitch to key**. It is not evidence
   that a QWERTY keyboard has ever been a rhythm-game instrument in its own right (§6).
10. **The touch-typing canon does NOT document rhythm-based instruction.** Wikipedia's
    *Touch typing* article, fetched this session, contains **no mention of rhythm, cadence,
    metronomes or music**. If anyone reaches for "typing classes always used metronomes" as
    the pedagogical justification for this act — **it is unsourced.** The justification has to
    come from the game's own design (`product.md` Level 3's call-and-response melody), not from
    an invented history of typing instruction. *(Filed deliberately: this is the exact shape of
    the "1979 pinball NOVICE/EXPERT switch" error.)*
11. **Band Hero's audience framing is a reviewer observation, not a publisher statement.** The
    article attributes "aimed at teenage girls" to **critics** noting the Taylor Swift
    inclusion and colour scheme; Activision said no such thing on the record. Attribute it
    correctly or leave it out.

### Unsourceable / weakly-sourced items
- **[unverified]** What [[dance-mat-typing]] kept from DDR and what it dropped — `bbc.co.uk`
  unfetchable, twice (§6d). Needs one manual human click.
- **[unverified]** The Nielsen-ORG 25%→56% SLS figure at the numeric level (§9c).
- **[unverified]** Whether "Boo" or "Almost" is DDR's canonical judgement word, and in which
  mixes (correction 5).
- **[single-source]** osu! and osu!mania: `osu.ppy.sh` returned **403**; the page rests on
  Wikipedia alone. Same for [[karaoke-revolution]], [[band-hero]], [[space-channel-5]],
  [[dance-aerobics]], and the *Elite Beat Agents* facts cited inside [[rhythm-on-a-keyboard]].
- **ESRB ratings were NOT checked this pass for any title here.** [[guitar-hero]],
  [[rock-band]] and [[band-hero]] ship licensed rock and pop lyrics and are the most likely to
  carry content descriptors. Per [[racing-games-by-era]] §16b's standing rule — **every ESRB
  citation must state the platform list shown on the record** — a ratings pass is a
  prerequisite before any of these three becomes child-facing content.
- **Dropped as unusable this session:** `arcade-museum.com` (403 all session),
  `mobygames.com` (403), `fandom.com` (402), `www.bbc.co.uk` (blocked),
  `osu.ppy.sh/wiki/...` (403), `museumofplay.org/games/guitar-hero/` (404),
  `museumofplay.org/games/simon/` (404), `worldvideogamehalloffame.org/games` (404),
  `eric.ed.gov` (resolved, but returned nothing supporting a karaoke-literacy claim — a real
  negative finding, recorded in §9c rather than hidden).

---

## 13. History-card candidates *(proposals only — `js/history-cards.js` NOT touched)*

Offered because three of these facts are unusually good and unusually kid-safe. Each is ≤160
characters, warm, and typeable-word-anchored. **Nothing here is built; a card-writing pass
would need to verify each moment word against the level's unlocked key set.**

| Moment word | Earliest level (to be re-derived) | Draft card text |
|---|---|---|
| `simon` | needs S, I, M, O, N → L11 at the earliest | "In 1978 Ralph Baer made a toy that played four notes and asked you to play them back. Simon was one of the first games made of music." |
| `ball` | needs B, A, L → L12 | "Before karaoke, cinemas showed the words to a song with a bouncing ball hopping along them. 1924. Everyone sang together." |
| `drum` | needs D, R, U, M → L11 | "Taiko no Tatsujin let you miss a note and the song kept playing anyway. The music never scolded you." |

*(Fact sources for all three are on their wiki pages. The Simon card deliberately says "one of
the first" rather than "the first" — see correction 1.)*

---

*Written by the arcade-historian, 2026-09-13. Every URL in the linked wiki pages was fetched
this session. The act's decision — whether to build it at all, and on which lineage — is
Trevor's; this document exists so that decision is made against evidence rather than against a
memory of how good Guitar Hero felt in 2006.*
