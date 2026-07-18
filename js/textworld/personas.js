// ─── IM-friend personas & the make-a-friend flow (Act 6, world 5) ──────────
//
// Pure DATA + tiny helpers for the IM-friend (js/textworld/imfriend.js). No DOM,
// no canvas, no network — so it is safe to import anywhere and easy to unit test.
//
// Two kinds of friend:
//   • CURATED (PIXEL, SPROUT) — shippable characters. This file holds only their
//     DISPLAY metadata (name, colour, greeting, nap lines). Their PERSONALITY
//     lives SERVER-SIDE (main.go curatedPersonas): the client sends the curated
//     KEY only, so a tampered client can't reshape a curated friend.
//   • PLAYER-MADE — the child NAMES a friend, says WHAT it is, WHAT it loves, and
//     whether it's silly/gentle/brave (handoff §3). Those answers assemble a
//     persona SPEC the server composes into a system prompt.
//
// SECURITY (.claude/rules/security.md rules 3,7): the free-typed NAME and LOVES
// fields are the wing's first untrusted-input surface. validateName/validateLoves
// allowlist them to letters + single spaces and cap length BEFORE they ever reach
// a prompt — the same allowlist the server re-applies (never trust the client).
// KIND and TEMPERAMENT are FIXED choice lists (no free text at all).

// ─── Curated friends (display metadata only) ────────────────────────────────
// `spec` is exactly what imfriend sends to /api/chat for this friend: a curated
// key. `nap` lines are the graceful-offline warmth shown when Ollama is asleep.
export const CURATED = [
  {
    id: 'pixel',
    name: 'PIXEL',
    kind: 'arcade robot',
    color: '#7fd0ff',
    blurb: 'a chirpy robot who loves letters',
    greeting: 'BEEP BOOP! Hi hi! I am PIXEL. I LOVE letters! What is your favorite one?',
    nap: [
      'BEEP... I am charging up. But YOU can still type to me!',
      'Zzz-zzt... type a word and I will dream about it!',
      'My battery is low. Tell me the best thing you did today!',
      'Boop. I am resting my lights. What should we play next?',
    ],
    spec: { curated: 'pixel' },
  },
  {
    id: 'sprout',
    name: 'SPROUT',
    kind: 'little plant',
    color: '#8fe08a',
    blurb: 'a gentle plant, slowly growing',
    greeting: 'Oh, hello little friend. I am SPROUT. I grow a bit every day. What did you see today?',
    nap: [
      'I am resting in the sun. Keep typing — I can still hear you.',
      'mmm... a quiet little nap. Tell me about your day.',
      'I am growing slowly. Type to me and I will wiggle a leaf.',
      'The soil is cozy today. What makes YOU happy?',
    ],
    spec: { curated: 'sprout' },
  },
];

export function curatedById(id) {
  return CURATED.find((c) => c.id === id) || null;
}

// ─── The make-a-friend Q&A schema ───────────────────────────────────────────
// Four steps. NAME and LOVES are free-typed (validated); KIND and TEMPERAMENT are
// fixed choice lists chosen with the arrows (no free text — safe by construction).

export const KIND_CHOICES = [
  'puppy', 'kitten', 'dragon', 'robot', 'bunny', 'bear', 'bird', 'plant', 'star', 'fish',
];

export const TEMPERAMENT_CHOICES = [
  { id: 'silly', label: 'SILLY' },
  { id: 'gentle', label: 'GENTLE' },
  { id: 'brave', label: 'BRAVE' },
];

// A palette of friendly colours; a made friend is assigned one by creation order
// so the picker/chat can tint it (purely cosmetic).
export const FRIEND_COLORS = ['#ffb3d1', '#ffd23f', '#9fe0ff', '#b6ff9c', '#c9a3ff', '#ff9c6b'];

// The make-a-friend step definitions (imfriend renders these). `type` drives the
// input mode: 'text' → validated free typing; 'choice' → arrow-select from list.
export const MAKE_STEPS = [
  { key: 'name', type: 'text', prompt: "What is your friend's name?", cap: 16 },
  { key: 'kind', type: 'choice', prompt: 'What is your friend?', choices: KIND_CHOICES },
  { key: 'loves', type: 'text', prompt: 'What does your friend love?', cap: 24, optional: true },
  { key: 'temperament', type: 'choice', prompt: 'What is your friend like?', choices: TEMPERAMENT_CHOICES.map((t) => t.label) },
];

// ─── Free-text field validation (mirrors main.go sanitizeChatField) ─────────
// Allowlist letters + single spaces; collapse runs; trim; cap. Returns a cleaned
// string ('' when nothing survives — callers apply their own fallback).
export function sanitizeField(raw, cap) {
  const only = String(raw == null ? '' : raw).replace(/[^a-zA-Z ]+/g, ' ');
  const collapsed = only.replace(/\s+/g, ' ').trim();
  return collapsed.length > cap ? collapsed.slice(0, cap).trim() : collapsed;
}

export function validateName(raw) {
  const n = sanitizeField(raw, 16);
  return n || 'Buddy';
}

export function validateLoves(raw) {
  return sanitizeField(raw, 24); // optional — '' is fine
}

// assembleFriend turns a completed make-a-friend draft into a stored friend
// object. `spec` is the wire payload the server composes into a system prompt;
// the display fields (name, color, kind) are for the picker/chat UI. `id` and
// `createdAt` are supplied by the caller (imfriend, which owns persistence).
export function assembleFriend(draft, id, createdAt, colorIndex) {
  const name = validateName(draft.name);
  const kind = sanitizeField(draft.kind, 24) || 'friend';
  const loves = validateLoves(draft.loves);
  const temperament = TEMPERAMENT_CHOICES.some((t) => t.id === draft.temperament)
    ? draft.temperament
    : 'gentle';
  return {
    id,
    createdAt,
    persona: {
      id,
      name,
      kind,
      color: FRIEND_COLORS[colorIndex % FRIEND_COLORS.length],
      spec: { name, kind, loves, temperament },
    },
    transcript: [],
  };
}

// offlineReply picks a gentle, in-character "napping" line for a friend when the
// model is unavailable — curated friends use their authored `nap` set; a
// player-made friend gets a warm generic line woven with its own name. Always
// celebrates the child's typing; never reads as broken (handoff §3).
const GENERIC_NAP = [
  (name) => `${name} gives a happy little wiggle! I love it when you type to me.`,
  (name) => `${name} is having a tiny nap, but I heard you. What else?`,
  (name) => `Zzz... ${name} is dreaming of your words. Tell me more!`,
  (name) => `${name} is so glad you came to visit. What should we do?`,
];

export function offlineReply(persona, seed) {
  const curated = persona && persona.spec && persona.spec.curated
    ? curatedById(persona.spec.curated)
    : null;
  if (curated && curated.nap.length) {
    return curated.nap[seed % curated.nap.length];
  }
  const name = (persona && persona.name) || 'Buddy';
  return GENERIC_NAP[seed % GENERIC_NAP.length](name);
}

// greetingFor returns the friend's opening line (curated authored greeting, or a
// warm generic hello for a player-made friend) — shown as the first friend
// message the very first time a friend is opened.
export function greetingFor(persona) {
  const curated = persona && persona.spec && persona.spec.curated
    ? curatedById(persona.spec.curated)
    : null;
  if (curated) return curated.greeting;
  const name = (persona && persona.name) || 'Buddy';
  return `Hi! I am ${name}. I am so happy you made me. What do you want to talk about?`;
}
