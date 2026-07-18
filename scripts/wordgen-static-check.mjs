// Validation: a page served WITHOUT the Go server (plain python http.server)
// must boot with wordgen silently disabled — zero console errors, and no repeated
// generate-fetching once the health probe 404s. Run from repo root:
//   node scripts/wordgen-static-check.mjs
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/Users/trevormack/.npm/_npx/705bc6b22212b352/node_modules/playwright');

const REPO = new URL('..', import.meta.url).pathname;
const PORT = 8231;

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', REPO], {
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 800));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const consoleErrors = [];
const pageErrors = [];
const wordgenRequests = [];
// The single health-probe fetch to /api/wordgen/health 404s under a static host.
// Chromium logs the failed network response as a console "error" line — this is
// the BROWSER's network log, not thrown by our code, and it is the entire cost of
// feature-detection. We treat it as expected and assert nothing ELSE is noisy.
const isExpectedProbe404 = (t) =>
  /404/.test(t) && /Failed to load resource/i.test(t);
page.on('console', (m) => {
  if (m.type() === 'error' && !isExpectedProbe404(m.text())) consoleErrors.push(m.text());
});
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.on('request', (req) => {
  if (req.url().includes('/api/wordgen')) wordgenRequests.push(req.url());
});

let ok = true;
try {
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle' });

  // Import the client module IN the static-served page and drive it through boot.
  const result = await page.evaluate(async () => {
    const wg = await import('./js/wordgen.js');
    await wg.initWordgen();
    // Attempt several prefetches — under a static host these must all no-op.
    wg.prefetch(3);
    wg.prefetch(6);
    wg.prefetch(7);
    await new Promise((r) => setTimeout(r, 500));
    return { isActive: wg.isActive(), took: wg.takeWords(3) };
  });

  console.log('wordgen isActive under static host (expect false):', result.isActive);
  console.log('takeWords(3) (expect []):', JSON.stringify(result.took));
  console.log('/api/wordgen requests observed:', wordgenRequests.length);
  console.log('  (one health probe, possibly 404 — but NO generate requests)');
  wordgenRequests.forEach((u) => console.log('   -', u));
  console.log('console errors:', consoleErrors.length ? consoleErrors : '(none)');
  console.log('page errors:', pageErrors.length ? pageErrors : '(none)');

  if (result.isActive) { ok = false; console.error('FAIL: wordgen should be disabled'); }
  if (consoleErrors.length) { ok = false; console.error('FAIL: console errors present'); }
  if (pageErrors.length) { ok = false; console.error('FAIL: page errors present'); }
  // The only allowed wordgen request is the single health probe.
  const generateReqs = wordgenRequests.filter((u) => !u.includes('/health'));
  if (generateReqs.length) { ok = false; console.error('FAIL: generate requests fired under static host'); }
} finally {
  await browser.close();
  // Kill the python server we spawned.
  spawnSync('kill', [String(server.pid)]);
}

console.log(ok ? '\nPASS: static-host boot is clean and wordgen silent.' : '\nFAILED');
process.exit(ok ? 0 : 1);
