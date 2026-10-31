// THE HARDWARE — the wing's room
// ---------------------------------------------------------------------------
// The third bonus wing, and structurally the exact analogue of Act 6's
// js/textworld/hub.js and Act 7's js/speedway/hub.js: a parallel screen on the
// shared canvas with its own input path. The 25-level pattern engine
// (handleGameKey/buildPatterns) is NEVER involved, and no survival timer is ever
// started here — a bonus wing inherits zero time pressure.
//
// THE VERB IS THE BOOT LINE (docs/specs/hardware-wing.md §0.5). You walk up to a
// machine, type what its owner would have typed, and it wakes. That is the whole
// interaction, and it is why this is a typing room rather than a museum.
//
// ⚠️ THE SACRED CONTRACT APPLIES HERE TOO, and it is the easiest thing in the
// project to forget in a parallel input path. A wrong key gets a gentle nudge,
// the expected character STAYS AND WAITS, and nothing advances or is taken away
// (.claude/rules/product.md §3). There is no timer, no failure, no way to get a
// boot line "wrong" — only not-yet-right. Escape always walks out.

import * as Audio from '../audio.js';
import { STATIONS } from './stations.js';
import { stationCards, pickGuaranteedStationCard } from '../history-cards.js';

let canvas = null;
let ctx = null;
let active = false;
let animId = null;
let onExit = null;
let onCard = null;          // host hands a station card to the slot/collection layer

let mode = 'menu';          // 'menu' | 'station' | 'card'
let cursor = 0;
let station = null;         // the station being visited
let step = 0;               // which boot line we're on
let typed = '';             // characters correctly entered on the current line
let nudge = 0;              // frames of gentle wrong-key feedback (visual only)
let log = [];               // the machine's transcript, oldest first
let awake = false;
let awakeT = 0;
let earnedCard = null;      // { card, isNew, found, total } — revealed on the way OUT
let cardT = 0;              // frames the card reveal has been on screen
let t = 0;

const INK = '#8ef0a8';      // phosphor green — the Apple/DOS CRT both read as this
const DIM = '#2f6b42';

function sizeCanvas() {
  if (!canvas) return;
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.max(320, Math.floor(r.width || 960));
  canvas.height = Math.max(240, Math.floor(r.height || 600));
}

export function isActive() { return active; }

// Open the wing standing at a named machine — the player picked one on the back
// wall, so landing on a different one would be a small lie. Feature-detected by
// main.js, so an unknown id is a silent no-op rather than a trap.
export function focusStation(id) {
  if (!id) return;
  const i = STATIONS.findIndex(s => s.id === id);
  if (i >= 0) cursor = i;
}

export function start(cvs, opts = {}) {
  onExit = typeof opts.onExit === 'function' ? opts.onExit : null;
  onCard = typeof opts.onCard === 'function' ? opts.onCard : null;
  canvas = cvs || document.getElementById('invaders-canvas');
  ctx = canvas ? canvas.getContext('2d') : null;
  sizeCanvas();
  mode = 'menu';
  station = null;
  awake = false;
  earnedCard = null;
  cursor = Math.min(Math.max(0, cursor), STATIONS.length - 1);
  active = true;
  if (animId) cancelAnimationFrame(animId);
  animId = requestAnimationFrame(frame);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  onExit = null;
  onCard = null;
  station = null;
  earnedCard = null;
}

// ─── Input ──────────────────────────────────────────────────────────────────

export function handleKey(e) {
  if (!active) return false;

  if (e.key === 'Escape') {
    if (mode === 'station' || mode === 'card') { returnToMenu(); return true; }
    if (onExit) onExit();
    return true;
  }

  // The card is a reward being read, not a task. Space/Enter puts it down; any
  // other key is harmless. It cannot be failed and cannot be lost — the card was
  // already written to the save when the machine woke (see wakeUp).
  if (mode === 'card') {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); returnToMenu(); }
    return true;
  }

  if (mode === 'menu') {
    if (e.key === 'ArrowUp')   { cursor = (cursor - 1 + STATIONS.length) % STATIONS.length; return true; }
    if (e.key === 'ArrowDown') { cursor = (cursor + 1) % STATIONS.length; return true; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enterStation(cursor); return true; }
    return false;
  }

  return handleBootKey(e);
}

// Typing a boot line. The ONLY rule that matters here is the wrong-keypress
// contract: a wrong key never advances, never costs anything, and never skips
// the character that is waiting.
function handleBootKey(e) {
  if (e.key && e.key.length > 1 && e.key !== 'Enter' && e.key !== 'Backspace') return false; // modifiers: ignored entirely
  const line = currentLine();

  if (awake) {
    // The machine is running. Space/Enter steps back to the wall; anything else
    // is harmless. Nothing here can be failed.
    //
    // ON THE WAY OUT, the card. This is the arcade's own ritual moved into the
    // wing (spec §Phase D: "the card itself is revealed when the player leaves
    // the station") — the celebration first, then the little card picked up off
    // the floor. A station with no cards authored yet skips straight out, which
    // is exactly the behaviour this wing shipped with.
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (earnedCard) {
        mode = 'card';
        cardT = 0;
        // The SAME sound the arcade's card gets. This wing draws its card on canvas
        // rather than through `#history-card`, so it does not inherit anything from
        // the DOM reveal — including its voice. Without this line the hardware wing
        // would be the one place a card lands in silence, which is precisely the
        // asymmetry the sound was added to remove.
        Audio.historyCard();
      } else { returnToMenu(); }
      return true;
    }
    return true;
  }
  if (!line) return true;

  if (e.key === 'Enter') {
    e.preventDefault();
    if (typed.length === line.type.length) commitLine();
    return true;                       // an early Return is simply ignored — never an error
  }

  if (e.key === 'Backspace') {
    e.preventDefault();
    // Allowed and free. Backspace is not failure (Level 25's framing, and it is
    // just as true here) — it is how anyone types.
    if (typed.length) typed = typed.slice(0, -1);
    return true;
  }

  if (e.key === ' ') e.preventDefault();

  const want = line.type[typed.length];
  if (want === undefined) return true;                  // line already complete, waiting on Return
  // Case-insensitive: these machines were, and a child holding Shift for an
  // Apple II command prompt is a hurdle this wing has no reason to add.
  if (e.key.toUpperCase() === want.toUpperCase()) {
    typed += want;
    Audio.correct();
    if (typed.length === line.type.length) commitLine();
  } else {
    Audio.wrong();
    nudge = 20;                                          // a visual breath, not a penalty
  }
  return true;
}

function currentLine() {
  if (!station || !station.boot) return null;
  return station.boot[step] || null;
}

function commitLine() {
  const line = currentLine();
  if (!line) return;
  log.push({ kind: 'echo', prompt: station.prompt, text: line.type });
  (line.says || []).forEach(s => log.push({ kind: 'says', text: s }));
  typed = '';
  step += 1;
  if (step >= station.boot.length) wakeUp();
}

// The machine is running. This is the celebration beat of the wing — and, per
// the One Rule, it is the only thing that ever "ends" a visit.
function wakeUp() {
  awake = true;
  awakeT = 0;
  Audio.levelComplete();
  // Credit FIRST, reveal later. Act 6's TF-T1 lesson is that leaving must never
  // silently drop something the player actually did, so the card is written to
  // the save the instant the machine wakes — the reveal on the way out is
  // presentation, and walking away with Escape still keeps the card.
  if (onCard) {
    try { earnedCard = onCard(station.id) || null; }
    catch { earnedCard = null; /* a card that can't be handed over is never a trap */ }
  }
}

function enterStation(i) {
  const s = STATIONS[i];
  if (!s) return;
  station = s;
  step = 0;
  typed = '';
  log = [];
  awake = false;
  nudge = 0;
  mode = 'station';
}

function returnToMenu() {
  mode = 'menu';
  station = null;
  awake = false;
  earnedCard = null;
  cardT = 0;
}

// ─── Render ─────────────────────────────────────────────────────────────────

function frame() {
  if (!active || !ctx) return;
  t += 1;
  if (nudge > 0) nudge -= 1;
  if (awake) awakeT += 1;
  if (mode === 'card') cardT += 1;
  if (mode === 'menu') drawMenu();
  else if (mode === 'card') drawCard();
  else drawStation();
  animId = requestAnimationFrame(frame);
}

function room(W, H) {
  ctx.fillStyle = '#080a0c';
  ctx.fillRect(0, 0, W, H);
  // The workbench the wing is named around the ABSENCE of: Trevor kept the
  // bench as furniture but refused it as a name ("workbench wouldn't be a good
  // name for kids"). So it is scenery — a lit bench line along the floor with
  // parts on it, saying "the parts you can touch" without saying it.
  ctx.fillStyle = '#1a212a';
  ctx.fillRect(0, H * 0.86, W, H * 0.14);
  ctx.fillStyle = '#3d5163';
  ctx.fillRect(0, H * 0.86, W, 2);
  for (let i = 0; i < 9; i++) {
    const x = W * (0.06 + i * 0.105);
    // Boards, chips and a drive or two, laid out along the bench. Trevor kept
    // the workbench as FURNITURE while refusing it as a name — so it has to be
    // legible enough to do the explaining the name declines to do.
    ctx.fillStyle = i % 3 === 0 ? '#2f6f47' : '#39485a';
    ctx.fillRect(x, H * 0.893, W * 0.038, H * 0.030);
    ctx.fillStyle = '#12161c';
    ctx.fillRect(x + W * 0.006, H * 0.900, W * 0.009, H * 0.012);
    ctx.fillRect(x + W * 0.021, H * 0.900, W * 0.009, H * 0.012);
  }
}

// ─── The machine's prompt ───────────────────────────────────────────────────
//
// The Apple IIe's Applesoft prompt is `]`. In Press Start 2P a `]` is a top bar, a
// right stroke and a bottom bar — which at prompt size is a `J`, so `]CATALOG`
// read as if the child had to type a J first (2026-10-30 explorer playtest). So
// the bracket is DRAWN, the faithful shape a bracket really has: taller than a
// capital letter and reaching BELOW the baseline, which no letter here does, set
// apart from the command by a clear gap. Any other prompt (`C:\>`) is just text.
function promptWidth(prompt, fs) {
  return prompt === ']' ? fs * 1.35 : ctx.measureText(prompt).width;
}

function drawPrompt(prompt, x, y, fs) {
  if (prompt !== ']') { ctx.fillText(prompt, x, y); return ctx.measureText(prompt).width; }
  const px = Math.max(2, Math.round(fs / 8));           // one Press Start 2P pixel
  const top = Math.round(y - fs * 1.05);                // above cap height
  const bot = Math.round(y + fs * 0.3);                 // below the baseline
  const right = Math.round(x + fs * 0.62);
  const arm = Math.round(fs * 0.45);
  ctx.fillRect(right - px, top, px, bot - top);         // the stroke
  ctx.fillRect(right - arm, top, arm, px);              // top arm, pointing left
  ctx.fillRect(right - arm, bot - px, arm, px);         // bottom arm
  return fs * 1.35;
}

function drawMenu() {
  const W = canvas.width, H = canvas.height;
  room(W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  ctx.font = `${Math.round(H * 0.045)}px "Press Start 2P", monospace`;
  ctx.fillText('THE HARDWARE', W / 2, H * 0.14);
  ctx.fillStyle = DIM;
  ctx.font = `${Math.round(H * 0.022)}px "Press Start 2P", monospace`;
  ctx.fillText('THE PARTS YOU CAN TOUCH', W / 2, H * 0.195);

  ctx.textAlign = 'left';
  const x = W * 0.16;
  STATIONS.forEach((s, i) => {
    const y = H * (0.32 + i * 0.13);
    const on = i === cursor;
    if (on) {
      ctx.fillStyle = 'rgba(142,240,168,0.10)';
      ctx.fillRect(W * 0.12, y - H * 0.055, W * 0.76, H * 0.105);
      ctx.fillStyle = INK;
      ctx.font = `${Math.round(H * 0.024)}px "Press Start 2P", monospace`;
      ctx.fillText('>', W * 0.135, y);
    }
    ctx.fillStyle = on ? INK : '#5f8f72';
    ctx.font = `${Math.round(H * 0.026)}px "Press Start 2P", monospace`;
    ctx.fillText(s.machine, x, y);
    ctx.fillStyle = DIM;
    ctx.font = `${Math.round(H * 0.018)}px "Press Start 2P", monospace`;
    ctx.fillText(`${s.room} · ${s.year}`, x, y + H * 0.032);
    ctx.textAlign = 'right';
    ctx.fillText(s.running, W * 0.86, y);
    ctx.textAlign = 'left';
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = DIM;
  ctx.font = `${Math.round(H * 0.017)}px "Press Start 2P", monospace`;
  ctx.fillText('↑ ↓ WALK · SPACE SIT DOWN · ESC BACK TO THE ARCADE', W / 2, H * 0.79);
}

function drawStation() {
  const W = canvas.width, H = canvas.height;
  room(W, H);
  const s = station;
  if (!s) return;

  // Header: the machine, and WHY it is in this room. The spine of the whole
  // wing is the migration through the house (spec §0.2), so every station says
  // which room it is in and the header never lets that drop.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  ctx.font = `${Math.round(H * 0.026)}px "Press Start 2P", monospace`;
  ctx.fillText(s.machine, W * 0.08, H * 0.1);
  ctx.fillStyle = DIM;
  ctx.font = `${Math.round(H * 0.017)}px "Press Start 2P", monospace`;
  ctx.fillText(`${s.room} · ${s.year} · ${s.maker}`, W * 0.08, H * 0.14);

  // The CRT
  const sx = W * 0.08, sy = H * 0.19, sw = W * 0.84, sh = H * 0.56;
  ctx.fillStyle = '#04120a';
  ctx.fillRect(sx, sy, sw, sh);
  ctx.strokeStyle = '#1e3a28';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx, sy, sw, sh);

  const lh = Math.round(H * 0.036);
  const fs = Math.round(H * 0.020);
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  let y = sy + lh * 1.2;
  // The transcript is only on screen while the machine is still BOOTING. Once
  // the program loads, the screen becomes the program — which is both what
  // actually happened (a loaded disk replaced the BASIC listing, it did not
  // print over it) and the fix for the overlap this shipped with: the reward
  // text was landing on top of "]RUN STICKYBEAR / LOADING...".
  if (!awake) {
    const maxLines = Math.floor((sh - lh * 2) / lh);
    const shown = log.slice(-Math.max(0, maxLines - 2));
    shown.forEach(entry => {
      ctx.fillStyle = entry.kind === 'echo' ? INK : '#69b585';
      let ex = sx + W * 0.02;
      if (entry.kind === 'echo') ex += drawPrompt(entry.prompt, ex, y, fs);
      ctx.fillText(entry.text, ex, y);
      y += lh;
    });
  }

  if (!awake) {
    const line = currentLine();
    if (line) {
      // The prompt, what you have typed so far, and a cursor. What you have NOT
      // typed yet is shown dim — so the thing you are aiming at is always
      // visible. A child should never have to guess the incantation.
      ctx.fillStyle = INK;
      const px = sx + W * 0.02 + drawPrompt(s.prompt, sx + W * 0.02, y, fs);
      ctx.fillText(typed, px, y);
      const w = ctx.measureText(typed).width;
      const rest = line.type.slice(typed.length);
      ctx.fillStyle = nudge > 0 ? '#e8b060' : DIM;      // the gentle nudge: a warm blink, never red
      ctx.fillText(rest, px + w, y);
      // ⚠️ The cursor is an UNDERLINE, not a block, and that is not a style
      // choice. A block cursor sits exactly on top of the next expected
      // character — the one thing the player is being asked to read — so the
      // hint and the cursor were fighting over the same pixels. Caught by
      // looking at a frame, not by any assertion (.claude/rules/playtest.md).
      const cw = rest.length ? ctx.measureText(rest[0]).width : fs * 0.7;
      if ((t >> 4) & 1) {
        ctx.fillStyle = INK;
        ctx.fillRect(px + w, y + fs * 0.22, cw, 2);
      }
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = DIM;
    ctx.font = `${Math.round(H * 0.017)}px "Press Start 2P", monospace`;
    ctx.fillText('TYPE WHAT IT IS WAITING FOR · ESC WALK AWAY', W / 2, H * 0.83);
  } else {
    // Awake. The machine is running the thing it was bought for.
    //
    // This is the wing's celebration, and theme-authoring.md is explicit that a
    // reward window without a real animation is "dead air — a product
    // violation". So the load is staged: the tube flashes as the program takes
    // the screen, the title wipes in, then the reason this machine sat in this
    // room arrives last.
    const flash = Math.max(0, 1 - awakeT / 14);
    if (flash > 0) {
      ctx.fillStyle = `rgba(142,240,168,${(flash * 0.55).toFixed(3)})`;
      ctx.fillRect(sx, sy, sw, sh);
    }
    ctx.textAlign = 'center';
    const pulse = 0.75 + 0.25 * Math.sin(awakeT / 12);
    ctx.fillStyle = `rgba(142,240,168,${pulse.toFixed(3)})`;
    ctx.font = `${Math.round(H * 0.030)}px "Press Start 2P", monospace`;
    const chars = Math.max(0, Math.min(s.running.length, Math.floor((awakeT - 8) / 2)));
    ctx.fillText(s.running.slice(0, chars), W / 2, sy + sh * 0.42);
    if (awakeT > 30) {
      ctx.fillStyle = DIM;
      ctx.font = `${Math.round(H * 0.018)}px "Press Start 2P", monospace`;
      ctx.fillText(s.runningYear, W / 2, sy + sh * 0.42 + H * 0.045);
    }

    // WHY the machine sat in this room. This is the wing's actual lesson and it
    // is deliberately shown at the moment of reward, not as a plaque on arrival.
    if (awakeT > 40) {
      const fade = Math.min(1, (awakeT - 40) / 25);
      ctx.fillStyle = `rgba(127,184,148,${fade.toFixed(3)})`;
      ctx.font = `${Math.round(H * 0.016)}px "Press Start 2P", monospace`;
      (s.why || '').split('\n').forEach((ln, i) => {
        ctx.fillText(ln, W / 2, sy + sh * 0.76 + i * H * 0.03);
      });
    }

    if (awakeT > 70) {
      ctx.fillStyle = DIM;
      ctx.font = `${Math.round(H * 0.017)}px "Press Start 2P", monospace`;
      ctx.fillText('SPACE · BACK TO THE WALL', W / 2, H * 0.83);
    }
  }
  ctx.textAlign = 'left';
}

// ─── The card ───────────────────────────────────────────────────────────────
//
// THE SAME RITUAL, MOVED INTO THE WING. The 25 cabinets have taught the player
// one contract for sixty cards — you type the word, and a little card gets picked
// up off the floor with the story on it. This wing had the earning half wired and
// no reveal at all: `wakeUp()` wrote the id into the save and the player never saw
// what they got. A card the child never reads is not a card.
//
// It is drawn on CANVAS rather than reusing `#history-card`, because that element
// lives inside `.complete-modal` and showing it here would drag LEVEL COMPLETE
// and a stats block into a room that has neither. So this echoes the DOM card's
// own palette and proportions (css/screens.css `.history-card`) — cream stock,
// double border, the same small tilt and drop-in — and stays canvas text only
// (security.md rule 1: themes never create DOM sinks).

// Break `text` into lines that fit `maxW` at the current font. Wrapping on words
// keeps a child's reading line intact; a word longer than the box is left to
// overflow rather than split, which never happens at these lengths.
function wrapText(text, maxW) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (line && ctx.measureText(next).width > maxW) { lines.push(line); line = w; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// The largest font size (<= `size`, >= 60% of it) at which `text` fits `maxW`.
// Every card today fits at its base size, so this is a no-op for them; it exists
// for the next row of WING_CARDS (spec §0.3 plans 14), so a long station title can
// never run off the card stock or into its border.
function fitFontSize(text, size, maxW) {
  const floor = Math.max(6, Math.floor(size * 0.6));
  let px = size;
  for (; px > floor; px--) {
    ctx.font = `${px}px "Press Start 2P", monospace`;
    if (ctx.measureText(text).width <= maxW) break;
  }
  return px;
}

function drawCard() {
  const W = canvas.width, H = canvas.height;
  room(W, H);

  // The room dims behind the card so the reward is the only lit thing.
  ctx.fillStyle = 'rgba(4,6,8,0.72)';
  ctx.fillRect(0, 0, W, H);

  const c = earnedCard && earnedCard.card;
  if (!c) { returnToMenu(); return; }

  // 0.4s drop-in, matching the DOM card's `cardDrop` keyframes exactly so the
  // two reveals feel like the same object.
  const inT = Math.min(1, cardT / 24);
  const ease = 1 - Math.pow(1 - inT, 3);
  const dy = -H * 0.02 * (1 - ease);

  const pad = H * 0.035;
  const cw = Math.min(W * 0.42, H * 0.58);
  const factSize = Math.round(H * 0.0155);
  ctx.font = `${factSize}px "Press Start 2P", monospace`;
  const factLines = wrapText(c.fact, cw - pad * 2);
  const factLead = factSize * 1.9;
  const ch = pad * 2 + H * 0.028 + H * 0.048 + H * 0.030 + factLines.length * factLead + H * 0.034;

  ctx.save();
  ctx.globalAlpha = ease;
  ctx.translate(W / 2, H / 2 + dy);
  ctx.rotate(-1.5 * Math.PI / 180);          // the same lazy tilt as the DOM card

  // Card stock + double border, straight from .history-card.
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(-cw / 2 + 4, -ch / 2 + 8, cw, ch);
  ctx.fillStyle = '#e8e0c8';
  ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
  ctx.strokeStyle = '#2a2418';
  ctx.lineWidth = 2;
  ctx.strokeRect(-cw / 2, -ch / 2, cw, ch);
  ctx.strokeRect(-cw / 2 + 4, -ch / 2 + 4, cw - 8, ch - 8);

  let y = -ch / 2 + pad;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // The header is the one line that is NOT the arcade's. These cards are not
  // found on the arcade floor — they are found standing at the machine.
  ctx.fillStyle = '#6b5f43';
  ctx.font = `${Math.round(H * 0.012)}px "Press Start 2P", monospace`;
  ctx.fillText('FOUND BESIDE THE MACHINE', 0, y);
  y += H * 0.028;

  const innerW = cw - pad * 2;
  const wordText = String(c.word || '').toUpperCase();
  ctx.fillStyle = '#2a2418';
  ctx.font = `${fitFontSize(wordText, Math.round(H * 0.032), innerW)}px "Press Start 2P", monospace`;
  ctx.fillText(wordText, 0, y);
  y += H * 0.048;

  const titleText = `${c.title} · ${c.year}`;
  ctx.fillStyle = '#4a4030';
  ctx.font = `${fitFontSize(titleText, Math.round(H * 0.014), innerW)}px "Press Start 2P", monospace`;
  ctx.fillText(titleText, 0, y);
  y += H * 0.030;

  ctx.fillStyle = '#2a2418';
  ctx.font = `${factSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'left';
  factLines.forEach((ln, i) => ctx.fillText(ln, -cw / 2 + pad, y + i * factLead));
  y += factLines.length * factLead;

  // Scoped to the WING bank — an unscoped count reads "CARD 63 OF 60" the moment
  // a bonus card exists (the INV-100 bug), and the scoped line is the better
  // feature anyway: it names which collection just moved.
  ctx.fillStyle = '#6b5f43';
  ctx.font = `${Math.round(H * 0.012)}px "Press Start 2P", monospace`;
  ctx.textAlign = 'right';
  ctx.fillText(`CARD ${earnedCard.found} OF ${earnedCard.total}`, cw / 2 - pad, y + H * 0.010);

  if (earnedCard.isNew) {
    ctx.save();
    ctx.translate(cw / 2 - H * 0.012, -ch / 2 + H * 0.004);
    ctx.rotate(8 * Math.PI / 180);
    ctx.fillStyle = '#ff4444';
    const bw = H * 0.075, bh = H * 0.030;
    ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.round(H * 0.013)}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NEW!', 0, 1);
    ctx.restore();
  }

  ctx.restore();

  // The way out, ABOVE the bench. It used to sit at 0.90H — on top of the boards
  // and chips laid along the floor strip (0.86-1.0H), in the dimmest green, which
  // is where a child's eye has the least chance of finding it (2026-10-30). Now it
  // sits just under the card, clear of the bench line, on its own dark plate.
  if (cardT > 28) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fsz = Math.round(H * 0.019);
    ctx.font = `${fsz}px "Press Start 2P", monospace`;
    const label = 'SPACE · BACK TO THE WALL';
    const y = Math.min(H * 0.815, H / 2 + ch / 2 + H * 0.065);
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(W / 2 - tw / 2 - fsz, y - fsz * 1.1, tw + fsz * 2, fsz * 2.2);
    ctx.fillStyle = '#8fd0a4';
    ctx.globalAlpha = Math.min(1, (cardT - 28) / 20);
    ctx.fillText(label, W / 2, y);
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// Exposed for the host: which cards this station shows (its own, then the
// arcade ones it cross-references). Phase 1 has no station cards of its own yet
// — see js/history-cards.js WING_CARDS.
export function cardsFor(stationId) { return stationCards('hardware', stationId); }
export function guaranteedCardFor(stationId, collected, rot) {
  return pickGuaranteedStationCard('hardware', stationId, collected, rot);
}
