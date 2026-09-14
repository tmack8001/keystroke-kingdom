# Theme Authoring Rules
## Keystroke Kingdom — everything a theme file must respect

*Consolidated 2026-07-11 from hard-won journal entries (L16, L17, L20, L24, L28, L29,
O11, F1) and the theme-space rework wave. Load this before writing or editing any
`js/themes/*.js` file. The validation requirements live in `visual-validation.md`.*

---

## The module contract

Every theme exports the same interface the engine and `js/themes/index.js` registry
expect: `start()`, `stop()`, `keystroke()`, `miss()`, `patternComplete()` (returns
boolean — see win-gate below), `victory()`. All draw on the shared `#invaders-canvas`.
Read two sibling themes before writing a new one. Never add engine logic to a theme;
themes respond to hooks, they never gate input.

## Victory must celebrate (Trevor, 2026-07-12)

`victory()` is not a teardown hook — it IS the level's celebration. **Every theme
fills the victory window with a distinct, era-faithful celebration animation styled
on the real game's own win/clear moment** (Space Invaders' ship takeoff and Game Boy
Tetris's rocket launch are the reference bar), and returns its duration in ms — the
engine shows the LEVEL COMPLETE card right as the animation lands (clamped
1200–6000ms; no return value = a legacy fixed 4000ms hold, which for a theme without
a real animation is 4 seconds of dead air — a product violation: "Level Completion —
full celebration sequence — this is the big moment" (product.md)). Celebrations are
joyful, never alarming, and the window stays keypress-skippable (engine behavior —
don't fight it). **Verify with differing frames extracted from an actually-won run**,
never by reading the code — code that looks animated but renders identical frames is
the exact failure mode Trevor caught (victory-audit 2026-07-12).

## Layout — "the UI owns the center; the theme owns the frame"

> **⚠️ This is the rule this project breaks most often.** Journal **F30** (2026-09-13):
> one audit found FOUR levels violating it at once, and they did not look related —
> Tetris's *whole well* was centred behind the prompt panel and the keyboard guide (the
> reported symptom was "the stack never accumulates"; the stack was fine, it was
> invisible), Galaga's formation covered the prompt letter a child must read, and three
> counters sat under the HUD badge or fell off the canvas. **Centre is the instinctive
> place to put the good bit, and in this game centre is spoken for.** Before you place
> anything, ask where the panels are — and if a comment tells you a constraint cannot
> be met, check whether the thing it calls impossible is actually LOCAL (Galaga's was:
> "without shrinking sprites game-wide" — the sprite scale is a per-theme const).

Full contract with measured safe-zone fractions: `visual-validation.md` → "The Theme
Layout Contract". Summary: prompt panel and keyboard guide permanently reserve the
center; compose focal art in the stage (side margins, top band, gap band ~0.43–0.49H,
bottom strip). Ambient fill may pass behind panels; nothing the player must SEE may.
The screenshot must read as a complete scene *with the panels present* (L29, L17).

## Canvas discipline

- **Canvas space, never DOM space** — position everything as fractions of canvas W/H;
  never `getBoundingClientRect()` for art placement (L16).
- **Set text state explicitly** — `ctx.textAlign` and `ctx.textBaseline` in every draw
  function that renders text. Canvas 2D state leaks between screens; the previous
  screen's `'center'` will silently break your left-anchored text (L28).
- **Clamp all frame-driven math** — no sentinel frame values reaching geometry (the F1
  victory crash: frame 9999 → arc radius −9959 → IndexSizeError every victory).
- **Bounded pools** — fixed caps on particles/entities/trails; no per-frame allocation
  in the hot draw path. Target 60fps.
- **Glyph coverage** — Press Start 2P silently lacks or shrinks some glyphs (←→ blank;
  backtick a single pixel). Screenshot any symbol you render (O11). Small prompt glyphs
  are handled centrally in hud.js (`SMALL_GLYPH_BOOST`) — don't re-solve per theme.

## Game-feel rules

- **Nothing punishing, ever.** `miss()` gets at most a gentle ambient response — never
  loss, never alarm, never scary imagery. Enemies are comic and harmless.
- **Reward within 1–2 seconds of a keystroke** — reward reliability beats simulation
  accuracy for a young child (L18).
- **Engagement gates** — background simulation must not progress the game state in an
  unattended tab; gate consequential events on recent keystrokes (L20).
- **Cabinet art is faithful, not gimmicky — DRAW A REAL THING.** A real cabinet where one
  exists; the **real console, computer or handheld** where one does not. The only ruled-out
  option is inventing a coin-op that never existed and implying it did.
  *Added 2026-09-13 after the absence of this sentence caused a real error:* a research page
  wrote *"There is no Super Mario Kart arcade cabinet. SNES only. **Do not draw one.**"* — the
  narrow claim was true (the 1992 SNES title was never a coin-op) but it was relayed as an
  absolute, on a page that never mentioned the licensed **Mario Kart Arcade GP** line (Namco,
  2005 → GP DX, still in production). The right answer was **in the same paragraph** — *"the
  faithful object is an SNES and a television"* — but it sat under the prohibition, and the
  prohibition is what travelled. **A "do not do X" with no "do Y instead" beside it reads as
  "there is nothing to draw."** Write both halves, always.
  The game has done this since Act 2, which `levels/act2.md` describes as *"computers and
  consoles from different eras line the walls, each one running a classic game"* — a gold-
  cartridge NES beside a wooden TV (L10), a Game Boy Pocket on a backlit stand (L15).
  Ground the hardware like any other era claim: `research/wiki/culture/home-games-in-cabinets.md`
  and `research/wiki/tech/console-hardware-silhouettes.md`, never model memory. (That page
  exists partly because a summariser asserted mid-research that the original PlayStation was
  black. **It is grey.** Black is the PS2.)
- **Control panels are part of the drawing, and TEXT ALONE IS NOT ENOUGH** *(2026-09-13)*.
  Every cabinet used to share one generic joystick-and-two-buttons panel while the wiki's own
  pages said otherwise — Breakout takes a **rotary paddle knob and no joystick at all**,
  Pac-Man has **no gameplay buttons**, Street Fighter II has **six**, Missile Command a
  **trackball**, Out Run a **wheel, shifter and pedals**. Per-cabinet descriptors now live in
  `CABINET_DATA[n].controls`, each with its citation inline; **absence means "not sourced",
  never "assume a joystick"**. Reference: `research/wiki/tech/arcade-control-panels.md`.
  **Trevor's standard is text AND imagery:** *"make sure we base them on actual discovered
  text and imagery of an arcade cabinet."* When photographs were finally found, **all three
  drawings made from text alone were wrong** — journal **F29** names the three ways
  (silence filled by default; a cited detail dropped because it was awkward to draw; a rule
  applied inconsistently within one document). Prefer a **restorer's photographs of an
  UNRESTORED machine**; treat replicas, mini-cabinets and later revisions as evidence for
  *themselves only*. **✅ The 25 cabinet SCREENS were audited against their wiki pages on 2026-09-13** and four
  were wrong — Level 4 was drawing **Street Fighter II** on the Galaga cabinet (the game moved
  to Level 12 years ago; the art never did), Breakout and Space Invaders had invented colours
  their monochrome-plus-cellophane screens could not produce, and Dragon's Lair had no dragon.
  See `docs/ROADMAP.md` §3. Level 13 (Myst) remains weak-but-not-wrong.
- **Draw the platform the game DEBUTED on** *(Trevor, 2026-09-13)*. Many console games later
  got arcade cabinets — *Super Mario Bros.* (NES, 13 Sept 1985) became **VS. Super Mario Bros.**
  (arcade, Feb 1986) — but the debut platform is what this game depicts, because that is where
  the game was born and where a child met it. So arcade-first titles stay cabinets even when
  they had famous home ports (Donkey Kong, Street Fighter II, Out Run), and home-first titles
  stay machines even when they reached an arcade (Mario, Zelda, Sonic, Pokémon, Myst). Where a
  debut is genuinely contested, say so on the wiki page rather than picking.
  Reference: `research/wiki/tech/console-hardware-silhouettes.md`.
- **Era fidelity** — palette/fidelity per the level's act file
  (`.claude/rules/levels/actN.md`). Faithful recreation over gimmick; no key-glyph puns.
- **Mechanics fidelity, wiki-grounded** (Trevor, 2026-07-12) — the scene must show the
  original game's SIGNATURE MECHANIC actually operating (pieces falling, barrels
  rolling and being jumped, formations diving), judged against the research knowledge
  graph, never model memory: `node scripts/wiki-search.mjs "<game>"` →
  `research/wiki/games/*.md` (+ `research/arcade-cabinets-by-era.md` gameplay rows)
  is the ground truth for what the game's play WAS. The scoring scale is STRONG
  (indicative of the original's play) / WEAK (motion that doesn't represent it —
  the vines-on-DK class) / NONE (not much happening); a theme ships at STRONG. If
  the wiki under-documents a game's mechanics, that's an arcade-historian follow-up,
  not a license to improvise. Liveness is necessary but not sufficient — verify with
  time-separated frames from a live scene, not code reading or a single screenshot.

## The win-gate accumulator pitfall

If `patternComplete()`'s win condition and a per-word display both count progress, use
SEPARATE accumulators (cumulative `totalTyped` for the gate, resettable `entryChars`
for display). Resetting a shared accumulator for display silently makes the level
unwinnable — and a level that won't end is a One Rule violation. Also: once
`patternComplete()` reports won, it must stay won on repeated calls (the engine may
re-ask); progress must only ever move toward completion.

## The EXPERIENCE win-ratio

The EXPERIENCE setting scales how much typing a level requires before it can be won.
Themes SHOULD scale their internal win targets by `getWinRatio()` (exported from
`settings.js`; tiers 1 / 1.5 / 2.25 / 3.5, default 1). Resolve it once in `start()`
(e.g. `MIN_SEQUENCES = Math.ceil(BASE * getWinRatio())`) so a mid-session change takes
effect on the next play. Scale word/sequence TARGETS, never spectacle-pacing constants
(Tetris scales `MIN_SEQUENCES`, not `MIN_ROWS`) and never geometry-fixed structures
(Q\*bert keeps its 28-cube pyramid and adds a scaled EXTRA-sequence floor instead — at
1x the floor is 0, so behavior stays byte-identical). The invariant holds at EVERY tier:
the scaled gate must remain guaranteed-reachable — verify at 1x AND at the max (3.5x).
The engine refills its pattern pool infinitely, so a higher target is structurally
reachable; a higher ratio is always MORE play, never a penalty. `tetris.js` and
`qbert.js` are the reference implementations; the other themes consume the ratio only
through the engine's minimum-patterns gate until individually wired.

## Security boundary

Themes draw on the shared canvas via `fillText`/shapes — they must never create DOM
sinks (`innerHTML` etc.) or touch user-influenced strings like the player name. If a
theme ever needs text a user typed (Level 24/25 do), it arrives pre-sanitized through
the engine's pattern stream — render it with canvas text only. Full conventions:
`.claude/rules/security.md`.

## Dead code

Heavy iteration accumulates orphans (`update2()`, unused consts). End any substantial
theme edit with a dead-code sweep of that file (L24).

## Before you're done

Run the full `visual-validation.md` check — including check #5 (scene composed in the
stage regions) — on your OWN static server (`python3 -m http.server <port>`), never the
possibly-stale `.dev-url` binary. Idle 3+ seconds AND type keys before screenshotting;
animation-time errors don't show at frame zero.
