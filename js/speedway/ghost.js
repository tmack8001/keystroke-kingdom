// ─── Act 7 · THE SPEEDWAY — the ghost ───────────────────────────────────────
//
// "The race is really about did you improve from the last time you ran the track."
//   — Trevor, locked decision #6 (docs/specs/act7-speed-racing.md §5.5)
//
// You race YOUR LAST RUN. Not your best run. That distinction is the difference
// between the act working and the act souring: racing an all-time best means a child
// who had one great day loses to herself forever. Racing last time means a learner
// beats it most sessions, which is the truth of learning to type. BEST IS A KEEPSAKE
// ON THE PIT BOARD, NEVER AN OPPONENT ON TRACK.
//
// ── The format: a normalized split table ───────────────────────────────────
// A ghost is 64 integers: the millisecond at which the run first reached i/63 of the
// lap. Two alternatives were considered and rejected:
//   • sampled positions — same size, but NOT normalized to lap fraction, so editing a
//     word bank (which changes a lap's character count) silently invalidates them.
//   • replaying stored keystroke timings through the speed function — smaller, but
//     reproducible only while the speed function never changes. The first time anyone
//     tunes the charge curve, every saved lap changes meaning and a child's lap "gets
//     slower" overnight for no reason she can see. That is journal O20's hazard class:
//     a stored DERIVATION standing in for a MEASUREMENT.
// Splits store the OBSERVED RESULT. What actually happened stays true across tuning.
//
// ── Where validation lives: NOT HERE, on purpose ───────────────────────────
// `js/slots.js` owns the `kk-slots` store AND the ENTIRE ghost validation chain
// (`normalizeSpeedway` → `normalizeTrackRecord` → `normalizeGhost`/`normalizeBest`,
// wired into `normalizeSlot`; security.md rule 4). This module is a THIN CONSUMER: it
// asks `readSpeedway(trackId)` and trusts what comes back, exactly as main.js trusts
// `getProgress()`. A second shape-validator here would be two definitions of "valid"
// in two files, which is journal L41's failure mode — the same drift that shipped a
// stale duplicate of the word blocklist. One validator, in slots.js. If this file ever
// genuinely needs a second check, it gets the L41 treatment (cross-reference comments
// on BOTH sides plus a pinning test), never a quiet copy.
//
// Two values below are unavoidably shared with slots.js and are pinned by comment on
// both sides (L41): SPLIT_COUNT (the table must be produced at exactly the length the
// store accepts) and the record's `v`. Both are asserted by `slots.test.mjs`.
//
// ── The degraded read is the FIRST-RUN path, deliberately ──────────────────
// A record whose ghost is corrupt comes back as `{…, last: null}` — "this track has a
// history but no ghost to race". That is the SAME code path as a genuine first lap, so
// a child with a corrupted ghost simply gets a warm "FIRST LAP — YOU SET THE PACE" and
// never learns anything went wrong. There is no error state to reach.
//
// Nothing here ever leaves the machine (security.md rule 6). Lap times, split times,
// keystroke counts and a local timestamp are GAMEPLAY DATA, not a new PII class
// (rule 8) — the same status as the kk-stories cache.

import { readSpeedway, writeSpeedway } from '../slots.js';

// PINNED to js/slots.js `SPLIT_COUNT` (a table of any other length is rejected on
// read AND write). Changing one without the other silently stops every ghost from
// saving — keep the two in lockstep.
export const SPLIT_COUNT = 64;

// ─── Reading ────────────────────────────────────────────────────────────────

// The shape a track sees when it has never been raced (or has no active save game).
// Counters only; no ghosts.
export function emptyRecord() {
  return { v: 1, last: null, best: null, laps: 0, chars: 0, cleanBest: 0 };
}

// slots.js returns a validated record or null. We turn null into the empty record so
// every caller can read `.laps` / `.last` without a guard — the only two states a
// track ever sees are "a record" and "a record with no ghost in it".
export function readRecord(trackId) {
  const rec = readSpeedway(trackId);
  return rec || emptyRecord();
}

// The lap we actually race. `null` ⇒ first lap (warm, never an error).
export function lastGhost(trackId) {
  return readRecord(trackId).last;
}

// ─── Recording a lap ────────────────────────────────────────────────────────
//
// Fed (progress, ms) every frame and on every keystroke. It writes the FIRST time
// each milestone is reached and carries the running maximum forward, so the table is
// non-decreasing BY CONSTRUCTION and never relies on slots.js's repair pass.

export function newRecorder() {
  const splits = new Array(SPLIT_COUNT).fill(0);
  let filled = 0;                       // index of the next milestone awaiting a time
  return {
    // progress 0..1, ms = elapsed lap time. Safe to call at any rate, any order.
    sample(progress, ms) {
      const p = Math.min(1, Math.max(0, Number(progress) || 0));
      const t = Math.max(0, Math.round(Number(ms) || 0));
      const reached = Math.min(SPLIT_COUNT - 1, Math.floor(p * (SPLIT_COUNT - 1)));
      while (filled <= reached) {
        splits[filled] = filled === 0 ? 0 : Math.max(t, splits[filled - 1]);
        filled++;
      }
    },
    // Close the table out to the finish line and hand back the ghost to store.
    finish(ms, keys, acc) {
      const t = Math.max(0, Math.round(Number(ms) || 0));
      for (let i = filled; i < SPLIT_COUNT; i++) {
        splits[i] = Math.max(t, i === 0 ? 0 : splits[i - 1]);
      }
      filled = SPLIT_COUNT;
      return {
        ms: t,
        splits: splits.slice(),
        keys: Math.max(0, Math.round(Number(keys) || 0)),
        acc: Math.min(100, Math.max(0, Math.round(Number(acc) || 0))),
        at: Date.now(),
      };
    },
  };
}

// Commit a finished lap and hand back everything the pit board needs, so the caller
// never compares ghosts itself:
//
//   { record, previous, improvedMs, isBest, firstLap }
//
// `improvedMs` is > 0 ONLY when this lap beat the previous one. There is no "slower
// by" value anywhere — a slower lap reports 0 and the pit board omits the line
// entirely, which is how INV-83's "no minus sign is reachable" is guaranteed
// structurally rather than by wording.
//
// The three counters are read-then-incremented (writeSpeedway MERGES, it does not
// accumulate) and are MONOTONIC by construction: laps and chars only add, cleanBest
// is a Math.max. This is iRacing's permanent record of your mistakes, inverted into a
// permanent record of your driving.
export function commitLap(trackId, ghost, stats) {
  const before = readRecord(trackId);
  const prevLast = before.last;
  const s = stats || {};
  const addChars = Math.max(0, Math.round(Number(s.chars) || 0));
  const cleanRun = Math.max(0, Math.round(Number(s.cleanRun) || 0));

  const patch = {
    laps: before.laps + (ghost ? 1 : 0),
    chars: before.chars + addChars,
    cleanBest: Math.max(before.cleanBest, cleanRun),
  };

  let isBest = false;
  if (ghost && Number.isFinite(ghost.ms)) {
    patch.last = ghost;                                   // you always race your LAST run
    if (!before.best || ghost.ms < before.best.ms) {
      // The keepsake is stored as { ms, at } only — slots.js drops a split table here
      // deliberately, because best is never raced and that is what keeps two ghosts
      // per track inside the byte budget.
      patch.best = { ms: ghost.ms, at: ghost.at };
      isBest = true;
    }
  }

  writeSpeedway(trackId, patch);
  let after = readRecord(trackId);

  // If the store declined this lap's ghost (it is the validator; e.g. a lap longer
  // than its ms ceiling), PUT THE OLD GHOST BACK rather than leaving the track with
  // none. Checked by reading back rather than by copying slots.js's limits here, so
  // this stays correct whatever those limits are (L41: one definition, one file).
  if (ghost && !after.last && prevLast) {
    writeSpeedway(trackId, { last: prevLast });
    after = readRecord(trackId);
  }

  // When there is no active saved game at all, nothing persists — the board still
  // shows this lap's own true facts, it just won't be there to race next time.
  const persisted = after.laps === patch.laps && after.chars === patch.chars;
  const record = persisted ? after : {
    v: 1,
    last: ghost || null,
    best: patch.best || before.best,
    laps: patch.laps,
    chars: patch.chars,
    cleanBest: patch.cleanBest,
  };

  const improvedMs = (ghost && prevLast && prevLast.ms > ghost.ms) ? (prevLast.ms - ghost.ms) : 0;
  return {
    record,
    previous: prevLast,
    improvedMs,                                 // always >= 0; never a "slower by"
    isBest: isBest && !!prevLast,               // a first lap SETS the pace, it doesn't break a record
    firstLap: !prevLast,
  };
}

// ─── Replay ─────────────────────────────────────────────────────────────────

// Where the ghost is at wall-clock `ms` into the lap, as a lap fraction 0..1.
// Interpolates between the two bracketing milestones. Once it reaches 1 it STAYS at
// 1 — the ghost parks at the finish line and waits there, cheering, until the player
// arrives (§5.5: there is never a moment of being alone on a track someone already
// left). That clamp is the single most load-bearing line in this file.
//
// The guards below are "don't crash on null", not a schema validator: slots.js has
// already guaranteed the shape of anything that came from storage.
export function ghostProgressAt(ghost, ms) {
  if (!ghost || !Array.isArray(ghost.splits) || ghost.splits.length < 2) return null;
  const splits = ghost.splits;
  const last = splits.length - 1;
  const t = Math.max(0, Number(ms) || 0);
  if (t >= splits[last]) return 1;
  if (t <= splits[0]) return 0;

  let lo = 0;
  let hi = last;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (splits[mid] <= t) lo = mid; else hi = mid;
  }
  const span = splits[hi] - splits[lo];
  const frac = span > 0 ? (t - splits[lo]) / span : 0;
  return Math.min(1, Math.max(0, (lo + frac) / last));
}

// True once the ghost has parked at the line — lets a renderer switch it to its
// cheering pose instead of guessing from a float comparison.
export function ghostHasFinished(ghost, ms) {
  const p = ghostProgressAt(ghost, ms);
  return p !== null && p >= 1;
}
