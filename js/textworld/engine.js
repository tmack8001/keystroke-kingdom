// ─── Text-World engine (Act 6 — Text Worlds) ───────────────────────────────
//
// A world-agnostic runtime for the typed-command text adventures behind the
// arcade's back-wall door. This is the "guided" end of the hybrid typing model
// (.claude/rules — Act 6 design, docs/ROADMAP.md §2): the player READS a room
// and TYPES one of the commands the room OFFERS. It is NOT the pattern engine
// (js/main.js handleGameKey) — it runs as a parallel screen/input path so the
// core curriculum engine is never touched.
//
// THE ONE RULE holds absolutely here (product.md): no timers, no death, no
// loss. A wrong key does the same thing the pattern engine does — a gentle nudge
// and the command line simply WAITS; it never advances, never punishes. You can
// only ever arrive.
//
// SECURITY (.claude/rules/security.md rules 1-3, 6): guided mode only ever
// accepts the world's OWN authored command strings — a key is appended only if
// the buffer stays a prefix of some offered command, so arbitrary/free text can
// never enter. Everything is drawn as canvas text (fillText) — never innerHTML,
// never a DOM sink. There is no new untrusted-input surface here. (The later
// free-text parser slice is the one that will need boundary allowlisting.)
//
// A "world" (see greendragon.js) is pure DATA:
//   { id, title, palette?, start, intro:[str], rooms:{ id: Room }, goal(api) }
//   Room = { title, desc:[str] | (api)=>[str], commands:[Command], onEnter?(api) }
//   Command = { text (lowercase, no lead/trail space), run(api), when?(api)->bool }
// The engine gives each run()/when()/desc() an `api` of world-mutation helpers.

import * as Audio from '../audio.js';
import { buildPool, answerMatches, isNearMiss, ANSWER_CAP, HINT_AT_TRY, REVEAL_AT_TRY, ANSWER_KEYS_CUE } from './riddles.js';
import { enterLabel } from '../key-label.js';

let canvas, ctx, animId;
let active = false;

let world = null;
let onComplete = null;

// Player/world state for the current session.
let room = null;          // current room id
const inventory = new Set();
const flags = new Set();
const visited = new Set();

let lines = [];           // scrolling narrative log (array of strings)
let typed = '';           // the command being typed (lowercased for matching/display)
let nudgeT = 0;           // brief red-ish flash timer after a rejected key (frames)
let won = false;
let winT = 0;             // frames since victory (drives the gold flourish)

// Riddle sub-mode (Act 6 — the prose world's riddling creatures, matching the
// tile worlds): a command may carry `ask: <riddler>`; firing it drops the player
// into a TYPED free-word answer prompt. Riddles are always BONUS (they never set
// the goal). The cursor per creature advances on each ask, so a character you
// come back to poses a NEW riddle — "different each time" (Trevor, 2026-07-18).
let mode = 'command';      // 'command' | 'riddle'
let activeRiddler = null;  // the creature def currently asking
let activeRiddle = null;   // the pooled riddle it is currently posing
let riddleAnswer = '';     // the letters-only word being typed as an answer
let riddleTries = 0;       // wrong attempts on the CURRENT riddle (drives hint/reveal)
let riddleNearMisses = 0;  // typos on the CURRENT riddle — the first one is free (see submitRiddle)
const riddleCursors = new Map();  // riddler id → next pool index (rotation across asks)

// Hybrid "hints fade" (Act 6 design): the offered-command hints start fully shown
// and fade as the player masters typing — but ALWAYS return on a nudge, a new room,
// or an idle pause, so no one is ever left stuck (the One Rule).
let mastery = 0;          // commands successfully fired this session
let hintBoostT = 0;       // frames of forced-full hints (nudge / room change)
let lastActMs = 0;        // performance.now() of the last keypress (idle → reassure)

// Default palette (emerald phosphor); a world may override via world.palette.
// `hint` is the colour for the lines a child must READ — the offered commands, the
// answer cue, the BACKSPACE line. It clears 4.5:1 on `bg` (5.7:1); `dim` (3.6:1) is
// kept for decoration only (separators, the faded-with-mastery mode).
const DEFAULT_PALETTE = { fg: '#4fe08a', dim: '#1f7a45', hint: '#2f9e5c', bg: '#001204', accent: '#ffd23f' };
let palette = DEFAULT_PALETTE;

const MAX_LINES_KEPT = 200; // hard cap so the log can never grow unbounded
const WIN_HOLD_FRAMES = 360; // the arrival hold before the auto-return (~6s at 60fps)

// ─── The api handed to world data (run/when/desc) ───────────────────────────
const api = {
  say(...ls) { for (const l of ls) pushLine(l); },
  go(roomId) { enterRoom(roomId); },
  describe() { describeRoom(true); },
  take(item) { inventory.add(item); },
  drop(item) { inventory.delete(item); },
  has(item) { return inventory.has(item); },
  setFlag(name) { flags.add(name); },
  clearFlag(name) { flags.delete(name); },
  flag(name) { return flags.has(name); },
  visited(roomId) { return visited.has(roomId); },
  get room() { return room; },
};

// ─── Public API ─────────────────────────────────────────────────────────────

export function isActive() { return active; }
export function hasWon() { return won; }   // for the hub: credit the win on any exit

export function start(w, opts = {}) {
  world = w;
  onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;
  palette = (w && w.palette) || DEFAULT_PALETTE;

  canvas = document.getElementById('invaders-canvas');
  ctx = canvas.getContext('2d');
  sizeCanvas();

  room = null;
  inventory.clear();
  flags.clear();
  visited.clear();
  lines = [];
  typed = '';
  nudgeT = 0;
  won = false;
  winT = 0;
  mode = 'command';
  activeRiddler = null;
  activeRiddle = null;
  riddleAnswer = '';
  riddleTries = 0;
  riddleCursors.clear();
  mastery = 0;
  hintBoostT = 0;
  lastActMs = performance.now();

  // Intro banner, then drop into the starting room.
  if (Array.isArray(w.intro)) for (const l of w.intro) pushLine(l);
  enterRoom(w.start);

  active = true;
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  world = null;
  onComplete = null;
}

// Called from the main.js keydown router (case 'textworld'). Escape is handled
// by the router (exit to the arcade) BEFORE this runs; everything else is command
// typing. Returns nothing — all effects are internal + the onComplete callback.
export function handleKey(e) {
  if (!active) return;
  // Arrived. Space/Return walks out now rather than waiting on the auto-return —
  // the cue for it is drawn where the prompt was (drawWinExitCue), so the screen
  // never ends on an empty '>' with nothing to say what to do (2026-10-30
  // explorer playtest). Escape is the hub's, as everywhere in the wing.
  if (won) { if (e.key === ' ' || e.key === 'Enter') finish(); return; }
  lastActMs = performance.now();
  if (mode === 'riddle') { handleRiddleKey(e); return; }
  const k = e.key;

  if (k === 'Backspace') {
    // Self-correction is always allowed and never punished — backspace is how
    // every writer works (product.md / Level 25 framing).
    if (typed.length) { typed = typed.slice(0, -1); Audio.correct(); }
    return;
  }

  // Enter confirms an exact, unambiguous command (the escape hatch when a
  // completed command is also the prefix of a longer one — rare by authoring).
  if (k === 'Enter') {
    const exact = offered().find((c) => c.text === typed);
    if (exact) fire(exact);
    return;
  }

  // Only single printable characters are candidate command input. Space is a
  // literal character here (commands like "go north" contain it) — this is the
  // deliberate exception, exactly like the name-entry screen.
  if (k.length !== 1) return;
  const ch = k.toLowerCase();

  const next = typed + ch;
  const stillMatches = offered().some((c) => c.text.startsWith(next));
  if (!stillMatches) {
    // Wrong key → gentle nudge, the command line WAITS (does not advance). Bring
    // the hints back too — a miss means the player could use a hand.
    Audio.wrong();
    nudgeT = 12;
    hintBoostT = 180;
    return;
  }

  typed = next;
  Audio.correct();

  // Auto-fire on an exact match that isn't a proper prefix of another offered
  // command (so "go" can't fire when only "go north" is offered).
  const exact = offered().find((c) => c.text === typed);
  const ambiguous = offered().some((c) => c.text !== typed && c.text.startsWith(typed));
  if (exact && !ambiguous) fire(exact);
}

// ─── World mechanics ────────────────────────────────────────────────────────

function offered() {
  const r = world.rooms[room];
  if (!r || !Array.isArray(r.commands)) return [];
  return r.commands.filter((c) => c && typeof c.text === 'string' && (!c.when || c.when(api)));
}

function fire(cmd) {
  pushLine('> ' + cmd.text);
  typed = '';
  mastery++;   // a completed command — the player needs the hints a little less
  try {
    if (typeof cmd.run === 'function') cmd.run(api);
  } catch (_) {
    // A world-data bug must never crash play; it just does nothing.
  }
  // A riddler command drops into the TYPED answer prompt (bonus — never the goal).
  if (cmd.ask) { openRiddle(cmd.ask); return; }
  if (!won && typeof world.goal === 'function' && world.goal(api)) triggerWin();
}

// ─── Riddle sub-mode (the prose world's riddling creatures) ─────────────────

function openRiddle(def) {
  const pool = buildPool(def);
  const id = def.id || def.name || 'riddler';
  const idx = riddleCursors.get(id) || 0;
  activeRiddle = pool[idx % pool.length];
  riddleCursors.set(id, idx + 1);     // next ask rotates to a new puzzle
  activeRiddler = def;
  mode = 'riddle';
  riddleAnswer = '';
  riddleTries = 0;
  riddleNearMisses = 0;
  hintBoostT = 150;
  pushLine('');
  pushLine((def.name || 'A voice') + ' asks:');
  pushLine(activeRiddle.riddle || '');
}

// The answer is the one free-text surface — allowlisted to letters, length-
// capped, compared locally, never stored, never a DOM sink (security.md 1-3,6).
function handleRiddleKey(e) {
  const k = e.key;
  if (k === ' ') { closeRiddle(); return; }          // Space steps back out (never stuck)
  if (k === 'Backspace') { if (riddleAnswer) { riddleAnswer = riddleAnswer.slice(0, -1); Audio.correct(); } return; }
  if (k === 'Enter') { submitRiddle(); return; }
  if (k.length !== 1) return;
  const ch = k.toLowerCase();
  if (ch >= 'a' && ch <= 'z' && riddleAnswer.length < ANSWER_CAP) { riddleAnswer += ch; Audio.correct(); }
  else { Audio.wrong(); nudgeT = 12; }
}

function submitRiddle() {
  if (!riddleAnswer) return;           // an empty Return is not a guess — nothing happens
  if (answerMatches(activeRiddle, riddleAnswer)) { solveRiddle(); return; }
  pushLine('> ' + riddleAnswer);
  // A TYPO is not a wrong idea. The word is ONE letter off an accepted answer, so
  // say so, and LEAVE IT IN THE BOX to be fixed with Backspace — never wipe what a
  // child who knew the answer typed (riddles.js isNearMiss; it is never counted as
  // right). The first typo on a riddle costs nothing toward the hint; later ones
  // do, so the hint and then the answer still arrive and no one is ever stuck.
  if (isNearMiss(activeRiddle, riddleAnswer)) {
    riddleNearMisses++;
    if (riddleNearMisses > 1) riddleTries++;
    Audio.wrong();
    nudgeT = 12;
    hintBoostT = 150;
    pushLine(`So close! One letter is off. BACKSPACE can fix it, then press ${enterLabel()}.`);
    if (riddleTries >= HINT_AT_TRY) pushLine(hintLine());
    return;
  }
  riddleTries++;
  Audio.wrong();
  nudgeT = 12;
  hintBoostT = 150;
  if (riddleTries < HINT_AT_TRY) {
    pushLine('Not quite — but there is no hurry. Try again, or press SPACE to step back.');
  } else {
    pushLine(hintLine());
  }
  riddleAnswer = '';
}

function hintLine() {
  let h = 'hint: ' + (activeRiddle.hint || '');
  if (riddleTries >= REVEAL_AT_TRY && activeRiddle.answers.length) h += '  (try: ' + activeRiddle.answers[0] + ')';
  return h;
}

function solveRiddle() {
  pushLine('> ' + riddleAnswer);
  if (activeRiddle.reward) pushLine(activeRiddle.reward);
  mastery++;
  Audio.levelComplete();
  mode = 'command';
  activeRiddler = null; activeRiddle = null; riddleAnswer = ''; riddleTries = 0; riddleNearMisses = 0;
  hintBoostT = 120;
}

function closeRiddle() {
  pushLine('You smile and step back. (Come ask again any time — there is always a new riddle.)');
  Audio.correct();
  mode = 'command';
  activeRiddler = null; activeRiddle = null; riddleAnswer = ''; riddleTries = 0; riddleNearMisses = 0;
  hintBoostT = 120;
}

function enterRoom(roomId) {
  const r = world.rooms[roomId];
  if (!r) return;
  room = roomId;
  hintBoostT = 150;   // a new room's commands are new — surface them for a beat
  const firstTime = !visited.has(roomId);
  visited.add(roomId);
  if (typeof r.onEnter === 'function') {
    try { r.onEnter(api); } catch (_) {}
  }
  describeRoom(firstTime);
}

function describeRoom(withTitle) {
  const r = world.rooms[room];
  if (!r) return;
  if (withTitle && r.title) { pushLine(''); pushLine(r.title); }
  const desc = typeof r.desc === 'function' ? r.desc(api) : r.desc;
  if (Array.isArray(desc)) for (const l of desc) pushLine(l);
}

function triggerWin() {
  won = true;
  winT = 0;
  pushLine('');
  if (Array.isArray(world.outro)) for (const l of world.outro) pushLine(l);
  Audio.levelComplete();
}

function finish() { if (onComplete) { const cb = onComplete; onComplete = null; cb(); } }

function pushLine(text) {
  lines.push(String(text));
  if (lines.length > MAX_LINES_KEPT) lines = lines.slice(-MAX_LINES_KEPT);
}

// ─── Rendering (self-contained emerald CRT; modeled on themes/terminal.js) ──

function sizeCanvas() {
  if (!canvas) return;
  if (canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
  if (canvas.height !== window.innerHeight) canvas.height = window.innerHeight;
}

function render() {
  if (!active) return;
  sizeCanvas();
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  drawBackground(W, H);
  drawLog(W, H);
  if (won) drawWinExitCue(W, H);
  else if (mode === 'riddle') drawRiddlePrompt(W, H);
  else drawPromptAndHints(W, H);
  if (won) drawWinFlourish(W, H);
  drawScanlines(W, H);
  if (nudgeT > 0) nudgeT--;
  if (hintBoostT > 0) hintBoostT--;

  // After the victory flourish has landed, hand control back to the Text Worlds
  // chooser. ~6s, matching the tile worlds' hold (it was 2.5s, too short to read
  // the outro); Space/Return leaves sooner.
  if (won) {
    winT++;
    if (winT === WIN_HOLD_FRAMES) finish();
  }

  animId = requestAnimationFrame(render);
}

function drawBackground(W, H) {
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);
  const vign = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
  vign.addColorStop(0, 'rgba(0,0,0,0)');
  vign.addColorStop(1, 'rgba(0,15,0,0.55)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);
}

function drawScanlines(W, H) {
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}

function fontFor(W) { return Math.max(11, Math.floor(W * 0.0135)); }

// Word-wrap a string to a pixel width using the CURRENT ctx.font (measured, so
// it holds at any window size). Hard-breaks a single token longer than the line.
function wrapLine(str, maxWidth) {
  str = String(str);
  if (str === '') return [''];
  const fits = (s) => ctx.measureText(s).width <= maxWidth;
  const out = [];
  let cur = '';
  for (let w of str.split(' ')) {
    while (!fits(w) && w.length > 1) {          // token itself too wide → hard-break
      let piece = '';
      for (const ch of w) { if (fits(piece + ch)) piece += ch; else break; }
      if (!piece) piece = w[0];
      if (cur) { out.push(cur); cur = ''; }
      out.push(piece);
      w = w.slice(piece.length);
    }
    const trial = cur ? cur + ' ' + w : w;
    if (fits(trial) || !cur) cur = trial;
    else { out.push(cur); cur = w; }
  }
  if (cur) out.push(cur);
  return out.length ? out : [''];
}

// The narrative log fills the top ~68% and scrolls; newest line brightest.
function drawLog(W, H) {
  const fontSize = fontFor(W);
  const lineH = Math.round(fontSize * 1.7);
  const marginX = Math.round(W * 0.07);
  const topY = Math.round(H * 0.08);
  const maxLines = Math.max(1, Math.floor((H * 0.66) / lineH));

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'left';       // canvas state leaks between screens — set explicitly (L28)
  ctx.textBaseline = 'top';

  // Wrap the recent log to the usable width, then show the last maxLines of the
  // wrapped result (bound the wrap work to a slice, not the whole 200-line cap).
  const avail = W - marginX * 2;
  const recent = lines.slice(-Math.max(maxLines + 4, 40));
  const display = [];
  for (const l of recent) for (const s of wrapLine(l, avail)) display.push(s);
  const visible = display.slice(-maxLines);

  visible.forEach((line, i) => {
    const y = topY + i * lineH;
    const age = visible.length - 1 - i;
    const alpha = Math.max(0.28, 1 - age * 0.09);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = palette.fg;
    ctx.shadowColor = palette.fg;
    ctx.shadowBlur = i === visible.length - 1 ? 8 : 3;
    ctx.fillText(line, marginX, y);
  });
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';
}

// Hybrid hint visibility. Fades with mastery, but ALWAYS returns to 'full' when
// the player is nudged, enters a new room, or pauses (idle) — the One Rule: hints
// may fade, but no one can ever be left stuck.
function hintMode() {
  if (hintBoostT > 0) return 'full';
  if (performance.now() - lastActMs > 6000) return 'full';   // idle → reassure
  if (mastery < 2) return 'full';
  if (mastery < 5) return 'dim';
  return 'hidden';
}

// The bottom band: the command line the player is typing, plus the guided hints
// (the "you can:" list — the guided end of the hybrid model, which fades as the
// player finds their feet: see hintMode()).
function drawPromptAndHints(W, H) {
  const fontSize = fontFor(W);
  const marginX = Math.round(W * 0.07);
  const promptY = Math.round(H * 0.80);
  const hintY = Math.round(H * 0.89);

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Prompt: "> " + typed + blinking block cursor. A rejected key briefly tints
  // the line so the nudge reads as "that key waits", never as an error.
  const promptStr = '> ' + typed;
  ctx.fillStyle = nudgeT > 0 ? '#d98a3f' : palette.fg;
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 8;
  ctx.fillText(promptStr, marginX, promptY);
  const cursorX = marginX + ctx.measureText(promptStr).width + 2;
  if (!won && Math.floor(performance.now() / 500) % 2 === 0) {
    ctx.fillRect(cursorX, promptY, Math.round(fontSize * 0.6), fontSize);
  }
  ctx.shadowBlur = 0;

  // Hints: the room's offered commands, shown per hintMode(). In 'full' the portion
  // already typed (that still matches) is bright and the rest dim — a live "you're
  // on track" cue. In 'dim' it's a faint reminder. In 'hidden' the bare prompt
  // stands alone (the "opened up" end of the hybrid).
  const mode = hintMode();
  const cmds = offered().map((c) => c.text);
  if (!cmds.length || won || mode === 'hidden') return;
  const dim = mode === 'dim';
  const small = Math.max(9, Math.floor(fontSize * 0.72));
  ctx.font = `${small}px "Press Start 2P", monospace`;
  ctx.shadowBlur = 0;
  let x = marginX;
  const label = dim ? '· ' : 'you can:  ';
  // In 'full' mode these are the words a child reads to know what to type, so they
  // get the readable `hint` colour at full opacity (>=4.5:1). Separators stay dim.
  const readable = palette.hint || palette.dim;
  ctx.globalAlpha = dim ? 0.3 : 1;
  ctx.fillStyle = dim ? palette.dim : readable;
  ctx.fillText(label, x, hintY);
  x += ctx.measureText(label).width;
  cmds.forEach((cmd, idx) => {
    if (idx > 0) {
      ctx.globalAlpha = dim ? 0.22 : 0.5;
      ctx.fillStyle = palette.dim;
      const sep = '  ·  ';
      ctx.fillText(sep, x, hintY); x += ctx.measureText(sep).width;
    }
    const matches = !dim && typed.length && cmd.startsWith(typed);
    ctx.globalAlpha = dim ? 0.3 : 1;
    ctx.fillStyle = matches ? palette.fg : (dim ? palette.dim : readable);
    ctx.fillText(cmd, x, hintY);
    x += ctx.measureText(cmd).width;
  });
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';
}

// The riddle prompt: the player TYPES their answer word (learn-to-type — a reply
// is always typed, never selected). Mirrors the command line's look; the riddle
// text + escalating hint live in the scrolling log above.
function drawRiddlePrompt(W, H) {
  const fontSize = fontFor(W);
  const marginX = Math.round(W * 0.07);
  const promptY = Math.round(H * 0.80);
  const hintY = Math.round(H * 0.885);
  const small = Math.max(9, Math.floor(fontSize * 0.72));

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // The answer sits in a visible BOX, labelled, so it reads as a field you can
  // edit — not as one more line of the story. A child who could not tell the
  // answer apart from the log did not know a wrong letter could be taken back.
  const promptStr = '> ' + riddleAnswer;
  const pad = Math.round(fontSize * 0.55);
  const boxW = Math.max(ctx.measureText('> ' + 'M'.repeat(14)).width,
    ctx.measureText(promptStr).width + fontSize) + pad * 2;
  const boxX = marginX - pad, boxY = promptY - pad, boxH = fontSize + pad * 2;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = nudgeT > 0 ? '#d98a3f' : palette.accent;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 2;
  ctx.strokeRect(boxX + 1, boxY + 1, boxW - 2, boxH - 2);
  ctx.globalAlpha = 1;

  ctx.font = `${small}px "Press Start 2P", monospace`;
  ctx.fillStyle = palette.accent;
  ctx.globalAlpha = 0.8;
  ctx.fillText('YOUR ANSWER', boxX, boxY - Math.round(small * 1.5));
  ctx.globalAlpha = 1;

  ctx.font = `${fontSize}px "Press Start 2P", monospace`;
  ctx.fillStyle = nudgeT > 0 ? '#d98a3f' : palette.accent;
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 8;
  ctx.fillText(promptStr, marginX, promptY);
  const cursorX = marginX + ctx.measureText(promptStr).width + 2;
  if (Math.floor(performance.now() / 500) % 2 === 0) {
    ctx.fillRect(cursorX, promptY, Math.round(fontSize * 0.6), fontSize);
  }
  ctx.shadowBlur = 0;

  // Two lines, so the Backspace cue is never squeezed off the edge.
  ctx.font = `${small}px "Press Start 2P", monospace`;
  ctx.fillStyle = palette.hint || palette.dim;   // the cue a child must read (>=4.5:1)
  ctx.globalAlpha = 1;
  const who = activeRiddler && activeRiddler.name ? activeRiddler.name + '  ·  ' : '';
  ctx.fillText(`${who}type your answer, then ${enterLabel()}`, marginX, hintY);
  ctx.fillText(`${ANSWER_KEYS_CUE}   ·   SPACE: step back`, marginX, hintY + Math.round(small * 1.9));
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';
}

// Where the prompt was, once you have arrived: say how to leave. Without this the
// win ended on an empty '>' with nothing on it (2026-10-30 explorer playtest).
function drawWinExitCue(W, H) {
  if (winT < 45) return;                        // let the outro land first
  const fontSize = fontFor(W);
  const small = Math.max(9, Math.floor(fontSize * 0.8));
  ctx.font = `${small}px "Press Start 2P", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = palette.accent;
  ctx.globalAlpha = Math.min(1, (winT - 45) / 30) * (0.7 + 0.3 * Math.sin(winT / 14));
  ctx.fillText('SPACE / ESC: BACK TO THE TEXT WORLDS', Math.round(W * 0.07), Math.round(H * 0.86));
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';
}

// A warm gold bloom on arrival — never a modal, never a stop; it just glows and
// then the arcade returns.
function drawWinFlourish(W, H) {
  const t = Math.min(1, winT / 40);
  ctx.save();
  ctx.globalAlpha = 0.20 * t;
  const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6);
  g.addColorStop(0, palette.accent);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
