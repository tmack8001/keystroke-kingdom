---
title: MAngband
type: entity
tags: [computing-history, game-genre, ascii, multiplayer, terminal]
sources: 3
verified: 2026-07-13
---

MAngband ("Multiplayer Angband") was created by Keldon Jones in January 1997, forking
[[roguelike|Angband]] v2.7.9 into separate client/server code so multiple players could
explore the same ASCII dungeon simultaneously in real time — the strongest documented
match for "ASCII, overhead-grid, genuinely multiplayer, telnet/internet-reachable in
the 1990s." **Superseded as the confirmed answer to Trevor's specific memory** by
[[nethack]] (raw `telnet` access + public spectating), once Trevor confirmed the
detail "raw telnet, others watching/chatting" — MAngband requires its own client
rather than plain telnet (see "The facts" below), which does not match that detail
as cleanly. This page remains the correct reference for anything that specifically
needs *true* real-time multiplayer (shared dungeon state, PvP).

## In this game

**Archetype A candidate — the strongest.** Of everything researched for "ASCII
graphical, top-down like Zelda, multiplayer" (see [[roguelike]] and [[mud]] for the
comparison set), MAngband is the one game that is simultaneously: (1) true ASCII
character-grid display with the `@` player glyph and letter-monsters inherited
directly from Angband, (2) genuinely overhead/top-down — Angband's dungeon and town
maps are literal grids the player walks around on, same visual grammar as an overhead
Zelda map rendered in text, and (3) actually multiplayer in real time, not
single-player-with-spectators. It postdates 1990 (Angband's own creation) by seven
years, which matters for placing it correctly in a mid-to-late-90s dialup memory,
not an early-90s one. **Confirm-cue for whether this is really what's remembered:**
MAngband requires a dedicated client (not raw telnet — see "The facts" below), which
softens the "just telnet in" nostalgia beat; if the specific memory is "I just typed
`telnet address` and the game appeared," that points instead toward a MUD (see
[[mud]]) or a NetHack public server (see [[nethack]]). **Resolved 2026-07-13:**
Trevor confirmed the memory is raw telnet with others watching/chatting — that is
[[nethack]] via nethack.alt.org, not MAngband. This page stays the reference for
true real-time shared-dungeon multiplayer if that's ever specifically needed.

## The facts

- **January 1997:** Keldon Jones begins MAngband, splitting Angband's source into a
  server (dungeon generation, monster AI, world state) and a client (rendering,
  input) — the server runs continuously; players connect and disconnect freely.
  Jones maintained it through October 1998; Alex Dingle took over afterward.
- **Not raw telnet:** despite a common misconception, the MAngband client is not "a
  glorified telnet session" — it retains Angband's full interface (item queries,
  directional prompts, macros) and sends structured command packets rather than raw
  keystrokes over a text stream. A player needed the MAngband client software, not
  just a terminal emulator.
- **Descendant:** TomeNET forked MAngband around 2001 (originally "PernMAngband,"
  renamed after a cease-and-desist over the "Pern" name from Anne McCaffrey's estate)
  — outside this game's target 1990s window but confirms the lineage continued.
- **Permadeath and combat are structural, not incidental:** MAngband inherits
  Angband's core loop wholesale — dungeon delving, monster combat, character death
  ending that character permanently. This is the direct source of the One-Rule
  conflict flagged below.

## Downstream design flags — One Rule conflict

Keystroke Kingdom's One Rule ("the game should only ever stop a player's flow with
joy, never with punishment" — CLAUDE.md) is structurally incompatible with
roguelike/MUD permadeath and combat-loss mechanics as actually played. Any theme
drawing on this aesthetic must strip these conventions, the same way Level 23
reframed Missile Command as defensive-only (`.claude/rules/levels/act5.md`):
- **Permadeath** — character death ends the run entirely in Angband/MAngband/NetHack.
  A Keystroke Kingdom theme must have no death state at all, or a death that is
  purely a warm, replayable beat (matching the existing wrong-keypress design: no
  loss, ever).
- **Combat as the primary verb** — MAngband/Angband loops are "fight monsters, take
  damage, manage HP." A kid-facing theme should replace combat with a harmless,
  comic equivalent (matching Joust's and Missile Command's precedent of visually
  "fighting" nothing scary and never losing).
- **PvP ("fight over the loot")** — MAngband explicitly supports player-vs-player
  looting conflict. Any in-game reference must omit this entirely; it has no
  kid-safe equivalent and no design reason to include it.

## See also

[[early-graphical-mmorpgs-1990s]] — a separate, later research thread for a different
childhood memory (named clans/factions JOINED, early-EverQuest feel) that MAngband's
client-required, no-formal-guild-system profile does not match as well as the
commercial-service candidates researched there.

## References

1. [Angband (video game) — Wikipedia](https://en.wikipedia.org/wiki/Angband_(video_game)) — names MAngband (1997) as "a multiplayer variant" of Angband. **[fetched]**
2. [Roguelike — Wikipedia](https://en.wikipedia.org/wiki/Roguelike) — lists MAngband among the confirmed multiplayer roguelike derivatives, distinct from the single-player canon. **[fetched]**
3. MAngband history summary via live web search (Tangaria "History of multiplayer roguelikes," MAngband.org "People" page, RogueBasin MAngband entry) — Keldon Jones' January 1997 origin, client/server split, structured-packet architecture, party play and PvP looting. *(search result only, not fetched — roguebasin.com returned HTTP 403 to direct fetch this session; corroborated across three independent search-result summaries, so treated as reliable for the specific facts stated, but flagged here per the citation standard.)*
