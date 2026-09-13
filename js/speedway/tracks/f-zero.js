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
// THE WIN MOMENT (arcade-historian pass, 2026-09-13 — f-zero.md, 3 → 6 refs):
//   · What we CAN use: per lap the original granted a ~4-second SUPER JET speed
//     boost, and its race-completion celebration was "spinning the camera into a
//     side-on position" over your machine. Both are documented and both are
//     PLACEMENT-FREE, so both survive INV-82. Both are built below.
//   · What we CANNOT use, and why: nearly all of F-Zero's completion content is
//     PLACEMENT — points by finishing position, disqualification below a place
//     cutoff that tightens each lap, "only the best three racers count as winners",
//     league standings. INV-82 forbids placement, position and finish order
//     anywhere in this act. Also deleted: the power meter, retirement, and the
//     machine EXPLODING.
//   · The checkered flag IS drawn here, unlike on Monaco GP — but note honestly
//     that it is a LATER convention: its earliest verified appearance in a video
//     game is Pole Position (1982). On a 1990 cabinet it is unremarkable; on the
//     1979 track it would be an anachronism, which is why that file has none.
//   · Confetti / fireworks / crowds / podiums are `[unverified]` in racing games
//     1974–1990 and are drawn nowhere in this act.
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
//
// Every stacked text block derives its leading from `textHeight()`/`lineStep()`.
// The kit draws its own 5×7 bitmap font, so `measureText` is meaningless here and a
// hand-tuned pixel constant is exactly how the title and the developer line ended up
// drawn on top of each other (Trevor, 2026-09-13; journal O20's class of bug).

import { kitFor, readScene, textHeight, textWidth, lineStep } from '../render/kit.js';

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
// The player's craft seen from the SIDE — used only by the camera-spin celebration,
// which is the documented F-Zero race-completion move.
const CRAFT_SIDE = [
  '......#####......',
  '....#########....',
  '..###############',
  '#################',
  '.###############.',
  '..##.#######.##..',
  '...#.........#...'
];
// A blinking chevron that hangs over the player's craft and points at it. Trevor,
// 2026-09-13: "it was really hard to determine which car was mine." Sixteen colours
// is a much bigger budget than Monaco GP's one ink, so this tier can answer with
// colour AND a marker AND scale: the rivals are drawn in the palette's NEUTRAL half
// (silver / grey / slate / violet), while the player is the only vivid blue-and-rose
// machine on the plane, the only one with a cyan canopy, and the only one wearing
// this marker.
// Deliberately SMALL and hugging the craft: an earlier, larger version floating
// well above it read as a distant rival machine, which is the opposite of the job.
const MARKER = ['#####', '.###.', '..#..'];
// Rivals never borrow the player's inks. Neutral, cool, and clearly "other traffic".
// Vivid enough to READ at distance on a dark plane (the whole point of finding 8 is
// that the field must be PRESENT), but never wearing the player's blue / rose / cyan.
// No rival ever wears MAGENTA either: it is close enough to the player's rose that
// a distant rival and the player's own marker read as the same object.
const RIVAL_INKS = [11, 12, 2, 5, 13];    // green, silver, amber, purple, grey
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

// Ambient traffic for when the engine has handed us no field. Expressed as `rel`
// (a signed offset from the player) — the same contract the real field uses, so
// there is exactly one way to place a craft in this file.
const AMBIENT_COUNT = 5;
function ambientCraft(i, ms) {
  const drift = (ms * 0.000018) * (0.8 + i * 0.11);
  const span = 0.30;
  return {
    rel: 0.01 + ((i * 0.07 + drift) % span),
    lane: Math.sin(i * 1.7 + ms * 0.0004) * 0.7,
    spin: i === 3 && Math.sin(ms * 0.00035) > 0.88 ? 1 : 0
  };
}

function fmod(a, m) {
  const r = a % m;
  return r < 0 ? r + m : r;
}

function easeInOut(t) {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
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
    // The decoration clock — it runs at the start line too, which is what lets the
    // craft hover with its thrusters lit instead of hanging there as a still frame.
    const T = s.animMs;

    // Camera: the plane rotates as the course bends — the Mode 7 signature.
    //
    // THE CELEBRATION CAMERA (documented, f-zero.md): F-Zero's race-completion move
    // was "spinning the camera into a side-on position" over your machine. Here the
    // plane's yaw swings out to a quarter turn across the celebration window and the
    // craft swaps to its side profile as it gets there — the same shot, made out of
    // the only thing this hardware could actually do, which is rotate its one raster
    // plane. `spin` is derived entirely from clamped elapsed time (journal F1/L36),
    // so any single throttled frame still lands somewhere coherent in the move.
    const spin = s.celebrating ? easeInOut(Math.min(1, Math.max(0, s.celebrate / 0.75))) : 0;
    const yaw = Math.sin(s.progress * 9.2) * 0.30 + Math.sin(s.progress * 2.1) * 0.06
      + spin * 1.35;
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
      const gateInk = s.celebrating && (Math.floor(T / 110) % 2 === 0) ? C.pale : C.amber;
      const gl = p.billboard(GATE_POST, -ROAD_HALF - 0.2, gateV, gateInk, { size: 0.075 });
      const gr = p.billboard(GATE_POST, ROAD_HALF + 0.2, gateV, gateInk, { size: 0.075 });
      // The checkered banner across the gate. NOTE (research, 2026-09-13): the
      // checkered flag is a LATER convention than Monaco GP — earliest verified
      // video-game appearance is Pole Position (1982). By 1990 it is unremarkable,
      // so it belongs here and nowhere near the 1979 track.
      if (gl && gr && gr.x > gl.x) {
        const cell = Math.max(2, Math.round((gr.x - gl.x) / 16));
        const by = Math.min(gl.y, gr.y) - gl.h;
        for (let cx = gl.x; cx < gr.x; cx += cell) {
          for (let r = 0; r < 2; r++) {
            const on = ((Math.round((cx - gl.x) / cell) + r) % 2) === 0;
            p.rect(cx, by + r * cell, Math.min(cell, gr.x - cx), cell,
              on ? C.white : C.night);
          }
        }
      }
    }

    // ── the field: alive, fallible, never scored ────────────────────────────
    // Placed by `rel` — a signed offset from the player, which the engine now holds
    // in a rolling band so the road is populated for the WHOLE lap instead of
    // whenever the player's absolute progress happened to converge with theirs
    // (Trevor, 2026-09-13: "only visible towards the end … and not reachable/
    // passable"). `car.progress` wraps and must never be differenced against the
    // player's — that subtraction was the bug.
    //
    // `rel === 0` now means LEVEL WITH YOU: the offset added below is the craft's
    // own depth, so a rival at rel 0 is drawn beside the player's machine and one at
    // a small negative rel has genuinely just been passed. They are never scored,
    // ranked or compared (INV-82) — passing one is simply a nice thing that happens.
    const count = s.fieldCount > 0 ? s.fieldCount : AMBIENT_COUNT;
    for (let i = 0; i < count; i++) {
      const car = s.fieldCount > 0 ? s.field[i] : ambientCraft(i, T);
      const rel = car.rel;
      if (rel < -0.05 || rel > 0.34) continue;
      const v = camZ + rel * LAP_DEPTH + lzCraft;
      const spun = car.spin > 0.5;
      const lane = car.lane * (ROAD_HALF - 0.45) + (spun ? Math.sin(T / 120) * 0.25 : 0);
      const ink = RIVAL_INKS[i % RIVAL_INKS.length];
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
              const bob = Math.sin(T / 180) * 3;
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
    // A completed WORD fires the SUPER JET (documented: F-Zero granted a ~4-second
    // speed boost once per lap). Here it is a burst of thrust streaks and a wider,
    // brighter flare — and it moves the craft exactly NOWHERE. Lap position is
    // `charsTyped / lapChars` and this block cannot write to it (INV-78); the boost
    // is what typing FAST already felt like, made visible.
    // The SUPER JET holds lit through the whole celebration: the documented F-Zero
    // per-lap reward was a ~4-second speed boost, so the lap ending on full thrust
    // under a side-on camera is the original's own vocabulary, not an invention.
    const jet = Math.max(s.boost, s.celebrating ? 0.55 : 0);
    const thrust = Math.min(1, s.charge + jet * 0.6);
    if (thrust > 0.03 && spin < 0.2) {
      // Down-the-road speed lines while the camera is behind the machine.
      p.withAlpha(0.25 + thrust * 0.5, () => {
        const reach = 6 + thrust * 34 + jet * 26;
        const lines = 6 + Math.round(jet * 5);
        for (let i = 0; i < lines; i++) {
          const yy = craftY - 18 - i * 7;
          const spread = 2 + i * 2.2 + thrust * 5;
          p.rect(craftX - spread - 26, yy, reach * 0.4, 1, jet > 0.35 ? C.pale : C.cyan);
          p.rect(craftX + spread + 22, yy, reach * 0.4, 1, jet > 0.35 ? C.pale : C.cyan);
        }
      });
    } else if (thrust > 0.03) {
      // Once the camera is side-on, the SUPER JET reads as a trail streaming off the
      // back of the machine instead of as lines coming at you.
      p.withAlpha(0.3 + thrust * 0.45, () => {
        for (let i = 0; i < 7; i++) {
          const yy = craftY - 10 + i * 3;
          const len = 14 + thrust * 46 - Math.abs(i - 3) * 6;
          if (len <= 2) continue;
          p.rect(craftX - 34 - len, yy, len, 1, i % 2 ? C.cyan : C.pale);
        }
      });
    }

    // ── the player's craft ──────────────────────────────────────────────────
    // IDLE / ATTRACT MOTION. The start line used to render a byte-identical frozen
    // frame, because every animation here was keyed to the LAP clock, which does not
    // start until the first keystroke. Keyed to the decoration clock, an
    // anti-gravity machine standing on the grid does what an anti-gravity machine
    // does: it hovers, its thrusters idle, and its shadow breathes underneath it.
    // None of it moves the craft one unit down the course.
    const hover = s.idling ? 2.6 : 1.2;
    const bob = Math.sin(T / (s.idling ? 340 : 260)) * hover;
    const SC = 3;                                  // the hero vehicle's sprite scale
    const cw = CRAFT[0].length * SC, chh = CRAFT.length * SC;
    // A word completed shoves the sprite forward and it settles back — spectacle in
    // the sprite, never in the position on the course.
    const cx0 = craftX - cw / 2, cy0 = craftY - chh / 2 + bob - jet * 8;
    // Anti-grav shadow on the plane below — it never touches the road.
    p.withAlpha(0.4, () => {
      const lift = s.idling ? Math.sin(T / 340) * SC : 0;
      p.rect(cx0 + SC * 2, cy0 + chh + SC * 3 + lift, cw - SC * 4, SC, C.black);
      p.rect(cx0 + SC * 4, cy0 + chh + SC * 4 + lift, cw - SC * 8, SC, C.black);
    });
    const flame = (Math.floor(T / (s.idling ? 110 : 70)) % 2 === 0) ? FLAME_A : FLAME_B;
    const hot = s.charge > 0.5 || jet > 0.2;
    const fs = hot ? SC + (jet > 0.35 ? 1 : 0) : SC - 1;
    p.blit1bit(flame, craftX - flame[0].length * fs / 2, cy0 + chh - SC,
      jet > 0.35 ? C.pale : (hot ? C.cyan : C.amber), { scale: fs });

    // THE CAMERA SPIN lands side-on, so past the halfway point of the move the
    // machine is drawn in profile — which is the whole point of the shot.
    if (spin > 0.55) {
      const ss = SC + 1;
      const sw = CRAFT_SIDE[0].length * ss, sh = CRAFT_SIDE.length * ss;
      p.blit1bit(CRAFT_SIDE, craftX - sw / 2, craftY - sh / 2 + bob, C.blue, { scale: ss });
      p.rect(craftX - sw / 2 + ss * 2, craftY - sh / 2 + bob + sh - ss, sw - ss * 4, ss, C.rose);
      p.blit1bit(CANOPY, craftX - CANOPY[0].length * ss / 2 - ss * 2,
        craftY - sh / 2 + bob - ss, C.cyan, { scale: ss });
    } else {
      p.blit1bit(CRAFT, cx0, cy0, C.blue, { scale: SC });
      p.rect(cx0 + SC, cy0 + chh - SC * 2, cw - SC * 2, SC, C.navy);
      p.rect(cx0 + SC * 2, cy0 + chh - SC, cw - SC * 4, SC, C.rose);
      p.blit1bit(CANOPY, craftX - CANOPY[0].length * SC / 2, cy0 + SC, C.cyan, { scale: SC });
    }

    // WHICH CRAFT IS MINE. A marker hangs over the player's machine and pulses.
    // Together with the rivals' neutral inks (RIVAL_INKS) and this craft's larger
    // fixed sprite scale, the answer is readable in a glance from three directions
    // at once: colour, size, and a thing pointing at it.
    if (spin < 0.55) {
      const mk = 2;
      const mw = MARKER[0].length * mk;
      const mBob = Math.sin(T / 200) * 2;
      // White/rose, which no rival ink and no piece of Mute City ever uses, so the
      // marker can never be mistaken for scenery. Held clear of the craft's canopy
      // by a full marker height.
      const mInk = (Math.floor(T / 320) % 2 === 0) ? C.white : C.rose;
      p.blit1bit(MARKER, craftX - mw / 2, cy0 - MARKER.length * mk - 3 + mBob, mInk,
        { scale: mk });
    }

    // ── top band: whose console this is ─────────────────────────────────────
    // MEASURED, not guessed: the subtitle's top is the title's top plus the title's
    // own cell height plus a leading of most of a cell. Before this, both lines were
    // placed with hand-tuned canvas fractions and landed on top of each other.
    const titleTop = Math.round(0.020 * PH);
    const subTop = titleTop + lineStep(2, 0.85);
    p.text('F-ZERO', 0.255 * PW, titleTop, C.pale, { scale: 2 });
    p.text('NINTENDO 1990', 0.255 * PW, subTop, C.cyan, { scale: 1 });

    // ── the dash sliver below the engine's panel: F-Zero's own power gauge ──
    // Laid out left to right from measured widths, so no caption can grow into the
    // next one: MODE 7 · CHARGE · the gauge, each clear of the last by a glyph cell.
    const dy = resBot + 0.016 * PH;
    p.rect(0, resBot, PW, PH - resBot, C.night);   // an opaque dash, not see-through road
    const dashX = 0.045 * PW;
    p.text('MODE 7', dashX, dy, C.magenta, { scale: 1 });
    const chargeX = Math.max(dashX + textWidth('MODE 7', 1) + textWidth('MM', 1),
      0.400 * PW);
    p.text('CHARGE', chargeX, dy, C.pale, { scale: 1 });
    const mx = Math.max(chargeX + textWidth('CHARGE', 1) + textWidth('MM', 1),
      0.560 * PW);
    const mw = PW - 0.045 * PW - mx;
    const mh = 0.026 * PH, my = dy + Math.round((textHeight(1) - 0.026 * PH) / 2);
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
  // Long enough for the camera to complete its quarter turn and hold the side-on
  // shot for a beat. Clamped by track.js into the same 1200–6000 ms band every level
  // theme's victory() returns; Space skips it at any moment.
  celebrationMs: 3200,
  drawScene
});
