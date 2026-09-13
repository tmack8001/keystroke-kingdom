// ─── Local-LLM word generation (client) ──────────────────────────────────
//
// Optional feature. If the Go server reports Ollama is available, the game asks
// it for fresh, level-appropriate early-reader words to AUGMENT (never replace)
// the static pools — reducing repeatability so the child trains muscle memory,
// not memorization. If anything is missing or fails, everything here becomes a
// silent no-op and the static pools play unchanged: zero behavior change, no
// loading pause anywhere. Generated words never gate input.
//
// ONE intentional console line (Trevor, 2026-07-13): when there is no server-driven
// backend at all (static host / no API — the `disabled` path), a single clear
// console.info announces the fallback to the static dictionary, so a bare browser
// "404 (Not Found)" in the console reads — to a human, an agent, or a test — as the
// designed fallback, not a failure. See announceStaticFallback(). A transient
// dormant Ollama (server up, model briefly absent) stays silent — it may recover.
//
// Security (see .claude/rules/security.md rules 6-7): this only ever talks to
// the game's OWN same-origin Go server (`/api/*`) — never an external host.
// The request DECLARES its constraints explicitly (Trevor's contract,
// 2026-07-12; maxWordLength added 2026-07-13, minWordLength added 2026-07-13):
// `/api/wordgen?act=A&level=N&characters=<unlocked keys>&minWordLength=N&maxWordLength=M`
// — the server generates only against an allowlist the request stated
// (intersected with its own manifest), and within the declared [min,max] length
// window (each clamped to the server's play-logic range [2,24]). It carries
// act/level/characters/min/maxWordLength ONLY, never the player name or anything
// user-identifying.
//
// WORD LENGTH is a player-set DIFFICULTY lever (settings.js getWordLengthRange)
// so the game AGES WITH THE PLAYER — shorter=easier, longer=harder. The live
// setting is read PER REQUEST and translated to the min/max params; the client's
// own structure filter (consumeBatch) enforces the SAME window so client and
// server agree on the contract.
//
// The two external-failure classes are planned for, never conflated:
//   A) wrong-charset words — filtered PER WORD (server-side, and re-validated
//      here in takeWords as defense-in-depth; we never trust even our own server)
//   B) failed / unparseable responses — STRUCTURE is validated before any
//      processing (body must be an object, words an array of short strings);
//      a structurally bad batch is ignored whole and retried on the normal
//      cycle, never partially trusted.
// Generated words are always rendered as data (canvas/textContent), never markup.
//
// ─── Retry / availability policy ─────────────────────────────────────────
// Two failure classes, never conflated:
//
// 1. STRUCTURAL ABSENCE — deduced from the health endpoint, never retried hot:
//    - network error / 404  → no Go server or no API (static hosting). Wordgen
//      is PERMANENTLY disabled for the session. Zero retries; ONE clear
//      console.info fallback line (announceStaticFallback), never repeated.
//    - 200 {available:false, reason:"ollama-unreachable"|"no-model"} → server up
//      but Ollama absent. Disabled, but a LIGHT recheck is allowed (at most once
//      per ~5 min, and callers may nudge one at act transitions) since Ollama
//      could be started mid-session. Rechecks hit /health only, never /wordgen.
//
// 2. TRANSIENT FAILURE — retried with exponential backoff + jitter. Once health
//    says available, a /api/wordgen prefetch retries ONLY on HTTP 500 or timeout
//    (500ms → 1s → 2s, ±20% jitter, max 3 attempts). NO retry on: 4xx (structural
//    — logged once to console.debug at most) or a 200 {words:[]} (a valid empty
//    answer — the validation chain simply rejected the batch; we just try again
//    at the next natural prefetch cycle). 3 consecutive soft-failed prefetch
//    cycles → re-run the health probe and follow its verdict.

import { getWordLengthRange } from './settings.js';
import { hasBlockedWord } from './word-blocklist.js';

// Endpoint paths are RELATIVE, not root-absolute. A root-absolute '/api/...' leaves a
// GitHub Pages project-page prefix entirely and hits the DOMAIN root — on a shared
// user.github.io that is a path this game does not own, so a sibling project serving
// /api/* would be talked to by mistake. Relative keeps the request inside our own
// prefix, where it 404s and the static-pool fallback engages exactly as designed.
// Resolves identically on the Go server and in Docker, which serve from '/'.
const HEALTH_URL = 'api/wordgen/health';
const WORDGEN_URL = 'api/wordgen';

const HEALTH_PROBE_TIMEOUT_MS = 800;
const FETCH_TIMEOUT_MS = 4000;
const RECHECK_INTERVAL_MS = 5 * 60 * 1000; // light health recheck cadence
const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 500;
const SOFT_FAIL_LIMIT = 3;

// The play-logic length window shared with the server's validation chain
// (main.go minPlayWordLen / maxPlayWordLen). These are the HARD bounds the
// server clamps every request into; the client mirrors them so a translated
// setting never asks for anything the server would reject. The ceiling is 24
// (2026-07-13), matching the MAX WORD LENGTH setting's WIZARD-equivalent top so
// generation can serve genuinely harder play — it must track main.go's
// maxPlayWordLen.
const PLAY_MIN_WORD_LENGTH = 2;
const PLAY_MAX_WORD_LENGTH = 24;

// resolveLengthBounds reads the LIVE word-length difficulty setting and
// translates it into request params clamped to the play-logic window:
//   { min, max }         — numbers sent on the wire, ALWAYS within [2,24]
// getWordLengthRange() returns { min, max } where ANY-floor → 1 and ANY-cap →
// Infinity. We clamp both into the play-logic window: an ANY floor becomes the
// server default (2, the play floor) and an ANY cap becomes the ceiling (24).
// A bounded value is clamped into [2,24]. The setting layer already coerces a
// nonsensical min>max to the no-filter range, but we defensively re-order here
// too so the request is never inverted. Resolved once per prefetch cycle so a
// mid-session settings change takes effect on the next prefetch.
function resolveLengthBounds() {
  let range;
  try {
    range = getWordLengthRange();
  } catch (_) {
    range = { min: 1, max: Infinity };
  }
  const rawMin = range && Number.isFinite(range.min) ? range.min : PLAY_MIN_WORD_LENGTH;
  const rawMax = range && Number.isFinite(range.max) ? range.max : PLAY_MAX_WORD_LENGTH;
  let min = clampLen(rawMin);
  let max = clampLen(rawMax);
  if (min > max) {
    // Inverted after clamping — degrade to the widest valid window rather than
    // ship a request that would empty every batch (winnability is the floor).
    min = PLAY_MIN_WORD_LENGTH;
    max = PLAY_MAX_WORD_LENGTH;
  }
  return { min, max };
}

function clampLen(n) {
  return Math.max(PLAY_MIN_WORD_LENGTH, Math.min(PLAY_MAX_WORD_LENGTH, Math.round(n)));
}

// Session state machine:
//   'unknown'   — not probed yet
//   'available' — Ollama reachable + model present; generation active
//   'disabled'  — permanent (no API/no Go server); never revisited
//   'dormant'   — server up but Ollama absent; light rechecks allowed
let status = 'unknown';
let lastHealthCheck = 0;
let softFailCycles = 0;

// One clear, greppable line the first time we determine there is no server-driven
// backend (the `disabled` path: network error or 404 → static host / no API). Makes
// the DESIGNED static-dictionary fallback legible to humans, agents, and tests
// instead of leaving only Chromium's bare "404 (Not Found)" console line. Uses
// console.info (never warn/error) so console-error collectors don't count it, and a
// stable message tests can assert on. Logged at most once per session.
let staticFallbackAnnounced = false;
function announceStaticFallback(reason) {
  if (staticFallbackAnnounced) return;
  staticFallbackAnnounced = true;
  if (typeof console !== 'undefined' && typeof console.info === 'function') {
    console.info(
      `[wordgen] server-driven word generation unavailable (${reason}) — ` +
        'falling back to the built-in static dictionary. ' +
        'Expected on static hosts; not an error, gameplay is unaffected.'
    );
  }
}

// Per-level batches already taken from the server, waiting to be consumed by the
// engine via takeWords(). Cleared as consumed.
const ready = new Map();      // level(number) -> string[]
// Levels with a prefetch currently in flight (dedup concurrent prefetches).
const fetching = new Set();

// ─── boot probe ──────────────────────────────────────────────────────────

export async function initWordgen() {
  await runHealthProbe();
}

async function runHealthProbe() {
  lastHealthCheck = Date.now();
  let resp;
  try {
    resp = await fetchWithTimeout(HEALTH_URL, HEALTH_PROBE_TIMEOUT_MS);
  } catch (_) {
    // Network error → no server at all. Permanent structural absence.
    status = 'disabled';
    announceStaticFallback('no server reachable');
    return;
  }
  if (resp.status === 404) {
    // API route absent → not our Go server (static host). Permanent.
    status = 'disabled';
    announceStaticFallback('no /api/wordgen backend on this host');
    return;
  }
  if (!resp.ok) {
    // Unexpected health status — treat as dormant, allow a later light recheck.
    status = 'dormant';
    return;
  }
  let body;
  try {
    body = await resp.json();
  } catch (_) {
    status = 'dormant';
    return;
  }
  if (body && body.available === true) {
    status = 'available';
    softFailCycles = 0;
  } else {
    // 200 {available:false, reason:...}: server up, Ollama absent. Light recheck OK.
    status = 'dormant';
  }
}

// Callers (e.g. act transitions) may nudge a light recheck when dormant. Cheap
// and rate-limited; never touches the generate endpoint.
export async function maybeRecheckHealth() {
  if (status === 'disabled' || status === 'available') return;
  if (Date.now() - lastHealthCheck < RECHECK_INTERVAL_MS) return;
  await runHealthProbe();
}

// ─── prefetch ──────────────────────────────────────────────────────────────
// Fire-and-forget: warm the NEXT level's batch while the current level plays.
// Never awaited by the engine; never throws to callers. `keys` is that level's
// unlocked key set (array of single-char strings) — the request must DECLARE
// its characters; without them there is nothing valid to ask for, so we no-op.

export function prefetch(level, keys) {
  void prefetchAsync(level, keys);
}

// buildQuery renders the declared-constraints request: act (derived 1-5),
// level, the characters allowlist, and the length window (min/max) resolved from
// the live difficulty setting. Returns null when keys are unusable — callers skip
// the request entirely rather than send a malformed one. `bounds` ({min,max},
// each already within the play-logic window) is DECLARED on the wire so the
// server generates and validates against the same window the client will filter.
function buildQuery(level, keys, bounds) {
  if (!Array.isArray(keys) || !keys.length) return null;
  const characters = keys
    .filter((k) => typeof k === 'string' && k.length === 1)
    .join('')
    .toLowerCase();
  if (!characters || characters.length > 40) return null;
  const act = Math.min(5, Math.max(1, Math.ceil(level / 5)));
  return (
    `act=${act}&level=${encodeURIComponent(level)}` +
    `&characters=${encodeURIComponent(characters)}` +
    `&minWordLength=${encodeURIComponent(bounds.min)}` +
    `&maxWordLength=${encodeURIComponent(bounds.max)}`
  );
}

async function prefetchAsync(level, keys) {
  if (status === 'disabled') return;
  if (status === 'dormant') {
    await maybeRecheckHealth();
    if (status !== 'available') return;
  }
  if (status !== 'available') return;

  const key = Number(level);
  if (!Number.isInteger(key)) return;
  // Resolve the length window ONCE per cycle from the live setting, so a
  // mid-session change takes effect on the next prefetch. The SAME bounds
  // declare the request AND filter the consumed batch — client/server agree.
  const bounds = resolveLengthBounds();
  const query = buildQuery(key, keys, bounds);
  if (!query) return;
  if (fetching.has(key) || ready.has(key)) return;
  fetching.add(key);
  try {
    const words = await fetchWordsWithBackoff(key, query, bounds);
    if (words && words.length) {
      ready.set(key, words);
      softFailCycles = 0;
    }
    // words===null means "hard failure after retries"; [] means "valid empty".
    else if (words === null) {
      registerSoftFail();
    }
  } finally {
    fetching.delete(key);
  }
}

function registerSoftFail() {
  softFailCycles += 1;
  if (softFailCycles >= SOFT_FAIL_LIMIT) {
    softFailCycles = 0;
    // The server may have lost Ollama — re-probe and follow its verdict.
    status = 'dormant';
    lastHealthCheck = 0; // force the next maybeRecheckHealth to actually run
    void runHealthProbe();
  }
}

// Returns string[] on success, [] on a valid-but-empty answer, or null on a hard
// (retry-exhausted) transient failure. `bounds` is threaded to consumeBatch so the
// client's structure filter enforces the same length window the request declared.
async function fetchWordsWithBackoff(level, query, bounds) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let resp;
    try {
      resp = await fetchWithTimeout(
        `${WORDGEN_URL}?${query}&prefetch=1`,
        FETCH_TIMEOUT_MS
      );
    } catch (_) {
      // timeout / network — transient, retry with backoff
      await backoff(attempt);
      continue;
    }
    if (resp.status >= 500) {
      await backoff(attempt);
      continue;
    }
    if (resp.status >= 400) {
      // structural (bug / wrong shape) — do NOT retry
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('[wordgen] unexpected', resp.status);
      }
      return [];
    }
    // 2xx — the prefetch call returns {words:[]} by design (it kicks the server's
    // background fill). Consume the actual batch with a follow-up plain GET.
    return await consumeBatch(query, bounds);
  }
  return null; // all attempts exhausted
}

// After a prefetch warms the server cache, a plain GET consumes whatever batch is
// ready (possibly still empty if the model hasn't finished — that's fine, the
// batch joins on the next cycle). Never retried: an empty answer is valid.
// STRUCTURE of the reply is validated before use (failure class B): body must
// be an object whose `words` is an array; only short plain strings survive.
async function consumeBatch(query, bounds) {
  let resp;
  try {
    resp = await fetchWithTimeout(`${WORDGEN_URL}?${query}`, FETCH_TIMEOUT_MS);
  } catch (_) {
    return [];
  }
  if (!resp.ok) return [];
  let body;
  try {
    body = await resp.json();
  } catch (_) {
    return [];
  }
  if (!body || typeof body !== 'object' || !Array.isArray(body.words)) return [];
  // Structure filter aligned with the DECLARED length window (the same {min,max}
  // that built the request): client and server enforce the same length contract.
  // A word outside the declared window is dropped per-item (class A), the rest
  // survive. Defensive fallback to the play-logic window if bounds are missing.
  const min = bounds && Number.isFinite(bounds.min) ? bounds.min : PLAY_MIN_WORD_LENGTH;
  const max = bounds && Number.isFinite(bounds.max) ? bounds.max : PLAY_MAX_WORD_LENGTH;
  return body.words.filter(
    (w) => typeof w === 'string' && w.length >= min && w.length <= max
  );
}

// ─── takeWords ───────────────────────────────────────────────────────────
// Hand the engine the ready batch (or []) and clear it. The engine re-validates
// the charset against the level's own key set and applies the level's
// presentation wrapper — see main.js buildPatterns integration.

// takeWords(level, opts) hands the engine the ready batch as TOKEN ARRAYS ready to
// splice into the pattern list, then clears the batch. Always safe to call; returns
// [] when nothing is ready or wordgen is inactive.
//
// opts (all optional, defense-in-depth + presentation):
//   keys        — the level's unlocked key set (array of single-char strings). Each
//                 generated word is RE-VALIDATED against it here; we never trust even
//                 our own server. Words with any out-of-charset char are dropped.
//   wrapSample  — a representative static-pool token array showing the level's
//                 presentation, e.g. ['[','o','k',']'] (L22) or ['z','i','g','-','z','a','g'].
//                 Leading/trailing wrapper tokens are detected and reapplied so
//                 generated words match the level's on-screen style. Bare words if omitted.
export function takeWords(level, opts = {}) {
  const key = Number(level);
  const words = ready.get(key) || [];
  ready.delete(key);
  if (!words.length) return [];

  const allowed = Array.isArray(opts.keys) ? new Set(opts.keys) : null;
  const [prefix, suffix] = detectWrapper(opts.wrapSample);

  const out = [];
  for (const word of words) {
    const chars = String(word).split('');
    // Defense-in-depth charset re-check against the level's own keys. Case is NOT
    // normalized here: the engine's token contract makes case meaningful (an
    // uppercase token means Shift), so a word that isn't already lowercase must
    // fail this check exactly as it always has, not be quietly folded.
    if (allowed && !chars.every((c) => allowed.has(c))) continue;
    // Defense-in-depth KID-SAFETY re-check (security.md rule 7: "we never trust
    // even our own server"). The server's isBlocked is the primary gate; this is
    // the same floor enforced a second time at the last moment before the word
    // enters the pattern stream, so a server bug or a drifted gate can never put
    // an unsafe word in front of a child. It reads the SINGLE source of truth
    // (js/word-blocklist.json via js/word-blocklist.js BASE_WORDS) plus any
    // additive parent words — never a second hand-rolled list, which is the very
    // class of bug this check exists to backstop. Same idiom the L25 coda uses
    // (js/keyboard-story.js). hasBlockedWord tokenizes on non-letters and then
    // exact-word matches, so a compound like "zig-vodka" can't smuggle a blocked
    // word through as one wordgen "word".
    if (hasBlockedWord(String(word))) continue;
    out.push([...prefix, ...chars, ...suffix]);
  }
  return out;
}

// From a sample static-pool token array, split off symbol tokens that bracket the
// word. Only the OUTERMOST leading/trailing symbol tokens are treated as wrapper
// (e.g. '[' … ']'); interior symbols like the '-' in a compound aren't reapplied.
function detectWrapper(sample) {
  if (!Array.isArray(sample) || !sample.length) return [[], []];
  const isSymbol = (t) => typeof t === 'string' && t.length === 1 && !/[a-z0-9]/i.test(t);
  let i = 0;
  let j = sample.length - 1;
  const prefix = [];
  const suffix = [];
  while (i <= j && isSymbol(sample[i])) prefix.push(sample[i++]);
  while (j >= i && isSymbol(sample[j])) suffix.unshift(sample[j--]);
  // Guard against a wrapper that would swallow the whole entry (all-symbol sample).
  if (i > j) return [[], []];
  return [prefix, suffix];
}

// Convenience: is generation active this session? (for callers who want to skip
// work entirely when disabled). Never required.
export function isActive() {
  return status === 'available' || status === 'dormant';
}

// ─── helpers ───────────────────────────────────────────────────────────────

function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal, cache: 'no-store' }).finally(() =>
    clearTimeout(t)
  );
}

function backoff(attempt) {
  const base = BASE_BACKOFF_MS * Math.pow(2, attempt); // 500, 1000, 2000
  const jitter = base * 0.2 * (Math.random() * 2 - 1); // ±20%
  const delay = Math.max(0, Math.round(base + jitter));
  return new Promise((r) => setTimeout(r, delay));
}
