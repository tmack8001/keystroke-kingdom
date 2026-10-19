---
id: L48
kind: learning
title: A test can cite a design doc and still be coupled to content — three did, and all three broke the moment a bank gained a row
found: 2026-09-15
session: 2026-09-15 card-content session
status: adopted
importance: medium
category: testing
refs: [F32, INV-56, INV-58]
---

## What happened

Writing the first entries into three empty card banks broke three tests. Not one of them was
a real regression — the game was behaving correctly in every case — and not one of them was
the sloppy kind of test `.claude/rules/testing.md` warns about. Each cited a design source in
its comment, exactly as the doctrine requires:

| Test | Its comment claimed | What it actually asserted |
|---|---|---|
| `hardware-wing.test.mjs` INV-98 | *"an unauthored station yields null rather than throwing"* | `pickGuaranteedStationCard('hardware', 'apple-iie', …) === null` |
| `history-cards.test.mjs` INV-58 | *"Levels 1-3 have no vowel and (per product.md) no cards live there either"* | `pickGuaranteedCard(1, …) === null` |
| (same file, legacy-card test) | a level that never had a legacy card | survived only by luck — it scans `[1,2,3]` for an untagged level |

The first two are the same mistake. Both wanted to pin **"an empty pool yields null rather
than throwing"** — a real, permanent design clause. Both reached for a *real id that happened
to be empty at the time* as the vehicle. `apple-iie` was an unauthored station on Monday and a
carded one on Tuesday; Level 1 was uncarded for a year and is carded now. The clause never
moved. The vehicle rotted.

The second one is worse in an instructive way, because **its citation was wrong**. `product.md`
does not say Levels 1–3 have no cards. It says the Word Bank Principle admits **no real words**
before Level 4 — a rule about content, not about cards. The emptiness of those levels was a
*consequence* of INV-56 attaching a card to the earliest level that can SPELL its word, and
`docs/ROADMAP.md` files that consequence as a **defect**: a five-year-old replays Levels 1–3
more than anything in the game and the collect loop did not exist there. So a test had quietly
promoted an accident of the spelling constraint into a design rule, attributed it to a document
that says something different, and would have blocked the fix.

## The lesson

**Citing a design source is necessary but not sufficient. The citation has to cover the
assertion, and the assertion has to be written so that only the cited clause can break it.**

Two concrete habits, both cheap:

1. **For an "empty / absent / none" case, use an id that is deliberately never real** —
   `'no-such-station'`, not whichever real thing happens to be empty this week. A real id is a
   time bomb with no fuse visible in the test.
2. **Assert over a derived set, not a hard-coded member.** `[1,2,3,4,5].filter(l =>
   cardsForLevel(l).length === 0)` keeps testing the clause forever; `pickGuaranteedCard(1, …)`
   tests it only until Level 1 gains a card.

And a check for the reviewer: **read the cited clause and ask whether it entails the
assertion.** "No real words before Level 4" does not entail "no cards on Levels 1–3". That gap
is where a content accident hardens into a fake rule.

## Why this matters more than it looks

`testing.md` rule 1 says a failing test is a design conversation: either the change is wrong or
the design moved, and the design doc is updated FIRST. That rule assumes the two options are
exhaustive. These three were a **third** case — the design never moved and the change was
right; the test was coupled to transient content while wearing a design citation. Treating that
case as either of the first two is how you either abandon a correct change or rewrite a design
doc to match a test that was never right.

Related but distinct from **F32**, which is about the *mechanism* hazards an empty bank hides.
This is about the *tests* an empty bank quietly mis-teaches: while a collection is empty, a
test that pins "this specific thing is empty" and a test that pins "an empty thing behaves
safely" are indistinguishable — and only the second one is true.
