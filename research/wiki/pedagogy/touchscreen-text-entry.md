---
title: Touchscreen Text Entry (and what transfers from physical keyboards)
type: concept
tags: [typing-pedagogy, hci, touchscreen, mobile]
sources: 9
verified: 2026-09-12
---

Typing on glass and touch typing on a physical keyboard are two different motor skills that
share a linguistic layer. The largest study of mobile typing (37,000+ volunteers, Aalto /
Cambridge / ETH Zürich) found **no benefit from formal ten-finger touch-typing training when
people type on a smartphone** — mobile typing is a self-taught thumb skill. What *does* look
shared is the level above the fingers: skilled typists show the same hand-alternation and
bigram-frequency signatures in two-thumb mobile typing as in touch typing. The practical
reading: **spelling/word knowledge crosses between the two; home-row muscle memory does not.**

## In this game

Keystroke Kingdom teaches [[touch-typing-pedagogy|touch typing]] — ten fingers, home row,
eyes off the hands. This page is the evidence base for the 2026-09-12 question *"could
Keystroke Kingdom introduce a touch/mobile mode without sacrificing the game?"*
(hub: `research/mobile-touch-typing.md`). The finding that matters for that decision is that a
glass mode **cannot honestly be sold as touch-typing practice** — but it can be honest about
teaching the alphabet, spelling, and word-building, which is half of what this game already
does (see [[movable-alphabet]] and [[childrens-literacy-apps]]). See also
[[keyboarding-readiness]] for why our 4–8-year-old player is below the age at which formal
keyboarding instruction usually begins anyway.

## The facts

- **Mobile typing, at scale.** Palin, Feit, Kim, Kristensson & Oulasvirta (MobileHCI 2019)
  collected transcription data from **37,370 volunteers**. Average speed **36.2 WPM** with
  **2.3% uncorrected errors**. **Over 74% typed with two thumbs**, which is significantly
  faster than one thumb or one index finger. Two-thumb typists averaged **38 WPM**, which
  Aalto describes as "only about 25% slower than the typing speeds we observed in a similar
  large-scale study of physical keyboards."
- **No transfer from ten-finger training → thumbs.** The same study "found no benefit from
  formal training on traditional ten-finger typing systems when applied to touchscreen
  typing." Oulasvirta: *"This is a type of motor skill that people learn on their own with no
  formal training"* — and, notably, he raises as an open question *"what could be achieved
  with a careful training program for touchscreens."* **No one has shown that such a program
  exists or works.** That is an opportunity, not a finding.
- **Direction matters.** The Aalto result is about *physical → glass*. We found **no study
  testing glass → physical** for children (or anyone). Claiming that thumb practice builds
  toward touch typing is, as of this pass, **unsupported in either direction** — see
  Corrections.
- **What does appear shared.** Cerni, Longcamp & Job (Acta Psychologica 167, 2016, 16–23)
  compared skilled touch typists typing on a phone with two thumbs vs one index finger. In
  two-thumb mobile typing, **manual alternation was faster than repetition** (the classic
  touch-typing signature) and **bigram frequency affected inter-keystroke intervals the same
  way** as on a physical keyboard. One-index typing showed neither. Read carefully: this is
  evidence that the *language-production* layer is shared, not that the finger mapping is.
- **Age effect, and the number that gets garbled.** Aalto reports people aged **10–19 typed
  roughly 10 WPM faster** than people in their 40s. A French-government (Labo) summary of the
  same study renders this as "about 10 times faster," which is wrong — see Corrections.
- **Flat glass with ten fingers is genuinely hard.** Findlater, Wobbrock & Wigdor, *"Typing on
  flat glass: examining ten-finger expert typing patterns on touch surfaces"* (CHI 2011, pp.
  2453–2462; a CHI best-paper) had 20 expert typists type on a flat surface with and without a
  visible keyboard. Their conclusion is cautiously positive — key-press distributions are
  *spatially consistent within an individual*, so eyes-free glass typing is conceivable — but
  it requires per-user adaptive keyboards, and **hand drift** (hands wandering up and left with
  no tactile anchor) is a persistent problem. *Abstract-level only: the PDFs were not
  machine-readable by our tooling.*
- **The missing landmark.** A physical keyboard gives the index fingers tactile homing bumps on
  F and J; glass gives none, and fingers cannot rest on a soft keyboard without triggering it.
  ISO/IEC 9995 is the keyboard-layout standard family in which home-key tactile identifiers are
  specified; we could not fetch the paywalled clause, so this page states only the observable
  functional fact.
- **On-glass typing trainers do exist as a product category.** *TapTyping* (iOS) teaches finger
  placement for the on-screen keyboard, shows a heat map of where fingers land, and tracks WPM —
  and is "fully compatible with external and bluetooth keyboards." Existence is not efficacy: we
  found no peer-reviewed evaluation of any glass-typing trainer.

## References

1. [Mobile typing — typing37k project page, Aalto University](https://userinterfaces.aalto.fi/typing37k/) — 36.2 WPM average, 2.3% uncorrected errors, >74% two-thumb, "with only 1 or 2 fingers, people type about 70% as fast on mobile devices as on full desktop keyboards", 10–19 fastest. **[fetched 2026-09-12]**
2. [Smartphone typing speeds catching up with keyboards — Aalto University news](https://www.aalto.fi/en/news/smartphone-typing-speeds-catching-up-with-keyboards) — two-thumb 38 WPM ≈ 25% slower than physical keyboards; "no benefit from formal training on traditional ten-finger typing systems"; 10–19 ≈ 10 WPM faster than 40s; Oulasvirta quotes. **[fetched 2026-09-12]**
3. [How do People Type on Mobile Devices? Observations from a Study with 37,000 Volunteers — ACM DL (MobileHCI '19)](https://dl.acm.org/doi/10.1145/3338286.3340120) — the peer-reviewed paper of record. *(search result only, not fetched — ACM DL returns 403 to our tooling)*
4. [How do people type on mobile devices? — Aaltodoc repository record](https://aaltodoc.aalto.fi/handle/123456789/41198) — institutional repository copy. *(search result only, not fetched)*
5. [Touchscreen typing speed catches up with physical keyboards — Labo, Société Numérique (French government)](https://labo.societenumerique.gouv.fr/en/articles/the-speed-of-fragging-on-tactile-screens-is-catching-up-on-physical-keyboards/) — independent summary: 38 WPM two-thumb, 25% gap, "no particular advantage to having been trained to type on a physical keyboard." Also the source of the garbled "10 times faster" age claim. **[fetched 2026-09-12]**
6. [Two thumbs and one index: A comparison of manual coordination in touch-typing and mobile-typing — Acta Psychologica 167 (2016) 16–23 (Cerni, Longcamp & Job)](https://www.sciencedirect.com/science/article/abs/pii/S0001691816300518) — alternation-faster-than-repetition and bigram-frequency effects appear in two-thumb mobile typing. *(search result only, not fetched — 403)*
7. [Corrigendum to "Two thumbs and one index…" — PubMed record](https://pubmed.ncbi.nlm.nih.gov/32151336/) — confirms the citation (Acta Psychologica 167, 16–23, 2016). *(search result only; PubMed served a cookie wall)*
8. [Typing on flat glass: examining ten-finger expert typing patterns on touch surfaces — dblp record (Findlater, Wobbrock & Wigdor, CHI 2011, 2453–2462)](https://dblp.org/rec/conf/chi/FindlaterWW11.html) — citation of record. *(search result only, not fetched — bot-protected)*
9. [TapTyping – typing trainer — App Store listing](https://apps.apple.com/us/app/taptyping-typing-trainer/id376526006) — an on-glass typing trainer; finger heat map; "fully compatible with external and bluetooth keyboards." **[fetched 2026-09-12]**
