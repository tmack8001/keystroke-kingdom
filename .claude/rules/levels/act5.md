# Act 5 — Full Circle (Levels 21–25)

*Covers Levels 21–25 (keys - = [ ] \ ` ' Shift Space Backspace — the last symbols, capitals,
and space/backspace, completing the full keyboard). Era span 1980–Present; graphic-quality
bar: Levels 21–23 are 1–8 color arcade pixel art (The Corner Cabinets), Levels 24–25 modern
shaders/particles/full resolution. Cross-act tables live in [`../levels.md`](../levels.md).*

*(This file absorbs the former `.claude/rules/act5-full-circle.md`, itself split out of
`levels.md` on 2026-07-11 under journal F21; re-consolidated here on 2026-07-12 when the
whole curriculum bible was re-split per-act for targeted context loading.)*

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
- **Game:** High Score Entry (`js/themes/highscore.js`) — this is the "type your own name in all caps" level. The player types their name: **OONA**. It appears as a high score entry. Personal, irreplaceable.
- **Narrative beat:** The opening screen appears again — "READY PLAYER ONE." But this time, the player types it themselves.

---

### Level 25 — Space & Backspace
- **Concept:** Space has been auto-advancing prompts throughout. Now it becomes intentional — part of the typing, not infrastructure. Backspace introduces self-correction: the first time the game allows deletion.
- **Design note:** Backspace is pedagogically important to frame correctly. *"Backspace isn't failure. Every writer uses it. Every coder lives in it. It's not going back — it's making it right."*
- **Game:** Word Processor (`js/themes/wordprocessor.js`) — a word processor aesthetic. The level plays its normal pool to the traditional win target, then **extends past it into an earned "MY STORY" coda** *(built 2026-07-28)*: the player types a readable **"walk the keyboard" story** engineered so **every letter A–Z gets typed** (this is the "true entire keyboard unlocked" level), which includes a playful scripted **typo→Backspace→correct** beat (exercising L25's new Backspace key — fully choreographed content, never a real penalty), and whose **final line(s) are the EXPERIENCE-tier Hacker Manifesto excerpt** capping the story. The story **rotates through a pool** (a different one each replay, per-slot like the history cards) and **grows longer at higher EXPERIENCE tiers**. Stories are LLM-generated (local-Ollama `/api/keyboard-story`) with a **mandatory static bank** (6 all-26-letter stories) as the offline floor. Data + assembly: `js/keyboard-story.js`; the manifesto capstone reuses `js/finale-quote.js`. See docs/features/engine-flow.md + ROADMAP §2.
- **Narrative beat:** Credits roll. In a terminal font. The player typed them.

---

## Milestones and Narrative Beats (Act 5)

| Milestone | Trigger | What Happens |
|---|---|---|
| Full circle | Level 20 finish | Back to the arcade. Every cabinet glowing. Level 21 begins immediately. |
| Corner cabinets cleared | Level 23 finish | All three forgotten cabinets lit. Symbol keys complete. |
| Player types their name | Level 24 finish | High score entry. The player's own name, in caps, on screen. |
| Full keyboard mastered | Level 25 finish | The player types their own first sentence. "You built this." |

Cinematics (including the Act 4 → 5 "Full Circle" transition that becomes Level 21): [`../transitions.md`](../transitions.md).
