# Onboarding — First-Time & Returning Player Entry Flows

*Covers everything about entering the game rather than playing it: the first-time cold
open through the first keypress, the returning-player continue screen, the arcade's
Level-1 lighting state, and the design rules for the opening. Split out of
`levels/act1.md` on 2026-07-12 to isolate entry-flow concerns from Act 1's Levels 1–5
curriculum detail. Cross-act tables live in [`../levels.md`](../levels.md); the full
phase-by-phase cold-open/reveal cinematic lives in [`../transitions.md`](../transitions.md).*

---

## Opening Screen & Onboarding

### First-Time Player Flow

Cold open (3s, dark arcade, one cabinet glows) → title screen "READY PLAYER ONE!" with "INSERT COIN" wink and "PRESS SPACE TO BEGIN" → name entry (pre-filled "PLAYER ONE," 16-char cap, any key clears, Space types a space (names can be two words, like the default), Return confirms, saves to localStorage) → "READY [NAME]!" reveal (2s) → slow pan across dark arcade to lit Level 1 cabinet, "START HERE" prompt → letter `j` appears with one-time unprompted finger diagram beneath it.

*Full phase-by-phase cinematic detail: see [`../transitions.md`](../transitions.md)*

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
- **Space confirms/advances everywhere except the name field.** On title, ready, continue, and level-flow screens, Space is the primary quick-advance key by design — *"unlike enter/return the spacebar is where the thumbs rest continually, making it quick to advance"* (Trevor, 2026-07-13). Name entry alone requires Return, because Space is itself typeable there (multi-word names like the PLAYER ONE default).

---

**Next:** [Act 1 — The Arcade](act1.md) (Levels 1–5, the first cabinet the player reaches).
