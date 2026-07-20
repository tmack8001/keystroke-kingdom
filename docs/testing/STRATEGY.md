# Testing Strategy
## Keystroke Kingdom — behavior-first test architecture

*Authored 2026-07-12. This is the architectural document: what we test, why, at which
layer, and the doctrine every test must follow. The concrete per-file build plan the
test swarm executes lives in [`TEST-PLAN.md`](TEST-PLAN.md); issues the tests surface
live in [`FINDINGS.md`](FINDINGS.md); the always-loaded working rules live in
`.claude/rules/testing.md`.*

---

## 1. Purpose — tests as executable design documents

Every future change to this game — agentic or human — must satisfy the design intent
that Trevor and Oona have already settled: the One Rule, the sacred wrong-keypress
behavior, the curriculum's key progression, the no-punishment settings model. Today
that intent lives in prose (product.md, CLAUDE.md, levels.md) and is enforced by
review. This suite makes it enforced by machine: **each test is a design-doc clause
rendered executable.** A change that breaks a test has either broken the design or
discovered that the design doc is wrong — both are conversations, never silent drift.

Corollary: **a test without a design source is not allowed.** Every test block cites
the document and clause it enforces in a comment. If you cannot name the source, you
are testing an implementation accident, and the test must not be written.

## 2. The doctrine — test intent, not implementation

The failure mode this strategy exists to prevent: tests that freeze the current code
shape, so any refactor breaks fifty tests while an actual design violation passes.

**Required:**
- Tests interact through the same surfaces the player or the module consumer uses:
  public ES-module exports (unit), real keydown events and visible screen state
  (integration), HTTP requests (Go server).
- Expected values derive from the design docs or from the game's own data files —
  never re-derived by copying constants out of engine code. (Example: "Level 3 has no
  spellable words" comes from computing vowel-emptiness over `LEVELS[3].keys`, not
  from asserting the word pool equals some hardcoded array.)
- Assert observable outcomes: "the prompt did not advance," "the streak reset to 0,"
  "no quarter was lost," "the word is spellable with exactly this level's keys."

**Prohibited:**
- Asserting a private function was called, call order, or internal state shape.
- Mock-heavy tests where the mock re-implements the thing under test.
- Pixel/geometry assertions on canvas art (that is `visual-validation.md`'s job, and
  it is a human-reviewed screenshot pass, deliberately).
- Timing-exact assertions (animation durations, debounce windows) — assert ordering
  and eventual state, not milliseconds.
- Tests that would fail under a pure refactor (rename, file split, data structure
  swap) that preserves player-visible behavior.

**When a test fails against the current game:** the test author must consult the
design docs and decide which is wrong — the game or their reading. If the game
violates documented intent, that is a **finding**, not a fix: record it in
`FINDINGS.md` (numbered `TF-NN`), mark the test `t.todo('TF-NN: …')` so the suite
still gates green, and leave the game code untouched. Never weaken a test to match
the code; never "fix" the game to match a test without Trevor's review. (This is the
mechanism by which this suite is expected to surface its first dozen real issues.)

## 3. Layers

| Layer | What it guards | Runner | Speed |
|---|---|---|---|
| **L0 — Static invariants** | Greppable contracts: security rules (security.md), no hard-coded "ENTER" display strings, no "semicolon" in player-facing text, theme module contract exports, no external network calls | `node --test "tests/static/*.test.mjs"` | < 2s |
| **L1 — Unit (data & logic)** | Pure/near-pure modules: curriculum integrity (`levels.js`), word-bank spellability, settings model, history-card guarantees, freeplay builders, wordgen client validation chain | `node --test "tests/unit/*.test.mjs"` | < 5s |
| **L2 — Behavioral integration** | The engine as the player experiences it, in a real headless browser: the sacred input contract, no-punishment invariants, survival opt-in semantics, persistence flows, onboarding | `node --test "tests/integration/*.test.mjs"` (Playwright inside) | ~1–3 min |
| **L3 — Go server** | wordgen validation chain, param parsing, structure validation (exists: `main_test.go`) | `go test ./...` | < 5s |

Existing QA tooling is complementary, not replaced: the recorder
(`scripts/record-playthrough.js`) proves human-paced winability with video evidence;
`docs/screenshots/` + `visual-validation.md` guard visual composition;
`docs/a11y/audit.js` guards contrast. This suite guards **rules and behavior**.

### Why the engine is tested at L2, not L1

`js/main.js` is a deliberate monolith wired to the DOM at import time. Unit-testing
it would require either refactoring the game to be testable (changing the product to
satisfy the tests — exactly backwards) or stubbing so much DOM that the test mocks
the game. Instead the engine is tested through the real browser at the real event
boundary — which is also the only place the *intent* ("the letter stays and waits")
is actually observable. Data modules (`levels.js`, `settings.js`, `history-cards.js`,
`freeplay.js`, `wordgen.js`) export cleanly and are unit-tested directly.

## 4. Tooling decisions

- **Runner: Node's built-in `node:test`** (Node 26 is already a Brewfile dep). Zero
  new dependencies, no package.json, no npm install step — consistent with the
  bespoke-engine ethos and keeps the repo static-servable. `.mjs` test files import
  the game's ES modules directly.
- **Browser: Playwright chromium** from the existing module path, reusing
  `scripts/kk-playwright.js` conventions through a shared driver
  (`tests/helpers/game-driver.mjs`). The driver serves the repo itself via a Node
  static server on an **ephemeral port** — never `.dev-url`, never a shared port
  (journal L9/L32).
- **Stubs: hand-rolled, minimal** (`tests/helpers/stubs.mjs`): an in-memory
  `localStorage` and a scriptable `fetch`. No jsdom/happy-dom — if a unit test needs
  more DOM than that, it belongs at L2.
- **Concurrency:** integration files run SERIALLY (`--test-concurrency=1`).
  Three concurrent chromiums proved flaky on 2026-07-12 — renders starve past the
  driver's grace windows (headless browsers are a process budget — journal L32);
  the suite is green serially in ~6 min. Re-parallelize only after the driver
  hardening in FINDINGS.md §Driver follow-ups.
- **Go:** stock `go test`, already wired.

Brewfile impact: **none new** — `node`, `go`, `python3` (recorder smoke), `jq`
already cover the suite. The Brewfile comments note the test roles.

## 5. Invariant catalog

The authoritative list of what the suite enforces, organized by design source. Test
files cite these IDs. (L0/L1/L2/L3 = layer.)

### The One Rule & input contract — product.md §Core, CLAUDE.md §Wrong Keypress, §Engine input contract
- **INV-1** (L2) Wrong key → letter stays on screen and waits; prompt does not advance. — *sacred*
- **INV-2** (L2) Wrong key → mistake logged quietly (per-letter); no alarming display by default.
- **INV-3** (L2) Correct key after wrong key → advances normally, no double penalty (streak/accuracy accounting matches one mistake, one advance).
- **INV-4** (L2) Wrong keypress never skips ahead — sequence position is monotonic in correct presses only.
- **INV-5** (L2) Pure modifier keydowns (Shift, Ctrl, Alt, Meta alone) are ignored entirely — never a mistake.
- **INV-6** (L2) Case sensitivity applies ONLY when the expected token is uppercase A–Z; lowercase expectations accept the letter regardless of Shift state per the documented contract.
- **INV-7** (L2) Token vocabulary honored: lowercase chars/digits/symbols, uppercase A–Z as Shift+letter exact-case, `' '`, `'Backspace'`.

### No punishment by default — product.md §Core Principles, §Toggleable Settings
- **INV-8** (L2) Adventure (default): no lives counter, no countdown timer visible or active.
- **INV-9** (L1) Survival is opt-in: fresh/garbage/absent settings always resolve to Adventure.
- **INV-10** (L2) In Survival, wrong keys cost nothing — quarters and timer are unaffected by a wrong keypress (time pressure only).
- **INV-11** (L2) Survival game-over is warm and offers replay/exit — never dead-ends.
- **INV-12** (L1) EXPERIENCE tiers scale required play (1 / 1.5 / 2.25 / 3.5) and the win gate remains reachable at every tier (engine pattern pool refills infinitely; wired themes scale targets, never geometry).
- **INV-13** (L2) `patternComplete()` once won stays won (no regression on re-ask).

### Curriculum integrity — levels.md, CLAUDE.md §Levels, §Word Bank Principle
- **INV-14** (L1) Exactly 25 levels; union of all `keys` = the full taught keyboard; each level's new keys match the levels.md table.
- **INV-15** (L1) Levels 1–3 have no spellable real words (key set has no vowel) — pattern drills only; no pattern in L1–3 pools contains a vowel.
- **INV-16** (L1) Every pattern/word in a level's pool uses only keys unlocked at or before that level (cumulative key-set closure).
- **INV-17** (L1) Arcade cabinet rule: one game per level, no title reused across levels.
- **INV-18** (L1) Level 4's pool contains real readable words (the double-win moment exists).
- **INV-19** (L1) `FINGER_MAP`/`KEY_REACH` cover every taught key exactly once per hand/finger assignment; keyboard geometry has one source of truth (`hud.js KEY_LAYOUT`) — preview derives, never redefines.

### History cards — product.md §History Cards, research/computing-history-moments.md, js/history-cards.js, js/slots.js
*(revised 2026-07-19 — the single-card-per-level object was rebuilt into a flat list
where a level may hold a rotating POOL of several cards, `id`-addressed; collection
ownership moved out of history-cards.js entirely into the per-save-slot store,
`js/slots.js`. The bank is still growing — TOTAL_CARDS is 42 as of this revision and
climbing; never hardcode a count, always derive it from `HISTORY_CARDS.length`.)*
- **INV-20** (L1) Every non-secret card's moment word is typeable with exactly its
  `level`'s cumulative unlocked key set (tokenization included — capitals only where
  Shift is unlocked at/after L24, spaces only where Space is unlocked at/after L25) —
  iterated over the flat `HISTORY_CARDS` list keyed by each card's own `level` field,
  never a hardcoded per-level table.
- **INV-21** (L1) `TOTAL_CARDS === HISTORY_CARDS.length` (never a copied constant —
  the bank keeps growing); every non-secret card's `level` is a real level (integer
  1–25) that exists in `LEVELS`; every card `id` is unique across the whole list
  (secret cards included).
- **INV-22** (L2) A level does not end before its moment word has appeared (guarantee
  mechanism) — unchanged by the rebuild (the engine still injects exactly one
  guaranteed card word per play, see INV-58).
- **INV-23** (L1/L2) Card collection persists across sessions PER SAVE SLOT
  (`js/slots.js` `kk-slots`, keyed by stable card `id`, never a level number); garbage/
  corrupt storage is tolerated silently and degrades to an empty collection for that
  slot, never a crash.

### Persistence & onboarding — onboarding.md, CLAUDE.md §Returning-player persistence
- **INV-24** (L2) Name entry: 16-char cap; empty confirm keeps PLAYER ONE; any key clears the pre-filled default; Space types a literal space (multi-word names, like the default), only Return confirms.
- **INV-25** (L2) `furthestLevel` never regresses (replay, revisit, reload).
- **INV-26** (L2) Erase requires explicit Y; N or any other key preserves progress.
- **INV-27** (L1/L2) `kk-progress` and `kk-settings` parse defensively: corrupt JSON, wrong shapes, and hostile strings degrade to defaults, never crash, never reach a DOM sink.
- **INV-28** (L2) Platform key label: Mac shows RETURN, others ENTER, via `[data-enter-key]`; handler is `e.key === 'Enter'` everywhere.

### Language & content rules — CLAUDE.md, security.md
- **INV-29** (L0) The word "semicolon" never appears in player-facing strings (index.html text, JS string literals rendered to players; the eighth key rule).
- **INV-30** (L0) No display string hard-codes ENTER outside `[data-enter-key]` wrappers.
- **INV-31** (L0) Security greps hold: no `eval`/`new Function`/string timers; `playerName` (and any user-influenced value) never meets `innerHTML`/`insertAdjacentHTML`/`document.write`; no external network calls in js/ (only same-origin `/api/*`).
- **INV-32** (L1) Free-text → pattern-stream boundary allowlists (`buildPlayerNamePattern` strips to `[a-zA-Z]`; wordgen chain: charset ⊆ level keys, length caps, blocklist, lowercase, dedup; structurally bad batches dropped whole).
- **INV-33** (L3) Server-side wordgen mirrors the same chain (exists; keep green and extend).

### Theme contract — theme-authoring.md
- **INV-34** (L0) Every `js/themes/*.js` (except `index.js`) exports the full module contract: `start`, `stop`, `keystroke`, `miss`, `patternComplete`, `victory`.
- **INV-35** (L1) Themes registry covers all 25 levels; no theme is assigned to two levels.

### Free Play — product.md §Free Play
- **INV-36** (L1) Every Free Play sentence is typeable with `FREEPLAY_KEYS` (full taught keyboard); builder output is well-formed token streams.
- **INV-37** (L2) WPM is displayed, never enforced — no failure state exists in Free Play.

### Word-length difficulty lever — product.md §Toggleable Settings (Visual/word-content siblings of EXPERIENCE), settings.js `getWordLengthRange`, CLAUDE.md §One Rule
- **INV-38** (L2) The player-set WORD-LENGTH range (settings.js `getWordLengthRange`) filters ONLY a level's drawable real-word pool: when a bounded range is honorable at a level, observed POOL prompts fall within `[min,max]` — while EXEMPT content (intro drills, history-card word, name-moment/L24-name pattern) is never filtered and may be any length. Default (ANY/ANY) → behavior unchanged.
- **INV-39** (L2) Winnability is the One Rule floor: NO (min,max) the settings UI allows can hang a level — an impossible range (e.g. `min` above every pool word's length) silently falls back to the level's unfiltered pool and the level STILL WINS, with zero console errors (the empty-pool draw crash is guarded).
- **INV-40** (L2) Guaranteed content survives the filter: at a level with a history card, even an impossible word-length range still lets the card's moment word appear and the level complete (cards are earned, never missable — the filter is pool-only).
- **INV-41** (L1/L3) Wordgen carries the setting-derived length window: the client sends `minWordLength`/`maxWordLength` from `getWordLengthRange()` clamped to the play-logic window `[2,24]` (ANY-floor→2, ANY-cap→24, default = current behavior), never the player name; the Go server parses both symmetrically (malformed→400, superset-bounded, min>max coerced so the window never inverts) and enforces them in both the Ollama prompt and `validateWords`. The ceiling is 24. **The prompt framing is length-aware** (`buildGenPrompt`): a long-word floor drops the early-reader framing and asks for harder vocabulary — measured, because the fixed early-reader framing suppressed long words (1/111 ≥13 letters) while the length-aware one yielded them; safety + charset rules hold at every tier.

### Act 6 — Text Worlds (guided command matcher) — product.md §Core Principles (the One Rule), memory act6-mastery-wing-idea, docs/ROADMAP.md §2 "Act 6 — Text Worlds"
- **INV-42** (L2) The guided command matcher honors the One Rule exactly like the pattern engine: a key that would make the typed buffer NOT a prefix of any command the current room OFFERS is REJECTED — the command line stays and waits, never advances, never fires a command, and self-correction (Backspace) is always available. An exact, unambiguous match among offered commands auto-fires. (product.md §"Reinforce, Don't Punish"; CLAUDE.md §Wrong Keypress Behavior, extended by design to the text-world's typed-command surface — engine.js's own header comment: "A wrong key does the same thing the pattern engine does.")
- **INV-43** (L2) A room-offered command gated by `when(api)` is not matchable (any prefix of it is rejected) until its predicate holds, and stops being matchable once the predicate becomes false again (e.g. `take lamp` disappears from the offered set the instant the lamp is taken) — the guided-hint surface always reflects only currently legal actions.
- **INV-44** (L1/L2) Persistence: `getProgress()`'s `textWorlds` field tolerates garbage (non-object, corrupt JSON, absent key) and degrades to `{}`, never throwing; completing a text world (engine `goal(api)` true → `onComplete`) records `{ [id]: { completed: true } }` in that namespace and the record survives a reload; an incomplete or abandoned attempt (Escape, or a run of only-rejected keys) records nothing.
- **INV-45** (L2) *(revised 2026-07-17 — the tile worlds were rebuilt from tiny 15×9 single-key mazes into big, screen-chained, TYPED-movement worlds; arcade-historian-grounded — `research/wiki/tech/ascii-overhead-world-conventions.md` — after single-key n/s/e/w was flagged historically inauthentic)* Each tile world (THE GLIMMER DEEP `id:'cave'`, THE WHISPERWOOD `id:'forest'`) honors the same One Rule via a TYPED guided prefix-matcher (see INV-53), not a single literal keypress. A move into any non-walkable glyph OR off a map edge with NO linked exit is REJECTED — the player's grid position does not change, nothing fires, nothing crashes (tileworld.js header: "walls just stop you with a gentle nudge — no death, no loss, no timers"). A move into open floor advances the player; a move off a LINKED edge crosses into the adjacent screen (each world is ~46×16 × 3 screens chained by MegaZeux-style edge-exits, landing at the nearest walkable perpendicular tile). Reaching the goal triggers that world's reveal (`won=true`) exactly once and records its OWN id in `kk-progress.textWorlds`; both worlds are independently solvable. The key revision: solvability is now proven by an engine-equivalent BFS over each world's own screens/exits/glyphs data with EVERY gate closed and EVERY riddle unsolved (an always-open corridor spans all three screens) — the old "south then east, left column always open" note is replaced by "the goal is always reachable WITHOUT opening any gate or solving any riddle" (the One-Rule floor, see INV-55).
- **INV-46** (L2) **Anti-trap (One Rule, safety-critical):** the player can ALWAYS leave a Text World back toward the arcade — Escape from an active world (prose, tile, or maker) returns to the hub's chooser MENU (not a frozen/dead screen — the menu is immediately re-enterable: arrow keys move the cursor, Enter/Space re-enters a world); Escape from the menu itself invokes `onExit`, returning to the arcade's select screen at the door. The full chain world → hub menu → arcade is reachable from every world offered by the hub, every time — no state exists in the wing from which Escape fails to make progress toward the arcade. (hub.js's own coordinator contract; product.md's One Rule — "never with punishment" extends to "never trapped.")
- **INV-47** (L2) *(added 2026-07-14)* **YOUR OWN WORLD** (`js/textworld/maker.js`) honors the same guided-matcher One Rule as INV-42, applied to its own fixed word palette: a key is appended to the typed buffer only if it keeps the buffer a prefix of some currently `offered()` word — the FIXED vocabulary allowlist (`VOCAB` keys, tiered, plus `wake` once `placed>=3`) is therefore the entire input surface and no free text can ever be typed (security.md rules 1–3/6: "NO free-text/untrusted-input surface here"). A key outside every offered prefix is REJECTED (gentle nudge, buffer unchanged, nothing placed); an exact unambiguous match places a thing and increments its count (`placed`); typing `wake` (offered only once `placed>=3`) sets `alive=true`; while `alive`, leaving via the documented on-screen key (Space/Enter — module's own drawn text: "SPACE / ENTER: back to the arcade") records the completion and hands control to the hub. *(TF-T1, FIXED 2026-07-14: the hub now credits a WON world on ANY exit — `hub.js returnToMenu()` calls `onWorldComplete()` when the engine's `hasWon()` is true, so Space/Enter, the auto-return, AND Escape all record the completion; maker.js's now-dead `'Escape'` finish-key was removed. Winning always counts, however you leave. See FINDINGS.md.)*

### Act 6 — Text Worlds: the IM-friend (world 5 of 5) — docs/handoffs/im-friend-build.md §3/§6, product.md §Core Principles (the One Rule), `.claude/rules/security.md` rules 3/6-8 + its 2026-07-14 PII-floor exception, module headers (`js/textworld/imfriend.js`, `js/textworld/personas.js`, `js/chat.js`)
*(added 2026-07-14 — the 5th Text World, a chat with a local-LLM-powered friend)*
- **INV-48** (L2) **Chat send/receive loop:** submitting a message (typing then Enter) appends the child's line to that friend's transcript, and — on a reply the client resolves as successful — appends the friend's reply line right after it, in order, in the persisted `kk-friends` transcript. (imfriend.js header: "an IM window: the scrolling message log ... a prompt bar; Enter sends"; im-friend-build.md §3: "Transcript = the friend's MEMORY, persisted ... replay it to Ollama each turn".)
- **INV-49** (L1/L2) **Untrusted-input allowlisting (the make-a-friend NAME/LOVES fields):** a keystroke that is not a letter or space is REJECTED at the point of entry — gentle nudge, the typed buffer is left unchanged, nothing is appended (imfriend.js `handleMake`: "Live allowlist: only letters + spaces enter a persona field — the same set personas.sanitizeField keeps") — the One Rule's wrong-key contract (product.md §"Reinforce, Don't Punish") applied to this surface. The same allowlist (`personas.js` `sanitizeField`/`validateName`/`validateLoves`) is re-applied before persistence, so even a maximally-adversarial commit degrades to letters/spaces only, capped, with a warm fallback (`'Buddy'`) when nothing survives — never a crash, never a stored non-letter character. KIND and TEMPERAMENT remain fixed choice lists (arrow-selected, no free text at all — safe by construction, per `personas.js` header). (security.md rules 3, 7.)
- **INV-50** (L2) **Graceful offline fallback:** when `/api/chat` is unreachable (transport error, non-2xx) OR responds successfully but with a reply that resolves empty, the friend "naps" with one of ITS OWN scripted in-character lines (`personas.js` `CURATED[*].nap` via `offlineReply`) rather than an error, a blank line, or any broken state (im-friend-build.md §3: "if Ollama is asleep, the friend gently 'naps' ... never broken"; `js/chat.js` header: "the caller treats `{ok:false}` as 'nap'").
- **INV-51** (L1/L2) **Memory persistence + resume:** a friend's transcript persists to `kk-friends` and is genuinely RELOADED (not merely left on disk untouched) across a page reload — a message sent after reload coexists with every message sent before it, never silently dropping prior history (im-friend-build.md §3: "resumes across game launches and remembers past chats"). `kk-friends` tolerates garbage (corrupt JSON, a non-object value, a malformed per-friend shape) and degrades to `{}` without throwing, same posture as `kk-progress`/`kk-settings` (security.md rule 4). "Forget this friend" (picker `x` → Y/N confirm) erases only the targeted friend's record — every other friend (curated or made) is left intact — and ONLY on an explicit `Y`; any other key cancels with nothing erased (imfriend.js `handleForgetConfirm`; security.md rule 8's 2026-07-14 PII-floor exception, whose stated "safety valve" this is).
- **INV-52** (L2) **Anti-trap + engagement crediting** (extends INV-46 to the IM-friend's own sub-views): from EVERY imfriend view (picker, make, chat) Escape is owned by the hub, exactly as for every other world — no imfriend sub-view can intercept or swallow it (imfriend.js header: "Escape is intercepted by the hub ... so leaving always makes progress toward the arcade"). Per hub.js's `hasWon()`-driven crediting (the INV-44/TF-T1 mechanism, generalized to this 5th world): the child actually engaging — sending at least one chat message, OR completing the make-a-friend flow — records `textWorlds.imfriend.completed` on exit by ANY route (Space/Enter equivalent or Escape); merely entering and leaving without engaging records nothing.

### Act 6 — Text Worlds: the tile-world redesign — product.md §Core Principles (the One Rule), `research/wiki/tech/ascii-overhead-world-conventions.md`, module headers (`js/textworld/tileworld.js`, `js/textworld/tile-worlds.js`)
*(added 2026-07-17 — the two tile worlds were rebuilt much bigger and grounded: typed movement, chained screens, fog-of-war, authored riddle creatures. INV-45 above was revised in the same pass.)*
- **INV-53** (L2) **Typed movement prefix-matcher** (tileworld.js copies engine.js's guided prefix-matcher): the child TYPES a direction — `up`/`down`/`left`/`right` (shown, mastery-fading) plus aliases `n`/`s`/`e`/`w` and `north`/`south`/`east`/`west`. A key is appended only while the buffer stays a prefix of some offered direction; a key outside every offered prefix (and every alias) is REJECTED with a gentle nudge and the buffer WAITS — it is never reset, so completing the same word afterward still fires the move (the One-Rule wrong-key contract, product.md §"Reinforce, Don't Punish"). An exact unambiguous direction fires a move; a single-letter alias fires instantly from an empty buffer and silently swallows the rest of the word it abbreviates (typing the full `north` after `n` already fired never corrupts the buffer). Backspace edits; Space/non-letters are ignored in move mode (never a nudge). Verified end-to-end: a world still WINS after a Backspace probe, an alias-swallow probe, and a mid-word prefix-break-then-complete probe — the only way that happens is if the buffer behaves exactly as documented.
- **INV-54** (L1/L2) **Fog-of-war data integrity** (tileworld.js `glyphSpec`; `research/wiki/tech/ascii-overhead-world-conventions.md`): the tile worlds render roguelike lit/dark fog — undiscovered tiles hidden, ever-seen tiles remembered dim, the torch radius lit via line-of-sight, and creatures + the goal glint appearing only once their tile is lit. Fog RENDERING is canvas-only and not pixel-asserted (STRATEGY §2); its testable PRECONDITION is data integrity: every glyph that appears in any screen's map of either world is explicitly declared in that world's `glyphSpec` (walkability/opacity/color), so the LOS/fog renderer can never meet an undeclared tile. A pure data assertion over the worlds' own `tile-worlds.js` maps + glyph tables.
- **INV-55** (L1/L2) **Riddle creatures — One-Rule floor (SAFETY-CRITICAL)**: authored (curated, NO-LLM) riddle creatures live in the tile worlds. The safety floor is proven by DATA — an engine-equivalent BFS over each world's own screens/exits/glyphs, with every gate CLOSED and every riddle-creature tile blocked, still reaches the goal, so a riddle can NEVER block the only path (tileworld.js: "a riddle is ALWAYS optional/bonus: it can never block the only path to the goal"). Behaviorally: stepping adjacent to a creature opens its authored riddle and captures typed keys as an ANSWER (not movement); the answer field allowlists to LETTERS ONLY (a spliced digit is rejected, never appended — security.md rules 1/3/6) and is length-capped, matched case-insensitively/trimmed against the creature's OWN authored acceptable-answers; wrong answers never crash or falsely-solve (gentle nudge; an authored hint after 2 tries, the answer after 3); the authored correct answer solves it (warm reaction + optional gate→floor); Space steps back — engaging or solving a riddle never traps forward progress (proven by the world still completing after wrong-then-correct answers on the approach tile). (product.md One Rule; module headers.)

### History cards & save slots — the flat/pool/multi-save rebuild — product.md §History Cards, js/history-cards.js, js/slots.js, js/main.js §Boot
*(added 2026-07-19 — the history-card + save system rebuild: a flat card list with
per-level rotating pools, and up to three independent save slots replacing the single
global save. Module headers are the design source: history-cards.js's own comment
block, slots.js's own comment block.)*
- **INV-56** (L1) **Earliest-typeable attachment:** every non-secret card's `level`
  equals the minimum level whose cumulative unlocked-key closure can spell its `word`
  (the same closure construction as INV-16/INV-20, generalized so an uppercase letter
  requires both its base key AND Shift's unlock level, and a space requires Space's
  unlock level) — a card is never attached to a level later than the level its word
  first becomes spellable at (history-cards.js: "`level` (= the EARLIEST level where
  its word becomes typeable)").
- **INV-57** (L1) **Secret cards never enter a level pool:** for every level 1–25,
  `cardsForLevel(level)` never returns a card with `secret: true` / `level: null` —
  secret cards (found only via magic words, easter-eggs.md) are structurally excluded
  from level pooling; they still count toward `allCards()`/`TOTAL_CARDS`.
- **INV-58** (L1) **Exactly-one-guaranteed-card-per-play survives rotation:**
  `pickGuaranteedCard(level, collectedIds, rotation)` returns exactly one card object
  for any level holding a pool, and `null` for a level with no cards; it prefers a
  card NOT YET present in `collectedIds`; the `rotation` counter deterministically
  cycles through the remaining candidate set (no `Math.random` — reproducible given
  the same three inputs), so a level's full pool is discoverable across replays
  without ever surfacing more than one guaranteed card per call.
- **INV-59** (L1) **Slot isolation:** writing to (progress, card collection, card
  rotation) or erasing one save slot never mutates any other slot's stored data —
  every `js/slots.js` read/write scopes strictly to the ACTIVE slot index, or to an
  explicitly targeted index for `eraseSlot`/`slotCards`, and no other slot's raw JSON
  changes as a byte.
- **INV-60** (L1) **Legacy → Slot 1 migration:** `ensureMigrated(legacyName)` folds a
  pre-slots single save (`kk-progress` + `kk-cards` as an array of level numbers) into
  Slot 1 exactly once, mapping each legacy card level to its stable id via
  `legacyLevelToCardId`; a second call is a no-op once `kk-slots` already exists
  (idempotent); a genuine first-time player (no real legacy progress — `furthestLevel`
  ≤ 1 and no completed levels — and no legacy cards) is left with NO `kk-slots` key at
  all, preserving the untouched cold-open path (onboarding.md).
- **INV-61** (L1/L2) **Per-slot erase scope:** `eraseActiveSlot()` / `eraseSlot(i)`
  clears only the targeted slot (progress + its collected cards + its rotation
  counters) back to empty; `kk-settings` (global preferences, including the player's
  display name) and every OTHER slot are left completely untouched — mirrors the
  original erase-progress guarantee (product.md, CLAUDE.md §Returning-player
  persistence) now scoped per game rather than globally.

## 6. Findings protocol

`docs/testing/FINDINGS.md` is the ledger. Each entry:

```
## TF-NN — <one-line defect statement>
- **Invariant:** INV-XX (source doc + clause)
- **Status:** OPEN | TRIAGED | FIXED | BY-DESIGN (doc updated)
- **Repro:** exact steps / test name
- **Evidence:** what the test observed vs. what the design doc says
```

The corresponding test stays in the suite as `t.todo('TF-NN: …')` — visible in every
run's output, green for gating. When Trevor triages: FIXED → un-todo the test;
BY-DESIGN → update the design doc *and* the test together, in that order.

## 7. Layout & conventions

```
tests/
  static/       *.test.mjs   — L0, no browser, no game imports (reads files)
  unit/         *.test.mjs   — L1, imports js/ modules with stubs.mjs globals
  integration/  *.test.mjs   — L2, real chromium via helpers/game-driver.mjs
  helpers/
    stubs.mjs          — in-memory localStorage + scriptable fetch (install/reset)
    game-driver.mjs    — static server (ephemeral port) + boot/press/read API
main_test.go             — L3 (repo root, Go convention)
```

- One design area per file; test names quote the design doc ("letter stays and
  waits", "survival is opt-in").
- Every `describe`/file header comment: `// Enforces: INV-nn — <source doc §clause>`.
- Integration tests may seed `localStorage` to reach a state fast, but the behavior
  under test is always exercised through real key events.
- No test writes outside `/tmp`-style scratch or reads `.dev-url`.

## 8. Running

| Command | Runs | When |
|---|---|---|
| `make test-static` | L0 | pre-commit reflex, <2s |
| `make test-unit` | L0+L1 | after any js/ data or logic change |
| `make test-go` | L3 | after main.go changes |
| `make test-integration` | L2 | after engine/UI/theme behavior changes |
| `make test-fast` | lint + L0 + L1 + L3 | the quick gate |
| `make test` | everything above + recorder smoke | before reporting work complete |

## 9. Deliberately untested (here)

Canvas art composition, animation aesthetics, era fidelity, music, screenshot
correctness — human-judgment surfaces owned by `visual-validation.md`, the
screenshot library, and Trevor's review. Human-paced winability with wrong-key
injections stays with the recorder (transcript-level proof). This suite will not
grow assertions in those spaces; that would be testing implementation (or taste).
