// ─── Act 7 · Track 5 — F-ZERO (Nintendo EAD, November 21 1990) ──────────────
//
// Eleven years and four hardware generations after Monaco GP, on purpose: these
// two tracks exist together in the first wave to prove Act 7's graphics climb
// with the era rather than settling into one retro look.
//
// GROUND TRUTH (research/wiki/games/f-zero.md, research/racing-games-by-era.md §5
// — never model memory):
//   · Nintendo EAD; Miyamoto producer, Kazunobu Shimizu director. November 21 1990,
//     one of two Super Famicom launch titles.
//   · Rendering: MODE 7 — "allows a raster graphical plane to be rotated and scaled
//     freely, simulating the appearance of 3D environments" WITHOUT polygon
//     processing. Everything that is not the ground plane is a sprite.
//   · It invented the futuristic anti-gravity racing subgenre.
//
// WHAT WE DELETED (spec §5.2, §5.6b; f-zero.md's own punishment ledger):
//   F-Zero's POWER METER, its LIVES and its RETIREMENT are all gone. The meter on
//   screen here is the CHARGE meter Lane B owns — additive only, decaying at the
//   same rate during flawless typing as during a wait, so nothing is ever taken.
//   The craft has no damage state, cannot retire, and cannot be eliminated. The
//   field spins and recovers around it; the player never can.
//
// RENDER TIER: `mode7` — the kit gives this file `affinePlane`, `billboard` and,
// for the first time on the ladder, real `withAlpha` translucency (Monaco GP has
// to dither its ghost, because 1979 had no alpha). It does NOT give this file a
// gradient: the dusk sky is drawn as raster BANDS, which is how the hardware did it.
//
// LAYOUT: the vanishing point sits at 0.34W — deliberately off horizontal centre
// (journal L17) — and the RACE ENGINE owns the band `s.reserved` names (its prompt
// + ghost line + lap bar + CHARGE floor, one opaque panel, nominally 0.70–0.94H).
// The ground plane runs under it as ambient fill, but every focal element composes
// around it: sky and skyline above, the craft riding just ABOVE the panel, and a
// dashboard sliver BELOW it. The band is read from state, never hard-coded.
//
// The power bar here is not a duplicate of the engine's CHARGE bar — it is F-Zero's
// own gauge, the thing this cabinet had where the engine has a plain bar.

import { kitFor, readScene } from '../render/kit.js';

const kit = kitFor('mode7');

// Palette indices into the tier's fixed 16-colour set (kit.js TIER_SPEC.mode7).
const C = {
  white: 0, pale: 1, amber: 2, rose: 3, magenta: 4, purple: 5, deep: 6, night: 7,
  cyan: 8, blue: 9, navy: 10, green: 11, silver: 12, grey: 13, slate: 14, black: 15
};

const FOV = 180;
const ROAD_HALF = 1.6;         // world units; the kit maps this to ~0.28W on screen
const CURB = 2.1;
const LAP_DEPTH = 260;         // world units of road in one lap

// Sprites are 1-bit masks; a multi-colour SNES sprite is several masks in
// different palette inks, which is exactly how the hardware composed one.
const CRAFT = [
  '....#####....',
  '...#######...',
  '..#########..',
  '.###########.',
  '#############',
  '#############',
  '###.#####.###',
  '##...###...##'
];
const CANOPY = ['.###.', '#####', '.###.'];
const FLAME_A = ['.#####.', '..###..', '...#...'];
const FLAME_B = ['..###..', '.#####.', '..###..', '...#...'];
const RIVAL = ['..#####..', '.#######.', '#########', '##.###.##', '#.......#'];
const PYLON = ['.#.', '###', '.#.', '.#.', '.#.', '.#.', '###'];
const GATE_POST = ['####', '####', '.##.', '.##.', '.##.', '.##.', '.##.', '.##.', '####'];
const SPARK = ['.#.', '###', '.#.'];

// Mute City's dusk, as raster bands. There is no gradient primitive at this tier
// and there was no gradient in the hardware: the sky was scanline colours.
const SKY_BANDS = [
  [0.00, C.night], [0.10, C.deep], [0.20, C.purple], [0.28, C.magenta],
  [0.34, C.rose], [0.385, C.amber], [0.415, C.pale]
];

// Skyline towers: [xFraction, widthFraction, heightFraction]. The tall focal ones
// live in the side margins; the low ones across the middle are ambient fill.
const TOWERS = [
  [0.015, 0.030, 0.190], [0.055, 0.022, 0.135], [0.085, 0.038, 0.235],
  [0.135, 0.026, 0.160], [0.170, 0.034, 0.205], [0.215, 0.020, 0.110],
  [0.260, 0.030, 0.140], [0.320, 0.024, 0.095], [0.390, 0.034, 0.125],
  [0.460, 0.022, 0.080], [0.530, 0.030, 0.110], [0.600, 0.026, 0.150],
  [0.650, 0.020, 0.090], [0.700, 0.036, 0.175], [0.760, 0.024, 0.120],
  [0.800, 0.036, 0.250], [0.855, 0.028, 0.170], [0.900, 0.034, 0.215],
  [0.950, 0.026, 0.145]
];

const AMBIENT_COUNT = 5;
function ambientCraft(i, ms, progress) {
  const drift = (ms * 0.000018) * (0.8 + i * 0.11);
  return {
    progress: (progress + 0.05 + i * 0.14 + drift) % 1,
    lane: Math.sin(i * 1.7 + ms * 0.0004) * 0.7,
    spin: i === 3 && Math.sin(ms * 0.00035) > 0.88 ? 1 : 0
  };
}

function fmod(a, m) {
  const r = a % m;
  return r < 0 ? r + m : r;
}

// The ground plane's texture function, sampled per pixel by kit.affinePlane.
// Track, magnet strips, and the city grid below — the grid is what makes the
// rotation and scaling legible, which is the entire point of Mode 7.
function shadeGround(u, v, z) {
  const far = z > 34;
  if (z > 95) return C.night;
  const au = u < 0 ? -u : u;
  if (au < ROAD_HALF) {
    if (au < 0.09 && (Math.floor(v / 0.9) & 1)) return far ? C.silver : C.white;
    if (au > ROAD_HALF - 0.16) return far ? C.slate : C.silver;
    return (Math.floor(v / 1.2) & 1) ? (far ? C.slate : C.grey) : (far ? C.black : C.slate);
  }
  if (au < CURB) {
    return (Math.floor(v / 0.55) & 1) ? (far ? C.blue : C.cyan) : (far ? C.slate : C.white);
  }
  if (!far && (fmod(u, 3) < 0.16 || fmod(v, 3) < 0.16)) return C.navy;
  return ((Math.floor(u / 3) + Math.floor(v / 3)) & 1) ? C.night : C.black;
}

function drawScene(ctx, W, H, state) {
  const s = readScene(state);

  kit.frame(ctx, W, H, (p) => {
    const PW = p.W, PH = p.H;
    const resTop = s.reserved.top * PH;      // below this the engine owns the frame
    const resBot = s.reserved.bottom * PH;   // below THAT is the track's dash sliver
    const horizon = 0.30 * PH;
    const vpX = 0.34 * PW;                   // never the horizontal centre (L17)
    const craftX = 0.33 * PW;
    const craftY = resTop - 0.085 * PH;      // the craft rides just above the panel

    // Camera: the plane rotates as the course bends — the Mode 7 signature.
    const yaw = Math.sin(s.progress * 9.2) * 0.30 + Math.sin(s.progress * 2.1) * 0.06;
    const camZ = s.progress * LAP_DEPTH;
    const cos = Math.cos(yaw), sin = Math.sin(yaw);
    // Pin the road centre under the craft at the craft's depth, so the swing of
    // the plane never drives the player off their own road.
    const lzCraft = FOV / Math.max(1, craftY - horizon + 1);
    const lxCraft = (craftX - vpX) * 2 * lzCraft / FOV;
    const camX = lzCraft * sin - lxCraft * cos;

    // ── sky: raster bands, not a gradient ───────────────────────────────────
    for (let i = 0; i < SKY_BANDS.length; i++) {
      const y0 = SKY_BANDS[i][0] * PH * (horizon / (0.44 * PH));
      const y1 = (i + 1 < SKY_BANDS.length ? SKY_BANDS[i + 1][0] : 1) * (horizon / 0.44);
      p.rect(0, y0, PW, y1 - y0, SKY_BANDS[i][1]);
    }

    // ── the city, in silhouette, with its lights on ─────────────────────────
    for (let i = 0; i < TOWERS.length; i++) {
      const tx = TOWERS[i][0] * PW, tw = TOWERS[i][1] * PW, th = TOWERS[i][2] * PH * 0.66;
      p.rect(tx, horizon - th, tw, th, C.deep);
      p.rect(tx, horizon - th, 1, th, C.purple);
      for (let wy = horizon - th + 3; wy < horizon - 3; wy += 4) {
        for (let wx = tx + 2; wx < tx + tw - 2; wx += 4) {
          const lit = ((wx * 7 + wy * 13 + i * 5) | 0) % 5;
          if (lit === 0) p.rect(wx, wy, 2, 2, C.pale);
          else if (lit === 1) p.rect(wx, wy, 2, 2, C.cyan);
        }
      }
    }
    p.rect(0, horizon - 1, PW, 1, C.cyan);

    // ── the rotated, scaled raster plane ────────────────────────────────────
    p.affinePlane({
      horizonY: horizon, vanishX: vpX, camX, camZ, yaw, fov: FOV, shade: shadeGround
    });

    // ── magnet-rail pylons down both edges ──────────────────────────────────
    for (let k = 0; k < 26; k++) {
      const v = Math.ceil(camZ / 2.2) * 2.2 + k * 2.2;
      p.billboard(PYLON, -CURB - 0.15, v, C.cyan, { size: 0.030 });
      p.billboard(PYLON, CURB + 0.15, v, C.cyan, { size: 0.030 });
    }

    // ── the finish gate, standing where the lap ends ────────────────────────
    const gateV = camZ + (1 - s.progress) * LAP_DEPTH;
    if (gateV - camZ < 70) {
      p.billboard(GATE_POST, -ROAD_HALF - 0.2, gateV, C.amber, { size: 0.075 });
      p.billboard(GATE_POST, ROAD_HALF + 0.2, gateV, C.amber, { size: 0.075 });
    }

    // ── the field: alive, fallible, never scored ────────────────────────────
    const count = s.fieldCount > 0 ? s.fieldCount : AMBIENT_COUNT;
    for (let i = 0; i < count; i++) {
      const car = s.fieldCount > 0 ? s.field[i] : ambientCraft(i, s.ms, s.progress);
      const rel = car.progress - s.progress;
      if (rel < -0.02 || rel > 0.26) continue;
      const v = camZ + rel * LAP_DEPTH + 2.4;
      const spun = car.spin > 0.5;
      const lane = car.lane * (ROAD_HALF - 0.45) + (spun ? Math.sin(s.ms / 120) * 0.25 : 0);
      const ink = [C.rose, C.green, C.amber, C.magenta, C.cyan][i % 5];
      const hit = p.billboard(RIVAL, lane, v, ink, { size: 0.055 });
      // They spin. They puff. They recover. Nobody is hurt and nothing is scored.
      if (spun && hit) {
        p.withAlpha(0.5, () => {
          p.blit1bit(SPARK, hit.x - 8, hit.y - 4, C.silver, { scale: Math.max(1, hit.scale) });
          p.blit1bit(SPARK, hit.x + 5, hit.y - 6, C.silver, { scale: Math.max(1, hit.scale) });
        });
      }
    }

    // ── the ghost: you, last time, actually translucent this era ────────────
    if (s.ghostProgress !== null) {
      const rel = s.ghostProgress - s.progress;
      const gv = camZ + rel * LAP_DEPTH + 2.4;
      if (rel > -0.05 && rel < 0.5) {
        p.withAlpha(0.55, () => {
          const hit = p.billboard(CRAFT, -0.55, gv, C.white, { size: 0.075 });
          if (hit) {
            p.blit1bit(CANOPY, hit.x - hit.w * 0.19, hit.y - hit.h * 0.72, C.cyan,
              { scale: Math.max(1, Math.round(hit.scale * 0.6)) });
            if (s.ghostWaiting) {
              // Waiting at the line, cheering, until you get there (spec §5.5).
              const bob = Math.sin(s.ms / 180) * 3;
              const sc = Math.max(1, Math.round(hit.scale * 0.8));
              p.blit1bit(SPARK, hit.x - hit.w * 0.8, hit.y - hit.h - 6 + bob, C.pale, { scale: sc });
              p.blit1bit(SPARK, hit.x + hit.w * 0.6, hit.y - hit.h - 3 - bob, C.pale, { scale: sc });
              p.blit1bit(SPARK, hit.x, hit.y - hit.h - 10 - bob, C.white, { scale: sc });
            }
          }
        });
      }
    }

    // ── charge, as the craft's own thrust ───────────────────────────────────
    if (s.charge > 0.03) {
      p.withAlpha(0.25 + s.charge * 0.5, () => {
        const reach = 6 + s.charge * 34;
        for (let i = 0; i < 6; i++) {
          const yy = craftY - 18 - i * 7;
          const spread = 2 + i * 2.2 + s.charge * 5;
          p.rect(craftX - spread - 26, yy, reach * 0.4, 1, C.cyan);
          p.rect(craftX + spread + 22, yy, reach * 0.4, 1, C.cyan);
        }
      });
    }

    // ── the player's craft ──────────────────────────────────────────────────
    const bob = Math.sin(s.ms / 260) * 1.2;
    const SC = 3;                                  // the hero vehicle's sprite scale
    const cw = CRAFT[0].length * SC, chh = CRAFT.length * SC;
    const cx0 = craftX - cw / 2, cy0 = craftY - chh / 2 + bob;
    // Anti-grav shadow on the plane below — it never touches the road.
    p.withAlpha(0.4, () => {
      p.rect(cx0 + SC * 2, cy0 + chh + SC * 3, cw - SC * 4, SC, C.black);
      p.rect(cx0 + SC * 4, cy0 + chh + SC * 4, cw - SC * 8, SC, C.black);
    });
    const flame = (Math.floor(s.ms / 70) % 2 === 0) ? FLAME_A : FLAME_B;
    const fs = s.charge > 0.5 ? SC : SC - 1;
    p.blit1bit(flame, craftX - flame[0].length * fs / 2, cy0 + chh - SC,
      s.charge > 0.5 ? C.cyan : C.amber, { scale: fs });
    p.blit1bit(CRAFT, cx0, cy0, C.blue, { scale: SC });
    p.rect(cx0 + SC, cy0 + chh - SC * 2, cw - SC * 2, SC, C.navy);
    p.rect(cx0 + SC * 2, cy0 + chh - SC, cw - SC * 4, SC, C.rose);
    p.blit1bit(CANOPY, craftX - CANOPY[0].length * SC / 2, cy0 + SC, C.cyan, { scale: SC });

    // ── top band: whose console this is ─────────────────────────────────────
    p.text('F-ZERO', 0.255 * PW, 0.022 * PH, C.pale, { scale: 2 });
    p.text('NINTENDO 1990', 0.255 * PW, 0.092 * PH, C.cyan, { scale: 1 });

    // ── the dash sliver below the engine's panel: F-Zero's own power gauge ──
    const dy = resBot + 0.016 * PH;
    p.rect(0, resBot, PW, PH - resBot, C.night);   // an opaque dash, not see-through road
    p.text('MODE 7', 0.045 * PW, dy, C.magenta, { scale: 1 });
    p.text('CHARGE', 0.400 * PW, dy, C.pale, { scale: 1 });
    const mx = 0.560 * PW, mw = 0.395 * PW, mh = 0.026 * PH, my = dy + 1;
    p.rect(mx - 2, my - 2, mw + 4, mh + 4, C.deep);
    p.rect(mx - 1, my - 1, mw + 2, 1, C.cyan);
    p.rect(mx - 1, my + mh, mw + 2, 1, C.cyan);
    p.rect(mx - 1, my, 1, mh, C.cyan);
    p.rect(mx + mw, my, 1, mh, C.cyan);
    const segs = 16;
    const lit = Math.round(s.charge * segs);
    for (let i = 0; i < lit; i++) {
      const t = i / segs;
      p.rect(mx + 2 + i * (mw - 4) / segs, my + 2, (mw - 4) / segs - 1, mh - 4,
        t > 0.75 ? C.pale : (t > 0.45 ? C.cyan : C.blue));
    }
  });
}

export const TRACK = Object.freeze({
  id: 'f-zero',
  title: 'F-ZERO',
  developer: 'Nintendo EAD',
  year: 1990,
  tier: 'mode7',
  variant: 'raster-plane',
  eraRank: 5,
  vehicle: 'anti-gravity craft',
  tagline: 'one raster plane, rotated and scaled, and not a polygon in sight',
  lapChars: 220,
  drawScene
});
