// Enforces: INV-142, INV-143, INV-144 — STRATEGY.md §5 "The 2026-10-30 sign-off
// wave" (revises INV-53 for INV-142). Design sources:
//   - js/textworld/tileworld.js header "A WHOLE WORD WALKS YOU FAR" (2026-10-30
//     explorer playtest: ~700 keystrokes a world for a child of eight; NetHack's
//     run — research/wiki/tech/ascii-overhead-world-conventions.md ref [1]): after
//     three whole direction WORDS a whole word is a run of several tiles; "a single
//     letter stays one careful step"; "Reachability is only ever widened by this:
//     every single step is still available as a letter alias, so INV-55's one-tile
//     BFS floor holds unchanged."
//   - js/textworld/riddles.js `isNearMiss` header: a typo "is NEVER accepted as
//     right — `answerMatches` stays exact… It only changes what the game SAYS: 'so
//     close — one letter is off, Backspace can fix it', with the typed word left in
//     place to be fixed" (being told you were wrong when you were right is the
//     flow-stopping punishment the One Rule forbids).
//   - js/textworld/engine.js `drawWinExitCue`: "Where the prompt was, once you have
//     arrived: say how to leave. Without this the win ended on an empty '>' with
//     nothing on it" — Space/Return walks out, Escape is the hub's (INV-46/TF-T1).
//
// WHAT IS OBSERVED: these wings draw only on the canvas, so (as Act 7's tests do)
// the observable is the WORDS the game draws (a fillText recorder — strings only,
// never a coordinate or pixel) plus the persisted completion in `kk-slots`.
// Movement is verified by outcome: the world is won exactly when the derived
// single-step route is complete, never earlier.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  startGame, toTextWorldDoor, readScreen, press, typeSequence, readActiveSlotProgress,
} from '../helpers/game-driver.mjs';
import { installDrawRecorder, captureDrawn, drawnIncludes, waitForDrawn } from '../helpers/draw-recorder.mjs';
import { buildTileGraph, bfsPath, isGoalNode } from '../helpers/tile-graph.mjs';
import { deriveProseSolution } from '../helpers/prose-solution.mjs';
import { GreenDragon } from '../../js/textworld/greendragon.js';
import { GlimmerDeep, Whisperwood } from '../../js/textworld/tile-worlds.js';
import { buildPool } from '../../js/textworld/riddles.js';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
void REPO_ROOT;
const T = 240_000;
// Arrival is recognised from the world's OWN authored reveal text (data), so the test does not
// depend on the wording of the surrounding chrome.
const arrivalText = (world) => String(world.reveal.message).split(/\s+/).slice(0, 4).join(' ');
// The cue that says how to leave once you have arrived: a line naming both SPACE and ESC.
// (The chooser's own footer also names SPACE and ESC, so a line that offers to CHOOSE is not this cue.)
const EXIT_CUE = /^(?!.*CHOOSE)(?=.*SPACE)(?=.*ESC).*$/i;
const PLAIN = { north: 'up', south: 'down', east: 'right', west: 'left' };   // the four words the hint teaches

const HUB_INDEX = { [GreenDragon.id]: 0, [GlimmerDeep.id]: 1, [Whisperwood.id]: 2 };

async function boot() {
  const g = await startGame();
  await installDrawRecorder(g.page);
  return g;
}
async function enterWorld(page, baseUrl, world) {
  await toTextWorldDoor(page, baseUrl);
  await page.keyboard.press('Space');                 // door -> hub menu
  await page.waitForTimeout(400);
  for (let n = 0; n < HUB_INDEX[world.id]; n++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(120); }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  assert.equal(await readScreen(page), null, 'a text world owns the canvas');
}
// A defensive Space after every move, exactly as a curious child taps it: in move
// mode it is ignored; if a creature's riddle opened on arrival it steps back out.
async function move(page, text) {
  await typeSequence(page, text);
  await page.waitForTimeout(45);
  await page.keyboard.press('Space');
  await page.waitForTimeout(45);
}
const typeCommand = async (page, cmd) => { await typeSequence(page, cmd); await page.waitForTimeout(150); };
const compress = (path) => path.reduce((runs, d) => {
  const last = runs[runs.length - 1];
  if (last && last.dir === d) last.n++; else runs.push({ dir: d, n: 1 });
  return runs;
}, []);
async function completed(page, id) {
  const p = await readActiveSlotProgress(page);
  return p?.textWorlds?.[id]?.completed === true;
}
async function waitCompleted(page, id, ms = 25000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) { if (await completed(page, id)) return true; await page.waitForTimeout(250); }
  return false;
}

for (const world of [GlimmerDeep, Whisperwood]) {
  const graph = buildTileGraph(world);
  const route = bfsPath(graph, isGoalNode(graph));
  const runs = compress(route);
  const finalRun = runs[runs.length - 1];

  describe(`INV-142 — ${world.title}: a single letter is exactly one step, even after the stride is earned`, () => {
    let g;
    before(async () => { g = await boot(); });
    after(async () => { await g.stop(); });

    test('fixture: the shortest single-step route ends in a long straight run (so a word that walks far has room to)', () => {
      assert.ok(route.length > 100, `route is ${route.length} steps`);
      assert.ok(finalRun.n >= 30, `final straight run is ${finalRun.n} tiles`);
    });

    test(`three whole words, then single letters: the world is won on the LAST step of the route and not one step sooner`, { timeout: T }, async () => {
      await enterWorld(g.page, g.baseUrl, world);
      // The first three moves are typed as whole words (the stride unlocks once three have been typed).
      for (let i = 0; i < route.length - 1; i++) {
        await move(g.page, i < 3 ? PLAIN[route[i]] : route[i][0]);
      }
      // Every letter after the unlock was exactly one step: had any been a run, the
      // goal would already be behind us (and we would be standing in the win).
      await g.page.waitForTimeout(600);
      const early = await captureDrawn(g.page, 4);
      assert.ok(!drawnIncludes(early, arrivalText(world)), `one step short of the route's end the player has NOT arrived (${route.length - 1} of ${route.length} steps made)`);
      // The last step is typed WITHOUT the trailing Space: on arrival Space is the
      // documented way out, and it would walk us off the very screen we want to read.
      await typeSequence(g.page, route[route.length - 1][0]);
      const { found, drawn } = await waitForDrawn(g.page, arrivalText(world), { timeoutMs: 8000 });
      assert.ok(found, `the final single step arrives. Last drawn: ${JSON.stringify(drawn.slice(-8))}`);
      // Walk out the documented way (the arrival hold is long and, in a headless
      // software renderer, the victory scene draws at ~1-2 fps, so don't wait it out).
      await g.page.keyboard.press('Space');
      assert.ok(await waitCompleted(g.page, world.id, 8000), 'and the completion is recorded');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    });
  });

  describe(`INV-142 — ${world.title}: after three whole words, a whole word walks several tiles`, () => {
    let g;
    before(async () => { g = await boot(); });
    after(async () => { await g.stop(); });

    test(`reaching the goal along the final ${finalRun.n}-tile run takes far fewer words than tiles (>= 3 tiles per word on average)`, { timeout: T }, async () => {
      await enterWorld(g.page, g.baseUrl, world);
      // Stand at the head of the final run using three whole words then exact single steps.
      const approach = route.slice(0, route.length - finalRun.n);
      for (let i = 0; i < approach.length; i++) await move(g.page, i < 3 ? PLAIN[approach[i]] : approach[i][0]);
      assert.ok(approach.length >= 3, 'the approach includes the three earning words');
      assert.ok(!drawnIncludes(await captureDrawn(g.page, 4), arrivalText(world)), 'not arrived yet');

      // Now only whole words along the straight run.
      const word = PLAIN[finalRun.dir];
      const maxWords = Math.ceil(finalRun.n / 3);       // the doc's bar: several tiles a word
      let words = 0, arrived = false;
      for (; words < maxWords && !arrived;) {
        await typeSequence(g.page, word); words++;
        await g.page.waitForTimeout(750);               // a run is drawn a tile at a time
        arrived = drawnIncludes(await captureDrawn(g.page, 3), arrivalText(world));
        if (arrived) break;
        await g.page.keyboard.press('Space');           // step back from any riddle a run stopped beside
        await g.page.waitForTimeout(100);
      }
      assert.ok(arrived, `${finalRun.n} tiles were not covered in ${maxWords} whole words (typed ${words}) — a word should carry the player several tiles`);
      assert.ok(words * 3 <= finalRun.n, `${words} words for ${finalRun.n} tiles`);
      await g.page.keyboard.press('Space');
      assert.ok(await waitCompleted(g.page, world.id, 8000), 'and the win is recorded — the goal is reachable by words alone');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    });
  });
}

// ── INV-143 — riddles: a typo is told "so close", never accepted, never wiped ──
describe('INV-143 — Green Dragon (typed riddle): a typo of the right answer is not accepted, is kept to be fixed, and the fixed word solves it', () => {
  let g;
  before(async () => { g = await boot(); });
  after(async () => { await g.stop(); });

  const askCmd = Object.values(GreenDragon.rooms).flatMap((r) => r.commands).find((c) => c.ask);
  const riddle = buildPool(askCmd.ask)[0];
  const answer = riddle.answers[0];
  const typo = answer[0] + 'q' + answer.slice(2);
  const rewardStart = riddle.reward.split(/\s+/).slice(0, 2).join(' ');      // e.g. "Fern giggles."

  test('fixture: the first riddle\'s answer is 3+ letters with a one-letter typo', () => {
    assert.ok(answer.length >= 3 && typo !== answer);
  });

  test('a plain wrong word is "not quite" — it never solves the riddle', { timeout: T }, async () => {
    await enterWorld(g.page, g.baseUrl, GreenDragon);
    await typeCommand(g.page, askCmd.text);             // the riddle opens
    const opened = await waitForDrawn(g.page, 'YOUR ANSWER', { timeoutMs: 6000 });
    assert.ok(opened.found, `the answer box is shown: ${JSON.stringify(opened.drawn.slice(0, 12))}`);
    await typeSequence(g.page, 'banana'); await g.page.keyboard.press('Enter'); await g.page.waitForTimeout(250);
    const drawn = await captureDrawn(g.page, 4);
    assert.ok(!drawnIncludes(drawn, rewardStart), 'no reward for a wrong idea');
    assert.ok(drawnIncludes(drawn, 'Not quite'), 'it gently says so');
  });

  test('a one-letter typo is "so close" — NOT accepted, NOT wiped: the child\'s word stays in the box', { timeout: T }, async () => {
    await typeSequence(g.page, typo); await g.page.keyboard.press('Enter'); await g.page.waitForTimeout(250);
    const drawn = await captureDrawn(g.page, 4);
    assert.ok(!drawnIncludes(drawn, rewardStart), 'a typo never solves the riddle (answerMatches stays exact)');
    assert.ok(drawnIncludes(drawn, 'So close'), 'the game says how close it was');
    assert.ok(drawnIncludes(drawn, 'BACKSPACE'), 'and names the key that fixes it');
    assert.ok(drawn.some((s) => s.includes(typo)), 'her typed word is still there to be fixed');
  });

  test('Backspace fixes the letter and Return solves it — the lesson is making it right', { timeout: T }, async () => {
    for (let i = 0; i < answer.length; i++) await g.page.keyboard.press('Backspace');   // clear (Backspace edits the answer box)
    await typeSequence(g.page, answer); await g.page.keyboard.press('Enter');
    const solved = await waitForDrawn(g.page, rewardStart, { timeoutMs: 6000 });
    assert.ok(solved.found, `the authored reward appears. Drawn: ${JSON.stringify(solved.drawn.slice(0, 20))}`);
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});

describe('INV-143 — a tile world (THE GLIMMER DEEP): the same, for a typo of Glim\'s answer', () => {
  let g;
  before(async () => { g = await boot(); });
  after(async () => { await g.stop(); });

  const graph = buildTileGraph(GlimmerDeep);
  let glimAt = null;
  for (const [key, slot] of graph.npcByPos) if (slot === 1) { const [screen, r, c] = key.split(':').map(Number); glimAt = { screen, r, c }; }
  const approach = bfsPath(graph, (n) => n.screen === glimAt.screen && Math.max(Math.abs(n.r - glimAt.r), Math.abs(n.c - glimAt.c)) === 1);
  const glim = GlimmerDeep.npcs.find((n) => n.slot === 1);
  const answer = glim.answers[0];
  const typo = answer.slice(0, -1) + 'q';

  test('stepping up to Glim opens a riddle; a typo is "so close" and kept; the fixed word solves it', { timeout: T }, async () => {
    await enterWorld(g.page, g.baseUrl, GlimmerDeep);
    for (const dir of approach) { await press(g.page, dir[0]); await g.page.waitForTimeout(40); }   // riddle opens on the last step
    const opened = await waitForDrawn(g.page, glim.name, { timeoutMs: 6000 });
    assert.ok(opened.found, 'Glim\'s riddle is open');
    const rewardStart = glim.reward.split(/\s+/).slice(0, 2).join(' ');

    await typeSequence(g.page, typo); await g.page.keyboard.press('Enter'); await g.page.waitForTimeout(250);
    let drawn = await captureDrawn(g.page, 4);
    assert.ok(drawnIncludes(drawn, 'So close'), 'the game says how close it was');
    assert.ok(drawnIncludes(drawn, 'BACKSPACE'));
    assert.ok(!drawnIncludes(drawn, rewardStart), 'a typo never solves it');
    assert.ok(drawn.some((s) => s.includes('> ' + typo) || s.includes(typo)), 'the typed word stays in the box');

    await g.page.keyboard.press('Backspace');
    await press(g.page, answer[answer.length - 1]);
    await g.page.keyboard.press('Enter');
    const solved = await waitForDrawn(g.page, rewardStart, { timeoutMs: 6000 });
    assert.ok(solved.found, 'fixing the letter solves it');
    assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
  });
});

// ── INV-144 — arriving in the Green Dragon says how to leave ─────────────────
describe('INV-144 — Green Dragon: the win shows how to leave, and Space or Escape both leave (credited either way)', () => {
  const SOLUTION = deriveProseSolution(GreenDragon);

  async function winDragon(g) {
    await enterWorld(g.page, g.baseUrl, GreenDragon);
    for (const cmd of SOLUTION) await typeCommand(g.page, cmd);
    return waitForDrawn(g.page, EXIT_CUE, { timeoutMs: 12000 });
  }

  test('fixture: the world has a derived winning path', () => { assert.ok(SOLUTION.length > 0); });

  test('on arrival the screen names the keys that leave (SPACE and ESC), instead of ending on an empty prompt', { timeout: T }, async () => {
    const g = await boot();
    try {
      await winDragon(g);
      const { found, drawn } = await waitForDrawn(g.page, EXIT_CUE, { timeoutMs: 8000 });
      assert.ok(found, `the exit cue is drawn. Recent: ${JSON.stringify(drawn.slice(-10))}`);
      const cueLine = drawn.find((s) => EXIT_CUE.test(s));
      assert.match(cueLine.toUpperCase(), /SPACE/);
      assert.match(cueLine.toUpperCase(), /ESC/);
    } finally { await g.stop(); }
  });

  test('Space walks out to the Text Worlds chooser, and the win is credited', { timeout: T }, async () => {
    const g = await boot();
    try {
      await winDragon(g);
      await waitForDrawn(g.page, EXIT_CUE, { timeoutMs: 8000 });
      await g.page.keyboard.press('Space');
      const hub = await waitForDrawn(g.page, 'CHOOSE', { timeoutMs: 4000 });
      assert.ok(hub.found, `the chooser is showing: ${JSON.stringify(hub.drawn.slice(0, 12))}`);
      assert.ok(!drawnIncludes(hub.drawn, EXIT_CUE), 'the arrival screen is gone');
      assert.ok(await waitCompleted(g.page, GreenDragon.id, 5000), 'the win is recorded');
      assert.equal(await readScreen(g.page), null, 'still inside the wing (one more Escape reaches the arcade)');
      await g.page.keyboard.press('Escape');
      await g.page.waitForTimeout(800);
      assert.equal(await readScreen(g.page), 'select-screen');
      assert.deepEqual(g.consoleErrors, [], g.consoleErrors.join('\n'));
    } finally { await g.stop(); }
  });

  test('Escape (the hub\'s key) also leaves the arrival screen for the chooser, and the win is credited', { timeout: T }, async () => {
    const g = await boot();
    try {
      await winDragon(g);
      await waitForDrawn(g.page, EXIT_CUE, { timeoutMs: 8000 });
      await g.page.keyboard.press('Escape');
      const hub = await waitForDrawn(g.page, 'CHOOSE', { timeoutMs: 4000 });
      assert.ok(hub.found, 'the chooser is showing');
      assert.ok(await waitCompleted(g.page, GreenDragon.id, 5000), 'leaving by Escape still credits the win (TF-T1)');
    } finally { await g.stop(); }
  });
});
