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

### 5. Stats Are Present But Never Looming
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
- **Content:** First real words appear: **ads, lads, falls, flask,lass**

### Level 4 — A & The Mystery Key (;)
- **Era:** SNES / Early 90s Arcade glory
- **Visuals:** Full color, rich backgrounds, dramatic reveal
- **Music:** Starts mysterious and suspenseful, builds to massive celebratory fanfare
- **Content:** Full home row unlocked: **dad, sad, fad, lad, lass, flask, skull, falls**
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
| Levels 1–2 | J, F, D, K | Patterns only |
| Level 3 | + S, L | ads, lads, falls, flask |
| Level 4 | + A, ; | dad, sad, fad, lad, skull |
| Reaching Keys | + vowels (E, I, O, U) | lake, safe, jade, dusk, file |

Words are chosen to be:
- Phonetically simple
- Recognizable to early readers
- Short (3–5 letters initially)
- Gradually expanding in complexity

---

## Toggleable Settings

| Setting | Default | Option |
|---|---|---|
| Survival Mode | OFF | Toggle ON |
| Time Limits | OFF | Toggle ON |
| Lives | OFF | Toggle ON |
| Finger Tracking Strictness | ON (gentle) | Strict / Off |
| Hint Aggressiveness | Moderate | Subtle / Obvious |
| Mistake Visibility | Small on-screen | Hidden / Prominent |
| Player Name | Player One | Customizable |
| Visual Theme | 1979 Arcade | Expandable (Oona's future ideas!) |

---

## The Stats Cabinet
A dedicated arcade cabinet in the world the player can walk up to any time. Displays:
- Accuracy over time (simple graph)
- Keys learned
- Words unlocked
- Session history

Styled as a retro arcade high score board. Makes data exploration feel like part of the game, not homework. A quiet STEM moment built into the world.

---

## Music
Original songs generated via Google Lyria, one per level. Each matches the era and emotional arc of its level. See separate music prompt documents for Lyria generation details.

---

## Inspirations
- Mario Teaches Typing (1991)
- Mavis Beacon Teaches Typing
- Ready Player One (Spielberg, 2018)
- The actual 1979 arcade experience
- Oona

---

*This is a living document. Built with love by a dad and his daughter.*
