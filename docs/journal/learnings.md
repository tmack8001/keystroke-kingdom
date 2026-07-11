# Learnings
*Append-only. What we now know that we didn't know before — technical, design, and process.
IDs are monotonic (L1, L2, …); cross-reference entries as `L#`/`O#`/`F#` (see
[observations.md](observations.md), [failures.md](failures.md)). A Stop hook
(`scripts/journal-hook.sh`) enforces a session entry when meaningful work happened.*

## 2026-07-10 → 2026-07-11 — the Act 5 / graphics / settings / research mega-build (prepopulated)

- **L1 — The Go binary embeds assets at compile time.** Any js/css/html change requires
  `go build -o keystroke-kingdom .` + server restart or you are testing stale code. This
  bit us repeatedly until it became a checklist item. (See CLAUDE.md build gotcha.)
- **L2 — Element opacity destroys contrast by design; scrims preserve it.** The HUD's
  `opacity: 0.5` halved every contrast ratio. The fix that took measured element-contrast
  FAIL from 72.7% → 2.6%: translucent dark scrim panels + full-opacity muted colors.
  "Dim, never looming" is a color choice, not an alpha choice. (→ F3)
- **L3 — On-screen keyboards must mirror physical geometry.** Centered, filtered key rows
  teach a wrong spatial map (E/I floating instead of above D/K). True ANSI staggers +
  key widths + fog-of-war for unlearned keys made the guide pedagogically correct — and
  Trevor spotted the flaw from screenshots instantly. (→ F5, O5)
- **L4 — Guaranteed beats probabilistic for must-see content.** History-card words
  injected at 70% of the pattern list were routinely gated out by early level-wins.
  Fix: inject immediately after intro drills AND gate level-completion on the word
  having appeared. If content matters, make it structurally unmissable. (→ F4)
- **L5 — Citation passes are error-detection, not decoration.** Four research docs
  written from model knowledge contained 9 real errors that read perfectly fluently.
  The pass exists to catch exactly those. Now encoded in `.claude/agents/arcade-historian.md`.
  (→ F6–F9, O2; the wiki itself: [[WIKI]])
- **L6 — Karpathy's llm-wiki scales down gracefully.** At ≤100 pages, index-first
  navigation + zero-dependency BM25 is the right tool (the gist says so itself);
  embeddings are a later, pluggable upgrade. Folder taxonomy + basename wikilinks means
  reorganizing never breaks links (Obsidian shortest-path resolution). (→ L7)
- **L7 — Obsidian table links need escaped pipes** (`[[page\|label]]`) — any tooling
  that parses wikilinks must handle that form or it reports false broken links. (→ F14)
- **L8 — Disjoint file ownership enables massive agent parallelism.** Five build agents
  in parallel with zero merge conflicts because ownership was file-partitioned in the
  spec; features sharing files (Free Play → cards → settings) ran as sequential waves.
- **L9 — Give each validating agent its own static server.** `python3 -m http.server
  <unique port>` per agent lets everyone screenshot/iterate without fighting over the
  real dev server (which stays untouched until final QA).
- **L10 — Registries load at session start.** Hooks (settings watcher), custom agents
  (`.claude/agents/`), and MCP servers all connect when a session begins — same-session
  availability is not guaranteed. Plan for "live next session," verify with a smoke call.
- **L11 — Once-per-session state for Stop hooks lives well in `.git/`** — never
  committed, survives the session, keyed by `session_id` from the hook's stdin JSON.
  The check-then-act pattern needs a post-write verify when parallel writers exist.
- **L12 — This shell is zsh:** bash-isms like `${!assoc[@]}` fail; prefer explicit
  functions/loops in Bash-tool scripts.
- **L13 — Pixel-sampling contrast audits false-FAIL on glow.** Text with big same-hue
  text-shadows measures against its own halo; label-less boxes measure as noise. Strip
  `text-shadow` before sampling or route decorated elements to visual review. (→ O3)
- **L14 — Challenge modes can be additive wrappers.** Survival adds time pressure ONLY —
  wrong keys still just wait, so the pedagogy contract survives inside the opt-in
  challenge. Mercy mechanics (15-streak earns a quarter back) make difficulty kind.
- **L15 — Long-running agents die; their work usually doesn't.** API drops, stalls, and
  session limits killed three agents this build — in every case the files on disk were
  fine and only the final report was lost. Assess repo state before re-running anything.
  (→ F10–F12, O6)

## 2026-07-11 — transcript recon over past sessions (2026-06-22 → 2026-06-25)

- **L16 — Align canvas art to canvas space, not DOM space.** `getBoundingClientRect()` on
  a flex-centered element gave a mid-viewport answer for "where is the keyboard guide";
  the fix that stuck was a canvas-height fraction (`0.82 * H`), like every other theme.
- **L17 — Never place theme geometry at horizontal center.** Anything drawn at `W*0.5`
  collides with the centered letter prompt; edge-anchored elements never do. This bit the
  Joust build three times in one session before becoming a rule.
- **L18 — Reward reliability beats simulation accuracy for a young child.** Physics-true
  Joust flight made kills take 10+ seconds; the shipped feel is strong homing + generous
  hitboxes + mostly-perched targets — type a letter, feel the result within 1–2 seconds.
- **L19 — A punishing mechanic can be saved by changing its trigger, not cutting it.**
  The lava troll conflicted with the One Rule as designed; redesigned to appear only when
  the player is safely away and to flee when approached — "you spooked it," not punishment.
- **L20 — Idle game loops need player-engagement gates.** Vultures died on their own in
  unattended tabs until collisions were gated on a post-keystroke attack window
  (`js/themes/joust.js:368`). Background simulation must not progress the game.
- **L21 — Rule provenance is deliberately layered at three altitudes** (origin:
  2026-06-22 Enter/Return session): CLAUDE.md carries the terse rule, tech.md the
  mechanics, `memory/` the human backstory (Oona's actual confusion) — that's why the
  in-repo `memory/` directory exists.
- **L22 — `.claude/rules/*.md` auto-load; and doc-size refactors should split by concern.**
  levels.md was split semantically (scaffolding reference vs cinematic direction →
  transitions.md) to fit a 40k budget — no CLAUDE.md wiring needed. (→ F21)
- **L23 — Wrapper shrink-wrap defeats `width:100%`.** An anonymous wrapper div under
  `align-items:center` shrink-wraps, so a child's `100%` resolves against overflow width.
  Fix: remove the wrapper and drive size via a JS-computed `--key-size` CSS variable.
- **L24 — Iteratively-rewritten theme files accumulate dead code** (`update2()`, orphan
  consts). End heavy iteration sessions with an explicit dead-code sweep.
- **L25 — Build tooling for scale when the scaling question is asked.** Trevor asked
  point-blank whether capture-all.js would scale; the ACTS_CONFIG single-source refactor
  meant Act 5 later cost exactly one array edit. (→ O9)

## 2026-07-11 — vault/hooks/journal build (session close)

- **L26 — settings.json hook edits take effect immediately when the settings watcher is
  already active** (a settings file existed at session start), refining L10: the
  next-session rule holds for agent definitions and MCP servers, but hooks added
  mid-session fired live — including on their own author, this same session.
