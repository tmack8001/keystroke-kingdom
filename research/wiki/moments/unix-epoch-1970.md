---
title: The Unix Epoch (January 1, 1970)
type: moment
tags: [computing-history, unix, time, history-card]
level: 20
sources: 2
verified: 2026-07-19
---

Unix time counts every moment as a single number — seconds since 00:00:00 UTC on
January 1, 1970 — a convention Dennis Ritchie described as chosen simply because it was
convenient, and one so foundational that Windows, macOS, Linux, Android, and iOS all
still use it internally.

## In this game

**Level 20 history card, word `1970`.** Digits 1, 9, 7, 0 are all available the moment
1 and 0 complete the number row at Level 20 (see `.claude/rules/levels/act4.md` Level
20) — 1 and 0 are both new at this exact level. Deliberately paired with the existing
`1969` card (ARPANET's first message) at the same level — one digit apart, two
completely different foundational 1969/1970 computing moments.

## The facts

- Unix time represents a moment as the count of seconds elapsed since 00:00:00 UTC,
  January 1, 1970 (the "Unix epoch") — rather than storing a year, month, day, hour,
  minute, and second separately.
- Early Unix versions actually used January 1, 1971 as the reference point; the date
  was later shifted to January 1, 1970, which became permanent.
- Dennis Ritchie described the choice as arbitrary but convenient — round, recent
  enough not to waste bits, and close enough to when Unix itself was being built
  (1969) to comfortably cover the system's own history.
- Because of Unix's foundational influence, "Unix time" is now used internally by
  essentially every modern operating system and programming language, not just Unix
  itself.

## References

1. [Unix time — Wikipedia](https://en.wikipedia.org/wiki/Unix_time) — confirms the January 1, 1970 epoch, the earlier 1971 reference point in early versions, and Ritchie's "arbitrary but convenient" framing. *(search result only, not fetched)*
2. [Why Was 1 January 1970 Used as the Epoch Time? — Baeldung on Linux](https://www.baeldung.com/linux/epoch-time) — established technical-education source corroborating the reasoning (round, recent, bit-efficient) behind the chosen date. *(search result only, not fetched)*

## See also

[[unix]] — the operating system this convention comes from (Level 14). [[arpanet-first-message-1969]] — this game's other Level 20 card.

## Unsourceable / weakly-sourced items

Only two sources were found for the specific "why 1970" reasoning (both secondary,
neither a primary Bell Labs document); the core fact (the epoch date itself, and that
it superseded an earlier 1971 reference point) is well corroborated, but the exact
reasoning is repeated across secondary sources rather than traceable to a single
first-hand Ritchie interview transcript. Flagged rather than treated as fully
primary-sourced.
