// ─── Shared riddle model — Act 6 Text Worlds (prose + tile engines) ──────────
//
// One small module both js/textworld/engine.js (prose) and js/textworld/
// tileworld.js (ASCII tile) consume, so all three worlds pose riddles the SAME
// way — the pattern Trevor asked for (2026-07-18): a rich cast of named
// creatures, each with a POOL of logic / word-play puzzles that ROTATES on each
// engagement, so coming back to the same character gives a different riddle
// ("different each time"). Riddles are always OPTIONAL/BONUS (the One Rule —
// they can never gate the goal), with a gentle hint after a couple tries and
// the answer itself after a few (no child is ever stuck).
//
// A riddle is authored DATA: { riddle, answers:[…], hint, reward }. A creature/
// command may carry ONE flat riddle plus optional `more:[…]` extra riddles, OR a
// `riddles:[…]` pool. buildPool() normalizes either shape into an array with the
// FLAT riddle ALWAYS first (index 0) — so existing single-riddle data (and the
// tests that read a creature's `.answers[0]`) are unchanged, and adding `more`
// is purely additive.
//
// SECURITY (.claude/rules/security.md 1-3,6-8): the typed answer is the one
// free-text surface. Both engines allowlist it to letters at the boundary; it is
// length-capped here, compared LOCALLY, never stored, never a DOM sink (drawn
// only with canvas fillText). Answers are authored as single letter-only words
// precisely so this bounded, allowlisted surface is all that is ever needed —
// no spaces, digits, or punctuation can reach the matcher.

export const ANSWER_CAP = 20;    // riddle answer length cap (bounded free text)
export const HINT_AT_TRY = 2;    // show the authored hint after this many wrong answers
export const REVEAL_AT_TRY = 3;  // reveal the answer itself after this many (never stuck)

function oneRiddle(r) {
  return {
    riddle: r && r.riddle ? String(r.riddle) : '',
    answers: Array.isArray(r && r.answers) ? r.answers.slice() : [],
    hint: r && r.hint ? String(r.hint) : '',
    reward: r && r.reward ? String(r.reward) : '',
  };
}

// Normalize a creature/command definition into a non-empty pool of riddle
// objects. Flat riddle first (index 0), then `riddles:[…]`, then `more:[…]`.
export function buildPool(def) {
  const pool = [];
  if (def && (def.riddle || def.answers)) pool.push(oneRiddle(def));
  if (def && Array.isArray(def.riddles)) for (const r of def.riddles) pool.push(oneRiddle(r));
  if (def && Array.isArray(def.more)) for (const r of def.more) pool.push(oneRiddle(r));
  return pool.length ? pool : [oneRiddle(def || {})];
}

// Forgiving, local, letters-only comparison. The caller has already allowlisted
// the typed text to a-z; we still trim/lowercase both sides defensively.
export function answerMatches(riddle, typed) {
  const norm = String(typed || '').trim().toLowerCase();
  if (!norm) return false;
  const answers = riddle && Array.isArray(riddle.answers) ? riddle.answers : [];
  return answers.some((a) => String(a).trim().toLowerCase() === norm);
}
