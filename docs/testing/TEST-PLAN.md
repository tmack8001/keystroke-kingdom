# Test Build Plan
## Keystroke Kingdom — swarm lanes, file ownership, per-file outlines

*Companion to [`STRATEGY.md`](STRATEGY.md) (read it first — the doctrine and the
INV-nn catalog live there). This file is the build spec: which agent builds which
test file, and exactly which invariants each file enforces. Ownership is disjoint
per swarm-playbook §2 — no two concurrent lanes share a file.*

---

## Shared infrastructure (pre-built by the orchestrator)

- `tests/helpers/stubs.mjs` — `installLocalStorageStub()`, `installFetchStub(script)`,
  `resetStubs()`. Unit lanes use these; do not modify.
- Directory skeleton `tests/{static,unit,integration,helpers}`.

## Wave 1 — parallel (no inter-lane dependencies)

### Lane A — integration driver + smoke  *(opus)*
**Owns:** `tests/helpers/game-driver.mjs`, `tests/integration/smoke.test.mjs`

The driver is the foundation Wave 2 builds on. API (all functions async):
- `startGame(opts)` → `{ page, browser, baseUrl, stop() }`. Serves the repo root with
  a **Node** static file server on an **ephemeral port** (listen on 0; never python,
  never `.dev-url`). Launches headless chromium via the module path used in
  `scripts/kk-playwright.js` (reuse its launch/console-error wiring; requiring the CJS
  helper from ESM is fine). `opts.localStorage` = object seeded before first script
  runs (`page.addInitScript`); `opts.settings` / `opts.progress` sugar for
  `kk-settings` / `kk-progress`.
- Navigation: `toTitle`, `toSelect` (wopr bypass, reuse helper), `toLevel(n)`,
  `toGameFresh(n)` — and **raw flows** for onboarding tests: `coldOpenToTitle()`,
  `enterName(page, name)` that does NOT bypass via wopr.
- Interaction: `press(key)` (real `page.keyboard`), `pressChord(mods, key)`,
  `typeSequence(str)`.
- Reading (observable state only): `readPrompt()` → `{ tokens, activeIndex,
  activeToken }` from `#prompt-sequence` DOM; `readHUD()` → `{ streak, accuracy,
  mistakes, quarters, wpm }`; `readScreen()` → which `.screen` is visible;
  `consoleErrors` array exposed.
- `winLevel(n)` — machine-speed loop: read active token, press it, until level
  complete overlay. Must honor the token contract (uppercase ⇒ Shift chord, `' '`,
  `'Backspace'`).
- Smoke test proves: boot to level 1, correct press advances, `winLevel(1)` reaches
  LEVEL COMPLETE, zero console errors. Cite INV-7.

### Lane B — curriculum unit tests  *(sonnet)*
**Owns:** `tests/unit/curriculum.test.mjs`
Enforces INV-14..19, INV-35 against `js/levels.js` + `js/themes/index.js` (+ read-only
peek at `js/ui/hud.js` exports for INV-19's single-source rule). Expectations derive
from the design tables in `.claude/rules/levels.md` (the 25-level assignment table)
— encode the level→new-keys and level→game tables as the *test's* fixture, sourced
from the doc, and assert the data files agree. Spellability = compute over key sets,
don't hardcode word lists.

### Lane C — settings unit tests  *(sonnet)*
**Owns:** `tests/unit/settings.test.mjs`
Enforces INV-9, INV-12 (tier values, ratio resolution), INV-27 (kk-settings side)
against `js/settings.js` with stubbed localStorage. Cases: absent key, corrupt JSON,
wrong-type fields, hostile strings → defaults (Adventure, sound ON, CRT ON, Player
One); `applyRowChange` wraps correctly and never mutates into an invalid state;
`DIFFICULTY_MULTIPLIER`/`WIN_RATIO_VALUES` match product.md's documented tiers;
survival flag round-trips but never defaults on.

### Lane D — history-cards + freeplay unit tests  *(sonnet)*
**Owns:** `tests/unit/history-cards.test.mjs`, `tests/unit/freeplay.test.mjs`
Enforces INV-20, INV-21, INV-23 (stubbed localStorage), INV-36. For INV-20 build the
cumulative unlocked-key closure per level from `LEVELS` and validate
`wordToTokens(card.word)` ⊆ closure (Shift-requiring capitals only at/after L24).
`patternMatchesCard` behavioral cases incl. non-matches. Freeplay: every sentence in
`SENTENCES` + all `THEMED` pools tokenizes within `FREEPLAY_KEYS`;
`buildFreePlayPatterns(level)` returns well-formed non-empty token streams for all 25.

### Lane E — wordgen client units + Go extension  *(sonnet)*
**Owns:** `tests/unit/wordgen-client.test.mjs`, `main_test.go` (additive only)
Enforces INV-32 (client side) with scripted fetch: healthy path fills pools with only
valid words; wrong-charset words dropped PER WORD, rest of batch kept; structurally
bad response (non-JSON, wrong shape, oversized) ignored whole; offline/500/timeout →
silent fallback (isActive false, takeWords returns empty/static path, zero throws).
Go side (INV-33): audit `main_test.go` vs security.md rule 7's two failure classes;
add missing cases (e.g. response-size caps, param structure) — do not rewrite passing
tests.

### Lane I — static invariants  *(haiku)*
**Owns:** `tests/static/invariants.test.mjs`
Enforces INV-29, INV-30, INV-31, INV-34. Pure file reads + regex over `js/`,
`index.html`, `scripts/*.sh`. Encode security.md's stated grep checks verbatim as
tests. INV-34: parse each theme file's `export` statements for the six contract
functions. INV-30: any ENTER in a display string must sit inside a `data-enter-key`
element (index.html) or be the `e.key === 'Enter'` handler form (js). Allowlist
comments/docs. Binary pass/fail per file with the offending line in the message.

## Wave 2 — after Lane A lands (cap: 3 concurrent browser lanes)

### Lane F — the sacred input contract  *(opus)*
**Owns:** `tests/integration/input-contract.test.mjs`
Enforces INV-1..7. The heart of the suite. Scenarios: wrong key → same activeToken,
same activeIndex, no advance (INV-1/4); mistake counted once, correct key then
advances with streak/accuracy accounting showing no double penalty (INV-2/3); Shift/
Ctrl/Alt/Meta keydowns alone change nothing (INV-5); lowercase expectation + Shift'd
letter per documented contract, uppercase expectation exact-case (INV-6) — test at a
lowercase level (1) and the Shift level (24 via seeded progress); space and Backspace
tokens at L25 (INV-7). Assert through `readPrompt()`/`readHUD()` only.

### Lane G — no punishment, survival, win gates  *(opus)*
**Owns:** `tests/integration/no-punishment.test.mjs`
Enforces INV-8, INV-10, INV-11, INV-13, INV-22, INV-37. Adventure: no timer track, no
quarters line, wrong keys forever ≠ game over (INV-8). Seed survival settings: timer
present, then hold wrong keys — quarters and timer unaffected (INV-10, the critical
one); reach game over via timeout — warm copy, replay path works (INV-11). Win level
with card mechanism: level does not complete before moment word appeared (INV-22 —
observable via transcript of prompts shown vs. completion). Free Play: WPM shown,
no failure state (INV-37). If runtime allows, `winLevel` at WIZARD-seeded settings
on level 1 proves reachability at 3.5x (INV-12's L2 face).

### Lane H — persistence + onboarding flows  *(sonnet)*
**Owns:** `tests/integration/persistence-onboarding.test.mjs`
Enforces INV-24..28. Raw first-time flow (no wopr): name 16-char cap, overtype
clears default, empty keeps PLAYER ONE (INV-24). Reload mid-progress → continue
screen shows name/level; R → Y/N confirm; N preserves, Y erases (INV-26). Win a
level, replay it, reload → furthestLevel intact (INV-25). Seed corrupt kk-progress
variants → clean boot, no console errors, defaults (INV-27). data-enter-key spans
swapped per platform via `navigator.platform` emulation contexts (INV-28).

## Wave — 2026-10-30 sign-off (INV-130..144; test-engineer lane)

Six game lanes changed behaviour with Trevor's sign-off; the design clauses were written
into `onboarding.md` / `product.md` / `CLAUDE.md` / `act1.md` / `easter-eggs.md` first.
Numbering note: INV-107..127 are held by unbuilt-spec reserved blocks, so this wave takes
130+ (STRATEGY §5, "The 2026-10-30 sign-off wave").

| File | Layer | Enforces |
|---|---|---|
| `tests/unit/key-label.test.mjs` | L1 | INV-133 (`enterLabel`: Mac RETURN, else ENTER, safe with no `navigator`) |
| `tests/static/key-label.test.mjs` | L0 | INV-133 (no `PRESS ENTER`/`ENTER to…` literal in `js/`; the detector is proven to bite on the pre-fix wing strings) |
| `tests/unit/settings-harder-rule-and-labels.test.mjs` | L1 | INV-134 (`previewRowChange` asks only ADVENTURE→SURVIVAL, never writes), INV-138 (word-length rung direction) |
| `tests/unit/riddle-near-miss.test.mjs` | L1 | INV-143 (a typo is never a match; `isNearMiss` guards) |
| `tests/unit/eighth-key-glyph.test.mjs` | L1 | INV-140 (`displayKey(';')` is `;`), INV-29 clarified |
| `tests/integration/saved-game-routes.test.mjs` | L2 | INV-130, 131, 132, 139 |
| `tests/integration/settings-harder-rule.test.mjs` | L2 | INV-134 (only Y keeps SURVIVAL; reload mid-question keeps ADVENTURE) |
| `tests/integration/held-key-and-pattern-gap.test.mjs` | L2 | INV-135, 136 (+ INV-1/3/4 unchanged) |
| `tests/integration/survival-floors.test.mjs` | L2 | INV-137 (10 s floor, 1-quarter spare once per run) |
| `tests/integration/eighth-key-glyph.test.mjs` | L2 | INV-140 (prompt, guide, KNOW YOUR KEYS, finger diagram) |
| `tests/unit/key-cards.test.mjs` | L1 | INV-153, 154, 163, 165, 161 (data half) - keyboard card attachment, fourth bank, research gate, copy fit |
| `tests/integration/key-name-beat.test.mjs` | L2 | INV-155, 156, 157, 160, 161, 164 - the Level 13 beat start to finish (helpers/key-beat.mjs) |
| `tests/integration/key-name-beat-contexts.test.mjs` | L2 | INV-156 (Free Play), 158 (levers), 159 (Survival), 162 (withheld; gallery), 166 (L20 couplet) |
| `tests/integration/history-card-layout.test.mjs` | L2 | INV-141 (all 3 banks; real-win cue visibility) |
| `tests/integration/textworld-2026-10-30.test.mjs` | L2 | INV-142, 143, 144 |
| `tests/integration/cinematic-skip.test.mjs` | L2 | INV-145 (first view unskippable / replay Space+Escape / title card Space only / Full Circle typed char / held key / default unskippable) — ~5 min, test-only page clock |
| `tests/integration/complete-card-cues.test.mjs` | L2 | INV-146 (L4 NEXT LEVEL, L25 TITLE SCREEN, Escape pinned) |
| `tests/integration/name-field-and-prompts.test.mjs` | L2 | INV-147 (rename/first-time name field), 148 (erase prompts), 149 (picker hints) |
| `tests/unit/slots-rename.test.mjs` | L1 | INV-147 (`renameSlot` never changes `active`) |
| `tests/integration/level24-board.test.mjs` | L2 | INV-150 (#1 slot placeholder/live/held, card word never the name) |
| `tests/integration/imfriend-escape-footer.test.mjs` | L2 | INV-151 (footer names Escape's real destination; INV-52 stands) |
| `tests/integration/theme-counters.test.mjs` | L2 | INV-152 (Myst/Out Run/Q*bert counters never exceed their totals) |
| helpers: `draw-recorder.mjs`, `tile-graph.mjs`, `prose-solution.mjs` | — | drawn-strings recorder; engine-equivalent tile BFS; derived prose route |

Driver changes (`tests/helpers/game-driver.mjs`): `readPromptGlyphs` (raw rendered prompt, no
glyph→token translation), `walkToWingDoor` (replaces `toTextWorldDoor`'s blind five-ArrowDown
count), and the stale `;`→`?` comment rewritten (the `?`→`;` map entry is kept so the driver
accepts both; INV-140 is asserted on raw text instead).

## Rules of engagement (all lanes — also in .claude/agents/test-engineer.md)

1. **Never modify game code.** Test files + FINDINGS.md only (your owned files).
2. **Never weaken a test to pass.** Game violates a documented intent → FINDINGS.md
   entry `TF-NN` + `t.todo('TF-NN: …')`. FINDINGS.md is append-only shared — write
   your entries under your lane's heading to avoid conflicts; the orchestrator
   renumbers at close-out.
3. Cite `INV-nn` + source doc in every describe/file header.
4. Run your own file green (`node --test <your files>`) before reporting. Integration
   lanes: your own server, ephemeral port, no `.dev-url`, no `go build`.
5. Report schema: task / status / files_changed / tests_added(count) / findings(TF
   drafts) / issues.
