# Agent Swarm Playbook
## Keystroke Kingdom — how we run multi-agent fix/build waves

*Codified 2026-07-11 after three successful waves in one night (journal-debt swarm,
follow-up trio, theme-space rework — 20+ agents, zero file conflicts, zero regressions).
Grounded in journal L8/L9/L15/L27/L29 and O1/O4/O6/O13. Use whenever work fans out to
2+ concurrent agents.*

---

## 0. The Observer / Developer split (Trevor's pattern, codified 2026-07-12)

Every wave has exactly one **Observer** — the session-lead model (Fable, or Opus at
minimum) — and N **Developers** (subagents). The roles never blur:

**The Observer** defines tasks and partitions ownership (§2), embeds scar tissue into
prompts (§3), routes new requirements to the agent that OWNS the file (never a second
agent onto the same file), reviews every report **against artifacts, not prose** (open
the screenshots, ffprobe the video, grep the claim — journal F24: reports can
synthesize success), relays Trevor's mid-flight design direction to running agents
immediately, reconciles docs at close-out (§6), and implements nothing during a wave
except trivial glue it can verify instantly.

**Developer tier selection** (match model to task, not prestige):
- **Opus** — creative/visual design (theme composition, cinematics), deep debugging
  and root-causing, engine or pedagogy-critical changes, anything where the approach
  itself is undetermined.
- **Sonnet** — well-specified mechanical work: refactors with a stated target, doc
  moves with lossless proofs, capture/tooling scripts, audits against explicit ground
  truth, QA sweeps with a test matrix.
- **Haiku** — single-file trivia with binary success criteria (rare here).

**Escalation:** a Developer that stalls twice, returns ambiguity on a well-specified
task, or contradicts the artifacts gets (in order): resumed with sharper synthesis
from the Observer; escalated one model tier; or its scope pulled into the Observer for
direct execution. A Developer discovering something OUTSIDE its scope reports it —
the Observer decides who fixes it (F23 was found by a recorder agent and fixed by a
dedicated engine agent, not by the finder).

**Model VERSIONS matter, not just tiers** (Trevor, 2026-07-12 — verify prices against
the live API docs before relying on them; snapshot as of this date): Sonnet 4.6 and
Sonnet 5 share the $3/$15 per-MTok sticker, but Sonnet 5's tokenizer emits ~30% more
tokens for the same text — so equivalent work costs ~1.3x AFTER Sonnet 5's intro
pricing ($2/$10) ends 2026-08-31; until then Sonnet 5 is net cheaper. Capability also
shifts the math: Sonnet 5 at medium effort ≈ Sonnet 4.6 at high. Practical rule: for
high-volume mechanical lanes where 4.6-level quality suffices, pin the cheaper version;
for the borderline lanes, the newer Sonnet often buys Opus-adjacent quality at Sonnet
cost. Mechanism: the harness Agent/Workflow `model` parameter takes tier aliases only
(sonnet/opus/haiku) — version pinning lives in agent-definition frontmatter
(`model: claude-sonnet-4-6` in .claude/agents/*.md) or settings.json.

## 1. Mine the backlog, don't invent it

Sources in priority order: `docs/journal/entries/` with `status: open` (run
`node scripts/wiki-search.mjs --journal` for the board), `docs/ROADMAP.md` §1/§3,
Trevor's review feedback (terse, precise, contains the compressed root cause — O9;
expect to self-diagnose, not ask clarifying questions). Diagnose the COMMON root cause
before defining lanes — ten symptoms are often one contract violation (L29).

## 2. Partition by disjoint file ownership (L8/O13)

- Every agent gets an explicit "You own ONLY: <files>" list. No two concurrent agents
  share a file. If two tasks need the same file, CHAIN them in one lane (sequential
  agents), don't parallelize.
- The engine (`js/main.js`) is one lane at most, ever.
- Tell every agent other agents are editing other files — transient errors from
  mid-edit siblings are expected; retry once, don't investigate (see O1: agents
  correctly distrust peers' edits; design prompts so they don't need to trust them).

## 3. The standard agent preamble (paste into every prompt)

- Repo path + branch; "dirty working tree, other agents active".
- Hard rules: One Rule / sacred wrong-keypress behavior / no "semicolon" / no
  hard-coded "ENTER" / Survival never default / security conventions from
  `.claude/rules/security.md` (textContent for user-influenced strings, quoted jq in
  hooks, array-arg child processes, no eval) for any lane touching DOM, hooks, or tooling.
- Working rules: do NOT git commit; do NOT run `go build` (shared binary collision);
  do NOT read `.dev-url` (stale embedded assets — this burned an agent for a full
  detour); run YOUR OWN static server on an ASSIGNED UNIQUE PORT:
  `python3 -m http.server <port> --directory <repo>` (L9).
- Tooling: Playwright module path + `scripts/kk-playwright.js` (DEV_URL-aware).
- **Per-agent scratch subdirectory** — assign each agent its OWN subdir under the
  session scratchpad (e.g. `scratchpad/<lane>-vic/`). Concurrent agents writing to a
  shared dir (`vframes/`) clobbered another lane's proof frames, which let a false
  success stand until the video was re-derived (2026-07-13, Mario lane).
- **Recorder output**: `record-playthrough.js` writes into `docs/` by default —
  instruct agents to move outputs to their scratch subdir; `docs/` must stay clean.
- **Video-derived proof only**: an agent's celebration/animation evidence must be
  frames extracted from ITS OWN recorder video of a real engine-driven win — a
  manually-triggered animation in a console-poked page can pass while the real path
  renders nothing (Mario, 2026-07-13; journal L36).
- Relevant scar tissue: paste the applicable journal entries VERBATIM as constraints
  (L16/L17/L28 for canvas work, F1 for animation math, etc.). The journal doubles as
  guardrail text (L27).
- Structured report schema (task/status/files_changed/summary/issues) — "your final
  message is a report for the orchestrator, not the user".

## 3b. Same-host process swarms: cap concurrency at ~5

Agent-count parallelism (disjoint files) and PROCESS parallelism (headless browsers,
ffmpeg) are different budgets. 25 concurrent Chromium+ffmpeg pairs against one static
server drove load-average ~680 and had to be aborted; 5 concurrent × 5 waves finished
all 25 in 9.4 minutes with zero contention failures (L32). Batch heavy process fan-outs
in waves of ~5; the "25-way parallel" recorder recipe is an upper bound on invocations,
not a recommendation to launch them simultaneously on one machine.

## 4. Verification is per-lane AND global

- Every lane validates its own work per `visual-validation.md` before reporting.
- After ALL lanes land: one read-only smoke-verify pass across every level/flow with
  the union of changed files (barrier — it must see everything at once). QA that
  actually TYPES and WINS finds bugs screenshots miss (O4).

## 5. Agent lifecycle expectations (L15/O6)

Agents die (connection drops, stalls, session limits); their work on disk usually
survives. Before re-running anything, diff reality (`git status`, file contents)
against the lost report. Distinguish "work lost" from "report lost".

## 6. The close-out ritual (every wave, no exceptions)

1. `go build -o keystroke-kingdom .` + restart via `scripts/dev.sh` (embedded assets).
2. Regenerate screenshots: `node docs/screenshots/capture-all.js` (doubles as an
   all-levels error smoke). Feature-specific sets have their own scripts — see
   `docs/screenshots/README.md`.
2b. Dispatch the **content-librarian** (.claude/agents/content-librarian.md) with the
   wave's changed game files (the impacted-manifest hook accumulates them in
   `.git/claude-impacted-files`; the doc-currency Stop hook nags if you forget) —
   it refreshes the impacted `docs/features/` pages + their screenshot sets, then
   clear the manifest (`: > .git/claude-impacted-files`).
3. Reconcile `docs/ROADMAP.md`: strike completed items WITH results; add every
   surviving issue from agent reports as explicit follow-ups (nothing lives only in a
   transcript). Update CLAUDE.md quick-map if features changed.
4. Journal genuinely new lessons (`node scripts/wiki-search.mjs --journal` for next
   IDs; `--index` to regenerate views). Mark addressed entries' frontmatter.
5. Nothing is committed until Trevor reviews. If a reference artifact needs refreshing
   (screenshots, `keystroke_kingdoms.mov` via `scripts/record-playthrough.js`), do it
   from the settled tree only.

## 7. In-flight doc markers

If a wave is running when a session might end, leave an "IN FLIGHT" note in ROADMAP
naming the lanes, with a self-invalidating caveat ("if no strikethroughs appear below,
reconciliation was missed — check `git status`"). Replace it with results at close-out.
