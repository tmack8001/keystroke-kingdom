---
title: The Apollo Guidance Computer and its DSKY
type: entity
tags: [computing-history, nasa, apollo, keyboard, space-act, history-card]
sources: 4
verified: 2026-09-12
---

The **DSKY** (Display and Keyboard, pronounced "dis-key") was how Apollo astronauts talked to the
Apollo Guidance Computer. It was a **numeric keyboard** with a row of status lights and lighted
number displays, designed by **Raytheon**, and astronauts operated it by keying two-number
**"verb–noun"** commands — a verb saying what to do, a noun saying what to do it to. *Display
velocity* was something you **typed**. Astronauts went to the Moon by typing at a machine.

## In this game

**This is the literal ancestor of the flight/space act's whole thesis** — see
[[keyboard-as-cockpit]]. Keystroke Kingdom's spine is "typing unlocks computing"; the DSKY is the
moment in real history where typing at a computer is the only way a human can reach the machine
flying them. A child who has spent twenty-five levels learning that keys make things happen can be
told, truthfully: *the people who landed on the Moon did it by typing numbers into a little
keyboard, and it worked.*

Connects the space act into the game's existing computing-history card layer rather than sitting
beside it: [[margaret-hamilton]] · [[apollo-11-moon-landing-1969]] · [[human-computers]] ·
[[grace-hopper]] · [[ada-lovelace]] · [[eniac]].

## The facts

- **What it was:** the DSKY was the primary interface between Apollo astronauts and the computers
  aboard both the **Command Module** and the **Lunar Module**. It consisted of a simple
  **numerical keyboard**, a row of status lights, and a set of lighted numerical indicators.
- **Who built it:** the DSKY was **designed by the Raytheon Corporation**. The guidance system as
  a whole was developed under a **1961 NASA contract with the MIT Instrumentation Laboratory**.
- **How it was operated:** astronauts instructed the computer by **keying in numerical codes in a
  "verb–noun" sequence** — e.g. "display velocity."
- **How many:** a **Command Module carried two DSKYs** (one on the main control panel, one in the
  lower navigation bay); the **Lunar Module carried one**, identical.
- **The software behind it:** the flight programs were written by a team at MIT led by
  [[margaret-hamilton]], whose *"concepts of asynchronous software, priority scheduling,
  end-to-end testing, and man-in-the-loop decision capability… became the foundation for
  ultra-reliable software design"* (NASA's own words). During the Apollo 11 descent that design
  did its job: roughly **three minutes before touchdown, the software overrode a command** that
  would have given processing priority to a radar system, and the landing continued. NASA's public
  Apollo 11 account describes the moment plainly: *"During the final seconds of descent, Eagle's
  computer is sounding alarms"* — *"a simple case of the computer trying to do too many things at
  once."*
- **Precision note.** The famous alarm codes (**1201 / 1202**) and the exact seconds-of-fuel-
  remaining figure are **not** stated in the NASA pages fetched here; secondary sites give
  wildly inconsistent fuel numbers (25s, 30s, 45s). **Do not put an alarm code or a fuel figure on
  a child-facing card** — the sourced, sufficient version is "the computer was overloaded, and the
  software was written to keep the important jobs running."

## References

1. [Keyboard, Display (DSKY), Apollo Guidance Computer — Smithsonian National Air and Space Museum (object nasm_A19760744000)](https://airandspace.si.edu/collection-objects/keyboard-display-dsky-apollo-guidance-computer/nasm_A19760744000) — institutional object record: DSKY as primary astronaut–computer interface on Command and Lunar Modules; Raytheon design; simple numerical keyboard, status lights, lighted numerical indicators; astronauts keying numerical codes in a "verb–noun" sequence; two DSKYs in the CM, one in the LM. *(**HTTP 403 to automated fetch** — description above is the museum's own indexed record text as surfaced in live search; treat the wording as the museum's, the fetch as unverified)*
2. [Keyboard, Display (DSKY), Apollo, Block II — Smithsonian National Air and Space Museum (object nasm_A19720316000)](https://airandspace.si.edu/collection-objects/keyboard-display-dsky-apollo-block-ii/nasm_A19720316000) — a second institutional object record for the same hardware family, corroborating the museum holds multiple DSKY specimens. *(search result only, not fetched)*
3. [Margaret Hamilton — NASA Apollo Lunar Surface Journal (NASA-hosted)](https://nasa.gov/wp-content/uploads/static/history/alsj/a11/a11Hamilton.html) — NASA's own text: Hamilton led the team that developed Apollo flight software; her concepts of asynchronous software, priority scheduling, end-to-end testing and man-in-the-loop decision capability as the foundation for ultra-reliable software design; the ~three-minutes-before-touchdown software override of a radar priority command; the MIT Instrumentation Laboratory's 1961 NASA contract. **[fetched]**
4. [July 20, 1969: One Giant Leap For Mankind — NASA History](https://www.nasa.gov/history/july-20-1969-one-giant-leap-for-mankind/) — NASA primary: "During the final seconds of descent, Eagle's computer is sounding alarms," described as the computer trying to do too many things at once. **[fetched]**
