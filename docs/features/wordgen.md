---
feature: wordgen
code: [main.go, js/wordgen.js]
rules: [.claude/rules/security.md]
screenshots: null
capture: null
verified: 2026-09-11
---

# Local-LLM Word Generation

Optional feature, landed 2026-07-12: if a local [Ollama](https://ollama.com) instance
is reachable from the game's own Go server, the server asks it for fresh,
level-appropriate early-reader words to **augment** (never replace) the static word
pools in `js/levels.js` — reducing repeatability so a returning child trains muscle
memory, not memorization of a fixed list. If anything is missing, absent, or fails at
any point in the chain, the feature becomes a silent no-op end to end: zero behavior
change, zero console noise, no loading pause anywhere, and the static pools play
exactly as they always have. This is the design, not a fallback bolted on afterward.

## Why this is safe to read as low-risk

The player never notices whether wordgen is active. There is no UI state for it, no
setting to toggle, no loading spinner, no error message. The only observable
difference when it's working is that some level word pools include extra realistic
words alongside the curated static ones.

## Architecture

```
js/wordgen.js (client)  ──same-origin──>  main.go /api/wordgen*  ──loopback/OLLAMA_HOST──>  Ollama
     ↑ re-validates                              ↑ mandatory validation chain
     ↑ retry/availability policy                 ↑ two-tier word supply: fresh buffer (TIER 1)
                                                    + fallback reservoir (TIER 2) — see below
```

Both sides validate independently — the client never trusts even its own server
(defense-in-depth, security.md's general posture applied to this feature).

## Server: `main.go`

### Endpoints

- **`GET /api/wordgen/health`** → `{"available": true, "model": "llama3.2"}` or
  `{"available": false, "reason": "ollama-unreachable"}` or
  `{"available": false, "reason": "no-model", "model": "llama3.2"}`. Probes Ollama's
  `/api/tags` with a 250ms timeout; distinguishes "Ollama isn't running" from
  "Ollama is running but the configured model isn't pulled" so the client can log
  (at most) a debug-level distinction, never surface either to the player.
- **`GET /api/wordgen?act=<a>&level=<n>&characters=<chars>&minWordLength=<n>&maxWordLength=<n>`**
  → `{"words": [...]}`. The request **declares its constraints** (Trevor's contract,
  2026-07-12): the server never generates against an allowlist — or a length
  window — the request didn't state.
  - `characters` — REQUIRED. 1–40 runes, every rune bounded by the global
    `typeableSuperset` (lowercase a–z, digits, the game's symbol keys, backtick,
    space). Missing/oversized/out-of-superset → **HTTP 400** `{"error":"bad-characters"}`.
  - `level` — REQUIRED; names the manifest entry (prompt examples + dedup seed +
    variability seed). Unknown level → **HTTP 400** `{"error":"bad-level"}`.
  - `act` — OPTIONAL; integer 1–5 if present (else **400** `{"error":"bad-act"}`);
    used only as prompt flavor, nothing else.
  - `maxWordLength` — OPTIONAL (added 2026-07-13, TF-E1; ceiling raised to **24**
    the same day to give the settings-driven WORD LENGTH lever — see below —
    genuine headroom past the early-reader ceiling, matching MAX WORD LENGTH's
    WIZARD-equivalent top rung), a positive integer if present. Non-numeric or
    `< 1` → **HTTP 400** `{"error":"bad-maxwordlength"}`. The effective per-word
    cap is `min(requested, maxPlayWordLen)` — **`maxPlayWordLen` is 24** — so a
    request can never widen words past what the game's own play logic (and
    `validateWords`) already allows; a value below `minPlayWordLen` (2) is clamped
    *up* to 2 so a usable window remains. Absent → defaults to `maxPlayWordLen`
    (24), byte-identical behavior to an unfiltered request.
  - `minWordLength` — OPTIONAL (added 2026-07-13, the **symmetric floor sibling** of
    `maxWordLength`, same contract): a positive integer if present, clamped into
    `[minPlayWordLen, maxPlayWordLen]` (2–24); non-numeric or out of range is
    superset-bounded rather than rejected. Absent → defaults to `minPlayWordLen` (2),
    byte-identical to pre-2026-07-13 behavior. If a declared `minWordLength` would sit
    above the resolved `maxWordLength`, `effectiveMinLen` clamps it back down to the
    max — the resolved window can never invert.
  - The resolved window (`effectiveMinLen(p)` to `effectiveMaxLen(p)`) is stated
    directly in the Ollama prompt (`buildGenPrompt`'s `lenRule`) — length adherence
    starts at the source, not only in downstream validation.
  - The **effective allowlist = `characters` ∩ manifest keys** — defense in both
    directions: a stale client can't widen the charset past the manifest, and a
    stale manifest can't widen it past what the client declared.
  - Returns whatever batch is currently buffered for **that level + that
    effective charset + that declared length window**
    (`cacheKey(level, sortedCharset, minLen, maxLen)` — see "Two-tier word
    supply" below), clears it on read, and kicks a background refill. **Never
    blocks on generation** — a request only ever reads the buffer (falling back
    to the reservoir when the model is unreachable — see below).

  **Resolved (2026-07-13):** the fresh buffer's cache key used to be `(level,
  sortedCharset)` only, so a batch generated under one length window could be
  served as-is to a later request declaring a *different* window (papered over,
  not prevented, by the client's own structure filter). `cacheKey` now takes the
  full `(level, sortedSet, minLen, maxLen)` tuple, so a batch generated for one
  length window structurally can never serve a request declaring a different
  one — the invariant is enforced at the key itself, not relied on downstream.
- **`…&prefetch=1`** → always `{"words": []}` immediately; side effect only — warms
  the background cache for a level the client expects to reach soon.

A malformed request gets a 400 with an error tag (the client's retry policy treats
any 4xx as structural — no retry — which is the correct response to a bad URL); a
*well-formed* request the server simply has nothing for returns `{"words": []}`.

### Other `main.go` surfaces (this page owns the file; the features live elsewhere)

`main.go` is routed to this page by `scripts/feature-map.json`, but it now hosts four
distinct surfaces. A change to it should prompt checking all of these docs:

| Surface | Documented at |
|---|---|
| `/api/wordgen*` (this page) | here |
| `/api/chat` — the Act 6 IM-friend | [[text-worlds]] |
| `/api/keyboard-story` — the L25 coda generator | [[engine-flow]] |
| The themed 404 (`themedNotFound`/`notFoundWriter`/`notFoundPage`, added 2026-09-11) | [[easter-eggs]] |

The themed 404 matters to *this* feature for one reason: it deliberately leaves
`/api/*` alone (bare `text/plain`), because the health probe's 404 is the
feature-detect signal this client branches on. `chatOutputOK`'s fail-closed behavior
(above) is likewise shared by the chat and coda paths, not wordgen-only.

### The level manifest — the bridge from curriculum data to the Go binary

The Go binary can't parse `js/levels.js` (a JS/ESM file) at compile time, so
`scripts/gen-wordgen-manifest.mjs` (run via `make gen`, and as the first step of
`make build`/`make run`) derives a compact JSON manifest and writes it to the
committed, `go:embed`-ed `js/wordgen-manifest.json`:

```json
{"3": {"keys": ["s","d","f","j","k","l"], "sample": ["slsl","fslk", ...]}, ...}
```

Per level: the cumulative unlocked key set (`keys`, deduped) and up to 10 sample
words already in the static pool that look like plain lowercase words (regex
`^[a-z]{2,8}$`, no symbol wrappers) — used both as few-shot prompt examples and as a
dedup seed so generated batches never echo an existing pool word. Early pure-drill
levels (1–2, and every symbol-only Act 5 level 16–23 before Level 24) have an empty
`sample` — the charset constraint still fully applies, validation just has fewer
seed words to diversify against. `loadManifest()` tolerates a missing/garbage
manifest file by falling back to an empty map — the feature degrades, the page
server never crashes over it.

### Prompt & generation

`generateWords` calls Ollama's `/api/generate` (non-streaming) with a prompt built
from the level's key set and sample words, one hard-retry on a transient error
within the request's own context budget. A rotating `styleHints` cycle (favor
shorter words / favor longer words / favor all-different endings) nudges successive
batches toward different character so repeated visits to a level don't converge on
the model's single most-likely answer.

### The mandatory validation chain (security.md rule 7)

Every generated string passes through, in order — any failure at any step silently
drops that word, never the whole batch:

1. **Length** `effectiveMinLen(p)`–`effectiveMaxLen(p)` characters — 2–24 by
   default (both narrow if the request declared a tighter `minWordLength`/
   `maxWordLength`; see the endpoint doc above). `effectiveMaxLen`/`effectiveMinLen`
   are also the belt to `splitLines`'s braces (next section) — the same window is
   enforced at two layers.
2. **Charset allowlist** — every character must be in the EFFECTIVE allowlist
   (request-declared `characters` ∩ the level's manifest keys). This is the same
   charset a human player's keyboard is limited to at that level; a generated word
   outside it is structurally impossible to type and is dropped **per word**, never
   batch-fatal (failure class A). A structurally bad Ollama reply — undecodable,
   wrong field type, empty — is the other class (B): `parseGenResponse` rejects it
   WHOLE (nil, capped at 100 raw lines) and the retry/refill path handles it.
3. **Lowercase normalization.**
4. **Blocklist** (`isBlocked`) — the UNION of two layers; either hit blocks the word.
   **Rewritten 2026-09-11 after a `/security-review` finding — see "The kid-safety
   floor" below.** Layer 1 is the shared exact-word floor (`js/word-blocklist.json`,
   the single source of truth both languages read), matched on the lowercased whole
   word AND on each of its letter-tokens, so a compound like `zig-vodka` cannot smuggle
   a floor word through as one wordgen "word". Layer 2 is `wordgenSubstringExtras`, an
   additive substring layer kept deliberately: for a single generated WORD (never
   prose) substring matching catches inflections the exact-word floor cannot
   (`killing`, `guns`). Substring matching is correct *here* and wrong for prose —
   `chatOutputOK` stays exact-word, because "hello" contains "hell".
5. **Dedup** — within the batch, and seeded against the static pool's sample words
   (never echoes a word the child has already seen from the curated list).
6. **Cap** at 20 words per batch (`maxWordsPerBatch`).

### The kid-safety floor — single source, fail-closed (rewritten 2026-09-11)

A `/security-review` this session found that `isBlocked` consulted a **second,
hard-coded Go list** that had DRIFTED from the shared floor introduced with the L25
coda / chat work. Seven floor words were therefore spellable, generatable, and
servable to a child as typing prompts — `whiskey` (from Level 9's keys onward),
`liquor` (L10), `murder` and `vodka` (L11), `bitch` and `suicide` (L13), `booze`
(L15). This is a real finding, not a hypothetical: it is the exact failure class
security.md rule 7 and journal L41 exist to prevent, and it is why the floor lives in
ONE file.

- **One source of truth.** `js/word-blocklist.json` (31 words) is read by BOTH
  languages: Go embeds and unmarshals it (`loadChatWordBlocklist` →
  `chatWordBlocklist`), and the client imports it via `js/word-blocklist.js`
  (`BASE_WORDS`). Neither language carries a hard-coded copy. `wordgenSubstringExtras`
  is the one permitted ADDITION on the Go side, and its own comment states the
  invariant: never add a word there that belongs in the floor — put it in the JSON so
  both languages and both paths (wordgen + chat/coda) get it.
- **Fail closed, never open.** A gutted or malformed blocklist used to leave the floor
  silently tiny — which for a kid-facing filter means "everything is safe", exactly
  backwards. Now `loadChatWordBlocklist` refuses to install a list smaller than
  `minSafetyFloorWords` (**10**; the shipped file carries 31, ample headroom for a
  legitimate edit) and leaves `safetyFloorLoaded` false. `safetyFloorReady()` gates
  every path that would serve model-generated text to a child:
  - `validateWords` returns `nil` → `/api/wordgen` serves an empty batch → the client
    treats that as a normal no-op and plays the static pools;
  - `chatOutputOK` returns `false` → the chat path substitutes its safe scripted line
    and the coda path drops the sentence (see [[text-worlds]] and [[engine-flow]]).
  Every generated-content feature degrades to its offline behavior, which is always
  winnable and always safe — never to unfiltered output.
- **Pinned by tests.** `blocklist_sync_test.go` (new, 2026-09-11):
  `TestIsBlockedCoversEntireSharedFloor` and `TestChatOutputOKRejectsEntireSharedFloor`
  assert BOTH gates cover every word in the JSON (the regression that shipped);
  `TestIsBlockedCatchesFloorWordInsideCompound` pins the letter-token match;
  `TestIsBlockedKeepsSubstringExtras` pins that the additive layer was not lost in the
  rewrite; `TestSafetyFloorFailsClosedWhenBlocklistIsGutted` and
  `TestSafetyFloorReloadsCleanly` pin the fail-closed behavior. These sit alongside the
  pre-existing `TestChatWordBlocklistLoaded` and the client-side
  `word-blocklist-sync.test.mjs`.
- **A parent may only ever ADD.** `settings.blockedWords` (`setUserBlockedWords`) is an
  additive layer on top of `BASE_WORDS`; no consumer can remove a floor word, matching
  the house law that a setting only ever makes play safer. Those words stay 100% local
  and are never sent to any endpoint. See `.claude/rules/security.md` rule 7.

### Structure-layer size caps (TF-E1, added 2026-07-13)

Below the per-word length filter above, `parseGenResponse`/`splitLines` bound the
raw Ollama reply's **byte size**, closing a gap where line *count* was capped
(`maxParsedLines`, 100) but a single absurdly long line was not:

- **`maxParsedLineLen`** = `maxPlayWordLen * 4` = **96 bytes** (tracks
  `maxPlayWordLen`, which reached its current **24** on 2026-07-13 — the constant
  is computed, not hand-pinned, so it moves with it). A decoded line longer than
  this is a class-A per-item failure — that one line is dropped, the rest of the
  batch survives. Sized as a small multiple of the word-length ceiling to
  tolerate list decoration (`- `, `1. `, bullets) the model may add around a real
  word, without letting an unbounded line reach `validateWords` as a giant "word"
  (this is the belt to the length filter's braces).
- **`maxResponseBytes`** = `maxParsedLines*(maxParsedLineLen+2) + 512` = **10,312
  bytes** at the current constants (`maxParsedLines` is 100). A whole `response`
  string bigger than this is a class-B structural failure — the ENTIRE reply is
  rejected (`nil`), retried on the normal refill cycle, never partially trusted.
  The JSON decoder itself is also bounded
  (`io.LimitReader(body, maxResponseBytes*2+1024)`) so a hostile/broken body
  can't force unbounded decode work before the size check even runs.

Both constants derive from `maxPlayWordLen` so a size cap can never be smaller
than a legitimate word — the same "constraints declared once, enforced at every
layer" pattern as `maxWordLength` above.

### The variability pass (`applyVariability`, runs after the safety chain, never instead of it)

Fixes a specific failure mode: a batch dominated by one suffix/rhyme family (e.g.
"dryer, tryer" plus "fry, dry, try, sty"). Only ever **drops** words, so it can never
undo a safety guarantee from the chain above:

1. **Suffix/rhyme cap** — at most 2 words per batch sharing the same last-2-character
   tail (one mechanism covers both "-er suffix" clustering and true rhymes). Counts
   are seeded from the static sample, so generation diversifies *against* the
   existing pool, not just against itself.
2. **Length spread** — if more than 6 words survive and every surviving word's
   length is within ±1 of the others (no real variety), trim to 6. A small, uniform
   batch is fine; a large one must not be monotonous.

### Two-tier word supply: fresh buffer + fallback reservoir (reworked 2026-07-13)

Design intent (Trevor): the LLM is the source of **freshness** — when the model is
available the game always serves newly-generated, never-reused words. A cache is
**only** a fallback, pulled in when the model can't currently generate. Two
structures, two roles:

- **TIER 1 — the fresh buffer (`cache` map).** A small, lazy hand-off between
  async generation and the polling client: the client prefetches the next level's
  batch while the current one plays, a batch lands here, the client consumes it,
  and the entry is cleared and refilled. Every batch served from here is fresh —
  a consumed key never replays. Keyed by `cacheKey(level, sortedSet, minLen, maxLen)`
  — level, sorted-unique effective charset, **and** the declared length window,
  NUL-joined — so a batch generated under one charset or length window
  structurally can never serve a request declaring a different one.
- **TIER 2 — the fallback reservoir (`resPool` map).** An accumulating, bounded,
  de-duplicated pool of previously-generated, validated words per
  `reservoirKey(level, sortedSet)` — charset only, deliberately window-agnostic,
  since it's filtered to the request's window at serve time instead. Fed from
  **every** successful generation via `reservoirAdd` (the fuller `validateWords`
  output, before the variability pass narrows what's actually buffered), bounded
  to `reservoirCap` = **80** words per key (newest kept, deduped). Consulted via
  `reservoirTake` (filters to `[effectiveMinLen, effectiveMaxLen]`, shuffles,
  caps at `reservoirServe` = **12** words) **only** when `modelReachable` reads
  `false` at request time — a transient model hiccup keeps serving real
  previously-generated words instead of snapping straight to the static pools.
  When the model is healthy the reservoir is never read: a buffer miss returns
  `{"words":[]}` and fresh generation stays the primary path.

`ensureFill(key, params)` starts an async goroutine (mutex-guarded, idempotent
under concurrent calls — `inFlight` map prevents duplicate generations for the same
buffer key) with a generous `backgroundGenBudget` = **60-second** budget (widened
from 30s the same day, wide enough for even an unwarmed cold model to finish its
first batch), since it never blocks any HTTP request. The safety chain runs first
(`validateWords`), then the fuller validated set feeds the reservoir
(`reservoirAdd`), then the variability pass (`applyVariability`) narrows the batch
actually written to the fresh buffer (`cacheSet`) — only a non-empty result is
buffered. There is no persistence across server restarts — both tiers are warm,
ephemeral, per-process state only.

### Cold-model warmup (added 2026-07-13)

Ollama loads a model into memory on its first `/api/generate` call and keeps it
resident for `keep_alive`; a cold load can take on the order of tens of seconds,
which would otherwise make a session's very first generation slow. The server now
keeps the model warm proactively:

- **`modelKeepAlive`** = **`"10m"`** — sent as `keep_alive` on every real Ollama
  generate request (`ollamaGenRequest` gained `KeepAlive` and `Options` fields), so
  the model stays resident across a session's worth of prefetch batches.
- **`maybeWarm()`** issues a minimal `warmModelOnce` ping (`Options:
  {"num_predict": 1}`, `Prompt: "ready"`) that only needs to *load* the model, not
  produce a real answer. Rate-limited by `warmCooldown` = **4 minutes** (shorter
  than `keep_alive`, so the model never lapses between warms) via a CAS on
  `lastWarmNano`, with its own `warmBudget` = **60 seconds**. Fired from two
  places: once at process startup (`go maybeWarm()` in `main()`, best-effort —
  fails fast and silently if Ollama is absent), and again from `handleHealth`
  every time a health probe finds the model newly available (`if available { go
  maybeWarm() }`). Since the client already nudges a health recheck at act
  transitions, this keeps the model warm across an entire session so only the
  very first generation ever pays the cold-load cost.
- **`modelReachable` (`atomic.Bool`)** — the last-observed reachability of the
  Ollama generate/tags endpoint. Set to `reachable && modelPresent` by
  `handleHealth`, and to `true`/`false` by every `generateOnce`/`warmModelOnce`
  attempt (true on HTTP 200, false on transport error or non-200). Read by the
  `/api/wordgen` consume path (above) to decide whether to reach for the fallback
  reservoir. Zero value (`false`) before the first probe is correct: with an empty
  reservoir the fallback simply yields nothing and the static pools play.

Go unit tests for the full chain live in `main_test.go` (25 funcs, updated
2026-07-13 for the two-tier word supply + cold-model warmup) — the validation
chain itself (`TestValidateWords`, `TestBlocklist`, `TestCap`, `TestCharsetOK`,
`TestApplyVariability`, `TestValidateWordsHonorsEffectiveMaxLen`,
`TestValidateWordsHonorsEffectiveMinLen`), request parsing (`TestParseWordgenParams`,
`TestParseWordgenParamsHostileInputs`, `TestParseWordgenParamsIntersection`,
`TestParseWordgenParamsMaxWordLength`, `TestParseWordgenParamsMinWordLength`,
`TestParseWordgenParamsMinExceedsMaxIsCoerced`), the prompt/response layer
(`TestGeneratePromptIncludesEffectiveMaxLen`, `TestGeneratePromptFramingAgesWithLength`,
`TestParseGenResponse`), the HTTP/buffer surface (`TestHandleWordgenBadRequestIs400`,
`TestHandleWordgenPrefetchNeverReturnsCachedWords`, `TestHandleWordgenConsumeClearsCache`,
`TestCacheIsolationByCharset`, `TestCacheIsolationByLengthWindow` — the last one
new, proving a batch generated under one length window can never serve a request
declaring a different one), and the fallback reservoir + warmup surface
(`TestReservoirServedOnlyWhenModelUnavailable`, `TestReservoirRespectsLengthWindow`,
`TestReservoirAddDedupAndCap`, `TestMaybeWarmSafeWhenModelAbsent`) — run via
`go test ./...` (also wired into `make test`).

### Availability & configuration

- **Warmup keeps the model resident** (`modelKeepAlive` = `"10m"` sent as
  `keep_alive` on generate requests, `maybeWarm()`/`warmModelOnce()` pinging at
  startup and on every health→available transition — full detail in "Cold-model
  warmup" above) so a session pays the cold-load cost at most once.
- **`modelReachable` (`atomic.Bool`)** tracks live Ollama reachability and gates
  whether the fallback reservoir is consulted on a buffer miss — see above.
- **Default endpoint**: `http://127.0.0.1:11434` (Ollama's default), loopback only.
- **`OLLAMA_HOST` env var** — the only way to point at a non-default Ollama; accepts
  `host:port` or a full `http(s)://` URL. Trusted **only** as operator-set process
  environment at startup (security.md rule 15) — never derived from any request,
  header, or query parameter. This is what makes the Docker/compose story work:
  `OLLAMA_HOST=host.docker.internal:11434` reaches the host machine's Ollama from a
  container; `OLLAMA_HOST=ollama:11434` reaches a compose sibling service.
- **`OLLAMA_MODEL` env var** — defaults to `llama3.2`. `modelPresent` matches
  tolerating Ollama's automatic `:latest` suffix.
- **`PORT` env var** — unrelated to Ollama, but shared plumbing: setting it switches
  the whole server into "container mode" (fixed port, binds all interfaces, skips
  writing `.dev-url` and skips auto-opening a browser — both dev-machine-only
  behaviors). Unset (normal local dev) keeps the existing auto-picked loopback port
  + `.dev-url` + browser-open behavior untouched.

### Docker / dev-loop tooling

- **`Brewfile`** — `ollama` is listed as OPTIONAL: "local LLM for fresh word
  generation. Absent → the game silently uses its static word pools."
- **`Makefile`** — `make gen` regenerates the manifest; `make setup` runs
  `brew bundle` + `ollama pull $(OLLAMA_MODEL)`; `make wordgen-check` curls and
  pretty-prints both endpoints against a running `make run` server;
  `make wordgen-static-check` runs `scripts/wordgen-static-check.mjs`, which serves
  the repo with plain `python3 -m http.server` (no Go server at all) and asserts the
  client boots with wordgen silently disabled, zero unexpected console errors, and
  no repeated fetch storms once the health probe 404s.
- **`Dockerfile`** — multi-stage: `golang:1.26` builder produces a single static
  binary (`CGO_ENABLED=0`) with `index.html`/`css/`/`js/` (including the committed
  `wordgen-manifest.json`) embedded at compile time; runtime stage is
  `distroless/static-debian12:nonroot` — no libc needed since the server only talks
  plain HTTP to Ollama. `PORT=8080` is set by default in the image.
- **`docker-compose.yml`** — two profiles: `game` (server alone, no Ollama
  configured → static-fallback mode, `{available:false}`) and `game-ollama` (server
  + a sibling `ollama/ollama` service on a named volume for model persistence,
  wired via `OLLAMA_HOST=ollama:11434`). Either profile serves the game at
  `localhost:8080`.

## Client: `js/wordgen.js`

### Security posture (see `.claude/rules/security.md` rules 6–7)

- Talks **only** to the game's own same-origin Go server — never an external host,
  matching the game's "nothing on screen should be a live address" rule extended to
  network calls.
- **The endpoint constants are RELATIVE, not root-absolute** (changed 2026-09-11):
  `HEALTH_URL = 'api/wordgen/health'`, `WORDGEN_URL = 'api/wordgen'` (and the same
  change in `js/chat.js` and `js/keyboard-story-gen.js`). On the Go binary and in
  Docker, which serve from `/`, this resolves identically to before. On the published
  GitHub Pages build the game lives under a `/keystroke-kingdom/` prefix, and a
  root-absolute `/api/...` would leave that prefix and hit the shared `user.github.io`
  **domain root** — a path this game does not own, where a sibling project serving
  `/api/*` could be talked to by mistake. Relative keeps the request inside our own
  prefix, where it 404s and the static-pool fallback engages exactly as designed. See
  `.claude/rules/visual-validation.md` §The Three Environments — root-absolute paths
  are forbidden in `index.html` and in js endpoint constants and import specifiers.
- **The player name never reaches the server.** Every request carries the declared
  constraints only (`?act=<a>&level=<n>&characters=<unlocked keys>`); there is no
  code path anywhere in `js/wordgen.js` that
  reads or forwards `playerName` or any other user-identifying value. This is a
  deliberate design constraint, not an oversight — the wordgen feature is
  level-scoped curriculum content, not personalization, so it has no legitimate
  reason to ever see the player's name in the first place.
- Every returned word is re-validated client-side against the level's own key set
  before use (`takeWords`'s `opts.keys` allowlist) — defense-in-depth; the client
  never fully trusts even its own server's validation chain. Case is deliberately NOT
  normalized in that re-check: the engine's token contract makes case meaningful (an
  uppercase token means Shift), so a word that isn't already lowercase must fail the
  charset check rather than be quietly folded.
- **Client-side kid-safety backstop** (added 2026-09-11): `takeWords()` also runs
  `hasBlockedWord(word)` from `js/word-blocklist.js` — the SAME single-source floor the
  server enforces (plus any additive parent words) — at the last moment before a word
  enters the pattern stream. The server's `isBlocked` remains the primary gate; this
  exists so a server bug or a drifted gate can never put an unsafe word in front of a
  child, which is precisely what happened before the 2026-09-11 fix. It reads the
  shared list, never a second hand-rolled copy — a second copy is the bug class this
  check backstops. `hasBlockedWord` tokenizes on non-letters then exact-word matches,
  so a compound can't smuggle a blocked word through. Same idiom the L25 coda uses
  (`js/keyboard-story.js`).
- Generated words are always rendered as data (canvas fill-text or engine pattern
  tokens), never as markup — same rule as every other piece of text in the game.

### Availability / retry policy — two failure classes, never conflated

**1. Structural absence** (deduced from the health endpoint, never retried hot):
- Network error or 404 on `health` → no Go server, or no API at all (plain
  `python3 -m http.server`, **and the published GitHub Pages build**). Wordgen is
  **permanently disabled** for the session — zero retries, zero noise, matching what
  `wordgen-static-check.mjs` asserts. This 404 is the designed signal, which is why
  the Go server's themed 404 page (added 2026-09-11 — see [[easter-eggs]]) explicitly
  **excludes `/api/*`**: those responses keep their bare `text/plain` body so they
  stay machine-readable, and `status === 404` keeps meaning exactly what this branch
  assumes it means.
- `200 {available:false, reason:"ollama-unreachable"|"no-model"}` → server is up but
  Ollama is absent or unmodeled. Disabled for now, but a **light recheck** is
  allowed — at most once per 5 minutes (`RECHECK_INTERVAL_MS`), and callers (e.g.
  act transitions) may nudge one via `maybeRecheckHealth()` — since Ollama could be
  started mid-session. Rechecks only ever hit `/health`, never `/wordgen`.

**2. Transient failure** (retried with exponential backoff + jitter): once health
says available, a prefetch retries only on HTTP 5xx or a timeout — 500ms → 1s → 2s,
±20% jitter, max 3 attempts (`MAX_ATTEMPTS`, `BASE_BACKOFF_MS`). No retry on a 4xx
(structural — logged once via `console.debug` at most, never `console.error`) or a
valid `200 {words: []}` (the validation chain simply rejected that batch — try again
at the next natural prefetch cycle, not immediately). Three consecutive soft-failed
prefetch cycles (`SOFT_FAIL_LIMIT`) re-run the health probe and follow its fresh
verdict — covers the case where the server loses its Ollama connection mid-session.

Session status is one of four states: `unknown` (not probed yet) → `available` /
`disabled` (permanent) / `dormant` (light rechecks allowed).

### Word-length wiring — live setting, not a fixed constant (revised 2026-07-13)

Superseded the original single-constant design the same day it landed: rather than
a fixed `MAX_WORD_LENGTH`, the client now reads the **live MIN/MAX WORD LENGTH
setting** (`settings.js`'s `getWordLengthRange()` — see [[settings-survival]]) on
every prefetch cycle, so a mid-session Settings change takes effect on the next
prefetch without a page reload.

- **`PLAY_MIN_WORD_LENGTH = 2`**, **`PLAY_MAX_WORD_LENGTH = 24`** — the hard
  play-logic window mirrored from `main.go`'s `minPlayWordLen`/`maxPlayWordLen`
  (the ceiling reached its current **24** the same day, alongside the server
  change, matching the MAX WORD LENGTH setting's WIZARD-equivalent top rung so
  generation can serve genuinely harder play). These are floor/ceiling clamps,
  not the request values themselves.
- **`resolveLengthBounds()`** — reads `getWordLengthRange()` (which returns
  `min: 1`/`max: Infinity` for the ANY/ANY default), clamps both ends into
  `[PLAY_MIN_WORD_LENGTH, PLAY_MAX_WORD_LENGTH]` via `clampLen()`, and defensively
  re-orders if the clamped result would invert (degrades to the widest valid
  window `[2, 24]` rather than ship an empty one — winnability-first, same law as
  the engine's `drawablePool` fallback). Wrapped in try/catch so a broken settings
  read never blocks a prefetch.
- **`buildQuery(level, keys, bounds)`** appends the resolved bounds to every
  request as `&minWordLength=<n>&maxWordLength=<n>` — always explicit on the wire,
  reflecting whatever the player currently has set (ANY/ANY still sends `2`/`24`,
  the widest legal window, which is byte-identical to the pre-2026-07-13 unfiltered
  default).
- **`consumeBatch`'s structure filter** uses the SAME `bounds` object threaded from
  the request that built the query (not the constants directly), so a word surviving
  server-side validation for one window can't slip through if the live setting
  changed between the prefetch firing and the batch being consumed — client and
  server always agree on the window that was actually declared for that specific
  request/response pair.

### API surface

- `initWordgen()` — one-shot boot probe, fire-and-forget, called once near the end
  of `js/main.js`'s boot sequence. Never awaited by gameplay.
- `prefetch(level, keys)` — fire-and-forget; warms the next level's batch while the
  current one plays. `keys` is that level's unlocked key set — the request must
  declare its `characters` (and now its live-resolved `minWordLength`/
  `maxWordLength` bounds, above), so an unusable/missing key set silently no-ops
  (`buildQuery` returns null) rather than send a malformed request. Deduplicated
  per level (`fetching` set) and skips levels already cached (`ready` map). The
  reply's STRUCTURE is validated before use in `consumeBatch`: `body.words` must be
  an array, and only plain strings whose length falls within the SAME `bounds`
  (`{min, max}`) that built the request survive into the batch — the live
  MIN/MAX WORD LENGTH setting, not a fixed constant (revised 2026-07-13, see above).
- `takeWords(level, opts)` — hands the engine whatever batch is ready as **token
  arrays** ready to splice into the pattern list (one entry per letter, e.g.
  `['c','a','t']`), then clears that level's batch. Always safe to call; returns
  `[]` when nothing is ready or wordgen is inactive. `opts.keys` re-validates
  charset (defense-in-depth, above); `opts.wrapSample` detects a level's
  leading/trailing symbol wrapper from a representative static-pool token array
  (e.g. `['[','o','k',']']` for Level 22, or the bare-word case with no wrapper) and
  reapplies the same wrapper to generated words so they match the level's on-screen
  presentation style (`detectWrapper` — only the outermost leading/trailing symbol
  tokens count as wrapper; interior symbols like a compound word's `-` do not).
- `isActive()` — convenience boolean (`available` or `dormant`) for callers that
  want to skip work entirely when wordgen can't possibly help this session.

### Static-fallback guarantee

**This is the published game's normal state.** The free public build at
<https://tmack8001.github.io/keystroke-kingdom/> is GitHub Pages serving the repo root
of `main` with no build step and **no `/api/*` backend at all**, so wordgen is disabled
there on every visit and the static pools are what every player actually gets. A 404
from `/api/*` on a static host is EXPECTED and must degrade silently — verified
end-to-end this session by a read-only static-build lane (11 levels won across all five
acts, all 25 smoke-loaded, zero console errors) and gated in CI by
`scripts/static-host-check.mjs` against both the `/keystroke-kingdom/` sub-path and the
site root (`.claude/rules/visual-validation.md` §The Three Environments).

On any hosting setup without the Go server (plain static file server, a CDN, `file://`),
the health probe's network error / 404 sets `status = 'disabled'` permanently on the
very first check, and every subsequent call in this module becomes a no-op returning
`[]` or nothing — verified end-to-end by `scripts/wordgen-static-check.mjs`, which
serves the repo with `python3 -m http.server`, drives the client through `initWordgen`
+ several `prefetch` calls, and asserts: `isActive()` is `false`, `takeWords()`
returns `[]`, exactly one `/api/wordgen` request was ever made (the health probe,
expected to 404), and no console errors beyond that one expected failed-resource log
line. This is the test that proves the "zero behavior change on static hosting"
guarantee is real, not just a comment.

## Integration point in the engine

See [[engine-flow]] for the three `js/main.js` call sites (`initWordgen()` at boot,
`wordgenTakeWords()` inside `buildPatterns`, `wordgenPrefetch(level + 1)` inside
`startGame()`) and how a generated batch is spliced into the pool alongside the
static words, history-card injection, and Name Moment injection.

## Related

[[easter-eggs]] (the themed 404 in `main.go`, and why `/api/*` is excluded from it) ·
[[text-worlds]] (`/api/chat`, the other consumer of `chatOutputOK` and the shared
safety floor) · [[engine-flow]] (the three call sites, and how generated words compose
with the history-card and Name Moment guaranteed injections; `drawablePool`'s
settings-driven length filter on the STATIC pool is the sibling mechanism to this
feature's own length window on GENERATED words) · [[settings-survival]] (MIN/MAX
WORD LENGTH rows, `getWordLengthRange()` source both this feature and the engine
consume) · [[curriculum-data]] (the
`LEVELS[n].keys`/`.pool` data the manifest is derived from and the client
re-validates against) · `.claude/rules/security.md` (rules 6–7: same-origin only,
no PII, mandatory validation chain)
