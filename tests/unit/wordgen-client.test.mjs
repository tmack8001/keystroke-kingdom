// Enforces: INV-32 (client side) — security.md rules 6-7, js/wordgen.js design comments.
//
// js/wordgen.js augments (never replaces) the static word pools with locally
// generated words fetched from the game's OWN same-origin Go server. This file
// tests the client's half of the mandatory validation chain and the two
// documented external-failure classes:
//   A) wrong-charset words are dropped PER WORD, the rest of the batch survives
//      (takeWords' defense-in-depth re-validation — "we never trust even our
//      own server").
//   B) structurally bad responses (non-JSON, wrong shape, oversized) are
//      ignored WHOLE, never partially trusted (consumeBatch's structure guard).
// It also asserts the privacy contract (rule 6): requests carry only
// act/level/characters, same-origin relative paths, never the player name.
//
// Isolation: wordgen.js holds module-level session state (status/ready/fetching),
// so each scenario gets a fresh module instance via a cache-busting dynamic
// import, and installs its fetch stub BEFORE importing.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  installLocalStorageStub,
  installFetchStub,
  respondJson,
  resetStubs,
} from '../helpers/stubs.mjs';
// settings.js is a shared singleton (its module cache is NOT busted by the
// wordgen ?case= trick — a bare './settings.js' import resolves to one URL).
// The client reads word-length bounds through it, so tests seed localStorage
// then force a re-read via loadSettings() to defeat the cross-test cache.
import { loadSettings } from '../../js/settings.js';

let importCounter = 0;
async function freshWordgen() {
  importCounter += 1;
  return import(`../../js/wordgen.js?case=${importCounter}`);
}

// Guards every scenario against unhandled promise rejections — the module's
// entire design premise is "everything becomes a silent no-op" (file header),
// so a leaked rejection is itself an intent violation worth catching here.
function withRejectionGuard(fn) {
  return async (t) => {
    const rejections = [];
    const onRejection = (reason) => rejections.push(reason);
    process.on('unhandledRejection', onRejection);
    try {
      await fn(t);
    } finally {
      // Let any microtasks from fire-and-forget calls settle before checking.
      await new Promise((r) => setTimeout(r, 20));
      process.removeListener('unhandledRejection', onRejection);
    }
    assert.deepEqual(
      rejections,
      [],
      `expected zero unhandled rejections, got: ${rejections.map(String).join('; ')}`
    );
  };
}

test.beforeEach(() => {
  installLocalStorageStub();
  // Reset the shared settings singleton to DEFAULTS for each test (its cache
  // survives across tests; without this a prior seedSettings would leak).
  loadSettings();
});

test.afterEach(() => {
  resetStubs();
});

// ─── Healthy path ──────────────────────────────────────────────────────────

test(
  'healthy path: health OK + well-formed batch → takeWords yields only words passing the chain',
  withRejectionGuard(async () => {
    const calls = installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) {
        return respondJson({ available: true, model: 'llama3.2' });
      }
      if (url.includes('api/wordgen')) {
        // Both the prefetch=1 kick and the follow-up consume GET land here;
        // words are only meaningfully returned on the non-prefetch GET.
        if (url.includes('prefetch=1')) {
          return respondJson({ words: [] });
        }
        return respondJson({ words: ['dad', 'sad', 'lad'] });
      }
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    assert.equal(wg.isActive(), true, 'health OK ⇒ isActive() true');

    wg.prefetch(4, ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);
    // prefetch is fire-and-forget; give its internal awaits a tick to land.
    await new Promise((r) => setTimeout(r, 20));

    const tokenStreams = wg.takeWords(4, {
      keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    });
    assert.ok(tokenStreams.length > 0, 'expected at least one generated word to survive');
    for (const stream of tokenStreams) {
      assert.ok(Array.isArray(stream), 'each entry is a token array');
      for (const tok of stream) {
        assert.ok(
          ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'].includes(tok),
          `token ${JSON.stringify(tok)} must be in the declared charset`
        );
      }
    }
    // Calls carry only declared params, never the player name (privacy check
    // lives fully in its own test below, but a quick smoke check here too).
    const wordgenCalls = calls.filter((c) => c.url.includes('api/wordgen'));
    assert.ok(wordgenCalls.length > 0);
  })
);

// ─── Failure class A: wrong-charset words dropped per word ────────────────

test(
  'failure class A: batch with wrong-charset words drops only those words, keeps the valid remainder',
  withRejectionGuard(async () => {
    installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) {
        return respondJson({ available: true });
      }
      if (url.includes('prefetch=1')) return respondJson({ words: [] });
      if (url.includes('api/wordgen')) {
        // 'dog' and 'cat' use letters (o,g,c,t) outside Level 4's key set.
        return respondJson({ words: ['dad', 'dog', 'sad', 'cat', 'lass'] });
      }
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    wg.prefetch(4, ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);
    await new Promise((r) => setTimeout(r, 20));

    const keys = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];
    const tokenStreams = wg.takeWords(4, { keys });
    const words = tokenStreams.map((s) => s.join(''));

    assert.deepEqual(
      words.sort(),
      ['dad', 'lass', 'sad'].sort(),
      'wrong-charset words (dog, cat) dropped individually; valid words survive'
    );
  })
);

// ─── Failure class B: structurally bad responses ignored whole ───────────

test(
  'failure class B: non-JSON response → batch ignored whole (empty), no throw',
  withRejectionGuard(async () => {
    installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) return respondJson({ available: true });
      if (url.includes('prefetch=1')) return respondJson({ words: [] });
      if (url.includes('api/wordgen')) {
        return {
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError('Unexpected token in JSON');
          },
          text: async () => 'not json at all',
        };
      }
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    wg.prefetch(4, ['a', 's', 'd', 'f']);
    await new Promise((r) => setTimeout(r, 20));

    const out = wg.takeWords(4, { keys: ['a', 's', 'd', 'f'] });
    assert.deepEqual(out, [], 'non-JSON reply must yield an empty batch, not a crash');
  })
);

test(
  'failure class B: wrong shape (words not an array) → batch ignored whole',
  withRejectionGuard(async () => {
    installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) return respondJson({ available: true });
      if (url.includes('prefetch=1')) return respondJson({ words: [] });
      if (url.includes('api/wordgen')) {
        // words is a string, not an array — structurally wrong.
        return respondJson({ words: 'dad,sad,lad' });
      }
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    wg.prefetch(4, ['a', 's', 'd', 'f']);
    await new Promise((r) => setTimeout(r, 20));

    const out = wg.takeWords(4, { keys: ['a', 's', 'd', 'f'] });
    assert.deepEqual(out, [], 'wrong-shape words field must yield an empty batch');
  })
);

test(
  'failure class B: wrong field types inside the words array → those entries dropped, structure not trusted blindly',
  withRejectionGuard(async () => {
    installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) return respondJson({ available: true });
      if (url.includes('prefetch=1')) return respondJson({ words: [] });
      if (url.includes('api/wordgen')) {
        // Mixed types: numbers, null, an object, and one valid string.
        return respondJson({ words: [42, null, { evil: true }, 'sad'] });
      }
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    wg.prefetch(4, ['a', 's', 'd', 'f']);
    await new Promise((r) => setTimeout(r, 20));

    const out = wg.takeWords(4, { keys: ['a', 's', 'd', 'f'] });
    const words = out.map((s) => s.join(''));
    assert.deepEqual(words, ['sad'], 'only the well-typed string entry survives');
  })
);

test(
  'failure class B: oversized batch/word — consumeBatch caps word length at the declared maxWordLength',
  withRejectionGuard(async () => {
    const overLong = 'a'.repeat(25); // 25 > the play-logic ceiling (24); default ANY-cap declares 24
    installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) return respondJson({ available: true });
      if (url.includes('prefetch=1')) return respondJson({ words: [] });
      if (url.includes('api/wordgen')) {
        return respondJson({ words: [overLong, 'sad'] });
      }
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    wg.prefetch(4, ['a', 's', 'd', 'f']);
    await new Promise((r) => setTimeout(r, 20));

    const out = wg.takeWords(4, { keys: ['a', 's', 'd', 'f'] });
    const words = out.map((s) => s.join(''));
    assert.ok(!words.includes(overLong), 'oversized word must be dropped');
    assert.deepEqual(words, ['sad']);
  })
);

// ─── Offline / HTTP 500 / timeout / health-fail → silent static fallback ──

test(
  'offline (network error on health) → isActive() false, takeWords empty, no throw',
  withRejectionGuard(async () => {
    installFetchStub(() => {
      throw new TypeError('Failed to fetch');
    });

    const wg = await freshWordgen();
    await wg.initWordgen(); // must not throw
    assert.equal(wg.isActive(), false, 'network failure ⇒ disabled ⇒ isActive() false');

    wg.prefetch(4, ['a', 's', 'd', 'f']); // must not throw even though disabled
    await new Promise((r) => setTimeout(r, 20));
    assert.deepEqual(wg.takeWords(4, { keys: ['a', 's', 'd', 'f'] }), []);
  })
);

test(
  'health endpoint 404 (static hosting, no API route) → permanently disabled + ONE clear console.info fallback line',
  withRejectionGuard(async () => {
    installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) {
        return respondJson({ error: 'not found' }, { status: 404 });
      }
      throw new Error(`should not reach wordgen endpoint when disabled: ${url}`);
    });

    // The disabled path (no server-driven backend) announces the static-dictionary
    // fallback exactly once via console.info (js/wordgen.js announceStaticFallback),
    // so the fallback is legible to humans, agents, and this test — never retried,
    // never an error-level log. Spy on it and restore afterward.
    const origInfo = console.info;
    const infoLogs = [];
    console.info = (...args) => infoLogs.push(args.join(' '));
    try {
      const wg = await freshWordgen();
      await wg.initWordgen();
      assert.equal(wg.isActive(), false, '404 health ⇒ disabled ⇒ isActive() false');

      const fallbackLines = infoLogs.filter((l) =>
        /server-driven word generation unavailable/.test(l) &&
        /falling back to the built-in static dictionary/.test(l)
      );
      assert.equal(
        fallbackLines.length,
        1,
        `expected exactly one clear fallback console.info line, got: ${JSON.stringify(infoLogs)}`
      );
    } finally {
      console.info = origInfo;
    }
  })
);

test(
  'HTTP 500 on health → dormant (not a throw), isActive() reports dormant as active-ish per contract',
  withRejectionGuard(async () => {
    installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) {
        return respondJson({ error: 'boom' }, { status: 500 });
      }
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen(); // must not throw on a 500
    // isActive() is true for BOTH 'available' and 'dormant' per the module's
    // own doc comment — dormant still allows light rechecks, so this is
    // intentional, not a fallback bypass. It never talks to /api/wordgen itself.
    assert.equal(
      wg.isActive(),
      true,
      'dormant still reports isActive() true per the documented state machine'
    );
    const out = wg.takeWords(4, { keys: ['a', 's', 'd', 'f'] });
    assert.deepEqual(out, [], 'nothing was ever fetched from /api/wordgen, so takeWords is empty');
  })
);

test(
  'health-fetch timeout/abort → treated as network error → disabled, no unhandled rejection',
  withRejectionGuard(async () => {
    installFetchStub(() => {
      // Simulate what AbortController produces on timeout.
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      throw err;
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    assert.equal(wg.isActive(), false, 'abort/timeout on health ⇒ disabled');
  })
);

test(
  'wordgen fetch 500 during prefetch → retried then exhausted → takeWords stays empty, no throw',
  withRejectionGuard(async () => {
    let wordgenCallCount = 0;
    installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) return respondJson({ available: true });
      if (url.includes('api/wordgen')) {
        wordgenCallCount += 1;
        return respondJson({ error: 'server error' }, { status: 500 });
      }
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    wg.prefetch(4, ['a', 's', 'd', 'f']);
    // Backoff schedule is 500ms/1000ms/2000ms with jitter for 3 attempts — wait
    // generously but well under the test timeout for it to exhaust.
    await new Promise((r) => setTimeout(r, 500));

    assert.deepEqual(wg.takeWords(4, { keys: ['a', 's', 'd', 'f'] }), []);
    assert.ok(wordgenCallCount >= 1, 'at least one attempt was made');
  })
);

// ─── Privacy (security.md rule 6) ─────────────────────────────────────────

test(
  'privacy: requests carry only act/level/characters params, same-origin relative paths, never the player name',
  withRejectionGuard(async () => {
    const calls = installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) return respondJson({ available: true });
      if (url.includes('api/wordgen')) return respondJson({ words: [] });
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();

    const playerName = 'Oona Mack'; // a deliberately identifying string that must NEVER leak
    // The public prefetch API only accepts (level, keys) — no way to pass a name in
    // even if a caller tried. Confirm the emitted query reflects that contract.
    wg.prefetch(4, ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);
    await new Promise((r) => setTimeout(r, 20));

    const wordgenCalls = calls.filter((c) => c.url.includes('api/wordgen'));
    assert.ok(wordgenCalls.length > 0, 'expected at least one /api/wordgen request');

    for (const call of wordgenCalls) {
      assert.ok(
        call.url.startsWith('api/wordgen') && !call.url.startsWith('/'),
        `must be a same-origin relative path, got: ${call.url}`
      );
      assert.ok(
        !/^https?:\/\//i.test(call.url),
        `must never be an absolute external URL, got: ${call.url}`
      );
      const query = new URLSearchParams(call.url.split('?')[1] || '');
      const allowedParams = new Set([
        'act',
        'level',
        'characters',
        'minWordLength',
        'maxWordLength',
        'prefetch',
      ]);
      for (const key of query.keys()) {
        assert.ok(
          allowedParams.has(key),
          `unexpected query param ${JSON.stringify(key)} in ${call.url}`
        );
      }
      assert.ok(
        !call.url.toLowerCase().includes('oona') &&
          !call.url.toLowerCase().includes('mack') &&
          !call.url.toLowerCase().includes(encodeURIComponent(playerName).toLowerCase()),
        `player name must never appear in the request: ${call.url}`
      );
      // 'characters' must be exactly the declared key set, nothing more.
      const characters = query.get('characters') || '';
      assert.ok(
        [...characters].every((c) => ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'].includes(c)),
        `characters param must only contain declared keys, got: ${characters}`
      );
    }
  })
);

// ─── word-length window contract (Trevor, 2026-07-13) ─────────────────────
// Word length is a player-set DIFFICULTY lever: the client reads the live
// getWordLengthRange() setting and DECLARES both minWordLength and maxWordLength,
// each clamped to the play-logic window [2,24] (ceiling raised from 8 so a
// savvy/older player can crank genuinely harder play). Default ANY/ANY → the
// widest window (2..24). A bounded setting lands on the wire verbatim.

// Seed kk-settings the way the client reads it (settings.js reads localStorage
// key 'kk-settings' lazily via getSettings()). Must be set BEFORE the client's
// first read; the client resolves bounds per prefetch, so seeding then
// prefetching is sufficient.
function seedSettings(patch) {
  installLocalStorageStub({ 'kk-settings': JSON.stringify(patch) });
  loadSettings(); // force the shared singleton to re-read the seeded value
}

test(
  'contract: every /api/wordgen request DECLARES both minWordLength and maxWordLength, clamped to [2,24]',
  withRejectionGuard(async () => {
    const calls = installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) return respondJson({ available: true });
      if (url.includes('api/wordgen')) return respondJson({ words: [] });
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    wg.prefetch(4, ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);
    await new Promise((r) => setTimeout(r, 20));

    const wordgenCalls = calls.filter(
      (c) => c.url.includes('api/wordgen') && !c.url.includes('/health')
    );
    assert.ok(wordgenCalls.length > 0, 'expected at least one /api/wordgen request');
    for (const call of wordgenCalls) {
      const query = new URLSearchParams(call.url.split('?')[1] || '');
      const min = query.get('minWordLength');
      const max = query.get('maxWordLength');
      assert.ok(min !== null, `minWordLength must be declared in ${call.url}`);
      assert.ok(max !== null, `maxWordLength must be declared in ${call.url}`);
      const nMin = Number(min);
      const nMax = Number(max);
      assert.ok(
        Number.isInteger(nMin) && nMin >= 2 && nMin <= 24,
        `minWordLength must be within the play-logic window [2,24], got ${min}`
      );
      assert.ok(
        Number.isInteger(nMax) && nMax >= 2 && nMax <= 24,
        `maxWordLength must be within the play-logic window [2,24], got ${max}`
      );
      assert.ok(nMin <= nMax, `min must not exceed max, got ${min}..${max}`);
    }
  })
);

test(
  'contract: default ANY/ANY settings → widest window (min=2, max=24) on the wire',
  withRejectionGuard(async () => {
    // No kk-settings seeded ⇒ defaults (minWordLen:0/ANY, maxWordLen:0/ANY).
    const calls = installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) return respondJson({ available: true });
      if (url.includes('api/wordgen')) return respondJson({ words: [] });
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    wg.prefetch(4, ['a', 's', 'd', 'f']);
    await new Promise((r) => setTimeout(r, 20));

    const call = calls.find(
      (c) => c.url.includes('api/wordgen') && !c.url.includes('/health')
    );
    assert.ok(call, 'expected a /api/wordgen request');
    const query = new URLSearchParams(call.url.split('?')[1] || '');
    assert.equal(query.get('minWordLength'), '2', 'ANY floor → play-logic floor 2');
    assert.equal(query.get('maxWordLength'), '24', 'ANY cap → raised play-logic ceiling 24');
  })
);

test(
  'contract: a bounded setting lands verbatim on the wire (min=4, max=10)',
  withRejectionGuard(async () => {
    seedSettings({ minWordLen: 4, maxWordLen: 10 });
    const calls = installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) return respondJson({ available: true });
      if (url.includes('api/wordgen')) return respondJson({ words: [] });
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    wg.prefetch(4, ['a', 's', 'd', 'f']);
    await new Promise((r) => setTimeout(r, 20));

    const call = calls.find(
      (c) => c.url.includes('api/wordgen') && !c.url.includes('/health')
    );
    assert.ok(call, 'expected a /api/wordgen request');
    const query = new URLSearchParams(call.url.split('?')[1] || '');
    assert.equal(query.get('minWordLength'), '4', 'bounded min lands verbatim');
    assert.equal(query.get('maxWordLength'), '10', 'bounded max lands verbatim');
  })
);

test(
  'contract: client length filter aligns with the declared window — at-cap survives, oversized dropped',
  withRejectionGuard(async () => {
    // Default ANY/ANY ⇒ window [2,24]. 24 survives, 25 dropped.
    const atCap = 'a'.repeat(24); // at the raised ceiling
    const overCap = 'a'.repeat(25); // one past it
    installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) return respondJson({ available: true });
      if (url.includes('prefetch=1')) return respondJson({ words: [] });
      if (url.includes('api/wordgen')) return respondJson({ words: [atCap, overCap, 'sad'] });
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    wg.prefetch(4, ['a', 's', 'd', 'f']);
    await new Promise((r) => setTimeout(r, 20));

    const words = wg.takeWords(4, { keys: ['a', 's', 'd', 'f'] }).map((s) => s.join(''));
    assert.ok(words.includes(atCap), '24-letter word (at the raised cap) must survive');
    assert.ok(!words.includes(overCap), '25-letter word (past the cap) must be dropped');
  })
);

test(
  'contract: a bounded MIN setting drops too-short words in the client filter',
  withRejectionGuard(async () => {
    seedSettings({ minWordLen: 5 }); // floor 5, ANY cap → window [5,12]
    installFetchStub((url) => {
      if (url.includes('api/wordgen/health')) return respondJson({ available: true });
      if (url.includes('prefetch=1')) return respondJson({ words: [] });
      // 'sad' (3) is below the floor; 'flask' (5) at the floor; 'salad' (5) too.
      if (url.includes('api/wordgen')) return respondJson({ words: ['sad', 'flask', 'salad'] });
      throw new Error(`unexpected fetch: ${url}`);
    });

    const wg = await freshWordgen();
    await wg.initWordgen();
    wg.prefetch(4, ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);
    await new Promise((r) => setTimeout(r, 20));

    const keys = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];
    const words = wg.takeWords(4, { keys }).map((s) => s.join('')).sort();
    assert.deepEqual(
      words,
      ['flask', 'salad'].sort(),
      'words shorter than the declared min (5) are dropped; at-or-above survive'
    );
  })
);

test(
  'privacy: health probe itself is same-origin relative, no external host',
  withRejectionGuard(async () => {
    const calls = installFetchStub((url) => respondJson({ available: true }));
    const wg = await freshWordgen();
    await wg.initWordgen();

    const healthCalls = calls.filter((c) => c.url.includes('health'));
    assert.ok(healthCalls.length > 0);
    for (const call of healthCalls) {
      assert.ok(call.url.startsWith('api/wordgen/health'));
      assert.ok(!/^https?:\/\//i.test(call.url));
    }
  })
);
