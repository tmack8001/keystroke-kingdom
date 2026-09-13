// ─── Act 7 · The Speedway — the track registry ──────────────────────────────
//
// One row per track. The hub lists these; the race engine calls `drawScene`.
// Adding a track is adding an import and a line here — the same shape Act 6's
// WORLDS table has (js/textworld/hub.js).
//
// Every track declares its render descriptor alongside its content, because the
// GRAPHICS CLIMB IS PART OF THE DATA, not a note in a doc (Trevor, 2026-09-12:
// "I want to make sure the graphics for games is progressing through the eras
// with them — they all shouldn't be 8-bit graphics"). Two static rules hold over
// this table and are cheap to test (spec §5.6(2)):
//
//   · `eraRank` never decreases when the tracks are ordered by `year`;
//   · no two tracks share the same `(tier, variant)` pair — F-Zero and a future
//     Super Mario Kart are both `mode7`, so they must differ by variant, and
//     Virtua Racing (`flatpoly`) can never collapse into Daytona (`texpoly`).
//
// The shape of a track row:
//   { id, title, developer, year, tier, variant, eraRank, vehicle, tagline,
//     lapChars, drawScene(ctx, W, H, state) }
//
//   drawScene's `state` is whatever the race engine has: { progress,
//   ghostProgress, charge, chars, ms, field }. Renderers normalise it through
//   `readScene` in render/kit.js and clamp everything, so a partial or missing
//   state draws a calm scene instead of throwing (journal F1).

import { TRACK as MONACO_GP } from './monaco-gp.js';
import { TRACK as F_ZERO } from './f-zero.js';

export const TRACKS = Object.freeze([
  MONACO_GP,   // 1979 · ttl      · discrete logic, one ink, overhead
  F_ZERO       // 1990 · mode7    · a rotated and scaled raster plane
]);

export function allTracks() {
  return TRACKS.slice().sort((a, b) => a.eraRank - b.eraRank);
}

export function trackById(id) {
  for (const t of TRACKS) if (t.id === id) return t;
  return null;
}
