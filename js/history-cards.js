// History Cards — "picked up off the arcade floor."
//
// Hacker/computing/gaming history woven into the curriculum. Each card has a
// "moment word" — typeable with ONLY that level's unlocked keys — tied to a
// real, citation-verified moment (research/computing-history-moments.md).
// Typing the word triggers only an ambient sparkle mid-play; the educational
// card is revealed later, at the level-complete overlay. The One Rule holds:
// nothing here ever pauses or gates flow beyond the single guaranteed word a
// level won't end without (so the card is earned, never missable).
//
// THE MODEL (rebuilt 2026-07-19): a FLAT LIST, each card carrying a stable `id`
// and its `level` (= the EARLIEST level where its word becomes typeable). A
// level may now hold a POOL of several cards. Each play surfaces exactly ONE
// guaranteed card (pickGuaranteedCard, preferring one not yet collected in the
// active slot), so a level with N cards takes ~N visits to fully collect — a
// Skulltula-style completionist loop that rewards replay. This mirrors the
// Act-6 riddle rotation (js/textworld/riddles.js) and preserves the
// exactly-one-guaranteed-card-per-play invariant every winability proof rests
// on. Collection is stored PER SAVE-SLOT (js/slots.js), keyed by card `id`.
//
// This file only exports data + pure helpers — no DOM, no state, no storage
// (mirrors freeplay.js). `legacyLevel` tags the original 17 one-per-level cards
// so slots.js can migrate a pre-slots kk-cards array (level numbers) to ids.

export const HISTORY_CARDS = [
  { id: 'ada-lovelace', level: 4, legacyLevel: 4, word: 'ada', title: 'ADA LOVELACE', year: '1843',
    fact: "Ada Lovelace wrote the very first computer program — more than 100 years before computers existed. You just typed the first programmer's name." },
  { id: 'hal-9000', level: 5, legacyLevel: 5, word: 'hal', title: 'HAL 9000', year: '1968',
    fact: 'The most famous movie computer ever. HAL could talk, play chess, and read lips. Real computers were still learning to add.' },
  { id: 'hedy-lamarr', level: 8, legacyLevel: 8, word: 'hedy', title: 'HEDY LAMARR', year: '1942',
    fact: 'Movie star Hedy Lamarr invented frequency hopping — the trick that helps Wi-Fi work today. Inventors can come from anywhere.' },
  { id: 'the-web', level: 9, legacyLevel: 9, word: 'www', title: 'THE WEB', year: '1989',
    fact: 'Tim Berners-Lee invented the World Wide Web and gave it away for free — to everyone, forever. Those three letters connect the world.' },
  { id: 'floppy-disk', level: 10, legacyLevel: 10, word: 'floppy', title: 'FLOPPY DISK', year: '1971',
    fact: 'Before clouds, files lived on bendy plastic squares. One floppy held less than a single photo does today.' },
  { id: 'the-mouse', level: 11, legacyLevel: 11, word: 'mouse', title: 'THE MOUSE', year: '1968',
    fact: 'Douglas Engelbart carved the first computer mouse from wood and showed it in "the Mother of All Demos." Every click remembers it.' },
  { id: 'alan-turing', level: 12, legacyLevel: 12, word: 'turing', title: 'ALAN TURING', year: '1950',
    fact: 'Alan Turing cracked secret codes and asked the big question: can a machine think? Computer science begins with his name.' },
  { id: 'grace-hopper', level: 13, legacyLevel: 13, word: 'grace', title: 'GRACE HOPPER', year: '1947',
    fact: 'A real moth got stuck inside Grace Hopper\'s team\'s computer — the first "bug" taped into a logbook. She told the story so well, it became hers.' },
  { id: 'the-pixel', level: 14, legacyLevel: 14, word: 'pixel', title: 'THE PIXEL', year: '1965',
    fact: "Everything on this screen is made of tiny squares of light called pixels. You've been reading pixels this whole game." },
  { id: 'eliza', level: 15, legacyLevel: 15, word: 'eliza', title: 'ELIZA', year: '1966',
    fact: 'The first chatbot. ELIZA talked by turning your words into questions. People loved chatting with her — she only knew typing.' },
  { id: 'commodore-64', level: 17, legacyLevel: 17, word: 'c64', title: 'COMMODORE 64', year: '1982',
    fact: 'The best-selling computer of all time. Millions of kids typed their first words on one — probably in a living room.' },
  { id: 'intel-386', level: 18, legacyLevel: 18, word: '386', title: 'INTEL 386', year: '1985',
    fact: 'The chip that made computers fast enough for real games. Thirty-two bits of pure speed, smaller than a cracker.' },
  { id: 'y2k-bug', level: 19, legacyLevel: 19, word: 'y2k', title: 'THE Y2K BUG', year: '1999',
    fact: 'The whole world checked its math because computers stored years with two digits. Midnight came — and the fixes worked.' },
  { id: 'arpanet', level: 20, legacyLevel: 20, word: '1969', title: 'ARPANET', year: '1969',
    fact: "The internet's first message was supposed to be LOGIN. The computer crashed after two letters. The internet's first word: LO." },
  { id: 'ascii', level: 22, legacyLevel: 22, word: '\\o/', title: 'ASCII', year: '1963',
    fact: 'Before pictures, people drew with letters. ASCII gave every character a number — and gave us little text people cheering.' },
  { id: 'eniac', level: 24, legacyLevel: 24, word: 'Eniac', title: 'ENIAC', year: '1946',
    fact: 'The first room-sized electronic computer, programmed by six women mathematicians. It weighed as much as five elephants.' },
  { id: 'hello-world', level: 25, legacyLevel: 25, word: 'hello world', title: 'HELLO, WORLD', year: '1978',
    fact: 'The first program every coder writes makes the computer say hello. You typed it by hand. Welcome to the club.' },

  // ── Expansion 2026-07-19 (research/computing-history-moments.md "17 → 41"):
  //    citation-verified, each attached to its EARLIEST-typeable level. Levels
  //    1–3 carry no card by design (no vowel is spellable there). ──
  { id: 'qwerty-keyboard', level: 4, word: 'asdf', title: 'A-S-D-F', year: '1868',
    fact: "A man named Christopher Sholes arranged these very keys so an old typewriter wouldn't jam. A-S-D-F has been waiting under your fingers ever since." },
  { id: 'flash-memory', level: 5, word: 'flash', title: 'FLASH MEMORY', year: '1984',
    fact: "An engineer named Fujio Masuoka invented flash memory at Toshiba — the trick that lets you unplug a drive and keep its data safe. He named it after a camera flash." },
  { id: 'artificial-intelligence', level: 6, word: 'ai', title: 'ARTIFICIAL INTELLIGENCE', year: '1956',
    fact: "At a summer workshop called Dartmouth, scientists picked a brand new name for machines that think: Artificial Intelligence. Just two little letters — a whole new idea." },
  { id: 'first-hard-disk', level: 6, word: 'disk', title: 'THE FIRST HARD DISK', year: '1956',
    fact: "IBM's first hard disk was the size of two refrigerators and held less than one photo does today. It was also the very first hard disk ever built." },
  { id: 'first-gui', level: 7, word: 'gui', title: 'THE FIRST GUI', year: '1973',
    fact: "At a lab called Xerox PARC, computers first got windows, icons, and a mouse to click them with. Before that, every computer only understood typed words." },
  { id: 'atari-founded', level: 8, word: 'atari', title: 'ATARI IS BORN', year: '1972',
    fact: "A company called Atari opened in California — the same company that made Breakout, the very first cabinet you played. Video games had a hometown now." },
  { id: 'altair-8800', level: 8, word: 'altair', title: 'THE ALTAIR 8800', year: '1975',
    fact: "The Altair 8800 was a computer kit you built yourself from a magazine ad. It was so exciting that two young programmers named Bill and Paul wrote its first software." },
  { id: 'word-software', level: 9, word: 'software', title: 'THE WORD "SOFTWARE"', year: '1958',
    fact: "A mathematician named John Tukey needed a word for the instructions inside a computer, since they weren't hard like its wires and tubes. He wrote down 'software' — and it stuck." },
  { id: 'apple-founded', level: 10, word: 'apple', title: 'APPLE IS BORN', year: '1976',
    fact: "Two friends named Steve built their first computer by hand in a garage and called their company Apple. It started with fifty computers — and one bitten-fruit logo." },
  { id: 'first-email', level: 11, word: 'email', title: 'THE FIRST EMAIL', year: '1971',
    fact: "Ray Tomlinson sent the first email between two computers sitting right next to each other. He picked the @ symbol to mean 'at' — it's still there in every email today." },
  { id: 'brain-virus', level: 12, word: 'brain', title: 'THE FIRST PC VIRUS', year: '1986',
    fact: "Two brothers wrote the first PC virus to stop people from copying their own software. It was so harmless it even left the brothers' real phone number inside, in case anyone had questions!" },
  { id: 'intel-founded', level: 12, word: 'intel', title: 'INTEL IS BORN', year: '1968',
    fact: "Two chip pioneers, Robert and Gordon, started a little company called Intel. Its chips would end up inside computers all over the world." },
  { id: 'pacman-pizza', level: 13, word: 'pacman', title: "PAC-MAN'S PIZZA", year: '1980',
    fact: "The story goes that a pizza with one slice missing inspired Pac-Man's shape. Toru Iwatani later said the real answer was simpler — a rounded Japanese symbol for 'mouth.'" },
  { id: 'colossal-cave', level: 13, word: 'cave', title: 'THE FIRST TEXT ADVENTURE', year: '1976',
    fact: "Long before pictures, a caver named Will Crowther wrote a game made only of typed words: Colossal Cave Adventure. Typing 'xyzzy' inside it still means 'nothing happens' today." },
  { id: 'unix', level: 14, word: 'unix', title: 'UNIX IS BORN', year: '1969',
    fact: "Two programmers at Bell Labs, Ken and Dennis, built a whole new kind of computer system the same summer astronauts walked on the moon. Unix still powers phones and computers today." },
  { id: 'zork', level: 15, word: 'zork', title: 'THE GREAT UNDERGROUND EMPIRE', year: '1977',
    fact: "A group of MIT students built Zork, a game made entirely of typed sentences and imagination. You walk through its world one word at a time — sound familiar?" },
  { id: '56k-modem', level: 16, word: '56k', title: 'THE 56K MODEM', year: '1998',
    fact: "For a while, 56,000 was the fastest a home computer could talk to the internet over a phone line — with a screech and a whistle. Every family remembers that sound." },
  { id: 'ipv4', level: 17, word: 'ipv4', title: 'EVERY COMPUTER GETS A NUMBER', year: '1981',
    fact: "IPv4 gave every computer on the internet its own numbered address, so messages always knew where to go. Billions of computers still use addresses from that same rulebook." },
  { id: 'intel-486', level: 18, word: '486', title: 'THE INTEL 486', year: '1989',
    fact: "The 486 chip packed over a million tiny switches onto one sliver of silicon — the first of its kind to do it. It was the muscle behind the computers that followed the 386." },
  { id: 'unix-epoch', level: 20, word: '1970', title: 'THE DAY COMPUTER TIME BEGAN', year: '1970',
    fact: "Computers everywhere agree that time began on January 1st, 1970. Every clock inside every computer still counts forward from that exact morning." },
  { id: 'wi-fi', level: 21, word: 'wi-fi', title: 'WI-FI GETS ITS NAME', year: '1999',
    fact: "A team of name-makers invented something catchier than '802.11b' — and came up with Wi-Fi, a playful cousin of 'hi-fi.' It doesn't actually stand for anything at all." },
  { id: 'hack-word', level: 23, word: '`hack`', title: 'THE FIRST "HACK"', year: '1959',
    fact: "At MIT's model train club, a clever trick was called a 'hack.' When those same students got their hands on early computers, the name came right along with them." },
  { id: 'ibm', level: 24, word: 'IBM', title: 'IBM', year: '1911',
    fact: "IBM started as a company that made scales, clocks, and card-punching machines — not computers at all. Thirteen years later, it took the name International Business Machines." },
  { id: 'rubber-duck', level: 25, word: 'rubber duck', title: 'THE RUBBER DUCK METHOD', year: '1999',
    fact: "Programmers sometimes explain their stuck code out loud to a rubber duck on their desk — and the answer often appears before they finish talking. Try it. It really works." },

  // ── SECRET cards (level: null) — never injected into any level's pool. Found
  //    ONLY by the curious who type a magic word (see main.js SECRET_PHRASES).
  //    They still count toward the collection total, so "all cards" needs them
  //    (a hidden Skulltula). ──
  { id: 'wargames-joshua', level: null, secret: true, word: 'joshua', title: 'W.O.P.R. — WARGAMES', year: '1983',
    fact: 'A computer named Joshua almost started a war by mistaking it for a game — until it learned the only winning move is not to play. You found its secret name.' },
];

export const TOTAL_CARDS = HISTORY_CARDS.length;

// All cards (identity export — the collection gallery renders over this).
export function allCards() {
  return HISTORY_CARDS;
}

// The pool of cards hidden at a given level (may be empty, one, or several).
export function cardsForLevel(level) {
  return HISTORY_CARDS.filter(c => c.level === level);
}

export function cardById(id) {
  return HISTORY_CARDS.find(c => c.id === id) || null;
}

// Migration helper for slots.js: the original one-card-per-level model stored
// LEVEL NUMBERS in kk-cards. Map a legacy level to that level's original card
// id (the `legacyLevel` tag), or null if that level had no card.
export function legacyLevelToCardId(level) {
  const c = HISTORY_CARDS.find(card => card.legacyLevel === level);
  return c ? c.id : null;
}

// Choose the single GUARANTEED card for one play of a level:
//   • prefer a card not yet collected in this slot (so replays make progress),
//   • rotate within the candidate set by the slot's per-level counter (so even
//     an already-complete level shows variety on replay),
//   • return null when the level hides no card.
// Deterministic given (level, collectedIds, rotation) — no Math.random, so the
// behavior is fully testable and reproducible.
export function pickGuaranteedCard(level, collectedIds, rotation) {
  const pool = cardsForLevel(level);
  if (!pool.length) return null;
  const collected = new Set(Array.isArray(collectedIds) ? collectedIds : []);
  const rot = Number.isFinite(rotation) ? Math.max(0, Math.floor(rotation)) : 0;
  const uncollected = pool.filter(c => !collected.has(c.id));
  const candidates = uncollected.length ? uncollected : pool;
  return candidates[rot % candidates.length];
}

// Convert a card's word string into the same token-array shape every other
// pattern in js/levels.js uses: one token per character; uppercase letters are
// Shift-tokens (handled by the engine case rule in main.js); spaces become ' '.
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
