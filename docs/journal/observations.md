# Observations
*Append-only. Patterns noticed in how we work — about the agents, the process, and the
collaboration. IDs are monotonic (O1, O2, …); cross-reference as `L#`/`O#`/`F#` (see
[learnings.md](learnings.md), [failures.md](failures.md)).*

## 2026-07-10 → 2026-07-11 — the Act 5 / graphics / settings / research mega-build (prepopulated)

- **O1 — Subagents are injection-suspicious by default, and that's good.** Two agents
  independently flagged sibling agents' edits as "changes I cannot vouch for" and one
  refused to act on a coordinator message's authority. Right instinct, false alarms —
  but plan coordination messages knowing peers will (correctly) distrust them.
- **O2 — Fluent errors recur in predictable classes:** created-vs-shipped dates,
  same-person-under-two-names, popularizer-vs-inventor, adjacent-pipeline conflation
  (Myst/SGI), suspiciously-convenient justifications, almost-right superlatives.
  These six classes are now calibration examples in the arcade-historian agent. (→ L5)
- **O3 — Metrics need documented artifact classes.** The contrast audit's residual
  "failures" were all measurement artifacts (glow halos, empty fog boxes) — without
  naming those classes, the numbers would have driven wrong fixes. Screenshots were the
  ground truth for decorated elements. (→ L13)
- **O4 — QA agents find real shipping bugs when given license to fix trivial ones.**
  The Level-4 victory crash (F1) and an infinite-loop hang (in a first-draft theme) were
  both caught by QA sweeps that actually typed and won levels, not just screenshotted.
- **O5 — Trevor reviews visually and catches spatial/aesthetic drift fast.** The
  keyboard-not-keyboard-shaped issue and the key-glyph-gimmick cabinet rationale were
  both caught from artifacts, not code. Ship screenshots early; justify designs against
  the established art, not clever rationales. (→ L3)
- **O6 — Agent failure modes seen this build:** API connection drop mid-report (twice),
  600s stall on resume, hard session-limit kill with zero output. Distinguish "work
  lost" from "report lost" before redoing anything. (→ L15, F10–F12)
- **O7 — Design values that keep recurring in Trevor's feedback:** faithful recreation
  over gimmick; "challenging, never cruel"; educational moments only at natural pause
  points; everything grounded in verifiable reality ("otherwise it isn't research").
  These are load-bearing decision criteria, not vibes.
- **O8 — Hooks work as designed when tested like code.** The doc-currency Stop hook's
  first live firing correctly caught a genuine gap (game-code change not yet reflected
  in ROADMAP) and cleared after a real doc update. Pipe-testing hooks with synthesized
  stdin before wiring them is what made that boring instead of surprising.

## 2026-07-11 — transcript recon over past sessions (2026-06-22 → 2026-06-25)

- **O9 — Trevor's bug reports are terse, precise, and contain the compressed root cause**
  ("right and left arrow don't show as clearly as the up and down arrows do"). The
  expected behavior is deep self-diagnosis, not clarifying questions.
- **O10 — Parametric patches get rejected when the complaint is legibility; structural
  redesigns stick.** Shrinking 10 cabinets to fit one row was rejected on sight; the
  act-paged select screen (↑↓ between acts) became the permanent design.
- **O11 — Font glyph coverage is a silent failure class.** Press Start 2P renders ↑↓ but
  not ←→ (blank, not broken) — caught only by screenshot. Check glyphs when choosing
  symbols for retro fonts. (→ F14 for the tooling cousin of this class)
- **O12 — Screenshot "failures" can be viewing-scale false positives.** Street Fighter II
  looked invisible at full-page scale; cropped, the UI was fine. Earliest instance of the
  artifact-class lesson later formalized as O3/L13.
- **O13 — File-partitioned parallel agents have provenance:** first used 2026-06-25 at
  small scale (three agents, five Act 3 themes) before the July mega-build scaled it. (→ L8)
- **O14 — Tightly-scoped multi-part instructions land in one clean pass** (Enter/Return
  detection + cabinet-reuse rule + doc updates: one message, zero clarifications, zero
  errors). Scope discipline in the ask produces clean execution.
- **O15 — Proactive self-audit against design rules happened before being asked** — the
  lava troll was flagged as punishing when proposed, not after shipping. The design bible
  works best as a filter at proposal time. (→ L19)
