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

### Level 25 "MY STORY" coda — the earned post-target finale — product.md §5/§Word Length + the One Rule, transitions.md (L25 "You built this"), js/keyboard-story.js, js/finale-quote.js, js/main.js §startCoda + handleGameKey win-gate
*(added 2026-07-27; REDESIGNED 2026-07-28 — the Level 25 finale is no longer an
up-front manifesto block. L25 now plays its NORMAL pool to the traditional win target,
then EXTENDS PAST it into an earned CODA (Trevor's "MY STORY"): the player types a
short, readable walk-the-keyboard STORY covering every letter A–Z, whose FINAL line(s)
are the EXPERIENCE-tier Hacker Manifesto excerpt as its capstone, plus ≥1 choreographed
typo→Backspace→correct beat. Static story bank + optional local-LLM variety. Verified
manifesto text: research/wiki/culture/hacker-manifesto.md. Design sources:
js/keyboard-story.js + js/finale-quote.js header comments.)*
- **INV-62** (L1) **The manifesto CAPSTONE escalates by tier — FOUR distinct,
  strictly-increasing sets + age-gated + typeable + verbatim:** `finaleLinesForRatio(winRatio)`
  (the coda's final line(s)) returns four DISTINCT sets, one per EXPERIENCE tier
  (strictly increasing line counts): winRatio 1 → sentence 1; 1.5 → +2 (the truncated
  belonging line); 2.25 → +3. The 1/1.5/2.25 sets are exact prefixes of each other.
  **WIZARD (3.5) is its OWN ordered set** — the manifesto's near-ENTIRE closing passage,
  VERBATIM, with ONE sentence intentionally OMITTED (the "atomic bombs / wage wars /
  murder" line — kept out of a kids' game even at the top tier; asserted absent at every
  tier). WIZARD uses the FULL belonging line ("...religious bias... and you call us
  criminals.", not the truncated tier-2 version), so it begins with sentence 1 exactly
  but is NOT an exact array-prefix of 2.25. The delicate "Yes, I am a criminal... my
  crime is that of curiosity." content is age-gated to HOTSHOT (2.25x) and above (a
  strong opt-in tier, never the default); the whole closing passage (sentences 4–7)
  appears ONLY at WIZARD. Every token of every capstone line at every tier is typeable
  with exactly Level 25's cumulative unlocked-key closure (the same closure construction
  as INV-20/INV-56: an uppercase letter needs both its base key and Shift), **including
  the straight-ASCII apostrophe `'` (0x27, the Level-23 key) in WIZARD's "can't"/"we're"**
  — never a curly `’`; tiers 1/1.5/2.25 carry no apostrophes. Ellipses are exactly three
  `'.'` tokens; and joining a line group with single spaces reproduces its canonical
  verbatim excerpt (no wording drift). (js/finale-quote.js.)
- **INV-63** (L2) **The coda is a guaranteed, never-missable POST-TARGET win-gate:** at
  Level 25 (non-free-play), the level plays its normal pool to the traditional target
  (`themeComplete && patternsCompleted >= minPatterns && !cardPending && !namePending`)
  and, instead of ending, rolls into the coda (`startCoda`): the assembled coda lines are
  served as the deterministic TAIL from that point, and the completion condition carries
  a `codaPending` term (`codaActive && codaTyped < codaLines.length`) so the level ends
  ONLY once the WHOLE coda is typed. The gate clears — the level stays winnable — at BOTH
  winRatio 1 and 3.5 (the One-Rule floor: the coda is finite, fully typeable at L25, and
  sits ahead of any pool draw). The guaranteed history card + Name Moment still fire
  during NORMAL play, BEFORE the coda begins (they gate the target the coda extends past).
  Free-play and every non-25 level are a no-op (no coda). (js/main.js; product.md One Rule.)
- **INV-64** (L1) **The coda covers every letter A–Z at every tier, offline-guaranteed:**
  `assembleCoda(story, winRatio, rotation)`'s full rendered text (via `renderCodaText`,
  which simulates the Backspace beats) contains all 26 letters at winRatio 1, 1.5, 2.25,
  AND 3.5 — because every static story's `base` sentence is itself a pangram (asserted for
  all of `STATIC_STORIES`), and the base is present at every tier. When local-LLM
  generation is absent or fails (the static-host shipping default), `buildStoryPool([])`
  falls back to the static bank, so coverage holds with ZERO server. A generated story is
  only admitted if its base validates AND `coversAllLetters` — a generated story failing
  charset/coverage/safety/length is rejected in favor of a static one. (js/keyboard-story.js;
  product.md §5 "the eighth key" / full-keyboard mastery.)
- **INV-65** (L1) **Higher tier → longer coda, rotation varies the story, and every coda
  carries a well-formed typo beat:** `storyBodyForRatio` appends one extra sentence per
  EXPERIENCE step (base only at 1×, +1/+2/+3 at 1.5/2.25/3.5) and `beatCountForRatio`
  scales the choreographed beats (≥1 always), so a higher tier is strictly MORE typing,
  never a penalty (product.md §Word Length). `pickKeyboardStory(pool, rotation)` /
  `pickTypoBeats(rotation, n)` are DETERMINISTIC in the per-slot `storyRotation` counter
  (a different story/beat set each successive replay, no `Math.random` — mirrors the
  history-card rotation; `js/slots.js getStoryRotation/bumpStoryRotation`). Every
  `TYPO_BEATS` entry is a self-contained typo→Backspace→correct token beat whose
  cumulative Backspaces NEVER exceed the characters typed so far (no underflow — it can
  never erase earlier text) and whose FINAL rendered text equals its intended readable
  word (`renderCodaText([beat.tokens]) === beat.text`); L25 is where Backspace is taught,
  so the coda exercises it as a playful "trip-up", still fully scripted (every token is
  the expected key — the sacred wrong-keypress contract is untouched). Manifesto capstone
  is always the coda's FINAL line(s). (js/keyboard-story.js; js/slots.js.)
- **INV-66** (L1, Go) **Generated coda stories are validated on BOTH ends:** the
  `/api/keyboard-story` server (`parseAndValidateStories`/`validateStorySentenceGo`)
  admits a story only if every sentence passes the charset allowlist (letters, space,
  `. , ' -` — the L25-typeable set, mirroring the client's `STORY_SENTENCE_RE`), the
  length caps, the exact-word safety blocklist (`chatOutputOK`), and the sub-line-width
  cap, AND its base clears `storyCoversAllLetters` (a pangram). A missing/erroring model
  yields an empty batch (never a 500), so the client uses the static bank. The client
  RE-validates via `validateGeneratedStory` (defense in depth — neither the model nor our
  own server is trusted). No player-identifying data is sent (security.md rules 6-7).
  (main.go; js/keyboard-story.js; js/keyboard-story-gen.js.)
- **INV-67** (L1/L2, Go) **Generation yield is robust to model line-drift, and variety
  accumulates without loosening any safety check.** THREE guarantees, none of which may
  trade winnability or safety for yield:
  1. **Robust parse (main.go `parseAndValidateStories`):** stories are reconstructed by
     scanning EVERY line and IGNORING blank lines — a valid pangram line starts a story
     (its base), subsequent valid non-pangram lines are its extras, the next pangram
     starts the next story. It no longer depends on `\n\n` as a block separator (small
     models insert a stray blank line between a valid pangram opener and its
     continuations; the old split dropped BOTH fragments — measured ~7% yield). Every
     per-sentence safety gate (`validateStorySentenceGo`: charset allowlist, length/word
     caps, `chatOutputOK` blocklist) and the base-pangram / min-extras gates are
     UNCHANGED — a junk/empty/unsafe reply still yields `{stories:[]}`. `buildStoryPrompt`
     carries a one-shot format example (a NON-static pangram + continuations, "do not
     copy") to keep drift low. (Tests: blank-line-drift recovery, multi-pangram seeding,
     junk-yields-none.)
  2. **Accumulating variety + dedup (js/keyboard-story-cache.js `kk-stories`):**
     validated generations persist to a NEW localStorage namespace (already-validated
     GAME CONTENT — pangram sentences — NOT PII; rule 8 floor preserved). Reads are
     defensive (rule 4: try/catch, shape-validated, every entry RE-validated, garbage →
     empty, never throws); writes never throw (private-mode → in-session only, like
     kk-slots); capped to the most recent 20. `buildStoryPool` folds the cache in BEFORE
     the static bank AND DEDUPS: a generated/cached story whose normalized base
     (`normalizeStoryBase`: lowercase, collapsed whitespace, stripped edge punctuation)
     matches a STATIC base or an earlier accepted base is dropped — fixing the observed
     exact-static-pangram repeat and keeping the offline floor undiluted.
  3. **Anti-dup context (rule 6):** recent cached bases are sent as `avoid` hints on
     `/api/keyboard-story` so the model makes something DIFFERENT. It carries story TEXT
     only — never a player name/PII. Inbound `avoid` values are structurally validated
     symmetric to the outbound content (`sanitizeAvoidList`: same charset/length/safety
     chain, count capped at `maxAvoid`).
  **Winnability NEVER depends on generation or the cache:** if generation, the cache,
  dedup, or anti-dup all fail/empty, `buildStoryPool` still appends the 6 static
  all-26-letter stories, so the coda assembles and covers A–Z at every tier (INV-64
  holds). (main.go; js/keyboard-story.js; js/keyboard-story-cache.js; js/keyboard-story-gen.js;
  js/main.js §startCoda.)
- **INV-68** (L1, Go+JS) **The kid-safety word blocklist is single-sourced, and any
  parent control over it is ADDITIVE to an immovable floor.** The canonical bad-word
  list lives in ONE file, `js/word-blocklist.json`, read by BOTH languages: the Go
  server embeds + unmarshals it (`//go:embed`, `loadChatWordBlocklist` at init →
  `chatWordBlocklist`; asserted by `TestChatWordBlocklistLoaded`) and the client imports
  it (`import … with { type: 'json' }` → `js/word-blocklist.js` `BASE_WORDS`; asserted by
  `tests/unit/word-blocklist-sync.test.mjs`, which also verifies the client array equals
  the file verbatim). Editing the JSON changes both sides at once — no drift possible,
  no hard-coded copy in either language (journal L41; the file is served with an
  `application/json` content-type by `http.FileServer`, so the browser JSON-module import
  works). `BASE_WORDS` is the FLOOR: every consumer (coda story validation, IM-friend
  chat) always enforces it. A parent may ADD words via `settings.blockedWords`
  (`setUserBlockedWords`, seeded on settings load/save) but can NEVER remove a floor word
  — the API only unions an additive set on top. User words are untrusted free text
  (security.md rule 7): allowlisted to `[a-z]`, length-bounded (2–20), deduped, and
  count-capped (≤40) on BOTH the storage side (`settings.sanitizeBlockedWords`) and the
  safety side (`word-blocklist.setUserBlockedWords`); garbage degrades to an empty
  additive layer, never throws, never weakens the floor. Default `blockedWords` is `[]`,
  so an untouched preferences screen changes nothing. (js/word-blocklist.js; js/settings.js;
  main.go; js/keyboard-story.js.)
- **INV-69** (L1/L2) **The BLOCKED WORDS editor is a parent-facing, additive-only,
  floor-immutable free-text control.** A dedicated settings row (`getRows()` entry
  `key:'blockedWords'`, `action:true`, `editor:'blockwords'`, with a `summary()` that
  shows the current parent-added COUNT — never the words themselves) opens, on
  Enter/Space, a dedicated editor screen (`#blockwords-screen`, `state.screen ===
  'blockwords'`) reachable ONLY from Settings; Escape from it always returns cleanly to
  Settings (One Rule — never trapped). In the editor a parent may: (a) TYPE a word into
  `#blockword-input` and ADD it with Enter — sanitized at the boundary exactly like the
  model (lowercased, stripped to `[a-z]`, length 2–20, deduped, count-capped ≤40 via
  `saveSettings`→`sanitizeBlockedWords`), persisted to `kk-settings.blockedWords`, and
  installed into the live filter immediately (`setUserBlockedWords`, INV-68); (b) SEE
  only their OWN additions rendered as chips — each word via `textContent` only, NEVER
  `innerHTML` (security.md rule 1), so a hostile typed string can never reach a DOM sink;
  (c) REMOVE one of their additions (Backspace on the empty box removes the highlighted
  chip, or click the chip) — a removal only ever splices `settings.blockedWords`. The
  built-in FLOOR (`BASE_WORDS`) is NEVER shown as a chip and has NO UI-reachable removal
  path: typing a floor word reports "ALREADY BLOCKED" and adds no removable chip
  (`isBlockedWord` guard), and `isBlockedWord` keeps every floor word blocked regardless
  of the parent list. Default `blockedWords: []` → an empty editor that changes nothing.
  (js/main.js openBlockWords/addBlockWord/removeBlockWord/handleBlockWordsKey; js/settings.js
  ROWS `blockedWords`; index.html `#blockwords-screen`; security.md rules 1/4/7; product.md
  §One Rule + "settings are toggles".)

### Adaptive pacing, the hidden layer, and Level 24's name

*(added 2026-09-11 — the ENGINE lane: tech.md's designed-but-unbuilt adaptive
pacing, three easter-eggs.md proposals, and ROADMAP §3's "Level 24 pattern
crowding".)*

- **INV-70** (L2) **Adaptive pacing is derived from the player and can only ever be
  GENTLER.** The engine tracks a rolling average of the intervals between CORRECT
  keypresses and derives a pace multiplier, published as `data-pace` on
  `#game-screen`. The multiplier is clamped to `[1, 2]`: it can only ever LENGTHEN
  the engine's cosmetic pauses (the beat before the next pattern renders, the beat
  before the next letter lights up) and — in opt-in Survival — only ever LENGTHEN the
  per-pattern allowance. It is never shorter than the hand-tuned baseline, so a
  player typing at or above the baseline cadence gets byte-identical behavior
  (`data-pace` stays `1.00`), and a slower player's game slows with them. It gates
  nothing: no prompt is withdrawn, no input window closes, no state advances on a
  clock. (tech.md §Adaptive Pacing: "Player slows down → game slows down with them …
  No hard timer — pace is always derived from the player"; product.md §1 "Adaptive,
  Not Competitive"; CLAUDE.md §The One Rule.)
- **INV-71** (L2) **The wrong-keypress contract is outside pacing.** An interval that
  spans a mistake is never sampled, so neither a wrong key nor a slow self-correction
  moves the derived pace in EITHER direction — the game never "speeds up to catch
  up", and a miss is never a pacing penalty. The letter still stays and waits, the
  mistake is still logged quietly, and the correct key still advances with no double
  penalty. (CLAUDE.md §Wrong Keypress Behavior; product.md §3 "Reinforce, Don't
  Punish"; tech.md §Input Handling.)
- **INV-72** (L0/L2) **Title-screen magic words answer only when summoned.** Every
  phrase in the engine's `EGGS` table — including `sudo` ("PERMISSION GRANTED. YOU
  ALWAYS HAD IT.", Unix + xkcd 149) and `allyourbase` ("ALL YOUR KEYS ARE BELONG TO
  YOU.", Zero Wing 1991) — is typed blind on the attract screen, answers in the WOPR
  text line, and never appears unprompted, never advertises itself, and never blocks
  or alters the title flow (the WarGames `SECRET_PHRASES` bypass still works
  unchanged alongside them). (easter-eggs.md §Design Rules 1 & 5, §Proposed #2/#9.)
- **INV-73** (L2) **The eighth-key confession fires exactly once per saved game, and
  never names the key.** The FIRST time a saved game completes Level 20 (the
  terminal), the level-complete card carries the one-time line "THE EIGHTH KEY HAS A
  NAME. / PROGRAMMERS END EVERY LINE WITH IT;" — the joke being that the line ENDS
  with the character without naming it (the in-game anonymity rule holds; INV-29 stays
  green). Replaying Level 20 in the same saved game never shows it again; the latch is
  derived from that game's own completion record, so another saved game gets its own
  reveal. It is decoration on a natural pause point — it never gates, pauses, or
  interrupts anything. (easter-eggs.md §Proposed #8 + §Design Rules 1; CLAUDE.md §"the
  eighth key is never called by name".)
- **INV-74** (L2) **Level 24's name is guaranteed content, and the guaranteed
  injections are never stacked.** Level 24 is "the player types their own name"
  (act5.md), so the capitalized name pattern is spliced as the first pattern after the
  intro drills AND win-gated: the level cannot end until it has actually been typed
  (the same never-missable guarantee a history card has, and no longer merely an
  arithmetic accident of where the theme's character gate lands). The level's history
  card word is spliced two slots later so the player never meets two guaranteed
  injections back to back, and the lowercase "familiar visitor" name is suppressed at
  Level 24 (it is the capitals ceremony — "You already know every letter. Now make
  them BIG."). Nothing guaranteed is ever filtered or dropped; this is ordering and
  proportion only. (act5.md §Level 24; product.md §"The Name Moment"; ROADMAP §3
  "Level 24 pattern crowding".)
- **INV-75** (L2) **The rubber duck rides ALONGSIDE a hint, never instead of one, and
  never unprompted.** From Level 22 onward, the FIRST finger hint the player earns
  after a wrong keypress carries a quieter second line beneath it — "STUCK? TELL THE
  DUCK." — once, then never again. It is only ever APPENDED to a hint that is already
  on screen (the normal finger hint is never replaced, shortened, or made less
  helpful), it never appears before a wrong keypress (hints follow misses; the opening
  finger guide at the very first prompt remains the game's single sanctioned
  unprompted hint), and below Level 22 it never appears at all. The wrong-keypress
  contract itself is untouched: gentle nudge, the letter stays and waits, the mistake
  is logged quietly, the correct key advances with no double penalty. (easter-eggs.md
  §Proposed #4 + §Design Rules 1; onboarding.md §Design Rules for the Opening;
  CLAUDE.md §Wrong Keypress Behavior.)

### Act 7 — "THE SPEEDWAY" (the racing wing) — docs/specs/act7-speed-racing.md §5 + §10, product.md §Core Principles (the One Rule), CLAUDE.md §Wrong Keypress Behavior, security.md rules 4/6/8, theme-authoring.md §The EXPERIENCE win-ratio

*(added 2026-09-13 — the second bonus wing, a parallel screen behind the select
screen's second back-wall door. Numbering follows the spec's own §10 proposal
1:1, so the spec and this catalog never drift. The design source is the spec;
where the spec restates an older clause, the ORIGINAL doc is cited too.)*

**The trap this section exists for:** Act 7 does NOT route through `js/main.js`'s
pattern engine (`handleGameKey`/`buildPatterns`) — it is a parallel input path in
`js/speedway/track.js`, exactly as Act 6 is in `js/textworld/`. It therefore does
**not inherit the sacred wrong-keypress contract for free**; the contract is
re-implemented, and **INV-77's tests cite INV-1..INV-5 directly** rather than
Act 7's own numbers (spec §5.3 and §8's first risk row: *"Two implementations of
one contract is the structural cost of a parallel input path"*).

**The observable surfaces for Act 7** (the wing draws entirely on the shared
canvas, so there is no `#prompt-sequence` to read — same situation as Act 6, and
the same resolution): (a) which `.screen` is visible (`readScreen()` — the
`speedway-screen` card while the hub loads/fails, `null` once the wing owns the
canvas, `select-screen` back at the door on exit); (b) the **persisted**
`kk-slots[i].speedway` TrackRecord (`js/slots.js readSpeedway/writeSpeedway`) —
the actual promise the wing keeps to a returning player; (c) the **strings the
wing asks the canvas to draw** (a `fillText`/`strokeText` recorder), used ONLY
for text-content assertions — never for position, size, colour or any pixel, so
STRATEGY §2's prohibition on "pixel/geometry assertions on canvas art" is
respected exactly as written; and (d) `consoleErrors`.

- **INV-76** (L2) **Distance is produced by typing, never consumed by time.** An
  Act 7 lap completes when the last character of the lap is typed correctly, and
  by no other means. No clock, timer, countdown, checkpoint or elapsed-time
  threshold can end, shorten, fail or interrupt a lap; a lap left idle for an
  arbitrary period is still exactly where it was and still finishable, and a
  very slow run completes exactly like a fast one. (product.md §1 "No timers
  running out. No forced failure states."; CLAUDE.md §The One Rule; spec §5.1.)
- **INV-77** (L2) **The sacred wrong-keypress contract holds verbatim in Act 7,
  and nothing is ever taken.** *Cites INV-1..INV-5 directly.* A wrong key in a
  track produces a gentle nudge; the letter **stays and waits** (the prompt does
  not advance — INV-1/INV-4); the mistake is logged quietly (INV-2); the correct
  key then advances normally with **no double penalty** (INV-3); and pure
  modifier keydowns (Shift/Control/Alt/Meta alone) are **ignored entirely and
  are never a mistake** (INV-5). Act 7's own addition: a wrong key never reduces
  charge, never reduces speed below the floor, never moves the vehicle
  backwards, and never decrements lap progress, the odometer, the lap count or
  the clean-run best. (CLAUDE.md §Wrong Keypress Behavior; product.md §3
  "Reinforce, Don't Punish"; Survival's "wrong keys cost nothing"; spec §5.3.)
- **INV-78** (L2) **The advance floor is invariant.** Every correct keystroke
  advances the vehicle by the same fixed distance, independent of typing rate,
  accuracy, charge level, ghost presence, EXPERIENCE tier, word-length settings
  or track — so **every track is finishable at any typing rate by any player**,
  and a lap always demands the same number of CORRECT keystrokes however many
  wrong ones were pressed along the way. (Trevor's locked decision #4; product.md
  §1 "Adaptive, Not Competitive"; spec §5.2(a).)
- **INV-79** (L2) **Charge is additive-only and decays uniformly.** The boost
  meter is increased only by correct keystrokes, is decreased only by continuous
  time-decay applied identically during flawless and error-laden play, is never
  zeroed or deducted by a mistake, and can never make the vehicle slower than the
  INV-78 floor. An inaccurate run is slower only because it EARNED less, never
  because anything was confiscated. (Super Mario Kart's coin buffer with the hit
  removed — research/racing-games-by-era.md §12; spec §5.2(b).)
- **INV-80** (L2) **The ghost is yourself, and it is never an opponent.** The
  ghost is rendered from the player's own previous completed lap on that track,
  is labelled as the player's own previous run (never RIVAL/OPPONENT/a name),
  and on reaching the finish line **remains on screen** until the player
  finishes. No placement, position number, finish order, ranking, elimination or
  defeat string exists anywhere in Act 7 — in any drawn string or any stored
  value. (Trevor's locked decision #6; product.md §1; spec §5.5.)
- **INV-81** (L2) **The first lap has no ghost and still completes warmly.** With
  no stored record for a track, the lap runs with no ghost vehicle, is framed as
  setting the pace, and on completion CREATES the record. No Act 7 surface
  requires a ghost to exist, and a corrupt stored record is indistinguishable
  from none (INV-84). (spec §5.5; product.md "A child should leave every session
  feeling capable".)
- **INV-82** (L2) **The field is atmosphere, never competition, and the player
  never fails.** AI vehicles are never scored or compared against the player in
  any surface or stored value; their speed derives from the player's own rolling
  keystroke rate clamped to a band around it; and the player's vehicle has no
  crash, spin, stall or stop state under any input whatsoever. (Trevor's locked
  decision #6; Daytona USA's adaptive AI via tech.md §Adaptive Pacing; the
  Missile Command precedent, levels/act5.md Level 23; spec §5.4.)
- **INV-83** (L2) **Act 7's counters only ever go up, and no negative number is
  ever displayed.** Lap count, odometer and clean-run best are monotonically
  non-decreasing across every run, including slower and error-heavy ones; the pit
  board never renders a minus sign, a negative delta or a "slower by" comparison
  — a slower lap simply OMITS the improvement line and shows time and best as two
  unannotated facts. (iRacing's incident ledger inverted —
  research/racing-games-by-era.md §12 final row; product.md §6 "Stats Are Present
  But Never Looming"; spec §5.5.1.)
- **INV-84** (L1) **Ghost storage is per-slot, bounded, and garbage-tolerant.**
  Ghost records live INSIDE the active save slot (`kk-slots[i].speedway`, never a
  new namespace — which is what makes both erase paths cover ghosts for free),
  are normalized field-by-field on read inside try/catch, enforce the documented
  caps (a split table of exactly 64 non-decreasing integer milliseconds; at most
  the two documented ghosts per track, `last` raced + `best` keepsake), drop
  unknown track ids and unknown schema versions, **never throw on any malformed
  input**, and degrade to "no ghost" rather than breaking the track. Erasing a
  saved game erases its ghosts; no ghost datum is ever transmitted anywhere and
  none of it is PII. (security.md rules 4, 6 and 8; js/slots.js `normalizeSlot`
  as the reference implementation; spec §5.5 + §6.)
- **INV-85** (L1/L2) **The era ladder is declared and mechanically enforced.**
  Every registered track declares a render tier from the enum plus a `variant`
  and an authored `eraRank`; **`eraRank` is non-decreasing when tracks are
  ordered by `year`**; **no two tracks share an identical (tier, variant) pair**
  (F-Zero and Super Mario Kart are both `mode7`, Pole Position and Hang-On both
  `scaler` — so each must declare a distinct variant); the earliest track by year
  is `ttl` and the latest is `modern`; and where they are registered, **Virtua
  Racing declares `flatpoly` and Daytona USA declares `texpoly`** (the locked
  pair). Each track's renderer is constructed with `kitFor(tier)`, which
  exposes only that tier's primitives — a `ttl` renderer has no gradient
  available, a `flatpoly` renderer has no `texturedPoly`. **This is a PURE DATA
  assertion**: spec §5.6 explicitly rejected a canvas colour-histogram check
  because `.claude/rules/testing.md` rule 4 forbids pixel assertions and the rule
  has not moved. (Trevor's locked decision #3; product.md §5 "Graphic Quality
  Grows With the Player"; spec §5.6(2).)
- **INV-86** (L2) **Anti-trap: Escape always makes progress toward the arcade.**
  From every state in Act 7 — the still-loading card, the "still being built"
  card, the hub chooser, a start line, mid-lap, the pit board — Escape alone
  reaches track → hub → arcade, and there is no state from which it fails. The
  wing is lazily imported, so a missing/404'ing `js/speedway/*` must cost exactly
  one warm card that any key walks out of, never a dead end and never a broken
  arcade. (product.md's One Rule extended to "never trapped"; mirrors Act 6's
  INV-46; spec §5.1 + js/main.js `enterSpeedway`.)
- **INV-87** (L1) **Act 7's content floor is static, kid-safe, and network-free.**
  Every track's word pool is a curated static bank containing no `BASE_WORDS`
  floor word and none of the never-words (`crash`, `wreck`, `collision`,
  `burnout`, `spin out`, `dnf`, `dead`, `die`, `kill`) — in any pool word OR any
  line of Act 7 prose; no Act 7 code path issues any network request; and
  MIN/MAX WORD LENGTH is applied best-effort with a fallback to the track's own
  words, so no settings combination can make a track unfinishable. (security.md
  rules 6 & 7; product.md §Word Length "winnability is never traded for it";
  research/automotive-vocabulary.md §2; spec §5.7.)
- **INV-88** (L2) **EXPERIENCE scales the road, never the demand.** A higher
  EXPERIENCE tier increases a track's character length only; it never increases a
  required speed, a required accuracy, or any threshold the player must meet, and
  every tier remains finishable at any typing rate. At the default tier,
  behaviour is identical to an unscaled track. (theme-authoring.md §The
  EXPERIENCE win-ratio: "a higher ratio is always MORE play, never a penalty";
  spec §5.1.)
- **INV-89** (L1/L2) *(awaiting renderers — no test in the 2026-09-13 wave)* **The
  rendering backend is invisible above the render kit.** Whatever a track draws
  with, it exposes the unchanged module contract (`start`/`stop`/`keystroke`/
  `miss`/`patternComplete`/`victory`, `patternComplete()` monotonic and never
  un-winning, `victory()` returning its duration in ms), it draws inside the
  stage regions with the UI's centre reserved, and no engine or screen code
  branches on which backend a track uses. A WebGL track composites through its
  own offscreen canvas into the shared 2D canvas — the shared canvas never
  changes context type. (theme-authoring.md §The module contract + §The win-gate
  accumulator pitfall; visual-validation.md §The Theme Layout Contract; spec
  §5.6d.)
- **INV-90** (L2) *(awaiting the `modern` tier — no test in the 2026-09-13 wave)*
  **WebGL is optional; no track is ever blank.** If a WebGL context cannot be
  created or is lost, the track renders through its Canvas-2D fallback and
  remains fully completable with the ghost, the field and the pit board intact.
  No rendering condition can make a track unplayable, unwinnable or empty.
  (product.md's One Rule — winnability is the floor; INV-64/INV-67's shape:
  accelerated content is always additive to a static floor; spec §5.6d.)
- **INV-91** (L0) *(conditional — only bites if a library is ever vendored)* **Any
  vendored graphics library is committed, local, licensed and crawlable.** It
  lives under `js/vendor/<name>/` as ES modules committed to the repo, is
  imported only by repo-relative path (never a CDN, never root-absolute),
  carries its `LICENSE` beside it, requires no build step, and appears in the
  module graph `scripts/static-host-check.mjs` crawls with every file returning
  200 in both the `/` and `/keystroke-kingdom/` host shapes. **And the doc-first
  gate holds:** tech.md/CLAUDE.md's "no framework" tenet must carry Trevor's
  narrowed exemption BEFORE any vendored byte lands (testing.md rule 1's
  ordering). (security.md rule 6; journal F26; spec §5.6d + §11 Q9.)

- **INV-92** — *withdrawn 2026-09-13, before it ever shipped.* It described act set
  dressing standing in a curriculum act's cabinet row (an Apple IIe on Act 2, an
  MS-DOS PC on Act 3). Trevor play-reviewed it and rejected the placement — *"on
  the cabinet selection they look out of place next to traditional cabinets"* — so
  the behaviour it guarded no longer exists and its test was deleted with it. The
  number is retired rather than reused, so nothing dangles. The machines are
  getting their own act instead (docs/ROADMAP.md §2 "The Computer Room").

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
