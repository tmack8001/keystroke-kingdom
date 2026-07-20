# Test Findings Ledger
## Issues surfaced by the behavior-first test suite

*Protocol: STRATEGY.md §6. Each entry is a place where the game as built disagrees
with the documented design intent. The corresponding test is `t.todo('TF-NN: …')` —
green for gating, visible in every run. Trevor triages: FIXED → fix game code, then
un-todo the test; BY-DESIGN → update the design doc and the test together, in that
order.*

*Consolidated at close-out 2026-07-12 from the inaugural 9-lane swarm (Waves 1–2:
268 test cases). Lane-scoped IDs kept stable — they're embedded in the tests' todo
strings. Orchestrator triage notes added; final call is Trevor's.*

**Status key:** OPEN (untriaged) · TRIAGED (direction decided) · FIXED · BY-DESIGN
· DISMISSED (test misread the doc; test corrected, game untouched)

---

## Findings — all triaged and resolved 2026-07-13 (6/6: 4 FIXED, 2 BY-DESIGN)

### TF-H1 — Name-entry input does not clear the pre-filled default on first keystroke
- **Invariant:** INV-24 (onboarding.md §Design Rules for the Opening: "Any key press
  clears the default and starts typing fresh"; transitions.md §Phase 3 same clause.)
- **Status:** FIXED (Trevor triage 2026-07-13) — js/main.js now `select()`s the
  prefilled value at all three name-entry reveal sites (title coin-insert, ready-
  screen Escape, select-screen rename — the rename site also gained the missing
  prefill), so the first typed character natively replaces the default, Backspace
  clears the selection, empty confirm keeps PLAYER ONE. Matches the doc's own
  "selected and ready to be overwritten" phrasing. Test un-todo'd with a real body
  (`TF-H1 fixed: …` in persistence-onboarding.test.mjs) — passes; TF-H2/H3
  assertions untouched and still open. Nuance for the record: Backspace-first
  deletes the whole selected default at once (native selection behavior) — reads
  as "starting fresh"; docs only say "Backspace works normally."
- **Repro:** `tests/integration/persistence-onboarding.test.mjs` →
  `t.todo('TF-H1: ...')` under INV-24 — reveal name entry, press a single letter key.
- **Evidence:** `#player-name-input` is a real `<input>` whose `.value` is set
  directly to `'PLAYER ONE'` (or the saved name) in `js/main.js`, with no
  clear-on-first-keystroke handler and no select-all-on-focus. A real keystroke
  APPENDS (typing `O` produces `"PLAYER ONEO"`, not `"O"`), contradicting both docs.
- **Orchestrator note:** kid-facing impact is real — a child typing their name gets
  a mangled string unless they know to hold Backspace.

### TF-H2 — Name-entry input caps at 16 characters, not the documented 12
- **Invariant:** INV-24 (transitions.md §Phase 3, as written before the ruling)
- **Status:** BY-DESIGN (Trevor triage 2026-07-13: "16 characters should be the
  largest word limit") — game untouched; transitions.md/onboarding.md/STRATEGY.md
  INV-24 updated to 16 first, then the test became a real passing assertion
  (20 typed → exactly 16 kept and confirmed).
- **Repro:** `tests/integration/persistence-onboarding.test.mjs` →
  `t.todo('TF-H2: ...')` under INV-24 — type 20 characters into the name field.
- **Evidence:** `index.html` `maxlength="16"` and `js/settings.js` `sanitize()`
  `slice(0, 16)` agree with each other at 16, but disagree with the doc's explicit 12.
- **Orchestrator note:** plausibly BY-DESIGN drift (16 was chosen at build time);
  either the doc moves to 16 or the game moves to 12 — Trevor's call.

### TF-H3 — Space does not confirm name entry; only Enter does
- **Invariant:** INV-24 (transitions.md §Phase 3, as written before the ruling)
- **Status:** BY-DESIGN (Trevor triage 2026-07-13: "we need to support spaces due to
  'Player One' being the default") — Space TYPES a literal space in the name field
  (two-word names intended); only Return confirms. Wider design note captured in the
  docs: Space remains the deliberate quick-advance key on every OTHER screen
  ("the spacebar is where the thumbs rest continually making it quick to advance") —
  name entry is the single exception because Space is content there, not command.
  Docs updated first, then the test asserts the new intent (typing 'PLAYER TWO' with
  a real Space press works; Space does not confirm).
- **Repro:** `tests/integration/persistence-onboarding.test.mjs` →
  `t.todo('TF-H3: ...')` under INV-24 — type a name, press Space.
- **Evidence:** the name-entry keydown branch in `js/main.js` confirms only on
  `e.key === 'Enter'`; Space types a literal space into the field and the screen
  stays on `title-screen`. Every OTHER screen (title/ready/continue) accepts both —
  an isolated omission on the name-entry branch.
- **Orchestrator note:** counter-consideration for triage: names can't contain
  spaces if Space confirms — but the doc already says exactly that trade-off is
  intended ("Space and Return both confirm"). May be BY-DESIGN if multi-word names
  are wanted; doc must then change.

### TF-3 — Canvas keyboard guide renders the key label 'ENTER' without platform-awareness
- **Invariant:** INV-30 (CLAUDE.md §Platform Key Label — the rule exists because
  "Oona was confused when the UI said ENTER and her keyboard said RETURN")
- **Status:** FIXED (Trevor triage 2026-07-13) — keyboard-preview.js now resolves the
  label via the same `/Mac/` platform ternary main.js uses. **Triage context (Trevor):
  the original Oona confusion was in PROSE instructions, not the keyboard layout** —
  the prose case was already solved by the `[data-enter-key]` swap mechanism; this
  canvas fix is defensive/forward-proofing ("good to call out fixing that as well").
  Lane T3 additionally discovered the label is currently never painted anyway: Enter
  is a `never: true` fog-of-war key on the preview screen, and the fog branch draws
  only a silhouette — so the fix becomes player-visible only if fog styling ever
  changes or another consumer reads the label. Static INV-30 check now passes clean.
- **Repro:** `node --test "tests/static/*.test.mjs"` → INV-30 js check todo.
- **Evidence:** `js/ui/keyboard-preview.js:62` `if (key === 'Enter') return 'ENTER';`
  renders the label to canvas via fillText — on a Mac the on-screen key reads ENTER
  while the physical key says RETURN, precisely the confusion the rule prevents. The
  `[data-enter-key]` DOM swap can't reach canvas text; the fix is a platform-aware
  label at this call site (same `navigator.platform` test main.js uses).

### TF-4 — js/themes/pacman.js missing `miss()` export
- **Invariant:** INV-34 (theme-authoring.md §module contract: every theme exports
  start, stop, keystroke, miss, patternComplete, victory)
- **Status:** FIXED (Trevor triage 2026-07-13) — `miss()` added: the non-eaten ghost
  nearest Pac-Man does a comic double-take (reverses direction + brief frightened-blue
  flinch fading over ~0.4s) — the softened one-ghost form of the real game's iconic
  power-pellet reversal (wiki-grounded: research/wiki/games/pac-man.md). Bounded
  (flinch clamped, one ghost only, never touches the dots win gate or the prompt),
  frame-verified from a real engine session: response visible on miss, zero residue
  after 10 rapid misses, letter stays waiting throughout. Orchestrator reviewed the
  proof frames directly.
- **Repro:** `node --test "tests/static/*.test.mjs"` → INV-34 theme-contract todo.
- **Evidence:** Pac-Man exports 5 of 6 contract functions; `miss` is absent.
- **Orchestrator correction to the original evidence:** this does NOT crash at
  runtime — the engine guards (`if (theme && theme.miss) theme.miss()`,
  js/main.js:619). The actual defect: Level 3 gives no gentle ambient theme response
  on a wrong key (theme-authoring.md's miss() contract), a game-feel gap, not a bug
  crash. Corroborated independently by Lane B while building the registry test.

### TF-E1 — Ollama response structure validation lacks a size cap before line-splitting
- **Invariant:** INV-32/INV-33 (security.md rule 7: "validate the STRUCTURE of
  external data (response shape, field types, size caps…)"); main.go
  `parseGenResponse`/`splitLines`.
- **Status:** FIXED + EXPANDED (Trevor triage 2026-07-13) — new request-declared
  `maxWordLength` param on /api/wordgen (absent → 8, byte-identical; malformed → 400;
  clamped to min(requested, 8) so a request can never widen words past play logic),
  plumbed into the Ollama prompt AND re-enforced in validateWords. Structure layer
  now caps per-line length (32 bytes, class A per-item drop) and whole response body
  (class B whole-batch reject) with io.LimitReader bounding the decoder. Client
  declares maxWordLength=8 and its own filter aligned from 12 → 8 (one contract both
  sides). security.md rule 7 updated. Live-smoked: maxWordLength=4 returned only
  ≤4-letter words. The TF-E1-documenting Go subtest flipped to assert the caps.
- **Repro:** `TestParseGenResponse/single_unbounded_line_is_NOT_size-capped_at_the_structure_layer_(TF-E1)`
  in `main_test.go` — a single-line 200,000-char `/api/generate` body is fully
  decoded and returned as one 200,000-char "word" by the structure layer.
- **Evidence:** `maxParsedLines` (100) bounds line *count* but nothing bounds
  per-line/response byte size at the structure-validation step. No unsafe content
  reaches a child (`validateWords`' 2–8 length filter drops it downstream) — a
  defense-in-depth gap at the layer the doc names, not a content leak.

## Act 6 — Text Worlds (2026-07-14, test-engineer lane)

### TF-T1 — Escape from the maker's ALIVE ("wake") state silently drops the completion record
- **Invariant:** INV-47 (maker.js's own accepted-key list: `if (alive) { if
  (['Enter', ' ', 'Escape'].includes(e.key)) finish(); ... }`); adjacent to
  INV-44 ("completing a text world ... records `{ [id]: { completed: true } }`")
  and INV-46 (anti-trap — the player must not silently lose progress on the way
  out, even though they are not literally trapped here).
- **Status:** FIXED 2026-07-14 — the hub now credits a WON world on ANY exit.
  Each engine (`engine.js`/`tileworld.js`/`maker.js`) exports `hasWon()`;
  `hub.js`'s `returnToMenu()` calls `onWorldComplete(currentId)` when
  `hasWon()` is true, so Space/Enter, the auto-return, AND Escape all record the
  completion. `maker.js`'s now-dead `'Escape'` finish-key was removed to match
  `tileworld.js`. The `t.todo` was flipped to a passing assertion (Escape after
  `wake` records the completion). Winning always counts, however you leave.
- **Repro (original):** `tests/integration/textworld.test.mjs` (was `t.todo('TF-T1: ...')`) under
  the "INV-47 — YOUR OWN WORLD" describe block. Manually: enter YOUR OWN WORLD,
  place 3 things, type `wake`, then press **Escape** (not Space/Enter).
- **Evidence:** `js/textworld/maker.js`'s `handleKey` explicitly lists
  `'Escape'` among the keys that call `finish()` (→ `onComplete()` → the hub's
  `onWorldComplete('maker')` + `returnToMenu()`) while `alive === true`. But
  `js/textworld/hub.js`'s coordinator intercepts Escape **unconditionally** for
  every active world one layer up, before the world's own `handleKey` ever
  runs: `if (mode === 'world') { if (e.key === 'Escape') { returnToMenu();
  return; } if (activeWorld) activeWorld.handleKey(e); return; }`. hub.js's
  `returnToMenu()` calls only `activeWorld.stop()` — it never calls the
  world's `handleKey`/`finish()`, so `onComplete()` (and therefore
  `recordTextWorldComplete('maker')`) never fires. Verified live: typing the
  full wake sequence then pressing Space records
  `kk-progress.textWorlds.maker.completed === true`; the identical sequence
  ending in Escape instead leaves `kk-progress` with no `textWorlds` key at
  all, even though the screen visually and correctly lands back on the hub
  menu (not a hang — INV-46's literal anti-trap promise still holds; only the
  earned record is lost). Contrast: `tileworld.js`'s own `won` handler
  deliberately omits `'Escape'` from its accepted-key list (`if (won) { if
  (['Enter', ' '].includes(e.key)) finish(); return; }`) — the tile-world
  authors avoided exactly this trap; maker.js's inclusion of `'Escape'` looks
  like an intentional design match to its own on-screen text's spirit but is
  currently dead code shadowed by the hub, making the UI's implicit promise
  ("Escape always gets you out, same as everywhere else in the wing") true for
  navigation but false for the achievement record. The on-screen prompt text
  itself only ever says "SPACE / ENTER: back to the arcade" (never mentions
  Escape), so no *displayed* string is contradicted — but the code's own
  accepted-key list disagrees with its own effective behavior.
- **Orchestrator note:** low kid-impact severity (nothing breaks, nothing traps,
  the child sees their world regardless) but a real silent-progress-loss bug —
  a natural "Escape to leave" habit (reinforced by literally every other exit
  in the wing) quietly forfeits the one achievement this world offers. Two
  candidate fixes for Trevor's call: (a) have hub.js's world-mode Escape
  handler give the active world first refusal (call `activeWorld.handleKey(e)`
  when the world reports it wants to intercept Escape, e.g. via an `isActive()`-
  style query or a small `wantsEscape()`/`consumesEscape()` capability), or (b)
  simplify maker.js's own list to `['Enter', ' ']` (matching tileworld.js) and
  accept that Escape here means "leave without a completion," documenting that
  explicitly. (a) preserves the apparent intent of the current code; (b) is the
  smaller, more conservative change and mirrors the pattern the tile worlds
  already use safely.

## Save Slots (2026-07-19, test-engineer lane — history-card + save-system rebuild)

### TF-S1 — `Slots.ensureMigrated()` throws when localStorage is unavailable (private-mode style)
- **Invariant:** INV-27/INV-60 (security.md rule 4: "localStorage is untrusted
  input... tolerate garbage... Writes never throw"; js/slots.js's own header
  comment: "Every read parses inside try/catch, validates shape field-by-field,
  and tolerates garbage by falling back to a safe default... Writes never throw —
  localStorage being unavailable (private mode) degrades to an in-session-only
  game, exactly like the old single-save did.")
- **Status:** RESOLVED 2026-07-19 — `ensureMigrated`'s first `localStorage.getItem`
  is now wrapped in try/catch (js/slots.js): a throwing localStorage returns early
  (nothing to migrate), so `boot()` no longer breaks in private-browsing mode. The
  `t.todo` placeholder was promoted to a live `assert.doesNotThrow` assertion.
- **Repro (now a passing regression test):** `tests/unit/slots.test.mjs` → "TF-S1:
  ensureMigrated tolerates a throwing localStorage" under "garbage
  tolerance — corrupt/malformed kk-slots never crashes, never bricks the picker".
  Install a `localStorage` stub whose `getItem`/`setItem`/`removeItem` all throw,
  then call `Slots.ensureMigrated('PLAYER ONE')`.
- **Evidence:** every other read in slots.js wraps its `localStorage.getItem` call
  inside a `try { ... } catch` (e.g. `readState()`'s
  `JSON.parse(localStorage.getItem(SLOTS_KEY))`), but `ensureMigrated`'s very
  first line is a bare, unguarded call:
  `if (localStorage.getItem(SLOTS_KEY) !== null) return; // already slotted`
  (js/slots.js, top of `ensureMigrated`). With a throwing localStorage (private
  browsing in some engines, storage quota/security errors) this line throws
  synchronously, and since `ensureMigrated` is called unconditionally from
  `js/main.js`'s IIFE boot sequence (`Slots.ensureMigrated(settings.playerName)`,
  called BEFORE any try/catch in `boot()`), the exception would propagate out of
  the boot IIFE itself — the one path in the whole persistence layer that isn't
  defensive, at the one moment (first script load) where a crash is most visible.
  Every other function exercised in the same test (`anySlotExists`, `createSlot`,
  `getProgress`, `saveProgress`, `collectCardId`, `collectedCount`,
  `eraseActiveSlot`) degrades gracefully with the identical throwing stub — this
  is an isolated omission on the one function that also happens to run first.
- **Orchestrator note:** low realistic severity (this specific browser
  configuration — storage APIs present but every call throwing — is rare, and
  `readState()`'s own defensive read a few lines later would have caught it if
  the guard were folded into a try/catch, or removed in favor of just calling
  `readState()`), but it is a genuine, narrow contradiction of the module's own
  documented "writes never throw" / "every read... tolerates garbage" promise,
  worth a one-line try/catch around that guard clause.

## Dismissed at close-out (test misread the doc; tests corrected 2026-07-12)

### ex-TF-1 — index.html "ENTER YOUR NAME" — DISMISSED
CLAUDE.md's rule targets ENTER "as a key-press instruction" (the key label). Here
ENTER is the plain verb with an object — ordinary language, not a key reference.
Static test refined to allow verb usage (`ENTER <word>`); key-label usage stays
flagged.

### ex-TF-2 — js/main.js enterLabel ternary — DISMISSED
That line IS the mechanism CLAUDE.md's rule mandates ("main.js replaces all
[data-enter-key] elements with RETURN on Mac, ENTER elsewhere") — the swapper must
contain both label literals. Static test now exempts a line containing both
'RETURN' and 'ENTER' literals.

## Infrastructure (not game defects)

### INFRA-A1 — `node --test <dir>/` fails on Node 26.4.0 — FIXED
- **Status:** FIXED at close-out 2026-07-12 — Makefile targets and STRATEGY.md §8
  now use the quoted-glob form (`node --test "tests/<layer>/*.test.mjs"`), verified
  green. (Node 26 treats a bare directory positional as a module entry point.)

## Driver follow-ups (tests/helpers/game-driver.mjs — tracked in ROADMAP §3)
- Concurrency flake: under `--test-concurrency=3`, 4 tests failed (null prompt
  tokens at winLevel start; continue-screen asserts catching title-screen) that are
  green serially — the driver's settle/grace windows assume an unloaded machine.
  Makefile pinned to serial 2026-07-12; harden waits (wait-for-screen, readiness
  polls with generous deadlines) before re-parallelizing.
- `toLevel(n)` can land on the KNOW YOUR KEYS screen instead of game-screen at
  later levels (fixed press counts vs wait-for-screen); Lane F ships a local
  `ensureGameScreen()` workaround — promote it into the driver.
- `readHUD().wpm` can't distinguish "line hidden" from "shown but `--`" (Lane G).
- `startGame({progress})` seeds via addInitScript which re-applies on every reload —
  tests observing the game's own writes across reload must seed live instead (Lane H
  ships a local `seedProgressLive()` — promote it into the driver).
- The wopr bypass sets `selectBypass` (all cabinets unlocked), so cabinet-lock
  gating has no driver-observable path; INV-25 is asserted via the continue screen
  (the surface onboarding.md documents).
