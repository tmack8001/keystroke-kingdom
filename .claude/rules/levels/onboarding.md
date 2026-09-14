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

### Returning Player Flow *(rebuilt as the slot picker, 2026-07-19)*

localStorage (`kk-slots`) holds **any number** of independent saved games (no cap — a family
can have as many players as it likes). No cold open. When any saved game exists, the session
starts on the **"CHOOSE YOUR GAME"** slot picker — the front door for returning players (it
replaced the old single continue screen). It lists every game plus an always-present
"＋ NEW GAME" row, and scrolls if the list gets long:

```
        CHOOSE YOUR GAME

  ▶ 1  OONA     LV 12   ★ 14 / 42
    2  DAD      LV 20   ★  9 / 42
    3  GRAM     LV  4   ★  1 / 42
    4  SAM      LV  8   ★  3 / 42
         ＋ NEW GAME

  SPACE PLAY · N NEW GAME · C CARDS · X ERASE
```

- **↑ / ↓** (or number keys for the first nine games) move the cursor; the highlighted row glows.
- **Space / Enter** on a game resumes exactly where it left off (same level); on the
  **＋ NEW GAME** row it starts a fresh game (→ name entry, which appends a new game).
- **N** always starts a new game (→ name entry).
- **C** opens that game's **card collection** gallery (found cards revealed, still-locked
  ones shown as `???`).
- **X** erases the highlighted game after a Y/N confirm (only Y erases; N or any other key
  backs out — never trap the child). Erasing one game never touches the others or shared
  preferences.
- **Escape** returns to the attract title (settings via Tab, WOPR/`joshua` magic words).

A pre-slots single save is migrated into Slot 1 automatically the first time, so no returning
player ever loses their game. Each slot shows its **name, level, and ★ cards-found count** —
a Skulltula-style completionist nudge to keep collecting across replays.

### The Arcade at Level 1

At Level 1, only one cabinet is lit. The rest are dark silhouettes — no labels, no indication of what's in them. The Mystery Cabinet is in the far corner, barely visible, no glow yet. As levels complete, cabinets light up one by one in the order the player earns them. By Act 5's Full Circle, every cabinet is on — the room that was nearly dark is now exactly as bright as 1979 at peak hours.

### Design Rules for the Opening

- **Name entry is optional in one keypress.** Never trap a kid in a form.
- **The arcade is never explained.** No "here's how to play" screen. The visual design carries it.
- **The cold open is shown exactly once.** The drama of first arrival is preserved; returning players skip straight to the slot picker ("CHOOSE YOUR GAME").
- **The first finger guide is the only unprompted hint in the whole game.** *(Built
  2026-09-13 — it had been specified since the game was designed and was never
  implemented. A playtest lane went looking for it and found `#finger-hint` empty at
  the very first prompt: the first orientation a brand-new five-year-old got was a
  TEXT hint after their first MISTAKE. `showHomeRowDiagram()` in `js/ui/hud.js` now
  draws two hands on the home row with F and J lit, shown once at Level 1 on a save
  that has never completed Level 1 — a latch derived from existing progress, so no
  new storage. Its caption is deliberately NOT `--nudge-red`: that colour answers a
  mistake, and this hint arrives before the child can make one.)* Every other hint appears only after a wrong keypress. This exception is intentional — the player has zero context at the very first prompt and needs a single orientation moment.
- **"INSERT COIN" does nothing.** It's set dressing. Don't wire it to anything.
- **Space confirms/advances everywhere except the name field.** On title, ready, the slot picker, and level-flow screens, Space is the primary quick-advance key by design — *"unlike enter/return the spacebar is where the thumbs rest continually, making it quick to advance"* (Trevor, 2026-07-13). Name entry alone requires Return, because Space is itself typeable there (multi-word names like the PLAYER ONE default).

---

**Next:** [Act 1 — The Arcade](act1.md) (Levels 1–5, the first cabinet the player reaches).
