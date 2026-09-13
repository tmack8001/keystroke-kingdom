---
title: Crypt of the NecroDancer
type: entity
tags: [video-game-history, game, rhythm-game, roguelike, game-design, accessibility]
sources: 4
verified: 2026-09-13
---

*Crypt of the NecroDancer* (Brace Yourself Games, early access **30 July 2014**, full release
**23 April 2015**) is a roguelike in which *"the player can only move their character or attack if
they perform the action on the beat of the music."* Two things make it the most important entry in
[[rhythm-games-by-era]] for a never-punish game, and neither is its dungeon. First, **missing the
beat does not hurt you** — it resets a scoring multiplier, which is the genre's gentlest
documented consequence. Second, and the reason this page exists: the game shipped **an official,
first-party way to play it with the rhythm switched off** — the **Bard** character from the start,
and a **"No Beat" mode for every character** added in **July 2022**. That is a rhythm game whose
own developers decided the rhythm should be optional, seven years after release. It is the closest
thing in the genre to a precedent for this project's entire architecture.

## In this game

### The precedent, stated precisely

[[rhythm-games-by-era]] §8 point 3 lists *"Crypt of the NecroDancer's Bard and No Beat mode"*
among the genre's escape hatches, and §7's ledger says *"keep No Beat as the default, not the
option."* **The evidence supports that recommendation and adds a date to it:**

- The **Bard** is documented as a character *"that doesn't require beat-matching"* — i.e. a
  shipped, named, playable way to experience the whole game untimed, present in the base game's
  cast of fifteen.
- **"No Beat" mode** — *"a 'No Beat' mode that allows players to use any character without needing
  to follow the beat (like the character Bard)"* — was **added in July 2022 via a major update**.
  The generalisation from *one character* to *every character* took seven years.

**Why that is the single most useful fact on this page:** it is a commercial rhythm game
conceding, in public and in a patch, that **the beat is the skin and the game is underneath it.**
Which is precisely the position `.claude/rules/theme-authoring.md` §"Mechanics fidelity" takes for
every cabinet here — *the scene shows the signature mechanic operating; the player's hands are
governed by the input contract.* A Keystroke Kingdom rhythm cabinet that plays untimed by default
is not a watered-down rhythm game; it is the configuration Brace Yourself Games eventually shipped.

### The other three transplants

1. **Punishment as multiplier-reset, never damage.** *"Failure to match the beat does not directly
   harm the character in most situations, but does reset the scoring multiplier."* **Take the
   inversion, leave the multiplier.** [[rhythm-games-by-era]] §8 rules out combo multipliers
   outright (a multiplier makes the *next* mistake cost more than the last — a compounding penalty
   aimed at a child still learning), so what transfers is the *principle* — a missed beat costs a
   bonus, not a life — expressed here as something even gentler than a bonus.
2. **Native keyboard play.** *"The player can manipulate their character by using either a dance
   pad, a keyboard, or a gamepad."* Its own store copy: *"Play with keyboard, controller, or even
   USB dance pad."* This is one of the very few rhythm games where the keyboard is a first-class
   input rather than an emulation of a plastic instrument ([[rhythm-on-a-keyboard]] §1) — though
   the keys are still **arrow-style movement buttons, not letters**, so the gap that page names
   stays open.
3. **Calibration as a kindness, with a stated motive.** Developer **Ryan Clark** *"greatly
   expanded the accuracy window"* and *"programmed a simple autocalibration system that recognized
   if the player was ahead or behind the beat."* [[rhythm-games-by-era]] §10 point 3 cites this as
   the reason a call-and-response design needs far less audio-clock engineering than a note
   highway does. It is also the right instinct in the wrong currency: **a widened window is still a
   window** ([[rhythm-games-by-era]] §5).

### Bring-your-own-music — the mechanic that solves §10 sideways

*"Groove to the epic Danny Baranowsky soundtrack, or **select songs from your own MP3
collection**."* The game beat-detects whatever you give it. **This is the answer to the music
dependency in [[rhythm-games-by-era]] §10 that nobody proposed**: if a cabinet's charts are
generated from audio rather than hand-authored, the per-track charting labour that
[[stepmania]]'s editor exists to absorb largely disappears. ⚠️ **Flagged as an idea, not a
recommendation** — it is a hard engineering problem, and for a child's game it would also mean
arbitrary audio (and arbitrary lyrics) entering a kid-safe product, which
`.claude/rules/security.md`'s content rules would have a great deal to say about. **Do not build
this without Trevor's decision.**

### ⚠️ What must not be taken

It is *"an award winning **hardcore** roguelike"* by its own store copy, with the genre's standard
furniture: dungeon combat, death, procedural runs. [[roguelike]] and [[nethack]] already carry this
project's standing One-Rule flags for permadeath and combat, and they apply here unchanged. **Take
the Bard and the No Beat switch; leave the crypt.**

**What to draw** (per the *"draw a real thing"* rule — [[racing-games-by-era]] §17,
[[console-hardware-silhouettes]]): **a computer with a keyboard**, or a computer **with a USB dance
pad on the floor beside it** — which is a genuinely charming and genuinely true image. Never a
coin-op; there has never been one.

## The facts

- **Developer:** Brace Yourself Games. **Publishers:** Brace Yourself Games and **Klei
  Entertainment** (PC); **Spike Chunsoft** for Japan.
- **Dates:** Steam Early Access **30 July 2014**; full release **23 April 2015** (Windows, macOS,
  Linux); PS4/Vita 2 February 2016; iOS 30 June 2016; Xbox One 10 February 2017; Nintendo Switch
  8 February 2018; Android 8 June 2021.
- **Core loop:** *"The player can only move their character or attack if they perform the action on
  the beat of the music"*, inside a procedurally generated roguelike dungeon. Store copy: *"Move on
  the beat to navigate an ever changing dungeon while battling dancing skeletons, zombies, dragons,
  and more."*
- **The consequence of a miss:** *"Failure to match the beat does not directly harm the character
  in most situations, but does reset the scoring multiplier and may cause the character to be
  damaged by a nearby monster if they are in their attack path."* The multiplier itself: *"killing
  successive enemies without taking damage or missing a beat increases a coin-scoring multiplier."*
- **Characters:** **fifteen** playable, per the store page — Cadence is the protagonist, Nocturna
  arrived with the *AMPLIFIED* DLC, and **the Bard is the one that does not require
  beat-matching**.
- **"No Beat" mode:** added **July 2022** in a major update; lets *any* character be played
  *"without needing to follow the beat (like the character Bard)."*
- **Input:** *"a dance pad, a keyboard, or a gamepad"*; the store lists *"keyboard, controller, or
  even USB dance pad."*
- **Accessibility:** Ryan Clark *"greatly expanded the accuracy window"* and added
  *"a simple autocalibration system that recognized if the player was ahead or behind the beat to
  some degree."*
- **Music:** original score by **Danny Baranowsky**, plus *"6 playable remixes of the entire
  soundtrack"* by FamilyJules, A_Rival, Chipzel, OCRemix, Girlfriend Records and Virt — and
  player-supplied MP3s. *(⚠️ The GOG listing advertises **2** remixes — FamilyJules7X metal and
  A_Rival EDM — against Steam's **6**. Both fetched today. The difference is almost certainly
  edition/era, not an error; say "multiple full-soundtrack remixes" unless you can pin the
  edition.)*

## Corrections from citation pass *(2026-09-13)*

1. **Confirms [[rhythm-games-by-era]] §7's NecroDancer row and its July 2022 date**, verbatim on
   all three clauses: the miss *"does not directly harm the character in most situations, but does
   reset the scoring multiplier"*; the Bard ignoring rhythm; **No Beat mode added July 2022**.
   Nothing to correct — upgrading from "reported" to "quoted."
2. **The Bard's mechanics are thinner in the sources than the recommendation resting on them.**
   Every source located says only that the Bard **does not require beat-matching**. **Nothing
   fetched this session states what the Bard does *instead*** — whether the game waits indefinitely
   for input (turn-based), or runs on a timer, or something else. The design claim this project
   wants to make ("a shipped rhythm game that waits") therefore rests on an inference. **Flagged
   [unverified]; do not write "the Bard waits forever" without a better source.**
3. **Publisher credit is routinely collapsed.** Brace Yourself Games developed and self-published;
   **Klei Entertainment co-published the PC release** and **Spike Chunsoft** handled Japan.
   "A Klei game" and "a Brace Yourself game" are both partially right.
4. **Created-vs-shipped, again.** [[rhythm-games-by-era]] §6 and §7 date it **2015**, which is the
   full release; **Early Access opened 30 July 2014**. Both are true of different things.
5. **Remix count differs between two official storefronts** (§The facts) — 6 on Steam, 2 on GOG.

## Unsourceable / weakly-sourced items

- **[unverified]** ⚠️ **What the Bard actually does in place of beat-matching** (Correction 2) —
  the single most load-bearing gap on this page for design purposes.
- **[unverified]** The exact version number and patch notes of the July 2022 "No Beat" update. The
  Steam **news RSS feed** was fetched and reaches back only to 2024 (its oldest visible item is
  v4.0.0 / SYNCHRONY); the update itself is out of range.
- **[single-source]** The Bard, No Beat, the miss-consequence wording, the input list and the
  autocalibration/accuracy-window facts all rest on **one Wikipedia article**. Four independent
  corroboration routes were attempted and failed or came up empty: `braceyourselfgames.com`
  (**403**, and `necrodancer.com` 301-redirects to it), `necrodancer.wiki.gg` (**401**), the Steam
  store page (**fetched** — confirms developer, publisher, date, composer, 15 characters, custom
  MP3s, and *"an award winning hardcore roguelike rhythm game"*, but says nothing about the Bard or
  No Beat), and the GOG listing (**fetched** — confirms *"Play with keyboard, controller, or even
  USB dance pad"* and the composer; nothing on Bard or No Beat).
- **[unverified]** Whether No Beat mode affects score, rank, achievements or leaderboards — the
  [[beat-saber]] question, unanswered here. **If it does, the "keep No Beat as the default"
  recommendation needs re-examining, because a scored mercy is not mercy.** This is the single
  best follow-up on this page.
- **Dropped as unusable this session:** `braceyourselfgames.com/crypt-of-the-necrodancer/`
  (**403**), `necrodancer.com` (**301** to the above), `necrodancer.wiki.gg/wiki/Bard` (**401**),
  `store.steampowered.com/news/app/247080` (resolved but rendered no article bodies to this
  tooling), `gamedeveloper.com/search?q=necrodancer` (resolved; **no design coverage of this game**
  — only a *Bullets Per Minute* AI piece).
- **Sourcing conditions:** the session's **WebSearch budget was exhausted (200/200)** before this
  lane began; every URL below was reached by **direct WebFetch** of a page or a feed and read this
  session. Nothing here is "search result only."

## See also

[[rhythm-games-by-era]] · [[rhythm-on-a-keyboard]] · [[call-and-response]] · [[beat-saber]] ·
[[rhythm-heaven]] · [[taiko-no-tatsujin]] · [[rocksmith]] · [[just-dance]] ·
[[dance-dance-revolution]] · [[stepmania]] · [[frets-on-fire]] · [[roguelike]] · [[nethack]] ·
[[error-feedback-pedagogy]] · [[console-hardware-silhouettes]] ·
`.claude/rules/theme-authoring.md` §Mechanics fidelity

## References

1. [Crypt of the NecroDancer — Wikipedia](https://en.wikipedia.org/wiki/Crypt_of_the_NecroDancer) — **the load-bearing source**: Brace Yourself Games with Klei and Spike Chunsoft; Early Access 30 July 2014 and full release 23 April 2015 plus the full platform/date list; *"the player can only move their character or attack if they perform the action on the beat of the music"*; the miss consequence verbatim (*"does not directly harm the character in most situations, but does reset the scoring multiplier"*) and the coin multiplier; **the Bard as the character that doesn't require beat-matching**; **"a 'No Beat' mode that allows players to use any character without needing to follow the beat (like the character Bard)" added in July 2022**; *"a dance pad, a keyboard, or a gamepad"*; and Ryan Clark's expanded accuracy window and autocalibration system. **[fetched]**
2. [Crypt of the NecroDancer — Steam store page (Brace Yourself Games' own description)](https://store.steampowered.com/app/247080/Crypt_of_the_NecroDancer/) — primary developer copy: *"Move on the beat to navigate an ever changing dungeon while battling dancing skeletons, zombies, dragons, and more"*; *"an award winning hardcore roguelike rhythm game"*; **15 playable characters**; *"select songs from your own MP3 collection"*; Danny Baranowsky's score plus six full-soundtrack remixes (FamilyJules, A_Rival, Chipzel, OCRemix, Girlfriend Records, Virt); publishers Brace Yourself Games and Klei; release 23 April 2015. **[fetched]** *(Negative finding recorded: the store page never mentions the Bard or No Beat mode.)*
3. [Crypt of the NecroDancer — GOG store page](https://www.gog.com/en/game/crypt_of_the_necrodancer) — independent storefront corroboration of the core description and, specifically, the input list: **"Play with keyboard, controller, or even USB dance pad"**; Danny Baranowsky's soundtrack and custom-MP3 support; *"A roguelike rhythm game! Move on the beat to navigate ever changing dungeons."* **[fetched]** *(Also the source of the remix-count discrepancy in Correction 5 — this listing advertises two remixes, Steam six.)*
4. [Crypt of the NecroDancer — Steam news feed (RSS)](https://store.steampowered.com/feeds/news/app/247080/?l=english) — fetched in an attempt to reach the July 2022 patch notes; cited for a **negative**: the feed's oldest retrievable item is the v4.0.0 / SYNCHRONY release, so the 2022 "No Beat" announcement is out of range and the update's version number and exact wording remain unverified. **[fetched]**
