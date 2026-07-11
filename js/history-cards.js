// History Cards — "picked up off the arcade floor."
// Hacker/computing history woven into the curriculum. Each carded level has
// exactly one "moment word" — typeable with only that level's unlocked keys —
// tied to a real moment in computing history. The word is spliced into the
// level's pattern list like any other pattern (see main.js startGame). Typing
// it only ever triggers an ambient sparkle mid-play; the educational card
// itself is revealed later, at the level-complete overlay — the game's One
// Rule is that flow is never interrupted, so nothing about this feature ever
// pauses or gates play.
//
// This file only exports data + pure helpers — no DOM, no state (mirrors the
// shape of freeplay.js).

export const HISTORY_CARDS = {
  4: {
    word: 'ada',
    title: 'ADA LOVELACE',
    year: '1843',
    fact: "Ada Lovelace wrote the very first computer program — more than 100 years before computers existed. You just typed the first programmer's name.",
  },
  5: {
    word: 'hal',
    title: 'HAL 9000',
    year: '1968',
    fact: 'The most famous movie computer ever. HAL could talk, play chess, and read lips. Real computers were still learning to add.',
  },
  8: {
    word: 'hedy',
    title: 'HEDY LAMARR',
    year: '1942',
    fact: 'Movie star Hedy Lamarr invented frequency hopping — the trick that helps Wi-Fi work today. Inventors can come from anywhere.',
  },
  9: {
    word: 'www',
    title: 'THE WEB',
    year: '1989',
    fact: 'Tim Berners-Lee invented the World Wide Web and gave it away for free — to everyone, forever. Those three letters connect the world.',
  },
  10: {
    word: 'floppy',
    title: 'FLOPPY DISK',
    year: '1971',
    fact: 'Before clouds, files lived on bendy plastic squares. One floppy held less than a single photo does today.',
  },
  11: {
    word: 'mouse',
    title: 'THE MOUSE',
    year: '1968',
    fact: 'Douglas Engelbart carved the first computer mouse from wood and showed it in "the Mother of All Demos." Every click remembers it.',
  },
  12: {
    word: 'turing',
    title: 'ALAN TURING',
    year: '1950',
    fact: 'Alan Turing cracked secret codes and asked the big question: can a machine think? Computer science begins with his name.',
  },
  13: {
    word: 'grace',
    title: 'GRACE HOPPER',
    year: '1947',
    fact: 'Grace Hopper\'s team found a real moth stuck inside their computer — the first computer "bug." She taped it into the logbook.',
  },
  14: {
    word: 'pixel',
    title: 'THE PIXEL',
    year: '1965',
    fact: "Everything on this screen is made of tiny squares of light called pixels. You've been reading pixels this whole game.",
  },
  15: {
    word: 'eliza',
    title: 'ELIZA',
    year: '1966',
    fact: 'The first chatbot. ELIZA talked by turning your words into questions. People loved chatting with her — she only knew typing.',
  },
  17: {
    word: 'c64',
    title: 'COMMODORE 64',
    year: '1982',
    fact: 'The best-selling computer of all time. Millions of kids typed their first words on one — probably in a living room.',
  },
  18: {
    word: '386',
    title: 'INTEL 386',
    year: '1985',
    fact: 'The chip that made computers fast enough for real games. Thirty-two bits of pure speed, smaller than a cracker.',
  },
  19: {
    word: 'y2k',
    title: 'THE Y2K BUG',
    year: '1999',
    fact: 'The whole world checked its math because computers stored years with two digits. Midnight came — and the fixes worked.',
  },
  20: {
    word: '1969',
    title: 'ARPANET',
    year: '1969',
    fact: "The internet's first message was supposed to be LOGIN. The computer crashed after two letters. The internet's first word: LO.",
  },
  22: {
    word: '\\o/',
    title: 'ASCII',
    year: '1963',
    fact: 'Before pictures, people drew with letters. ASCII gave every character a number — and gave us little text people cheering.',
  },
  24: {
    word: 'Eniac',
    title: 'ENIAC',
    year: '1946',
    fact: 'The first room-sized electronic computer, programmed by six women mathematicians. It weighed as much as five elephants.',
  },
  25: {
    word: 'hello world',
    title: 'HELLO, WORLD',
    year: '1978',
    fact: 'The first program every coder writes makes the computer say hello. You typed it by hand. Welcome to the club.',
  },
};

export const TOTAL_CARDS = Object.keys(HISTORY_CARDS).length;

// Convert a card's word string into the same token-array shape every other
// pattern in js/levels.js uses: one token per character, uppercase letters
// are Shift-tokens (handled by the existing engine case rule in main.js),
// spaces become ' ' tokens.
export function wordToTokens(word) {
  return word.split('');
}

// A pattern "matches" a card word if its tokens are identical to the card's
// token array — used to detect the sparkle moment during play.
export function patternMatchesCard(pattern, card) {
  if (!card) return false;
  const tokens = wordToTokens(card.word);
  if (pattern.length !== tokens.length) return false;
  return pattern.every((t, i) => t === tokens[i]);
}

const STORAGE_KEY = 'kk-cards';

function readCollected() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// Records a level's card as collected (idempotent). Returns whether this
// call was the first time this card was collected (drives the "NEW!" tag).
export function collectCard(level) {
  const collected = readCollected();
  if (collected.includes(level)) return false;
  collected.push(level);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collected));
  } catch {
    // localStorage unavailable (e.g. private mode) — collection just won't
    // persist across sessions. Never let this throw and break flow.
  }
  return true;
}

export function collectedCount() {
  return readCollected().length;
}
