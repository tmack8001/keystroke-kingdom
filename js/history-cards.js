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
//
// FOUR BANKS (2026-10-31): HISTORY_CARDS (the arcade — the only bank TOTAL_CARDS
// counts), WING_CARDS, ACT_CARDS, and KEY_CARDS (keyboard cards — what a symbol
// key is called; spec: see the js/key-cards.js header). KEY_CARDS lives in its
// OWN module, js/key-cards.js, because it is the only module permitted to spell
// the eighth key's name (INV-29). Never copy a key card's strings into this file —
// import them. bankOf()/bankProgress()/cardById() know all four banks.

import { KEY_CARDS, keyCardForLevel, keyCardById } from './key-cards.js';
export { KEY_CARDS, keyCardForLevel };

export const HISTORY_CARDS = [
  // ── THE FIRST CARD IN THE GAME, and the reason it exists ──────────────────
  //
  // Levels 1-3 had NO cards at all, measured 2026-09-14. Not an oversight — a card is
  // found by TYPING its word, and `J F D K S L` has no vowel, so nothing was spellable
  // until A arrives at Level 4 (the Word Bank Principle). The distribution was
  // `0 0 0 2 2 | 3 2 6 4 2 | ...`: Act 1 had 4 cards across 5 levels and Act 3 had 22,
  // while a five-year-old replays Levels 1-3 more than anything else in the game. The
  // collect loop simply did not exist where a beginner actually spends their time.
  //
  // The fix is the one the ROADMAP proposed: a moment word that is a PATTERN TOKEN
  // rather than a real word, so nothing is smuggled into levels that are deliberately
  // wordless. `jf` is already Level 1's own drill (`.claude/rules/levels/act1.md`:
  // "j, f, jf, fj"), and the bank has precedent for non-word tokens — `\o/`, `386`,
  // `56k`, `1969`, `` `hack` ``.
  //
  // ⚠️ The YEAR is 'UNKNOWN' and that is the sourced answer, not a placeholder. Two
  // articles written specifically about the F/J bumps give no origin; the patent usually
  // credited (US 6,667,697 B2) turns out to claim something else entirely and its own
  // prior-art section describes the bumps as already existing; and ISO/IEC 9995 could not
  // be confirmed to mention them. The bank has precedent for a non-numeric year
  // ('1970s', 'LATE 1980s'). Saying UNKNOWN is the honest card; picking a date would be
  // the fluent error. Research: research/wiki/tech/home-row-bumps.md.
  { id: 'home-row-bumps', level: 1, word: 'jf', title: 'THE BUMPS ON F AND J', year: 'UNKNOWN',
    fact: 'Feel the top of the F key and the J key. There is a tiny bump on each one. That is how your two pointer fingers find their way home without ever looking down.' },

  // L2 and L3, completing the beginner fix begun by `jf` above (2026-09-15).
  //
  // ⚠️ A RULE THAT WAS BEING MISAPPLIED, and is worth understanding before adding
  // another early card. `research/computing-history-moments.md` used to say Levels 1-3
  // "could not receive a card" because *"no English word, name, or common initialism is
  // spellable without a vowel from this letter set"*. The vowel rule is real — but it
  // governs the **WORD bank** (what a child READS, product.md §Word Bank Principle) and
  // had been silently applied to the **CARD bank** (what a child TYPES). Those are
  // different constraints: a card token need only be typeable and citable, never an
  // English word. The bank had already accepted `\o/`, `386` and `56k` when that
  // sentence was written. It is now falsified three times over — and twice by
  // initialisms, the exact category it ruled out.
  { id: 'java-jdk', level: 2, word: 'jdk', title: 'JAVA', year: '1995',
    fact: 'A computer language was almost called Oak. That name was already taken, so the team picked a new one in a room full of coffee cups — and called it Java.' },
  { id: 'ls-command', level: 3, word: 'ls', title: 'LIST', year: '1971',
    fact: 'To ask a computer what is inside a folder you type two letters: l, s. It means list. People have been typing exactly those two letters since 1971.' },

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

  // ── Expansion 2026-07-27: 1970s–90s hacker / phreak / underground culture
  //    (research/hacker-culture.md + research/wiki/culture/*, all
  //    citation-verified by the arcade-historian). Same "curiosity, not crime"
  //    editorial move throughout — the game's own ethos ("poke at the machine and
  //    see what it says back"). Each word attaches to its EARLIEST-typeable level
  //    (INV-56). ──
  { id: 'war-dialing', level: 6, word: 'dial', title: 'WAR DIALING', year: '1983',
    fact: "In a famous old movie, a kid's computer called number after number — not to reach people, but to find OTHER computers to say hello to. Ever since, that trick has been called war dialing." },
  { id: 'trashing', level: 8, word: 'trash', title: 'TRASHING', year: '1970s',
    fact: "Long ago, curious tinkerers figured out how the giant telephone machines worked by reading the manuals a company had thrown away — real detective work, one dusty page at a time." },
  { id: 'legion-of-doom', level: 9, word: 'lod', title: 'LEGION OF DOOM', year: '1984',
    fact: "A club of super-curious teenagers named themselves after a comic-book villain team — then raced to understand the telephone system better than anyone alive, even writing their own how-it-works journals." },
  { id: 'phone-phreaking', level: 9, word: 'whistle', title: 'PHONE PHREAKING', year: '1971',
    fact: "A tiny toy whistle from a cereal box happened to make the exact musical note the phone network listened for. The fellow who noticed later met a young Steve Jobs and helped write one of the first word processors." },
  { id: 'masters-of-deception', level: 11, word: 'mod', title: 'MASTERS OF DECEPTION', year: 'LATE 1980s',
    fact: "A rival club of clever kids picked a name just one letter past their competitors' — M for the group after the L. For years the two teams competed to learn the most about how phones and computers worked." },
  { id: 'hacker-ethic', level: 11, word: 'levy', title: 'THE HACKER ETHIC', year: '1984',
    fact: "A writer named Steven Levy spent time with the very first computer tinkerers and wrote down their big idea: being curious and sharing what you learn makes everything better. He called it the Hacker Ethic." },
  { id: 'spam-origin', level: 11, word: 'spam', title: 'WHERE "SPAM" CAME FROM', year: '1970',
    fact: "Junk messages got their name from a silly TV skit where singing Vikings chanted 'Spam! Spam! Spam!' until nobody could hear anything else. The goofy name stuck for messages that just won't stop." },
  { id: 'first-bbs', level: 12, word: 'bbs', title: 'THE FIRST MESSAGE BOARD', year: '1978',
    fact: "A giant snowstorm trapped two friends indoors in Chicago, so they built the very first computer 'bulletin board' — a place to leave messages for each other over the phone line. Snow days can invent the future." },
  { id: 'hacker-manifesto', level: 12, word: 'mentor', title: 'THE HACKER MANIFESTO', year: '1986',
    fact: "A young computer explorer nicknamed The Mentor wrote a famous little essay saying kids like him weren't bad — just endlessly curious, in love with learning how everything works. People still share it today." },
  { id: 'phrack', level: 13, word: 'phrack', title: 'PHRACK', year: '1985',
    fact: "Two teenagers started a homemade computer newsletter and passed it around over phone lines. Forty years later, people are STILL writing new issues of it." },
  { id: 'cyberpunk', level: 13, word: 'cyberpunk', title: 'THE WORD "CYBERPUNK"', year: '1983',
    fact: "A writer glued two words together — 'cyber' from computers and 'punk' from rebels — just to title a short story. His made-up word grew into a whole style of books, movies, and games." },
  { id: 'acoustic-coupler', level: 13, word: 'coupler', title: 'THE ACOUSTIC COUPLER', year: '1966',
    fact: "Before computers plugged straight into the wall, they talked to each other by whispering musical tones into a telephone handset, cradled snugly in two rubber cups. You could actually hear the computers chatting." },
  { id: '2600-magazine', level: 20, word: '2600', title: '2600: THE HACKER QUARTERLY', year: '1984',
    fact: "Remember 2600 — the secret musical note that could talk to old phones? Someone named a whole magazine after it, and it's still printed today. Now you know what that number means." },

  // ── Expansion 2026-09-13: the EDUTAINMENT lineage — the floppy-disk era this
  //    game is itself descended from (research/educational-software.md +
  //    research/wiki/pedagogy/*, research/wiki/games/*, all citation-verified).
  //    The graph held ~210 pages on arcades, consoles and hacker culture and
  //    ZERO on educational software, its own genre. Each word attaches to its
  //    EARLIEST-typeable level (INV-56). Kid-safety: no Oregon Trail card may
  //    quote its famous death line — 'died'/'dead' are word-blocklist floor
  //    entries and the moment is wrong for a five-year-old either way. ──
  { id: 'reader-rabbit', level: 7, word: 'reader', title: 'READER RABBIT', year: '1984',
    fact: 'Leslie Grimm built a game that taught children to read before they could read the instructions. Every word here that you can type AND read is that same idea.' },
  { id: 'gizmos-gadgets', level: 8, word: 'gadget', title: 'GIZMOS & GADGETS', year: '1993',
    // The original ending — "Losing only meant going back and building a better
    // one" — was cut 2026-09-13 by a card audit. It is not sourced anywhere: the
    // card's own research page says "no source found confirms the game is
    // non-punitive... a design INTERPRETATION of the documented rebuild loop, not
    // a sourced claim about the game's feedback behaviour." It was also the most
    // flattering possible claim for THIS game's One Rule, which is exactly why it
    // should have been suspected. Everything below is on the page.
    fact: 'Solve a science puzzle, win a machine part, build your own car or plane — then race it against a rival named Morty Maxwell.' },
  { id: 'oregon-trail', level: 8, word: 'trail', title: 'THE OREGON TRAIL', year: '1971',
    fact: 'Three student teachers wrote it for a computer that had no screen at all — it printed the game onto paper, one line at a time. It became the most successful school game ever made.' },
  { id: 'rockys-boots', level: 12, word: 'boots', title: "ROCKY'S BOOTS", year: '1982',
    // Two audit corrections, 2026-09-13. "the first secret ever hidden in one" was
    // overreach: every source hedges it as "MOST WIDELY CITED as the first"
    // (warren-robinett.md, easter-egg-culture.md) — the F7 failure class, on a card
    // a child reads. And "seven-year-olds" was unsourced: the age appears once, in
    // this project's own prose on the wiki page, never in its cited facts. The
    // gates are sourced ("logic gates (AND, OR, NOT)... a mechanical boot that
    // kicks objects off a conveyor belt") and are better copy anyway.
    fact: 'Children wired real AND, OR and NOT gates into a circuit that made a boot kick things off a belt. Its programmer had hidden his name in a game three years earlier — one of the very first secrets in one.' },
  { id: 'stickybear-typing', level: 13, word: 'stickybear', title: 'STICKYBEAR TYPING', year: '1985',
    fact: 'A bear taught children to type on a blue screen in 1985. It drew a whole keyboard along the bottom and lit up the next key to press — the same idea as the keyboard at the bottom of yours.' },

  // ── THE REPLAY-PAYOUT BATCH (2026-09-15) — five levels that had a pool of ONE ──
  //
  // L16, L19, L21, L22 and L23 each held exactly one card, so `pickFromPool` returned
  // the same card forever and those cabinets paid nothing on any replay after the first.
  //
  // ⚠️ WHY THOSE LEVELS WERE SPARSE, and the rule for adding a sixth: a card attaches to
  // the EARLIEST level whose keys can spell its word (INV-56), so a card only LANDS here
  // if its word CONTAINS one of the level's own new characters. `6502` looks like a
  // perfect Level 16 word and is not — `0` and `2` do not unlock until Levels 20 and 19,
  // so it would attach at Level 20. Check the word character-by-character against
  // `js/levels.js`, never by eye.
  { id: 'ne555-timer', level: 16, word: '555', title: 'THE 555 CHIP', year: '1971',
    fact: 'A chip smaller than a fingernail, made since 1971, that does one job: count time. It blinks the lights and makes the beeps in toys, kitchens, and spacecraft.' },
  { id: 'windows-95', level: 19, word: 'win95', title: 'WINDOWS 95', year: '1995',
    fact: 'Windows 95 is where the Start button came from. Before it, there was no one corner of the screen where everything on your computer began.' },
  // ⚠️ NOT the bank's first pre-computing card, despite looking like one — `asdf`
  // (A-S-D-F, 1868) already predates computing by eighty years. Both are cards about the
  // KEYS, which is this game's actual subject, and Level 21's own content is equations
  // (`2-1=1`). Sourced to the National Library of Wales and MacTutor.
  { id: 'equals-sign', level: 21, word: '1=1', title: 'THE EQUALS SIGN', year: '1557',
    fact: 'Before 1557 you had to write out "is equal to" every single time. A Welsh teacher got tired of it and drew two twin lines the same length instead. That is the = key.' },
  // ⚠️ `'\\n'` — an ESCAPED backslash. Writing `'\n'` here is a literal newline and
  // silently produces a broken pattern. Same form as the ASCII card's `'\\o/'`.
  { id: 'newline-crlf', level: 22, word: '\\n', title: 'THE NEW LINE', year: '1963',
    fact: 'On a typewriter, one push of the lever sent the paper back to the left AND down one line. Computers split that into two moves: come back, then go down.' },
  // ⚠️ Deliberately uses the APOSTROPHE — Level 23 teaches two keys and its existing
  // card (`hack`) only ever exercises the backtick, so the pair now covers both.
  // ⚠️ "mid-1980s", not 1986: the year is search-summary only. The count is from the
  // publisher's own live index (it read 1510). Named animals were dropped — only the
  // slender loris appears in fetched text.
  { id: 'oreilly-animals', level: 23, word: "o'reilly", title: 'THE ANIMAL BOOKS', year: 'MID-1980s',
    fact: 'A designer thought computer words like sed and awk sounded like strange creatures — so the covers got old animal drawings instead. Now there are over 1,500 animals.' },

  // ── THE MATH-vs-CODE BATCH (2026-09-15) — every key means two things ────────
  //
  // Trevor, on seeing the freshly-shipped `1=1` card: *"1=1 in math would be equality —
  // in engineering yes this is an assignment which isn't right"*, then the idea that turns
  // that wrinkle into the feature: **"Maybe each card could help decipher these
  // differences — as we have each one discoverable."**
  //
  // A card is found ONE AT A TIME by typing its word, so each card decodes one idea and
  // the collection teaches the differences cumulatively. `1=1` and `1==1` are the first
  // PAIR and they rotate against each other at Level 21: neither card carries both
  // meanings, the collection does. ⚠️ `1=1` is deliberately UNCHANGED — it is correct
  // about mathematics, and the pair is the teaching device.
  //
  // THE FIND THAT MAKES THE PAIR WORK, and it is not about computers at all: in 1801
  // Gauss introduced `≡` for congruence because Legendre was already using plain `=` for
  // it — in his own words, *"to prevent any ambiguity."* The identical collision, and the
  // identical fix (invent a near-twin sign), 171 years before B gave `==` its job. That is
  // why `modulo` is in this batch and why the two pages are cross-linked.
  { id: 'equality-vs-assignment', level: 21, word: '1==1', title: 'EQUALS, TWICE', year: '1972',
    fact: "In math, = means 'these are the same.' In code it often means 'put this in here.' So coders needed a second sign just to ask the question: == means 'are these the same?'" },

  // ── …and the discrete-maths half of the same direction ──────────────────────
  // Concepts rather than symbols, landing wherever their letters first close. Each has a
  // person, a date and an institutional record, because an abstract definition makes a
  // poor card and a story makes a good one.
  //
  // ⚠️ `edge` is titled COUNT THE EDGES, not "Euler's formula", on purpose: Euler did not
  // discover it (Maurolico wrote it for some shapes in 1537, Descartes found a version
  // around 1630), so a title naming him beside a 1750 date would overstate exactly the way
  // journal F7 is about. The fact names nobody and the claim is safe.
  { id: 'eulers-polyhedron-formula', level: 6, word: 'edge', title: 'COUNT THE EDGES', year: '1750',
    fact: 'Find a box. Count the corners, count the edges, count the flat sides. Now do corners minus edges plus sides: 8 - 12 + 6 = 2. You always get 2. Try it on anything.' },
  { id: 'odd-and-even', level: 9, word: 'odd', title: 'ODD AND EVEN', year: 'c. 300 BC',
    fact: 'Share a pile of buttons fairly between two people. Nothing left over means the number is even. One left over means it is odd. Euclid wrote that down about 2,300 years ago.' },
  // ⚠️ 1735, NOT 1736. Presented to the St Petersburg Academy 26 August 1735 and published
  // in 1741; the familiar "1736" is the proceedings VOLUME year, not the work's date.
  { id: 'seven-bridges', level: 10, word: 'graph', title: 'SEVEN BRIDGES', year: '1735',
    fact: 'A town had seven bridges, and everyone wondered if you could cross every one exactly once. In 1735 Leonhard Euler proved you cannot — by turning the whole town into dots and lines.' },
  // ⚠️ "never run out", not "infinite": Euclid IX.20 reads "Prime numbers are more than any
  // assigned multitude of prime numbers" — he does not use the word infinite.
  { id: 'prime-numbers', level: 11, word: 'prime', title: 'PRIME NUMBERS', year: 'c. 300 BC',
    fact: 'Some numbers cannot be split into equal groups at all. 2, 3, 5, 7, 11 — try sharing 7 candies fairly and you never can. Those are prime numbers.' },
  { id: 'modular-arithmetic', level: 11, word: 'modulo', title: 'MODULO', year: '1801',
    fact: 'In 1801 Carl Gauss wrote a book about numbers that wrap around. He needed a sign for it, and the equals sign was already busy — so he drew three lines instead of two.' },
  { id: 'george-boole', level: 12, word: 'boolean', title: 'BOOLEAN', year: '1847',
    fact: 'George Boole turned true and false into math you can work with, like numbers. He died in 1864, long before computers — and every computer ever built runs on his idea.' },

  // ── THE MOTH (2026-09-18) — the card that points at an easter egg ──────────
  //
  // Trevor: *"Would be nice to have moth be one of the history cards when it's letters
  // unlock and in the text can be a call out or hint to interact with the moth."* The
  // moth egg lives on the SELECT screen (js/ui/cabinet-art.js): after ~12s of stillness
  // it flutters in and settles on a LIT cabinet, and clicking it quotes the logbook.
  // It is an UNCOUNTED egg — missing it costs nothing — so this card is its
  // discoverability, which is what let the egg stay mouse-only despite
  // `keyboarding-readiness.md` putting mouse precision at 9-12 and this player at 4-8:
  // the click is a bonus, never the way value is obtained.
  //
  // ⚠️ TWO CLAIMS THIS CARD DELIBERATELY DOES NOT MAKE, both checked 2026-09-18:
  //
  // 1. **It does not say the moth is why we call them "bugs."** The word predates it by
  //    ~70 years — Edison used it in 1878, and Webster's had defined it as "a defect in
  //    an apparatus" by 1934 (CHM, IEEE Spectrum, JSTOR Daily). The logbook's caption,
  //    *"First actual case of bug being found,"* is a JOKE ABOUT AN EXISTING WORD: the
  //    first actual bug FOUND, not the first use of the term. Trevor's framing ("the
  //    origins of software defects being named bugs") is the one thing the sources
  //    refuse, and journal F7 is about exactly this shipping once before.
  // 2. **It does not call it the first SOFTWARE bug.** The Harvard Mark II was
  //    electromechanical — relays, not software — and JSTOR Daily names it "a mechanical
  //    obstruction rather than a software bug."
  //
  // The sentence below asserts neither: a moth jammed a switch and somebody kept it.
  //
  // ⚠️ It also must not retell L13's `grace` card, which is correctly about Hopper's
  // POPULARISING role (the Smithsonian record says she neither found nor logged it).
  // L13 owns the person; L11 owns the artifact and the day — the same split as the
  // arcade's `floppy-disk` (1971 medium) vs the wing's Disk II (1978 drive).
  // Research: research/wiki/moments/mark-ii-moth-1947.md (9 refs, verified 2026-09-18).
  { id: 'mark-ii-moth', level: 11, word: 'moth', title: 'THE MOTH IN THE MACHINE', year: '1947',
    fact: 'In 1947 a computer stopped working, and the people fixing it found a real moth stuck in one of its switches. They taped it into their notebook. One is loose in this arcade, too.' },

  // ── SECRET cards (level: null) — never injected into any level's pool. Found
  //    ONLY by the curious who type a magic word (see main.js SECRET_PHRASES).
  //    They still count toward the collection total, so "all cards" needs them
  //    (a hidden Skulltula). ──
  { id: 'wargames-joshua', level: null, secret: true, word: 'joshua', title: 'W.O.P.R. — WARGAMES', year: '1983',
    fact: 'A computer named Joshua almost started a war by mistaking it for a game — until it learned the only winning move is not to play. You found its secret name.' },
];

// ─── THE HARDWARE wing — station cards, on a SECOND attachment axis ─────────
//
// docs/specs/hardware-wing.md §0.3/§5.4. A bonus wing has no levels, so the
// curriculum's "earliest level whose keys can spell the word" rule (INV-56) has
// no number to compute and would degenerate anyway — every key is unlocked by
// the time a wing opens. Station cards therefore attach to a WING + STATION.
//
// ⚠️ They live in their OWN array, NOT in HISTORY_CARDS, and that is deliberate.
// `TOTAL_CARDS` is the denominator the player reads on the slot picker and the
// "CARD n OF 60" line. Appending wing cards to HISTORY_CARDS would silently make
// every existing save LESS complete — a number the child already earned getting
// worse because we shipped a room they have not opened. That is the precise harm
// Trevor's "existing cards stay, cross-referenced" ruling protects against
// (spec §0.4), so the two banks stay separate and each keeps its own total.
//
// The spec sketched a single list with an `ARCADE_CARDS` filter; two arrays are
// the same idea with less risk — INV-21 and INV-56 keep testing exactly what
// they test today, and no existing helper changes behaviour at all.
//
// PAIRED, per Trevor 2026-09-14: every station yields a MACHINE card and a
// COMPONENT card — the part you could have held. The machine card is the museum
// label; the component card is the lesson, because "hardware" is a word a child
// learns by being handed one touchable thing at a time.
export const WING_CARDS = [
  // ⚠️ HALF-FILLED BY DESIGN AS OF 2026-09-15. Read this before adding a row.
  //
  // Every fact on a card a child reads is citation-verified research in
  // research/wiki/**, never model memory (CLAUDE.md; journal F7 — an overstated
  // attribution once shipped on a child-facing card; F29 — a source's SILENCE is
  // not a licence to default). When this bank was written it was EMPTY because
  // none of the components had a page. They do now: the 2026-09-14 wave landed
  // seven `research/wiki/tech/` pages, each ending in a `## Card-ready facts`
  // section whose sentences carry their own `[fetched]` sources. The two below
  // are lifted from those sections, which is why they can exist at all.
  //
  // TWO RULES FOR THE NEXT ROW:
  //
  // 1. ONLY CARD A BUILT STATION. `js/hardware/stations.js` ships two of the
  //    spec's seven (§5.1). A card for an unbuilt station would raise this bank's
  //    denominator with a `???` the player has no route to — a counted obligation
  //    with no path, which is the thing product.md §1 refuses. The other five
  //    components ARE researched (rf-modulator, sound-card, null-modem-cable,
  //    lcd-panel, dialup-shared-phone-line) and their rows wait on their stations.
  //
  // 2. DO NOT TELL A CROSS-REFERENCED CARD'S STORY TWICE. `STATION_CROSS_REFS`
  //    below already shows `floppy-disk` at the Apple IIe — that card is the 1971
  //    IBM *medium*. This bank's card is the 1978 Apple *drive*, a different
  //    object with a different story, and disk-ii-drive.md says so in as many
  //    words. The collision guard is the whole reason the two banks are separate.
  //
  // Still missing, and tracked in docs/ROADMAP.md: the MACHINE half of each pair
  // (spec §0.3 pairs a machine card with a component card). There is no
  // `apple-iie.md` and no page for the beige 1993 multimedia PC, so those two
  // rows are not writable yet and are NOT faked in the meantime. Until they land,
  // each station has a pool of one — which means its rotation does not rotate.
  { id: 'hw-disk-ii', wing: 'hardware', station: 'apple-iie',
    word: 'drive', title: 'THE DISK II DRIVE', year: '1978',
    fact: 'A clever engineer named Steve Wozniak found a way to build a disk drive using far fewer parts than anyone else — about a quarter as many — so a family with a computer could actually afford one.' },
  { id: 'hw-cd-rom', wing: 'hardware', station: 'msdos-pc',
    word: 'disc', title: 'THE CD-ROM', year: '1984',
    fact: 'In 1984, a company called Philips figured out how to use a music CD to store computer files instead of songs. One disc could hold about 460 of the old floppy disks stacked up.' },

  // The MACHINE half of each pair (spec §0.3): the museum label beside the lesson.
  //
  // The Apple IIe's card is its LOWERCASE, which is not an arbitrary pick — this is a
  // typing game, the station is running Stickybear Typing, and "the first Apple that
  // could type small letters" is the one fact about this machine that belongs here
  // above all others. Deliberately tells none of the Disk II story (rule 2 above).
  { id: 'hw-apple-iie', wing: 'hardware', station: 'apple-iie',
    word: 'lowercase', title: 'THE APPLE IIe', year: '1983',
    fact: 'The Apple IIe, 1983, was the first Apple computer that could type small letters without buying an extra part. Everything before it came out SHOUTING IN CAPITALS.' },

  // ⚠️ The beige 1993 tower could NOT be carded as asked, and this is the honest
  // substitute. A generic beige box is a CATEGORY, not a product: nothing fetchable says
  // anything true about "a beige tower", and the research page says in as many words
  // "do not write a card about why computers were beige" (F29 — silence is not a licence
  // to default). What IS sourced is the MPC badge: a published minimum spec with a logo
  // you could look for in a shop, which is precisely what made a beige box a "multimedia
  // computer" in 1993. Tells none of the CD-ROM story.
  //
  // ⚠️ NAMING GUARD for whoever builds station 4: the spec calls that station's machine
  // card "THE MULTIMEDIA PC". Do not reuse that title here or there without deciding
  // which one owns it — this card is the BADGE (the standard), station 4's would be the
  // 1995 machine itself.
  { id: 'hw-mpc-badge', wing: 'hardware', station: 'msdos-pc',
    word: 'multimedia', title: 'THE MPC BADGE', year: '1993',
    fact: 'In the 1990s a computer could earn a badge that said MPC. It meant the beige box really did have a CD drive and a sound card inside, so the game in the shop would actually run.' },
];

// The arcade cards a station CROSS-REFERENCES — already collected-or-not in the
// player's normal save, shown in the wing's gallery so the hardware story reads
// whole in one place. No card changes owner and no count moves: this is a
// rendering relationship, not a data one (spec §0.4).
const STATION_CROSS_REFS = {
  'apple-iie': ['floppy-disk', 'apple-founded', 'stickybear-typing'],
  'msdos-pc':  ['intel-486', 'gizmos-gadgets', 'first-gui'],
};

// ─── THE ACT CARDS — a THIRD bank, unlocked by the keyboard itself ──────────
//
// docs/specs/act-exclusive-cards.md. Trevor, 2026-09-14:
//
//   "Guess we could just introduce act/wing/phase cards after the entire keyboard
//    is unlocked instead of going back to all the prior ones so it stays next to
//    typing the card title."
//
// THE PROBLEM THIS SOLVES, measured rather than assumed: only **7 of 59** level
// cards have a year inside their own act's era (Act 1: 0/4, Act 3: 0/22). INV-56
// attaches a card to the earliest level whose keys can SPELL its word, so
// `phrack` (1985) sits on the Myst cabinet because its letters close at L13. The
// curriculum's cards are distributed by spelling, not by subject.
//
// An earlier draft escaped that by making act cards NON-TYPED, which bought a
// Level 1 card at the cost of the ritual the whole collection rests on — you type
// the word, you get the story. Trevor inverted it instead: don't reach back, wait
// until the keyboard is complete. Then every act-card word is typeable and the
// spelling constraint is not escaped, it is ABOLISHED.
//
// THE GATE IS LEVEL 15, and the number is verified from js/levels.js rather than
// assumed: cumulative closure there is exactly 30 keys — all 26 letters plus
// `; , . /`. That is the milestone the curriculum itself calls FULL KEYBOARD
// UNLOCKED, and it leaves ten cabinets of runway for a layer whose whole purpose
// is replay.
//
// CONTENT RULE, which the gate makes exceptionless: every act-card word must be
// spellable from those 30 keys — lowercase letters and `; , . /` only. No digits,
// no capitals, no space, no hyphen, no apostrophe. So `quarter`, `marquee` and
// `attract` are legal act words; `wi-fi` and `IBM` are not.
export const ACT_CARD_UNLOCK_LEVEL = 15;

// The keys a player holds at the gate — the authority for what an act word may
// use. Derived intent, not a copy of engine state: if the curriculum ever moves a
// key, the test that pins this fails loudly rather than the content going wrong.
const ACT_WORD_KEYS = new Set('abcdefghijklmnopqrstuvwxyz;,./'.split(''));

export function actWordIsTypeable(word) {
  return typeof word === 'string' && word.length > 0
    && word.split('').every(ch => ACT_WORD_KEYS.has(ch));
}

export const ACT_CARDS = [
  // ── ACT 1 — THE ARCADE, 1976-82 ───────────────────────────────────────────
  //
  // Theme (spec §5.5): THE MACHINE AND THE ROOM, NOT THE GAMES — the things a child
  // standing in a 1979 arcade could actually touch. That is deliberately the axis the
  // level bank measurably cannot serve: only 7 of 59 level cards sit in their own act's
  // era, because INV-56 attaches a card by SPELLING, not by subject.
  //
  // ⚠️ ALL FOUR ARE SOURCED TO ATARI'S OWN SERVICE MANUALS, not to secondary history —
  // and mostly to the manual for BREAKOUT, which is Level 1's cabinet. These are primary
  // documents about the exact machine in the game.
  //
  // ⚠️ WHAT WAS DELIBERATELY NOT WRITTEN, because the sources would not carry it — each
  // of these is a fluent, plausible sentence that no institutional source supports, and
  // writing one anyway is journal F7 happening a second time:
  //   • WHY a quarter (rather than a nickel or a dime). No source explains the choice.
  //   • HOW marquee artwork was printed. The manuals say only "Plexiglas".
  //   • That attract mode came to video games FROM pinball. Sources say only that pinball
  //     has it too, never which came first.
  //   • WHY exactly three initials. The one located explanation — an Atari designer
  //     saying it was to limit obscenities — is a single unattributed sentence in a blog
  //     with no original interview, publication or date. It is a wonderful story and it
  //     is not evidence. Not shipped, in any form.
  //   • That everyone's initials started at AAA. Unsourced convention.
  // Research: research/wiki/tech/{arcade-coin-door, arcade-marquee, attract-mode}.md,
  // research/wiki/culture/high-score-initials.md.
  { id: 'act1-quarter', act: 1, word: 'quarter', title: 'THE COIN DOOR', year: '1976',
    fact: "Atari's own repair manual for Breakout says the coin slots accept quarters only. Not a nickel, not a dime. One silver quarter bought you a whole game." },
  { id: 'act1-marquee', act: 1, word: 'marquee', title: 'THE MARQUEE', year: '1970s',
    fact: 'The glowing sign on top of an arcade machine is the marquee. Behind the plastic is one long fluorescent tube — the same light as a classroom ceiling — left on all day.' },
  { id: 'act1-attract', act: 1, word: 'attract', title: 'ATTRACT MODE', year: '1970s',
    fact: 'An arcade machine with nobody at it plays itself. It is called attract mode — the cabinet putting on a little show for an empty room, hoping somebody walks over.' },
  { id: 'act1-initials', act: 1, word: 'initials', title: 'THREE LETTERS', year: '1979',
    fact: 'When you beat the top score on Asteroids in 1979, the machine let you type three letters beside it. Your initials sat on that screen until somebody else beat you.' },

  // ── ACTS 2-5 — NOT YET WRITTEN, and the shelves are uneven until they are ──
  //
  // Spec §5.5 wants FOUR PER ACT, twenty total, because "every shelf reads ◆ n / 4" and
  // uniformity is the feature. Act 1 is done; Acts 2-5 are an arcade-historian pass each
  // (Act 4 is the best-covered in the vault, Acts 2 and 5 the least). `cardsForAct`
  // tolerates an empty act by construction, so the layer stays inert where it is empty
  // rather than half-broken. Tracked in docs/ROADMAP.md.
];

// The act a level belongs to. Five acts of five levels — the one place this
// mapping is written down for the card layer.
export function actOfLevel(level) {
  const n = Number(level);
  if (!Number.isFinite(n) || n < 1 || n > 25) return null;
  return Math.floor((n - 1) / 5) + 1;
}

export function cardsForAct(act) {
  return ACT_CARDS.filter(c => c.act === act);
}

// Whether this save has earned the act-card layer at all. Derived from progress
// the game already stores — no new field, no migration (the INV-98 trick again).
export function actCardsUnlocked(furthestLevel) {
  const n = Number(furthestLevel);
  return Number.isFinite(n) && n >= ACT_CARD_UNLOCK_LEVEL;
}

export function pickGuaranteedActCard(act, collectedIds, rotation) {
  return pickFromPool(cardsForAct(act), collectedIds, rotation);
}

// Which BANK a card id belongs to, and how many of that bank a save has found.
//
// ⚠️ This exists because of a real latent bug, found by a design lane reading the
// code rather than by any test — including the INV-96 test that was written to
// guard exactly this area and missed it.
//
// `Slots.collectedCount()` counts EVERY id in the save's `cards` array, across
// all banks, because collection is stored as a flat id list (which is the right
// storage model). The level-complete card reveal printed that total against
// `TOTAL_CARDS`, which is the ARCADE bank only. `collectStationCard()` writes
// station ids into the same list — so the moment `WING_CARDS` stops being empty,
// a player who collects station cards and then wins a level reads:
//
//     CARD 63 OF 60
//
// INV-96 guarded the DENOMINATOR (the banks stay separate) and I never guarded
// the NUMERATOR. The counter has to be scoped to the same bank as the card being
// revealed, which is also the better feature: the line now tells the player WHICH
// collection they just advanced, which is the whole point of per-wing sets.
export function bankOf(id) {
  if (HISTORY_CARDS.some(c => c.id === id)) return 'arcade';
  if (WING_CARDS.some(c => c.id === id)) return 'wing';
  if (ACT_CARDS.some(c => c.id === id)) return 'act';
  if (KEY_CARDS.some(c => c.id === id)) return 'keyboard';
  return null;
}

// How many of `bank` this save has collected, and how many there are in total.
// Ids the game no longer knows (a card removed in a later build) are ignored
// rather than counted — a stale save must never read as MORE complete than the
// bank it is counted against (security.md rule 4: localStorage is untrusted).
//
// 'keyboard' counts KEY_CARDS only, so the reveal reads "KEYBOARD CARD 1 OF 1" —
// never an arcade total with a keyboard card folded into it (INV-154). Any other
// or unknown bank name keeps the legacy behaviour and counts the arcade.
export function bankProgress(bank, collectedIds) {
  const pool = bank === 'wing' ? WING_CARDS
    : bank === 'act' ? ACT_CARDS
    : bank === 'keyboard' ? KEY_CARDS
    : HISTORY_CARDS;
  const ids = new Set(Array.isArray(collectedIds) ? collectedIds : []);
  let found = 0;
  for (const c of pool) if (ids.has(c.id)) found += 1;
  return { found, total: pool.length };
}

// The wing's own cards for one station (may be empty — see above).
export function cardsForStation(wingId, stationId) {
  return WING_CARDS.filter(c => c.wing === wingId && c.station === stationId);
}

// The arcade cards this station points at, resolved to card objects. Unknown ids
// are dropped rather than throwing, so a typo in the table can never break a room.
export function crossRefCards(stationId) {
  return (STATION_CROSS_REFS[stationId] || []).map(cardById).filter(Boolean);
}

// Every card a station shows: its own first, then the arcade ones it references.
export function stationCards(wingId, stationId) {
  return cardsForStation(wingId, stationId).concat(crossRefCards(stationId));
}

// The guaranteed card for one visit to a station — the exact policy
// pickGuaranteedCard uses for a level (prefer uncollected, then rotate), applied
// to the station's OWN pool. Cross-referenced cards are never "earned" here:
// they already belong to the arcade, and handing one over again would award a
// card the player either already has or has not yet reached honestly.
export function pickGuaranteedStationCard(wingId, stationId, collectedIds, rotation) {
  return pickFromPool(cardsForStation(wingId, stationId), collectedIds, rotation);
}

// The ARCADE bank only. Never add WING_CARDS, ACT_CARDS or KEY_CARDS here.
export const TOTAL_CARDS = HISTORY_CARDS.length;

// All ARCADE cards (identity export — the collection gallery's arcade shelf renders
// over this). Deliberately excludes the other banks; each has its own export
// (WING_CARDS, ACT_CARDS, KEY_CARDS) and its own shelf.
export function allCards() {
  return HISTORY_CARDS;
}

// The pool of cards hidden at a given level (may be empty, one, or several).
export function cardsForLevel(level) {
  return HISTORY_CARDS.filter(c => c.level === level);
}

export function cardById(id) {
  return HISTORY_CARDS.find(c => c.id === id)
      || WING_CARDS.find(c => c.id === id)
      || ACT_CARDS.find(c => c.id === id)
      || keyCardById(id)
      || null;
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
  return pickFromPool(cardsForLevel(level), collectedIds, rotation);
}

// The policy itself, over any pool — extracted so the wing's station axis uses
// the SAME rule rather than a second implementation that could drift from it
// (the levels and the stations must feel identical to collect).
export function pickFromPool(pool, collectedIds, rotation) {
  if (!Array.isArray(pool) || !pool.length) return null;
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
