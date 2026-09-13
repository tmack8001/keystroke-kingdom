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

---

## ✅ 2026-09-11 swarm — RESULTS (static hosting · browser-LLM PM · roadmap batch)

**THE HEADLINE: the game is published, free, and genuinely playable at
<https://tmack8001.github.io/keystroke-kingdom/>.** GitHub Pages, `build_type: legacy`,
`source: {branch: main, path: /}` — it serves the repo ROOT of `main`, so **every push to `main`
is a deploy** and there is no build step. This is now a **third first-class environment** beside
the Go binary and docker-compose, and it is a REQUIRED validation target
(`.claude/rules/visual-validation.md` §"The Three Environments").

**Verified by actually playing it** (read-only lane, live URL): 11 levels won end-to-end across
all five acts; all 25 smoke-loaded with prompt + keyboard guide + canvas; **zero real console
errors, zero page errors, zero stalls, zero One Rule violations**; cold load 450 ms with no
loading pause. The highest-risk path holds: **L25's "MY STORY" coda works with no backend** —
`/api/keyboard-story` 404s, the static bank takes over, and the full all-26-letter story, the
typo→Backspace beat, the manifesto capstone and the `hello world` card all land, level winnable.
Act 6's IM-friend degrades into its scripted "(napping — still here!)" mode; Escape always exits.

### Lane results

| Lane | Result |
|---|---|
| STATIC-FIX | `index.html` favicon refs made relative (they 404'd live); `.nojekyll`; **new `scripts/static-host-check.mjs`** (crawls index.html assets + the whole 58-module ES import graph asserting 200, fails any root-absolute path, reports `/api/*` 404s as expected INFO); CI workflow running BOTH the `/` and `/keystroke-kingdom/` shapes |
| STATIC-PLAY | The end-to-end live playtest above; found the `/api/*` prefix-escape (below) |
| PM-ROLE | **New `product-manager` agent** + `research/in-browser-llm.md` + `docs/specs/browser-llm.md` (see §2 row) |
| SECURITY | The **owed** `/security-review` — 3 confirmed / 3 plausible, no XSS, no code execution, no PII leak (§3) |
| ENGINE | **Adaptive pacing** (§2 row struck), **L24 crowding fixed** (§3 struck), eggs `sudo` / `allyourbase` / eighth-key confession / duck hint; INV-70…INV-75 |
| EGGS-ART | Grace Hopper's moth + the rubber duck |
| EGGS-MISC | Themed 404, dial-up chirp, **and the F1 kid-safety blocklist fix** |
| EGGS-ACT4 | White rabbit (all 5 Act 4 themes) + the Y2K clock |
| POLISH | `capture-all.js` **coda-driving capture path** (plays L25 for real, all 4 EXPERIENCE tiers to LEVEL COMPLETE); tetris comment corrected; **found the wordprocessor wrap-width bug** |
| DOCS | `README.md` leads with ▶ Play it; **new `AGENTS.md`**; `CLAUDE.md` + `visual-validation.md` gained the three environments |
| content-librarian | 8 feature pages refreshed, 5 screenshots regenerated, `feature-map.json` regenerated |

**🥚 `.claude/rules/easter-eggs.md`'s "Proposed" menu is now EMPTY — all ten are built.**

### Gates at close-out (full barrier, settled tree)
- `make test-fast` — **327/327 unit, 8/8 static, `go test ./...` ok**
- `make test-integration` — **144 tests / 48 suites / 144 pass / 0 fail / 0 cancelled**
  (the 3 previously *cancelled* by the rotted Playwright pin now run)
- `make static-host-check` — **PASS, 67 resources all 200** (58 ES modules, 7 assets), exit 0
- `node scripts/wiki-search.mjs --lint` — clean, 262 pages, no orphans, no broken links
- `gofmt`/`go vet` clean

### Journal
**F26** (a green local suite shipped a broken published site — F23's shape one level up),
**L46** (a shared helper's rotted tool path is a single point of failure multiplied by the
fan-out width), **O20** (a magic constant standing in for a measurement is a bug waiting for its
first long input).

### ⚠️ Needs Trevor — the session's open decisions
1. **The BLOCKED WORDS promise overstates its reach** (§3 F2). The settings screen says *"WORDS
   YOU ADD HERE NEVER APPEAR IN THE GAME"*; enforcement reaches only LLM-generated L25 coda
   sentences — not chat, not wordgen, not the curated pools. Narrow the promise, or extend
   enforcement **with a winnability fallback** (filtering a curated pool could otherwise empty it
   and strand a level).
2. **In-browser LLM: build Phase 0 or not** (§2 row) — plus the 3 other decisions in
   `docs/specs/browser-llm.md` §11.
3. **The moth is mouse-only** — odd in a keyboard-first game for a child learning to type. Leave
   it, or make it a typed word (a different egg)?
4. **A 60-second human sound check on the live URL.** Audio is untestable headless and Chrome's
   autoplay policy is **origin-scoped**, so localhost is not evidence for `github.io`.
5. **Y2K clock format** — the wiki renders it `12/31/99 23:59`; the egg uses `easter-eggs.md`'s
   `12/31/99 11:59 PM` (era-correct for a US late-90s monitor). Consistent, or leave?
6. **Nothing is committed.** The favicon fix does not reach players until `main` is pushed, so the
   live static-host check keeps failing until then — expected pre-merge state, not a defect.

---

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
| ~~**Level 25 "MY STORY" coda (manifesto REDESIGNED into a post-target finale)**~~ **✅ BUILT 2026-07-28** | Trevor (2026-07-28): the manifesto was spliced UP FRONT and had become basically the whole level. L25 should "go as normal and then extend past the traditional winnability target with a new final paragraph" — the player types a short readable STORY, and "the level-appropriate manifesto is the final line in said story, capping it off." Because L25 is the "true entire keyboard unlocked" level, the coda must ensure **every letter A–Z is typed**, via an LLM-generated readable "walk the keyboard" story with a mandatory static fallback. | **BUILT.** The up-front manifesto splice is GONE. L25 now plays its normal pool to the traditional target (theme + minPatterns + card + name gates, unchanged), then rolls PAST it into an earned CODA: a readable all-26-letter walk-the-keyboard STORY whose FINAL line(s) are the EXPERIENCE-tier manifesto excerpt as its capstone, plus ≥1 choreographed **typo→Backspace→correct** beat (L25 teaches Backspace; a playful trip-up, fully scripted — the sacred wrong-keypress contract is untouched). New pure-data module `js/keyboard-story.js` (STATIC_STORIES bank of 6 all-26-letter stories + TYPO_BEATS + `assembleCoda`/`storyBodyForRatio`/`pickKeyboardStory`/`renderCodaText`/`validateGeneratedStory`); async client `js/keyboard-story-gen.js`; per-slot `storyRotation` in `js/slots.js` (a different story each replay, mirroring card rotation); `js/main.js` `startCoda` serves the coda as the deterministic tail with a `codaPending` win-gate (replaces `finalePending`); `js/themes/wordprocessor.js` `beginFinale(subLens)` takes the coda sub-line lengths. **Higher EXPERIENCE tier → LONGER coda** (base pangram at 1×, +1/+2/+3 story sentences + more beats at 1.5/2.25/3.5), coverage of all 26 letters holds at EVERY tier (base is a pangram) and OFFLINE (static bank is the floor). Optional local-LLM variety via new Go endpoint `/api/keyboard-story` (loopback default + OLLAMA_HOST; never sends PII; server + client both validate charset/coverage/safety/length — security rules 6-7); missing/erroring → static bank. Winnable at winRatio 1 AND 3.5 (integration-proven, both tiers). Manifesto text/tiers (`js/finale-quote.js`) unchanged, now the coda capstone. Tests: unit `tests/unit/keyboard-story.test.mjs` (INV-64/65/66) + updated `tests/integration/finale-quote.test.mjs` (normal→coda→complete, walk-the-keyboard A–Z, winnable both tiers) + Go `keyboard_story_test.go`; STRATEGY.md §5 INV-62..66 rewritten. **Recorder-proven winnable 2026-07-28** (game-player, LIVE-Ollama Go binary): `record-playthrough.js --single-level=25` exited 0 / 0 rejects / LEVEL COMPLETE at 133s; transcript confirms normal→coda→complete, every letter a–z typed, the `we cna`→⌫⌫⌫→`we can do it` typo beat, and the manifesto capstone — no stall/trap. **Generation yield HARDENED 2026-07-28** (~7%→**67%** any / ~0%→**53%** NOVEL non-static; root cause was llama3.2 blank-line drift fragmenting valid stories AND its inability to invent novel pangrams): robust `parseAndValidateStories` (ignores blank lines, no `\n\n` dependence — per-sentence safety gates unchanged), a one-shot prompt example, and a NEW `js/keyboard-story-cache.js` `kk-stories` localStorage cache (validated stories only, defensive reads, capped 20, deduped vs static+cache, fed back as an `avoid=` anti-dup hint carrying story-text-only/no-PII — the `avoid` seed with static bases is what steers the model onto *other* real classic pangrams). Static bank remains the winnability floor regardless (INV-67). security.md rules 7/8 updated. ~~**Still owes `/security-review`**~~ **✅ REVIEW DONE 2026-09-11** — verdict 3 confirmed / 3 plausible; **no XSS, no code execution, no PII leak**; the new coda modules contain ZERO DOM sinks and the `kk-stories` rule-4/rule-8 claims hold line by line. Findings are tracked in §3 below. (Record note: commit `797c95c`'s message claimed the coda was "clean under two /security-review passes" while this row said the review was still owed — the 2026-09-11 review is the authoritative record.) Docs: content-librarian refreshed engine-flow.md + level-themes.md + the L25 coda screenshot. |
| **In-browser LLM on the static host** (spec written, **awaiting Trevor's decision**) | `docs/specs/browser-llm.md` + `research/in-browser-llm.md` (both new 2026-09-11, product-manager lane) | **Question:** can an on-device browser LLM (Chrome Prompt API / Gemini Nano) light up wordgen / IM-friend / the L25 coda on the free static host at `tmack8001.github.io/keystroke-kingdom/`, with no server and nothing leaving the machine? **Answer: partly, and for fewer players than it first appears.** The Prompt API *is* stable on the web (Chrome 148, 2026-05-05) and the static-host mechanics are fine (`*.github.io` is HTTPS so the secure-context bar is met; top-level same-origin needs no Permissions-Policy delegation). But the gating is a hard conjunction, **verified against developer.chrome.com this session**: Windows 10/11 · macOS 13+ · Linux · ChromeOS **only on Chromebook Plus**, with **"Chrome for Android, iOS… are not yet supported"**, plus **">4 GB of VRAM"**, 16 GB RAM, 4+ cores and **"at least 22 GB of free space"** (the ~4 GB model is *removed* if free space later drops under 10 GB). **Reach framing CORRECTED 2026-09-12 (Trevor):** an earlier draft measured this against *all web traffic* and said "roughly half of players are excluded on platform alone." That is the wrong denominator — **the game is not playable on mobile anyway** (it teaches touch typing on a physical keyboard; see §2b), so mobile users are not addressable players and their exclusion here costs nothing. Among players who can actually play — desktop and tablet-with-keyboard — reach is materially better than that figure implied. The real gate is the *hardware* conjunction within desktop (>4 GB VRAM, 16 GB RAM, 22 GB free), which nobody has measured for this audience — and **Mozilla's standards position is negative, WebKit's is oppose**, so Firefox/Safari are not coming. **Therefore the static pools are not a stopgap — they remain the actual experience for most players, and must stay the winnability floor (INV-64/67).** **Recommended scope:** a thin provider abstraction behind the existing fallback chain, wired to **`/api/wordgen` only**, and used **only when `LanguageModel.availability()` already returns `"available"`** — i.e. the model is already on disk, so the game never causes a multi-GB download (a download-on-demand would be a direct One Rule violation). **IM-friend: permanent non-goal** — its safety rests on `main.go chatBaseSafety`, documented as client-unremovable, plus server-side `curatedPersonas` and `chatOutputOK` (which has *no* client-side equivalent); a page-composed system prompt is editable by anyone holding the page, and there is no mitigation. **L25 coda: defer** — technically safest (its full validation chain already runs client-side) but fires once, for a vanishing subset. **Page-provided models rejected** (WebLLM/transformers.js/wllama): we would ship 0.4–1 GB of weights, and wllama's threading needs COEP/COOP headers GitHub Pages cannot set. Spec carries 8 candidate invariants (INV-A…H) and **4 explicit decisions for Trevor** (§11). Start with a measure-only **Phase 0** — nobody has a real number for what fraction of players clear the bar. |
| ~~Adaptive pacing~~ **✅ BUILT 2026-09-11** | tech.md "Adaptive Pacing" | Rolling average of intervals between CORRECT keypresses, clamped to a multiplier in **[1,2]** that only ever LENGTHENS the engine's two cosmetic pauses (and Survival's per-pattern allowance). **It can only ever be gentler** — fast/normal play is byte-identical to the historical engine, it gates nothing, no input window ever closes. Intervals spanning a mistake are never sampled, so neither a miss nor a slow self-correction moves the pace in either direction (the wrong-keypress contract is entirely outside it). The lane deliberately DECLINED tech.md's "can optionally increase pace" half — speeding up for a child is the one direction that could read as being chased. Published as `data-pace` on `#game-screen` (observable for tests, never rendered as text — a visible speed readout would be exactly the pressure product.md §6 refuses). INV-70/71. |
| Visual theme selector | product.md settings table ("Oona's future ideas!") | Settings row exists conceptually; theming is modular via body.level-N + CSS vars |
| **Act 6 — "Text Worlds"** (bonus wing) | this session's discussion (2026-07-13) + research [[mud]]/[[mangband]]/[[roguelike]]/[[zork]]/[[ansi-escape-codes]]/[[dialup-modem]] | **BUILT — Act 6 COMPLETE (all 5 worlds, 2026-07-14; the IM-friend was the last).** (Design record follows.) Hidden post-graduation act (full keyboard already learned) holding several terminal/text experiences that ARE the game's thesis. Trevor named three, "and probably others": (1) **The MUD** — pure-prose text adventure, read-a-room + type compass-dir + verb (go/look/take/talk), no on-screen map; best fit for the Level 20 terminal STYLE. (2) **The ASCII tileworld** — overhead Zelda-like in ASCII tiles (`@`=you), genuinely multiplayer with clans/factions (early graphical-MMO reference — see groundings below); bigger lift (rendered grid). (3) **The IM character** — chat with a character the PLAYER designs, powered by the LOCAL LLM (reuse Ollama wordgen infra); free-text + LLM ⇒ security.md rules 6–7 apply hard. **Typing: HYBRID** (guided verbs → hints fade as mastered). **One Rule:** strip MUD/roguelike permadeath+combat-loss, keep aesthetic+exploration only (Missile-Command-style reframe); "capture" (a Pokémon verb) is the kid-safe combat reframe; keep MUD refs generic, no commercial-MUD adult branding. Era cues: green-phosphor vs ANSI color; modem-handshake connect sound. **Confirmed groundings (Trevor, 2026-07-13):** the ASCII one = overhead multiplayer with **clans/alliances/factions** you join and explore alongside ("like a really early EverQuest," LORD-adjacent, dialup, same era) → **RESOLVED (2026-07-13, [[megazeux]]/[[asciiroth]]): a single-player DOS/ANSI ASCII-character RPG world you TYPE through.** MegaZeux (Alexis Janson, Dec 1994; the DigitalMZX sharing community) / Asciiroth realm — confirmed SINGLE-PLAYER in every documented case (MegaZeux maintainers: netplay never shipped), which SUITS the game anyway (no networking; security.md local-only; kid-safe). The clans/"early-EverQuest" camaraderie → **NARRATIVE FRAMING** (friendly fellow-travelers / NPCs / "someone was here before you" ghost-notes — the communal feeling without the wires), NOT real multiplayer. Ruled out: NetHack, MAngband, commercial MMOs (Kesmai/NWN/Meridian — see [[early-graphical-mmorpgs-1990s]]). Decoupled open thread (does NOT block the build): whether a separate real telnet MUD-with-clans is a second, conflated memory. The prose one = multiplayer + dialup + "**green dragon**" in the name, NOT DikuMUD → the **BBS door-game family: Legend of the Red Dragon (LORD, 1989) / Legend of the Green Dragon (LoGD, 2002 web remake)**. Design: honor LORD/LoGD's world (Forest/Inn/the Dragon-as-friendly-goal, other players as ghosts) but use TYPED commands (MUD-style, for typing pedagogy) not LORD's letter-menus. **Research:** LORD + BBS-door-games pages landed (prose); LoGD dedicated page + the ASCII/clans-MMO re-identification both in flight. (A NetHack+NAO page exists but is NO LONGER the ASCII grounding — Trevor ruled NetHack out.) Act 6 is the *no-speed* wing; its speed counterpart is **Act 7** (next row) |
| **Act 7 — "Speed / Racing"** (bonus wing) | this session's discussion (2026-07-13); memory: act7-speed-racing | **Active direction.** The second post-graduation wing: typing AT speed / velocity mastery, framed as RACING — where the original **Mario Kart** + **Tron light-cycles** idea now lives (moved out of the old undifferentiated Act 6). The complement to Act 6: Act 6 = think thoughts into keystrokes (cognition), Act 7 = type them fast (velocity). **One Rule:** speed is JOY + self-improvement, opt-in like Survival — a race you can never "lose" (always finish, chase your own best / a friendly rival; fast+accurate earns boosts, slow = gentler ride, never a game over; the Tron cycle never crashes-and-kills). This is the honest home for "speed" in a game whose core forbids timers |
| **Act 7 — "THE SPEEDWAY" (Speed / Racing)** — **SPEC COMPLETE 2026-09-12** | `docs/specs/act7-speed-racing.md` (new, 721 lines) + `research/racing-games-by-era.md` + `research/automotive-vocabulary.md` | **Verdict: BUILD, in four phases, GHOST FIRST.** Trevor's decision #6 is not a feature — it is the solution to the act's only hard problem, so the spec is built around it: the question is never *"did you beat them"*, it is *"did you beat YOU"*, and a learner wins that most sessions. **Throttle = a fixed, invariant advance per correct keystroke** (the floor — every lap finishable at any rate) **+ CHARGE, an additive-only boost meter that a wrong key never drains, resets or deducts.** An inaccurate run is slower because it **earned less**, never because anything was **taken** — Mario Kart's coins with the "being hit costs coins" half deleted, because here nothing ever hits you. That is the literal reading of *"even in Survival, wrong keys cost nothing."* **Laps are N CHARACTERS, never N seconds** — distance is *produced* by typing, never *consumed* by time, so **no clock can end a run**; EXPERIENCE scales the road's length, never any demand. **The AI field is atmosphere only:** never scored, **no placement exists anywhere in the act**, speed derived from the player's own rolling rate (Daytona's 1994 adaptive AI with nothing at stake) — and the inversion that seals it: **the opponents crash and spin; the player's vehicle has no crash state at all.** The world is lively and fallible and the child is the one thing in it that never fails (the Missile Command precedent, applied to a genre that punishes for a living). **Three mechanisms make a SLOWER run land warm, none of which is tone of voice:** the ghost races your **LAST** run, not your best (*"racing an all-time best means a child who had one great day loses to herself forever"*); the ghost is a translucent **"YOU · LAST TIME"** that **stops at the finish line and waits, cheering**, so there is never a moment of being alone on a track someone already left; and the pit board **never renders a minus sign** — a faster lap earns a delta, a slower one simply omits that line, while LAPS / ODOMETER / LONGEST CLEAN RUN only ever go up (**iRacing's permanent record of your mistakes inverted into a permanent record of your driving**). **Graphics-climb is enforced ARCHITECTURALLY, not hoped for:** an **era-scoped render kit** where a `flatpoly` renderer *physically has no `texturedPoly` function* — so Virtua Racing and Daytona USA **cannot** be compressed into one "3D" look — plus INV-85's declared era ladder (non-decreasing `eraRank`, no two tracks sharing a (tier, variant) pair). **11 tracks; Phase 1 is 3** (Monaco GP 1979 `ttl` → F-Zero 1990 `mode7` → modern F1 sim), the maximally distant tiers, so the arc is legible from the first release. **Two recommendations AGAINST:** no wordgen in Act 7 (`speed` is unreachable via `main.go`'s `pee` substring, and the published build has no backend — **static bank only, blocklist unchanged**), and **no brands/logos in v1** (volatility + trademark; concepts teach more). **Storage: `kk-slots[i].speedway`** — a 64-int normalized split table per ghost, 2 ghosts/track, **≤10 KB per slot, bounded by construction, local-only** (exactly what Trevor asked for, and the only correct answer under security.md rule 6 on a backendless host). Chosen over sampled positions (survives a word-bank edit) and over replaying keystroke timings (stores the **observed** result, so re-tuning the charge curve can never silently make a child's saved lap slower — the same hazard class as journal O20). **A schema change, so `/security-review` is REQUIRED before it ships.** 12 candidate invariants **INV-76…INV-88**. **8 decisions for Trevor in §11.** |
| **⚠️ Grand Theft Auto — recommended OUT of Act 7** (Trevor named it; here is the straight answer) | `research/wiki/games/grand-theft-auto.md` | **Do not use GTA — not as a cabinet, not as a history card, not as an easter egg.** Three findings, two from regulators, all fetched from primary sources: (1) **GTA III is ESRB M for Mature 17+** (Blood / Strong Language / Violence — ESRB's own record). (2) **The franchise is the only major retail release ever retroactively re-rated Adults Only, and it drew a federal enforcement action** — 20 Jul 2005 ESRB revoked San Andreas's M rating → **AO 18+**; 8 Jun 2006 Rockstar/Take-Two **settled FTC charges** for non-disclosure ($24.5M re-labelling/recall, mandatory content review, civil penalties up to $11,000 per future violation). `easter-eggs.md` requires every reference to be *"harmless to a child who stumbles on it"* — this is not a close call. (3) **It is not even the right genre, and its own history says so:** it began at DMA Design in March 1995 as **"Race'n'Chase"** — its design doc reads *"a fun, addictive, fast-paced multiplayer car racing and crashing game"* — and the team **deliberately left racing** (creative director Gary Penn: *"nobody wants to be the cop, it's more fun to be bad"*). Everything GTA is famous for happened *after* it stopped being a racing game. And the one GTA contribution worth teaching — **in-car radio stations** — this game already owns upstream: `out-run.md` documents Out Run (Level 21, 1986) as the in-game radio-selection first *"later adopted by Grand Theft Auto."* **Ratings-checked alternatives:** **Midnight Club: Street Racing** (2000, **ESRB E**) > **Need for Speed: Underground** (2003, **ESRB E**, Mild Lyrics — keeps Trevor's NFS anchor) > Burnout Paradise (E10+, and note its signature modes are literally "Crash" and "Takedown") > Crazy Taxi (E10+). **⚠️ Forza Horizon is NOT a safe drop-in — it is ESRB T** (Drug Reference, Language, Suggestive Themes; ESRB's summary quotes "drug-fueled jerks"). That is exactly the plausible-but-wrong substitution this project keeps catching. **If the IDEA is what Trevor wants:** *"in the 1990s, driving games stopped having a finish line and started having a city"* is true and needs no GTA cabinet. |
| **Act 7 rendering backend — recommend raw WebGL2, tracks 10–11 ONLY** *(2026-09-12)* | `docs/specs/act7-speed-racing.md` §5.6d | **The finding that shrinks the problem: nine of eleven tracks must NOT be modern by construction** — the era-scoped render kit *forbids* a 1979 track a gradient and *forbids* Virtua Racing a texture, so Canvas 2D is the correct instrument there, not a compromise. **And two more tracks are actively BETTER in Canvas 2D:** per-triangle affine texture mapping produces exactly the texture swim/wobble that is **era-authentic** for 1993–99 — *a correctly perspective-corrected GPU pipeline would render Daytona and Gran Turismo WRONG.* So the genuine gap is **two tracks**: the modern open road and the modern F1 sim, where "modern shaders, particle systems, full resolution" is the literal `product.md` §5 brief. **Recommendation: raw WebGL2, no framework** — zero download bytes for the child (WebGL is a browser API), zero licence surface, zero supply chain, and the **conservative** choice, which matters more than usual because the deferred 25-level fidelity audit will inherit whatever technique Act 7 establishes; a scene-graph framework here would quietly commit the whole game. Rejected: pixi (~400 KB) and **three.js (~600 KB–1.2 MB) — not for two tracks in a free game**; regl (~30 KB) is the acceptable fallback if hand-written GLSL proves slow. **Key architectural finding nobody should hit at implementation time: a canvas can only ever have ONE context type.** The whole game shares `#invaders-canvas` with a 2D context, so an accelerated track renders to its **own offscreen canvas** and composites in with a single `drawImage` per frame — leaving `index.html`, the screen plumbing, the layout contract and the theme module contract **completely unchanged**. **WebGL is optional and always additive:** context refused, context lost, or a slow machine → Canvas-2D fallback, track stays completable (**INV-90**, the same shape as INV-64/67). **Residual risk stated, not mitigated: headless CI cannot meaningfully exercise a WebGL path**, so `make test-integration` will run the fallback — a WebGL visual regression would be caught only by the screenshot gate and a human look. INV-89/90/91. |
**↻ REVISED 2026-09-12 — Trevor relaxed the deciding constraint after the recommendation above:**
*"we can always switch to having a loading screen when there is a need to pull in webgl or three.js
or something else, that is fine"*, *"let's assume the child has a strong signal, or we can always
measure/toggle functionality based on the signal strength ourselves"*, and *"bespoke was only where
we started, we shouldn't limit ourselves there anymore — but we should vendor what we need."*
**The three.js rejection above was argued primarily on payload (~600 KB–1.2 MB), and payload is no
longer the deciding factor** — a loading screen is an acceptable cost, and signal strength can be
measured and the tier toggled. So the backend should be chosen on **FIT** — what actually renders
the modern tiers best — not on kilobytes. **Two constraints survive and still bind:** it must be
**VENDORED** (committed to the repo; never a CDN, never installed at build time — GitHub Pages has
no bundler), and acceleration must stay **ADDITIVE to a Canvas-2D floor** (a loading screen is fine;
a child who cannot load it being unable to play is not — INV-90). Everything else in the analysis
above still holds, and the strongest part of it is untouched: **the gap is still only two tracks**,
because nine must not be modern by construction and two more are *better* in Canvas 2D (affine
texture wobble is era-correct — a perspective-correct GPU pipeline would render Daytona and Gran
Turismo WRONG). Q10 is now "which backend fits the two modern tiers," not "can we afford one."

| **Flight-sim act — a SIBLING act to Act 7** *(pulled out of Act 7 by Trevor, 2026-09-12)* | `research/vehicle-games-beyond-cars.md` + `research/wiki/tech/keyboard-as-cockpit.md` (in flight); rationale in `docs/specs/act7-speed-racing.md` §5.6c | Trevor: *"maybe the flight sims could be pulled out into a new act in and of themselves… that might be mixing the theme of this new act anyways."* **Different thesis, therefore a different act.** Act 7 = **the throttle** (typing *produces* velocity). Flight = **the cockpit** — the keyboard IS the instrument panel; flaps, gear, trim, throttle, mixture and radios are each a letter or number, which is why publishers shipped **printed keyboard reference cards in the box**. That is structurally closer to Act 6's Green Dragon (*read the situation, type the command*) than to a race, and **the strongest in-genre justification for a typing act this project has found.** **The act climbs on a single axis — ALTITUDE** (Trevor, 2026-09-12): runway → air → orbit → Moon → planets, and rendering climbs *with* it (wireframe → filled polygons → textured → photogrammetry → real planetary imagery), so era and altitude advance together. **The vocabulary lands on words a child is already taught at school** — `sun`, `moon`, `star`, `orbit`, `rocket`, `planet`, `comet`, `crater`, `gravity` span the tier range naturally and several are decodable very early; NGSS K–2 alignment is being verified against the standards themselves, not assumed. **And it may be where the game's two halves meet:** Trevor — *"NASA was also where the idea of computer science as a career came from anyways! so a perfect fit into our hacker/tech culture."* The wiki has **no Margaret Hamilton, Apollo or NASA page** (verified), so this is unexplored ground that could connect the space act back into the existing 55-card computing-history layer rather than sitting beside it. **Register: wonder, not tragedy** — real spaceflight disasters are explicitly not card material — and **not grievance**. **Needs its own product-manager spec** once the research lands. |
| **Act 8(?) — "The Guild Hall" / MMORPG era** (bonus wing) | Trevor, 2026-09-12 | **New direction, unspecced.** The MMORPG era as a typing act. **Why it fits better than it first looks: in an MMO, typing IS the game's social layer.** Chat, `/commands`, emotes, guild coordination, "LFG", calling an incoming pull — the keyboard is how you exist as a person in that world, not just how you move. That is a genuinely different typing motivation from every act so far (accuracy → speed → *expression under a shared goal*), and it is the natural home for the camaraderie Act 6 could only gesture at. **Existing research to build on:** Act 6's grounding pass already produced [[early-graphical-mmorpgs-1990s]], [[neverwinter-nights-1991]] (AOL, March 1991 — widely credited as the first multiplayer online RPG with graphics), [[mud]], [[mangband]] and the LORD/BBS-door family, and it explicitly **ruled these out** as Act 6's grounding — so they are unclaimed and already citation-verified. Era anchors to research properly: Ultima Online 1997, EverQuest 1999, RuneScape 2001, WoW 2004. **Hard constraints:** (a) **no real networking** — security.md is local-only, and this is a children's game, so "other players" are NPCs/ghost-notes/scripted companions, exactly the framing Act 6 landed on; (b) **the One Rule strips the genre's whole punishment economy** — no corpse runs, no XP loss, no gear loss, no PvP defeat, no griefing surface; cooperation and *grouping* are the mechanic, never competition; (c) it must not re-use a cabinet already assigned (arcade-cabinet rule). **Open:** does an MMO act belong before or after Act 7 (Speed/Racing), and does the numbering hold — see the numbering note below. **Next step: `product-manager` spec, then `arcade-historian` for the era pass.** |
| **Act 9(?) — "Make the Machine Do It" / learn-to-program** (bonus wing) | Trevor, 2026-09-12 | **New direction, unspecced — and arguably the game's thesis completed.** Typing teaches computer-science vocabulary, software-engineering words and practices, and **short one-line code samples that are discovered and assembled into something real over the course of the act** — while staying an **early-reader** experience, not a coding course. The game already says "typing unlocks the world"; this is the act where it unlocks *making*. **It has more existing scaffolding than any other proposed act:** the L20 binary→HELLO beat, the `hello world` history card + easter egg, the Hacker Manifesto coda, the whole hacker-culture card layer — and most of all **Act 6's "YOUR OWN WORLD" maker** (`js/textworld/maker.js`), where the child types words at a prompt and things appear in the scene above, then types `wake` and the world comes alive. That is already a proto-version of this idea; this act is its full expression. **The design tensions to resolve first, honestly:** (a) **real code needs symbols the curriculum unlocks LAST** (`( ) { } ; = < >` — Act 5), so this act either sits after L25 or uses a deliberately symbol-free command vocabulary; (b) an early reader can decode `draw`, `star`, `if`, `dark`, `loop`, `move` — so the language should read as **English imperatives** (`draw star`, `if dark then light`, `repeat 4`) rather than any real syntax, which is also how Logo/Scratch earned their audience; (c) **collect-and-assemble is the hook** — one-liners discovered like history cards, accumulating into a tiny program the child can run and see; the completionist loop is already proven (the Skulltula card system); (d) it must teach *practices* (name things well, small steps, try it and see, fix it — Backspace's "not going back, making it right" framing from L25) without becoming homework. **Do NOT invent the CS history from memory** — route era/attribution claims (Logo, Scratch, `hello world`'s origin, the Hacker Ethic) through `arcade-historian`/the wiki. **Next step: `product-manager` spec.** |
| More easter eggs | `.claude/rules/easter-eggs.md` "Proposed (unbuilt)" | 10-item curated menu: Grace Hopper moth, sudo, white rabbit, rubber duck, dial-up chirp, Y2K monitor, themed 404, the eighth-key confession, all-your-base, hello-world |
| Teacher/classroom mode, mobile/tablet, Godot port | tech.md "Future Considerations" | Far future |

---


**Act numbering is now an open question** *(2026-09-12)*: the built curriculum is Acts 1–5
(Levels 1–25), Act 6 is Text Worlds (built), Act 7 is Speed/Racing (designed, unbuilt), and
2026-09-12 added two more directions above. Four bonus wings hanging off a 5-act spine may want
a different organizing idea than a running integer — the bonus acts are **not** a linear
progression the way 1–5 are (they are parallel wings a graduated player chooses between, which is
already how Act 6's hub works). Worth deciding before a third one is built. Note also that each
new wing must respect the **arcade-cabinet rule** (one game per cabinet, no franchise reuse) and
that Acts 6+ all sit AFTER the full keyboard is learned, so they may use any key.

---

## 2b — Mobile & tablet support *(design, 2026-09-12 — Trevor)*

**Built 2026-09-12: the touch-device notice.** The title screen now tells a touch-only visitor
this cabinet wants a keyboard, under INSERT COIN. It **informs, never gates** (the One Rule holds
here too), and **self-dismisses on the first real keydown** — a keypress *proves* a keyboard is
attached, so an iPad with a keyboard case, a Chromebook, or a touchscreen laptop sees it for one
keystroke and never again. Detection is capability-based (`pointer: coarse` + `hover: none`),
**never UA sniffing** — UA strings lie and every sniff list rots. Desktop behavior is unchanged.
`index.html` / `css/screens.css` / `js/main.js` `initKeyboardNotice`.

### "Mobile support" is not one feature — it is two very different asks

**Tier A — tablet + a real keyboard. Genuinely supportable, and the honest win.**
iPad + Magic/Smart Keyboard, Android tablet + Bluetooth keyboard, Chromebook. **These already
work today** — real `keydown` events, real home row, the curriculum intact. What is missing is
only *layout*: the theme layout contract's reserved zones were measured at 1280×800, and a
9.7"/11" tablet in landscape is close but portrait is not. Work needed:
- Verify and tune the reserved/stage fractions at tablet aspect ratios (portrait especially),
  since `visual-validation.md`'s zones assume a landscape-ish frame.
- Confirm the keyboard guide and prompt panel stay legible at ~820px wide.
- Check the iPadOS **Magic Keyboard trackpad** does not make `hover: none` false in a way that
  changes the notice (it may report `pointer: fine` — which is *correct*, and simply means the
  notice never shows; verify rather than assume).
- Nothing about the input contract changes.
This is a layout-and-verification job, not a port. **Recommended: do this one.**

**Tier B — touch-only phone/tablet, no keyboard. This is a different game, not a port.**
Two independent blockers, and the second is the real one:

1. *Layout.* The OS on-screen keyboard eats roughly **40–50% of the viewport**, and on iOS Safari
   it shifts the visual viewport rather than resizing the layout viewport (the `visualViewport`
   API is how you would even measure it). The letter prompt, the keyboard guide, and the theme
   scene all live in exactly the space the OS keyboard would cover. There is no arrangement where
   the thing the child must READ survives the thing they must TYPE ON.
2. *Pedagogy — the hard one.* This game teaches **touch typing**: home row, finger
   assignment, `FINGER_MAP`, `KEY_REACH`, two hands, muscle memory built on the F and J bumps.
   A glass keyboard teaches **thumb typing**. It is not a degraded version of the curriculum, it
   is a contradiction of it. Shipping it would quietly teach the opposite of the thing the game
   exists to teach.

If Tier B is ever wanted anyway, the options are — in order of honesty:
- **Decline it, and say so warmly.** (What we do today.)
- **A bespoke in-game on-screen keyboard**, drawn on our own canvas rather than summoned from the
  OS, so we control the layout and never lose the prompt. Solves blocker 1 completely, and
  **leaves blocker 2 entirely unsolved** — it is still thumbs on glass.
- **A different mode for a different goal** — reading/word-recognition, tap-the-letter, card
  collection browsing — explicitly NOT typing practice, and named so a parent is not misled.
  This is the only intellectually honest touch-only product, and it is a new design, not a port.

### ⚠️ Tier B is UNDER ACTIVE REVIEW — the verdict above is a hypothesis, not a conclusion

**Trevor pushed back (2026-09-12):** *"touch typing we can layer in under a new style of game play —
maybe send a product manager and researcher off on how mobile/touch typing could be introduced
without sacrificing the entirety of the game."*

**He is right that the analysis above was too narrow, and it is recorded here as superseded-pending.**
Blocker 2 says glass contradicts the curriculum — but that only holds **if you PORT the curriculum**,
which is exactly the assumption worth challenging. "Layer in a new style of gameplay" is a different
proposition from "make the 25 levels work on a phone," and the two were wrongly collapsed. Note also
that **blocker 1 is genuinely solvable**: a bespoke keyboard drawn on our OWN canvas, rather than
summoned from the OS, removes the occlusion problem entirely.

Two lanes dispatched 2026-09-12 to answer it properly:
- `research/mobile-touch-typing.md` (**arcade-historian**) — the evidence base: does touchscreen
  typing transfer to/from physical typing (in either direction, honestly reported if the evidence is
  thin); fine-motor readiness at ages 4–8; **how real children's literacy apps actually handle touch
  input** (the interesting answer is probably not "a soft keyboard" at all); HCI/occlusion
  constraints; and the key question — **this is a dual reading-AND-typing game, so can the READING
  half be advanced on glass even where the typing half cannot?**
- `docs/specs/mobile-touch-mode.md` (**product-manager**) — the option space and the spec, explicitly
  empowered to OVERTURN the verdict above if the evidence supports it.

**The integrity constraint that governs whatever they land on:** a parent must never be misled into
thinking a glass mode builds touch-typing muscle memory if it does not; and a touch mode must not let
a player "complete" the 25-level curriculum without ever touching a physical keyboard, which would
hollow out the achievement the entire game is built around. *Note the terminology trap both lanes were
told to disambiguate: **"touch typing"** (no-look, home row, ten fingers — what the game teaches) and
**"touch-screen typing"** (thumbs on glass) are different skills, and conflating them is how this
decision goes wrong.*

**SPEC'D 2026-09-12 → `docs/specs/mobile-touch-mode.md`.** The product-manager lane **partially
overturns** the Tier B analysis above.
**Upheld:** Tier A is the honest win, and the 25-level curriculum never goes to glass.
**Overturned:** Tier B was given ONE verdict over UNLIKE surfaces. This is a **dual** game (type AND
read) — the typing half is keyboard-bound, **the reading half is not**, and two already-shipped
surfaces live entirely in the reading half: the **collection gallery** (read-only) and Act 6's
**maker** (`js/textworld/maker.js`, whose input is already a fixed 12-word allowlist and whose scene
renderer is input-agnostic). A blanket verdict concluded "near-disqualifying" for surfaces where the
keyboard is *irrelevant*.

**Recommended:** **Phase 0** Tier A layout tuning (now, independent); **Phase 1** read-your-cards on
glass, behind the existing touch notice, shown only when the device already holds a save; **Phase 2**
the maker on glass with word-tiles — the actual "new style of gameplay" — **gated on**
`research/mobile-touch-typing.md`.

**Permanent NO:** a rendered QWERTY keyboard, the curriculum, Free Play, card *collection*, the L25
coda, and the IM-friend on glass. The keyboard rejection rests on a **new, evidence-free argument
stronger than the pedagogy one**: every hint surface in this game is designed to **fade** (the
fog-of-war keyboard guide, the one-time finger diagram, the maker's self-fading palette, hints only
after a miss) — and a rendered keyboard is the one surface that **cannot** fade, because it is
simultaneously the hint and the input device. That is a design contradiction, not a trade-off.
(Secondary: a 10-key QWERTY row at ~390 CSS px yields ~39px keys, under WCAG 2.2 SC 2.5.5's 44×44,
for a five-year-old.)

**The guardrail — a one-way membrane (INV-TM1):** touch mode READS `kk-slots` and **never writes it**
— not `furthestLevel`, `completed`, `nameMoment`, `textWorlds`, cards, `cardRotation` or
`storyRotation`. A byte-comparison of `kk-slots` across any touch session is identical, making it
*structurally impossible* to advance a level, complete an Act 6 world, or collect a card on glass.
You EARN at the keyboard, you READ on the glass (INV-TM2). **Deliberately NOT given an Act number:**
Acts 6+ are post-graduation wings for players who finished the keyboard; this is for someone who
cannot reach it, and must never inherit "you finished the game" semantics.
Parent-facing copy is specified verbatim and made unsuppressible (INV-TM6), with forbidden phrasings
listed. 10 candidate invariants (INV-TM1…TM10) and **8 decisions for Trevor** in spec §13 — including
**a terminology check worth answering first**: "touch typing we can layer in" is ambiguous, and the
lane resolved it toward *touch-DEVICE experience* rather than no-look home-row typing (which the game
already teaches). If the other reading was meant, the spec is the wrong document.

**Residual risk stated honestly rather than papered over:** dilution by substitution — a parent
handing over the iPad *instead of* the keyboard. Only partly mitigable (honest copy, plus keeping the
glass surface deliberately SMALLER than the keyboard game so it reads as a companion, not a
destination).

**⚠️ Cross-doc correction owed.** §2's in-browser-LLM row reasons from *"the game is not playable on
mobile anyway … mobile users are not addressable players."* If any phase of the touch spec ships,
that premise is no longer true as written and must become *"the 25-level **curriculum** is not
playable on touch-only."* The reach *conclusion* is unaffected (touch mode has no LLM surface), but
the premise rots — flagged by the PM lane rather than left to rot silently.

**Research landed 2026-09-12** (`research/mobile-touch-typing.md` + 6 `research/wiki/pedagogy/`
pages) **and the spec was revised against it the same day. Phase 2's evidence gate is MET:**
selection-based word building on a tablet **matched pencil-and-paper on word reading and word
writing** in ~145 five-year-olds (Mayer et al., *Frontiers in Psychology* 10:3054, 2020) — and
note the SHAPE of that result, because it is the design answer: the tablet condition that did
worse was the one **imitating handwriting**; the one that let children **select** letters did
fine. **Six of six** established children's literacy apps use **zero soft keyboards** — all are
Montessori **movable-alphabet** variants (Osmo Words literally reads physical tiles off the table
through the camera) — now the design spine of the maker-on-glass phase.

Phase 2 is justified on **reading and spelling alone**. Glass→physical transfer has **never been
studied**, so *"builds toward keyboard typing"* / *"gets them ready for a real keyboard"* is
**permanently forbidden copy**, enforced by INV-TM6's static scan. The canvas-QWERTY rejection is
now three independent grounds: it **cannot fade**, it **does not physically fit** (NN/g's ≥2cm
child touch targets need ≥20cm of width; an 11-inch iPad is 179.5mm), and **ten-finger training
buys nothing on glass** (Aalto/Cambridge/ETH, 37,370 users). **Speech input newly ruled out** —
13.93% WER on grades 3–5 vs 3.05% for adults; a mic that mishears a five-year-old is a One Rule
hazard with no mitigation.

*Worth recording that the PM lane corrected itself twice, in writing rather than quietly:* it
**withdrew its own look-down-harm hypothesis** ("retracted, not merely unproven — do not repeat
it"), and **softened its own verdict on letter tiles** once the research showed the movable
alphabet is the category norm (now deferred on scope, not evidence). It also recorded that the
"bridge to the keyboard" theory was **tested and killed**, not quietly dropped.

**Context worth keeping:** US Common Core's first measurable keyboarding outcome is **W.4.6,
grade 4 (~ages 9–10)** — older than every child this game targets. Keystroke Kingdom is not
catching up to a standard; it is ahead of one.

**⚠️ NEW open design question (spec §13, decision 5b):** the never-punish feedback contract is
written for **keypresses**. **Touch misses are a different error class** — holdovers, fat-finger,
drift — and children miss targets more than adults, youngest worst. INV-TM7 states the
requirement (no punishment, tile stays, gentle nudge) but deliberately **not** the mechanism.
This is the One Rule on new hardware, and it is Trevor's call, not a builder's default.

**Open question for Trevor:** is Tier A worth scheduling now (small, real, unlocks every iPad in
the house), and is Tier B a permanent non-goal we should state publicly rather than leave as
"not yet"? The README and `visual-validation.md` currently say mobile/touch is out of scope and
unverified — that is accurate, but "not yet" and "never, on purpose" are different promises.

*Cosmetic, found while capturing the notice: at ~390px wide the title screen's
"PRESS R TO REBOOT CABINET" hint wraps awkwardly. Pre-existing, trivial, Tier-A work.*

## 3 — Tech debt & polish (discovered this session)

### Security-review findings — 2026-09-11 (the review the L25 coda wave owed)

*Verdict: 3 confirmed, 3 plausible. **No XSS, no code execution, no PII leak.** Every confirmed
finding is a safety-promise / single-source-of-truth gap, not an injection bug. Full report:
the SECURITY lane's `REVIEW.md`. Clean results worth recording: rules 1/5/11 grep checks return
empty; all 15 DOM sinks in js/ trace to codebase literals except `hud.js:300` (F4); the three
fetch sites are all relative same-origin `/api/*`; `playerName` appears in NO request builder;
`kk-stories` honors every rule-4/rule-8 claim line by line; `sanitizeAvoidList` is symmetric.*

- ~~**F1 — CONFIRMED, kid-safety.**~~ **✅ FIXED 2026-09-11.** The wordgen blocklist is a SECOND hard-coded copy and has drifted.**
  `.claude/rules/security.md` rule 7 asserts the blocklist lives in ONE file (`js/word-blocklist.json`)
  with "no hard-coded copy in either language." False: `main.go:877` `var blocklist = []string{…}`
  is consumed by `isBlocked` (~main.go:785), the **only** gate on `/api/wordgen` generated words.
  Seven floor words are absent from it and not caught by its substring rule — and all are spellable
  well before the end of the curriculum:
  `whiskey` L9 · `liquor` L10 · `murder` L11 · `vodka` L11 · `bitch` L13 · `suicide` L13 · `booze` L15.
  The client is no backstop: `js/wordgen.js` `takeWords()` applies a charset re-check and nothing
  else (no blocklist import at all). Note `main.go` ALREADY loads the JSON correctly for the *chat*
  path (`loadChatWordBlocklist`) — wordgen simply never got switched over.
  **FIX (verified independently by the orchestrator, not just reported):** `isBlocked` is now the
  UNION of the single-source floor (`chatWordBlocklist[w]`, exact-match on the whole word AND on
  each letter-token so `zig-vodka` can't smuggle one through) OR the pre-existing substring layer.
  The Go literal was NOT deleted — it was renamed `wordgenSubstringExtras` and documented as what it
  actually is: an **additive** substring layer, not a copy. It was proven to uniquely catch 16 words
  absent from the floor (`ass`, `crap`, `butt`, `fart`, `poop`, `pee`, `hate`, `war`, …) plus
  inflections an exact-word floor structurally cannot (`killing`, `guns`, `deadly`). The key insight
  worth keeping: **substring matching is only safe on a single generated word, never on prose** —
  "hello" contains "hell" — which is exactly why the coda/chat path uses exact-word matching and the
  wordgen path can afford substrings. Client backstop added in `js/wordgen.js` `takeWords()` via
  `hasBlockedWord` imported from `./word-blocklist.js` (the same single source, same idiom
  `js/keyboard-story.js` uses — no second list hand-rolled). Before/after proof was taken by
  compiling `git show HEAD:main.go` standalone, not asserted from memory: all 7 words `false`→`true`.
  Orchestrator re-verified in-package: 7/7 floor words blocked, 4/4 substring extras retained.
  **New regression gate `blocklist_sync_test.go`** (6 tests) pins floor-coverage for BOTH consumers,
  compound smuggling, extras retention, and fail-closed behavior — its absence is why the drift
  survived undetected.
- **F2 — CONFIRMED, needs Trevor's decision. The parent BLOCKED WORDS promise overstates its reach.**
  The settings screen says *"WORDS YOU ADD HERE NEVER APPEAR IN THE GAME."* In fact
  `settings.blockedWords` is enforced at exactly ONE site (`js/keyboard-story.js:299`) — LLM-generated
  L25 coda sentences. NOT the Act 6 IM-friend, NOT wordgen, NOT the curated static pools. Repro A: a
  parent blocks a word that appears in a `STATIC_STORIES` base — `buildStoryPool` appends the static
  bank WITHOUT `validateGeneratedStory` (deliberately, it is the winnability floor), so the word is
  still served. Repro B: the word appears in an IM-friend reply — the server never receives the parent
  list (correct, rule 6) and `imfriend.js`/`chat.js` never call `hasBlockedWord`.
  **Two honest options, Trevor's call:** (a) narrow the on-screen promise to something true
  ("stories the game makes up"), or (b) extend enforcement to chat replies and curated pools —
  **which requires a winnability fallback**, because filtering a curated pool could otherwise empty
  it and strand a level, a One Rule violation. Per `.claude/rules/testing.md` rule 1 this is a design
  conversation, so no code moved.
- **F3 — CONFIRMED, record integrity. ✅ RECONCILED 2026-09-11** — §2's coda row said the review was
  still owed while commit `797c95c` claimed "clean under two /security-review passes." The
  2026-09-11 review is now the authoritative record and §2 has been updated.
- **F4 — PLAUSIBLE (not currently exploitable). `js/ui/hud.js:300-307` interpolates pattern tokens
  into `innerHTML`.** Safe TODAY only because `lineToTokens` splits to single chars matching
  `/^[A-Za-z .,'-]+$/`, so `< > " &` cannot occur. It becomes stored XSS the moment anyone widens
  the charset or introduces a multi-char token — **notably the still-unbuilt free-type L25 variant
  (§2)**, where a crafted `kk-stories` entry would fire on every L25 play. Harden `renderPrompt`
  with `createElement`+`textContent` (the idiom `renderSlotsScreen` already uses) BEFORE that
  feature is built.
- **F5 — PLAUSIBLE. `avoid=` prompt-nudging.** `sanitizeAvoidList` correctly runs the full inbound
  chain (charset, 120-byte cap, blocklist, word width, capped at 12), so rule 7 symmetry holds and
  output is still forced back through charset+pangram+blocklist+length on both sides. Residual: the
  allowlist permits ordinary English, so a crafted `kk-stories` entry can nudge the prompt. Requires
  local localStorage write access — strictly weaker than editing the page. Optional hardening: send
  only the STATIC bases (codebase literals), which is where the measured yield came from anyway.
- ~~**F6 — PLAUSIBLE. Both blocklist loaders fail OPEN**~~ **✅ FIXED 2026-09-11.** (Original finding: on a malformed-but-parseable JSON.** A renamed
  key or `"words": []` leaves `chatWordBlocklist` empty (→ `chatOutputOK` returns true for
  everything) and `BASE_WORDS` empty (→ `hasBlockedWord` always false). The safety floor silently
  vanishes at runtime for chat AND the coda. A *missing* file fails closed (go:embed won't compile;
  the JSON import fails module load) — only the malformed case fails open. Currently mitigated only
  by build-time tests. Fix: refuse to serve generated content when the loaded set is below a sanity
  floor.) **FIX:** added `minSafetyFloorWords = 10` + `safetyFloorLoaded` + `safetyFloorReady()`.
  `loadChatWordBlocklist` now REFUSES a parseable-but-gutted file (`{"words":[]}`, a 1-word list,
  unparseable JSON) instead of installing it. With no sane floor, `validateWords` returns nil (the
  server serves zero generated words → the client plays its static pools) and `chatOutputOK` returns
  false (chat swaps a safe line; coda sentences drop → static story bank). **Every fail-closed path
  lands on the always-available static content, so winnability is untouched** — the One Rule floor
  holds even when the safety floor is refused. The shipped file has 31 words, ample headroom for a
  legitimate edit.
- **DISCHARGED:** the BLOCKED WORDS editor review that security.md rule 7 explicitly demanded before
  that control shipped. It shipped in `797c95c`; reviewed 2026-09-11 and found **clean** —
  sanitized on both sides, `maxlength=20`, chips built with `createElement`+`textContent`, status via
  `textContent`, count-only settings row, Escape always exits. An `<img src=x onerror=…>` paste
  reduces to the inert text `imgsrcxonerror`.

### Found 2026-09-11 (pre-existing, surfaced by the swarm — not caused by it)

- ~~**Gate: narrow the "no framework" tenet for graphics**~~ **✅ APPLIED 2026-09-12.** The Act 7 PM
  lane correctly **refused to edit `.claude/rules/tech.md` / `CLAUDE.md` itself** and escalated instead,
  citing `testing.md` rule 1's ordering (*the design doc moves FIRST, with sign-off, then the feature*).
  Trevor's *"a new graphics rendering library… should be ok"* is that sign-off, so the docs now carry the
  **narrowed** exemption — deliberately narrower than what was authorised: **graphics rendering only,
  never the engine**; vendored ESM under `js/vendor/<name>/`; **no build step** (Pages serves the repo
  root with no bundler); **no CDN** (security.md rule 6); repo-relative imports only (never root-absolute
  — journal F26); in the static-host-check graph at 200 in BOTH host shapes; LICENSE committed; payload
  stated; and **always additive to a Canvas-2D fallback**. `tech.md` Stack table + `CLAUDE.md` §Stack.
  **No vendored byte has landed and none should until Trevor confirms the backend choice (Q10).**

### Act 7 `/security-review` — 2026-09-13 (the review the build owed)

*Verdict: **2 confirmed, 2 plausible — all four FIXED same day.** **The Act 7 wing itself is
clean**: no DOM sinks, no dynamic code, **zero network calls**, no PII, and the player name never
enters `js/speedway/**` at all. The one high-severity finding was not in Act 7.*

- **F1 — CONFIRMED, HIGH, kid-safety. ✅ FIXED.** The 2026-09-12 substring removal (Trevor's
  correct call — *"'altitude' isn't 'tit'"*) **reopened the COMPOUND PROFANITY class**, which
  `expandBlockedForms` structurally cannot reach because it only appends SUFFIXES. Reproduced
  against the real `validateWords`: the generator served **`asshole shithead bullshit
  motherfucker dickhead dumbass pornography nazism warzone`** — and the client backstop caught
  none of them either, so **both layers were open**. **Fix: a two-tier matcher.** The principle is
  not "substrings are bad" but **"substring matching is safe ONLY for strings with no innocent
  English occurrence"** — `fuck`/`shit`/`cunt`/`porn`/`nazi`/`slut`/`whore`/`piss`/`bitch` match as
  substrings; everything whose letters appear inside ordinary words stays exact+inflection with
  compounds enumerated in the floor (41 → 53 words). **`rape` and `cock` are deliberately NOT
  hard-core** — `grape`/`drape`/`scrape` and `cocktail`/`peacock`/`cockpit` are words a child
  should learn. Verified both directions: 30 unsafe blocked, 42 innocent free.
  **Two new pinning tests**, because the absence of one is why this gap survived the first fix.
  *Scope honesty from the review: inert on the static host (no backend), and Act 7's curated bank
  was verified clean — 173 words, 0 unsafe.*
- **F2 — CONFIRMED, LOW. ✅ FIXED.** `kit.js` set the `inFrame` re-entrancy latch **before** the
  buffer/pen work, which sat outside the try/finally — so if `getBuffer` threw (a null 2D context
  suffices) the latch stuck `true` and every later frame threw "not re-entrant" forever. Because
  `track.js` swallows render throws by design (a broken scene must never trap a player), the
  visible symptom was a **silently frozen track for the whole session**. Latch now released by the
  same `finally` as the guard.
- **F3 — PLAUSIBLE, LOW. ✅ FIXED.** `words.js basePool()` used unguarded bracket lookups, so a
  track id of `constructor`/`toString` would resolve to an inherited `Object.prototype` member and
  return a function as a word pool. Not reachable today (ids are authored) but a data-driven
  registry is exactly where it would be. Now `hasOwnProperty`-guarded, matching `slots.js`.
- **F4 — doc drift in brand-new code. ✅ FIXED.** `words.js`'s header claimed `speed`/`cockpit`/
  `warm`/`forward` were blocked by the substring layer — **false since the previous day**, and
  `blocklist_sync_test.go` now asserts the opposite. The L41 failure class, 24 hours old. The stale
  claim is left *visible* and struck rather than silently deleted, because believing it would lead
  a future author to design around a constraint that no longer exists.
- **✅ AFFIRMATIVELY CLEARED, with evidence:** the **canvas guard never leaves the shared 2D
  context mutated** — nine adversarial scenarios (throwing renderer, tripwire fire, same-kit
  re-entrancy, two interleaved kits, inner-kit throw, buffer-allocation failure) all leave the
  own-property list empty and `__kkGuard` absent. **Storage passes rules 4 and 8**: ~30 malformed
  inputs all degrade to "no ghost", nothing throws, **prototype pollution independently verified
  absent** (`__proto__` regex-rejected; `constructor`/`prototype` land as inert own props), caps
  hold (200 seeded tracks read back as exactly 14), worst case **9,867 B/slot** so the `MAX_MS`
  raise stays inside budget. The themed 404 **reflects nothing** (verified empirically against the
  built binary — the payload appeared 0 times). `ghost.js` genuinely has no second validator.

- ~~**The wordgen blocklist over-blocked ordinary vocabulary via substring matching**~~
  **✅ FIXED 2026-09-12 (Trevor).** *"the substring layer catches 'tit' … but 'altitude' isn't 'tit'
  and it shouldn't be caught — only the word exactly 'tit' or the plural form … should."*
  **He is right, and it was a defect rather than a conservative trade.** `main.go`'s `isBlocked` used
  `strings.Contains`, so any word merely CONTAINING a blocked string was rejected. Verified casualties
  (measured in-package, not assumed): **`altitude`** (via `tit` — al-**tit**-ude), `attitude`,
  `latitude`, `compass`, `mass`, `class`, `assist`, `assembly`, `passenger`, `passing`, **`speed`**,
  `speedway`, `speedometer`, `airspeed`, `title`, `titanium`, `competition`, `forward`, `award`,
  `warm`, `steward`, `cockpit`, `chassis`, `scrap`, `diesel`, `warning`, `shell`. Two acts' worth of
  on-theme vocabulary — **`altitude` is the single most on-theme word in the proposed flight act, and
  `speed` in the racing act.**
  **A test had even written the defect down as a requirement:** `main_test.go` asserted `shell` must
  be blocked, with the comment *`// "shell" contains "hell"`*.
  **The fix:** matching is now **exact word + generated inflections** (`expandBlockedForms` — plural,
  -ed/-ing/-er/-y/-ly/-ful/-ness, silent-e drop, CVC doubling, y→ies, and ie→y so `die`→`dying`, which
  a real test caught rather than anticipation). Compound smuggling is still stopped by matching each
  letters-only TOKEN (`zig-vodka`) — tokenization, not substring matching.
  **The safety floor did not shrink — it got more honest.** The words the substring rule had been
  catching only *incidentally* were audited and the genuinely-unsafe ones added EXPLICITLY to
  `js/word-blocklist.json` (`assassin`, `assassinate`, `harass`, `warfare`, `warhead`), along with
  **pre-existing gaps the substring rule never caught either** (`molest`, `bastard`, `bugger`,
  `stupid`, `idiot`) — floor 31 → 41 words. Verified: 80+ unsafe forms still blocked, 30 innocent
  words freed. `TestIsBlockedKeepsSubstringExtras` renamed and rescoped, and now asserts the
  counterpart invariant — *innocent words containing a blocked string must PASS* — so substring
  over-blocking cannot silently return.
  **Note the client was already correct:** `js/word-blocklist.js` is exact-word only and its own
  comment already said *"a substring match would over-block innocent words."* Only the Go wordgen
  path was wrong. **Consequence for both new acts: the "use a static bank, generation can't say
  `speed`/`altitude`" workaround in the Act 7 spec and the flight research is now UNNECESSARY** —
  both specs should be revised.

- **Select-screen door registry — an Act 7 PREREQUISITE, useful even if Act 7 slips.**
  `js/ui/cabinet-art.js` hard-codes exactly ONE back-wall door: `state.doorFocused` is a boolean,
  `renderDoorView()` writes the literal `'THE GREEN DRAGON · a text world'`, and `navigateAct()`
  returns early because the door "is the last thing here." Generalize to a `BACK_WALL_DOORS`
  registry + `state.doorIndex` **before a second wing lands**, so Acts 8/9 are a data row rather
  than another edit to the same function. Spec: `docs/specs/act7-speed-racing.md` §5.0.
- **The 7 automotive history cards should go into the EXISTING level pools now** — independently of
  whether Act 7 is ever built. `flag` L5 · `volt` L11 · `regen`/`brake` L12 · `bertha` L12 ·
  `seatbelt` L12 · `record` L13 · `zoox` L15, each with earliest-typeable level computed,
  citation-verified, and draft ≤160-char copy already written (`research/automotive-vocabulary.md`
  §8). They pre-seed Act 7's vocabulary. **Act 7 itself awards NO cards in v1** — doing so would
  inflate the "★ found / total" denominator with cards unreachable until L25 *and* the door.
- **Ghost-car / time-trial lineage has NO research page.** Act 7's core loop is the ghost, and
  `research/racing-games-by-era.md` does not cover where ghost cars came from. If any player-facing
  text ever tells that story it needs a citation-verified **arcade-historian** pass first — never
  written from memory.
- **⚠️ Act 7 does NOT inherit the sacred wrong-keypress contract for free.** Like Act 6, it is a
  parallel input path that never routes through `js/main.js`'s pattern engine — so
  `js/speedway/track.js` must **re-implement** "wrong key → gentle nudge, letter STAYS and waits,
  logged quietly, correct key advances with no double penalty", and its tests must cite **INV-1..5
  directly**, not Act 7's own invariants. **Two implementations of one sacred contract is the
  structural cost of a parallel wing**, and it is the single thing to review hardest in this build.


- **⚠️ DEFERRED BY TREVOR — a graphics-fidelity audit of the existing 25 levels** *(2026-09-12)*.
  Trevor: *"really we should do this with the existing levels we have put in the game as well since
  some of them aren't fully rastered or textured as they should be — but we can run that audit
  after this is built."* **Explicitly sequenced AFTER Act 7 ships**, so Act 7's rendering work
  establishes the technique first and the audit then applies it backwards.
  Scope when it runs: check every level's theme against its act's documented graphic-quality bar in
  `.claude/rules/levels/act<N>.md` — Act 1 is *meant* to be primitive (1-bit Breakout, 2-colour
  Invaders) and must NOT be "improved", but Acts 2–5 climb (16-colour NES → 16-bit parallax →
  early 3D → modern shaders) and some themes are suspected of sitting below their era's bar.
  Known-adjacent findings already logged: `ff7.js` and `terminal.js` `victory()` return `undefined`
  (the legacy 4s dead-air path — a documented product violation); L20's `PROGRAM n/25` label is
  clipped by the canvas top edge. The audit should also re-check **mechanics fidelity** (STRONG /
  WEAK / NONE per `theme-authoring.md`), since a level rendered at the right fidelity can still
  fail to show its game's signature mechanic operating.


- **Tablet viewports are covered by NO automated check.** `visual-validation.md` excludes
  "mobile / touch / small viewports … entirely" and the README says the same — yet Tier A
  (tablet + a real keyboard) is where the spec recommends starting, and those players exist today.
  Phase 0 of `docs/specs/mobile-touch-mode.md` requires adding tablet portrait + landscape viewports
  to `docs/screenshots/capture-all.js` (via `launchPage(viewport)`), so the theme layout contract's
  reserved/stage fractions — **measured at 1280×800 and assumed landscape-ish** — are actually
  verified where Tier A players live. Folds in the cosmetic ~390px "PRESS R TO REBOOT CABINET" wrap.


- **New follow-ups from the 2026-09-11 close-out:**
  - **`js/themes/highscore.js` — the L24 high-score slot shows the wrong word.** On the "YOU TYPED
    YOUR NAME" completion screen the #1 slot shows whatever word was typed LAST (observed: "Ada"),
    not the player's name. `act5.md` says the name *"appears as a high score entry"* — that is the
    emotional payoff of the whole level. Pre-existing, not caused by the L24 crowding fix. The
    theme should latch the player's name into slot #1 on victory.
  - **`ff7.js` / `terminal.js` `victory()` return `undefined`** → the legacy fixed 4000ms hold,
    which theme-authoring.md calls a product violation for a theme without a real celebration.
    Needs a designed era-faithful celebration, frame-verified from an actually-won run.
  - **Six of the nine new eggs have no capture path** (moth, white rabbit, eighth-key confession,
    themed 404, dial-up chirp, duck hint line). The **confession and the duck line are the two
    worth building** — both deterministic, both would fit `capture-screens.js`.
  - **`js/word-blocklist.json` + `js/word-blocklist.js` route to NO feature page**, despite being
    the single source of truth for the kid-safety floor that three pages describe. Two-line fix:
    add both to `wordgen.md`'s `code:` and regenerate `scripts/feature-map.json`.
  - **`scripts/feature-map.json` schema limit, now worse:** `main.go` is one pattern routing to
    one page but hosts FOUR surfaces (`/api/wordgen*`, `/api/chat`, `/api/keyboard-story`, the
    themed 404) owned by four pages; the easter-egg layer spans six files across five pages.
    Handled by cross-reference tables today; a multi-doc-per-pattern schema would fix it properly.
  - **Optional:** schedule the static-host gate against the REAL published URL (CI only simulates
    the prefix locally). That is the one failure class local simulation structurally cannot see —
    a file that exists locally but was never committed is a live 404 for every player.
  - **Optional:** a per-saved-game latch for the duck hint (currently per page load) would need a
    `seen: {}` map alongside `nameMoment` in `js/slots.js` — a storage schema change, so it would
    carry its own `/security-review`.
- **CORRECTED 2026-09-11:** a close-out report claimed `docs/screenshots/capture-cards.js` was
  still broken. **It is not** — verified by running it (`L13` filter: 6/6 cards captured, exit 0,
  live data reporting 55 cards = 54 pooled + 1 secret). The 2026-07-28 "FIXED" note above stands.


- **`ff7.js` and `terminal.js` `victory()` return `undefined` → 4 seconds of dead air.**
  `.claude/rules/theme-authoring.md` §"Victory must celebrate" is explicit that a `victory()` with
  no return value falls back to a legacy fixed 4000ms hold, and that for a theme without a real
  celebration animation this is *"4 seconds of dead air — a product violation"* against product.md's
  "Level Completion — full celebration sequence — this is the big moment." FF7 does fire
  flashes/shards/camPush but declares no duration; the L20 terminal just pushes two text lines.
  Both need a real era-faithful celebration built and **frame-verified from an actually-won run**
  (code that looks animated but renders identical frames is the documented failure mode). Found by
  the EGGS-ACT4 lane while working in those files; deliberately NOT fixed there, because it needs a
  designed celebration, not a patched return value.
- **`wordprocessor.js` coda text overflowed the page above EXPERIENCE 1× — ✅ FIXED 2026-09-11.**
  `drawText()` computed its wrap width as `fontSize * 0.62`. Press Start 2P is monospace with an
  advance of **exactly 1.0× fontSize** (measured in-browser via `ctx.measureText` on a 20-char run:
  16px/char at 16px, 23px/char at 23px — not assumed), so line length was overestimated by ~61%.
  Invisible at the default tier because the coda's visible text never needs to wrap there; at 1.5×
  and above the document ran past the paper's right edge, slid **under the reserved top-right HUD
  stats region** and spilled off-canvas — a violation of the `visual-validation.md` layout contract.
  Found by the POLISH lane's four-tier capture run, fixed by the orchestrator: the wrap width is now
  MEASURED with `ctx.measureText`, which also stays correct for the `monospace` fallback before the
  webfont loads. **Lesson worth keeping: a magic constant standing in for a text measurement is a
  bug waiting for the first input long enough to wrap.**
- **Cosmetic, pre-existing:** L20's `PROGRAM n/25` label is clipped by the canvas top edge; the
  collection gallery's last card row is clipped by the bottom hint line at 1280×800 with 55 cards
  (not host-specific — identical locally and on Pages).

### Tooling breakage found and fixed mid-wave (2026-09-11)

- ~~**`scripts/kk-playwright.js` pinned a rotted absolute Playwright path**~~ **✅ FIXED 2026-09-11.**
  The shared helper — which `.claude/rules/visual-validation.md` requires every validation script to
  use — hard-coded `~/.npm/_npx/<hash>/node_modules/playwright`, resolving to 1.61.1 whose browser
  revision 1228 was no longer installed (only 1234 / 1.62.1 remained). Every `launchPage()` died at
  `launch()` with an error naming a path, not a cause; three concurrent browser lanes were each about
  to rediscover it independently. Now resolves dynamically: `PLAYWRIGHT_DIR` override → plain
  `require` → npx cache entries newest-version-first, accepting a candidate **only if its browser
  binary exists on disk** (so the failure surfaces at import with a fix hint, not at launch).
  `scripts/wordgen-static-check.mjs` now reuses that one resolution instead of re-pinning its own.
  Proven: `goToLevel(page, base, 7)` → `game-screen`, zero console errors.
  **Still stale elsewhere:** `.claude/rules/visual-validation.md` documents the old absolute path —
  reconcile at close-out.


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
- ~~**Level 24 pattern crowding**~~ **✅ FIXED 2026-09-11.** Four real defects, all confirmed by an instrumented playthrough: (a) the second name injection was spliced at the pattern-list midpoint but L24 wins around pattern 11, so it was **unreachable at 3 of the 4 EXPERIENCE tiers** — "the name twice" was really "the name once plus dead content"; (b) the two guaranteed injections were **adjacent** (drills → ENIAC → Oona → first real word), sandwiching the level's marquee moment; (c) a **lowercase** name could land on the capitals level via the 35% familiar-visitor branch; (d) nothing **win-gated** the name at L24 — it was reached by arithmetic alone, so a card word of ≥15 chars would have silently let "the player types their own name" be won without the player typing their name. Fixed by ordering/proportion only — nothing guaranteed was filtered or dropped: name spliced first-after-drills AND win-gated via `l24NamePending`, card word moved two slots later, the midpoint duplicate replaced by adding the name to the level's own shuffled pool, lowercase visitor suppressed at L24. INV-74. *Honest limit: only ~2–3 of ~11 patterns are the level's own capitalized words; the remaining levers are `WIN_CHARS` in `js/themes/highscore.js` and L24's intro drills in `js/levels.js`.* (Original note: level 24 injects BOTH the player's name (twice) and the
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

- **Does the touch surface get an Act number?** `docs/specs/mobile-touch-mode.md` says **no**,
  deliberately: Acts 6+ are post-graduation wings for players who finished the keyboard; a touch
  surface is for someone who *cannot reach it*, and must never inherit "you finished the game"
  semantics. Relevant to the bonus-act numbering question in §2.

- Should Survival mode ever appear in the child-facing UI, or live behind a "parent" framing?
  (Currently a neutral settings row, defaulted to ADVENTURE.)
- Word banks were AI-curated for early readers — worth a pass with an actual educator or
  against a published decodable-word list?
- Do history cards deserve a sound (paper pickup) and/or a card-flip animation on the
  complete overlay? (Kept minimal in v1.)
- The keyboard-preview screen ("KNOW YOUR KEYS") is skipped in Free Play — should a
  condensed version appear the first time Free Play is ever entered?
