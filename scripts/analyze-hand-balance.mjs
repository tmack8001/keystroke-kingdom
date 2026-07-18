#!/usr/bin/env node
/*
 * =============================================================================
 * Keystroke Kingdom — Hand-Balance & Variability Analyzer
 * =============================================================================
 *
 * PURPOSE
 *   Two ways to answer the same question Trevor raised after playing Q*bert (L22)
 *   and finding his round very right-hand-heavy, with little left<->right
 *   alternation and repeated sequences ("[go]", "[play]"):
 *
 *   (A) STATIC pool analysis (default) — parse js/levels.js directly and, for
 *       EACH of the 25 levels, compute the POOL POTENTIAL: what balance /
 *       alternation / variety the level's word pool COULD deliver.
 *   (B) TRANSCRIPT analysis (--transcript <file.jsonl>) — post-process any
 *       recorder transcript (scripts/record-playthrough.js output) and compute
 *       the SAME metrics from PLAYED REALITY: what a real run actually served.
 *
 *   The comparison (pool potential vs what a run actually served) is exactly the
 *   evidence Trevor's Q*bert observation needs.
 *
 * HAND CLASSIFICATION — SOURCE OF TRUTH: FINGER_MAP in js/levels.js
 *   A key's hand is read from its FINGER_MAP label ("LEFT ..." => left,
 *   "RIGHT ..." => right). We never hand-roll a keyboard layout. Neutral keys:
 *     ' ' (space)   — "THUMB — THE BIG KEY"; either thumb, no L/R balance.
 *     'Backspace'   — FINGER_MAP calls it RIGHT PINKY, but it is an editing
 *                     action (never inside a real word; only L25 correction
 *                     drills), so for "which hand does the WORD engage" => NEUTRAL.
 *     'Shift'       — a modifier chord, not a hand-balance keystroke on its own.
 *                     Uppercase letters (L24) inherit their base letter's hand.
 *   Any char absent from FINGER_MAP falls through to NEUTRAL and is surfaced.
 *
 * MODES
 *   node scripts/analyze-hand-balance.mjs                 pretty static table
 *   node scripts/analyze-hand-balance.mjs --json          static, JSON
 *   node scripts/analyze-hand-balance.mjs --level=N       one level only
 *   node scripts/analyze-hand-balance.mjs --transcript F  played-reality table
 *   node scripts/analyze-hand-balance.mjs --transcript F --json   ...as JSON
 *
 * METRICS (both modes, per level)
 *   keySetComposition   the level's UNLOCKED key set's own L:R (EXPECTED lean
 *                       baseline; a single-side-key or number/symbol level
 *                       legitimately leans — from js/levels.js, both modes).
 *   keystroke L/R/N     STATIC: pool-weighted char tally across all pool patterns.
 *                       TRANSCRIPT: accepted+injected key PRESSES (real keystrokes).
 *   alternationRate     average within-word hand-switch rate over consecutive
 *                       NON-NEUTRAL keystroke pairs (STATIC: over pool words;
 *                       TRANSCRIPT: over completed-pattern words that were served).
 *   singleHandShare     share of words (≥2 non-neutral tokens) using one hand only.
 *   variability         STATIC: distinct pool patterns vs win-gate min (intro.len).
 *                       TRANSCRIPT: distinct served patterns / total served.
 * =============================================================================
 */

'use strict';

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const LEVELS_PATH = path.join(REPO_ROOT, 'js', 'levels.js');

const levelsUrl = url.pathToFileURL(LEVELS_PATH).href;
const { FINGER_MAP, LEVELS } = await import(levelsUrl);

// ── Hand classification ──────────────────────────────────────────────────────
const NEUTRAL_KEYS = new Set([' ', 'Backspace', 'Shift']);

function handOf(ch) {
  if (NEUTRAL_KEYS.has(ch)) return 'neutral';
  const base = /^[A-Z]$/.test(ch) ? ch.toLowerCase() : ch;
  const label = FINGER_MAP[base];
  if (!label) return 'neutral';
  if (label.startsWith('LEFT')) return 'left';
  if (label.startsWith('RIGHT')) return 'right';
  return 'neutral';
}

// ── Token helpers (a pattern = array of single tokens) ───────────────────────
function patternHands(pattern) { return pattern.map(handOf); }

function isWord(pattern) {
  return pattern.filter(t => handOf(t) !== 'neutral').length >= 2;
}

// Within-word hand-switch rate over consecutive NON-NEUTRAL keystroke pairs.
function wordAlternationRate(pattern) {
  const hands = patternHands(pattern).filter(h => h !== 'neutral');
  if (hands.length < 2) return null;
  let switches = 0, pairs = 0;
  for (let i = 1; i < hands.length; i++) { pairs++; if (hands[i] !== hands[i - 1]) switches++; }
  return pairs ? switches / pairs : null;
}

function singleHandOf(pattern) {
  const hands = new Set(patternHands(pattern).filter(h => h !== 'neutral'));
  return hands.size === 1 ? [...hands][0] : null;
}

function keySetComposition(keys) {
  let left = 0, right = 0, neutral = 0;
  const unmapped = [];
  for (const k of keys) {
    const h = handOf(k);
    if (h === 'left') left++;
    else if (h === 'right') right++;
    else {
      neutral++;
      const base = /^[A-Z]$/.test(k) ? k.toLowerCase() : k;
      if (!NEUTRAL_KEYS.has(k) && !FINGER_MAP[base]) unmapped.push(k);
    }
  }
  return { left, right, neutral, unmapped };
}

// ── Shared metric core over a set of patterns (arrays of tokens) ─────────────
// `patterns` is the list of words/sequences (pool patterns OR served patterns).
// Returns keystroke tally, alternation, single-hand, and variability sub-metrics.
function metricsOverPatterns(patterns) {
  let left = 0, right = 0, neutral = 0;
  for (const pattern of patterns) {
    for (const tok of pattern) {
      const h = handOf(tok);
      if (h === 'left') left++; else if (h === 'right') right++; else neutral++;
    }
  }
  const altRates = [];
  for (const pattern of patterns) {
    const r = wordAlternationRate(pattern);
    if (r != null) altRates.push(r);
  }
  const alternation = altRates.length ? altRates.reduce((a, b) => a + b, 0) / altRates.length : null;

  const words = patterns.filter(isWord);
  let rightOnly = 0, leftOnly = 0;
  const rightOnlyList = [], leftOnlyList = [];
  for (const pattern of words) {
    const s = singleHandOf(pattern);
    if (s === 'right') { rightOnly++; rightOnlyList.push(patternText(pattern)); }
    else if (s === 'left') { leftOnly++; leftOnlyList.push(patternText(pattern)); }
  }
  const singleHandShare = words.length ? (rightOnly + leftOnly) / words.length : 0;

  const distinct = new Set(patterns.map(patternText)).size;

  const rightShare = left + right ? right / (left + right) : 0.5;
  return {
    left, right, neutral,
    ratioLR: ratio(left, right), rightShare: round(rightShare),
    alternation: alternation == null ? null : round(alternation),
    words: words.length, rightOnly, leftOnly,
    singleHandShare: round(singleHandShare), rightOnlyList, leftOnlyList,
    totalPatterns: patterns.length, distinctPatterns: distinct,
  };
}

// Human-readable text for a pattern (space stays, named tokens as glyphs).
function patternText(pattern) {
  return pattern.map(t => t === ' ' ? ' ' : t === 'Backspace' ? '⌫' : t === 'Shift' ? '⇧' : t).join('');
}

function ratio(l, r) {
  if (l === 0 && r === 0) return '0:0';
  if (r === 0) return `${l}:0`;
  if (l === 0) return `0:${r}`;
  if (l >= r) return `${round(l / r)}:1`;
  return `1:${round(r / l)}`;
}
function round(x) { return x == null ? null : Math.round(x * 100) / 100; }

// ── STATIC: analyze a level's declared pool ──────────────────────────────────
function analyzeLevelStatic(levelNum, level) {
  const keySet = keySetComposition(level.keys);
  const m = metricsOverPatterns(level.pool);
  const keySetRightShare = keySet.left + keySet.right ? keySet.right / (keySet.left + keySet.right) : 0.5;
  const leanDelta = m.rightShare - keySetRightShare;
  const minPatterns = level.intro.length;
  return {
    level: levelNum, name: level.name, era: level.era, newKeys: level.newKeys,
    keySet: {
      left: keySet.left, right: keySet.right, neutral: keySet.neutral,
      ratioLR: ratio(keySet.left, keySet.right), rightShare: round(keySetRightShare),
      unmapped: keySet.unmapped,
    },
    keystroke: { left: m.left, right: m.right, neutral: m.neutral, ratioLR: m.ratioLR, rightShare: m.rightShare },
    leanDelta: round(leanDelta),
    alternationPotential: m.alternation,
    singleHand: {
      words: m.words, rightOnly: m.rightOnly, leftOnly: m.leftOnly,
      share: m.singleHandShare, rightOnlyList: m.rightOnlyList, leftOnlyList: m.leftOnlyList,
    },
    variability: {
      poolSize: level.pool.length, distinctPatterns: m.distinctPatterns,
      minPatterns, repetitionRisk: m.distinctPatterns < 14,
    },
  };
}

// ── TRANSCRIPT: parse a jsonl transcript and analyze played reality ──────────
// Splits a transcript `text` field (reversed glyphs, per readVisibleSequence)
// back into tokens: ⌫=>Backspace, ⇧=>Shift, ' '=>space, else one char per token.
function textToTokens(text) {
  const out = [];
  for (const ch of text) {
    if (ch === '⌫') out.push('Backspace');
    else if (ch === '⇧') out.push('Shift');
    else out.push(ch); // includes ' '
  }
  return out;
}

function analyzeTranscript(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
  const events = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

  // Group per level. Two views:
  //  - served patterns: pattern_complete texts (the words the level actually
  //    presented and the player finished) => alternation / single-hand / variety.
  //  - real keystrokes: accepted + injected_wrong presses (`pressed` chars) =>
  //    the ACTUAL L/R keystroke balance the hands experienced.
  const byLevel = new Map();
  const ensure = (lvl) => {
    if (!byLevel.has(lvl)) byLevel.set(lvl, { served: [], presses: [] });
    return byLevel.get(lvl);
  };
  for (const e of events) {
    if (e.type === 'pattern_complete' && e.level != null && typeof e.text === 'string') {
      ensure(e.level).served.push(textToTokens(e.text));
    } else if (e.type === 'press' && e.level != null &&
               (e.outcome === 'accepted' || e.outcome === 'injected_wrong')) {
      // The physical key the hand actually pressed.
      const p = e.pressed;
      if (typeof p === 'string') ensure(e.level).presses.push(p);
    }
  }

  const results = [];
  for (const [lvl, data] of [...byLevel.entries()].sort((a, b) => a[0] - b[0])) {
    const level = LEVELS[lvl];
    const keySet = level ? keySetComposition(level.keys) : { left: 0, right: 0, neutral: 0, unmapped: [] };
    const keySetRightShare = keySet.left + keySet.right ? keySet.right / (keySet.left + keySet.right) : 0.5;

    // Real keystroke L/R from actual presses.
    let kl = 0, kr = 0, kn = 0;
    for (const p of data.presses) {
      const h = handOf(p);
      if (h === 'left') kl++; else if (h === 'right') kr++; else kn++;
    }
    const kRightShare = kl + kr ? kr / (kl + kr) : 0.5;

    // Served-pattern metrics (alternation, single-hand, variability).
    const m = metricsOverPatterns(data.served);
    const minPatterns = level ? level.intro.length : null;

    results.push({
      level: lvl, name: level ? level.name : `LEVEL ${lvl}`, era: level ? level.era : '',
      newKeys: level ? level.newKeys : [],
      keySet: {
        left: keySet.left, right: keySet.right, neutral: keySet.neutral,
        ratioLR: ratio(keySet.left, keySet.right), rightShare: round(keySetRightShare),
      },
      keystroke: {
        left: kl, right: kr, neutral: kn, ratioLR: ratio(kl, kr), rightShare: round(kRightShare),
      },
      leanDelta: round(kRightShare - keySetRightShare),
      alternationPlayed: m.alternation,
      singleHand: {
        words: m.words, rightOnly: m.rightOnly, leftOnly: m.leftOnly,
        share: m.singleHandShare, rightOnlyList: m.rightOnlyList, leftOnlyList: m.leftOnlyList,
      },
      variability: {
        served: m.totalPatterns, distinctServed: m.distinctPatterns,
        minPatterns,
        repeatRate: m.totalPatterns ? round(1 - m.distinctPatterns / m.totalPatterns) : null,
      },
    });
  }
  return results;
}

// ── Table renderers ──────────────────────────────────────────────────────────
const H = (s, w) => String(s).padEnd(w);
const R = (s, w) => String(s).padStart(w);

function staticFlags(r) {
  const flags = [];
  if (r.leanDelta != null && Math.abs(r.leanDelta) >= 0.12) flags.push(r.leanDelta > 0 ? 'POOL→R' : 'POOL→L');
  if (r.alternationPotential != null && r.alternationPotential < 0.5) flags.push('LOW-ALT');
  if (r.singleHand.share >= 0.25) flags.push('1HAND');
  if (r.variability.repetitionRisk) flags.push('REPEAT');
  return flags;
}

function printStaticTable(results) {
  console.log('Keystroke Kingdom — STATIC pool hand-balance & variability by level');
  console.log('(hand source of truth: FINGER_MAP in js/levels.js; space/Backspace/Shift = neutral)\n');
  console.log(
    H('Lv', 3) + H('New', 8) + H('keySet L:R', 12) + H('pool L:R', 12) +
    R('leanΔ', 7) + R('alt', 6) + R('1hand%', 8) + R('R-only', 8) + R('L-only', 8) +
    R('pool', 6) + R('distinct', 9) + R('min', 5) + '  flags');
  console.log('-'.repeat(114));
  for (const r of results) {
    console.log(
      H(r.level, 3) + H(r.newKeys.map(k => k === ' ' ? '␣' : k).join(''), 8) +
      H(`${r.keySet.left}:${r.keySet.right}` + (r.keySet.neutral ? `(+${r.keySet.neutral}n)` : ''), 12) +
      H(`${r.keystroke.left}:${r.keystroke.right}` + (r.keystroke.neutral ? `(+${r.keystroke.neutral}n)` : ''), 12) +
      R(r.leanDelta == null ? '-' : (r.leanDelta > 0 ? '+' : '') + r.leanDelta, 7) +
      R(r.alternationPotential == null ? '-' : r.alternationPotential, 6) +
      R(Math.round(r.singleHand.share * 100) + '%', 8) +
      R(r.singleHand.rightOnly, 8) + R(r.singleHand.leftOnly, 8) +
      R(r.variability.poolSize, 6) + R(r.variability.distinctPatterns, 9) +
      R(r.variability.minPatterns, 5) + '  ' + staticFlags(r).join(' '));
  }
  console.log('\nFlags: POOL→R/→L pool leans ≥0.12 right-share beyond key-set baseline · ' +
    'LOW-ALT within-word alternation <0.50 · 1HAND ≥25% single-hand words · REPEAT distinct pool <14');
  console.log('leanΔ = pool right-share − key-set right-share (positive = pool leans MORE right than the keys force).');
}

function transcriptFlags(r) {
  const flags = [];
  if (r.leanDelta != null && Math.abs(r.leanDelta) >= 0.12) flags.push(r.leanDelta > 0 ? 'PLAYED→R' : 'PLAYED→L');
  if (r.alternationPlayed != null && r.alternationPlayed < 0.5) flags.push('LOW-ALT');
  if (r.singleHand.share >= 0.25) flags.push('1HAND');
  if (r.variability.repeatRate != null && r.variability.repeatRate >= 0.15) flags.push('REPEAT');
  return flags;
}

function printTranscriptTable(results, file) {
  console.log(`Keystroke Kingdom — PLAYED-REALITY hand-balance from transcript`);
  console.log(`(${file})`);
  console.log('(keystroke L:R = actual accepted+injected presses; served = completed patterns)\n');
  console.log(
    H('Lv', 3) + H('New', 8) + H('keySet L:R', 12) + H('played L:R', 13) +
    R('leanΔ', 7) + R('alt', 6) + R('1hand%', 8) + R('R-only', 8) + R('L-only', 8) +
    R('served', 8) + R('distinct', 9) + R('rpt%', 6) + '  flags');
  console.log('-'.repeat(116));
  for (const r of results) {
    console.log(
      H(r.level, 3) + H(r.newKeys.map(k => k === ' ' ? '␣' : k).join(''), 8) +
      H(`${r.keySet.left}:${r.keySet.right}` + (r.keySet.neutral ? `(+${r.keySet.neutral}n)` : ''), 12) +
      H(`${r.keystroke.left}:${r.keystroke.right}` + (r.keystroke.neutral ? `(+${r.keystroke.neutral}n)` : ''), 13) +
      R(r.leanDelta == null ? '-' : (r.leanDelta > 0 ? '+' : '') + r.leanDelta, 7) +
      R(r.alternationPlayed == null ? '-' : r.alternationPlayed, 6) +
      R(Math.round(r.singleHand.share * 100) + '%', 8) +
      R(r.singleHand.rightOnly, 8) + R(r.singleHand.leftOnly, 8) +
      R(r.variability.served, 8) + R(r.variability.distinctServed, 9) +
      R(r.variability.repeatRate == null ? '-' : Math.round(r.variability.repeatRate * 100), 6) +
      '  ' + transcriptFlags(r).join(' '));
  }
  console.log('\nFlags: PLAYED→R/→L played keystrokes lean ≥0.12 beyond key-set baseline · ' +
    'LOW-ALT served-word alternation <0.50 · 1HAND ≥25% single-hand served words · REPEAT ≥15% repeated served patterns');
  console.log('rpt% = 1 − distinct/served: fraction of served patterns that were repeats in this real run.');
}

// ── Run ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const jsonMode = argv.includes('--json');
const levelArg = argv.find(a => a.startsWith('--level='));
const onlyLevel = levelArg ? parseInt(levelArg.slice(8), 10) : null;
const trArg = argv.find(a => a.startsWith('--transcript='));
const trFile = trArg ? trArg.slice(13)
  : (argv.includes('--transcript') ? argv[argv.indexOf('--transcript') + 1] : null);

if (trFile) {
  if (!fs.existsSync(trFile)) { console.error(`Transcript not found: ${trFile}`); process.exit(2); }
  let results = analyzeTranscript(trFile);
  if (onlyLevel != null) results = results.filter(r => r.level === onlyLevel);
  if (jsonMode) {
    process.stdout.write(JSON.stringify(
      { generatedAt: new Date().toISOString(), source: 'transcript', file: trFile, levels: results }, null, 2) + '\n');
  } else {
    printTranscriptTable(results, trFile);
  }
} else {
  const levelNums = Object.keys(LEVELS).map(Number).sort((a, b) => a - b)
    .filter(n => onlyLevel == null || n === onlyLevel);
  const results = levelNums.map(n => analyzeLevelStatic(n, LEVELS[n]));
  if (jsonMode) {
    process.stdout.write(JSON.stringify(
      { generatedAt: new Date().toISOString(), source: 'static-pool', levels: results }, null, 2) + '\n');
  } else {
    printStaticTable(results);
  }
}
