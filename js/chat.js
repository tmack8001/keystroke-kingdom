// ─── Local-LLM chat client (Act 6 IM-friend) ──────────────────────────────
//
// The browser side of the IM-friend's conversation with the local model. It
// MIRRORS js/wordgen.js's posture exactly: talk only to the game's OWN Go server
// (`/api/*`), never an external host; feature-detect availability; and on ANY
// failure become a graceful no-op so the caller falls back to scripted warmth —
// the friend "naps", never breaks (handoff §3/§7; security.md rules 6-7).
//
// Availability reuses wordgen's health endpoint (`/api/wordgen/health`) — chat and
// wordgen depend on the SAME Ollama, so there is one source of truth for "is the
// model up", and no second endpoint to keep in sync.
//
// The system prompt is composed SERVER-SIDE (main.go). This client sends only a
// validated persona SPEC + the recent transcript window; it can never supply or
// strip the safety rules. Messages are rendered as data (canvas text in
// imfriend.js), never markup — no DOM sink here or downstream.

// Endpoint paths are RELATIVE, not root-absolute. A root-absolute '/api/...' leaves a
// GitHub Pages project-page prefix entirely and hits the DOMAIN root — on a shared
// user.github.io that is a path this game does not own, so a sibling project serving
// /api/* would be talked to by mistake. Relative keeps the request inside our own
// prefix, where it 404s and the static-pool fallback engages exactly as designed.
// Resolves identically on the Go server and in Docker, which serve from '/'.
const HEALTH_URL = 'api/wordgen/health';
const CHAT_URL = 'api/chat';

const HEALTH_TIMEOUT_MS = 800;
import { hasBlockedWord } from './word-blocklist.js';

const CHAT_TIMEOUT_MS = 25000; // a friend's reply is worth a short wait; still bounded

// chatHealthy resolves true only when the server reports Ollama reachable AND the
// model present (body.available === true). Any error, non-200, or bad shape → false
// (offline path). Cheap; safe to call on entering a chat and to re-probe on demand.
export async function chatHealthy() {
  let resp;
  try {
    resp = await fetchWithTimeout(HEALTH_URL, HEALTH_TIMEOUT_MS, { method: 'GET' });
  } catch (_) {
    return false;
  }
  if (!resp.ok) return false;
  let body;
  try {
    body = await resp.json();
  } catch (_) {
    return false;
  }
  return !!(body && body.available === true);
}

// sendChat posts { persona, messages } to /api/chat and returns the friend's
// reply. `persona` is the spec (a curated key OR validated free-text fields);
// `messages` is the rolling-window transcript as [{ role:'you'|'friend', text }].
//
// Returns { ok: true, reply } on a real reply, or { ok: false } on ANY failure —
// transport error, timeout, non-2xx, malformed body, or an empty/"model-
// unavailable" reply (the server answers model failure with 200 {reply:""}, never
// a 500). The caller treats { ok:false } as "nap" and shows scripted warmth.
export async function sendChat(persona, messages) {
  let resp;
  try {
    resp = await fetchWithTimeout(CHAT_URL, CHAT_TIMEOUT_MS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona, messages }),
    });
  } catch (_) {
    return { ok: false };
  }
  if (!resp.ok) return { ok: false };
  let body;
  try {
    body = await resp.json();
  } catch (_) {
    return { ok: false };
  }
  // Validate STRUCTURE before trusting it (security.md rule 7): body must be an
  // object whose `reply` is a string. An empty reply is the documented
  // "model-unavailable" signal → treat as offline.
  if (!body || typeof body !== 'object' || typeof body.reply !== 'string') {
    return { ok: false };
  }
  const reply = body.reply.trim();
  if (!reply) return { ok: false };

  // ⚠️ THE PARENT'S OWN BLOCKED WORDS, ENFORCED HERE AND ONLY HERE.
  //
  // The server already word-checks its reply against the shared FLOOR
  // (`chatOutputOK`, main.go). It cannot check the parent's custom list, and that is
  // deliberate rather than an oversight: those words are `settings.blockedWords` and
  // security.md rule 6 keeps them **100% local — never sent to any endpoint**. A
  // parent's filter words are their business, not the model's.
  //
  // So the client is the only place this check can happen, and before 2026-09-16 it
  // did not happen at all — which made the settings screen's promise ("WORDS YOU ADD
  // HERE NEVER APPEAR IN THE GAME") false for the one surface most able to say
  // something unexpected: an LLM writing free text to a child.
  //
  // A hit is treated as the documented model-unavailable signal rather than an error,
  // so the friend simply takes a nap — the same graceful path an offline box already
  // gets. Never a scary message, never a stall (the One Rule).
  if (hasBlockedWord(reply)) return { ok: false };

  return { ok: true, reply };
}

// ─── helpers ───────────────────────────────────────────────────────────────

function fetchWithTimeout(url, ms, opts) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal, cache: 'no-store' }).finally(() =>
    clearTimeout(t)
  );
}
