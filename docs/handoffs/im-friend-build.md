# Handoff — Build the IM-friend (Act 6, world 5 of 5)

**Purpose:** a fresh agent, with zero prior context, should be able to build the **IM-friend**
text world from this doc plus the files it points to. Prepared 2026-07-14 at the end of the
session that built the first four Text Worlds. Read this top-to-bottom, then read the linked
files, then build in slices.

**Also read (design source of truth):** the memory `act6-mastery-wing-idea` (auto-loaded via
`MEMORY.md`) and `docs/ROADMAP.md` §3 "Act 6". This handoff consolidates them; if anything
conflicts, the memory + Trevor win.

---

## 1. What Keystroke Kingdom is (30 seconds)

A retro 1979-arcade **typing game for a young child** (Oona) learning to read and type. Browser
game: bespoke HTML/CSS/JS engine, served + embedded by a Go server (`main.go`). **The One Rule
overrides everything:** *"only ever stop the player's flow with joy, never punishment"* — no
timers, no lives lost, no failure states; wrong keys get a gentle nudge and wait, never punish.
25 main levels + act cinematics. **Act 6 — "Text Worlds"** is a hidden bonus wing behind a
door at the back of the arcade select screen (unlocked after the full keyboard is learned), a
tribute to text games: *typing unlocks worlds you read into being* (the game's thesis).

## 2. What already exists in the wing (4 of 5 worlds, built + tested green)

Behind the door is a **hub chooser** ("THE TEXT WORLDS") listing:
1. **THE GREEN DRAGON** — a prose typed-command adventure (LORD/Zork lineage).
2. **THE GLIMMER DEEP** — an ASCII overhead cave → a crystal-cavern reveal.
3. **THE WHISPERWOOD** — an ASCII overhead forest → a firefly-glade reveal.
4. **YOUR OWN WORLD** — the maker: type words → things appear → `wake` → the world comes alive.

You are building **#5, the IM-friend.** All four are covered by 22 green integration tests
(`tests/integration/textworld.test.mjs`, INV-42..47 in `docs/testing/STRATEGY.md`).

## 3. The IM-friend — the design (all decided with Trevor; do NOT re-litigate)

A kid **chats with a character powered by the LOCAL LLM (Ollama)**. Core decisions:

- **Every persona is Keystroke-Kingdom-aware out of the box** — a shared BASE system prompt
  (who/where they are: a friendly character in the Text Worlds inside the game) is prepended to
  EVERY character, curated or player-made.
- **Every persona is a gentle TEACHER-COMPANION** — baked into the base prompt: helps the child
  learn to read/type, uses short early-reader words, asks easy questions to keep them typing,
  celebrates effort, **adapts to whatever the child actually says**, never harsh/scary, never
  asks for personal info, stays in character. Pedagogy *in character*, never a lecture.
- **Ship 1–2 curated personas** (Trevor's proposals, veto-able): **PIXEL** — a chirpy little
  arcade robot who adores letters; **SPROUT** — a gentle houseplant slowly growing (a nod to
  the plants they grow together).
- **The rest are the child's** — a warm *make-a-friend* flow (Oona loves inventing imaginary
  friends/pets, naming each stuffie/plant): the child NAMES the friend, says WHAT it is
  (puppy? dragon? robot? stuffie? plant?), WHAT it loves, and whether it's silly/gentle/brave.
  Those answers assemble the persona. Created friends **persist** so she can revisit them.
- **Transcript = the friend's MEMORY, persisted.** The MODEL is stateless, so we keep the whole
  chat client-side and **replay it to Ollama each turn** — BUT we must PERSIST it in
  localStorage so the friend **resumes across game launches and remembers past chats** (a friend
  who forgets you would be sad/wrong). Send a rolling window to the model to fit its context;
  persist the full history on disk. Include an **erase / "forget this friend"** option.
- **Graceful offline path:** if Ollama is asleep, the friend gently "naps" or falls back to
  simple scripted warmth — **never broken** (the whole game runs static-fallback for wordgen;
  match that posture).
- **One Rule:** no failure, no pressure, always kind; typing is celebrated.

## 4. The architecture to REUSE (read these files)

The wing is a **parallel screen/input path** — the 25-level pattern engine is never touched.

- **`js/textworld/hub.js`** — the coordinator. A `WORLDS` array of
  `{ id, name, tag, run:(cb)=>{ activeWorld = X; X.start(..., {onComplete:cb}); } }`. Menu
  (ArrowUp/Down + Enter/Space) → `enterWorld`; **Escape from a world → back to the menu; Escape
  from the menu → `onExit` (arcade door)**. `returnToMenu()` records completion via
  `activeWorld.hasWon()` on ANY exit (the TF-T1 fix). **Add the IM-friend as a 5th `WORLDS`
  entry here.**
- **Every world engine exports the same shape** — `start(...opts{onComplete})`, `stop()`,
  `handleKey(e)`, `isActive()`, **`hasWon()`**. They draw on the shared `#invaders-canvas`, run
  their own `requestAnimationFrame` loop, and **clear the FULL canvas each frame** (a leftover-
  pixel bug bit the maker — see `maker.js render()`). The IM-friend is a NEW engine of this shape.
- **`js/textworld/engine.js`** (prose) — read it for the **guided command MATCHER** (accept a
  key only if the buffer stays a prefix of an authored offered string; wrong key = nudge, no
  advance; exact unambiguous → fire) and the **hints-fade** model. Reuse this pattern for the
  **make-a-friend Q&A** (offer choices; the free-typed NAME/LOVES fields are the untrusted bits).
- **`js/textworld/maker.js`** — read it for the **prompt-bar + scene + typed-input** layout and
  the fixed-allowlist input (no free text). The IM-friend's chat prompt is similar, but the chat
  message IS free text (that's the point) — so the untrusted-input handling differs (see §6).
- **`js/main.js`** — door entry (`enterTextWorld` → `TextWorldHub.start({onExit, onComplete})`),
  the `case 'textworld'` router (delegates all keys to `TextWorldHub.handleKey`), and
  persistence (`getProgress().textWorlds`, `recordTextWorldComplete(id)`). The IM-friend needs
  its OWN persistence namespace (`kk-friends`) — add helpers alongside these, tolerant-parse.
- **`js/ui/cabinet-art.js`** — the door (`doorUnlocked`, `drawDoor`, `renderDoorView`,
  `navigateAct` past Act 5). No change needed for the IM-friend.
- **`js/wordgen.js` + `main.go` `/api/wordgen`** — **the Ollama plumbing to MIRROR.** `main.go`
  has `ollamaEndpoint()` (loopback default `127.0.0.1:11434` + `OLLAMA_HOST` env override) and
  `ollamaModel()` (`OLLAMA_MODEL`, default `llama3.2`). `js/wordgen.js` has the health-probe,
  fetch-with-timeout, retry/fallback, and structure-validation patterns. Copy these shapes.
- **`js/audio.js`** — `Audio.correct()/wrong()/coin()/levelComplete()`.

## 5. New pieces to build

- **`main.go` — add `/api/chat`** (POST) that proxies to Ollama's `/api/chat`. **Security move:
  compose the system prompt SERVER-SIDE** — the server owns the BASE KK-context + safety/teacher
  rules; the client sends a *validated persona spec* + the transcript; the server assembles
  `system = BASE_SAFETY + persona` and calls Ollama. This way the client can never strip the
  safety rules. Add a `/api/chat/health` (or reuse the wordgen one). Same loopback/env rules;
  validate request STRUCTURE; never send anything off-box.
- **`js/textworld/imfriend.js`** — the chat world engine (the same start/stop/handleKey/isActive/
  hasWon shape). An IM-window aesthetic on the canvas: a scrolling message log (you vs friend,
  distinct colors), a prompt bar to type a message, a "send on Enter" loop, a friend-picker /
  make-a-friend front screen.
- **`js/textworld/personas.js`** — curated persona data (PIXEL, SPROUT as system-prompt specs)
  + the make-a-friend Q&A schema (questions + how answers assemble a persona spec).
- **A small chat client** — either extend `js/wordgen.js`'s patterns into a `js/chat.js`, or
  inline in `imfriend.js`: health-probe → chat POST → parse → append to transcript. Rolling
  window for the request; graceful fallback if unavailable.
- **`kk-friends` persistence** (localStorage): `{ [friendId]: { persona, transcript, createdAt } }`
  — load on entry, save each turn, an erase/"forget" path.

## 6. Security (this is the ONE risky world — do it carefully)

Governed by `.claude/rules/security.md` (read it). Rules 6–7 (external calls / LLM-as-untrusted)
and 8 (PII floor). Specifics:

- **The child's chat messages and the created-persona fields are free text** — the wing's first
  real untrusted-input surface. Validate/allowlist the **persona fields** (name, what-it-loves):
  charset allowlist, length caps, lowercase-ish normalization, profanity/unsafe blocklist,
  before they’re embedded in any prompt. Insert them as clearly-delimited DATA; the server-side
  base safety rules take precedence (prompt-injection guard).
- **Output guard:** rely on the wholesome-by-construction system prompt PLUS a light output
  check (profanity/unsafe) before display; on failure, a safe fallback line.
- **Local-only:** all traffic to the OWN server → local Ollama (loopback default; `OLLAMA_HOST`
  env for containers). Nothing user-identifying leaves the box. The request carries persona +
  transcript context only.
- **PII floor exception (rule 8):** persisting chat transcripts + made-up friends stores MORE
  than the current display-name-only floor. This is a **deliberate, Trevor-approved** trade for
  the friend-memory feature; it stays **100% local**. When you build it, **add an explicit,
  documented exception to `.claude/rules/security.md`** (mirror the wordgen exception's style),
  with the "forget this friend" erase option as its safety valve.
- **Run `/security-review`** on the branch after building (before merge) — this is exactly the
  kind of change (LLM + free-text + new endpoint + storage schema) its "when to re-run" clause
  names.

## 7. Suggested build slices

- **Slice A (prove the loop):** `/api/chat` in `main.go` + one curated persona (PIXEL) +
  `imfriend.js` chat UI + the Ollama client with **graceful offline fallback** + transcript
  persistence for one friend. Validate: enter the friend from the hub, chat, close & reopen →
  the friend remembers; Ollama off → graceful nap, never broken; Escape → hub → arcade.
- **Slice B (the creative + security surface):** SPROUT (2nd curated) + the **make-a-friend
  Q&A** (validated free-text persona) + multiple saved friends + "forget". Then `/security-review`.

## 8. Gotchas / hard-won lessons (do NOT relearn these)

- **Go embeds assets at build time.** After ANY `js/`/`main.go` change: `go build -o
  keystroke-kingdom . && restart` (or serve statically for iteration). New files under `js/` ARE
  picked up by `//go:embed ... all:js` — but **`.dockerignore` allowlists** root files; if you
  add a root asset, add it there too (not needed for `js/textworld/*`).
- **Dirty multi-pool tree:** other agents may be editing on this branch. Run your OWN static
  server on a unique port (`python3 -m http.server <port> --directory .`); DON'T read `.dev-url`
  (stale embedded binary); don't `go build` the shared `keystroke-kingdom` binary during a wave
  (build a throwaway to verify embeds).
- **Journal O19 (critical):** do NOT edit game files while a test agent is probing them — it
  reports transient broken states as real bugs and stalls. FREEZE the code, THEN dispatch the
  test-engineer; do docs/journal work (different files) while it runs.
- **Journal L40:** a different input model wants a parallel screen, not an engine extension —
  which is why the whole wing sits beside `handleGameKey`, untouched.
- **Canvas discipline (L28 / L16):** the text-world screen hides all `.screen` and draws on
  `#invaders-canvas` (the cinematic pattern); set `ctx.textAlign`/`textBaseline` explicitly in
  every draw; clear the FULL canvas each frame; position in canvas space, never DOM space.
- **hub records via `hasWon()`** on any exit (TF-T1) — the new engine MUST export `hasWon()`
  (return whether the friend session counts as "visited/complete", your call on semantics).
- **Validation tooling:** `scripts/kk-playwright.js` (`launchPage`, `goToSelect`; the door is 5×
  ArrowDown past Act 5 with the `wopr` bypass, then Space → hub). The `/api/wordgen` 404 on a
  static server is expected and already filtered (`isExpectedWordgenProbe404`); do the same for
  any `/api/chat` probe if you validate on a static server without the Go backend.
- **Testing:** after building + FREEZING, dispatch the `test-engineer` (`.claude/agents/
  test-engineer.md`) against the settled code. Cover: the chat send/receive loop with a stubbed/
  mocked chat endpoint; persona-field validation (untrusted-input allowlist); offline fallback;
  transcript persistence + memory-resume across reload; and the **anti-trap escape** (imfriend →
  hub → arcade). Add INV-48+ to `docs/testing/STRATEGY.md` first, cite the design.
- **Close-out ritual:** `go build` + restart; regenerate screenshots for the new world into
  `docs/screenshots/textworlds/`; dispatch the **content-librarian** for a `docs/features/`
  Text-Worlds page (none exists yet — the wing has never had one); update `docs/ROADMAP.md` §3
  + the `act6-mastery-wing-idea` memory; journal any genuinely new lesson; regenerate the wiki
  index/lint (`node scripts/wiki-search.mjs --index && --lint`). Nothing is committed until
  Trevor reviews.

## 9. Definition of done

All 5 worlds live behind the door; the IM-friend chats via local Ollama with graceful offline
fallback; personas are KK-aware teacher-companions; 1–2 curated + player-made friends that
persist and remember across launches; a "forget" option; validated untrusted input; a
`/security-review` pass clean; security.md updated with the PII-floor exception; new
integration tests green (freeze-then-test); docs + screenshots refreshed. Then Act 6 is complete.
