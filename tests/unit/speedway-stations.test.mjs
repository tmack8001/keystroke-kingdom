// Enforces: INV-85 — STRATEGY.md §5 "Act 7 — THE SPEEDWAY";
// docs/specs/act7-speed-racing.md §5.6 ("Making 'graphics climb with the era'
// enforceable" — layer (2), "the era ladder") and §5.6b (the track list);
// Trevor's locked decision #3 ("graphics must climb with the era");
// product.md §5 "Graphic Quality Grows With the Player".
//
// PURE DATA, BY DOCTRINE. The spec's §5.6 explicitly REJECTED the more direct
// proof — an automated distinct-colour histogram over each track's canvas —
// because `.claude/rules/testing.md` rule 4 forbids canvas pixel assertions,
// and that rule has not moved: *"I am not reinterpreting that rule to fit a
// feature. If Trevor wants pixel-level enforcement, the rule moves first, with
// his sign-off, and then the test — in that order."* So this file asserts the
// DECLARED ladder only. Nothing here reads a pixel, a colour, or a coordinate.
//
// Every expected value comes from the spec's own tables (the tier enum in
// §5.6's primitive table; the year/tier/variant rows in §5.6b), never from
// js/speedway/stations.js itself (STRATEGY.md §2).
//
// PENDING: the era track ROWS are built by a sibling lane (as js/speedway/stations.js
// or as one module per track under js/speedway/tracks/ — this file finds either).
// Until they land, each ladder test marks itself todo with the precise thing it is
// waiting for, deliberately NOT weakened into something that would pass vacuously.
// The RENDER-KIT half of INV-85 runs for real today.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const STATIONS_PATH = join(REPO_ROOT, 'js', 'speedway', 'stations.js');
const KIT_PATH = join(REPO_ROOT, 'js', 'speedway', 'render', 'kit.js');
const TRACKS_DIR = join(REPO_ROOT, 'js', 'speedway', 'tracks');

// The tier enum, transcribed from the spec §5.6 primitive table (left column).
const DOC_TIERS = ['ttl', 'scaler', '8bit', 'mode7', 'flatpoly', 'texpoly', 'ps1', 'modern'];
// The spec's locked pair (§5.6b rows 7 and 8; Trevor's locked decision #2).
const DOC_LOCKED_TIERS = [
  { matches: /virtua/i, tier: 'flatpoly' },
  { matches: /daytona/i, tier: 'texpoly' },
];
// Primitives the spec says a tier does NOT possess (§5.6 table).
const DOC_ABSENT_PRIMITIVES = {
  ttl: ['gradient', 'createLinearGradient', 'alpha', 'curve', 'texturedPoly', 'bloom', 'particles'],
  flatpoly: ['texturedPoly', 'bilinear', 'gouraud'],
};

async function tryImport(path) {
  try { return await import(path); } catch { return null; }
}

// Discover the declared track table STRUCTURALLY rather than by guessing an
// export name or a file: the spec fixes the ROW SHAPE ("stations.js rows each
// declare { year, renderTier, variant, eraRank, ... }"; hub.js's own header
// repeats it as the track-module contract) but not the array's name — and the
// lane may ship rows as one `stations.js` table or as one module per track under
// `js/speedway/tracks/`. Both are the same declaration, and a move between them
// is exactly the kind of pure refactor a test must survive.
function isStationRow(r) {
  return r && typeof r === 'object' && !Array.isArray(r)
    && 'year' in r && tierOf(r) !== undefined;
}
function rowsFromModule(mod) {
  const out = [];
  for (const value of Object.values(mod || {})) {
    if (Array.isArray(value) && value.length && value.every(isStationRow)) out.push(...value);
    else if (isStationRow(value)) out.push(value);
  }
  return out;
}

// The spec writes `renderTier`; the acceptance criteria abbreviate it to `tier`.
// Read either — the clause is about the declaration, not its spelling.
function tierOf(row) { return row.renderTier !== undefined ? row.renderTier : row.tier; }
function labelOf(row, i) { return String(row.id || row.name || row.title || `track ${i}`); }

async function discoverStations() {
  const rows = [];
  const stationsMod = await tryImport(STATIONS_PATH);
  if (stationsMod) rows.push(...rowsFromModule(stationsMod));
  if (!rows.length) {
    let files = [];
    try {
      const { readdir } = await import('node:fs/promises');
      files = (await readdir(TRACKS_DIR)).filter((f) => f.endsWith('.js'));
    } catch { files = []; }
    for (const f of files) rows.push(...rowsFromModule(await tryImport(join(TRACKS_DIR, f))));
  }
  // De-duplicate by id: a row re-exported from two places is one track.
  const seen = new Set();
  return rows.filter((r) => {
    const k = r.id || JSON.stringify([r.year, tierOf(r), r.variant]);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const STATIONS = (await discoverStations());
const PENDING = STATIONS.length
  ? null
  : 'no Act 7 track rows are declared yet — neither js/speedway/stations.js nor any '
    + 'module under js/speedway/tracks/ exports a row carrying { year, renderTier|tier } (sibling lane)';

function pend(t) {
  if (PENDING) { t.todo(`pending Act 7 build: ${PENDING}`); return true; }
  return false;
}

describe('INV-85 — every registered track DECLARES its place on the era ladder (spec §5.6 layer 2)', () => {
  test('each track declares a tier from the documented enum, a variant, and an authored eraRank', (t) => {
    if (pend(t)) return;
    STATIONS.forEach((row, i) => {
      const where = labelOf(row, i);
      assert.ok(DOC_TIERS.includes(tierOf(row)),
        `${where}: tier "${tierOf(row)}" is not one of the documented tiers ${DOC_TIERS.join('/')}`);
      assert.equal(typeof row.variant, 'string', `${where}: must declare a variant (spec §5.6)`);
      assert.ok(row.variant.trim().length > 0, `${where}: variant must not be empty`);
      assert.ok(Number.isFinite(row.eraRank), `${where}: eraRank must be an authored number`);
      assert.ok(Number.isFinite(row.year), `${where}: year must be a number`);
    });
  });

  test('every track has a distinct id (the hub lists rows, and a ghost is keyed by one)', (t) => {
    if (pend(t)) return;
    const ids = STATIONS.map((r, i) => r.id ?? `#${i}`);
    assert.equal(new Set(ids).size, ids.length, `duplicate track ids: ${ids.join(', ')}`);
  });
});

describe('INV-85 — "eraRank is non-decreasing when tracks are ordered by year" (spec §5.6 layer 2, bullet 2)', () => {
  test('the graphics ladder never steps backwards as the years advance', (t) => {
    if (pend(t)) return;
    const byYear = [...STATIONS].sort((a, b) => a.year - b.year);
    for (let i = 1; i < byYear.length; i++) {
      const prev = byYear[i - 1];
      const cur = byYear[i];
      assert.ok(cur.eraRank >= prev.eraRank,
        `${labelOf(cur, i)} (${cur.year}, eraRank ${cur.eraRank}) is a GRAPHICS REGRESSION from `
        + `${labelOf(prev, i - 1)} (${prev.year}, eraRank ${prev.eraRank}) — decision #3 says graphics climb with the era`);
    }
  });
});

describe('INV-85 — "no two tracks share an identical (tier, variant) pair" (spec §5.6 layer 2, bullet 3)', () => {
  test('two tracks on the same tier must declare distinct variants (F-Zero vs Super Mario Kart; Pole Position vs Hang-On)', (t) => {
    if (pend(t)) return;
    const seen = new Map();
    STATIONS.forEach((row, i) => {
      const key = `${tierOf(row)}|${row.variant}`;
      const clash = seen.get(key);
      assert.equal(clash, undefined,
        `${labelOf(row, i)} and ${clash} both declare (${tierOf(row)}, ${row.variant}) — `
        + 'the era arc compresses the moment two tracks render identically');
      seen.set(key, labelOf(row, i));
    });
  });
});

describe('INV-85 — the arc spans the full range, and the locked pair carries its locked tiers', () => {
  test('the earliest track by year is `ttl` — the act opens in the discrete-logic era', (t) => {
    if (pend(t)) return;
    const byYear = [...STATIONS].sort((a, b) => a.year - b.year);
    assert.equal(tierOf(byYear[0]), 'ttl',
      `the act opens on the discrete-logic era: ${labelOf(byYear[0], 0)} (${byYear[0].year}) `
      + `declares "${tierOf(byYear[0])}"`);
  });

  test('the latest track by year is `modern` — the arc spans the full range', (t) => {
    if (pend(t)) return;
    // The spec's §9 phases the wing deliberately ("Act 7 may live at 3 or 5 tracks
    // for a long time. That is fine"), and the `modern` tier arrives with the
    // modern-F1 renderer. While NO track declares `modern` there is no arc endpoint
    // to check yet; the instant one exists this becomes a hard assertion that it is
    // the LAST one by year. Pending, never weakened — a `modern` track that is not
    // the latest fails here.
    const hasModern = STATIONS.some((r) => tierOf(r) === 'modern');
    if (!hasModern) {
      t.todo('pending Act 7 build: no `modern`-tier track is registered yet (spec §9 Phase 1\'s third spine track)');
      return;
    }
    const byYear = [...STATIONS].sort((a, b) => a.year - b.year);
    const last = byYear[byYear.length - 1];
    assert.equal(tierOf(last), 'modern',
      `the act ends on the modern era: ${labelOf(last, 0)} (${last.year}) declares "${tierOf(last)}"`);
  });

  test('Virtua Racing declares `flatpoly` and Daytona USA declares `texpoly` (Trevor\'s locked decision #2)', (t) => {
    if (pend(t)) return;
    let checked = 0;
    for (const { matches, tier } of DOC_LOCKED_TIERS) {
      STATIONS.forEach((row, i) => {
        const label = labelOf(row, i);
        if (!matches.test(label)) return;
        checked++;
        assert.equal(tierOf(row), tier,
          `${label} must declare "${tier}" — the flat-shaded → texture-filtered step IS the content of those two tracks`);
      });
    }
    if (checked === 0) {
      t.diagnostic('neither locked-pair track is registered yet (spec §9 Phase 2) — nothing to check');
    }
  });
});

describe('INV-85 — the era-scoped render kit cannot hand a track a primitive its era never had (spec §5.6 layer 1)', () => {
  // Straight from the spec's §5.6 primitive table. Each row asserts BOTH a
  // primitive the tier possesses and one it does not, so the check discriminates
  // rather than passing vacuously on a typo'd name.
  const TIER_PRIMITIVES = {
    ttl:      { has: ['rect', 'hline', 'blit1bit'], hasNot: ['gradient', 'texturedPoly', 'scaleSprite', 'affinePlane'] },
    scaler:   { has: ['scaleSprite', 'horizonShift'], hasNot: ['gradient', 'texturedPoly', 'flatPoly'] },
    mode7:    { has: ['affinePlane', 'billboard'], hasNot: ['gradient', 'texturedPoly', 'flatPoly'] },
    flatpoly: { has: ['flatPoly', 'painterSort'], hasNot: ['texturedPoly', 'gouraud', 'bilinear', 'gradient'] },
    texpoly:  { has: ['texturedPoly', 'gouraud', 'bilinear'], hasNot: ['gradient', 'bloom', 'particles'] },
    ps1:      { has: ['modelledMesh'], hasNot: ['gradient', 'bloom', 'particles'] },
    modern:   { has: ['gradient', 'bloom', 'particles'], hasNot: [] },
  };

  test('a `ttl` kit has no gradient, and a `flatpoly` kit has no texturedPoly — while `texpoly` does', async (t) => {
    const kitMod = await tryImport(KIT_PATH);
    if (!kitMod) {
      t.todo('pending Act 7 build: js/speedway/render/kit.js is not built yet (sibling lane)');
      return;
    }
    // The spec writes the factory `kit.for(station)`; `for` is a reserved word, so
    // accept the spellings a real module can use, and either argument shape.
    const factory = kitMod.kitFor || kitMod.for || kitMod.forStation
      || (kitMod.default && (kitMod.default.for || kitMod.default.kitFor));
    if (typeof factory !== 'function') {
      t.todo('pending Act 7 build: js/speedway/render/kit.js exports no era-kit factory to inspect');
      return;
    }
    const build = (tier) => {
      try { return factory(tier); } catch { return factory({ renderTier: tier, tier, variant: 'probe', year: 1979, eraRank: 0 }); }
    };

    for (const [tier, spec] of Object.entries(TIER_PRIMITIVES)) {
      const kit = build(tier);
      assert.ok(kit && typeof kit === 'object', `the kit factory returns a primitive set for tier "${tier}"`);
      const owns = typeof kit.has === 'function'
        ? (name) => kit.has(name)
        : (name) => typeof kit[name] === 'function';
      for (const name of spec.has) {
        assert.equal(owns(name), true, `the ${tier} kit must expose "${name}" — its era had it`);
      }
      for (const name of spec.hasNot) {
        assert.equal(owns(name), false,
          `the ${tier} kit must NOT expose "${name}" — that era did not have it (spec §5.6: `
          + '"A 1979 renderer cannot draw a gradient, because the 1979 kit has no gradient")');
      }
    }
  });

  test('the ladder only ever ADDS: a later tier keeps every earlier tier\'s primitives', async (t) => {
    const kitMod = await tryImport(KIT_PATH);
    const factory = kitMod && (kitMod.kitFor || kitMod.for || kitMod.forStation);
    if (typeof factory !== 'function') {
      t.todo('pending Act 7 build: js/speedway/render/kit.js exports no era-kit factory to inspect');
      return;
    }
    // DOC_TIERS is the spec's own enum, in its own (chronological) order.
    const build = (tier) => {
      try { return factory(tier); } catch { return factory({ renderTier: tier, tier, variant: 'probe', year: 1979, eraRank: 0 }); }
    };
    const earlier = [];
    for (const tier of DOC_TIERS) {
      const kit = build(tier);
      if (typeof kit.has !== 'function') {
        t.todo('pending Act 7 build: the era kit exposes no has(name) introspection');
        return;
      }
      for (const { tier: prevTier, names } of earlier) {
        for (const name of names) {
          assert.equal(kit.has(name), true,
            `the ${tier} kit lost "${name}", which ${prevTier} had — the graphics ladder only ever climbs`);
        }
      }
      const owned = Object.values(TIER_PRIMITIVES).flatMap((s) => s.has).filter((n) => kit.has(n));
      earlier.push({ tier, names: owned });
    }
  });
});
