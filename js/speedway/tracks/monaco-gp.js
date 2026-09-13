// ─── Act 7 · Track 1 — MONACO GP (Sega, November 1979) ──────────────────────
//
// The opening station of The Speedway, and the oldest thing in the wing.
//
// GROUND TRUTH (research/wiki/games/monaco-gp.md, research/racing-games-by-era.md
// §1 — never model memory):
//   · Sega, November 1979 Japan/US — the same year the arcade in this game is set.
//   · "One of the last arcade games made by Sega to use transistor–transistor logic
//     (TTL) based discrete logic circuits instead of a microprocessor" — over 100
//     chips across two boards. There is no CPU in this cabinet.
//   · Overhead perspective, scrolling road, FIVE areas. Difficulty escalates as
//     the road NARROWS and the surface CHANGES TO ICE AND GRAVEL.
//
// WHAT WE KEPT AND WHAT WE DELETED (spec §5.6b, §12 punishment ledger):
//   The narrowing road and the surface change are kept as PURE VISUAL ESCALATION.
//   Monaco GP's clock is gone, and so is the cabinet's punishment for touching
//   anything. The player's car has no failure state at all — the field spins,
//   wobbles and recovers around a car that never can (the Missile Command
//   inversion, act5.md L23). The act's never-words (spec §5.7) appear nowhere in
//   this file's drawn text, and nothing here draws a placement, a position number,
//   a finish order, or any defeat imagery.
//
// RENDER TIER: `ttl` — one ink on black, no gradient, no alpha, no curve. The kit
// enforces that; this file could not draw a gradient if it tried. Translucency for
// the ghost car is the only translucency 1979 had: an ordered dither.
//
// LAYOUT: the UI owns the centre (.claude/rules/visual-validation.md) and the RACE
// ENGINE owns the band `s.reserved` names (its prompt + ghost line + lap bar +
// CHARGE floor, one opaque panel — nominally 0.70–0.94H). This track composes
// entirely around it: the road is a tall band in the LEFT MARGIN, the course board
// and a segmented CHARGE column live in the RIGHT MARGIN, the title sits in the top
// band, and the player's car rides just ABOVE the panel. The band is read from
// state, never hard-coded, so retuning the panel moves one engine constant.
//
// The engine draws its own CHARGE bar. The column here is not a duplicate of it —
// it is what a 1979 machine with one ink and no shading had instead: discrete lit
// segments climbing a rail, captioned one letter per row.

import { kitFor, readScene } from '../render/kit.js';

const kit = kitFor('ttl');
const INK = 0;                 // the tier has exactly one ink; this is it

// Five areas — the real cabinet's five (monaco-gp.md). The road narrows through
// them and the surface turns to ice, then gravel. Escalation you can SEE, and
// nothing else: no clock, no damage, no consequence.
const AREAS = [
  { half: 0.082, surface: 'clean' },
  { half: 0.075, surface: 'clean' },
  { half: 0.067, surface: 'clean' },
  { half: 0.059, surface: 'ice' },
  { half: 0.051, surface: 'gravel' }
];

// 1-bit overhead open-wheel car: wings fore and aft, four exposed wheels.
const CAR_N = [
  '.#####.',
  '..###..',
  '##...##',
  '##.#.##',
  '..###..',
  '..###..',
  '##...##',
  '##.#.##',
  '..###..',
  '.#####.'
];
// The same car sideways — a spinning car cycles N/E/N/E, which is how a machine
// with no rotation hardware showed a spin in 1979.
const CAR_E = [
  '..##..##..',
  '#.##..##.#',
  '##..##..##',
  '##.###.###',
  '##..##..##',
  '#.##..##.#',
  '..##..##..'
];
// The marshal at the finish line, two frames, waving.
const CHEER_A = ['..#..', '.###.', '#.#.#', '.###.', '..#..', '.#.#.', '#...#'];
const CHEER_B = ['..#..', '.###.', '#####', '..#..', '..#..', '.#.#.', '#...#'];

const SCROLL_PER_LAP = 40;     // screen-heights of road in one lap
const AHEAD = 3;               // screen-heights between you and a ghost 1/3 lap up

function areaIndex(progress) {
  return Math.min(AREAS.length - 1, Math.floor(progress * AREAS.length));
}

function roadHalf(W, progress) {
  const t = Math.min(0.999, Math.max(0, progress)) * AREAS.length;
  const i = Math.min(AREAS.length - 1, Math.floor(t));
  const j = Math.min(AREAS.length - 1, i + 1);
  const f = t - i;
  return (AREAS[i].half + (AREAS[j].half - AREAS[i].half) * f) * W;
}

// Ambient traffic when the race engine has not handed us a field yet. Decoration
// only — it advances nothing (journal L20: an unattended tab may never progress
// consequential state, and there is no consequential state here to progress).
const AMBIENT = [0, 1, 2, 3, 4];
function ambientCar(i, ms, progress) {
  const drift = (ms * 0.00002) * (0.7 + i * 0.09);
  return {
    progress: (progress + 0.08 + i * 0.19 + drift) % 1,
    lane: Math.sin(i * 2.1 + ms * 0.0005) * 0.55,
    spin: i === 2 && Math.sin(ms * 0.0004) > 0.86 ? 1 : 0
  };
}

function drawCar(p, rows, x, y, opts) {
  const w = rows[0].length;
  p.blit1bit(rows, x - w / 2, y - rows.length / 2, INK, opts);
}

function drawScene(ctx, W, H, state) {
  const s = readScene(state);

  kit.frame(ctx, W, H, (p) => {
    const PW = p.W, PH = p.H;
    const x0 = 0.012 * PW;                 // road band lives entirely in the left margin
    const x1 = 0.190 * PW;
    const xc = (x0 + x1) / 2;
    const half = roadHalf(PW, s.progress);
    const resTop = s.reserved.top * PH;   // everything below this belongs to the engine
    const carY = resTop - 0.08 * PH;      // the player rides just above the panel
    const scroll = s.progress * PH * SCROLL_PER_LAP;
    const area = areaIndex(s.progress);

    // ── the road: black tarmac between two hard white edges ──────────────────
    p.rect(xc - half - 1, 0, 1, PH, INK);
    p.rect(xc + half, 0, 1, PH, INK);

    // Barrier posts outside both edges, scrolling with the road.
    const postGap = 9;
    const postOff = scroll % postGap;
    for (let y = -postGap; y < PH + postGap; y += postGap) {
      const py = y + postOff;
      p.rect(xc - half - 6, py, 2, 3, INK);
      p.rect(xc + half + 4, py, 2, 3, INK);
    }

    // Centre dashes.
    const dashGap = 16;
    const dashOff = scroll % dashGap;
    for (let y = -dashGap; y < PH + dashGap; y += dashGap) {
      p.rect(xc - 0.5, y + dashOff, 1, 7, INK);
    }

    // Surface escalation: ice first (long sparse dither patches), then gravel
    // (dense speckle). Visual only — grip is never modelled, nothing is lost.
    if (AREAS[area].surface !== 'clean') {
      const gravel = AREAS[area].surface === 'gravel';
      const gap = gravel ? 11 : 34;
      const off = (scroll * 0.98) % gap;
      for (let y = -gap; y < PH + gap; y += gap) {
        p.rect(xc - half + 2, y + off, half * 2 - 4, gravel ? 2 : 5, INK, { stipple: 2 });
      }
    }

    // ── charge, drawn as the road's own speed streaks ────────────────────────
    if (s.charge > 0.02) {
      const len = 4 + s.charge * 26;
      const streakGap = 13;
      const off = (scroll * 1.6) % streakGap;
      for (let y = -streakGap; y < PH + streakGap; y += streakGap) {
        p.rect(xc - half + 3, y + off, 1, len, INK);
        p.rect(xc + half - 4, y + off, 1, len, INK);
      }
    }

    // ── the finish line, arriving from the top as the lap runs out ───────────
    const finishY = carY - (1 - s.progress) * PH * AHEAD;
    if (finishY > -8 && finishY < PH + 8) {
      const cell = 3;
      const cells = Math.max(2, Math.floor((half * 2) / cell));
      for (let i = 0; i < cells; i++) {
        p.rect(xc - half + i * cell, finishY + (i % 2 ? cell : 0), cell, cell, INK);
      }
    }

    // ── the field: alive, fallible, never scored ────────────────────────────
    const count = s.fieldCount > 0 ? s.fieldCount : AMBIENT.length;
    for (let i = 0; i < count; i++) {
      const car = s.fieldCount > 0 ? s.field[i] : ambientCar(i, s.ms, s.progress);
      const y = carY - (car.progress - s.progress) * PH * AHEAD;
      if (y < -14 || y > PH + 14) continue;
      const x = xc + car.lane * (half - 6);
      if (car.spin > 0.5) {
        // A comic spin: the sprite flips between its two orientations and throws
        // a puff of dust. They spin. You cannot. Nobody is hurt either way.
        const flip = Math.floor(s.ms / 90) % 2 === 0;
        drawCar(p, flip ? CAR_E : CAR_N, x, y, { scale: 1 });
        p.rect(x - 7, y + 7, 14, 4, INK, { stipple: 2 });
      } else {
        drawCar(p, CAR_N, x, y, { scale: 1 });
      }
    }

    // ── the ghost: you, last time, dithered ─────────────────────────────────
    if (s.ghostProgress !== null) {
      let gy = carY - (s.ghostProgress - s.progress) * PH * AHEAD;
      const gx = xc - (half - 7) * 0.45;
      if (s.ghostWaiting) {
        // It finished, and it is WAITING AT THE LINE, cheering, until you get
        // there (spec §5.5 rule 2 — there is never a moment where you are alone
        // on a track someone else has already left).
        gy = Math.max(0.06 * PH, Math.min(gy, PH - 12));
        drawCar(p, CAR_N, gx, gy, { stipple: 1 });
        const wave = Math.floor(s.ms / 220) % 2 === 0;
        p.blit1bit(wave ? CHEER_A : CHEER_B, xc + half + 4, gy - 9, INK);
        p.blit1bit(wave ? CHEER_B : CHEER_A, xc - half - 9, gy - 9, INK);
      } else if (gy > -14 && gy < PH + 14) {
        drawCar(p, CAR_N, gx, gy, { stipple: 1 });
      }
    }

    // ── the player: always on the road, always moving forward ───────────────
    drawCar(p, CAR_N, xc + (half - 7) * 0.35, carY, {});

    // ── top band: whose cabinet this is ─────────────────────────────────────
    p.text('MONACO GP', 0.255 * PW, 0.035 * PH, INK, { scale: 1 });
    p.text('SEGA 1979', 0.255 * PW, 0.105 * PH, INK, { scale: 1 });
    p.text('AREA ' + (area + 1) + '/5', 0.620 * PW, 0.035 * PH, INK, { scale: 1 });

    // ── right margin: the five areas, and where both of you are in them ─────
    const bx = 0.905 * PW, bw = 0.024 * PW;
    const by0 = 0.24 * PH, by1 = resTop - 0.04 * PH;
    p.rect(bx - 1, by0 - 1, bw + 2, 1, INK);
    p.rect(bx - 1, by1, bw + 2, 1, INK);
    p.rect(bx - 1, by0, 1, by1 - by0, INK);
    p.rect(bx + bw, by0, 1, by1 - by0, INK);
    for (let i = 1; i < AREAS.length; i++) {
      const ty = by1 - (i / AREAS.length) * (by1 - by0);
      p.rect(bx, ty, bw, 1, INK);
    }
    for (let i = 0; i < AREAS.length; i++) {
      const ty = by1 - ((i + 0.5) / AREAS.length) * (by1 - by0) - 3;
      p.text(String(i + 1), bx - 9, ty, INK);
    }
    const marker = (frac) => by1 - Math.min(1, Math.max(0, frac)) * (by1 - by0);
    if (s.ghostProgress !== null) {
      p.rect(bx + 1, marker(s.ghostProgress) - 1, bw - 2, 3, INK, { stipple: 1 });
    }
    p.rect(bx + 1, marker(s.progress) - 1, bw - 2, 3, INK);

    // ── right margin: CHARGE as a lit segment rail, captioned down its side ──
    const cx = 0.815 * PW, cw = 0.022 * PW;
    p.rect(cx - 1, by0 - 1, cw + 2, 1, INK);
    p.rect(cx - 1, by1, cw + 2, 1, INK);
    p.rect(cx - 1, by0, 1, by1 - by0, INK);
    p.rect(cx + cw, by0, 1, by1 - by0, INK);
    const segs = 10;
    const segH = (by1 - by0 - 2) / segs;
    const lit = Math.round(s.charge * segs);
    for (let i = 0; i < lit; i++) {
      p.rect(cx + 1, by1 - 1 - (i + 1) * segH + 1, cw - 2, segH - 2, INK);
    }
    const caption = 'CHARGE';
    for (let i = 0; i < caption.length; i++) {
      p.text(caption[i], 0.770 * PW, by0 + 4 + i * ((by1 - by0 - 10) / caption.length), INK);
    }
  });
}

export const TRACK = Object.freeze({
  id: 'monaco-gp',
  title: 'MONACO GP',
  developer: 'Sega',
  year: 1979,
  tier: 'ttl',
  variant: 'discrete-logic',
  eraRank: 1,
  vehicle: 'grand prix car',
  tagline: 'one ink, one road, and a machine with no processor in it',
  lapChars: 120,
  drawScene
});
