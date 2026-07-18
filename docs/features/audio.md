---
feature: audio
code: [js/audio.js]
rules: [.claude/rules/tech.md]
screenshots: null
capture: null
verified: 2026-07-12
---

# Audio

`js/audio.js` (81 lines) is 100% procedural WebAudio — no sample playback, no `<audio>`
elements, no `.mp3`/`.ogg` files, no Lyria integration. Per-level Lyria music (product.md,
tech.md) is aspirational/roadmap only; nothing in this file loads or references it.

## Synthesis

A single lazily-created `AudioContext`. Every sound routes through one core helper,
`play(freq, duration, type='square', vol)`: one `OscillatorNode` + `GainNode` per call,
frequency set via `setValueAtTime`, envelope is decay-only —
`gain.setValueAtTime(vol, now)` then `exponentialRampToValueAtTime(0.001, now+duration)`
(instant onset, no attack ramp). Every exported sound is one or more short `play()` /
`setTimeout(play, delay)` calls layered into a melodic gesture.

## Sound events

| Function | Gesture | Notes |
|---|---|---|
| `correct()` | 2-note rising square blip (880→1320Hz) | every correct keypress |
| `wrong()` | single soft sawtooth, 150Hz, 0.15s | deliberately low/soft — a nudge, not an alarm |
| `coin()` | 2-note square blip (988→1319Hz) | insert-coin, egg responses |
| `levelComplete()` | 4-note ascending square arpeggio (C-E-G-C) | |
| `start()` | 3-note ascending square (440/660/880Hz) | |
| `timeout()` | `wrong()` ×2, 140ms apart | **Survival only** — clock, never a keypress |
| `bonusQuarter()` | 2-note bright square (1046/1568Hz) | **Survival only** — 15-streak mercy chime |
| `gameOver()` | 3-note descending triangle (G-E-C) | **Survival only**, the game's one failure state — "must never mock the player" (source comment) |

## Global toggle

Module-level `enabled` flag, set via `setEnabled(v)`. `play()` early-returns before
creating any oscillator when disabled — a hard gate at the lowest level, not
per-function. Wired from [[settings-survival]]'s `sound` field: `main.js` calls
`Audio.setEnabled(settings.sound)` at boot and again on every settings change. Muting
never touches gameplay logic — the wrong-key contract and Survival timers behave
identically with sound off.

## Related

[[settings-survival]] (owns the persisted `sound` toggle) · [[engine-flow]] (calls
every `Audio.*` function at the relevant game events)
