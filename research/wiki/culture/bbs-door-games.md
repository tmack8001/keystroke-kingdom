---
title: BBS Door Games
type: concept
tags: [computing-history, game-genre, bbs, dialup, multiplayer, ansi]
sources: 4
verified: 2026-07-13
---

A "door" is a program that runs *outside* a bulletin board system's own code but is
launched *through* it — the mechanism that let 1980s–90s dial-up BBSes offer games.
"Door games" were mostly text-mode, asynchronously multiplayer (players took turns
across different calls, not usually simultaneously), and shared BBS-wide state — high
score boards, in-game mail, other callers' characters — which is what gave them their
distinctive "other real people are in this world with me" feel, even though most
individual sessions were solo. [[legend-of-the-red-dragon]] is the best-known example;
this concept page is the genre umbrella. Distinct from [[mud]] (telnet-native,
simultaneous multiplayer from the start) and from single-player interactive fiction
([[zork]]).

## In this game

**The genre-level grounding for the "Green Dragon" memory.** Trevor's recollection —
a multiplayer, read-a-situation-and-choose-your-action text RPG with "GREEN DRAGON" in
the name, explicitly *not* a DikuMUD — matches the BBS door-game family far better than
the telnet-MUD family documented in [[mud]]. Doors ran on a *daily-turns* structure (a
fixed number of actions per real-world day, reset at midnight) rather than a MUD's
always-on simultaneous world; the "other people were there" feeling came from shared
scoreboards, mail, and PvP against other callers' saved characters, not necessarily
players online at the same moment. See [[legend-of-the-red-dragon]] for the specific
game and [[legend-of-the-green-dragon]] for its web-era descendant carrying the exact
name match. [[ansi-escape-codes]] and [[dialup-modem]] are the shared sensory/technical
grounding for any door-game-styled scene (ANSI color text, the connect ritual).

## The facts

- **A "door" is an interface, not a genre by itself:** a BBS door is "an interface
  between the BBS software and an external application," and also refers colloquially
  to the external application itself — a program that ran outside the main BBS
  software, launched by it, most commonly to add a game.
- **Origin conditions, 1978 onward:** the first BBS (CBBS, Ward Christensen and Randy
  Suess) went online February 16, 1978, on a 300-baud modem. Door games spread through
  the 1980s–90s as the dominant way ordinary dial-up callers experienced multiplayer
  gaming before mainstream internet access.
- **Mechanically distinctive from telnet MUDs:** door games were "sometimes multiplayer
  (though rarely simultaneously)" and "primarily textmode, feeding only the slimmest
  streams of data back and forth due to the narrow bandwidth modems provided." A caller
  dialed in, played their turns, and hung up — leaving traces (scores, mail, a
  PvP-attackable character) for the next caller to find, rather than sharing a live
  simultaneous session the way MUD1 did from 1980 onward (see [[mud]]).
- **Famous examples beyond Legend of the Red Dragon:** TradeWars 2002 (strategy),
  Solar Realms Elite (strategy), Operation: Overkill (dystopian RPG) — BBSes commonly
  published high-score boards and ran InterBBS leagues letting users on *different*
  BBSes compete in shared games.
- **ANSI art and color were the door game's visual signature** — see [[ansi-escape-codes]]
  for the standard itself; doors used "fonts, color, and emphasis" within a pure-text
  transport, the same technical constraint and toolkit BBS culture generally used.
- **The dial-up-to-telnet transition (reconciles a "telnet" memory with a "dial-up era"
  game):** BBSes peaked around 1995 as mainstream internet adoption began, but did not
  disappear — as dial-up phone lines became scarce and internet access became
  ubiquitous, BBSes adapted to the Telnet protocol for connections. Nearly 800 BBSes are
  listed as still active today (more than double the count around 2016), most reachable
  over Telnet rather than a literal phone line, and Legend of the Red Dragon specifically
  is named among the door games still actively played on today's telnet-accessible
  BBSes (Synchronet/Mystic-software boards). A person who remembers "dialing in with a
  modem" AND "reaching it over telnet" is very plausibly describing two different
  chapters of the same game's actual, real history — not a false memory.

## See also

[[early-graphical-mmorpgs-1990s]] — a separate research thread testing whether the
"similar to LORD but bigger" cue in a related childhood memory points toward a
commercial dial-up MMORPG (Kesmai/Neverwinter Nights/Meridian 59 lineage) rather than
a BBS door game or MUD; that page's "Timing relative to LORD" confirm-cue is grounded
in this page's BBS-to-telnet transition note.
[[ascii-overhead-world-conventions]] — cross-family movement comparison (2026-07-17).
[[cbbs-first-bbs-1978]] — the dedicated fact node for CBBS itself (date, founders,
the blizzard story), the origin point this whole genre grew from.

## Downstream design flags — kid-safety and the One Rule

- **PvP is structural to the genre**, not incidental — see [[legend-of-the-red-dragon]]'s
  own flag. Any door-game-inspired cabinet must drop attacking other players' characters
  entirely.
- **Daily-turn scarcity was a design feature (anti-grinding), not a punishment** — this
  part is actually *compatible* with the One Rule if reframed gently (e.g. "you get a
  fresh set of turns each visit," never "you've run out and must wait" as a hard stop)
  — no game code decision made here, just noting the mechanic isn't inherently hostile.
- **Kid-safety, generic reference only:** as with [[mud]], any in-game reference to
  "a door game" or "a BBS" should stay structural/generic (the daily-turn RPG loop, the
  scoreboard, the shared world) — never a specific real BBS's branding or community.

## References

1. [Door (bulletin board system) — Wikipedia](https://en.wikipedia.org/wiki/Door_(bulletin_board_system)) — definition of a door, dropfile/FOSSIL mechanism, named examples (TradeWars, LORD, Solar Realms Elite), InterBBS leagues and scoreboards. **[fetched]**
2. [BBS door game — Break Into Chat (BBS wiki)](https://breakintochat.com/wiki/BBS_door_game) — corroborates door games as multiplayer-but-rarely-simultaneous, textmode, narrow-bandwidth design, and situates them as pioneers of online multiplayer and early internet communities. *(search result only, not fetched)*
3. [Remember BBSes? Here's How You Can Visit One Today — How-To Geek](https://www.howtogeek.com/686600/remember-bbses-heres-how-you-can-visit-one-today/) — BBS origin (1978, Chicago), dial-up mechanics, the shift to Telnet as dial-up became scarce, ~800 active BBSes today, ANSI block graphics, Legend of the Red Dragon named among games still played today. **[fetched]**
4. [Re-Discovering The 'Lost Civilization' of Dial-Up BBS's — Slashdot](https://tech.slashdot.org/story/16/11/12/0415236/re-discovering-the-lost-civilization-of-dial-up-bbss) — corroborates the ongoing telnet-BBS revival community and door-game persistence into the 2010s–2020s. *(search result only, not fetched)*

## Unsourceable / weakly-sourced items

- The exact proportion of door-game sessions that were genuinely simultaneous vs.
  asynchronous varied by BBS software and era (multiline BBSes existed earlier than
  commonly assumed); no single source quantifies this precisely, so the page states it
  qualitatively ("rarely simultaneous," per Wikipedia) rather than with a number.
