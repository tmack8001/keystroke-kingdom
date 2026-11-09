---
title: The Backtick (a.k.a. backquote, grave accent)
type: entity
tags: [punctuation, programming-language, ascii, keyboard-card, level-23, player-facing-claim]
level: 23
sources: 5
verified: 2026-11-04
---

The key at the top-left of the number row is `` ` `` — **backtick** in everyday computer talk,
**backquote** in the POSIX standard, **grave accent** in Unicode (U+0060 GRAVE ACCENT). It began
as a **typewriter key for putting an accent on a letter** (the grave accent, as in French
*à*), which is why ASCII has it. Today it is mostly a **coder's** key: in many languages and tools
a **pair of backticks wraps** special text — shell command substitution, JavaScript template
strings, Markdown code. The name "backtick" itself has **no sourced origin story** here.

## In this game

- Key arrives **Level 23**; *backtick* needs `c` (L13), `k`, `t`, `i` → spellable from **L13**;
  card level **23** (post-terminal; code level 23). L23 holds two symbols (`` ` `` and `'`), each
  needing a play (spec §5.9).
- ⚠️ **Existing in-game name conflict (player-facing):** `js/ui/hud.js` `SMALL_GLYPH_CAPTION['`']`
  = **`TICK MARK`**, `js/levels.js:1449` hint = **`PINKIES FIND THE TICK MARKS`**, and
  `js/freeplay.js:198` = *"The tick marks find your pinkies."* "Tick mark" is **not** an attested
  name of this key in any source read here (names found: backtick, backquote, grave, grave accent).
  Teaching "backtick" at L23 collides with the caption beneath the prompt.
- **Must not retell** the `hack` card (L23, the existing backtick card — spec §5.9).

## The facts

### 1. Names

- Wikipedia: *"also known as backquote, grave, or grave accent"*; the page does not say when
  "backtick" arose. Unicode name GRAVE ACCENT; Unicode 1 name SPACING GRAVE. [Refs 1, 5]
- POSIX (IEEE Std 1003.1-2024, Issue 8) calls the character **"backquote."** It does not use
  "grave accent." [Ref 3]
- ASCII 0x27 is the APOSTROPHE and 0x60 the GRAVE ACCENT; old X Window fonts drew them as a
  mirror-image pair (the X fonts weren't corrected until 2004), which tempted authors to use them as
  matching quote marks. [Ref 2]

### 2. Origin — a typewriter accent

- Wikipedia: designed so a typewriter could overtype a lowercase letter with a grave accent
  (typewriters with accent languages used **dead keys**: the carriage does not move); it *"did not
  exist independently as a type or hot-lead printing character,"* entered ASCII through its
  typewriter use, and code 0x60 was often reassigned in national variants (e.g. µ in French
  ISO 646). [Ref 1]
- A mailing-list claim that the 1965 ASCII revision first assigned 0x60 is secondhand
  (search-result only) — **not usable.**

### 3. Its job in writing

- On keyboards with dead-key layouts (UK extended, US-International), backtick then `a` makes
  **à**. [Ref 1] The mark is the **grave accent**, used over letters in French and other
  languages. Kid-safe line: **"It is also an accent mark."** (Avoid printing À in Press Start 2P
  without a glyph check — journal O11.)

### 4. In code — a wrapper

- **Shell:** POSIX command substitution has two forms: `$(commands)` and the older `` `commands` ``
  (backquoted); Wikipedia: backticks for it are *"now largely deprecated"* in favour of `$(...)`. [Refs 1, 3]
- **JavaScript:** *"Template literals are literals delimited with backtick (`) characters, allowing
  for multi-line strings, string interpolation with embedded expressions…"* [Ref 4]
- **Markdown:** backticks mark inline code; fenced blocks use three. Go and D use them for raw
  strings, MySQL for identifiers, PowerShell as an escape character. [Ref 1]
- **Safe wording:** "Many coders wrap special text in a pair of backticks." **Not safe:** "for
  code" alone (the JS and shell uses wrap strings/commands), and "every language."

## Corrections from citation pass (2026-11-04)

- **"Tick mark"** (current in-game name) is unsourced as a name for this key; see In this game.
- **"Backtick is a quotation mark"** — a long-lived habit from mirror-image X fonts (Kuhn); in
  standards it is the grave accent, not a left quote. Teach: accent first, wrapper second.
- Command substitution via backticks is **legacy**, not "the" way to do it.

## Unsourceable / weakly-sourced items

- Origin/date of the word "backtick": none found. U+0060 codepoints.net page timed out (not read).
- The ASCII 1965 detail: secondhand.

## References

1. [Wikipedia — Backtick](https://en.wikipedia.org/wiki/Backtick) — names, typewriter/dead-key origin, ASCII, shell/Markdown/JS/other-language uses. **[fetched]**
2. [Markus Kuhn — ASCII and Unicode quotation marks](https://www.cl.cam.ac.uk/~mgk25/ucs/quotes.html) — 0x27 vs 0x60, mirror glyphs in X fonts, command-substitution use. **[fetched]**
3. [The Open Group — POSIX Shell Command Language, Issue 8](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html) — command substitution, `$(...)` and backquoted forms; "backquote." **[fetched]** (first 100k of 262k chars)
4. [MDN — Template literals](https://developer.mozilla.org/en-US/docs/JavaScript_templates) — delimited with backtick characters. **[fetched]**
5. [codepoints.net — U+0060](https://codepoints.net/U+0060) — Unicode names GRAVE ACCENT / SPACING GRAVE. *(search result only, not fetched — timeout)*
