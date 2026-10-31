// Enforces: INV-134 (unit face) — product.md §"Choosing a harder rule asks once"
//   (Trevor, 2026-10-30): "Moving PLAY STYLE to SURVIVAL now asks… An unconfirmed
//   harder value is never saved… Easier changes stay instant — moving back to
//   ADVENTURE never asks."
// Enforces: INV-138 — product.md §"Word-length labels say which way is harder":
//   "A higher MAX allows longer words and is HARDER; a higher MIN demands longer
//   words and is HARDER. The descriptors used to call every MAX rung 'EASIER',
//   including 24, the hardest one. Every rung now names its real direction."
//
// Unit layer: js/settings.js public exports + the localStorage stub. The module
// caches internally, so each case imports a fresh copy (same technique as
// settings.test.mjs).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { installLocalStorageStub } from '../helpers/stubs.mjs';

let n = 0;
async function fresh(initial = {}) {
  n += 1;
  const store = installLocalStorageStub(initial);
  const mod = await import(`../../js/settings.js?harder=${n}`);
  return { mod, store };
}

describe('INV-134 — previewRowChange: a harder value asks, and asking writes nothing', () => {
  test('ADVENTURE -> SURVIVAL asks (a non-empty fixed prompt), in either direction of travel', async () => {
    const { mod } = await fresh();
    const s = mod.loadSettings();
    assert.equal(s.playStyle, 'adventure', 'precondition: Adventure is the default');
    const row = mod.getRows().findIndex((r) => r.key === 'playStyle');
    assert.ok(row >= 0, 'there is a PLAY STYLE row');
    for (const dir of [1, -1]) {
      const { next, confirm } = mod.previewRowChange(s, row, dir);
      assert.equal(next.playStyle, 'survival', `dir ${dir} lands on SURVIVAL (the row has two values)`);
      assert.equal(typeof confirm, 'string');
      assert.ok(confirm.length > 0, 'the question has words');
    }
  });

  test('previewRowChange NEVER writes storage — not even when it asks', async () => {
    const { mod, store } = await fresh();
    const s = mod.loadSettings();
    const keysBefore = [...store.keys()].sort();
    const snapshot = JSON.stringify([...store.entries()]);
    const row = mod.getRows().findIndex((r) => r.key === 'playStyle');
    mod.previewRowChange(s, row, 1);
    for (let i = 0; i < mod.getRows().length; i++) {
      mod.previewRowChange(s, i, 1);
      mod.previewRowChange(s, i, -1);
    }
    assert.deepEqual([...store.keys()].sort(), keysBefore, 'no key was created');
    assert.equal(JSON.stringify([...store.entries()]), snapshot, 'no value was changed');
    assert.equal(mod.getSettings().playStyle, 'adventure', 'the live settings are still ADVENTURE');
  });

  test('it does not mutate the settings object it was handed', async () => {
    const { mod } = await fresh();
    const s = mod.loadSettings();
    const frozen = JSON.stringify(s);
    const row = mod.getRows().findIndex((r) => r.key === 'playStyle');
    mod.previewRowChange(s, row, 1);
    assert.equal(JSON.stringify(s), frozen);
  });

  test('from the default, ONLY the PLAY STYLE move to SURVIVAL asks — no other row, either direction', async () => {
    const { mod } = await fresh();
    const s = mod.loadSettings();
    const rows = mod.getRows();
    rows.forEach((r, i) => {
      for (const dir of [1, -1]) {
        const { next, confirm } = mod.previewRowChange(s, i, dir);
        const toSurvival = s.playStyle === 'adventure' && next.playStyle === 'survival';
        assert.equal(confirm !== null, toSurvival,
          `row "${r.key}" dir ${dir}: asks if and only if it moves ADVENTURE -> SURVIVAL`);
      }
    });
  });

  test('moving back to ADVENTURE never asks (easier changes stay instant)', async () => {
    const { mod } = await fresh({ 'kk-settings': JSON.stringify({ playStyle: 'survival' }) });
    const s = mod.loadSettings();
    assert.equal(s.playStyle, 'survival', 'precondition: a saved SURVIVAL preference');
    const row = mod.getRows().findIndex((r) => r.key === 'playStyle');
    for (const dir of [1, -1]) {
      const { next, confirm } = mod.previewRowChange(s, row, dir);
      assert.equal(next.playStyle, 'adventure');
      assert.equal(confirm, null, 'back to ADVENTURE is never questioned');
    }
    // and from SURVIVAL no row asks at all
    mod.getRows().forEach((r, i) => {
      for (const dir of [1, -1]) {
        assert.equal(mod.previewRowChange(s, i, dir).confirm, null, `row "${r.key}" dir ${dir}`);
      }
    });
  });

  test('every other difficulty lever (EXPERIENCE, word length, difficulty tier) stays instant even when it makes play harder', async () => {
    const { mod } = await fresh();
    const s = mod.loadSettings();
    for (const key of ['winRatio', 'difficulty', 'minWordLen', 'maxWordLen', 'lives']) {
      const i = mod.getRows().findIndex((r) => r.key === key);
      if (i < 0) continue;
      assert.equal(mod.previewRowChange(s, i, 1).confirm, null, key);
      assert.equal(mod.previewRowChange(s, i, -1).confirm, null, key);
    }
  });

  test('an action row (ERASE, BLOCKED WORDS) is a no-op and never asks', async () => {
    const { mod } = await fresh();
    const s = mod.loadSettings();
    mod.getRows().forEach((r, i) => {
      if (!r.action) return;
      const { next, confirm } = mod.previewRowChange(s, i, 1);
      assert.equal(confirm, null);
      assert.deepEqual(next, s);
    });
  });
});

// ── INV-138 — word-length descriptors name their real direction ─────────────
const HARDER_WORDS = /HARD/;                // HARDER / HARDEST / A BIT HARDER
const EASIER_WORDS = /EASY|EASIER|EASIEST/;

// Order the descriptors by what they CLAIM about difficulty, using only the
// vocabulary the doc names. Higher = claims to be harder.
function claimedHardness(desc) {
  const d = desc.toUpperCase();
  if (/EASIEST/.test(d)) return 0;
  if (/EASIER|EASY/.test(d)) return 1;
  if (/A BIT HARDER/.test(d)) return 3;
  if (/HARDEST/.test(d)) return 6;
  if (/HARDER STILL/.test(d)) return 5;
  if (/HARDER/.test(d)) return 4;
  return 2;                                  // neutral: says nothing about difficulty
}

describe('INV-138 — MAX / MIN WORD LENGTH rungs say which way is harder', () => {
  async function rows() {
    const { mod } = await fresh();
    return {
      mod,
      max: mod.getRows().find((r) => r.key === 'maxWordLen'),
      min: mod.getRows().find((r) => r.key === 'minWordLen'),
    };
  }

  test('no MAX rung above 8 says EASIER (a higher MAX allows longer words, which is harder)', async () => {
    const { max } = await rows();
    const above = max.values.filter((v) => v > 8);
    assert.ok(above.includes(24) && above.length >= 10, 'the lever has real headroom above 8');
    for (const v of above) {
      const text = max.descriptor(v);
      assert.ok(!EASIER_WORDS.test(text.toUpperCase()), `MAX ${v}: "${text}" must not say easier`);
      assert.ok(HARDER_WORDS.test(text.toUpperCase()), `MAX ${v}: "${text}" should say it is harder`);
    }
  });

  test('MAX 24 — the WIZARD-equivalent top rung — reads as the HARDEST rung', async () => {
    const { max } = await rows();
    const text = max.descriptor(24).toUpperCase();
    assert.match(text, /HARDEST/, `MAX 24 says: "${text}"`);
    const real = max.values.filter((v) => v !== 0);
    for (const v of real) {
      if (v === 24) continue;
      assert.ok(claimedHardness(max.descriptor(v)) < claimedHardness(max.descriptor(24)),
        `MAX ${v} ("${max.descriptor(v)}") claims to be harder than or equal to MAX 24`);
    }
  });

  test('the MAX ladder climbs monotonically: a higher rung never claims to be easier than a lower one', async () => {
    const { max } = await rows();
    const ladder = max.values.filter((v) => v !== 0).sort((a, b) => a - b);
    let prev = -1;
    for (const v of ladder) {
      const h = claimedHardness(max.descriptor(v));
      assert.ok(h >= prev, `MAX ${v} ("${max.descriptor(v)}") fell below the rung beneath it`);
      prev = h;
    }
  });

  test('the low MAX rungs ARE the easy ones (a short cap makes play easier — that direction was always right)', async () => {
    const { max } = await rows();
    for (const v of [4, 5]) {
      assert.match(max.descriptor(v).toUpperCase(), EASIER_WORDS, `MAX ${v}`);
    }
  });

  test('no MIN rung says EASIER (a higher MIN demands longer words, which is harder)', async () => {
    const { min } = await rows();
    for (const v of min.values.filter((x) => x !== 0)) {
      const text = min.descriptor(v).toUpperCase();
      assert.ok(!EASIER_WORDS.test(text), `MIN ${v}: "${text}"`);
      assert.ok(HARDER_WORDS.test(text), `MIN ${v}: "${text}" should say it is harder`);
    }
  });

  test('the MIN ladder climbs monotonically too', async () => {
    const { min } = await rows();
    const ladder = min.values.filter((v) => v !== 0).sort((a, b) => a - b);
    let prev = -1;
    for (const v of ladder) {
      const h = claimedHardness(min.descriptor(v));
      assert.ok(h >= prev, `MIN ${v} ("${min.descriptor(v)}") fell below the rung beneath it`);
      prev = h;
    }
  });

  test('ANY (the default on both rows) names itself and claims no difficulty', async () => {
    const { min, max } = await rows();
    for (const row of [min, max]) {
      const text = row.descriptor(0).toUpperCase();
      assert.match(text, /ANY/, text);
      assert.ok(!HARDER_WORDS.test(text) && !EASIER_WORDS.test(text), `"${text}" claims no direction`);
    }
  });
});
