# Victory Celebration Audit — 2026-07-12

Trevor's playtest report: the ~4s victory-hold window (theme `victory()` fires → engine
holds → LEVEL COMPLETE card) is dead air on many levels. Space Invaders' ship takeoff was
named as the positive bar. This audit records every level (1–25, Level 8 excluded — being
rebuilt by another agent), extracts 6 frames spanning each level's actual observed win
window, and classifies each from the FRAMES, not from reading `victory()` source — a
theme that *looks* animated in code but produces static frames is scored NONE.

**Method:** `scripts/record-playthrough.js --single-level=N --profile=steady` against a
locally served (non-Go) static server, batches of 5 concurrent recorders (journal L32 cap),
win timestamp read from each run's `.transcript.jsonl` `"type":"win"` event, 6 frames
extracted via `ffmpeg -ss` at win+{0.0, 0.7, 1.4, 2.1, 2.8, 3.5}s. Frame strips at
`/private/tmp/claude-501/-Users-trevormack-dev-keystroke-kingdom/656c2989-19a9-479e-834e-87edec6c3c19/scratchpad/victory-audit/frames/level-NN/`
(videos + transcripts alongside in `videos/`). Several levels needed a second, wider frame
pull (`level-05b`, `level-10b`, `level-15b`) when the first pull landed on a lingering
stale game-area frame before the theme's actual post-win render kicked in.

## Summary

| Classification | Count | Levels |
|---|---|---|
| CELEBRATORY | 12 | 1, 2, 3, 4, 12, 14, 15, 19, 20, 21, 24, 25 |
| WEAK | 6 | 5, 9, 11, 16, 17, 18 |
| NONE | 6 | 6, 7, 10, 13, 22, 23 |
| EXCLUDED | 1 | 8 (Tetris — being rebuilt by another agent, per task scope) |

24 levels audited + 1 excluded = 25 total. Exactly half the audited levels (12/24) land
in CELEBRATORY; the other half (12/24) are dead air or near-dead-air in the victory
window Trevor flagged — confirming this is a widespread pattern, not a handful of
one-off misses.

## Per-level results

| Level | Game | Class | What happens on screen | Frames | victory() ref |
|---|---|---|---|---|---|
| 1 | Breakout | **CELEBRATORY** | Ball freezes, 40-particle radial burst from screen center in brick colors, fully fills the window | `frames/level-01/` | `breakout.js:277` |
| 2 | Space Invaders | **CELEBRATORY** | Ship flies straight up off-screen with an engine trail; 10-point ring of alien-colored explosions bursts where it launched (Trevor's named positive example) | `frames/level-02/` | `invaders.js:377` |
| 3 | Pac-Man | **CELEBRATORY** | Ghosts vanish, Pac-Man stops, a 12-particle burst (yellow/cyan/white) scatters from his position; maze empties to a calm blue grid | `frames/level-03/` | `pacman.js:633` |
| 4 | Galaga | **CELEBRATORY** | Every surviving bug explodes into a warm blast; a 12-point ring of extra sparks blooms high on screen | `frames/level-04/` | `fighter.js:236` |
| 5 | Joust | **WEAK** | Knight's ostrich pops up and flies up-and-right off-screen (vy=-10) leaving the arena empty; real motion but no burst/fanfare, and the prompt panel lingers ~2s before clearing | `frames/level-05/`, `level-05b/` | `joust.js:633` |
| 6 | Donkey Kong | **NONE** | `victoryMode=true` is set but `render()` never reads it — DK, Mario, Pauline, girders and ladders are pixel-identical before/after; only the ambient score counter ticks | `frames/level-06/` | `donkeykong.js:470` |
| 7 | Dragon's Lair | **NONE** | Same pattern as L6 — Dirk stands motionless, ambient torch flicker continues unchanged, only the score ticks; `render()` never checks `victoryMode` | `frames/level-07/` | `dragonlair.js:315` |
| 9 | Super Mario Bros | **WEAK** | `marioJumpVy=12` — a single jump impulse only marginally bigger than the ordinary per-keystroke hop (9); Mario barely advances toward the flag, no flagpole reach, no distinct pose | `frames/level-09/` | `mario.js:385` |
| 10 | The Legend of Zelda | **NONE** | `victoryMode=true` only; `render()` never reads it — Link, the Triforce, the room and collectibles are static across the whole window (same pattern as L6/L7) | `frames/level-10/`, `level-10b/` | `zelda.js:396` |
| 11 | Sonic the Hedgehog | **WEAK** | `sonicBoost=9999` (permanent max speed) — Sonic genuinely dashes most of the screen width with a motion-blur trail, but it's one continuous drift, no distinct beat/burst | `frames/level-11/` | `sonic.js:427` |
| 12 | Street Fighter II | **CELEBRATORY** | Opponent's health bar drains to empty, a "K.O.!" banner appears center-screen, opponent flashes white and slumps — genuine, legible fighting-game finish | `frames/level-12/` | `streetfighter.js:429` |
| 13 | Myst | **NONE** | `bookPulse=9999` ("hold the glow") — the glowing book, moon, and lighthouse are already in that exact state pre-win and never change; nothing new happens, it's a freeze not an animation | `frames/level-13/` | `myst.js:474` |
| 14 | Donkey Kong Country | **CELEBRATORY** | `dkJumpVy=-9, dkJumpActive=true` — DK visibly leaps with arms raised, a real pose change and airborne motion distinct from idle | `frames/level-14/` | `dkc.js:501` |
| 15 | Pokémon Red/Blue | **CELEBRATORY** | Full battle-finish sequence: "A critical hit!" flash, Pikachu sprite flies off screen (faint), dialogue box advances through "You used QUICK ATTACK!" — era-faithful and legible | `frames/level-15/`, `level-15b/` | `pokemon.js:444` |
| 16 | SimCity 2000 | **WEAK** | `districts.forEach(b => b.flash=1)` — buildings' lit-window sprites look visually identical before/after in stills; the flash is imperceptible against the already-twinkling ambient city lights | `frames/level-16/` | `simcity.js:560` |
| 17 | GoldenEye 007 | **WEAK** | A real concentric-ripple "ping" appears in each of the 4 split-screen quadrant corners at the win moment and fades within ~2s — visible but brief/subtle, no color or text change | `frames/level-17/` | `goldeneye.js:364` |
| 18 | Age of Empires | **WEAK** | Resource-colored particles spawn and arc upward, but they're low-contrast, spawn mostly into the black void below the isometric map, and fizzle within ~2s; the map itself never changes | `frames/level-18/` | `ageofempires.js:382` |
| 19 | Final Fantasy VII | **CELEBRATORY** | Sephiroth's HP is zeroed, he shatters into a burst of white/teal shards, a screen flash and camera push accompany it — dramatic and legible | `frames/level-19/` | `ff7.js:454` |
| 20 | Terminal | **CELEBRATORY** | The binary-to-HELLO reveal itself renders live in the scrolling terminal ("01001000 01000101 01001100 01001100 01001111" → "H E L L O") — the game's signature narrative beat plays out in the window | `frames/level-20/` | `terminal.js:347` |
| 21 | Out Run | **CELEBRATORY** | A checkered finish-line banner sweeps across the road at the horizon with "DISTANCE 30/30" — an unmistakable, era-perfect race-finish moment | `frames/level-21/` | `outrun.js:341` |
| 22 | Q\*bert | **NONE** | Only a one-time speech bubble ("@!#?@!" — the classic Q\*bert curse) appears and fades within ~1s; the pyramid, cube colors, and Q\*bert sprite are otherwise unchanged for the rest of the window (no pyramid color-flip, the genre's classic win cue) | `frames/level-22/` | `qbert.js:468` |
| 23 | Missile Command | **NONE** | `incoming=[]` just clears in-flight missiles — a stop, not a celebration. No new burst, city cheer, or text; sky is simply quiet afterward | `frames/level-23/` | `missilecommand.js:417` |
| 24 | High Score Entry | **CELEBRATORY** | Name-entry panel clears to reveal the full leaderboard with the player's own entry ("KING") at the top, accompanied by a visible sparkle-particle burst right on that line | `frames/level-24/` | `highscore.js:494` |
| 25 | Word Processor | **CELEBRATORY** | Page clears to a glowing "THE END." with a warm page-glow bloom filling the paper — an unmistakable, emotionally-weighted finale for the whole 25-level curriculum | `frames/level-25/` | `wordprocessor.js:435` |

## Root-cause pattern (code-level, confirmed against frames)

Three of the six NONE levels (Donkey Kong L6, Dragon's Lair L7, Zelda L10) share an
identical bug shape: `victory()` sets `victoryMode = true` and nothing else, and the
theme's `render()` function **never reads `victoryMode` at all** — grep confirms zero
references to the flag outside its own declaration/assignment. The draw loop keeps
rendering the exact same idle/ambient scene it was rendering before the win. This is a
pure oversight (the flag is set but nothing consumes it), not a design choice, and is the
cheapest of all the fixes to make: each of these three themes already has ambient assets
(DK's arm-pump animation state, Dirk's idle sprite, Link's sparkle system) that a
`victoryMode` branch in `render()` could repurpose immediately.

Myst (L13) and Missile Command (L23) are different: their `victory()` deliberately
freezes or clears state rather than starting anything new (`bookPulse = 9999` "hold the
glow"; `incoming = []`). That's a design choice that reads as calm in Myst's slow,
contemplative genre, but in stills it is indistinguishable from nothing happening.

Q\*bert (L22) does have a one-shot effect (the curse-word speech bubble) but it decays in
under a second, well within the ~4-6s hold window, leaving 3-5s of unchanged pyramid.

## Suggestions (era-faithful, illustrative only — no implementation)

- **Level 6 — Donkey Kong:** Have DK do his signature chest-thump/arm-pump taunt (the
  same animation state that plays between barrel throws) continuously through the
  victory hold, instead of freezing — the sprite work already exists in the file.
- **Level 7 — Dragon's Lair:** Cut to one of the game's signature "success" cutscene
  beats (Dirk triumphant sword-raise), mirroring the real arcade game's reward-on-success
  laserdisc clips rather than holding an idle frame.
- **Level 9 — Super Mario Bros:** Let Mario actually run to and grab the flagpole/slide
  down it (the real 1985 level-clear cue) instead of one small hop — the win state
  already has exclusive control of the timeline to spend on a scripted run.
- **Level 10 — Zelda:** Reuse the existing sparkle system for a Triforce full-glow bloom
  (`triforceGlow`/`drawTriforce` already exist per the file's own functions) — the
  dungeon's own "puzzle solved" cue.
- **Level 11 — Sonic:** Add the series' actual level-clear beat — Sonic stopping to do a
  signature pose/ring-spin, rather than only a background dash-off.
- **Level 13 — Myst:** Have the book visibly *open* and its pages riffle/turn (Myst's
  real transition cue when a page is found) rather than holding an already-static glow.
- **Level 16 — SimCity 2000:** Make the flash big and unmistakable — a fireworks burst
  over downtown (a real SC2000 "celebration" cue when a city milestone is hit) instead of
  a per-building alpha flick invisible against ambient window-twinkle.
- **Level 17 — GoldenEye:** Extend the ripple into a "MISSION COMPLETE" HUD stamp
  (GoldenEye's actual end-of-level debriefing screen cue) so it reads at a glance.
- **Level 18 — Age of Empires:** Redirect the resource burst up and onto the visible map
  (a "wonder built"/age-advance particle wash over the buildings) instead of into the
  black void beneath it.
- **Level 22 — Q\*bert:** Add the genre's real win cue — flip every cube to its target
  color in a wave sweeping up the pyramid, holding that state for the rest of the window,
  rather than only the one-second curse bubble.
- **Level 23 — Missile Command:** Reward with the game's real win-screen cue — a wash of
  fireworks over the still-standing city skyline (the actual "bonus city" celebration
  beat) instead of simply clearing incoming missiles.

## Issues / recorder notes

- No level failed to win — all 24 audited levels (all except excluded Level 8) recorded
  exit code 0 with `rejectedPresses: 0`.
- Level 22 (Q\*bert)'s win landed at t=129.7s (vs ~30-48s for most levels) — expected, not
  a bug: Q\*bert scales its win target by the EXPERIENCE ratio per
  `.claude/rules/theme-authoring.md`, and this run used the default (1x) ratio with a
  longer natural pattern list.
- Several levels (5, 10, 15, 17) needed a second, wider frame extraction because the first
  6-frame pull landed partly on a lingering stale game-area frame (main.js holds the game
  screen briefly post-win before showing the complete overlay) before the theme's own
  post-win render became visible — noted per-level above, both pulls are kept in the
  frames directory for reference.
- A background agent was recording/rebuilding Level 8 (Tetris) throughout this audit,
  confirmed untouched and unread per task scope.
