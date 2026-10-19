---
title: Attract Mode
type: concept
tags: [arcade-history, act-card, proposed-content]
sources: 5
verified: 2026-09-14
---

Attract mode is what an arcade cabinet does when nobody is playing it: the machine runs
itself, on screen, to an empty room, hoping someone walks over. Atari's own service
manuals define it exactly — from *Tournament Table*: *"The attract mode begins when power
is applied to the game and ends when the proper amount of coins clear the coin acceptor,
or at the end of each game."* It is the oldest advertisement in video games, and it is
aimed at a passer-by rather than a player.

## In this game

**Not yet built.** Written for the **ACT 1 act-card** shelf
(`docs/specs/act-exclusive-cards.md` §5.5). Of the four Act 1 subjects, this is the one
with the most to teach: **a machine advertising to an empty room** is a concept a
five-year-old can hold and an adult has never once stopped to think about.

**Candidate moment words** (Level 15 closure: lowercase `a–z` plus `;` `,` `.` `/`):

| Word | Legal? | Why |
|---|---|---|
| `attract` | ✅ lowercase letters only | the spec names it as an example; it is the term of art |
| `demo` | ✅ lowercase letters only | the other period name (*"demo mode"*), shorter for an early reader |

Neither collides with the 60 spent card words (`docs/specs/hardware-wing.md` §5.4.6).

**The game already implements attract mode and says so.** `.claude/rules/transitions.md`
§Phase 2 describes the title screen as *"The attract screen — styled after the real 1979
arcade cabinet attract mode"*, with a blinking **INSERT COIN**. This card is the history
behind a thing the player has been looking at since the first second of the game.
Related: [[arcade-coin-door]] (attract mode literally ends when a coin clears the
acceptor), [[arcade-marquee]], [[breakout]].

## The facts

- **The definition, from the manufacturer.** Atari's *Tournament Table* manual: *"The
  attract mode begins when power is applied to the game and ends when the proper amount
  of coins clear the coin acceptor, or at the end of each game."* And: *"All controls
  (except GAME SELECT) and sounds are inactive during this mode."*
- **It has two triggers, and Atari enumerated them.** *Super Breakout*'s manual lists the
  mode as *"ATTRACT — When power is applied or as a result of a game ending with no
  further credits."* It then describes **two distinct versions**: the power-up one, in
  which *"the TV monitor displays each game sequentially, beginning with Cavity, for a
  short time"* — the cabinet cycling through its own menu of game variants unprompted —
  and a second version that *"occurs at the end of every game when there are no longer
  any credit"* and *"displays the last game's brick pattern (if any)."* The previous
  player's wreckage is left on screen as advertising.
- **It is a mime, not a game.** *Breakout* (1976), Atari's manual, on what its attract
  mode actually shows: *"In the attract mode, each time the ball hits against a brick it
  will rebound, but bricks will not disappear and the score numerals will not change."*
  And: *"No sounds are produced during the attract mode and neither 'start' push button
  will be lighted."* So Breakout's idle screen is a silent ghost game — a ball bouncing
  forever off bricks that never break.
- **The blinking text is part of the spec.** *Super Breakout*: *"In this attract mode
  version the last two player scores remain steadily displayed at the bottom of the TV
  monitor screen, whereas the coin/player credit phrase is displayed blinking."* The
  steady thing is the score; the blinking thing is the ask.
- **The coin door and attract mode are wired to each other.** *Tournament Table*: *"During
  the attract mode the microcomputer energizes the lock-out coil, causing the lock-out
  wires to retract far enough to allow genuine coins to reach the coin box."* Attract
  mode is not only a display state — it is the state in which the machine will accept
  money. See [[arcade-coin-door]].
- **Purpose, in the general reference.** Wikipedia's glossary entry: *"Originally built
  into arcade games, the main purpose of the attract mode is to entice passers-by to play
  the game. It usually displays the game's title screen, the game's story (if it has
  one), its high score list… and the message 'Game Over' or 'Insert Coin' over or in
  addition to a computer-controlled demonstration of gameplay."* It also records the
  alternative period names — *"advertise mode", "demo mode", "game over mode"* — and notes
  attract modes on pinball and other coin-op amusements, not only video games.
- **The high-score table is part of the pitch.** The same entry names the high score list
  as standard attract-mode content — which is the hinge to
  [[high-score-initials]]: the initials a player left behind are shown to strangers,
  repeatedly, all day.

## Card-ready facts

1. *"An arcade machine with nobody at it plays itself. It is called attract mode — the
   cabinet putting on a little show for an empty room, hoping somebody walks over."*
   (155 chars) — supports: Atari *Tournament Table* manual **[fetched]** (the definition)
   + Wikipedia glossary **[fetched]** (*"to entice passers-by to play the game"*).
2. *"In Breakout's attract mode the ball bounces off the bricks but never breaks one, and
   the machine stays completely silent. It is only pretending to play."* (150 chars)
   — supports: Atari *Breakout* manual **[fetched]**, *"bricks will not disappear and the
   score numerals will not change"* and *"No sounds are produced during the attract
   mode."*
3. *"Attract mode starts the second the machine is switched on and stops the second a
   coin clears the slot. Watching was always free. Playing was a quarter."* (150 chars)
   — supports: Atari *Tournament Table* manual **[fetched]** (*"begins when power is
   applied… ends when the proper amount of coins clear the coin acceptor"*) + Atari
   *Breakout* manual **[fetched]** (*"They accept quarters only"*).
4. *"One number sat still on the attract screen and one blinked. The still one was the
   high score. The blinking one asked you for a coin."* (134 chars) — supports: Atari
   *Super Breakout* manual **[fetched]**, *"the last two player scores remain steadily
   displayed… whereas the coin/player credit phrase is displayed blinking."*
   ⚠️ *Precision note: the steady figure in that quote is the last two PLAYER scores, not
   strictly the high score. If a card must be exact, use "the last score" rather than
   "the high score."*

## References

1. [Arcade Game Manual: Tournament Table by Atari — Internet Archive](https://archive.org/stream/ArcadeGameManualTournamenttable/tournamenttable_djvu.txt) —
   PRIMARY: the attract-mode definition sentence, the inactive-controls clause, and the
   lock-out coil tie to the coin door. **[fetched]**
2. [Arcade Game Manual: Breakout by Atari — Internet Archive](https://archive.org/stream/ArcadeGameManualBreakout/breakout_djvu.txt) —
   PRIMARY, and the Level 1 cabinet: the silent, non-breaking ghost game and the unlit
   start buttons. **[fetched]**
3. [Arcade Game Manual: Super Breakout by Atari — Internet Archive](https://archive.org/stream/ArcadeGameManualSuperbreakout/superbreakout_djvu.txt) —
   PRIMARY: the two enumerated attract-mode versions, the game-variant cycling, the
   leftover brick pattern, and the steady-vs-blinking display rule. **[fetched]**
4. [Attract mode — Wikipedia (Glossary of video game terms)](https://en.wikipedia.org/wiki/Attract_mode) —
   the purpose, the alternative period names, the standard contents (title, story, high
   score list, "Insert Coin"), and the extension to pinball and other coin-op machines.
   One of several, never alone. *(search result only, not fetched — the redirect target
   `Glossary of video game terms` was surfaced by search with the quoted text above; the
   specific page was not opened this session.)*
5. [Computer Space — The Strong National Museum of Play](https://www.museumofplay.org/games/computer-space/) —
   institutional; establishes the 1971 cabinet blueprint this behaviour rides on.
   **[fetched]**

## See also

[[arcade-coin-door]] — attract mode is the state in which the machine will take a coin.
[[arcade-marquee]] — the static advertisement; attract mode is the moving one.
[[high-score-initials]] — whose initials are being shown, all day, to strangers.
[[breakout]] — Level 1's cabinet and this page's best primary evidence.

## Unsourceable / weakly-sourced items

- **Who coined the term "attract mode," and when.** Not sourced. The Atari manuals of
  1976–78 already use it as settled vocabulary requiring no explanation, which dates its
  currency but not its origin.
- **Whether attract mode came to video games from pinball.** Plausible and widely
  repeated; no source located this session establishes the lineage. Wikipedia's glossary
  notes only that pinball machines *also* have attract modes, which is not a claim about
  which came first. **Do not write "it came from pinball" onto a card.**
- Reference 4 is search-result-only. Every substantive claim on this page is carried by
  at least one fetched primary manual; the Wikipedia entry supplies only the general
  "purpose" framing and the alternative names.
