/**
 * keyboard-preview.js
 *
 * Draws an 8-bit partial keyboard + animated finger reach guide
 * on the shared Canvas, shown before the arcade game starts.
 *
 * Layout logic:
 *   - Only keys the player has unlocked so far are visible
 *   - New keys this level = bright accent color ("selected")
 *   - Previously known keys = dimmed accent color
 *   - Everything else = "fog of war" (dark, barely visible silhouette)
 *
 * For reach keys (g, h) and any future reaching-key levels, a
 * pixelated hand animation shows the correct finger stretching
 * toward the new key.
 */

import { KEY_REACH } from '../levels.js';
import { getKeyGeometry, KEYBOARD_UNITS_PER_ROW } from './hud.js';

let canvas, ctx;
let animId = null;
let active = false;
let frame = 0;

// Canvas text can't be reached by the DOM [data-enter-key] swap (js/main.js),
// so this preview resolves the platform label itself — same detection,
// resolved once since platform never changes at runtime.
const ENTER_LABEL = /Mac/.test(navigator.platform || navigator.userAgent) ? 'RETURN' : 'ENTER';

// ─────────────────────────────────────────────────────────────
// Keyboard geometry — derived from the ONE source of truth in hud.js.
//
// getKeyGeometry() returns every key of the true ANSI silhouette with its
// absolute column offset, row index (0 = number row … 4 = space row), width,
// and whether it's a never-taught structural key (Tab/Caps/Enter). This is the
// SAME geometry the in-game keyboard guide draws — so the preview screen and
// the guide can never drift apart again (an early build shipped this preview
// with no number row because the layout was duplicated — see journal F5).
//
// We keep only presentation (labels) local, since labels are how the preview
// chooses to render a key, not where it physically sits.
// ─────────────────────────────────────────────────────────────
const KB_LAYOUT = getKeyGeometry()
  // Drop the pure structural spacers on the space row (Ctrl/Alt/Cmd gaps):
  // they carry no key and are never drawn.
  .filter(k => k.key !== null)
  .map(k => ({
    key: k.key,
    label: previewLabel(k.key),
    row: k.row,
    col: k.col,
    w: k.w,
    never: k.never,
  }));

// How a key is labelled on the preview canvas. Letters show uppercase; the
// eighth key is the '?' it is everywhere in player-facing text (never
// "semicolon"); wide/structural keys spell their name.
function previewLabel(key) {
  if (key === ';') return '?';
  if (key === 'Backspace') return '⌫';
  if (key === 'Shift') return 'SHIFT';
  if (key === ' ') return 'SPACE';
  if (key === 'Tab') return 'TAB';
  if (key === 'Caps') return 'CAPS';
  if (key === 'Enter') return ENTER_LABEL;
  if (/^[a-z]$/.test(key)) return key.toUpperCase();
  return key;
}

function getCanvas() {
  if (!canvas) {
    canvas = document.getElementById('invaders-canvas');
    ctx = canvas.getContext('2d');
  }
  return canvas;
}

// ─────────────────────────────────────────────────────────────
// Colour helpers
// ─────────────────────────────────────────────────────────────

function cssVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function keyColor(key, knownKeys, newKeys, never) {
  // Never-taught structural keys (Tab/Caps/Enter) only complete the silhouette —
  // they're permanent fog and can never be "learned" or highlighted.
  if (!never) {
    if (newKeys.includes(key)) {
      return { border: cssVar('--level-accent'), text: cssVar('--level-accent'), glow: true, fog: false };
    }
    if (knownKeys.includes(key)) {
      return { border: cssVar('--level-accent-dim'), text: cssVar('--level-accent-dim'), glow: false, fog: false };
    }
  }
  // Fog of war — barely visible silhouette only
  return { border: '#111', text: '#111', glow: false, fog: true };
}

// ─────────────────────────────────────────────────────────────
// Drawing: keyboard
// ─────────────────────────────────────────────────────────────

function drawKeyboard(knownKeys, newKeys, unitSize, kbOriginX, kbOriginY) {
  const rowGap = unitSize * 1.15;

  for (const k of KB_LAYOUT) {
    const x = kbOriginX + k.col * unitSize;
    const y = kbOriginY + k.row * rowGap;
    const wUnits = k.w || 1;
    const w = unitSize * wUnits - 3;
    const h = unitSize - 3;

    const col = keyColor(k.key, knownKeys, newKeys, k.never);

    if (col.fog) {
      // Fog key: dark box with a barely-visible border — shape hint, no label
      ctx.fillStyle = '#080808';
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      continue;
    }

    // Known or new key
    ctx.fillStyle = col.glow ? col.border + '18' : '#111';
    ctx.strokeStyle = col.border;
    ctx.lineWidth = col.glow ? 2 : 1;

    if (col.glow) {
      ctx.shadowColor = col.border;
      ctx.shadowBlur = 10 + Math.sin(frame * 0.08) * 4;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.shadowBlur = 0;

    // Label — wide keys (SHIFT, SPACE, multi-char labels) scale down to fit
    const isWideLabel = k.label.length > 1;
    const fontSize = isWideLabel
      ? Math.max(5, Math.floor(unitSize * 0.2))
      : Math.max(6, Math.floor(unitSize * 0.32));
    ctx.font = `${fontSize}px "Press Start 2P", monospace`;
    ctx.fillStyle = col.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (col.glow) {
      ctx.shadowColor = col.text;
      ctx.shadowBlur = 6;
    }
    ctx.fillText(k.label, x + w / 2, y + h / 2);
    ctx.shadowBlur = 0;
  }
}

// ─────────────────────────────────────────────────────────────
// Drawing: pixel-art hand (top-down view)
//
// Draws a simple top-down hand illustration below the keyboard.
// Each finger is a small rectangle, palm is a wider block underneath.
// The active (reaching) finger gets the accent color + glow + upward lift.
// ─────────────────────────────────────────────────────────────

// Finger order in the array: [pinky, ring, middle, index] for left hand
// For right hand it's mirrored: [index, middle, ring, pinky]
// Spacing matches home-row key positions.

function drawPixelHand(hand, unitSize, kbOriginX, handBaseY, reachKey) {
  const isLeft = hand === 'left';
  const accent = cssVar('--level-accent');
  const dim    = cssVar('--level-accent-dim') || '#2a4a2a';

  // Home column positions (centre of each key, in canvas coords)
  // Left:  a=pinky(0), s=ring(1), d=middle(2), f=index(3)
  // Right: j=index(3), k=middle(2), l=ring(1), ;=pinky(0)
  const homeKeys = isLeft
    ? ['a', 's', 'd', 'f']   // finger 0..3 (pinky→index)
    : ['j', 'k', 'l', ';'];  // finger 3..0 (index→pinky) — stored index-first for drawing

  const fingerCentres = homeKeys.map(k => {
    const def = KB_LAYOUT.find(kd => kd.key === k);
    return def ? kbOriginX + def.col * unitSize + (unitSize - 3) / 2 : 0;
  });

  const reach = reachKey ? KEY_REACH[reachKey] : null;

  // Which finger index (0=pinky,1=ring,2=middle,3=index) is the reach finger?
  // For right hand the array is ordered [index=0, middle=1, ring=2, pinky=3] in fingerCentres
  // so we need to map reach.finger (0=pinky,3=index) to our array index
  const reachFingerArrayIdx = reach
    ? (isLeft ? reach.finger : (3 - reach.finger))
    : -1;

  const reachTarget = reachKey
    ? (() => {
        const def = KB_LAYOUT.find(kd => kd.key === reachKey);
        return def ? kbOriginX + def.col * unitSize + (unitSize - 3) / 2 : null;
      })()
    : null;

  // Animate: smooth 0→1→0 pulse
  const reachAnim = reach ? (Math.sin(frame * 0.07) * 0.5 + 0.5) : 0;

  const fw = Math.max(6,  Math.floor(unitSize * 0.38)); // finger width
  const fh = Math.max(14, Math.floor(unitSize * 0.75)); // finger height (top-down = length)
  const gap = 3; // gap between finger and palm

  // ── Palm ──────────────────────────────────────────────────
  // Spans from pinky to index (or vice versa)
  const leftmostX  = Math.min(...fingerCentres) - fw / 2 - 2;
  const rightmostX = Math.max(...fingerCentres) + fw / 2 + 2;
  const palmW = rightmostX - leftmostX;
  const palmH = Math.max(12, Math.floor(unitSize * 0.55));
  const palmY = handBaseY + fh + gap;

  ctx.fillStyle = dim;
  ctx.shadowBlur = 0;
  ctx.fillRect(Math.round(leftmostX), Math.round(palmY), Math.round(palmW), palmH);

  // Thumb stub — points inward toward center (toward spacebar)
  const thumbW = Math.floor(fw * 0.8);
  const thumbH = Math.floor(palmH * 0.7);
  const thumbX = isLeft
    ? rightmostX + 2           // left hand: thumb is on the right/inner side
    : leftmostX - thumbW - 2;  // right hand: thumb is on the left/inner side
  ctx.fillRect(Math.round(thumbX), Math.round(palmY + palmH * 0.15), thumbW, thumbH);

  // ── Fingers ───────────────────────────────────────────────
  for (let i = 0; i < fingerCentres.length; i++) {
    const isReachFinger = i === reachFingerArrayIdx && reach && reach.hand === hand;

    // Reaching finger: slide toward target + lift (reduce Y)
    let cx = fingerCentres[i];
    let lift = 0;
    if (isReachFinger && reachTarget !== null) {
      cx  = fingerCentres[i] + (reachTarget - fingerCentres[i]) * reachAnim;
      lift = reachAnim * Math.floor(unitSize * 0.4);
    }

    const fx = Math.round(cx - fw / 2);
    const fy = Math.round(handBaseY - lift);

    const color = isReachFinger ? accent : dim;
    ctx.fillStyle = color;

    if (isReachFinger) {
      ctx.shadowColor = color;
      ctx.shadowBlur  = 8 + reachAnim * 8;
    } else {
      ctx.shadowBlur = 0;
    }

    // Finger body — two pixel-art segments (tip + body)
    const tipH  = Math.max(4, Math.floor(fh * 0.28));
    const bodyH = fh - tipH;
    const tipW  = Math.max(4, fw - 2);

    // Rounded tip (1px narrower each side)
    ctx.fillRect(fx + 1, fy, tipW, tipH);
    // Body
    ctx.fillRect(fx, fy + tipH, fw, bodyH);

    ctx.shadowBlur = 0;
  }
}

// ─────────────────────────────────────────────────────────────
// Drawing: reach arrow annotation
// ─────────────────────────────────────────────────────────────

function drawReachArrow(reachKey, unitSize, kbOriginX, kbOriginY) {
  const reach = KEY_REACH[reachKey];
  if (!reach || !reach.reach) return;

  const homeKey = reach.hand === 'left' ? 'f' : 'j';
  const homeKeyDef = KB_LAYOUT.find(k => k.key === homeKey);
  const reachKeyDef = KB_LAYOUT.find(k => k.key === reachKey);
  if (!homeKeyDef || !reachKeyDef) return;

  const rowY = kbOriginY + homeKeyDef.row * unitSize * 1.15;
  const homeX = kbOriginX + homeKeyDef.col * unitSize + unitSize / 2;
  const targetX = kbOriginX + reachKeyDef.col * unitSize + unitSize / 2;
  const arrowY = rowY - unitSize * 1.4 - Math.sin(frame * 0.05) * 3;

  const color = cssVar('--level-accent');
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.lineWidth = 2;

  // Dashed horizontal arrow line
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(homeX, arrowY);
  ctx.lineTo(targetX, arrowY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrowhead
  const dir = targetX > homeX ? 1 : -1;
  ctx.beginPath();
  ctx.moveTo(targetX, arrowY);
  ctx.lineTo(targetX - dir * 6, arrowY - 4);
  ctx.lineTo(targetX - dir * 6, arrowY + 4);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
}

// ─────────────────────────────────────────────────────────────
// Drawing: instruction label
// ─────────────────────────────────────────────────────────────

function drawLabel(text, x, y, color, glowAmt) {
  const fontSize = Math.max(7, Math.floor(canvas.width * 0.012));
  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (glowAmt) {
    ctx.shadowColor = color;
    ctx.shadowBlur = glowAmt;
  }
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
}

// ─────────────────────────────────────────────────────────────
// Main render loop
// ─────────────────────────────────────────────────────────────

let _knownKeys = [];
let _newKeys = [];
let _hint = null;

function render() {
  if (!active) return;
  frame++;

  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // Scale so the full keyboard fits at ~80% of screen width.
  // Same 15-unit-per-row grid the in-game guide uses (shared constant).
  const targetKbWidth = Math.min(W * 0.80, 980);
  const unitSize = Math.floor(targetKbWidth / KEYBOARD_UNITS_PER_ROW);

  // Measure true left/right extents of key content (col + key width, accounting for wide keys)
  const minCol = Math.min(...KB_LAYOUT.map(k => k.col));
  const maxCol = Math.max(...KB_LAYOUT.map(k => k.col + (k.w || 1)));
  const contentW = (maxCol - minCol) * unitSize;
  const kbOriginX = Math.round((W - contentW) / 2 - minCol * unitSize);

  // Rows measured from the layout (0 = number row … 4 = space row)
  const minRow = Math.min(...KB_LAYOUT.map(k => k.row));
  const maxRow = Math.max(...KB_LAYOUT.map(k => k.row));
  const rowCount = maxRow - minRow + 1;
  const kbTotalH = rowCount * unitSize * 1.15;
  // Place keyboard in upper-middle of viewport — leave bottom 35% for hands
  let kbOriginY = H * 0.42 - kbTotalH / 2 - minRow * unitSize * 1.15;

  // The DOM header (.kbp-header title + subtitle + .kbp-legend row, see
  // css/screens.css) occupies a fixed band at the top of this screen —
  // measured ~48px–107px regardless of level (font sizes are constant;
  // title text length doesn't grow that band). The canvas also draws its
  // own "NEW KEYS" / reach-hint label just above the keyboard's top row
  // (see labelY below). Once the keyboard geometry grew to include the
  // number row (row 0), the silhouette's top row — and therefore that
  // label — could land underneath/overlapping the DOM header (see journal:
  // preview header overlap, all-level regression). Reserve a fixed vertical
  // budget here so the label always clears the DOM header, on every level,
  // without touching the keyboard geometry itself.
  const rawKbTop = kbOriginY + minRow * unitSize * 1.15;
  const labelClearance = unitSize * 1.6; // space the label needs above kbTop
  const domHeaderBottom = 116; // DOM header + legend bottom, fixed across levels
  // labelY (below) is the label's CENTER (textBaseline 'middle'), so clearing
  // the header means clearing half the glyph height PLUS the pulsing glow —
  // budgeting only to the centerline left the label's top half overlapping the
  // legend row on every level (Trevor's report, 2026-07-12).
  const labelFontSize = Math.max(7, Math.floor(W * 0.012));
  const labelPad = Math.ceil(labelFontSize / 2) + 12; // half-height + glow bleed
  const minKbTop = domHeaderBottom + labelPad + labelClearance;
  if (rawKbTop < minKbTop) {
    kbOriginY += (minKbTop - rawKbTop);
  }

  // Draw keyboard
  drawKeyboard(_knownKeys, _newKeys, unitSize, kbOriginX, kbOriginY);

  // Draw reach arrows for each new key that requires reaching
  for (const key of _newKeys) {
    const reach = KEY_REACH[key];
    if (reach && reach.reach) {
      drawReachArrow(key, unitSize, kbOriginX, kbOriginY);
    }
  }

  // Draw hands — sit clearly below the keyboard with breathing room
  // handBaseY = top of the finger tips, so fingers extend downward from there
  const rowGap = unitSize * 1.15;
  const kbBottom = kbOriginY + (maxRow + 1) * rowGap;
  const handBaseY = kbBottom + unitSize * 0.8;

  // Determine which new reach keys belong to each hand
  const leftReachKey  = _newKeys.find(k => KEY_REACH[k]?.hand === 'left'  && KEY_REACH[k]?.reach);
  const rightReachKey = _newKeys.find(k => KEY_REACH[k]?.hand === 'right' && KEY_REACH[k]?.reach);

  drawPixelHand('left',  unitSize, kbOriginX, handBaseY, leftReachKey  || null);
  drawPixelHand('right', unitSize, kbOriginX, handBaseY, rightReachKey || null);

  // Labels above keyboard (above the topmost row, whatever its row index is)
  const kbTop = kbOriginY + minRow * rowGap;
  const labelY = kbTop - unitSize * 1.6;
  const accent = cssVar('--level-accent');
  const accentDim = cssVar('--level-accent-dim');

  if (_newKeys.length > 0) {
    const hasReach = _newKeys.some(k => KEY_REACH[k]?.reach);
    const glow = 8 + Math.sin(frame * 0.05) * 3;

    if (_hint) {
      drawLabel(_hint, W / 2, labelY, accent, glow);
    } else if (hasReach) {
      const FINGER_NAMES = ['PINKY', 'RING', 'MIDDLE', 'INDEX', 'THUMB'];
      const fingers = [...new Set(_newKeys.filter(k => KEY_REACH[k]?.reach).map(k => KEY_REACH[k].finger))];
      const label = 'STRETCH YOUR ' + fingers.map(f => FINGER_NAMES[f]).join(' AND ') + ' FINGERS';
      drawLabel(label, W / 2, labelY, accent, glow);
    } else {
      const keyNames = _newKeys.map(k => (k === ';' ? '?' : k === ',' ? ',' : k === '.' ? '.' : k === '/' ? '/' : k.toUpperCase())).join(' AND ');
      drawLabel('NEW KEYS: ' + keyNames, W / 2, labelY, accent, glow);
    }
  }

  // "Press space" prompt — drawn on canvas at the very bottom, always visible
  const blinkOn = Math.floor(frame / 30) % 2 === 0;
  if (blinkOn) {
    drawLabel(
      'PRESS SPACE TO CONTINUE',
      W / 2,
      H - 40,
      cssVar('--crt-green') || '#39ff14',
      4
    );
  }

  animId = requestAnimationFrame(render);
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Start the keyboard preview animation.
 * @param {string[]} knownKeys  - All keys the player knows including new ones
 * @param {string[]} newKeys    - Keys being introduced this level
 * @param {string}  [hint]      - Optional label override (from level data)
 */
export function start(knownKeys, newKeys, hint = null) {
  getCanvas();
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  _knownKeys = knownKeys;
  _newKeys   = newKeys;
  _hint      = hint || null;
  frame      = 0;
  active     = true;

  render();
}

export function stop() {
  active = false;
  if (animId) cancelAnimationFrame(animId);
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  animId = null;
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
