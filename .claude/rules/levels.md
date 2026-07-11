# Level Scaffolding Reference
## Keystroke Kingdom — Full Curriculum Arc

---

## Why This Order

Every major typing program (Mario Teaches Typing, Mavis Beacon, Dance Mat Typing, TypingClub) teaches keys in the same sequence for the same physiological reasons:

1. **Home row first** — fingers rest here. Muscle memory is free.
2. **E and I next** — the two most-used vowels in English, sitting directly above D and K (middle fingers reach straight up). Also unlocks hundreds of real words immediately.
3. **R and U** — index fingers reach up and in. Common letters; opens "her," "sir," "fur," "rule."
4. **T and Y** — the deepest index finger reaches. T is the #2 most common letter. Y finally means real sentences are possible.
5. **W and O** — ring fingers up. O unlocks "word," "world," "flow," "know."
6. **Q and P** — pinky fingers up. Q is the rarest; P completes the top row. Milestone: full top row done.
7. **Bottom row in finger pairs** — V/M (index), B/N (index center), C/comma (middle), X/period (ring), Z/slash (pinky).
8. **Numbers** — different conceptual layer. Index fingers inward from 5/6 outward.
9. **Shift** — two-hand coordination. The last new mechanical concept.

---

## Progressive Graphic Quality — Core Design Principle

**The game's visual fidelity increases with every act, mirroring what was actually happening in the real world.**

When Oona is learning her first two keys, the game looks like 1976 — one color, blocky rectangles, no sprites. By the time she's forming full sentences, the world surrounding her words is stunning. The gameplay teaches her keyboard history at the same time it teaches her the keyboard itself.

This is not just an aesthetic choice. It's a narrative one: the more she knows, the more beautiful the world becomes.

| Act | Levels | Era | Graphic Quality |
|---|---|---|---|
| 1 — The Arcade | 1–5 | 1976–1982 | 1–8 color pixel art, no anti-aliasing, rectangular sprites |
| 2 — The Computer Wing | 6–10 | 1981–1986 | 16-color NES palette, scrolling backgrounds, character animation |
| 3 — The Basement | 11–15 | 1991–1996 | 16-bit SNES/Genesis, parallax, pre-rendered sprites |
| 4 — The Command Center | 16–20 | 1997–2000 | Early 3D, PS1/N64-era polygon rendering |
| 5 — Full Circle | 21–25 | 1980–Present | Levels 21–23: 1–8 color arcade pixel art (The Corner Cabinets). Levels 24–25: modern shaders, particle systems, full resolution |

Within the game's own typing UI, quality scales in parallel:
- **Letter animations** evolve from a simple flash → colored glow → particle burst → full 3D effect
- **Background environments** grow from a plain black screen → a scene → a world
- **The keyboard diagram** evolves from a flat pixel outline → a lit-key graphic → a photorealistic 3D render
- **Word completion effects** grow from a simple line clear → a flourish → a cinematic beat

---

## Act Structure

| Act | Levels | Setting | Keys | Milestone |
|---|---|---|---|---|
| 1 — The Arcade | 1–5 + Mystery | 1979 arcade floor | A S D F G H J K L ; | Full home row |
| 2 — The Computer Wing | 6–10 | Back room revealed by Mystery Cabinet | E I R U T Y W O Q P | Full top row |
| 3 — The Basement | 11–15 | Underground club / LAN den | V M B N C , X . Z / | Full letter keyboard |
| 4 — The Command Center | 16–20 | Late-90s server room | 1 2 3 4 5 6 7 8 9 0 | Full number row |
| 5 — Full Circle | 21–25 | The arcade's corner cabinets, then back to the arcade | - = [ ] \ ` ' Shift Space Backspace | Full keyboard |

---

## Opening Screen & Onboarding

### First-Time Player Flow

Cold open (3s, dark arcade, one cabinet glows) → title screen "READY PLAYER ONE!" with "INSERT COIN" wink and "PRESS SPACE TO BEGIN" → name entry (pre-filled "PLAYER ONE," 12-char cap, any key clears, Return/Space confirms, saves to localStorage) → "READY [NAME]!" reveal (2s) → slow pan across dark arcade to lit Level 1 cabinet, "START HERE" prompt → letter `j` appears with one-time unprompted finger diagram beneath it.

*Full phase-by-phase cinematic detail: see `levels-transitions.md`*

### Returning Player Flow

localStorage has the player's name and level progress. No cold open. The session starts at:

```
READY [NAME]!

LEVEL 3 — S & L
KEYS LEARNED: J F D K

PRESS SPACE TO CONTINUE
```

Space takes them back to exactly where they left off — same level, same position in the word sequence. A second option sits below, dimmer:

```
PRESS R TO RESTART
```

R triggers a confirmation before doing anything:

```
ERASE ALL PROGRESS?

Y — YES, START OVER
N — NO, KEEP GOING
```

Only Y clears localStorage. N or any other key returns to the continue screen.

### The Arcade at Level 1

At Level 1, only one cabinet is lit. The rest are dark silhouettes — no labels, no indication of what's in them. The Mystery Cabinet is in the far corner, barely visible, no glow yet. As levels complete, cabinets light up one by one in the order the player earns them. By Act 5's Full Circle, every cabinet is on — the room that was nearly dark is now exactly as bright as 1979 at peak hours.

### Design Rules for the Opening

- **Name entry is optional in one keypress.** Never trap a kid in a form.
- **The arcade is never explained.** No "here's how to play" screen. The visual design carries it.
- **The cold open is shown exactly once.** The drama of first arrival is preserved; returning players skip straight to their name.
- **The first finger guide is the only unprompted hint in the whole game.** Every other hint appears only after a wrong keypress. This exception is intentional — the player has zero context at the very first prompt and needs a single orientation moment.
- **"INSERT COIN" does nothing.** It's set dressing. Don't wire it to anything.

---

## Act 1 — The Arcade (Levels 1–5)

**Setting:** A glowing 1979 arcade. Every game here is a genuine coin-op cabinet from the era. Graphics start at their most primitive and slowly gain color and complexity as new keys unlock. The entire home row lives in the 70s and early 80s — no jumping ahead.

---

### Level 1 — J & F
- **New keys:** J (right index), F (left index)
- **Game:** Breakout — Atari, 1976
- **Era:** 1976
- **Graphic quality:** 1-bit black and white. A rectangle paddle, a square ball, rectangular bricks. Zero curves. Zero sprites. The raw beginning.
- **Palette:** Pure black, pure white. Nothing else.
- **Music:** Single-tone bleeps, no melody. A metronome with a pitch. Lyria prompt: *"single beeping tone, rhythmic and simple, like an early Atari — no harmony, just pulse"*
- **Content:** j, f, jf, fj — rhythm and repetition only. No words.
- **Narrative beat:** The arcade is dark. One cabinet glows.

---

### Level 2 — D & K
- **New keys:** D (left middle), K (right middle)
- **Game:** Space Invaders — Taito, 1978
- **Era:** 1978
- **Graphic quality:** 2-color. One foreground color over black — white or green silhouette sprites. More shapes than Level 1, but still no faces, no personality. Motion appears for the first time: the invaders march.
- **Palette:** Black background, single phosphor-green or white for all sprites
- **Music:** Descending 4-note pulse, increasing tempo. Lyria prompt: *"iconic descending chiptune march, four notes looping faster and faster, building tension without ever breaking"*
- **Content:** d, k, dk, jf — still patterns only
- **Narrative beat:** A second cabinet lights up beside the first.

---

### Level 3 — S & L
- **New keys:** S (left ring), L (right ring)
- **Game:** Pac-Man — Namco, 1980
- **Era:** 1980
- **Graphic quality:** 4 colors. Yellow character, colored ghosts, blue maze on black. The first recognizable face in the game. The first world with rooms to navigate.
- **Palette:** Black, yellow, blue, red/pink/cyan/orange (ghost colors)
- **Music:** Waka-waka energy — playful, looping. Lyria prompt: *"bright bubbly chiptune loop, chomping rhythm, four-color fun — joyful and slightly frantic"*
- **Content:** First real words: **ads, lads, falls, flask, lass**
- **Narrative beat:** The arcade floor gets a little brighter. You can read the signs on the walls now.

---

### Level 4 — A & the Eighth Key
- **New keys:** A (left pinky), ; (right pinky — never called "semicolon")
- **Game:** Galaga — Namco, 1981
- **Era:** 1981
- **Graphic quality:** 8+ colors. Rainbow alien formations, starfield depth, multi-frame animation. The biggest visual step yet in Act 1 — sprites have color variety, formations have geometry. The screen feels alive.
- **Palette:** Deep space black, with colorful bug sprites in red, blue, yellow, green, white
- **Music:** Fast, cosmic, staccato. Formation patterns in the music mirror the alien grids. Lyria prompt: *"upbeat space chiptune, staccato burst rhythms, rising arpeggios — the sound of precision at speed"*
- **Content:** Full home row: **dad, sad, fad, lad, lass, flask, skull, falls, gash, slag**
- **The eighth key:** Never "semicolon." The right pinky finally has a home. *"Press the eighth key — the one your right pinky has been waiting for."*
- **Completion:** The Mystery Cabinet, dark in the corner, begins to glow.
- **Narrative beat:** You played four cabinets. Something in the back of the arcade noticed.

---

### Level 5 — G & H
- **New keys:** G (left index reach), H (right index reach)
- **Game:** Joust — Williams, 1982
- **Era:** 1982
- **Graphic quality:** Fluid animation that feels almost physical — knights on ostriches with genuine wing-flap cycles, lava that bubbles and ripples, enemies that react. Still blocky, still 8-bit, but the motion is the most lifelike so far. The arcade has reached its classic peak.
- **Palette:** Orange lava glow, black sky, tan knights — warm and fiery
- **Music:** Driving, competitive energy. Lyria prompt: *"fast medieval chiptune with driving rhythm — urgent, physical, lava-hot. Two knights, two hands."*
- **Content:** shag, slag, dash, gash, glad, half, lash, gal, flag, flash, glad
- **Narrative beat:** The Mystery Cabinet's glow intensifies. The caution tape flickers.

---

## Mystery Beat — The Reveal Sequence

**Trigger:** Final word of Level 5 typed correctly. ~50 seconds. Skippable after first completion (Space or Escape). Replayable from Stats Cabinet.

**Summary:** Joust fanfare fades → silence → Mystery Cabinet pulses amber, caution tape falls pixel by pixel → curtain drops, PC speaker boot tones (C, E, G) → terminal types "HELLO. YOU FOUND ME. COME IN." (keyclick sounds, no music) → door opens in arcade back wall revealing Computer Wing → ACT 2 / THE COMPUTER WING title card.

*Full cinematic sequence: see `levels-transitions.md`*

---

## Act 2 — The Computer Wing (Levels 6–10)

**Setting:** A long room behind the Mystery Cabinet. Computers and consoles from different eras line the walls, each one running a classic game. The scanline effect softens slightly. Colors deepen. The world becomes richer as fingers reach further from home.

**Graphic quality jump:** Act 2 begins where Act 1 peaked — and keeps climbing. By Level 10, you're in the full NES era with scrolling worlds and expressive characters.

---

### Level 6 — E & I
*"Middle fingers reach up — just one row"*

- **New keys:** E (left middle, up from D), I (right middle, up from K)
- **Why first:** E is the most common letter in English. E and I sit directly above the middle fingers' home position — the most natural first reach. Mario Teaches Typing, Dance Mat, and TypingClub all start here.
- **Game:** Donkey Kong — Nintendo, 1981. The bridge piece. Technically still an arcade game, but the platforming storytelling, the character arc (rescue the girl, dodge the barrels), and the personality of its sprites signal a new era is beginning. The cabinet is mounted at the entrance to the Computer Wing.
- **Era:** 1981 Arcade / early Nintendo
- **Graphic quality:** 16 colors, platform layering, character personality in sprites. Donkey Kong's expressive shrug and Mario's death animation were genuinely new things in 1981 — games started having characters, not just objects.
- **Palette:** Brick red, tan girders, warm orange barrel glow, blue sky
- **Music:** Jaunty, syncopated — rolling percussion. Lyria prompt: *"playful arcade chiptune, syncopated rhythm, barrel-rolling energy, bright and mischievous — a game with a personality"*
- **Words unlocked:** idea, aide, side, hide, said, sail, fail, hail, like, hike, file, skill, lake, fake, deal, feel, heal, seal, lead, head, dead, field, slide
- **Narrative beat:** "You stepped through the door. The machines here are different — you can touch them."

---

### Level 7 — R & U
*"Index fingers reach up and in"*

- **New keys:** R (left index, up-left from F), U (right index, up-left from J)
- **Why here:** R is the 5th most common letter in English. U unlocks "her," "sir," "rule," "fire" immediately. Both are index finger reaches.
- **Game:** Dragon's Lair — Cinematronics, 1983. A laserdisc arcade cabinet running Don Bluth's animated fantasy. In 1983, this cost 50 cents to play instead of a quarter — it was *that* visually shocking. The first time a game looked like a cartoon. Kids lined up just to watch. In the Computer Wing, this cabinet represents the first jaw-drop moment in gaming visual history.
- **Era:** 1983 Arcade (laserdisc)
- **Graphic quality:** Full hand-drawn animation — fluid, cinematic, cel-shaded frames at a quality level nothing else in gaming had reached. Dragon's Lair is the first moment in this game where a level's background looks like it could be from a Disney film. The visual leap from Level 6 to Level 7 should feel as dramatic as it did in 1983.
- **Palette:** Rich jewel tones — deep purples, gold torchlight, emerald dragon scales, cinematic color grading
- **Music:** Orchestral fantasy chiptune — dramatic, sweeping. Lyria prompt: *"heroic orchestral chiptune adventure theme — lush, dramatic, cartoonishly grand. The sound of a storybook opening."*
- **Words unlocked:** rule, rude, lure, sure, fire, hire, sire, ruse, fuse, fury, jury, dusk, gust, rust, rush, hurl, furl, rural, surf, turf, girl, duke, lure, sire
- **Narrative beat:** The room stretches further back than it looked from the door.

---

### Level 8 — T & Y
*"Index fingers reach to center-top — the deepest reach yet"*

- **New keys:** T (left index, center-top reach from F), Y (right index, center-top reach from J)
- **Why here:** T is the #2 most common letter in English — "the" alone makes it essential. Y is both consonant and vowel. Both are the deepest symmetric index reaches. Mario Teaches Typing puts T and Y at the same stage for exactly this reason.
- **Game:** Tetris — Pajitnov / Nintendo, 1984/1989. A computer running the original. The T-tetromino is literally made of the letter T. Falling patterns = falling sequences. The metaphor writes itself.
- **Era:** 1984 home computer / 1989 Game Boy
- **Graphic quality:** Clean, geometric precision. Tetris's beauty is deliberate minimalism — crisp block edges, satisfying line-clear animations, the elegant simplicity of seven shapes. Against the lavishness of Dragon's Lair, Tetris is a palette cleanser. Less is more.
- **Palette:** Classic Tetris — bright primary blocks, dark background, clean contrast
- **Music:** Korobeiniki-inspired but original — Lyria prompt: *"hypnotic chiptune waltz in triple time, methodical falling rhythm, tension that resolves as rows clear — satisfying, never alarming"*
- **Words unlocked:** try, dry, sky, stay, they, slay, style, dusty, tasty, rusty, dirty, study, fruit, fairy, dairy, today, story, glory, starry, forty, thirty
- **Narrative beat:** "You've been typing without thinking. Your fingers know where to go."

---

### Level 9 — W & O
*"Ring fingers reach up"*

- **New keys:** W (left ring, up from S), O (right ring, up from L)
- **Why here:** O is the 3rd most common vowel. W opens common words — "word," "work," "world." Ring fingers reaching up follows the same outward-from-center pattern as all prior levels.
- **Game:** Super Mario Bros — Nintendo, 1985. The NES in the center of the room. Side-scrolling, colorful, full of momentum and discovery. Arguably the single most important game ever made — the one that saved the industry and proved that games could have worlds. It gets the center spot.
- **Era:** NES 1985
- **Graphic quality:** Full NES palette (52 colors available), smooth side-scrolling, parallax sky and background layers. The jump from Tetris's minimalism to Mario's expressive scrolling world is another deliberate visual step up.
- **Palette:** Blue sky, green hills, Mario red and brown — warm, iconic, inviting
- **Music:** Lyria prompt: *"joyful NES platform theme — the sound of possibility. Bouncing melody, layered chiptune, the feeling of running fast toward something wonderful."*
- **Words unlocked:** word, work, world, wore, woke, wolf, wood, wool, flow, glow, slow, grow, show, know, owl, foul, soul, fool, tool, cool, pool, storm, worm, sword, follow, tower, lower
- **Narrative beat:** The room map on the wall updates. You can see where you've been — and how far you have to go.

---

### Level 10 — Q & P
*"Pinky fingers reach up — top row complete"*

- **New keys:** Q (left pinky, up from A), P (right pinky, up from the eighth key)
- **Why last in top row:** Q is the rarest letter in English. P completes common words but requires context. Both need the weakest finger to reach to the most distant top-row keys. Saved for last deliberately.
- **Celebration:** "TOP ROW UNLOCKED" — second major milestone. The top bar of the on-screen keyboard lights up completely for the first time.
- **Game:** The Legend of Zelda — Nintendo, 1986. A gold-cartridge NES beside a wooden TV. Top-down dungeon exploration, keys unlocking locked doors, a map that fills in as you discover — it's the player's own journey made literal. You've been unlocking keys the whole time.
- **Era:** NES 1986
- **Graphic quality:** NES at its richest — overhead perspective, detailed dungeon tiles, character expressiveness within the 8-bit constraint. The gold cartridge is the visual metaphor.
- **Palette:** Deep greens, earth tones, golden Triforce shimmer, dark dungeon blues
- **Music:** Lyria prompt: *"NES adventure theme — mysterious dungeon motif opening into triumphant overworld melody. Hopeful, wonder-filled, the sound of a map filling in."*
- **Words unlocked:** stop, step, drop, drip, trip, trap, grip, swap, plus, play, plot, spell, spill, split, sport, kept, swept, depth, quip, quit, quick, scoop, spell, gulp, slip
- **Special:** Q's strangeness gets a moment — *"Q always brings a friend: U."* A small visual of Q and U paired on screen.
- **Narrative beat:** A trapdoor in the floor. The Basement glows from below.

---

## Act 2 → 3 Transition — The Basement Opens

**Trigger:** Level 10 final word. ~25 seconds. No text — entirely tonal.

**Summary:** TOP ROW UNLOCKED milestone plays, keyboard top bar lights left to right → floor seam appears, 16-bit neon light bleeds up through it → trapdoor hinges open, Genesis FM ambience grows clearer → ACT 3 / THE BASEMENT title card.

*Full cinematic sequence: see `levels-transitions.md`*

---

## Act 3 — The Basement (Levels 11–15)

**Setting:** Underground. The aesthetic shifts — neon signs, LAN cables, carpeted floors, a different energy. This is where the 90s gaming explosion lives. Bottom row keys are harder (fingers reach down against habit), and the games get correspondingly bigger, louder, and more visually spectacular.

**Graphic quality jump:** Act 3 opens in 16-bit. The visual leap from Act 2's NES palette to Act 3's Genesis/SNES quality should be immediately apparent — richer colors, larger sprites, smoother animation, parallax everywhere. By the end of Act 3, you're approaching the graphical quality of the mid-90s — genuinely stunning by any era's standard.

---

### Level 11 — V & M
*"Index fingers reach down and in"*

- **New keys:** V (left index, down-right from F), M (right index, down-right from J)
- **Why first in bottom row:** Index fingers reaching down — mirrors how we opened the top row with E/I. Same finger, new direction.
- **Game:** Sonic the Hedgehog — Sega, 1991. A Genesis console. Fast, colorful, deliberately positioned as the counterpoint to Nintendo's deliberate Mario. Speed blur effects, multi-layer parallax, the fastest movement yet seen on a home console. The Basement announces itself with velocity.
- **Era:** Sega Genesis 1991
- **Graphic quality:** 16-bit Genesis FM. 512 colors available, large sprites with smooth animation frames, speed-blur effects, parallax scrolling at multiple depths. The jump from NES Act 2 to this should feel like stepping from a postcard into a movie.
- **Palette:** Lush saturated green and cobalt blue (Green Hill Zone) — vivid, bold, designed to stop you cold
- **Music:** Lyria prompt: *"fast funky Genesis FM chiptune rock — driving bass, optimistic urgency, the sound of going somewhere fast and loving every second"*
- **Words unlocked:** move, more, mile, vim, arm, farm, harm, warm, form, firm, term, worm, storm, smile, flame, frame, grave, brave, curve, marvel, village
- **Narrative beat:** A scoreboard on the wall. Your name is already on it.

---

### Level 12 — B & N
*"Index fingers reach to center-bottom — the reach keys of the bottom row"*

- **New keys:** B (left index center-bottom), N (right index center-bottom)
- **Why together:** B and N are symmetric center-bottom reaches — the exact mirror of G and H on the home row. "The reach keys of the bottom row." Both hands do the same motion.
- **Game:** Street Fighter II — Capcom, 1991/1992. A tall arcade cabinet in the corner of the Basement. The game that defined the fighting genre and the SNES era. Large, detailed character sprites, complex move animations, the roar of crowd ambience — the most visually impressive arcade game of its era. (This was originally placed at Level 4, which was wrong — Street Fighter II belongs in the 90s Basement, not on the home row alongside Pac-Man.)
- **Era:** Arcade 1991 / SNES 1992
- **Graphic quality:** Arcade-perfect SNES-era 2D — enormous detailed character sprites, hit-flash effects, dramatic stage backgrounds with parallax layers and ambient animation. The characters in Street Fighter II were genuinely shocking in scale compared to anything prior.
- **Palette:** Rich, saturated fighting game colors — each stage has its own distinct palette
- **Music:** Lyria prompt: *"intense 16-bit fighting game theme — percussive, driving, world-stage energy. Each phrase like a new round beginning."*
- **Words unlocked:** bone, born, burn, barn, band, bend, bond, find, bind, kind, wind, mind, blind, name, tame, blame, brain, drain, train, grain, brown, crown, grown, known, town, born
- **Narrative beat:** Two sides of the keyboard. Two fighters. Left hand, right hand. Same as always.

---

### Level 13 — C & comma
*"Middle fingers reach down — and the first punctuation key"*

- **New keys:** C (left middle, down from D), , (right middle, down from K — comma)
- **The comma:** First punctuation key in the game. The pause key. *"A comma is a breath. Every good sentence has them."* Introduce it gently — it doesn't make a sound on its own, but language collapses without it.
- **Game:** Myst — Cyan, 1993. A computer running the first great CD-ROM game. Slow, atmospheric, puzzle-focused — a complete tonal shift after Street Fighter II. This level is about reading. Pausing. Thinking before you press. The comma made visual.
- **Era:** CD-ROM 1993
- **Graphic quality:** The first pre-rendered photographic textures. Myst's environments were rendered on Silicon Graphics workstations and look genuinely photographic — a quality leap that shocked everyone in 1993. The contrast with anything prior in this game is intentional and dramatic.
- **Palette:** Misty island grays, slate blues, aged copper, leather book textures — the most realistic visuals in the game so far
- **Music:** Lyria prompt: *"sparse ambient mystery — solo piano over island wind, slow mechanical tones, long silences that feel intentional. The sound of a puzzle thinking."*
- **Words unlocked:** cool, curl, cord, core, care, dare, race, face, lace, pace, mice, dice, rice, nice, slice, twice, crisp, crack, clock, click, stuck, thick, trick, track, cream, dream
- **Phrases introduced:** Comma prompts now possible — "word, word" — two words with a pause between. No fanfare. Just language becoming more complex.
- **Narrative beat:** The cursor blinks. You read the screen. The game waits.

---

### Level 14 — X & period
*"Ring fingers reach down — and sentences end"*

- **New keys:** X (left ring, down from S), . (right ring, down from L — period)
- **The period:** Bigger than a comma. It ends things. *"Every story has a last word. The period says: done. You get to type the period."*
- **Game:** Donkey Kong Country — Rare / Nintendo, 1994. A SNES cartridge that made the entire industry stop and stare. Rare used Silicon Graphics workstations to pre-render every sprite — the results looked like 3D animation running on a 16-bit console. In 1994, no one believed it was real until they held the cartridge. The period ends a sentence; DKC's graphics ended an era's assumptions about what was possible.
- **Era:** SNES 1994
- **Graphic quality:** Pre-rendered 3D sprites on a 2D engine — a visual trick that produced results more impressive than the hardware had any right to achieve. DKC looks genuinely different from everything before it. This should be the most visually striking level yet.
- **Palette:** Lush jungle depth — rich greens, golden sunsets, deep cave blues, the warm amber of the DKC title screen
- **Music:** Lyria prompt: *"atmospheric SNES adventure — layered chiptune with ambient depth, jungle percussion, the feeling of something vast and beautiful just around the corner"*
- **Words unlocked:** mix, fix, six, fox, box, wax, tax, axe, exam, next, text, flex, extra, exact, relax, explore, ox, annex
- **Sentences introduced:** Full sentence prompts appear for the first time: *"Skill is built."* / *"Words unlock worlds."* The period is the payoff.
- **Narrative beat:** The trail map shows where you've been. Hundreds of keys lit up behind you.

---

### Level 15 — Z & slash
*"Pinky fingers to the farthest keys — the full letter keyboard"*

- **New keys:** Z (left pinky, down from A — the very last letter), / (right pinky, down from the eighth key)
- **Why last:** Z is the rarest letter in English — literally last in the alphabet and last to learn. Slash is unfamiliar to young readers. Both demand the weakest finger to travel the farthest. This is the hardest pair, earned.
- **Celebration:** "FULL KEYBOARD UNLOCKED" — all 26 letters plus core punctuation. Every key on the keyboard diagram lights simultaneously. This is the moment.
- **Game:** Pokémon Red/Blue — Game Freak / Nintendo, 1996/1998. A Game Boy Pocket on a backlit stand. Pokémon names are perfect typing targets — Pikachu, Squirtle, Bulbasaur, Jigglypuff, Charizard. The game that made a generation want to catch and name everything. Now they type the names.
- **Era:** Game Boy 1996
- **Graphic quality:** Game Boy's deliberate constraint — 4-shade dot-matrix display — is beautiful in its own right. But the battle screen art tells a bigger story: when a Pokémon appears, the game's visual energy spikes. The duality (humble world map, dramatic battle flash) mirrors the player's own journey: humble beginnings, dramatic arrival.
- **Palette:** Warm yellows, rich reds, tall pixelated grass, sprite-flash white on battle entry
- **Music:** Lyria prompt: *"Game Boy adventure chiptune — exploration warmth building to a triumphant catch moment. Nostalgic, personal, the sound of collecting something wonderful."*
- **Words unlocked:** zero, zone, zoom, buzz, jazz, fizz, fuzz, raze, daze, gaze, haze, blaze, graze, maze, size, prize, freeze, sneeze
- **Special:** Slash foreshadows what's next — "keyboard/world/yours" appears as a bonus prompt. No explanation yet.
- **Narrative beat:** The full keyboard diagram glows. A staircase rises. Up into a new room.

---

## Act 3 → 4 Transition — The Command Center

**Trigger:** Level 15 final word. ~35 seconds.

**Summary:** All 26 letter keys pulse simultaneously in a rolling wave of light → "YOU KNOW EVERY WORD. NOW LET'S COUNT." appears all at once (no keyclick) → architectural staircase rises through ceiling, Act 4 3D quality visible above → ACT 4 / THE COMMAND CENTER title card.

*Full cinematic sequence: see `levels-transitions.md`*

---

## Act 4 — The Command Center (Levels 16–20)

**Setting:** The top floor. Late 90s — not the retrofuturism of 1985's idea of the future, but the actual future as it arrived: server racks, glowing monitors, the early internet humming. Numbers live here. The conceptual shift: *"You know every word. Now let's count."*

**Progression:** Pairs inward from center — 5/6 first (index fingers straight up from home), expanding outward to the pinky numbers.

**Graphic quality:** Early PS1/N64 3D. The visual language is now real-time polygons, textured environments, genuine 3D space. The games here feel different in kind from everything prior, not just better.

| Level | New Keys | Game | Developer | Year | Rationale |
|---|---|---|---|---|---|
| 16 | 5, 6 | SimCity 2000 | Maxis | 1993 | Index fingers up — numbers as city, populations, budgets |
| 17 | 4, 7 | GoldenEye 007 | Rare | 1997 | Ring fingers — 007, mission codes, 4-player split screen |
| 18 | 3, 8 | Age of Empires | Ensemble | 1997 | Middle fingers — resource counts, population limits |
| 19 | 2, 9 | Final Fantasy VII | Square | 1997 | Ring fingers out — HP/MP bars, numbers as drama and stakes |
| 20 | 1, 0 | Command line / terminal | — | 1960s–∞ | Pinky fingers — binary. 1 and 0 underlie everything typed before this. |

**Level 20 narrative beat:** The terminal displays:
```
> 01001000 01000101 01001100 01001100 01001111
  H        E        L        L        O
```
The whole game has been building here. Letters are numbers. Numbers are electricity. Typing is computation. The first program a kid ever types.

**Word content:** Numbers don't expand the word bank, but unlock new prompt types — equations, addresses, dates, phone numbers. *"Type your age." "Type the year." "Type 10 + 5."* Simple, personal, grounding.

---

## Act 4 → 5 Transition — Full Circle

**Trigger:** Level 20 binary → HELLO completes. ~45 seconds. Transition *becomes* Level 21 — no separate title card, no Space prompt.

**Summary:** Terminal holds on HELLO, types "YOU BUILT THIS. NOW GO BACK." → montage in reverse through all acts at their own graphic quality → arcade fully lit (all 5 cabinets running simultaneously) → opening "READY PLAYER ONE" screen reappears with "TYPE YOUR NAME" instead of "PRESS SPACE TO BEGIN" — Level 21 begins immediately.

*Full cinematic sequence: see `levels-transitions.md`*

---

## Act 5 — Full Circle (Levels 21–25)

**Setting:** Back in the arcade. Full circle. But every cabinet is glowing now, and the room feels different — because you're different.

**"The Corner Cabinets" (Levels 21–23):** Before the finale, three overlooked machines in the dark corner of the arcade get rediscovered — cabinets that were always there but never lit. They teach the last stray keys in the corners of the keyboard: the dash and equals past zero, the bracket keys climbing the right edge, the tick marks pinkies have never touched. Deliberately Act-1-style arcade pixel art — this is still the arcade, not the modern finale yet.

**Graphic quality (21–23):** 1–8 color pixel art, faithful early-80s arcade fidelity, matching Act 1's aesthetic bar (Out Run may run brighter/16-color, being a 1986 cabinet).

**Graphic quality (24–25):** Modern. The visual quality of the finale should be genuinely stunning — real-time lighting, particle systems, high-resolution textures. The contrast with Level 1's black-and-white rectangles should be staggering and deliberate. This is what you unlocked.

---

### Level 21 — Dash & Equals
- **New keys:** `-` (right pinky, reach up past 0), `=` (right pinky, reach further)
- **Why here:** The right pinky has already learned every number; the dash and equals sit just past them, one more reach outward. First keys of "The Corner Cabinets."
- **Game:** Out Run — Sega, 1986. A cabinet in the dim corner, pseudo-3D coastal road at sunset, glowing pink and orange. The forgotten cabinet nobody noticed was even plugged in.
- **Era:** Arcade 1986
- **Palette:** Sunset pink/orange, low sun, dark road, red car
- **Content:** Hyphenated compound words (zig-zag, tip-top, pop-up, sun-up, ping-pong, flip-flop) and simple equations using only digits, `-`, and `=` (2-1=1, 5-4=1, 10-5=5)
- **Narrative beat:** A corner cabinet flickers to life. Nobody remembers it being there.

---

### Level 22 — Brackets & Backslash
- **New keys:** `[` `]` `\` (right pinky, climbing the top-right corner)
- **Game:** Q\*bert — Gottlieb, 1982. Isometric pyramid of cubes on dark violet, orange Q\*bert blob hopping cube to cube, flipping colors.
- **Era:** Arcade 1982
- **Palette:** Orange on dark violet, cyan cube tops
- **Content:** Bracketed early-reader words ([ok] [go] [run] [jump] [play] [win] [yes]) and backslash drills (a\b, fun\run, up\down), including the celebratory `\o/`
- **Narrative beat:** The second corner cabinet lights up beside the first.

---

### Level 23 — Backtick & Apostrophe
- **New keys:** `` ` `` (left pinky, reach up-left) and `'` (right pinky, reach right)
- **Game:** Missile Command — Atari, 1980. Defensive-only reimagining: dark sky, city skyline, green ground. Cities can never be hit — every incoming trail is intercepted or fizzles harmlessly high in the sky. This honors the no-punishment rule even in a "war" game.
- **Era:** Arcade 1980
- **Palette:** Red trails, green ground, black sky
- **Content:** Everyday contractions (don't, it's, can't, let's, she's, we're, i'm, you're) and backtick-wrapped code-style words (`` `run` ``, `` `go` ``, `` `type` ``, `` `play` ``)
- **Narrative beat:** The third corner cabinet glows. All three, together, close out the symbol keys.

---

### Level 24 — Shift (Capitals)
- **Concept:** Two-hand coordination for the first time — hold one key while pressing another. *"You already know every letter. Now make them BIG."*
- **Taught as:** Left Shift for right-hand letters, Right Shift for left-hand letters. Same alternating-hand logic as always.
- **Game:** Not yet assigned — this is the "type your own name in all caps" level. The player types their name: **OONA**. It appears as a high score entry. Personal, irreplaceable.
- **Narrative beat:** The opening screen appears again — "READY PLAYER ONE." But this time, the player types it themselves.

---

### Level 25 — Space & Backspace
- **Concept:** Space has been auto-advancing prompts throughout. Now it becomes intentional — part of the typing, not infrastructure. Backspace introduces self-correction: the first time the game allows deletion.
- **Design note:** Backspace is pedagogically important to frame correctly. *"Backspace isn't failure. Every writer uses it. Every coder lives in it. It's not going back — it's making it right."*
- **Game:** Not yet assigned — a word processor aesthetic. The player types their first full paragraph of their own choosing.
- **Narrative beat:** Credits roll. In a terminal font. The player typed them.

---

## Complete Game Assignment Table

| Level | Act | New Keys | Game | Developer | Year |
|---|---|---|---|---|---|
| 1 | The Arcade | J, F | Breakout | Atari | 1976 |
| 2 | The Arcade | D, K | Space Invaders | Taito | 1978 |
| 3 | The Arcade | S, L | Pac-Man | Namco | 1980 |
| 4 | The Arcade | A, the eighth key | Galaga | Namco | 1981 |
| 5 | The Arcade | G, H | Joust | Williams | 1982 |
| 6 | Computer Wing | E, I | Donkey Kong | Nintendo | 1981 |
| 7 | Computer Wing | R, U | Dragon's Lair | Cinematronics | 1983 |
| 8 | Computer Wing | T, Y | Tetris | Pajitnov / Nintendo | 1984 |
| 9 | Computer Wing | W, O | Super Mario Bros | Nintendo | 1985 |
| 10 | Computer Wing | Q, P | The Legend of Zelda | Nintendo | 1986 |
| 11 | The Basement | V, M | Sonic the Hedgehog | Sega | 1991 |
| 12 | The Basement | B, N | Street Fighter II | Capcom | 1991 |
| 13 | The Basement | C, comma | Myst | Cyan | 1993 |
| 14 | The Basement | X, period | Donkey Kong Country | Rare / Nintendo | 1994 |
| 15 | The Basement | Z, slash | Pokémon Red/Blue | Game Freak / Nintendo | 1996 |
| 16 | Command Center | 5, 6 | SimCity 2000 | Maxis | 1993 |
| 17 | Command Center | 4, 7 | GoldenEye 007 | Rare | 1997 |
| 18 | Command Center | 3, 8 | Age of Empires | Ensemble | 1997 |
| 19 | Command Center | 2, 9 | Final Fantasy VII | Square | 1997 |
| 20 | Command Center | 1, 0 | Terminal / Command Line | — | 1960s–∞ |
| 21 | Full Circle | -, = | Out Run | Sega | 1986 |
| 22 | Full Circle | [, ], \ | Q*bert | Gottlieb | 1982 |
| 23 | Full Circle | `, ' | Missile Command | Atari | 1980 |
| 24 | Full Circle | Shift | High Score Entry (player's own name) | — | — |
| 25 | Full Circle | Space, Backspace | Word Processor (first sentences) | — | — |

---

## Word Bank Expansion by Act

| Stage | Keys Available | Prompt Type | Representative Words |
|---|---|---|---|
| Act 1, L1–2 | J F D K | Patterns only | jf, dk, jfdk |
| Act 1, L3 | + S L | First words | ads, lads, falls, flask, lass |
| Act 1, L4 | + A ; | Words | dad, sad, fad, skull, flask |
| Act 1, L5 | + G H | Words | shag, slag, dash, gash, glad, half, lash |
| Act 2, L6 | + E I | Words | idea, side, hide, said, file, skill, feel, deal |
| Act 2, L7 | + R U | Words | rule, fire, lure, dusk, rust, rush, girl |
| Act 2, L8 | + T Y | Words | try, stay, style, dusty, today, story, glory |
| Act 2, L9 | + W O | Words | word, world, flow, glow, wolf, sword, follow |
| Act 2, L10 | + Q P | Words | stop, drop, trip, spell, sport, quick |
| Act 3, L11 | + V M | Words | move, arm, farm, warm, firm, storm, brave |
| Act 3, L12 | + B N | Words | bone, burn, kind, mind, brain, train, town |
| Act 3, L13 | + C , | Words + comma phrases | cool, care, face, nice, slice — "word, word" |
| Act 3, L14 | + X . | Words + full sentences | mix, fix, next, text, extra — "Skill is built." |
| Act 3, L15 | + Z / | Words + sentences | zero, buzz, jazz, blaze, prize |
| Act 4 | + 0–9 | Equations, dates | Type your age. Type 10 + 5. |
| Act 5, L21 | + - = | Compound words, equations | zig-zag, flip-flop, ping-pong — 2-1=1, 10-5=5 |
| Act 5, L22 | + [ ] \ | Bracketed words, path-style drills | [go] [run] [play] — a\b, fun\run, \o/ |
| Act 5, L23 | + ` ' | Contractions, code-tick words | don't, it's, we're — \`run\`, \`play\` |
| Act 5, L24 | + Shift | Capitalized names | Sun, Moon, Star, King — (player's own name) |
| Act 5, L25 | + Space, Backspace | Phrases, full sentences | the end, i can type — "I can type." "The end." |

---

## Milestones and Narrative Beats

| Milestone | Trigger | What Happens |
|---|---|---|
| Home row complete | Level 4 finish | Mystery Cabinet begins to glow |
| Reach keys complete | Level 5 finish | Mystery Cabinet curtain drops — it's a computer |
| Computer Wing opens | Mystery beat | The back door appears. Act 2 begins. |
| Top row complete | Level 10 finish | TOP ROW UNLOCKED — keyboard diagram top bar fully lights |
| Basement opens | Level 10 finish | Trapdoor in the floor. Basement glows from below. |
| Full letter keyboard | Level 15 finish | Every letter key lights simultaneously. |
| Command Center opens | Level 15 finish | A staircase rises. Numbers floor revealed. |
| Number row complete | Level 20 finish | Binary → HELLO. The first program. |
| Full circle | Level 20 finish | Back to the arcade. Every cabinet glowing. Level 21 begins immediately. |
| Corner cabinets cleared | Level 23 finish | All three forgotten cabinets lit. Symbol keys complete. |
| Player types their name | Level 24 finish | High score entry. The player's own name, in caps, on screen. |
| Full keyboard mastered | Level 25 finish | The player types their own first sentence. "You built this." |

---

*This document covers planned scaffolding only — no levels beyond 5 are built yet. Update as each level is implemented.*
