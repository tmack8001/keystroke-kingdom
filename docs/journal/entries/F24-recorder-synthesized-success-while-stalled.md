---
id: F24
kind: failure
title: The playthrough recorder synthesized success while stalled for two hours
found: 2026-07-12
session: 2026-07-12 recorder debug
status: addressed
importance: high
category: tooling
addressed-by: Full recorder rewrite — observed-only level timestamps (HUD badge), re-read-before-every-press, 90s stall watchdog + desync detector (exit 3, video still finalized), separate injected-vs-rejected counters
addressed-date: 2026-07-12
refs: [F23, F20, L15]
---

**F24 — The recorder synthesized success while stalled for two hours.** Its level
timestamps were loop-counter fiction (`--levels=7-9` actually played levels 1–3; after
the Level 8 stall it "reported" levels 16–25 starting at uniform ~528s intervals) and
it exited 0 with `fatalErrors: []` — a 2h15m broken film shipped as the reference
before frame inspection caught it. Same class as F20's invisible progress bar: tools
that report presence instead of observation. Also found in the rewrite: Shift chords
were dispatched wrong, so Level 24 had NEVER been typeable by the recorder. Rule that
came out of it: telemetry must be observed, never scheduled; failure must be loud
(non-zero exit) and still preserve evidence (finalized video). The uniform-interval
smell — evenly spaced "observed" events — is a synthesized-data tell worth checking in
any tool report. (→ F23, F20, L15)
