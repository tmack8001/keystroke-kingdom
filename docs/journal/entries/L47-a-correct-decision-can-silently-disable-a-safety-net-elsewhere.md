---
id: L47
kind: lesson
title: A locally-correct decision can silently disable a safety net in a dimension nobody was looking at
found: 2026-09-13
session: 2026-09-13 Act 7 build
status: adopted
importance: high
category: tooling
refs: [F26, L46, F27]
---

**Act 7's wing was attached with a deliberate lazy `import('./speedway/hub.js')`, and the
reasoning was right: a static import puts a bonus room in the critical module graph, so
on the published static host a missing `js/speedway/*` would abort `main.js` at load and
brick all 25 levels. Lazily, a failure costs exactly one warm card.** The lane proved it
— with `hub.js` absent, the game stayed fully playable.

It also made the entire speedway subtree **invisible to `scripts/static-host-check.mjs`**,
whose own comment read *"No dynamic import() exists in js/ (verified 2026-09-11)"* — an
assumption that was true when written and silently false afterwards. The module count
stayed at 58 while four new files shipped unguarded. That is journal **F26**'s exact
failure class (*a file that exists locally but was never committed is a live 404 for
every player*) walking straight back in through a door the fix didn't cover.

Two things worth keeping:

**1. A safety net encodes assumptions about the code it watches, and those assumptions
expire silently.** The crawler wasn't wrong when written. It rotted because something
else changed correctly. A comment asserting a repo-wide property — *"no dynamic imports
exist"*, *"nothing writes to this namespace"*, *"only one caller"* — is a **tripwire with
no trigger**: nothing fails when it stops being true. Where such an assumption is
load-bearing for a gate, the gate should **detect the violation rather than assume its
absence**. The crawler now follows literal dynamic imports and *warns* on computed ones
rather than skipping them silently, because an uncommitted file behind an unresolvable
specifier is exactly where one would hide.

**2. Verify a gate by breaking something.** The fix was only trustworthy once `hub.js`
was deleted from a scratch copy and the gate actually printed `MODULE 404 … FAIL`.
A gate that has never failed is a gate with no evidence it can.

The wider pattern: when reviewing a change, ask not only *"is this correct?"* but
**"does this move anything outside the reach of a check that was watching it?"** Lazy
loading, caching, batching, async boundaries, feature flags and conditional imports all
move code out from under tools that walked the old path. The decision here was right and
should stand — what was missing was noticing that being right in one dimension had
turned off a light in another.
