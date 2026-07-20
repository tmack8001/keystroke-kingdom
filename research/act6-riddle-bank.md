# Act 6 Riddle Bank
## Logic & word-play riddles for the Text Worlds' magical creatures

*Compiled 2026-07-18. This is a curated content proposal — a bank of ~30-40 riddles for
the three worlds of [[text-worlds|Act 6 — Text Worlds]] (`docs/features/text-worlds.md`):
**THE GREEN DRAGON** (prose adventure, `js/textworld/greendragon.js`), **THE GLIMMER
DEEP** (crystal cave), and **THE WHISPERWOOD** (old-magic forest) — the latter two built
on `js/textworld/tile-worlds.js`. **WIRED INTO THE GAME 2026-07-18:** this bank is now
the source for the shipped riddle pools — a shared `js/textworld/riddles.js` (`buildPool`/
`answerMatches`) drives rotating per-creature pools in both engines; the tile casts were
expanded (Glimmer Deep 6 creatures, Whisperwood 7) and the Green Dragon gained a typed
riddle sub-mode with Fern/badger/Astra/Quill/the Dragon. The two adaptations below (raven,
fortytwo) and the letters-only constraint were honored; the flagged dead alternates
(`'the river'`, `'a fox'`, `'7'`…) were cleaned out of the shipped data.*

### How to verify

Every claim below follows the arcade-historian citation standard: 2-4 references per
factual claim, preference order institutional/primary → established journalism →
Wikipedia as one of several, never alone; every URL appeared in a live search or was
directly fetched this session — none from memory. Roughly half the sources below were
independently fetched and are marked **[fetched]**; the rest are marked *(search result
only, not fetched)*. Historical facts already verified elsewhere in this repo's wiki
(Grace Hopper's moth, 42, xyzzy, the Konami Code, ELIZA, hello world, WOPR, ASCII) are
**reused by citing the existing wiki page**, per this task's instruction not to
re-derive — those pages carry their own full citation trails.

Two new atomic wiki pages were written to ground the genuinely new research in this
pass: [[riddles-in-the-dark]] (Tolkien's six *Hobbit* riddles, exact wording + 1937
publication) and [[localhost]] (127.0.0.1 / the "no place like home" pun).

---

## The hard engine constraint (read this before authoring anything else)

`js/textworld/tileworld.js`'s riddle-answer input handler is a strict allowlist:

```js
if (ch >= 'a' && ch <= 'z' && answer.length < ANSWER_CAP) { answer += ch; Audio.correct(); }
```

Confirmed by direct code read (2026-07-18): **only lowercase `a`-`z` keystrokes are ever
appended to the typed answer buffer** — no spaces, no digits, no punctuation, ever. The
buffer is matched via `answer.trim().toLowerCase() === answers[i].trim().toLowerCase()`,
capped at `ANSWER_CAP = 20` characters. This means **every accepted answer must resolve
to a single, letters-only word of ≤20 characters** — a multi-word or digit-containing
"answer" string in a riddle's `answers[]` array can *never actually be typed* and is
dead, unreachable data.

**Downstream code observation (flagged, not fixed — read-only per the boundary rule):**
the *already-shipped* `GlimmerDeep`/`Whisperwood` riddle data in `js/textworld/tile-worlds.js`
contains several such unreachable alternates: `'the river'`, `'a fox'`, `'a owl'`,
`'fire flies'` (all contain spaces) and `'7'` (a digit) for the rainbow-colors riddle.
These are harmless today only because each riddle also lists a reachable single-word
alternate (`'river'`, `'fox'`, `'owl'`, `'fireflies'`, `'seven'`) — but they are dead
weight and a trap for future authoring. **Every riddle in this new bank was designed
against the confirmed constraint from the start**: primary answer and every alternate
are single letters-only words, verified individually below.

---

## What already exists (for context — not part of this bank)

| World | NPC | Riddle topic | Answer(s) |
|---|---|---|---|
| THE GLIMMER DEEP | Glim the glow-worm | what the cave is full of | crystal, crystals, gem, gems |
| THE GLIMMER DEEP | Newt the cave-newt (gate) | the underground river | water, river, stream, ~~the river~~ |
| THE GLIMMER DEEP | Sella the stone turtle | rainbow colors | seven, ~~7~~ |
| THE WHISPERWOOD | Old Owl | what bird is asking | owl, ~~an owl~~, ~~a owl~~ |
| THE WHISPERWOOD | Rusty the fox (gate) | what animal is asking | fox, ~~a fox~~ |
| THE WHISPERWOOD | Blink the firefly | what the lights are | fireflies, firefly, ~~fire flies~~, bugs, lights |

*(Struck-through entries are the unreachable dead alternates noted above.)* These are
all **"what am I" creature-identity riddles** — exactly the style the task brief asked
this new bank to avoid. This bank is deliberately different in kind: logic and
word-play puzzles, not "guess the animal," matching classic riddle-game tradition
(Tolkien's Gollum never once asks "what creature am I").

THE GREEN DRAGON currently has **no riddle NPCs at all** — its content is a fixed typed-
command sequence (`take lamp` → `talk badger` → `light lamp`/`go in` → `greet dragon`).
This bank proposes riddle-asking creatures for it for the first time: **the Green Dragon
itself**, **the badger** (already a named character in the shipped content), and a new
proposed character, **Quill the old raven**, as a hall librarian.

---

## Section A — Classic Children's Literature (10)

Six riddles are adapted from Tolkien's *The Hobbit* (1937) — see [[riddles-in-the-dark]]
for exact original wording and full provenance. **These are deliberately warm paraphrases,
not verbatim quotations** — *The Hobbit*'s text remains under copyright to the Tolkien
Estate/HarperCollins; verbatim excerpts belong in the citation-only wiki page, not in
shipped game content. The remaining four draw on Alice's Adventures in Wonderland (1865),
Mother Goose riddle-rhymes, and a Byron letter-riddle that circulates in the same
tradition.

### A1 — TIME (adapted from Tolkien)
> "I eat up birds and beasts and trees and even the tallest mountain, bite by bite, and
> nothing can hide from me. I have swallowed every dragon that ever lived before you.
> What am I?"

- **World / creature:** Dragon-hall — **the Green Dragon** itself
- **Answer:** `time` · **Alternates:** `years`
- **Hint:** "You can't see me or hold me, but you always know when I've passed — I start with T."
- **Reward:** *"The old Dragon's eyes glow low and warm. 'TIME,' it rumbles. 'Even I must mind it. Well answered, small one.'"*
- **Difficulty:** trickier · **Source:** (a), see [A-refs]

### A2 — TEETH (adapted from Tolkien)
> "Thirty white shapes stand together on a warm pink hill. First they clack, then they clamp, then they go still. What are they?"

- **World / creature:** Dragon-hall — the Green Dragon
- **Answer:** `teeth` · **Alternates:** `tooth`
- **Hint:** "Open your mouth right now and you'll find thirty of them — starts with T."
- **Reward:** *"The Dragon grins wide, showing every one. 'TEETH! Sharp guess. Sharper set.'"*
- **Difficulty:** medium · **Source:** (a), see [A-refs]

### A3 — EGG (adapted from Tolkien)
> "I have no hinge, no key, no lid — yet inside me hides a treasure of pure gold. What am I?"

- **World / creature:** Dragon-hall — the Green Dragon
- **Answer:** `egg` · **Alternates:** `eggs`
- **Hint:** "Dragons guard piles of them, and so do hens — starts with E."
- **Reward:** *"The Dragon curls protectively around its hoard. 'An EGG, yes — mind you never crack one that isn't yours to crack.'"*
- **Difficulty:** medium · **Source:** (a), see [A-refs]

### A4 — FISH (adapted from Tolkien)
> "I am alive but I never breathe, and cold as stone but never dead. I drink and drink and I'm never thirsty, and I wear silver armor that never clinks. What am I?"

- **World / creature:** Cave — a new proposed NPC, **Fenn the cave-fish**
- **Answer:** `fish` · **Alternates:** `fishes`
- **Hint:** "I'm swimming right beside you in this cold river — starts with F."
- **Reward:** *"Fenn flicks a silver fin. 'A FISH — me, exactly! You looked right at the answer.'"*
- **Difficulty:** medium · **Source:** (a), see [A-refs]

### A5 — DARK (adapted from Tolkien)
> "You cannot see me, touch me, hear me, or smell me — yet I am everywhere the light hasn't reached. I was here before your torch, and I'll be here after. What am I?"

- **World / creature:** Cave — a new proposed NPC, **Nox the shade-serpent**
- **Answer:** `dark` · **Alternates:** `darkness`, `night`
- **Hint:** "It's what your torch is pushing back right now — starts with D."
- **Reward:** *"Nox uncoils from the shadows. 'The DARK, precisely. You've been standing in the answer this whole cave.'"*
- **Difficulty:** trickier · **Source:** (a), see [A-refs]

### A6 — WIND (adapted from Tolkien)
> "I have no voice, but I cry through the branches. I have no wings, but I flutter every leaf. I have no teeth, but I can bite your cheeks on a cold day. What am I?"

- **World / creature:** Forest — a new proposed NPC, **Silvermane the unicorn**
- **Answer:** `wind` · **Alternates:** `breeze`
- **Hint:** "It's moving the leaves above you right now — starts with W."
- **Reward:** *"Silvermane tosses her mane, and the trees answer. 'The WIND — you heard it before I even finished asking.'"*
- **Difficulty:** trickier · **Source:** (a), see [A-refs]

### A7 — RAVEN (adapted from Alice's Adventures in Wonderland) — ⚠ ADAPTED, flagged
> "Long ago, at a very silly tea party, a Hatter asked his guests why I was like a
> writing desk — and then admitted he had no idea himself! What kind of black, clever
> bird am I?"

- **World / creature:** Dragon-hall — a new proposed NPC, **Quill the old raven** (hall librarian)
- **Answer:** `raven` · **Alternates:** `crow` (a lenient near-miss, kept per the One Rule's forgiving spirit)
- **Hint:** "I'm perched right above the scrolls, black feathers and all — starts with R."
- **Reward:** *"Quill ruffles his feathers, delighted. 'A RAVEN! Correct — and still no one has ever answered the Hatter's actual riddle. Not even me.'"*
- **Difficulty:** easy · **Source:** (a), see [A-refs]
- **⚠ Flagged adaptation:** the original riddle — "Why is a raven like a writing desk?"
  — is *deliberately unanswerable* (that's the entire joke; Lewis Carroll himself said
  it "had no answer at all," per the source below). It structurally cannot resolve to
  a valid single-word answer for this engine. Rewritten here as a simple recall
  question ("what kind of bird is asking?") so it has a real, typeable answer, while
  keeping the reference and the wink to parents intact.

### A8 — ONE (Mother Goose / "As I was going to St Ives")
> "As I was going to a far-off town, I met a man with seven wives; each wife had seven
> sacks, each sack had seven cats, each cat had seven kits. Kits, cats, sacks, wives —
> how many of us were truly going to the town?"

- **World / creature:** Forest — a new proposed NPC, **Pip the woodsprite**
- **Answer:** `one`
- **Hint:** "Read it again — only ONE traveler is actually going anywhere. Everyone else is coming the other way. Starts with O."
- **Reward:** *"Pip cackles and spins in the air. 'Just ONE! Everybody always counts the cats. Nobody ever counts right.'"*
- **Difficulty:** trickier · **Source:** (a), see [A-refs]

### A9 — Letter E (attributed to Lord Byron)
> "I begin every 'eternity,' and I end every 'time' and every 'space.' I begin 'every
> end,' and I end 'every place.' What letter am I?"

- **World / creature:** Forest — **Old Owl** (already-built NPC, second riddle)
- **Answer:** `e`
- **Hint:** "Look at the very first letter of the word 'eternity.'"
- **Reward:** *"Old Owl blinks both eyes slowly. 'The letter E. A poet asked that one once, long ago. You'd have made him proud.'"*
- **Difficulty:** medium · **Source:** (a), see [A-refs]

### A10 — EGG (Humpty Dumpty, Mother Goose)
> "I sat high on a wall, round and smooth, until I had a great fall. Nobody could ever put me back together again. What was I?"

- **World / creature:** Forest — a new proposed NPC, **Willow the woodsprite**
- **Answer:** `egg` · **Alternates:** `eggs`
- **Hint:** "Humpty Dumpty was one of me — starts with E."
- **Reward:** *"Willow giggles. 'An EGG! Poor Humpty. Good thing you're much better at climbing walls.'"*
- **Difficulty:** easy · **Source:** (a), see [A-refs]

### [A-refs] References — Section A

1. [[riddles-in-the-dark]] — the local wiki page (7 refs of its own, incl. 3 direct fetches) supporting the exact original wording, 1937 publication date, and "traditional vs. nursery-book" provenance for A1-A6.
2. [Alice's Adventures in Wonderland — Wikipedia](https://en.wikipedia.org/wiki/Alice%27s_Adventures_in_Wonderland) — confirms November 1865 publication and the Mad Hatter's tea-party riddle. **[fetched]**
3. [Why is a raven like a writing desk? — The Straight Dope](https://www.straightdope.com/21342321/why-is-a-raven-like-a-writing-desk) — confirms the riddle was deliberately written with no answer, Carroll's 1896-preface joke answer, and the 1976-discovered "nevar" (raven backwards) wordplay. **[fetched]**
4. [As I was going to St Ives — Wikipedia](https://en.wikipedia.org/wiki/As_I_was_going_to_St_Ives) — confirms an c. 1730 manuscript origin, an August 4, 1779 magazine printing, and the "only one going" trick answer. **[fetched]**
5. [A Riddle, On the Letter E — All Poetry](https://allpoetry.com/A-Riddle,-On-The-Letter-E) / [Poetry Nook](https://www.poetrynook.com/poem/riddle-letter-e) — widely attributed to Lord Byron across multiple independent poetry-quotation databases; no scholarly critical-edition source was found to confirm authorship beyond that consistent attribution *(search result only, not fetched)*.
6. [Humpty Dumpty — Wikipedia](https://en.wikipedia.org/wiki/Humpty_Dumpty) — confirms earliest known publication in Samuel Arnold's *Juvenile Amusements* (1797), and that the rhyme is "probably originally a riddle" whose recorded answer (per an 1843 children's-magazine account by William Carey Richards) was "an egg." **[fetched]**

---

## Section B — Tech / Hacker / Gamer Culture (10)

All ten are matched to this game's existing built easter-egg canon (`.claude/rules/easter-eggs.md`,
[[hacker-culture]]) — this bank does not duplicate an existing egg's exact wording, it
asks a riddle *about* the same underlying fact, so a curious player who already found
the title-screen egg gets a satisfying "oh, I know this" moment rather than a repeat.

### B1 — MOTH (Grace Hopper's 1947 Mark II bug)
> "In 1947, a real little flying creature got stuck inside a giant computer and stopped
> it cold. Someone taped it into the logbook and wrote: 'First actual case of bug being
> found.' What kind of creature was it?"

- **World / creature:** Cave — a new proposed NPC, **Ora the ember-moth**
- **Answer:** `moth` · **Alternates:** `bug`
- **Hint:** "I have wings, I love the light, and I started a whole word — 'debugging.' I start with M."
- **Reward:** *"Ora flutters proudly toward your torch. 'A MOTH — that was practically my great-great-grandmother. We've been finding trouble in machines ever since.'"*
- **Difficulty:** medium · **Source:** (b) — [[mark-ii-moth-1947]], [[grace-hopper]]

### B2 — HOME (127.0.0.1)
> "There's a secret set of numbers — one, two, seven, zero, zero, zero, one — that every
> computer in the world can type to reach exactly the same place: itself. No matter
> which machine you're on, those numbers always lead you back... where?"

- **World / creature:** Dragon-hall — the Green Dragon
- **Answer:** `home` · **Alternates:** `localhost`
- **Hint:** "It's the place you always return to, no matter how far you've wandered — starts with H."
- **Reward:** *"The Dragon's hall glows warm around you. 'HOME. Yes. That's what this hall has always been, little one.'"*
- **Difficulty:** trickier · **Source:** (b) — [[localhost]]

### B3 — HELLO (hello world)
> "Almost every new computer program in the world says one word first, before it does
> anything else at all. It's the very first thing this whole game's own hidden computer
> ever said to you, too. What's the word?"

- **World / creature:** Dragon-hall — the Green Dragon
- **Answer:** `hello` · **Alternates:** `hi`
- **Hint:** "It's the friendliest word there is — starts with H."
- **Reward:** *"The Dragon lifts its great head. 'HELLO to you too. Every good story starts there.'"*
- **Difficulty:** easy · **Source:** (b) — [[hello-world]]

### B4 — FORTYTWO (42, Hitchhiker's Guide) — ⚠ ADAPTED, flagged
> "A giant thinking-machine once thought for seven and a half million years about the
> biggest question there is — Life, the Universe, and Everything. Then it gave one
> small answer: a number, spelled out as a single word with no space in the middle.
> What's the word?"

- **World / creature:** Cave — a new proposed NPC, **Deep the echo-bat** *(a deliberate pun: "Deep" living in the GLIMMER DEEP, echoing "Deep Thought")*
- **Answer:** `fortytwo`
- **Hint:** "It's the number between forty-one and forty-three, spelled out as one long word — starts with F."
- **Reward:** *"Deep swoops once around the cavern. 'FORTY-TWO. Deep Thought took seven and a half million years. You took one guess.'"*
- **Difficulty:** trickier · **Source:** (b) — [[forty-two]]
- **⚠ Flagged adaptation:** the real answer is the digit `42`, which the engine's
  letters-only input can never accept (confirmed against `tileworld.js` above). Rewritten
  to ask for the number spelled out as one unhyphenated word instead.

### B5 — XYZZY
> "In the very first computer adventure game ever made, one strange five-letter word
> did absolutely nothing — but everyone who played it typed it anyway, just to see.
> What's the word?"

- **World / creature:** Dragon-hall — the badger
- **Answer:** `xyzzy`
- **Hint:** "It's not a real word at all — just five letters in a row, and it starts with X."
- **Reward:** *"The badger snorts, amused. 'XYZZY. Nothing happens — every single time. And yet here you are, having typed it anyway.'"*
- **Difficulty:** medium · **Source:** (b) — [[xyzzy]], [[colossal-cave-adventure]]

### B6 — DUCK (rubber duck debugging)
> "When a programmer gets stuck on a tricky problem, some of them keep a little yellow
> bath-time friend on their desk. They explain the whole problem out loud to it, step by
> step — and halfway through, they often figure it out all by themselves. What kind of
> toy is it?"

- **World / creature:** Forest — a new proposed NPC, **Fen the duck**
- **Answer:** `duck` · **Alternates:** `rubberduck`
- **Hint:** "I float, I quack, and I'm usually yellow — starts with D."
- **Reward:** *"Fen the duck paddles in a proud little circle. 'A DUCK! I've solved more bugs just by listening than anyone gives me credit for.'"*
- **Difficulty:** easy · **Source:** (b) — [[proposed-egg-references]]

### B7 — A (the Konami Code's last button)
> "Some old video games hid a secret code of arrow-key presses that unlocked thirty
> extra tries. In this arcade, the very same code doesn't give extra lives — it gives
> extra stars. Up, up, down, down, left, right, left, right, B, and one more letter to
> finish it. What's the last letter?"

- **World / creature:** Cave — a new proposed NPC, **Grix the gate-golem**
- **Answer:** `a`
- **Hint:** "It's the very last button in the whole famous code — and it's also the first letter of the alphabet."
- **Reward:** *"Grix grinds aside, gate opening. 'The letter A. Thirty stars, small one — no lives needed.'"*
- **Difficulty:** medium · **Source:** (b) — [[konami-code]]

### B8 — DOCTOR (ELIZA)
> "Long before any computer could really think, one very old program pretended to be a
> kind of helper who just turns your own words into gentle questions back at you. What
> job did people say this program had?"

- **World / creature:** Forest — Old Owl (second riddle)
- **Answer:** `doctor` · **Alternates:** `therapist`
- **Hint:** "It's the job you visit when you need someone to listen — starts with D."
- **Reward:** *"Old Owl nods gravely. 'A DOCTOR, yes — though this one never once gave real advice. Just good questions.'"*
- **Difficulty:** medium · **Source:** (b) — [[eliza]]

### B9 — GAME (WOPR / WarGames)
> "In an old movie, a giant computer once asked a very important question before doing
> anything else at all: 'Shall we play a...' what?"

- **World / creature:** Dragon-hall — the Green Dragon
- **Answer:** `game` · **Alternates:** `games`
- **Hint:** "It's what we've been doing this whole time — starts with G."
- **Reward:** *"The Dragon's eyes glint with mischief. 'A GAME. Always. Shall we play another?'"*
- **Difficulty:** easy · **Source:** (b) — [[wopr-wargames]]

### B10 — ASCII
> "Every single letter you type gets turned into a number inside a machine. Back in
> 1963, a whole group of people agreed on exactly which number means which letter, so
> every computer would understand each other. The short name for that agreement is
> five letters, always written in capitals. What is it?"

- **World / creature:** Cave — a new proposed NPC, **Vell the vein-crystal**
- **Answer:** `ascii`
- **Hint:** "It's the secret code hiding behind every letter on this keyboard — starts with A."
- **Reward:** *"Vell's facets flare with light. 'ASCII! Every letter you've ever typed passed through me first, in a way.'"*
- **Difficulty:** trickier · **Source:** (b) — [[ascii]]

### References — Section B

Every fact in Section B is already independently cited on its linked wiki page — see
[[mark-ii-moth-1947]] (4 refs), [[grace-hopper]] (4 refs), [[localhost]] (4 refs, new
this pass), [[hello-world]] (4 refs), [[forty-two]] (3 refs), [[xyzzy]] (3 refs),
[[colossal-cave-adventure]] (4 refs), [[proposed-egg-references]] (rubber duck: 2 refs),
[[konami-code]] (3 refs), [[eliza]] (4 refs), [[wopr-wargames]] (3 refs), [[ascii]]
(4 refs). No claim in this section was re-derived from scratch — per this task's
instruction, existing verified wiki pages are the source of record.

---

## Section C — Modern Kids' Riddle Collections (14)

Sourced from two contemporary kids'-riddle roundups in the style the brief pointed to:
frugalfun4boys.com's "30 Riddles & Brain Teasers for Kids" and weareteachers.com's
"125 Entertaining Riddles for Kids of All Ages." Both were directly fetched this
session. These riddles are folk-classic in the sense that they circulate, near-
identically worded, across dozens of children's-riddle sites — the two named
collections are cited as the popular-source provenance the brief asked for, not as
sole originators of riddles this old.

### C1 — MAP
> "I have cities but no houses, forests but no trees, and rivers but no water. What am I?"

- **World / creature:** Dragon-hall — the badger
- **Answer:** `map` · **Alternates:** `maps`
- **Hint:** "Treasure hunters always carry one — starts with M."
- **Reward:** *"The badger unrolls a crinkled old page. 'A MAP, exactly. Every hoard needs one, even a dragon's.'"*
- **Difficulty:** easy · **Source:** (c), see [C-refs]

### C2 — EGG (modern riddle)
> "I have to be broken before you can ever eat me. What am I?"

- **World / creature:** Cave — a new proposed NPC, **Shell the geode**
- **Answer:** `egg` · **Alternates:** `eggs`
- **Hint:** "You crack me open at breakfast — starts with E."
- **Reward:** *"Shell splits open with a soft crystal crack. 'An EGG — well, a rock that WISHES it were one. Close enough.'"*
- **Difficulty:** easy · **Source:** (c), see [C-refs]

### C3 — BOOK
> "I have words but I never speak, and pages but I'm not a tree. What am I?"

- **World / creature:** Dragon-hall — Quill the old raven
- **Answer:** `book` · **Alternates:** `books`
- **Hint:** "You're reading one right now, in a way — starts with B."
- **Reward:** *"Quill taps a claw on an old leather cover. 'A BOOK. Every good hoard has a library too.'"*
- **Difficulty:** easy · **Source:** (c), see [C-refs]

### C4 — COIN
> "I have a head and a tail, but I have no body at all. What am I?"

- **World / creature:** Dragon-hall — the badger
- **Answer:** `coin` · **Alternates:** `coins`
- **Hint:** "Dragons sleep on piles of me — starts with C."
- **Reward:** *"The badger flips one, glinting. 'A COIN! You've got a good eye for treasure.'"*
- **Difficulty:** easy · **Source:** (c), see [C-refs]

### C5 — COMB
> "I have many teeth, but I can never bite anyone. What am I?"

- **World / creature:** Forest — a new proposed NPC, **Bramble the hedgehog**
- **Answer:** `comb` · **Alternates:** `combs`
- **Hint:** "You'd use me on your hair, not your dinner — starts with C."
- **Reward:** *"Bramble runs one gently through his own spikes. 'A COMB. Doesn't work so well on ME, but I appreciate the thought.'"*
- **Difficulty:** easy · **Source:** (c), see [C-refs]

### C6 — CLOCK
> "I have a face and two hands, but no arms and no legs at all. What am I?"

- **World / creature:** Cave — a new proposed NPC, **Tock the drip-stone**
- **Answer:** `clock` · **Alternates:** `clocks`
- **Hint:** "I tell you when it's time to go — starts with C."
- **Reward:** *"Tock drips once, right on schedule. 'A CLOCK. I've been keeping time in this cave since before you were born.'"*
- **Difficulty:** easy · **Source:** (c), see [C-refs]

### C7 — TOWEL
> "The wetter I get, the drier I've done my job. What am I?"

- **World / creature:** Forest — Willow the woodsprite (second riddle)
- **Answer:** `towel` · **Alternates:** `towels`
- **Hint:** "You use me right after a swim in the brook — starts with T."
- **Reward:** *"Willow wrings out a leaf like a tiny towel. 'A TOWEL! Even sprites need to dry off sometimes.'"*
- **Difficulty:** easy · **Source:** (c), see [C-refs]

### C8 — KEYBOARD
> "I have keys but I open no locks. I have space, but no room to stand in. You can enter me, but never really go inside. What am I?"

- **World / creature:** Dragon-hall — the badger *(a wildcard riddle — fits any world equally well, since it's the whole game's own object)*
- **Answer:** `keyboard` · **Alternates:** `keyboards`
- **Hint:** "Your fingers are resting on one right now — starts with K."
- **Reward:** *"The badger grins knowingly. 'A KEYBOARD, of course. You've been holding the answer this entire game.'"*
- **Difficulty:** medium · **Source:** (c), see [C-refs]

### C9 — SHADOW
> "Everyone has one following them on a sunny day, but no one has ever been able to lose it for good. What is it?"

- **World / creature:** Forest — a new proposed NPC, **Dapple the deer**
- **Answer:** `shadow` · **Alternates:** `shadows`
- **Hint:** "It's dark, it's flat, and it copies everything you do — starts with S."
- **Reward:** *"Dapple flicks an ear, glancing at her own dark shape on the moss. 'A SHADOW. Mine's been with me my whole life.'"*
- **Difficulty:** medium · **Source:** (c), see [C-refs]

### C10 — Letter M
> "I show up once in a minute, twice in a moment, but never once in a thousand years. What letter am I?"

- **World / creature:** Forest — Pip the woodsprite (second riddle)
- **Answer:** `m`
- **Hint:** "Look closely at the spelling of the word 'minute.'"
- **Reward:** *"Pip claps twice. 'The letter M! Sneaky, sneaky. Most travelers never even look at the letters themselves.'"*
- **Difficulty:** trickier · **Source:** (c), see [C-refs]

### C11 — Letter W
> "Every treasure hunter knows there's something waiting at the end of a rainbow. But the real answer isn't gold at all — it's just one letter. What letter is it?"

- **World / creature:** Dragon-hall — Quill the old raven (second riddle)
- **Answer:** `w`
- **Hint:** "Look at the very last letter of the word 'rainbow.'"
- **Reward:** *"Quill tilts his head. 'The letter W. Not gold — but I'll admit, it's a good trick.'"*
- **Difficulty:** medium · **Source:** (c), see [C-refs]

### C12 — Letter C
> "Which letter of the alphabet holds the most water of them all?"

- **World / creature:** Cave — Fenn the cave-fish (second riddle)
- **Answer:** `c`
- **Hint:** "Say the letter out loud — it sounds just like a big body of salt water."
- **Reward:** *"Fenn splashes happily. 'The letter C — it sounds just like SEA! I live in one, sort of.'"*
- **Difficulty:** medium · **Source:** (c), see [C-refs]

### C13 — GONE
> "How do you make the number ONE disappear completely? Add just one letter to the front of it."

- **World / creature:** Dragon-hall — the badger (second riddle)
- **Answer:** `gone`
- **Hint:** "Add a G to the very front of the word 'one.'"
- **Reward:** *"The badger snaps his fingers, and a coin vanishes from his paw. 'GONE! Works every time — with words AND with coins.'"*
- **Difficulty:** medium · **Source:** (c), see [C-refs]

### C14 — ECHO
> "I speak without a mouth and hear without ears. I have no body at all, but I come alive whenever you shout in a cave like this one. What am I?"

- **World / creature:** Cave — Deep the echo-bat (second riddle)
- **Answer:** `echo` · **Alternates:** `echoes`
- **Hint:** "Shout 'hello' in here and listen for what shouts it back — starts with E."
- **Reward:** *"Deep answers your own voice back to you, note for note. 'An ECHO — that's me, in a way. I just borrow other people's words.'"*
- **Difficulty:** easy · **Source:** (c), see [C-refs]

### [C-refs] References — Section C

1. [30 Riddles & Brain Teasers for Kids — Frugal Fun for Boys and Girls](https://www.frugalfun4boys.com/30-riddles-brain-teasers-for-kids/) — supports C1-C7 (map, egg, book, coin, comb, clock, towel) and C8 (keyboard). **[fetched]**
2. [125 Entertaining Riddles for Kids of All Ages — WeAreTeachers](https://www.weareteachers.com/riddles-for-kids/) — supports C1 (map, independently corroborating source #1), C9 (shadow), C11 (letter W / rainbow), C12 (letter C / sea), and C13 (ONE→GONE). **[fetched]**
3. [What comes once in a minute, twice in a moment... — Riddles.com](https://www.riddles.com/207) / [Brainzilla](https://www.brainzilla.com/brain-teasers/riddles/9VRkmxMz/what-occurs-once-in-a-minute-twice-in-a-moment-and-never-in-one/) — corroborate C10 (letter M) wording and answer across two independent riddle-aggregator sites *(search result only, not fetched)*.
4. [How do you make the number one disappear — Jokes by Scout Life](https://jokes.scoutlife.org/jokes/how-to-make-the-number-one-disappear/) — independent corroboration of C13 (ONE→GONE) beyond the WeAreTeachers listing *(search result only, not fetched)*.
5. ["I speak without a mouth and hear without ears" — USC Digital Folklore Archives](https://folklore.usc.edu/i-speak-without-a-mouth-and-hear-without-ears-i-have-no-body-but-i-come-alive-with-the-wind-what-am-i/) — a university folklore-archive source (stronger than a generic riddle-listicle) confirming C14 (echo) as a documented, widely-collected classic riddle *(search result only, not fetched)*.

---

## World / creature assignment summary

| World | Section A | Section B | Section C | Total |
|---|---|---|---|---|
| **THE GREEN DRAGON** (dragon-hall) | A1, A2, A3, A7 | B2, B3, B5, B9 | C1, C3, C4, C8, C11, C13 | 14 |
| **THE GLIMMER DEEP** (cave) | A4, A5 | B1, B4, B7, B10 | C2, C6, C12, C14 | 10 |
| **THE WHISPERWOOD** (forest) | A6, A8, A9, A10 | B6, B8 | C5, C7, C9, C10 | 10 |
| **Total** | 10 | 10 | 14 | **34** |

**Proposed new NPCs** (none yet coded — all are content proposals, matching the shape
`{ slot, char, color, name, riddle, answers, hint, reward, gate? }` of the existing
`npcs[]` arrays in `tile-worlds.js`, or a new equivalent for `greendragon.js`):
Quill the old raven, the Green Dragon itself as riddle-asker (dragon-hall); Fenn the
cave-fish, Nox the shade-serpent, Ora the ember-moth, Deep the echo-bat, Grix the
gate-golem, Vell the vein-crystal, Shell the geode, Tock the drip-stone (cave);
Silvermane the unicorn, Pip the woodsprite, Willow the woodsprite, Fen the duck,
Bramble the hedgehog, Dapple the deer (forest). Several riddles reuse an
**already-built** NPC for a second riddle (Old Owl asks A9 and B8; the badger asks B5,
C1, C4, C8, C13) — matching the existing pattern of one NPC owning one `slot` but
nothing in the engine restricts an NPC to exactly one riddle if a future content pass
wants to rotate through a pool.

---

## Downstream-impact flags

**None of this bank's content exists in shipped game code yet** — `js/textworld/tile-worlds.js`
and `js/textworld/greendragon.js` are unchanged by this research pass, so there is no
player-facing text to correct today. Two flags for whoever picks this bank up for an
actual authoring/coding pass:

1. **`js/textworld/tile-worlds.js` — dead unreachable answer alternates** (documented
   above under "The hard engine constraint"): `'the river'`, `'a fox'`, `'a owl'`,
   `'fire flies'`, and `'7'` can never be typed under the confirmed `a`-`z`-only input
   handler. Not a functional bug (each riddle has a working alternate), but worth a
   cleanup pass — and a cautionary example for whoever authors these new riddles into
   code, to never add a multi-word or digit alternate expecting it to be reachable.
2. **The Tolkien-derived riddles (A1-A6) must not ship as verbatim quotations.** The
   riddle text drafted in this bank is already an original paraphrase (never Tolkien's
   exact lines — see [[riddles-in-the-dark]] for the verbatim originals, quoted there
   only for citation/identification purposes). Whoever codes these into
   `tile-worlds.js`/`greendragon.js` should use the paraphrased riddle text above, not
   go back to Tolkien's book for "more accurate" wording.

## Corrections from citation pass

This is a new doc — there is no prior version to correct against. One correction was
made *during* drafting, before anything was finalized: the 42/Hitchhiker's-Guide riddle
(B4) was initially drafted with the answer `42`, then rewritten to `fortytwo` once the
engine's letters-only constraint was confirmed by reading `tileworld.js` directly — see
the ⚠ flag on B4 above.

## Unsourceable / weakly-sourced items

- **"There's no place like 127.0.0.1"** (used in B2/[[localhost]]) has no confirmed
  originator or date — it's documented only as recurring novelty T-shirt/sticker
  merchandise (Etsy, Redbubble, Amazon listings). The riddle text (B2) is written
  generically, without attributing the pun to any person, matching what the sources
  actually support.
- **The letter-E riddle's attribution to Lord Byron** (A9) is consistent across five
  independent poetry-quotation sites but was not confirmed against a scholarly
  critical edition of Byron's work — treated as "widely attributed to," not certain
  authorship.
- **Which specific *Hobbit* riddles are pre-Tolkien folklore versus drawn from
  Tolkien-era nursery books** cannot be traced riddle-by-riddle in the sources
  checked; Tolkien's own dual framing (per Wikipedia) is the most precise claim
  available and is what [[riddles-in-the-dark]] repeats.
- **"Why HELLO specifically is the canonical first-program word"** (B3) — same gap
  already noted in [[hello-world]] and [[hacker-culture]]: well-sourced as convention,
  not as a deliberately chosen pedagogical example beyond being short and recognizable.

---

*Related: [[text-worlds]] (`docs/features/text-worlds.md`, the shipped feature this bank
extends) · `.claude/rules/easter-eggs.md` + [[hacker-culture]] (the existing built
easter-egg canon this bank deliberately doesn't duplicate) · [[riddles-in-the-dark]],
[[localhost]] (new atomic wiki pages written for this pass) · [[legend-of-the-red-dragon]],
[[legend-of-the-green-dragon]] (THE GREEN DRAGON's own literary grounding) ·
[[proposed-egg-references]] (rubber duck sourcing, reused for B6) ·
[[ascii-overhead-world-conventions]] (its Q5 already researched the NetHack-Oracle /
Tolkien-"Doors of Durin" precedent for a riddle-posing NPC — this bank is the content
that precedent was scoped for; see that page's §Q5 for the mechanic-level grounding
this file doesn't repeat).*
