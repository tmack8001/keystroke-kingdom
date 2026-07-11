// Regenerates all docs/screenshots/ — one select screen per act + one gameplay
// screen per level.  To add new acts or levels, edit ACTS_CONFIG only.
//
// Usage: node docs/screenshots/capture-all.js
//   Server must already be running (./keystroke-kingdom &).
//   Reads server URL from .dev-url at the repo root.

const { chromium } = require('/Users/trevormack/.npm/_npx/705bc6b22212b352/node_modules/playwright');
const fs   = require('fs');
const path = require('path');

// ── Source of truth ────────────────────────────────────────────────────────────
// Each act lists its levels in play order.  Adding Act 5 = one new entry here.
// 'slug' becomes the directory / filename fragment; keep it lowercase-hyphenated.

const ACTS_CONFIG = [
  {
    slug: 'act1-arcade',
    levels: [
      { slug: 'breakout' },
      { slug: 'space-invaders' },
      { slug: 'pac-man' },
      { slug: 'galaga' },
      { slug: 'joust' },
    ],
  },
  {
    slug: 'act2-computer-wing',
    levels: [
      { slug: 'donkey-kong' },
      { slug: 'dragons-lair' },
      { slug: 'tetris' },
      { slug: 'super-mario-bros' },
      { slug: 'legend-of-zelda' },
    ],
  },
  {
    slug: 'act3-basement',
    levels: [
      { slug: 'sonic' },
      { slug: 'street-fighter-ii' },
      { slug: 'myst' },
      { slug: 'donkey-kong-country' },
      { slug: 'pokemon' },
    ],
  },
  {
    slug: 'act4-command-center',
    levels: [
      { slug: 'simcity-2000' },
      { slug: 'goldeneye-007' },
      { slug: 'age-of-empires' },
      { slug: 'final-fantasy-vii' },
      { slug: 'terminal' },
    ],
  },
  {
    slug: 'act5-full-circle',
    levels: [
      { slug: 'out-run' },
      { slug: 'qbert' },
      { slug: 'missile-command' },
      { slug: 'high-score-entry' },
      { slug: 'word-processor' },
    ],
  },
];

// ── Derive flat level list (act index, position, global level number) ──────────

let globalLevelNum = 0;
const ALL_LEVELS = [];

ACTS_CONFIG.forEach((act, actIdx) => {
  act.levels.forEach((lvl, posIdx) => {
    globalLevelNum++;
    ALL_LEVELS.push({
      levelNum:  globalLevelNum,
      actIdx:    actIdx,          // 0-based
      posIdx:    posIdx,          // 0-based within act
      actSlug:   act.slug,
      levelSlug: lvl.slug,
      filename:  String(globalLevelNum).padStart(2, '0') + '-' + lvl.slug,
    });
  });
});

// ── Set up directories ─────────────────────────────────────────────────────────

const SHOTS = __dirname;

fs.mkdirSync(path.join(SHOTS, 'select'), { recursive: true });
ACTS_CONFIG.forEach(act => {
  fs.mkdirSync(path.join(SHOTS, 'levels', act.slug), { recursive: true });
});

// ── Navigation helpers ─────────────────────────────────────────────────────────

const devUrl = fs.readFileSync(path.join(__dirname, '../../.dev-url'), 'utf8').trim();

async function goToSelect(page) {
  await page.goto(devUrl);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(600);
  await page.click('body');
  await page.keyboard.press('Enter');   // reveal name entry
  await page.waitForTimeout(350);
  await page.keyboard.press('Enter');   // confirm → ready-screen
  await page.waitForTimeout(450);
  await page.keyboard.type('wopr');     // → select-screen
  await page.waitForTimeout(500);
}

async function navigateToLevel(page, lvl) {
  await goToSelect(page);

  for (let i = 0; i < lvl.actIdx; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(180);
  }
  for (let i = 0; i < lvl.posIdx; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(130);
  }

  await page.keyboard.press('Enter');   // select level → title/name
  await page.waitForTimeout(350);
  await page.keyboard.press('Enter');   // confirm name → ready-screen
  await page.waitForTimeout(350);
  await page.keyboard.press('Space');   // ready → keyboard-preview
  await page.waitForTimeout(350);
  await page.keyboard.press('Space');   // keyboard-preview → game
  await page.waitForTimeout(500);
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  // Select screens: navigate between acts within a single session
  console.log('Select screens (' + ACTS_CONFIG.length + ' acts):');
  await goToSelect(page);
  for (let i = 0; i < ACTS_CONFIG.length; i++) {
    const out = path.join(SHOTS, 'select', ACTS_CONFIG[i].slug + '.png');
    await page.screenshot({ path: out });
    console.log('  select/' + ACTS_CONFIG[i].slug + '.png');
    if (i < ACTS_CONFIG.length - 1) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(300);
    }
  }

  // Gameplay screens: one per level
  console.log('\nGameplay (' + ALL_LEVELS.length + ' levels):');
  for (const lvl of ALL_LEVELS) {
    await navigateToLevel(page, lvl);
    const out = path.join(SHOTS, 'levels', lvl.actSlug, lvl.filename + '.png');
    await page.screenshot({ path: out });
    console.log('  levels/' + lvl.actSlug + '/' + lvl.filename + '.png');
  }

  const total = ACTS_CONFIG.length + ALL_LEVELS.length;
  if (errors.length) {
    console.error('\nJS ERRORS:');
    errors.forEach(e => console.error(' ', e));
    process.exit(1);
  } else {
    console.log('\nDone. ' + total + ' screenshots captured. No JS errors.');
  }

  await browser.close();
})();
