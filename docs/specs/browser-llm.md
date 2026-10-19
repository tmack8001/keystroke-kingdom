# Spec / ADR — In-Browser LLM on the Static Host

*Status: **PROPOSED**, awaiting Trevor's decision. Written 2026-09-11 by the
product-manager agent. Evidence base: `research/in-browser-llm.md` (every technical
claim there is live-cited with a 2026-09-11 fetch date). No game code was written for
this spec — research + spec only, by Trevor's explicit scope call.*

> ## ⚠️ FACT CORRECTION — 2026-09-18. The hardware bar in §3 was wrong.
>
> *Trevor, reading the requirements line in this spec: "Browser LLM — do we really need
> that much ram to be able to use the built in chrome Gemini nano model insane." He was
> right to push, and the answer is **no**.*
>
> **Chrome requires >4 GB VRAM — OR — 16 GB RAM + 4 cores. It is a disjunction. This spec
> recorded it as a conjunction ("**>4 GB VRAM**, 16 GB RAM, 4+ cores, and **≥22 GB free
> disk**"), which is not what the page says and never was.** Chrome's verbatim text is
> *"**GPU or CPU**: Built-in models can run with GPU or CPU."* An ordinary 16 GB
> integrated-graphics laptop — or a 16 GB Apple-silicon Mac — clears the bar on the CPU
> clause alone, with no discrete GPU. The 22 GB figure is **free-disk headroom for
> provisioning**, not memory and not the model's size (Chrome: *"Built-in models should
> be significantly smaller"*).
>
> **This was our transcription error, not a relaxation by Google** — the source pages
> were last updated 2026-08-26 and 2025-05-20, both *before* the 2026-09-11 research
> pass. Re-verified 2026-09-18 across three Chrome pages that carry the block word for
> word. Everything else in §3 re-verified **unchanged**: Chrome 148 web-stable, the four
> availability states, the platform exclusions, Mozilla **negative**, WebKit **oppose**,
> no lighter model tier or cheaper task API. Full evidence and citations:
> `research/in-browser-llm.md` §Requirements, §Download-time vs run-time, §Is there a
> lighter path.
>
> **What this does and does not change.** It does **not** change §1's recommendation,
> which rests on opportunity cost (the public build is 60 commits behind; no player has
> seen this year's work) and on §4.2's chat verdict, neither of which is affected by a
> hardware figure. It **does** materially change the §8 "almost nobody qualifies" risk —
> the addressable population is larger than this spec assumed, probably much larger — so
> **if the decision is ever revisited, it must be revisited on the corrected number.**
> §3 and §8 are corrected below; §1 is left exactly as written.

---

## 1. Recommendation

**Build it for exactly one of the three features, and only in its zero-cost form.**
Add a small **provider abstraction** behind the existing fallback chain, with a
Chrome-Prompt-API provider that is used **only when `LanguageModel.availability()`
already reports `"available"`** — i.e. when the ~4 GB model is already on the player's
disk and our page costs them nothing. Wire that provider to **`/api/wordgen` only**
(fresh words are low-risk, already re-validated against the level's key set, and
already fully optional). **Do not** wire it to the Act 6 IM-friend: free-form chat with
a child is the one surface whose safety today depends on a system prompt the client
*cannot* strip, and no browser-side design can restore that property. **Do not** ship a
page-provided model (WebLLM / transformers.js / wllama): a several-hundred-MB first-run
download in a game whose One Rule forbids stalling a child is a straight violation, and
the reach is worse than it looks. The keyboard-story coda is a defensible *later* phase
but is not worth doing on its own. If Trevor prefers zero new moving parts, **"do
nothing" is a legitimate and cheap answer** — the static host already plays correctly
and completely, by design.

---

## 2. The problem

Keystroke Kingdom ships twice from one codebase:

| | Local (`./keystroke-kingdom`) | Static (`tmack8001.github.io/keystroke-kingdom/`) |
|---|---|---|
| `/api/wordgen` | Fresh level-appropriate words augment the static pools | 404 → static pools only (`announceStaticFallback`) |
| `/api/chat` (Act 6 IM-friend) | A real conversational friend | `chatHealthy()` false → the friend "naps", scripted warmth |
| `/api/keyboard-story` | Fresh all-26-letter L25 coda stories | `STATIC_STORIES` bank of 6, rotated per slot |

None of this is broken. The static fallbacks are designed, tested, and are the
winnability floor (INV-64, INV-67). The *cost* of the static host is **variety**: the
public build repeats the same word pools and the same six coda stories, and the
IM-friend — a whole Act 6 world — simply is not there for anyone who plays the link
rather than building the Go binary.

The question is whether an on-device browser model can recover some of that variety at
acceptable cost.

---

## 3. Option space

| Option | Bytes we ship | Player's first-run cost | Reach | Server-side safety prompt | Complexity | Verdict |
|---|---|---|---|---|---|---|
| **A. Status quo (static only)** | 0 | **0** | 100% | n/a (feature absent) | none | **Keep as the floor, always** |
| **B. Chrome Prompt API, `"available"` only** | 0 | **0** | Chrome desktop ∩ hardware gate ∩ model already resident | **lost** | small | **Recommended, wordgen only** |
| **C. Chrome Prompt API, accept `"downloadable"`** | 0 | **~4 GB download** | larger, eventually | lost | small | **Rejected** — One Rule |
| **D. WebLLM (WebGPU)** | ~0.4–1 GB weights | multi-hundred-MB download + engine load | WebGPU ≈87% of browsers minus VRAM reality | lost | large | **Rejected** |
| **E. transformers.js / ONNX Runtime Web** | ~0.3–1.3 GB | same | same | lost | large | **Rejected** |
| **F. wllama (WASM llama.cpp)** | ~0.3–1 GB | same, slower (single-threaded on Pages) | widest | lost | large | **Rejected** |

Facts driving the table (all cited in `research/in-browser-llm.md`):

- The Prompt API shipped **stable on the web in Chrome 148, 2026-05-05**; the base text
  API needs no origin trial and no flag.
- It requires Windows 10/11, macOS 13+, Linux, or **Chromebook Plus** ChromeOS.
  **Chrome for Android and iOS are not supported.**
  **Reach framing corrected 2026-09-12 (Trevor).** An earlier draft of this spec measured
  that against all web traffic (StatCounter Aug 2026: mobile 49.36%) and concluded "about
  half of all players are excluded before any hardware clause." **That is the wrong
  denominator.** Keystroke Kingdom is not playable on mobile and is not designed to be — it
  teaches touch typing on a physical keyboard (see `docs/ROADMAP.md` §2b). Mobile users are
  therefore **not addressable players**, and the Prompt API excluding them costs this game
  nothing. Measured against the audience that can actually play — desktop, plus
  tablet-with-keyboard, which the Prompt API's Chromebook-Plus support partially covers —
  reach is materially better than the traffic figure implies.
  ~~**The real gate is the hardware conjunction WITHIN desktop**~~ **[corrected
  2026-09-18: there is no hardware *conjunction*; it is a disjunction, and it is far more
  permissive than this spec assumed — see the banner. The real gate within desktop is
  BROWSER SHARE (Chrome/Chromium only, indefinitely), with hardware a secondary filter.]**
  Nobody has measured either for this audience. That is precisely what Phase 0 exists to
  answer, and it is the only number that should drive the build/don't-build decision.
- Hardware gate **[corrected 2026-09-18 — see the banner above]**: Chrome's text is
  *"**GPU or CPU**: Built-in models can run with GPU or CPU."* — **either** *"strictly
  more than 4 GB of VRAM"* **OR** *"16 GB of RAM or more and 4 CPU cores or more."* Plus
  **≥22 GB free disk** on the Chrome profile volume (a provisioning headroom rule, not a
  memory or model-size figure); the model is deleted if free space later drops under
  10 GB. Audio input would require a GPU — text generation, our only use case, does not.
  Chrome's user-facing help page states the same gate far more loosely still: *"Minimum
  free disk space: 20GB (approximate). Sufficient device performance."*
- **No lighter path exists within the API family [verified 2026-09-18].** Summarizer,
  Writer, Rewriter and Proofreader publish the *identical* requirements block because
  they share one foundation model; there is no smaller model tier and no quota-limited
  mode. Only Translator and Language Detector use lower-bar *expert* models, and they
  cannot generate vocabulary.
- The model is **~4 GB** (The Register: ~4.27 GB for desktop v3Nano). Chrome's own docs
  decline to state a number.
- Users and admins can turn it off entirely (Settings → System → On-device AI;
  `GenAILocalFoundationalModelSettings`), which deletes the files and blocks re-download.
- **Mozilla is negative and WebKit opposes.** Firefox and Safari are not coming.
  **Re-verified 2026-09-18, both unchanged** — `mozilla/standards-positions#1213`
  (`position: negative`, last updated 2026-05-09) and `WebKit/standards-positions#495`
  (`position: oppose`, last updated 2026-05-27); MDN still shows "Limited availability"
  and "opposed by two browser vendor(s)". A Prompt-API design remains Chrome-desktop-only
  indefinitely — **this is now the binding constraint on reach, not the hardware.**
- WebGPU itself is much broader (caniuse: 87.35%), but a page-provided model still means
  *we* hand the player a several-hundred-MB download; and **GitHub Pages cannot set the
  COEP/COOP headers** wllama needs for multi-threading.
- `*.github.io` is HTTPS by default, so the secure-context requirement is satisfied; our
  page is top-level and same-origin, so no `language-model` Permissions-Policy
  delegation is needed.

**Why C, D, E, F are all rejected by the same clause.** The One Rule says the game may
only ever stop a player's flow *with joy*. A progress bar counting to 4 GB — or to
700 MB — before a six-year-old can type the letter `j` is the exact shape of the thing
this game does not do. The static path is not a consolation prize here; it is the
correct product. Any download that our page initiates is therefore out of scope,
**permanently**, not just for phase 1.

---

## 4. Per-feature verdict

These three surfaces have genuinely different risk profiles and must not share a verdict.

### 4.1 `wordgen` — **YES (phase 1)**

Single words, drawn into a typing pool, each already re-validated client-side against
the level's own unlocked key set (`takeWords(level, {keys})` in `js/wordgen.js` drops
any word containing an out-of-charset character) and rendered as canvas/`textContent`
data. The charset allowlist is **structural**: at Level 4 the only characters the game
can display are `a s d f g h j k l ;`, so the blast radius of a bad generation is a
nonsense but harmless string, dropped before display. Generated words are additive to a
static pool that already guarantees winnability. This is the surface where a browser
model buys real value (variety → muscle memory instead of memorization) at the lowest
risk. **Wire it.**

### 4.2 `chat` — Act 6 IM-friend — **NO**

This is free-form conversation with a young child, and it is the one place the project
deliberately put safety on the **other side of a trust boundary**:

- `main.go chatBaseSafety` is "the server-owned, **client-unremovable** system-prompt
  preamble" — including the prompt-injection guard that tells the model to treat the
  child's messages as chatter, never as instructions.
- `curatedPersonas` bodies live server-side specifically so "a tampered client can't
  reshape a curated friend."
- `chatOutputOK` runs the blocklist over the model's reply **on the server**, and
  `js/chat.js` has **no client-side equivalent** — it trusts the server's check today.

Move generation into the browser and all three properties evaporate by construction: a
system prompt composed by the page is editable by anyone who controls the page. There is
no client-side design that restores them — not obfuscation, not a WASM blob, not
subresource integrity. Meanwhile the *current* static-host behavior has **zero**
generative risk (the friend naps and the child gets scripted warmth).

Trading "no generative risk" for "generative risk with a removable guard" on the child's
most open-ended surface is not a trade this project should make to gain variety. If
Trevor wants the IM-friend to exist for public players, the honest route is a **hosted
endpoint he controls** (which reintroduces the server, the cost, and a PII review) — a
different decision, not this one.

### 4.3 `keyboard-story` (L25 "MY STORY" coda) — **DEFER (phase 3, optional)**

Technically the easiest of the three to make safe client-side: the full validation chain
already exists in the browser (`validateGeneratedStory` → `validateStorySentence` →
`STORY_SENTENCE_RE` charset, `MAX_STORY_SENTENCE_LEN`, `hasBlockedWord`, sub-line width,
plus `coversAllLetters` for the pangram floor), the `kk-stories` cache already persists
only already-validated text, and `buildStoryPool` already dedups against the static
bank. A Prompt-API provider would slot in exactly where `takeKeyboardStories()` does
today, with **no new validation code at all**.

But: it fires **once, at the very end of the whole game**, for the small subset of
players who reach Level 25 *and* are on a qualifying Chrome desktop *and* already have
the model resident. The expected number of real players served is close to zero. It is
worth doing only as a nearly-free second consumer of an abstraction phase 1 already
built — never as its own project.

---

## 5. Design — a provider behind the existing fallback chain

### 5.1 The shape

```
caller  ─► existing client module ─► provider chain ─► first provider that answers
                                       1. server   (fetch /api/*  — local build)
                                       2. browser  (LanguageModel — static host)
                                       3. (none)
        ─► STATIC BANK / STATIC POOL   ← always appended, never conditional
```

New module: **`js/llm/provider.js`** (pure, no DOM, no canvas), exporting a single
narrow interface both providers satisfy:

```js
// resolveProvider() → { id:'server'|'browser'|null, generate(spec) → Promise<raw[]> }
// Never throws. Never blocks. Returns [] on anything unexpected.
```

Plus **`js/llm/browser-provider.js`**, which owns *all* Prompt-API contact.

### 5.2 Hard rules for the browser provider

1. **`availability()` at boot, once, and never `create()` speculatively.** Guard with
   `'LanguageModel' in self` first. `availability()` needs no user activation;
   `create()` does — and every generation we want happens after a keypress anyway.
2. **Only `"available"` counts.** `"downloadable"`, `"downloading"`, `"unavailable"`,
   a throw, or a missing global all resolve to *no provider* — immediately, silently,
   with the same one-line `console.info` idiom `announceStaticFallback()` already uses.
   **We never call `create()` in a state that would start a ~4 GB download.** This is
   the One Rule expressed as a single `if`.
3. **Never awaited on any path a player is waiting on.** Same posture as
   `js/wordgen.js` `prefetch()` and `js/keyboard-story-gen.js`
   `prefetchKeyboardStories()`: fire-and-forget, consumed by a synchronous `take…()`
   that returns `[]` when nothing landed. Bounded timeout (reuse the existing 4 s /
   8 s constants). A slow model can only ever mean "static this time."
4. **Session hygiene.** One short-lived session per generation batch; `destroy()` in a
   `finally`. Never hold a session across levels. Respect `session.contextWindow` by
   keeping prompts tiny (they are: a key-set and a length window).
5. **The prompt carries no PII.** Exactly the current wire contract — act, level,
   characters, min/max length, tier, count, and the story `avoid` list (story text
   only). Never the player name (security.md rules 6 and 8). This is easier to honor
   in-browser than on the wire, and must be asserted anyway.
6. **The output is data.** Canvas `fillText` / `textContent` / the pattern stream only.
   No new DOM sink (security.md rules 1–2).

### 5.3 What must NOT change

- `STATIC_STORIES`, the per-level word banks, and the scripted friend lines stay the
  **unconditional** floor. The static bank is *appended regardless of provider state* —
  exactly as `buildStoryPool` does today. INV-64 and INV-67 must still pass with the
  browser provider forced to `unavailable`, forced to error, and forced to return junk.
- `js/wordgen.js`'s existing re-validation (`takeWords(level, {keys})`) and
  `js/keyboard-story.js`'s `validateGeneratedStory` run **unchanged** over browser-
  provider output. The provider is a *source*, never a shortcut past validation.
- The Go server path is untouched. On the local build, provider 1 wins and behavior is
  byte-identical to today.

---

## 6. Safety & validation — what exists, what is missing

`.claude/rules/security.md` rules 6, 7, 8 are the binding contract. Mapping for a
browser provider:

| Requirement | Already satisfied by | Gap |
|---|---|---|
| R6 — no external network calls | The Prompt API is an in-process browser API; **zero network**. Strictly *safer* than today's same-origin fetch. Chrome: "No data is sent to Google or any third party when using the model." | none |
| R6 — no PII on the wire | No wire at all; prompt built from act/level/charset/tier only | **assert it in a test** |
| R7 — charset allowlist (words) | `js/wordgen.js` `takeWords(level,{keys})` re-check | none |
| R7 — charset allowlist (stories) | `STORY_SENTENCE_RE` in `js/keyboard-story.js` | none |
| R7 — length caps | `MAX_STORY_SENTENCE_LEN`, `MAX_SUBLINE`, wordgen's `[2,24]` window | none |
| R7 — safety blocklist | `js/word-blocklist.js` `BASE_WORDS` (single-sourced from `js/word-blocklist.json`) + `hasBlockedWord` + the additive parent layer | **wordgen path**: confirm the blocklist is applied to generated *words* on the client, not only to story prose — today the word path relies on the charset filter plus the server's own check |
| R7 — pangram coverage floor | `coversAllLetters` / `validateGeneratedStory` | none |
| R7 — structural validation of responses | Provider returns plain arrays; `buildStoryPool` / `consumeBatch` shape-check | none |
| R8 — PII floor | Nothing new stored; `kk-stories` already holds validated story text only | none |
| **Chat: unremovable system prompt** | `main.go chatBaseSafety` — **server only** | **UNFIXABLE client-side. This is why 4.2 is a NO.** |
| **Chat: curated persona bodies** | `main.go curatedPersonas` — **server only** | **UNFIXABLE client-side** |
| **Chat: output word-check** | `main.go chatOutputOK` — **server only**; `js/chat.js` has no equivalent | Would need a new client `chatOutputOK` over `hasBlockedWord`. Buildable — but it is the *weakest* of the three lost controls and does not rescue 4.2 |

Additional notes:

- **No output safety guarantee from the model itself.** Chrome's Prompt API docs expose
  no safety-settings knob and make no output-safety claim; Google's documented two-layer
  safety system belongs to the *cloud* Gemini API. Marked `[unverified]` in the research
  doc. **Design as if there is none** — our own filters are the only ones that exist.
- **`/security-review` is a gate**, not a nicety: this adds a new content source feeding
  a child-facing surface. Run it before any browser-provider code merges.

---

## 7. Non-goals

- **We never initiate a model download.** Not with a progress bar, not with an opt-in
  button, not "just for grown-ups." Out of scope permanently.
- **No page-provided model** (WebLLM / transformers.js / wllama / ONNX). Not phase 4,
  not later.
- **No hosted/cloud inference.** The game does not phone home (security.md rule 6).
- **No IM-friend on the static host** via a browser model (§4.2).
- **No new setting to "enable AI."** If it needs a toggle to be safe, it is not safe;
  and a setting that *adds* generative content to a child's screen would be the first
  non-additive setting in the game.
- **No loading UI, no spinner, no "generating…" state** anywhere a player can see.
- **No behavior change on the local Go build.** Provider 1 keeps winning there.

---

## 8. Risks

| Risk | Severity | Mitigation | Residual |
|---|---|---|---|
| Content quality is worse than the curated static pool (a 4 GB nano model writing early-reader words) | Medium | Validation drops anything out of charset/length; static pool always present; measure yield before shipping (wordgen's yield story on L25 went 7% → 67% only after measurement) | Some sessions get fewer usable generated words than the local build. Acceptable — it is purely additive |
| Almost nobody qualifies, so the work buys nothing | ~~**High**~~ → **Medium** *(downgraded 2026-09-18)* | Phase 0 measures `availability()` in the real audience before any generation code ships. The corrected disjunction admits every 16 GB desktop/laptop, integrated graphics included — the qualifying population is materially larger than this spec assumed | Still unmeasured, and now gated mainly on **Chrome share** rather than on hardware. We may still correctly decide to stop after phase 0 |
| A future Chrome change (API rename, policy gate, removal) breaks the path | Medium | Everything behind one provider module; a failure resolves to static | A silent regression that only static-host players see. Covered by an invariant test with the provider forced unavailable |
| The Prohibited Uses Policy / terms coupling turns out to have real obligations for a children's game | Medium | `[unverified]` in the research doc — **confirm before shipping** | Trevor's call; may be a reason not to ship at all |
| A curious kid opens devtools and edits the prompt | Low (wordgen) | Structural charset gate means the worst case is a nonsense word | Real but bounded. This same risk is **not** bounded for chat, which is why chat is out |
| Complexity creep: a provider abstraction invites someone to add provider 3 | Low | Non-goals §7 are explicit; the interface takes a spec and returns raw candidates, nothing more | — |

---

## 9. Phased rollout

**Phase 0 — Measure (no generation, ~half a day).** Ship only the availability probe:
`'LanguageModel' in self` → `LanguageModel.availability(...)`, result logged to the
existing console-info channel and surfaced in the dev console banner. No `create()`, no
generation, no player-visible change. **Then look at whether anyone qualifies.** If the
answer is "essentially nobody," stop here and write that down — phase 0 is a complete,
valuable deliverable on its own.

**Phase 1 — `js/llm/provider.js` + `js/llm/browser-provider.js` + wordgen.** Provider
chain (server → browser → none) behind `js/wordgen.js`'s existing prefetch/consume
shape. `"available"`-only. No change to `takeWords` validation. Local build unchanged.
Tests per §10. `/security-review`.

**Phase 2 — Harden the word path.** Apply `hasBlockedWord` to generated *words* on the
client (closing the §6 gap), regardless of provider. This is worth doing whether or not
phase 1 ships.

**Phase 3 (optional) — `keyboard-story` coda.** Second consumer of the same provider,
feeding `buildStoryPool` in place of / alongside `takeKeyboardStories()`. Zero new
validation. Only if phase 0's numbers justify it.

**Never — `chat`.** Documented as a deliberate non-goal, with the reason (§4.2), so a
future agent does not "finish the set."

Each phase is independently revertible: deleting `js/llm/` and one import restores
today's behavior exactly.

---

## 10. Acceptance criteria — candidate invariants

Written for `test-engineer` to implement directly. Numbers are placeholders; claim the
next free INV-nn in `docs/testing/STRATEGY.md` §5 at build time, and cite this spec
plus the design source in each test header.

- **INV-A (L1) — The static floor is unconditional.** With the browser provider forced
  to every failure mode in turn (`LanguageModel` absent; `availability()` →
  `"unavailable"` / `"downloadable"` / `"downloading"`; `availability()` throws;
  `create()` throws; `prompt()` returns junk, empty, or out-of-charset text), the L25
  coda still assembles and still covers all 26 letters at winRatio 1, 1.5, 2.25 and 3.5,
  and every level's pattern pool is still non-empty. *(Extends INV-64/INV-67;
  product.md One Rule — winnability is never traded.)*
- **INV-B (L1) — We never start a model download.** `create()` is not called unless
  `availability()` returned exactly `"available"`. Asserted by a stub that fails the
  test if `create()` is invoked in any other state. *(product.md §One Rule — "never stop
  a player's flow"; `docs/specs/browser-llm.md` §5.2 rule 2.)*
- **INV-C (L1) — Generation is never on the critical path.** No player-visible code path
  awaits a provider call; with the provider stubbed to hang past its timeout, the level
  starts, plays, and completes within the same observable sequence as with no provider.
  *(tech.md §Adaptive Pacing / One Rule.)*
- **INV-D (L1) — The prompt carries no PII.** For every provider call, the assembled
  prompt string contains none of: the player name, any `kk-slots` field other than
  gameplay constants, or any localStorage value outside the declared spec. *(security.md
  rules 6 and 8.)*
- **INV-E (L1) — Provider output passes the same validation as server output.** Feeding
  identical junk/unsafe/out-of-charset payloads through the browser provider and through
  the server path yields identical accepted sets (both empty for unsafe input).
  *(security.md rule 7; INV-66's both-ends principle, now client-only.)*
- **INV-F (L1) — The blocklist floor applies to generated words, not just prose.** A
  generated word on the `BASE_WORDS` floor never reaches the pattern pool, at any level,
  from any provider. *(security.md rule 7; INV-68.)*
- **INV-G (L2) — Zero behavior change on the local Go build.** With `/api/wordgen/health`
  reporting `available`, the server provider is selected and the browser provider is
  never consulted. *(This spec §5.3.)*
- **INV-H (L1) — Chat has no browser provider.** `js/chat.js` reaches the model only via
  `/api/chat`; no import path connects the IM-friend to `js/llm/`. A structural test —
  it encodes the §4.2 decision so a future wave cannot quietly reverse it.
  *(security.md rule 8 §IM-friend exception; this spec §4.2.)*

---

## 11. Open questions for Trevor

1. **Is phase 0 (measure only) worth doing at all?** It is cheap and it is the only way
   to replace guesswork with a number. If the honest expectation is "our players are you,
   Oona, and a handful of friends on Macs," the population may be knowable without code.
2. **Does the reported Google Generative AI Prohibited Uses Policy acknowledgement create
   any obligation you care about for a children's game?** Flagged `[unverified]`
   in the research doc. If the answer is "I don't want the game touching Google terms at
   all," that kills option B outright and the answer is "do nothing."
3. **Do you accept the §4.2 verdict — the IM-friend stays local-only, forever, on the
   public build?** If you'd rather it exist publicly, the real conversation is about a
   hosted endpoint you control, which is a different spec (cost, PII review, rate
   limits).
4. **Is added word variety on the public build actually a felt problem?** The whole value
   of phase 1 rests on this. If the public build is a showcase rather than a place
   children grind levels, the static pools are fine and this spec should be filed as
   "considered, declined."

---

*Evidence: `research/in-browser-llm.md` (live-cited 2026-09-11; hardware requirements,
API family and vendor standards positions re-verified against primary sources
**2026-09-18** — see the correction banner at the top). Contracts:
`.claude/rules/security.md` rules 6–8; `.claude/rules/product.md` §One Rule;
`docs/testing/STRATEGY.md` §5 INV-64/66/67/68. Code read for this spec:
`js/wordgen.js`, `js/chat.js`, `js/keyboard-story-gen.js`, `js/keyboard-story.js`,
`js/word-blocklist.js`, `js/textworld/personas.js`, `main.go`.*
