---
title: The Disk II Drive
type: entity
tags: [computing-history, hardware, apple, proposed-content]
sources: 2
verified: 2026-09-14
---

The Disk II was Apple's 5.25-inch floppy disk drive, demonstrated at CES in January
1978 and shipped that July — and it is a hardware-engineering story, not just a
storage-format one: Steve Wozniak designed a controller so radically simplified that
Apple could sell "the least expensive floppy disk drive ever sold by a computer
company" at a moment when rival drives cost far more.

## In this game

**Not yet built.** This page is written for the proposed "THE HARDWARE" wing (a
component-collecting station wing, per the task brief) — it is a candidate MACHINE/
COMPONENT pairing distinct from [[floppy-disk]], which already ships as the Level 10
history card (`floppy`) and covers the removable 1971 IBM *medium*. **This page is
about the DRIVE — the box with the motor, the slot, and (critically) the controller
card that reads it** — and the interesting, sourceable angle is Wozniak's engineering,
not the disk itself. If built, this station pairs naturally with [[apple-computer]]
(Level 10, the "inventors can come from anywhere / garages, not labs" card) and
[[floppy-disk]] (Level 10, the medium card) — three angles on one moment in one
room in 1978.

## The facts

- **Steve Wozniak** designed the Disk II's controller card. It was demonstrated at
  the Consumer Electronics Show in early January 1978 and became commercially
  available in July 1978, bundled with Apple DOS 3.1.
- **Price:** $495 for pre-orders, $595 at general retail — including the controller
  card. apple2history.org calls this "the least expensive floppy disk drive ever sold
  by a computer company."
- **The chip-count reduction is the real story.** Typical S-100-bus disk controllers
  of the era used around 40 chips. Wozniak's controller design used roughly 8–9 —
  Wikipedia's figure is "reduced the number of chips used by a factor of 10 compared
  to existing controllers," and apple2history.org's more granular account gives the
  40-chip-to-8/9-chip figure directly.
- **How he did it, in two moves:** (1) he replaced a physical "index hole" timing
  mechanism with **soft sectoring** — software-managed sector timing instead of a
  dedicated hardware sensor; (2) he abandoned the standard FM (frequency modulation)
  encoding scheme for **Group Coded Recording (GCR)**, which packed data more densely
  — apple2history.org gives a **45% storage increase** from this switch (roughly 90K to
  113K formatted capacity on the same physical disk). Wikipedia separately confirms
  the resulting formatted capacities: **113.75 KiB** under Apple DOS 3.2.1 and earlier,
  **140 KiB** under DOS 3.3 and ProDOS (a later formatting change, not the same 1978
  number — don't conflate the two).
- **Manufacturing cost vs. retail price:** apple2history.org puts the drive's parts
  cost at roughly $140 initially, falling to about $80 after Apple switched a
  mechanical supplier to Alps Electric — against a $495–595 retail price. This is the
  economic engine behind "cheapest floppy system ever sold": the controller redesign
  cut Apple's own cost, not just the customer's.
- **What this page does NOT establish:** neither source names a specific supplier for
  the drive mechanism itself (the spinning, head-carrying hardware, as opposed to the
  controller card Wozniak designed) — Shugart Associates is well known generally as an
  early 5.25-inch drive-mechanism maker of this period (a different Computer History
  Museum page, fetched this session, confirms Shugart introduced the *format* in 1976
  at Wang Laboratories' request), but no source fetched this session directly ties a
  Shugart mechanism to the Disk II by name. Left unstated rather than assumed.

## Card-ready facts

1. *"A clever engineer named Steve Wozniak found a way to build a disk drive using
   far fewer parts than anyone else — about a quarter as many — so a computer's
   family could actually afford one."* — supports: apple2history.org [fetched]
   (40 chips → 8–9 chips) + Wikipedia [fetched] ("factor of 10" framing).
2. *"The Disk II was the least expensive floppy disk drive any computer company had
   ever sold — because its inventor figured out a smarter, simpler way to build it."*
   — supports: apple2history.org [fetched] (direct quote, "least expensive floppy disk
   drive ever sold by a computer company").
3. *"Steve Wozniak changed how the drive kept time — swapping a physical part for
   clever software — and that one idea alone made the disk hold almost half again as
   much."* — supports: apple2history.org [fetched] (soft sectoring + GCR, "45% greater
   storage").

## References

1. [Disk II — Wikipedia](https://en.wikipedia.org/wiki/Disk_II) — designer, June 1978
   on-sale date, $495/$595 pricing, "factor of 10" chip-count reduction claim, GCR
   13-sectors-per-track detail, soft-sectoring capability, and the two DOS-era
   formatted-capacity figures (113.75 KiB / 140 KiB). **[fetched]**
2. [The Apple II History, Chapter 5: The Disk II — apple2history.org](https://www.apple2history.org/history/ah05/) —
   long-running, detailed enthusiast/community reference (Steven Weyhrich); the more
   granular chip-count figures (40 → 8–9), the CES January 1978 demo date, the July
   1978 ship date with DOS 3.1, the 45% capacity gain from GCR + soft sectoring, and
   the manufacturing-cost-vs-retail figures ($140→$80 parts cost vs. $495+ retail).
   **[fetched]**

## See also

[[floppy-disk]] — the removable medium this drive reads; the Level 10 history card.
[[apple-computer]] — the company and its 1976 garage founding, Level 10.

## Unsourceable / weakly-sourced items

- A named drive-mechanism supplier (e.g. Shugart) for the Disk II specifically was not
  confirmed this session — see "The facts" above.
- This session's WebSearch budget was exhausted before this page was researched;
  all citations above came from direct WebFetch of known institutional/enthusiast
  URLs rather than search-discovered ones. A follow-up pass with search available
  could likely add a third source (Computer History Museum object record or a
  Wozniak first-person account) for stronger corroboration.
