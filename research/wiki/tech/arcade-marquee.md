---
title: The Arcade Marquee
type: entity
tags: [arcade-history, hardware, act-card, proposed-content]
sources: 4
verified: 2026-09-14
---

The marquee is the lit sign across the top of an arcade cabinet, above the screen: the
game's name in colour, glowing, visible from the far end of a noisy room. Atari's own
service manuals call it the **attraction panel**, and they are precise about what is
behind it — a **standard fluorescent tube** in a reflector bracket, sitting *"in the upper
front of the cabinet directly above the TV monitor screen"*, with the artwork sandwiched
behind a **Plexiglas** shield. The same housing holds the cabinet's loudspeaker, so on
those machines the game's name and the game's noise came out of the same box over your
head.

## In this game

**Not yet built.** Written for the **ACT 1 act-card** shelf
(`docs/specs/act-exclusive-cards.md` §5.5) — *the machine and the room, not the games.*

**Candidate moment words** (Level 15 closure: lowercase `a–z` plus `;` `,` `.` `/`):

| Word | Legal? | Why |
|---|---|---|
| `marquee` | ✅ lowercase letters only | the spec names it as an example; the word itself is the lesson |
| `sign` | ✅ lowercase letters only | plainer fallback for an early reader |

Neither collides with the 60 spent card words (`docs/specs/hardware-wing.md` §5.4.6).

**Downstream note for cabinet art, not a request to change anything:**
`js/ui/cabinet-art.js` already draws marquees on the select-screen cabinets. If anyone
ever revisits the lighting, the sourced detail is a **single long fluorescent tube behind
Plexiglas**, not spotlights and not LEDs — a flat, even, slightly cool wash across the
whole panel. Related: [[arcade-coin-door]], [[attract-mode]], [[arcade-control-panels]].

## The facts

- **Atari's own name for it is "attraction panel."** The *Super Breakout* Operation,
  Maintenance and Service Manual refers to the *"attraction panel over the TV monitor
  screen"* when locating the cabinet's 8-ohm speaker.
- **What lights it.** Same manual: *"The fluorescent lamp, which consists of a standard
  fluorescent tube and a socket assembly mounted in a reflector bracket, is located in
  the upper front of the cabinet directly above the TV monitor screen."* Its parts
  catalogue lists a **"Fluorescent Light and Speaker Mount Assembly"** and a
  **"Fluorescent Light Assembly."**
- **The speaker lives up there too.** The removal procedure is titled **"LAMP/SPEAKER
  ASSEMBLY REMOVAL"** — *"1. Remove three button-head screws. 2. Remove Plexiglas
  retainer. 3. Remove Plexiglas shield. 4. Slide out lamp/speaker assembly."* Lamp and
  speaker are one serviceable unit on this cabinet. (Claimed for *Super Breakout*
  specifically; treat as characteristic of Atari cabinets of the period rather than a
  universal rule.)
- **Plexiglas, front and back.** The same manual notes separately that *"The TV monitor
  viewing screen is shielded by a Plexiglas® panel that also displays colorful
  graphics"* — i.e. the same material and the same trick (art on clear plastic) is used
  for the screen bezel as for the sign.
- **What it is for.** Wikipedia's Arcade cabinet article: *"A marquee, a sign above the
  monitor displaying the game's title."* … *"They are often brightly colored and
  backlit."*
- **It was there from the beginning.** The Strong National Museum of Play, on **Computer
  Space** (1971): *"It established the blueprint for nearly all coin-operated arcade
  video games that followed it: a cabinet, marquee, control panel, television monitor,
  audio speaker, circuit boards, power supply, and coin acceptor."* The marquee is one of
  the eight founding parts, named alongside the coin acceptor.
- **⚠️ Not established here: how the artwork was printed.** Screen-printing / silkscreen
  onto Plexiglas is the usual hobbyist account, and reproduction sellers describe
  sandwiching printed film between two sheets of plexi — but every source located this
  session for the *printing process* was a retailer, a forum post or a modern
  restoration blog. The manuals say only "Plexiglas." Do not write a printing method onto
  a card.

## Card-ready facts

1. *"The glowing sign on top of an arcade machine is the marquee. Behind the plastic is
   one long fluorescent tube — the same light as a classroom ceiling — left on all day."*
   (158 chars) — supports: Atari *Super Breakout* manual **[fetched]**, *"a standard
   fluorescent tube and a socket assembly mounted in a reflector bracket… directly above
   the TV monitor screen"*; Wikipedia Arcade cabinet **[fetched]**, *"often brightly
   colored and backlit."*
2. *"On some cabinets the loudspeaker was tucked up inside the marquee. The game's name
   and the game's noise came out of the very same box above your head."* (150 chars)
   — supports: Atari *Super Breakout* manual **[fetched]** — the 8-ohm speaker located at
   the *"attraction panel over the TV monitor screen"*, and the shared
   *"LAMP/SPEAKER ASSEMBLY."* ⚠️ *Single-cabinet evidence; the card's "some cabinets"
   hedge is doing real work — keep it.*
3. *"Computer Space, 1971, set the shape every arcade machine copied afterwards: a
   cabinet, a marquee, a control panel, a screen, a speaker, and a slot for your coin."*
   (161 chars) — supports: The Strong National Museum of Play, Computer Space object
   record **[fetched]**, quoted near-verbatim.
4. *"Atari did not call it a marquee. In their own repair manuals it is the attraction
   panel — a sign whose whole job was to pull you across a loud, dark room."* (152 chars)
   — supports: Atari *Super Breakout* manual **[fetched]** (*"attraction panel over the
   TV monitor screen"*) + Wikipedia **[fetched]** for the "marquee" name in general use.

## References

1. [Arcade Game Manual: Super Breakout by Atari — Internet Archive](https://archive.org/stream/ArcadeGameManualSuperbreakout/superbreakout_djvu.txt) —
   PRIMARY: *"attraction panel"*, the fluorescent tube in a reflector bracket above the
   monitor, the "Fluorescent Light and Speaker Mount Assembly" parts entries, the
   Plexiglas retainer/shield removal steps, and the Plexiglas screen bezel with graphics.
   **[fetched]**
2. [Computer Space — The Strong National Museum of Play](https://www.museumofplay.org/games/computer-space/) —
   institutional object record naming the marquee as one of the eight parts of the 1971
   blueprint. **[fetched]**
3. [Arcade cabinet — Wikipedia](https://en.wikipedia.org/wiki/Arcade_cabinet) — the
   marquee's definition and the "brightly colored and backlit" characterisation; one of
   several, never alone. **[fetched]**
4. [Arcade Game Manual: Breakout by Atari — Internet Archive](https://archive.org/stream/ArcadeGameManualBreakout/breakout_djvu.txt) —
   the sibling 1976 manual, cited on [[arcade-coin-door]] and [[attract-mode]]; used here
   only to establish that the same manual family is the evidence base. **[fetched]**

## See also

[[arcade-coin-door]] — the other bolted-on part of the cabinet a child could touch.
[[attract-mode]] — the marquee's moving counterpart: the screen advertising itself.
[[arcade-control-panels]] — per-cabinet control evidence from the same manual class.

## Unsourceable / weakly-sourced items

- **How marquee artwork was printed in the 1970s.** See "The facts." Only retailer and
  hobbyist sources; deliberately not claimed.
- **Whether every cabinet put the speaker in the marquee.** Evidenced for *Super
  Breakout* only. Other cabinets place speakers elsewhere; the card hedges accordingly.
- **Marquee dimensions or a standard size.** Not sourced this session.
