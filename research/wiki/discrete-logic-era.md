---
title: Discrete Logic Era
type: concept
tags: [video-game-history, era, hardware, history-card]
sources: 2
verified: 2026-07-11
---

The discrete-logic era (roughly 1972–1978) covers arcade games built entirely from
transistor-transistor logic (TTL) circuits with no microprocessor, no ROM, and no software —
where the entire game existed as a physical, hand-wired circuit rather than executable code.

## In this game

This concept anchors Keystroke Kingdom's **Act 1 ("The Arcade")** visual grammar for its
earliest levels: "flat fills, blocky rects, no anti-aliasing, no gradients" — motion itself
is the spectacle, because the hardware couldn't render anything else. [[pong]] (1972) and
[[breakout]] (1976, Level 1 cabinet) are the two purest examples: both used no CPU
whatsoever. [[space-invaders]] (Level 2) marks the transition point — it uses an Intel 8080
CPU and bitmapped framebuffer, moving out of pure discrete logic into the early
sprite-hardware period that carries through the rest of Act 1 ([[pac-man]], [[galaga]],
[[donkey-kong]]). See `research/video-game-history.md`, Era fidelity targets table, Act 1
row.

## The facts

- Pong (1972): built from ~60–66 TTL chips, no microprocessor, no software. All display
  elements generated directly by discrete logic hardware.
- Breakout (1976): discrete logic (TTL) game — no CPU, no software. Production version used
  approximately 100 TTL chips; Steve Wozniak's prototype used only ~45 via unconventional
  "glitch logic" tricks unsuitable for mass manufacture.
- Space Invaders (1978) marks the shift away from pure discrete logic: an Intel 8080 CPU
  with a bitmapped framebuffer (raster graphics) — a genuine programmable computer, not a
  hard-wired circuit.
- Act 1 (1976–82) per `.claude/rules/levels.md`'s progressive-graphic-quality table spans
  1–8 color pixel art, no anti-aliasing, rectangular sprites — the discrete-logic era plus
  the early sprite-hardware period that immediately follows it.

## References

1. [Pong — CHM Revolution, Computer History Museum](https://www.computerhistory.org/revolution/story/183) — institutional record of Pong's pure hardware-logic construction. **[fetched]**
2. [New Insight into Breakout's Origins — Atari](https://atari.com/blogs/atari/new-insight-into-breakout-s-origins) — Atari's own account of Breakout's TTL chip counts and discrete-logic construction.
