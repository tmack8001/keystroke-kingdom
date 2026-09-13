---
title: Music Licensing in Games
type: concept
tags: [video-game-history, rhythm-game, music, law, production, concept]
sources: 10
verified: 2026-09-13
---

Why the rhythm genre's biggest hits were built on **cover versions and original music** before they
were built on famous records, why a **17-month negotiation and a $10 million guaranteed minimum**
was the price of one catalogue, and why **a father-and-daughter browser game cannot license a song
and does not need to.** The concrete reason is structural, not budgetary: US copyright gives a
song **two separate copyrights** with two separate owners, and the one compulsory licence that
exists — the statutory mechanical licence of **17 U.S.C. § 115** — is *"for making and distributing
**phonorecords**,"* while § 101 defines phonorecords to exclude *"those accompanying a motion
picture or other audiovisual work."* **A video game is an audiovisual work.** So there is no
statutory rate to pay, no list price, no compulsory path — only a private negotiation with each
rights holder, for each song, for a term that ends. `docs/ROADMAP.md` §1.4 records **zero tracks
integrated** and a plan built on original Lyria material. **The genre's own history says that plan
is not a compromise; it is what the market leader did at launch.**

## In this game

**The one-line answer for Trevor:** *we are not making do with generated music because we can't
afford the Beatles — we are doing what Guitar Hero, Karaoke Revolution and Beat Saber each did on
day one, for the same reason, and we get to keep ours forever.*

### Four concrete blockers, in the order they'd stop us

1. **There is no price to pay.** Because § 115's compulsory licence reaches only phonorecords and a
   game's soundtrack is not one, the owner may simply say no, or name any number. Everything below
   is what "name any number" looked like when the buyer was Viacom.
2. **Two owners, not one.** The **musical work** (publisher) and the **sound recording**
   (label) are separate copyrights under § 101's definitions. A licence from one is not a licence
   from the other — which is why [[guitar-hero]] could ship **cover versions** (avoiding the record
   labels) and still needed the publishers.
   > ⚠️ **Inference, flagged as such, not legal advice:** the corollary — that re-recording a song
   > yourself avoids the *master* licence but not the *composition* licence — follows from the
   > structure of §§ 101/115 as read this session, but **no source fetched here states it in those
   > words.** Do not treat "just use covers" as a free path on this page's authority.
3. **The marquee price is in the millions.** *The Beatles: Rock Band* took **17 months** of
   negotiation, then **a further six months** of lawyers, against *"a guaranteed minimum of $10
   million and upwards of $40 million based on initial sales projections."* Sony/ATV's chairman
   called the arrangement *"not even comparable to anything that has been done before."*
4. **Licences end, and take the game with them.** *Guitar Hero Live*'s GHTV streamed **484 tracks**
   that a player could never own; when the service was shut down on **1 December 2018** the
   playable library **fell to the 42 songs on the disc.** A game meant to be opened by a
   nine-year-old who was five when it was built **cannot have an expiry date inside it.** This is
   the blocker that matters most here and the one that has nothing to do with money.

### What we get instead, and it is genuinely better

- **The music is ours, forever, in every territory, with no renewal.** No song ever disappears from
  Oona's copy.
- **A per-level original score is already the design** — `.claude/rules/levels.md` carries a Lyria
  prompt for every one of the 25 levels, written to each era's own sound. A licensed catalogue
  could not do that at any price: no 1976 hit sounds like `"single beeping tone, rhythmic and
  simple, like an early Atari."`
- **It removes a whole class of kid-safety risk.** Licensed pop carries lyrics, and
  `js/word-blocklist.json` plus `.claude/rules/security.md` rule 7 exist precisely because a child
  reads what is on screen. ([[karaoke-reading-support]]'s whole value proposition is *putting the
  words on screen* — which makes whose words they are a first-order decision.)
- **The precedent is not obscure.** [[beat-saber]] launched on original music written for it by
  Jaroslav Beck, added licensed packs only after it was a hit, and now lists **eight volumes of
  Original Soundtracks** beside them — four million copies sold on music the studio owned.

### ⚠️ The gap this page does NOT close

**Nothing here researches the rights position of AI-generated music.** Whether Lyria output can be
shipped in a distributed game, under what terms, and with what attribution, is **[unverified] and
was not investigated this pass.** It is a real question and it is the one blocking `ROADMAP` §1.4
in practice, not the licensing history above. **Flagged for a dedicated lane; no file outside
`research/` touched.**

## The facts

### 1. The legal structure (US), from the statute

- **17 U.S.C. § 101 — "Phonorecords"** are *"material objects in which sounds, **other than those
  accompanying a motion picture or other audiovisual work**, are fixed."*
- **§ 101 — "Audiovisual works"** are *"works that consist of a series of related images which are
  intrinsically intended to be shown by the use of machines… together with accompanying sounds, if
  any."*
- **§ 101 — "Sound recordings"** are *"works that result from the fixation of a series of musical,
  spoken, or other sounds, **but not including the sounds accompanying a motion picture or other
  audiovisual work**"* — establishing the composition/recording split and, again, carving
  audiovisual works out.
- **17 U.S.C. § 115** is titled *"Scope of exclusive rights in nondramatic musical works:
  Compulsory license for making and distributing **phonorecords**,"* and its licence runs to
  persons who *"make and distribute phonorecords of a nondramatic musical work"* where *"the
  primary purpose… is to distribute them to the public for private use."*
- **Putting those together:** the only compulsory, fixed-rate music licence in the statute does not
  reach game soundtracks. **Every song in every game is there because somebody negotiated for it.**
- **Corroborating negative from the regulator itself:** the U.S. Copyright Office publishes
  circulars on the compulsory phonorecord licence (73A), its digital counterpart (73B), and the
  composition/sound-recording distinction (56A) — and **none on synchronization**, because sync is
  a private market with nothing to administer. Its 2015 study *"Copyright and the Music
  Marketplace"* exists precisely because the framework is *"aging"*; the Register's summary of the
  situation was that *"both music creators and the innovators who support them are increasingly
  doing business in legal quicksand."*
- ⚠️ **Scope:** US law only, read from the statute and the Office's own pages. **Not legal advice,
  and not researched for any other jurisdiction.**

### 2. What that structure cost, in the genre's own numbers

| Case | What happened |
|---|---|
| **[[guitar-hero]] (2005)** | **47 playable songs**, *"most of which were cover versions"*, re-recorded by **WaveGroup Sound** — who had previously done the same for **[[beatmania]], [[dance-dance-revolution]] and [[karaoke-revolution]]** — with *"small changes to the guitar portions to make them more adaptable for gameplay."* Master recordings became a *"much larger range"* only at **Guitar Hero III**, and a full master setlist only at **World Tour (2008)** — at the peak of a billion-dollar business |
| **The Beatles: Rock Band (2009)** | **17 months** of discussions before the 30 October 2008 announcement; **six more months** of legal work over *"copyrights, trademarks, and publishing issues"*; **$10M guaranteed, up to $40M** on projections; 45 songs; Giles Martin's team using *"audio forensics software"* on the original Abbey Road masters because the 2009 remasters had no usable stems |
| **[[rock-band]], 2009–2010** | As the market fell from **$1.47 billion (2008) to $700 million (2009)**, *"Viacom sought to negotiate new deals with music publishers to **reduce the costs** of the Rock Band series' licensed music."* The market leader's response to a downturn was to attack its music bill |
| **Rock Band Network (2010–2018)** | The industry's own workaround: from **4 March 2010**, artists and labels could author and publish their own playable tracks, keeping **30% of sales** at $1–3 a song, through a **peer-review** process screening for *"playability, copyright violations and profanity."* Harmonix built it because they *"could not expand their authoring process"* otherwise. Regular DLC ended April 2013; the service closed September 2017 and the songs left the store in **February 2018** |
| **Guitar Hero Live / GHTV (2015–2018)** | FreeStyleGames went to **streaming specifically to loosen licensing constraints**, Spotify-style: **200 GHTV songs at launch** on top of 42 on disc, growing to **484**, none of them ever purchasable or ownable — access bought with earned "Plays," coins or "Hero Cash." **Shut down 1 December 2018**, leaving **42** |
| **[[beat-saber]] (2018–)** | The counter-example: original score by **Jaroslav Beck** at launch, licensed packs from **March 2019** onward, **8 volumes** of original soundtracks, **4 million+ copies** |

### 3. The pattern, stated once

**Licensed catalogues are rented, not bought — and the rent is the business model's largest
variable cost.** [[rhythm-games-by-era]] §4 tells the collapse as a story about too many sequels;
the cost structure underneath it was **licensed music plus plastic peripherals**, and *the
survivors carried neither* — [[just-dance]] (peripheral-free, 90M+ units) and
[[taiko-no-tatsujin]] (its own music, still running). **The genre's own history is an argument for
owning your soundtrack.**

## Corrections from citation pass *(2026-09-13)*

1. **⚠️ The hub's "30 covers + 17 masters" split could not be re-confirmed.**
   [[rhythm-games-by-era]] §4 and §10 both state *Guitar Hero* launched with **"30 covers
   (WaveGroup Sound) + 17 masters."* The *Guitar Hero* article fetched this session states **47
   playable songs**, that *"the majority of the songs on the main career mode set lists are
   covers"*, and — separately — that *"almost all of the unlockable bonus songs are songs performed
   by the original artist for the game."* **The 30/17 arithmetic is consistent with that structure
   but is not stated in the text read today. [unverified] at the numeric level** — say "47 songs,
   mostly covers in career mode, with the bonus tracks by the original artists" unless somebody
   re-sources the split. *(Hub not edited — not this lane's file.)*
2. **"Masters arrived at World Tour" needs one more step.** The hub says masters became the default
   at **World Tour (2008)**; the article adds an intermediate — **Guitar Hero III** already
   *"introduces a much larger range of original recordings"* before World Tour's all-masters
   setlist. The trend is gradual, not a switch.
3. **The Beatles negotiation is two numbers, not one.** The hub gives *"17 months of licensing
   talks"*; the article gives **17 months to the announcement plus a further six months** of legal
   work afterwards. Roughly **two years**, and the second half is the part that shows how much of
   the cost is lawyers rather than money.
4. **The Beatles game shipped 45 songs, not "a catalogue."** Worth saying out loud: two years and
   an eight-figure guarantee bought **45 tracks**.
5. **Streaming was pitched as a licensing solution and failed as a preservation one.** GHTV is
   usually remembered as a monetisation misstep; the fetched article states the *"more flexible"*
   rights position was the **design motive**. Both are true, and the second is the one this project
   should remember.

## Unsourceable / weakly-sourced items

- **[unverified]** The rights position of **AI-generated music (Lyria)** for a distributed game —
  **not researched this pass**, and the real blocker on `ROADMAP` §1.4.
- **[unverified]** Whether re-recording a song as a cover avoids only the master-use licence and
  not the composition licence (§In this game, blocker 2). **An inference from the statute, flagged
  in place, not sourced.**
- **[unverified]** *Guitar Hero*'s exact 30-covers/17-masters split (Correction 1).
- **[unverified]** Any non-US jurisdiction, any actual dollar figure for a small/indie sync
  licence, and any per-song rate anywhere. **No source located this session prices a single song**
  — the only figures available are the Beatles guarantee and Rock Band Network's $1–3 retail
  price, neither of which is a licence fee.
- **Dropped as unusable this session:** `copyright.gov/circs/circ73a.pdf`, `circ73b.pdf`,
  `circ56a.pdf` and the *Copyright and the Music Marketplace* report itself — **all PDFs, which
  this tooling cannot read**; the circulars are cited only through the Office's HTML index page,
  which is why the statutory text here comes from Cornell's HTML edition of the US Code.
  `copyright.gov/help/faq/faq-musical.html` returned **404**.
- **Sourcing conditions:** the session's **WebSearch budget was exhausted (200/200)** before this
  lane began; every URL below was reached by **direct WebFetch** and read this session. Nothing
  here is "search result only."

## See also

[[rhythm-games-by-era]] · [[rhythm-on-a-keyboard]] · [[karaoke-reading-support]] ·
[[guitar-hero]] · [[rock-band]] · [[band-hero]] · [[beat-saber]] · [[karaoke-revolution]] ·
[[singstar]] · [[just-dance]] · [[taiko-no-tatsujin]] · [[rocksmith]] ·
[[crypt-of-the-necrodancer]] · [[stepmania]] · [[frets-on-fire]] ·
`docs/ROADMAP.md` §1.4 · `.claude/rules/levels.md` (per-level Lyria prompts)

## References

1. [17 U.S. Code § 101 — Definitions (Cornell Legal Information Institute)](https://www.law.cornell.edu/uscode/text/17/101) — the statutory definitions this page turns on: **"phonorecords"** as objects in which sounds *"other than those accompanying a motion picture or other audiovisual work"* are fixed; **"audiovisual works"**; and **"sound recordings"**, likewise excluding sounds accompanying an audiovisual work — i.e. the composition/recording split and the audiovisual carve-out. **[fetched]**
2. [17 U.S. Code § 115 — Compulsory license for making and distributing phonorecords (Cornell LII)](https://www.law.cornell.edu/uscode/text/17/115) — the section heading and (a)(1) scope: the compulsory licence runs to making and distributing **phonorecords** of a nondramatic musical work where *"the primary purpose… is to distribute them to the public for private use."* The basis for "there is no statutory rate for a game soundtrack." **[fetched]**
3. [U.S. Copyright Office — Circulars index](https://www.copyright.gov/circs/) — primary regulator page listing Circular **73A** (compulsory phonorecord licence), **73B** (digital phonorecords), **56A** (musical compositions vs sound recordings) and **75** (the Licensing Section). Cited also for a **negative**: **no circular covers synchronization licensing**. **[fetched]** *(The circulars themselves are PDFs and were not readable by this tooling — see Unsourceable.)*
4. [U.S. Copyright Office — Music Licensing Study ("Copyright and the Music Marketplace", 5 February 2015)](https://www.copyright.gov/policy/musiclicensingstudy/) — the Office's own characterisation of an aging licensing framework and the Register's *"legal quicksand"* line; context for why the private sync market has no administered rate. **[fetched]** *(The 2015 report PDF itself is unread.)*
5. [The Beatles: Rock Band — Wikipedia](https://en.wikipedia.org/wiki/The_Beatles:_Rock_Band) — **17 months** of discussions before the 30 October 2008 announcement and **six further months** of legal work over *"copyrights, trademarks, and publishing issues"*; the parties (Apple Corps, Harmonix, MTV Games/Viacom, Sony/ATV, Eversheds); the *"guaranteed minimum of $10 million and upwards of $40 million based on initial sales projections"*; Martin Bandier's *"not even comparable to anything that has been done before"*; the use of the original Abbey Road masters with *"audio forensics software"*; and the 45-song setlist. **[fetched]**
6. [Guitar Hero — Wikipedia](https://en.wikipedia.org/wiki/Guitar_Hero) — **47 playable songs**, *"most of which were cover versions"*; **WaveGroup Sound** as the re-recording house, having previously worked on *Beatmania*, *Dance Dance Revolution* and *Karaoke Revolution*, with *"small changes to the guitar portions to make them more adaptable for gameplay"*; the shift to a *"much larger range of original recordings"* at Guitar Hero III and an all-masters setlist at **World Tour**; and that *"almost all of the unlockable bonus songs are songs performed by the original artist."* The source behind Corrections 1 and 2. **[fetched]**
7. [Rhythm game — Wikipedia](https://en.wikipedia.org/wiki/Rhythm_game) — the genre-level economics: sales falling from **$1.47 billion (2008) to $700 million (2009)**, and the licensing-cost sentence — *"Viacom sought to negotiate new deals with music publishers to reduce the costs of the Rock Band series' licensed music."* **[fetched]**
8. [Rock Band Network — Wikipedia](https://en.wikipedia.org/wiki/Rock_Band_Network) — the industry's own workaround for authoring and licensing cost: public launch **4 March 2010** (Xbox 360; PS3 22 April 2010), artists and labels self-publishing playable tracks at **$1–3** with **30% of sales** to the creator, a **peer-review** screen for *"playability, copyright violations and profanity,"* Harmonix's REAPER/Magma toolchain, and the wind-down — regular DLC ending April 2013, the service discontinued September 2017, songs removed **February 2018**. **[fetched]**
9. [Guitar Hero Live — Wikipedia](https://en.wikipedia.org/wiki/Guitar_Hero_Live) — **the preservation argument**: GHTV was designed as a streaming service in part to secure rights *"more flexibly,"* compared by its developers to Spotify and Pandora; **200 streamed songs at launch** plus 42 on disc, growing to **484**; players could never permanently own a song, paying instead with Plays, Coins or Hero Cash; and the **1 December 2018** shutdown that reduced the playable library **from 484 tracks to 42**. **[fetched]**
10. [Beat Saber — official site](https://beatsaber.com/) — the counter-example: **eight volumes of Original Soundtracks** alongside the later licensed packs (Monstercat, Coldplay, Metallica, Queen, Daft Punk, BTS and others) — a rhythm game that bootstrapped on music it owned. **[fetched]** *(Sales figures and the Jaroslav Beck commission are on [[beat-saber]].)*

*In-repo sources (read from the working tree 2026-09-13, not web citations): `docs/ROADMAP.md`
§1.4 lines 370–371 — verbatim, **"Zero tracks integrated; audio is procedural WebAudio only.
Per-level Lyria prompt drafts…"**; `.claude/rules/levels/act1.md` Level 1's Lyria prompt
(*"single beeping tone, rhythmic and simple, like an early Atari — no harmony, just pulse"*) as the
example of an era-specific brief no licensed catalogue could fill; `.claude/rules/security.md`
rule 7 and `js/word-blocklist.json` for the lyric-content risk. No file outside `research/` was
modified by this lane.*
