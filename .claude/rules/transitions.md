# Cinematic Transitions & Opening Flow
## Keystroke Kingdom — Sequence Direction

Full phase-by-phase detail for the opening player flow and all act transitions. Referenced from `levels.md`.

---

## First-Time Player Flow

**Total duration before the first keypress prompt:** ~30 seconds, plus however long name entry takes.

---

### Phase 1 — The Cold Open (3s)

Black screen. Silence. Then a single warm glow appears — the light from one arcade cabinet, off to the left. The rest of the room is dark silhouette. Scanlines kick in. The CRT hum rises.

This is the only time the player sees the arcade completely dark. Every session after this starts at the title screen directly.

---

### Phase 2 — The Title Screen

The attract screen — styled after the real 1979 arcade cabinet attract mode. Dramatic pixel typography, centered, the arcade barely visible behind it.

```
READY PLAYER ONE!
```

Below it, blinking slowly:

```
INSERT COIN
```

And below that, smaller and steady:

```
PRESS SPACE TO BEGIN
```

*"INSERT COIN" is a wink — for the parent standing behind their kid who remembers dropping quarters. It does nothing. Only Space works.*

The graphic quality of this screen is Act 1 level — 2-color, blocky, authentic to the era. This isn't a modern game's title screen. It's an arcade attract mode.

---

### Phase 3 — Name Entry

After Space is pressed, the title shifts to a name entry prompt:

```
WHAT'S YOUR NAME, PLAYER?

> PLAYER ONE

PRESS [RETURN] TO CONTINUE
```

- `[RETURN]` uses the `data-enter-key` span — displays "RETURN" on Mac, "ENTER" elsewhere
- The input field shows "PLAYER ONE" pre-filled, dimmed — selected and ready to be overwritten
- Any key press clears the default and starts typing fresh
- Backspace works normally
- Space types a literal space — names can be two words, like the default PLAYER ONE itself. Only Return confirms *(revised 2026-07-13, Trevor: "we need to support spaces due to 'Player One' being the default")*. This is the ONE screen where Space doesn't confirm: everywhere else in the game (title, ready, continue, level-flow screens) Space remains the primary quick-advance/confirm key on purpose — *"unlike enter/return the spacebar is where the thumbs rest continually, making it quick to advance"* (Trevor, 2026-07-13). Name entry is the deliberate exception because Space is itself typeable content there.
- Name is capped at 16 characters (arcade high score convention — roomy enough for two-word names like the default) *(revised 2026-07-13, Trevor: "16 characters should be the largest word limit")*
- No validation. Any characters accepted. If they type nothing and hit Return, "PLAYER ONE" is kept.
- Name is saved to localStorage immediately on confirm

This is a standard text input, styled arcade. It is explicitly **not** the game's typing mechanic. A child who has never typed before can still get through it — the default is one keypress away.

---

### Phase 4 — The Reveal (4s)

The name entry fades. Then, large and centered:

```
READY [NAME]!
```

Holds for 2 seconds. This is the moment. For Oona, it reads "READY OONA!" The game is already personal before a single key has been learned.

Then the arcade reveals itself — a slow pan across the room from left to right. Dark cabinet silhouettes line the walls. At the far left, the first cabinet — Breakout — glows warm and distinct. The others are dark, waiting.

Near the Level 1 cabinet, a small prompt fades in:

```
START HERE
```

---

### Phase 5 — The First Prompt

The view settles on the Level 1 cabinet. One letter appears on the game's main prompt area:

```
j
```

Before the player can press anything, a finger position diagram fades in gently beneath it — two hands, home row position, J and F highlighted. This is the **only time** the finger guide appears without being asked for. No other level, no other prompt, ever shows it proactively. This one moment gets training wheels because the player has zero context yet.

The diagram doesn't block anything. It just sits there, quietly. If the player presses the right key, it fades and never comes back unless they ask. If they press the wrong key, it stays visible a moment longer, then behaves like any other wrong keypress — gentle nudge, letter waits.

No instructions. No tutorial text. No "here's how the game works." The letter `j` on screen with a hand diagram underneath it *is* the tutorial. Everything else follows from that.

---

## Skipping — one rule for all four act cinematics *(Trevor, 2026-10-30)*

"Skippable after first completion" below is exact, and it holds for the Mystery,
the Basement, the Command Center and Full Circle alike:

| | Before the title card | On the title card |
|---|---|---|
| **First viewing** (this saved game has never cleared the gating level) | **No key skips.** Every key is ignored. | **Space only** continues — it is what the card says. |
| **Replay** (the gating level was already cleared) | **Space or Escape** jumps to the title card. Every other key is ignored. | **Space only.** |

- *Why:* until 2026-10-30 ANY key skipped, on any viewing. A first-timer's stray key at
  ~8s jumped straight to the ACT 2 card, so the child never saw *HELLO. YOU FOUND ME.*,
  the secret door or the Computer Wing — the reveal the whole of Act 1 builds toward.
  The title cards also advanced on any key while saying PRESS SPACE TO CONTINUE.
- *"First viewing"* is derived from progress that already exists — the gating level's
  `completed` flag read **before** it is recorded (the eighth-key confession's latch).
  No new storage. A replay of Level 5 therefore gets a skippable Mystery.
- *Full Circle* has no title card: its last phase is the opening-screen callback that
  says TYPE YOUR NAME, so there **Space or any typed character** hands off to Level 21
  (after its 1s fade-in), and Escape/Tab/arrows/modifiers do nothing.
- A held key's auto-repeat is never a decision.

---

## Mystery Beat — The Reveal Sequence

**Trigger:** The final word of Level 5 is typed correctly. The Joust completion animation plays normally. Then, instead of returning to the arcade idle state, the sequence begins automatically.

**Total duration:** ~50 seconds. Skippable after first completion (Space or Escape) — never on the first viewing; see §Skipping above. Replayable at any time from the Stats Cabinet.

---

### Phase 1 — The Silence (3s)

The Joust music finishes its completion fanfare and fades out completely. The arcade goes quieter than it has ever been — no ambient hum, no cabinet sounds. Just the player and the room. A single held breath.

---

### Phase 2 — The Pull (6s)

The Mystery Cabinet in the corner begins to pulse — a warm amber glow pressing through the velvet curtain, slow and rhythmic, like something breathing. The caution tape falls off in sections, pixel by pixel, each piece drifting to the floor. No drama. Just inevitability.

A low CRT hum builds underneath — the sound of old electronics warming up.

---

### Phase 3 — The Curtain Drops (4s)

The velvet curtain falls. Simple pixel animation — the weight of fabric, the slow tumble to the floor. One frame of darkness behind it. Then the screen inside flickers on.

*Sound:* Three ascending tones on a PC speaker — the classic boot beep of an early personal computer. Short, clean, unmistakable.

---

### Phase 4 — The Approach (12s)  *(revised 2026-07-12, Trevor)*

The camera walks toward the cabinet — a slow, steady dolly-in. The cabinet grows from
its corner-of-the-room size until it dominates the frame. On its screen, green text is
already glowing — but at this distance it's a soft, fuzzy blur, an out-of-focus CRT
phosphor smear. As the player draws closer, the blur resolves: bloom tightens, scanlines
sharpen, and the smear becomes crisp green TUI text — the terminal typing one character
at a time with the game's own keyclick sound, as if the computer is typing to the player:

```
HELLO.

YOU FOUND ME.

COME IN.
```

Each line appears, pauses, then the next begins. No music. Just the keyclick of each
letter and the hum of the screen, growing slightly louder as we close the distance.
The text reaches full crispness exactly as `COME IN.` completes — the invitation lands
at the moment we arrive.

*Design note:* "HELLO" here is intentional. It will echo again at Level 20, when the player types `01001000...` and the binary resolves to `H E L L O`. The first and last moments of the game are the same word — once the computer says it, once the player earns it.

*Design note 2:* The fuzzy-to-crisp resolve is the walking-up made visible — distance
rendered as focus. It also mirrors the game's whole thesis: the closer you get to the
machine, the more legible it becomes.

---

### Phase 5 — The Secret Door (8s)  *(revised 2026-07-12, Trevor)*

Then the cabinet moves. Not the wall — the cabinet itself. It hinges aside slowly, like
a bookcase in an old mystery — the secret passage trope, earned by typing. Behind where
it stood: a doorway that was always there, hidden behind the one machine nobody could
play. Light spills out: warm amber and blue-white, the glow of many different screens
from many different eras.

The Computer Wing is visible beyond — glimpses of keyboards, monitors, cartridge shelves. Not fully revealed yet. Just enough.

The Mystery Cabinet wasn't just a computer. It was the door.

*Sound:* A low, heavy hinge-and-slide under a single sustained chord — not triumphant, not a fanfare. Just arrival. Something warm resolving into something open.

---

### Phase 6 — The Title Card (8s)

The screen fades. Text appears, centered:

```
ACT 2

THE COMPUTER WING
```

Then, quietly at the bottom:

```
PRESS SPACE TO CONTINUE
```

---

### Visual Notes

- The entire sequence uses the Act 1 pixel art aesthetic — it's still the arcade, still 8-bit. The reveal is earned through the narrative, not a sudden graphical upgrade.
- The computer screen *inside* the cabinet is rendered at slightly higher fidelity than the surrounding environment — a hint of what Act 2 will look like. The rest of the arcade hasn't changed; this one object is different.
- The dolly-in (Phase 4) is a smooth scale-up of the cabinet in canvas space with the
  screen's text blur resolving in lockstep (blur/bloom amount is a function of apparent
  distance, not a separate timer) — so a paused frame anywhere in the approach reads as
  a coherent distance, never as a rendering glitch.
- The doorway revealed in Phase 5 sits exactly where the cabinet stood — the cabinet
  hinges/slides far enough that both are visible in composition: the machine ajar, the
  passage behind it.
- **The swing is a real door swing** *(Trevor, 2026-07-12)*: the cabinet rotates about
  its vertical hinge edge — both hinges on the same vertical plane — so it stays
  completely vertical the whole time. On screen that reads as horizontal foreshortening
  (the panel narrows toward the hinge edge as it opens, verticals never tilt). It must
  NOT pivot around a corner point or tilt in the screen plane — that reads as the
  cabinet falling over, not opening. A straight lateral slide is the acceptable
  alternative; a corner-pivot tilt never is.
- **Through the doorway is a ROOM, not a panel** *(Trevor, 2026-07-12)*: a glimpse of
  the machine-filled Computer Wing with depth — silhouetted machines receding in
  perspective, each with its own small glowing screen (varied blues and ambers, one or
  two flickering), keyboard ledges, cartridge shelf lines. Dim and partial ("just
  enough"), but unmistakably a hidden room full of more machines to play — never a
  single flat lit rectangle.
- The door, when open, shows the Computer Wing at Act 2 graphic quality — 16-color NES palette visible through the frame. The contrast with the arcade behind the player is immediate.

### Audio Notes

- Joust completion music → 2s fade → total silence
- Phase 2: Low-frequency CRT hum, barely perceptible, building slowly
- Phase 3: Three PC speaker tones (ascending: C, E, G — classic and recognizable)
- Phase 4: Each character uses the game's standard keyclick sound. No other audio.
- Phase 5: Sustained warm chord (strings-adjacent, chiptune texture) — holds through the door opening
- Phase 6: Chord fades. Silence until the player presses Space.

---

## Act 2 → 3 Transition — The Basement Opens

**Trigger:** Level 10 final word typed correctly. TOP ROW UNLOCKED milestone plays. Then the sequence begins.

**Total duration:** ~25 seconds. Skippable after first completion. No text — this transition is entirely tonal.

---

### Phase 1 — The Milestone (5s)

"TOP ROW UNLOCKED" appears on screen. The keyboard diagram's top bar lights up completely — all ten keys simultaneously, left to right in a quick cascade. It holds for a beat longer than any previous milestone. The player has earned the pause.

---

### Phase 2 — The Seam (6s)

A section of the Computer Wing floor shifts. No announcement — just a seam appears where there wasn't one before, then a hairline crack. Colored light bleeds up through it: pinks, oranges, the warm neon palette of something different below. A low FM bass note rises through the floor. Not music yet. Just the texture of what's down there.

---

### Phase 3 — The Drop (7s)

The trapdoor hinges open. The light from below blooms. A Genesis FM chip sound grows clearer — still ambient, not a full track, but unmistakably 16-bit. The palette visible from below is richer and more saturated than anything in the Computer Wing above. The visual quality difference between the two rooms is immediate and deliberate.

No text. No fanfare. The Basement speaks for itself.

---

### Phase 4 — Title Card (7s)

```
ACT 3

THE BASEMENT
```

```
PRESS SPACE TO CONTINUE
```

---

### Visual Notes

- The trapdoor light should cast colored upward shadows on the Computer Wing walls — a preview of the 16-bit palette before the player descends.
- The Computer Wing stays in Act 2 graphic quality; the light from below is rendered at Act 3 quality. Two eras visible simultaneously, briefly.
- No character animation needed — the environment does the work.

### Audio Notes

- TOP ROW UNLOCKED jingle → 1s silence
- Phase 2: Sub-bass hum, barely perceptible
- Phase 3: Genesis FM ambience — warm, fat, slightly distorted. The specific texture of 16-bit sound hardware.
- Phase 4: Silence until Space is pressed.

---

## Act 3 → 4 Transition — The Command Center

**Trigger:** Level 15 final word typed correctly. The sequence begins before the standard completion animation — this milestone is too big for the normal flow.

**Total duration:** ~35 seconds. Skippable after first completion.

---

### Phase 1 — Every Key (10s)

The Level 15 completion plays. Then the keyboard diagram takes over the screen — larger than it ever appears during gameplay, centered, fully lit except for the keys the player hasn't learned yet (numbers, shift, space, backspace).

Then: the remaining letter keys that just unlocked (Z and /) light up. And then — slowly, deliberately, rolling from left to right across the entire keyboard — every letter key that was already lit pulses once, brighter. A wave of light crossing the full alphabet.

When it reaches the end, all 26 letter keys hold, fully illuminated, simultaneously. The first time this has ever happened.

A beat of silence. The keyboard just sits there, glowing.

---

### Phase 2 — One Line (6s)

One line of text appears beneath the keyboard diagram:

```
YOU KNOW EVERY WORD.
NOW LET'S COUNT.
```

No keyclick sounds — this text appears all at once, not typed. The game is speaking, not demonstrating.

---

### Phase 3 — The Staircase (8s)

A staircase rises from the Basement floor — not a trapdoor this time. Something more intentional, more architectural. The steps extend upward through the ceiling. Above: the blue-white glow of monitors, the hum of server fans, a cooler and more ordered light than anything below. Late 90s. The actual future, as it arrived.

The visual quality visible at the top of the staircase is Act 4 quality — early 3D, textured surfaces, a different kind of rendering entirely. The contrast with the 16-bit Basement around the player is immediate.

---

### Phase 4 — Title Card (8s)

```
ACT 4

THE COMMAND CENTER
```

```
PRESS SPACE TO CONTINUE
```

---

### Visual Notes

- The keyboard diagram in Phase 1 should be the largest and most prominent it ever appears in the game. This is its moment.
- The rolling pulse of already-lit keys acknowledges everything the player has already learned — not just the new keys. It's a retrospective as much as a milestone.
- The staircase should feel earned and solid — not magical, not mysterious. The player built it, key by key.

### Audio Notes

- Level 15 completion jingle → brief silence
- Phase 1: A single sustained chord — all 26 notes of a C major scale played simultaneously, resolved into a warm whole. Held.
- Phase 2: Silence. The text lands without sound.
- Phase 3: The server hum from above — clean, electric, a different frequency than anything in the Basement. A rising tone as the staircase extends.
- Phase 4: Silence until Space is pressed.

---

## Act 4 → 5 Transition — Full Circle

**Trigger:** Level 20's binary → HELLO moment completes. The terminal holds on HELLO. Then the sequence begins.

**Total duration:** ~45 seconds. This transition is different from all the others — it ends not with a title card and a Space prompt, but with the player's own keypress beginning Level 21. The transition *becomes* the level.

---

### Phase 1 — The Terminal Holds (8s)

The Level 20 terminal holds on its final state:

```
> 01001000 01000101 01001100 01001100 01001111
  H        E        L        L        O
```

The cursor blinks. Then the terminal types one more line — slowly, as if choosing its words:

```
YOU BUILT THIS.

NOW GO BACK.
```

The screen fades.

---

### Phase 2 — The Return (12s)

A montage — brief, fast, moving in reverse through every environment the player has traveled. Not a cutscene so much as a memory: the Command Center, the Basement neon, the Computer Wing screens, the door in the arcade wall. Each environment flickers past in a second or two, rendered at its own act's graphic quality. The journey compressed into a handful of frames.

It ends at the arcade entrance. The original room. But the room is different now.

---

### Phase 3 — The Arcade, Fully Lit (10s)

Every cabinet in the arcade is on. All five — Breakout, Space Invaders, Pac-Man, Galaga, Joust — glowing simultaneously, running their games, filling the room with layered color and sound. The arcade at full capacity, the way it must have looked in 1979 before opening time, before the crowds.

The scanlines. The hum of CRTs. The specific electricity of a room full of machines that are all alive at once.

No text. Just the room, breathing.

---

### Phase 4 — The Opening Screen (12s)

The "READY PLAYER ONE" screen appears — the same screen the game opened with. But this time:

```
READY [NAME]!
```

The name is already there. And below it, where "PRESS SPACE TO BEGIN" used to appear:

```
TYPE YOUR NAME
```

The cursor blinks in the name field. This is not a prompt from the game. This is Level 21 beginning — the Shift key level, the first time the player types their own name in all caps. The transition *is* the level. There is no separate title card, no Space to continue. The player just starts typing.

---

### Visual Notes

- Phase 2's montage should be rendered at each environment's own graphic quality as it flashes past — the visual progression of the whole game compressed into 12 seconds.
- Phase 3's arcade should feel genuinely different from the opening scene, even though it's the same room. The player has earned seeing it lit. Consider subtle additions: the Mystery Cabinet door still open in the back wall, the trapdoor visible in the floor. The room carries its own history.
- Phase 4 should match the opening screen exactly — same layout, same font, same scanline effect — except the name is pre-filled and the prompt has changed. The recognition should be immediate, then the difference should register.

### Audio Notes

- Phase 1: Terminal keyclick sounds for the final text. Then silence.
- Phase 2: A compressed version of all five Act 1 game themes layered briefly — Breakout's beep, Space Invaders' march, Pac-Man's waka, Galaga's staccato, Joust's drums. Each just a fragment, passing.
- Phase 3: All five themes playing simultaneously at low volume, a wash of layered chiptune. Not cacophonous — balanced, like a room that's supposed to sound exactly like this.
- Phase 4: The audio fades to the single-tone hum from Level 1. The very first sound in the game. And then the player starts typing.
