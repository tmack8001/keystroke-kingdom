// Enforces: INV-133 — CLAUDE.md §Platform Key Label (Return vs Enter):
//   "Never hard-code the word 'ENTER' as a key-press instruction in any display
//   string. Always wrap it in <span data-enter-key>… so main.js can swap it."
//   The bonus wings (js/textworld/*, js/hardware/*, js/speedway/*) draw on the
//   shared CANVAS, where there is no element to swap, so their strings ask
//   js/key-label.js `enterLabel()` instead (RETURN on a Mac, ENTER elsewhere).
// Extends INV-30 (which only caught a string that was EXACTLY 'ENTER').
//
// L0: pure fs + regex, no game imports. The detector is written to bite on the
// pre-2026-10-30 wing strings ('SPACE / ENTER: back to the arcade',
// '↑ ↓ CHOOSE · ENTER CHAT · X FORGET', 'type your answer, then ENTER') while
// passing the legitimate uses: the verb in "ENTER YOUR NAME", the sanctioned
// RETURN/ENTER swap line, and phase identifiers that merely contain the word.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'vendor') walk(full, out); }
    else if (full.endsWith('.js')) out.push(full);
  }
  return out;
}

// Pull the contents of every string/template literal on one source line.
function stringsOn(line) {
  const out = [];
  const re = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = re.exec(line))) out.push(m[1] ?? m[2] ?? m[3] ?? '');
  return out;
}

// A string that NAMES the confirm key as an instruction or a key cap.
export function namesTheConfirmKey(s) {
  if (!/\b(ENTER|RETURN)\b/i.test(s)) return false;
  if (!/\s/.test(s.trim())) return false;                       // a lone identifier ('RETURN' phase id)
  const verbPhrase = /\b(press|hit|tap|push)\s+(enter|return)\b/i.test(s);
  const keyCap =
    /\b(ENTER|RETURN)\b\s*[/·—:(-]/.test(s) ||                   // "ENTER:", "ENTER /", "ENTER —"
    /\b(ENTER|RETURN)\s+to\s+(send|start|continue|keep|skip|save|begin|play|chat|confirm)/i.test(s) || // "ENTER to keep going"
    /([/·—]\s*)(ENTER|RETURN)\b/.test(s) ||                      // "SPACE / ENTER"
    /\b(then|or|and)\s+(ENTER|RETURN)\b/i.test(s) ||             // "type your answer, then ENTER"
    /\b(ENTER|RETURN)\s+(CHAT|SEND|KEEP|SAVE|SKIP|PLAY|CONTINUE)\b/.test(s) || // "ENTER CHAT"
    /^(ENTER|RETURN)\s+[—-]/.test(s.trim());                     // "ENTER — send"
  if (!verbPhrase && !keyCap) return false;
  if (/ENTER YOUR NAME/.test(s)) return false;                  // the VERB, not the key
  return true;
}

test('INV-133: no js/ display string hard-codes the confirm key\'s name (canvas strings must use enterLabel)', () => {
  const issues = [];
  for (const file of walk(path.join(REPO, 'js'))) {
    const rel = path.relative(REPO, file);
    if (rel === path.join('js', 'key-label.js')) continue;       // the helper itself
    fs.readFileSync(file, 'utf8').split('\n').forEach((raw, i) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(raw)) return;                // comment-only line
      const line = raw.split(/\s\/\/\s/)[0];                     // drop trailing comment
      // The sanctioned platform swap: one line carrying BOTH literals.
      if (/['"`]RETURN['"`]/.test(line) && /['"`]ENTER['"`]/.test(line)) return;
      for (const s of stringsOn(line)) {
        if (namesTheConfirmKey(s)) issues.push(`${rel}:${i + 1}: ${JSON.stringify(s)}`);
      }
    });
  }
  assert.deepEqual(issues, [],
    'These strings name the confirm key. On the DOM wrap it in <span data-enter-key>; on the canvas use ' +
    'enterLabel() from js/key-label.js:\n' + issues.join('\n'));
});

test('INV-133: the detector bites — the pre-fix wing strings are all flagged, the legitimate ones are not', () => {
  const MUST_FLAG = [
    'SPACE / ENTER: back to the arcade',
    '↑ ↓ CHOOSE  ·  ENTER CHAT  ·  X FORGET  ·  ESC BACK',
    '↑ ↓ CHOOSE  ·  ENTER / SPACE CHAT  ·  ESC BACK',
    'type your answer, then ENTER   ·   SPACE: step back',
    'type a word, then ENTER   ·   SPACE: step back and keep exploring',
    'ENTER — send   ·   ESC — back to your friends',
    'type letters  ·  ENTER (or just ENTER to skip)',
    '↑ ↓ CHOOSE  ·  ENTER to keep going',
    'PRESS RETURN',
    'PRESS ENTER TO START',
    'press enter to begin',
  ];
  const MUST_PASS = [
    'ENTER YOUR NAME',
    'RETURN',
    'ENTER',
    'RETURN TO THE ARCADE',
    'You smile and step back.',
    'Enter',
  ];
  for (const s of MUST_FLAG) assert.equal(namesTheConfirmKey(s), true, `should flag: ${s}`);
  for (const s of MUST_PASS) assert.equal(namesTheConfirmKey(s), false, `should not flag: ${s}`);
});
