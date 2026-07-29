// Keyboard Story — the Level 25 "MY STORY" coda (the walk-the-keyboard finale).
//
// Level 25 is the "true entire keyboard unlocked" level. After a player clears
// L25's NORMAL win target, the level does NOT end — it rolls into an earned CODA
// (js/main.js §startCoda): a short, readable STORY the player types, whose FINAL
// line(s) are the EXPERIENCE-tier manifesto excerpt (js/finale-quote.js) as its
// capstone. The point of the coda is that the player types EVERY letter A–Z, so
// every story here is a PANGRAM story: its `base` sentence alone covers all 26
// letters, so coverage is guaranteed even at the shortest tier and even offline.
//
// FOUR things this module encodes (all as PURE DATA + PURE HELPERS — no DOM, no
// state, no storage, no fetch; mirrors js/finale-quote.js / js/history-cards.js):
//   1. A STATIC BANK of ≥5 all-26-letter stories (STATIC_STORIES) — the floor that
//      always works: the game plays the coda fully offline on this bank alone, with
//      real replay variety (rotation picks a different story each play, mirroring
//      the history-card rotation).
//   2. TIER-SCALED LENGTH — storyBodyForRatio(): higher EXPERIENCE tier = a LONGER
//      story (more readable sentences on top of the base pangram), so difficulty =
//      more typing, never a penalty (product.md §Word Length). Coverage holds at
//      EVERY tier because the base pangram alone covers A–Z.
//   3. A choreographed "oops!" BACKSPACE beat — TYPO_BEATS: a common word typed
//      WRONG, then Backspaced and corrected. This is SCRIPTED CONTENT (every key is
//      the expected token at its position — the sacred wrong-keypress behavior is
//      untouched, the player is never penalized), a playful wink that "trips up"
//      older players. L25 is where Backspace is introduced, so the coda exercises
//      it. Beat count scales with tier too.
//   4. VALIDATION of LLM-generated stories (validateGeneratedStory) — the untrusted
//      content axis (security.md rules 6–7): charset allowlist, all-26 coverage on
//      the base, length caps, a safety word blocklist, sub-line-fit. A generated
//      story that fails ANY check is dropped; the static bank is the fallback floor.
//
// assembleCoda() composes the final ordered list of ENGINE TOKEN LINES (each ≤17
// chars wide, the prompt-panel constraint) that js/main.js serves as the coda tail:
//   [ base sub-lines ] + [ typo beats ] + [ extra sub-lines ] + [ manifesto capstone ]
// The manifesto lines come from js/finale-quote.js (the capstone is its FINAL line).

import { finaleLinesForRatio, lineToTokens } from './finale-quote.js';
import { hasBlockedWord } from './word-blocklist.js';

// The prompt panel renders one fixed-width box per character, so a line wider than
// ~17 chars overflows the screen (same constraint finale-quote.js pre-breaks to).
export const MAX_SUBLINE = 17;

// ── The static story bank ────────────────────────────────────────────────────
// Each story: { id, base, extra:[…] }.
//   • `base`  — a readable PANGRAM sentence (covers every letter a–z). This alone
//               is the whole story body at the shortest EXPERIENCE tier (1×), so it
//               MUST cover all 26 letters (guarded by a unit test).
//   • `extra` — ≥3 short, warm, kid-readable sentences that continue the story;
//               tiers above 1× append these one at a time (storyBodyForRatio), so a
//               higher tier types a LONGER story. They need not be pangrams — the
//               base already guarantees coverage.
// Kid-safe and gentle throughout (One Rule). ≥5 stories so offline rotation has
// real replay variety. Every `base` was verified to contain all 26 letters.
export const STATIC_STORIES = [
  {
    id: 'fox',
    base: 'The quick brown fox jumps over the lazy dog.',
    extra: [
      'They play in the park all day.',
      'The sun is warm and the sky is blue.',
      'It is a happy day to run and jump.',
      'Now they rest under a big green tree.',
    ],
  },
  {
    id: 'animals',
    base: 'The jay, pig, fox, zebra and my wolves quack.',
    extra: [
      'They all meet by the little pond.',
      'The wolves are soft and kind today.',
      'Each friend brings a snack to share.',
      'What a merry band of animal pals.',
    ],
  },
  {
    id: 'wizards',
    base: 'The five boxing wizards jump quickly.',
    extra: [
      'They wave their little wands in the air.',
      'Stars and sparks light up the room.',
      'Everyone claps and cheers with joy.',
      'The magic show was the best of all.',
    ],
  },
  {
    id: 'jackdaws',
    base: 'Jackdaws love my big sphinx of quartz.',
    extra: [
      'The birds fly home when the sun sets.',
      'They sing a soft and happy tune.',
      'One by one the stars come out to play.',
      'Good night to all the world below.',
    ],
  },
  {
    id: 'zebras',
    base: 'Six quick zebras jump when my dog waves the flag.',
    extra: [
      'The race around the field begins.',
      'Their little hooves drum on the grass.',
      'The crowd cheers for every one of them.',
      'What a grand and sunny day to run.',
    ],
  },
  {
    id: 'dogs',
    base: 'My ox, quick zebra, and five jumping dogs wave to say hello.',
    extra: [
      'They line up at the old red barn.',
      'The morning sun is soft and gold.',
      'Everybody laughs and starts to sing.',
      'It is the best day they can recall.',
    ],
  },
];

// ── Choreographed "oops!" Backspace beats ────────────────────────────────────
// L25 introduces Backspace; the coda exercises it with a playful mistype-then-fix.
// Each beat is a TOKEN ARRAY (literal chars + `' '` + `'Backspace'`, EXACTLY the
// idiom L25's intro drills already use, e.g. ['j','o','k','Backspace','Backspace','b'])
// whose FINAL rendered text (after the backspaces erase the typo) is `text` — a
// natural, readable word/phrase. This is SCRIPTED content: every token is the
// expected key at its position, so the player is never flagged for a mistake and the
// sacred wrong-keypress contract is untouched. The gag is purely the fun of being
// asked to type a wrong-looking word on purpose, then backspace it — the word
// processor visibly shows the typo then the correction. Each beat is SELF-CONTAINED:
// its backspaces never exceed the chars it has typed so far (no underflow — guarded
// by a test), so a beat can never erase earlier text.
export const TYPO_BEATS = [
  { // "cna" → "can"
    text: 'we can do it',
    tokens: ['w','e',' ','c','n','a','Backspace','Backspace','Backspace','c','a','n',' ','d','o',' ','i','t'],
  },
  { // "yuo" → "you"
    text: 'you did it',
    tokens: ['y','u','o','Backspace','Backspace','Backspace','y','o','u',' ','d','i','d',' ','i','t'],
  },
  { // "adn" → "and"
    text: 'and we win',
    tokens: ['a','d','n','Backspace','Backspace','Backspace','a','n','d',' ','w','e',' ','w','i','n'],
  },
  { // "tpye" → "type"
    text: 'i can type',
    tokens: ['i',' ','c','a','n',' ','t','p','y','e','Backspace','Backspace','Backspace','Backspace','t','y','p','e'],
  },
  { // "freind" → "friend" (the classic i-before-e trip-up for older players)
    text: 'my friend',
    tokens: ['m','y',' ','f','r','e','i','n','d','Backspace','Backspace','Backspace','Backspace','i','e','n','d'],
  },
];

// ── Pure helpers ─────────────────────────────────────────────────────────────

// True when `text` contains every letter a–z at least once (case-insensitive).
// The all-26 coverage guarantee is on the FINAL corrected text of the coda; a
// typo beat's stray letters are a bonus, never part of the requirement.
export function coversAllLetters(text) {
  const seen = new Set();
  for (const ch of String(text).toLowerCase()) {
    if (ch >= 'a' && ch <= 'z') seen.add(ch);
  }
  return seen.size === 26;
}

// Break a readable sentence into ≤maxLen-char sub-lines at word boundaries (never
// splitting a word — except a defensive hard-split for a pathologically long word,
// which the static bank never contains). Returns an array of plain strings.
export function toSubLines(text, maxLen = MAX_SUBLINE) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const out = [];
  let cur = '';
  for (let w of words) {
    // Defensive: hard-split any word wider than a sub-line so nothing ever overflows.
    while (w.length > maxLen) {
      if (cur) { out.push(cur); cur = ''; }
      out.push(w.slice(0, maxLen));
      w = w.slice(maxLen);
    }
    const cand = cur ? cur + ' ' + w : w;
    if (cand.length > maxLen && cur) { out.push(cur); cur = w; }
    else cur = cand;
  }
  if (cur) out.push(cur);
  return out;
}

// How many story-body sentences to type at a given EXPERIENCE tier: the base
// pangram always, plus one extra sentence per tier step. Higher tier = a LONGER
// story (more typing, never a penalty — product.md §Word Length). Coverage always
// holds because the base alone is a pangram. Thresholds (not equality) so any valid
// tier — or an unexpected value past settings validation — degrades safely.
export function storyBodyForRatio(story, winRatio) {
  const r = Number.isFinite(winRatio) ? winRatio : 1;
  const base = story && typeof story.base === 'string' ? story.base : '';
  const extra = story && Array.isArray(story.extra) ? story.extra : [];
  let n = 0;
  if (r >= 1.5) n = 1;
  if (r >= 2.25) n = 2;
  if (r >= 3.5) n = 3;
  const out = [base];
  for (let i = 0; i < n && i < extra.length; i++) out.push(extra[i]);
  return out;
}

// How many choreographed typo→Backspace→correct beats a coda gets at a given tier.
// ≥1 always; more at higher tiers (Trevor: "trip up the older players"), and the
// higher tiers' longer stories have room for them.
export function beatCountForRatio(winRatio) {
  const r = Number.isFinite(winRatio) ? winRatio : 1;
  if (r >= 3.5) return 3;
  if (r >= 1.5) return 2;
  return 1;
}

// Deterministically pick ONE story from a pool by a per-slot rotation counter
// (mirrors js/history-cards.js pickGuaranteedCard — no Math.random, so a given
// rotation always yields the same story: testable, and "different each replay" as
// the counter advances). The pool is [validated-generated…, static…]; the static
// bank alone gives real variety when generation is unavailable.
export function pickKeyboardStory(pool, rotation) {
  const list = Array.isArray(pool) && pool.length ? pool : STATIC_STORIES;
  const rot = Number.isFinite(rotation) ? Math.max(0, Math.floor(rotation)) : 0;
  return list[rot % list.length];
}

// Deterministically pick `count` typo beats, offset by rotation for variety across
// replays (no Math.random). Returns fresh token-array copies (the caller splices
// them into the mutable coda line list).
export function pickTypoBeats(rotation, count) {
  const rot = Number.isFinite(rotation) ? Math.max(0, Math.floor(rotation)) : 0;
  const n = Math.max(1, Math.min(TYPO_BEATS.length, Math.floor(count) || 1));
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(TYPO_BEATS[(rot + i) % TYPO_BEATS.length].tokens.slice());
  }
  return out;
}

// Compose the full ordered coda as ENGINE TOKEN LINES (arrays of single-char tokens,
// with `'Backspace'` in the typo beats), ready for js/main.js to serve as the L25
// tail. Order: base pangram sub-lines, then the playful typo beats, then the extra
// story sub-lines, then the manifesto capstone (its FINAL line — js/finale-quote.js).
// The whole coda's final rendered text always covers all 26 letters (the base does).
export function assembleCoda(story, winRatio, rotation) {
  const s = story || STATIC_STORIES[0];
  const baseLines = toSubLines(s.base, MAX_SUBLINE).map(lineToTokens);
  const extras = storyBodyForRatio(s, winRatio).slice(1); // drop base (already lined)
  const extraLines = extras.flatMap((sent) => toSubLines(sent, MAX_SUBLINE)).map(lineToTokens);
  const beats = pickTypoBeats(rotation, beatCountForRatio(winRatio));
  const manifesto = finaleLinesForRatio(winRatio).map((l) => l.slice());
  return [...baseLines, ...beats, ...extraLines, ...manifesto];
}

// Simulate typing a list of token lines (applying Backspace) and return the final
// rendered document text — used for the all-26 coverage check and by tests to prove
// a typo beat resolves to its intended readable word. Sub-lines are joined with a
// space (the theme inserts the same display space at each sub-line boundary).
export function renderCodaText(lines) {
  const parts = [];
  for (const line of Array.isArray(lines) ? lines : []) {
    let out = '';
    for (const tok of Array.isArray(line) ? line : []) {
      if (tok === 'Backspace') out = out.slice(0, -1);
      else out += tok;
    }
    parts.push(out);
  }
  return parts.join(' ');
}

// ── LLM-generated-story validation (untrusted content — security.md rules 6–7) ──
// Generated stories only ever ADD variety; the static bank is the floor. Every
// generated sentence must pass this chain before it can enter the rotation pool;
// ANY failure drops the whole generated story (fall back to static).

// The ONLY characters a generated story sentence may contain — all typeable at
// Level 25: letters (Shift gives capitals), space, and the punctuation the game
// already teaches (period, comma, apostrophe, hyphen). No '!'/'?'/digits/anything
// else. Mirrors the server-side check in main.go storyCharsetOK (keep in sync).
const STORY_SENTENCE_RE = /^[A-Za-z .,'-]+$/;
const MAX_STORY_SENTENCE_LEN = 120; // a readable sentence, generously capped

// The exact-WORD safety blocklist now lives in ONE place — js/word-blocklist.js
// (`hasBlockedWord`, imported above). That module holds the canonical BASE_WORDS floor
// (mirrored by main.go `chatWordBlocklist`, pinned by an agreement test) plus the
// optional parent-added words layer. This keeps the story validator a thin consumer:
// its per-sentence check is still deterministic when no parent words are installed
// (the default), so the helpers below remain test-stable.

// Validate ONE generated sentence: string, non-empty, within the length cap, only
// the allowed charset, no blocked word, and no single word wider than a sub-line
// (so it always breaks cleanly). Returns the trimmed sentence, or null on any fail.
export function validateStorySentence(s) {
  if (typeof s !== 'string') return null;
  const t = s.trim();
  if (!t || t.length > MAX_STORY_SENTENCE_LEN) return null;
  if (!STORY_SENTENCE_RE.test(t)) return null;
  if (hasBlockedWord(t)) return null;
  for (const w of t.split(/\s+/)) {
    if (w.replace(/[^A-Za-z]/g, '').length > MAX_SUBLINE) return null;
  }
  return t;
}

// Validate a whole generated story ({ base, extra:[…] }): the base MUST validate AND
// cover all 26 letters (a pangram — the coverage floor), and at least 3 extras must
// validate (enough for the tier-scaled length). Returns a clean { id, base, extra }
// or null. Defense-in-depth over the server's own validation (the model, and even
// our own server, are never trusted — security.md rules 6–7).
export function validateGeneratedStory(raw, id = 'gen') {
  if (!raw || typeof raw !== 'object') return null;
  const base = validateStorySentence(raw.base);
  if (!base || !coversAllLetters(base)) return null;
  const extra = [];
  if (Array.isArray(raw.extra)) {
    for (const e of raw.extra) {
      const v = validateStorySentence(e);
      if (v) extra.push(v);
      if (extra.length >= 4) break;
    }
  }
  if (extra.length < 3) return null;
  return { id, base, extra };
}

// Normalize a story base for DEDUP comparison: lowercase, collapse whitespace, strip
// leading/trailing punctuation and spaces. Two bases that differ only in casing or a
// trailing period are treated as the SAME story (fixes the observed exact-static
// pangram repeat, and keeps the cache from accumulating near-duplicates). Pure helper;
// used by buildStoryPool and by js/keyboard-story-cache.js — keep them in agreement.
export function normalizeStoryBase(text) {
  return String(text == null ? '' : text)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^[ .,'-]+|[ .,'-]+$/g, '')
    .trim();
}

// The normalized bases of the static bank — a generated/cached story matching one of
// these is a duplicate of built-in content and is dropped from the pool.
const STATIC_BASE_KEYS = new Set(STATIC_STORIES.map((s) => normalizeStoryBase(s.base)));

// Build the rotation pool: validated generated stories FIRST (so fresh variety
// surfaces first when available), then the static bank (always present). Every
// generated story is (a) content-validated (validateGeneratedStory) and (b) DEDUPED —
// dropped if its normalized base matches a STATIC story or an already-accepted
// generated story. Bad or duplicate generated entries are dropped; a fully-empty /
// failed / all-duplicate generation just yields the static bank verbatim — the offline
// floor is never diluted and coverage always holds.
export function buildStoryPool(generated) {
  const gen = [];
  const seen = new Set(STATIC_BASE_KEYS);
  if (Array.isArray(generated)) {
    generated.forEach((g, i) => {
      const v = validateGeneratedStory(g, `gen-${i}`);
      if (!v) return;
      const key = normalizeStoryBase(v.base);
      if (seen.has(key)) return; // dup of a static or earlier generated story
      seen.add(key);
      gen.push(v);
    });
  }
  return [...gen, ...STATIC_STORIES];
}

// True when a story base duplicates a STATIC-bank story (normalized). Exposed so the
// cache layer can reject a generation that merely reproduces built-in content BEFORE
// persisting it. (Static bases are the immovable floor — never cache a copy of one.)
export function isStaticStoryBase(base) {
  return STATIC_BASE_KEYS.has(normalizeStoryBase(base));
}
