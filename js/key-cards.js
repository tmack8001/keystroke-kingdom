// Keyboard Cards — "the key has a name."
//
// The FOURTH card bank (docs/specs/semicolon-teaching-beat.md §5.1). A keyboard
// card teaches what a symbol key is CALLED and what it does in writing; its code
// meaning is held back until the Level 20 terminal (Trevor, 2026-10-31: "the name
// is taught at Level 13, and the programming meaning waits for the Level 20
// terminal").
//
// ⚠️ THIS IS THE ONLY MODULE ALLOWED TO HOLD THE KEY'S NAME AS A STRING (INV-29,
// amended). Everywhere else in js/** and in index.html the eighth key stays "the
// eighth key"; the `;` GLYPH is never restricted (INV-140). Do not copy any string
// below into another module — import the record instead (js/main.js reads `code`
// from here for the L20 couplet, so the code sentence has exactly one source).
//
// ⚠️ ITS OWN ARRAY, NOT HISTORY_CARDS — the same reason WING_CARDS and ACT_CARDS
// are separate (js/history-cards.js, INV-96/100/104/154). `TOTAL_CARDS` is the
// arcade denominator a child reads on the slot picker; adding a bank to it would
// make every existing save read LESS complete. `bankOf()` scopes the count line to
// this bank instead ("KEYBOARD CARD n OF m").
//
// EVERY SENTENCE IS FROM research/wiki/tech/semicolon.md and nowhere else. The
// three rules that page imposes, and INV-163 greps for:
//   • "first printed", never "invented" — invention is not established (§2);
//   • the print date is February 1496 — never the unattested 1494 (§2);
//   • for code: "many", not "every"/"all", and "instruction", not "line" (§4).
// Also from the page (§5): writing says JOIN, code says END. Never describe this
// mark as ending a sentence — a period does that.
//
// Pure data + pure helpers: no DOM, no state, no storage. Every string is a fixed
// literal, safe for textContent / fillText (security.md rules 1–2).

import { LEVELS } from './levels.js';

// Shared, so the overlay's `fact` can never drift from `literacyFact`.
const SEMICOLON_LITERACY_FACT =
  'Its name is semicolon. Semi means half. A semicolon can join two sentences that belong together. It was first printed in 1496, in Venice.';

export const KEY_CARDS = [
  {
    id: 'key-semicolon',
    // RESERVED — nothing reads it in Phase 1. The topics follow-on spec groups the
    // gallery by topic across every bank (spec §5.1 note).
    topic: 'keyboard',
    glyph: ';',                 // what the guide glows; what a LOCKED gallery tile shows
    keys: [';'],                // engine tokens that produce the glyph
    word: 'semicolon',          // the beat word = the card's moment word
    // = max(L_key, L_name). `;` arrives at L4; the name's last letter, c, at L13.
    // Literal on purpose: `deriveCardLevel()` below recomputes it from js/levels.js
    // and INV-153 pins the two equal, so a curriculum move fails a test loudly
    // instead of silently moving the lesson.
    level: 13,
    title: 'THE SEMICOLON',
    // First PRINTED: Bembo's De Aetna, Aldus's press, Venice, February 1496 (§2).
    year: '1496',
    // The Level 13 caption — EXACTLY two lines, each <= 34 chars, uppercase,
    // Press Start 2P-safe. Line 2 drops "that belong together" for width; the card
    // fact restores it, and "can" keeps the short form true (spec §5.1 table).
    literacy: ['ITS NAME IS SEMICOLON.', 'IT CAN JOIN TWO SENTENCES.'],
    // The card body at LEVEL COMPLETE. Literacy only — NO code meaning (INV-161).
    literacyFact: SEMICOLON_LITERACY_FACT,
    // Alias so any existing card renderer that reads `.fact` shows the literacy
    // lesson, never the code one.
    fact: SEMICOLON_LITERACY_FACT,
    // Where the CODE lesson lands: the terminal (`deriveCodeLevel`).
    codeLevel: 20,
    // Line 2 of the L20 eighth-key couplet (spec §5.8), Trevor's wording from §4's
    // "What this licenses". 39 chars — the confession element must not wrap it;
    // if it does, the fix is letter-spacing, never a rewrite of the sentence.
    code: 'MANY CODERS END AN INSTRUCTION WITH IT;',
    // RESERVED for the future gallery card-detail view — §4's "Safe:" sentence,
    // verbatim. Never shown at Level 13.
    codeFact: 'In many programming languages, a semicolon marks the end of an instruction.',
    source: 'research/wiki/tech/semicolon.md',
  },
];

// ─── Attachment (spec §5.1, generalising INV-56) ─────────────────────────────
//
// All derived from `newKeys` in js/levels.js, never from a copied table. Each
// helper takes the curriculum as a parameter (default: the real one) so a test
// can feed it a synthetic curriculum.

function levelNumbers(levels) {
  return Object.keys(levels || {})
    .map(Number)
    .filter(n => Number.isFinite(n))
    .sort((a, b) => a - b);
}

// The first level whose cumulative unlocked keys satisfy `has(set)`, else null.
function firstLevelWhere(levels, has) {
  const unlocked = new Set();
  for (const n of levelNumbers(levels)) {
    const nk = levels[n] && Array.isArray(levels[n].newKeys) ? levels[n].newKeys : [];
    for (const k of nk) unlocked.add(k);
    if (has(unlocked)) return n;
  }
  return null;
}

// L_key: the first level whose unlocked keys include every engine token in
// `keys`. Shift is simply the level whose newKeys contain 'Shift' (L24).
export function keyLevelOf(keys, levels = LEVELS) {
  if (!Array.isArray(keys) || !keys.length) return null;
  return firstLevelWhere(levels, set => keys.every(k => set.has(k)));
}

// L_name: the first level at which `word` is spellable. An uppercase letter
// needs its lowercase key AND Shift (the engine's exact-case token rule).
export function nameLevelOf(word, levels = LEVELS) {
  if (typeof word !== 'string' || !word.length) return null;
  const needs = new Set();
  for (const ch of word) {
    if (ch >= 'A' && ch <= 'Z') { needs.add(ch.toLowerCase()); needs.add('Shift'); }
    else needs.add(ch);
  }
  return firstLevelWhere(levels, set => [...needs].every(k => set.has(k)));
}

// The terminal: the level whose newKeys are exactly 1 and 0 (act4.md, L20).
export function terminalLevel(levels = LEVELS) {
  for (const n of levelNumbers(levels)) {
    const nk = levels[n] && Array.isArray(levels[n].newKeys) ? levels[n].newKeys : [];
    if (nk.length === 2 && nk.includes('1') && nk.includes('0')) return n;
  }
  return null;
}

// Card level = max(L_key, L_name); null if either is unreachable.
export function deriveCardLevel(record, levels = LEVELS) {
  if (!record) return null;
  const lk = keyLevelOf(record.keys, levels);
  const ln = nameLevelOf(record.word, levels);
  if (lk == null || ln == null) return null;
  return Math.max(lk, ln);
}

// Code level = the card level if it is at or past the terminal, else the
// terminal. Before the terminal: literacy now, code at L20. At/after: together.
export function deriveCodeLevel(record, levels = LEVELS) {
  const lvl = deriveCardLevel(record, levels);
  const term = terminalLevel(levels);
  if (lvl == null || term == null) return null;
  return Math.max(lvl, term);
}

// ─── Lookup ──────────────────────────────────────────────────────────────────

// The keyboard card to teach on this play of `level`: the FIRST record, in array
// order, whose level matches and whose id is not yet collected — else null. The
// collected id IS the latch (spec §3.3), so no storage field exists for it.
// `collectedIds` comes from localStorage and is untrusted (security.md rule 4):
// anything that is not an array reads as "nothing collected".
export function keyCardForLevel(level, collectedIds) {
  const n = Number(level);
  if (!Number.isFinite(n)) return null;
  const collected = new Set(
    Array.isArray(collectedIds) ? collectedIds.filter(id => typeof id === 'string') : [],
  );
  return KEY_CARDS.find(c => c.level === n && !collected.has(c.id)) || null;
}

export function keyCardById(id) {
  return KEY_CARDS.find(c => c.id === id) || null;
}

export function isKeyCardId(id) {
  return KEY_CARDS.some(c => c.id === id);
}

// The lowest level any keyboard card lives at (the gallery shelf's visibility
// gate, spec §5.4), or null when the bank is empty — which makes every path inert.
export function firstKeyCardLevel() {
  return KEY_CARDS.length ? Math.min(...KEY_CARDS.map(c => c.level)) : null;
}
