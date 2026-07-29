// ─── Kid-safety word blocklist — the SINGLE client-side source of truth ──────
//
// One canonical list of words we never want a child to read in generated/LLM content
// (coda stories, IM-friend chat). It used to be copy-pasted in several places (a story
// list here, a chat list on the server) which drifted — this module is now the ONE
// client source, and the server's Go mirror (main.go `chatWordBlocklist`) is PINNED to
// `BASE_WORDS` by an agreement test (tests/unit/word-blocklist-sync.test.mjs; the L41
// two-language-contract rule: comment both sides + a test asserting identical sets).
//
// TWO layers, and the split is a safety invariant:
//   • BASE_WORDS  — the built-in FLOOR. Immovable. Every consumer always enforces it.
//   • user words  — an ADDITIVE parent/preferences layer (settings.js `blockedWords`).
//     A parent may ADD words; they can NEVER remove a BASE word. This mirrors every
//     other lever in the game (difficulty is additive, Survival is opt-in, the server
//     safety prompt is unremovable): a setting can make things safer, never less safe.
//
// User words are untrusted free text (security.md rule 7): `setUserBlockedWords`
// allowlists each to `[a-z]` only, length-bounds it, dedups, and caps the count, so a
// crafted preferences value can never do anything but add a few literal words to the
// filter. Nothing here is a DOM sink; this module only answers "is this word blocked?".

// The canonical floor is imported from js/word-blocklist.json — the SAME file the Go
// server embeds and unmarshals into `chatWordBlocklist` (main.go). ONE file, both
// languages: edit the list only in that JSON, never here. Exact-word matches only
// (callers tokenize prose on non-letters first) — a substring match would over-block
// innocent words. The import is defensive: a malformed/empty file degrades to an empty
// floor rather than throwing (a Go test + a JS test gate that the shipped file is good).
import blockData from './word-blocklist.json' with { type: 'json' };

export const BASE_WORDS = Object.freeze(
  (blockData && Array.isArray(blockData.words) ? blockData.words : [])
    .map((w) => String(w).toLowerCase().trim())
    .filter(Boolean)
);

const baseSet = new Set(BASE_WORDS);

// The additive parent layer — starts empty (default behavior = BASE_WORDS only, so an
// untouched preferences screen changes nothing). Never contains a BASE word redundantly.
let userSet = new Set();

// Bounds for a single user-added word — a real word, letters only.
const USER_WORD_MIN = 2;
const USER_WORD_MAX = 20;
const USER_WORDS_MAX = 40; // cap the whole list so a huge preferences value can't bloat

// Sanitize + install the parent-added words (untrusted free text → allowlist). Each
// entry is lowercased and stripped to `[a-z]` only (callers match per letter-token, so
// letters are the only meaningful content), length-bounded, deduped, and the list is
// capped. Anything malformed is dropped. Additive ONLY: BASE_WORDS is never affected.
// Idempotent; safe to call on boot and on every settings change.
export function setUserBlockedWords(words) {
  const next = new Set();
  for (const raw of Array.isArray(words) ? words : []) {
    const w = String(raw == null ? '' : raw).toLowerCase().replace(/[^a-z]/g, '');
    if (w.length < USER_WORD_MIN || w.length > USER_WORD_MAX) continue;
    if (baseSet.has(w)) continue;          // already in the floor — no need to store
    next.add(w);
    if (next.size >= USER_WORDS_MAX) break;
  }
  userSet = next;
}

// The one question every consumer asks. True when `word` (a single tokenized word) is
// blocked by the built-in floor OR the parent's additions. Pure given the installed
// user layer; with no user words set (the default) it depends on BASE_WORDS only, so
// unit tests stay deterministic.
export function isBlockedWord(word) {
  const w = String(word == null ? '' : word).toLowerCase();
  return baseSet.has(w) || userSet.has(w);
}

// True when any word in a run of prose is blocked (tokenizes on non-letters, then
// exact-word checks — the shared idiom for scanning a generated sentence).
export function hasBlockedWord(text) {
  for (const w of String(text == null ? '' : text).toLowerCase().split(/[^a-z]+/)) {
    if (w && isBlockedWord(w)) return true;
  }
  return false;
}

// Introspection for a future preferences UI / tests — the count of currently-active
// parent additions (never exposes or lets anything mutate the floor).
export function userBlockedWordCount() {
  return userSet.size;
}
