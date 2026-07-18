---
title: NetHack
type: entity
tags: [computing-history, game-genre, ascii, terminal, telnet, multiplayer-adjacent]
sources: 7
verified: 2026-07-13
---

NetHack (first released July 28, 1987, by the newly formed NetHack DevTeam led by
Mike Stephenson) is the ASCII-rendered, turn-based, permadeath dungeon crawler
descended from Hack (1984) and, before that, Rogue (1980) — see [[roguelike]]. The
game itself is **single-player**, but its most famous public server,
**nethack.alt.org ("NAO")**, made it a communal, spectated, chat-adjacent experience
throughout the 1990s–2000s by letting anyone `telnet` or `ssh` in, play in a shared
terminal environment, and watch — live — everyone else's games in progress. This is
the strongest documented match for Trevor's memory: raw telnet access, an ASCII
overhead dungeon, and other people present — reconciled below as *single-player
game, multiplayer culture*.

## In this game

**The confirmed grounding reference for a possible Keystroke Kingdom "Act 6 — Text
Worlds" ASCII-overhead cabinet.** Where [[mangband]] and [[mud]] were candidate
reconstructions for a vague "ASCII, overhead, multiplayer, telnet" childhood memory,
NetHack-via-NAO is the specific, named thing Trevor identified: a raw `telnet`
connection to a public host running an ASCII overhead dungeon crawl, with other
people around it. Compare all three: MAngband is genuinely multiplayer but requires
its own client, not raw telnet ([[mangband]]); a MUD is prose-only, no picture
([[mud]]); NetHack via NAO is the one that is (1) reachable by literally typing
`telnet nethack.alt.org` into a terminal, (2) a true `@`-glyph overhead ASCII
dungeon map — the closest text-mode analog to an overhead [[legend-of-zelda|Zelda]]
map — and (3) surrounded by other real people, live, in the same shared server
environment. See "Single-player game, multiplayer culture" below for exactly how
that reconciles with a kid's memory of it as "multiplayer." Downstream One-Rule
flags (permadeath, combat) are below — the pattern mirrors [[mangband]]'s flags and
Level 23's defensive-only Missile Command precedent (`.claude/rules/levels/act5.md`).

## The facts

### Origin and lineage
- **1980 → 1984 → 1987:** Rogue (1980, Toy/Wichman, UC Santa Cruz) → Hack (1982,
  Jay Fenlason with Kenny Woodland, Mike Thome, and Jonathan Payne; a 1984-era
  rewrite by Andries Brouwer produced the widely-distributed Unix versions) →
  **NetHack, first released July 28, 1987**, by Mike Stephenson, who merged the
  scattered Hack variants and brought in Izchak Miller and Janet Walz, forming what
  became "the DevTeam" — named NetHack because their collaborative development work
  happened over the early Internet/Usenet, not because the game itself is
  multiplayer.
- **NetHack is explicitly single-player,** with permadeath: "expired characters
  cannot be revived." The player is rendered as `@`; monsters are letters (`d` for
  a dog, `D` for a dragon, etc.); items and terrain are other ASCII symbols. This is
  the exact overhead ASCII-grid visual grammar a Zelda-style top-down map would
  translate into text.
- **"The DevTeam thinks of everything" (TDTTOE):** a community-coined phrase (not
  official DevTeam branding) describing the game's reputation for having
  pre-programmed a specific response for almost any "clever" or improbable action a
  player tries — a running joke about the sheer depth of interaction-handling in the
  codebase, corroborated independently by the NetHack Wiki's own dedicated page on
  the phrase and by TV Tropes' "Developers' Foresight" trope (originally named after
  this exact phenomenon).
- **A core DevTeam formed with NetHack 3.0 in July 1989**, established a famously
  tight-lipped release culture, and continued maintaining the game for well over a
  decade between major public releases.

### nethack.alt.org (NAO) and the public-server phenomenon
- **nethack.alt.org, "NAO," is described by the NetHack Wiki/community as "the
  longest running nethack public server in the world"** and "one of the oldest
  NetHack public servers, and by far the most popular." Its login/game-management
  software (`dgamelaunch`) was originally written by M. Drew Streib; Pasi Kallinen
  has also been credited as a long-running administrator, and the server's own
  documentation confirms continuous operation at least since a 2010 migration to AWS
  infrastructure (relocated again to AWS us-east-1 in August 2015) — placing NAO's
  active lifespan solidly across the exact multi-decade window ("public server since
  around the early-2000s, still running today") that would cover a 1990s–2000s
  childhood telnet memory. *(An exact 2001 founding date could not be independently
  confirmed this session — see "Unsourceable" below; "longest-running, one of the
  oldest" is the strongly sourced claim actually made.)*
- **Connection is genuinely raw-terminal:** "just telnet nethack.alt.org (on normal
  port 23 or port 14321) or ssh nethack@alt.org" — no special client software
  required, matching the "I just typed telnet [address] and the game appeared"
  texture of the memory this research was commissioned to check. (This is the
  detail that most cleanly distinguishes NetHack/NAO from [[mangband]], which
  requires a dedicated client rather than raw telnet.)
- **Live spectating is a first-class, documented server feature:** "you can track
  and live-report your deaths, ascensions and in-game accomplishments, as well as
  spectate other players' games and let them spectate yours" — and separately, "every
  game is recorded, and available for live viewing by all." A player sitting at a
  terminal in the 1990s/2000s could watch a stranger's live dungeon run scroll by in
  real time, in the same shared server.
- **ttyrec recordings:** every game on NAO (and sibling server hardfought.org) is
  recorded as a `ttyrec` — a raw terminal-session recording, playable back later via
  a web interface — so the "someone was watching/recording" texture of the memory
  has a second, independent technical mechanism beyond live spectating.
- **Bones files — the closest thing to indirect multiplayer contact:** when a
  NetHack character dies on a level, that level has a chance of being saved as a
  "bones file" and reloaded later for a *different* player's game — complete with
  the ghost of the dead character and their leftover items. On a shared public
  server with many concurrent players, this means one player's death can literally
  become the next player's dungeon encounter — a real, if indirect and asynchronous,
  form of shared-world contact layered on top of a single-player ruleset.
- **Community/social layer around the server, corroborated by alt.org's own site:**
  public high-score lists, ascension-streak lists, an active IRC channel
  (`#nethack`) with bot-posted live announcements of deaths/ascensions/
  accomplishments, player profile/activity pages, and a community quote database —
  all of which made the *server*, not any single game session, a shared social
  space that people hung around, watched, and talked in.

### Single-player game, multiplayer culture — the reconciliation
NetHack's ruleset has no multiplayer mode: one player, one character, one dungeon
instance, permadeath ends that run alone. But **playing it on NAO was never a
solitary act** — you connected to a server other people were simultaneously
connected to, your game could be watched live by strangers (and you could watch
theirs), an IRC channel announced everyone's deaths and wins in real time, and dead
players' leftover dungeon levels turned up in other people's runs via bones files.
A kid remembering "we telnetted in and played this ASCII dungeon and other people
were there, watching and talking" is describing this server culture accurately —
the *game* was single-player; the *place* was communal. This is the single most
important fact to get right in any card or parent-facing note: don't say "NetHack is
multiplayer" (false), say "people played it together on public servers, watching
and chatting even though each person's dungeon was their own" (true and sourced).

### The terminal look
NAO-style play is plain monospace ASCII text in a terminal window — the raw `@`,
letters, and symbol characters described above — with optional ANSI color support
in the terminal client (see [[ansi-escape-codes]] for the standard and its BBS/MUD-
era adoption timeline). The access ritual — dialing or connecting out to a remote
telnet address, watching a login banner scroll by, then dropping into the game — is
the same texture as reaching a [[mud|MUD]] and is tied to the same
[[dialup-modem|dial-up access era]] for a kid who reached it over a home phone line
in the 1990s.

## Downstream design flags — One Rule conflict (highest priority)

**NetHack's core loop is built on exactly the two mechanics Keystroke Kingdom's One
Rule forbids** ("the game should only ever stop a player's flow with joy, never with
punishment" — CLAUDE.md): permadeath and monster combat. Any Act 6 ASCII-overhead
cabinet drawing on this reference must strip both, following the same precedent as
Level 23's defensive-only Missile Command reframe (`.claude/rules/levels/act5.md`)
and [[mangband]]'s flags:
- **Permadeath must not exist.** NetHack's death is total and final for that
  character — "expired characters cannot be revived." A kid-facing cabinet must have
  no death state, or a death that is a warm, instantly-replayable beat with zero
  loss (matching the existing wrong-keypress design: nothing is ever taken away).
- **Combat as the primary verb must be replaced.** NetHack's dungeon loop is
  fundamentally "encounter a monster letter, fight it, manage HP, maybe die." A
  kid-safe cabinet should replace this with a harmless, comic equivalent — walking
  the `@` around an overhead ASCII map, discovering rooms and letter-glyph
  "characters" that are friendly or silly rather than threatening, echoing Joust's
  and Missile Command's precedent of "fighting" nothing that can actually hurt you.
- **What's SAFE and worth keeping:** the `@`-glyph overhead exploration itself, the
  monospace ASCII-grid aesthetic, the sense of a shared server "place" (a glowing
  terminal others are also connected to), and even a gentle nod to spectating — a
  small "someone else is watching!" flourish is warm and true to the reference
  without needing any real risk mechanic behind it.
- **Kid-safety on the chat/community layer:** NAO's real community features (IRC
  channel, public quote database, forums) are general-audience geek-culture spaces,
  not adult-flagged the way [[mud]]'s research turned up for some 1990s commercial
  MUDs (Federation II's literal "Adult Space Fantasy" AOL branding) — no specific
  kid-safety red flag was found for NAO's culture in this pass. Even so, any in-game
  reference should stay generic and structural ("other players were there too,
  watching") rather than naming or depicting any real chat content, matching the
  same generic-reference rule already applied to [[mud]].

## Unsourceable / weakly-sourced items

- **NAO's exact founding year.** Community sources consistently call it "the
  longest running" and "one of the oldest" public NetHack servers, but no source
  fetched or found this session states a specific founding year (2001 was Trevor's
  best recollection going in; it could not be independently confirmed or refuted).
  Treat "operating continuously across the 1990s/2000s into the present, one of the
  very oldest public servers" as the sourced claim; do not cite a specific founding
  year in any card copy.
- Two candidate pages (nethackwiki.com's own "Game history" and "Nethack.alt.org"
  pages, and the NetHack Learning Environment arXiv PDF) returned HTTP 403/402 or
  unreadable binary content when fetched directly this session; their content was
  triangulated instead via WebSearch summaries plus the successfully-fetched
  Wikipedia and alt.org/tung.github.io pages. Flagged per the citation standard —
  not cited as if directly read.

## References

1. [NetHack — Wikipedia](https://en.wikipedia.org/wiki/NetHack) — July 28, 1987 first release, Mike Stephenson/Izchak Miller/Janet Walz forming the DevTeam, Hack→Rogue lineage, `@` player glyph and letter-monster ASCII convention, permadeath, "the DevTeam thinks of everything," and explicit confirmation that nethack.alt.org ("NAO") provides public Telnet/SSH/browser access. **[fetched]**
2. [alt.org — Public NetHack Server](https://www.alt.org/nethack/) — connection instructions (`telnet nethack.alt.org` port 23/14321, `ssh nethack@alt.org`), "every game is recorded, and available for live viewing by all," high-score/streak lists, IRC community channel, AWS migration history (2010, relocated 2015) confirming long continuous operation. **[fetched]**
3. [How to Play Online — NetHack 3.6.0 (tung.github.io)](https://tung.github.io/nethack-www/how-to-play-online.html) — telnet/ssh connection methods, explicit confirmation you can "spectate other players' games and let them spectate yours," IRC live announcements of deaths/ascensions, ttyrec recordings referenced. **[fetched]**
4. [Public server — NetHack Wiki](https://nethackwiki.com/wiki/Public_server) — describes NAO as one of the oldest and most popular public servers, connection method via Telnet client. *(search result only, not fetched — nethackwiki.com returned HTTP 403 to direct fetch this session)*
5. [The DevTeam Thinks Of Everything — Wikihack/Fandom](https://nethack.fandom.com/wiki/The_DevTeam_Thinks_Of_Everything) and corroborating [TV Tropes "Developers' Foresight"](https://tvtropes.org/pmwiki/pmwiki.php/DevelopersForesight/NetHack) — origin and meaning of the TDTTOE phrase, confirmed as community-coined rather than official DevTeam language. *(search result only, not fetched)*
6. [NetHack Bones Files Spoiler — steelypips.org](https://www.steelypips.org/nethack/341/bone-341.html) and [Bones — NetHack Wiki](https://nethackwiki.com/wiki/Bones) — mechanics of bones files: a dead character's level and ghost being saved and reloaded into a different player's later game. *(search result only, not fetched)*
7. [Nethack.alt.org — Wikihack/Fandom](https://nethack.fandom.com/wiki/Nethack.alt.org) and search-summarized corroboration — "the longest running nethack public server in the world," dgamelaunch software originally written by M. Drew Streib, Pasi Kallinen's long-running administration. *(search result only, not fetched — returned HTTP 402 to direct fetch this session)*
8. [Multi-user dungeon comparison — Wikipedia](https://en.wikipedia.org/wiki/Multi-user_dungeon) — background corroboration distinguishing telnet-reachable prose MUDs (inherently multiplayer) from NetHack's single-player-but-communal-server model; see [[mud]] for the full citation. **[fetched]** *(already verified on [[mud]])*

## See also

[[roguelike]] — the genre NetHack belongs to and its single-player-by-design
lineage. [[mangband]] — the genuinely multiplayer Angband fork, the alternative
candidate this page supersedes as the stronger match. [[mud]] — the prose-only,
inherently-multiplayer sibling archetype. [[ascii]] — the display technology.
[[ansi-escape-codes]] — optional terminal color. [[dialup-modem]] — the access
ritual for a home telnet session in the 1990s. [[early-graphical-mmorpgs-1990s]] —
a *different*, later research thread (clans/factions you joined, early-EverQuest
feel) that this page's raw-telnet/spectated-not-joined memory does NOT match — see
that page for the reconciliation between the two childhood memories.
