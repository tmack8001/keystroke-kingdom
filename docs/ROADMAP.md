# Roadmap — the LIVE backlog

> ## The two-file contract *(established 2026-09-16)*
>
> | File | Holds | Tense | Rule |
> |---|---|---|---|
> | **`ROADMAP.md`** (this file) | **only work that is still open** | present | **A ✅ here is a bug.** Done work moves out. |
> | [`roadmap-history.md`](roadmap-history.md) | every completed wave, verbatim | past | Append-only. Never rewritten to describe today. |
>
> **Why.** A five-lane audit on 2026-09-16 found the old single 1765-line file asserted an item's status
> in two or more non-adjacent places, with no way to tell which was current — **because the newest
> statement was not the lowest one.** Reading top-down and bottom-up gave opposite answers. That shape
> produced every stale entry the audit found, including a merge status that was wrong in the
> orientation paragraph an agent reads first.
>
> **So the discipline is: an item lives in exactly ONE of these two files.** When you finish something,
> you do not tick it here — you *move* it to `roadmap-history.md` with its date. If you want the detail
> behind anything below, it is in the history file; nothing was deleted in the split.
>
> **Every item below is open as of 2026-09-16** and was verified against source by that audit.

---

## 1 — Next up (blocking or high-value)

### 1.1 ⚠️ Merge `static-hosting-2026-09` → `main` — the highest-stakes item on this board

`main` has not moved since **2026-07-28** (`797c95c`). **60 commits** sit unmerged.

Pages serves the repo root of `main` with no build step, so **every push to `main` is a deploy** — which
means everything built since July is invisible to actual players: Act 7 THE SPEEDWAY, THE HARDWARE wing,
adaptive pacing, the nine easter eggs, twenty new history cards, the act-card layer, the static-host
fixes.

It silently blocks other items too: a sound check "against the live URL" would be testing a build 60
commits stale, and the published static-host gate keeps failing until merge.

*(The old entry tracked `act5-full-circle`, which has been fully merged the whole time — `git rev-list
--count main..act5-full-circle` → 0. Wrong branch, wrong count, wrong stakes.)*

**Gate:** Trevor plays through and approves.

### 1.2 The Stats Cabinet — unbuilt
Documented in `.claude/rules/product.md`; no screen, no code (`grep -rni "stats.cabinet" js/ index.html`
→ zero). Remaining tenants: accuracy-over-time graph, keys-learned timeline, words unlocked, session
history. The history-card album it was going to host shipped separately as the collection gallery.
**Also homeless:** a **cinematic replay entry point** — the four act cinematics are skippable but there
is no way to re-watch one.

### 1.3 Lyria music — zero tracks
Audio is procedural WebAudio only; there is no `assets/` directory and no audio file in the repo.
- ⚠️ **Only 15 of 25 levels have a prompt draft.** They live in `.claude/rules/levels/act1.md`,
  `act2.md`, `act3.md` — **Acts 4 and 5 have none.** (§2 lists this as a hard blocker for the proposed
  rhythm act, on the assumption the prompts were done.)
- Write the ten missing Act 4/5 prompts, then the full prompt document.
- Generate one track per level (external), store in **`assets/music`** — relative, never `/assets/music`;
  a root-absolute path escapes the `/keystroke-kingdom/` prefix on Pages and 404s.

---

## 2 — Designed but not built

Proposals and specs with no implementation. Detail for each is in `roadmap-history.md` and the named spec.

| Item | Status | Next step |
|---|---|---|
| **In-browser LLM** (`docs/specs/browser-llm.md`) | Spec written; `grep "LanguageModel" js/` → zero | **Awaiting Trevor** — 4 decisions in §11; recommended start is a measure-only Phase 0 |
| **Act 7 Phase 2** — 9 more tracks | Phase 1 shipped (Monaco GP, F-Zero) | The modern-F1 track is the one that needs the WebGL2 decision below |
| **Act 7 rendering backend** | Recommendation written: raw WebGL2, tracks 10–11 only | Blocks the modern track; nothing vendored yet (`js/vendor/` does not exist) |
| **Act 7 opaque ghost cars** | Research landed (`research/wiki/tech/ghost-car.md`) | ⚠️ The research **changed the premise** — Super Mario Kart has no ghost at all; re-read before building |
| **Flight-sim act** | Research landed (3 files) | `product-manager` spec |
| **Rhythm act** | Research landed (`research/rhythm-games-by-era.md`) | Blocked on §1.3 Lyria |
| **THE BUILDER ROOM** | Named by Trevor, unspecced | `product-manager` spec — first job is how it differs from Act 6's maker |
| **PINBALL ALLEY** | Named by Trevor, unspecced | `arcade-historian` era pass, then a spec |
| **Act 9 — learn to program** | Named by Trevor, unspecced | `product-manager` spec |
| **THE SERVER ROOM ARC / THE FEED** | Named, unspecced | — |
| **Acts 2–5 act cards** (16 cards) | Act 1's four shipped | One `arcade-historian` pass per act; §5.5's "every shelf reads ◆ n / 4" does not hold until they land |
| **Act 6 / Act 7 exclusive card sets** | THE HARDWARE has cards; the others have none | Blocked on deciding each wing's attachment axis (a text world is not a station) |
| **A `moth` card at Level 11** | Decided 2026-09-18; research in flight | Nudges toward the select-screen moth egg. ⚠️ **Two traps:** the moth did NOT coin "bug" (predates 1947, per CHM) — the logbook says *"first actual case of bug being found"*, i.e. the first bug FOUND, not the first use of the word; and it must not retell L13's `grace` card, which is about Hopper's popularising role |
| **Keyboard cards, Phase 2a** — `, . / - [ ] \ ` '` (`docs/specs/semicolon-teaching-beat.md` §5.9) | The mechanism and the semicolon shipped (see `roadmap-history.md`) | **Each symbol needs its own arcade-historian pass BEFORE any player text.** Open question Q-P2a: how the comma/period/slash code lessons reach the Level 20 terminal (default: one quiet extra line under the couplet, only when the save owns the card). `=` gets no card (`1=1`/`1==1` already teach it) |
| **Keyboard cards, Phase 2b** — `( ) { } :` | Blocked | Needs the engine input contract extended first (`js/main.js` input regex rejects them; CLAUDE.md marks it "do not break") |
| **Topical card collections + card detail view** | Trevor's idea 2026-10-31: math / programming / hacking / tech culture / the keyboard | A SEPARATE spec: a `topic` tag on every card in every bank (the field is reserved on `KEY_CARDS`), gallery grouped by topic, and the detail view that finally shows a card's `codeFact`. Needs a curator pass over all 84 cards |
| **The math-vs-code symbol sub-theme** | Proof pair shipped (`1=1` / `1==1` at L21); the `;` entry is **superseded** by the L13 keyboard card | The rest of the map: `,` L13, `.` L14, `//` L15, `[ ]` L22, and the Shift cluster at L24. These stay *arcade history* cards (a moment in time); the keyboard-card mechanism covers what a key is *called and does* |
| **Visual theme selector** | Theming is modular (CSS vars per level); no settings row | `js/settings.js` ROWS has no theme entry |
| **Mobile Tier A** (tablet + Bluetooth keyboard) | Works today, unverified | Schedule portrait/landscape layout verification |
| **Mobile Tier B** (touch-only) | `docs/specs/mobile-touch-mode.md`, reviewed 2026-09-12 | Public-promise wording: README still says "not supported yet" where the spec wants "keyboard-only, on purpose" |

⚠️ **Not an on-screen QWERTY.** `research/mobile-touch-typing.md`: a child-sized soft keyboard needs
≥20 cm and does not fit an 11-inch iPad in portrait; the largest mobile-typing study (37,370 users)
found no transfer from ten-finger training to glass; none of six surveyed children's literacy apps uses
one.

---

## 3 — Open defects & tech debt

Each verified open against source by the 2026-09-16 audit.

### Player-facing

> **Landed 2026-10-30/31 (UNCOMMITTED until the final gate passes):** the persona-playtest fix waves —
> see `roadmap-history.md` for what was verified. If no commit exists for it, reconciliation was missed.

- **Still open from the persona waves** (each seen by a persona tester; none fixed):
  - **Per-slot difficulty — its own PR.** `kk-settings` is global, so one save's Survival/WIZARD reaches
    every other game. Needs `product.md` §Save Slots edited FIRST, then tests, then code, then
    `/security-review` (schema change).
  - **Survival EXPERT does not age with the player** — the clock is ~40× slack at 90 wpm
    (`js/main.js` ~600). Retune deferred by ruling; the 1-life spare and 10 s floor were the plain defects.
  - **Stale keyboard-guide timer in the wrong-key branch** — wrong key then right key within 300 ms
    re-lights the old letter until the next keypress. Left untouched (wrong-key contract); ask first.
  - **No escape hatch on a first Mystery viewing** — by ruling nothing skips it (~50 s); if a child is
    distressed there is no exit. Revisit if a real child finds it long.
  - **Level 13 beat polish** (found by the final play gate; none blocking): the caption is ~9 px and sits 4 px above the keyboard (a 5-year-old will not read it; the glow and the card carry the lesson); Escape/pause drops the caption for that play and it does not return on resume (the card is already credited); the comma prompt follows the beat while a caption naming the semicolon is above it (the two glyphs look alike in Press Start 2P).
  - **ERASE ALL leaves `kk-friends` and `kk-stories`** (only `kk-slots` goes). "YOUR SETTINGS STAY" is
    true but does not mention friends; decide whether ERASE ALL should wipe them.
  - **L21's opening screen says TYPE YOUR NAME**, but L21 is dash and equals (`js/fullcircle.js`).
  - **L21 victory banner covers the STAGE counter**, L2's invader palette is multi-colour (flagged invented
    in the 2026-09-13 audit), and the L4 victory is dim — pre-existing, found by Themes lanes.
  - **Free Play on cabinet 24**: the first word of a sentence likely flashes in the #1 slot (the theme
    cannot tell Free Play apart).
  - **L25 takes ~11 min at 55% wrong keys**; re-measure tile worlds at `--pace=1`.
  - **Tile-world map is pinned left of the screen** (camera quirk noticed by tester E) — unexamined.
  - **Locked cabinets/wings give no "unlocks at…" hint** — by design; revisit if a child is confused.
  - **Orphan "· LATE 1980s" line** on the Masters of Deception card title.
  - **Capture tooling:** `capture-speedway.js monaco-lap` fails on lap 2 (one Space after the pit board;
    `playtest.mjs returnToHub` loops up to five); `capture-screens.js` leaves the Survival Y/N pending in
    `settings-survival-active.png`; `tests/helpers/game-driver.mjs` localStorage seed re-applies on every
    navigation (a `seedOnce` option would be cleaner); `scripts/playtest.mjs` / `personas.mjs` have no
    feature page (propose a `playtest-tooling` page).

- **Three themes still declare no victory duration** — `breakout.js` (L1), `pacman.js` (L3),
  `pokemon.js` (**L15, the FULL KEYBOARD UNLOCKED milestone**). Each gets the engine's legacy fixed
  4000ms hold. (L2 `invaders.js`, L4 `fighter.js` and L25 `wordprocessor.js` were given real
  celebrations 2026-10-30.) ⚠️ **Not yet a known defect** — "declares no duration" ≠ "has no
  animation". Measure with `--at=victory:<N>` (distinct-frame counts), then declare the duration that
  matches what is on screen.
- **Levels 7 and 10 are near-static mid-play**, payoff concentrated in `victory()`.
- ~~**Collection gallery clips its last row**~~ **RESOLVED 2026-09-16 by the shelved gallery** — the
  fixed `max-height: 60vh` grid became a single flex-height scroller with `▲ MORE ABOVE` / `▼ MORE
  BELOW` fade bands and keyboard scrolling. ⚠️ *Worth keeping from that work:* the builder measured
  `offsetWidth - clientWidth === 0` on the scroller — **the platform scrollbar is a zero-width overlay
  and is no affordance at all**, so the `::-webkit-scrollbar` styling is a bonus, not the fix. (Do not
  add `scrollbar-width`; it switches those rules off in current Chromium.) Moved to history.
- **`--atari-dim` contrast band** — still used in 14 places flagged WARN/FAIL by the audit script.

### Safety & security
- ~~**The BLOCKED WORDS promise overstates its reach**~~ **RESOLVED 2026-09-16** — the IM-friend now
  screens replies through `hasBlockedWord` (client-side, because rule 6 keeps a parent's words
  100% local so the server structurally cannot), and the on-screen promise was narrowed to something
  true. ⚠️ **The curated-pool exclusion is permanent and deliberate:** a parent's list is additive and
  unvalidated, so honouring it literally over `js/levels.js` could strip a curriculum word and leave a
  level unwinnable — **the One Rule outranks the promise**. The floor covers what the game SHIPS
  (INV-105); the parent's list covers what the game WRITES. Moved to history.
- **`renderPrompt` uses `innerHTML`** — `js/ui/hud.js:411-419` interpolates `${display}` into
  `seq.innerHTML`. Fed only by curriculum data today, so not exploitable; harden to
  `createElement`+`textContent` before any free-text reaches it.
- **`avoid=` hardening** (optional, documented as such) — `js/keyboard-story-gen.js` still sends
  cache-derived values.

### Tooling & tests
- **The new history-card sound has never been HEARD.** `Audio.historyCard()` is verified to fire on
  all three reveal paths and to create **zero** WebAudio nodes when sound is off (measured by
  instrumenting `createOscillator`/`createBufferSource`/`createGain`) — but headless cannot hear, and
  `.claude/rules/playtest.md` is explicit that a ~60-second human check is the only real verification
  for audio. **Nobody has confirmed it sounds like picking a card up rather than like static.**
- **`BACK_WALL_DOORS` and `ACTS` are not exported from `js/ui/cabinet-art.js`**, so the collection
  shelves restate `unlockLevel: 20` and the five act names as commented copies, with a test that
  parses `cabinet-art.js` and fails on drift. Exporting both tables is the real fix (journal L41:
  one definition, every consumer reads it).
- **`selectBypass` into the gallery is untested by play** — the pure function honours it and is
  unit-tested, but nobody has verified the WOPR state survives picker → `C`.
- **`docs/a11y/audit.js` does not walk the collection screen** — it audits levels only. The new shelf
  headers reuse `--crt-amber` and the counts `--crt-green`; contrast there is unmeasured.
- **`tests/unit/act-cards.test.mjs` cites `INV-120..127`, which do not exist** in the STRATEGY catalog
  (`grep -c "INV-12[0-7]"` → 0). Those were *spec candidate* numbers. Violates `testing.md` §Adding
  tests ("add it to STRATEGY.md §5 **first**"). Re-base onto real numbers.
- **`game-driver` hardening** — `ensureGameScreen()` and `seedProgressLive()` are still lane-local
  workarounds, not promoted into the driver.
- **Static-host gate never runs against the real published URL** — CI triggers are push/PR only, no
  `schedule:`. The live site is only checked when someone runs it by hand.
- **Six easter eggs have no capture path** in the screenshot tree (moth, duck, rabbit, Y2K clock,
  confession, 404, dial-up chirp).
- **No `capture-hardware.js` / `capture-freeplay.js`** — those feature pages point at `playtest.mjs`
  targets rather than a capture script.
- **Tablet viewports are covered by no automated check** — everything runs at 1280×800.
- **The duck-hint latch is per-page-load, not per-save** — `js/slots.js` has no `seen` map.
- **`feature-map.json` maps one page per pattern**, so `main.go`'s four surfaces collapse to one.
- **The reference film is stale** — `docs/keystroke_kingdoms.mov` is from **2026-07-18**, predating Act 7,
  the hardware wing, the act cards and the F30 theme fixes.
- **Chrome DevTools MCP is NOT registered in project config** — there is no `.mcp.json` and no
  `mcpServers` key anywhere. The old claim that it was is false; delete it or actually add it.

### Research gaps
- **Some curriculum words are chosen by SPELLING, not by reading level** *(audited 2026-09-16 against
  `research/wiki/pedagogy/decodable-word-lists.md`, whose criterion is 3–5 letters, phonetic,
  decodable)*. The pools drift from early-reader vocabulary as the key set grows, because a word gets
  in if the keys can spell it. Concrete flags, **not** a blanket length complaint (long words are
  deliberate content for the MAX WORD LENGTH lever): **`alfalfa` at Level 4** — the *first* word level,
  where 3–5 letters matter most, and it is a 7-letter forage crop; **`widower` at L9** — adult by
  *register*, not difficulty, a bereavement word in a children's game; and the adult-register cluster
  `fissure` `stature` `dietary` `prosperity`. Needs a judgement call per word, not a rule.
- **No `research/wiki/games/missile-command.md`** despite Missile Command being Level 23's cabinet.
- **No photograph for the wooden-cabinet TV** — every other machine on the Acts 2–4 wall is drawn from
  one; this one is drawn from prose, against the section's own "look at a photograph first" rule.
- **Deferred by Trevor:** a graphics-fidelity audit of the existing 25 levels.
- **L6/L7/L10/L13 mechanics-fidelity re-scores** — no artifact in `docs/validation/`.

---

## 4 — Open decisions (need Trevor)

One sentence each, answerable without re-reading the backlog.

   the terminal?
1. **Browser LLM** — ⚠️ **the number this decision rested on was ours and it was wrong** (corrected
   2026-09-18, verified against developer.chrome.com). Chrome's gate is a **disjunction**: *"GPU or
   CPU: Built-in models can run with GPU or CPU"* — **>4 GB VRAM OR 16 GB RAM + 4 cores** — and the
   22 GB is **free disk for the one-time download**, not memory (the model is *"significantly
   smaller"*). Our spec transcribed it as a conjunction, so "rules out most integrated-GPU laptops"
   was false; the CPU clause exists precisely to let those in. **A normal 16 GB laptop qualifies.**
   <br>Nothing on Google's side changed since 2026-09-11 — only our reading. **The binding constraint
   was never hardware: it is Chrome/Chromium-only indefinitely**, with Mozilla `negative` and WebKit
   `oppose`, both unmoved since May 2026. And there is no lighter path — Summarizer/Writer/Rewriter
   publish the *identical* gate because they share one model, and the genuinely lower-bar
   Translator/Language-Detector APIs cannot generate vocabulary. **Question, on the corrected number:**
   is the zero-cost Phase 0 probe now worth a half-day, or is Chrome-only enough to file it
   "considered, declined" regardless?

---

## 5 — Tooling / process index

| Need | Command |
|---|---|
| Fast gate (lint + static + unit + go) | `make test-fast` |
| Full gate (+ integration + recorder smoke) | `make test` |
| Static-host gate | `make static-host-check` |
| **Play a specific state** | `node scripts/playtest.mjs --list` — targets include `level:`, `victory:`, `complete:`, `cinematic:`, `coda:25`, `speedway:`, `hardware:`, `freeplay:` |
| Screenshots | `node docs/screenshots/capture-all.js` (see `docs/screenshots/README.md` for feature sets) |
| Contrast audit | `node docs/a11y/audit.js --out=docs/a11y/audit-<name>.json` |
| Research wiki | `node scripts/wiki-search.mjs "query"` · `--journal` · `--index` · `--lint` |
| Human-paced film | `node scripts/record-playthrough.js --out=…` |

**Agents** (`.claude/agents/`): `arcade-historian` (all historical claims), `game-developer`,
`product-manager`, `test-engineer`, `content-librarian`, `game-player`.

**Rules that gate work:** `.claude/rules/playtest.md` (you must have PLAYED it), `visual-validation.md`,
`theme-authoring.md`, `testing.md`, `security.md`, `swarm-playbook.md`.

---

## 6 — Maintaining these two files

**When you finish something:** delete it from this file and append a dated, past-tense record to
`roadmap-history.md`. Do not tick it here.

**When you find something:** add it here, in present tense, with the evidence (`path:line`) that it is
real.

**When you doubt a claim in `roadmap-history.md`:** it is a record of a date, not a statement about
today. Check the source. The audit that created this split found stale claims in both directions —
work described as blocked that was already done, and a ✅ sitting over work that was not.

**Three habits that audit turned up, worth keeping:**
- **A code comment is a claim; the code next to it is evidence.** Read both.
- **When you append a ✅, past-tense the sentence above it** — the ✅ was almost always honest; the prose
  underneath it was what went stale.
- **A closed entry stops being re-read, which is exactly when it starts lying.** Security prose is the
  worst place for this: one entry preserved reasoning as "worth keeping" that had been deleted as a
  defect the following day.
