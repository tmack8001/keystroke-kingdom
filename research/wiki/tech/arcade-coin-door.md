---
title: The Quarter and the Coin Door
type: entity
tags: [arcade-history, hardware, act-card, proposed-content]
sources: 6
verified: 2026-09-14
---

The coin door is the lockable steel panel below an arcade cabinet's control panel: two
coin slots, a coin-return chute, a red return button, the coin mechanisms that judge
whether your coin is real, and behind it all the cash box. Atari's own 1976 **Breakout**
service manual is unambiguous about the price of a game — the mechanisms *"accept
quarters only."* The door is also where the machine's consent lives: a switched-off
cabinet physically swings a wire across the coin path and pushes your quarter back out.

## In this game

**Not yet built.** Written for the **ACT 1 act-card** shelf in
`docs/specs/act-exclusive-cards.md` §5.5, whose theme is *the machine and the room, not
the games* — the things a child standing in a 1979 arcade could actually touch. The
arcade is Keystroke Kingdom's own setting and, as that spec measured, **zero of Act 1's
four existing level cards are about Act 1's era**. This is one of the four subjects meant
to fix that.

**Candidate moment words** (must be typeable with Level 15's closure — lowercase `a–z`
plus `;` `,` `.` `/`, per INV-123):

| Word | Legal? | Why |
|---|---|---|
| `quarter` | ✅ lowercase letters only | the price of a game, and the word the spec itself names as an example |
| `coin` | ✅ lowercase letters only | shorter; pairs with the title-screen `INSERT COIN` wink already in `transitions.md` |
| `slot` | ✅ lowercase letters only | third option if the first two collide |

None collides with the 60 spent card words listed in `docs/specs/hardware-wing.md` §5.4.6.

Note the tie-in already shipped: `.claude/rules/transitions.md` specifies a blinking
**INSERT COIN** on the title screen that *"does nothing… It's set dressing. Don't wire it
to anything."* This card is the story behind that dead button. Related:
[[attract-mode]] (the show the machine puts on to get the coin), [[arcade-marquee]],
[[arcade-control-panels]], [[breakout]], [[pong]].

## The facts

- **Where it is.** Atari's *Breakout* Operation, Maintenance and Service Manual: *"Two
  identical coin mechanisms also are mounted on the front of the cabinet, below the
  player controls. They accept quarters only and are connected so that either can
  initiate play."* The same manual: *"The cash box is located behind a locked access
  door to the coin mechanisms."* Atari's *Orbit* manual (1978) repeats the arrangement
  almost word for word: *"The coin mechanism on the front mid-portion of the game
  cabinet, below the control panel, initiates the play. The cash box is located behind a
  locked access door."*
- **Two slots, one game.** Both manuals describe **two** coin mechanisms per door, wired
  so either can start a game. (Cabinets of the era commonly ran two slots; a 2-player
  game could take a coin from each side.)
- **The price was the operator's to set, not the manufacturer's.** *Breakout*'s options
  list reads: *"Game Credits adjustable for either 1 credit/coin or 2 credits/coin."* So
  the quarter bought one game or two depending on the switch the arcade owner flipped.
- **The lock-out coil — the machine's "I am closed" sign.** From the *Orbit* manual:
  *"When AC power to the game has already been turned off, the lock-out coil is
  de-energized, causing the lock-out wires to move out far enough to divert coins to the
  return chute."* The converse, from Atari's *Tournament Table* manual: *"During the
  attract mode the microcomputer energizes the lock-out coil, causing the lock-out wires
  to retract far enough to allow genuine coins to reach the coin box."* A dead cabinet
  cannot take your money; a live one physically opens a path to the cash box.
- **Jams were expected and designed for.** *Orbit*: *"To remove jammed coins, and for
  maintenance cleaning, each magnet gate assembly can be hinged open without removing it
  from the door."* And, gloriously, *"The best method of cleaning a coin mechanism is by
  using hot or boiling water and a mild detergent."* On the player's side of the door,
  Wikipedia's Arcade cabinet article describes the red button everyone pressed: *"Very
  often, translucent red plastic buttons are placed in between the coin return and the
  coin slot. When they are pressed, a coin or token that has become jammed in the coin
  mechanism is returned to the player."*
- **The coin acceptor was there from the very first cabinet.** The Strong National Museum
  of Play's object record for **Computer Space** (Nutting Associates, 1971): *"It
  established the blueprint for nearly all coin-operated arcade video games that followed
  it: a cabinet, marquee, control panel, television monitor, audio speaker, circuit
  boards, power supply, and coin acceptor."*
- **The best coin-box story in the industry is institutionally sourced.** The Computer
  History Museum on the first *Pong* at Andy Capp's Tavern (1972): *"the machine had
  stopped working. When Alcorn was called in to check it, he found that the game hadn't
  failed — it was just so full of quarters that it couldn't accept any more."* CHM also
  describes the 1972 prototype itself as *"a square wooden cube covered with a faux
  woodgrain plastic layer, a screen, two knobs, and a coinbox."*
- **⚠️ What is NOT sourced: *why a quarter.*** No institutional or primary source located
  this session explains the choice of 25¢ over a nickel or a dime, or dates the industry
  moving to it. Every result offering an explanation was a hobbyist blog or a retailer
  page reasoning from plausibility. **The defensible claim is the observed fact — Atari's
  1976 manual says quarters only — not a causal story.** Do not write a "because" here.

## Card-ready facts

1. *"Atari's own repair manual for Breakout says the coin slots 'accept quarters only.'
   Not a nickel, not a dime. One silver quarter bought you a whole game."* (146 chars)
   — supports: Atari *Breakout* Operation, Maintenance and Service Manual, Internet
   Archive **[fetched]**, exact phrase *"They accept quarters only"*.
2. *"Switch an arcade machine off and a little wire swings across inside the coin door,
   pushing your quarter straight back out. A sleeping machine will not take your money."*
   (163 chars) — supports: Atari *Orbit* manual **[fetched]** (lock-out coil de-energized
   → *"divert coins to the return chute"*) + Atari *Tournament Table* manual **[fetched]**
   (the energized case, *"allow genuine coins to reach the coin box"*).
3. *"The very first Pong machine broke down in a bar in 1972. It had not broken at all —
   it was so completely stuffed with quarters that it could not swallow one more."*
   (159 chars) — supports: Computer History Museum, *50 Years of Fun With Pong*
   **[fetched]**, quoting the Andy Capp's Tavern call-out.
4. *"Behind the coin slot is a locked steel door, and behind that a cash box. The whole
   arcade ran on someone walking round with a key and a very heavy bucket."* (154 chars)
   — supports: *Breakout* manual **[fetched]** (*"The cash box is located behind a locked
   access door"*) + *Orbit* manual **[fetched]** (same sentence). ⚠️ *The "heavy bucket"
   half is colour, not a sourced claim — cut it if the card must be strictly literal.*

## References

1. [Arcade Game Manual: Breakout by Atari — Internet Archive](https://archive.org/stream/ArcadeGameManualBreakout/breakout_djvu.txt) —
   PRIMARY, the manufacturer's own service manual for the Level 1 cabinet: *"They accept
   quarters only"*, the locked cash-box door, the 1-or-2-credits-per-coin option, and the
   attract-mode description used on [[attract-mode]]. **[fetched]**
2. [Arcade Game Manual: Orbit by Atari — Internet Archive](https://archive.org/stream/ArcadeGameManualOrbit/orbit_djvu.txt) —
   PRIMARY: coin-door location and cash box, the coin-door assembly with two mechanisms,
   the lock-out coil and lock-out wires, hinged magnet gates, the boiling-water cleaning
   instruction. **[fetched]**
3. [Arcade Game Manual: Tournament Table by Atari — Internet Archive](https://archive.org/stream/ArcadeGameManualTournamenttable/tournamenttable_djvu.txt) —
   PRIMARY: the energized-lock-out-coil sentence, and the attract-mode definition that
   ties the coin door to [[attract-mode]]. **[fetched]**
4. [50 Years of Fun With Pong — Computer History Museum](https://computerhistory.org/blog/50-years-of-fun-with-pong/) —
   institutional: the Andy Capp's Tavern coin-box overflow, and the 1972 prototype
   described as a woodgrain cube with *"a screen, two knobs, and a coinbox."* **[fetched]**
5. [Computer Space — The Strong National Museum of Play](https://www.museumofplay.org/games/computer-space/) —
   institutional object record: the 1971 cabinet blueprint including the coin acceptor.
   **[fetched]**
6. [Arcade cabinet — Wikipedia](https://en.wikipedia.org/wiki/Arcade_cabinet) — the
   coin slots / coin returns / coin box arrangement below the control panel and the red
   translucent coin-return button. Used as one of several, never alone. **[fetched]**

## See also

[[attract-mode]] — what the machine did to earn the quarter.
[[arcade-marquee]] — the other thing bolted to the front of the box.
[[arcade-control-panels]] — the per-cabinet control descriptors, from the same class of
primary manual evidence.
[[breakout]] — Level 1's cabinet, and the source of the quarters-only line.
[[pong]] — the coin box that overflowed.

## Unsourceable / weakly-sourced items

- **Why 25¢.** See "The facts." Not sourced; not asserted anywhere on this page.
- **Whether *every* 1979 cabinet was a quarter.** The manuals establish it for specific
  Atari cabinets and the operator-adjustable credit switch shows the *price* was a local
  decision. A blanket "all arcade games cost a quarter" claim is not supported here.
- **Coin-comparator mechanics in detail** (diameter/thickness/weight gauntlets) appear
  only in retailer and hobbyist sources this session; the Atari manuals describe magnet
  gates and lock-out wires, which is what this page claims and nothing more.
