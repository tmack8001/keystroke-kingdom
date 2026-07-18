// ─── The IM-friend (Act 6, world 5 of 5) ───────────────────────────────────
//
// A child chats with a warm little character powered by the LOCAL model (Ollama,
// via the game's own Go server — js/chat.js). It is the wing's fifth world and
// the same engine SHAPE as the others (start/stop/handleKey/isActive/hasWon), so
// the hub drives it identically. It never touches the 25-level pattern engine.
//
// THE ONE RULE (product.md) holds absolutely: no timers, no loss, no pressure —
// just a friend who is happy to see you and cheers your typing. Every persona is
// Keystroke-Kingdom-aware AND a gentle teacher-companion (that lives in the SERVER
// system prompt — main.go — not here).
//
// THREE VIEWS on the shared canvas:
//   'picker' — choose a friend: PIXEL & SPROUT (curated) + the child's own made
//              friends + "MAKE A NEW FRIEND". Made friends can be forgotten.
//   'make'   — the make-a-friend Q&A: NAME, WHAT, LOVES, LIKE (personas.js schema).
//   'chat'   — an IM window: the scrolling message log + a prompt bar; Enter sends.
//
// MEMORY (handoff §3): the model is stateless, so the whole transcript is kept
// CLIENT-SIDE and REPLAYED each turn — and PERSISTED to localStorage (kk-friends)
// so a friend RESUMES across game launches and remembers past chats. A rolling
// WINDOW is sent to the model (fits its context); the FULL history persists. A
// "forget this friend" path is the erase valve for the extra stored data.
//
// GRACEFUL OFFLINE (handoff §3/§7): if the model is asleep, the friend gently
// "naps" with scripted in-character warmth (personas.offlineReply) — never broken.
//
// SECURITY (.claude/rules/security.md rules 1-3,6-8): the chat message is free
// text (the point) but only ever (a) goes to the OWN server as model input and
// (b) is drawn as canvas text — never a DOM sink, never an external host. The
// persona free-text fields are allowlisted in personas.js AND re-validated
// server-side. Escape is owned by the hub (anti-trap, INV-46) — leaving always
// makes progress toward the arcade.
//
//   start({onComplete}), stop(), handleKey(e), isActive(), hasWon()

import * as Audio from '../audio.js';
import { sendChat } from '../chat.js';
import {
  CURATED,
  curatedById,
  MAKE_STEPS,
  KIND_CHOICES,
  TEMPERAMENT_CHOICES,
  assembleFriend,
  greetingFor,
  offlineReply,
} from './personas.js';

const PAL = {
  bg: '#0a0018',
  panel: '#160b2e',
  fg: '#eae4ff',
  dim: '#8a7fb8',
  you: '#9fe0ff',
  accent: '#ffd23f',
  warn: '#ff9c6b',
};

const FRIENDS_KEY = 'kk-friends';
const SEND_WINDOW = 12; // transcript entries replayed to the model each turn
const MAX_MSG_LEN = 160; // a kid's chat message; server caps again at 500
const MAX_TRANSCRIPT = 400; // hard cap on stored history per friend

let canvas, ctx, animId;
let active = false;
let onComplete = null;

let friends = {}; // kk-friends store: { [id]: { id, createdAt, persona, transcript } }

let view = 'picker'; // 'picker' | 'make' | 'chat'
let cursor = 0; // picker selection
let items = []; // cached picker item list (rebuilt on nav)
let forgetId = null; // non-null → forget-confirm overlay for this friend id

// make-a-friend flow
let makeIdx = 0;
let draft = { name: '', kind: '', loves: '', temperament: '' };
let choiceCursor = 0;

// chat
let activeId = null;
let typed = '';
let pending = false; // awaiting a model reply
let napping = false; // last reply was the offline fallback
let sendToken = 0; // invalidates in-flight replies on stop / friend change

let nudgeT = 0;
let visited = false; // hasWon: the child actually engaged (created or messaged a friend)

// This world's stable id + hub display title — the SINGLE source of truth for each,
// referenced by hub.js (its WORLDS entry) and the tests (HUB_ORDER), so they can never
// drift. (The chat/picker/make views draw their own contextual headers — the friend's
// name, "YOUR FRIENDS", "MAKE A FRIEND" — which are distinct from this hub label.)
export const id = 'imfriend';
export const title = 'A FRIEND TO TALK TO';

export function isActive() { return active; }
export function hasWon() { return visited; }

export function start(opts = {}) {
  onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;
  canvas = document.getElementById('invaders-canvas');
  ctx = canvas.getContext('2d');
  sizeCanvas();

  friends = loadFriends();
  view = 'picker';
  cursor = 0;
  forgetId = null;
  makeIdx = 0;
  draft = { name: '', kind: '', loves: '', temperament: '' };
  choiceCursor = 0;
  activeId = null;
  typed = '';
  pending = false;
  napping = false;
  sendToken++;
  nudgeT = 0;
  visited = false;
  rebuildItems();

  active = true;
  animId = requestAnimationFrame(render);
}

export function stop() {
  active = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  sendToken++; // any in-flight reply is now stale
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  onComplete = null;
}

// ─── kk-friends persistence (self-contained, tolerant — security.md rule 4) ──

function loadFriends() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(FRIENDS_KEY)); } catch (_) { raw = null; }
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  for (const id of Object.keys(raw)) {
    const f = raw[id];
    // Accept only the expected shape; skip anything malformed rather than throw.
    if (!f || typeof f !== 'object') continue;
    if (!f.persona || typeof f.persona !== 'object') continue;
    const persona = sanitizePersona(f.persona, id);
    if (!persona) continue;
    const transcript = Array.isArray(f.transcript)
      ? f.transcript
          .filter((m) => m && typeof m.text === 'string' && (m.role === 'you' || m.role === 'friend'))
          .map((m) => ({ role: m.role, text: String(m.text).slice(0, MAX_MSG_LEN * 4) }))
          .slice(-MAX_TRANSCRIPT)
      : [];
    out[id] = {
      id,
      createdAt: Number.isFinite(f.createdAt) ? f.createdAt : 0,
      persona,
      transcript,
    };
  }
  return out;
}

// Coerce a stored persona into a known-good shape. A curated friend must name a
// real curated key; a made friend must carry a spec object. Returns null to skip.
function sanitizePersona(p, id) {
  const spec = p.spec && typeof p.spec === 'object' ? p.spec : null;
  if (!spec) return null;
  if (typeof spec.curated === 'string') {
    const c = curatedById(spec.curated);
    if (!c) return null;
    return { id, name: c.name, kind: c.kind, color: c.color, spec: { curated: c.id } };
  }
  // player-made: keep only string fields, bounded
  const name = typeof p.name === 'string' && p.name ? p.name.slice(0, 16) : 'Buddy';
  const kind = typeof p.kind === 'string' && p.kind ? p.kind.slice(0, 24) : 'friend';
  const color = typeof p.color === 'string' ? p.color : PAL.accent;
  const cleanSpec = {
    name: typeof spec.name === 'string' ? spec.name.slice(0, 16) : name,
    kind: typeof spec.kind === 'string' ? spec.kind.slice(0, 24) : kind,
    loves: typeof spec.loves === 'string' ? spec.loves.slice(0, 24) : '',
    temperament: TEMPERAMENT_CHOICES.some((t) => t.id === spec.temperament) ? spec.temperament : 'gentle',
  };
  return { id, name, kind, color, spec: cleanSpec };
}

function saveFriends() {
  try { localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends)); } catch (_) { /* never block play */ }
}

// ─── Picker item list ────────────────────────────────────────────────────────

function rebuildItems() {
  const list = [];
  for (const c of CURATED) {
    list.push({ type: 'friend', id: c.id, name: c.name, color: c.color, blurb: c.blurb, curated: true });
  }
  const made = Object.values(friends)
    .filter((f) => f.persona && f.persona.spec && !f.persona.spec.curated)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  for (const f of made) {
    list.push({ type: 'friend', id: f.id, name: f.persona.name, color: f.persona.color, blurb: blurbFor(f), curated: false });
  }
  list.push({ type: 'make', name: 'MAKE A NEW FRIEND', color: PAL.accent });
  items = list;
  if (cursor >= items.length) cursor = items.length - 1;
  if (cursor < 0) cursor = 0;
}

function blurbFor(f) {
  const loves = f.persona.spec && f.persona.spec.loves;
  const kind = f.persona.kind || 'friend';
  return loves ? `your ${kind} who loves ${loves}` : `your very own ${kind}`;
}

// ─── Input routing ───────────────────────────────────────────────────────────
// Escape is intercepted by the hub (returns to the chooser) BEFORE this runs —
// so leaving always makes progress toward the arcade (anti-trap, INV-46).

export function handleKey(e) {
  if (!active) return;
  if (view === 'picker') return handlePicker(e);
  if (view === 'make') return handleMake(e);
  if (view === 'chat') return handleChatKey(e);
}

function handlePicker(e) {
  if (forgetId) return handleForgetConfirm(e);
  const k = e.key;
  if (k === 'ArrowUp') { cursor = (cursor - 1 + items.length) % items.length; return; }
  if (k === 'ArrowDown') { cursor = (cursor + 1) % items.length; return; }
  const it = items[cursor];
  if (k === 'Enter' || k === ' ') {
    if (!it) return;
    if (it.type === 'make') { beginMake(); return; }
    openFriend(it.id);
    return;
  }
  // Forget affordance: 'x' on a player-made friend (curated can't be forgotten).
  if ((k === 'x' || k === 'X') && it && it.type === 'friend' && !it.curated) {
    forgetId = it.id;
  }
}

function handleForgetConfirm(e) {
  const k = e.key;
  if (k === 'y' || k === 'Y') {
    delete friends[forgetId];
    saveFriends();
    forgetId = null;
    rebuildItems();
    Audio.coin();
    return;
  }
  // N or anything else cancels — nothing is ever erased by accident.
  forgetId = null;
}

// ─── make-a-friend ─────────────────────────────────────────────────────────

function beginMake() {
  view = 'make';
  makeIdx = 0;
  draft = { name: '', kind: '', loves: '', temperament: '' };
  typed = '';
  choiceCursor = 0;
}

function handleMake(e) {
  const step = MAKE_STEPS[makeIdx];
  const k = e.key;

  if (step.type === 'text') {
    if (k === 'Backspace') { if (typed) { typed = typed.slice(0, -1); Audio.correct(); } return; }
    if (k === 'Enter') { commitStep(typed); return; }
    if (k.length === 1) {
      // Live allowlist: only letters + spaces enter a persona field (the same set
      // personas.sanitizeField keeps). Anything else is a gentle nudge.
      if (/[a-zA-Z ]/.test(k) && typed.length < step.cap) { typed += k; Audio.correct(); }
      else { Audio.wrong(); nudgeT = 12; }
    }
    return;
  }

  // choice step
  const choices = step.choices;
  if (k === 'ArrowUp') { choiceCursor = (choiceCursor - 1 + choices.length) % choices.length; return; }
  if (k === 'ArrowDown') { choiceCursor = (choiceCursor + 1) % choices.length; return; }
  if (k === 'Enter' || k === ' ') { commitStep(choices[choiceCursor]); return; }
}

function commitStep(value) {
  const step = MAKE_STEPS[makeIdx];
  if (step.key === 'temperament') {
    // stored as the lowercase id, not the display label
    const t = TEMPERAMENT_CHOICES[choiceCursor];
    draft.temperament = t ? t.id : 'gentle';
  } else if (step.key === 'kind') {
    draft.kind = value;
  } else {
    draft[step.key] = value;
  }
  typed = '';
  choiceCursor = 0;
  makeIdx++;
  if (makeIdx >= MAKE_STEPS.length) finishMake();
}

function finishMake() {
  const id = 'f_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1e6).toString(36);
  const colorIndex = Object.keys(friends).filter((k) => !friends[k].persona.spec.curated).length;
  const friend = assembleFriend(draft, id, Date.now(), colorIndex);
  friend.transcript = [{ role: 'friend', text: greetingFor(friend.persona) }];
  friends[id] = friend;
  saveFriends();
  visited = true; // making a friend counts as engagement
  rebuildItems();
  openFriend(id);
}

// ─── chat ────────────────────────────────────────────────────────────────────

function openFriend(id) {
  let f = friends[id];
  if (!f) {
    // First time opening a curated friend — materialize it from CURATED metadata.
    const c = curatedById(id);
    if (!c) return;
    f = {
      id,
      createdAt: Date.now(),
      persona: { id, name: c.name, kind: c.kind, color: c.color, spec: { curated: c.id } },
      transcript: [{ role: 'friend', text: c.greeting }],
    };
    friends[id] = f;
    saveFriends();
    rebuildItems();
  }
  activeId = id;
  view = 'chat';
  typed = '';
  pending = false;
  napping = false;
  sendToken++;
}

function handleChatKey(e) {
  const k = e.key;
  if (k === 'Backspace') { if (typed) { typed = typed.slice(0, -1); Audio.correct(); } return; }
  if (k === 'Enter') { submitMessage(); return; }
  if (k.length === 1) {
    if (pending) return; // let the friend answer before typing the next line
    if (typed.length < MAX_MSG_LEN) { typed += k; Audio.correct(); }
    else { Audio.wrong(); nudgeT = 8; }
  }
}

function submitMessage() {
  if (pending) return;
  const text = typed.trim();
  if (!text) return;
  const f = friends[activeId];
  if (!f) return;

  pushMsg(f, 'you', text);
  typed = '';
  visited = true; // the child engaged — credit the world on exit (hasWon)
  Audio.coin();

  pending = true;
  napping = false;
  const token = ++sendToken;
  const friendId = activeId;
  const window = f.transcript.slice(-SEND_WINDOW).map((m) => ({ role: m.role, text: m.text }));

  sendChat(f.persona.spec, window)
    .then((res) => applyReply(token, friendId, res))
    .catch(() => applyReply(token, friendId, { ok: false }));
}

// applyReply lands a model reply (or the offline fallback) if it is still
// current — discarded if the session stopped or the child switched friends.
function applyReply(token, friendId, res) {
  if (!active || token !== sendToken || friendId !== activeId) return;
  const f = friends[friendId];
  if (!f) { pending = false; return; }
  if (res && res.ok) {
    napping = false;
    pushMsg(f, 'friend', res.reply);
    Audio.correct();
  } else {
    // The friend is napping — gentle scripted warmth, never broken.
    napping = true;
    pushMsg(f, 'friend', offlineReply(f.persona, f.transcript.length));
  }
  pending = false;
}

function pushMsg(f, role, text) {
  f.transcript.push({ role, text: String(text) });
  if (f.transcript.length > MAX_TRANSCRIPT) f.transcript = f.transcript.slice(-MAX_TRANSCRIPT);
  saveFriends();
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function sizeCanvas() {
  if (!canvas) return;
  if (canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
  if (canvas.height !== window.innerHeight) canvas.height = window.innerHeight;
}

function render() {
  if (!active) return;
  sizeCanvas();
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, W, H);
  const vign = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
  vign.addColorStop(0, 'rgba(0,0,0,0)');
  vign.addColorStop(1, 'rgba(6,0,20,0.6)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);

  if (view === 'picker') renderPicker(W, H);
  else if (view === 'make') renderMake(W, H);
  else if (view === 'chat') renderChat(W, H);

  drawScanlines(W, H);
  if (nudgeT > 0) nudgeT--;
  animId = requestAnimationFrame(render);
}

function renderPicker(W, H) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const title = Math.max(15, Math.floor(W * 0.026));
  ctx.font = `${title}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.fg;
  ctx.shadowColor = '#c9a3ff'; ctx.shadowBlur = 12;
  ctx.fillText('YOUR FRIENDS', W / 2, Math.round(H * 0.14));
  ctx.shadowBlur = 0;

  const sub = Math.max(9, Math.floor(W * 0.011));
  ctx.font = `${sub}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.dim;
  ctx.fillText('pick a friend to chat with — or make a new one', W / 2, Math.round(H * 0.21));

  const item = Math.max(12, Math.floor(W * 0.015));
  const tag = Math.max(8, Math.floor(W * 0.0095));
  const startY = Math.round(H * 0.30);
  const stepY = Math.round(H * 0.095);
  items.forEach((it, i) => {
    const y = startY + i * stepY;
    const sel = i === cursor;
    ctx.font = `${item}px "Press Start 2P", monospace`;
    ctx.fillStyle = sel ? it.color : PAL.fg;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = sel ? 10 : 3;
    ctx.globalAlpha = sel ? 1 : 0.72;
    const label = it.type === 'make' ? '+  ' + it.name : (sel ? '> ' : '  ') + it.name;
    ctx.fillText(label, W / 2, y);
    ctx.shadowBlur = 0;
    if (it.blurb) {
      ctx.font = `${tag}px "Press Start 2P", monospace`;
      ctx.fillStyle = PAL.dim;
      ctx.globalAlpha = sel ? 0.9 : 0.45;
      ctx.fillText(it.blurb, W / 2, y + Math.round(item * 1.3));
    }
  });
  ctx.globalAlpha = 1;

  // footer hint (context-sensitive: forget only when a made friend is selected)
  const cur = items[cursor];
  const canForget = cur && cur.type === 'friend' && !cur.curated;
  ctx.font = `${sub}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.dim;
  const hint = canForget
    ? '↑ ↓ CHOOSE  ·  ENTER CHAT  ·  X FORGET  ·  ESC BACK'
    : '↑ ↓ CHOOSE  ·  ENTER / SPACE CHAT  ·  ESC BACK';
  ctx.fillText(hint, W / 2, Math.round(H * 0.9));

  if (forgetId) drawForgetConfirm(W, H);
  ctx.textBaseline = 'alphabetic';
}

function drawForgetConfirm(W, H) {
  ctx.fillStyle = 'rgba(6,0,20,0.86)';
  ctx.fillRect(0, 0, W, H);
  const f = friends[forgetId];
  const name = f ? f.persona.name : 'this friend';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const big = Math.max(13, Math.floor(W * 0.017));
  ctx.font = `${big}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.warn; ctx.shadowColor = PAL.warn; ctx.shadowBlur = 8;
  ctx.fillText('FORGET ' + name + '?', W / 2, Math.round(H * 0.44));
  ctx.shadowBlur = 0;
  const sm = Math.max(10, Math.floor(W * 0.012));
  ctx.font = `${sm}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.fg;
  ctx.fillText('Y — YES, SAY GOODBYE', W / 2, Math.round(H * 0.53));
  ctx.fillStyle = PAL.dim;
  ctx.fillText('N — NO, KEEP MY FRIEND', W / 2, Math.round(H * 0.585));
}

function renderMake(W, H) {
  const step = MAKE_STEPS[makeIdx];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const title = Math.max(14, Math.floor(W * 0.02));
  ctx.font = `${title}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.accent; ctx.shadowColor = PAL.accent; ctx.shadowBlur = 10;
  ctx.fillText('MAKE A FRIEND', W / 2, Math.round(H * 0.16));
  ctx.shadowBlur = 0;

  // step dots
  const dot = Math.max(8, Math.floor(W * 0.009));
  ctx.font = `${dot}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.dim;
  ctx.fillText(MAKE_STEPS.map((_, i) => (i === makeIdx ? '●' : '·')).join(' '), W / 2, Math.round(H * 0.24));

  const q = Math.max(13, Math.floor(W * 0.016));
  ctx.font = `${q}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.fg;
  ctx.fillText(step.prompt, W / 2, Math.round(H * 0.36));

  if (step.type === 'text') {
    const fs = Math.max(16, Math.floor(W * 0.024));
    ctx.font = `${fs}px "Press Start 2P", monospace`;
    const shown = typed || '';
    ctx.fillStyle = nudgeT > 0 ? PAL.warn : PAL.you;
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
    const cursorCh = Math.floor(performance.now() / 500) % 2 === 0 ? '_' : ' ';
    ctx.fillText(shown + cursorCh, W / 2, Math.round(H * 0.5));
    ctx.shadowBlur = 0;
    const sm = Math.max(9, Math.floor(W * 0.011));
    ctx.font = `${sm}px "Press Start 2P", monospace`;
    ctx.fillStyle = PAL.dim;
    const hint = step.optional ? 'type letters  ·  ENTER (or just ENTER to skip)' : 'type letters  ·  ENTER to keep going';
    ctx.fillText(hint, W / 2, Math.round(H * 0.62));
  } else {
    const choices = step.choices;
    const fs = Math.max(13, Math.floor(W * 0.017));
    ctx.font = `${fs}px "Press Start 2P", monospace`;
    const cols = choices.length > 5 ? 2 : 1;
    const perCol = Math.ceil(choices.length / cols);
    choices.forEach((c, i) => {
      const col = Math.floor(i / perCol);
      const row = i % perCol;
      const x = cols === 1 ? W / 2 : W * (0.36 + col * 0.28);
      const y = Math.round(H * 0.46) + row * Math.round(fs * 2.0);
      const sel = i === choiceCursor;
      ctx.fillStyle = sel ? PAL.accent : PAL.fg;
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = sel ? 10 : 0;
      ctx.globalAlpha = sel ? 1 : 0.6;
      ctx.fillText((sel ? '> ' : '  ') + String(c).toUpperCase(), x, y);
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
    const sm = Math.max(9, Math.floor(W * 0.011));
    ctx.font = `${sm}px "Press Start 2P", monospace`;
    ctx.fillStyle = PAL.dim;
    ctx.fillText('↑ ↓ CHOOSE  ·  ENTER to keep going', W / 2, Math.round(H * 0.82));
  }

  ctx.font = `${Math.max(9, Math.floor(W * 0.01))}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.dim;
  ctx.fillText('ESC — back to your friends', W / 2, Math.round(H * 0.92));
  ctx.textBaseline = 'alphabetic';
}

function renderChat(W, H) {
  const f = friends[activeId];
  if (!f) return;
  const color = f.persona.color || PAL.accent;
  const marginX = Math.round(W * 0.06);

  // title bar
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const th = Math.max(13, Math.floor(W * 0.016));
  ctx.font = `${th}px "Press Start 2P", monospace`;
  ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8;
  ctx.fillText(f.persona.name, marginX, Math.round(H * 0.05));
  // Measure the name in the TITLE font (before switching to the smaller tag font),
  // else the tag overlaps the name — the font must match the text being measured.
  const nameW = ctx.measureText(f.persona.name).width;
  ctx.shadowBlur = 0;
  if (napping) {
    ctx.font = `${Math.max(8, Math.floor(W * 0.0095))}px "Press Start 2P", monospace`;
    ctx.fillStyle = PAL.dim;
    ctx.fillText('(napping — still here!)', marginX + nameW + Math.round(th * 1.4), Math.round(H * 0.055));
  }

  // message log
  drawLog(W, H, f, color, marginX);

  // prompt bar
  const fs = Math.max(12, Math.floor(W * 0.015));
  const py = Math.round(H * 0.86);
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillStyle = PAL.dim;
  ctx.fillText('type to ' + f.persona.name + ':', marginX, py - Math.round(fs * 1.7));
  const promptStr = '> ' + typed;
  ctx.fillStyle = nudgeT > 0 ? PAL.warn : PAL.you;
  ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
  ctx.fillText(promptStr, marginX, py);
  const cx = marginX + ctx.measureText(promptStr).width + 2;
  if (!pending && Math.floor(performance.now() / 500) % 2 === 0) ctx.fillRect(cx, py, Math.round(fs * 0.6), fs);
  ctx.shadowBlur = 0;

  // hint
  ctx.font = `${Math.max(9, Math.floor(W * 0.0105))}px "Press Start 2P", monospace`;
  ctx.fillStyle = PAL.dim;
  ctx.fillText('ENTER — send   ·   ESC — back to your friends', marginX, Math.round(H * 0.93));
  ctx.textBaseline = 'alphabetic';
}

function drawLog(W, H, f, color, marginX) {
  const fs = Math.max(12, Math.floor(W * 0.0145));
  const lineH = Math.round(fs * 1.6);
  const topY = Math.round(H * 0.12);
  const bottomY = Math.round(H * 0.78);
  const maxRows = Math.max(1, Math.floor((bottomY - topY) / lineH));
  const bubbleW = W * 0.62;

  ctx.font = `${fs}px "Press Start 2P", monospace`;

  // Build the display rows from the recent transcript, plus a live "thinking" row.
  const recent = f.transcript.slice(-40);
  const rows = []; // { text, who }
  for (const m of recent) {
    const who = m.role === 'you' ? 'you' : 'friend';
    const lines = wrap(m.text, bubbleW, fs);
    lines.forEach((ln) => rows.push({ text: ln, who }));
  }
  if (pending) {
    const dots = '.'.repeat(1 + (Math.floor(performance.now() / 350) % 3));
    rows.push({ text: dots, who: 'friend' });
  }

  const visible = rows.slice(-maxRows);
  ctx.textBaseline = 'top';
  visible.forEach((row, i) => {
    const y = topY + i * lineH;
    if (row.who === 'you') {
      ctx.textAlign = 'right';
      ctx.fillStyle = PAL.you;
      ctx.fillText(row.text, W - marginX, y);
    } else {
      ctx.textAlign = 'left';
      ctx.fillStyle = color;
      ctx.fillText(row.text, marginX, y);
    }
  });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function wrap(str, maxWidth, sz) {
  ctx.font = `${sz}px "Press Start 2P", monospace`;
  const out = [];
  let cur = '';
  for (const w of String(str).split(' ')) {
    let word = w;
    // hard-break a single token wider than the line
    while (ctx.measureText(word).width > maxWidth && word.length > 1) {
      let piece = '';
      for (const ch of word) { if (ctx.measureText(piece + ch).width <= maxWidth) piece += ch; else break; }
      if (!piece) piece = word[0];
      if (cur) { out.push(cur); cur = ''; }
      out.push(piece);
      word = word.slice(piece.length);
    }
    const t = cur ? cur + ' ' + word : word;
    if (ctx.measureText(t).width <= maxWidth || !cur) cur = t;
    else { out.push(cur); cur = word; }
  }
  if (cur) out.push(cur);
  return out.length ? out : [''];
}

function drawScanlines(W, H) {
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}
