---
id: O19
kind: observation
title: A test agent + live orchestrator edits on the same files = false findings
found: 2026-07-14
session: 2026-07-13/14 Act 6 Text Worlds build
status: adopted
importance: high
category: agent-process
refs: [L15, O1, L40]
---

**O19 — Never dispatch a test agent against files the orchestrator is still editing; it
reports transient broken states as real bugs, then wastes a run.** During the Act 6 build I
dispatched `test-engineer` to test `js/textworld/engine.js` + `main.js`, and then kept
editing those exact files (adding the hub — a whole rewire of `main.js`'s `'textworld'`
handler and the door entry). The agent, testing a MOVING target, caught a half-rewired
intermediate state and reported a **"stuck on the text-world screen, Escape fails"** defect —
a scary One-Rule (can't-escape) claim — before its stream watchdog stalled it out at 600s.
Independent verification against the SETTLED code showed the escape path was completely
correct (world → hub → arcade, two Escapes; proven by DOM assertions + a screenshot of the
live hub). So: **a real-looking, One-Rule-critical finding that was pure concurrency
noise.** This is the swarm-playbook §2 file-ownership rule, but for a NEW pairing the playbook
didn't call out explicitly: the *orchestrator itself* is a writer. Rules that generalize:
(1) a test/QA agent needs a FROZEN tree — finish and self-verify the code first, THEN
dispatch tests, and do not touch game files until the agent returns (do docs/journal work in
that window instead — different files, safe). (2) Distrust a lone agent's finding that
contradicts your own just-verified reality (O1: agents correctly distrust peers' mid-edits —
that includes YOUR mid-edits); re-verify against the settled tree before believing a
scary bug (here: no bug). (3) An agent that STALLS (watchdog, connection) produced no
deliverable — its partial "result" is a mid-investigation note, not a verified finding; treat
it as a lead to check, never as truth. (→ L15, O1, L40)
