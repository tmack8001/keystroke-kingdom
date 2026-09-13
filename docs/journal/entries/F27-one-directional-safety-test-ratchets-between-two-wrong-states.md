---
id: F27
kind: failure
title: A safety filter tested in one direction only — so two "fixes" in two days left it wrong both ways
found: 2026-09-13
session: 2026-09-13 Act 7 build + the owed /security-review
status: addressed
addressed-by: "Two-tier matcher in main.go: hardCoreSubstrings (fuck/shit/cunt/porn/nazi/slut/whore/piss/bitch) matched as SUBSTRINGS because they have no innocent English occurrence; everything whose letters appear inside ordinary words (ass/hell/tit/pee/war/die/gun/cock/dick) stays exact-word + expandBlockedForms inflections with compounds enumerated in js/word-blocklist.json (41->53 words). TestBlocklistCompoundsAndFalsePositives pins BOTH directions (30 unsafe blocked, 42 innocent free); TestHardCoreSubstringsHaveNoInnocentOccurrence pins that no hard-core string over-reaches (grape/drape/scrape, cocktail/peacock/cockpit)."
addressed-date: 2026-09-13
importance: high
category: testing
refs: [F26, L41, L46]
---

**The kid-safety word filter was wrong in one direction, was fixed, and became wrong in
the other direction — inside 24 hours — because each fix was tested only in the
direction it was fixing.**

Day one, the filter used `strings.Contains`. Trevor caught it: *"the substring layer
catches 'tit' … but 'altitude' isn't 'tit' and it shouldn't be caught."* It was
silently rejecting `altitude`, `attitude`, `latitude`, `compass`, `class`, `assist`,
`passenger`, `speed`, `title`, `forward`, `warm`, `shell` — **two acts' worth of
on-theme vocabulary**, including the single most on-theme word in the proposed flight
act. A test had even written the defect down as a requirement: `main_test.go` asserted
`shell` must be blocked, with the comment `// "shell" contains "hell"`.

Day two, a `/security-review` found the fix had reopened the **compound profanity**
class — `expandBlockedForms` only appends SUFFIXES, so it structurally cannot reach
`asshole`, `bullshit`, `motherfucker`, `pornography`. The client backstop is exact-word
over the same floor, so it caught none of them either. **Both layers were open.**

Neither version was carelessly built. Both were tested. **Each was tested only in the
direction its author was thinking about** — the first for "does it block bad words",
the second for "does it stop blocking good words" — and a filter has two failure modes
that are in tension. Testing one direction does not ratchet toward correct; it
oscillates between two wrong states, and each oscillation looks like progress.

The durable fix is the test, not the matcher: **`TestBlocklistCompoundsAndFalsePositives`
asserts both lists in one function**, so neither can be satisfied by sacrificing the
other. The matcher itself just stopped pretending one rule fits all inputs — substring
matching is safe *only* for strings with no innocent English occurrence, which is why
`rape` and `cock` are deliberately **not** in the hard-core set (`grape`, `drape`,
`scrape`, `cocktail`, `peacock`, `cockpit` are words a child should be learning).

Generalizes past blocklists to anything with a precision/recall tension — validators,
sanitizers, spam filters, permission checks, search relevance. **If a change can be
satisfied by moving a threshold, the test must pin both sides of the threshold, in the
same test, or the next fix will simply move it back.**
