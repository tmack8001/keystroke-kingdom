// Enforces: INV-64 / INV-65 (+ the INV-62 capstone linkage) — the Level 25
// "MY STORY" coda (js/keyboard-story.js), the earned post-target finale.
//
// Design sources (the test asserts what THESE promise, never what the code does):
//   - product.md §5 (full-keyboard mastery — "the eighth key" / typing unlocks the
//        world) + §Word Length (EXPERIENCE "ages with the player": higher tier = MORE
//        typing, never a penalty): L25 is the "true entire keyboard unlocked" level, so
//        the coda must make the player type EVERY letter A–Z, and it scales with tier.
//   - CLAUDE.md §"The One Rule" + the sacred wrong-keypress behavior: the typo beat is
//        SCRIPTED content (every token is the expected key) — a playful trip-up that
//        never penalizes the player; the coda is finite and fully typeable at L25.
//   - js/keyboard-story.js header: static bank is the offline floor; generation only
//        ADDS variety and its output is untrusted (security.md rules 6-7).
//   - js/finale-quote.js: the manifesto excerpt is the coda's CAPSTONE final line(s).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  STATIC_STORIES, TYPO_BEATS, MAX_SUBLINE,
  coversAllLetters, toSubLines, storyBodyForRatio, beatCountForRatio,
  pickKeyboardStory, pickTypoBeats, assembleCoda, renderCodaText,
  validateStorySentence, validateGeneratedStory, buildStoryPool,
} from '../../js/keyboard-story.js';
import { finaleLinesForRatio } from '../../js/finale-quote.js';

const TIERS = [1, 1.5, 2.25, 3.5];

// Peak on-screen width of a token line as it is typed (Backspace shrinks it) — must
// never exceed the prompt-panel sub-line cap.
function peakWidth(line) {
  let s = '', max = 0;
  for (const t of line) {
    if (t === 'Backspace') s = s.slice(0, -1);
    else s += t;
    if (s.length > max) max = s.length;
  }
  return max;
}

describe('INV-64 — the static bank is an all-26-letter offline floor', () => {
  test('there are at least 5 stories (real offline rotation variety)', () => {
    assert.ok(STATIC_STORIES.length >= 5, `only ${STATIC_STORIES.length} static stories`);
  });

  test('every static story base is a PANGRAM (covers a–z)', () => {
    for (const s of STATIC_STORIES) {
      assert.ok(coversAllLetters(s.base),
        `story "${s.id}" base is not a pangram: "${s.base}"`);
    }
  });

  test('every static story has >= 3 extra sentences (enough for tier scaling)', () => {
    for (const s of STATIC_STORIES) {
      assert.ok(Array.isArray(s.extra) && s.extra.length >= 3,
        `story "${s.id}" has too few extras`);
    }
  });

  test('every story sentence breaks into sub-lines within the prompt width cap', () => {
    for (const s of STATIC_STORIES) {
      for (const sent of [s.base, ...s.extra]) {
        for (const sub of toSubLines(sent, MAX_SUBLINE)) {
          assert.ok(sub.length <= MAX_SUBLINE, `sub-line too wide in "${s.id}": "${sub}"`);
        }
      }
    }
  });
});

describe('INV-64 — assembled coda covers all 26 letters at EVERY tier', () => {
  for (const r of TIERS) {
    test(`winRatio ${r}: rendered coda text is a pangram`, () => {
      for (let rot = 0; rot < STATIC_STORIES.length; rot++) {
        const story = pickKeyboardStory(STATIC_STORIES, rot);
        const coda = assembleCoda(story, r, rot);
        const text = renderCodaText(coda);
        assert.ok(coversAllLetters(text),
          `coda (winRatio ${r}, rotation ${rot}, story "${story.id}") missed letters`);
      }
    });
  }

  test('coverage holds with NO generated stories (offline fallback)', () => {
    const pool = buildStoryPool([]);          // generation absent
    assert.deepEqual(pool, STATIC_STORIES.map((s) => s)); // static bank verbatim
    const coda = assembleCoda(pickKeyboardStory(pool, 0), 1, 0);
    assert.ok(coversAllLetters(renderCodaText(coda)));
  });
});

describe('INV-65 — higher tier is a strictly LONGER coda (more, never a penalty)', () => {
  test('storyBodyForRatio adds one sentence per EXPERIENCE step', () => {
    const s = STATIC_STORIES[0];
    assert.equal(storyBodyForRatio(s, 1).length, 1);      // base only
    assert.equal(storyBodyForRatio(s, 1.5).length, 2);
    assert.equal(storyBodyForRatio(s, 2.25).length, 3);
    assert.equal(storyBodyForRatio(s, 3.5).length, 4);
  });

  test('assembled coda line count strictly increases with tier', () => {
    const s = STATIC_STORIES[0];
    const lens = TIERS.map((r) => assembleCoda(s, r, 0).length);
    for (let i = 1; i < lens.length; i++) {
      assert.ok(lens[i] > lens[i - 1],
        `coda length did not grow: ${lens.join(' -> ')}`);
    }
  });

  test('beat count is >= 1 at every tier and does not shrink with tier', () => {
    let prev = 0;
    for (const r of TIERS) {
      const n = beatCountForRatio(r);
      assert.ok(n >= 1, `no typo beat at winRatio ${r}`);
      assert.ok(n >= prev, `beat count shrank at winRatio ${r}`);
      prev = n;
    }
  });
});

describe('INV-65 — rotation surfaces a DIFFERENT story deterministically', () => {
  test('successive rotations cycle through distinct stories (no Math.random)', () => {
    const a = pickKeyboardStory(STATIC_STORIES, 0);
    const b = pickKeyboardStory(STATIC_STORIES, 1);
    assert.notEqual(a.id, b.id, 'rotation 0 and 1 gave the same story');
    // Deterministic: same rotation → same story, always.
    assert.equal(pickKeyboardStory(STATIC_STORIES, 0).id, a.id);
    assert.equal(pickKeyboardStory(STATIC_STORIES, STATIC_STORIES.length).id, a.id); // wraps
  });

  test('pickTypoBeats is deterministic and offset by rotation', () => {
    const b0 = pickTypoBeats(0, 1);
    const b1 = pickTypoBeats(1, 1);
    assert.deepEqual(pickTypoBeats(0, 1), b0);            // deterministic
    assert.notDeepEqual(b0[0], b1[0]);                    // rotation varies the beat
    assert.equal(pickTypoBeats(0, 3).length, 3);          // count honored
  });
});

describe('INV-65 — every typo beat is a well-formed, self-contained correction', () => {
  test('at least one beat exists', () => {
    assert.ok(TYPO_BEATS.length >= 1);
  });

  for (const beat of TYPO_BEATS) {
    describe(`beat "${beat.text}"`, () => {
      test('uses only valid engine tokens (single chars, space, Backspace)', () => {
        for (const t of beat.tokens) {
          assert.ok(t === 'Backspace' || t === ' ' || (typeof t === 'string' && t.length === 1),
            `bad token ${JSON.stringify(t)}`);
        }
      });

      test('backspaces never underflow (can never erase earlier text)', () => {
        let printed = 0;
        for (const t of beat.tokens) {
          if (t === 'Backspace') {
            printed--;
            assert.ok(printed >= 0, `underflow in beat "${beat.text}"`);
          } else printed++;
        }
      });

      test('final rendered text equals the intended readable word', () => {
        assert.equal(renderCodaText([beat.tokens]), beat.text);
      });

      test('contains a real Backspace correction (a typo was fixed)', () => {
        assert.ok(beat.tokens.includes('Backspace'), 'beat has no Backspace');
      });

      test('never overflows the prompt sub-line width while typing', () => {
        assert.ok(peakWidth(beat.tokens) <= MAX_SUBLINE, `beat "${beat.text}" too wide`);
      });
    });
  }

  test('every assembled coda includes at least one Backspace beat at every tier', () => {
    for (const r of TIERS) {
      const coda = assembleCoda(STATIC_STORIES[0], r, 0);
      assert.ok(coda.some((line) => line.includes('Backspace')),
        `no Backspace beat in coda at winRatio ${r}`);
    }
  });

  test('no assembled coda line ever overflows the prompt width', () => {
    for (const r of TIERS) {
      for (let rot = 0; rot < STATIC_STORIES.length; rot++) {
        for (const line of assembleCoda(pickKeyboardStory(STATIC_STORIES, rot), r, rot)) {
          assert.ok(peakWidth(line) <= MAX_SUBLINE,
            `coda line overflowed at winRatio ${r}, rotation ${rot}: ${line.join('')}`);
        }
      }
    }
  });
});

describe('INV-62 linkage — the manifesto excerpt is the coda CAPSTONE (final lines)', () => {
  for (const r of TIERS) {
    test(`winRatio ${r}: coda ends with exactly the tier manifesto lines`, () => {
      const coda = assembleCoda(STATIC_STORIES[0], r, 0);
      const manifesto = finaleLinesForRatio(r);
      const tail = coda.slice(coda.length - manifesto.length);
      assert.deepEqual(tail, manifesto,
        `coda tail is not the manifesto capstone at winRatio ${r}`);
    });
  }
});

describe('INV-66 — generated-story validation rejects unsafe / non-covering content', () => {
  // A pangram NOT in the static bank — so buildStoryPool's dedup-against-static (added
  // with the kk-stories quality-cache) admits it. (Reusing a static base here would be
  // correctly deduped OUT; that dedup is covered in keyboard-story-cache.test.mjs.)
  const goodBase = 'How quickly daft jumping zebras vex.';
  const goodExtra = ['They play all day.', 'The sun is warm.', 'It is a happy day.'];

  test('a clean generated story validates', () => {
    const v = validateGeneratedStory({ base: goodBase, extra: goodExtra });
    assert.ok(v && coversAllLetters(v.base));
  });

  test('a non-pangram base is rejected', () => {
    assert.equal(validateGeneratedStory({ base: 'The cat sat on a mat.', extra: goodExtra }), null);
  });

  test('a sentence with disallowed characters is rejected', () => {
    assert.equal(validateStorySentence('Hello there!'), null); // '!' not typeable/allowed
    assert.equal(validateStorySentence('Type 10 words'), null); // digits not allowed
  });

  test('an unsafe word (exact match) is rejected', () => {
    assert.equal(validateStorySentence('the gun is loud'), null);
  });

  test('too few valid extras → whole story rejected', () => {
    assert.equal(validateGeneratedStory({ base: goodBase, extra: ['just one.'] }), null);
  });

  test('buildStoryPool puts validated generated stories BEFORE the static bank', () => {
    const pool = buildStoryPool([{ base: goodBase, extra: goodExtra }]);
    assert.equal(pool.length, STATIC_STORIES.length + 1);
    assert.equal(pool[0].id, 'gen-0');
    // A bad generated entry is dropped; only static remains.
    assert.deepEqual(buildStoryPool([{ base: 'no pangram', extra: [] }]).length, STATIC_STORIES.length);
    // A generated story duplicating a static base is deduped OUT (never diluting the
    // offline floor) — the accumulating-variety dedup (kk-stories cache).
    assert.equal(
      buildStoryPool([{ base: STATIC_STORIES[0].base, extra: goodExtra }]).length,
      STATIC_STORIES.length);
  });
});
