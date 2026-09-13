---
feature: audio
code: [js/audio.js]
rules: [.claude/rules/tech.md]
screenshots: null
capture: null
verified: 2026-09-11
---

# Audio

`js/audio.js` (190 lines) is 100% procedural WebAudio — no sample playback, no `<audio>`
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
| `modemChirp(delay)` | ~0.55s layered dial-up handshake | easter egg, cinematic only — the one sound that doesn't use `play()`; see below |

## `modemChirp(delay)` — the dial-up handshake (added 2026-09-11)

The file's one exception to the `play()`-only rule above, and its only sound that
isn't triggered by gameplay: an easter egg played once under the Mystery Cabinet's
door-opening beat the first time the Computer Wing is revealed (trigger + first-time
latch live in `js/mystery.js` — see [[cinematics]]; the catalog entry and its verified
history live in `.claude/rules/easter-eggs.md`).

Three layers on one shared gain bus (trimmed to `0.009`, deliberately mixed under
`mystery.js`'s own chord/hinge voices so it reads as texture, not performance):

1. **Answer-tone pair** (~0–0.22s) — two `sine` oscillators at 1100Hz and 1640Hz,
   staggered 0.1s apart, each with a short linear attack/hold/release.
2. **Warble** (~0.18–0.42s) — one `triangle` oscillator ramped 1850 → 900 → 1500 →
   1050Hz.
3. **Carrier hiss tail** (~0.3–0.55s) — a 0.25s white-noise `AudioBuffer` through a
   `bandpass` BiquadFilter (1250Hz, Q 1.2). The only buffer source and the only filter
   node in the file.

`delay` (seconds) slides the whole chirp later so it can sit *under* a sound that
starts a beat afterward; it is finite-checked and clamped to `[0, 5]`. Same `enabled`
gate as every other sound, plus a `try/catch` around context creation — if WebAudio is
unavailable or blocked, the function returns and the cinematic plays identically. The
source comments explicitly decline to assert any real modem frequency or signalling
standard: the pitches were chosen by ear for a warm, band-limited, kid-safe texture.

## Global toggle

Module-level `enabled` flag, set via `setEnabled(v)`. `play()` early-returns before
creating any oscillator when disabled — a hard gate at the lowest level, not
per-function. Wired from [[settings-survival]]'s `sound` field: `main.js` calls
`Audio.setEnabled(settings.sound)` at boot and again on every settings change. Muting
never touches gameplay logic — the wrong-key contract and Survival timers behave
identically with sound off.

## Related

[[settings-survival]] (owns the persisted `sound` toggle) · [[engine-flow]] (calls
every `Audio.*` function at the relevant game events) · [[cinematics]] (`js/mystery.js`
is `modemChirp`'s only caller, and owns its first-time-only latch) · [[easter-eggs]]
(the dial-up handshake's catalog entry)
