# Roadmap & Outstanding Work
## Keystroke Kingdom — living backlog

*Captured 2026-07-11 at the end of the Act 5 / Free Play / Settings / Graphics build session.
Everything below is discussed-and-agreed direction or discovered-and-deferred work.
Update this file as items land or change; each item notes where the detail lives.*

*2026-07-11 (later): citation pass completed across all research/ files — every claim now
carries 2-4 verified sources with [fetched]/unverified labels and per-file "Corrections from
citation pass" sections. Player-facing fix applied: the Level 13 Grace Hopper card no longer
says she taped the moth herself (Smithsonian object record). Also corrected: MTT 1992,
Z-rarest-not-Q (levels.md), Adventure hidden-1979/shipped-1980, ENIAC programmer names,
pinball NOVICE/EXPERT switch claim debunked (tiers stay, justification removed). Pending
from the final citation agent: fix levels.md's Myst "rendered on SGI" claim (actually Mac
Quadras + StrataVision; SGI was Riven).*

**Current state:** all 25 levels playable end-to-end with act cinematics, Free Play,
Survival (opt-in), history cards, easter eggs, and era-progressive graphics — all on the
`act5-full-circle` branch. **Not merged to main** until Trevor's playthrough approves.

---

## 1 — Next up (blocking or high-value)

### 1.1 Merge `act5-full-circle` → `main`
Gate: Trevor plays through and approves. 7 commits, clean history. Nothing else blocks it.

### 1.2 Returning-player persistence  *(biggest gameplay gap)*
The design bible (`.claude/rules/levels.md` → "Returning Player Flow") fully specifies it;
none of it is built. Level progress is not saved at all — every session starts fresh.
- Save furthest-level + per-level completion to localStorage (name and settings already persist)
- Returning session: skip cold open → "READY [NAME] / LEVEL n / KEYS LEARNED …" continue screen
- "PRESS R TO RESTART" with the ERASE ALL PROGRESS? Y/N confirm (the settings screen's erase
  flow already exists — reuse it)
- Select screen: light cabinets the player has actually earned; dark silhouettes ahead
  (per "The Arcade at Level 1" in levels.md)

### 1.3 The Stats Cabinet
Documented in `.claude/rules/product.md`, unbuilt. Now has three tenants waiting:
- Accuracy-over-time graph, keys-learned timeline, words unlocked, session history
- **History-card album** — collection already persists in localStorage `kk-cards`
  (17 cards; see `js/history-cards.js`); needs the browsing UI
- **Cinematic replays** — Mystery/Basement/CommandCenter/FullCircle sequences are
  skippable-after-first-view per spec; the replay entry point belongs here

### 1.4 Lyria music
Zero tracks integrated; audio is procedural WebAudio only. Per-level Lyria prompt drafts
already exist inline in `.claude/rules/levels.md` (each level's "Music:" line).
- Draft the full prompt document (offer stands from this session)
- Generate one track per level (external), store in `/assets/music`
- Playback + per-keystroke flourish integration per `.claude/rules/tech.md` Audio section

---

## 2 — Designed but not built

| Item | Where specified | Notes |
|---|---|---|
| Level 25 free-type finale | levels.md ("First paragraph", credits typed by player) | Currently pattern-based; the word-processor theme already erases on Backspace, so a free-type mode is close. `hello world` easter egg (easter-eggs.md proposal #6) lands with this |
| Adaptive pacing | tech.md "Adaptive Pacing" | Rolling-average keystroke timing driving prompt speed; never a hard timer |
| Visual theme selector | product.md settings table ("Oona's future ideas!") | Settings row exists conceptually; theming is modular via body.level-N + CSS vars |
| Act 6 "mastery wing" | memory + this session's discussion | Post-graduation act: Mario Kart + Tron cabinets, speed/sentence mastery at modern fidelity. PARKED — revisit after core is polished. No new keys remain to teach, so it's a "greatest hits" wing; ordering rules deliberately loosened |
| More easter eggs | `.claude/rules/easter-eggs.md` "Proposed (unbuilt)" | 10-item curated menu: Grace Hopper moth, sudo, white rabbit, rubber duck, dial-up chirp, Y2K monitor, themed 404, the eighth-key confession, all-your-base, hello-world |
| Teacher/classroom mode, mobile/tablet, Godot port | tech.md "Future Considerations" | Far future |

---

## 3 — Tech debt & polish (discovered this session)

- **`fighter.js` art mismatch** — Level 4's cabinet is Galaga (space shooter) but the theme
  draws two brawlers (it predates the Street Fighter II move to Level 12). Redraw as faithful
  Galaga: bug formations, starfield, twin-fighter capture beam. (QA flag, cosmetic.)
- **Two keyboard-geometry sources of truth** — `js/ui/hud.js` KEY_LAYOUT (ANSI, in-game guide)
  vs `js/ui/keyboard-preview.js` KB_LAYOUT (canvas preview screen). Unify on the ANSI data.
- **a11y audit tool artifact** — `docs/a11y/audit.js` measures glowing text against its own
  glow halo and empty fog key-boxes (false FAILs). Fix: inject `* { text-shadow: none }`
  before sampling and skip label-less elements. Baselines: audit-after2.json (pre-graphics),
  audit-graphics.json (post-graphics; all new FAILs are artifact classes).
- **Survival × Free Play combined path** — designed to coexist (timer over sentences); never
  explicitly QA'd end-to-end.
- **Playwright helper duplication** — the goToLevel() recipe is copy-pasted across
  visual-validation.md, capture-all.js, audit.js, and ad-hoc scripts. Extract one shared
  helper module under docs/ or scripts/.
- **Performance pass** — upgraded themes (particles, parallax, projection) target 60fps and
  were spot-checked headless; verify on a low-end machine, esp. Acts 3-4.
- **Level 24 pattern crowding** — level 24 now injects BOTH the player's name (twice) and the
  'Eniac' card word; fine in testing, but watch pacing when Oona plays it.

## 4 — Tooling / process

- **`arcade-historian` agent** (`.claude/agents/arcade-historian.md`) — reusable research
  agent encoding the citation standard (2-4 live-verified sources per claim, institutional-
  first hierarchy, no URLs from memory, [fetched]/unverified labels, corrections sections,
  downstream flags for player-facing text). Use for ANY new historical content: future
  history cards, easter eggs, Act 6 cabinet research, Lyria-prompt era research. Registry
  loads at session start — available from the session after its creation (2026-07-11).

- **Chrome DevTools MCP** — registered in project config; connects on next Claude Code session
  (this session predated the registration). Prefer it over the Playwright fallback when live.
- **Screenshot regeneration** — `node docs/screenshots/capture-all.js` (server must be running;
  Go binary embeds assets → rebuild after any js/css change: `go build -o keystroke-kingdom .`).
- **Contrast audit** — `node docs/a11y/audit.js --out=docs/a11y/audit-<name>.json`.
- **Visual validation rule** — `.claude/rules/visual-validation.md` is mandatory after
  theme/level/UI changes.

## 5 — Open design questions (decide when relevant)

- Should Survival mode ever appear in the child-facing UI, or live behind a "parent" framing?
  (Currently a neutral settings row, defaulted to ADVENTURE.)
- Word banks were AI-curated for early readers — worth a pass with an actual educator or
  against a published decodable-word list?
- Do history cards deserve a sound (paper pickup) and/or a card-flip animation on the
  complete overlay? (Kept minimal in v1.)
- The keyboard-preview screen ("KNOW YOUR KEYS") is skipped in Free Play — should a
  condensed version appear the first time Free Play is ever entered?
