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

// The riddle answer box's own footer cue, shared by both engines so the prose and
// tile worlds teach the same thing in the same words. Backspace is named because
// the 2026-10-30 playtest found children did not know it worked here.
export const ANSWER_KEYS_CUE = 'BACKSPACE fixes a letter';

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

// A TYPO, not a wrong idea: the typed word is exactly ONE letter-edit away from an
// accepted answer (one letter added, dropped, or swapped for another). This is
// NEVER accepted as right — `answerMatches` stays exact, so no wrong word can
// ever solve a riddle. It only changes what the game SAYS: "so close — one letter
// is off, Backspace can fix it", with the typed word left in place to be fixed.
//
// Why it exists (2026-10-30 explorer playtest): the answer box takes any letter,
// so a 15%-error child who KNEW the answer typed `oxne` for `one`, was told "Not
// quite", and had her answer wiped. Being told she was wrong when she was right
// is the exact flow-stopping punishment the One Rule forbids. Fixing a letter is
// the lesson (Backspace "is not going back — it's making it right", act5.md).
//
// Guarded so it cannot leak an answer: answers shorter than 3 letters never
// report a near miss (any single letter is "one edit" from a one-letter answer,
// so the cue would quietly say "the answer is one letter"), and neither does an
// empty or one-letter guess.
export function isNearMiss(riddle, typed) {
  const norm = String(typed || '').trim().toLowerCase();
  if (norm.length < 2) return false;
  if (answerMatches(riddle, norm)) return false;
  const answers = riddle && Array.isArray(riddle.answers) ? riddle.answers : [];
  return answers.some((a) => {
    const ans = String(a).trim().toLowerCase();
    return ans.length >= 3 && oneEditApart(norm, ans);
  });
}

// True when a and b differ by exactly one insertion, deletion or substitution.
function oneEditApart(a, b) {
  if (a === b) return false;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else { i++; j++; }
  }
  edits += (a.length - i) + (b.length - j);
  return edits === 1;
}
