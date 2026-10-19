---
id: F33
kind: failure
title: The journal's own index silently dropped five entries for seven weeks — because lint checked that `kind` was present, never that it was valid
found: 2026-09-15
session: 2026-09-15 replay-payout sweep
status: addressed
addressed-by: "The five entries (L45, L46, L47, L48, L49) were corrected from `kind: lesson` to `kind: learning` and now appear in docs/journal/learnings.md (44 rows → 49). scripts/wiki-search.mjs lint gained two checks: `kind` is validated against the JOURNAL_KINDS enum (mirroring the existing STATUSES check), and the id's letter prefix is cross-checked against the kind, so L/O/F and learning/observation/failure can never disagree. Both were verified by deliberately reintroducing the bad value and watching them fire."
addressed-date: 2026-09-15
importance: high
category: tooling
refs: [L46, L49, F32]
---

## What happened

Adding a journal entry, I noticed the generated view `docs/journal/learnings.md` did not contain
it. The view had been regenerated **seven seconds after** the entry was written, and reported
"102 journal entries" — but it held 44 rows for 49 lesson files, and topped out at **L44**.

The cause is one word. `docs/journal/JOURNAL.md` documents the schema as
`kind: learning | observation | failure`, and `scripts/wiki-search.mjs` builds the three views
from exactly that map:

```js
const KINDS = { learning: 'learnings', observation: 'observations', failure: 'failures' };
```

Five entries had been written with **`kind: lesson`** — a word that is not in the enum, reads
perfectly naturally, and is arguably the better English. An entry with an unrecognised kind is
written to disk, passes lint, and is then simply skipped by the view builder. No error, no
warning, no row.

**Only two of the five were mine.** L45 (2026-07-27), L46 (2026-09-11) and L47 (2026-09-13) had
been invisible in the index for up to seven weeks. L46 is *"shared tool failure multiplies by
fanout"* and L47 is *"a locally-correct decision can silently disable a safety net in a dimension
nobody was looking at"* — both high-importance, and both describing this exact category of
problem while being invisible to the system meant to surface them.

## Why nothing caught it

`--lint` had a well-built check for the sibling field and none for this one:

```js
if (d.fm.status && !STATUSES.has(d.fm.status)) problems.push(`… bad status …`);
```

`kind` was in the required-fields list, so it was checked for **presence** and never for
**validity**. Presence is the weaker half: the failure mode of a missing field is loud (a blank
column, an obvious gap), while the failure mode of a *wrong* field is silent omission — the entry
vanishes from the one artifact anyone reads.

`--index` also had every opportunity to notice. It walked all 102 entries and bucketed 97 of
them. It could have said "5 entries had no matching view" in the same breath as its success line,
and instead reported only the total it had read.

## The lesson

**A validator that checks a field is PRESENT but not that it is VALID is not validating that
field.** And the combination that makes it dangerous is specific: *an enum consumed by a
dispatch/bucketing step*. A bad value there does not throw — it falls off the end of the map and
the record quietly ceases to exist downstream. Wherever a value selects a destination, the set of
legal values has to be asserted, or absence of a destination has to be an error.

Two rules taken from this:

1. **Validate every enum you dispatch on, not just the ones that look important.** `status` got a
   check because a bad status looks wrong in a table. `kind` did not, because a bad kind looks
   like nothing at all. The one that looks like nothing is the one that needs the check.
2. **A bucketing step should account for its input.** `read 102, bucketed 97` is a one-line
   change and it would have caught this on the first run, seven weeks earlier.

## The part worth sitting with

The shared-learning journal exists so that a mistake is made once. **Its own index had been
losing entries**, including two entries specifically about silent failures — so the mechanism
designed to stop a repeat was itself repeating one, invisibly, and the tool that gates it
reported "Lint clean" every single time.

Related: **L49** (a silent drop nobody noticed, one layer up, in prose rather than tooling) and
**F32** (an absence that read as an answer). The shape all three share: *nothing was wrong on
screen, so nobody looked.*
