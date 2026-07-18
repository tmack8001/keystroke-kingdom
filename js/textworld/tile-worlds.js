// ─── Tile worlds — DATA for the ASCII overhead engine (tileworld.js) ────────
//
// Each is a small, gentle, solvable overhead world (One Rule — never a
// frustrating maze): the left column and the bottom passage are always open, so
// "south, then east" always reaches the far `*`. Reaching it triggers that
// world's "surprisingly amazing" reveal. Names are placeholders-to-taste — easy
// to change (they flow through to the hub label automatically).

// THE GLIMMER DEEP — a dark cave that opens into a cavern of crystals.
export const GlimmerDeep = {
  id: 'cave',
  title: 'THE GLIMMER DEEP',
  wallChar: '#',
  palette: { wall: '#4a5a6b', floor: '#151d28', you: '#ffd23f', friend: '#7fffbf', glint: '#8fe3ff', bg: '#05080e', accent: '#ffd23f' },
  map: [
    '###############',
    '#@............#',
    '#.#.#.#.#.#.#.#',
    '#.#.#.#.#.#.#.#',
    '#.....k.......#',
    '#.#.#.#.#.#.#.#',
    '#.#.#.#.#.#.#.#',
    '#............*#',
    '###############',
  ],
  intro: 'You hold up your torch. The deep is dark and still — but something glints, far off. Move with the direction keys.',
  companionLine: 'The other explorer grins in the torchlight. "You feel it too? Keep going — it\'s close."',
  wallLine: 'Rock. You feel along the wall for another way.',
  reveal: {
    kind: 'crystals',
    colors: ['#8fe3ff', '#c9a3ff', '#ffffff', '#7fffd4', '#ffd6f5', '#a3d5ff'],
    message: 'You squeeze through a narrow gap — and stop, and stare. The deep OPENS into a vast cavern, its walls and ceiling crusted with glowing crystals, like a whole night sky brought underground. It was here the whole time — waiting for you to find it.',
  },
};

// THE WHISPERWOOD — an old forest that opens into a moonlit glade of fireflies.
export const Whisperwood = {
  id: 'forest',
  title: 'THE WHISPERWOOD',
  wallChar: '#',
  palette: { wall: '#2f6b3a', floor: '#12240f', you: '#ffd23f', friend: '#ffb84d', glint: '#eaff8f', bg: '#040a06', accent: '#eaff8f' },
  map: [
    '###############',
    '#@............#',
    '#.###..###....#',
    '#.....k.......#',
    '#..##...##....#',
    '#.###..###....#',
    '#..##...##....#',
    '#............*#',
    '###############',
  ],
  intro: 'The wood is old and hushed, green light falling through the leaves. Something glows softly, deep among the trees. Move with the direction keys.',
  companionLine: 'A little fox falls into step beside you, tail high. It glances up as if to say: this way.',
  wallLine: 'Trees, close and green. You find a gap another way.',
  reveal: {
    kind: 'fireflies',
    colors: ['#eaff8f', '#fff6a3', '#c9ffb0', '#ffe08f'],
    message: 'The trees part — and you step into a moonlit glade. The air fills with drifting fireflies, a slow galaxy of little lights rising all around you. The whole wood seems glad you came.',
  },
};
