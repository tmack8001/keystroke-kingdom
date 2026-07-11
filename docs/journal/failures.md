# Failures
*Append-only. What went wrong, why, and what it taught — kept honest so we learn together.
IDs are monotonic (F1, F2, …); cross-reference as `L#`/`O#`/`F#` (see
[learnings.md](learnings.md), [observations.md](observations.md)). Failures are data,
not shame; the only bad failure is an unrecorded one.*

## Pre-session history (recorded for completeness)

- **F2 — The canvas z-index bug (June 2025 — dating WRONG, see F15; actual: 2026-06-25).** Levels 6–15 shipped with the letter
  prompt and keyboard guide completely hidden behind the canvas for an entire build
  session before anyone noticed. Gave birth to the mandatory screenshot rule in
  `.claude/rules/visual-validation.md`. (Numbered F2 to preserve the prepopulation
  ordering below; chronologically first.)

## 2026-07-10 → 2026-07-11 — the Act 5 / graphics / settings / research mega-build (prepopulated)

- **F1 — Level 4 victory crashed rendering for every player.** `fighter.js` used a
  sentinel frame (9999) for the victory hold pose; it fed an arc radius of −9959 and
  threw `IndexSizeError` every victory frame. Shipped for weeks; found only when QA
  played to an actual win. Fix: clamp animation frames at the consumer. (→ O4)
- **F3 — 72.7% of measured UI elements failed contrast** across the whole game until
  Trevor flagged low visibility from screenshots and we measured. UI had been reviewed
  only against dark backgrounds. (→ L2)
- **F4 — History cards were routinely unearnable.** Injection at 70% of the pattern
  list sat beyond the typical level-win point; a level could end before its educational
  moment appeared. Caught by QA reading the win-gate math, not by playtesting. (→ L4)
- **F5 — The keyboard preview had no number row at all** — levels 16–20 taught keys the
  preview screen literally could not show. Nobody noticed until the ANSI-geometry work
  audited the layout data. (→ L3)
- **F6 — I fabricated a historical justification.** "1979 pinball machines had literal
  NOVICE/EXPERT switches" — invented, plausible, false (full record: [[pinball-difficulty-settings]]) (period reality: liberal/normal
  post settings and DIP switches). Caught by the citation pass. The difficulty tiers
  survived on their real merits. (→ L5, O2)
- **F7 — A child-facing card overstated history.** The [[grace-hopper|Grace Hopper]] card said "She
  taped it into the logbook"; the Smithsonian's object record contradicts it ([[mark-ii-moth-1947]]). Rewritten
  to credit the team and her storytelling. Player-facing facts get the strictest bar. (→ L5)
- **F8 — The [[eniac|ENIAC]] "six programmers" list named five people.** Ruth Lichterman and
  Ruth Teitelbaum are the same woman (maiden/married); Kay McNulty was silently missing.
  A name-list dedup check is now part of the historian's calibration. (→ O2)
- **F9 — [[myst|Myst]] was credited with an SGI pipeline it never had** (Mac Quadras +
  StrataVision; SGI belongs to Riven and [[pre-rendered-3d|DKC]]) — in the design bible itself, feeding the
  Level 13 era framing. Adjacent-famous-fact conflation. (→ O2)
- **F10 — The settings/survival build agent died twice** — connection drop mid-report,
  then a 600s stall on resume. Implementation had fully landed on disk; only validation
  was missing, and the QA wave absorbed it. (→ L15, O6)
- **F11 — The games-atomization agent died after finishing 100% of its pages.** Lost
  report nearly caused redundant re-work; a file-state assessment showed zero missing
  pages. Always diff reality before re-running. (→ L15)
- **F12 — A citation agent was killed by a session usage limit with zero output** —
  10 tool calls in, nothing written. Relaunched cleanly after reset. Budget limits are
  a failure mode to expect, not an anomaly. (→ L15)
- **F13 — Near-miss: the settings hotkey was almost 'S'.** It would have collided with
  typing `shallweplayagame` on the title screen (the WOPR secret). Caught at spec time;
  shipped as Tab. Hidden input listeners make every new hotkey a collision risk —
  grep the secret phrases before binding anything.
- **F14 — The wiki linter reported valid links as broken.** Obsidian's escaped-pipe
  table form `[[page\|label]]` wasn't handled by the first parser regex. Fixed the
  parser, not the content — when a tool disagrees with a convention, check which one
  is authoritative. (→ L7)

## 2026-07-11 — transcript recon over past sessions (2026-06-22 → 2026-06-25)

- **F15 — Our failure log itself had a failure.** F2 dated the canvas z-index bug "June
  2025" — copied from `.claude/rules/visual-validation.md`, which was itself wrong. The
  transcript proves the bug was introduced and fixed 2026-06-25. Both fixed. Even the
  journal needs its claims checked against primary sources. (→ L5)
- **F16 — The visual-validation rule was born from that same bug, that same session.**
  Trevor: "please add a rule or hook... so that we don't need to come back to this state."
  `.claude/rules/visual-validation.md` is not old lore — it's a scar with a date.
- **F17 — Street Fighter II was originally assigned to Level 4 (home row).** A 1991
  arcade game sitting in the 1976–82 act — the founding era-pacing failure that produced
  the levels.md reassignment cascade (Dragon's Lair to 7, Mario/Zelda swap, SFII to 12).
  The current era rules are the fix for this, not a priori design. (→ [[street-fighter-ii]])
- **F18 — The 10-cabinet select screen silently clipped its second row** (`body
  {overflow:hidden}`), and the first fix (scale everything down) was the wrong axis —
  rejected on legibility, replaced by act paging. (→ O10)
- **F19 — Joust's gameplay went through four movement/combat models in one session**,
  including a "behavior pressure" system that punished misses — a mechanic conflicting
  with the One Rule that got implemented before being caught, then fully removed. Cost:
  3–4 rewrite cycles. (→ L18, L19, O15)
- **F20 — A dead progress bar shipped and sat invisible for a whole session** — wired in
  HTML/CSS/hud.js, permanently 0% width, spotted only when Trevor asked "what is this
  grey line?" (Verified removed from current code during this recon.) Visual validation
  checks presence, not absence-of-function. (→ F5's cousin)
- **F21 — levels.md regrew past the 40k budget that motivated its own split** (currently
  40,970 bytes; split at 2026-06-25 specifically to get under 40k). No enforcement
  exists; added to docs/ROADMAP.md tech debt. Budgets without checks silently regress.

## 2026-07-11 — vault/hooks/journal build (session close)

- **F22 — Second wikilink-parser blind spot in one day.** After the escaped-pipe fix
  (F14), the linter false-flagged `[[page]]` examples written inside backtick code spans
  in the journal headers themselves. Same lesson class, second instance: Obsidian link
  syntax has a long tail (tables, code spans, aliases, headings) — parse against real
  documents, not imagined ones. Fixed by stripping code spans before link extraction.
