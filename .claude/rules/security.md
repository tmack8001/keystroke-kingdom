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
   *Path-prefix rule (added 2026-09-11):* same-origin `/api/*` paths must be written
   **RELATIVE** (`api/wordgen/health`), never root-absolute. The game is published as a
   GitHub Pages PROJECT page under a `/keystroke-kingdom/` prefix; a root-absolute path
   escapes that prefix and resolves to the DOMAIN root, which on a shared `user.github.io`
   is a path this game does not own — so a sibling project serving `/api/*` there would be
   talked to by mistake. Relative keeps every request inside our own prefix, where it 404s
   and the static fallback engages as designed. This is the same-origin rule taken
   literally: "same origin" is not sufficient when the origin is shared. Enforced by
   `scripts/static-host-check.mjs` (`make static-host-check`) and by
   `tests/unit/wordgen-client.test.mjs`, which asserts the DESIGN CLAUSE (no scheme, no
   host, no leading slash) rather than a literal spelling.
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
   *The Level 25 "MY STORY" coda generator (`/api/keyboard-story?tier&count`, added
   Trevor 2026-07-28) is the second instance of this rule and follows it identically:*
   the local-Ollama endpoint returns readable "walk the keyboard" story sentences, and
   BOTH the server (`parseAndValidateStories`/`validateStorySentenceGo`/`storyCoversAllLetters`
   in main.go) AND the client (`validateGeneratedStory`, js/keyboard-story.js — defense in
   depth) enforce the same chain: charset allowlist (letters + space + `. , ' -`, all
   L25-typeable), per-sentence length + sub-line-width caps, the shared exact-word safety
   blocklist (`chatOutputOK`), and a mandatory all-26-letters coverage check on the base
   sentence. Failure class A (a bad sentence) drops that sentence; class B (missing/erroring/
   unparseable model, or a structurally bad batch) yields `{stories:[]}` → the client uses the
   static bank (js/keyboard-story.js `STATIC_STORIES`, the offline floor). Same loopback
   default + `OLLAMA_HOST` override, same-origin only, and — like wordgen — the request
   carries only act/tier/count constraints, NEVER the player name or any PII. Generated
   story text is data (fillText/pattern-stream only, rule 1).
   *Yield/variety hardening (Trevor, 2026-07-28) — no safety check was loosened:* the
   server parser (`parseAndValidateStories`) was made robust to small-model line-drift
   (it scans all lines and IGNORES blank lines rather than splitting stories on `\n\n`,
   which was silently dropping ~93% of valid generations) — the ONLY change is
   block-splitting; every per-sentence safety gate and the pangram/min-extras gates are
   unchanged, so a junk/unsafe reply still yields `{stories:[]}`. Validated generations
   now persist client-side to the **`kk-stories`** localStorage namespace (see rule 8) so
   variety ACCUMULATES across sessions; `buildStoryPool` DEDUPS a generated/cached base
   (normalized) against the static bank and against earlier entries, so the static floor
   is never diluted and the exact-static-pangram repeat is fixed. An optional **`avoid`**
   query param (`/api/keyboard-story?tier&count&avoid=…`) feeds a few recent CACHED bases
   back as an "make something different" hint — it carries story TEXT only, never the
   player name/PII (rule 6), and each inbound value is structurally validated symmetric
   to the outbound content (`sanitizeAvoidList`: same charset/length/safety chain, count
   capped). Winnability never depends on generation or the cache — the static bank is
   always appended (INV-64/INV-67).
   *Single-source blocklist + additive parent control (Trevor, 2026-07-28):* the
   kid-safety word blocklist is defined in ONE file, `js/word-blocklist.json`, read by
   BOTH languages — the Go server embeds+unmarshals it (`loadChatWordBlocklist` →
   `chatWordBlocklist`) and the client imports it (`js/word-blocklist.js` `BASE_WORDS`).
   The FLOOR has exactly ONE definition and every consumer reads it; editing the JSON
   changes them all at once (journal L41; `TestChatWordBlocklistLoaded` +
   `word-blocklist-sync.test.mjs` gate that a good file loaded on each side).
   *Amended 2026-09-11 after a `/security-review` finding:* this rule previously read
   "no hard-coded copy exists in either language," which was **not true** — `main.go`
   carried a second literal list that was the ONLY gate on the `/api/wordgen` path, and it
   had DRIFTED from the floor (7 floor words — `whiskey`, `liquor`, `murder`, `vodka`,
   `bitch`, `suicide`, `booze` — passed it, all spellable from L9 onward, and the client
   applied no blocklist at all). The precise rule is: **the floor has one definition, and a
   path may ADD to it but may never REPLACE it.** `isBlocked` is now the UNION of the floor
   (exact-match, on the whole word and on each letter-token so `zig-vodka` cannot smuggle one
   through) and `wordgenSubstringExtras`, a deliberately-kept ADDITIVE substring layer.
   The two match differently on purpose: **substring matching is only safe on a single
   generated word, never on prose** ("hello" contains "hell") — which is why wordgen can
   afford substrings and the coda/chat path uses exact words. `js/wordgen.js` `takeWords()`
   now applies `hasBlockedWord` from the same single source as a client backstop.
   `blocklist_sync_test.go` pins floor-coverage for BOTH consumers, compound smuggling, and
   extras retention — the ABSENCE of that test is why the drift survived undetected, so any
   new consumer of the floor must arrive with its coverage test.
   **Fail closed, never open** *(added 2026-09-11)*: a parseable-but-gutted blocklist
   (`{"words":[]}`, a renamed key, a one-word list) used to leave the loaded set empty, which
   silently made every word pass on both sides. `loadChatWordBlocklist` now REFUSES a set
   below `minSafetyFloorWords`; with no sane floor, `validateWords` serves nothing and
   `chatOutputOK` rejects everything, so every path lands on the always-available static
   content. **The safety floor and the One Rule floor never fight:** refusing an unsafe
   blocklist can never make a level unwinnable.
   `BASE_WORDS` is the immovable FLOOR every consumer (coda + chat + wordgen) enforces. A parent MAY extend it via `settings.blockedWords` (an ADDITIVE layer,
   `setUserBlockedWords`) but can NEVER remove a floor word — matching the house law that
   a setting only ever makes play safer (Survival opt-in, additive difficulty, the
   unremovable server safety prompt). Those user words are untrusted free text (rule 7):
   allowlisted to `[a-z]`, length-bounded, deduped, count-capped on BOTH the storage and
   safety sides; they stay 100% local (never sent to any endpoint — rule 6) and are not a
   new PII class (parent-authored filter words, not data about the child — rule 8). NOTE:
   the settings-SCREEN control that lets a parent TYPE these words is a new free-text
   input surface and MUST run `/security-review` before it ships.
8. **PII floor:** the only personal datum the game stores is the display name. Never
   add more (no ages, no surnames prompted, no location). *(Save slots, 2026-07-19: one display
   name per saved game now lives in `kk-slots` (an unlimited, growable list) — still the
   same PII class, just one per game. Everything else a slot holds is gameplay data:
   progress, collected-card ids, rotation counters. No new PII class was introduced.)*
   *(Story cache, 2026-07-28: the **`kk-stories`** namespace (js/keyboard-story-cache.js)
   persists already-VALIDATED L25 coda story text — pangram sentences + kid-safe
   continuations — so generation variety accumulates across sessions. This is GAME
   CONTENT, NOT a new PII class: no age/name/surname/location is ever stored, and the
   anti-dup `avoid` context it feeds back to the generator is story text only (rule 6).
   It reads defensively (rule 4: try/catch, shape-validated, every entry re-validated as
   untrusted, garbage → empty, never throws; writes never throw), is capped to the last
   20, and holds nothing to "forget" — the static bank remains the winnability floor
   regardless of its state.)*
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
