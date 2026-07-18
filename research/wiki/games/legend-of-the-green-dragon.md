---
title: Legend of the Green Dragon (LoGD)
type: entity
tags: [computing-history, game, bbs, web-era, multiplayer, php]
sources: 4
verified: 2026-07-13
---

Legend of the Green Dragon (LoGD) is an open-source, browser-based (PHP/MySQL) remake
of and homage to [[legend-of-the-red-dragon|Legend of the Red Dragon]] (LORD) — begun
as Eric Stevens' personal project in early 2002 and first publicly released (version
0.9, to SourceForge) in March 2003 — carrying forward LORD's daily-turns Forest/Inn/
dragon loop into the web era under a name that literally is Trevor's "Green Dragon"
childhood memory.

## In this game

**This is the exact name match for Trevor's recalled "Green Dragon" game** — where
[[legend-of-the-red-dragon]] supplies the design lineage and mechanics (it predates
LoGD by 13 years and LoGD is explicitly built to imitate it), LoGD supplies the literal
title and the web/telnet-adjacent access path a mid-2000s kid could plausibly have
reached without a phone-line BBS account. It is the primary design reference — more
than LORD itself — for a possible Act 6 "Text Worlds" cabinet (see the Act 6 planning
memory and [[bbs-door-games]]): read a short situation paragraph, choose/type an
action, return to town, spend a daily allotment of turns, work toward the Dragon as a
long-arc goal. See downstream flags below for exactly what must be stripped before
anything kid-facing gets built from it — LoGD keeps (and in some places expands) LORD's
Violet-style marriage mechanic and its PvP.

## The facts

- **Origin, 2002, Eric Stevens ("MightyE"):** LoGD started as Stevens' personal project
  in early 2002, with help from close friends, as a PHP/MySQL web remake of Seth Able
  Robinson's Pascal-based BBS door game [[legend-of-the-red-dragon|LORD]] (1989).
- **First public release, March 2003:** version 0.9 was uploaded to SourceForge in
  March 2003 — the point at which the game became broadly available rather than a
  private project. (One MobyGames search snippet lists an earlier "October 2002"
  browser release date; this pass could not fetch MobyGames directly to confirm that
  earlier date against a primary source, so it is noted here as unconfirmed rather than
  asserted — see Unsourceable section. The March 2003 SourceForge date is the better-
  corroborated public-release milestone.)
- **JT Traub joins, late 2003:** JT Traub ("Kendaer") began assisting Stevens with the
  game's core development in late 2003, "correcting many design flaws" in the original
  build; the two share copyright on later versions.
- **Slashdot exposure, April 2003:** a Slashdot article, "Classic BBS 'Door Games'
  Reborn," drove significant new traffic to the project — not a front-page story, per
  Stevens' own account, but enough to matter.
- **DragonPrime, February 14, 2004:** an independent support forum called DragonPrime
  was founded (by community members "Strider" and "Talisman") to keep development
  public and address plagiarism problems that arose as third-party server operators
  began customizing and redistributing the code without credit. DragonPrime eventually
  became the de facto official home for the codebase and its 180+ community add-on
  modules (as of a 2006 snapshot).
- **License changed from GPL to Creative Commons:** versions 0.9.7 and earlier were
  GNU GPL; version 0.9.8 onward moved to a Creative Commons
  Attribution-NonCommercial-ShareAlike license, a change the project attributed to GPL
  being a poor fit for web-deployed (rather than distributed-binary) software.
- **Explicitly NOT authorized by LORD's own rights holders:** despite the shared "___
  of the ___ Dragon" naming and acknowledged homage, LoGD "is not written or authorized
  by the author or the current owners of Legend of the Red Dragon" — a fully independent
  fan remake, not an official port.
- **Core gameplay loop — a direct descendant of LORD's:** a limited allotment of Forest
  turns is issued on a recurring cycle (one secondary source specifies every 12 hours,
  i.e. a "day" twice as fast as LORD's real-24-hours clock); players fight random Forest
  monsters or other players' saved characters (PvP, with an opt-out available for
  players who prefer not to be attacked); progress toward character level 15 unlocks
  the ability to hunt and fight the Green Dragon itself, the game's climactic goal.
  New players land on a "beginners island with a helpful fairy" before the wider world
  opens up.
- **Character creation expanded beyond LORD:** LoGD added a gender choice (affecting
  level titles and marriage, not raw ability), a fantasy-race choice (human, elf,
  dwarf, storm giant, felyne, troll among documented options — mixing traditional
  fantasy races with invented ones), and specialization trees (Dark Arts, Mystical
  Powers, Thieving Skills) governing what a pool of "use points" can buy — a heavier
  character-building layer than LORD's simpler stat system.
- **Marriage mechanic inherited and generalized:** where LORD let male characters
  flirt with/marry a single fixed NPC (Violet the barmaid), LoGD generalized marriage
  into a broader in-game social system tied to its gender/race character options —
  still real, still needs the same strip treatment as LORD's Violet mechanic.
- **Explicitly framed by its own community as neither an MMORPG nor a MUD:** a 2006
  review calls out this exact distinction — LoGD is text-based and multiplayer but a
  turn-based, asynchronous, browser-refresh experience, not a real-time simultaneous
  world — the same [[bbs-door-games|door-game]] social texture LORD had, just moved
  from a phone-line BBS session to a web browser tab. This is the precise structural
  difference from [[mud]] that the whole research thread has been trying to pin down.
- **Long-running, still playable:** LoGD-derived servers (dragonprime.net /
  DragonPrime-Reborn-hosted code, plus independent installs) remain active decades
  later, with the codebase still receiving community maintenance (a 2019 "1.1.2
  DragonPrime Edition" release, and ongoing PHP/MySQL-version-compatibility work on
  GitHub as of this research pass) — corroborating the "still playable, community-run"
  half of the "dial-up-then-telnet-then-web" memory chain this whole research thread
  has been reconciling.

## References

1. [History · stephenKise/Legend-of-the-Green-Dragon Wiki (GitHub)](https://github.com/stephenKise/Legend-of-the-Green-Dragon/wiki/History) — Eric Stevens' 2002 origin, March 2003 SourceForge 0.9 release, JT Traub joining late 2003, April 2003 Slashdot exposure and Stevens' own quote about it, February 14 2004 DragonPrime founding and its plagiarism-driven origin, GPL→Creative Commons license change, "1.1.2 DragonPrime Edition" as final official release. **[fetched]**
2. [Legend of the Green Dragon — Walkthrough, Tips, Review (JayIsGames, March 17, 2006)](https://jayisgames.com/review/legend-of-the-green-dragon.php) — 12-hour turn cycle, Forest-fight mechanics, beginners-island onboarding, level-15 dragon-hunt goal, PvP with opt-out, explicit framing as "a free, browser based homage to, and extension of" LORD, and the "not an MMORPG, nor a MUD" distinction. **[fetched]**
3. [Legend of the Green Dragon — Academic Kids (Wikipedia-era mirror)](https://academickids.com/encyclopedia/index.php/Legend_of_the_Green_Dragon) — corroborates creator (Eric "MightyE" Stevens, copyright later shared with JT Traub), "WWW-based implementation and homage to" framing, GPL-to-Creative-Commons license timeline (0.9.7 and earlier GPL, 0.9.8+ CC BY-NC-SA), gender/race/specialization character-creation details. Treated as a secondary mirror of an older Wikipedia article rather than a live primary source. **[fetched]**
4. [Legend of the Green Dragon — Wikipedia](https://en.wikipedia.org/wiki/Legend_of_the_Green_Dragon) — corroborates the "entirely different game...not written or authorized by the author or current owners of Legend of the Red Dragon" framing and the open-source PHP/customizable-by-any-developer characterization; current live article is thin on creator names and exact dates, so those facts are sourced from refs 1–3 instead. **[fetched]**
5. Search-result summaries corroborating fantasy-race options (human/elf/dwarf/storm giant/felyne/troll), gender affecting only level titles and marriage, and DragonPrime's continuing role hosting the source and community modules — via [Muds Wiki (Fandom)](https://muds.fandom.com/wiki/Legend_of_the_Green_Dragon) and a beginner's-guide forum thread. *(search result only, not fetched — muds.fandom.com returned HTTP 402 on direct fetch attempt this session.)*

## Downstream design flags — One Rule / kid-safety strip-list

Same category of case as [[legend-of-the-red-dragon]], [[mud]], and [[mangband]] —
"keep the world, strip the content":

- **STRIP — marriage/romance mechanic.** LoGD generalized LORD's Violet-flirting into
  a broader gender-linked marriage system tied to character creation. Same verdict as
  LORD: not appropriate for a child-facing cabinet, and no equivalent is needed — the
  Inn/town can be a friendly rest stop with no romance system at all.
  **[fetched: ref 3 — gender/race/marriage mechanic]**
- **STRIP — PvP (attacking other players' characters).** LoGD explicitly supports
  fighting other players' saved characters, with only an opt-OUT (not opt-in) for
  avoiding it — confirming the same PvP-as-structural-genre-feature flag already
  raised for LORD and MAngband. Any Keystroke-Kingdom-facing cabinet drops
  player-vs-player entirely. **[fetched: ref 2]**
- **STRIP — any permadeath/reset-adjacent penalty**, per the same reasoning already
  logged on [[legend-of-the-red-dragon]] — no level-loss or "you failed, start over"
  mechanic in any form, even optional.
- **KEEP, REFRAME — "fight" → "capture."** Same precedent as LORD and [[mangband]]:
  Forest encounters become discover/meet/capture, never violent, never losable.
- **KEEP — the daily-turns structure**, reframed gently as "a fresh set of turns each
  visit" rather than a countdown or lockout.
- **KEEP — the Dragon as a long-arc, friendly end goal.** LoGD's own level-15
  "hunt the dragon" milestone is a clean structural fit for a capstone Act-6 moment —
  reframed the way Level 23's Missile Command was reframed defensive-only: the Dragon
  is met/befriended, never a fight that can be lost.
- **KEEP — the read-a-situation-then-choose-an-action loop**, adapted to typed short
  verb commands (matching Keystroke Kingdom's typing pedagogy) rather than LoGD's own
  click/menu-driven web UI — the same deliberate interaction-verb adaptation already
  logged on [[legend-of-the-red-dragon]] for LORD's lettered menus. LoGD's own
  character-creation richness (race/class flavor) is a nice-to-have for later, not a
  requirement — the Forest/Inn/Dragon loop is the load-bearing structure to recreate.
- **The literal name is the strongest asset here.** If Act 6 ever needs an in-universe
  name for its prose-world cabinet, "the Green Dragon" is both the historically precise
  reference AND the exact phrase from Trevor's own memory — worth preserving verbatim
  in any flavor text, unlike the generic-reference-only rule applied to [[mud]] and
  [[bbs-door-games]] (which caution against naming a *specific* real BBS or MUD brand
  for the *adult-content* families; LoGD is different — it's the childhood touchstone
  itself, not an adult space being sanitized down to genre-generic).

## Unsourceable / weakly-sourced items

- **The "October 2002" release date** appearing in a MobyGames search-result summary
  could not be verified this session — direct fetches of mobygames.com returned
  HTTP 403 (bot-blocked) for both the main game page and its credits page. It's
  plausible as an early private/beta milestone consistent with "Stevens started the
  project in early 2002," but the GitHub project wiki's own history page — the
  strongest source fetched this session — specifically frames March 2003 (SourceForge
  0.9) as the first *public* release, and that is the date used above. Flagging the
  discrepancy rather than silently picking one.
- **Exact scope of "180+ modules"** is dated to a 2006-09-15 snapshot cited in one
  search-result summary of the GitHub wiki page; not independently re-verified against
  a live module count this session.
- **muds.fandom.com and opensource.fandom.com** could not be directly fetched this
  session (HTTP 402 on both) — their content is reflected only where corroborated by
  a source that WAS fetched; nothing from them is cited as a sole source.

## See also

[[legend-of-the-red-dragon]] (the 1989 BBS original LoGD remakes) ·
[[bbs-door-games]] (the genre umbrella both games belong to) ·
[[mud]] (the sibling prose-multiplayer lineage, structurally distinct) ·
[[dialup-modem]] (the era's connection ritual, relevant to any framing scene) ·
[[ansi-escape-codes]] (the text-presentation technology both games' eras used)
