---
title: Legend of the Red Dragon (LORD)
type: entity
tags: [computing-history, game, bbs, dialup, multiplayer, ansi]
sources: 4
verified: 2026-07-13
---

Legend of the Red Dragon (LORD) is a text-based BBS door game written in Pascal by
Seth Able Robinson in 1989 — created as a teenager to attract more callers to his own
bulletin board system — and became, by wide agreement, the single most famous game
of the [[bbs-door-games|BBS door-game]] era. Its 2002 open-source web tribute,
[[legend-of-the-green-dragon|Legend of the Green Dragon]], carries the literal
"Green Dragon" name Trevor recalled.

## In this game

**The strongest grounded match for the recalled "Green Dragon" multiplayer
read-and-choose text RPG that was explicitly NOT a DikuMUD.** LORD's core loop —
travel to the Forest, look for something to kill, return to the Inn, spend a daily
allotment of turns, eventually challenge the Red Dragon — is a turn-based
read-a-paragraph-then-choose-a-lettered-action design, structurally different from a
[[mud]]'s live simultaneous room-to-room movement. The "other real people were there"
feeling came from a shared BBS-wide world: a scoreboard, in-game mail, other players'
saved characters you could fight or flirt with, not necessarily people online at the
exact same second. This is the design reference for a possible Act 6 "Text Worlds"
cabinet (see the Act 6 planning memory) — see downstream flags below for exactly what
must be stripped before anything kid-facing gets built from it.

## The facts

- **1989, Seth Able Robinson, age 14, Los Angeles:** wrote LORD in Pascal to run on
  his own Amiga-based BBS (Darkside BBS is the commonly cited name in secondary
  sources, though it was not confirmed on Robinson's own current FAQ page during this
  pass — see Unsourceable section). He built it because he lacked access to other
  door games (like TradeWars) and needed something that would bring callers back
  repeatedly.
- **The core gameplay loop:** players get a limited number of actions per real-world
  day (secondary sources cite roughly 25 forest fights within an in-game "45 minutes"
  clock). From the town, players can go to the Forest and "look for something to
  kill" (random encounters against level-appropriate monsters), visit the Inn (a
  chat-like space to exchange one-line messages with other players, an NPC bartender,
  and the barmaid Violet), fight other players' saved characters (PvP), or — once
  strong enough, around character Level 12 — challenge the Red Dragon itself. The
  combat formula is explicit and simple: damage = (strength/2 + random(strength/2)) −
  defense.
- **Violet and flirting:** male player characters can flirt with (and eventually
  "marry," a lightweight in-game status) Violet the barmaid at the Inn; female
  characters have an equivalent NPC, Seth Able the bard (named for Robinson himself).
  This is real, documented content and needs an explicit strip-list entry below.
- **Multiplayer via shared BBS state, not simultaneous session:** LORD "allows many
  players to play simultaneously" across a BBS's callers via in-game message boards,
  an email system, and real-time-feeling PvP — but a 2024 retrospective play-through
  characterizes the actual social texture accurately: "BBS door games were more like
  Facebook games: You play in your own bubble, and interactions with other players are
  extremely limited" — asynchronous traces of other people, not a live shared room.
- **ANSI presentation:** the original 1989 LORD was primarily a text-only interface;
  a 2024 retrospective describes the game's screens using "fonts, color, and emphasis"
  — full ANSI color-art presentation became more prominent in the LORD II sequel and
  later versions/ports. Either look (plain text or ANSI color) is documentably
  period-real depending on which release/BBS is being evoked.
- **Success and sale:** by 1993 many BBSs had active LORD player communities; Robinson
  sold LORD, its sequel, and his other door games to Metropolis Gameport in 1998
  alongside version 4.00a — he no longer owns the IP.
- **Still playable today:** LORD (and its variants) remain among the door games
  actively played on modern telnet-accessible BBSes, per [[bbs-door-games]] — this
  reconciles a "telnet, not literal phone dial-up" memory of playing it.

## References

1. [Legend of the Red Dragon — Wikipedia](https://en.wikipedia.org/wiki/Legend_of_the_Red_Dragon) — 1989 creation by Seth Robinson, Pascal, forest/PvP/dragon loop, Violet flirting mechanic, ANSI graphics in LORD II, multiplayer via message boards/email, 1998 sale to Metropolis Gameport. **[fetched]**
2. [LORD/BBS Frequently Asked Questions — RTSoft (Seth Robinson's own company site)](https://www.rtsoft.com/pages/lordfaq.php) — near-primary source: confirms 1989 creation, Pascal authorship, porting history (DOS/Worldgroup/Wildcat), 1998 sale to Metropolis Inc., and the explicit combat damage formula. **[fetched]**
3. [Game 508: Legend of the Red Dragon (1989) — The CRPG Addict](http://crpgaddict.blogspot.com/2024/04/game-508-legend-of-red-dragon-1989.html) — detailed retrospective play-through: ~25 forest fights/day within a 45-minute session clock, Level-12 dragon challenge timeline (~2 weeks), ANSI presentation detail, the "Facebook games" characterization of its actual social texture, Robinson's age (14) at creation. **[fetched]**
4. [Legend of the Red Dragon - FAQ (BBS Door) — GameFAQs, by Vaejas](https://gamefaqs.gamespot.com/bbs/574622-legend-of-the-red-dragon/faqs/1578) — corroborates the Forest-encounter structure, the "Slaughter other players" PvP option from the town square, and the three Inn NPCs (Seth Able the bard, Violet the barmaid, the Bartender). *(search result only, not fetched)*

## Downstream design flags — One Rule / kid-safety strip-list

Per the arcade-historian brief, this is a "keep the world, strip the content" case,
the same treatment already applied to [[mud]] and [[mangband]] and to Level 23's
Missile Command reframe:

- **STRIP — Violet/flirting/marriage mechanic.** Real, sourced, and entirely
  age-inappropriate for a child-facing cabinet. No equivalent needed; the Inn can
  simply be a friendly rest/shop stop with no romance system.
- **STRIP — PvP ("Slaughter" other players' characters).** No kid-safe equivalent
  exists; omit entirely, as already decided for [[mangband]] and [[mud]].
- **STRIP — permadeath-adjacent penalty:** a documented community house-rule punished
  players who stalled at Level 12 without fighting the dragon by resetting them to
  Level 1. Any level-reset/loss mechanic is a hard One Rule violation and must not
  appear in any form, even as an optional "hardcore" toggle.
- **KEEP, REFRAME — "fight" → "capture," matching the game's own existing precedent.**
  The request's proposed reframe (capture, not kill) has real design precedent already
  in Keystroke Kingdom: [[mangband]]'s downstream note calls this out, and Level 15's
  Pokémon cabinet is already a "capture, never kill" combat frame. The Forest's
  "look for something to kill" verb becomes something structurally identical but
  softened — discover/meet/capture a comic creature — never violent, never losing.
- **KEEP — the daily-turns structure**, reframed gently (a fresh set of turns each
  visit, never an anxious countdown or hard "you're locked out" wall).
- **KEEP — the Dragon as an end goal**, reframed the way Level 23's Missile Command was
  reframed defensive-only: never a fight that can be lost. The Dragon could be a
  friendly, giant, patient creature the player is working toward greeting/befriending
  rather than defeating — matching the "never punish, never even threaten" register the
  rest of the game already uses for its "monsters" (Joust's buzzards, Q*bert's Coily).
- **KEEP, ADAPT — read-a-paragraph-then-choose-an-action loop, but with TYPED
  commands, not LORD's lettered menu.** This is the specific fidelity call the request
  asked to flag explicitly:
  - LORD's actual UI was a **lettered menu** (press a single key — "F" for forest,
    "S" for slaughter, etc.) — not typed words. A byte-faithful recreation would keep
    that single-keystroke-menu structure.
  - Keystroke Kingdom's whole premise is TYPING, so a cabinet drawing on this lineage
    should have the player **type short verb/command words** (`go`, `fight`→`capture`,
    `talk`, `rest`) rather than press a single letter — this is a deliberate adaptation
    for the game's own pedagogy, not a faithfulness bug. It's the same kind of
    deliberate departure already normalized elsewhere in the curriculum (e.g. Level 23's
    Missile Command being made defensive-only): the world and its narrative beats are
    faithful; the interaction verb is adapted to what this specific game teaches.
  - This also cleanly distinguishes it from [[mud]]'s own typed-compass-direction
    convention (`north`, `attack dragon`) — if Act 6 ends up building both a
    door-game-style cabinet and a MUD-style cabinet, the door-game one should keep its
    own flavor (menu-like short verbs tied to specific locations: Forest/Inn/Dragon)
    rather than converging on identical mechanics to the MUD cabinet.

## See also

[[early-graphical-mmorpgs-1990s]] — the "similar to LORD but bigger" comparison
thread researched for a related childhood memory (named clans/factions, early-
EverQuest feel), ranking commercial dial-up MMORPG ancestors against this game.
[[ascii-overhead-world-conventions]] — cross-family movement comparison (2026-07-17)
contrasting this page's lettered-menu interface against roguelike/MUD/MegaZeux
movement schemes.

## Unsourceable / weakly-sourced items

- The specific BBS name "Darkside" (commonly repeated in fan/secondary sources as the
  BBS Robinson ran LORD on) did not appear on Robinson's own current RTSoft FAQ page
  fetched this session, nor did his exact age-14 claim appear there (it appears in the
  CRPG Addict retrospective and general web-search summaries instead) — flagged here
  as corroborated-but-not-primary rather than dropped, since two independent sources
  (Wikipedia's search summary and CRPG Addict) agree on it.
