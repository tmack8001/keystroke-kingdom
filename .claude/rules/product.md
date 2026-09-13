# Product Design Document
## [Working Title: Home Row Heroes / Keystroke Kingdom]
*Built by Trevor & Oona - a father and daughter game*

---

## Vision

A retro arcade-themed typing game for young children who are simultaneously learning to type **and** read. The game grows with the child across both skills, never punishes them for mistakes, and delights both kids and the parents who grew up in the 70s, 80s, and 90s.

> *"The game should only ever stop a player's flow with joy, never with punishment. A child should leave every session feeling capable, not defeated."*

---

## Core Design Principles

### 1. Adaptive, Not Competitive
- The game adapts to the player's pace — if they're slow, the game slows with them
- Mistakes are a gentle nudge, never a punishment
- No lives lost. No timers running out. No forced failure states.
- **Survival Mode** is opt-in only — never the default

### 2. Flow Over Celebration Interruption
- Celebration from correctly typing a word = wonderful, let it happen
- Frustration from time pressure or life loss = never happens by default
- Big celebrations are saved for natural pause points (end of run, end of level)
- Mid-flow feedback is ambient — a glow, a subtle sound — never a full stop

### 3. Reinforce, Don't Punish
- Wrong key pressed → gentle nudge sound, letter **stays on screen and waits**
- Subtle visual hint appears (finger position guide)
- Correct key pressed → small celebration, move forward
- The game **never skips ahead** after a wrong keypress — correcting yourself is always rewarded, never penalized
- Mistakes are logged quietly in the background, never displayed alarmingly

### 4. Words Emerge Naturally
- Early levels use rhythm and nonsense patterns (pure muscle memory)
- Real words appear as soon as enough letters are unlocked
- Words are chosen to match early reading vocabulary — short, phonetic, recognizable
- Typing a real word they can read is a **double win** — never interrupted by the game

### 5. Graphic Quality Grows With the Player

The game's visual fidelity increases with every act, mirroring what was actually happening in the real world of gaming at that time.

When a child is learning their first two keys, the game looks like 1976 — one color, blocky rectangles, no sprites. By the time they're forming full sentences, the world surrounding those words is stunning. The more they know, the more beautiful everything becomes.

This is not just an aesthetic choice. It's a narrative one: typing unlocks the world.

| Act | Era | Graphic Quality |
|---|---|---|
| 1 — The Arcade | 1976–1982 | 1–8 color pixel art, rectangular sprites, no anti-aliasing |
| 2 — The Computer Wing | 1981–1986 | 16-color NES palette, scrolling backgrounds, character animation |
| 3 — The Basement | 1991–1996 | 16-bit SNES/Genesis, parallax, pre-rendered sprites |
| 4 — The Command Center | 1997–2000 | Early 3D, PS1/N64-era polygon rendering |
| 5 — Full Circle | Present | Modern shaders, particle systems, full resolution |

Within the typing UI itself, quality scales in parallel:
- Letter animations grow from a simple flash → colored glow → particle burst → 3D effect
- Background environments grow from a plain screen → a scene → a world
- Word completion effects grow from a line clear → a flourish → a cinematic beat

### 6. Stats Are Present But Never Looming
- Small retro scoreboard-style display tucked in the corner
- Tracks: accuracy, streak, keys learned — in pixel font, dimly styled
- No lives counter. No countdown timer.
- End-of-session summary styled as an arcade high score screen

---

## The World

### Setting
A glowing, buzzing **1979 arcade** — the kid's first time walking in. Cabinets line the walls. Each one is a different typing level. The arcade grows richer and more colorful as the player progresses, mirroring the real history of arcade game graphics.

### The Player
Default name: **Player One**
Customizable to any name (e.g. "Ready Oona!")

**The Name Moment** *(built 2026-07-12)*: the player's own name becomes typeable
content the instant the unlocked keys can spell it — often long before Level 24's
capitalized ceremony (e.g. lowercase "oona" is spellable at Level 12). At that first
level the name is injected as a guaranteed pattern right after the intro drills, and
completing it fires a one-time warm **golden flourish** (letters gild left-to-right, a
gold bloom, sparkles) — never a modal, never a pause. From that level on the name
returns occasionally as a familiar low-frequency visitor with the normal celebration.
Lowercase only (capitals need Shift); the untouched default **Player One** gets no
moment; the golden first time persists in `kk-progress` and never re-fires (a rename
earns a fresh one). Level 24's ALL-CAPS ceremony is unchanged.

### Opening Screen
Styled after the classic arcade "READY PLAYER ONE" prompt — with a nod to the Spielberg film of the same name. Dark background, dramatic retro-futuristic pixel typography, scanline effect, cabinet glow. Press **Space** or **Enter** to begin.

### The Mystery Cabinet
In a dark corner of the arcade: a cabinet draped in a velvet curtain, barely glowing underneath. Caution tape. Nobody knows what game is inside. It can only be unlocked by mastering all 8 home row keys. When the curtain drops — it's not just a game. It's a **computer**. The first glimpse that typing unlocks something far bigger than the arcade.

> *The mystery is the gateway to STEM — letters become words become language become knowledge.*

---

## Level Structure

### Level 1 — J & F
- **Era:** Atari / Pong (1977–1979)
- **Visuals:** Black background, blocky single-color pixels, minimal
- **Music:** Simple, bright chiptune rhythm — pure muscle memory, no words yet
- **Content:** j, f, jf, fj — rhythm and repetition only

### Level 2 — D & K
- **Era:** Pac-Man / Donkey Kong (1980–1981)
- **Visuals:** More color, early character movement
- **Music:** Upbeat, energetic — slightly more complex than Level 1
- **Content:** d, k, dk, jf — still mostly patterns, hints of structure

### Level 3 — S & L
- **Era:** Early NES (1983–1985)
- **Visuals:** Richer backgrounds, characters emerging
- **Music:** Call-and-response melody — left hand (S,D,F) answered by right hand (L,K,J)
- **Content:** Still pattern drills, no real words yet — J F D K S L has no vowel, so nothing is spellable. But it's the richest pattern level yet: both ring fingers now in play, full six-key call-and-response rhythm across both hands.

### Level 4 — A & The Mystery Key (;)
- **Era:** SNES / Early 90s Arcade glory
- **Visuals:** Full color, rich backgrounds, dramatic reveal
- **Music:** Starts mysterious and suspenseful, builds to massive celebratory fanfare
- **Content:** Full home row unlocked, and with A comes the first real words the player can read: **dad, sad, fad, lad, ads, lads, lass, flask, falls, dads, asks, salad**. The double win — a whole level of patterns pays off the instant a real, readable word appears.
- **The Mystery Key:** Never referred to as "semicolon" — it's *"the eighth key," "the final key," "the key to the right of L," "pressed by the right pinky"*
- **Completion:** Huge celebration — the Mystery Cabinet begins to glow

### The Mystery Cabinet — Final Level
- **Era:** The future — early personal computing
- **Reveal:** The curtain drops. It's a computer, not just a game.
- **Meaning:** Typing unlocks the next digital frontier — STEM, creativity, the world

---

## Word Progression

| Stage | Keys Available | Example Words |
|---|---|---|
| Levels 1–3 | J, F, D, K, S, L | Patterns only — no vowel yet, nothing spellable |
| Level 4 | + A, ; | dad, sad, fad, lad, ads, lads, lass, flask, falls |
| Reaching Keys | + vowels (E, I, O, U) | lake, safe, jade, dusk, file |

Words are chosen to be:
- Phonetically simple
- Recognizable to early readers
- Short (3–5 letters initially)
- Gradually expanding in complexity

---

## Toggleable Settings

*Built 2026-07-11 — press **Tab** on the title screen or pause menu. Persisted in
localStorage. The play-style naming: **ADVENTURE** ("no timers, no lives — just you and
the keys", the default, always) vs **SURVIVAL** ("quarters on the line — 1979 rules").*

| Setting | Default | Options |
|---|---|---|
| Play Style | ADVENTURE | SURVIVAL (opt-in; time pressure only — wrong keys NEVER cost anything) |
| Lives (quarters) | 3 | 1–5 (Survival only) |
| Difficulty | NOVICE | ARCADE / EXPERT — classic tiers, tuned "challenging, never cruel"; 15-streak earns a quarter back; game over is warm |
| Experience | FIRST QUARTER (1x) | REGULAR (1.5x) / HOTSHOT (2.25x) / WIZARD (3.5x) — scales how much typing a level requires before it can be won, to a player's typing experience (never age). A higher tier is MORE play, never a penalty; works in both Adventure and Survival. Scales the engine minimum-patterns gate and wired themes' win targets (Tetris, Q\*bert); other themes scale via the engine minimum |
| Min Word Length | ANY | 3 / 4 / 5 / 6 / 7 — raise to drop the easy short words. *(built 2026-07-13)* |
| Max Word Length | ANY | 4 / 5 / 6 / 7 / 8 / 10 / 12 / 16 / 24 — raise to allow longer, harder words; 24 is the WIZARD-equivalent top rung. *(built 2026-07-13)* |
| Hints | Moderate | Subtle / Obvious |
| Mistakes Shown | Small | Hidden / Prominent |
| Sound | ON | OFF |
| CRT Effect | ON | OFF (accessibility) |
| Stats Display | ON | OFF |
| Player Name | Player One | Customizable (title screen; persisted) |
| Erase All Progress | — | Y/N confirm required |
| Visual Theme | 1979 Arcade | Future: expandable (Oona's ideas!) — see docs/ROADMAP.md |

### EXPERIENCE also buys FIDELITY, not just volume *(Trevor, 2026-09-13 — direction)*

Until now EXPERIENCE scaled one axis: **how much** a level demands (a longer road, more
patterns). Trevor added a second:

> *"when on wizard mode sure let's make these games more similar to their origins… wizard mode
> can make it harder and more realistic to the original game play."*

**So a higher tier also buys a MORE FAITHFUL RECREATION of the original game.** The 25 cabinets
are deliberately typing games wearing a classic game's clothes (`theme-authoring.md` requires the
SCENE to show the signature mechanic operating, never the player's hands to perform it) — and at
WIZARD a theme may push that scene closer to how the original actually played. This is a genuine
reward for the player who wants one, in a game that otherwise keeps its cabinets gentle.

**The contract that made EXPERIENCE safe is unchanged and still absolute: a higher tier is MORE
play and MORE fidelity, never a penalty.** Three things that follow, and they bind:
- **It is opt-in.** EXPERIENCE is player-chosen and defaults to FIRST QUARTER. A child never
  lands in WIZARD by accident, so no added fidelity ever arrives uninvited.
- **Fidelity may never import a failure state.** The original's game-over, lives, timers,
  placement and grades stay in the original. What crosses over is how the world LOOKS and
  BEHAVES, not what it takes from you.
- **Winnability is untouched at every tier.** The One Rule floor holds: a level must remain
  completable at 3.5× exactly as at 1×.

**The mechanism Trevor proposed for the rhythm act is the model for the whole idea, and it is
worth stating as a pattern:**

> *"have the band/tune fall out of rhythm or out of pitch so it sounds wrong, but you aren't
> punishing the child — they can still advance slower through it, which would be the same they
> would do playing an instrument they aren't experts at anyway."*

**A consequence that is HONEST and AUDIBLE but costs nothing.** Fall behind the beat and the band
drifts out of time; the music tells you the truth, and takes nothing away. You still finish. It is
the gentle-nudge sound scaled up to a whole band — the same shape as the sacred wrong-keypress
contract, where the game tells the child something is off and then waits for them.

It also solves the rhythm genre's central collision. A rhythm game normally needs a **timing
window that gates**; here the timing window **degrades the music instead of gating the player**.
You can be off-beat for an entire song and still reach the end — which is exactly what a real
beginner on a real instrument experiences, and nobody stops them either.

**The general form, reusable by any act:** at higher tiers, let the world respond more truthfully
to how well the player is doing — in look, sound and behaviour — while the path forward stays
open. Consequence without cost.

### Word Length — the difficulty lever that ages with the player *(built 2026-07-13)*

**Design tenet (Trevor):** the game must **age with the player** — it stays fun and
challenging as the player grows in age *and* keyboard skill, not only for the early
readers it was founded for. This is true to the arcade analogy: arcades were always
for adults just as much as kids. The fixed curriculum "grows with the child" (keys
unlock, graphics improve) but that arc *ends* at Level 25. Player-set difficulty levers
are how the game keeps growing past it.

**EXPERIENCE** was the first such lever (how much a level demands). **MIN/MAX WORD
LENGTH** is the second, on the word-content axis: shorter words = easier (younger/newer
hands), longer words = harder (older/keyboard-savvy). Both default to **ANY** — a fresh
Settings screen changes nothing. The hard end has real headroom: MAX climbs past the
early-reader ceiling of 8 in single steps to **24**, the aspirational top rung that
mirrors EXPERIENCE's WIZARD, so a savvy player can crank genuine difficulty. The MIN
floor likewise climbs (ANY, then 3…12) so a player can *demand* long words. The wordgen
generation ceiling matches at 24, and the generation prompt itself **ages with the
player**: a request for long words drops the early-reader framing and asks the model for
harder vocabulary. (This was measured, not assumed — the fixed early-reader prompt was
found to actively suppress long words, so it's now length-aware; see journal.) The
longest words are served by both the curated static banks and generation; the engine
filter honors the full setting, and winnability always falls back where a level's keys
can't spell words that long.

It is a **best-effort suggestion, never a wall**: winnability is the One Rule floor and
is never traded for it. If a chosen range can't be met at a level (a high minimum at an
early level whose few keys can't spell long words), that level quietly falls back to its
own words — it can never become unwinnable. Guaranteed content (intro drills,
history-card moment words, the player's name) is never filtered. Levels 1–3 (no real
words) are a natural no-op. Word banks were expanded across the full length spectrum so
the lever has real content to select at both ends.

---

## The Stats Cabinet
A dedicated arcade cabinet in the world the player can walk up to any time. Displays:
- Accuracy over time (simple graph)
- Keys learned
- Words unlocked
- Session history

Styled as a retro arcade high score board. Makes data exploration feel like part of the game, not homework. A quiet STEM moment built into the world.

---

## Free Play *(built 2026-07-11)*
Press **F** on the level-select screen: play ANY cabinet with the full keyboard, typing
real sentences (cabinet-flavored + shared early-reader pools), with live WPM shown.
Speed is displayed, never enforced. Completion returns to the arcade for cabinet-hopping.

## History Cards *(built 2026-07-11; grown into a completionist system 2026-07-19)*
Computing/gaming-history moments hidden in the curriculum — each "moment word" is typeable
with exactly the level's unlocked keys (`ada` the moment home row completes; ARPANET's
crashed "LO" login on the 1/0 level; `Eniac` in capitals; `hello world` at the end).
Typing one mid-play earns only a gold glint (flow is never interrupted); at level complete,
a little business card is "picked up off the arcade floor" with the story. A card is always
guaranteed — a level won't end until a moment word has appeared.

**The collect-them-all loop (2026-07-19; hacker-culture batch 2026-07-27):** the bank grew
from 17 to **54 cards** (+1 SECRET card = 55 total), **every level carded**, now **several
cards per level** as a rotating POOL. *(The 2026-07-27 batch adds a 1970s–90s hacker/phreak/
underground layer — war dialing, trashing, Legion of Doom/Masters of Deception, phone
phreaking, the Hacker Ethic, spam's origin, the first BBS, the Hacker Manifesto, Phrack,
cyberpunk, the acoustic coupler, 2600 magazine — all "curiosity, not crime";
research/hacker-culture.md.)*
Each play surfaces exactly ONE guaranteed card — preferring one not yet collected in this
save, rotating for variety — so a level with N cards takes ~N visits to fully collect. This
is a deliberate Skulltula-style completionist hook (Trevor: the kids love the cards, so
reward replay): a per-game **"★ found / total"** counter shows on the slot picker, and a
browsable **collection gallery** (found cards revealed, still-locked ones shown as `???`
silhouettes to tease replay) is reachable with **C** from the picker. Each card attaches to
the EARLIEST level where its word becomes typeable. **Secret cards** (e.g. the WarGames
`joshua` card) are found only by typing a magic word — a hidden Skulltula that still counts
toward the total. Collection is stored **per save slot** (see Save Slots below). Research
(all citation-verified): `research/computing-history-moments.md`.

## Save Slots — a saved game per player *(built 2026-07-19)*
The single global save became **any number of independent saved games** (no cap — a family
can have as many players as it likes; Trevor: "no reason to limit"), so a shared machine
holds a game each for Oona, a sibling, a parent, a grandparent. Returning players land on a
**"CHOOSE YOUR GAME"** slot picker (the new front door, replacing the old continue screen):
each slot shows its **name, level, and ★ cards-found count**; Space resumes, N starts a new
game, X erases (Y/N confirm), C browses that game's card collection. The **player name is
now per-slot**; global machine preferences (sound, CRT, difficulty tiers) stay shared. A
pre-slots single save auto-migrates into Slot 1 the first time — no returning player ever
loses their game. The first-time cold open is untouched; it simply creates Slot 1 on the
first name confirm. Data model + storage: `js/slots.js` (`kk-slots`).

## The Hidden Layer *(built 2026-07-10)*
A hacker-culture easter-egg layer: the title screen listens for old magic words, the
browser console greets the curious, and the Level 20 terminal whispers history.
Catalog + design rules: `.claude/rules/easter-eggs.md`. Research: `research/hacker-culture.md`.

## Music
Original songs generated via Google Lyria, one per level. Each matches the era and emotional arc of its level. See separate music prompt documents for Lyria generation details.

---

## Inspirations
- Mario Teaches Typing (1992)
- Mavis Beacon Teaches Typing
- Ready Player One (Spielberg, 2018)
- The actual 1979 arcade experience
- Oona

---

*This is a living document. Built with love by a dad and his daughter.*
