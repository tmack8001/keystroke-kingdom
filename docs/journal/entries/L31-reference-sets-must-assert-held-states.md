---
id: L31
kind: learning
title: Reference sets must assert held states — and animations need GIF siblings
found: 2026-07-12
session: 2026-07-12 milestones/cinematics wave (Trevor's dark-keys catch)
status: adopted
importance: high
category: graphics
refs: [L29, O5, F24]
---

**L31 — Reference sets must assert held states; animations need GIF siblings.** Trevor
caught I/O/P dark in the TOP ROW UNLOCKED milestone shot. First diagnosis: capture
mistimed mid-cascade (true). But the retimed capture then exposed the real bug: the
banner fade began BEFORE the cascade finished (and basement leaked its fade alpha onto
the keys), so a fully-lit, full-brightness held frame NEVER EXISTED in the animation —
the spec's "lights up completely and holds" moment was mathematically absent, in both
basement and commandcenter. Rules now encoded: (1) a milestone/animation reference
captures the HELD canonical state, with the hold's existence verified from the code's
own timing math; (2) animated surfaces get a .gif sibling (captureGif in
kk-playwright.js — the png shows the held state and diffs cleanly, the gif proves the
motion); (3) fade-outs must be alpha-scoped to their element and must not begin until
the build-up completes. A reference set that asserts the held state catches
absent-state bugs that every mid-animation screenshot hides. (→ L29, O5; the
docs/screenshots/milestones/ set exists exactly for this.)
