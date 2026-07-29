// Finale Quote — the Level 25 capstone, "the game's last typed moment."
//
// Once the player owns the full keyboard + Shift (Level 25, the Word Processor
// finale), they type a short, curiosity-affirming excerpt of the real 1986
// Hacker Manifesto — the lines made famous by the 1995 film "Hackers" — as a
// GUARANTEED, never-missable capstone. The excerpt ESCALATES by the EXPERIENCE
// difficulty tier (getWinRatio() in js/settings.js), the game's "ages with the
// player" lever: FOUR DISTINCT cumulative lengths, one per EXPERIENCE tier — a
// new hand types only the opening, a WIZARD earns the whole passage. Higher
// tiers are always CUMULATIVE (previous lines + one more manifesto sentence, in
// the manifesto's own text order) — more of the same warm text, never a penalty
// (product.md §Word Length, One Rule).
//
// THE VERIFIED TEXT (do NOT alter wording or add lines): reproduced from
// research/wiki/culture/hacker-manifesto.md "Verbatim excerpts". The heavier
// "atomic bombs / murder / stop us all" sentences are INTENTIONALLY OMITTED at
// every tier — including at WIZARD, which types the manifesto's near-ENTIRE
// closing passage verbatim MINUS that one sentence. The delicate "Yes, I am a
// criminal... my crime is that of curiosity." content is gated to HOTSHOT (2.25x)
// and above — a strong opt-in tier, never the default. WIZARD (3.5x) is its own
// ordered set: the full belonging line ("...religious bias... and you call us
// criminals."), the anti-prejudice line, "...outsmarting you...", "I am a hacker,
// and this is my manifesto.", and "You may stop this individual, but you can't
// stop us all... after all, we're all alike." — the last carrying STRAIGHT ASCII
// apostrophes (can't, we're), the Level-23 key, typeable at L25. Ellipses are
// THREE literal ASCII
// periods (never a Unicode "…"). Apostrophes appear ONLY in the WIZARD closing
// lines and are ALWAYS a straight ASCII "'" (0x27), never a curly "’" (avoids
// smart-quote pitfalls); tiers 1/1.5/2.25 have no apostrophes. Every character is
// typeable at Level 25.
//
// PROMPT-SIZE CONSTRAINT: the prompt panel renders one fixed-width box per
// character (50px + 12px gap), so a long line overflows the screen. Each line
// below is therefore a PROMPT-SIZED sub-line (widest is 17 chars → ~1138px
// panel, comfortably inside 1280). Breaking a clause across sub-lines never
// changes wording — joining a tier's lines with single spaces reproduces the
// canonical excerpt (guarded by a test).
//
// This file exports DATA + PURE HELPERS only — no DOM, no state, no storage
// (mirrors js/history-cards.js). All splicing/gating lives in js/main.js.

// ── The canonical excerpt strings, per tier (for provenance + tests). Joining
//    a tier's LINES with single spaces must reproduce the matching string. ──
export const FINALE_EXCERPT_1 =
  'This is our world now... the world of the electron and the switch, the beauty of the baud.';
export const FINALE_EXCERPT_2 =
  'We exist without skin color, without nationality, without religious bias...';
export const FINALE_EXCERPT_3 =
  'Yes, I am a criminal. My crime is that of curiosity.';
export const FINALE_EXCERPT_4 =
  'My crime is that of judging people by what they say and think, not what they look like.';
// ── WIZARD-only excerpts (winRatio 3.5). EXCERPT_2W is the FULL belonging line
//    (restores "and you call us criminals" — the lower tiers use the truncated
//    EXCERPT_2). 5/6/7 are the manifesto's closing passage; the "atomic bombs /
//    wage wars / murder" sentence that sits between 2W and 3 is INTENTIONALLY
//    OMITTED (Trevor 2026-07-27 — kept out of a kids' game even at the top tier).
//    Lines 7 (and 5's clause) carry STRAIGHT ASCII apostrophes (can't, we're) —
//    the Level-23 key, typeable at L25. ──
export const FINALE_EXCERPT_2W =
  'We exist without skin color, without nationality, without religious bias... and you call us criminals.';
export const FINALE_EXCERPT_5 =
  'My crime is that of outsmarting you, something that you will never forgive me for.';
export const FINALE_EXCERPT_6 =
  'I am a hacker, and this is my manifesto.';
export const FINALE_EXCERPT_7 =
  "You may stop this individual, but you can't stop us all... after all, we're all alike.";

// ── Prompt-sized sub-lines (each ≤ 17 chars). Kept as plain strings; the token
//    form every pattern in js/levels.js uses is just String#split('') — a space
//    becomes ' ', a capital stays uppercase (a Shift token, matched exact-case by
//    the engine), and a run of periods becomes that many '.' tokens. So an
//    ellipsis "..." naturally yields exactly three '.' tokens. ──
export const FINALE_LINES_1 = [
  'This is our',
  'world now...',
  'the world of',
  'the electron',
  'and the switch,',
  'the beauty of',
  'the baud.',
];

// Tier 2 ADDS these lines (cumulative on top of tier 1).
export const FINALE_LINES_2 = [
  'We exist without',
  'skin color,',
  'without',
  'nationality,',
  'without religious',
  'bias...',
];

// Tier 3 ADDS these lines (cumulative on top of tiers 1 + 2).
export const FINALE_LINES_3 = [
  'Yes, I am',
  'a criminal.',
  'My crime is that',
  'of curiosity.',
];

// Tier 4 (the manifesto's anti-prejudice sentence) — part of the WIZARD-only
// closing passage below. Widest sub-line "of judging people" is 17 chars.
export const FINALE_LINES_4 = [
  'My crime is that',
  'of judging people',
  'by what they say',
  'and think, not',
  'what they look',
  'like.',
];

// ── WIZARD-only line groups (winRatio 3.5). These compose the top tier's OWN
//    ordered set (see finaleLinesForRatio). All ≤17-char sub-lines; joining a
//    group with single spaces reproduces its EXCERPT (guarded by a test). ──

// The FULL belonging line — WIZARD swaps this in for the truncated FINALE_LINES_2.
export const FINALE_LINES_2W = [
  'We exist without',
  'skin color,',
  'without',
  'nationality,',
  'without religious',
  'bias... and you',
  'call us',
  'criminals.',
];

// "My crime is that of outsmarting you, something that you will never forgive me for."
export const FINALE_LINES_5 = [
  'My crime is that',
  'of outsmarting',
  'you, something',
  'that you will',
  'never forgive',
  'me for.',
];

// "I am a hacker, and this is my manifesto."
export const FINALE_LINES_6 = [
  'I am a hacker,',
  'and this is my',
  'manifesto.',
];

// "You may stop this individual, but you can't stop us all... after all, we're all alike."
// NOTE: straight ASCII apostrophes in "can't" and "we're" (the Level-23 key).
export const FINALE_LINES_7 = [
  'You may stop this',
  'individual,',
  "but you can't",
  'stop us all...',
  'after all,',
  "we're all alike.",
];

// Convert a finale line string into the engine's token-array shape (one token
// per character), identical to history-cards.js `wordToTokens`. Space → ' ',
// capital → uppercase letter (Shift token), "..." → three '.' tokens.
export function lineToTokens(line) {
  return line.split('');
}

// The cumulative set of finale lines to guarantee at a given EXPERIENCE tier,
// returned as fresh token arrays (defensive copies — the caller splices these
// into the mutable pattern list). Mapping (product.md §Word Length + this
// feature's spec — FOUR DISTINCT cumulative lengths, one per EXPERIENCE tier;
// strictly increasing 1 < 1.5 < 2.25 < 3.5):
//   • winRatio  1    (FIRST QUARTER, default) → sentence 1
//   • winRatio  1.5  (REGULAR)                → 1 + 2 (truncated belonging line)
//   • winRatio  2.25 (HOTSHOT)                → 1 + 2 + 3
//   • winRatio  3.5  (WIZARD)                 → its OWN ordered set: the manifesto's
//        near-entire closing passage, VERBATIM, with ONE sentence omitted (the
//        "atomic bombs / wage wars / murder" line — kept out of a kids' game). It
//        uses the FULL belonging line (2W with "and you call us criminals"), NOT
//        the truncated tier-2 version — so WIZARD is a superset in CONTENT but not
//        an exact array-prefix past sentence 1.
// Thresholds (not equality) so any valid tier — and any unexpected value that
// slipped past settings validation — degrades safely toward the default set.
export function finaleLinesForRatio(winRatio) {
  const r = Number.isFinite(winRatio) ? winRatio : 1;
  if (r >= 3.5) {
    // WIZARD composes its own ordered passage (full belonging line + closing),
    // one sentence omitted. Order matches the manifesto's own text order.
    return [
      ...FINALE_LINES_1,   // "This is our world now... the beauty of the baud."
      ...FINALE_LINES_2W,  // full: "...religious bias... and you call us criminals."
      ...FINALE_LINES_3,   // "Yes, I am a criminal. My crime is that of curiosity."
      ...FINALE_LINES_4,   // "...judging people by what they say and think..."
      ...FINALE_LINES_5,   // "...outsmarting you, something you will never forgive..."
      ...FINALE_LINES_6,   // "I am a hacker, and this is my manifesto."
      ...FINALE_LINES_7,   // "You may stop this individual, but you can't stop us all..."
    ].map(lineToTokens);
  }
  const lines = [...FINALE_LINES_1];
  if (r >= 1.5) lines.push(...FINALE_LINES_2);
  if (r >= 2.25) lines.push(...FINALE_LINES_3);
  return lines.map(lineToTokens);
}

// True when a just-completed pattern's tokens are identical to a finale line's
// tokens — used by the engine to detect (and gate on) each guaranteed line,
// exactly like history-cards.js `patternMatchesCard`. `lineTokens` may be a
// token array (from finaleLinesForRatio) or a raw string.
export function finaleLineMatches(pattern, lineTokens) {
  const tokens = Array.isArray(lineTokens) ? lineTokens : lineToTokens(lineTokens);
  if (!Array.isArray(pattern) || pattern.length !== tokens.length) return false;
  return pattern.every((t, i) => t === tokens[i]);
}
