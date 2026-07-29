// ─── Local-LLM keyboard-story generation (client) ────────────────────────────
//
// Optional variety layer for the Level 25 "MY STORY" coda. If the game's OWN Go
// server can reach a local Ollama, it will generate fresh all-26-letter "walk the
// keyboard" stories that ADD to the coda's rotation pool (js/keyboard-story.js
// buildStoryPool). If anything is missing or fails — the common case on a static
// host — this is a silent no-op and the coda plays entirely on the built-in STATIC
// bank (the floor that always works). Generation never gates play and never blocks.
//
// Security (see .claude/rules/security.md rules 6-7): same-origin only — this only
// ever talks to the game's own Go server (`/api/keyboard-story`), never an external
// host. The request carries NOTHING user-identifying (no player name) — only the
// EXPERIENCE tier (for length) and a story-count hint. Every returned sentence is
// re-validated client-side by js/keyboard-story.js validateGeneratedStory (charset
// allowlist, all-26 coverage on the base, length caps, safety blocklist, sub-line
// fit) — the model, and even our own server, are never trusted. Generated text is
// always rendered as DATA (canvas fillText via the pattern stream), never markup.
//
// Shape mirrors js/wordgen.js but far simpler: L25 is the LAST level, so there is
// no per-level prefetch pipeline — a single fire-and-forget fetch is kicked when
// L25 starts, and its validated result (or []) is read when the coda is assembled
// a few seconds later (after the player clears the normal win target). If the fetch
// hasn't landed by then, the static bank is used immediately — never a wait.

import { recentStoryBases } from './keyboard-story-cache.js';
import { STATIC_STORIES } from './keyboard-story.js';

const STORY_URL = '/api/keyboard-story';
const FETCH_TIMEOUT_MS = 8000; // a story is worth a short wait; bounded so nothing hangs

// Session status, mirroring wordgen's minimal state machine:
//   'unknown'  — not tried yet
//   'ready'    — a validated batch is waiting to be consumed
//   'empty'    — tried, nothing usable (server/Ollama down or generation rejected)
let ready = null;          // string-free: array of RAW story objects {base, extra[]}
let inflight = false;

// Kick a fire-and-forget generation for the L25 coda. `winRatio` (the EXPERIENCE
// tier) is sent so the server can size the story; `count` asks for a few options so
// the rotation has fresh variety. Never awaited, never throws to the caller.
export function prefetchKeyboardStories(winRatio, count = 3) {
  if (inflight || ready) return;
  inflight = true;
  void run(winRatio, count).finally(() => { inflight = false; });
}

async function run(winRatio, count) {
  const r = Number.isFinite(winRatio) ? winRatio : 1;
  const n = Math.max(1, Math.min(5, Math.floor(count) || 3));
  // Anti-dup hint: ask the server to avoid the pangrams the player has already seen, so
  // fresh generations accumulate genuine variety instead of repeating. The list is the
  // STATIC bank bases FIRST (crucial — llama3.2's reflex is to reproduce the memorized
  // "quick brown fox", which is a static story and would just be deduped; naming it here
  // steers the model onto a DIFFERENT classic) plus the most recent CACHED bases. Story
  // TEXT only — never a player name or anything user-identifying (security.md rule 6);
  // each base is re-validated server-side (sanitizeAvoidList) before it touches the prompt.
  let avoidParams = '';
  try {
    const avoid = [...STATIC_STORIES.map((s) => s.base), ...recentStoryBases()];
    for (const base of avoid) {
      avoidParams += `&avoid=${encodeURIComponent(base)}`;
    }
  } catch (_) { avoidParams = ''; } // cache read is best-effort; never blocks a fetch
  const url = `${STORY_URL}?tier=${encodeURIComponent(r)}&count=${encodeURIComponent(n)}${avoidParams}`;
  let resp;
  try {
    resp = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  } catch (_) {
    ready = [];              // network error / no server → static floor
    return;
  }
  if (!resp || !resp.ok) { ready = []; return; }
  let body;
  try {
    body = await resp.json();
  } catch (_) { ready = []; return; }
  // Validate the STRUCTURE of the response (security rule 7, class B) before use:
  // body must be an object whose `stories` is an array of plain objects. Anything
  // else is ignored whole. Per-story CONTENT validation happens in keyboard-story.js
  // buildStoryPool (class A — bad stories dropped individually there).
  if (!body || typeof body !== 'object' || !Array.isArray(body.stories)) { ready = []; return; }
  ready = body.stories.filter((s) => s && typeof s === 'object').slice(0, 8);
}

// Hand the caller whatever validated-shape batch is ready (or []) and clear it.
// Always safe to call synchronously; the coda assembler passes the result through
// buildStoryPool (content validation) and falls back to the static bank on [].
export function takeKeyboardStories() {
  const out = ready || [];
  ready = null;
  inflight = false;
  return out;
}

function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal, cache: 'no-store' }).finally(() =>
    clearTimeout(t)
  );
}
