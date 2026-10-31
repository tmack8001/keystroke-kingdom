// ─── The Green Dragon — a text world (Act 6, first cabinet) ─────────────────
//
// Pure DATA consumed by js/textworld/engine.js. A short, warm, TYPED-command walk
// to a friendly dragon — now with a cast of riddling creatures along the way, so
// all three Text Worlds follow the SAME pattern (Trevor, 2026-07-18): named
// characters who pose a POOL of logic / word-play puzzles that rotates on each
// ask ("different each time"). Riddles are always BONUS — they never set the goal.
//
// EVERYTHING IS TYPED (Trevor, 2026-07-18): this is a learn-to-type game first,
// an adventure second. The guided model is "choose which reply, then TYPE the
// sentence/action" — you pick from the offered replies by typing one out in full;
// nothing is ever selected with a single keypress. A riddle answer is typed the
// same way (see engine.js riddle sub-mode). So a character interaction is a
// typing rep, never a menu.
//
// Grounded in research/wiki/games/legend-of-the-red-dragon.md (LORD, 1989) and its
// "Green Dragon" web descendant — the Forest, fellow-travelers, the Dragon as the
// goal — with LORD's flirting/PvP/permadeath STRIPPED per the One Rule (you can
// never lose, never die; you can only arrive). The riddles are sourced + citation-
// verified in research/act6-riddle-bank.md (Tolkien's Riddles in the Dark, the
// ONE→GONE trick, Alice's raven, Grace-Hopper-adjacent tech winks). Every answer
// is a single letters-only word (engine.js allowlists a-z only for answers).
//
// Command-authoring rule (engine contract): within a room, no offered command's
// text may be a prefix of another's (so an exact match can auto-fire). Keep command
// text lowercase, plain, no leading/trailing spaces. A command with an `ask` field
// drops into the riddle sub-mode instead of running to completion — those are
// BONUS and never on the golden path (the win still needs only the plain commands).

// ─── The riddling creatures (each: id + name + a rotating pool) ──────────────

const FERN = {
  id: 'fern', name: 'Fern the wood-sprite',
  riddles: [
    // ORDER MATTERS: the first riddle is the first one a child ever meets in this
    // wing. It used to be the seven-bags-seven-cats trick, which the 2026-10-30
    // explorer playtest (8-9 years old) found too hard for a first meeting; Humpty
    // Dumpty (research/act6-riddle-bank.md A10) now opens, and St Ives (A8) waits
    // for a return visit. All three are unchanged — only the rotation order moved.
    { riddle: 'I sat high on a wall, round and smooth, until I had a great fall — and nobody could ever put me together again. What was I?',
      answers: ['egg', 'eggs'],
      hint: 'Humpty Dumpty was one of me. It starts with E.',
      reward: 'Fern giggles. "An EGG! Poor Humpty. Good thing you climb walls so much better."' },
    { riddle: 'I show up once in a minute, twice in a moment, but never once in a thousand years. What letter am I?',
      answers: ['m'],
      hint: 'Look closely at the spelling of the word "minute."',
      reward: 'Fern claps twice. "The letter M! Sneaky, sneaky. Most travelers never look at the letters themselves."' },
    { riddle: 'As I walked to town I met a traveler with seven bags, and in each bag seven cats, and with each cat seven kittens. But only I was going to town. How many of us were truly going?',
      answers: ['one'],
      hint: 'Read it again — only ONE of us is actually going anywhere. It starts with O.',
      reward: 'Fern cackles and spins in the air. "Just ONE! Everybody counts the cats. Nobody ever counts right."' },
  ],
};

const BADGER = {
  id: 'badger', name: 'The badger',
  riddles: [
    { riddle: 'I have cities but no houses, forests but no trees, and rivers but no water. What am I?',
      answers: ['map', 'maps'],
      hint: 'A traveler like me always carries one. It starts with M.',
      reward: 'The badger unrolls a crinkled old page. "A MAP, exactly. Every hoard needs one — even a dragon\'s."' },
    { riddle: 'Here is a bit of word-magic: how do you make the number ONE disappear completely? Add just one letter to the very front of it.',
      answers: ['gone'],
      hint: 'Put a G at the front of the word "one" and read it again.',
      reward: 'The badger snaps his paw, and a coin vanishes. "GONE! Works every time — with words AND with coins."' },
    { riddle: 'In the very first computer adventure game ever made, one strange five-letter word did absolutely nothing — but everyone typed it anyway. What is the word?',
      answers: ['xyzzy'],
      hint: 'It is not a real word at all — just five letters in a row, starting with X.',
      reward: 'The badger snorts, amused. "XYZZY. Nothing happens — every single time. And yet here you are, having typed it."' },
  ],
};

const ASTRA = {
  id: 'astra', name: 'Astra the unicorn',
  riddles: [
    { riddle: 'I have no voice, but I cry through the branches. I have no wings, but I flutter every leaf. I have no teeth, but I can bite your cheeks on a cold day. What am I?',
      answers: ['wind', 'breeze'],
      hint: 'It is moving the leaves above you right now. It starts with W.',
      reward: 'Astra tosses her mane, and the trees answer. "The WIND — you heard it before I even finished asking."' },
    { riddle: 'You cannot see me, touch me, hear me, or smell me — yet I am everywhere the light has not reached. What am I?',
      answers: ['dark', 'darkness', 'night'],
      hint: 'It is what your lamp is pushing gently back. It starts with D.',
      reward: 'Astra\'s horn kindles a soft glow. "The DARK — and you were not afraid of it. Good."' },
    { riddle: 'I speak without a mouth and hear without ears. I have no body, but I come alive whenever you call out on a hillside. What am I?',
      answers: ['echo', 'echoes'],
      hint: 'Shout hello across a valley and listen for what shouts it back. It starts with E.',
      reward: 'Astra answers in your own voice. "An ECHO — how lovely. Walk beside me a while."' },
  ],
};

const QUILL = {
  id: 'quill', name: 'Quill the raven',
  riddles: [
    { riddle: 'Long ago, at a very silly tea party, a Hatter asked why I was like a writing desk — and then admitted he had no idea himself! What kind of black, clever bird am I?',
      answers: ['raven', 'crow'],
      hint: 'I am perched right above the scrolls, black feathers and all. I start with R.',
      reward: 'Quill ruffles his feathers, delighted. "A RAVEN! Correct — and still no one has ever answered the Hatter\'s actual riddle. Not even me."' },
    { riddle: 'I have words but I never speak, and pages but I am not a tree. What am I?',
      answers: ['book', 'books'],
      hint: 'You are reading one right now, in a way. It starts with B.',
      reward: 'Quill taps a claw on an old leather cover. "A BOOK. Every good hoard has a library too."' },
    { riddle: 'Every treasure hunter knows something waits at the end of a rainbow. But the real answer is not gold — it is just one letter. Which letter?',
      answers: ['w'],
      hint: 'Look at the very last letter of the word "rainbow."',
      reward: 'Quill tilts his head. "The letter W. Not gold — but I will admit, it is a very good trick."' },
  ],
};

const DRAGON = {
  id: 'dragon', name: 'The Green Dragon',
  riddles: [
    { riddle: 'I eat up birds and beasts and trees, and even the tallest mountain, bite by bite — and nothing can ever hide from me. I have swallowed every dragon who lived before you. What am I?',
      answers: ['time', 'years'],
      hint: 'You cannot see me or hold me, but you always know when I have passed. I start with T.',
      reward: 'The old Dragon\'s eyes glow low and warm. "TIME," it rumbles. "Even I must mind it. Well answered, small one."' },
    { riddle: 'Almost every new computer program says one word first, before it does anything else at all. It is the very first thing this whole arcade\'s hidden computer ever said to you, too. What is the word?',
      answers: ['hello', 'hi'],
      hint: 'It is the friendliest word there is. It starts with H.',
      reward: 'The Dragon lifts its great head. "HELLO to you too. Every good story starts right there."' },
    { riddle: 'In an old movie, a giant computer once asked one thing before it did anything else at all: "Shall we play a..." what?',
      answers: ['game', 'games'],
      hint: 'It is exactly what we have been doing this whole time. It starts with G.',
      reward: 'The Dragon\'s eyes glint with mischief. "A GAME. Always. Shall we play another?"' },
  ],
};

export const GreenDragon = {
  id: 'greendragon',
  title: 'THE GREEN DRAGON',
  palette: { fg: '#4fe08a', dim: '#1f7a45', hint: '#2f9e5c', bg: '#00140a', accent: '#ffd23f' },  // hint 5.6:1 on bg
  start: 'clearing',

  intro: [
    'THE GREEN DRAGON',
    '',
    'You typed your way to the whole keyboard. Now the letters open a door.',
    'Somewhere ahead, something vast and kind is breathing.',
    'Type an action to play — the wood is full of friends who love a good riddle.',
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
        'A tiny green WOOD-SPRITE named Fern darts between the ferns, itching to ask you a riddle.',
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
        // "meet the sprite" (not "talk to…"): the start room's only when-gated
        // command is "take lamp" (t), and INV-43 probes it by asserting no OTHER
        // start-room command begins with 't' — so the riddler here deliberately
        // avoids a 't' verb. (Later rooms use "talk to…"/"ask…" freely.)
        { text: 'meet the sprite', ask: FERN },
        { text: 'go north', run: (w) => w.go('brook') },
      ],
    },

    brook: {
      title: 'THE SINGING BROOK',
      desc: (w) => [
        'A clear brook chuckles over stones. A little INN leans by the water.',
        w.flag('met-badger')
          ? 'The BADGER in the red scarf walks beside you now, whistling — ready with a riddle if you ASK.'
          : 'A round BADGER in a red scarf sits on the step, warming his paws.',
        'The path goes NORTH, toward a mossy glade.',
      ],
      commands: [
        { text: 'look', run: (w) => w.describe() },
        {
          text: 'talk to the badger',
          when: (w) => !w.flag('met-badger'),
          run: (w) => {
            w.setFlag('met-badger');
            w.say('The badger looks up. "Off to see the Green Dragon? Grand!"');
            w.say('"I\'ll walk a while with you. No one should go alone — and I do love a riddle."');
          },
        },
        { text: 'ask the badger', when: (w) => w.flag('met-badger'), ask: BADGER },
        { text: 'go north', run: (w) => w.go('glade') },
      ],
    },

    glade: {
      title: 'THE MOSSY GLADE',
      desc: (w) => [
        'A ring of soft moss glows in a shaft of green light. The air is very still.',
        w.flag('met-unicorn')
          ? 'ASTRA the unicorn walks with you now, her horn a soft lantern — ASK her for a riddle any time.'
          : 'A white UNICORN stands in the middle of the ring, watching you with kind, dark eyes.',
        'The path climbs NORTH, toward the mouth of a hill.',
      ],
      commands: [
        { text: 'look', run: (w) => w.describe() },
        {
          text: 'talk to the unicorn',
          when: (w) => !w.flag('met-unicorn'),
          run: (w) => {
            w.setFlag('met-unicorn');
            w.say('The unicorn dips her head. "Well met, small traveler. I am Astra."');
            w.say('"The wood told me you were coming. May I walk with you? I have riddles to trade."');
          },
        },
        { text: 'ask the unicorn', when: (w) => w.flag('met-unicorn'), ask: ASTRA },
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
        'A shabby old RAVEN named Quill perches by the entrance, guarding a shelf of scrolls.',
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
        { text: 'talk to the raven', ask: QUILL },
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
        'You could ASK the dragon a riddle, or simply GREET it.',
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
        { text: 'ask the dragon', ask: DRAGON },
        {
          text: 'greet the dragon',
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
