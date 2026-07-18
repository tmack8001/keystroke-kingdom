---
id: L27
kind: learning
title: A status-tracked journal is a swarm-ready backlog
found: 2026-07-11
session: 2026-07-11 journal-debt swarm (task definition + launch)
status: adopted
importance: medium
category: agent-process
refs: [L8, L16, L17, O13, F21]
---

**L27 — A status-tracked journal is a swarm-ready backlog.** With per-entry
status/importance/category frontmatter, "mine the journal and dispatch a fix swarm"
reduced to a mechanical recipe: grep open entries + cross-reference ROADMAP tech debt,
partition tasks by disjoint file ownership (L8/O13), chain only the agents that must
share files, and paste the relevant scar-tissue entries (L16, L17, F1…) verbatim into
each subagent prompt as hard constraints. The same entries that record past failures
double as guardrail text for the agents fixing them. Launched as an 8-lane
Workflow (opus for creative/feature lanes, sonnet for mechanical ones) with a
read-only barrier smoke-verify agent receiving the union of changed files. (→ F21,
the one open item, became a swarm lane.)
