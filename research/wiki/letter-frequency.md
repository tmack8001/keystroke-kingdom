---
title: Letter Frequency (English)
type: concept
tags: [typing-pedagogy, linguistics, history-card]
sources: 3
verified: 2026-07-11
---

English letter frequency, as measured by Peter Norvig's analysis of Google Books Ngrams
(743.8 billion letter mentions), shows **E as the most common letter at 12.49%**, **T
second at 9.28%**, and **Z as the rarest letter at 0.09%**, with **Q the second-rarest at
0.12%**.

## In this game

This dataset is the factual backbone of the rationale in `.claude/rules/levels.md` ("Why
This Order") for teaching E and I early (level 6) — "the two most-used vowels in English,"
unlocking hundreds of real words immediately — and T soon after (level 8) as "the #2 most
common letter." It also supports Keystroke Kingdom's [[touch-typing-pedagogy|curriculum
rationale]] more broadly: high-frequency letters are taught close to home row, and the
rarest letters (Z, Q) are saved for last, matching the intuition that rare letters should
require the most finger-reach investment since they're used least. The same dataset
indirectly shapes which letters show up soonest in Keystroke Kingdom's early word banks —
see [[decodable-word-lists]] for the companion research on which actual *words* (not just
letters) are appropriate for early readers.

**A correction flows from this same dataset.** `.claude/rules/levels.md` describes Q as
"the rarest letter" when introducing level 15 (Z). Norvig's figures show this is
backwards: **Z is actually the rarest letter (0.09%), and Q is second-rarest (0.12%)**.
The line should read "among the rarest" or explicitly note Q is rarest-but-one — Z, not Q,
holds the actual last-place spot, which is consistent with Z being deliberately saved for
the very last letter-key level (15) in Keystroke Kingdom's own progression.

## The facts

- Source dataset: Google Books Ngrams corpus, 743.8 billion letter mentions, analyzed by
  Peter Norvig ("Mayzner Revisited, or ETAOIN SRHLDCU").
- **E: 12.49%** — most common letter in English.
- **T: 9.28%** — second most common.
- **Q: 0.12%** — second-rarest letter.
- **Z: 0.09%** — rarest letter in English (not Q).
- These are letter-occurrence frequencies across running English text, not word-initial or
  Scrabble-tile frequencies — a distinction worth preserving if this data is ever reused
  for a different claim (e.g. word-initial letter frequency differs from this ranking).

## References

1. [English Letter Frequency Counts: Mayzner Revisited, or ETAOIN SRHLDCU — Peter Norvig](https://www.norvig.com/mayzner.html) — primary source; exact percentages for all 26 letters. *(Directly fetched and verified.)*
2. [Natural Language Corpus Data — Peter Norvig (norvig.com/ngrams)](https://norvig.com/ngrams/) — companion page on the underlying Google Books n-gram dataset and methodology.
3. [Data Mining: New Research From Google's Peter Norvig… — Library Journal infoDOCKET](https://www.infodocket.com/2013/01/09/data-mining-google-researcher-finds-most-used-english-words-letters/) — independent journalistic summary corroborating the findings.
