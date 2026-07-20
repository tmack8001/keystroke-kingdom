# Secure Coding Rules
## Keystroke Kingdom — conventions verified by the 2026-07-12 security review

*These are the conventions the act5-full-circle security review confirmed the codebase
follows everywhere. They are now requirements: new code must keep them true. The
reviewer's job is grep-level simple — each rule below states its check.*

---

## Threat model (read this first)

Static Go server embedding assets at build time; no backend, no accounts, no network
calls from game code. All persistence is localStorage on the child's own machine. The
"attacker" that matters is **stored data becoming code**: a crafted player name, a
tampered localStorage value, or a tool consuming untrusted text. The bar is simple —
no string that a user (or a previous session) influenced may ever be interpreted as
HTML, shell, or JavaScript.

## Game JS (js/**)

1. **`textContent` for anything user-influenced.** The player name, free-typed text,
   and any value read back from localStorage go into the DOM via `textContent` only —
   never `innerHTML`, `insertAdjacentHTML`, `outerHTML`, or `document.write`.
   *Check:* `grep -rn playerName js/ | grep -i innerHTML` must return nothing.
2. **`innerHTML` is for fixed data only** — curriculum key labels, `FINGER_MAP`,
   settings `ROWS` enums. If a template literal feeding `innerHTML` ever interpolates
   a variable, that variable's provenance must be a literal in the codebase.
3. **Sanitize before the pattern stream.** Free text entering the typing engine follows
   the Level 24 pattern: strip to an explicit allowlist first
   (`buildPlayerNamePattern` strips to `[a-zA-Z]`, js/main.js). New free-text features
   (Level 25 free-type finale!) must allowlist the same way at the boundary.
4. **localStorage is untrusted input.** Parse inside try/catch, validate shape,
   tolerate garbage (the erase/persistence helpers in main.js are the model). Never
   feed parsed values to any sink in rules 1–2 without going through them. *The
   `kk-slots` save-slot store (`js/slots.js`, added 2026-07-19) is the reference
   implementation:* every read normalizes field-by-field, a malformed slot reads as
   EMPTY (never crashes the picker), writes never throw, and the player NAME it holds
   (per-slot) reaches the DOM only via `textContent` (slot-picker rows are built with
   `createElement` — rule 1).
5. **No dynamic code.** No `eval`, `new Function`, string `setTimeout`/`setInterval`,
   or runtime `<script>` construction. *Check:* `grep -rnE "\beval\(|new Function\(" js/`
   must return nothing.
6. **No EXTERNAL network calls from game code.** The game never phones home — no
   fetch/XHR/beacons/analytics/external URLs at runtime. Kids retype what they see;
   nothing on screen should be a live address (established easter-egg rule, now a
   security rule). *Narrow exception (Trevor, 2026-07-12, for local word generation):*
   same-origin fetches to the game's OWN Go server (`/api/*`) are permitted, feature-
   detected and silently falling back to static pools. **General principle (Trevor,
   2026-07-12): never assume where any external service is hosted.** Every external
   endpoint gets a sane loopback default plus an operator-controlled env override
   (`OLLAMA_HOST` is the model; `PORT` likewise) — never a hardcoded remote host,
   never a request-derived address. Nothing user-identifying ever leaves
   the page — the request carries act/level/characters context only, NEVER
   the player name.
7. **LLM-generated words are untrusted input on the content axis.** Anything generated
   for a child to read passes a mandatory validation chain before display: charset
   allowlist (only the level's unlocked keys — structurally enforced), length caps,
   lowercase normalization, a profanity/unsafe blocklist, and dedup; on ANY validation
   failure, drop the word silently and use the static pool. Generated text is data,
   never markup (textContent/fillText only, same as rule 1). **Plan for the two
   external-failure classes explicitly (Trevor, 2026-07-12):** (A) wrong-charset words
   → filter PER WORD, keep the rest of the batch; (B) failed or unparseable responses
   → validate the STRUCTURE of external data (response shape, field types, size caps —
   and inbound query params symmetrically) before any processing; a structurally bad
   batch is ignored whole and retried on the normal cycle, never partially trusted.
   The request itself declares its constraints (`/api/wordgen?act&level&characters&minWordLength&maxWordLength`;
   maxWordLength added Trevor, 2026-07-13, minWordLength added Trevor, 2026-07-13) — the server generates only against an
   allowlist the request stated, intersected with its own manifest, and within the
   declared [minWordLength, maxWordLength] length window, itself clamped to the
   server's play-logic length range (a request can never widen words past what the
   game will display, nor invert the window into an empty pool).
8. **PII floor:** the only personal datum the game stores is the display name. Never
   add more (no ages, no surnames prompted, no location). *(Save slots, 2026-07-19: one display
   name per saved game now lives in `kk-slots` (an unlimited, growable list) — still the
   same PII class, just one per game. Everything else a slot holds is gameplay data:
   progress, collected-card ids, rotation counters. No new PII class was introduced.)*
   *Documented exception — the Act 6 IM-friend (Trevor-approved, 2026-07-14):* the
   `kk-friends` localStorage namespace persists chat TRANSCRIPTS and the child's
   made-up FRIENDS (persona spec + message history) — more than the display-name
   floor. This is a deliberate trade for the friend-MEMORY feature (a friend who
   forgets you would be wrong), and it stays **100% local**: nothing is ever sent
   off the box. Its safety valve is the **"forget this friend"** erase path
   (imfriend.js `handleForgetConfirm`, a Y/N confirm, mirroring the game's
   erase-progress ceremony). The extra data is chat content and invented characters
   only — still NO ages, surnames, location, or contact info is ever prompted or
   stored. The `/api/chat` request carries the persona spec + transcript context
   ONLY, never the player name or anything user-identifying (rule 6). The child's
   free-text chat messages are untrusted (rule 7): they enter the model as
   `user`-role DATA and are drawn as canvas text — never markup, never a DOM sink;
   the server-composed system prompt (main.go `chatBaseSafety`, unremovable by the
   client) plus a light output word-check (`chatOutputOK`) keep replies wholesome.
   The persona free-text fields (name / what-it-loves) become part of the system
   prompt, so they are charset-allowlisted (letters+spaces) and length-capped on
   BOTH sides (`personas.sanitizeField` / main.go `sanitizeChatField`) before
   assembly — a crafted field can't inject instructions.

## Hook scripts (scripts/*-hook.sh)

9. **Every `jq -r` extraction lands in a double-quoted variable** and is only used
   quoted; compare with `grep -qx` (exact fixed line) or quoted `grep -qE`.
10. **Compose JSON output with `jq --arg` / `jq -cn`** (or a literal heredoc) — never by
   string-interpolating untrusted values into JSON text.
11. **No `eval`, no unquoted `$(… jq …)` substitution.** *Check:*
    `grep -nE '\beval\b' scripts/*.sh` must return nothing.
12. Pipe-test every hook with synthesized stdin before wiring it (journal O8),
    including a payload containing quotes/backticks in the extracted fields.

## Node tooling (scripts/*.js, docs/**/*.js)

13. **Child processes via `execFileSync`/`spawnSync` with array arguments** — never
    string-built shell commands, never `shell: true`.
14. **`page.evaluate` takes a static function + parameterized args** — never a
    dynamically concatenated code string.
15. CLI flags and env vars are trusted (local dev tooling), but values derived from
    them still follow rules 13–14 on the way to any child process.

## When to re-run the review

Run `/security-review` before merging any branch that adds: a DOM sink fed by a
variable, a new hook script, a new child-process call, any localStorage schema change,
or any free-text input feature. The 2026-07-12 review (finder + independent
verification) is the baseline; its verified-safe inventory lives in the session record
and docs/ROADMAP.md §4.
