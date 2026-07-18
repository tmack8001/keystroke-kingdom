---
title: ANSI Escape Codes
type: entity
tags: [computing-history, standard, terminal, history-card]
level: 20
sources: 3
verified: 2026-07-13
---

ANSI escape codes are the in-band control sequences (standardized as ANSI X3.64 in
1979, building on ECMA-48 from 1976) that let a plain text terminal display color,
cursor movement, and other formatting — the mechanism behind colored BBS/MUD text and
the reason a terminal screen could ever be more than one color on green-on-black
hardware.

## In this game

Grounds the visual choice for a [[mud]]/terminal-styled Level 20 render: a late-90s
terminal is period-correct showing **ANSI color** (not just monochrome
green-phosphor), since ANSI color support in terminal software was widespread by the
1980s and standard by the 1990s. The existing Level 20 terminal beat (binary →
HELLO, `.claude/rules/levels/act4.md`) is currently pure green-on-black TUI text,
which is also authentic — early terminals like the [[ascii|ASCII]]-era teletypes and
the original VT100 (1978) predate color support. Both looks are real; the choice is
which decade's terminal culture the scene wants to evoke (VT100-era monochrome vs.
BBS/MUD-era ANSI color).

## The facts

- **1979:** the name "ANSI escape sequence" dates from ANSI's adoption of ANSI X3.64,
  building on ECMA-48 (first edition 1976; second edition 1979 specifically allocated
  the SGR color parameters 30–37 foreground / 40–47 background as 3-bit/8-color
  codes).
- **1978:** the Digital VT100 was the first popular terminal to support these escape
  sequences in hardware — but the VT100 itself displayed in monochrome green or
  amber phosphor; color terminal hardware (e.g. the TeleVideo 950) followed in the
  early 1980s.
- **Mid-to-late 1980s:** ANSI art and colored text became closely associated with
  dial-up Bulletin Board Systems (BBSes) — used for login screens, menus, and shared
  ASCII/ANSI art — driven by slow modem speeds (2400 baud-era) where text-mode color
  was far cheaper to transmit than any bitmap image.

## References

1. [ANSI escape code — Wikipedia](https://en.wikipedia.org/wiki/ANSI_escape_code) — 1979 X3.64 naming, ECMA-48 1976/1979 editions and SGR color parameter allocation, VT100 (1978) as first popular hardware support. **[fetched]**
2. [BBS Graphics History: Pretty Awesome, Until the Web Showed Up — Tedium](https://tedium.co/2020/07/21/bbs-graphics-history-ripscrip-naplps/) — corroborates ANSI art's rise alongside 1980s BBS culture and the 2400-baud-era rationale for text-mode color over bitmap graphics. *(search result only, not fetched)*
3. [There's no escaping it: an exploration of ANSI codes — Bug Repellent](https://blog.safia.rocks/2025/12/22/ansi-codes/) — independent technical retrospective corroborating the ECMA-48/ANSI X3.64 standardization timeline. *(search result only, not fetched)*
