// Free Play Mode — "the arcade after graduation."
// Once a player has been through the curriculum, Free Play lets them walk up
// to ANY cabinet with the FULL keyboard and type full sentences. Speed (WPM)
// and accuracy are DISPLAYED, never enforced — no timers, no failure states.
// This file only exports data + pure builder functions; no DOM, no state.

// Full keyboard — every token the engine already knows how to validate.
export const FREEPLAY_KEYS = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  ';', ',', '.', '/',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '-', '=', '[', ']', '\\', '`', "'",
  'Shift', ' ', 'Backspace',
];

// ~40 shared early-reader sentences. Short (15-30 chars), kid-readable,
// capitals + spaces + periods. All characters are valid engine tokens.
export const SENTENCES = [
  'The cat sat on the mat.',
  'I can type fast now.',
  'We all play games.',
  'The sun is up.',
  'You did it again.',
  'Type it like you mean it.',
  'The dog ran in the yard.',
  'She reads every night.',
  'We win as a team.',
  'The sky is blue today.',
  'He jumped over the wall.',
  'Keep your fingers home.',
  'This game is fun.',
  'The bird flew away.',
  'I will try my best.',
  'Practice makes it easy.',
  'The kids like to play.',
  'We walk to school.',
  'The moon glows at night.',
  'Fast fingers win the day.',
  'The frog sat by the pond.',
  'She smiled and waved.',
  'The team scored again.',
  'I like to read books.',
  'The rain fell all day.',
  'We built a tall tower.',
  'The fox ran fast.',
  'Every key has a home.',
  'The game just began.',
  'You can type this now.',
  'The stars came out.',
  'He wrote his name.',
  'The wind blew soft.',
  'We found the last clue.',
  'The train left on time.',
  'She jumped for joy.',
  'The lights turned on.',
  'I typed the whole page.',
  'The world keeps turning.',
  'Good job, keep going.',
];

// 4-6 cabinet-flavored phrases per level (1-25). Era/game-flavored, no
// trademarked character names beyond what the docs already reference.
export const THEMED = {
  1: [
    'The ball never stops.',
    'Break every brick.',
    'Keep the paddle steady.',
    'One more bounce.',
  ],
  2: [
    'The invaders march down.',
    'Fire before they land.',
    'Clear the whole wave.',
    'The sky is full of foes.',
  ],
  3: [
    'Run from the ghosts.',
    'Eat every last dot.',
    'The maze never ends.',
    'Grab the power pellet.',
  ],
  4: [
    'The formation dives fast.',
    'Blast the alien swarm.',
    'The eighth key waits.',
    'Hold the center line.',
  ],
  5: [
    'Flap over the lava.',
    'Joust the rival knight.',
    'Land on solid ground.',
    'The lava glows below.',
  ],
  6: [
    'Climb past the barrels.',
    'Save her from the top.',
    'The girders shake and creak.',
    'One more ladder to go.',
  ],
  7: [
    'The dragon guards the door.',
    'One wrong move ends it.',
    'The knight draws his sword.',
    'Every frame is a picture.',
  ],
  8: [
    'The blocks keep falling.',
    'Clear the whole row.',
    'Stack them nice and tight.',
    'The well is almost full.',
  ],
  9: [
    'Jump over the pipe.',
    'Grab every gold coin.',
    'The castle is close now.',
    'Run past the goomba.',
  ],
  10: [
    'The dungeon holds a key.',
    'Open the locked door.',
    'Q always brings a friend.',
    'The map fills in slowly.',
  ],
  11: [
    'Run fast through the loop.',
    'Grab every gold ring.',
    'The hills go by in a blur.',
    'Speed is the whole point.',
  ],
  12: [
    'Block the next hit.',
    'The crowd roars loudly.',
    'Two fighters, one winner.',
    'Land the final blow.',
  ],
  13: [
    'The island keeps its secrets.',
    'Read every page slowly.',
    'A comma is a breath.',
    'The puzzle waits, patient.',
  ],
  14: [
    'Swing through the jungle.',
    'The barrel launches you far.',
    'Every level ends well.',
    'The vines lead up high.',
  ],
  15: [
    'Catch them all.',
    'Choose your starter well.',
    'The tall grass hides more.',
    'Train hard for the gym.',
  ],
  16: [
    'Build the city up.',
    'Balance the whole budget.',
    'Zone for homes and shops.',
    'Watch the population grow.',
  ],
  17: [
    'The name is Bond.',
    'The mission starts now.',
    'Four players, one screen.',
    'Complete every objective.',
  ],
  18: [
    'Gather wood and gold.',
    'Build the whole empire.',
    'Train troops at the barracks.',
    'The age of kings begins.',
  ],
  19: [
    'Watch the HP bar drop.',
    'The stakes could not be higher.',
    'Every number tells a story.',
    'Save before the next fight.',
  ],
  20: [
    'Hello, world.',
    'The terminal blinks and waits.',
    'Type the first line of code.',
    'Numbers built this whole game.',
  ],
  21: [
    'Names deserve capital letters.',
    'Hold shift, then press the key.',
    'Big letters for a big moment.',
    'Type your own name proudly.',
  ],
  22: [
    'The corner keys complete you.',
    'Every bracket has a partner.',
    'Precision lives in the reach.',
    'The keyboard map is finished.',
  ],
  23: [
    'The tick marks find your pinkies.',
    'Contractions feel more natural.',
    'You are almost fully fluent.',
    'The last small keys unlock.',
  ],
  24: [
    'Type your name in capitals.',
    'This high score is yours.',
    'The board remembers your name.',
    'Shift makes it official.',
  ],
  25: [
    'Backspace is not failure.',
    'Write your very first paragraph.',
    'Every writer edits their work.',
    'Space and backspace complete you.',
  ],
};

// Split a sentence string into engine tokens. Each char is a token;
// uppercase letters stay uppercase (the engine handles Shift), spaces
// become ' ' tokens, punctuation passes through as-is.
function tokenize(sentence) {
  return sentence.split('');
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Returns shuffled char-array patterns for a given level: that cabinet's
// themed phrases first (shuffled), then the shared sentence bank (shuffled).
export function buildFreePlayPatterns(level) {
  const themed = shuffle(THEMED[level] || []);
  const shared = shuffle(SENTENCES);
  return [...themed, ...shared].map(tokenize);
}
