import { FINGER_MAP } from '../levels.js';

const $ = (id) => document.getElementById(id);

// ─────────────────────────────────────────────────────────────────────────
// Small-glyph prompt legibility (journal O11: "font glyph coverage is a
// silent failure class"). Press Start 2P renders several punctuation marks
// as near-invisible specks at the prompt's normal size — worst offender is
// the backtick, which draws as a single stray pixel in the upper-left of
// its box (see docs/screenshots/levels/act5-full-circle/23-missile-command.png).
//
// Fix has two parts, both scoped to the handful of characters that need it:
//   1. These tokens get a large size/weight boost in the prompt (CSS class
//      injected below) so the mark itself is unmistakable at a glance.
//   2. The genuinely ambiguous marks (backtick, apostrophe, comma, period —
//      easily confused with each other or just "a dot") also get a tiny,
//      quiet caption underneath using the game's own established kid-facing
//      names (levels.js hint text calls the backtick a "tick mark"; the
//      product docs use "comma"/"period"/"apostrophe" directly — never
//      inventing new names, never "semicolon" for the eighth key).
// Normal letters, digits, and the existing ␣/⌫/⇧ glyphs are untouched.
const SMALL_GLYPH_BOOST = new Set(['`', "'", ',', '.', '-', '=']);
const SMALL_GLYPH_CAPTION = {
  '`': 'TICK MARK',
  "'": 'APOSTROPHE',
  ',': 'COMMA',
  '.': 'PERIOD',
};

// Injected once. (Historical note: this was injected rather than written into
// css/screens.css because a concurrent agent owned that file at the time. The
// guide's twin rule, `.key-box-mark`, IS in css/screens.css beside
// `.key-box-glyph`, which is where it belongs.)
function ensureSmallGlyphStyles() {
  if ($('kk-small-glyph-styles')) return;
  const style = document.createElement('style');
  style.id = 'kk-small-glyph-styles';
  style.textContent = `
    .prompt-letter.small-glyph {
      font-size: 64px;
      font-weight: normal;
      line-height: 1;
    }
    .prompt-letter.small-glyph.active {
      /* the mark itself stays the hero — just much bigger, same glow language */
      text-shadow: 0 0 15px var(--level-accent), 0 0 46px color-mix(in srgb, var(--level-accent) 35%, transparent);
    }
    .home-row-diagram { display: block; margin: 0 auto; image-rendering: pixelated; }
    .home-row-caption {
      margin-top: 8px;
      font-size: 7px;
      letter-spacing: 2px;
      color: #9fdfb4;            /* welcoming, not the nudge red */
      text-align: center;
    }
    .prompt-caption {
      margin-top: 6px;
      font-size: 9px;
      letter-spacing: 2px;
      color: #999;
      text-align: center;
      min-height: 11px;
    }
  `;
  document.head.appendChild(style);
}

// WPM is informational only — never enforced, never a failure condition.
// Standard convention: one "word" = 5 correct keystrokes. Returns null until
// 10 seconds have elapsed (not enough signal yet to show a meaningful rate).
export function computeWPM(state) {
  const elapsedMin = state.startTime ? (Date.now() - state.startTime) / 60000 : 0;
  if (elapsedMin < 10 / 60) return null;
  return Math.round((state.totalCorrect / 5) / elapsedMin);
}

function totalMistakeCount(state) {
  return Object.values(state.mistakes || {}).reduce((sum, n) => sum + n, 0);
}

// mistakeDisplay setting: 'hidden' removes the accuracy line entirely,
// 'small' is the original shipped behavior, 'prominent' brightens the line
// and adds a running mistake-count line. Never alarming — see product.md
// "Stats Are Present But Never Looming."
export function updateHUD(state, settings) {
  const mistakeDisplay = settings ? settings.mistakeDisplay : 'small';
  const statsVisible = settings ? settings.statsVisible : true;

  const acc = state.totalAttempts > 0
    ? Math.round((state.totalCorrect / state.totalAttempts) * 100)
    : 100;

  const accLine = $('hud-accuracy-line');
  const missLine = $('hud-mistakes-line');
  if (accLine) {
    accLine.classList.toggle('hidden', !statsVisible || mistakeDisplay === 'hidden');
    accLine.classList.toggle('mistakes-prominent', mistakeDisplay === 'prominent');
  }
  if (missLine) {
    missLine.classList.toggle('hidden', !statsVisible || mistakeDisplay !== 'prominent');
  }
  $('hud-accuracy').textContent = acc + '%';
  $('hud-mistakes').textContent = String(totalMistakeCount(state));
  $('hud-streak').textContent = state.streak;

  if (state.freePlay) {
    const wpm = computeWPM(state);
    $('hud-wpm').textContent = wpm === null ? '--' : String(wpm);
  }
}

// SURVIVAL ONLY. Renders the quarters (lives) line as filled/empty dots —
// same "small corner scoreboard" HUD language as everything else. Never a
// lives-lost punishment display; it only appears when the player opted in.
export function renderQuarters(remaining, total) {
  const line = $('hud-quarters-line');
  if (!line) return;
  const dots = [];
  for (let i = 0; i < total; i++) {
    dots.push(i < remaining ? '●' : '○');
  }
  $('hud-quarters').textContent = dots.join(' ');
}

export function flashBonusQuarter() {
  const el = $('hud-bonus');
  if (!el) return;
  el.classList.remove('hidden');
  void el.offsetWidth;
  el.classList.remove('hidden');
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
  setTimeout(() => el.classList.add('hidden'), 1500);
}

// hintStyle setting adjusts WHEN a hint appears, not what it says:
//  - 'obvious'  : main.js also calls this proactively when a new pattern
//                 renders (handled in main.js, not here)
//  - 'moderate' : original shipped behavior — hint on every wrong key
//  - 'subtle'   : main.js only calls this after 2+ mistakes on the same
//                 expected letter (the counting lives in main.js, since it
//                 already tracks state.mistakes)
// This function only ever renders; main.js decides whether to call it.
export function showFingerHint(expectedKey) {
  const hint = $('finger-hint');
  const label = /^[A-Z]$/.test(expectedKey)
    ? 'HOLD SHIFT, THEN THE LETTER'
    : (FINGER_MAP[expectedKey] || 'TRY AGAIN');
  hint.innerHTML = `<div class="finger-hint-text">${label}</div>`;
}

// ─── The first-prompt home-row diagram ──────────────────────────────────────
// `.claude/rules/transitions.md` Phase 5 and `levels/onboarding.md` both promise
// this and have since the game was designed:
//
//   "Before the player can press anything, a finger position diagram fades in
//    gently beneath it — two hands, home row position, J and F highlighted. This
//    is the ONLY TIME the finger guide appears without being asked for. No other
//    level, no other prompt, ever shows it proactively. This one moment gets
//    training wheels because the player has zero context yet."
//
// A playtest lane went looking for it on 2026-09-13 and it was not there: at the
// very first prompt `#finger-hint` is empty, and the first orientation a brand-new
// five-year-old gets is a TEXT hint after their first MISTAKE. The single most
// carefully specified ten seconds in the whole design shipped as nothing.
//
// Deliberately static and quiet — it "just sits there". No animation, nothing to
// dismiss, and it cannot steal a keypress. main.js decides when it appears (once,
// on a brand-new game at Level 1) and clears it on the first correct key.
export function showHomeRowDiagram() {
  const host = $('finger-hint');
  if (!host) return;
  const W = 236, H = 78;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  c.className = 'home-row-diagram';
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const KEY = 20, GAP = 2, TOP = 6;
  const left  = ['A', 'S', 'D', 'F'];
  const right = ['J', 'K', 'L', '?'];
  const rowW  = 4 * KEY + 3 * GAP;
  const lx = 10, rx = W - 10 - rowW;

  // The eight home keys, with F and J lit — they are where the hands LAND.
  const drawRow = (x0, labels, litIndex) => {
    labels.forEach((ch, i) => {
      const x = x0 + i * (KEY + GAP);
      const lit = i === litIndex;
      ctx.fillStyle = lit ? 'rgba(120,255,160,0.20)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(x, TOP, KEY, KEY);
      ctx.strokeStyle = lit ? '#78ffa0' : '#3a3a3a';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, TOP + 0.5, KEY - 1, KEY - 1);
      ctx.fillStyle = lit ? '#b8ffcf' : '#7a7a7a';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch, x + KEY / 2, TOP + KEY / 2 + 1);
    });
  };
  drawRow(lx, left, 3);    // F is the left index finger
  drawRow(rx, right, 0);   // J is the right index finger

  // A hand under each row: four fingers reaching up to the four keys, and a
  // palm. The index finger — the one that matters here — is lit and longer.
  const drawHand = (x0, litIndex) => {
    const palmY = TOP + KEY + 16;
    for (let i = 0; i < 4; i++) {
      const x = x0 + i * (KEY + GAP) + KEY / 2 - 3;
      const lit = i === litIndex;
      const len = lit ? 16 : 11;
      ctx.fillStyle = lit ? '#78ffa0' : '#4a4a4a';
      ctx.fillRect(x, palmY - len, 6, len);
    }
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x0 + 2, palmY, rowW - 4, 9);
  };
  drawHand(lx, 3);
  drawHand(rx, 0);

  host.innerHTML = '';
  host.appendChild(c);
  // NOT `.finger-hint-text`, which is --nudge-red: that colour belongs to the
  // response to a MISTAKE. This hint arrives before the child can make one, so
  // colouring it like an error would make the game's first words to a
  // five-year-old look like a telling-off.
  const cap = document.createElement('div');
  cap.className = 'home-row-caption';
  cap.textContent = 'REST YOUR FINGERS HERE';   // never an instruction to press
  host.appendChild(cap);
}

export function displayKey(k) {
  if (k === ';') return '?';
  if (k === 'Shift') return '⇧';
  if (k === ' ') return '␣';
  if (k === 'Backspace') return '⌫';
  if (k === ',') return ',';
  if (k === '.') return '.';
  if (k === '/') return '/';
  if (/^[A-Z]$/.test(k)) return k;
  return k.toUpperCase();
}

// A key-box (or prompt-letter) display label counts as a "glyph" if it's a
// multi-character label (e.g. wide key names) or one of the special symbol
// glyphs — these get a smaller font-size class so they fit their box.
function isGlyphLabel(label) {
  return label.length > 1 || label === '⇧' || label === '␣' || label === '⌫';
}

// The keyboard guide's twin of SMALL_GLYPH_BOOST. Press Start 2P draws an
// apostrophe, comma, period and backtick as a ONE-TO-TWO PIXEL speck, so at the
// key box's normal letter size those four keys read as empty boxes with a bit of
// dust in them — on exactly the four levels that teach them (13 comma, 14 period,
// 22 backslash-and-brackets, 23 backtick-and-apostrophe).
//
// The fix for this already existed for the PROMPT — `SMALL_GLYPH_BOOST` plus the
// `.small-glyph` rule, added citing journal O11 ("screenshot any symbol you
// render"). It was simply never extended to the guide, because `isGlyphLabel`
// only asks "is this label long or a special glyph?" and these are single
// characters. An a11y audit photographed the result on 2026-09-13: Level 14's
// comma is a 2px blob and its period a single dot; Level 23's apostrophe is a
// single dot. Same set, same reason, opposite direction — `.key-box-glyph`
// SHRINKS multi-character labels like SHIFT, so the marks need their own class.
function isSmallMarkLabel(label) {
  return label.length === 1 && SMALL_GLYPH_BOOST.has(label);
}

// True ANSI keyboard geometry — the guide is a real keyboard silhouette.
// Every key sits at its actual physical position with authentic row
// staggers and key widths (Tab 1.5u, Caps 1.75u, Shift 2.25u, ...).
// `w` is the key's width in units. Keys the game never teaches (Tab,
// Caps, Enter) render as permanent fog shapes — they complete the
// silhouette so learned keys sit exactly where real fingers find them.
// Each row's unit-widths sum to 15, so all rows align to the same frame.
const KEY_LAYOUT = [
  [
    { k: '`' }, { k: '1' }, { k: '2' }, { k: '3' }, { k: '4' }, { k: '5' },
    { k: '6' }, { k: '7' }, { k: '8' }, { k: '9' }, { k: '0' }, { k: '-' },
    { k: '=' }, { k: 'Backspace', w: 2 },
  ],
  [
    { k: 'Tab', w: 1.5, never: true },
    { k: 'q' }, { k: 'w' }, { k: 'e' }, { k: 'r' }, { k: 't' }, { k: 'y' },
    { k: 'u' }, { k: 'i' }, { k: 'o' }, { k: 'p' }, { k: '[' }, { k: ']' },
    { k: '\\', w: 1.5 },
  ],
  [
    { k: 'Caps', w: 1.75, never: true },
    { k: 'a' }, { k: 's' }, { k: 'd' }, { k: 'f' }, { k: 'g' }, { k: 'h' },
    { k: 'j' }, { k: 'k' }, { k: 'l' }, { k: ';' }, { k: "'" },
    { k: 'Enter', w: 2.25, never: true },
  ],
  [
    { k: 'Shift', w: 2.25 },
    { k: 'z' }, { k: 'x' }, { k: 'c' }, { k: 'v' }, { k: 'b' }, { k: 'n' },
    { k: 'm' }, { k: ',' }, { k: '.' }, { k: '/' },
    { k: 'Shift', w: 2.75 },
  ],
  [
    { k: null, w: 3.75 },           // spacer where Ctrl/Alt/Cmd live
    { k: ' ', w: 6.25 },
    { k: null, w: 5 },
  ],
];

// Each row of KEY_LAYOUT sums to this many units; every renderer uses it to
// keep rows aligned to one frame. Exported so the "KNOW YOUR KEYS" preview
// scales to the exact same 15-unit grid as the in-game guide.
export const KEYBOARD_UNITS_PER_ROW = 15;

// The number of physical keyboard rows (number row through the space row).
export const KEYBOARD_ROW_COUNT = KEY_LAYOUT.length;

// SINGLE SOURCE OF TRUTH for keyboard geometry.
// Flattens KEY_LAYOUT into absolute-positioned key descriptors by walking each
// row left-to-right and accumulating unit widths. The in-game guide renders
// KEY_LAYOUT sequentially; the "KNOW YOUR KEYS" canvas preview needs absolute
// column offsets to draw the same silhouette — so both derive from THIS array
// and there is exactly one place that defines where each key physically sits.
//
// Returned descriptor per key:
//   key   - the token ('a', ';', 'Backspace', ' ', 'Shift', ...) — null for
//           structural spacers (Ctrl/Alt/Cmd gaps on the space row)
//   row   - 0 = number row, 1 = Q row, 2 = home row, 3 = Z row, 4 = space row
//   col   - absolute left-edge offset in units from the row's left edge
//   w     - key width in units
//   never - true for keys the game never teaches (Tab, Caps, Enter) — they
//           complete the silhouette but are never learnable/highlightable
export function getKeyGeometry() {
  const keys = [];
  KEY_LAYOUT.forEach((row, rowIdx) => {
    let col = 0;
    for (const spec of row) {
      const w = spec.w || 1;
      keys.push({
        key: spec.k,
        row: rowIdx,
        col,
        w,
        never: !!spec.never,
      });
      col += w;
    }
  });
  return keys;
}

export function renderKeyboard(level, activeKey, wrongKey, state) {
  const guide = $('keyboard-guide');

  const GAP = 4;
  const available = Math.min((window.innerWidth || 1280) - 96, 820);
  // 15 units per row; a multi-unit key spans (unit*w + GAP*(w-1)) so all
  // row widths stay equal and columns line up across rows.
  const unit = Math.max(22, Math.min(42, Math.floor((available - GAP * 14) / 15)));
  const px = (w) => Math.round(unit * w + GAP * (w - 1));
  guide.style.setProperty('--key-size', unit + 'px');
  guide.style.setProperty('--key-gap', GAP + 'px');

  const isUpperActive = /^[A-Z]$/.test(activeKey || '');

  const keyBox = ({ k, w = 1, never = false }) => {
    if (k === null) {
      return `<div class="key-spacer" style="width:${px(w)}px"></div>`;
    }
    const learned = !never && level.keys.includes(k);
    const isShiftBox = k === 'Shift';
    // When the active key is an uppercase letter, highlight BOTH Shift boxes
    // and the lowercase letter box (activeKey 'A' should light the 'a' box).
    const matchesActive = activeKey === k
      || (isUpperActive && isShiftBox)
      || (isUpperActive && activeKey.toLowerCase() === k);

    let cls = 'key-box';
    let label = '';
    if (wrongKey === k) { cls += ' wrong-key'; label = displayKey(k); }
    else if (matchesActive) { cls += ' active-key'; label = displayKey(k); }
    else if (!learned) { cls += ' fog'; }  // shape only — key not learned yet
    else if (k === ';' && state.level === 4) { cls += ' mystery'; label = displayKey(k); }
    else { cls += ' highlight'; label = displayKey(k); }

    if (label && isGlyphLabel(label)) cls += ' key-box-glyph';
    else if (label && isSmallMarkLabel(label)) cls += ' key-box-mark';
    return `<div class="${cls}" style="width:${px(w)}px">${label}</div>`;
  };

  guide.innerHTML = KEY_LAYOUT
    .map(row => `<div class="key-row">${row.map(keyBox).join('')}</div>`)
    .join('');
}

// Shared token -> prompt display mapping. Preserves letter case (lowercase
// letters render lowercase, uppercase A-Z stay uppercase) unlike displayKey,
// which always uppercases plain letters for the keyboard guide.
function promptDisplay(token) {
  if (token === ';') return '?';
  if (token === ' ') return '␣';
  if (token === 'Backspace') return '⌫';
  return token;
}

export function renderPrompt(state, level, pattern) {
  ensureSmallGlyphStyles();

  const seq = $('prompt-sequence');
  seq.innerHTML = pattern.map((letter, i) => {
    let cls = 'prompt-letter';
    if (i < state.currentIndex) cls += ' completed';
    else if (i === state.currentIndex) cls += ' active';
    const display = promptDisplay(letter);
    if (display === '␣' || display === '⌫' || display === '⇧') cls += ' glyph';
    if (SMALL_GLYPH_BOOST.has(letter)) cls += ' small-glyph';
    return `<div class="${cls}" data-index="${i}">${display}</div>`;
  }).join('');

  // Quiet caption for the genuinely ambiguous marks — only shown for the
  // character the player is on right now, never for completed/upcoming ones.
  // Lives in a dedicated element so it never collides with the finger-hint
  // (which still only appears after a wrong keypress).
  let caption = $('kk-prompt-caption');
  if (!caption) {
    caption = document.createElement('div');
    caption.id = 'kk-prompt-caption';
    caption.className = 'prompt-caption';
    seq.insertAdjacentElement('afterend', caption);
  }
  const activeLetter = pattern[state.currentIndex];
  caption.textContent = SMALL_GLYPH_CAPTION[activeLetter] || '';

  renderKeyboard(level, pattern[state.currentIndex], null, state);
  $('finger-hint').innerHTML = '';


}
