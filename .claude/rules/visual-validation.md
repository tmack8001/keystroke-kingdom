# Visual Validation Rule
## Keystroke Kingdom — Required Check After Adding New Levels or Themes

---

## The Rule

After adding any new level, theme file, or UI change that affects the game screen, you MUST take a Playwright screenshot of that level and visually confirm:

1. **The letter prompt is visible** — "TYPE THE LETTER" label and the active letter appear in the center of the screen
2. **The keyboard guide is visible** — the row of key boxes appears at the bottom of the game area
3. **The theme background is showing** — canvas background renders behind the UI (not on top of it)
4. **No JS console errors** — no red errors or uncaught exceptions

This check exists because the canvas z-index bug (discovered June 2026) silently broke levels 6–15. The letter prompt and keyboard guide were completely hidden behind the canvas background for all of Act 2 and Act 3. The bug was live for an entire build session before it was caught.

---

## How to Run It

The Playwright module is installed at:
```
/Users/trevormack/.npm/_npx/705bc6b22212b352/node_modules/playwright
```
Chromium headless shell is at:
```
/Users/trevormack/Library/Caches/ms-playwright/chromium_headless_shell-1228/
```

The dev server URL is in `.dev-url` at the repo root.

### Standard screenshot script

```javascript
const { chromium } = require('/Users/trevormack/.npm/_npx/705bc6b22212b352/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  const BASE_URL = 'http://127.0.0.1:PORT'; // read from .dev-url

  // Navigate to a specific level (1–20):
  async function goToLevel(targetLevel) {
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(600);
    await page.click('body');                  // focus the page
    await page.keyboard.press('Enter');        // reveal name entry (still title-screen)
    await page.waitForTimeout(350);
    await page.keyboard.press('Enter');        // confirm name → ready-screen
    await page.waitForTimeout(450);
    await page.keyboard.type('wopr');          // → select-screen
    await page.waitForTimeout(500);

    // Navigate acts: ArrowDown N-1 times (acts are 1-indexed)
    const actNum = Math.ceil(targetLevel / 5);
    for (let i = 1; i < actNum; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);
    }
    // Navigate position within act: ArrowRight N-1 times
    const pos = ((targetLevel - 1) % 5) + 1;
    for (let i = 1; i < pos; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(150);
    }

    await page.keyboard.press('Enter');        // select level → title/name entry
    await page.waitForTimeout(350);
    await page.keyboard.press('Enter');        // confirm name → ready-screen
    await page.waitForTimeout(350);
    await page.keyboard.press('Space');        // ready → keyboard-preview-screen
    await page.waitForTimeout(350);
    await page.keyboard.press('Space');        // keyboard-preview → game-screen
    await page.waitForTimeout(600);
  }

  await goToLevel(7); // change to the level you want
  await page.screenshot({ path: '/tmp/kk-level7.png' });

  if (errors.length) console.log('ERRORS:', errors.join('\n'));
  await browser.close();
})();
```

Run it with:
```bash
URL=$(cat .dev-url) node << 'SCRIPT'
// ... paste script above, replacing PORT with actual value from .dev-url ...
SCRIPT
```

### Bulk screenshot script
To regenerate all `docs/screenshots/` (24 screenshots: 4 select + 20 gameplay):
```bash
node docs/screenshots/capture-all.js
```

---

## When to Run It

Run the check **before reporting a level as complete** whenever you:

- Add a new theme file (`js/themes/*.js`)
- Add new level data to `js/levels.js`
- Change `css/base.css`, `css/screens.css`, or `css/levels.css`
- Add new keys to the regex in `main.js`
- Modify `js/ui/hud.js`, `js/ui/keyboard-preview.js`, or `js/ui/screens.js`
- Rebuild the Go binary (new embed files require a rebuild — verify the theme loads)

---

## What a Passing Screenshot Looks Like

- Center of screen: `TYPE THE LETTER` label and a large glowing letter
- Bottom of screen: a row of small key boxes (the keyboard guide)
- Background: the level's canvas animation visible behind the prompt
- No all-black or all-colored screen that buries the UI elements

If the canvas is rendering *on top of* the screen content, the fix is:
```css
/* css/base.css */
.screen {
  position: relative;
  z-index: 2; /* above canvas (z-index: 1); transparent bg lets canvas show through */
}
```

---

## Go Build Reminder

The Go server uses `embed.FS` — new JS files are baked at compile time. After adding any new theme file:

```bash
go build -o keystroke-kingdom . && ./keystroke-kingdom &
```

Without a rebuild, the new theme files return 404 and the level silently falls back to no theme (or crashes).
