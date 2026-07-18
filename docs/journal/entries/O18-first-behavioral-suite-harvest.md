---
id: O18
kind: observation
title: Documented intent drifts silently until something executes the docs — first suite harvest
found: 2026-07-12
session: 2026-07-12 testing-strategy wave
status: addressed
importance: high
category: game-design
addressed-by: "2026-07-13 4-lane fix wave: all 6 findings triaged by Trevor and resolved (TF-H1/TF-3/TF-4/TF-E1 FIXED, TF-H2/TF-H3 BY-DESIGN with docs updated first) — suite now gates with zero todos; every former finding is a live regression test."
addressed-date: 2026-07-13
refs: [L35, F23, O4]
---

**O18 — The inaugural behavior-first suite run (268 test cases, 9 lanes) found six real
game-vs-doc violations in a codebase that had passed extensive QA the same week.**
All six were in surfaces nothing had ever *executed against the doc's exact words*:
name entry violated three documented clauses at once (prefilled default doesn't
clear on first keystroke, 16-char cap vs the documented 12, Space doesn't confirm)
— onboarding.md and transitions.md both state each clause explicitly; the canvas
keyboard guide shows ENTER on Macs (the precise Oona confusion the label rule was
written to prevent — the DOM-side swap works, but canvas text can't be reached by a
DOM attribute mechanism); pacman.js silently lacks `miss()` (the engine's defensive
guard hid the gap — defensive code masks contract violations from every observer
except a contract test); and the Go wordgen structure layer caps line count but not
line size (the downstream safety net catches it, which is exactly why the
structure-layer gap stayed invisible).

Pattern across all six: **a working fallback or guard in front of a violation makes
it undetectable by outcome-based QA** (recorder runs, screenshots, playthroughs all
passed). Only tests that assert the documented clause itself — not the outcome —
surface them. Trevor predicted "at least a dozen issues" from this approach; six
confirmed + two dismissed-as-test-misreadings on day one is the calibration point.
Meta-lesson for the ledger protocol: of eight initial findings, two were the TEST
misreading the doc (ENTER-as-verb vs key label; the swap mechanism flagging itself)
— findings need an artifact-level triage pass before they're treated as defects,
same as agent reports (F24).

Ledger: docs/testing/FINDINGS.md (open: TF-H2, TF-H3, TF-3, TF-4, TF-E1; TF-H1
fixed 2026-07-13 — the un-todo protocol's first live exercise went clean: fix agent
touched only game code, the untouched test suite validated it, only the todo marker
gained its real body).
