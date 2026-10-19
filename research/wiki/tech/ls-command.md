---
title: ls — the two letters that ask "what is in here?"
type: entity
tags: [computing-history, unix, command-line, history-card, proposed-content]
level: 3
sources: 3
verified: 2026-09-15
---

`ls` is the Unix command that lists what is inside a directory. It is two letters long,
it is **the oldest thing in this wiki that still works unchanged on a modern machine**,
and its manual page survives in the First Edition Unix archive dated **3 November
1971**, signed by its owners **`dmr, ken`** — Dennis Ritchie and Ken Thompson. Fifty-odd
years later the same two letters are still specified by name in the POSIX standard
(IEEE Std 1003.1-2017) and still do the same job.

## In this game

**Not yet built. Proposed as Level 3's FIRST history card — the level currently has
none at all.** Level 3's cumulative alphabet is `f j d k s l`, which contains **no
vowel**, so no English word is spellable there and the measured card count is **0**.
`.claude/rules/levels/act1.md` is explicit that L3 is *"still pattern drills — no real
words yet."* A two-letter command name is the rare thing that is both typeable and true.

**Moment word: `ls`.** Character-by-character against Level 3's alphabet
`{f, j, d, k, s, l}`: `l` ✓ (**Level 3, new**), `s` ✓ (**Level 3, new**). *Both*
characters are Level 3's new keys, so it cannot attach any earlier (INV-56). It is not
among the spent card words. And it is a genuinely good L3 drill: `l` is the right ring
finger, `s` the left ring finger — the exact both-ring-fingers call-and-response the
level is built around.

**It also rhymes with the wing next door.** THE HARDWARE wing's verb is the boot line —
you walk up to an Apple IIe, type `CATALOG`, and the disk tells you what is on it
(`docs/specs/hardware-wing.md`). `ls` is the same question in two letters, asked of a
different machine. Related: [[unix]], [[java-language]], [[apple-iie]],
[[disk-ii-drive]].

## The facts

- **The manual page is dated 11/3/71.** In the Unix Archive's V1 tree, `V1/man/man1/ls.1`
  carries the date **`11/3/71`** and reads, verbatim: **`ls -- list contents of
  directory`**, synopsis `ls [ -ltasd ] name1 ...`. Its `OWNER` line is **`dmr, ken`**.
- **That is First Edition Unix.** The archive tree's own header describes V1 as *"The
  first edition of Unix… developed for the PDP-11/20 at Bell Labs by Ken Thompson,
  Dennis Ritchie and others,"* with files dated **November 3, 1971**. So "November 1971"
  and "11/3/71" are the same date, in US order — not 3 November read as 11 March.
- **What it did then.** The 1971 page already describes the long listing (`-l`: i-number,
  mode, owner, size, modification time), time sorting, hidden files, block sizes, and
  directory-only listing — and *"if no argument is given, the current directory is
  listed."* The shape of the command a person types today was present in the first
  documented version.
- **It is still a standard, by name.** The Open Group Base Specifications Issue 7, 2018
  edition (**IEEE Std 1003.1-2017**), specifies a utility named `ls` whose NAME line is
  **`ls - list directory contents`**. The 1971 wording and the 2017 wording are the same
  sentence with one word dropped.
- **⚠️ What this page does NOT claim.** It does not claim `ls` was the *first* command,
  nor the *oldest surviving* command, nor that its name was chosen by any named person
  for any stated reason. Nothing fetched this session supports an origin story for the
  abbreviation beyond the obvious: it is short for "list." **Superlatives were checked
  and dropped** — the sourceable and sufficient claim is a date, a wording, and an
  unbroken survival.
- **⚠️ Commonly repeated and NOT verified here:** that the original `ls` was written in
  PDP-11 assembly and later rewritten in C in 1973; and that it was "a few hundred lines."
  These appeared in a search summary from a non-institutional blog and no primary source
  was fetched for either. Not asserted.

## Card-ready facts

1. *"To ask a computer what is inside a folder you type two letters: l, s. It means
   list. People have been typing exactly those two letters since 1971."* (145 chars)
   — supports: TUHS Unix Archive V1 `ls.1` **[fetched]** (dated `11/3/71`, NAME line
   *"ls -- list contents of directory"*) + The Open Group / IEEE Std 1003.1-2017
   **[fetched]** (*"ls - list directory contents"*, still specified today).
2. *"The oldest instruction book for ls is signed dmr, ken — Dennis Ritchie and Ken
   Thompson, who were building Unix at the time. Two letters. Two names."* (150 chars)
   — supports: TUHS V1 `ls.1` **[fetched]** (`OWNER  dmr, ken`) + TUHS V1 tree header
   **[fetched]** (*"developed for the PDP-11/20 at Bell Labs by Ken Thompson, Dennis
   Ritchie and others"*).
3. *"In 1971 it said 'list contents of directory.' Today the rulebook says 'list
   directory contents.' Fifty years, and the only change was the word order."*
   (152 chars) — supports: TUHS V1 `ls.1` **[fetched]** + The Open Group
   IEEE Std 1003.1-2017 **[fetched]**, quoted side by side.

## References

1. [V1/man/man1/ls.1 — The Unix Heritage Society (TUHS) Unix Tree](https://www.tuhs.org/cgi-bin/utree.pl?file=V1/man/man1/ls.1) —
   PRIMARY, and the whole page rests on it: the First Edition Unix `ls` manual page,
   dated `11/3/71`, NAME *"ls -- list contents of directory"*, `OWNER dmr, ken`,
   SEE ALSO `stat`, plus a BUGS section about user numbers. **[fetched]**
2. [V1 — The Unix Heritage Society (TUHS) Unix Tree](https://www.tuhs.org/cgi-bin/utree.pl?file=V1) —
   PRIMARY context for source 1: identifies the tree as First Edition Unix for the
   PDP-11/20, Bell Labs, Thompson and Ritchie, files dated **November 3, 1971**. This is
   what turns `11/3/71` from an ambiguous string into a date. **[fetched]**
3. [ls — The Open Group Base Specifications Issue 7, 2018 edition (IEEE Std 1003.1-2017)](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/ls.html) —
   PRIMARY STANDARDS DOCUMENT. NAME: *"ls - list directory contents"*; the current
   normative specification of the same two-letter utility. Supports the "it still works,
   and it is still written down" half of the claim. **[fetched]**

## See also

[[unix]] — the Level 14 card; the operating system this command was born inside.
[[unix-epoch-1970]] — Level 20's card, the other "a convention from 1970-ish that never
went away" story.
[[java-language]] — the proposed Level 2 card, one level earlier.
[[apple-iie]] / [[disk-ii-drive]] — THE HARDWARE wing's `CATALOG` verb, which asks a
1978 floppy the same question this command asks a directory.

## Unsourceable / weakly-sourced items

- **Why the abbreviation is `ls` and not something else.** No source fetched; obvious but
  unstated. Not claimed as a decision by anyone.
- **The original implementation language and line count.** Search-summary only (a
  personal blog). Dropped.
- **`man.cat-v.org/unix-1st/1/ls`**, an alternative mirror of the same man page, returned
  **HTTP 402** this session and is explicitly NOT cited as if read.
