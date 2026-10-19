---
id: L50
kind: learning
title: A citation pass checks VALUES, not CONNECTIVES — every number was right and the conclusion was still false
found: 2026-09-18
session: 2026-09-18 open-decisions pass
status: adopted
importance: high
category: research-integrity
refs: [L49, F31, F7]
---

## What happened

`docs/specs/browser-llm.md` recorded Chrome's Prompt API hardware gate as:

> **>4 GB VRAM**, 16 GB RAM, 4+ cores, and **≥22 GB free disk**

and reasoned from it that the feature *"rules out most integrated-GPU laptops"* — which fed a
product recommendation, a risk rated High, and a reach estimate.

Trevor read it and said: *"do we really need that much ram to be able to use the built in chrome
Gemini nano model insane."*

He was right. Chrome's own words, fetched and verified twice:

> **"GPU or CPU: Built-in models can run with GPU or CPU."**
> GPU: *"Strictly more than 4 GB of VRAM."* — **OR** — CPU: *"16 GB of RAM or more and 4 CPU cores
> or more."*

**It is a disjunction.** Either clause qualifies. An ordinary 16 GB laptop with integrated graphics
passes on the CPU clause alone — and that clause exists *precisely* to admit the machines our spec
said were excluded. The 22 GB is **free disk for a one-time download**, not memory, and the model is
*"significantly smaller"* than that.

**Nothing on Google's side had changed.** The source pages predate our research pass. We did not read
a stale page; we flattened an `OR` into an `AND` at transcription time and then reasoned from the
wrong version for a week.

## Why it survived everything

This error passed a citation pass, a spec review, and a correction Trevor made *on the adjacent line*
about reach framing. It survived all of them for one reason:

**Every single number was correct.** `4`, `16`, `4`, `22` — all verbatim from the source. A reviewer
checking the citation checks whether the *values* match the page, and they did. Nobody checked the
*connective*, because a requirements **table** does not have a column for it: prose says "GPU **or**
CPU:" as a parent bullet and the table flattens its children into sibling rows, silently promoting
them to conjuncts.

So the fabrication was not in any cited fact. It was in the **structure between** the facts — and
that structure was the entire decision.

## The lesson

**When you transcribe a requirements list, copy the parent's connector word, not just its leaf
values.** `and` / `or` / `either` / `at least one of` are load-bearing content, and they are exactly
what a table, a bullet list, or a summary sentence discards first.

Two checks that would have caught this, both cheap:

1. **Re-read your transcription as a sentence and ask "is this an AND or an OR?"** If the source has a
   parent bullet above the values, its connector belongs in your version. A table needs a header, a
   preamble, or a `— OR —` row; there is no format in which the connective is optional.
2. **When a requirement sounds absurd, that is a signal about the transcription, not about the
   vendor.** ">4 GB VRAM *and* 16 GB RAM *and* 22 GB disk" describes a gaming PC to run a small
   word-generator — which is what made Trevor stop. Implausibility is evidence. The fastest resolution
   was one fetch.

## Related, and how this differs

- **L49** — a rule scoped to one subsystem applied to another because both said "word". Same family:
  the cited facts were true and the *relationship* between them was invented. That one lost a scope;
  this one lost an operator.
- **F31** — a stale record corroborated a wrong fresh claim. Different: nothing here was stale.
- **F7** — an overstated attribution on a child-facing card. Different: that was a claim nobody had
  checked; this was a claim everybody had checked, at the wrong granularity.

**The transferable form: a citation pass verifies that each value appears in the source. It does not
verify that the SHAPE you assembled them into is the shape the source had.** Those are different
audits, and only the first one is currently a habit in this repo.
