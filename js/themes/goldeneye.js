// GoldenEye 007 — Rare, N64, 1997 — Level 17
// The living-room multiplayer that GoldenEye made famous: a 2x2 SPLIT-SCREEN.
// Each quadrant is a LIVE mini mission-view — a small agent figure creeping
// through its named level's corridor floor-plan (Facility / Archives / Surface /
// Temple, each a distinct layout), collecting glowing GADGET pickups (watch,
// keycard) and slipping past comically oblivious patrol guards whose flashlight
// vision cones sweep the halls. When a cone nears, the agent freezes and sneaks.
// Wholesome hide-and-seek — never combat, never a weapon drawn anywhere (per the
// binding kid-safe abstraction in research/wiki/games/goldeneye-007.md).
//
// Typing drives P1's quadrant: each keystroke advances P1's agent along its path,
// and completing a letter sequence secures a gadget + flashes P1's quadrant.
// P2–P4 tick along ambiently as friendly competition (cosmetic attract motion,
// L20-safe — their gadget count never gates the win, and is frozen when the tab
// is unattended). Victory: a "MISSION COMPLETE" debrief stamp with a ticking
// objective checklist and all four quadrants ping-flashing (~3500ms).
//
// N64-era look (act4.md): flat-shaded corridors in simple pinhole perspective,
// chunky low-poly agent/guard blocks, dim so the letter prompt stays brightest.

import { getWinRatio } from '../settings.js';
// The Act 4 white rabbit is shared by all five Command Center themes and lives in
// terminal.js (the act's hidden-history host) — see easter-eggs.md.
import { resetWhiteRabbit, maybeWhiteRabbit, drawWhiteRabbit } from './terminal.js';

let canvas, ctx, animId;
let active = false;
let t = 0;                 // global time accumulator (seconds-ish)
let lastKeyMs = 0;         // for the L20 engagement gate on ambient P2–P4 motion

// Win gate: gadgets P1 must secure (one per completed letter sequence).
const BASE_GADGETS = 5;
let GADGETS_TO_WIN = BASE_GADGETS;
let hasWon = false;

// Victory
let victoryMode = false;
let victoryStartMs = 0;
const VICTORY_MS = 3500;

// ── Bounded FX pools ─────────────────────────────────────────────────────────
let pings = [];            // gadget-secured / victory ring pings
const MAX_PINGS = 40;

// ── The four split-screen players / quadrants ────────────────────────────────
// Each has a distinct level layout ('style') and its own path the agent walks.
// gadgets: how many this player has secured (P1 keystroke-gated; P2-P4 ambient).
const QUADRANTS = [
  { id: 'P1', name: 'FACILITY', tint: '#3a4a3a', accent: '#9fd39f',
    qx: 0, qy: 0, style: 'facility' },
  { id: 'P2', name: 'ARCHIVES', tint: '#4a4230', accent: '#d8c888',
    qx: 0.5, qy: 0, style: 'archives' },
  { id: 'P3', name: 'SURFACE', tint: '#33414f', accent: '#b8d4e8',
    qx: 0, qy: 0.5, style: 'surface' },
  { id: 'P4', name: 'TEMPLE', tint: '#40384a', accent: '#c8aed8',
    qx: 0.5, qy: 0.5, style: 'temple' },
];

// Per-quadrant live state, rebuilt in init(). Kept parallel to QUADRANTS by index.
let players = [];

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  canvas = document.getElementById('invaders-canvas');
  ctx    = canvas.getContext('2d');
  t = 0;
  hasWon = false;
  victoryMode = false;
  victoryStartMs = 0;
  pings = [];
  lastKeyMs = performance.now();

  const ratio = getWinRatio();
  GADGETS_TO_WIN = Math.max(1, Math.ceil(BASE_GADGETS * ratio));

  players = QUADRANTS.map((q, i) => ({
    // Path progress 0..1 around this quadrant's floor-plan loop.
    prog: i * 0.13,
    // P1's progress is advanced by keystrokes; P2-P4 drift on their own.
    speed: i === 0 ? 0 : 0.055 + i * 0.012,
    gadgets: 0,
    // Sneaking state: when a guard cone is near, the agent freezes (crouch).
    sneaking: false,
    quadFlash: 0,           // 0..1 quadrant flash on gadget secured
    // Which path node currently holds a collectable gadget (advances as taken).
    gadgetNode: 1,
    gadgetPulse: 0,
  }));
}

// ─── Perspective projection (pinhole) — N64-era 3D look in canvas 2D ─────────
function project(u, v, d, vp, halfW, halfH) {
  const scale = 1 / (d + 0.001);
  return { x: vp.x + u * halfW * scale, y: vp.y + v * halfH * scale, scale };
}

// ─── A quadrant's top-down floor-plan path (loop of nodes in [-1,1] quad space),
// distinct per named level. Agents walk these; guards patrol segments of them.
// ── THE ARENA — one level, four views ───────────────────────────────────────
// Trevor, 2026-09-14, answering whether depicting the FORMAT is enough:
//
//   "it was a local lan with a quadrant split screen and we should be able to see
//    the players see each other and interact as they explore THEIR LEVEL. Going in
//    grates, climbing stairs, exploring cells, and silos etc."
//
// That is the fidelity point, and it settles the open question: the split-screen
// LAYOUT is not the mechanic. **All four players are in ONE arena** — that is the
// entire reason you could see each other, and the entire reason the mode is
// remembered. Four quadrants each showing a DIFFERENT level was four people
// playing alone next to each other.
//
// So the mission plan is now shared, every quadrant draws all four agents on it,
// and the path runs through the named features he asked for. Each quadrant keeps
// its own tint, vanishing point and receding environment — that is the VIEW
// differing, which is correct, rather than the world differing, which was not.
const ARENA_NAME = 'FACILITY';

// The shared floor-plan. Each node may carry a FEATURE the agents interact with;
// `drawFeature` renders it and `poseAt` changes an agent's posture as it passes.
const ARENA = [
  { u: -0.62, v: -0.55, feature: 'stairs' },
  { u:  0.10, v: -0.58, feature: null     },
  { u:  0.55, v: -0.40, feature: 'silo'   },
  { u:  0.58, v:  0.18, feature: null     },
  { u:  0.18, v:  0.52, feature: 'cells'  },
  { u: -0.30, v:  0.50, feature: null     },
  { u: -0.64, v:  0.10, feature: 'grate'  },
];
const ARENA_PATH = ARENA.map(n => [n.u, n.v]);

function pathFor(style) {
  switch (style) {
    case 'facility':   // tight rectangular corridor loop (the dam interior)
      return [ [-0.62, -0.55], [0.55, -0.55], [0.55, 0.5], [0.05, 0.5],
               [0.05, -0.05], [-0.62, -0.05] ];
    case 'archives':  // shelving-row zig-zag
      return [ [-0.6, -0.5], [0.5, -0.5], [0.5, -0.1], [-0.5, -0.1],
               [-0.5, 0.3], [0.55, 0.3], [0.55, 0.55], [-0.6, 0.55] ];
    case 'surface':   // open snowfield diagonal sweep between crates
      return [ [-0.65, 0.4], [-0.2, -0.2], [0.35, 0.35], [0.6, -0.4],
               [0.1, -0.5], [-0.6, -0.2] ];
    case 'temple':    // symmetric pillared hall figure-eight
      return [ [-0.5, -0.45], [0.5, -0.45], [-0.5, 0.45], [0.5, 0.45],
               [0.0, 0.0], [-0.5, -0.45] ];
    default:
      return [ [-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5] ];
  }
}

// Position (and heading) along a node loop at parameter prog in [0,1).
function walkPath(path, prog) {
  const n = path.length;
  const f = ((prog % 1) + 1) % 1 * n;   // clamp into [0,n)
  const i = Math.floor(f);
  const frac = f - i;
  const a = path[i];
  const b = path[(i + 1) % n];
  const x = a[0] + (b[0] - a[0]) * frac;
  const y = a[1] + (b[1] - a[1]) * frac;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return { x, y, ang, node: i, frac };
}

// A guard's patrol position: walks a segment of the same path at its own phase,
// offset from the player so they rarely coincide. Returns pos + facing angle
// whose vision cone sweeps side-to-side.
function guardOn(path, phase, style) {
  const gp = walkPath(path, phase);
  // Cone sweeps back and forth around the guard's travel heading.
  const sweep = Math.sin(t * 1.3 + phase * 6.28) * 0.6;
  return { x: gp.x, y: gp.y, facing: gp.ang + sweep };
}

// ─── Draw one quadrant: environment frame + the live mission view ────────────
function drawQuadrant(qi, W, H) {
  const q = QUADRANTS[qi];
  const p = players[qi];
  const rx = q.qx * W, ry = q.qy * H, rw = 0.5 * W, rh = 0.5 * H;

  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();

  // Base fill — dim, tinted per environment.
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = q.tint;
  ctx.fillRect(rx, ry, rw, rh);
  ctx.globalAlpha = 1;

  // Vanishing point in this quadrant's OUTER region so receding geometry and the
  // agent action sit in the visible stage corners, clear of the center DOM UI.
  const outX = q.qx < 0.5 ? rx + rw * 0.34 : rx + rw * 0.66;
  const outY = q.qy < 0.5 ? ry + rh * 0.36 : ry + rh * 0.64;
  const drift = Math.sin(t * (0.22 + qi * 0.05) + qi) * rw * 0.03;
  const vp = { x: outX + drift, y: outY };
  const halfW = rw * 0.5, halfH = rh * 0.5;

  // Distance fog toward the vanishing point (flat-color depth cue).
  const fog = ctx.createRadialGradient(vp.x, vp.y, 0, vp.x, vp.y, Math.max(rw, rh) * 0.6);
  fog.addColorStop(0, hexA(q.accent, 0.10));
  fog.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fog;
  ctx.fillRect(rx, ry, rw, rh);

  drawEnvironment(q, vp, halfW, halfH);

  // ── The live mission view (top-down mini floor-plan overlaid on the corner) ─
  drawMission(qi, rx, ry, rw, rh);

  // Quadrant flash when a gadget is secured (bright wash that decays).
  if (p.quadFlash > 0) {
    ctx.globalAlpha = p.quadFlash * 0.4;
    ctx.fillStyle = q.accent;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.globalAlpha = 1;
  }

  // Subtle scanline banding — CRT living-room TV feel, dim.
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#000000';
  for (let y = ry; y < ry + rh; y += 3) ctx.fillRect(rx, y, rw, 1);
  ctx.globalAlpha = 1;

  ctx.restore();
}

// Flat-shaded receding environment geometry, distinct per level style.
function drawEnvironment(q, vp, halfW, halfH) {
  const segs = 5;
  if (q.style === 'facility' || q.style === 'archives') {
    for (let s = segs; s >= 1; s--) {
      const dNear = 0.4 + s * 0.6;
      const dFar = dNear + 0.6;
      const a = Math.min(0.9, 0.6 / dNear);
      const shade = s % 2 === 0 ? 1 : 0.78;
      quad(project(-1, -1, dNear, vp, halfW, halfH), project(-1, 1, dNear, vp, halfW, halfH),
           project(-1, 1, dFar, vp, halfW, halfH),  project(-1, -1, dFar, vp, halfW, halfH),
           shadeCol(q.tint, shade, a));           // left wall
      quad(project(1, -1, dNear, vp, halfW, halfH), project(1, 1, dNear, vp, halfW, halfH),
           project(1, 1, dFar, vp, halfW, halfH),  project(1, -1, dFar, vp, halfW, halfH),
           shadeCol(q.tint, shade, a));           // right wall
      quad(project(-1, 1, dNear, vp, halfW, halfH), project(1, 1, dNear, vp, halfW, halfH),
           project(1, 1, dFar, vp, halfW, halfH),  project(-1, 1, dFar, vp, halfW, halfH),
           shadeCol(q.tint, shade * 0.6, a));      // floor
      quad(project(-1, -1, dNear, vp, halfW, halfH), project(1, -1, dNear, vp, halfW, halfH),
           project(1, -1, dFar, vp, halfW, halfH),  project(-1, -1, dFar, vp, halfW, halfH),
           shadeCol(q.tint, shade * 0.5, a));      // ceiling
    }
    if (q.style === 'archives') {
      for (let s = 1; s <= segs; s++) {
        const d = 0.5 + s * 0.6;
        const top = project(-0.7, -0.4, d, vp, halfW, halfH);
        const bot = project(-0.7, 0.6, d, vp, halfW, halfH);
        ctx.fillStyle = hexA(q.accent, 0.18 * Math.min(1, top.scale));
        ctx.fillRect(top.x, top.y, Math.max(2, 10 * top.scale), bot.y - top.y);
        const top2 = project(0.7, -0.4, d, vp, halfW, halfH);
        ctx.fillRect(top2.x, top2.y, Math.max(2, 10 * top2.scale), bot.y - top2.y);
      }
    }
  } else if (q.style === 'surface') {
    const horizon = vp.y;
    ctx.fillStyle = shadeCol(q.tint, 1.4, 0.5);
    ctx.fillRect(vp.x - halfW * 2, horizon, halfW * 4, halfH * 2);            // snow
    ctx.fillStyle = shadeCol(q.tint, 0.5, 0.5);
    ctx.fillRect(vp.x - halfW * 2, horizon - halfH * 2, halfW * 4, halfH * 2); // sky
    for (let i = 0; i < 3; i++) {
      const d = 1.2 + i * 0.7;
      const pr = project(-0.6 + i * 0.6, 0.5, d, vp, halfW, halfH);
      const sz = 22 * pr.scale;
      ctx.fillStyle = hexA(q.accent, 0.5);
      ctx.fillRect(pr.x - sz / 2, pr.y - sz, sz, sz);
      ctx.fillStyle = hexA(q.accent, 0.8);
      ctx.fillRect(pr.x - sz / 2, pr.y - sz, sz, sz * 0.28);
    }
  } else if (q.style === 'temple') {
    for (let s = segs; s >= 1; s--) {
      const d = 0.5 + s * 0.6;
      const a = Math.min(0.85, 0.6 / d);
      [-0.7, 0.7].forEach(u => {
        const top = project(u, -0.8, d, vp, halfW, halfH);
        const bot = project(u, 0.8, d, vp, halfW, halfH);
        const w = Math.max(3, 20 * top.scale);
        ctx.fillStyle = shadeCol(q.tint, s % 2 === 0 ? 1.2 : 0.9, a);
        ctx.fillRect(top.x - w / 2, top.y, w, bot.y - top.y);
      });
    }
    quad(project(-1, 0.8, 0.5, vp, halfW, halfH), project(1, 0.8, 0.5, vp, halfW, halfH),
         project(1, 0.8, 3, vp, halfW, halfH),   project(-1, 0.8, 3, vp, halfW, halfH),
         shadeCol(q.tint, 0.6, 0.6));
  }
}

// ── The live mission: floor-plan lines, gadget pickup, patrol guard + cone, and
// the agent creeping the halls. Composed in the quadrant's OUTER (stage) corner.
function drawMission(qi, rx, ry, rw, rh) {
  const q = QUADRANTS[qi];
  const p = players[qi];
  const path = ARENA_PATH;          // ONE arena — see the ARENA note above

  // Map quad-space [-1,1] to a compact plan box in the OUTER corner of the
  // quadrant, so agents/guards live in the visible stage margin, never center.
  const cx = q.qx < 0.5 ? rx + rw * 0.30 : rx + rw * 0.70;
  const cy = q.qy < 0.5 ? ry + rh * 0.34 : ry + rh * 0.66;
  const sx = rw * 0.24, sy = rh * 0.24;
  const map = (u, v) => ({ x: cx + u * sx, y: cy + v * sy });

  // Floor-plan corridor lines (the level's layout, faintly lit).
  ctx.strokeStyle = hexA(q.accent, 0.5);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < path.length; i++) {
    const a = map(path[i][0], path[i][1]);
    if (i === 0) ctx.moveTo(a.x, a.y); else ctx.lineTo(a.x, a.y);
  }
  ctx.closePath();
  ctx.stroke();

  // Corridor node markers (junctions).
  ctx.fillStyle = hexA(q.accent, 0.35);
  for (const nd of path) {
    const m = map(nd[0], nd[1]);
    ctx.fillRect(m.x - 1.5, m.y - 1.5, 3, 3);
  }

  // ── Gadget pickup: a glowing icon (watch / keycard) at the current node. ────
  const gn = path[p.gadgetNode % path.length];
  const gm = map(gn[0], gn[1]);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4 + qi);
  const isWatch = (p.gadgets + qi) % 2 === 0;
  drawGadget(gm.x, gm.y, isWatch, q.accent, pulse);

  // ── Patrol guard + sweeping flashlight vision cone. ─────────────────────────
  const g = guardOn(path, (p.prog + 0.45) % 1, q.style);
  const gpos = map(g.x, g.y);
  drawGuardCone(gpos.x, gpos.y, g.facing, sx, q.accent, p.sneaking);
  drawGuard(gpos.x, gpos.y, q.accent);

  // ── The arena's features: a grate to duck into, stairs to climb, cells to
  //    creep past, a silo to circle. Named on the plan so the room reads as a
  //    PLACE the four of them are exploring together, not an abstract loop.
  ARENA.forEach((nd) => {
    if (!nd.feature) return;
    const m = map(nd.u, nd.v);
    drawFeature(m.x, m.y, nd.feature, q.accent);
  });

  // ── EVERY player, on the shared plan. This is the whole point: in a real
  //    split-screen LAN you watch your friend cross YOUR screen. The owner of
  //    this quadrant is drawn bright and tagged; the other three are dimmer,
  //    still unmistakably present, each labelled so you know who you just saw.
  const here = [];
  players.forEach((op, oi) => {
    const a = walkPath(path, op.prog);
    const m = map(a.x, a.y);
    here.push({ oi, x: m.x, y: m.y });
    const mine = oi === qi;
    ctx.globalAlpha = mine ? 1 : 0.55;
    drawAgent(m.x, m.y, a.ang, mine && qi === 0, op.sneaking,
              mine ? q.accent : QUADRANTS[oi].accent);
    if (!mine) {
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = hexA(QUADRANTS[oi].accent, 0.8);
      ctx.fillText(QUADRANTS[oi].id, m.x, m.y - 11);
      ctx.textAlign = 'left';
    }
    ctx.globalAlpha = 1;
  });

  // ── They INTERACT. When two agents are close on the shared plan, both of
  //    their screens show it: a link between them and a friendly "!" over each.
  //    Never a weapon, never a hit — this is spotting a friend across the room,
  //    which is the part of a LAN night anybody actually remembers.
  for (let a = 0; a < here.length; a++) {
    for (let b = a + 1; b < here.length; b++) {
      const dx = here[a].x - here[b].x, dy = here[a].y - here[b].y;
      const d = Math.hypot(dx, dy);
      if (d > sx * 0.42) continue;
      const glow = 1 - d / (sx * 0.42);
      ctx.save();
      ctx.globalAlpha = 0.28 + 0.4 * glow;
      ctx.strokeStyle = q.accent;
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(here[a].x, here[a].y);
      ctx.lineTo(here[b].x, here[b].y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.5 + 0.5 * glow;
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffe680';
      ctx.fillText('!', here[a].x, here[a].y - 16);
      ctx.fillText('!', here[b].x, here[b].y - 16);
      ctx.restore();
      ctx.textAlign = 'left';
    }
  }
}

// One arena feature, drawn small and readable at plan scale.
function drawFeature(x, y, kind, accent) {
  ctx.save();
  ctx.strokeStyle = hexA(accent, 0.75);
  ctx.fillStyle   = hexA(accent, 0.30);
  ctx.lineWidth = 1;
  if (kind === 'grate') {                     // a floor grate you duck into
    ctx.fillRect(x - 6, y - 5, 12, 10);
    ctx.strokeRect(x - 6.5, y - 5.5, 13, 11);
    ctx.strokeStyle = hexA(accent, 0.9);
    for (let i = -4; i <= 4; i += 3) {
      ctx.beginPath(); ctx.moveTo(x + i, y - 5); ctx.lineTo(x + i, y + 5); ctx.stroke();
    }
  } else if (kind === 'stairs') {              // steps climbing away
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x - 7 + i * 3, y + 4 - i * 3, 9 - i, 2);
      ctx.strokeRect(x - 7.5 + i * 3, y + 3.5 - i * 3, 10 - i, 3);
    }
  } else if (kind === 'cells') {               // a row of barred cells
    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(x - 9 + i * 7, y - 5, 6, 10);
      ctx.beginPath(); ctx.moveTo(x - 6 + i * 7, y - 5); ctx.lineTo(x - 6 + i * 7, y + 5); ctx.stroke();
    }
  } else if (kind === 'silo') {                // a tall round silo, seen from above
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// A blocky low-poly agent: torso + head, a small "P1" tint for the player.
function drawAgent(x, y, ang, isPlayer, sneaking, accent) {
  const s = sneaking ? 5 : 7;                     // crouch = smaller
  ctx.save();
  ctx.translate(x, y);
  // Body block
  ctx.fillStyle = isPlayer ? '#e8f0e8' : hexA(accent, 0.9);
  ctx.fillRect(-s / 2, -s / 2, s, s);
  // Head dot
  ctx.fillStyle = isPlayer ? '#ffffff' : accent;
  ctx.fillRect(-2, -s / 2 - 3, 4, 3);
  // Heading nub (facing direction) — a tiny step, never a weapon
  ctx.fillStyle = isPlayer ? '#bfe8bf' : hexA(accent, 0.7);
  ctx.fillRect(Math.cos(ang) * s * 0.7 - 1.5, Math.sin(ang) * s * 0.7 - 1.5, 3, 3);
  if (isPlayer) {
    ctx.strokeStyle = '#9fd39f';
    ctx.lineWidth = 1;
    ctx.strokeRect(-s / 2 - 1, -s / 2 - 1, s + 2, s + 2);
  }
  ctx.restore();
}

// A comically oblivious guard: a dim block, smaller and duller than the agent.
function drawGuard(x, y, accent) {
  ctx.fillStyle = hexA(accent, 0.55);
  ctx.fillRect(x - 3, y - 3, 6, 6);
  ctx.fillStyle = hexA(accent, 0.8);
  ctx.fillRect(x - 1.5, y - 5, 3, 2);            // head
}

// The guard's flashlight vision cone: a translucent wedge that sweeps. When the
// agent sneaks, it tints faintly amber (a "close call"), never red/alarm.
function drawGuardCone(x, y, facing, reach, accent, near) {
  const len = reach * 0.9;
  const half = 0.32;                              // cone half-angle
  ctx.save();
  ctx.globalAlpha = near ? 0.22 : 0.13;
  ctx.fillStyle = near ? '#e8d088' : accent;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(facing - half) * len, y + Math.sin(facing - half) * len);
  ctx.lineTo(x + Math.cos(facing + half) * len, y + Math.sin(facing + half) * len);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// A gadget pickup icon: a wristwatch (circle + band) or a keycard (rect + stripe).
function drawGadget(x, y, isWatch, accent, pulse) {
  ctx.save();
  ctx.globalAlpha = pulse;
  if (isWatch) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();                              // watch band
    ctx.moveTo(x, y - 3.2); ctx.lineTo(x, y - 5);
    ctx.moveTo(x, y + 3.2); ctx.lineTo(x, y + 5);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.fillRect(x - 0.5, y - 2.2, 1, 2.5);       // hand
  } else {
    ctx.fillStyle = hexA(accent, 0.85);
    ctx.fillRect(x - 4, y - 2.6, 8, 5);           // keycard
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - 3, y - 1.4, 6, 1.4);         // magnetic stripe
  }
  // Glow halo
  ctx.globalAlpha = pulse * 0.3;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function quad(a, b, c, d, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
  ctx.closePath();
  ctx.fill();
}

// ─── Color helpers ─────────────────────────────────────────────────────────
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
function shadeCol(hex, mul, a) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * mul));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * mul));
  const b = Math.min(255, Math.round((n & 255) * mul));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ─── Split-screen divider lines (ambient — allowed behind the UI panels) ────
// ── THE SHARED MAP ──────────────────────────────────────────────────────────
// Trevor, 2026-09-14: "Maybe we introduce a map showing where the players are and
// to nail home that they are in the same arena — as the player might not pick up
// on that."
//
// He is right, and it is a nice instance of a general trap: the four quadrants DO
// now render one arena, but the only way to notice is to compare two quadrants and
// realise the floor-plans match — which is a deduction, and a five-year-old will
// not make it. A fact the design depends on has to be SHOWN, not inferrable.
//
// So: one small map, one copy of the arena, four dots. It sits in the TOP BAND
// between the two HUD corners (visual-validation.md's stage), which is where an
// arcade would have put a scoreboard anyway — never over the prompt panel, never
// over the keyboard guide.
function drawArenaMap(W, H) {
  const cx = W * 0.5, cy = H * 0.085;
  const sx = W * 0.055, sy = H * 0.052;
  const map = (u, v) => ({ x: cx + u * sx, y: cy + v * sy });

  ctx.save();
  // A dim plate so the map reads over whatever the quadrants are doing behind it.
  ctx.fillStyle = 'rgba(6,8,6,0.72)';
  ctx.fillRect(cx - sx * 0.95, cy - sy * 1.0, sx * 1.9, sy * 2.1);
  ctx.strokeStyle = 'rgba(216,200,64,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - sx * 0.95 + 0.5, cy - sy * 1.0 + 0.5, sx * 1.9 - 1, sy * 2.1 - 1);

  // The arena, once.
  ctx.strokeStyle = 'rgba(216,200,64,0.5)';
  ctx.beginPath();
  ARENA_PATH.forEach((nd, i) => {
    const a = map(nd[0], nd[1]);
    if (i === 0) ctx.moveTo(a.x, a.y); else ctx.lineTo(a.x, a.y);
  });
  ctx.closePath();
  ctx.stroke();

  // Its features, as the same small marks used on the quadrant plans.
  ctx.fillStyle = 'rgba(216,200,64,0.55)';
  ARENA.forEach((nd) => {
    if (!nd.feature) return;
    const m = map(nd.u, nd.v);
    ctx.fillRect(m.x - 2, m.y - 2, 4, 4);
  });

  // FOUR DOTS, ONE ROOM. Each in its player's colour, each labelled — so the
  // shared arena is a thing you SEE rather than a thing you work out.
  players.forEach((op, oi) => {
    const a = walkPath(ARENA_PATH, op.prog);
    const m = map(a.x, a.y);
    const col = QUADRANTS[oi].accent;
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = oi === 0 ? 8 : 3;
    ctx.beginPath();
    ctx.arc(m.x, m.y, oi === 0 ? 3.2 : 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Stagger above/below: when two players stand together — which is exactly the
    // moment this map exists to show — their tags landed on top of each other and
    // rendered "PP2".
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(QUADRANTS[oi].id, m.x, m.y + (oi % 2 === 0 ? -5 : 9));
  });

  ctx.font = '5px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(216,200,64,0.8)';
  ctx.fillText(`ALL 4 IN ${ARENA_NAME}`, cx, cy + sy * 1.0 - 4);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawDividers(W, H) {
  ctx.strokeStyle = 'rgba(210, 200, 150, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
  ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(60, 55, 35, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 + 2, 0); ctx.lineTo(W / 2 + 2, H);
  ctx.moveTo(0, H / 2 + 2); ctx.lineTo(W, H / 2 + 2);
  ctx.stroke();
}

// ─── Per-quadrant player tag + gadget tally, in the outer visible corner ────
function drawQuadTag(qi, W, H) {
  const q = QUADRANTS[qi];
  const p = players[qi];
  const tx = q.qx < 0.5 ? W * 0.055 : W * 0.945;
  const ty = q.qy < 0.5 ? H * 0.145 : H * 0.855;
  ctx.textAlign = q.qx < 0.5 ? 'left' : 'right';
  ctx.textBaseline = 'alphabetic';

  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillStyle = hexA(q.accent, 0.95);
  ctx.fillText(q.id, tx, ty);
  // Was q.name (FACILITY / ARCHIVES / SURFACE / TEMPLE) — four different levels,
  // which was the bug. All four are in ONE arena now, so the tag names the VIEW
  // ("YOUR SCREEN") and the arena is named once, in the HUD.
  ctx.font = '5px "Press Start 2P", monospace';
  ctx.fillStyle = hexA(q.accent, 0.6);
  ctx.fillText(qi === 0 ? 'YOUR SCREEN' : 'SPLIT SCREEN', tx, ty + 9);
  // Gadget tally dots
  ctx.fillStyle = hexA(q.accent, 0.85);
  const target = qi === 0 ? GADGETS_TO_WIN : 5;
  const dir = q.qx < 0.5 ? 1 : -1;
  for (let i = 0; i < target; i++) {
    const dx = tx + dir * (i * 6) + (q.qx < 0.5 ? 0 : -target * 6 + 6);
    ctx.globalAlpha = i < p.gadgets ? 0.95 : 0.25;
    ctx.fillRect(dx, ty + 14, 4, 4);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

// ─── Expanding ring pings (gadget-secured / victory) ─────────────────────────
function drawPings() {
  for (let i = pings.length - 1; i >= 0; i--) {
    const s = pings[i];
    s.life -= 0.05;
    if (s.life <= 0) { pings.splice(i, 1); continue; }
    const grow = 1 - s.life;
    ctx.globalAlpha = s.life;
    ctx.strokeStyle = s.col;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, Math.max(0, s.r * (0.4 + grow * 1.4)), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function addPing(x, y, r, col) {
  if (pings.length >= MAX_PINGS) pings.shift();
  pings.push({ x, y, r, life: 1, col });
}

// The mission-progress bar for P1 (the player), centered on the divider cross,
// clear of the DOM UI panels.
function drawHUD(W, H) {
  const pct = players[0].gadgets / GADGETS_TO_WIN;
  const barW = Math.round(W * 0.14), barH = 8;
  const bx = Math.round(W * 0.04);
  const by = Math.round(H * 0.5 - 20);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#d8c840';
  ctx.shadowColor = '#d8c840';
  ctx.shadowBlur = 4;
  ctx.fillText(`GADGETS ${players[0].gadgets}/${GADGETS_TO_WIN}`, bx, by);
  ctx.font = '5px "Press Start 2P", monospace';
  ctx.fillStyle = '#9a8a40';
  ctx.fillText(`4-PLAYER · ${ARENA_NAME}`, bx, by - 10);
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#d8c840';
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#181410';
  ctx.fillRect(bx, by + 5, barW, barH);
  ctx.fillStyle = '#d8c840';
  ctx.fillRect(bx, by + 5, Math.round(barW * Math.min(1, pct)), barH);
  ctx.strokeStyle = '#5a4a10';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx + 0.5, by + 5.5, barW - 1, barH - 1);
}

// ── Ambient sim: advance P2–P4 agents; sweep guards; toggle sneaking; P1 idles
//    between keystrokes (its progress advances only in keystroke()). Gated on
//    recent keystrokes so an unattended tab never progresses the game (L20).
function stepSim(dt) {
  const engaged = (performance.now() - lastKeyMs) < 8000;
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    const q = QUADRANTS[i];
    const path = pathFor(q.style);

    // P2-P4 walk continuously (attract motion) only while engaged; P1 idles.
    if (i !== 0 && engaged) {
      p.prog = (p.prog + p.speed * dt) % 1;
      // Ambient gadget secures for the friendly-competition tally.
      const near = distToNode(path, p.prog, p.gadgetNode);
      if (near < 0.04 && p.gadgets < 5) {
        p.gadgets++;
        p.gadgetNode = (p.gadgetNode + 2) % path.length;
      }
    }

    // Sneaking: freeze when the sweeping guard cone points near the agent.
    const g = guardOn(path, (p.prog + 0.45) % 1, q.style);
    const ag = walkPath(path, p.prog);
    const toAgent = Math.atan2(ag.y - g.y, ag.x - g.x);
    const dAng = Math.abs(angDiff(g.facing, toAgent));
    const dDist = Math.hypot(ag.x - g.x, ag.y - g.y);
    p.sneaking = dAng < 0.4 && dDist < 0.9;

    if (p.quadFlash > 0) p.quadFlash = Math.max(0, p.quadFlash - dt * 1.6);
  }
}

function distToNode(path, prog, nodeIdx) {
  const a = walkPath(path, prog);
  const nd = path[nodeIdx % path.length];
  return Math.hypot(a.x - nd[0], a.y - nd[1]);
}
function angDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// ─── MISSION COMPLETE debrief (victory) ──────────────────────────────────────
const OBJECTIVES = ['GADGETS SECURED', 'GUARDS EVADED', 'EXIT REACHED'];

function drawVictory(W, H, nowMs) {
  const elapsed = Math.max(0, nowMs - victoryStartMs);
  const prog = Math.min(1, elapsed / VICTORY_MS);

  // All four quadrants ping-flash in sequence throughout the debrief.
  for (let i = 0; i < 4; i++) {
    const q = QUADRANTS[i];
    const phase = (prog * 4 + i * 0.25) % 1;
    const a = Math.max(0, 0.35 * (1 - phase));
    if (a > 0.01) {
      ctx.globalAlpha = a;
      ctx.fillStyle = q.accent;
      ctx.fillRect(q.qx * W, q.qy * H, W * 0.5, H * 0.5);
      ctx.globalAlpha = 1;
    }
  }

  // Debrief stamp panel across the top stage band (clear of center DOM UI).
  const panelY = H * 0.055, panelH = H * 0.10;
  ctx.fillStyle = 'rgba(8, 10, 8, 0.82)';
  ctx.fillRect(W * 0.5 - W * 0.24, panelY, W * 0.48, panelH);
  ctx.strokeStyle = '#d8c840';
  ctx.lineWidth = 2;
  ctx.strokeRect(W * 0.5 - W * 0.24, panelY, W * 0.48, panelH);

  // "MISSION COMPLETE" stamp — scales in with a slight overshoot, then holds.
  const stampIn = Math.min(1, prog / 0.22);
  const scale = 0.6 + 0.4 * easeOut(stampIn) + Math.sin(stampIn * Math.PI) * 0.06;
  ctx.save();
  ctx.translate(W * 0.5, panelY + panelH * 0.42);
  ctx.scale(scale, scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.fillStyle = '#ffe870';
  ctx.shadowColor = '#d8c840';
  ctx.shadowBlur = 10;
  ctx.fillText('MISSION COMPLETE', 0, 0);
  ctx.shadowBlur = 0;
  ctx.restore();

  // Objective checklist ticking ✓ one at a time under the stamp.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '7px "Press Start 2P", monospace';
  const listX = W * 0.5 - W * 0.20;
  const listY = panelY + panelH * 0.78;
  for (let i = 0; i < OBJECTIVES.length; i++) {
    const checked = prog > 0.30 + i * 0.18;
    ctx.fillStyle = checked ? '#9fe89f' : 'rgba(180,180,150,0.4)';
    const box = listX + i * (W * 0.135);
    ctx.strokeStyle = checked ? '#9fe89f' : 'rgba(180,180,150,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(box, listY - 5, 8, 8);
    if (checked) {                       // draw a check mark
      ctx.beginPath();
      ctx.moveTo(box + 1.5, listY - 1);
      ctx.lineTo(box + 3.5, listY + 2.5);
      ctx.lineTo(box + 6.5, listY - 3.5);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.fillText(OBJECTIVES[i], box + 12, listY);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function easeOut(x) { return 1 - Math.pow(1 - x, 3); }

// ─── Main render loop ────────────────────────────────────────────────────────
function render() {
  if (!active) return;
  const W = canvas.width, H = canvas.height;
  const nowMs = performance.now();
  t += 0.016;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, W, H);

  if (!victoryMode) stepSim(0.016);

  for (let i = 0; i < QUADRANTS.length; i++) drawQuadrant(i, W, H);
  drawDividers(W, H);
  drawArenaMap(W, H);
  for (let i = 0; i < QUADRANTS.length; i++) drawQuadTag(i, W, H);
  drawPings();

  if (victoryMode) {
    drawVictory(W, H, nowMs);
  } else {
    drawHUD(W, H);
  }

  // Hops across the true bottom of the screen, over the split-screen grid.
  drawWhiteRabbit(ctx, W, H);

  animId = requestAnimationFrame(render);
}

// Corner center (canvas px) for a quadrant's mission action — for pings.
function quadActionCenter(qi) {
  const W = canvas.width, H = canvas.height;
  const q = QUADRANTS[qi];
  const rx = q.qx * W, ry = q.qy * H, rw = 0.5 * W, rh = 0.5 * H;
  return {
    x: q.qx < 0.5 ? rx + rw * 0.30 : rx + rw * 0.70,
    y: q.qy < 0.5 ? ry + rh * 0.34 : ry + rh * 0.66,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────
export function start() {
  init();
  resetWhiteRabbit();
  active = true;
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Each correct keystroke nudges P1's agent forward along the Facility floor-plan.
// The agent creeps toward the next gadget node; sequence completion secures it.
export function keystroke() {
  if (!active || victoryMode) return;
  lastKeyMs = performance.now();
  const p = players[0];
  p.prog = (p.prog + 0.04) % 1;
}

export function miss() {
  // Gentle near-miss: the guard cone gets a soft amber "close call" pulse in P1's
  // quadrant — no penalty, no alarm, nothing lost.
  if (!active || victoryMode) return;
  players[0].sneaking = true;
  const c = quadActionCenter(0);
  addPing(c.x, c.y, Math.min(canvas.width, canvas.height) * 0.012, 'rgba(232,208,136,0.9)');
}

// Called once per completed letter sequence — P1 secures a gadget. Win when P1
// has secured GADGETS_TO_WIN. Won stays won on repeated calls (engine may re-ask).
export function patternComplete() {
  if (victoryMode || hasWon) return true;
  const p = players[0];
  lastKeyMs = performance.now();
  p.gadgets++;
  p.quadFlash = 1;
  // Advance the gadget pickup to the next node along the plan.
  const path = pathFor(QUADRANTS[0].style);
  p.gadgetNode = (p.gadgetNode + 2) % path.length;
  // Snap the agent to the secured node for a satisfying "picked it up" beat.
  const c = quadActionCenter(0);
  addPing(c.x, c.y, Math.min(canvas.width, canvas.height) * 0.03, QUADRANTS[0].accent);
  if (p.gadgets >= GADGETS_TO_WIN) hasWon = true;
  maybeWhiteRabbit(hasWon);   // cosmetic only — never gates or delays the win
  return hasWon;
}

// The MISSION COMPLETE debrief celebration. Returns its duration in ms.
export function victory() {
  if (!active) return VICTORY_MS;
  victoryMode = true;
  victoryStartMs = performance.now();
  // Fill every quadrant's tally and fire a ping in each corner.
  for (let i = 0; i < players.length; i++) {
    const c = quadActionCenter(i);
    addPing(c.x, c.y, Math.min(canvas.width, canvas.height) * 0.05, QUADRANTS[i].accent);
  }
  return VICTORY_MS;
}

window.addEventListener('resize', () => {
  if (!active || !canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
