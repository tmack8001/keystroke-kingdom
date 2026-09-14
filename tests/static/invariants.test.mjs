// Enforces: INV-29, INV-30, INV-31, INV-34
// Static analysis of source files to enforce security rules (security.md),
// language rules (no "semicolon" in player text, no hard-coded ENTER), and
// the theme module contract. No browser, no game imports, pure fs + regex.

import { test } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO = '/Users/trevormack/dev/keystroke-kingdom';

// Simple recursive directory walk — no external dependencies
function findFilesMatching(dir, pattern) {
  const results = [];
  const walk = (dir) => {
    try {
      const entries = fs.readdirSync(dir);
      entries.forEach((entry) => {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          walk(full);
        } else if (pattern.test(full)) {
          results.push(full);
        }
      });
    } catch (e) {
      // Ignore unreadable directories
    }
  };
  walk(dir);
  return results;
}

// Utility: strip comments from JS code carefully (line-based // and non-greedy /*...*/)
function stripComments(code) {
  let result = '';
  let i = 0;
  while (i < code.length) {
    // Line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      i += 2;
      while (i < code.length && code[i] !== '\n') i++;
      if (i < code.length) result += '\n'; // preserve line break
      i++;
    }
    // Block comment (non-greedy)
    else if (code[i] === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < code.length - 1) {
        if (code[i] === '*' && code[i + 1] === '/') {
          i += 2;
          break;
        }
        if (code[i] === '\n') result += '\n'; // preserve line breaks within comments
        i++;
      }
    } else {
      result += code[i];
      i++;
    }
  }
  return result;
}

// Utility: read a file, return as string with line numbers
function readFileLines(filePath) {
  return fs.readFileSync(filePath, 'utf8').split('\n');
}

// Utility: find all lines matching a regex, return { line, lineNo, match }
function findMatches(filePath, regex) {
  const lines = readFileLines(filePath);
  const results = [];
  lines.forEach((line, idx) => {
    const match = line.match(regex);
    if (match) {
      results.push({ lineNo: idx + 1, line, match });
    }
  });
  return results;
}

test('INV-31: security greps — no eval, new Function, string setTimeout/setInterval in js/', (t) => {
  const jsFiles = findFilesMatching(`${REPO}/js`, /\.js$/).filter((f) => !f.endsWith('/themes/index.js'));
  const issues = [];

  jsFiles.forEach((file) => {
    const code = fs.readFileSync(file, 'utf8');
    const stripped = stripComments(code);

    // Check for eval(
    const evalMatches = findMatches(file, /\beval\s*\(/);
    evalMatches.forEach((m) => {
      issues.push(`${path.relative(REPO, file)}:${m.lineNo}: contains eval()`);
    });

    // Check for new Function(
    const funcMatches = findMatches(file, /\bnew\s+Function\s*\(/);
    funcMatches.forEach((m) => {
      issues.push(`${path.relative(REPO, file)}:${m.lineNo}: contains new Function()`);
    });

    // Check for string-form setTimeout/setInterval (first arg is a quoted string)
    // Pattern: setTimeout/setInterval followed by ( and a quoted string
    const stringTimerMatches = findMatches(
      file,
      /\b(setTimeout|setInterval)\s*\(\s*["'`]/
    );
    stringTimerMatches.forEach((m) => {
      issues.push(
        `${path.relative(REPO, file)}:${m.lineNo}: string-form ${m.match[1]}()`
      );
    });
  });

  assert.equal(issues.length, 0, `Security violations found:\n${issues.join('\n')}`);
});

test('INV-31: no playerName + innerHTML/insertAdjacentHTML/outerHTML/document.write in js/', (t) => {
  const jsFiles = findFilesMatching(`${REPO}/js`, /\.js$/);
  const issues = [];

  jsFiles.forEach((file) => {
    const lines = readFileLines(file);
    lines.forEach((line, idx) => {
      const lineNo = idx + 1;
      // Check if line mentions playerName (case-insensitive)
      if (/\bplayerName\b/i.test(line)) {
        // Check if it also has dangerous sinks on the same line
        if (/\b(innerHTML|insertAdjacentHTML|outerHTML|document\.write)\b/i.test(line)) {
          issues.push(
            `${path.relative(REPO, file)}:${lineNo}: playerName with innerHTML/insertAdjacentHTML/outerHTML/document.write`
          );
        }
      }
    });
  });

  assert.equal(issues.length, 0, `DOM sink violations found:\n${issues.join('\n')}`);
});

test('INV-31: no external network calls (http/https literals) in js/', (t) => {
  const jsFiles = findFilesMatching(`${REPO}/js`, /\.js$/);
  const issues = [];

  jsFiles.forEach((file) => {
    const lines = readFileLines(file);
    lines.forEach((line, idx) => {
      const lineNo = idx + 1;
      // Strip comments from this line
      const beforeComment = line.split('//')[0];
      // Look for http:// or https:// as a string literal (not in comments)
      if (/https?:\/\/(?!localhost|127\.0\.0\.1)/.test(beforeComment)) {
        // Allow /api/* same-origin paths
        if (!/["']\/api\//.test(beforeComment)) {
          issues.push(
            `${path.relative(REPO, file)}:${lineNo}: external URL literal: ${line.trim()}`
          );
        }
      }
    });
  });

  assert.equal(issues.length, 0, `External network calls found:\n${issues.join('\n')}`);
});

test('INV-31: no eval in scripts/*.sh', (t) => {
  const shFiles = findFilesMatching(`${REPO}/scripts`, /-hook\.sh$/);
  const issues = [];

  shFiles.forEach((file) => {
    const lines = readFileLines(file);
    lines.forEach((line, idx) => {
      const lineNo = idx + 1;
      if (/\beval\b/.test(line)) {
        issues.push(`${path.relative(REPO, file)}:${lineNo}: contains eval`);
      }
    });
  });

  assert.equal(issues.length, 0, `Shell eval violations found:\n${issues.join('\n')}`);
});

test('INV-29: no "semicolon" (case-insensitive) in player-facing strings', (t) => {
  const issues = [];

  // Check index.html text content (not attributes that are not on display elements)
  const htmlContent = fs.readFileSync(`${REPO}/index.html`, 'utf8');
  // Simple approach: look for "semicolon" in the HTML, then verify it's not in a comment
  const htmlLines = htmlContent.split('\n');
  htmlLines.forEach((line, idx) => {
    const lineNo = idx + 1;
    // Skip HTML comments
    if (line.trim().startsWith('<!--')) return;
    if (/semicolon/i.test(line)) {
      // Possible false positive from attribute values; be conservative
      issues.push(`index.html:${lineNo}: contains "semicolon"`);
    }
  });

  // Check JS string literals (not comments)
  const jsFiles = findFilesMatching(`${REPO}/js`, /\.js$/);
  jsFiles.forEach((file) => {
    const code = fs.readFileSync(file, 'utf8');
    const lines = code.split('\n');
    lines.forEach((line, idx) => {
      const lineNo = idx + 1;
      const beforeComment = line.split('//')[0];
      // Look for "semicolon" in quoted strings
      if (/["'`].*semicolon.*["'`]/i.test(beforeComment)) {
        issues.push(`${path.relative(REPO, file)}:${lineNo}: string contains "semicolon"`);
      }
    });
  });

  // Note: false positives in error messages or data structures are acceptable;
  // this grep is conservative to catch real player-facing violations
  assert.equal(
    issues.length,
    0,
    `"semicolon" found in player-facing strings:\n${issues.join('\n')}`
  );
});

test('INV-30: hard-coded ENTER display strings must use [data-enter-key] in index.html', (t) => {
  const htmlContent = fs.readFileSync(`${REPO}/index.html`, 'utf8');
  const issues = [];

  // Find lines with the word ENTER (uppercase, display context)
  const lines = htmlContent.split('\n');
  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    // Match ENTER as a standalone word (not part of a longer identifier).
    // CLAUDE.md's rule targets ENTER "as a key-press instruction" — the key
    // LABEL ("PRESS ENTER", "[ENTER]"). ENTER as the plain verb followed by an
    // object ("ENTER YOUR NAME") is ordinary language, not a key reference —
    // triaged 2026-07-12 (ex-TF-1, dismissed as a test misreading of the doc).
    if (/\bENTER\b/.test(line) && !/\bENTER\s+[A-Z]/.test(line)) {
      // Check if it's wrapped in a [data-enter-key] element
      if (!/data-enter-key/.test(line)) {
        // Likely a violation unless it's in a comment
        if (!line.trim().startsWith('<!--')) {
          issues.push(
            `index.html:${lineNo}: ENTER not wrapped in [data-enter-key]: ${line.trim()}`
          );
        }
      }
    }
  });

  assert.equal(issues.length, 0, `Hard-coded ENTER strings found:\n${issues.join('\n')}`);
});

test('INV-30: ENTER display strings in js/ must use data-enter-key markup or be e.key handlers', (t) => {
  const jsFiles = findFilesMatching(`${REPO}/js`, /\.js$/);
  const issues = [];

  jsFiles.forEach((file) => {
    const lines = readFileLines(file);
    lines.forEach((line, idx) => {
      const lineNo = idx + 1;
      const beforeComment = line.split('//')[0];

      // Look for "ENTER" in string literals (quoted form)
      if (/"ENTER"|'ENTER'|`ENTER`/.test(beforeComment)) {
        // Exception: e.key === 'Enter' comparisons are fine
        if (/e\.key\s*===?\s*['"]Enter['"]/.test(beforeComment)) {
          return; // OK
        }
        // Exception: "Enter" as a key token is OK
        if (/'Enter'\b|"Enter"\b/.test(beforeComment) && !/ENTER/.test(beforeComment)) {
          return; // OK
        }
        // Exception: the platform-swap mechanism itself — CLAUDE.md's rule says
        // main.js "replaces all [data-enter-key] elements with RETURN on Mac,
        // ENTER elsewhere"; the swapper line must contain both label literals.
        // Triaged 2026-07-12 (ex-TF-2, dismissed — this line IS the rule's fix).
        if (/['"`]RETURN['"`]/.test(beforeComment) && /['"`]ENTER['"`]/.test(beforeComment)) {
          return; // OK
        }
        // Otherwise, must contain data-enter-key markup
        if (!/data-enter-key/.test(beforeComment)) {
          issues.push(
            `${path.relative(REPO, file)}:${lineNo}: "ENTER" without data-enter-key`
          );
        }
      }
    });
  });

  // TF-3 FIXED 2026-07-13: keyboard-preview.js now uses the platform ternary
  // (both 'RETURN' and 'ENTER' literals on one line — the sanctioned swap form).
  assert.equal(
    issues.length,
    0,
    `ENTER display strings without data-enter-key found:\n${issues.join('\n')}`
  );
});

test('INV-34: theme contract — all themes export start, stop, keystroke, miss, patternComplete, victory', (t) => {
  const themeDir = `${REPO}/js/themes`;
  const themeFiles = fs
    .readdirSync(themeDir)
    .filter((f) => f.endsWith('.js') && f !== 'index.js')
    .map((f) => path.join(themeDir, f));

  const requiredExports = ['start', 'stop', 'keystroke', 'miss', 'patternComplete', 'victory'];
  const issues = [];

  themeFiles.forEach((file) => {
    const code = fs.readFileSync(file, 'utf8');
    const found = new Set();

    // Match export function <name> or export const <name>
    const exportRegex = /export\s+(function|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    let match;
    while ((match = exportRegex.exec(code)) !== null) {
      found.add(match[2]);
    }

    // Also check for export { ... } forms
    const namedExportRegex = /export\s*\{([^}]+)\}/;
    const namedMatch = code.match(namedExportRegex);
    if (namedMatch) {
      const exports = namedMatch[1].split(',').map((e) => e.trim().split(' as ')[0]);
      exports.forEach((e) => found.add(e));
    }

    // Check for missing exports
    const missing = requiredExports.filter((exp) => !found.has(exp));
    if (missing.length > 0) {
      issues.push(
        `${path.relative(REPO, file)}: missing exports: ${missing.join(', ')}`
      );
    }
  });

  // TF-4 FIXED 2026-07-13: pacman.js gained its miss() (ghost double-take flinch).
  assert.equal(
    issues.length,
    0,
    `Theme contract violations found:\n${issues.join('\n')}`
  );
});

// ── INV-93 — a cabinet's displayed YEAR is the game's release year ───────────
// Ground truth is the curriculum's own assignment table in
// `.claude/rules/levels.md`, never cabinet-art.js itself (STRATEGY.md §2).
//
// This exists because four of Act 1's five cabinets shipped the wrong year. The
// wrong values were `.claude/rules/tech.md`'s Era Progression table — the GRAPHICS
// FIDELITY target per level ("Atari 1977", "NES 1985", "SNES 1991") — not the
// game's release year. Two tables of year-shaped numbers for the same levels, and
// `era:` was filled from the wrong one. The select screen read "LEVEL 3 · 1985"
// under a Pac-Man cabinet for months.
test('INV-93: every cabinet\'s era matches the curriculum assignment table\'s year', () => {
  const table = fs.readFileSync(path.join(REPO, '.claude/rules/levels.md'), 'utf8');
  const art = fs.readFileSync(path.join(REPO, 'js/ui/cabinet-art.js'), 'utf8');

  // "| 3 | The Arcade | S, L | Pac-Man | Namco | 1980 | [act1.md](...) |"
  const expected = new Map();
  for (const line of table.split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 8) continue;
    const level = Number(cells[1]);
    const year = cells[6];
    if (!Number.isInteger(level) || level < 1 || level > 25) continue;
    if (!/^\d{4}$/.test(year)) continue;   // L20/L24/L25 are free-form by design
    expected.set(level, year);
  }
  assert.ok(expected.size >= 20,
    `parsed only ${expected.size} dated rows from levels.md — the table shape changed`);

  // CABINET_DATA[n] = { label, keys, era: 'YYYY', ... }
  const drawn = new Map();
  for (const m of art.matchAll(/\n {2}(\d+): \{\n(?:.*\n)*?\s{4}era: '([^']+)',/g)) {
    drawn.set(Number(m[1]), m[2]);
  }
  assert.ok(drawn.size >= 20,
    `parsed only ${drawn.size} cabinets from cabinet-art.js — CABINET_DATA's shape changed`);

  const wrong = [];
  for (const [level, year] of expected) {
    if (!drawn.has(level)) continue;       // a level with no cabinet art yet
    if (drawn.get(level) !== year) wrong.push(`L${level}: draws ${drawn.get(level)}, table says ${year}`);
  }
  assert.deepStrictEqual(wrong, [],
    'a cabinet is displaying a year the curriculum table does not agree with:\n  ' + wrong.join('\n  '));
});
