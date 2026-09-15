---
title: The Null-Modem Cable
type: concept
tags: [computing-history, hardware, networking, proposed-content]
sources: 6
verified: 2026-09-14
---

A null-modem cable is a real, correctly-named piece of hardware: an RS-232 serial
cable with its transmit and receive wires deliberately crossed, letting two computers
talk directly to each other with no modem and no phone line. It is genuinely
documented for two things: Amiga owners playing multiplayer games together in the
1980s–early 1990s, and MS-DOS's own built-in Interlnk file-transfer utility (1992
onward). **It is NOT the right component for a mid-1990s "two home PCs playing one
game together" scene** — a second citation pass (this one, plus a sibling lane's
independent research for [[console-hardware-silhouettes]]) both converge on the same
correction: that scene's honest hardware is a **10BASE2 ("thinnet") coaxial Ethernet
link**, a network card with a BNC connector in the back of each tower and a length of
coax strung between them. This page now documents both technologies and is explicit
about which belongs to which decade and which scene.

## In this game

**Not yet built.** This page was originally scoped as the candidate component for the
proposed "THE HARDWARE" wing's "two computers, one cable, no phone line" station —
**that scoping was wrong, and this pass corrects it rather than just adding a
citation.** [[console-hardware-silhouettes]] independently researched the same
station (its "Two PCs joined by a cable (1995)" section) and reached the same
conclusion from a different angle: the mid-90s two-PC LAN scene is a **10BASE2 coax +
BNC network card** link, not a null-modem serial cable. That page is now the correct
home for the 1995 station's drawing reference. **This page's own genuine, well-sourced
content — the Amiga multiplayer use and the MS-DOS Interlnk utility — belongs to an
earlier and different scene: two machines, a serial cable, no card and no network at
all, more improvised/bedroom than LAN-party.** If a station is built around *that*
scene instead (a plausible, distinct "THE HARDWARE" candidate — direct PC-to-PC file
transfer or an Amiga two-player link, rather than 1995 Doom-style LAN play), this page
is ready to support it. ⚠️ **Flag for the orchestrator:** `docs/specs/hardware-wing.md`
§0.3 lists "THE NULL-MODEM CABLE" as the 1995 two-PC-LAN station's component card —
that pointer should move to [[console-hardware-silhouettes]]'s 10BASE2 section (or
this page should be repurposed for the earlier/simpler serial-cable scene instead);
this agent does not have write access to `docs/specs/`.

## The facts

- **What it is, precisely.** Wikipedia's own article title and definition: *"Null
  modem is a communication method to directly connect two DTEs (computer, terminal,
  printer, etc.) using an RS-232 serial cable"* — the trick is that *"the transmit and
  receive lines are crosslinked,"* so each machine's "talk" wire plugs into the
  other's "listen" wire. No modem, no telephone line, no dial tone — just a cable
  between two serial ports.
- **It IS documented as a multiplayer-gaming method — on the Amiga.** The same
  Wikipedia article states directly: *"On the Amiga computer, a null modem connection
  was a common way of playing multiplayer games between two machines."* It further
  frames null-modem cables generally as *"a popular method for transferring data
  between the early personal computers from the 1980s to the early 1990s."* That
  1980s–early-1990s window is itself the key fact: it is **earlier** than, and
  distinct from, the mid-1990s PC-gaming LAN scene (Doom, 1993–95) a "THE HARDWARE"
  wing station would most likely want to depict.
- **It is ALSO documented as a genuine, mainstream MS-DOS utility, and this is new
  to this citation pass.** Microsoft's own **Interlnk**/**Intersvr** utilities shipped
  in **MS-DOS 6.0 (1992)** and IBM's PC DOS 5.02 — Wikipedia's Interlnk article states
  the software "Connects two computers via parallel or serial ports and enables the
  computers to share disks and printer ports," explicitly supporting "a null modem
  serial cable, 3-wire serial cable, or bidirectional parallel cable." A mirror of the
  actual MS-DOS 6.22 help text (infania.net, non-Wikipedia) gives the wiring directly:
  *"Make a serial cable with either a 9-pin or a 25-pin female connector on both ends.
  Three wires are required for data transmission: Ground-Ground, Transmit-Receive, and
  Receive-Transmit"* — the textbook null-modem crossed-wire pattern, applied to file
  transfer rather than gaming. This is a real, dated, well-documented household use of
  a null-modem cable on a DOS-era PC — just not a gaming one.
- **For DOS/PC gaming specifically (the "1995 PC gamer" case this page originally
  investigated), the better-sourced dominant technology is IPX, not null-modem.**
  Wikipedia's IPX/SPX article states IPX was *"the de facto standard for DOS-era
  multi-user network games,"* naming *Doom* and *Warcraft III* as examples of games
  built on it, and describes third-party tunneling tools (Kali) that let IPX-based
  games reach players over the early internet rather than only a physical LAN.
- **The specific mid-90s home-LAN hardware behind IPX play, now confirmed (this
  pass + [[console-hardware-silhouettes]]): 10BASE2 coax, not a serial cable.**
  Wikipedia's 10BASE2 article: *"10BASE2 uses thin coaxial cable terminated with BNC
  connectors... No hub is required as with 10BASE-T, so the hardware cost was
  minimal... ideal for a small network of two or three machines, perhaps in a home
  where easily concealed wiring was an advantage."* This is a **different kind of
  connection** from a null-modem cable in every physical respect — a network
  interface card in each machine (Wikipedia's Network interface controller article
  describes the period "combo card," carrying both a BNC connector for 10BASE2 and an
  8P8C/RJ45 jack for the newer 10BASE-T standard), a coaxial cable rather than a
  serial cable, and BNC T-connectors with 50 Ω terminator caps rather than DB9/DB25
  serial plugs. Wikipedia's Doom (1993 video game) article corroborates the cultural
  anchor without itself naming the cable type: *"Multiplayer was initially only
  playable over local networks,"* and *"within hours of Doom's release, university
  networks began banning Doom multiplayer games."*
- **So: is "null modem" the wrong term for a 1990s two-PC gaming scene?** For a
  **1995 Doom-era LAN scene, yes** — the sourced hardware is 10BASE2 coax + BNC network
  cards, documented on [[console-hardware-silhouettes]] in detail (its "Two PCs joined
  by a cable (1995)" section, including a "null-modem is the simpler, card-free
  alternative if the scene wants to feel more improvised" caveat of its own). For an
  **earlier (1980s–early-90s) two-machine link, or DOS file transfer via Interlnk, the
  term is accurate and well-documented** — this page's own two genuinely distinct,
  sourced uses (Amiga multiplayer gaming; MS-DOS Interlnk file/printer sharing).

## Card-ready facts

*(Recommended for the general serial-link concept — see the "In this game" flag above
before pairing either of these with a 1995 LAN-party scene, which now belongs to
[[console-hardware-silhouettes]]'s 10BASE2 coax station instead.)*

1. *"Before the internet, two friends could plug one cable straight between their two
   computers and play together — no phone call, no waiting."* — supports: Wikipedia
   Null modem [fetched] (Amiga multiplayer-gaming use, 1980s–early 1990s framing).
2. *"This cable had its wires crossed on purpose, so each computer's 'talk' wire
   plugged into the other's 'listen' wire."* — supports: Wikipedia Null modem
   [fetched] (direct "transmit and receive lines are crosslinked" quote); corroborated
   by the MS-DOS 6.22 Interlnk help text's wiring description [fetched].
3. *"Computers even had a built-in tool that let two of them share files and a
   printer over that same kind of cable — no network needed at all."* — supports:
   Wikipedia Interlnk [fetched] (MS-DOS 6.0, 1992) + the MS-DOS 6.22 help-text mirror
   [fetched].

## References

1. [Null modem — Wikipedia](https://en.wikipedia.org/wiki/Null_modem) — the RS-232
   direct-connection definition, crossed-wire mechanism, the Amiga multiplayer-gaming
   use, and the general 1980s–early-1990s PC-to-PC data-transfer framing. **[fetched]**
2. [IPX/SPX — Wikipedia](https://en.wikipedia.org/wiki/IPX/SPX) — "the de facto
   standard for DOS-era multi-user network games," naming *Doom* and *Warcraft III*;
   the Kali tunneling-software context distinguishing LAN-native IPX play from later
   internet play. Cited here specifically to draw the contrast with null-modem, not to
   support a null-modem claim. **[fetched]**
3. [10BASE2 — Wikipedia](https://en.wikipedia.org/wiki/10BASE2) — "thin coaxial
   cable terminated with BNC connectors," "no hub is required," "ideal for a small
   network of two or three machines, perhaps in a home" — the sourced correction for
   what a 1995 two-PC gaming link actually was. Same source [[console-hardware-silhouettes]]
   cites for its 10BASE2 station. **[fetched]**
4. [Doom (1993 video game) — Wikipedia](https://en.wikipedia.org/wiki/Doom_(1993_video_game)) —
   "Multiplayer was initially only playable over local networks"; university networks
   banning Doom multiplayer "within hours" of release — the cultural anchor for why
   two PCs got cabled together at all, without itself naming a cable type. **[fetched]**
5. [Interlnk — Wikipedia](https://en.wikipedia.org/wiki/Interlnk) — MS-DOS 6.0 (1992)
   and IBM PC DOS 5.02; supports "a null modem serial cable, 3-wire serial cable, or
   bidirectional parallel cable"; developed by Sewell Development Corporation
   (makers of FastLynx) and licensed to Microsoft/IBM. **[fetched]**
6. [MS-DOS 6.22 Help: INTERLNK — infania.net](https://www.infania.net/misc/dos622help/interlnk.html) —
   **non-Wikipedia**; a hobbyist-maintained mirror of Microsoft's own original MS-DOS
   help text, reproducing the exact serial-cable wiring instructions ("Ground-Ground,
   Transmit-Receive, and Receive-Transmit") — the null-modem crossed-wire pattern
   applied to a real, dated, mainstream DOS utility. **[fetched]**

## See also

[[dialup-modem]] — a different way two computers of the same era talked to each other
(over a phone line, rather than a direct cable) — the contrast worth drawing for a
child: cable vs. phone line, right next to each other vs. far apart.
[[console-hardware-silhouettes]] — now the correct home for the 1995 two-PC-LAN
drawing reference (10BASE2 coax + BNC network cards); its "Two PCs joined by a cable
(1995)" section documents the corrected station this page originally described.

## Corrections from citation pass (2026-09-14)

- **The page's core framing changed.** The previous session correctly declined to
  confirm null-modem as the 1990s PC-gaming LAN method and left the question open.
  This pass closes it: a sibling lane researching [[console-hardware-silhouettes]]
  independently reached the same conclusion (10BASE2 coax, not null-modem, is the
  1995 two-PC scene) via the 10BASE2/NIC/Doom sources now also cited here directly by
  this agent. The page's "In this game" section, summary, and card-ready facts were
  rewritten accordingly — not just re-cited. The RS-232/crossed-wire technical facts
  and the Amiga-gaming citation from the previous pass are unchanged and remain
  accurate; they are now correctly scoped to the 1980s–early-90s window and to DOS
  file transfer (Interlnk) rather than implied for 1990s PC LAN gaming.
- Added: the MS-DOS Interlnk utility (Wikipedia + a non-Wikipedia primary-text mirror)
  as a second, genuine, dated use of a null-modem cable — this closes the "only one
  confirmed use (Amiga gaming)" thinness the previous pass left open, with a use case
  that does NOT require reaching for the disputed Doom/PC-gaming claim.

## Unsourceable / weakly-sourced items

- **No source fetched this or the previous session ties "null modem" specifically to
  a named 1990s DOS PC *game* (Doom or otherwise).** DoomWiki.org (403) and Doom
  Fandom (402) remain unreachable via this tool; per the task brief, not retried this
  session. Wikipedia's own Doom article does not mention "null modem," "serial," or
  "modem." **Do not build a card that names Doom and "null modem" together** — the
  1995 LAN scene now correctly points to 10BASE2 coax networking instead
  ([[console-hardware-silhouettes]]).
- WebSearch was unavailable for most of this session (shared session budget
  exhausted); the sources added above came from direct WebFetch of URLs discovered via
  Wikipedia's own footnotes (Interlnk → infania.net) or supplied by a sibling lane's
  independent research (10BASE2, NIC, Doom). A follow-up pass with search available
  could still try an alternate path to DoomWiki/Doom Fandom, or the original DOS Doom
  README/manual, if a card specifically about Doom's setup menu is wanted later.
