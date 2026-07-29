// ─── Level 25 "MY STORY" coda — validated-generation quality cache (kk-stories) ──
//
// A localStorage QUALITY-CACHE that lets fresh, model-generated walk-the-keyboard
// stories ACCUMULATE across sessions so the coda's rotation pool keeps growing — while
// never touching the static-bank floor or any safety check.
//
// What it stores: ONLY stories that already cleared the full validation chain on BOTH
// the server (main.go parseAndValidateStories) and the client (validateGeneratedStory).
// That is already-validated GAME CONTENT (pangram sentences + kid-safe continuations) —
// NOT personal data. No age, name, surname, or location is ever stored here (security.md
// rule 8 PII floor is preserved; the display name lives only in kk-slots). The anti-dup
// context this module feeds back to the generator is likewise story TEXT only — never a
// player name or anything user-identifying (rule 6).
//
// How it reads (security.md rule 4 — localStorage is untrusted input): every read is in
// a try/catch, shape-validated field-by-field, and re-run through validateGeneratedStory
// so a tampered/garbage entry is treated as EMPTY, never crashes the coda. Writes never
// throw — a private-mode / unavailable localStorage degrades to in-session only (mirrors
// kk-slots). The store is capped to the last CACHE_CAP stories.
//
// Winnability NEVER depends on this cache: buildStoryPool always appends the static bank,
// so if the cache is empty, corrupt, or every entry deduped away, the coda still assembles
// from the 6 static all-26-letter stories at every tier. This module only ADDS variety.

import {
  validateGeneratedStory, normalizeStoryBase, isStaticStoryBase,
} from './keyboard-story.js';

const STORY_CACHE_KEY = 'kk-stories';
const CACHE_CAP = 20;      // keep the most recent N validated generations
const AVOID_CONTEXT = 4;   // how many recent bases to feed back as an anti-dup hint

// ── Defensive read (rule 4) ──────────────────────────────────────────────────
// Returns an array of clean { id, base, extra } stories (possibly empty). ANY problem
// — unreadable storage, non-JSON, wrong shape, a story that fails re-validation — is
// swallowed and yields fewer/zero stories, never an exception.
export function readCachedStories() {
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(STORY_CACHE_KEY));
  } catch (e) {
    return [];
  }
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.stories)) return [];
  const out = [];
  const seen = new Set();
  for (const entry of raw.stories) {
    // Re-validate every stored entry — a persisted value is as untrusted as a model
    // response (defense in depth; a hand-edited kk-stories can't inject unsafe text).
    const v = validateGeneratedStory(entry, `cache-${out.length}`);
    if (!v) continue;
    if (isStaticStoryBase(v.base)) continue;      // never shadow a static story
    const key = normalizeStoryBase(v.base);
    if (seen.has(key)) continue;                  // drop any accumulated near-dup
    seen.add(key);
    out.push(v);
    if (out.length >= CACHE_CAP) break;
  }
  return out;
}

// ── Fold in newly-generated stories (write; never throws) ─────────────────────
// Takes the raw validated-shape batch the server returned this session, validates +
// dedups each against the STATIC bank AND the existing cache, appends the survivors,
// caps to the most recent CACHE_CAP, and persists. Returns the merged clean list (so
// the caller can build the pool without a second read). A write failure (private mode)
// is silent — the merged list is still returned for in-session use.
export function addGeneratedStories(rawBatch) {
  const existing = readCachedStories();
  const seen = new Set(existing.map((s) => normalizeStoryBase(s.base)));
  const merged = existing.slice();
  if (Array.isArray(rawBatch)) {
    rawBatch.forEach((g, i) => {
      const v = validateGeneratedStory(g, `gen-${i}`);
      if (!v) return;
      if (isStaticStoryBase(v.base)) return;      // dedup against the static floor
      const key = normalizeStoryBase(v.base);
      if (seen.has(key)) return;                  // dedup against the existing cache
      seen.add(key);
      merged.push(v);
    });
  }
  // Keep only the most recent CACHE_CAP (drop oldest first).
  const capped = merged.slice(Math.max(0, merged.length - CACHE_CAP));
  try {
    localStorage.setItem(STORY_CACHE_KEY, JSON.stringify({ v: 1, stories: capped }));
  } catch (e) {
    // localStorage unavailable — variety just won't persist past this session.
  }
  return capped;
}

// ── Anti-dup context for the generator (game content only — no PII, rule 6) ───
// The normalized-original bases of the most recent cached stories, for the "avoid
// repeating these" generation hint. Returns story TEXT only; never a player name.
export function recentStoryBases(n = AVOID_CONTEXT) {
  const stories = readCachedStories();
  const count = Math.max(0, Math.min(n, stories.length));
  return stories.slice(stories.length - count).map((s) => s.base);
}

// Erase the cache (kept for symmetry with the game's other erase valves; not wired to
// UI — the cache holds no PII, so there's nothing to "forget"). Never throws.
export function clearStoryCache() {
  try { localStorage.removeItem(STORY_CACHE_KEY); } catch (e) { /* never throw */ }
}
