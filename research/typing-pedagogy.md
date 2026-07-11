# Typing Pedagogy Reference
## How our key progression compares to the canon, and the pedagogy decisions we've locked

*Compiled 2026-07-10/11 from the Act 5 planning discussions. The curriculum itself lives in
`.claude/rules/levels.md` ("Why This Order"); this file records the comparative research
and the reasoning behind decisions that might otherwise look arbitrary later.*

## The canon comparison (Trevor's childhood typing games)

**Mario Teaches Typing (Interplay, 1991)** — the only true comparable. Uses the same
proven progression we do: home row first, then reaches outward in finger-pairs (E/I → R/U
→ T/Y → W/O → Q/P, then bottom row). Same lineage as Mavis Beacon, Dance Mat Typing,
TypingClub — the ordering is physiological, not stylistic. **Where we differ:** MTT wears
one skin the whole way; our one-distinct-cabinet-per-level + era-progressive graphics is
the upgrade. And MTT (like nearly every tutor) lumps `` ` - = [ ] ' \ `` into a single
"symbols" lesson or skips them; our dedicated Corner Cabinet levels (21-23) are MORE
thorough on the outer keys than the canon.

**Bookworm (PopCap, 2003)** — not a typing tutor: word-BUILDING from letter tiles
(vocabulary/spelling), assumes you already type. We share its soul in one place — "typing
a real word you can read is a double win" — but nothing structural.

**Sports/drill typing games (the basketball one, late-90s edu-web era)** — word-drill
reskins: type the word, sink the shot; miss and you brick it. No key-introduction sequence
at all. The instructive contrast: our One Rule means a wrong key never bricks the shot —
the letter waits. (Survival mode, added 2026-07-11, is the opt-in exception and even it
never punishes wrong keys — time pressure only.)

## Decisions locked during Act 5 planning (with reasoning)

1. **Symbols before Shift.** `` ` - = [ ] \ ' `` are unshifted base keys; learn the
   location first, then Shift becomes the payoff that unlocks everything printed on the
   keys' upper halves. (Canon tutors under-teach this; we made it three levels.)
2. **The left/right pairing rhythm breaks at 21-23, on purpose.** Every letter level pairs
   one left + one right hand key. The leftover symbols cluster right-pinky (only `` ` `` is
   left-handed), so the Corner Cabinet levels are honestly framed as right-pinky-reach
   levels rather than forcing fake symmetry with review keys. Decision: accept anatomy.
3. **Backspace is taught as a skill, not a confession.** "Type it, then erase it" drills;
   Backspace counts TOWARD progress. Framing from product.md: "Backspace isn't failure.
   Every writer uses it."
4. **Case-sensitivity activates only when the expected character is uppercase** — a
   CapsLock'd child on levels 1-23 is never wrong for the machine's reasons.
5. **Modifier keydowns never count as mistakes.** Pressing Shift while expecting 'A' is
   the correct FIRST HALF of the action; the engine ignores all pure modifiers.
6. **The in-game keyboard guide is a true ANSI silhouette** (staggered rows, real key
   widths, fog-of-war for unlearned keys) — E/I must appear physically above D/K, because
   the on-screen map is teaching the finger map. Centered/filtered rows were tried and
   rejected (2026-07-10).
7. **Words are early-reader decodable** (3-5 letters, phonetic), per product.md's Word
   Bank Principle; equations on number levels (`2-1=1`) extend "typing is computation."
   Open question in docs/ROADMAP.md §5: educator review of the word banks.

## Difficulty philosophy (settings, 2026-07-11)
ADVENTURE (default): no timers, no lives — the entire base game. SURVIVAL (opt-in):
NOVICE / ARCADE / EXPERT tiers — named for 1979 pinball's literal NOVICE/EXPERT switches —
tuned "challenging, never cruel" (expert ≈ 9s for a 4-char pattern), with an arcade-culture
mercy mechanic: a 15-streak earns a quarter back. Game over is warm: "YOU TYPED n LETTERS.
THE ARCADE REMEMBERS."
