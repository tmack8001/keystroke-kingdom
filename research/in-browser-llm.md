# In-Browser, On-Device LLMs

*Feasibility research for lighting up Keystroke Kingdom's three LLM-backed features
(`/api/wordgen`, `/api/chat`, `/api/keyboard-story`) on the free static GitHub Pages
host, where there is no Go server and therefore no local Ollama. Compiled 2026-09-11
by the product-manager agent. The decision this feeds is `docs/specs/browser-llm.md`.*

**How to verify:** every technical claim below carries live references gathered on
**2026-09-11** via WebSearch/WebFetch in this session — no URL is written from model
memory (the arcade-historian standard, `.claude/agents/arcade-historian.md` §citation
standard). Each reference is labeled **[fetched]** (the page was retrieved and read
this session) or *(search result only, not fetched)*. This is a fast-moving space:
**every claim here has a date attached, and a claim older than a few months should be
re-verified before it is trusted.** Anything that could not be confirmed against a
live source is marked `[unverified]` rather than asserted.

---

## 1. Why this question exists

The game ships two ways:

- **Locally** (`go build -o keystroke-kingdom . && ./keystroke-kingdom`) — the Go
  server embeds the assets and proxies three endpoints to a **local Ollama**:
  `/api/wordgen` (fresh early-reader words), `/api/chat` (Act 6's IM-friend), and
  `/api/keyboard-story` (the Level 25 "MY STORY" coda).
- **Publicly**, as a free static site at `https://tmack8001.github.io/keystroke-kingdom/`
  — no server, no cost. There, all three endpoints 404 and every feature silently
  falls back to static content by design (`js/wordgen.js` `announceStaticFallback`,
  `js/keyboard-story-gen.js`, `js/chat.js` `chatHealthy` → false → the friend "naps").

The question: can an **in-browser, on-device** model light these up on the static host,
with no server and all processing staying on the player's machine?

There are two families of answer, and they are very different products:

1. **A browser-provided model** the page merely *asks for* — Chrome's Prompt API /
   Gemini Nano. Zero bytes shipped by us; the browser already has (or fetches) the model.
2. **A page-provided model** we ship and the browser downloads — WebLLM (WebGPU),
   transformers.js (ONNX Runtime Web), wllama (WASM llama.cpp). Hundreds of MB to
   several GB over *our* origin, on *our* first-run.

---

## 2. Chrome's built-in AI — the Prompt API / Gemini Nano

### Status (as of 2026-09-11)

The **Prompt API shipped as a stable web-platform feature in Chrome 148**, released
**May 5, 2026** — not an origin trial, not behind a flag, for the base text API. A
separate **origin trial** covers only the *sampling parameters* extension
(`temperature` / `topK`).

> "The Prompt API gives web developers direct access to a browser-provided on-device
> AI language model." — Chrome 148 release notes

MDN nonetheless marks it **Limited Availability**: *"This feature is not Baseline
because it does not work in some of the most widely-used browsers."*

**References**
1. [Chrome 148 release notes](https://developer.chrome.com/release-notes/148) — release date May 5 2026; Prompt API stable; sampling parameters in origin trial. **[fetched 2026-09-11]**
2. [The Prompt API — Chrome for Developers](https://developer.chrome.com/docs/ai/prompt-api) — page last updated **August 26, 2026**; version support, requirements, session API. **[fetched 2026-09-11]**
3. [Prompt API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Prompt_API) — Limited Availability banner; secure-context, user-activation and permissions-policy requirements. **[fetched 2026-09-11]**

### Feature detection

```js
const availability = await LanguageModel.availability({
  expectedInputs:  [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
});
```

Chrome's *Get started* page documents **four** states — `"unavailable"`,
`"downloadable"`, `"downloading"`, `"available"` — while the Prompt API page's summary
lists three (`available` / `downloading` / `unavailable`). Treat the four-state set as
authoritative and code defensively: **anything that is not exactly `"available"` must
take the static path immediately, with no waiting.**

Guard the global first: `'LanguageModel' in self` (the object does not exist at all in
non-supporting browsers).

**References**
1. [Get started with built-in AI](https://developer.chrome.com/docs/ai/get-started) — the four availability states; requirements. **[fetched 2026-09-11]**
2. [The Prompt API](https://developer.chrome.com/docs/ai/prompt-api) — the `availability()` call shape and returns. **[fetched 2026-09-11]**

### Requirements — the gate that decides everything

| Requirement | Value |
|---|---|
| OS | Windows 10/11; macOS 13+ (Ventura and onwards); Linux; ChromeOS on **Chromebook Plus** (Platform 16389.0.0+) |
| **Not supported** | **Chrome for Android, iOS, and ChromeOS on non-Chromebook-Plus devices** |
| Storage | "At least **22 GB** of free space on the volume that contains your Chrome profile." Model is **removed** if free space later falls below 10 GB |
| GPU | "**>4 GB of VRAM**" |
| CPU/RAM | "16 GB of RAM or more and 4 CPU cores or more" |
| Network | Unmetered connection required **for the initial download only**; no network needed afterwards |

That is a **conjunction**, and every clause is exclusionary. It rules out every phone
and tablet, every Mac on macOS 12 or older, most integrated-GPU laptops (the >4 GB VRAM
clause), and any machine with a nearly-full disk. StatCounter put **mobile at 49.36%**
of worldwide traffic in **August 2026** (desktop 49.11%, tablet 1.54%) — so roughly half
of all web traffic is on a platform where the Prompt API does not exist *at all*, before
any hardware clause is applied.

**References**
1. [Get started with built-in AI](https://developer.chrome.com/docs/ai/get-started) — OS list, 22 GB, >4 GB VRAM, 16 GB RAM / 4 cores, unmetered-download note, unsupported platforms. **[fetched 2026-09-11]**
2. [The Prompt API](https://developer.chrome.com/docs/ai/prompt-api) — same requirements restated; "If available storage falls to less than 10 GB after download, the model is removed." **[fetched 2026-09-11]**
3. [StatCounter — Platform Market Share Worldwide](https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet/worldwide) — August 2026: mobile 49.36%, desktop 49.11%, tablet 1.54%. **[fetched 2026-09-11]**

### The model download

Chrome's own docs decline to state a size ("varies with browser updates; check
`chrome://on-device-internals`"). Independent reporting in **April–May 2026** put the
desktop Gemini Nano weights at roughly **4 GB** (`weights.bin` inside an
`OptGuideOnDeviceModel` directory); The Register cites **~4.27 GB** for the v3Nano
desktop model. The download is triggered by first use of one of these APIs, and
**transient user activation is required** to trigger it and to create a session.
Progress is observable:

```js
const session = await LanguageModel.create({
  monitor(m) { m.addEventListener('downloadprogress', e => { /* e.loaded */ }); },
});
```

**References**
1. [The Prompt API](https://developer.chrome.com/docs/ai/prompt-api) — size "varies", `chrome://on-device-internals`, the `monitor`/`downloadprogress` pattern, user-activation requirement. **[fetched 2026-09-11]**
2. [The Register, "Mozilla pushes back against Google's Prompt API" (2026-04-30)](https://www.theregister.com/2026/04/30/mozilla_pushes_back_against_googles/) — "Google recommends 22 GB available storage, though the Nano (v3Nano) model itself is approximately 4.27 GB for desktop use." **[fetched 2026-09-11]**
3. [gHacks, "Google Chrome Is Silently Downloading a 4GB Gemini Nano AI Model…" (2026-05-06)](https://www.ghacks.net/2026/05/06/google-chrome-is-silently-downloading-a-4gb-gemini-nano-ai-model-to-user-devices-without-consent/) — ~4 GB `weights.bin`, `OptGuideOnDeviceModel` path. *(search result only, not fetched)*

**Important nuance for us:** in many cases the 4 GB is **already on the player's disk**,
pulled by Chrome itself rather than by our page — which is exactly why it became a
privacy story in May 2026. When `availability()` reports `"available"`, our page costs
the player *nothing* in bytes. When it reports `"downloadable"`, accepting the download
would cost them ~4 GB. Those two states must be treated as completely different
products (see §2 of the spec).

### The user can turn it off, and so can an admin

Chrome exposes **Settings → System → "On-device AI"**. Turning it off *"will delete the
on-device Generative AI model files from your device"* and Chrome *"will not download
these models again while the setting is off, even if you try to use a feature that
requires them."* Enterprise/managed machines (a school Chromebook, a family-managed
laptop) are governed by the `GenAILocalFoundationalModelSettings` policy.

**Reference**
1. [Manage on-device Generative AI models in Chrome — Google Chrome Help](https://support.google.com/chrome/answer/16961953?hl=en) — the toggle, deletion behavior, ~20 GB storage note, `GenAILocalFoundationalModelSettings`. **[fetched 2026-09-11]**

### Security / privacy surface

- **Secure context (HTTPS) required.** `*.github.io` sites created after June 15, 2016
  are served over HTTPS automatically, so our static host satisfies this.
- **Transient user activation required** to create a session. In our game every entry
  point is a keypress, so this is naturally satisfied — but a boot-time speculative
  probe is not, and `availability()` (which does not require activation) is the only
  thing safe to call at boot.
- **Permissions Policy directive: `language-model`.** Default allowlist is the
  top-level document and same-origin iframes; where disallowed, `availability()`
  returns `"unavailable"` and other methods reject with `NotAllowedError`. We serve
  top-level from our own origin, so no delegation is needed.
- **On-device claim:** *"No data is sent to Google or any third party when using the
  model"* — processing stays on-device.

**References**
1. [Prompt API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Prompt_API) — secure context; "creation of `LanguageModel` objects requires that the user has recently interacted with the page (transient user activation is required)"; the `language-model` Permissions-Policy directive and its `NotAllowedError` behavior. **[fetched 2026-09-11]**
2. [The Prompt API](https://developer.chrome.com/docs/ai/prompt-api) — "Only available to top-level windows and same-origin iframes" unless delegated via `allow="language-model"`; "No data is sent to Google or any third party when using the model." **[fetched 2026-09-11]**
3. [Securing your GitHub Pages site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https) — "GitHub Pages sites created after June 15, 2016, and using `github.io` domains are served over HTTPS automatically." **[fetched 2026-09-11]**

### Session shape (what our safety prompt would become)

Sessions take `initialPrompts` including a `{ role: 'system', content: … }` message,
and *"the system prompt is never removed"* when the context window overflows
(older user/assistant pairs are evicted first). `session.contextUsage` /
`session.contextWindow` expose the budget.

This matters enormously for the IM-friend: the system prompt is durable **within a
session**, but it is **composed by the page**, i.e. by code the client controls. That
is the crux of §4 below.

**Reference**
1. [The Prompt API](https://developer.chrome.com/docs/ai/prompt-api) — `initialPrompts` with a system role; "The system prompt is never removed"; `contextUsage`/`contextWindow`. **[fetched 2026-09-11]**

### Standards status — two vendors are against it

- **Mozilla: negative** (`mozilla/standards-positions#1213`). Objections as reported:
  developers will write model-specific code paths ("the browser-compatibility problem
  all over again"); the API is not model-neutral; and it *"requires accepting Google's
  Generative AI Prohibited Uses Policy,"* which Mozilla's Jake Archibald called
  *"a bad direction for an API on the web platform, and sets a worrying precedent."*
- **WebKit (Apple): oppose** (`WebKit/standards-positions#495`), labeled with *interop
  risk*, *portability* ("may be impossible or difficult to implement on at least one
  important platform"), and *privacy risk*.

Practical consequence: **do not expect Safari or Firefox to implement this.** Any design
that depends on the Prompt API is a Chrome-desktop-only design, indefinitely.

**References**
1. [mozilla/standards-positions#1213 — Prompt API](https://github.com/mozilla/standards-positions/issues/1213) — position: negative. **[fetched 2026-09-11]**
2. [WebKit/standards-positions#495 — Prompt API](https://github.com/WebKit/standards-positions/issues/495) — position: oppose; interop-risk / portability / privacy labels. **[fetched 2026-09-11]**
3. [The Register (2026-04-30)](https://www.theregister.com/2026/04/30/mozilla_pushes_back_against_googles/) — Archibald's quotes; the Prohibited Uses Policy requirement; model-neutrality argument. **[fetched 2026-09-11]**
4. [Prompt API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Prompt_API) — links both vendor positions as Negative. **[fetched 2026-09-11]**

> `[unverified]` — the **Prohibited Uses Policy acknowledgement requirement** is
> reported by Mozilla and by The Register, but it did **not** appear in the sections of
> `developer.chrome.com/docs/ai/prompt-api` fetched on 2026-09-11. If this becomes
> decision-relevant (e.g. a terms question for a children's game), confirm it against
> Google's own developer terms before relying on it.

> `[unverified]` — whether Gemini Nano applies **non-configurable safety filtering to
> on-device output**. Google's *cloud* Gemini documentation describes a two-layer system
> with always-on protections for core harms including child safety, but that documents
> the Gemini API on Vertex/AI Studio, **not** the Chrome on-device model. The Chrome
> Prompt API docs fetched this session expose **no safety-settings knob and make no
> output-safety guarantee**. Assume none, and keep our own output filter.

---

## 3. The page-provided alternatives (we ship the model)

### WebGPU is the substrate

WebGPU reach is far wider than the Prompt API's: caniuse reports **87.35% global
usage** support. Chrome/Edge 113+, Chrome for Android 152+, Safari 26.0+ (listed as
*partial*), Safari iOS 26.0+, Samsung Internet 24+ — but **Firefox is disabled by
default through version 158**.

**Reference**
1. [caniuse — WebGPU](https://caniuse.com/webgpu) — 87.35% global support; per-browser versions; Safari partial; Firefox disabled by default. **[fetched 2026-09-11]**

### WebLLM (MLC) — WebGPU engine

Apache-2.0; *"a high-performance in-browser LLM inference engine that brings language
model inference directly onto web browsers with hardware acceleration,"* running
entirely in the browser with no server. Caches weights via the Cache API (default),
IndexedDB, or OPFS, so the first load is the only download. Its `prebuiltAppConfig`
model list carries a `vram_required_MB` per model — the smallest entries, read directly
from `src/config.ts`:

| model_id | `vram_required_MB` |
|---|---|
| `SmolLM2-135M-Instruct-q0f16-MLC` | 359.69 |
| `SmolLM2-360M-Instruct-q4f16_1-MLC` | 376.06 |
| `TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC` | 697.24 |
| `gemma3-1b-it-q4f16_1-MLC` | 711.07 |
| `Llama-3.2-1B-Instruct-q4f16_1-MLC` | 879.04 |
| `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` | 944.62 |

Note this is a **VRAM** figure, not a download size; treat it as the right order of
magnitude for weights (hundreds of MB) but not as a byte count. `[unverified]` — the
exact on-the-wire download size per model was not found in a primary source this
session.

**References**
1. [mlc-ai/web-llm (GitHub)](https://github.com/mlc-ai/web-llm) — description, WebGPU requirement, cache backends (`cache` / `indexeddb` / `opfs` / experimental cross-origin), Apache-2.0, stated limitations. **[fetched 2026-09-11]**
2. [web-llm `src/config.ts`](https://raw.githubusercontent.com/mlc-ai/web-llm/main/src/config.ts) — the `vram_required_MB` values quoted above. **[fetched 2026-09-11]**
3. [WebLLM docs — Basic Usage](https://webllm.mlc.ai/docs/user/basic_usage.html) — "loading models requires downloading and it can take a significant amount of time for the very first run without previous caching"; `initProgressCallback`. **[fetched 2026-09-11]**

### transformers.js v3 + ONNX Runtime Web

Hugging Face's transformers.js v3 (shipped October 2024) added WebGPU execution
(`device: 'webgpu'`) on top of ONNX Runtime Web, with 1,200+ pre-converted models on
the Hub. Small-model ONNX artifacts are in the same class: SmolLM2-1.7B-Instruct's
quantized ONNX weights are listed at ~1.31 GB (`model_bnb4.onnx`), with the 135M and
360M variants far smaller.

**References**
1. [Transformers.js v3: WebGPU Support, New Models & Tasks, and More… (Hugging Face blog)](https://www.huggingface.co/blog/transformersjs-v3) — v3 WebGPU support, `device:'webgpu'`, model count. *(search result only, not fetched)*
2. [Transformers.js — WebGPU guide](https://huggingface.co/docs/transformers.js/en/guides/webgpu) — the WebGPU device option. *(search result only, not fetched)*
3. [HuggingFaceTB/SmolLM2-1.7B-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct) — ONNX artifact sizes. *(search result only, not fetched)*

### wllama — WASM llama.cpp, no GPU required

MIT-licensed WebAssembly binding of llama.cpp: *"can run inference directly on browser
(using WebAssembly SIMD), no backend or GPU is needed,"* with optional WebGPU in v3.
Firefox uses wllama as an inference engine in its Link Preview feature (Beta/Nightly).

Two hard constraints matter for a GitHub Pages host:

- **2 GB maximum single file** (ArrayBuffer limit); larger models must be split into
  chunks of "maximum 512MB".
- **Multi-threading requires the `Cross-Origin-Embedder-Policy` and
  `Cross-Origin-Opener-Policy` headers.** GitHub Pages does not let you set custom
  response headers — so single-threaded WASM inference is the realistic ceiling there,
  and WebGPU on Firefox runs in "compat mode" with performance *"significantly
  degraded."*

**References**
1. [ngxson/wllama (GitHub)](https://github.com/ngxson/wllama) — WASM SIMD / no GPU needed; 2 GB single-file limit and 512 MB split chunks; COEP/COOP requirement for multi-threading; MIT; Firefox Link Preview; quantization guidance. **[fetched 2026-09-11]**
2. [@wllama/wllama on npm](https://www.npmjs.com/package/@wllama/wllama) — package home, v3 WebGPU/multimodal/tool-calling. *(search result only, not fetched)*

---

## 4. The safety question this research exists to answer

Keystroke Kingdom's LLM safety chain (`.claude/rules/security.md` rules 6–8) is
currently **split across two trust domains**, and that split is deliberate:

| Control | Where it lives today | Survives a move to the browser? |
|---|---|---|
| Charset allowlist + length caps (coda) | Client `validateGeneratedStory` / `validateStorySentence` **and** Go `validateStorySentenceGo` | **Yes** — the client half already exists |
| All-26-letter pangram coverage | Client `coversAllLetters` **and** Go `storyCoversAllLetters` | **Yes** |
| Kid-safe word blocklist | `js/word-blocklist.json`, loaded by **both** `js/word-blocklist.js` (`BASE_WORDS`) and Go `chatWordBlocklist` | **Yes** — already single-sourced (journal L41) |
| Static content floor (winnability) | `STATIC_STORIES`, per-level word banks, scripted friend lines | **Yes** — client-side already |
| **The IM-friend's system prompt (`main.go chatBaseSafety`)** | **Server only — client cannot supply or strip it** | **NO** |
| **Chat output word-check (`chatOutputOK`)** | **Server only** | **NO client equivalent exists** |
| Curated persona bodies (`curatedPersonas`) | **Server only — "a tampered client can't reshape a curated friend"** | **NO** |

The first four are genuinely portable. The last three are the entire reason `/api/chat`
is a server endpoint. Moving generation into the browser dissolves that boundary by
construction: **any system prompt the page composes is, by definition, editable by
whoever controls the page** — devtools, an extension, a modified local copy, a fork.

That is not a bug in the Prompt API; it is what "no server" means. The honest framing
is a comparison of *actual states*, not of ideals:

- **Today on the static host, the IM-friend does not exist** — `chatHealthy()` returns
  false, the friend naps, and the child gets scripted warmth. Zero generative risk.
- **With a browser LLM, the IM-friend would exist with a client-composed safety
  prompt** — better than nothing for an ordinary player, and trivially removable by a
  motivated one.

Whether that trade is acceptable is a product decision, not a research finding. It is
taken in `docs/specs/browser-llm.md` §4.

**References (the current implementation, read 2026-09-11)**
1. `main.go` — `chatBaseSafety` (server-owned, client-unremovable preamble), `curatedPersonas`, `chatOutputOK`, `loadChatWordBlocklist`, `parseAndValidateStories`, `validateStorySentenceGo`, `storyCoversAllLetters`, `sanitizeAvoidList`.
2. `js/keyboard-story.js` — `STORY_SENTENCE_RE`, `validateStorySentence`, `validateGeneratedStory`, `coversAllLetters`, `STATIC_STORIES`.
3. `js/word-blocklist.js` / `js/word-blocklist.json` — `BASE_WORDS` floor + additive parent layer.
4. `.claude/rules/security.md` rules 6, 7, 8.

---

## 5. The comparison, condensed

| | Chrome Prompt API | WebLLM (WebGPU) | transformers.js | wllama (WASM) | Status quo (static) |
|---|---|---|---|---|---|
| Bytes we ship | **0** | ~0.4–1 GB weights | ~0.3–1.3 GB weights | ~0.3–1 GB weights | 0 |
| Player's first-run cost | 0 if `available`; **~4 GB** if `downloadable` | Multi-hundred-MB download + load | Same | Same | **0** |
| Reach | Chrome **desktop** only, + hardware gate | WebGPU ≈87% of browsers, minus VRAM reality | Same, + WASM fallback | Widest (no GPU needed) | **100%** |
| Mobile/tablet | **None** | Chrome Android 152+, Safari iOS 26+ | Same | Yes, slowly | **Yes** |
| Firefox / Safari | **No (both oppose)** | Safari 26 partial; Firefox off by default | Same | Yes (degraded) | **Yes** |
| GitHub Pages fit | Good (HTTPS, top-level, no headers needed) | Good | Good | **Limited** — no COEP/COOP ⇒ single-threaded | **Perfect** |
| Complexity added | Small (one provider module) | Large (engine + model hosting + progress UI) | Large | Large | **None** |
| Server-side safety prompt | **Lost** | **Lost** | **Lost** | **Lost** | N/A (feature absent) |

---

## Corrections from citation pass

- The widely-repeated "Chrome 138" figure is about the **Chrome Extensions** Prompt API
  and about flag-gated experimentation, not stable web availability. Stable **web**
  availability is **Chrome 148 (2026-05-05)**. Don't conflate them.
- "WebGPU is supported in Firefox 141 on Windows" appears in secondary blog write-ups;
  caniuse (fetched 2026-09-11) reports WebGPU **disabled by default in Firefox through
  version 158**. Prefer the compat table over the blogs.
- The `vram_required_MB` values in WebLLM's config are **VRAM** figures and were being
  read in secondary sources as download sizes. They are not the same number.

## Unsourceable / weakly-sourced items

- **What fraction of real players clear the Prompt API hardware bar.** No public dataset
  reports the joint distribution of (Chrome desktop) × (>4 GB VRAM) × (16 GB RAM) ×
  (22 GB free disk) × (on-device AI not disabled). `[unverified]`. Every estimate in the
  spec is reasoned from the platform split, not measured — the only trustworthy number
  is the one the game itself could report from `availability()` at runtime.
- **The Prohibited Uses Policy acknowledgement requirement** — reported by Mozilla and
  The Register; not found on Chrome's own Prompt API docs page this session. `[unverified]`.
- **On-device Gemini Nano output safety filtering** — no primary statement found.
  `[unverified]`; assume none.
- **Exact per-model download sizes** for WebLLM / transformers.js. `[unverified]`.

---

*Related: [[hacker-culture]] (the game's LLM features live in its hidden layer),
`docs/specs/browser-llm.md` (the decision), `.claude/rules/security.md` rules 6–8
(the binding safety contract), `docs/testing/STRATEGY.md` §5 INV-64/66/67/68.*
