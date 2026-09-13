// ─── Act 7 · Track 1 — MONACO GP (Sega, November 1979) ──────────────────────
//
// The opening station of The Speedway, and the oldest thing in the wing.
//
// GROUND TRUTH (research/wiki/games/monaco-gp.md — re-verified 2026-09-13 against
// the Gremlin/Sega owner's manual 420-0358, a primary source; never model memory):
//   · Sega, November 1979 Japan/US — the same year the arcade in this game is set.
//   · "One of the last arcade games made by Sega to use transistor–transistor logic
//     (TTL) based discrete logic circuits instead of a microprocessor" — over 100
//     chips across two boards. There is no CPU in this cabinet.
//   · Overhead perspective, scrolling road, FIVE areas. Difficulty escalates as
//     the road NARROWS and the surface CHANGES TO ICE AND GRAVEL.
//   · Extended play: "Player goes into extended play when he reaches a score of
//     2000 points. In extended play, the player wins an extra car; and, one extra
//     car is awarded after every additional 2000 points." (manual, verbatim)
//   · The cabinet's front panel carried the ledger: "The game's front panel displays
//     your score and the top 5 high scores" — on LEDs, not on the CRT.
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
// band, and the player's car rides just ABOVE the engine's panel. A dithered BEZEL
// line marks where the CRT ends: everything right of it is the CABINET, which is
// where the LED ledger lives — because on the real machine the numbers were on the
// front panel, not on the tube. The band is read from state, never hard-coded, so
// retuning the panel moves one engine constant.
//
// Every stacked text block below derives its leading from `textHeight()`/`lineStep()`
// — the kit draws its own 5×7 bitmap font, so there is no `measureText` to lean on
// and a magic pixel constant is how two lines end up on top of each other
// (journal O20; F-Zero's title block, found by Trevor 2026-09-13).
//
// The engine draws its own CHARGE bar. The column here is not a duplicate of it —
// it is what a 1979 machine with one ink and no shading had instead: discrete lit
// segments climbing a rail, captioned one letter per row.

import { kitFor, readScene, textHeight, textWidth, lineStep, overlaps } from '../render/kit.js';

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

// ── WHICH CAR IS MINE? ─────────────────────────────────────────────────────
// Trevor, 2026-09-13: "it was really hard to determine which car was mine."
//
// At `ttl` the usual answers are all illegal: there is ONE ink, no alpha, no
// outline colour, no glow. So the player is told apart the way a 1979 cabinet told
// things apart — by SILHOUETTE, by SIZE, and by a BLINKING MARKER, all of which a
// discrete-logic machine could do with ROM sprite images and a flip-flop:
//
//   · the rivals are the plain OUTLINE open-wheel car (7×10) — hollow,
//   · the player is a bigger SOLID slab (9×14); filled-versus-outline is the
//     loudest silhouette difference a single ink can make,
//   · a blinking chevron sits on the road directly over it, and the cabinet fascia
//     carries a legend showing both cars side by side with YOU / THE FIELD —
//     the era's own way of saying "this one is you" (attract-mode player marking
//     and cabinet instruction panels, not a claim about Monaco GP specifically),
//   · and the player is always in the same place on screen, which is the oldest
//     convention of all.
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
// THE PLAYER. Wider, longer, and carrying a solid spine the rivals do not have.
// Two frames that differ only in the WHEELS, so the car visibly idles (see below).
// THE PLAYER. A big SOLID slab against the rivals' hollow open-wheel outlines —
// filled-versus-outline is the strongest silhouette contrast one ink can produce,
// and it survives being 9 pixels tall on a 240-pixel buffer. Two frames that differ
// only in the WHEELS, so the car visibly ticks over (see drawPlayer).
const HERO_A = [
  '...###...',
  '..#####..',
  '.#######.',
  '#########',
  '#########',
  '.#######.',
  '.#######.',
  '.#######.',
  '.#######.',
  '#########',
  '#########',
  '.#######.',
  '..#####..',
  '...###...'
];
const HERO_B = [
  '...###...',
  '..#####..',
  '.#######.',
  '#.#####.#',
  '#########',
  '.#######.',
  '.#######.',
  '.#######.',
  '.#######.',
  '#.#####.#',
  '#########',
  '.#######.',
  '..#####..',
  '...###...'
];
// The marshal at the finish line, two frames, waving.
const CHEER_A = ['..#..', '.###.', '#.#.#', '.###.', '..#..', '.#.#.', '#...#'];
const CHEER_B = ['..#..', '.###.', '#####', '..#..', '..#..', '.#.#.', '#...#'];

// A ROM-stamped car image, used for the extended-play award row. The manual's
// reward is literally "an extra car", so the award is drawn as cars.
const AWARD_CAR = [
  '.#####.',
  '.#...#.',
  '##...##',
  '#..#..#',
  '##...##',
  '.#...#.',
  '.#####.'
];
const AWARD_SCALE = 1;
const AWARD_MAX = 8;          // the row is bounded; the count lives on the LED bank

// The horizontal corridor the win moment is allowed to use: between the CRT bezel
// and the CHARGE rail. Every celebration element is centred and measured against
// this, so nothing can grow into the cabinet furniture on either side.
const STAMP_LEFT = 0.215;
const STAMP_RIGHT = 0.805;

// A blinking chevron that sits ON THE ROAD directly over the player's car. Three
// rows is all a 1979 sprite ROM needs, and blinking is free on a flip-flop.
const YOU_CHEVRON = ['#####', '.###.', '..#..'];

const SCROLL_PER_LAP = 40;     // screen-heights of road in one lap
const AHEAD = 3;               // screen-heights between you and a ghost 1/3 lap up

// ── ONE VERTICAL PLAN for everything on the cabinet fascia ─────────────────
// Each row's top is DERIVED from the row above it and from the kit's own glyph
// cell — never from an independently hand-tuned canvas fraction, which is how the
// ODOMETER row landed on top of SEGA 1979 the first time (journal O20). Change the
// title's scale or the digit height and the whole stack still lands.
function fasciaPlan(PH) {
  const titleY = Math.round(0.030 * PH);
  const titleStep = lineStep(1, 0.8);
  const titleBottom = titleY + titleStep + textHeight(1);
  const digitH = Math.max(7, Math.round(0.068 * PH));
  const odoY = titleBottom + Math.round(textHeight(1) * 0.7);
  const lapY = odoY + digitH + Math.round(textHeight(1) * 0.7);
  const legendY = lapY + digitH + textHeight(1);
  // The win moment takes the legend's room — `celebrationLayout` below places it,
  // measuring from the engine's band upward so it can never overflow.
  return { titleY, titleStep, titleBottom, digitH, odoY, lapY, legendY };
}

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
// Expressed as `rel` (offset from the player), the same contract the real field
// uses, so there is exactly one way to place a car in this file.
const AMBIENT = [0, 1, 2, 3, 4];
function ambientCar(i, ms) {
  const drift = (ms * 0.00002) * (0.7 + i * 0.09);
  const span = 0.44;
  return {
    rel: -0.14 + ((i * 0.19 + drift) % span),
    lane: Math.sin(i * 2.1 + ms * 0.0005) * 0.55,
    spin: i === 2 && Math.sin(ms * 0.0004) > 0.86 ? 1 : 0
  };
}

function drawCar(p, rows, x, y, opts) {
  const w = rows[0].length;
  p.blit1bit(rows, x - w / 2, y - rows.length / 2, INK, opts);
}

// ── Seven-segment digits ───────────────────────────────────────────────────
// The manual: "The scoring information appears on various LEDs located on the
// cabinet." The 1979 ledger was not on the CRT at all — so this file draws it
// BELOW the picture, in the strip under the engine's panel, as real seven-segment
// digits made of solid bars. Nothing a TTL machine could not do.
const SEG_DIGITS = [
  0b1111110, 0b0110000, 0b1101101, 0b1111001, 0b0110011,
  0b1011011, 0b1011111, 0b1110000, 0b1111111, 0b1111011
];
// Every digit is drawn TWICE: the unlit "ghost 8" first, as a 25% ordered dither,
// then the lit segments solid on top. That is what an LED bank actually looks like,
// and it is the fix for a real readability bug — a seven-segment `1` is two bars in
// one column, so without the ghost behind it a lap count of 1 read as a bare
// vertical stroke, like a text cursor (play-test finding, 2026-09-13). Dither is the
// only shading this tier has, which is exactly why it is the right answer here.
function drawSevenSeg(p, digit, x, y, w, h) {
  const t = Math.max(1, Math.round(h * 0.18));      // bar thickness
  const mask = (digit >= 0 && digit <= 9) ? SEG_DIGITS[digit] : 0;
  const half = Math.round(h / 2);
  const bars = [
    [6, x, y, w, t],                                // A  top
    [5, x + w - t, y, t, half],                     // B  top-right
    [4, x + w - t, y + half - t, t, h - half + t],  // C  bottom-right
    [3, x, y + h - t, w, t],                        // D  bottom
    [2, x, y + half - t, t, h - half + t],          // E  bottom-left
    [1, x, y, t, half],                             // F  top-left
    [0, x, y + half - Math.round(t / 2), w, t]      // G  middle
  ];
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    const lit = (mask & (1 << b[0])) !== 0;
    p.rect(b[1], b[2], b[3], b[4], INK, lit ? undefined : { stipple: 2 });
  }
}

// Right-aligned, and it returns its own left edge so a caller can frame it without
// guessing (journal O20 — never a magic constant where a measurement will do).
function drawSevenSegNumber(p, value, rightX, y, dw, h, gap) {
  const str = String(Math.max(0, Math.round(value)));
  const leftX = rightX - str.length * (dw + gap) + gap;
  let x = leftX;
  for (let i = 0; i < str.length; i++) {
    drawSevenSeg(p, str.charCodeAt(i) - 48, x, y, dw, h);
    x += dw + gap;
  }
  return leftX;
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
    // The decoration clock — it runs even at the start line, which is what makes the
    // car idle instead of standing there as a frozen photograph.
    const T = s.animMs;

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
    // A finished WORD lengthens and multiplies them for a moment (`s.boost`). It is
    // speed-FEEL only: the streaks are longer, the car is not one pixel further on.
    const shine = Math.min(1, s.charge + s.boost * 0.55);
    if (shine > 0.02) {
      const len = 4 + shine * 26 + s.boost * 16;
      const streakGap = 13;
      const off = (scroll * 1.6) % streakGap;
      for (let y = -streakGap; y < PH + streakGap; y += streakGap) {
        p.rect(xc - half + 3, y + off, 1, len, INK);
        p.rect(xc + half - 4, y + off, 1, len, INK);
        if (s.boost > 0.25) {
          p.rect(xc - half + 6, y + off + 4, 1, len * 0.7, INK, { stipple: 1 });
          p.rect(xc + half - 7, y + off + 4, 1, len * 0.7, INK, { stipple: 1 });
        }
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
    // Placed by `rel` — a signed offset from the player, held in a rolling band by
    // the engine so there is always somebody just up the road to catch and pass.
    // `car.progress` wraps and must never be differenced against the player's.
    const count = s.fieldCount > 0 ? s.fieldCount : AMBIENT.length;
    for (let i = 0; i < count; i++) {
      const car = s.fieldCount > 0 ? s.field[i] : ambientCar(i, T);
      const y = carY - car.rel * PH * AHEAD;
      if (y < -14 || y > PH + 14) continue;
      const x = xc + car.lane * (half - 6);
      if (car.spin > 0.5) {
        // A comic spin: the sprite flips between its two orientations and throws
        // a puff of dust. They spin. You cannot. Nobody is hurt either way.
        const flip = Math.floor(T / 90) % 2 === 0;
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
        const wave = Math.floor(T / 220) % 2 === 0;
        p.blit1bit(wave ? CHEER_A : CHEER_B, xc + half + 4, gy - 9, INK);
        p.blit1bit(wave ? CHEER_B : CHEER_A, xc - half - 9, gy - 9, INK);
      } else if (gy > -14 && gy < PH + 14) {
        drawCar(p, CAR_N, gx, gy, { stipple: 1 });
      }
    }

    // ── the player ──────────────────────────────────────────────────────────
    const heroX = xc + (half - 7) * 0.35;
    drawPlayer(p, PW, PH, heroX, carY, half, xc, s, T);

    // ── the cabinet around the screen, composed in the margins ──────────────
    drawFascia(p, PW, PH);
    drawTitleBlock(p, PW, PH, area);
    drawCourseBoard(p, PW, PH, resTop, s);
    drawChargeRail(p, PW, PH, resTop, s);
    drawLedLedger(p, PW, PH, resTop, s);
    if (!s.celebrating) drawLegend(p, PW, PH, resTop, s);

    // ── the win moment ──────────────────────────────────────────────────────
    if (s.celebrating) drawExtendedPlay(p, PW, PH, resTop, s, T);
  });
}

// ── the player's car: bigger, different, marked, and ALIVE ─────────────────
function drawPlayer(p, PW, PH, x, y, half, xc, s, T) {
  // IDLE / ATTRACT MOTION. Trevor, 2026-09-13: the car "should at least play"
  // before you type. The start line used to render a byte-identical frozen frame.
  // A 1979 car standing on the grid is not still: the engine shakes it, the wheels
  // turn over, and it blows exhaust. All three are drawn from the decoration clock,
  // and NONE of them move the car down the road — progress is `charsTyped/lapChars`
  // and this function cannot write to it (INV-78).
  const idling = s.idling;
  const shake = idling ? (Math.floor(T / 55) % 2 === 0 ? 0 : 1) : 0;
  // A completed WORD shoves the sprite forward a few pixels and it settles back.
  // Pure spectacle: it is a sprite offset, not a change of position on the course.
  const kick = s.boost * 7;
  const py = y - kick + shake;

  // Exhaust — puffs behind the car while idling, and a hard bark on a boost.
  const puffs = idling ? 3 : (s.boost > 0.1 ? 4 : 0);
  for (let i = 0; i < puffs; i++) {
    const age = ((T / (idling ? 420 : 150)) + i / puffs) % 1;
    const rise = age * (idling ? 16 : 26);
    const w = 3 + age * (idling ? 5 : 9);
    p.rect(x - w / 2, py + 9 + rise, w, 2, INK, { stipple: age > 0.5 ? 2 : 1 });
  }

  // The car itself: two frames that differ in the wheels, so it visibly ticks over.
  const frame = (Math.floor(T / (idling ? 110 : 70)) % 2 === 0) ? HERO_A : HERO_B;
  const hw = frame[0].length;
  p.blit1bit(frame, x - hw / 2, py - frame.length / 2, INK);

  // THE MARKER. A blinking chevron sits ON THE ROAD directly over the player's car,
  // where the player is already looking. Blinking is the one thing a discrete-logic
  // machine could do for free, and marking the player's own object is 1979 arcade
  // grammar. (The cabinet fascia carries the matching legend — see drawLegend.)
  if (Math.floor(T / 260) % 2 === 0 || s.celebrating) {
    const cwid = YOU_CHEVRON[0].length;
    p.blit1bit(YOU_CHEVRON, x - cwid / 2, py - frame.length / 2 - YOU_CHEVRON.length - 2, INK);
  }
}

// ── top band: whose cabinet this is ────────────────────────────────────────
// Stacked from the kit's own glyph cell, never from a hand-tuned pixel constant.
function drawTitleBlock(p, PW, PH, area) {
  const plan = fasciaPlan(PH);
  const titleY = plan.titleY;
  const step = plan.titleStep;
  p.text('MONACO GP', 0.255 * PW, titleY, INK, { scale: 1 });
  p.text('SEGA 1979', 0.255 * PW, titleY + step, INK, { scale: 1 });
  // Right of the title, clear of its widest line by a full glyph cell.
  const areaX = Math.max(
    0.255 * PW + textWidth('MONACO GP', 1) + textWidth('  ', 1),
    0.620 * PW
  );
  p.text('AREA ' + (area + 1) + '/5', areaX, titleY, INK, { scale: 1 });
}

// ── right margin: the five areas, and where both of you are in them ────────
function drawCourseBoard(p, PW, PH, resTop, s) {
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
    const ty = by1 - ((i + 0.5) / AREAS.length) * (by1 - by0) - Math.round(textHeight(1) / 2);
    p.text(String(i + 1), bx - (textWidth('5', 1) + 4), ty, INK);
  }
  const marker = (frac) => by1 - Math.min(1, Math.max(0, frac)) * (by1 - by0);
  if (s.ghostProgress !== null) {
    p.rect(bx + 1, marker(s.ghostProgress) - 1, bw - 2, 3, INK, { stipple: 1 });
  }
  p.rect(bx + 1, marker(s.progress) - 1, bw - 2, 3, INK);
}

// ── right margin: CHARGE as a lit segment rail, captioned down its side ────
// The caption column sits at 0.770W. The engine's start-line card and pit board used
// to be 0.56W/0.62W wide and sliced it in half; they are now held inside
// CARD_SAFE_X (0.245…0.755W) by track.js precisely so this stays readable.
function drawChargeRail(p, PW, PH, resTop, s) {
  const by0 = 0.24 * PH, by1 = resTop - 0.04 * PH;
  const cx = 0.815 * PW, cw = 0.022 * PW;
  p.rect(cx - 1, by0 - 1, cw + 2, 1, INK);
  p.rect(cx - 1, by1, cw + 2, 1, INK);
  p.rect(cx - 1, by0, 1, by1 - by0, INK);
  p.rect(cx + cw, by0, 1, by1 - by0, INK);
  const segs = 10;
  const segH = (by1 - by0 - 2) / segs;
  const lit = Math.round(Math.min(1, s.charge + s.boost * 0.25) * segs);
  for (let i = 0; i < lit; i++) {
    p.rect(cx + 1, by1 - 1 - (i + 1) * segH + 1, cw - 2, segH - 2, INK);
  }
  const caption = 'CHARGE';
  const capStep = lineStep(1, 0.35);
  const capTop = by0 + Math.max(2, ((by1 - by0) - caption.length * capStep) / 2);
  for (let i = 0; i < caption.length; i++) {
    p.text(caption[i], cx - (textWidth('C', 1) + 6), capTop + i * capStep, INK);
  }
}

// ── OUTSIDE THE PICTURE: the cabinet's front panel ─────────────────────────
// From the manual (420-0358): "The game's front panel displays your score and the
// top 5 high scores" — corroborated by "the scoring information appears on various
// LEDs located on the cabinet". In 1979 the numbers were NOT on the CRT. So they are
// not in the picture here either: a bezel line marks where the tube ends, and
// everything to the right of it — the course board, the CHARGE rail and this LED
// ledger — is the cabinet around the screen rather than the game inside it. (Pro
// Monaco GP, 1980, added battery-backed high scores: this machine was built to
// remember you overnight, which is exactly what the per-track ghost record does.)
//
// NOT BUILT, deliberately: the manual also gives "each player is given a ranking out
// of the total numbers of players to date". That is a PLACEMENT, and INV-82 forbids
// placement, position and finish order anywhere in this act. Documented history does
// not outrank the house law.
//
// The ODOMETER is the CUMULATIVE one — every letter this player has ever driven on
// this track, across every lap — which is the number Trevor asked for, read from the
// same record the pit board prints. During the win moment it ROLLS UP from where it
// stood before this lap, so the lap's contribution is something you watch land.
const BEZEL_X = 0.205;
function drawFascia(p, PW, PH) {
  p.rect(BEZEL_X * PW, 0, 1, PH, INK, { stipple: 1 });
}

function drawLedLedger(p, PW, PH, resTop, s) {
  const plan = fasciaPlan(PH);
  // N5: an opaque engine card (the start line, the pit board) covers this row —
  // there is nothing to read behind it, so do not draw a half-sliced ledger under it.
  if (overlaps(s.overlay, 0.24, plan.odoY / PH, 0.82, (plan.lapY + plan.digitH) / PH)) return;
  // The fascia rows are sized from the FONT CELL while the engine's band is a
  // fraction of HEIGHT, so on a short/wide canvas the stack can run out of room.
  // Every row proves it fits before it draws; the ones that do not, simply do not
  // appear. Nothing on this fascia is ever allowed to run into the engine's panel.
  if (plan.odoY + plan.digitH > resTop - 2) return;
  const x = 0.255 * PW;
  const y = plan.odoY;
  const h = plan.digitH;                             // digit height
  const dw = Math.max(4, Math.round(h * 0.66));
  const gap = Math.max(1, Math.round(dw * 0.22));
  const labelY = y + Math.max(0, Math.round((h - textHeight(1)) / 2));

  // The odometer rolls up through the celebration: from the total BEFORE this lap
  // to the total after it. It only ever climbs (INV-83) and it never shows a minus.
  let shown = s.odometer;
  if (s.celebrating && s.celebrate < 1) {
    const before = Math.max(0, s.odometer - s.chars);
    shown = Math.round(before + (s.odometer - before) * Math.min(1, s.celebrate / 0.8));
  }

  const label = 'ODOMETER';
  p.text(label, x, labelY, INK, { scale: 1 });
  const digitsX = x + textWidth(label, 1) + textWidth('MM', 1);
  const odoW = 7 * (dw + gap) - gap;                 // right-aligned in a 7-digit well
  const wellX = digitsX - 3;
  const wellW = odoW + 6;
  // The well, drawn clear of the digits on every side (the rules used to cut
  // through the bottom segment and the right-hand bar).
  p.rect(wellX, y - 4, wellW, 1, INK);
  p.rect(wellX, y + h + 3, wellW, 1, INK);
  drawSevenSegNumber(p, shown, digitsX + odoW, y, dw, h, gap);

  const lapY = plan.lapY;
  if (lapY + h > resTop - 2) return;
  p.text('LAPS', x, lapY + Math.max(0, Math.round((h - textHeight(1)) / 2)), INK, { scale: 1 });
  drawSevenSegNumber(p, s.laps, digitsX + 3 * (dw + gap) - gap, lapY, dw, h, gap);
}

// ── the fascia's legend: THIS ONE IS YOURS ─────────────────────────────────
// A cabinet instruction panel, which is what a 1979 machine actually carried, doing
// the job a colour could do at a later tier: here is your car, here is everyone
// else's, and they do not look alike. It steps aside for the win moment.
function drawLegend(p, PW, PH, resTop, s) {
  const plan = fasciaPlan(PH);
  if (overlaps(s.overlay, 0.24, plan.legendY / PH, 0.82,
    (plan.legendY + HERO_A.length) / PH)) return;
  if (plan.legendY + HERO_A.length > resTop - 2) return;   // it fits, or it waits
  const x = 0.255 * PW;
  const y = plan.legendY;
  const mid = y + HERO_A.length / 2 - Math.round(textHeight(1) / 2);
  p.blit1bit(HERO_A, x, y, INK);
  p.text('YOU', x + HERO_A[0].length + 4, mid, INK, { scale: 1 });
  const x2 = x + HERO_A[0].length + 4 + textWidth('YOU', 1) + textWidth('MM', 1);
  p.blit1bit(CAR_N, x2, y + (HERO_A.length - CAR_N.length) / 2, INK);
  p.text('THE FIELD', x2 + CAR_N[0].length + 4, mid, INK, { scale: 1 });
}

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  THE WIN MOMENT — EXTENDED PLAY                                          ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// RESEARCH FIRST, then what is invented (arcade-historian pass, 2026-09-13, against
// the Gremlin/Sega owner's manual 420-0358 and research/wiki/games/monaco-gp.md):
//
//   · MONACO GP HAS NO WIN STATE. No finish line, no lap counter, no course
//     completion, and NO CHECKERED FLAG — a keyword sweep of the whole manual for
//     flag / finish / lap / win / winner / bonus returns nothing. The game ran on a
//     90-count clock and scored by speed.
//   · The checkered flag's earliest verified appearance in a video game is POLE
//     POSITION (1982) — three years after this cabinet. It is deliberately NOT drawn
//     here. (It is drawn on F-Zero, 1990, where the convention is long established,
//     and is labelled as such in that file.)
//   · Confetti, crowd cheers, fireworks and podiums are `[unverified]` anywhere in
//     racing games 1974–1990. None are drawn here.
//   · What the machine DID have as its reward: "Player goes into extended play when
//     he reaches a score of 2000 points. In extended play, the player wins an extra
//     car; and, one extra car is awarded after every additional 2000 points."
//     THE REWARD IS MORE PLAY — which is already the One Rule's own shape.
//   · And its loudest visual gesture was a LARGE SOLID COLOUR CHANGE (the road turns
//     blue for ice; the screen goes black in the tunnel). At one ink that is a solid
//     white field sweeping the frame — in-vocabulary, and free.
//
// INVENTED, and said plainly: Act 7 finishes a LAP, which this cabinet never did, so
// the *occasion* is ours. What is era-faithful is the VOCABULARY it is built from —
// a ROM-stamped word, an awarded car, a solid colour sweep, and the cabinet ledger
// rolling up. Nothing here is a recreation of a 1979 win screen, because there was
// no 1979 win screen to recreate.
//
// Everything below lives in the empty middle of the frame, clear of the road band,
// the margins and the engine's panel. It is skippable at any moment (Space) — a
// celebration is never something a child has to sit through.
// The win moment, laid out from the BOTTOM UP against the engine's band so it can
// never run into the panel however tall or short the canvas is: the stamped word is
// placed first (it is the message), then the awarded cars take whatever room is left
// above it, and if there is none they simply do not appear.
function celebrationLayout(PH, resTop) {
  const plan = fasciaPlan(PH);
  const stampH = lineStep(2, 0.6) + textHeight(2);
  const natural = plan.legendY + AWARD_CAR.length * AWARD_SCALE
    + Math.round(textHeight(1) * 0.6);
  const stampY = Math.min(natural, Math.round(resTop - stampH - 3));
  const awardY = stampY - AWARD_CAR.length * AWARD_SCALE - 4;
  const showAward = awardY >= plan.lapY + plan.digitH + 2;
  return { stampY, awardY, showAward };
}

function drawExtendedPlay(p, PW, PH, resTop, s, T) {
  const c = s.celebrate;                       // 0..1 through the window, 1 once settled

  // 1 — THE COLOUR FLOOD. A solid white band sweeps down the frame in the first
  //     third, the way this hardware changed the road to blue or the screen to
  //     black. Clamped so the sweep is always on-screen geometry (journal F1).
  if (c < 0.34) {
    const t = Math.min(1, Math.max(0, c / 0.34));
    const bandH = Math.max(2, PH * 0.16 * (1 - t));
    const bandY = Math.min(PH, Math.max(-bandH, -bandH + (PH + bandH) * t));
    // Over the PICTURE, not the cabinet: the tube is what changed colour.
    p.rect(0, bandY, BEZEL_X * PW, bandH, INK);
    if (t < 0.18) p.rect(0, 0, BEZEL_X * PW, PH, INK, { stipple: 2 });
  }

  // 2 — THE ROM-STAMPED WORD. Wikipedia confirms this machine kept its sprites,
  //     cars and its "game over" message as ROM images, so a pre-drawn word
  //     appearing whole (never typed out, never animated) is exactly what it could
  //     do. It blinks, because blinking is free on a flip-flop.
  if (c > 0.16) {
    // Two quick blinks as it lands, then it HOLDS. A message that keeps flickering
    // is a message a child never finishes reading.
    const on = c > 0.35 || (Math.floor(T / 150) % 2 === 0);
    if (on) {
      // Two lines at the era's own tracking (the 5×7 cell needs its one-pixel gap
      // or the glyphs run together), centred in the corridor between the bezel and
      // the CHARGE rail — measured, never eyeballed.
      const mid = (STAMP_LEFT + STAMP_RIGHT) / 2 * PW;
      const top = celebrationLayout(PH, resTop).stampY;
      p.text('EXTENDED', mid - textWidth('EXTENDED', 2) / 2, top, INK, { scale: 2 });
      p.text('PLAY', mid - textWidth('PLAY', 2) / 2, top + lineStep(2, 0.6), INK, { scale: 2 });
    }
  }

  // 3 — THE AWARD. The manual's reward is an extra car, so the machine hands one
  //     over: a row of ROM car images, one per lap driven here, with the newest one
  //     blinking on. More play, never a score, never a rank.
  const award = celebrationLayout(PH, resTop);
  if (c > 0.30 && award.showAward) {
    const shown = Math.max(1, Math.min(AWARD_MAX, s.laps || 1));
    const cw = AWARD_CAR[0].length * AWARD_SCALE + 4;
    const rowW = shown * cw - 4;
    const rowY = award.awardY;
    const rowMid = (STAMP_LEFT + STAMP_RIGHT) / 2 * PW;
    for (let i = 0; i < shown; i++) {
      const isNew = i === shown - 1;
      if (isNew && c < 0.6 && Math.floor(T / 130) % 2 !== 0) continue;
      p.blit1bit(AWARD_CAR, rowMid - rowW / 2 + i * cw, rowY, INK, { scale: AWARD_SCALE });
    }
  }
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
  // The celebration window the engine holds the pit board back for. Clamped by
  // track.js into the same 1200–6000 ms band every level theme's victory() returns.
  celebrationMs: 2800,
  drawScene
});
