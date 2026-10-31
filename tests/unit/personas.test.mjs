// Enforces: .claude/rules/playtest.md §Personas — a persona is REPRODUCIBLE (same id +
//   same --seed ⇒ the same settings, the same seeded save, the same typing decisions)
//   and its report must name persona + seed so a finding can be replayed.
// Enforces: product.md §Toggleable Settings + §Core Principles 1 — Survival is opt-in
//   only, never the default; a persona opts in only by being asked for by name
//   (`speedrunner:survival`).
// Enforces: security.md rule 8 (the PII floor) — nothing a persona writes to the
//   game's storage carries an age or any other personal datum beyond a display name;
//   product.md §Toggleable Settings: EXPERIENCE is "to a player's typing experience
//   (never age)".
// Enforces: CLAUDE.md §Wrong Keypress Behavior — the harness's injected "wrong" key is
//   genuinely wrong, or its One Rule check would be checking nothing.
//
// Unit layer only: public exports of scripts/personas.mjs, js/settings.js, js/slots.js
// and js/history-cards.js + the localStorage stub from tests/helpers/stubs.mjs. The
// persona module is test tooling, not game code; these tests assert that the tool's
// DATA is something the real game accepts, through the game's own public API.

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { installLocalStorageStub, resetStubs } from '../helpers/stubs.mjs';
import {
  listPersonas, allPersonaSpecs, resolvePersona, createBehavior, wrongKeyFor,
  describeDecision, mulberry32, DEFAULT_SEED,
} from '../../scripts/personas.mjs';
import * as Slots from '../../js/slots.js';
import { cardById } from '../../js/history-cards.js';

afterEach(() => resetStubs());

let importCounter = 0;
// Fresh js/settings.js per case (it caches the loaded settings at module level), via a
// cache-busting specifier — the module's real load path, no internals touched.
async function freshSettingsModule() {
  importCounter += 1;
  return import(`../../js/settings.js?persona=${importCounter}`);
}

const SPECS = allPersonaSpecs();

describe('personas — identity', () => {
  test('ids are unique and every spec resolves', () => {
    const ids = listPersonas().map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length, `duplicate persona id in ${ids.join(', ')}`);
    assert.equal(new Set(SPECS).size, SPECS.length);
    for (const spec of SPECS) assert.equal(resolvePersona(spec).spec, spec);
  });

  test('the five personas the 2026-10 sessions used all exist', () => {
    for (const id of ['first-timer', 'struggling-beginner', 'family-parent', 'speedrunner', 'explorer']) {
      assert.ok(SPECS.includes(id), `missing persona ${id}`);
    }
  });

  test('an unknown persona or variant is refused, never silently defaulted', () => {
    assert.throws(() => resolvePersona('nobody'));
    assert.throws(() => resolvePersona('speedrunner:nope'));
    assert.throws(() => resolvePersona('speedrunner:survival:extra'));
  });
});

describe('personas — settings are values the game accepts UNCHANGED', () => {
  for (const spec of SPECS) {
    test(`${spec}: every setting survives js/settings.js sanitize untouched`, async () => {
      const persona = resolvePersona(spec);
      // The real kk-settings key set is whatever a fresh, empty load produces.
      installLocalStorageStub({});
      const realKeys = Object.keys((await freshSettingsModule()).loadSettings());
      resetStubs();

      installLocalStorageStub({ 'kk-settings': JSON.stringify(persona.settings) });
      const { loadSettings } = await freshSettingsModule();
      const loaded = loadSettings();
      for (const [k, v] of Object.entries(persona.settings)) {
        assert.ok(realKeys.includes(k), `${spec}: "${k}" is not a kk-settings key`);
        assert.deepEqual(loaded[k], v, `${spec}: ${k}=${JSON.stringify(v)} was coerced to ${JSON.stringify(loaded[k])}`);
      }
    });
  }
});

describe('personas — Survival is opt-in, by name only', () => {
  test('every base persona plays ADVENTURE, explicitly', () => {
    for (const p of listPersonas()) {
      assert.equal(resolvePersona(p.id).settings.playStyle, 'adventure', `${p.id} must not default to survival`);
    }
  });

  test('the only survival configuration is speedrunner:survival', () => {
    const survival = SPECS.filter((s) => resolvePersona(s).settings.playStyle === 'survival');
    assert.deepEqual(survival, ['speedrunner:survival']);
  });

  test('a survival persona never claims idle is free — time pressure is the one cost Survival has', () => {
    for (const s of SPECS) {
      const p = resolvePersona(s);
      if (p.settings.playStyle === 'survival') assert.equal(p.acceptance.idleNeverPunishes, false);
      assert.equal(p.acceptance.wrongKeyNeverAdvances, true, `${s}: the wrong-key contract holds in every mode`);
    }
  });
});

describe('personas — the PII floor', () => {
  const PII = /age|birth|dob|grade|school|surname|lastname|location|address|email|phone|city/i;
  const keysDeep = (o, out = []) => {
    if (o && typeof o === 'object') {
      for (const [k, v] of Object.entries(o)) { out.push(k); keysDeep(v, out); }
    }
    return out;
  };

  test('nothing a persona writes to storage (settings + seed) carries a personal-data field', () => {
    for (const s of SPECS) {
      const p = resolvePersona(s);
      const written = keysDeep({ settings: p.settings, seed: p.seed, playerName: p.playerName });
      const hits = written.filter((k) => PII.test(k) && !/^(storyRotation|cardRotation)$/.test(k));
      assert.deepEqual(hits, [], `${s} writes a PII-shaped field: ${hits.join(', ')}`);
    }
  });

  // A persona's NAME never implies an age either (Trevor, 2026-10-30: `explorer-8yo` was
  // renamed `explorer`). An age-shaped token is "8yo", "8 y/o", "8-year", "age", or a
  // bare 1–2 digit number standing as its own word ("explorer-8", "age 8"). A digit
  // glued to a letter ("D2", the speedrunner variant's label) is an index, not an age.
  const AGE_SHAPED = [
    /\d+\s*-?\s*(yo|y\/o|yrs?|years?)\b/i,
    /\bages?\b/i,
    /(^|[\s\-_:(])\d{1,2}(?=$|[\s\-_:)])/,
  ];
  const ageHit = (s) => AGE_SHAPED.some((re) => re.test(String(s)));

  test('the age matcher itself catches the shapes it exists for (and not an index like D2)', () => {
    for (const bad of ['explorer-8yo', 'explorer 8 y/o', 'a 5-year-old', 'explorer-8', 'age 8', 'kid (7)']) {
      assert.ok(ageHit(bad), `matcher missed "${bad}"`);
    }
    for (const ok of ['explorer', 'D2 — the speedrunner, SURVIVAL', 'speedrunner:survival', 'first-timer']) {
      assert.ok(!ageHit(ok), `matcher over-blocks "${ok}"`);
    }
  });

  test('no persona id or label contains an age', () => {
    for (const s of SPECS) {
      const p = resolvePersona(s);
      for (const [what, v] of [['spec', s], ['id', p.id], ['label', p.label]]) {
        assert.ok(!ageHit(v), `${s}: persona ${what} "${v}" carries an age-shaped token`);
      }
    }
    for (const p of listPersonas()) {
      assert.ok(!ageHit(p.id), `persona id "${p.id}" carries an age-shaped token`);
      assert.ok(!ageHit(p.label), `persona label "${p.label}" carries an age-shaped token`);
      // `who` is prose for the human reader and legitimately says "~10 WPM"; it is held
      // only to the explicit "N-year-old / Nyo" shape.
      assert.ok(!AGE_SHAPED[0].test(p.who || ''), `persona "${p.id}" describes an age in \`who\``);
    }
  });

  test('a seeded game holds only the fields js/slots.js already stores (display name is the only personal datum)', () => {
    const ALLOWED = ['name', 'furthestLevel', 'completed', 'nameMoment', 'textWorlds', 'cards',
      'cardRotation', 'storyRotation', 'speedway'];
    for (const p of listPersonas()) {
      if (p.seed.kind !== 'slots') continue;
      for (const g of p.seed.slots) {
        for (const k of Object.keys(g)) assert.ok(ALLOWED.includes(k), `${p.id}: seeded game has unexpected field "${k}"`);
      }
    }
  });
});

describe('personas — a seeded save is one the game reads back as written', () => {
  for (const p of listPersonas().filter((x) => x.seed.kind === 'slots')) {
    test(`${p.id}: kk-slots seed survives js/slots.js normalization`, () => {
      const store = installLocalStorageStub({
        'kk-slots': JSON.stringify({ v: 1, active: null, slots: p.seed.slots }),
      });
      const listed = Slots.listSlots();
      assert.equal(listed.length, p.seed.slots.length, 'a seeded game was dropped as malformed');
      p.seed.slots.forEach((g, i) => {
        assert.equal(listed[i].name, g.name);
        assert.equal(listed[i].furthestLevel, g.furthestLevel);
        Slots.setActive(i);
        assert.deepEqual(Slots.getProgress().completed, g.completed);
        assert.deepEqual(Slots.collectedIds(), g.cards);
        for (const id of g.cards) assert.ok(cardById(id), `${p.id}: "${id}" is not a real history-card id`);
      });
      assert.ok(Number.isInteger(p.seed.resume) && p.seed.resume >= 0 && p.seed.resume < p.seed.slots.length);
      assert.ok(store.has('kk-slots'));
    });
  }
});

describe('personas — reproducible by seed', () => {
  const trace = (spec, seed, n = 300) => {
    const b = createBehavior(resolvePersona(spec), seed);
    return Array.from({ length: n }, () => describeDecision(b.next()));
  };

  test('the same persona + seed yields the same decision stream, every time', () => {
    for (const s of SPECS) assert.deepEqual(trace(s, 7), trace(s, 7), `${s} is not reproducible`);
    for (const s of SPECS) assert.deepEqual(trace(s, DEFAULT_SEED), trace(s, DEFAULT_SEED));
  });

  test('a different seed yields a different stream (the seed actually does something)', () => {
    for (const s of SPECS) assert.notDeepEqual(trace(s, 1), trace(s, 2), `${s} ignores its seed`);
  });

  test('two personas run with the same seed do not make the same decisions', () => {
    assert.notDeepEqual(trace('first-timer', 7), trace('explorer', 7));
  });

  test('the RNG is deterministic and stays in [0, 1)', () => {
    const a = mulberry32(42); const b = mulberry32(42);
    for (let i = 0; i < 1000; i += 1) {
      const x = a();
      assert.equal(x, b());
      assert.ok(x >= 0 && x < 1);
    }
  });

  test('decisions stay inside the persona\'s declared behaviour', () => {
    for (const s of SPECS) {
      const p = resolvePersona(s);
      const b = createBehavior(p, 11);
      let wrong = 0;
      const N = 2000;
      for (let i = 0; i < N; i += 1) {
        const d = b.next();
        assert.ok(d.pauseMs >= p.behavior.cadenceMs[0] && d.pauseMs <= p.behavior.cadenceMs[1]);
        for (const a of d.before) {
          if (a.type === 'wrong') {
            wrong += 1;
            assert.ok(a.run >= p.behavior.repeatWrongRun[0] && a.run <= p.behavior.repeatWrongRun[1]);
          }
          if (a.type === 'idle') assert.ok(p.behavior.idleChance > 0);
          if (a.type === 'mash') assert.ok(p.behavior.mashBurst);
          if (a.type === 'disrupt') assert.ok(p.behavior.disruptKeys.includes(a.key));
        }
      }
      // A loose band, not an exact rate (no implementation coupling): 2000 draws.
      const rate = wrong / N;
      assert.ok(Math.abs(rate - p.behavior.wrongKeyRate) < 0.05, `${s}: wrong-key rate ${rate} vs declared ${p.behavior.wrongKeyRate}`);
    }
  });
});

describe('personas — an injected wrong key is really wrong', () => {
  test('wrongKeyFor never returns the expected key, for any token the game can ask for', () => {
    const tokens = [...'abcdefghijklmnopqrstuvwxyz', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      ...';,./-=[]\\\'`0123456789', ' ', 'Backspace', 'Shift'];
    for (const t of tokens) {
      for (const style of ['adjacent', 'random']) {
        for (let i = 0; i < 50; i += 1) {
          const k = wrongKeyFor(t, i / 50, style);
          assert.match(k, /^[a-z]$/, `wrong key for ${JSON.stringify(t)} should be a plain lowercase letter, got ${JSON.stringify(k)}`);
          // The engine compares lowercase for every non-uppercase token, and requires an
          // exact uppercase key for an uppercase one — so a lowercase letter equal to the
          // token's lowercase would be accepted only when the token is not uppercase.
          if (!/^[A-Z]$/.test(t)) assert.notEqual(k, t.toLowerCase(), `wrong key for ${JSON.stringify(t)} was the right key`);
        }
      }
    }
  });
});
