---
id: L53
kind: learning
title: A plausible simplification in a delight egg ("programmers end every line with it") shipped as player text and was copied into four docs
found: 2026-10-31
session: 2026-10-30 semicolon-teaching-beat research
status: adopted
importance: medium
category: research-integrity
refs: [L50, F7]
---

## What happened

The Level 20 eighth-key confession said programmers "END EVERY LINE WITH IT;". The research pass for
the semicolon teaching beat checked it: false. Blank lines, `{`/`}` lines, `if (...)` headers and
comments carry no semicolon, Python programmers almost never type one, and in Pascal it *separates*
statements. The same sentence had been copied into `docs/features/easter-eggs.md`,
`research/hacker-culture.md`, `research/wiki/culture/proposed-egg-references.md` and the eighth-key
wiki page — each citing the others.

It survived because it is exactly the kind of sentence a citation pass skims past (L50): every
*value* in it was fine, the quantifier was the lie.

## What to do

- For a child-facing claim, ask which quantifier it uses (every / all / always) and source *that*.
- Prefer "many ... an instruction" to "every ... line" when the research says so.
- When fixing a false line, grep the docs for its copies — they accumulate (here: three).
