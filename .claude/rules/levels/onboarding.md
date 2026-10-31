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

  ▶ 1  OONA     LV 12   ★ 14 / 76
    2  DAD      LV 20   ★  9 / 76
    3  GRAM     LV  4   ★  1 / 76
    4  SAM      LV  8   ★  3 / 76
         ＋ NEW GAME

  SPACE PLAY · N NEW · R RENAME · C CARDS · X ERASE
```

- **↑ / ↓** (or number keys for the first nine games) move the cursor; the highlighted row glows.
- **Space / Enter** on a game resumes exactly where it left off (same level); on the
  **＋ NEW GAME** row it starts a fresh game (→ name entry, which appends a new game).
- **N** always starts a new game (→ name entry).
- **R** renames the highlighted game *(added 2026-10-30, Trevor)*. It opens the name field
  labelled **RENAME THIS GAME**, pre-filled with that game's current name; Return saves the
  new name, Escape backs out with the name unchanged; both return to the picker. **This is
  the ONLY way a saved game's name ever changes.** Renaming never changes which game is active
  — **including when no game is active**: it must not make the renamed game the active one
  *(2026-10-30 — Return on a rename with `active: null` had set `active` to that game)*.
  **The pre-filled name is a default, not a draft** *(2026-10-30)*: exactly like first-time name
  entry, the first thing typed REPLACES it (`GRAM` + typing `GRANDMA` used to give
  `GRANDMAGRAM`). The first Backspace clears it whole; ←/→/Home/End mean "edit this name" and
  keep it; Space still types a space.
- **C** opens that game's **card collection** gallery (found cards revealed, still-locked
  ones shown as `???`).
- **X** erases the highlighted game after a Y/N confirm (only Y erases; N or any other key
  backs out — never trap the child). Erasing one game never touches the others or shared
  preferences. **The confirm names the game** — `ERASE THIS GAME?` then `GRAM · LV 4` — because
  on a family machine "this game" does not say whose *(2026-10-30)*.
- **The hint line offers only keys that do something there** *(2026-10-30)*: on a game row,
  `SPACE PLAY · N NEW · R RENAME · C CARDS · X ERASE`; on the ＋ NEW GAME row — and on a
  picker with no games left — just `SPACE START A NEW GAME`.
- **Settings → ERASE ALL PROGRESS** says how much it destroys: `ERASE ALL 3 SAVED GAMES?`
  (`ERASE 1 SAVED GAME?` for one), with `YOUR SETTINGS STAY` beneath — a count, never a name.
- **Escape** returns to the attract title (settings via Tab, WOPR/`joshua` magic words).
  Leaving the picker this way makes the **highlighted** game the active one — see *Which game
  is playing* below.
- **★ found / total** counts the **arcade** card bank only (`TOTAL_CARDS` — 76 on 2026-10-30,
  including the secret WarGames card; read it from the code, never from this line). Wing and act cards have their own shelves in the collection
  gallery and never inflate this line — a blended count is the `CARD 63 OF 60` defect (INV-100).

#### The arcade from READY, and why name entry no longer appears for a saved game *(Trevor, 2026-10-30)*

A parent typed `wopr` into what they took to be a menu and silently renamed `DAD` to `WOPR`.
The cause: **Escape on the READY screen used to drop back into name entry**, and any typing
there plus Return renamed the active saved game. Name entry was doing two jobs — *"who are
you?"* for a new player and *"rename this game"* — with no label telling them apart.

- **Escape on READY goes to the arcade select screen** for a saved game — the cabinet wall,
  with the unlock gates honoured (a locked cabinet or bonus wing stays dark and unselectable;
  only the WOPR bypass lifts them). From the arcade, **Escape returns to the picker**.
- **Choosing a cabinet in the arcade goes straight to READY** for the active game. It no longer
  passes through name entry.
- **Space on the attract title, when saved games exist, opens the picker**, not name entry.
- **Name entry is only for a new game** (the picker's N / ＋ NEW GAME, or a brand-new machine's
  first-time cold open, which is unchanged) **and for the labelled R RENAME action.** It is never
  reached by accident from a saved game.

#### Which game is playing *(Trevor, 2026-10-30)*

A Level 11 win was once credited to the wrong family member: the player highlighted their own
row, left the picker, and played through the WOPR shortcut — which used whichever game had been
*resumed* last, not the one they were pointing at. **The active game must be unambiguous
whenever a game starts:**

- Space on a picker row makes that game active (unchanged).
- **Escape from the picker makes the highlighted game active**, so whatever is played next —
  including through the WOPR shortcut — is credited to the game the player last pointed at.
  (On the ＋ NEW GAME row, the active game is left as it was.)
- **The READY screen and the in-game HUD always show the ACTIVE game's name**, read from the
  save at the moment the game starts, so the name on screen is always the game being credited.

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
- **A saved game is never renamed by accident.** Name entry for an existing game exists only
  behind the picker's labelled **R RENAME**; every other route from a saved game skips it
  (see *The arcade from READY* above).
- **Space confirms/advances everywhere except the name field.** On title, ready, the slot picker, and level-flow screens, Space is the primary quick-advance key by design — *"unlike enter/return the spacebar is where the thumbs rest continually, making it quick to advance"* (Trevor, 2026-07-13). Name entry alone requires Return, because Space is itself typeable there (multi-word names like the PLAYER ONE default).

---

**Next:** [Act 1 — The Arcade](act1.md) (Levels 1–5, the first cabinet the player reaches).
