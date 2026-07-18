// ─── Tile worlds — DATA for the big ASCII overhead engine (tileworld.js) ────
//
// Each is a LARGE, gentle, always-solvable overhead world (One Rule — never a
// frustrating maze). Grounded in research/wiki/tech/ascii-overhead-world-
// conventions.md: roughly-a-terminal-screen-sized maps CHAINED MegaZeux-style via
// edge exits, a roguelike lit/dark fog of war (the engine discovers as you go), a
// themed glyph vocabulary well past the old five symbols, and authored riddle
// CREATURES (no LLM, no free text — fixed data) whose gentle, always-solvable
// riddle opens a bonus way. Reaching the far `*` triggers the "surprisingly
// amazing" reveal.
//
// SOLVABILITY CONTRACT (One Rule floor): in every world an open corridor runs the
// full length of row 8 across every screen and straight to the goal, so the goal
// is reachable WITHOUT solving a single riddle or opening a single gate. Riddles
// and gates are always bonus. (Verified by BFS in the build wave — see report.)
//
// map markers: '@' start · '*' goal · '1'..'9' an NPC slot · 'G' a gate;
// every other char is a glyph looked up in `glyphs` (unknown → wall). Rows are
// padded to a rectangle with the world's wallChar, so a short row just grows more
// wall on its right — never place a walkable EDGE-exit tile past the intended width.

// ── THE GLIMMER DEEP — a dark cave that opens into a cavern of crystals ──────
export const GlimmerDeep = {
  id: 'cave',
  title: 'THE GLIMMER DEEP',
  wallChar: '#',
  gates: 'G',
  palette: {
    bg: '#05080e', you: '#ffd23f', glint: '#8fe3ff', accent: '#ffd23f',
    dim: '#4a6a8a', title: '#8fe3ff', floor: '#2a3a4e', wall: '#3a4a5e', friend: '#7fffbf',
  },
  glyphs: {
    '#': { ch: '#', color: '#3a4a5e', walkable: false, opaque: true },
    '.': { ch: '·', color: '#2a3a4e', walkable: true, opaque: false, alpha: 0.45 },
    '~': { ch: '~', color: '#2f6bd0', walkable: false, opaque: false, glow: 4, alpha: 0.85 },
    '"': { ch: '"', color: '#3f8f5a', walkable: true, opaque: false, alpha: 0.8 },
    '^': { ch: '^', color: '#6a7688', walkable: false, opaque: true },
    '%': { ch: '%', color: '#b98fff', walkable: false, opaque: true, glow: 8 },
    ',': { ch: ',', color: '#4a5568', walkable: true, opaque: false, alpha: 0.6 },
    '=': { ch: '=', color: '#b08a5a', walkable: true, opaque: false },
    'o': { ch: 'o', color: '#7fffd4', walkable: true, opaque: false, glow: 8 },
    'G': { ch: '|', color: '#c98a3a', glow: 6 },
  },
  npcs: [
    { slot: 1, char: 'w', color: '#7fffd4', name: 'Glim the glow-worm',
      riddle: 'I sleep in the rock, cold and hard, until a light finds me — then I shine blue and bright. I am what this whole deep is full of. What am I?',
      answers: ['crystal', 'crystals', 'gem', 'gems'],
      hint: 'It shines blue in the dark, and it starts with the letter C.',
      reward: 'Glim glows brighter. "A CRYSTAL — yes! Go deeper. A whole sky of them is waiting for you."' },
    { slot: 2, char: 'x', color: '#8fe3ff', name: 'Newt the cave-newt', gate: 'G',
      riddle: 'I flow in the dark and never rest. I am cold, I am wet, and you crossed me on the bridge. What am I?',
      answers: ['water', 'river', 'stream', 'the river'],
      hint: 'You walked over me on the log bridge — it starts with W.',
      reward: 'Newt claps its little feet. "WATER, of course! Here — I will pull the old gate aside for you."' },
    { slot: 3, char: 't', color: '#c9a3ff', name: 'Sella the stone turtle',
      riddle: 'A rainbow bends across the sky in bands of color. Count them for me — how many colors does a rainbow have?',
      answers: ['seven', '7'],
      hint: 'It is one more than six.',
      reward: 'Sella nods slowly. "Seven. Just so. You count as well as you walk."' },
  ],
  screens: [
    // Screen 0 — THE CAVE MOUTH (east → screen 1)
    { exits: { east: 1 }, map: [
      '##############################################',
      '#@...,,,....^^.....%.......o.....^^....,,....#',
      '#.......^....%%......~~~.........^^..........#',
      '#..^^...........o...~~~~~........,,,....%%...#',
      '#.......%%..........~~~~~~...........o.%%....#',
      '#...1.......^^^.....~~~~~~....o..............#',
      '#...........,,,.....~~~~~........^^..........#',
      '#.....o.........................,,,....o.....#',
      '#.............................................',
      '#......""......===.......%%.......^^.........#',
      '#....""""......===..........o...........%....#',
      '#.....""......===.....^^^........,,,....%%...#',
      '#.........,,,.....%%.........o...............#',
      '#......o.......^^....%%....,,,.....o....%%...#',
      '#....^^.......,,,.........o.....^^...........#',
      '##############################################',
    ] },
    // Screen 1 — THE UNDERGROUND RIVER (west → 0, east → 2). Gate 'G' is a bonus.
    { exits: { west: 0, east: 2 }, map: [
      '##############################################',
      '#.....,,,....~~~~.......%%.......^^....,,....#',
      '#...^^.......~~~~~..........o.........%%.....#',
      '#....o.......~~~~~....===........,,,.........#',
      '#.......%%...~~~~~....===...^^^..............#',
      '#..^^........~~~~.....===........o......%....#',
      '#............~~~~~..........2............%...#',
      '#.....,,,....~~~~~.......GG..................#',
      '............====..............................',
      '#............~~~~~....%%.....,,,....^^.......#',
      '#....o.......~~~~~..........o................#',
      '#.......^^...~~~~.......%%.......,,,....o....#',
      '#............~~~~~...^^..............%%......#',
      '#...,,,......~~~~~.........o.....^^..........#',
      '#.....%......~~~~....,,,.........o......%%...#',
      '##############################################',
    ] },
    // Screen 2 — THE CRYSTAL HALL (west → 1). Goal '*' on the row-8 corridor.
    { exits: { west: 1 }, map: [
      '##############################################',
      '#...%%....%%.....%%%....%%.....%%....%%%.....#',
      '#.%%...%%....%%......%%....%%%.....%%....%%..#',
      '#....%%...%%....%%%....%%....%%.....%%%......#',
      '#.%%....%%....%%....%%%...%%....%%.....%%....#',
      '#...%%....%%%....%%....%%....%%%....%%.......#',
      '#.%%...%%....%%....%%%....%%....%%....%%%....#',
      '#....%%....%%..3.%%....%%%....%%....%%.......#',
      '.........................................*...#',
      '#..%%....%%%....%%....%%....%%%....%%....%%..#',
      '#.%%...%%....%%....%%%....%%....%%....%%%....#',
      '#....%%...%%%....%%....%%....%%.....%%.......#',
      '#.%%....%%....%%....%%%...%%....%%%....%%....#',
      '#...%%....%%....%%%....%%....%%....%%....%%..#',
      '#.%%...%%%....%%....%%....%%%....%%....%%%...#',
      '##############################################',
    ] },
  ],
  intro: 'You hold up your torch. The Glimmer Deep is dark and wide — but something glints, far off to the east. Type a direction to move: up, down, left, right.',
  wallLine: 'Cold rock. You feel along the wall for another way.',
  crossLine: 'The passage opens into a new cavern.',
  reveal: {
    kind: 'crystals',
    colors: ['#8fe3ff', '#c9a3ff', '#ffffff', '#7fffd4', '#ffd6f5', '#a3d5ff'],
    message: 'You step out onto a ledge — and stop, and stare. The Deep OPENS into a vast cavern, its walls and ceiling crusted with glowing crystals, a whole night sky brought underground. It was here the entire time, waiting for you to walk all this way and find it.',
  },
};

// ── THE WHISPERWOOD — an old forest that opens into a glade of fireflies ─────
export const Whisperwood = {
  id: 'forest',
  title: 'THE WHISPERWOOD',
  wallChar: 'T',
  gates: 'G',
  palette: {
    bg: '#040a06', you: '#ffd23f', glint: '#eaff8f', accent: '#eaff8f',
    dim: '#5a7a4a', title: '#a3e08f', floor: '#16281a', wall: '#1e3a22', friend: '#ffb84d',
  },
  glyphs: {
    'T': { ch: 'T', color: '#2f6b3a', walkable: false, opaque: true },
    '.': { ch: '·', color: '#4a3a24', walkable: true, opaque: false, alpha: 0.5 },
    '"': { ch: '"', color: '#3f8f4a', walkable: true, opaque: false, alpha: 0.8 },
    '~': { ch: '~', color: '#3f8fd0', walkable: false, opaque: false, glow: 4, alpha: 0.85 },
    '^': { ch: '^', color: '#2a6b34', walkable: false, opaque: true },
    'f': { ch: 'f', color: '#ff7fb0', walkable: true, opaque: false, glow: 6 },
    ',': { ch: ',', color: '#b0812a', walkable: true, opaque: false, alpha: 0.6 },
    '=': { ch: '=', color: '#7a5a34', walkable: true, opaque: false },
    'o': { ch: 'o', color: '#e8552a', walkable: true, opaque: false, glow: 6 },
    'G': { ch: '|', color: '#8a6b3a', glow: 5 },
  },
  npcs: [
    { slot: 1, char: 'v', color: '#ffb84d', name: 'Old Owl',
      riddle: 'I sit in the tall trees and I say WHO-WHO in the night. I can turn my head all the way around. What bird am I?',
      answers: ['owl', 'an owl', 'a owl'],
      hint: 'You are looking right at one — a wise night bird. It starts with O.',
      reward: 'Old Owl blinks one slow eye. "Whoo — an OWL, yes. Walk on, small one. The glade is glad tonight."' },
    { slot: 2, char: 'F', color: '#e8813a', name: 'Rusty the fox', gate: 'G',
      riddle: 'I am orange with a big bushy tail. I am quick and I am sly, and I live in the wood. What animal am I?',
      answers: ['fox', 'a fox'],
      hint: 'You are talking to one right now — it starts with F.',
      reward: 'Rusty grins and swishes his tail. "A FOX! Ha! Come — I will nose the brambles apart for you."' },
    { slot: 3, char: 'o', color: '#eaff8f', name: 'Blink the firefly',
      riddle: 'We are tiny lights that dance in the dark. We blink on and off, on and off, all through the glade. What are we?',
      answers: ['fireflies', 'firefly', 'fire flies', 'bugs', 'lights'],
      hint: 'They will fill the glade you are about to find — it starts with F.',
      reward: 'Blink spins in a happy circle. "FIREFLIES! You already knew us. Come and see."' },
  ],
  screens: [
    // Screen 0 — THE FOREST EDGE (east → 1)
    { exits: { east: 1 }, map: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T@..,,,....TT.....f.......o.....^^....,,....fT',
      'T.......^....""......TTT.........^^..........T',
      'T..^^...........o...TTTTT........,,,....ff...T',
      'T.......""...........TTT.............o.ff....T',
      'T...1.......^^^......TT.......o..............T',
      'T...........,,,.....TTTT.........^^..........T',
      'T.....o.........................,,,....o.....T',
      'T.............................................',
      'T......""......===.......ff.......^^.........T',
      'T....""""......===..........o...........f....T',
      'T.....""......===.....^^^........,,,....ff...T',
      'T.........,,,.....ff.........o...............T',
      'T......o.......^^....ff....,,,.....o....ff...T',
      'T....^^.......,,,.........o.....^^...........T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ] },
    // Screen 1 — THE BROOK (west → 0, east → 2). Bramble gate 'G' is a bonus.
    { exits: { west: 0, east: 2 }, map: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T.....,,,....~~~~.......ff.......^^....,,....T',
      'T...^^.......~~~~~..........o.........ff.....T',
      'T....o.......~~~~~....===........,,,.........T',
      'T.......ff...~~~~~....===...^^^..............T',
      'T..^^........~~~~.....===........o......f....T',
      'T............~~~~~..........2............f...T',
      'T.....,,,....~~~~~.......GG..................T',
      '............====..............................',
      'T............~~~~~....ff.....,,,....^^.......T',
      'T....o.......~~~~~..........o................T',
      'T.......^^...~~~~.......ff.......,,,....o....T',
      'T............~~~~~...^^..............ff......T',
      'T...,,,......~~~~~.........o.....^^..........T',
      'T.....f......~~~~....,,,.........o......ff...T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ] },
    // Screen 2 — THE GLADE (west → 1). Goal '*' on the row-8 corridor.
    { exits: { west: 1 }, map: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'T..ff...."".....fff...."".....ff...."""......T',
      'T."".."".....""......""...."""......"".."f...T',
      'T....ff..."".....fff...."".....""....fff.....T',
      'T."f....""....""...."""....""....""....ff....T',
      'T...ff...."""....""....ff....""".....ff......T',
      'T.f"...ff....""....fff....""....""....fff....T',
      'T....ff...."".3."".....fff....""....""......fT',
      '..........................................*..T',
      'T..ff...."""...."".....""....."""....ff.."f..T',
      'T."".."".....""...."""....""....""....fff....T',
      'T....ff..."""....""....ff....""....."".......T',
      'T."f....""....""...."""....""....."""....ff..T',
      'T...ff...."".....fff...."".....ff....ff.."f..T',
      'T."".."""....""....""....."""....""....fff...T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ] },
  ],
  intro: 'The wood is old and hushed, green light falling through the leaves. Something glows softly far to the east, deep among the trees. Type a direction to move: up, down, left, right.',
  wallLine: 'Trees, close and green. You find a gap another way.',
  crossLine: 'The trees thin, and a new part of the wood opens ahead.',
  reveal: {
    kind: 'fireflies',
    colors: ['#eaff8f', '#fff6a3', '#c9ffb0', '#ffe08f'],
    message: 'The trees part — and you step into a moonlit glade. The air fills with drifting fireflies, a slow galaxy of little lights rising all around you. The whole wood, it seems, is glad you came so far to find it.',
  },
};
