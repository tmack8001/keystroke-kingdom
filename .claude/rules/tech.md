# Technical Design Document
## [Working Title: Home Row Heroes / Keystroke Kingdom]
*Built by Trevor & Oona - a father and daughter game*

---

## Philosophy

Build fast, stay scrappy, learn what we like. Let AI agents do the heavy lifting on first passes. Browser-first — zero install friction, shareable instantly, Oona can just open a tab and play.

> *"Get hands dirty. Let the agents build bespoke code, tailor it low-friction to your vision, learn what you like. If you land on something worth shipping for real, then take the learnings and spec it on a real platform."*
> — LinkedIn advice, May 2026

*That advice launched this as a prototype. It has since graduated (declared by Trevor,
2026-07-12): all 25 levels playable end-to-end with cinematics, persistence, QA
tooling, and a verified research layer. This IS the game — the browser build is the
platform until a deliberate decision says otherwise (see Future Considerations).*

---

## Current Stack

| Layer | Choice | Reason |
|---|---|---|
| Platform | Browser (HTML/CSS/JS, bespoke) | Zero friction, instantly shareable |
| Game Engine | Bespoke (deliberate — no framework) | Low-level control, agent-friendly |
| AI Assistance | Claude (Anthropic) | Architecture, code, design decisions |
| Music Generation | Google Lyria | Original per-level chiptune songs |
| Visual Style | Pixel / retro arcade CSS/Canvas | Era-authentic, lightweight |
| Future Engine | Godot (if we ship beyond the browser) | OSS, scriptable, beginner-friendly |

---

## Architecture Overview

```
/  (repo root — served + embedded by main.go)
  index.html            # All screens' markup
  main.go               # Dev server: embeds index.html, css/, js/ at BUILD time
  js/
    main.js             # Engine: state machine, input contract, survival wrapper
    levels.js           # Curriculum data: FINGER_MAP, KEY_REACH, LEVELS 1-25
    freeplay.js         # Free Play sentences + full-keyboard session builder
    history-cards.js    # 17 computing-history moments + collection persistence
    settings.js         # Settings model (localStorage kk-settings) + rows
    audio.js            # WebAudio procedural sounds (+ global enable toggle)
    mystery.js basement.js commandcenter.js fullcircle.js   # Act cinematics
    themes/             # One era-faithful canvas scene per level (+ index.js registry)
    ui/
      hud.js            # HUD, WPM, ANSI keyboard guide (KEY_LAYOUT), prompt render
      keyboard-preview.js  # "KNOW YOUR KEYS" canvas screen
      cabinet-art.js    # Select screen: ACTS + pixel cabinet art
      screens.js        # Screen switching, level theming, ready screen
  css/                  # base / screens / levels (per-level palettes)
  scripts/              # kk-playwright.js (shared nav helper), record-playthrough.js,
                         # dev.sh, *-hook.sh (docs-currency/journal/wiki-context/wiki-freshness/theme-authoring)
  docs/                 # ROADMAP.md, screenshots/ (+capture-all.js), a11y/ (+audit.js),
                         # testing/ (STRATEGY.md doctrine + INV catalog, FINDINGS.md ledger)
  tests/                # behavior-first suite: static/ unit/ integration/ helpers/
                         # (node --test, zero deps; make test-fast / make test)
  research/             # Background research documents
```

**Build gotcha:** the Go binary embeds assets at compile time — after ANY js/css change,
`go build -o keystroke-kingdom .` and restart, or the server serves stale code.

**Browser auto-open is TTY-gated** (Trevor, 2026-07-14): a dev run (`PORT` unset) opens a
browser tab ONLY when stdout is a real terminal — so a human running `./keystroke-kingdom` or
`scripts/dev.sh` from their shell still gets a tab, but an agent/CI running the binary through a
captured pipe does NOT (no more 5+ tabs spawning during agent build/restart cycles). `main.go`
`stdoutIsTerminal()` decides; `PORT=<n>` (container mode) and `KK_NO_OPEN=1` also suppress. The
`.dev-url` file is still written in dev mode regardless.

---

## Core Engine Principles

### Platform Key Label Detection
- Mac keyboards label the confirmation key **Return**; Windows/Linux keyboards label it **Enter**
- The browser fires `e.key === 'Enter'` on both — event handling is platform-agnostic
- All UI text that displays the key name uses `[data-enter-key]` span elements that are updated at page load via `navigator.platform`
- Never hard-code the word "ENTER" in display strings — always use `[data-enter-key]` elements

### Input Handling
- Capture keypress events
- Validate against **expected key** for current prompt
- On correct key: advance, trigger positive feedback
- On wrong key:
  - Play gentle nudge sound
  - **Do not advance** — letter stays and waits
  - Log mistake quietly against that specific letter
  - Show subtle finger position hint if hint setting is on
  - When player then hits correct key: advance normally, no double penalty

### Mistake Tracking
```javascript
// Per-letter mistake log (not per-attempt)
mistakes = {
  'j': 2,
  'f': 0,
  'd': 1,
  ...
}
// Never used to punish — only used for stats visualization
```

### Adaptive Pacing
- Track average time between correct keypresses
- Use rolling average to set prompt display speed
- Player slows down → game slows down with them
- Player speeds up → game can optionally increase pace
- No hard timer — pace is always derived from the player

### Survival Mode (opt-in only)
- When enabled: adds time pressure and/or life counter
- Implemented as a wrapper/modifier on top of base engine
- Base engine never has survival logic — it's always additive

---

## Word Bank System

Words unlocked progressively as keys are learned. Word selection criteria:
- Phonetically simple
- Early reader vocabulary
- 3–5 letters initially
- Sourced from common sight word lists + decodable word lists

```javascript
// Example word bank structure
wordBank = {
  keys_jf: [],           // No words — patterns only
  keys_jfdk: [],         // No words — patterns only  
  keys_jfdksl: [],       // Still no words — no vowel in this key set, nothing spellable
  keys_all_homerow: [    // Full home row (A unlocks) — first real words appear here
    'dad', 'sad', 'fad', 'lad', 'ads', 'lads', 'lass', 'flask', 'falls'
  ],
  keys_reaching: [       // As vowels unlock
    'lake', 'safe', 'jade', 'dusk', 'file'
  ]
}
```

---

## Feedback System

### Correct Keypress
- Subtle positive sound (musical, fits current level's track)
- Letter glows or pulses briefly
- Stats counter increments quietly in corner
- Game continues — **never interrupts flow**

### Wrong Keypress
- Gentle nudge sound (not harsh or alarming)
- Letter stays — does not advance
- Optional: subtle finger position hint appears
- Mistake logged silently to that letter's counter

### Word Completion
- Small ambient flourish added to background music track
- Word glows momentarily
- **Next prompt appears immediately** — player can celebrate or keep going, their choice

### Level Completion
- Full celebration sequence — this is the big moment
- Styled per level era (Atari beeps → SNES fanfare → mystery reveal)
- Level 4 completion triggers Mystery Cabinet glow sequence

---

## Stats & HUD

### In-Game HUD (small, corner, non-distracting)
```
PLAYER ONE
ACCURACY  94%
STREAK    12
KEYS      jfdk
```
- Pixel font
- Dimly styled — visible but not looming
- No lives counter
- No countdown timer

### Stats Cabinet (in-world, accessible anytime)
- Accuracy over time graph
- Keys learned timeline
- Words unlocked list
- Session history
- Styled as retro arcade high score board

### Session Summary Screen
- Appears at natural end of session
- Styled as arcade high score entry
- Shows: accuracy, new keys learned, new words unlocked, streak record

---

## Settings & Toggles

All settings stored in localStorage for persistence between sessions.

```javascript
defaultSettings = {
  playerName: 'Player One',
  survivalMode: false,
  timeLimits: false,
  livesEnabled: false,
  fingerTracking: 'gentle',    // 'off' | 'gentle' | 'strict'
  hintAggression: 'moderate',  // 'subtle' | 'moderate' | 'obvious'
  mistakeVisibility: 'small',  // 'hidden' | 'small' | 'prominent'
  visualTheme: 'arcade1979',   // expandable
  statsVisible: true
}
```

---

## Visual Implementation

### Tech Approach
- HTML5 Canvas for game world and arcade environment
- CSS for UI overlays (HUD, settings, menus)
- Pixel art sprites (generated or hand-crafted)
- Scanline effect via CSS overlay
- CRT glow effect via CSS box-shadow/filter
- Retro pixel fonts via Google Fonts (Press Start 2P or similar)

### Arcade Cabinet Game Assignments
**One game per cabinet. Never reuse a title across levels.** Clearly distinct games in the same franchise (Pac-Man vs Ms. Pac-Man) are allowed; near-identical reskins are not.

| Level | Game | Developer | Year | Theme file |
|---|---|---|---|---|
| 1 | Breakout | Atari | 1976 | `themes/breakout.js` |
| 2 | Space Invaders | Taito | 1978 | `themes/invaders.js` |
| 3 | Pac-Man | Namco | 1980 | `themes/pacman.js` |
| 4 | Galaga | Namco | 1981 | `themes/galaga.js` |
| 5 | Joust | Williams | 1982 | `themes/joust.js` |

### Era Progression
| Level | Era | Color Palette | Effect |
|---|---|---|---|
| 1 | Atari 1977 | Black + 1 color | Minimal, blocky |
| 2 | Arcade 1980 | Black + 4 colors | Simple sprites |
| 3 | NES 1985 | 8-bit full palette | Scrolling backgrounds |
| 4 | SNES 1991 | Rich 16-bit palette | Parallax, animation |
| 5 | Arcade 1982 | Orange/black | Lava + flapping knights |
| Mystery | Future | Glowing, futuristic | Full reveal sequence |

---

## Audio

- One original Lyria-generated track per level
- Tracks stored as .mp3 or .ogg in /assets/music
- Web Audio API for playback and dynamic flourishes on correct keypresses
- Gentle nudge sound and positive feedback sounds as separate short clips

---

## Roadmap

### Phase 1 — Prototype ✅ (complete)
- [x] Keypress input engine · Level 1 playable · gentle feedback · HUD · opening screen

### Phase 2 — Core Game ✅ (complete except music)
- [x] All home row levels — and in fact ALL 25 levels + 4 act cinematics
- [x] Word bank system (per-level pools + Free Play sentences)
- [ ] Music integration (Lyria) — see docs/ROADMAP.md §1.4
- [x] Settings toggles (Tab; ADVENTURE/SURVIVAL, difficulty tiers, hints, sound, CRT, stats)
- [ ] Stats cabinet — see docs/ROADMAP.md §1.3 (history-card album + cinematic replays live here)

### Phase 3 — Mystery Cabinet ✅ (complete)
- [x] Mystery reveal · reaching keys · expanded word banks · plus Basement/CommandCenter/FullCircle

### Phase 4 — Current focus
- [x] Returning-player persistence (docs/ROADMAP.md §1.2 — built 2026-07-11)
- [x] Behavior-first test suite — 323 test cases over documented intent (2026-07-12/13; docs/testing/STRATEGY.md; all 6 inaugural TF findings resolved — FINDINGS.md)
- [x] Word-length difficulty lever (2026-07-13) — MIN/MAX WORD LENGTH settings (getWordLengthRange), engine pool filter with a winnability fallback, wordgen [2,12] window, full-spectrum word-bank expansion. The game ages with the player (product.md §Word Length; INV-38..41)
- [ ] Lyria music · Stats Cabinet · Level 25 free-type finale
- [ ] Accessibility: maintained via docs/a11y/audit.js (scrim-panel system in place)
- [ ] Additional visual themes (Oona's ideas!) · Godot evaluation

**The living backlog is `docs/ROADMAP.md` — keep it current every session.**

---

## Future Considerations
- Godot port if the game is worth shipping beyond the browser
- Teacher/classroom mode (shared stats view)
- Additional visual themes as user-selectable options
- Mobile/tablet support (on-screen keyboard overlay?)

---

*This is a living document. Built with love by a dad and his daughter.*
