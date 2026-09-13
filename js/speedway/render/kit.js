// ─── Act 7 · The Speedway — the ERA-SCOPED RENDER KIT ───────────────────────
//
// Trevor, 2026-09-12: "I want to make sure the graphics for games is progressing
// through the eras with them — they all shouldn't be 8-bit graphics."
//
// Act 7 recapitulates the whole graphic-quality arc (product.md §5) inside one
// wing, so the climb has to be ARCHITECTURALLY ENFORCED, not hoped for. That is
// this file. `kitFor(tier)` hands a renderer ONLY the drawing vocabulary its era
// possessed. A renderer physically cannot draw something its era could not:
//
//   ttl      rect · hline · blit1bit · text        NO gradient, NO alpha, NO curve
//   scaler   + scaleSprite · horizonShift
//   8bit     + tileLayer · spriteSheet
//   mode7    + affinePlane · billboard · withAlpha
//   flatpoly + flatPoly · painterSort              NO texturedPoly — that is the point
//   texpoly  + texturedPoly · gouraud · bilinear
//   ps1      + modelledMesh
//   modern   + gradient · bloom · particles        (the only tier a WebGL backend may serve)
//
// THREE mechanisms make the ladder real (spec docs/specs/act7-speed-racing.md §5.6):
//
//   1. ABSENCE. The pen object a renderer draws through is composed from the tier
//      chain up to its own tier and then FROZEN with a null prototype. `p.gradient`
//      at tier `ttl` is `undefined` — calling it is a TypeError, not a code review.
//      A future Virtua Racing (`flatpoly`) renderer cannot texture a polygon
//      because `texturedPoly` is not on its pen.
//   2. THE GUARD. A renderer is still handed the raw shared 2D context (the
//      drawScene signature requires it), so for the duration of `frame()` the
//      era-forbidden members of BOTH the shared context and the era buffer are
//      replaced with throwing stubs (gradients, patterns, filters, shadows,
//      composite ops, curves, and — below `mode7` — any globalAlpha but 1).
//      Kit primitives that legitimately need one internally (ttl's dithered
//      stipple, texpoly's gouraud) hold ORIGINALS captured before the guard, so
//      the capability exists inside the kit and nowhere else.
//   3. RESOLUTION + FILTERING. Every tier renders into an offscreen buffer at its
//      era's internal resolution (ttl 256px wide, mode7 320px, modern native) and
//      is composited up with `imageSmoothingEnabled` false until `texpoly` — where
//      `bilinear` first appears on the ladder. The chunky upscale and the arrival
//      of filtering are the kit's doing, not the renderer's.
//
// Canvas discipline (journal L16/L28/F1, .claude/rules/theme-authoring.md):
//   · Renderers work in fractions of the pen's `W`/`H` — canvas space, never DOM space.
//   · `frame()` explicitly resets textAlign/textBaseline/alpha/composite/filter/shadow
//     on the buffer every frame; 2D state leaks between screens, so it is reset centrally.
//   · Every public primitive clamps its own inputs; no sentinel value reaches geometry.
//   · Buffers, stipple patterns, glyphs and sprite bakes all live in bounded caches —
//     nothing allocates in the hot draw path.
//
// Security (.claude/rules/security.md): drawing only. No DOM sinks, no network, no
// eval, no user-influenced strings — Act 7 labels are fixed literals.

export const TIER_ORDER = Object.freeze([
  'ttl', 'scaler', '8bit', 'mode7', 'flatpoly', 'texpoly', 'ps1', 'modern'
]);

// Per-tier era budget. `res` = internal buffer width in px (0 = native).
const TIER_SPEC = {
  ttl: {
    era: '1974–1980 · discrete logic', res: 240, px: 1, smoothing: false,
    bg: '#000000', palette: ['#e8e8e8'], freeColor: false, alpha: false,
    curves: false, patterns: false, composite: false
  },
  scaler: {
    era: '1982–1988 · sprite scaling', res: 320, px: 1, smoothing: false,
    bg: '#000814',
    palette: ['#ffffff', '#ffd23f', '#ff6b35', '#e63946', '#4cc9f0', '#2a9d8f', '#8d99ae', '#3a0ca3'],
    freeColor: false, alpha: false, curves: true, patterns: false, composite: false
  },
  '8bit': {
    era: '1983–1986 · console tiles', res: 256, px: 1, smoothing: false,
    bg: '#0f0f1b',
    palette: ['#ffffff', '#fcfcfc', '#f8d878', '#f8b800', '#e45c10', '#b81800', '#00a800',
              '#58d854', '#0058f8', '#3cbcfc', '#6844fc', '#f878f8', '#787878', '#404040',
              '#a4e4fc', '#000000'],
    freeColor: false, alpha: false, curves: true, patterns: false, composite: false
  },
  mode7: {
    era: '1990–1993 · rotated raster plane', res: 320, px: 1, smoothing: false,
    bg: '#100a2a',
    palette: ['#ffffff', '#ffe98a', '#ffb03b', '#f2536d', '#b8378f', '#6a2a9c', '#3a1a63',
              '#1b0f3a', '#2de1fc', '#0f8ecf', '#1f4ea8', '#8de06a', '#c8c8d8', '#6b6b8a',
              '#38384f', '#0a0618'],
    freeColor: false, alpha: true, curves: true, patterns: false, composite: false
  },
  flatpoly: {
    era: '1988–1992 · flat-shaded polygons', res: 400, px: 1, smoothing: false,
    bg: '#0a1020', palette: [], freeColor: true, alpha: true,
    curves: true, patterns: false, composite: true
  },
  texpoly: {
    era: '1993–1996 · texture-filtered polygons', res: 512, px: 1, smoothing: true,
    bg: '#0b1526', palette: [], freeColor: true, alpha: true,
    curves: true, patterns: true, composite: true
  },
  ps1: {
    era: '1997–2000 · modelled meshes', res: 640, px: 1, smoothing: true,
    bg: '#07101c', palette: [], freeColor: true, alpha: true,
    curves: true, patterns: true, composite: true
  },
  modern: {
    era: '2008– · shaders and particles', res: 0, px: 1, smoothing: true,
    bg: '#05070d', palette: [], freeColor: true, alpha: true,
    curves: true, patterns: true, composite: true, gradients: true
  }
};

// ─── The 1-bit glyph set ────────────────────────────────────────────────────
// Act 7 draws its own 5×7 bitmap font rather than calling fillText. Two reasons:
// it is the honest way a discrete-logic cabinet made letters, and it sidesteps
// the Press Start 2P glyph-coverage trap outright (journal O11 — the font blanks
// ←→ and shrinks backtick to a pixel). Coverage here is exactly what is authored
// below; anything else draws as a blank cell, never as a surprise.
const FONT = {
  'A': [14, 17, 17, 31, 17, 17, 17], 'B': [30, 17, 17, 30, 17, 17, 30],
  'C': [14, 17, 16, 16, 16, 17, 14], 'D': [30, 17, 17, 17, 17, 17, 30],
  'E': [31, 16, 16, 30, 16, 16, 31], 'F': [31, 16, 16, 30, 16, 16, 16],
  'G': [14, 17, 16, 23, 17, 17, 15], 'H': [17, 17, 17, 31, 17, 17, 17],
  'I': [31, 4, 4, 4, 4, 4, 31], 'J': [1, 1, 1, 1, 17, 17, 14],
  'K': [17, 18, 20, 24, 20, 18, 17], 'L': [16, 16, 16, 16, 16, 16, 31],
  'M': [17, 27, 21, 21, 17, 17, 17], 'N': [17, 25, 21, 19, 17, 17, 17],
  'O': [14, 17, 17, 17, 17, 17, 14], 'P': [30, 17, 17, 30, 16, 16, 16],
  'Q': [14, 17, 17, 17, 21, 18, 13], 'R': [30, 17, 17, 30, 20, 18, 17],
  'S': [15, 16, 16, 14, 1, 1, 30], 'T': [31, 4, 4, 4, 4, 4, 4],
  'U': [17, 17, 17, 17, 17, 17, 14], 'V': [17, 17, 17, 17, 17, 10, 4],
  'W': [17, 17, 17, 21, 21, 27, 17], 'X': [17, 17, 10, 4, 10, 17, 17],
  'Y': [17, 17, 10, 4, 4, 4, 4], 'Z': [31, 1, 2, 4, 8, 16, 31],
  '0': [14, 19, 21, 21, 25, 17, 14], '1': [4, 12, 4, 4, 4, 4, 14],
  '2': [14, 17, 1, 6, 8, 16, 31], '3': [31, 2, 4, 2, 1, 17, 14],
  '4': [2, 6, 10, 18, 31, 2, 2], '5': [31, 16, 30, 1, 1, 17, 14],
  '6': [6, 8, 16, 30, 17, 17, 14], '7': [31, 1, 2, 4, 8, 8, 8],
  '8': [14, 17, 17, 14, 17, 17, 14], '9': [14, 17, 17, 15, 1, 2, 12],
  ' ': [0, 0, 0, 0, 0, 0, 0], '.': [0, 0, 0, 0, 0, 12, 12],
  '-': [0, 0, 0, 14, 0, 0, 0], ':': [0, 12, 12, 0, 12, 12, 0],
  '+': [0, 4, 4, 31, 4, 4, 0], '!': [4, 4, 4, 4, 4, 0, 4],
  '/': [1, 2, 2, 4, 8, 8, 16]
};
const GLYPH_W = 5, GLYPH_H = 7;

// ─── The guard ──────────────────────────────────────────────────────────────
const GRADIENT_FNS = ['createLinearGradient', 'createRadialGradient', 'createConicGradient'];
const CURVE_FNS = ['arc', 'arcTo', 'ellipse', 'bezierCurveTo', 'quadraticCurveTo', 'roundRect'];

function forbiddenList(spec) {
  const fns = [];
  if (!spec.gradients) fns.push(...GRADIENT_FNS);
  if (!spec.patterns) fns.push('createPattern');
  if (!spec.curves) fns.push(...CURVE_FNS);
  const props = [];
  if (!spec.gradients) props.push(['filter', 'none'], ['shadowBlur', 0]);
  if (!spec.composite) props.push(['globalCompositeOperation', 'source-over']);
  if (!spec.alpha) props.push(['globalAlpha', 1]);
  return { fns, props };
}

function tripwire(tier, name) {
  return function () {
    throw new Error(
      `[speedway/kit] "${name}" does not exist in the ${tier} era. ` +
      `Act 7's graphics climb with the era — use a primitive kitFor('${tier}') gives you, ` +
      `or move the track to a later tier.`
    );
  };
}

// Replaces era-forbidden members with tripwires and returns an undo function.
// Methods become throwing stubs; properties become setters that accept ONLY the
// era's default value (so the kit's own per-frame state reset still works, while
// a renderer reaching for 0.5 alpha at tier `ttl` fails loudly).
function applyGuard(ctx, tier, forbidden) {
  if (!ctx || ctx.__kkGuard) return () => {};
  const undo = [];
  for (const name of forbidden.fns) {
    const had = Object.prototype.hasOwnProperty.call(ctx, name);
    const prev = ctx[name];
    try { ctx[name] = tripwire(tier, name); } catch { continue; }
    undo.push(() => { if (had) ctx[name] = prev; else delete ctx[name]; });
  }
  for (const [prop, allowed] of forbidden.props) {
    let value = allowed;
    try {
      Object.defineProperty(ctx, prop, {
        configurable: true,
        get() { return value; },
        set(v) {
          if (v !== allowed) tripwire(tier, prop)();
          value = v;
        }
      });
    } catch { continue; }
    undo.push(() => { delete ctx[prop]; });
  }
  ctx.__kkGuard = true;
  undo.push(() => { delete ctx.__kkGuard; });
  return () => { for (let i = undo.length - 1; i >= 0; i--) undo[i](); };
}

// ─── Buffer cache (bounded) ─────────────────────────────────────────────────
const buffers = new Map();
const MAX_BUFFERS = 6;

function getBuffer(tier, spec, W, H) {
  const key = `${tier}:${W}x${H}`;
  let entry = buffers.get(key);
  if (entry) return entry;
  if (buffers.size >= MAX_BUFFERS) buffers.delete(buffers.keys().next().value);
  const bw = spec.res > 0 ? Math.max(64, Math.round(spec.res)) : W;
  const bh = spec.res > 0 ? Math.max(48, Math.round(spec.res * (H / W))) : H;
  const canvas = document.createElement('canvas');
  canvas.width = bw;
  canvas.height = bh;
  const ctx = canvas.getContext('2d');
  entry = { canvas, ctx, pen: null, raw: null, img: null, caches: null };
  buffers.set(key, entry);
  return entry;
}

// ─── Pen construction ───────────────────────────────────────────────────────
function clamp(v, lo, hi) {
  const n = Number(v);
  if (!Number.isFinite(n)) return lo;
  return n < lo ? lo : (n > hi ? hi : n);
}

function buildPen(tier, spec, entry) {
  const ctx = entry.ctx;
  const W = entry.canvas.width;
  const H = entry.canvas.height;
  const PX = Math.max(1, spec.px);

  // Originals captured BEFORE the buffer is guarded: the kit keeps capabilities
  // its renderers may not have (1-bit stipple dithering, gouraud interpolation).
  const raw = {
    createPattern: ctx.createPattern.bind(ctx),
    createLinearGradient: ctx.createLinearGradient.bind(ctx)
  };

  const caches = { stipple: new Map(), sprite: new Map(), glyph: new Map() };
  const spriteIds = new WeakMap();
  let spriteSeq = 0;
  entry.caches = caches;

  const snap = (v) => (PX === 1 ? Math.round(v) : Math.round(v / PX) * PX);
  const PAL_RGB = (spec.palette.length ? spec.palette : ['#ffffff']).map(hexToRgb);

  function ink(c) {
    if (spec.freeColor) {
      if (typeof c === 'string') return c;
      return spec.palette[clamp(c, 0, Math.max(0, spec.palette.length - 1)) | 0] || '#ffffff';
    }
    if (typeof c === 'string') {
      throw new Error(
        `[speedway/kit] the ${tier} era has a fixed palette of ${spec.palette.length} ink(s) — ` +
        `pass an index, not the CSS colour "${c}".`
      );
    }
    const i = clamp(c, 0, spec.palette.length - 1) | 0;
    return spec.palette[i];
  }

  // 50%/25% ordered dither — how 1-bit hardware faked a translucent object.
  // Below `mode7` this is the ONLY translucency the kit offers, by design.
  function stipplePattern(color, density) {
    const key = `${color}|${density}|${PX}`;
    let pat = caches.stipple.get(key);
    if (pat) return pat;
    const cell = PX * 2;
    const c = document.createElement('canvas');
    c.width = cell; c.height = cell;
    const cc = c.getContext('2d');
    cc.fillStyle = color;
    cc.fillRect(0, 0, PX, PX);
    if (density >= 1) cc.fillRect(PX, PX, PX, PX);
    pat = raw.createPattern(c, 'repeat');
    if (caches.stipple.size > 24) caches.stipple.clear();
    caches.stipple.set(key, pat);
    return pat;
  }

  function fillStyleFor(color, opts) {
    const d = opts && opts.stipple ? clamp(opts.stipple, 0, 2) : 0;
    return d > 0 ? stipplePattern(color, d >= 2 ? 0 : 1) : color;
  }

  // ── ttl layer ─────────────────────────────────────────────────────────────
  function rect(x, y, w, h, c, opts) {
    const px0 = snap(clamp(x, -W * 4, W * 5));
    const py0 = snap(clamp(y, -H * 4, H * 5));
    const pw = Math.max(PX, snap(clamp(w, 0, W * 4)));
    const ph = Math.max(PX, snap(clamp(h, 0, H * 4)));
    ctx.fillStyle = fillStyleFor(ink(c), opts);
    ctx.fillRect(px0, py0, pw, ph);
  }

  function hline(y, x0, x1, c, opts) {
    const a = Math.min(x0, x1), b = Math.max(x0, x1);
    rect(a, y, b - a, (opts && opts.thickness) || PX, c, opts);
  }

  function bakeSprite(rows, color, scale, opts) {
    const stip = opts && opts.stipple ? clamp(opts.stipple, 0, 2) : 0;
    const flip = !!(opts && opts.flipX);
    let sid = spriteIds.get(rows);
    if (sid === undefined) { sid = ++spriteSeq; spriteIds.set(rows, sid); }
    const key = `${sid}|${color}|${scale}|${stip}|${flip}`;
    let baked = caches.sprite.get(key);
    if (baked) return baked;
    const h = rows.length;
    const w = rows[0] ? rows[0].length : 0;
    const c = document.createElement('canvas');
    c.width = Math.max(1, w * scale);
    c.height = Math.max(1, h * scale);
    const cc = c.getContext('2d');
    cc.imageSmoothingEnabled = false;
    for (let r = 0; r < h; r++) {
      const row = rows[r];
      for (let q = 0; q < w; q++) {
        if (row[q] === ' ' || row[q] === '.') continue;
        if (stip === 1 && ((r + q) & 1)) continue;
        if (stip === 2 && ((r & 1) || (q & 1))) continue;
        const sx = flip ? (w - 1 - q) : q;
        cc.fillStyle = color;
        cc.fillRect(sx * scale, r * scale, scale, scale);
      }
    }
    if (caches.sprite.size > 96) caches.sprite.clear();
    caches.sprite.set(key, c);
    return c;
  }

  // A 1-bit sprite blit: rows of '#' (ink) and '.' (clear). `stipple` gives the
  // dithered half-tone a 1979 machine used for "see-through".
  function blit1bit(rows, x, y, c, opts) {
    if (!Array.isArray(rows) || !rows.length) return;
    const scale = Math.max(1, Math.round((opts && opts.scale) || 1) * PX);
    const baked = bakeSprite(rows, ink(c), scale, opts);
    ctx.drawImage(baked, snap(clamp(x, -W * 4, W * 5)), snap(clamp(y, -H * 4, H * 5)));
  }

  function glyph(ch, color, scale) {
    const key = `${ch}|${color}|${scale}`;
    let baked = caches.glyph.get(key);
    if (baked) return baked;
    const bits = FONT[ch] || FONT[' '];
    const c = document.createElement('canvas');
    c.width = GLYPH_W * scale; c.height = GLYPH_H * scale;
    const cc = c.getContext('2d');
    cc.fillStyle = color;
    for (let r = 0; r < GLYPH_H; r++) {
      const bitsRow = bits[r] | 0;
      for (let q = 0; q < GLYPH_W; q++) {
        if (bitsRow & (1 << (GLYPH_W - 1 - q))) cc.fillRect(q * scale, r * scale, scale, scale);
      }
    }
    if (caches.glyph.size > 320) caches.glyph.clear();
    caches.glyph.set(key, c);
    return c;
  }

  // Bitmap text. `align` is honoured explicitly here rather than leaning on
  // ctx.textAlign — canvas 2D state leaks between screens (journal L28) and this
  // kit never calls fillText below the `modern` tier at all.
  function text(str, x, y, c, opts) {
    const s = String(str == null ? '' : str).toUpperCase();
    const scale = Math.max(1, Math.round((opts && opts.scale) || 1) * PX);
    const track = (opts && opts.tracking != null ? opts.tracking : 1) * scale;
    const w = s.length * (GLYPH_W * scale + track) - track;
    const align = (opts && opts.align) || 'left';
    let cx = x;
    if (align === 'center') cx = x - w / 2;
    else if (align === 'right') cx = x - w;
    const color = ink(c);
    const gy = snap(clamp(y, -H * 4, H * 5));
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch !== ' ') {
        ctx.drawImage(glyph(ch, color, scale), snap(cx), gy);
      }
      cx += GLYPH_W * scale + track;
    }
    return w;
  }

  const ttlLayer = { rect, hline, blit1bit, text };

  // ── scaler layer (1982–1988) ─────────────────────────────────────────────
  const scalerLayer = {
    // Sprite scaling: the Super Scaler trick — one sprite, many sizes by distance.
    scaleSprite(rows, x, y, c, scale, opts) {
      const s = Math.max(1, Math.round(clamp(scale, 0.1, 64)));
      blit1bit(rows, x - (rows[0] ? rows[0].length * s * PX / 2 : 0), y, c,
        Object.assign({}, opts, { scale: s }));
    },
    // Rolling-road horizon: how far the vanishing point has swung, in px.
    horizonShift(baseX, curve) {
      return baseX + clamp(curve, -1, 1) * (W * 0.25);
    }
  };

  // ── 8bit layer (1983–1986) ───────────────────────────────────────────────
  const bitLayer = {
    tileLayer(tiles, cols, x, y, tileSize, palette) {
      const ts = Math.max(PX, snap(tileSize));
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i] | 0;
        if (t < 0) continue;
        rect(x + (i % cols) * ts, y + Math.floor(i / cols) * ts, ts, ts,
          palette ? palette[t % palette.length] : t);
      }
    },
    spriteSheet(rows, x, y, c, frame, frameW, opts) {
      const f = Math.max(0, frame | 0);
      const slice = rows.map(r => r.slice(f * frameW, f * frameW + frameW));
      blit1bit(slice, x, y, c, opts);
    }
  };

  // ── mode7 layer (1990–1993) ──────────────────────────────────────────────
  let planeCam = null;

  function planeImage(top, height) {
    if (!entry.img || entry.img.width !== W || entry.img.height !== height) {
      entry.img = ctx.createImageData(W, Math.max(1, height));
    }
    return entry.img;
  }

  const mode7Layer = {
    // The SNES's whole trick: ONE raster plane, rotated and scaled — no polygons
    // (research/wiki/games/f-zero.md). Sampled into an era-resolution buffer and
    // composited up with filtering OFF, which is why it reads as 1990 hardware.
    affinePlane(opts) {
      const o = opts || {};
      const horizon = clamp(o.horizonY, 0, H - 1);
      const vpX = clamp(o.vanishX, -W, W * 2);
      const camX = Number.isFinite(o.camX) ? o.camX : 0;
      const camZ = Number.isFinite(o.camZ) ? o.camZ : 0;
      const yaw = clamp(o.yaw, -Math.PI, Math.PI);
      const fov = clamp(o.fov, 8, 4096);
      const height = Math.max(1, Math.round(H - horizon));
      const top = Math.round(horizon);
      const shade = typeof o.shade === 'function' ? o.shade : () => 0;
      const rgba = PAL_RGB;
      const img = planeImage(top, height);
      const data = img.data;
      const cos = Math.cos(yaw), sin = Math.sin(yaw);
      let p = 0;
      for (let row = 0; row < height; row++) {
        const dy = row + 1;
        const z = fov / dy;                    // distance for this scanline
        const scale = z / fov;
        for (let x = 0; x < W; x++) {
          const lx = (x - vpX) * scale * 2;
          const lz = z;
          const u = camX + lx * cos - lz * sin;
          const v = camZ + lx * sin + lz * cos;
          const idx = shade(u, v, z) | 0;
          const col = rgba[idx >= 0 && idx < rgba.length ? idx : 0];
          data[p++] = col[0]; data[p++] = col[1]; data[p++] = col[2]; data[p++] = 255;
        }
      }
      ctx.putImageData(img, 0, top);
      planeCam = { horizon, vpX, camX, camZ, yaw, fov, cos, sin };
    },
    // Everything that is not the ground plane is a sprite (f-zero.md).
    billboard(rows, worldX, worldZ, c, opts) {
      if (!planeCam) return null;
      const o = opts || {};
      const dx = worldX - planeCam.camX;
      const dz = worldZ - planeCam.camZ;
      const rx = dx * planeCam.cos + dz * planeCam.sin;
      const rz = -dx * planeCam.sin + dz * planeCam.cos;
      if (rz <= 0.4) return null;
      const dy = planeCam.fov / rz;
      const sy = planeCam.horizon + dy;
      const sx = planeCam.vpX + (rx * planeCam.fov) / (2 * rz);
      if (sy > H + 40 || sy < planeCam.horizon - 2) return null;
      const scale = Math.max(1, Math.round(clamp(dy * (o.size || 0.06), 1, 24)));
      const h = rows.length * scale * PX;
      const w = (rows[0] ? rows[0].length : 0) * scale * PX;
      blit1bit(rows, sx - w / 2, sy - h + (o.lift || 0), c,
        Object.assign({}, o, { scale }));
      return { x: sx, y: sy, scale, w, h };
    },
    // Real translucency arrives with the SNES's colour math. Below this tier the
    // kit answers the same need with `stipple` dithering and nothing else.
    withAlpha(a, fn) {
      const prev = ctx.globalAlpha;
      ctx.globalAlpha = clamp(a, 0, 1);
      try { fn(); } finally { ctx.globalAlpha = prev; }
    }
  };

  // ── flatpoly layer (1988–1992) ───────────────────────────────────────────
  const flatLayer = {
    // Flat-shaded facets, no textures — Virtua Racing's entire look.
    flatPoly(pts, color) {
      if (!Array.isArray(pts) || pts.length < 3) return;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = ink(color);
      ctx.fill();
    },
    // The era's only visibility solution: sort faces, draw far to near.
    painterSort(faces) {
      return faces.slice().sort((a, b) => (b.z || 0) - (a.z || 0));
    }
  };

  // ── texpoly layer (1993–1996) ────────────────────────────────────────────
  const texLayer = {
    // Affine (not perspective-corrected) triangle texturing — the era-correct
    // "swim" is a feature here, not a bug (racing-games-by-era.md §13).
    texturedPoly(tri, uv, texture) {
      if (!tri || tri.length < 3 || !texture) return;
      const [[x0, y0], [x1, y1], [x2, y2]] = tri;
      const [[u0, v0], [u1, v1], [u2, v2]] = uv;
      const d = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0);
      if (!d) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath();
      ctx.clip();
      const a = ((x1 - x0) * (v2 - v0) - (x2 - x0) * (v1 - v0)) / d;
      const b = ((y1 - y0) * (v2 - v0) - (y2 - y0) * (v1 - v0)) / d;
      const c2 = ((x2 - x0) * (u1 - u0) - (x1 - x0) * (u2 - u0)) / d;
      const dd = ((y2 - y0) * (u1 - u0) - (y1 - y0) * (u2 - u0)) / d;
      ctx.setTransform(a, b, c2, dd, x0 - a * u0 - c2 * v0, y0 - b * u0 - dd * v0);
      ctx.drawImage(texture, 0, 0);
      ctx.restore();
    },
    // Smooth vertex shading, approximated with three additive vertex lights.
    gouraud(tri, colors) {
      if (!tri || tri.length < 3) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tri[0][0], tri[0][1]);
      ctx.lineTo(tri[1][0], tri[1][1]);
      ctx.lineTo(tri[2][0], tri[2][1]);
      ctx.closePath();
      ctx.clip();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const [px1, py1] = tri[i];
        const [ox, oy] = tri[(i + 1) % 3];
        const g = raw.createLinearGradient(px1, py1, ox, oy);
        g.addColorStop(0, ink(colors[i]));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    },
    bilinear(on) { ctx.imageSmoothingEnabled = on !== false; }
  };

  // ── ps1 layer (1997–2000) ────────────────────────────────────────────────
  const ps1Layer = {
    // Projected vertex meshes: the first tier where a car is a MODEL, not a sprite.
    modelledMesh(mesh, cam) {
      if (!mesh || !Array.isArray(mesh.verts) || !Array.isArray(mesh.faces)) return;
      const f = cam && Number.isFinite(cam.fov) ? cam.fov : 200;
      const ox = cam && Number.isFinite(cam.x) ? cam.x : W / 2;
      const oy = cam && Number.isFinite(cam.y) ? cam.y : H / 2;
      const proj = mesh.verts.map(v => {
        const z = Math.max(0.2, v[2] + (cam && cam.z ? cam.z : 4));
        return [ox + (v[0] * f) / z, oy - (v[1] * f) / z, z];
      });
      const faces = mesh.faces.map(face => ({
        face,
        z: face.idx.reduce((acc, i) => acc + proj[i][2], 0) / face.idx.length
      }));
      for (const { face } of flatLayer.painterSort(faces)) {
        flatLayer.flatPoly(face.idx.map(i => [proj[i][0], proj[i][1]]), face.color);
      }
    }
  };

  // ── modern layer (2008–) ─────────────────────────────────────────────────
  const modernLayer = {
    gradient(x0, y0, x1, y1, stops) {
      const g = raw.createLinearGradient(x0, y0, x1, y1);
      for (const [at, color] of stops) g.addColorStop(clamp(at, 0, 1), color);
      return g;
    },
    bloom(x, y, r, color, strength) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, r));
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      const prev = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = clamp(strength == null ? 1 : strength, 0, 1);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = prev;
    },
    particles(list, color, size) {
      const prev = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = color;
      for (const p2 of list) {
        const s = Math.max(1, (p2.s || size || 2));
        ctx.globalAlpha = clamp(p2.a == null ? 1 : p2.a, 0, 1);
        ctx.fillRect(p2.x - s / 2, p2.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = prev;
    }
  };

  const LAYERS = {
    ttl: ttlLayer, scaler: scalerLayer, '8bit': bitLayer, mode7: mode7Layer,
    flatpoly: flatLayer, texpoly: texLayer, ps1: ps1Layer, modern: modernLayer
  };

  const pen = Object.create(null);
  for (const t of TIER_ORDER) {
    Object.assign(pen, LAYERS[t]);
    if (t === tier) break;
  }
  pen.W = W;
  pen.H = H;
  pen.px = PX;
  pen.tier = tier;
  pen.inks = spec.palette.length;
  pen.bg = spec.bg;
  // Clear is always available: a frame has to start somewhere.
  pen.clear = (c) => {
    ctx.fillStyle = c == null ? spec.bg : ink(c);
    ctx.fillRect(0, 0, W, H);
  };
  Object.freeze(pen);

  entry.raw = raw;
  return pen;
}

function hexToRgb(hex) {
  const h = String(hex).replace('#', '');
  const n = h.length === 3
    ? h.split('').map(c => parseInt(c + c, 16))
    : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  return n.map(v => (Number.isFinite(v) ? v : 0));
}

// ─── kitFor ─────────────────────────────────────────────────────────────────
export function kitFor(tier) {
  const spec = TIER_SPEC[tier];
  if (!spec) {
    throw new Error(`[speedway/kit] unknown render tier "${tier}" — one of: ${TIER_ORDER.join(', ')}`);
  }
  const forbidden = forbiddenList(spec);
  let inFrame = false;

  const kit = {
    tier,
    era: spec.era,
    res: spec.res,
    px: spec.px,
    bg: spec.bg,
    palette: Object.freeze(spec.palette.slice()),
    smoothing: spec.smoothing,
    // Cheap introspection for tests and for a renderer that wants to feature-detect
    // rather than assume: `kit.has('texturedPoly')` is false at tier flatpoly.
    has(name) {
      const i = TIER_ORDER.indexOf(tier);
      for (let k = 0; k <= i; k++) {
        if (LAYER_NAMES[TIER_ORDER[k]].includes(name)) return true;
      }
      return name === 'clear';
    },
    // The whole frame runs inside here: era buffer in, guarded context, composite out.
    frame(ctx, W, H, draw) {
      if (!ctx || !(W > 0) || !(H > 0) || typeof draw !== 'function') return;
      if (inFrame) throw new Error('[speedway/kit] frame() is not re-entrant');
      inFrame = true;
      const entry = getBuffer(tier, spec, Math.round(W), Math.round(H));
      const bctx = entry.ctx;
      // Explicit state reset every frame — 2D state leaks between screens (L28).
      bctx.setTransform(1, 0, 0, 1, 0, 0);
      bctx.globalAlpha = 1;
      bctx.globalCompositeOperation = 'source-over';
      bctx.filter = 'none';
      bctx.shadowBlur = 0;
      bctx.shadowColor = 'rgba(0,0,0,0)';
      bctx.textAlign = 'left';
      bctx.textBaseline = 'top';
      bctx.imageSmoothingEnabled = spec.smoothing;
      bctx.lineWidth = 1;
      if (!entry.pen) {
        entry.pen = buildPen(tier, spec, entry);
        applyGuard(bctx, tier, forbidden);   // permanent: the pen captured what it needs
      }
      entry.pen.clear();
      const release = applyGuard(ctx, tier, forbidden);
      try {
        draw(entry.pen);
      } finally {
        release();
        inFrame = false;
      }
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      // Filtering itself climbs the ladder: nearest-neighbour until `texpoly`,
      // where `bilinear` first appears as a primitive.
      ctx.imageSmoothingEnabled = spec.smoothing;
      ctx.drawImage(entry.canvas, 0, 0, Math.round(W), Math.round(H));
      ctx.restore();
    }
  };
  return Object.freeze(kit);
}

// Name table for kit.has() — mirrors the layer objects built in buildPen().
const LAYER_NAMES = {
  ttl: ['rect', 'hline', 'blit1bit', 'text'],
  scaler: ['scaleSprite', 'horizonShift'],
  '8bit': ['tileLayer', 'spriteSheet'],
  mode7: ['affinePlane', 'billboard', 'withAlpha'],
  flatpoly: ['flatPoly', 'painterSort'],
  texpoly: ['texturedPoly', 'gouraud', 'bilinear'],
  ps1: ['modelledMesh'],
  modern: ['gradient', 'bloom', 'particles']
};

// ─── Scene state normalisation ──────────────────────────────────────────────
// Lane B owns the race engine; a renderer must survive whatever it is handed
// mid-wave (security.md rule 4's posture, applied to a render input). Every
// value is clamped before it reaches geometry — journal F1: one sentinel frame
// value crashed every Level 4 victory for weeks. Writes into a module-level
// record so the hot draw path never allocates.
const SCENE = {
  progress: 0, ghostProgress: null, ghostWaiting: false, charge: 0,
  chars: 0, ms: 0, field: [], fieldCount: 0,
  // The band of the canvas the RACE ENGINE owns (its prompt + ghost line + lap
  // bar + CHARGE floor, one opaque panel). A track composes around it and never
  // inside it. Read from state, never hard-coded, so retuning the panel moves
  // ONE constant in the engine instead of every renderer.
  reserved: { top: 0.70, bottom: 0.94 }
};
const FIELD_SLOTS = Array.from({ length: 8 }, () => ({ progress: 0, lane: 0, spin: 0, speed: 1 }));
SCENE.field = FIELD_SLOTS;

export function readScene(s) {
  const src = s && typeof s === 'object' ? s : {};
  SCENE.progress = clamp(src.progress, 0, 1);
  const g = src.ghostProgress;
  SCENE.ghostProgress = (g == null || !Number.isFinite(Number(g))) ? null : clamp(g, 0, 1);
  SCENE.ghostWaiting = SCENE.ghostProgress !== null && SCENE.ghostProgress >= 1;
  SCENE.charge = clamp(src.charge, 0, 1);
  SCENE.chars = Math.max(0, Math.min(1e7, Math.round(Number(src.chars) || 0)));
  SCENE.ms = Math.max(0, Math.min(6e8, Number(src.ms) || 0));
  const f = Array.isArray(src.field) ? src.field : [];
  const n = Math.min(f.length, FIELD_SLOTS.length);
  for (let i = 0; i < n; i++) {
    const e = f[i] && typeof f[i] === 'object' ? f[i] : {};
    const slot = FIELD_SLOTS[i];
    slot.progress = clamp(e.progress, 0, 1);
    slot.lane = clamp(e.lane, -1, 1);
    slot.spin = clamp(e.spin, 0, 1);
    slot.speed = clamp(e.speed == null ? 1 : e.speed, 0, 4);
  }
  SCENE.fieldCount = n;
  const r = src.reserved && typeof src.reserved === 'object' ? src.reserved : null;
  let top = r ? clamp(r.promptTop != null ? r.promptTop : r.top, 0, 1) : 0.70;
  let bottom = r ? clamp(r.promptBottom != null ? r.promptBottom : r.bottom, 0, 1) : 0.94;
  if (!(bottom > top)) { top = 0.70; bottom = 0.94; }
  SCENE.reserved.top = top;
  SCENE.reserved.bottom = bottom;
  return SCENE;
}
