// ─── The Green Dragon — a text world (Act 6, first cabinet) ─────────────────
//
// Pure DATA consumed by js/textworld/engine.js. This is the "first room" slice
// (docs/ROADMAP.md §2): a short, warm, typed-command walk to a FRIENDLY dragon.
//
// Grounded in research/wiki/games/legend-of-the-red-dragon.md (LORD, 1989) and
// its "Green Dragon" web descendant — the Forest, a fellow-traveler at the Inn,
// the Dragon as the goal — but with LORD's flirting/PvP/permadeath STRIPPED per
// the One Rule (product.md). You can never lose, never die; you can only arrive.
// The literal name "Green Dragon" is Trevor's own childhood memory and is kept.
//
// Command-authoring rule (engine contract): within a room, no offered command's
// text may be a prefix of another's (so an exact match can auto-fire). Keep
// command text lowercase, plain, no leading/trailing spaces.

export const GreenDragon = {
  id: 'greendragon',
  title: 'THE GREEN DRAGON',
  palette: { fg: '#4fe08a', dim: '#1f7a45', bg: '#00140a', accent: '#ffd23f' },
  start: 'clearing',

  intro: [
    'THE GREEN DRAGON',
    '',
    'You typed your way to the whole keyboard. Now the letters open a door.',
    'Somewhere ahead, something vast and kind is breathing.',
    '',
  ],

  outro: [
    '',
    'The great head dips low, close enough to warm your face.',
    '"You READ your way here," the dragon rumbles, gentle as a hearth.',
    '"That is the oldest magic there is."',
    'You are not afraid. You never were.',
    '',
    '* THE GREEN DRAGON — you found it *',
  ],

  goal: (w) => w.flag('greeted-dragon'),

  rooms: {
    clearing: {
      title: 'THE FOREST CLEARING',
      desc: (w) => [
        'Sun falls in coins through the leaves.',
        'A dirt path leads NORTH into the trees.',
        w.has('lamp')
          ? 'You carry a small brass LAMP, humming and warm.'
          : 'A brass LAMP rests on a mossy stone, waiting.',
      ],
      commands: [
        { text: 'look', run: (w) => w.describe() },
        {
          text: 'take lamp',
          when: (w) => !w.has('lamp'),
          run: (w) => {
            w.take('lamp');
            w.say('You lift the LAMP. It is warm, and hums a little, as if glad to be carried.');
          },
        },
        { text: 'go north', run: (w) => w.go('brook') },
      ],
    },

    brook: {
      title: 'THE SINGING BROOK',
      desc: (w) => [
        'A clear brook chuckles over stones. A little INN leans by the water.',
        w.flag('met-badger')
          ? 'The BADGER in the red scarf walks beside you now, whistling.'
          : 'A round BADGER in a red scarf sits on the step, warming his paws.',
        'The path goes NORTH, toward a dark hill.',
      ],
      commands: [
        { text: 'look', run: (w) => w.describe() },
        {
          text: 'talk badger',
          when: (w) => !w.flag('met-badger'),
          run: (w) => {
            w.setFlag('met-badger');
            w.say('The badger looks up. "Off to see the Green Dragon? Grand!"');
            w.say('"I\'ll walk a while with you. No one should go alone."');
          },
        },
        { text: 'go north', run: (w) => w.go('cavemouth') },
      ],
    },

    cavemouth: {
      title: 'THE MOUTH OF THE HILL',
      desc: (w) => [
        'The hill opens into a wide, quiet cave. Cool air breathes out of it.',
        w.flag('lamp-lit')
          ? 'Your lamp throws green-gold light down a friendly, curving hall.'
          : (w.has('lamp')
              ? 'It is dark inside. Your LAMP could push the dark back.'
              : 'It is dark inside — but the dark here feels sleepy, not scary.'),
        'You could GO IN.',
      ],
      commands: [
        { text: 'look', run: (w) => w.describe() },
        {
          text: 'light lamp',
          when: (w) => w.has('lamp') && !w.flag('lamp-lit'),
          run: (w) => {
            w.setFlag('lamp-lit');
            w.say('You raise the lamp. Light spills down the hall, and the cave breathes out, warm.');
          },
        },
        { text: 'go in', run: (w) => w.go('hall') },
      ],
    },

    hall: {
      title: 'THE DRAGON HALL',
      desc: () => [
        'The hall opens into a vast, warm chamber.',
        'There, curled like a green hill, is the DRAGON — enormous, gentle,',
        'its scales the colour of deep summer leaves. Its eyes are two soft lamps.',
        'It watches you the way a grandparent watches a child cross a room.',
      ],
      commands: [
        { text: 'look', run: (w) => w.describe() },
        {
          text: 'give lamp',
          when: (w) => w.has('lamp'),
          run: (w) => {
            w.drop('lamp');
            w.say('You hold up the little lamp. The dragon huffs, pleased, and its own eyes');
            w.say('glow a shade brighter — a small light answered by a great one.');
          },
        },
        {
          text: 'greet dragon',
          run: (w) => {
            w.setFlag('greeted-dragon');
            if (w.flag('met-badger')) w.say('The badger tips his scarf. "Told you," he whispers.');
            w.say('You take a breath, and say hello to the Green Dragon.');
          },
        },
      ],
    },
  },
};
