// Enforces: INV-84 — STRATEGY.md §5 "Act 7 — THE SPEEDWAY";
// docs/specs/act7-speed-racing.md §5.5 (the TrackRecord / Ghost storage format)
// and §6 (the safety table's "`kk-slots` schema change" row);
// .claude/rules/security.md rule 4 ("localStorage is untrusted input... parse
// inside try/catch, validate shape, tolerate garbage"), rule 6 (nothing leaves
// the machine) and rule 8 (the PII floor — the only personal datum the game
// stores is the display name).
//
// The design source is the SPEC, not the code: the spec states the shape
// (`{ v, last, best, laps, chars, cleanBest }`, `Ghost = { ms, splits[64],
// keys, acc, at }`, "splits ... non-decreasing"), the caps ("a hard cap of 2
// ghosts/track and 64 splits is enforced on write"), and the required
// degradation ("A malformed ghost reads as **no ghost** and the track plays
// normally"). Every expected value below is read off those clauses — never
// copied out of js/slots.js (STRATEGY.md §2).
//
// WHY UNIT: ghost persistence is pure data/logic over localStorage — exactly
// what tests/helpers/stubs.mjs covers. The player-visible consequence of a
// corrupt ghost ("the track still plays") is proven separately at L2 in
// tests/integration/speedway.test.mjs.

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { installLocalStorageStub, resetStubs } from '../helpers/stubs.mjs';
import * as Slots from '../../js/slots.js';

const SLOTS_KEY = 'kk-slots';

// From the spec, §5.5: "splits: [<int> × 64]". Not read from the engine.
const DOC_SPLIT_COUNT = 64;
// From the spec, §5.5: the TrackRecord's documented field set, and the Ghost's.
const DOC_RECORD_FIELDS = ['v', 'last', 'best', 'laps', 'chars', 'cleanBest'];
const DOC_GHOST_FIELDS = ['ms', 'splits', 'keys', 'acc', 'at'];

function goodSplits(scale = 10) {
  return Array.from({ length: DOC_SPLIT_COUNT }, (_, i) => i * scale);
}

function goodGhost(over = {}) {
  return { ms: 63 * 10, splits: goodSplits(), keys: 120, acc: 91, at: 1_700_000_000_000, ...over };
}

function goodRecord(over = {}) {
  return { last: goodGhost(), best: { ms: 600, at: 1_700_000_000_000 }, laps: 1, chars: 120, cleanBest: 40, ...over };
}

function rawSlots() {
  return JSON.parse(globalThis.localStorage.getItem(SLOTS_KEY));
}

beforeEach(() => { installLocalStorageStub(); });
afterEach(() => { resetStubs(); });

describe('INV-84 — the ghost store is the ACTIVE SLOT (spec §6: "provided `speedway` lives *inside* the slot and not in a new namespace")', () => {
  test('a completed lap round-trips inside kk-slots — no new localStorage namespace is created', () => {
    Slots.createSlot('OONA');
    Slots.writeSpeedway('monaco', goodRecord());

    const back = Slots.readSpeedway('monaco');
    assert.ok(back, 'a well-formed record reads back');
    assert.equal(back.laps, 1);
    assert.equal(back.chars, 120);
    assert.equal(back.cleanBest, 40);
    assert.equal(back.last.ms, 630);
    assert.equal(back.last.splits.length, DOC_SPLIT_COUNT);

    // Only kk-slots exists — ghosts never get their own key (spec §6).
    const keys = [];
    for (let i = 0; i < globalThis.localStorage.length; i++) keys.push(globalThis.localStorage.key(i));
    assert.deepEqual(keys, [SLOTS_KEY], `ghosts must live inside kk-slots; found ${keys.join(', ')}`);
    assert.ok(rawSlots().slots[0].speedway.monaco, 'the record sits inside the slot object itself');
  });

  test('"no ghost" is the reading for an untouched track, an unknown track, and a nonsense id — never a throw', () => {
    Slots.createSlot('OONA');
    assert.equal(Slots.readSpeedway('monaco'), null, 'a track never raced has no record');
    assert.equal(Slots.readSpeedway('a track id with spaces'), null);
    assert.equal(Slots.readSpeedway(''), null);
    assert.equal(Slots.readSpeedway(null), null);
    assert.equal(Slots.readSpeedway(undefined), null);
    assert.equal(Slots.readSpeedway({}), null);
  });

  test('writing with no active saved game is a silent no-op (spec: "the race still runs, it just doesn\'t persist")', () => {
    assert.doesNotThrow(() => Slots.writeSpeedway('monaco', goodRecord()));
    assert.equal(Slots.readSpeedway('monaco'), null);
  });
});

describe('INV-84 — a malformed ghost reads as NO GHOST, and never as an exception (security.md rule 4)', () => {
  const MALFORMED_GHOSTS = {
    'splits table one short': goodGhost({ splits: goodSplits().slice(1) }),
    'splits table one long': goodGhost({ splits: [...goodSplits(), 999] }),
    'splits not an array': goodGhost({ splits: 'nope' }),
    'a NaN split': goodGhost({ splits: goodSplits().map((v, i) => (i === 7 ? NaN : v)) }),
    'a negative split': goodGhost({ splits: goodSplits().map((v, i) => (i === 7 ? -5 : v)) }),
    'a string split': goodGhost({ splits: goodSplits().map((v, i) => (i === 7 ? '12' : v)) }),
    'an absurd lap time': goodGhost({ ms: Number.MAX_SAFE_INTEGER }),
    'a negative lap time': goodGhost({ ms: -1 }),
    'a missing lap time': (() => { const g = goodGhost(); delete g.ms; return g; })(),
    'an impossible accuracy': goodGhost({ acc: 101 }),
    'a hostile string where a number belongs': goodGhost({ keys: '<script>alert(1)</script>' }),
    'not an object at all': 'ghost',
    'an array': [1, 2, 3],
  };

  for (const [label, ghost] of Object.entries(MALFORMED_GHOSTS)) {
    test(`${label} → the track has no ghost, and nothing throws`, () => {
      Slots.createSlot('OONA');
      assert.doesNotThrow(() => Slots.writeSpeedway('monaco', { ...goodRecord(), last: ghost }));
      const back = Slots.readSpeedway('monaco');
      assert.equal(back && back.last, null, 'a malformed ghost degrades to "no ghost"');
    });
  }

  test('a malformed ghost never takes the player\'s counters down with it', () => {
    Slots.createSlot('OONA');
    Slots.writeSpeedway('monaco', { laps: 9, chars: 4321, cleanBest: 77, last: { splits: 'garbage' } });
    const back = Slots.readSpeedway('monaco');
    assert.equal(back.laps, 9, 'LAPS survives a bad ghost');
    assert.equal(back.chars, 4321, 'ODOMETER survives a bad ghost');
    assert.equal(back.cleanBest, 77, 'CLEAN RUN best survives a bad ghost');
  });

  test('splits always read back non-decreasing, as the replay contract requires (spec §5.5 "non-decreasing")', () => {
    Slots.createSlot('OONA');
    const jumbled = goodSplits();
    jumbled[10] = 5;      // a split that goes BACKWARDS in time
    jumbled[20] = 1;
    Slots.writeSpeedway('monaco', goodRecord({ last: goodGhost({ splits: jumbled }) }));
    const back = Slots.readSpeedway('monaco');
    if (back.last) {
      const s = back.last.splits;
      assert.equal(s.length, DOC_SPLIT_COUNT);
      for (let i = 1; i < s.length; i++) {
        assert.ok(s[i] >= s[i - 1], `split ${i} (${s[i]}) went backwards from ${s[i - 1]}`);
        assert.ok(Number.isInteger(s[i]), `split ${i} is not an integer`);
      }
    }
    // (A rejected ghost — `last === null` — is an equally valid reading of the
    // clause: "a malformed ghost reads as no ghost". Either way, never garbage.)
  });
});

describe('INV-84 — a corrupted store degrades to "no ghost" and never bricks the picker (security.md rule 4)', () => {
  const CORRUPT = {
    'non-JSON garbage': '{not json at all',
    'speedway is a string': JSON.stringify({ v: 1, active: 0, slots: [{ name: 'OONA', speedway: 'ghosts!' }] }),
    'speedway is an array': JSON.stringify({ v: 1, active: 0, slots: [{ name: 'OONA', speedway: [1, 2] }] }),
    'speedway is null': JSON.stringify({ v: 1, active: 0, slots: [{ name: 'OONA', speedway: null }] }),
    'a record with an unknown schema version': JSON.stringify({
      v: 1, active: 0, slots: [{ name: 'OONA', speedway: { monaco: { v: 99, laps: 3, last: null, best: null } } }],
    }),
    'a record that is a string': JSON.stringify({ v: 1, active: 0, slots: [{ name: 'OONA', speedway: { monaco: 'fast' } }] }),
    'a track id that is not an id': JSON.stringify({
      v: 1, active: 0, slots: [{ name: 'OONA', speedway: { '../../etc/passwd': { laps: 1 } } }],
    }),
  };

  for (const [label, raw] of Object.entries(CORRUPT)) {
    test(`${label} → readSpeedway returns null, listSlots still works, nothing throws`, () => {
      const store = installLocalStorageStub();
      store.set(SLOTS_KEY, raw);
      assert.doesNotThrow(() => Slots.listSlots());
      assert.doesNotThrow(() => Slots.readSpeedway('monaco'));
      assert.equal(Slots.readSpeedway('monaco'), null);
      assert.equal(Slots.readSpeedway('../../etc/passwd'), null);
    });
  }

  test('a corrupt ghost never prevents a NEW lap from being recorded (the track stays playable)', () => {
    const store = installLocalStorageStub();
    store.set(SLOTS_KEY, JSON.stringify({ v: 1, active: 0, slots: [{ name: 'OONA', speedway: { monaco: 'fast' } }] }));
    Slots.writeSpeedway('monaco', goodRecord());
    const back = Slots.readSpeedway('monaco');
    assert.ok(back && back.last, 'a fresh, valid lap is stored over the corruption');
    assert.equal(back.last.splits.length, DOC_SPLIT_COUNT);
  });
});

describe('INV-84 — bounded by construction (spec §5.5: "a hard cap of 2 ghosts/track and 64 splits is enforced on write")', () => {
  test('a track record carries at most the two documented ghosts, and no other payload', () => {
    Slots.createSlot('OONA');
    Slots.writeSpeedway('monaco', {
      ...goodRecord(),
      // A third "ghost" and assorted junk a future change might try to stash.
      allTime: goodGhost(),
      replay: Array.from({ length: 5000 }, (_, i) => i),
      note: 'x'.repeat(10_000),
    });
    const stored = rawSlots().slots[0].speedway.monaco;
    const extra = Object.keys(stored).filter(k => !DOC_RECORD_FIELDS.includes(k));
    assert.deepEqual(extra, [], `a TrackRecord stores only ${DOC_RECORD_FIELDS.join('/')}; found extra ${extra.join(', ')}`);
    const ghostKeys = DOC_RECORD_FIELDS.filter(k => stored[k] && typeof stored[k] === 'object');
    assert.ok(ghostKeys.length <= 2, `at most 2 ghosts per track; found ${ghostKeys.join(', ')}`);
  });

  test('an oversized split table is never stored (exactly 64 or no ghost)', () => {
    Slots.createSlot('OONA');
    Slots.writeSpeedway('monaco', goodRecord({
      last: goodGhost({ splits: Array.from({ length: 5000 }, (_, i) => i) }),
    }));
    const stored = rawSlots().slots[0].speedway.monaco;
    assert.ok(
      stored.last === null || stored.last.splits.length === DOC_SPLIT_COUNT,
      'a split table is exactly 64 entries, or the ghost is dropped entirely',
    );
  });

  test('the stored ghost carries only the documented gameplay fields — no PII sneaks in (security.md rule 8)', () => {
    Slots.createSlot('OONA');
    Slots.writeSpeedway('monaco', goodRecord({
      last: goodGhost({ playerName: 'OONA', age: 6, city: 'somewhere' }),
    }));
    const stored = rawSlots().slots[0].speedway.monaco;
    assert.ok(stored.last, 'the valid ghost was kept');
    const extra = Object.keys(stored.last).filter(k => !DOC_GHOST_FIELDS.includes(k));
    assert.deepEqual(extra, [], `a Ghost stores only ${DOC_GHOST_FIELDS.join('/')}; found ${extra.join(', ')}`);
    assert.ok(!JSON.stringify(rawSlots().slots[0].speedway).includes('OONA'), 'no name is ever written into a ghost');
  });
});

describe('INV-84 — erase covers ghosts, and one game\'s ghosts never touch another\'s (INV-59/61 extended to Act 7)', () => {
  test('erasing a saved game erases its ghosts', () => {
    Slots.createSlot('OONA');
    Slots.writeSpeedway('monaco', goodRecord());
    assert.ok(Slots.readSpeedway('monaco'));
    Slots.eraseActiveSlot();
    assert.equal(Slots.readSpeedway('monaco'), null, 'an erased game has no ghosts left to race');
    assert.ok(!JSON.stringify(rawSlots()).includes('splits'), 'no ghost data survives the erase');
  });

  test('the factory reset (ERASE ALL) removes every ghost with the games', () => {
    Slots.createSlot('OONA');
    Slots.writeSpeedway('monaco', goodRecord());
    Slots.eraseAll();
    assert.equal(globalThis.localStorage.getItem(SLOTS_KEY), null);
    assert.equal(Slots.readSpeedway('monaco'), null);
  });

  test('two saved games keep separate ghosts on the same track', () => {
    const oona = Slots.createSlot('OONA');
    Slots.writeSpeedway('monaco', goodRecord({ laps: 3, chars: 300 }));
    const dad = Slots.createSlot('DAD');
    Slots.writeSpeedway('monaco', goodRecord({ laps: 1, chars: 100 }));

    assert.equal(Slots.readSpeedway('monaco').laps, 1, 'the active game reads its OWN record');
    Slots.setActive(oona);
    assert.equal(Slots.readSpeedway('monaco').laps, 3, 'the other game is untouched');
    Slots.setActive(dad);

    // And erasing one leaves the other's ghosts intact.
    Slots.eraseSlot(dad);
    Slots.setActive(0);
    assert.equal(Slots.readSpeedway('monaco').laps, 3);
  });
});
