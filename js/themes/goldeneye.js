// GoldenEye 007 — Rare, N64, 1997 — Level 17
//
// The living-room multiplayer GoldenEye made famous: a 2x2 SPLIT-SCREEN, FOUR
// FRIENDS IN ONE ARENA. Each quadrant is one friend's first-person view of the
// SAME facility, and — the thing anybody remembers about a LAN night — you can
// SEE YOUR FRIENDS in your own quarter of the screen, walking the same halls.
//
// Trevor, 2026-09-14 (theme-authoring.md "DEPICTING THE FORMAT IS NOT DEPICTING
// THE MECHANIC"):
//   "it was a local lan with a quadrant split screen and we should be able to see
//    the players see each other and interact as they explore their level. Going in
//    grates, climbing stairs, exploring cells, and silos etc."
//
// The 2026-09-14 rebuild got the IDEA right (one shared arena) but drew it as four
// tiny top-down route maps, dim and murky, with 7px agents — a persona playtest
// (2026-10-29) found a six-year-old could not read it. So this version draws what
// the split screen actually LOOKED like: each quadrant a bright, flat-shaded N64
// corridor in perspective, the room ahead being one of the arena's named features
// (STAIRS to climb, a SILO, a row of CELLS, a floor GRATE to duck into), and the
// other three friends as big chunky low-poly figures standing in it — colour-coded,
// name-tagged, and waving "HI!" when they meet. One large shared map in the top
// band shows all four dots in one place, so "same arena" is SEEN, not deduced.
//
// Kid-safe abstraction (binding — research/wiki/games/goldeneye-007.md): "four
// friends on one screen, racing to find hidden gadgets." No weapon is drawn
// anywhere, nobody is ever hit, nothing is ever lost. There are no guards: the
// multiplayer arenas had none, and their removal is a fidelity gain, not a loss.
//
// Typing drives P1: each keystroke walks P1 forward, each completed sequence finds
// a gadget. P2–P4 explore alongside as a loose group (cosmetic attract motion,
// L20-gated — frozen when the tab is unattended; never touches the win gate).
//
// LAYOUT (visual-validation.md, measured at 1280x800): the prompt panel holds
// ~0.40–0.60W x 0.18–0.44H and the keyboard guide ~0.22–0.78W x 0.50–0.82H. So
// each view's vanishing point — where the room and the friends are — sits in that
// quadrant's VISIBLE stage: P1/P2 in the big top-left/top-right regions, P3/P4 in
// the side columns with their floors running into the bottom strip. The shared map
// sits in the top band between the two HUD corners. During victory() the DOM panels
// are hidden, so the celebration may use the centre until the LEVEL COMPLETE card.

import { getWinRatio } from '../settings.js';
// The Act 4 white rabbit is shared by all five Command Center themes and lives in
// terminal.js (the act's hidden-history host) — see easter-eggs.md.
import { resetWhiteRabbit, maybeWhiteRabbit, drawWhiteRabbit } from './terminal.js';

let canvas, ctx, animId;
let active = false;
let t = 0;                 // render-time accumulator (seconds-ish), cosmetic only
let simT = 0;              // ENGAGEMENT-GATED clock: advances only while typing (L20)
let lastKeyMs = 0;

// Win gate: gadgets P1 must find (one per completed letter sequence), scaled by
// the EXPERIENCE win-ratio (theme-authoring.md). Unchanged by the visual rebuild.
const BASE_GADGETS = 5;
let GADGETS_TO_WIN = BASE_GADGETS;
let gadgets = 0;
let hasWon = false;
let gadgetFlash = 0;       // 0..1 P1 view flash on a gadget found

// Victory
let victoryMode = false;
let victoryStartMs = 0;
const VICTORY_MS = 4400;

// ── Bounded FX pools ─────────────────────────────────────────────────────────
let pings = [];
const MAX_PINGS = 40;
let confetti = [];
const MAX_CONFETTI = 90;

// ── The four friends. Bright, saturated, distinct — a child matches a figure in
//    their view to the coloured tag on the map without reading a word.
const PLAYERS = [
  { id: 'P1', col: '#5cf06a', dark: '#1f7a2a' },
  { id: 'P2', col: '#ffd23f', dark: '#8a6a00' },
  { id: 'P3', col: '#4fb4ff', dark: '#1a4f86' },
  { id: 'P4', col: '#ff7ad9', dark: '#8a2a70' },
];
// Lateral lane in a corridor (u in [-1,1]) so two friends at one depth never
// stand inside each other.
const LANES = [0.0, -0.52, 0.52, 0.26];

// Each quadrant's view: its rect, its vanishing point (in the quadrant's VISIBLE
// stage region — see LAYOUT above), and the corridor half-extents at depth 1.
function viewFor(qi, W, H) {
  const top = qi < 2, left = qi % 2 === 0;
  const rect = { x: left ? 0 : W * 0.5, y: top ? 0 : H * 0.5, w: W * 0.5, h: H * 0.5 };
  if (top) {
    return { rect, vp: { x: left ? W * 0.20 : W * 0.80, y: H * 0.275 }, hw: W * 0.16, hh: H * 0.19 };
  }
  return { rect, vp: { x: left ? W * 0.112 : W * 0.888, y: H * 0.685 }, hw: W * 0.115, hh: H * 0.165 };
}

// ── THE ARENA — one facility, a loop of rooms ───────────────────────────────
const ARENA_NAME = 'FACILITY';
const ARENA = [
  { u: -0.62, v: -0.50, feature: 'stairs' },
  { u:  0.10, v: -0.58, feature: null     },
  { u:  0.58, v: -0.40, feature: 'silo'   },
  { u:  0.60, v:  0.18, feature: null     },
  { u:  0.18, v:  0.55, feature: 'cells'  },
  { u: -0.30, v:  0.52, feature: null     },
  { u: -0.66, v:  0.08, feature: 'grate'  },
];
const N = ARENA.length;
const FEATURE_WORD = { stairs: 'STAIRS', silo: 'SILO', cells: 'CELLS', grate: 'GRATE' };

// Group exploring together: P2–P4 keep a loose, shifting formation around P1, so
// whoever is behind sees the others ahead of them — and the lead changes hands.
const OFFSETS = [
  null,
  { base:  0.055, amp: 0.050, w: 0.50, ph: 0.0 },
  { base:  0.115, amp: 0.060, w: 0.37, ph: 2.1 },
  { base: -0.060, amp: 0.055, w: 0.43, ph: 4.0 },
];

let p1prog = 0;
function progOf(oi) {
  if (oi === 0) return p1prog;
  const o = OFFSETS[oi];
  return (((p1prog + o.base + o.amp * Math.sin(simT * o.w + o.ph)) % 1) + 1) % 1;
}

// Where on the loop a progress value sits: segment index, fraction, and the
// distance (in segments) still to walk before the next room.
function locate(prog) {
  const f = (((prog % 1) + 1) % 1) * N;
  const i = Math.min(N - 1, Math.floor(f));
  const frac = f - i;
  return { i, frac, rem: 1 - frac, next: (i + 1) % N };
}

function mapPoint(prog) {
  const { i, frac, next } = locate(prog);
  const a = ARENA[i], b = ARENA[next];
  return { u: a.u + (b.u - a.u) * frac, v: a.v + (b.v - a.v) * frac };
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  t = 0;
  simT = 0;
  hasWon = false;
  victoryMode = false;
  victoryStartMs = 0;
  pings = [];
  confetti = [];
  gadgets = 0;
  gadgetFlash = 0;
  p1prog = 0.02;
  lastKeyMs = performance.now();
  GADGETS_TO_WIN = Math.max(1, Math.ceil(BASE_GADGETS * getWinRatio()));
}

// ─── Colour helpers ─────────────────────────────────────────────────────────
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
// Shade a colour toward the corridor's far darkness by depth (flat N64 fog).
function fogged(hex, d, mul = 1) {
  const n = parseInt(hex.slice(1), 16);
  const f = Math.min(0.62, Math.max(0, (d - 0.6) / 6));
  const fr = 26, fg = 32, fb = 30;
  const r = Math.round(Math.min(255, ((n >> 16) & 255) * mul) * (1 - f) + fr * f);
  const g = Math.round(Math.min(255, ((n >> 8) & 255) * mul) * (1 - f) + fg * f);
  const b = Math.round(Math.min(255, (n & 255) * mul) * (1 - f) + fb * f);
  return `rgb(${r},${g},${b})`;
}

// ─── Perspective (pinhole) — N64-era 3D in canvas 2D ────────────────────────
// u: left/right (-1..1 = the corridor walls); v: up/down (-1 ceiling .. +1 floor).
function P(view, u, v, d) {
  const s = 1 / Math.max(0.2, d);
  return { x: view.vp.x + u * view.hw * s, y: view.vp.y + v * view.hh * s };
}
function quad(a, b, c, d, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
  ctx.closePath();
  ctx.fill();
}

// The facility palette — ONE palette for all four views, because it is ONE place.
const WALL_L = '#a9b7a2', WALL_R = '#97a690', FLOOR = '#6b7a68', FLOOR2 = '#5f6d5c';
const CEIL = '#56624f', TRIM = '#d6e2c4', LIGHT = '#f6ffe8';

const SEG_DEPTH = 3.0;     // corridor depth per arena segment
const NEAR = 0.25;         // nearest drawn slice (near enough to fill each view's edge)
const D0 = 0.95;           // depth of a friend standing right beside you

// ─── One quadrant: a first-person view of the shared arena ──────────────────
function drawView(qi, W, H, vic) {
  const view = viewFor(qi, W, H);
  const r = view.rect;
  const me = PLAYERS[qi];
  const loc = locate(progOf(qi));
  const feature = ARENA[loc.next].feature;
  const dEnd = D0 + loc.rem * SEG_DEPTH + 0.35;

  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();

  ctx.fillStyle = '#1c231e';
  ctx.fillRect(r.x, r.y, r.w, r.h);

  // Corridor slices, far to near, alternating shade + ceiling light panels.
  const slices = [];
  for (let d = NEAR; d < dEnd; d += 0.5) slices.push([d, Math.min(dEnd, d + 0.5)]);
  for (let k = slices.length - 1; k >= 0; k--) {
    const [dn, df] = slices[k];
    const alt = k % 2 === 0 ? 1 : 0.92;
    quad(P(view, -1, -1, dn), P(view, -1, 1, dn), P(view, -1, 1, df), P(view, -1, -1, df), fogged(WALL_L, dn, alt));
    quad(P(view, 1, -1, dn), P(view, 1, 1, dn), P(view, 1, 1, df), P(view, 1, -1, df), fogged(WALL_R, dn, alt));
    quad(P(view, -1, 1, dn), P(view, 1, 1, dn), P(view, 1, 1, df), P(view, -1, 1, df), fogged(k % 2 ? FLOOR : FLOOR2, dn));
    quad(P(view, -1, -1, dn), P(view, 1, -1, dn), P(view, 1, -1, df), P(view, -1, -1, df), fogged(CEIL, dn));
    // A fluorescent ceiling panel per slice — the light that makes the room read.
    const lm = (dn + df) / 2;
    quad(P(view, -0.28, -1, lm - 0.12), P(view, 0.28, -1, lm - 0.12),
         P(view, 0.28, -1, lm + 0.12), P(view, -0.28, -1, lm + 0.12), fogged(LIGHT, dn));
    // Skirting trim where the walls meet the floor.
    ctx.strokeStyle = fogged(TRIM, dn);
    ctx.lineWidth = 1;
    ctx.beginPath();
    let a = P(view, -1, 1, dn), b = P(view, -1, 1, df);
    ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    a = P(view, 1, 1, dn); b = P(view, 1, 1, df);
    ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // The room ahead — one of the arena's named features.
  drawFeature(view, feature, dEnd, loc.rem);

  // FRIENDS in this view: anyone ahead of me on the loop, up to and into the next
  // room. Drawn far to near so a closer friend overlaps a farther one.
  const seen = [];
  const myProg = progOf(qi);
  PLAYERS.forEach((pl, oi) => {
    if (oi === qi) return;
    let ahead, depth, pose;
    if (vic) {
      // Victory: everybody comes to you. They walk in from the far end and gather.
      const k = [1, 2, 3].indexOf(((oi - qi + 4) % 4));
      const arrive = Math.min(1, Math.max(0, (vic.elapsed - k * 140) / 900));
      depth = 1.2 + k * 0.32 + (1 - easeOut(arrive)) * 2.6;
      pose = 'wave';
    } else {
      ahead = ((((progOf(oi) - myProg) % 1) + 1) % 1) * N;
      if (ahead > loc.rem + 0.4) return;       // round the corner — out of sight
      if (ahead <= loc.rem) {
        depth = D0 + ahead * SEG_DEPTH;
        pose = depth < 1.9 ? 'wave' : 'walk';
      } else {
        depth = dEnd - 0.55;
        pose = feature || 'walk';
      }
    }
    seen.push({ oi, depth, pose });
  });
  seen.sort((a, b) => b.depth - a.depth);
  // Only the NEAREST friend says "HI!" — with the group gathered, every bubble
  // at once landed on a neighbour's name tag.
  seen.forEach((f, k) => drawFriend(view, f.oi, f.depth, f.pose,
    f.depth > dEnd - 0.7 ? feature : null, k === seen.length - 1));

  // P1 only: the gadget you are about to find, bobbing in the corridor.
  if (qi === 0 && !vic) drawGadgetInView(view);

  // Gadget-found flash in P1's view.
  if (qi === 0 && gadgetFlash > 0) {
    ctx.globalAlpha = gadgetFlash * 0.35;
    ctx.fillStyle = '#fff6b0';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.globalAlpha = 1;
  }

  // A coloured inner frame in the owner's colour: which screen is whose.
  ctx.strokeStyle = hexA(me.col, 0.85);
  ctx.lineWidth = 4;
  ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);

  // Light CRT banding — a living-room TV, kept faint so the scene stays bright.
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let y = r.y; y < r.y + r.h; y += 3) ctx.fillRect(r.x, y, r.w, 1);

  ctx.restore();
}

// ─── The arena's named rooms, in first person ───────────────────────────────
function drawFeature(view, feature, dEnd, rem) {
  // Default end wall with an open doorway — the corridor turns here.
  const endWall = (col) => {
    quad(P(view, -1, -1, dEnd), P(view, 1, -1, dEnd), P(view, 1, 1, dEnd), P(view, -1, 1, dEnd), fogged(col, dEnd));
  };
  if (feature === 'stairs') {
    endWall('#8e9c88');
    // A flight of steps climbing up and away into a lit doorway.
    const steps = 6, run = 1.3;
    const d0 = dEnd - run;
    // The lit landing at the top.
    quad(P(view, -0.55, -1.0, dEnd), P(view, 0.55, -1.0, dEnd), P(view, 0.55, -0.35, dEnd), P(view, -0.55, -0.35, dEnd), fogged('#fff3c4', dEnd));
    for (let k = steps - 1; k >= 0; k--) {
      const dn = d0 + (k * run) / steps, df = d0 + ((k + 1) * run) / steps;
      const vTop = 1 - ((k + 1) * 1.35) / steps, vBot = 1 - (k * 1.35) / steps;
      quad(P(view, -0.85, vTop, dn), P(view, 0.85, vTop, dn), P(view, 0.85, vBot, dn), P(view, -0.85, vBot, dn), fogged('#c9b48a', dn, 0.85)); // riser
      quad(P(view, -0.85, vTop, dn), P(view, 0.85, vTop, dn), P(view, 0.85, vTop, df), P(view, -0.85, vTop, df), fogged('#e6d3a4', dn));     // tread
    }
    // Handrail.
    ctx.strokeStyle = fogged('#ffe58a', d0);
    ctx.lineWidth = 2;
    let a = P(view, 0.85, 0.35, d0), b = P(view, 0.85, -1.0, dEnd);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  } else if (feature === 'silo') {
    // The corridor opens onto a tall round silo: curved wall, hazard band, ladder.
    endWall('#3e4640');
    const L = P(view, -0.95, -1, dEnd), R = P(view, 0.95, 1, dEnd);
    const cx = (L.x + R.x) / 2, w = R.x - L.x, h = R.y - L.y;
    const g = ctx.createLinearGradient(L.x, 0, R.x, 0);
    g.addColorStop(0, fogged('#c2793a', dEnd, 0.8));
    g.addColorStop(0.45, fogged('#ffb066', dEnd));
    g.addColorStop(1, fogged('#9a5a28', dEnd, 0.8));
    ctx.fillStyle = g;
    ctx.fillRect(L.x, L.y, w, h);
    // Hazard stripes round its base.
    const bandY = L.y + h * 0.70, bandH = h * 0.10;
    ctx.save();
    ctx.beginPath(); ctx.rect(L.x, bandY, w, bandH); ctx.clip();
    ctx.fillStyle = fogged('#ffd23f', dEnd);
    ctx.fillRect(L.x, bandY, w, bandH);
    ctx.fillStyle = '#20201c';
    const sw = Math.max(4, w / 10);
    for (let x = L.x - bandH; x < R.x + bandH; x += sw * 2) {
      ctx.beginPath();
      ctx.moveTo(x, bandY + bandH); ctx.lineTo(x + bandH, bandY);
      ctx.lineTo(x + bandH + sw, bandY); ctx.lineTo(x + sw, bandY + bandH);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // Ladder up the silo.
    ctx.strokeStyle = fogged('#2b2b28', dEnd);
    ctx.lineWidth = Math.max(1.5, w * 0.012);
    const lx = cx + w * 0.12, lw = w * 0.12;
    ctx.beginPath();
    ctx.moveTo(lx, L.y); ctx.lineTo(lx, R.y);
    ctx.moveTo(lx + lw, L.y); ctx.lineTo(lx + lw, R.y);
    for (let y = L.y + h * 0.05; y < R.y; y += h * 0.09) { ctx.moveTo(lx, y); ctx.lineTo(lx + lw, y); }
    ctx.stroke();
  } else if (feature === 'cells') {
    endWall('#9aa892');
    // A row of barred cells down both walls of the last stretch.
    const d0 = Math.max(NEAR + 0.2, dEnd - 1.8);
    for (const side of [-1, 1]) {
      for (let c = 0; c < 3; c++) {
        const dn = d0 + c * 0.6, df = dn + 0.45;
        if (df > dEnd) break;
        quad(P(view, side, -0.65, dn), P(view, side, 1, dn), P(view, side, 1, df), P(view, side, -0.65, df), fogged('#3a403a', dn));
        ctx.strokeStyle = fogged('#d9dfd2', dn);
        ctx.lineWidth = Math.max(1, 2.2 / dn);
        ctx.beginPath();
        for (let bI = 0; bI <= 4; bI++) {
          const d = dn + (bI / 4) * (df - dn);
          const a = P(view, side, -0.65, d), b = P(view, side, 1, d);
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();
      }
    }
    // A cell door at the end too.
    const a = P(view, -0.5, -0.7, dEnd), b = P(view, 0.5, 1, dEnd);
    ctx.fillStyle = fogged('#3a403a', dEnd);
    ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
    ctx.strokeStyle = fogged('#d9dfd2', dEnd);
    ctx.lineWidth = Math.max(1, 2 / dEnd);
    ctx.beginPath();
    for (let k = 0; k <= 6; k++) { const x = a.x + ((b.x - a.x) * k) / 6; ctx.moveTo(x, a.y); ctx.lineTo(x, b.y); }
    ctx.stroke();
  } else if (feature === 'grate') {
    endWall('#8e9c88');
    // A floor grate with its hatch lifted — a way down into the vents.
    const dn = dEnd - 1.0, df = dEnd - 0.35;
    quad(P(view, -0.55, 1, dn), P(view, 0.55, 1, dn), P(view, 0.55, 1, df), P(view, -0.55, 1, df), '#121612');
    ctx.strokeStyle = fogged('#c6d0bc', dn);
    ctx.lineWidth = Math.max(1, 2 / dn);
    ctx.beginPath();
    for (let k = 0; k <= 6; k++) {
      const u = -0.55 + (1.1 * k) / 6;
      const a = P(view, u, 1, dn), b = P(view, u, 1, df);
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    // The lifted hatch, standing up at the near edge.
    quad(P(view, -0.55, 1, dn), P(view, 0.55, 1, dn), P(view, 0.55, 0.45, dn - 0.1), P(view, -0.55, 0.45, dn - 0.1), fogged('#8f9a86', dn));
    // A wall vent at the end, too.
    const va = P(view, -0.35, 0.35, dEnd), vb = P(view, 0.35, 0.85, dEnd);
    ctx.fillStyle = '#141814';
    ctx.fillRect(va.x, va.y, vb.x - va.x, vb.y - va.y);
    ctx.strokeStyle = fogged('#c6d0bc', dEnd);
    ctx.beginPath();
    for (let k = 1; k < 5; k++) { const y = va.y + ((vb.y - va.y) * k) / 5; ctx.moveTo(va.x, y); ctx.lineTo(vb.x, y); }
    ctx.stroke();
  } else {
    // Plain turn: an end wall with an open doorway to the next stretch.
    endWall('#9aa892');
    const a = P(view, -0.4, -0.55, dEnd), b = P(view, 0.4, 1, dEnd);
    ctx.fillStyle = fogged('#e8f2d8', dEnd + 1.5);
    ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
  }

  // Name the room on its own wall, big and plain — STAIRS, SILO, CELLS, GRATE.
  if (feature && rem < 0.75) {
    const sp = P(view, 0, -0.82, dEnd);
    const fs = Math.max(7, Math.min(14, Math.round(view.hh / dEnd * 0.16)));
    ctx.font = `${fs}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const word = FEATURE_WORD[feature];
    const tw = ctx.measureText(word).width;
    ctx.fillStyle = 'rgba(16,20,16,0.85)';
    ctx.fillRect(sp.x - tw / 2 - 4, sp.y - fs / 2 - 3, tw + 8, fs + 6);
    ctx.fillStyle = '#ffe680';
    ctx.fillText(word, sp.x, sp.y);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}

// ─── A friend: a chunky N64 low-poly figure in their colour ─────────────────
// pose: 'walk' (back to you, heading on), 'wave' (turned round, waving HI!), or a
// feature name — climbing the stairs, on the silo ladder, peering from the cells,
// or halfway down the grate.
function drawFriend(view, oi, depth, pose, atFeature, speaks) {
  const pl = PLAYERS[oi];
  const s = view.hh / Math.max(0.3, depth);          // px per world unit
  let lane = LANES[oi];
  let lift = 0, sink = 0;
  if (atFeature === 'stairs' && pose === 'stairs') lift = 0.55;
  if (atFeature === 'silo' && pose === 'silo') { lift = 0.5; lane = 0.18; }
  if (atFeature === 'grate' && pose === 'grate') { sink = 0.7; lane = 0; }
  if (atFeature === 'cells' && pose === 'cells') lane = Math.sign(lane || 1) * 0.72;
  const feet = P(view, lane, 1 - lift, depth);
  const x = feet.x, yF = feet.y;
  const facing = pose === 'wave';
  const bob = pose === 'walk' ? Math.abs(Math.sin(t * 7 + oi)) * 0.03 * s : 0;

  ctx.save();
  if (sink > 0) {                                     // going down the grate:
    ctx.beginPath();                                  // hide whatever is below the floor
    ctx.rect(view.rect.x, view.rect.y, view.rect.w, Math.max(0, yF - view.rect.y));
    ctx.clip();
  }
  const yBase = yF + sink * s - bob;
  const legH = 0.55 * s, torH = 0.55 * s, headH = 0.27 * s;
  const torW = 0.42 * s, legW = 0.15 * s, headW = 0.25 * s, armW = 0.11 * s;
  const step = pose === 'walk' ? Math.sin(t * 7 + oi) * 0.05 * s : 0;

  // Soft floor shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(x, yF, torW * 0.7, Math.max(1, 0.05 * s), 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs.
  ctx.fillStyle = '#2b3140';
  ctx.fillRect(x - torW * 0.36, yBase - legH + step, legW, legH - step);
  ctx.fillRect(x + torW * 0.36 - legW, yBase - legH - step, legW, legH + step);
  // Torso — the player's colour, flat-shaded in two tones (an N64 polygon look).
  const tTop = yBase - legH - torH;
  ctx.fillStyle = pl.col;
  ctx.fillRect(x - torW / 2, tTop, torW, torH);
  ctx.fillStyle = hexA(pl.dark, 0.55);
  ctx.fillRect(x, tTop, torW / 2, torH);
  // Arms: one raised and waving when they have turned to say hello.
  ctx.fillStyle = pl.col;
  ctx.fillRect(x - torW / 2 - armW, tTop + 0.04 * s, armW, torH * 0.85);
  if (facing) {
    const wave = Math.sin(t * 10 + oi) * 0.35;
    ctx.save();
    ctx.translate(x + torW / 2 + armW / 2, tTop + 0.06 * s);
    ctx.rotate(Math.PI + wave);
    ctx.fillRect(-armW / 2, 0, armW, torH * 0.85);
    ctx.fillStyle = '#f2c9a0';
    ctx.fillRect(-armW * 0.65, torH * 0.82, armW * 1.3, armW * 1.2);   // hand
    ctx.restore();
  } else {
    ctx.fillRect(x + torW / 2, tTop + 0.04 * s, armW, torH * 0.85);
  }
  // Head.
  const hTop = tTop - headH - 0.02 * s;
  ctx.fillStyle = '#f2c9a0';
  ctx.fillRect(x - headW / 2, hTop, headW, headH);
  ctx.fillStyle = '#3a2a1c';                                            // hair
  ctx.fillRect(x - headW / 2, hTop, headW, facing ? headH * 0.28 : headH * 0.8);
  if (facing) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - headW * 0.28, hTop + headH * 0.45, Math.max(1, headW * 0.14), Math.max(1, headH * 0.16));
    ctx.fillRect(x + headW * 0.14, hTop + headH * 0.45, Math.max(1, headW * 0.14), Math.max(1, headH * 0.16));
    ctx.fillRect(x - headW * 0.2, hTop + headH * 0.75, headW * 0.4, Math.max(1, headH * 0.08)); // smile
  }
  ctx.restore();

  // Name tag above the head — the same colour as their dot on the map.
  const fs = Math.max(7, Math.min(12, Math.round(s * 0.11)));
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const ty = hTop - fs - 4;
  const tw = ctx.measureText(pl.id).width;
  ctx.fillStyle = pl.col;
  ctx.fillRect(x - tw / 2 - 4, ty - fs / 2 - 3, tw + 8, fs + 6);
  ctx.fillStyle = '#101010';
  ctx.fillText(pl.id, x, ty);

  // "HI!" — friends spotting each other. Never a weapon, never a hit.
  if (facing && speaks) {
    const bx = x + torW * 0.9, by = ty - fs * 0.4;
    const bfs = Math.max(7, Math.min(12, fs));
    ctx.font = `${bfs}px "Press Start 2P", monospace`;
    const bw = ctx.measureText('HI!').width + 10;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx, by - bfs - 4, bw, bfs + 8);
    ctx.beginPath();
    ctx.moveTo(bx + 4, by + 4); ctx.lineTo(bx + 4, by + 10); ctx.lineTo(bx + 12, by + 4);
    ctx.fill();
    ctx.fillStyle = '#101010';
    ctx.textAlign = 'left';
    ctx.fillText('HI!', bx + 5, by - bfs / 2);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// The next gadget — a glowing gold wristwatch hovering just above the floor by the
// right wall, outside every friend's lane (LANES spans -0.52..0.52). Deliberately
// ROUND and bright: an earlier keycard (a dark-striped bar) kept landing beside a
// friend's hand, and a dark bar held at arm's length reads as something this game
// never draws.
function drawGadgetInView(view) {
  const d = 1.25;
  const c = P(view, 0.80, 0.70 + Math.sin(t * 3) * 0.04, d);
  const s = view.hh / d;
  const r = 0.10 * s;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 3.2);
  g.addColorStop(0, 'rgba(255,240,140,0.6)');
  g.addColorStop(1, 'rgba(255,240,140,0)');
  ctx.fillStyle = g;
  ctx.fillRect(c.x - r * 3.2, c.y - r * 3.2, r * 6.4, r * 6.4);
  ctx.restore();
  ctx.fillStyle = '#ffe14d';                                   // strap
  ctx.fillRect(c.x - r * 0.45, c.y - r * 1.9, r * 0.9, r * 3.8);
  ctx.beginPath();                                             // face
  ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff6c8';
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.25);
  ctx.strokeStyle = '#ffb000';
  ctx.stroke();
  ctx.strokeStyle = '#8a5a00';                                 // hands
  ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.beginPath();
  ctx.moveTo(c.x, c.y); ctx.lineTo(c.x, c.y - r * 0.65);
  ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + r * 0.5, c.y);
  ctx.stroke();
  // A twinkle, so it reads as a THING TO FIND.
  const tw = 0.5 + 0.5 * Math.sin(t * 6);
  ctx.fillStyle = `rgba(255,255,255,${(0.5 + 0.5 * tw).toFixed(3)})`;
  const sx = c.x + r * 1.3, sy = c.y - r * 1.3, k = r * (0.5 + 0.4 * tw);
  ctx.beginPath();
  ctx.moveTo(sx, sy - k); ctx.lineTo(sx + k * 0.25, sy); ctx.lineTo(sx, sy + k); ctx.lineTo(sx - k * 0.25, sy);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sx - k, sy); ctx.lineTo(sx, sy + k * 0.25); ctx.lineTo(sx + k, sy); ctx.lineTo(sx, sy - k * 0.25);
  ctx.closePath(); ctx.fill();
}

// ─── THE SHARED MAP ─────────────────────────────────────────────────────────
// Trevor, 2026-09-14: "Maybe we introduce a map showing where the players are and
// to nail home that they are in the same arena." One arena, four dots — now big
// enough to read: the top band between the HUD corners, ~0.33–0.67W x 0.01–0.17H.
function drawArenaMap(W, H, vic) {
  const x0 = W * 0.33, y0 = H * 0.012, w = W * 0.34, h = H * 0.158;
  const cx = x0 + w * 0.5, cy = y0 + h * 0.47;
  const sx = w * 0.40, sy = h * 0.66;
  const map = (u, v) => ({ x: cx + u * sx, y: cy + v * sy * 0.62 });

  ctx.save();
  ctx.fillStyle = 'rgba(10,16,12,0.88)';
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = '#e8d44a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x0 + 1, y0 + 1, w - 2, h - 2);

  // The route, once, bright.
  ctx.strokeStyle = '#cfe8c8';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ARENA.forEach((nd, i) => {
    const a = map(nd.u, nd.v);
    if (i === 0) ctx.moveTo(a.x, a.y); else ctx.lineTo(a.x, a.y);
  });
  ctx.closePath();
  ctx.stroke();

  // Rooms, labelled.
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.textBaseline = 'middle';
  ARENA.forEach((nd) => {
    if (!nd.feature) return;
    const m = map(nd.u, nd.v);
    ctx.fillStyle = '#ffb066';
    ctx.fillRect(m.x - 5, m.y - 5, 10, 10);
    ctx.fillStyle = '#ffe9c8';
    ctx.textAlign = nd.u < 0 ? 'right' : 'left';
    ctx.fillText(FEATURE_WORD[nd.feature], m.x + (nd.u < 0 ? -9 : 9), m.y);
  });

  // FOUR DOTS, ONE ROOM.
  PLAYERS.forEach((pl, oi) => {
    let pt;
    if (vic) {
      // Everyone converges on the exit (the stairs) together.
      const from = mapPoint(progOf(oi));
      const k = Math.min(1, vic.elapsed / 1400);
      const e = easeOut(k);
      const to = { u: ARENA[0].u + [0, 0.07, -0.07, 0][oi], v: ARENA[0].v + [0, 0.07, 0.07, 0.14][oi] };
      pt = { u: from.u + (to.u - from.u) * e, v: from.v + (to.v - from.v) * e };
    } else {
      pt = mapPoint(progOf(oi));
    }
    const m = map(pt.u, pt.v);
    ctx.fillStyle = pl.col;
    ctx.shadowColor = pl.col;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(m.x, m.y, oi === 0 ? 7 : 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#101010';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = pl.col;
    // Staggered above/below so two friends standing together never read "PP2".
    ctx.fillText(pl.id, m.x, m.y + (oi % 2 === 0 ? -13 : 14));
  });

  ctx.font = '7px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8d44a';
  ctx.fillText(`4 FRIENDS · ONE ${ARENA_NAME}`, cx, y0 + h - 9);
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawDividers(W, H) {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(W / 2 - 3, 0, 6, H);
  ctx.fillRect(0, H / 2 - 3, W, 6);
}

// ─── Per-quadrant player tags, in each view's visible corner ────────────────
function drawTags(W, H) {
  ctx.font = '11px "Press Start 2P", monospace';
  ctx.textBaseline = 'middle';
  const spots = [
    { x: W * 0.015, y: H * 0.468, al: 'left' },
    { x: W * 0.985, y: H * 0.468, al: 'right' },
    { x: W * 0.015, y: H * 0.535, al: 'left' },
    { x: W * 0.985, y: H * 0.535, al: 'right' },
  ];
  PLAYERS.forEach((pl, i) => {
    const sp = spots[i];
    const label = i === 0 ? 'P1 · YOU' : pl.id;
    ctx.textAlign = sp.al;
    const tw = ctx.measureText(label).width;
    const bx = sp.al === 'left' ? sp.x : sp.x - tw - 12;
    ctx.fillStyle = pl.col;
    ctx.fillRect(bx, sp.y - 10, tw + 12, 20);
    ctx.fillStyle = '#101010';
    ctx.fillText(label, sp.al === 'left' ? sp.x + 6 : sp.x - 6, sp.y + 1);
  });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// P1's gadget count — top band, right of the LEVEL badge (clear of the HUD
// corner, the map and the prompt panel).
function drawHUD(W, H) {
  const bx = Math.round(W * 0.125), by = Math.round(H * 0.035);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '9px "Press Start 2P", monospace';
  const label = `GADGETS ${gadgets}/${GADGETS_TO_WIN}`;
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = 'rgba(10,16,12,0.85)';
  ctx.fillRect(bx - 6, by - 11, Math.max(tw, W * 0.15) + 12, 38);
  ctx.fillStyle = '#ffe14d';
  ctx.fillText(label, bx, by);
  const barW = Math.round(W * 0.15), barY = by + 9;
  ctx.fillStyle = '#2a2610';
  ctx.fillRect(bx, barY, barW, 9);
  ctx.fillStyle = '#ffe14d';
  ctx.fillRect(bx, barY, Math.round(barW * Math.min(1, gadgets / GADGETS_TO_WIN)), 9);
  ctx.strokeStyle = '#8a7a20';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, barY + 0.5, barW - 1, 8);
  ctx.textBaseline = 'alphabetic';
}

// ─── Expanding ring pings ───────────────────────────────────────────────────
function drawPings() {
  for (let i = pings.length - 1; i >= 0; i--) {
    const s = pings[i];
    s.life -= 0.04;
    if (s.life <= 0) { pings.splice(i, 1); continue; }
    const grow = 1 - s.life;
    ctx.globalAlpha = s.life;
    ctx.strokeStyle = s.col;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(s.x, s.y, Math.max(0, s.r * (0.4 + grow * 1.6)), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
function addPing(x, y, r, col) {
  if (pings.length >= MAX_PINGS) pings.shift();
  pings.push({ x, y, r, life: 1, col });
}

// ─── Victory: MISSION COMPLETE — everyone meets up ──────────────────────────
const OBJECTIVES = ['GADGETS FOUND', 'FRIENDS FOUND', 'EXIT REACHED'];

function spawnConfetti(W, H) {
  for (let i = 0; i < 30; i++) {
    if (confetti.length >= MAX_CONFETTI) confetti.shift();
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
    const sp = 4 + Math.random() * 6;
    confetti.push({
      x: W * 0.5, y: H * 0.47,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
      rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      kind: Math.random() < 0.5 ? 'card' : 'watch',
      col: PLAYERS[i % 4].col, life: 1,
    });
  }
}
function drawConfetti(H) {
  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i];
    c.x += c.vx; c.y += c.vy; c.vy += 0.18; c.vx *= 0.99; c.rot += c.vr;
    c.life -= 0.006;
    if (c.life <= 0 || c.y > H + 20) { confetti.splice(i, 1); continue; }
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.globalAlpha = Math.min(1, c.life * 1.5);
    if (c.kind === 'card') {
      ctx.fillStyle = c.col;
      ctx.fillRect(-9, -6, 18, 12);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillRect(-9, -2, 18, 3);
    } else {
      ctx.strokeStyle = c.col;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = c.col;
      ctx.fillRect(-2, -12, 4, 6); ctx.fillRect(-2, 6, 4, 6);
    }
    ctx.restore();
  }
}

function drawVictory(W, H, vic) {
  const p = Math.min(1, vic.elapsed / VICTORY_MS);

  // Each quadrant flashes in its owner's colour, round the table in turn.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const order = [0, 1, 3, 2][i];
    const phase = ((vic.elapsed / 900) + i * 0.25) % 1;
    const a = Math.max(0, 0.30 * (1 - phase * 2.2));
    if (a <= 0.01) continue;
    const v = viewFor(order, W, H).rect;
    ctx.globalAlpha = a;
    ctx.fillStyle = PLAYERS[order].col;
    ctx.fillRect(v.x, v.y, v.w, v.h);
  }
  ctx.restore();

  drawConfetti(H);

  // The debrief plate — centre stage, now that the panels are down.
  const pw = W * 0.44, ph = H * 0.20;
  const px = W * 0.5 - pw / 2, py = H * 0.36;
  ctx.fillStyle = 'rgba(8, 12, 8, 0.9)';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = '#ffe14d';
  ctx.lineWidth = 3;
  ctx.strokeRect(px, py, pw, ph);

  const stampIn = Math.min(1, vic.elapsed / 700);
  const scale = 0.5 + 0.5 * easeOut(stampIn) + Math.sin(stampIn * Math.PI) * 0.12;
  ctx.save();
  ctx.translate(W * 0.5, py + ph * 0.32);
  ctx.scale(scale, scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(16, Math.round(W * 0.022))}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#fff3a0';
  ctx.shadowColor = '#ffd23f';
  ctx.shadowBlur = 16;
  ctx.fillText('MISSION COMPLETE', 0, 0);
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(8, Math.round(W * 0.0085))}px "Press Start 2P", monospace`;
  const listY = py + ph * 0.72;
  const colW = pw / OBJECTIVES.length;
  for (let i = 0; i < OBJECTIVES.length; i++) {
    const checked = p > 0.22 + i * 0.16;
    const bx = px + colW * i + 14;
    ctx.strokeStyle = checked ? '#5cf06a' : 'rgba(200,200,170,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, listY - 7, 13, 13);
    if (checked) {
      ctx.beginPath();
      ctx.moveTo(bx + 2.5, listY - 1); ctx.lineTo(bx + 5.5, listY + 3.5); ctx.lineTo(bx + 11, listY - 5);
      ctx.stroke();
    }
    ctx.fillStyle = checked ? '#c8ffc8' : 'rgba(200,200,170,0.5)';
    ctx.fillText(OBJECTIVES[i], bx + 19, listY);
  }
  ctx.textBaseline = 'alphabetic';
}

function easeOut(x) { return 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3); }

// ─── Main render loop ───────────────────────────────────────────────────────
let lastFrameMs = 0;
let confettiBursts = 0;
function render() {
  if (!active) return;
  const W = canvas.width, H = canvas.height;
  const nowMs = performance.now();
  const dt = Math.min(0.05, Math.max(0, (nowMs - (lastFrameMs || nowMs)) / 1000));
  lastFrameMs = nowMs;
  t += dt;
  // The friends' formation drifts only while the player is engaged (L20).
  if (!victoryMode && nowMs - lastKeyMs < 8000) simT += dt;
  if (gadgetFlash > 0) gadgetFlash = Math.max(0, gadgetFlash - dt * 1.8);

  const vic = victoryMode ? { elapsed: Math.min(VICTORY_MS, Math.max(0, nowMs - victoryStartMs)) } : null;
  if (vic) {
    // Three bursts of gadget confetti, keyed to elapsed time (clamped — L36).
    const want = vic.elapsed > 1800 ? 3 : vic.elapsed > 900 ? 2 : vic.elapsed > 150 ? 1 : 0;
    while (confettiBursts < want) { spawnConfetti(W, H); confettiBursts++; }
  }

  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < 4; i++) drawView(i, W, H, vic);
  drawDividers(W, H);
  drawArenaMap(W, H, vic);
  drawTags(W, H);
  drawPings();
  if (vic) drawVictory(W, H, vic);
  else drawHUD(W, H);

  // Hops across the true bottom of the screen, over the split-screen grid.
  drawWhiteRabbit(ctx, W, H);

  animId = requestAnimationFrame(render);
}

// ─── Public API ──────────────────────────────────────────────────────────────
export function start() {
  init();
  resetWhiteRabbit();
  active = true;
  lastFrameMs = 0;
  confettiBursts = 0;
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Each correct keystroke walks P1 (and so the whole group) forward through the
// facility — round the next corner, up the stairs, past the cells.
export function keystroke() {
  if (!active || victoryMode) return;
  lastKeyMs = performance.now();
  p1prog = (p1prog + 0.035) % 1;
}

export function miss() {
  // Gentle: a soft ring in P1's view, nothing lost, nothing alarming.
  if (!active || victoryMode) return;
  const v = viewFor(0, canvas.width, canvas.height);
  addPing(v.vp.x, v.vp.y, Math.min(canvas.width, canvas.height) * 0.02, 'rgba(255,240,180,0.8)');
}

// Called once per completed letter sequence — P1 finds a gadget. Win when P1 has
// found GADGETS_TO_WIN. Won stays won on repeated calls (the engine may re-ask).
export function patternComplete() {
  if (victoryMode || hasWon) return true;
  lastKeyMs = performance.now();
  gadgets++;
  gadgetFlash = 1;
  const v = viewFor(0, canvas.width, canvas.height);
  addPing(v.vp.x - v.hw * 0.35, v.vp.y + v.hh * 0.1, Math.min(canvas.width, canvas.height) * 0.04, '#ffe14d');
  if (gadgets >= GADGETS_TO_WIN) hasWon = true;
  maybeWhiteRabbit(hasWon);   // cosmetic only — never gates or delays the win
  return hasWon;
}

// MISSION COMPLETE: all four friends walk up to every screen and wave, their dots
// meet at the exit on the map, gadgets fountain. Returns its duration in ms.
export function victory() {
  if (!active) return VICTORY_MS;
  victoryMode = true;
  victoryStartMs = performance.now();
  confettiBursts = 0;
  for (let i = 0; i < 4; i++) {
    const v = viewFor(i, canvas.width, canvas.height);
    addPing(v.vp.x, v.vp.y, Math.min(canvas.width, canvas.height) * 0.06, PLAYERS[i].col);
  }
  return VICTORY_MS;
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
