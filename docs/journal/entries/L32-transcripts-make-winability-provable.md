---
id: L32
kind: learning
title: Transcripts make winability provable; cap same-host browser swarms at ~5
found: 2026-07-12
session: 2026-07-12 winability swarm (Trevor's captured intent)
status: adopted
importance: high
category: agent-process
refs: [L30, F23, F24]
---

**L32 — Transcripts make winability provable; cap same-host browser swarms at ~5.**
The recorder now emits transcript siblings (.jsonl events + .md timeline: visible
sequence | typed | outcome, tSec-anchored to the video) — the video shows what it
looked like, the transcript PROVES what happened. The 25-level sweep validated Trevor's
intent end-to-end: all 25 PASS, zero rejected presses, pattern_shown==pattern_complete
everywhere, every card word before every win, all 18 injected wrong keys honored the
letter-waits contract. Three durable lessons: (1) instrument bugs masquerade as game
bugs — the transcript's text-dedup collapsed consecutive identical drills (`r,r`),
falsely flagging two levels; count accepted-presses-vs-known-length, and always ask
"game bug, config mismatch, or instrument artifact?" before believing a red flag;
(2) 25 concurrent headless Chromium + ffmpeg on one host → load ~680 and abort — 5
concurrent × 5 waves finished all 25 in 9.4 min (encoded in swarm-playbook); (3) a
"winnable" verdict can still hide a design slog — Q*bert won at 24 patterns vs its
7-pattern minimum (2.3x cohort median), visible only because the transcript counts
sequences, not just exit codes. Published: docs/validation/winability-2026-07-12/.
(→ L30, F23, F24)
