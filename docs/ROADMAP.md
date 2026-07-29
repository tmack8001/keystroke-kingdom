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
pinball NOVICE/EXPERT switch claim debunked (tiers stay, justification removed). RESOLVED:
levels.md's Myst claim now correctly credits Apple Macintosh Quadras + StrataVision 3D
(the SGI-workstation pipeline belongs to Riven, 1997, and to DKC at Level 14).*

**Current state:** all 25 levels playable end-to-end with act cinematics, Free Play,
Survival (opt-in), history cards, easter eggs, and era-progressive graphics — all on the
`act5-full-circle` branch. **Not merged to main** until Trevor's playthrough approves.
**Status declaration (Trevor, 2026-07-12): this is no longer a prototype — the browser
build IS the game.** tech.md and CLAUDE.md updated to match; "prototype" survives only
as the historical Phase 1 name and in journal history.

*2026-07-11 (evening): journal-debt swarm COMPLETE — all 8 lanes done, smoke-verify
passed 26/26 level+flow assertions with zero regressions. Landed (uncommitted, working
tree): returning-player persistence (§1.2 → built), fighter.js Galaga redraw, keyboard-
geometry unification (hud.js single source), a11y-audit artifact fixes, shared Playwright
helper (`scripts/kk-playwright.js`), levels.md re-split + 40k hook enforcement (journal
F21 closed), theme dead-code sweep (5 files, journal L24), Survival×Free Play QA'd
end-to-end (all tiers pass; wrong keys cost nothing, mercy quarter works, warm game
over). Go binary rebuilt + dev server restarted. New follow-ups from the swarm: §3
"Swarm follow-ups" below.*

---

*2026-07-19: **History Cards 2.0 + Save Slots + Collection** (uncommitted, working tree).
Trevor: the kids love the cards — so expand them and reward replay. Landed:
(1) **Card bank 17 → 41 → 54** (+1 secret = 55 total), every level carded, **multiple per
level** as a rotating POOL; each play guarantees ONE card (`pickGuaranteedCard`, prefers
uncollected, per-slot rotation) — a Skulltula-style collect-them-all loop. Flat/id data model
(`js/history-cards.js`), each card attached to its EARLIEST-typeable level (verified: 0
untypeable, all at strict earliest). Content citation-verified by arcade-historian
(research/computing-history-moments.md "17 → 41", 21 new wiki pages). **2026-07-27: +13
hacker/phreak/underground cards** (war dialing, trashing, Legion of Doom/Masters of Deception,
phone phreaking, Hacker Ethic, spam origin, first BBS, Hacker Manifesto, Phrack, cyberpunk,
acoustic coupler, 2600 magazine) — research/hacker-culture.md + 14 new wiki pages,
"curiosity, not crime" framing.
(2) **Save slots** — ANY NUMBER of independent saved games (no cap; `js/slots.js`,
`kk-slots` = growable dense array), a "CHOOSE YOUR GAME" picker (rows + a "＋ NEW GAME" row)
replaces the single continue screen (retired); per-game name + progress + cards + rotation;
legacy single-save auto-migrates into the first game. main.js progress/card helpers delegate
to the active game.
(3) **Collection gallery** (`collection` screen, C from picker) + per-game ★ found/total
counter. (4) **`joshua`** added as a WOPR magic word + a SECRET WarGames card collected by
any WarGames phrase (Trevor request). Screens validated in-browser (slots/collection render,
zero console errors). Docs reconciled (product/onboarding/tech/security/easter-eggs/CLAUDE).
Tests: test-engineer rewrote the suite (history-cards flat/id + slots isolation/migration +
earliest-typeable + rotation INVs; game-driver seeds kk-slots now) — test-fast 220/0. It
surfaced TF-S1 (`ensureMigrated`'s first localStorage.getItem was unguarded → would throw at
boot in private-browsing mode); FIXED (try/catch guard) and its todo promoted to a passing
regression test. Settings "ERASE EVERYTHING" is now an honest factory reset (`Slots.eraseAll`
wipes all games); the picker's X erases one game (`eraseSlot`). Integration suite re-run
pending a clean pass. Follow-ups: §3 below.*

---

*2026-07-12 (day): second + third waves COMPLETE — all landed, uncommitted:
(1) **Level 8 unwinnable — FIXED per Trevor's gameplay design** (journal F23 closed):
tetris win = ≥8 letter sequences AND ≥4 rows, latching exactly on a row-clear; optimal-
but-organic piece placement; adventure overflow WIPE vs authentic survival fill;
accurate NEXT preview; main.js getNextPattern() past-pool draws now persist (no more
display/judgment desync). Verified: 2× recorder gold runs exit 0 / rejectedPresses 0,
6000-run simulation clean, survival + wipe paths confirmed. **Reachability audit of all
24 other themes: none at risk, none fire between-beats.**
(2) **Replay option (new feature)**: complete overlay gains dim "PRESS R TO REPLAY";
survival game-over reworded to matching two-tier PRESS SPACE TO REPLAY / ESC FOR THE
ARCADE. Card not re-awarded on replay, furthestLevel never regresses, no hidden-phrase
collisions (F13 grep), zero console errors.
(3) Recorder overhaul (F24 closed): re-read-before-every-press, stall watchdog +
desync detector (exit 3, video finalized as evidence), observed-only telemetry, Shift
chords (L24 was never typeable by the old recorder), and THREE modes: full game,
--single-level=N (25-way parallel), --act=N (5-way parallel, cinematic-ownership
convention). `.claude/agents/game-player.md` carries scope-first + per-level-win-QA
doctrine (journal L30).
(4) Fullcircle cinematic redesigned per transitions.md (recognizable montage vignettes,
lit arcade as a real room, spec-violating ACT 5 title card replaced by the READY/TYPE
YOUR NAME callback); layout-collision artifact fixed.
(5) Screenshot library restructured BY GAME SURFACE (Trevor's taxonomy): levels/ acts/
screens/ cinematics/{mystery,basement,commandcenter,fullcircle}/ easter-eggs/ freeplay/
history-cards/ — 89 reference PNGs, 7 idempotent capture scripts, qa/ retired with a
supersession map, docs/screenshots/README.md codifies the rule.
(6) Docs: per-act rules restructure (.claude/rules/levels/act1-5.md + onboarding.md +
tabular levels.md, lossless, budget-hook glob extended); staleness audits of both doc
trees (fixed: "no levels beyond 5 built", phantom levels-transitions.md refs, L24/25
"Not yet assigned", tech.md architecture/persistence rows; README/ROADMAP clean);
"no longer a prototype" declaration propagated.
(7) **Content-librarian system** (Trevor's design): docs/features/ source graph
("code-llmwiki") with frontmatter as the canonical file→feature map;
scripts/feature-map.json generated from it; impacted-manifest PostToolUse hook +
doc-currency Stop-hook check 3 route "feature impacted" context to the librarian;
.claude/agents/content-librarian.md (scope-first: feature/group/library; minimal
screenshot blast radius — tetris.js change regenerates ONLY the tetris shot);
inaugural library build in flight. Note: the manifest hook captures main-session edits
only — for agent waves the orchestrator passes the file list (playbook §6 step 2b).*

*2026-07-12 (afternoon): third wave COMPLETE — all landed, uncommitted:
(1) **Winability: all 25 levels PASS with transcript-level proof** — the recorder now
emits transcript siblings (.jsonl + timeline .md: visible sequence | typed | outcome)
on every run; the 25-level swarm (5×5 waves, 9.4 min) found zero rejected presses, zero
desyncs, every card word before every win, all 18 wrong-key injections honoring the
letter-waits contract. Published: docs/validation/winability-2026-07-12/ (+
WINABILITY-REPORT.md). One instrument bug caught honestly (drill dedup); journal L32.
(2) **Mystery Beat redesigned per Trevor** (spec revised in transitions.md, dated):
Phase 4 "The Approach" — 12s dolly-in, phosphor blur resolving with distance, crisp
exactly at "COME IN."; Phase 5 "The Secret Door" — cabinet swings about its VERTICAL
hinge edge (horizontal foreshortening, verticals pixel-vertical ±1px verified), hidden
room behind with 3 depth ranks of glowing machines. cinematics/mystery/ recaptured
(7 pngs + approach.gif + secret-door.gif).
(3) **Milestone animations fixed** (Trevor's dark-keys catch → real bug): banner fades
began before cascades completed, so the fully-lit held state never existed in basement
OR commandcenter; both retimed + alpha-scoped, recaptured. NEW
docs/screenshots/milestones/ set: 4 row-unlock references + cascade gifs; captureGif
helper in kk-playwright.js; png=held state, gif=motion proof rule in README. Journal L31.
(4) Content-librarian inaugural build survived a session-limit kill (work on disk,
report lost): 14 feature pages + README, feature-map regenerated from frontmatter,
wiki corpus extended (lint clean, 180 pages), first feature-refresh executed with
minimal blast radius.
**OPEN DECISION (Trevor): Q*bert slog** — L22 is winnable+correct but took 24 patterns
vs its 7-pattern minimum (2.3x median): win gate needs all 28 cubes while pickNextHop
wastes keystrokes re-hopping flipped cubes. Options: lower the cube target, or make
every correct keystroke route to an unflipped cube (matches the Tetris optimal-progress
philosophy).*

*2026-07-12 (evening): fourth wave COMPLETE — all landed, uncommitted:
(1) **EXPERIENCE setting** (Trevor's design): win-ratio tiers FIRST QUARTER 1x
(default) / REGULAR 1.5x / HOTSHOT 2.25x / WIZARD 3.5x scaling the engine minimum AND
theme targets (tetris MIN_SEQUENCES, qbert extra-sequence floor; 1x byte-identical).
Settings row + product.md + theme-authoring contract; validated at every tier.
(2) **The Name Moment**: the player's name becomes a guaranteed typeable pattern at
the first level whose keys can spell it (OONA → Level 12), with a once-ever golden
flourish, low-frequency "familiar visitor" afterward, rename earns a fresh moment,
default PLAYER ONE excluded, L24 ceremony untouched.
(3) **Hand-balance instrumentation** (Trevor's Q*bert observation): transcripts now
carry L/R ratios, alternation, single-hand words, variability; static analyzer +
--transcript mode; full report docs/validation/hand-balance-2026-07-12.md — game
balanced overall (537L:549R), 6 levels flagged with charset-verified word proposals
**AWAITING TREVOR'S REVIEW** (js/levels.js untouched).
(4) **Local-LLM wordgen** (Trevor's indeterminism design): optional Ollama on the Go
server (/api/wordgen + /health), kid-strict validation chain + suffix-variability
filters (both table-tested), background generation + prefetch (zero loading pauses),
deduce-vs-retry availability policy, static fallback byte-identical, name never sent.
Live-verified on llama3.2. Plus dev loop: Brewfile, Makefile (make help), Dockerfile
(distroless, PORT/OLLAMA_HOST envs), docker-compose (game / game-ollama profiles) —
docker build NOT yet run (daemon down; `make docker-build` when up). security.md
rules 6-7 amended for the same-origin exception + LLM content chain. Journal L33.
**API contract redesigned per Trevor (2026-07-12 follow-up):** the request now
DECLARES its constraints — `/api/wordgen?act=A&level=N&characters=<unlocked keys>`;
characters required + superset-bounded (malformed → 400), effective allowlist =
characters ∩ manifest, cache keyed by level+charset (isolation live-verified), Ollama
reply structure validated whole-batch (class B: ignore + retry) while wrong-charset
words stay per-word drops (class A: filter). Env-override principle generalized in
security.md rule 6 (sane loopback default + operator env override, never an assumed
host). Table-tested + live-smoked (browser emits the new shape; static-host check
still silent). Commit-partitioning note for merge time: journal O17.
**DOCS DISCREPANCY — RESOLVED (Trevor: fix the docs, 2026-07-12):** first real words
now correctly attributed to Level 4 across CLAUDE.md, product.md, levels.md,
levels/act1.md, tech.md, curriculum-data.md; Level 4's narrative owns the double-win
first-word beat; word lists match js/levels.js L4's actual pool.
Reference film re-recorded post-everything (in flight at write time) — first film with
the Name Moment on camera and a wordgen-live server; its transcript sibling audits any
generated words served.*

*2026-07-13 (early AM): **celebration + mechanics-fidelity waves (Trevor's playtest
directives) — MOSTLY LANDED, uncommitted.** Doctrine now in theme-authoring.md:
"Victory must celebrate" (victory() fills its window with an era-faithful celebration
and RETURNS its duration ms; engine consumes it — main.js victoryMs) and "Mechanics
fidelity, wiki-grounded" (STRONG/WEAK/NONE vs research/wiki/games/* — Trevor's rubric;
verify with time-separated frames, never code reading). Two artifact-classified
audits: docs/validation/victory-audit-2026-07-12.md (12 CELEBRATORY / 6 WEAK / 6 NONE)
and liveness-audit-2026-07-12.md (14 STRONG / 7 flagged, wiki-cited mechanics rows).
LANDED + frame-verified: L6 DK full rework (gigantic DK, barrels jumped by Mario,
jailed Pauline, rescue victory — per Trevor's specifics), L7 Dragon's Lair (lit-room
sword-raise + Daphne after one bounced-too-faint revision), L10 Zelda (Triforce
bloom), L13 Myst (book opens), L8 Tetris (gravity+rocket, then vanishing-piece
stacking regression FIXED), L11 Sonic (speed pillar + rolling Spin Attack — 1991-
correct, Spin Dash is Sonic 2 per historian; orchestrator finished a mid-edit rename
after session-limit death), L12 SFII (real fight, opponent never lands damage), L14
DKC (loping Kong, parallax jungle), L21 Out Run (super-scaler rushing road).
Historian backfilled cited Gameplay sections on 7 wiki pages (+ Pac-Man ghost-color
citation hardened; GoldenEye page carries kid-safe abstraction guidance).
**IN FLIGHT / REMAINING (agent pool hit session limit ~00:40, resets 2:40am):**
~~L3 Pac-Man~~ (DONE by orchestrator, frame-verified: corridor pellets visibly munched
+ cosmetic/win-gate dot split so the 20-dot gate is untouched, 4 classic ghost colors,
blue-fright only every 4th completion); ~~recorder re-proofs 8/11/14~~ (DONE: all exit
0, 0 rejects — 14/13/14 sequences; sonic mid-edit `spinDash`→`spinRoll` rename finished
by orchestrator after its agent died); ~~binary rebuild + screenshot refresh~~ (DONE:
levels 3/8/11/12/14/21 refreshed, zero console errors). ~~STILL REMAINING~~ **ALL LANDED (2026-07-13, pool-reset wave — every lane
frame-verified from its own recorded win, 0 rejected presses everywhere):**
L17 GoldenEye (live kid-safe mission quadrants — agents, gadgets, vision-cone
hide-and-seek, MISSION COMPLETE debrief; wiki abstraction guidance honored),
L22 Q*bert (flip-wave up the pyramid → held rainbow pulse), L23 Missile Command
(sky-filling bonus-city fireworks, revised once for L35 brightness), L9 Mario
(true flagpole clear: run→grab→slide→pose+fireworks; first attempt rendered NOTHING
in a real run — rAF-throttling killed a 250ms beat + Mario drew inside the flag;
root-caused, fixed, journal L36), L16 SimCity (fireworks show + POPULATION MILESTONE
stinger, revised once — Missile Command's accepted recipe transferred verbatim),
L5 Joust (two-pass victory lap + egg-point bursts + wing-spread landing; confirmed
the "prompt lingers" is win-on-pattern-boundary BY DESIGN, engine path is 400ms —
no bug), L18 AoE (wonder radiance ON the map + resource fountains + WONDER COMPLETE),
DK path polish (ladders re-seated in the left stage margin, two real barrel-routing
bugs found+fixed, Mario visibly jumps barrels regularly). Binary rebuilt; reference
screenshots refreshed for levels 3/5/6/8/9/11/12/14/16/17/18/21/22/23 + 7/10/13.
Playbook §3: per-agent scratch subdirs + video-derived-proof-only now mandatory
(journal L36); L35 additive-compositing rule held (3 faint-celebration bounces, all
recovered). STILL OPEN: L6/7/10/13 fidelity re-scores under the STRONG/WEAK/NONE
rubric (cheap read-only sweep, any session); recorder --out flag (nice-to-have);
reference film visually stale for ~16 reworked levels — re-record after Trevor's
playthrough settles the tree.*

*2026-07-12 (night): **behavior-first test suite — LANDED (inaugural 9-lane swarm,
Waves 1–2, all green).** Architecture: docs/testing/STRATEGY.md (tests-as-executable-
design-documents doctrine + INV-1..37 invariant catalog), TEST-PLAN.md (lane spec),
FINDINGS.md (TF ledger), .claude/rules/testing.md (working contract),
.claude/agents/test-engineer.md (the standard builder agent — never modifies game
code, never weakens a test; game-vs-doc disagreements become todo-marked TF findings).
Runner: Node built-in `node --test`, ZERO new dependencies (Brewfile unchanged beyond
comments); Playwright integration driver self-serves on an ephemeral port
(tests/helpers/game-driver.mjs). Make targets: test-static / test-unit / test-go /
test-integration / test-fast / test (full, incl. recorder smoke).
**Suite: 323 test cases — 8 static + 171 unit + 54 integration (serial) + 90 Go —
ZERO todos, full `make test` exit 0 incl. recorder smoke (as of the 2026-07-13
word-length wave; +word-length settings/integration/wordgen tests).** The sacred contracts all HELD under machine scrutiny: wrong-key
letter-waits (14 tests), no-punishment/survival-costs-nothing (9), curriculum
integrity (70), card typeability incl. Eniac@24/hello-world@25 edges (29), settings
garbage-tolerance (46). **Six real intent violations found (docs/testing/FINDINGS.md,
awaiting Trevor's triage):** TF-H1 name entry doesn't clear the prefilled default on
first keystroke (docs say it must); TF-H2 name cap is 16 not the documented 12;
TF-H3 Space doesn't confirm name entry (docs say Space+Return both do); TF-3 canvas
keyboard guide shows ENTER on Macs (the exact Oona confusion the label rule exists
for); TF-4 pacman.js missing miss() export (Level 3 has no gentle wrong-key theme
response — engine guard prevents a crash); TF-E1 Go wordgen structure layer lacks a
per-line size cap (defense-in-depth, no content leak). Two initial findings were
dismissed as test misreadings (ENTER-as-verb; the platform-swap line itself) — tests
corrected to match the docs, game untouched. Follow-ups in §3.*

*2026-07-13: **word-length difficulty lever — LANDED** (settings contract done inline +
3-lane parallel wave: engine / wordgen / dictionary). New tenet, saved to agent memory:
**the game ages with the player** — difficulty settings let it serve kids→adults,
arcade-style (EXPERIENCE was the first; word-length is the second). Details:
(1) **Settings** (js/settings.js): MIN WORD LENGTH (ANY|3-7) + MAX WORD LENGTH
(ANY|4-8,10,12) rows, both default ANY (untouched Settings = byte-identical to before).
`getWordLengthRange()` is the contract. product.md §Word Length carries the tenet.
(2) **Engine** (js/main.js): filters the drawable real-word pool via one
filter-with-fallback helper feeding both the initial build and every redraw. BEST-EFFORT,
never a wall — an impossible range falls back to the level's own words; guaranteed
content (intro drills, history-card words, name) never filtered; levels 1-3 a natural
no-op. Fixed the latent unguarded empty-pool crash. Winnability is the One Rule floor
(INV-39: an impossible range still WINS).
(3) **Wordgen** (js/wordgen.js + main.go): symmetric minWordLength, both bounds driven
by the setting, play-logic ceiling raised 8→12 for genuinely harder play. Privacy intact.
(4) **Dictionary** (js/levels.js): moderate pedagogy-first expansion across the FULL
length spectrum — richer early-reader short words + genuinely harder long real words
where each level's keys permit (L13 chandelier, L14 extraordinary, L15 civilization).
~280→380+ pool words; L4-L5 left short-dominated (few keys can't spell long — fallback
covers it). Key-closure guarded by the existing curriculum test.
Tests: settings unit (+word-length block), a new integration file (INV-38..40:
filter/winnability-floor/guaranteed-content), wordgen client+Go (INV-41), all green;
new INV-38..41 in STRATEGY.md. Binary rebuilt. **FOR TREVOR'S REVIEW:** the number
levels' new word+digit prompts (e.g. `district56`, `keyboard10`) are key-valid and
test-clean but a taste call — flag if they read oddly.*

## 1 — Next up (blocking or high-value)

### 1.1 Merge `act5-full-circle` → `main`
Gate: Trevor plays through and approves. 7 commits, clean history. Nothing else blocks it.

### 1.2 Returning-player persistence  ✅ *(built 2026-07-11, swarm)*
Built per the levels.md "Returning Player Flow" spec: `kk-progress` localStorage
(furthestLevel + per-level completion, recorded at level complete, never in Free Play,
never regresses); returning sessions skip the cold open → continue screen (READY [NAME] /
LEVEL n / KEYS LEARNED / SPACE continue / R restart with Y/N confirm — only Y erases,
N or any key is safe); select screen lights only earned cabinets ('???' dark silhouettes
ahead), WOPR phrase still bypasses everything. Smoke-verified 5/5 sub-checks.
Residual notes: (a) the continue-screen erase clears only `kk-progress` (keeps
name/settings) while the settings-screen erase does a full localStorage.clear() — two
erase scopes now differ; unify if that bothers anyone. (b) the level-complete →
recordLevelComplete write was verified structurally, not by a full end-to-end playthrough
— confirm during Trevor's playthrough.

### 1.3 The Stats Cabinet
Documented in `.claude/rules/product.md`, unbuilt. Remaining tenants:
- Accuracy-over-time graph, keys-learned timeline, words unlocked, session history
- ~~**History-card album**~~ BUILT (2026-07-19) as a standalone **collection gallery**
  (`collection` screen, reached with C from the slot picker) — 54 cards +1 secret (55 total),
  found vs `???`, per-game ★ count. Collection now persists per save slot (`kk-slots`), not the
  retired `kk-cards`. If the Stats Cabinet is ever built, it can host/duplicate this view.
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
| Level 25 free-type finale | levels.md ("First paragraph", credits typed by player) | **Largely delivered 2026-07-28 by the "MY STORY" coda** (see §1 BUILT above): the player now types a full readable story paragraph finale (all-26-letter walk-the-keyboard + manifesto capstone), and the `hello world` egg (proposal #6) already landed. The coda is PROMPTED typing, not true free-type (arbitrary player-authored text) — that open-canvas variant, where the player types whatever they want, remains the one distinct unbuilt piece of this idea. |
| ~~**Level 25 "Hacker Manifesto" finale quote**~~ **✅ BUILT 2026-07-27** | Trevor (2026-07-27): once the full keyboard + Shift is unlocked, have the player type the famous line from *Hackers* (1995) that is itself quoted from *The Conscience of a Hacker* (The Mentor, 1986). | **BUILT.** New pure-data module `js/finale-quote.js` (`finaleLinesForRatio`/`finaleLineMatches`); wired into `js/main.js` as a THIRD guaranteed win-gate (`finalePending`) alongside `cardPending`/`namePending`, spliced as a contiguous block into the front-loaded guaranteed-reached zone at L25 start (non-freeplay). **Escalates by EXPERIENCE tier** — FOUR distinct, strictly-increasing sets, one per tier (Trevor 2026-07-27: grow the quote at EVERY step): winRatio 1 (default) → sentence 1 ("…the beauty of the baud."); 1.5× REGULAR → + truncated belonging line ("…religious bias…"); 2.25× HOTSHOT → + "Yes, I am a criminal. My crime is that of curiosity." (delicate line gated to HOTSHOT+, a strong opt-in tier); 3.5× WIZARD → its OWN ordered set: the manifesto's near-ENTIRE closing passage VERBATIM (full belonging line "…and you call us criminals.", the anti-prejudice line, "…outsmarting you…", "I am a hacker, and this is my manifesto.", "You may stop this individual, but you can't stop us all… after all, we're all alike.") with ONE sentence intentionally OMITTED (the "atomic bombs / wage wars / murder" line — kept out of a kids' game even at the top). WIZARD lines carry straight-ASCII apostrophes (can't / we're, the Level-23 key). Theme (js/themes/wordprocessor.js): the manifesto begins on a fresh paragraph and the visible document is clamped to the top band above the prompt (via a `beginFinale()` render hook fired by main.js `maybeSignalFinale`) — no more busy ribbon behind the prompt. Verbatim from research/wiki/culture/hacker-manifesto.md (ellipses = three ASCII periods, no apostrophes; the heavier bombs/murder lines intentionally omitted). Broken into ≤17-char prompt-sized sub-lines (visually validated: widest line "without religious" 17ch fits with ~70px margin at 1280, no overflow). Winnable at winRatio 1 AND 3.5 (One-Rule floor). Tests: unit `tests/unit/finale-quote.test.mjs` (INV-62), integration `tests/integration/finale-quote.test.mjs` (INV-63); STRATEGY.md §5 INV-62/63. Celebration left to the wordprocessor theme's `victory()`. Follow-up for the close-out wave: content-librarian on the finale + easter-eggs.md `hello world` proposal #6 (still unbuilt, separate). |
| ~~**Level 25 "MY STORY" coda (manifesto REDESIGNED into a post-target finale)**~~ **✅ BUILT 2026-07-28** | Trevor (2026-07-28): the manifesto was spliced UP FRONT and had become basically the whole level. L25 should "go as normal and then extend past the traditional winnability target with a new final paragraph" — the player types a short readable STORY, and "the level-appropriate manifesto is the final line in said story, capping it off." Because L25 is the "true entire keyboard unlocked" level, the coda must ensure **every letter A–Z is typed**, via an LLM-generated readable "walk the keyboard" story with a mandatory static fallback. | **BUILT.** The up-front manifesto splice is GONE. L25 now plays its normal pool to the traditional target (theme + minPatterns + card + name gates, unchanged), then rolls PAST it into an earned CODA: a readable all-26-letter walk-the-keyboard STORY whose FINAL line(s) are the EXPERIENCE-tier manifesto excerpt as its capstone, plus ≥1 choreographed **typo→Backspace→correct** beat (L25 teaches Backspace; a playful trip-up, fully scripted — the sacred wrong-keypress contract is untouched). New pure-data module `js/keyboard-story.js` (STATIC_STORIES bank of 6 all-26-letter stories + TYPO_BEATS + `assembleCoda`/`storyBodyForRatio`/`pickKeyboardStory`/`renderCodaText`/`validateGeneratedStory`); async client `js/keyboard-story-gen.js`; per-slot `storyRotation` in `js/slots.js` (a different story each replay, mirroring card rotation); `js/main.js` `startCoda` serves the coda as the deterministic tail with a `codaPending` win-gate (replaces `finalePending`); `js/themes/wordprocessor.js` `beginFinale(subLens)` takes the coda sub-line lengths. **Higher EXPERIENCE tier → LONGER coda** (base pangram at 1×, +1/+2/+3 story sentences + more beats at 1.5/2.25/3.5), coverage of all 26 letters holds at EVERY tier (base is a pangram) and OFFLINE (static bank is the floor). Optional local-LLM variety via new Go endpoint `/api/keyboard-story` (loopback default + OLLAMA_HOST; never sends PII; server + client both validate charset/coverage/safety/length — security rules 6-7); missing/erroring → static bank. Winnable at winRatio 1 AND 3.5 (integration-proven, both tiers). Manifesto text/tiers (`js/finale-quote.js`) unchanged, now the coda capstone. Tests: unit `tests/unit/keyboard-story.test.mjs` (INV-64/65/66) + updated `tests/integration/finale-quote.test.mjs` (normal→coda→complete, walk-the-keyboard A–Z, winnable both tiers) + Go `keyboard_story_test.go`; STRATEGY.md §5 INV-62..66 rewritten. **Recorder-proven winnable 2026-07-28** (game-player, LIVE-Ollama Go binary): `record-playthrough.js --single-level=25` exited 0 / 0 rejects / LEVEL COMPLETE at 133s; transcript confirms normal→coda→complete, every letter a–z typed, the `we cna`→⌫⌫⌫→`we can do it` typo beat, and the manifesto capstone — no stall/trap. **Generation yield HARDENED 2026-07-28** (~7%→**67%** any / ~0%→**53%** NOVEL non-static; root cause was llama3.2 blank-line drift fragmenting valid stories AND its inability to invent novel pangrams): robust `parseAndValidateStories` (ignores blank lines, no `\n\n` dependence — per-sentence safety gates unchanged), a one-shot prompt example, and a NEW `js/keyboard-story-cache.js` `kk-stories` localStorage cache (validated stories only, defensive reads, capped 20, deduped vs static+cache, fed back as an `avoid=` anti-dup hint carrying story-text-only/no-PII — the `avoid` seed with static bases is what steers the model onto *other* real classic pangrams). Static bank remains the winnability floor regardless (INV-67). security.md rules 7/8 updated. **Still owes `/security-review`** (new free-text/LLM/storage surface). Docs: content-librarian refreshed engine-flow.md + level-themes.md + the L25 coda screenshot. |
| Adaptive pacing | tech.md "Adaptive Pacing" | Rolling-average keystroke timing driving prompt speed; never a hard timer |
| Visual theme selector | product.md settings table ("Oona's future ideas!") | Settings row exists conceptually; theming is modular via body.level-N + CSS vars |
| **Act 6 — "Text Worlds"** (bonus wing) | this session's discussion (2026-07-13) + research [[mud]]/[[mangband]]/[[roguelike]]/[[zork]]/[[ansi-escape-codes]]/[[dialup-modem]] | **BUILT — Act 6 COMPLETE (all 5 worlds, 2026-07-14; the IM-friend was the last).** (Design record follows.) Hidden post-graduation act (full keyboard already learned) holding several terminal/text experiences that ARE the game's thesis. Trevor named three, "and probably others": (1) **The MUD** — pure-prose text adventure, read-a-room + type compass-dir + verb (go/look/take/talk), no on-screen map; best fit for the Level 20 terminal STYLE. (2) **The ASCII tileworld** — overhead Zelda-like in ASCII tiles (`@`=you), genuinely multiplayer with clans/factions (early graphical-MMO reference — see groundings below); bigger lift (rendered grid). (3) **The IM character** — chat with a character the PLAYER designs, powered by the LOCAL LLM (reuse Ollama wordgen infra); free-text + LLM ⇒ security.md rules 6–7 apply hard. **Typing: HYBRID** (guided verbs → hints fade as mastered). **One Rule:** strip MUD/roguelike permadeath+combat-loss, keep aesthetic+exploration only (Missile-Command-style reframe); "capture" (a Pokémon verb) is the kid-safe combat reframe; keep MUD refs generic, no commercial-MUD adult branding. Era cues: green-phosphor vs ANSI color; modem-handshake connect sound. **Confirmed groundings (Trevor, 2026-07-13):** the ASCII one = overhead multiplayer with **clans/alliances/factions** you join and explore alongside ("like a really early EverQuest," LORD-adjacent, dialup, same era) → **RESOLVED (2026-07-13, [[megazeux]]/[[asciiroth]]): a single-player DOS/ANSI ASCII-character RPG world you TYPE through.** MegaZeux (Alexis Janson, Dec 1994; the DigitalMZX sharing community) / Asciiroth realm — confirmed SINGLE-PLAYER in every documented case (MegaZeux maintainers: netplay never shipped), which SUITS the game anyway (no networking; security.md local-only; kid-safe). The clans/"early-EverQuest" camaraderie → **NARRATIVE FRAMING** (friendly fellow-travelers / NPCs / "someone was here before you" ghost-notes — the communal feeling without the wires), NOT real multiplayer. Ruled out: NetHack, MAngband, commercial MMOs (Kesmai/NWN/Meridian — see [[early-graphical-mmorpgs-1990s]]). Decoupled open thread (does NOT block the build): whether a separate real telnet MUD-with-clans is a second, conflated memory. The prose one = multiplayer + dialup + "**green dragon**" in the name, NOT DikuMUD → the **BBS door-game family: Legend of the Red Dragon (LORD, 1989) / Legend of the Green Dragon (LoGD, 2002 web remake)**. Design: honor LORD/LoGD's world (Forest/Inn/the Dragon-as-friendly-goal, other players as ghosts) but use TYPED commands (MUD-style, for typing pedagogy) not LORD's letter-menus. **Research:** LORD + BBS-door-games pages landed (prose); LoGD dedicated page + the ASCII/clans-MMO re-identification both in flight. (A NetHack+NAO page exists but is NO LONGER the ASCII grounding — Trevor ruled NetHack out.) Act 6 is the *no-speed* wing; its speed counterpart is **Act 7** (next row) |
| **Act 7 — "Speed / Racing"** (bonus wing) | this session's discussion (2026-07-13); memory: act7-speed-racing | **Active direction.** The second post-graduation wing: typing AT speed / velocity mastery, framed as RACING — where the original **Mario Kart** + **Tron light-cycles** idea now lives (moved out of the old undifferentiated Act 6). The complement to Act 6: Act 6 = think thoughts into keystrokes (cognition), Act 7 = type them fast (velocity). **One Rule:** speed is JOY + self-improvement, opt-in like Survival — a race you can never "lose" (always finish, chase your own best / a friendly rival; fast+accurate earns boosts, slow = gentler ride, never a game over; the Tron cycle never crashes-and-kills). This is the honest home for "speed" in a game whose core forbids timers |
| More easter eggs | `.claude/rules/easter-eggs.md` "Proposed (unbuilt)" | 10-item curated menu: Grace Hopper moth, sudo, white rabbit, rubber duck, dial-up chirp, Y2K monitor, themed 404, the eighth-key confession, all-your-base, hello-world |
| Teacher/classroom mode, mobile/tablet, Godot port | tech.md "Future Considerations" | Far future |

---

## 3 — Tech debt & polish (discovered this session)

- **`docs/screenshots/capture-all.js` can't drive gameplay into the L25 "MY STORY" coda (found 2026-07-28).** Its L25 shot only captures pre-game chrome, so the coda frame in `docs/screenshots/levels/act5-full-circle/25-word-processor.png` was captured ad-hoc by the content-librarian (flagged in level-themes.md + feature-map.json `_comment` so a future library-scope `capture-all.js` run doesn't silently revert it to the chrome shot). Follow-up for the screenshot-tool owner: add a coda-driving capture path (play L25 past the win target, seed a known `storyRotation`, screenshot the coda). NOT a blocker.

- ~~**`docs/screenshots/capture-cards.js` broken since the 2026-07-19 card rebuild.**~~ **✅ FIXED 2026-07-28.** Rewrote the wire-check + capture loop against the flat-array/rotating-pool model: derives everything from data (`HISTORY_CARDS.filter(c=>!c.secret)` = 54, `TOTAL_CARDS`), and steers `pickGuaranteedCard` deterministically to force a specific card (seed every OTHER card in that level's pool as collected in `kk-slots` → target is the sole candidate) so every pooled card is captured guaranteed, then verifies the overlay shows the forced card before shooting. Regenerated all 54 pooled-card PNGs in `docs/screenshots/history-cards/` (stale old-model shots cleared) + the secret `joshua` card from its gallery cell. Added a CLI filter (`node capture-cards.js L13` / `id,id`) for fast partial reruns. (~30min full run — background it.)
- ~~**Wordprocessor finale sub-line spacing cosmetic ("outsmartingyou").**~~ **✅ FIXED 2026-07-28.** `js/themes/wordprocessor.js` now inserts a space between consecutive finale sub-lines in the decorative document (theme-side only, reconstructing sub-line lengths via `finaleLinesForRatio` — the `finale-quote.js` data + its `join(' ')` verbatim test are untouched, and the player-typed prompt is unchanged). The document now reads "…outsmarting you, something…". (The earlier ribbon-busyness was already fixed by `beginFinale()` on 2026-07-27.)
- ~~**Collection gallery truncates multi-word card WORDS.**~~ **✅ FIXED 2026-07-28.** `css/screens.css` `.collection-cell-label` now wraps (`white-space:normal; overflow-wrap:break-word; text-align:center; line-height:1.3`) instead of ellipsis-clipping — `RUBBER DUCK` / `HELLO WORLD` render in full on a tidy centered second line; single-word labels are visually unchanged (no space to break on); cells keep their fixed 104×74 size so the grid stays aligned. CSS-only (label is `textContent`, no DOM sink). Before/after screenshot-verified.
- ~~**`hello world` easter egg (easter-eggs.md proposal #6).**~~ **✅ BUILT 2026-07-28.** When the L25 word-processor document accumulates "hello world" (which the guaranteed `hello world` history card types), the theme prints once — warm gold, bottom strip, ~5s fade — `★ EVERY PROGRAMMER'S FIRST WORDS. WELCOME TO THE CLUB. ★`. Latched once-per-play, fixed-literal `fillText` (no DOM sink), never gates flow (One Rule). Moved to easter-eggs.md "Implemented"; landed as a document-content trigger, not the originally-imagined free-type mode.
- ~~**`docs/screenshots/capture-screens.js` §5 is stale after save slots (2026-07-19).**~~ **✅ FIXED 2026-07-28.** Retired the dead `continue`/`kk-progress` block and added built-in, filter-selectable capture for the current screens: `slots` → `slots-picker.png` + `slots-erase-confirm.png`, `collection` → `collection-gallery.png` (so `node capture-screens.js slots,collection` regenerates all three — no ad-hoc script needed). Seeds `kk-slots` from the live `js/slots.js` shape with card ids pulled live from `js/history-cards.js` (★ counts never drift against a literal). Full no-filter run: 13/13 green, exit 0, all pre-existing screens intact.
- **Save-slot polish nice-to-haves (2026-07-19):** (a) confirm the slot-picker still reads
  well at very large game counts on small viewports (scroll landed: `.slots-list` is
  `max-height:62vh; overflow-y:auto`, verified at 12 games); (b) consider a per-game
  "last played" ordering or timestamp so the most-recent game floats to the top (no
  `Date.now()` in engine code — would need a play-counter or similar); (c) the WOPR/`joshua`
  dev bypass into a level with no active game is ephemeral (collects/records nothing) — fine
  as a dev path, revisit only if it becomes a real player path.

- ~~**Act 6 — Text Worlds: the Green Dragon "first room"**~~ **BUILT 2026-07-13** (first
  slice of the §2 Act 6 vision). A back-wall **door** on the select screen (navigate down
  past Act 5; unlocked at `maxUnlockedLevel>=25` or WOPR bypass) opens a new `'textworld'`
  screen running a self-contained text-adventure engine (`js/textworld/engine.js` +
  `greendragon.js`). Guided typed-command input (type one of the room's offered commands;
  the matcher accepts a key only if the buffer stays a prefix of an authored command → the
  One-Rule "gentle nudge, line waits" wrong-key feel, and **zero new untrusted-input
  surface**); emerald CRT renderer with measured word-wrap; a warm, friendly-Dragon finale
  (no death/loss/timers). Parallel screen — `handleGameKey`/`levels.js` untouched (journal
  L40). Persists to a tolerant `textWorlds` namespace in `kk-progress`. Verified end-to-end
  via Playwright (door→play→win→return, zero console errors); embed build serves
  `js/textworld/*`. Reference shots: `docs/screenshots/textworlds/`. **Follow-ups:** unit +
  integration tests (test-engineer, in flight); a `docs/features/` page + `goToTextWorld`
  capture helper; ~~the hybrid "hints fade" mechanic~~ **DONE 2026-07-13** (mastery-driven
  full→dim→hidden, always restored on a nudge/new-room/idle — One-Rule safety);
  ~~the ASCII/MegaZeux world~~ **DONE — now TWO tile worlds, 2026-07-14; REDESIGNED MUCH
  BIGGER + grounded, 2026-07-17**: a data-driven ASCII overhead engine `js/textworld/tileworld.js`
  + `tile-worlds.js`, feeding **THE GLIMMER DEEP** (a cave → a night-sky cavern of twinkling
  crystals) and **THE WHISPERWOOD** (an old forest → a moonlit glade of drifting fireflies).
  **Redesign (2026-07-17, arcade-historian-grounded — `research/wiki/tech/ascii-overhead-world-conventions.md`):**
  the old 15×9 single-key `n/s/e/w` maze became a proper explorable world — **~46×16 × 3 chained
  screens** (MegaZeux edge-exits), a **10-glyph** themed vocabulary, roguelike **lit/dark
  fog-of-war** (line-of-sight torch, remembered dim tiles), and **TYPED movement** (`up`/`down`/
  `left`/`right` via the guided prefix-matcher, `n/s/e/w`+compass-word aliases — movement is now
  spelling practice; single-key n/s/e/w was flagged historically inauthentic, WASD is anachronistic
  — see the research). **Authored riddle creatures** (no LLM): step adjacent → read an early-reader
  riddle → TYPE the answer (forgiving, case-insensitive; wrong = gentle nudge, hint after 2 tries,
  answer after 3; Space steps back). **One-Rule floor proven by BFS:** the goal is always reachable
  without solving any riddle or opening any gate — riddles/gates are pure bonus.
  **RIDDLE ENRICHMENT — all three worlds, one pattern (2026-07-18, Trevor):** a new shared
  `js/textworld/riddles.js` (`buildPool`/`answerMatches`, letters-only, hint escalation) drives
  BOTH engines. Every creature now carries a **rotating riddle POOL** (a flat primary + `more:[…]`),
  so revisiting a character gives a NEW puzzle ("different each time"). The riddles are **logic /
  word-play** puzzles (not "what am I") — children's-lit (Tolkien's *Riddles in the Dark*, Alice's
  raven, Humpty), kid-safe tech/hacker winks (Grace-Hopper moth, `xyzzy`, `hello`, rubber duck,
  ONE→GONE), a difficulty spread that ages up — all citation-verified in `research/act6-riddle-bank.md`
  + new wiki pages [[riddles-in-the-dark]]/[[localhost]]. **Casts expanded:** THE GLIMMER DEEP now
  6 creatures (added Ora the ember-moth, Boulder the rock-golem, Deep the echo-bat); THE WHISPERWOOD
  now 7 (added Pip the woodsprite, Bramble the hedgehog, Silvermane the unicorn, Fen the duck).
  **THE GREEN DRAGON now has riddlers too** (the prose engine gained a TYPED riddle sub-mode — a
  reply is always typed, never selected: it is a learn-to-type game first): Fern the wood-sprite,
  the badger, Astra the unicorn (new MOSSY GLADE room), Quill the raven, and the Dragon itself —
  riddles are BONUS, never on the win path (BFS/derivation floors intact; INV-42/45/55 green). Dead
  unreachable answer alternates (`'the river'`,`'a fox'`,`'7'`…) cleaned out. The door **hub
  chooser** `js/textworld/hub.js` lists them (unchanged ids/titles). **Act 6 = 5 worlds; ALL 5 BUILT (2026-07-14) — Act 6 is COMPLETE:** Green Dragon
  (prose) + Glimmer Deep + Whisperwood (tile) + **YOUR OWN WORLD** (`js/textworld/maker.js` — the
  keystone: type words at a prompt bar → things appear in the scene above → type `wake` and the
  world comes ALIVE (birds/clouds drift, stars twinkle, chimney smoke, flowers sway, lit windows).
  Fixed word palette = allowlist, **no untrusted-input surface**; hints toggleable (Tab) AND
  mastery-fading; progressive vocab unlock. The MegaZeux "type a world into being" thesis, handed
  to the child).
  ~~**REMAINING — the IM-friend**~~ **BUILT 2026-07-14** (5th world; handoff
  `docs/handoffs/im-friend-build.md`): **A FRIEND TO TALK TO** — a kid chats with a warm character
  powered by the LOCAL Ollama (`js/textworld/imfriend.js` + `personas.js` + `js/chat.js` +
  `main.go` POST `/api/chat`). Every persona is a KK-aware **gentle teacher-companion** (short
  early-reader words, cheers typing, asks easy questions, never scary, never asks for personal
  info) — that lives in the **server-composed** system prompt (`main.go chatBaseSafety`), which the
  client CANNOT strip. Ships curated **PIXEL** (chirpy letter-loving robot) + **SPROUT** (gentle
  growing plant); the child can **make their own friends** via a short Q&A (name/what/loves/like)
  that assembles a persona — made friends **PERSIST and remember** across launches (`kk-friends`
  localStorage), with a **"forget this friend"** erase valve. Graceful **offline "napping"**
  fallback (Ollama asleep → scripted in-character warmth, never broken — mirrors wordgen's static
  fallback). Security (this was the wing's first real untrusted-input surface): free-text chat is
  DATA to the model + canvas-only rendering (no DOM sink, no external host); persona free-text
  fields charset-allowlisted + capped on BOTH sides; message/reply structure validated; light
  output word-check backstop; PII-floor exception documented in `.claude/rules/security.md`
  (2026-07-14). Server-side pure functions covered by Go unit tests (`chat_test.go`); 17 JS/browser
  integration tests (INV-48..52, `tests/integration/textworld-imfriend.test.mjs`) green. **Earlier worlds' TF-T1 FIX still holds** — a
  won/visited world records completion on ANY exit (incl. Escape) via each engine's `hasWon()` +
  `hub.js returnToMenu()`.
- ~~**Wordgen cache not keyed by length window + cold-model warmup (2026-07-13)**~~
  **LANDED 2026-07-13.** Reworked the wordgen supply into two clearly-roled tiers so
  the LLM stays the source of FRESHNESS and the cache is only a fallback (Trevor's
  design intent): **(1)** the fresh BUFFER is now keyed by `(level, charset, minLen,
  maxLen)` — a batch generated under one length window can never serve a request
  declaring another, so generated long words land reliably and the long-word GENERATION
  test flakiness is gone (`main.go cacheKey`). **(2)** a new fallback RESERVOIR
  (`resPool`, bounded/deduped per level+charset, fed from every successful generation)
  is served — window-filtered, shuffled — ONLY when the model is unreachable at request
  time (`modelReachable`), so a transient model hiccup keeps serving real generated
  words instead of snapping to static pools; when the model is healthy the reservoir is
  never read (freshness stays primary). **(3)** cold-model **warmup**: `keep_alive=10m`
  on generate requests + a rate-limited `maybeWarm()` fired at startup and on every
  health→available transition (the client already nudges health rechecks at act
  transitions), so only the first generation pays the ~40s cold-load cost; background
  gen budget widened 30s→60s to survive an unwarmed cold gen. Go tests added
  (window isolation, reservoir served-only-when-unavailable, reservoir window filter +
  dedup/cap, warmup no-op safety); full `make test-fast` green. Neither tier ever
  blocks play (static pools always serve).
- **MAX WORD LENGTH top tier (12) < true static content ceiling (2026-07-13)** — the
  curated pools include a couple of 13–14 letter outliers (`extraordinary` L14,
  `keyboard/world` L15) reachable only under MAX=ANY, not the highest numbered tier 12.
  Not a bug (MAX is best-effort; ANY covers them), but if those should be selectable at a
  numbered tier, add a 13/14 option — Trevor's call.
- **Number-level word+digit prompts (2026-07-13)** — DICT added combos like
  `district56`, `keyboard10` at levels 16–20: key-valid and test-clean, but whether they
  read well as prompts is a taste call for Trevor's playthrough.
- ~~**Favicon / browser-tab identity**~~ **LANDED 2026-07-13** — on-brand favicon
  (a crowned cyan arcade keycap: "Keystroke" + "Kingdom", in the in-game key-box
  palette). `favicon.svg` (crisp primary) + real multi-size `favicon.ico` (16/32/48,
  kills the bare `/favicon.ico` probe) + `apple-touch-icon.png` (180, iOS/bookmarks);
  wired via `<link>` tags + `theme-color` in index.html, the `//go:embed` line, and
  the `.dockerignore` allowlist. Zero 404s on the real Go server (verified); the only
  remaining static-host 404 is the by-design `/api/wordgen/health` probe (see the
  capture-all.js note below). New root files still need committing.
- ~~**Docker builder base was the heavy download**~~ **LANDED 2026-07-13** — the
  `make docker-build` ~1GB pull was the build stage (`golang:1.26` Debian), not the
  22.6MB final image (already distroless/static). Switched the builder to
  `golang:1.26-alpine` (~4× smaller download); safe because `CGO_ENABLED=0` emits a
  fully static binary independent of the builder's libc. Runtime stays distroless
  (smaller + lower attack surface than alpine). Verified: builds, final image
  unchanged, container serves HTTP 200. Journal L37. (Dockerfile/.dockerignore/
  docker-compose remain untracked on this branch — commit when partitioning.)
- ~~**TF findings triage (2026-07-12 test swarm)**~~ **ALL 6 RESOLVED 2026-07-13**
  (4-lane fix wave per Trevor's triage; details in docs/testing/FINDINGS.md):
  TF-H1 FIXED (select()-on-reveal at all three name-entry sites); TF-H2 BY-DESIGN
  (cap is 16 — docs updated); TF-H3 BY-DESIGN (Space TYPES a space in names, Return
  confirms; Space stays the deliberate quick-advance key on every other screen —
  thumbs-rest rationale now in transitions.md/onboarding.md); TF-3 FIXED
  (platform-aware canvas ENTER label — defensive: Trevor confirmed the original
  confusion was prose, already handled by data-enter-key; the label is currently
  behind fog anyway); TF-4 FIXED (pacman miss() = nearest-ghost double-take with
  frightened-blue flinch, wiki-grounded, frame-verified); TF-E1 FIXED+EXPANDED
  (request-declared maxWordLength on /api/wordgen, clamped to play-logic ceiling 8,
  prompt adherence + validateWords re-enforcement, structure-layer per-line/whole-body
  size caps, client filter aligned 12→8, live-smoked on Ollama). Suite now runs with
  ZERO todos — every finding's test is a live gate.
- **game-driver hardening (2026-07-12 test swarm)** — promote lane-local workarounds
  into tests/helpers/game-driver.mjs: wait-for-screen in toLevel (Lane F's
  ensureGameScreen), live progress seeding that survives reload observation (Lane H's
  seedProgressLive), WPM reader distinguishing hidden vs '--' (Lane G). Also: no
  driver path observes cabinet-lock gating (wopr bypass unlocks all) — add a
  non-bypass select route if lock-state tests are ever wanted; Survival×FreePlay has
  no player-reachable combined path to test.
- **Stale comment in js/themes/tetris.js victory()** (content-librarian, 2026-07-12) —
  says "engine currently ignores the return value"; false since the victory-duration
  wiring landed. One-line comment fix next time that file is open.
- ~~**capture-all.js false-positive on static hosts**~~ **FIXED 2026-07-13** —
  the expected `/api/wordgen` probe 404 (static host, no Go backend) is now filtered
  at the shared collector (`kk-playwright.js` `isExpectedWordgenProbe404`, matched by
  the failing resource URL so real 404s still surface) and surfaced as one clear line
  instead of a failure exit — fixes every launchPage/captureGif tool (capture-all,
  a11y audit). Paired with `js/wordgen.js` now emitting ONE clear `console.info` on the
  disabled path ("server-driven word generation unavailable — falling back to the
  built-in static dictionary"), asserted by a wordgen-client unit test. Verified:
  `capture-all.js 3` on a static server exits 0 with "No JS errors."
- ~~**Theme→artifact mapping gap**~~ **FIXED 2026-07-13** — `scripts/feature-map.json`
  gained a per-theme `themes` map (each `js/themes/*.js` → its ONE level screenshot +
  minimal-blast-radius `capture-all.js <L>` + the `research/wiki/games/*.md` grounding),
  synced from canonical source `docs/features/level-themes.md`. Closes the gap where the
  coarse `js/themes/` catch-all let a theme change (e.g. `pacman.js`) skip its specific
  screenshot/research refresh. Surfaced one **research gap**: Missile Command (L23) has
  no `research/wiki/games/missile-command.md` — arcade-historian follow-up.
- ~~**`fighter.js` art mismatch**~~ FIXED 2026-07-11 (swarm) — full rewrite as faithful
  Galaga: 3-layer starfield, 8×5 rainbow bug formation (anchored high per journal L17),
  keystroke dive-bombs, ambient capture-beam flourish; F1-style sentinel-frame math
  guarded; wrong keys non-punishing. Victory path exercised without the F1 crash.
- ~~**Two keyboard-geometry sources of truth**~~ FIXED 2026-07-11 (swarm) — `hud.js` now
  exports `getKeyGeometry()` / `KEYBOARD_UNITS_PER_ROW`; keyboard-preview.js derives its
  layout from it (duplicate KB_LAYOUT deleted). Preview gained true-ANSI staggers/widths
  and permanent-fog Tab/Caps/Enter silhouettes — subtle intentional appearance change,
  worth a human glance.
- ~~**a11y audit tool artifact**~~ FIXED 2026-07-11 (swarm) — audit.js now strips
  text-shadow before sampling and skips label-less boxes; `DEV_URL` env override added.
  New baseline: audit-fixed.json. **3 REAL contrast FAILs remain** (see Swarm follow-ups).
- ~~**Survival × Free Play combined path**~~ QA'D 2026-07-11 (swarm) — all tiers pass:
  quarters/WPM/timer HUD coexist without overlap, 25 wrong keys cost nothing, timer expiry
  gives the warm game over, mercy-quarter refund works, Free Play never records progress.
  One latent bug found (see Swarm follow-ups).
- ~~**Playwright helper duplication**~~ FIXED 2026-07-11 (swarm) — `scripts/kk-playwright.js`
  exports launchPage/resolveBaseUrl/goToSelect/goToLevel/ACTS_CONFIG; capture-all.js and
  audit.js refactored onto it; visual-validation.md points at the helper. Supports
  `DEV_URL` env override for agent-local static servers.
- **Performance pass** — upgraded themes (particles, parallax, projection) target 60fps and
  were spot-checked headless; verify on a low-end machine, esp. Acts 3-4.
- ~~**levels.md size budget regressed**~~ FIXED 2026-07-11 — re-split by concern: Act 5's
  per-level detail (Levels 21–25) moved to new `.claude/rules/act5-full-circle.md`,
  mirroring the transitions.md split; levels.md now 37,088 bytes (was 40,970). Enforcement
  added: `scripts/docs-currency-hook.sh` now also warns once per session if any
  `.claude/rules/*.md` exceeds the 40k budget, naming the file and size. (Journal F21,
  closed.) *(Since re-split again into per-act `.claude/rules/levels/act1-5.md` on
  2026-07-12 for targeted context loading — act5-full-circle.md was absorbed into
  `levels/act5.md` and deleted; the hook's size check now also globs
  `.claude/rules/levels/*.md`.)*
- **Level 24 pattern crowding** — level 24 now injects BOTH the player's name (twice) and the
  'Eniac' card word; fine in testing, but watch pacing when Oona plays it.

### Swarm follow-ups (found 2026-07-11 by the journal-debt swarm) — ALL RESOLVED same night

- ~~**Latent Survival-timeout bug**~~ FIXED — `handleSurvivalTimeout()` now draws via a
  shared `drawRandomPattern()` and only writes in-bounds; unit-tested + verified in-browser
  through a 70-pattern Free Play exhaustion run.
- ~~**3 real contrast FAILs**~~ FIXED — L9/L12: fully opaque prompt scrim (the 0.72-alpha
  scrim was letting the bright canvas bleed through) + widened glyph box (the audit partly
  measures glyph width — wide W/B glyphs cap the ratio); L25: level-scoped label color.
  Results: 5.07:1 / 5.02:1 / 6.25:1, zero new FAILs across two clean audit runs.
- ~~**Keyboard-preview header overlap**~~ FIXED — vertical-budget clamp in render(); the
  unified (taller) keyboard geometry had shifted up into the DOM header. Verified L1/12/17/25.
- ~~**L20 terminal left-clip**~~ FIXED — root cause was canvas 2D state leaking between
  screens (keyboard-preview leaves `textAlign='center'`); terminal.js now sets text state
  explicitly. New rule: journal L28.
- ~~**Erase-scope divergence**~~ FIXED — both erase paths now call one exported
  `eraseProgress()`: clears `kk-progress` + `kk-cards`, keeps name + `kk-settings`.
- ~~**Optional Galaga tuning**~~ DONE (cleanup batch, late 2026-07-11) — startY 0.10H +
  tightened gapY; top three rows now fully above the prompt panel. The bottom two rows
  still graze it — a 5-row formation can't fit entirely above 0.19H without shrinking
  sprites game-wide; documented inline as the tightest faithful fit.
- ~~**fighter.js fresh-eyes dead-code sweep**~~ DONE — none found; all declarations live.
- **Cleanup batch extras** (same pass): L25 "MY STORY" title now page-centered, clear of
  the HUD badge; mystery/basement/commandcenter cinematics got fullcircle's defensive
  hideAllScreens()/restore pattern (verified before/during/after from a fresh load);
  `body.level-15 .complete-stat` contrast bump mirroring the L25 fix (CSS verified,
  full overlay-reach playtest skipped as not cheaply scriptable).

### Theme-space rework wave (2026-07-11, from Trevor's screenshot review) — LANDED

Trevor's review: levels 9/10/13/15/16/17/22/23/24/25 had "strange... use of space around
the keyboard", the fullcircle-phase screenshots looked broken, and L24 was illegible.
Root cause: themes composed focal art at canvas center, where the prompt panel + keyboard
guide permanently sit. Fix: the **Theme Layout Contract** — "the UI owns the center; the
theme owns the frame" — now codified in `.claude/rules/visual-validation.md` (screenshot
check #5) and journal L29. All ten themes recomposed into the stage regions (7-lane wave,
every lane re-measured the panel rects, zero console errors, before/after screenshots):
Mario bottom-strip world; Zelda walls-as-frame dungeon (brightened); Myst island + large
linking book; Pokémon Game Boy battle layout (textbox below keyboard, HP boxes off the
HUD); SimCity grounded districts that grow as patterns complete; **GoldenEye = Trevor's
4-player split-screen idea** (P1–P4 tinted quadrants); Q*bert pyramid in the left margin;
Missile Command full-width skyline + margin-only trails; L24 high-score table in the side
margins with the typed name assembling into the blinking #1 slot; L25 visible page with
words accumulating + gentle Backspace lift-off. Also: fullcircle cinematic title-bleed was
a capture-path artifact — defensive screen-hiding added anyway, corner cabinets got real
silhouettes, `docs/screenshots/capture-fullcircle.js` checked in, all 4 phase PNGs
regenerated clean. Tiny-glyph prompts (backtick/apostrophe/comma/period/dash/equals) now
render 64px with quiet canonical captions (hud.js). All 30 screenshots regenerated, no JS
errors. *(The one nit — L25 "MY STORY" overlapping the LEVEL 25 badge — was fixed in the
same-night cleanup batch; see Swarm follow-ups below.)*

## 4 — Tooling / process

- **`arcade-historian` agent** (`.claude/agents/arcade-historian.md`) — reusable research
  agent encoding the citation standard (2-4 live-verified sources per claim, institutional-
  first hierarchy, no URLs from memory, [fetched]/unverified labels, corrections sections,
  downstream flags for player-facing text). Use for ANY new historical content: future
  history cards, easter eggs, Act 6 cabinet research, Lyria-prompt era research. Registry
  loads at session start — available from the session after its creation (2026-07-11).

- **`game-player` agent + playthrough recorder** (2026-07-11) — `scripts/record-playthrough.js`
  records a deterministic, human-paced full playthrough to video (seeded typing cadence
  ~1.6 keys/sec "kid" profile with occasional wrong-key-then-correct moments, cinematics
  played in full; Playwright recordVideo → ffmpeg → .mov). `.claude/agents/game-player.md`
  encodes the flow knowledge (DOM-read expected key, name-entry prefill gotcha, cinematic
  skip-on-keypress, determinism boundaries) — registry loads next session. Refresh the
  reference film: `DEV_URL=<server> node scripts/record-playthrough.js` (defaults:
  docs/keystroke_kingdoms.mov, levels 1-25, seed 1979, name OONA; kid ≈ 18-25 min run).
  Game-side word-pool shuffles are unseeded by design — input track reproduces, word order varies.
- **Security review + secure-coding rules** (2026-07-12) — `/security-review` of the full
  act5-full-circle branch: zero findings (Opus finder + independent verification of every
  rejection: player name is textContent-only everywhere, Level 24 name allowlisted to
  [a-zA-Z] before the prompt sink, hook scripts quote all jq output, no eval/new Function
  anywhere, node tooling uses array-arg execFile). Conventions codified as requirements
  with grep-level checks in `.claude/rules/security.md`; re-run the review before merging
  any branch that adds a DOM sink, hook script, child-process call, localStorage schema
  change, or free-text input.
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
