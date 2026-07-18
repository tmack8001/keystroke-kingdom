// Build-time generator: emit a compact levels manifest for the Go word-gen server.
//
// The Go binary can't parse js/levels.js, so we derive exactly what /api/wordgen
// needs — per level, the unlocked key set and a small sample of pool entries that
// read like real words — and write it as embedded JSON (js/wordgen-manifest.json).
//
// Run via `make gen`. Keep the output deterministic and tiny; it is the ONLY
// bridge between the curriculum data and the server's prompt + validation charset.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LEVELS } from '../js/levels.js';

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, '..', 'js', 'wordgen-manifest.json');

const manifest = {};
for (const [num, lv] of Object.entries(LEVELS)) {
  const keys = [...new Set(lv.keys)];

  // Sample pool entries that look like plain lowercase words (2-8 letters, no
  // symbol wrappers). Early levels are pure finger-drills and yield nothing —
  // that's fine: the charset constraint carries those, and validation drops junk.
  const sample = [];
  for (const entry of lv.pool || []) {
    const w = entry.join('');
    if (/^[a-z]{2,8}$/.test(w)) sample.push(w);
  }

  manifest[num] = {
    keys,
    // dedup + cap the few-shot examples
    sample: [...new Set(sample)].slice(0, 10),
  };
}

writeFileSync(outPath, JSON.stringify(manifest, null, 0) + '\n');
console.log(`wrote ${outPath} (${Object.keys(manifest).length} levels)`);
