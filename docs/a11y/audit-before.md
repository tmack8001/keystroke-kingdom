# Keystroke Kingdom — Contrast Audit (Before)

Generated: 2026-07-10T15:21:44.020Z
Dev URL: http://127.0.0.1:55032
Viewport: 1280x800

## Method

Text color = computed CSS color of the element. Background = average of a ~8-10x10 pixel grid sampled from a full-page screenshot within the element's bounding rect. Because glyphs are thin relative to their box, this approximates the background BEHIND the text but is pulled slightly toward the glyph color itself (a conservative bias -- true bg-only contrast is usually >= reported here). bgLumSpread reports max-min luminance in the sampled grid: near 0 means a flat/uniform sampled region (little text detected in-box or a very flat background).

Thresholds: FAIL < 3.0 · WARN 3.0 - 4.5 · PASS >= 4.5 (WCAG AA large-text min is 3:1; this project targets higher for a 5-year-old reader)

## Console Errors

None detected across the entire run (title, name entry, ready, select x5 acts, keyboard-preview x25, game x25, pause x25, complete-overlay x25).

## Overall Results

Total measurements: **632**

| Verdict | Count | % of total |
| --- | --- | --- |
| PASS (>= 4.5:1) | 111 | 17.6% |
| WARN (3.0-4.5:1) | 60 | 9.5% |
| FAIL (< 3.0:1) | 461 | 72.9% |

## Worst Offenders (lowest contrast ratio, top 20)

| # | Screen | Level | Element | Text Color | Sampled BG | Ratio | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | game-keybox | L11 (sonic) | key-box[21]="M" | rgb(10, 90, 32) | rgb(27, 89, 29) | 1 | FAIL |
| 2 | game-keybox | L11 (sonic) | key-box[0]="A" | rgb(10, 90, 32) | rgb(27, 88, 29) | 1.01 | FAIL |
| 3 | game-keybox | L12 (street-fighter-ii) | key-box[6]="J" | rgb(122, 24, 0) | rgb(114, 25, 10) | 1.05 | FAIL |
| 4 | game-keybox | L12 (street-fighter-ii) | key-box[12]="R" | rgb(122, 24, 0) | rgb(114, 25, 9) | 1.05 | FAIL |
| 5 | game-keybox | L12 (street-fighter-ii) | key-box[17]="O" | rgb(122, 24, 0) | rgb(114, 25, 9) | 1.05 | FAIL |
| 6 | game | L9 (super-mario-bros) | prompt-letter.active | rgb(92, 148, 252) | rgb(89, 143, 244) | 1.06 | FAIL |
| 7 | game | L9 (super-mario-bros) | level-badge-text | rgb(85, 85, 85) | rgb(59, 88, 142) | 1.06 | FAIL |
| 8 | game | L1 (breakout) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(24, 94, 11) | 1.07 | FAIL |
| 9 | game-keybox | L11 (sonic) | key-box[16]="W" | rgb(10, 90, 32) | rgb(30, 95, 31) | 1.09 | FAIL |
| 10 | game-keybox | L11 (sonic) | key-box[5]="H" | rgb(10, 90, 32) | rgb(30, 96, 32) | 1.1 | FAIL |
| 11 | game-keybox | L21 (out-run) | key-box[0]="A" | rgb(122, 26, 72) | rgb(61, 75, 59) | 1.1 | FAIL |
| 12 | game-keybox | L11 (sonic) | key-box[11]="I" | rgb(10, 90, 32) | rgb(31, 97, 32) | 1.12 | FAIL |
| 13 | game-keybox | L21 (out-run) | key-box[41]="=" | rgb(122, 26, 72) | rgb(66, 75, 62) | 1.12 | FAIL |
| 14 | game | L25 (word-processor) | prompt-letter.active | rgb(143, 208, 255) | rgb(191, 215, 229) | 1.12 | FAIL |
| 15 | game | L9 (super-mario-bros) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(59, 94, 160) | 1.18 | FAIL |
| 16 | game | L12 (street-fighter-ii) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(53, 93, 184) | 1.21 | FAIL |
| 17 | game-keybox | L21 (out-run) | key-box[10]="E" | rgb(122, 26, 72) | rgb(81, 78, 67) | 1.22 | FAIL |
| 18 | game | L11 (sonic) | hud-value #hud-streak | rgb(10, 90, 32) | rgb(19, 66, 110) | 1.23 | FAIL |
| 19 | game | L15 (pokemon) | prompt-letter.active | rgb(255, 204, 0) | rgb(222, 188, 62) | 1.23 | FAIL |
| 20 | game | L11 (sonic) | hud-value #hud-accuracy | rgb(10, 90, 32) | rgb(18, 65, 113) | 1.24 | FAIL |

## Title Screen

| Level | Element | Text Color | Sampled BG | Ratio | Verdict |
| --- | --- | --- | --- | --- | --- |
| — | title h1 (KEYSTROKE) | rgb(255, 176, 0) | rgb(66, 47, 7) | 6.99 | PASS |
| — | title .kingdom (KINGDOM) | rgb(255, 176, 0) | rgb(78, 55, 6) | 6.11 | PASS |
| — | INSERT COIN | rgb(57, 255, 20) | rgb(9, 9, 9) | 14.65 | PASS |
| — | coin-hint (PRESS SPACE OR ENTER) | rgb(85, 85, 85) | rgb(9, 9, 9) | 2.67 | FAIL |

## Name Entry

| Level | Element | Text Color | Sampled BG | Ratio | Verdict |
| --- | --- | --- | --- | --- | --- |
| — | name-label (ENTER YOUR NAME) | rgb(85, 85, 85) | rgb(34, 34, 34) | 2.14 | FAIL |
| — | name-input | rgb(57, 255, 20) | rgb(16, 50, 10) | 10.44 | PASS |
| — | ready-text (PRESS ENTER TO START) | rgb(85, 85, 85) | rgb(16, 21, 14) | 2.48 | FAIL |

## Ready Screen

| Level | Element | Text Color | Sampled BG | Ratio | Verdict |
| --- | --- | --- | --- | --- | --- |
| — | READY | rgb(122, 85, 0) | rgb(39, 27, 6) | 2.51 | FAIL |
| — | player name | rgb(255, 176, 0) | rgb(132, 91, 4) | 3.3 | WARN |
| — | level-intro | rgb(85, 85, 85) | rgb(14, 16, 14) | 2.57 | FAIL |
| — | start-prompt (PRESS SPACE TO BEGIN) | rgb(57, 255, 20) | rgb(37, 157, 14) | 2.62 | FAIL |

## Select Screen (per act)

| Level | Element | Text Color | Sampled BG | Ratio | Verdict |
| --- | --- | --- | --- | --- | --- |
| act1-arcade | select-title | rgb(57, 255, 20) | rgb(26, 101, 12) | 5.35 | PASS |
| act1-arcade | select-subtitle | rgb(85, 85, 85) | rgb(27, 27, 27) | 2.32 | FAIL |
| act1-arcade | select-act-label | rgb(255, 176, 0) | rgb(106, 75, 5) | 4.37 | WARN |
| act1-arcade | select-prompt | rgb(57, 255, 20) | rgb(25, 93, 12) | 5.96 | PASS |
| act1-arcade | select-hint | rgb(85, 85, 85) | rgb(27, 27, 27) | 2.32 | FAIL |
| act2-computer-wing | select-title | rgb(57, 255, 20) | rgb(26, 101, 12) | 5.35 | PASS |
| act2-computer-wing | select-subtitle | rgb(85, 85, 85) | rgb(27, 27, 27) | 2.32 | FAIL |
| act2-computer-wing | select-act-label | rgb(255, 176, 0) | rgb(82, 59, 6) | 5.79 | PASS |
| act2-computer-wing | select-prompt | rgb(57, 255, 20) | rgb(9, 9, 9) | 14.65 | PASS |
| act2-computer-wing | select-hint | rgb(85, 85, 85) | rgb(27, 27, 27) | 2.32 | FAIL |
| act3-basement | select-title | rgb(57, 255, 20) | rgb(26, 101, 12) | 5.35 | PASS |
| act3-basement | select-subtitle | rgb(85, 85, 85) | rgb(27, 27, 27) | 2.32 | FAIL |
| act3-basement | select-act-label | rgb(255, 176, 0) | rgb(68, 49, 6) | 6.75 | PASS |
| act3-basement | select-prompt | rgb(57, 255, 20) | rgb(25, 93, 12) | 5.96 | PASS |
| act3-basement | select-hint | rgb(85, 85, 85) | rgb(27, 27, 27) | 2.32 | FAIL |
| act4-command-center | select-title | rgb(57, 255, 20) | rgb(26, 100, 12) | 5.39 | PASS |
| act4-command-center | select-subtitle | rgb(85, 85, 85) | rgb(27, 27, 27) | 2.3 | FAIL |
| act4-command-center | select-act-label | rgb(255, 176, 0) | rgb(74, 53, 6) | 6.36 | PASS |
| act4-command-center | select-prompt | rgb(57, 255, 20) | rgb(9, 9, 9) | 14.65 | PASS |
| act4-command-center | select-hint | rgb(85, 85, 85) | rgb(27, 27, 27) | 2.3 | FAIL |
| act5-full-circle | select-title | rgb(57, 255, 20) | rgb(26, 100, 12) | 5.39 | PASS |
| act5-full-circle | select-subtitle | rgb(85, 85, 85) | rgb(30, 30, 30) | 2.25 | FAIL |
| act5-full-circle | select-act-label | rgb(255, 176, 0) | rgb(78, 55, 6) | 6.11 | PASS |
| act5-full-circle | select-prompt | rgb(57, 255, 20) | rgb(9, 9, 9) | 14.67 | PASS |
| act5-full-circle | select-hint | rgb(85, 85, 85) | rgb(30, 30, 30) | 2.23 | FAIL |

## Select Screen — Cabinet Labels (sampled, 5 per act)

| Level | Element | Text Color | Sampled BG | Ratio | Verdict |
| --- | --- | --- | --- | --- | --- |
| act1-arcade | cabinet-label[0]="LEVEL 1 · 1977" | rgb(57, 255, 20) | rgb(26, 101, 12) | 5.3 | PASS |
| act1-arcade | cabinet-label[1]="LEVEL 2 · 1980" | rgb(85, 85, 85) | rgb(29, 29, 29) | 2.25 | FAIL |
| act1-arcade | cabinet-label[2]="LEVEL 3 · 1985" | rgb(85, 85, 85) | rgb(30, 30, 30) | 2.23 | FAIL |
| act1-arcade | cabinet-label[3]="LEVEL 4 · 1991" | rgb(85, 85, 85) | rgb(24, 24, 24) | 2.39 | FAIL |
| act1-arcade | cabinet-label[4]="LEVEL 5 · 1982" | rgb(85, 85, 85) | rgb(29, 29, 29) | 2.26 | FAIL |
| act2-computer-wing | cabinet-label[0]="LEVEL 6 · 1981" | rgb(57, 255, 20) | rgb(28, 113, 12) | 4.56 | PASS |
| act2-computer-wing | cabinet-label[1]="LEVEL 7 · 1983" | rgb(85, 85, 85) | rgb(25, 25, 25) | 2.35 | FAIL |
| act2-computer-wing | cabinet-label[2]="LEVEL 8 · 1984" | rgb(85, 85, 85) | rgb(30, 30, 30) | 2.22 | FAIL |
| act2-computer-wing | cabinet-label[3]="LEVEL 9 · 1985" | rgb(85, 85, 85) | rgb(29, 29, 29) | 2.25 | FAIL |
| act2-computer-wing | cabinet-label[4]="LEVEL 10 · 1986" | rgb(85, 85, 85) | rgb(24, 24, 24) | 2.38 | FAIL |
| act3-basement | cabinet-label[0]="LEVEL 11 · 1991" | rgb(57, 255, 20) | rgb(25, 98, 11) | 5.54 | PASS |
| act3-basement | cabinet-label[1]="LEVEL 12 · 1991" | rgb(85, 85, 85) | rgb(20, 20, 20) | 2.47 | FAIL |
| act3-basement | cabinet-label[2]="LEVEL 13 · 1993" | rgb(85, 85, 85) | rgb(21, 21, 21) | 2.45 | FAIL |
| act3-basement | cabinet-label[3]="LEVEL 14 · 1994" | rgb(85, 85, 85) | rgb(22, 22, 22) | 2.42 | FAIL |
| act3-basement | cabinet-label[4]="LEVEL 15 · 1996" | rgb(85, 85, 85) | rgb(24, 24, 24) | 2.38 | FAIL |
| act4-command-center | cabinet-label[0]="LEVEL 16 · 1993" | rgb(57, 255, 20) | rgb(27, 108, 12) | 4.86 | PASS |
| act4-command-center | cabinet-label[1]="LEVEL 17 · 1997" | rgb(85, 85, 85) | rgb(22, 22, 22) | 2.43 | FAIL |
| act4-command-center | cabinet-label[2]="LEVEL 18 · 1997" | rgb(85, 85, 85) | rgb(21, 21, 21) | 2.45 | FAIL |
| act4-command-center | cabinet-label[3]="LEVEL 19 · 1997" | rgb(85, 85, 85) | rgb(22, 22, 22) | 2.43 | FAIL |
| act4-command-center | cabinet-label[4]="LEVEL 20 · 1960s–∞" | rgb(85, 85, 85) | rgb(29, 29, 29) | 2.27 | FAIL |
| act5-full-circle | cabinet-label[0]="LEVEL 21 · 1986" | rgb(57, 255, 20) | rgb(27, 105, 12) | 5.03 | PASS |
| act5-full-circle | cabinet-label[1]="LEVEL 22 · 1982" | rgb(85, 85, 85) | rgb(26, 26, 26) | 2.32 | FAIL |
| act5-full-circle | cabinet-label[2]="LEVEL 23 · 1980" | rgb(85, 85, 85) | rgb(28, 28, 28) | 2.28 | FAIL |
| act5-full-circle | cabinet-label[3]="LEVEL 24 · NOW" | rgb(85, 85, 85) | rgb(31, 31, 31) | 2.21 | FAIL |
| act5-full-circle | cabinet-label[4]="LEVEL 25 · NOW" | rgb(85, 85, 85) | rgb(32, 32, 32) | 2.17 | FAIL |

## Keyboard Preview Screen (per level, header text only)

| Level | Element | Text Color | Sampled BG | Ratio | Verdict |
| --- | --- | --- | --- | --- | --- |
| L1 (breakout) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(43, 74, 7) | 1.49 | FAIL |
| L1 (breakout) | kbp-subtitle | rgb(57, 255, 20) | rgb(41, 84, 10) | 6.52 | PASS |
| L2 (space-invaders) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(68, 60, 5) | 1.66 | FAIL |
| L2 (space-invaders) | kbp-subtitle | rgb(255, 255, 0) | rgb(92, 85, 5) | 7.07 | PASS |
| L3 (pac-man) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(47, 58, 57) | 1.75 | FAIL |
| L3 (pac-man) | kbp-subtitle | rgb(102, 204, 255) | rgb(53, 72, 76) | 5.35 | PASS |
| L4 (galaga) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(66, 14, 48) | 2.34 | FAIL |
| L4 (galaga) | kbp-subtitle | rgb(255, 0, 255) | rgb(89, 14, 72) | 4.23 | WARN |
| L5 (joust) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(81, 47, 0) | 1.78 | FAIL |
| L5 (joust) | kbp-subtitle | rgb(255, 140, 0) | rgb(92, 54, 0) | 4.53 | PASS |
| L6 (donkey-kong) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(80, 24, 9) | 2.11 | FAIL |
| L6 (donkey-kong) | kbp-subtitle | rgb(232, 32, 32) | rgb(85, 26, 11) | 3.03 | WARN |
| L7 (dragons-lair) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(65, 34, 50) | 2.08 | FAIL |
| L7 (dragons-lair) | kbp-subtitle | rgb(204, 102, 255) | rgb(76, 40, 68) | 4.09 | WARN |
| L8 (tetris) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(24, 71, 63) | 1.56 | FAIL |
| L8 (tetris) | kbp-subtitle | rgb(0, 255, 255) | rgb(21, 84, 78) | 6.97 | PASS |
| L9 (super-mario-bros) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(39, 41, 54) | 2.14 | FAIL |
| L9 (super-mario-bros) | kbp-subtitle | rgb(92, 148, 252) | rgb(46, 54, 76) | 4.07 | WARN |
| L10 (legend-of-zelda) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(64, 53, 10) | 1.8 | FAIL |
| L10 (legend-of-zelda) | kbp-subtitle | rgb(232, 208, 64) | rgb(82, 72, 18) | 5.92 | PASS |
| L11 (sonic) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(33, 66, 25) | 1.68 | FAIL |
| L11 (sonic) | kbp-subtitle | rgb(35, 211, 83) | rgb(30, 75, 31) | 5.03 | PASS |
| L12 (street-fighter-ii) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(90, 32, 0) | 1.9 | FAIL |
| L12 (street-fighter-ii) | kbp-subtitle | rgb(255, 68, 0) | rgb(92, 31, 0) | 3.69 | WARN |
| L13 (myst) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(50, 47, 35) | 1.99 | FAIL |
| L13 (myst) | kbp-subtitle | rgb(128, 160, 184) | rgb(56, 59, 53) | 4.16 | WARN |
| L14 (donkey-kong-country) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(42, 66, 13) | 1.66 | FAIL |
| L14 (donkey-kong-country) | kbp-subtitle | rgb(68, 204, 68) | rgb(39, 72, 17) | 4.91 | PASS |
| L15 (pokemon) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(75, 56, 0) | 1.68 | FAIL |
| L15 (pokemon) | kbp-subtitle | rgb(255, 204, 0) | rgb(90, 69, 0) | 6.1 | PASS |
| L16 (simcity-2000) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(39, 44, 43) | 2.1 | FAIL |
| L16 (simcity-2000) | kbp-subtitle | rgb(68, 136, 204) | rgb(40, 52, 60) | 3.41 | WARN |
| L17 (goldeneye-007) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(64, 48, 12) | 1.9 | FAIL |
| L17 (goldeneye-007) | kbp-subtitle | rgb(200, 168, 64) | rgb(75, 60, 19) | 4.68 | PASS |
| L18 (age-of-empires) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(72, 46, 1) | 1.87 | FAIL |
| L18 (age-of-empires) | kbp-subtitle | rgb(200, 132, 10) | rgb(76, 49, 2) | 3.85 | WARN |
| L19 (final-fantasy-vii) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(27, 58, 30) | 1.88 | FAIL |
| L19 (final-fantasy-vii) | kbp-subtitle | rgb(0, 232, 168) | rgb(21, 77, 48) | 6.14 | PASS |
| L20 (terminal) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(35, 59, 2) | 1.85 | FAIL |
| L20 (terminal) | kbp-subtitle | rgb(57, 255, 20) | rgb(36, 82, 5) | 6.79 | PASS |
| L21 (out-run) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(88, 38, 45) | 1.8 | FAIL |
| L21 (out-run) | kbp-subtitle | rgb(255, 90, 160) | rgb(104, 43, 60) | 3.6 | WARN |
| L22 (qbert) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(77, 43, 30) | 1.86 | FAIL |
| L22 (qbert) | kbp-subtitle | rgb(255, 140, 26) | rgb(99, 56, 34) | 4.24 | WARN |
| L23 (missile-command) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(57, 22, 4) | 2.42 | FAIL |
| L23 (missile-command) | kbp-subtitle | rgb(255, 34, 34) | rgb(87, 24, 10) | 3.58 | WARN |
| L24 (high-score-entry) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(74, 56, 0) | 1.69 | FAIL |
| L24 (high-score-entry) | kbp-subtitle | rgb(255, 215, 0) | rgb(94, 74, 0) | 6.08 | PASS |
| L25 (word-processor) | kbp-title (LEVEL N) | rgb(122, 85, 0) | rgb(59, 62, 54) | 1.63 | FAIL |
| L25 (word-processor) | kbp-subtitle | rgb(143, 208, 255) | rgb(67, 79, 80) | 5.12 | PASS |

## Game Screen — Core UI (per level)

| Level | Element | Text Color | Sampled BG | Ratio | Verdict |
| --- | --- | --- | --- | --- | --- |
| L1 (breakout) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(15, 15, 15) | 2.57 | FAIL |
| L1 (breakout) | prompt-letter.active | rgb(57, 255, 20) | rgb(26, 103, 12) | 5.18 | PASS |
| L1 (breakout) | hud-value #hud-name | rgb(26, 122, 10) | rgb(8, 21, 6) | 3.43 | WARN |
| L1 (breakout) | hud-value #hud-accuracy | rgb(26, 122, 10) | rgb(15, 62, 7) | 2.24 | FAIL |
| L1 (breakout) | hud-value #hud-streak | rgb(26, 122, 10) | rgb(8, 21, 6) | 3.41 | WARN |
| L1 (breakout) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(24, 94, 11) | 1.07 | FAIL |
| L1 (breakout) | level-badge-text | rgb(85, 85, 85) | rgb(12, 12, 12) | 2.62 | FAIL |
| L2 (space-invaders) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(15, 15, 15) | 2.57 | FAIL |
| L2 (space-invaders) | prompt-letter.active | rgb(255, 255, 0) | rgb(144, 144, 4) | 3.17 | WARN |
| L2 (space-invaders) | hud-value #hud-name | rgb(122, 122, 0) | rgb(21, 21, 5) | 4.05 | WARN |
| L2 (space-invaders) | hud-value #hud-accuracy | rgb(122, 122, 0) | rgb(18, 18, 5) | 4.14 | WARN |
| L2 (space-invaders) | hud-value #hud-streak | rgb(122, 122, 0) | rgb(22, 22, 5) | 4.02 | WARN |
| L2 (space-invaders) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(9, 9, 8) | 2.67 | FAIL |
| L2 (space-invaders) | level-badge-text | rgb(85, 85, 85) | rgb(13, 13, 13) | 2.61 | FAIL |
| L3 (pac-man) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(15, 15, 24) | 2.56 | FAIL |
| L3 (pac-man) | prompt-letter.active | rgb(102, 204, 255) | rgb(57, 111, 142) | 3.03 | WARN |
| L3 (pac-man) | hud-value #hud-name | rgb(34, 68, 102) | rgb(9, 15, 25) | 1.91 | FAIL |
| L3 (pac-man) | hud-value #hud-accuracy | rgb(34, 68, 102) | rgb(9, 15, 26) | 1.9 | FAIL |
| L3 (pac-man) | hud-value #hud-streak | rgb(34, 68, 102) | rgb(10, 19, 32) | 1.85 | FAIL |
| L3 (pac-man) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(9, 11, 19) | 2.64 | FAIL |
| L3 (pac-man) | level-badge-text | rgb(85, 85, 85) | rgb(14, 19, 29) | 2.49 | FAIL |
| L4 (galaga) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(16, 6, 24) | 2.65 | FAIL |
| L4 (galaga) | prompt-letter.active | rgb(255, 0, 255) | rgb(144, 0, 147) | 2.57 | FAIL |
| L4 (galaga) | hud-value #hud-name | rgb(102, 0, 102) | rgb(32, 36, 36) | 1.31 | FAIL |
| L4 (galaga) | hud-value #hud-accuracy | rgb(102, 0, 102) | rgb(15, 0, 21) | 1.7 | FAIL |
| L4 (galaga) | hud-value #hud-streak | rgb(102, 0, 102) | rgb(18, 0, 24) | 1.69 | FAIL |
| L4 (galaga) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(15, 10, 22) | 2.62 | FAIL |
| L4 (galaga) | level-badge-text | rgb(85, 85, 85) | rgb(11, 7, 15) | 2.68 | FAIL |
| L5 (joust) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(16, 13, 6) | 2.6 | FAIL |
| L5 (joust) | prompt-letter.active | rgb(255, 140, 0) | rgb(135, 74, 0) | 2.99 | FAIL |
| L5 (joust) | hud-value #hud-name | rgb(122, 64, 0) | rgb(21, 12, 0) | 2.36 | FAIL |
| L5 (joust) | hud-value #hud-accuracy | rgb(122, 64, 0) | rgb(19, 11, 0) | 2.39 | FAIL |
| L5 (joust) | hud-value #hud-streak | rgb(122, 64, 0) | rgb(22, 12, 0) | 2.35 | FAIL |
| L5 (joust) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(10, 7, 2) | 2.7 | FAIL |
| L5 (joust) | level-badge-text | rgb(85, 85, 85) | rgb(13, 12, 8) | 2.63 | FAIL |
| L6 (donkey-kong) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(15, 10, 6) | 2.64 | FAIL |
| L6 (donkey-kong) | prompt-letter.active | rgb(232, 32, 32) | rgb(137, 25, 18) | 2.11 | FAIL |
| L6 (donkey-kong) | hud-value #hud-name | rgb(106, 0, 0) | rgb(19, 2, 0) | 1.56 | FAIL |
| L6 (donkey-kong) | hud-value #hud-accuracy | rgb(106, 0, 0) | rgb(16, 2, 0) | 1.57 | FAIL |
| L6 (donkey-kong) | hud-value #hud-streak | rgb(106, 0, 0) | rgb(19, 2, 0) | 1.56 | FAIL |
| L6 (donkey-kong) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(9, 4, 2) | 2.73 | FAIL |
| L6 (donkey-kong) | level-badge-text | rgb(85, 85, 85) | rgb(16, 10, 7) | 2.64 | FAIL |
| L7 (dragons-lair) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(13, 6, 12) | 2.68 | FAIL |
| L7 (dragons-lair) | prompt-letter.active | rgb(204, 102, 255) | rgb(123, 60, 153) | 2.35 | FAIL |
| L7 (dragons-lair) | hud-value #hud-name | rgb(85, 0, 136) | rgb(24, 3, 25) | 1.63 | FAIL |
| L7 (dragons-lair) | hud-value #hud-accuracy | rgb(85, 0, 136) | rgb(22, 2, 22) | 1.65 | FAIL |
| L7 (dragons-lair) | hud-value #hud-streak | rgb(85, 0, 136) | rgb(25, 2, 26) | 1.63 | FAIL |
| L7 (dragons-lair) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(18, 4, 12) | 2.69 | FAIL |
| L7 (dragons-lair) | level-badge-text | rgb(85, 85, 85) | rgb(23, 11, 18) | 2.58 | FAIL |
| L8 (tetris) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(6, 15, 29) | 2.58 | FAIL |
| L8 (tetris) | prompt-letter.active | rgb(0, 255, 255) | rgb(0, 88, 98) | 6.53 | PASS |
| L8 (tetris) | hud-value #hud-name | rgb(0, 102, 85) | rgb(0, 18, 24) | 2.76 | FAIL |
| L8 (tetris) | hud-value #hud-accuracy | rgb(0, 102, 85) | rgb(0, 15, 22) | 2.81 | FAIL |
| L8 (tetris) | hud-value #hud-streak | rgb(0, 102, 85) | rgb(0, 18, 24) | 2.76 | FAIL |
| L8 (tetris) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(2, 7, 17) | 2.7 | FAIL |
| L8 (tetris) | level-badge-text | rgb(85, 85, 85) | rgb(7, 11, 20) | 2.64 | FAIL |
| L9 (super-mario-bros) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(85, 134, 223) | 2.08 | FAIL |
| L9 (super-mario-bros) | prompt-letter.active | rgb(92, 148, 252) | rgb(89, 143, 244) | 1.06 | FAIL |
| L9 (super-mario-bros) | hud-value #hud-name | rgb(26, 48, 96) | rgb(51, 83, 144) | 1.71 | FAIL |
| L9 (super-mario-bros) | hud-value #hud-accuracy | rgb(26, 48, 96) | rgb(52, 86, 148) | 1.77 | FAIL |
| L9 (super-mario-bros) | hud-value #hud-streak | rgb(26, 48, 96) | rgb(51, 83, 145) | 1.71 | FAIL |
| L9 (super-mario-bros) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(59, 94, 160) | 1.18 | FAIL |
| L9 (super-mario-bros) | level-badge-text | rgb(85, 85, 85) | rgb(59, 88, 142) | 1.06 | FAIL |
| L10 (legend-of-zelda) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(16, 29, 13) | 2.34 | FAIL |
| L10 (legend-of-zelda) | prompt-letter.active | rgb(232, 208, 64) | rgb(139, 131, 39) | 2.53 | FAIL |
| L10 (legend-of-zelda) | hud-value #hud-name | rgb(136, 96, 32) | rgb(18, 16, 5) | 3.39 | WARN |
| L10 (legend-of-zelda) | hud-value #hud-accuracy | rgb(136, 96, 32) | rgb(14, 14, 4) | 3.45 | WARN |
| L10 (legend-of-zelda) | hud-value #hud-streak | rgb(136, 96, 32) | rgb(19, 17, 6) | 3.37 | WARN |
| L10 (legend-of-zelda) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(4, 7, 4) | 2.71 | FAIL |
| L10 (legend-of-zelda) | level-badge-text | rgb(85, 85, 85) | rgb(6, 10, 7) | 2.67 | FAIL |
| L11 (sonic) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(63, 141, 113) | 1.87 | FAIL |
| L11 (sonic) | prompt-letter.active | rgb(35, 211, 83) | rgb(49, 186, 72) | 1.28 | FAIL |
| L11 (sonic) | hud-value #hud-name | rgb(10, 90, 32) | rgb(16, 63, 109) | 1.28 | FAIL |
| L11 (sonic) | hud-value #hud-accuracy | rgb(10, 90, 32) | rgb(18, 65, 113) | 1.24 | FAIL |
| L11 (sonic) | hud-value #hud-streak | rgb(10, 90, 32) | rgb(19, 66, 110) | 1.23 | FAIL |
| L11 (sonic) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(22, 66, 128) | 1.33 | FAIL |
| L11 (sonic) | level-badge-text | rgb(85, 85, 85) | rgb(25, 63, 118) | 1.4 | FAIL |
| L12 (street-fighter-ii) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(53, 93, 184) | 1.21 | FAIL |
| L12 (street-fighter-ii) | prompt-letter.active | rgb(255, 68, 0) | rgb(175, 81, 80) | 1.47 | FAIL |
| L12 (street-fighter-ii) | hud-value #hud-name | rgb(122, 24, 0) | rgb(38, 42, 94) | 1.24 | FAIL |
| L12 (street-fighter-ii) | hud-value #hud-accuracy | rgb(122, 24, 0) | rgb(25, 34, 95) | 1.36 | FAIL |
| L12 (street-fighter-ii) | hud-value #hud-streak | rgb(122, 24, 0) | rgb(29, 35, 92) | 1.35 | FAIL |
| L12 (street-fighter-ii) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(29, 68, 103) | 1.35 | FAIL |
| L12 (street-fighter-ii) | level-badge-text | rgb(85, 85, 85) | rgb(17, 37, 103) | 1.91 | FAIL |
| L13 (myst) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(25, 28, 35) | 2.29 | FAIL |
| L13 (myst) | prompt-letter.active | rgb(128, 160, 184) | rgb(67, 83, 98) | 2.87 | FAIL |
| L13 (myst) | hud-value #hud-name | rgb(42, 56, 72) | rgb(11, 13, 17) | 1.63 | FAIL |
| L13 (myst) | hud-value #hud-accuracy | rgb(42, 56, 72) | rgb(10, 12, 16) | 1.64 | FAIL |
| L13 (myst) | hud-value #hud-streak | rgb(42, 56, 72) | rgb(12, 14, 19) | 1.62 | FAIL |
| L13 (myst) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(9, 10, 13) | 2.66 | FAIL |
| L13 (myst) | level-badge-text | rgb(85, 85, 85) | rgb(13, 13, 15) | 2.61 | FAIL |
| L14 (donkey-kong-country) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(32, 20, 61) | 2.29 | FAIL |
| L14 (donkey-kong-country) | prompt-letter.active | rgb(68, 204, 68) | rgb(44, 120, 57) | 2.6 | FAIL |
| L14 (donkey-kong-country) | hud-value #hud-name | rgb(26, 90, 26) | rgb(29, 42, 20) | 1.81 | FAIL |
| L14 (donkey-kong-country) | hud-value #hud-accuracy | rgb(26, 90, 26) | rgb(12, 44, 19) | 1.82 | FAIL |
| L14 (donkey-kong-country) | hud-value #hud-streak | rgb(26, 90, 26) | rgb(12, 45, 19) | 1.8 | FAIL |
| L14 (donkey-kong-country) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(12, 20, 27) | 2.49 | FAIL |
| L14 (donkey-kong-country) | level-badge-text | rgb(85, 85, 85) | rgb(14, 25, 26) | 2.41 | FAIL |
| L15 (pokemon) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(197, 152, 108) | 2.87 | FAIL |
| L15 (pokemon) | prompt-letter.active | rgb(255, 204, 0) | rgb(222, 188, 62) | 1.23 | FAIL |
| L15 (pokemon) | hud-value #hud-name | rgb(136, 102, 0) | rgb(137, 128, 98) | 1.35 | FAIL |
| L15 (pokemon) | hud-value #hud-accuracy | rgb(136, 102, 0) | rgb(139, 130, 101) | 1.39 | FAIL |
| L15 (pokemon) | hud-value #hud-streak | rgb(136, 102, 0) | rgb(137, 128, 95) | 1.34 | FAIL |
| L15 (pokemon) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(146, 141, 118) | 2.23 | FAIL |
| L15 (pokemon) | level-badge-text | rgb(85, 85, 85) | rgb(136, 132, 113) | 1.98 | FAIL |
| L16 (simcity-2000) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(11, 23, 40) | 2.41 | FAIL |
| L16 (simcity-2000) | prompt-letter.active | rgb(68, 136, 204) | rgb(36, 77, 120) | 2.35 | FAIL |
| L16 (simcity-2000) | hud-value #hud-name | rgb(26, 58, 90) | rgb(4, 12, 21) | 1.68 | FAIL |
| L16 (simcity-2000) | hud-value #hud-accuracy | rgb(26, 58, 90) | rgb(4, 11, 20) | 1.69 | FAIL |
| L16 (simcity-2000) | hud-value #hud-streak | rgb(26, 58, 90) | rgb(5, 13, 23) | 1.67 | FAIL |
| L16 (simcity-2000) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(4, 8, 15) | 2.69 | FAIL |
| L16 (simcity-2000) | level-badge-text | rgb(85, 85, 85) | rgb(12, 20, 33) | 2.47 | FAIL |
| L17 (goldeneye-007) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(17, 17, 16) | 2.54 | FAIL |
| L17 (goldeneye-007) | prompt-letter.active | rgb(200, 168, 64) | rgb(101, 85, 35) | 3.17 | WARN |
| L17 (goldeneye-007) | hud-value #hud-name | rgb(90, 74, 16) | rgb(23, 20, 9) | 2.13 | FAIL |
| L17 (goldeneye-007) | hud-value #hud-accuracy | rgb(90, 74, 16) | rgb(19, 17, 8) | 2.18 | FAIL |
| L17 (goldeneye-007) | hud-value #hud-streak | rgb(90, 74, 16) | rgb(26, 23, 10) | 2.07 | FAIL |
| L17 (goldeneye-007) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(19, 17, 12) | 2.53 | FAIL |
| L17 (goldeneye-007) | level-badge-text | rgb(85, 85, 85) | rgb(25, 22, 14) | 2.42 | FAIL |
| L18 (age-of-empires) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(33, 21, 13) | 2.4 | FAIL |
| L18 (age-of-empires) | prompt-letter.active | rgb(200, 132, 10) | rgb(107, 69, 7) | 2.72 | FAIL |
| L18 (age-of-empires) | hud-value #hud-name | rgb(90, 56, 0) | rgb(20, 11, 2) | 1.85 | FAIL |
| L18 (age-of-empires) | hud-value #hud-accuracy | rgb(90, 56, 0) | rgb(19, 10, 2) | 1.87 | FAIL |
| L18 (age-of-empires) | hud-value #hud-streak | rgb(90, 56, 0) | rgb(22, 12, 2) | 1.84 | FAIL |
| L18 (age-of-empires) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(14, 8, 4) | 2.67 | FAIL |
| L18 (age-of-empires) | level-badge-text | rgb(85, 85, 85) | rgb(28, 19, 8) | 2.45 | FAIL |
| L19 (final-fantasy-vii) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(7, 28, 23) | 2.37 | FAIL |
| L19 (final-fantasy-vii) | prompt-letter.active | rgb(0, 232, 168) | rgb(0, 136, 98) | 2.78 | FAIL |
| L19 (final-fantasy-vii) | hud-value #hud-name | rgb(0, 74, 56) | rgb(0, 16, 12) | 1.89 | FAIL |
| L19 (final-fantasy-vii) | hud-value #hud-accuracy | rgb(0, 74, 56) | rgb(0, 14, 11) | 1.9 | FAIL |
| L19 (final-fantasy-vii) | hud-value #hud-streak | rgb(0, 74, 56) | rgb(0, 17, 13) | 1.88 | FAIL |
| L19 (final-fantasy-vii) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(2, 10, 8) | 2.69 | FAIL |
| L19 (final-fantasy-vii) | level-badge-text | rgb(85, 85, 85) | rgb(6, 12, 10) | 2.65 | FAIL |
| L20 (terminal) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(7, 9, 7) | 2.68 | FAIL |
| L20 (terminal) | prompt-letter.active | rgb(57, 255, 20) | rgb(20, 97, 7) | 5.65 | PASS |
| L20 (terminal) | hud-value #hud-name | rgb(26, 122, 10) | rgb(3, 22, 1) | 3.42 | WARN |
| L20 (terminal) | hud-value #hud-accuracy | rgb(26, 122, 10) | rgb(2, 17, 1) | 3.55 | WARN |
| L20 (terminal) | hud-value #hud-streak | rgb(26, 122, 10) | rgb(3, 20, 1) | 3.48 | WARN |
| L20 (terminal) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(2, 8, 2) | 2.71 | FAIL |
| L20 (terminal) | level-badge-text | rgb(85, 85, 85) | rgb(9, 27, 8) | 2.4 | FAIL |
| L21 (out-run) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(226, 207, 148) | 4.83 | PASS |
| L21 (out-run) | prompt-letter.active | rgb(255, 90, 160) | rgb(92, 64, 77) | 3.14 | WARN |
| L21 (out-run) | hud-value #hud-name | rgb(122, 26, 72) | rgb(48, 15, 56) | 1.65 | FAIL |
| L21 (out-run) | hud-value #hud-accuracy | rgb(122, 26, 72) | rgb(53, 17, 59) | 1.6 | FAIL |
| L21 (out-run) | hud-value #hud-streak | rgb(122, 26, 72) | rgb(61, 20, 61) | 1.52 | FAIL |
| L21 (out-run) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(49, 19, 61) | 2.18 | FAIL |
| L21 (out-run) | level-badge-text | rgb(85, 85, 85) | rgb(54, 28, 61) | 2.03 | FAIL |
| L22 (qbert) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(35, 152, 152) | 2.14 | FAIL |
| L22 (qbert) | prompt-letter.active | rgb(255, 140, 26) | rgb(106, 56, 37) | 4.11 | WARN |
| L22 (qbert) | hud-value #hud-name | rgb(122, 64, 0) | rgb(34, 16, 24) | 2.21 | FAIL |
| L22 (qbert) | hud-value #hud-accuracy | rgb(122, 64, 0) | rgb(32, 15, 26) | 2.24 | FAIL |
| L22 (qbert) | hud-value #hud-streak | rgb(122, 64, 0) | rgb(34, 16, 24) | 2.21 | FAIL |
| L22 (qbert) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(25, 12, 31) | 2.53 | FAIL |
| L22 (qbert) | level-badge-text | rgb(85, 85, 85) | rgb(34, 27, 38) | 2.25 | FAIL |
| L23 (missile-command) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(13, 7, 32) | 2.64 | FAIL |
| L23 (missile-command) | prompt-letter.active | rgb(255, 34, 34) | rgb(19, 2, 30) | 5.22 | PASS |
| L23 (missile-command) | hud-value #hud-name | rgb(122, 10, 10) | rgb(18, 1, 11) | 1.81 | FAIL |
| L23 (missile-command) | hud-value #hud-accuracy | rgb(122, 10, 10) | rgb(15, 1, 12) | 1.82 | FAIL |
| L23 (missile-command) | hud-value #hud-streak | rgb(122, 10, 10) | rgb(19, 1, 12) | 1.81 | FAIL |
| L23 (missile-command) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(6, 2, 15) | 2.75 | FAIL |
| L23 (missile-command) | level-badge-text | rgb(85, 85, 85) | rgb(12, 19, 31) | 2.49 | FAIL |
| L24 (high-score-entry) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(11, 9, 7) | 2.67 | FAIL |
| L24 (high-score-entry) | prompt-letter.active | rgb(255, 215, 0) | rgb(137, 115, 0) | 3.32 | WARN |
| L24 (high-score-entry) | hud-value #hud-name | rgb(122, 90, 0) | rgb(23, 15, 0) | 2.98 | FAIL |
| L24 (high-score-entry) | hud-value #hud-accuracy | rgb(122, 90, 0) | rgb(20, 13, 0) | 3.02 | WARN |
| L24 (high-score-entry) | hud-value #hud-streak | rgb(122, 90, 0) | rgb(24, 16, 0) | 2.96 | FAIL |
| L24 (high-score-entry) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(11, 7, 2) | 2.7 | FAIL |
| L24 (high-score-entry) | level-badge-text | rgb(85, 85, 85) | rgb(35, 25, 6) | 2.33 | FAIL |
| L25 (word-processor) | prompt-label (TYPE THE LETTER) | rgb(85, 85, 85) | rgb(220, 218, 212) | 5.34 | PASS |
| L25 (word-processor) | prompt-letter.active | rgb(143, 208, 255) | rgb(191, 215, 229) | 1.12 | FAIL |
| L25 (word-processor) | hud-value #hud-name | rgb(42, 74, 90) | rgb(27, 34, 42) | 1.7 | FAIL |
| L25 (word-processor) | hud-value #hud-accuracy | rgb(42, 74, 90) | rgb(26, 32, 40) | 1.73 | FAIL |
| L25 (word-processor) | hud-value #hud-streak | rgb(42, 74, 90) | rgb(26, 33, 41) | 1.71 | FAIL |
| L25 (word-processor) | hud-line label text (ACCURACY, mixed-color line, contextual only) | rgb(85, 85, 85) | rgb(28, 31, 38) | 2.22 | FAIL |
| L25 (word-processor) | level-badge-text | rgb(85, 85, 85) | rgb(19, 26, 31) | 2.36 | FAIL |

## Game Screen — Keyboard Guide key-boxes (5 sampled per level)

| Level | Element | Text Color | Sampled BG | Ratio | Verdict |
| --- | --- | --- | --- | --- | --- |
| L1 (breakout) | key-box[0]="F" | rgb(26, 122, 10) | rgb(9, 13, 9) | 3.58 | WARN |
| L1 (breakout) | key-box[1]="J" (active-key) | rgb(57, 255, 20) | rgb(14, 38, 10) | 11.97 | PASS |
| L2 (space-invaders) | key-box[0]="D" (active-key) | rgb(255, 255, 0) | rgb(46, 46, 8) | 12.95 | PASS |
| L2 (space-invaders) | key-box[1]="F" | rgb(122, 122, 0) | rgb(12, 12, 9) | 4.3 | WARN |
| L2 (space-invaders) | key-box[2]="J" | rgb(122, 122, 0) | rgb(13, 13, 9) | 4.29 | WARN |
| L2 (space-invaders) | key-box[3]="K" | rgb(122, 122, 0) | rgb(11, 11, 9) | 4.33 | WARN |
| L3 (pac-man) | key-box[0]="S" (active-key) | rgb(102, 204, 255) | rgb(21, 36, 51) | 8.76 | PASS |
| L3 (pac-man) | key-box[1]="D" | rgb(34, 68, 102) | rgb(11, 14, 25) | 1.91 | FAIL |
| L3 (pac-man) | key-box[3]="J" | rgb(34, 68, 102) | rgb(10, 12, 22) | 1.94 | FAIL |
| L3 (pac-man) | key-box[4]="K" | rgb(34, 68, 102) | rgb(10, 11, 21) | 1.95 | FAIL |
| L3 (pac-man) | key-box[5]="L" | rgb(34, 68, 102) | rgb(10, 12, 22) | 1.94 | FAIL |
| L4 (galaga) | key-box[0]="A" (active-key) | rgb(255, 0, 255) | rgb(46, 0, 52) | 5.74 | PASS |
| L4 (galaga) | key-box[2]="D" | rgb(102, 0, 102) | rgb(15, 0, 21) | 1.7 | FAIL |
| L4 (galaga) | key-box[4]="J" | rgb(102, 0, 102) | rgb(15, 0, 21) | 1.7 | FAIL |
| L4 (galaga) | key-box[5]="K" | rgb(102, 0, 102) | rgb(14, 0, 20) | 1.71 | FAIL |
| L4 (galaga) | key-box[7]="?" | rgb(102, 0, 255) | rgb(20, 0, 45) | 2.82 | FAIL |
| L5 (joust) | key-box[0]="A" | rgb(122, 64, 0) | rgb(14, 9, 0) | 2.42 | FAIL |
| L5 (joust) | key-box[2]="D" | rgb(122, 64, 0) | rgb(14, 9, 0) | 2.42 | FAIL |
| L5 (joust) | key-box[5]="H" | rgb(122, 64, 0) | rgb(17, 11, 0) | 2.39 | FAIL |
| L5 (joust) | key-box[7]="K" | rgb(122, 64, 0) | rgb(12, 9, 0) | 2.43 | FAIL |
| L5 (joust) | key-box[9]="?" | rgb(122, 64, 0) | rgb(12, 9, 0) | 2.43 | FAIL |
| L6 (donkey-kong) | key-box[0]="A" | rgb(106, 0, 0) | rgb(34, 17, 0) | 1.41 | FAIL |
| L6 (donkey-kong) | key-box[3]="F" | rgb(106, 0, 0) | rgb(30, 16, 4) | 1.42 | FAIL |
| L6 (donkey-kong) | key-box[6]="J" | rgb(106, 0, 0) | rgb(39, 19, 5) | 1.36 | FAIL |
| L6 (donkey-kong) | key-box[8]="L" | rgb(106, 0, 0) | rgb(25, 10, 0) | 1.49 | FAIL |
| L6 (donkey-kong) | key-box[11]="I" | rgb(106, 0, 0) | rgb(34, 18, 1) | 1.4 | FAIL |
| L7 (dragons-lair) | key-box[0]="A" | rgb(85, 0, 136) | rgb(10, 0, 10) | 1.71 | FAIL |
| L7 (dragons-lair) | key-box[3]="F" | rgb(85, 0, 136) | rgb(7, 0, 6) | 1.72 | FAIL |
| L7 (dragons-lair) | key-box[7]="K" | rgb(85, 0, 136) | rgb(8, 0, 8) | 1.72 | FAIL |
| L7 (dragons-lair) | key-box[10]="E" | rgb(85, 0, 136) | rgb(7, 0, 6) | 1.72 | FAIL |
| L7 (dragons-lair) | key-box[13]="U" | rgb(85, 0, 136) | rgb(12, 1, 13) | 1.7 | FAIL |
| L8 (tetris) | key-box[0]="A" | rgb(0, 102, 85) | rgb(0, 10, 24) | 2.87 | FAIL |
| L8 (tetris) | key-box[4]="G" | rgb(0, 102, 85) | rgb(0, 14, 30) | 2.8 | FAIL |
| L8 (tetris) | key-box[8]="L" | rgb(0, 102, 85) | rgb(0, 11, 26) | 2.85 | FAIL |
| L8 (tetris) | key-box[11]="I" | rgb(0, 102, 85) | rgb(0, 12, 29) | 2.83 | FAIL |
| L8 (tetris) | key-box[15]="Y" | rgb(0, 102, 85) | rgb(0, 13, 27) | 2.82 | FAIL |
| L9 (super-mario-bros) | key-box[0]="A" | rgb(26, 48, 96) | rgb(82, 133, 226) | 3.54 | WARN |
| L9 (super-mario-bros) | key-box[4]="G" | rgb(26, 48, 96) | rgb(83, 134, 228) | 3.6 | WARN |
| L9 (super-mario-bros) | key-box[9]="?" | rgb(26, 48, 96) | rgb(79, 136, 217) | 3.59 | WARN |
| L9 (super-mario-bros) | key-box[13]="U" | rgb(26, 48, 96) | rgb(83, 134, 228) | 3.6 | WARN |
| L9 (super-mario-bros) | key-box[17]="O" | rgb(26, 48, 96) | rgb(82, 133, 227) | 3.54 | WARN |
| L10 (legend-of-zelda) | key-box[0]="A" | rgb(136, 96, 32) | rgb(5, 9, 4) | 3.57 | WARN |
| L10 (legend-of-zelda) | key-box[5]="H" | rgb(136, 96, 32) | rgb(14, 26, 8) | 3.19 | WARN |
| L10 (legend-of-zelda) | key-box[10]="E" | rgb(136, 96, 32) | rgb(9, 22, 7) | 3.31 | WARN |
| L10 (legend-of-zelda) | key-box[14]="T" | rgb(136, 96, 32) | rgb(10, 23, 7) | 3.28 | WARN |
| L10 (legend-of-zelda) | key-box[19]="P" | rgb(136, 96, 32) | rgb(6, 10, 4) | 3.55 | WARN |
| L11 (sonic) | key-box[0]="A" | rgb(10, 90, 32) | rgb(27, 88, 29) | 1.01 | FAIL |
| L11 (sonic) | key-box[5]="H" | rgb(10, 90, 32) | rgb(30, 96, 32) | 1.1 | FAIL |
| L11 (sonic) | key-box[11]="I" | rgb(10, 90, 32) | rgb(31, 97, 32) | 1.12 | FAIL |
| L11 (sonic) | key-box[16]="W" | rgb(10, 90, 32) | rgb(30, 95, 31) | 1.09 | FAIL |
| L11 (sonic) | key-box[21]="M" | rgb(10, 90, 32) | rgb(27, 89, 29) | 1 | FAIL |
| L12 (street-fighter-ii) | key-box[0]="A" | rgb(122, 24, 0) | rgb(44, 7, 0) | 1.72 | FAIL |
| L12 (street-fighter-ii) | key-box[6]="J" | rgb(122, 24, 0) | rgb(114, 25, 10) | 1.05 | FAIL |
| L12 (street-fighter-ii) | key-box[12]="R" | rgb(122, 24, 0) | rgb(114, 25, 9) | 1.05 | FAIL |
| L12 (street-fighter-ii) | key-box[17]="O" | rgb(122, 24, 0) | rgb(114, 25, 9) | 1.05 | FAIL |
| L12 (street-fighter-ii) | key-box[23]="N" | rgb(122, 24, 0) | rgb(48, 7, 0) | 1.69 | FAIL |
| L13 (myst) | key-box[0]="A" | rgb(42, 56, 72) | rgb(13, 18, 34) | 1.56 | FAIL |
| L13 (myst) | key-box[6]="J" | rgb(42, 56, 72) | rgb(15, 21, 40) | 1.52 | FAIL |
| L13 (myst) | key-box[13]="U" | rgb(42, 56, 72) | rgb(23, 27, 40) | 1.44 | FAIL |
| L13 (myst) | key-box[19]="P" | rgb(42, 56, 72) | rgb(16, 22, 41) | 1.51 | FAIL |
| L13 (myst) | key-box[25]="," | rgb(42, 56, 72) | rgb(16, 22, 38) | 1.51 | FAIL |
| L14 (donkey-kong-country) | key-box[0]="A" | rgb(26, 90, 26) | rgb(16, 65, 20) | 1.4 | FAIL |
| L14 (donkey-kong-country) | key-box[7]="K" | rgb(26, 90, 26) | rgb(17, 66, 25) | 1.39 | FAIL |
| L14 (donkey-kong-country) | key-box[14]="T" | rgb(26, 90, 26) | rgb(17, 65, 25) | 1.4 | FAIL |
| L14 (donkey-kong-country) | key-box[20]="V" | rgb(26, 90, 26) | rgb(17, 66, 25) | 1.39 | FAIL |
| L14 (donkey-kong-country) | key-box[27]="." | rgb(26, 90, 26) | rgb(17, 73, 20) | 1.27 | FAIL |
| L15 (pokemon) | key-box[0]="A" | rgb(136, 102, 0) | rgb(164, 149, 96) | 1.78 | FAIL |
| L15 (pokemon) | key-box[7]="K" | rgb(136, 102, 0) | rgb(132, 122, 78) | 1.24 | FAIL |
| L15 (pokemon) | key-box[15]="Y" | rgb(136, 102, 0) | rgb(194, 176, 115) | 2.46 | FAIL |
| L15 (pokemon) | key-box[22]="B" | rgb(136, 102, 0) | rgb(194, 176, 115) | 2.46 | FAIL |
| L15 (pokemon) | key-box[29]="/" | rgb(136, 102, 0) | rgb(168, 152, 99) | 1.86 | FAIL |
| L16 (simcity-2000) | key-box[0]="A" | rgb(26, 58, 90) | rgb(7, 21, 42) | 1.56 | FAIL |
| L16 (simcity-2000) | key-box[8]="L" | rgb(26, 58, 90) | rgb(9, 25, 49) | 1.5 | FAIL |
| L16 (simcity-2000) | key-box[16]="W" | rgb(26, 58, 90) | rgb(9, 25, 50) | 1.5 | FAIL |
| L16 (simcity-2000) | key-box[23]="N" | rgb(26, 58, 90) | rgb(9, 26, 50) | 1.5 | FAIL |
| L16 (simcity-2000) | key-box[31]="6" | rgb(26, 58, 90) | rgb(8, 23, 45) | 1.53 | FAIL |
| L17 (goldeneye-007) | key-box[0]="A" | rgb(90, 74, 16) | rgb(24, 20, 7) | 2.12 | FAIL |
| L17 (goldeneye-007) | key-box[8]="L" | rgb(90, 74, 16) | rgb(29, 25, 9) | 2.03 | FAIL |
| L17 (goldeneye-007) | key-box[17]="O" | rgb(90, 74, 16) | rgb(29, 25, 9) | 2.03 | FAIL |
| L17 (goldeneye-007) | key-box[25]="," | rgb(90, 74, 16) | rgb(27, 23, 9) | 2.06 | FAIL |
| L17 (goldeneye-007) | key-box[33]="7" | rgb(90, 74, 16) | rgb(26, 22, 8) | 2.08 | FAIL |
| L18 (age-of-empires) | key-box[0]="A" | rgb(90, 56, 0) | rgb(52, 32, 5) | 1.47 | FAIL |
| L18 (age-of-empires) | key-box[9]="?" | rgb(90, 56, 0) | rgb(61, 37, 6) | 1.37 | FAIL |
| L18 (age-of-empires) | key-box[18]="Q" | rgb(90, 56, 0) | rgb(60, 37, 6) | 1.37 | FAIL |
| L18 (age-of-empires) | key-box[26]="X" | rgb(90, 56, 0) | rgb(61, 37, 5) | 1.36 | FAIL |
| L18 (age-of-empires) | key-box[35]="8" | rgb(90, 56, 0) | rgb(54, 33, 4) | 1.45 | FAIL |
| L19 (final-fantasy-vii) | key-box[0]="A" | rgb(0, 74, 56) | rgb(0, 41, 31) | 1.52 | FAIL |
| L19 (final-fantasy-vii) | key-box[9]="?" | rgb(0, 74, 56) | rgb(0, 50, 38) | 1.37 | FAIL |
| L19 (final-fantasy-vii) | key-box[19]="P" | rgb(0, 74, 56) | rgb(0, 55, 41) | 1.29 | FAIL |
| L19 (final-fantasy-vii) | key-box[28]="Z" | rgb(0, 74, 56) | rgb(0, 51, 38) | 1.36 | FAIL |
| L19 (final-fantasy-vii) | key-box[37]="9" | rgb(0, 74, 56) | rgb(0, 45, 33) | 1.46 | FAIL |
| L20 (terminal) | key-box[0]="A" | rgb(26, 122, 10) | rgb(10, 51, 4) | 2.58 | FAIL |
| L20 (terminal) | key-box[10]="E" | rgb(26, 122, 10) | rgb(11, 54, 4) | 2.47 | FAIL |
| L20 (terminal) | key-box[20]="V" | rgb(26, 122, 10) | rgb(12, 58, 5) | 2.38 | FAIL |
| L20 (terminal) | key-box[29]="/" | rgb(26, 122, 10) | rgb(11, 54, 4) | 2.48 | FAIL |
| L20 (terminal) | key-box[39]="0" | rgb(26, 122, 10) | rgb(11, 54, 4) | 2.48 | FAIL |
| L21 (out-run) | key-box[0]="A" | rgb(122, 26, 72) | rgb(61, 75, 59) | 1.1 | FAIL |
| L21 (out-run) | key-box[10]="E" | rgb(122, 26, 72) | rgb(81, 78, 67) | 1.22 | FAIL |
| L21 (out-run) | key-box[21]="M" | rgb(122, 26, 72) | rgb(74, 27, 58) | 1.37 | FAIL |
| L21 (out-run) | key-box[31]="6" | rgb(122, 26, 72) | rgb(76, 81, 68) | 1.24 | FAIL |
| L21 (out-run) | key-box[41]="=" | rgb(122, 26, 72) | rgb(66, 75, 62) | 1.12 | FAIL |
| L22 (qbert) | key-box[0]="A" | rgb(122, 64, 0) | rgb(57, 29, 17) | 1.89 | FAIL |
| L22 (qbert) | key-box[11]="I" | rgb(122, 64, 0) | rgb(62, 31, 22) | 1.81 | FAIL |
| L22 (qbert) | key-box[22]="B" | rgb(122, 64, 0) | rgb(65, 33, 21) | 1.76 | FAIL |
| L22 (qbert) | key-box[33]="7" | rgb(122, 64, 0) | rgb(64, 32, 21) | 1.78 | FAIL |
| L22 (qbert) | key-box[44]="\" | rgb(122, 64, 0) | rgb(54, 27, 19) | 1.93 | FAIL |
| L23 (missile-command) | key-box[0]="A" | rgb(122, 10, 10) | rgb(46, 3, 16) | 1.64 | FAIL |
| L23 (missile-command) | key-box[12]="R" | rgb(122, 10, 10) | rgb(54, 4, 19) | 1.59 | FAIL |
| L23 (missile-command) | key-box[23]="N" | rgb(122, 10, 10) | rgb(55, 4, 19) | 1.58 | FAIL |
| L23 (missile-command) | key-box[35]="8" | rgb(122, 10, 10) | rgb(55, 4, 19) | 1.58 | FAIL |
| L23 (missile-command) | key-box[46]="'" | rgb(122, 10, 10) | rgb(49, 4, 17) | 1.63 | FAIL |
| L24 (high-score-entry) | key-box[0]="⇧" (active-key) | rgb(255, 215, 0) | rgb(65, 52, 0) | 8.69 | PASS |
| L24 (high-score-entry) | key-box[7]="G" | rgb(122, 90, 0) | rgb(9, 6, 0) | 3.18 | WARN |
| L24 (high-score-entry) | key-box[13]="M" | rgb(122, 90, 0) | rgb(10, 7, 0) | 3.16 | WARN |
| L24 (high-score-entry) | key-box[20]="T" | rgb(122, 90, 0) | rgb(5, 3, 0) | 3.23 | WARN |
| L24 (high-score-entry) | key-box[26]="Z" | rgb(122, 90, 0) | rgb(12, 7, 0) | 3.15 | WARN |
| L25 (word-processor) | key-box[0]="A" | rgb(42, 74, 90) | rgb(25, 32, 40) | 1.74 | FAIL |
| L25 (word-processor) | key-box[7]="H" | rgb(42, 74, 90) | rgb(159, 163, 164) | 3.72 | WARN |
| L25 (word-processor) | key-box[15]="P" | rgb(42, 74, 90) | rgb(218, 220, 217) | 6.84 | PASS |
| L25 (word-processor) | key-box[22]="W" | rgb(42, 74, 90) | rgb(128, 134, 136) | 2.55 | FAIL |
| L25 (word-processor) | key-box[29]="'" | rgb(42, 74, 90) | rgb(24, 31, 39) | 1.76 | FAIL |

## Level-Complete Overlay (per level)

| Level | Element | Text Color | Sampled BG | Ratio | Verdict |
| --- | --- | --- | --- | --- | --- |
| L1 (breakout) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(76, 53, 2) | 6.31 | PASS |
| L1 (breakout) | complete-stat TIME | rgb(85, 85, 85) | rgb(6, 11, 5) | 2.67 | FAIL |
| L1 (breakout) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(5, 8, 5) | 2.7 | FAIL |
| L1 (breakout) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(6, 6, 6) | 2.72 | FAIL |
| L1 (breakout) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(5, 6, 5) | 2.72 | FAIL |
| L1 (breakout) | complete-prompt | rgb(57, 255, 20) | rgb(11, 44, 5) | 11.2 | PASS |
| L2 (space-invaders) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(77, 53, 2) | 6.29 | PASS |
| L2 (space-invaders) | complete-stat TIME | rgb(85, 85, 85) | rgb(12, 12, 5) | 2.63 | FAIL |
| L2 (space-invaders) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(8, 8, 5) | 2.7 | FAIL |
| L2 (space-invaders) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(6, 6, 6) | 2.72 | FAIL |
| L2 (space-invaders) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(6, 6, 5) | 2.72 | FAIL |
| L2 (space-invaders) | complete-prompt | rgb(255, 255, 0) | rgb(54, 54, 2) | 11.52 | PASS |
| L3 (pac-man) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(96, 66, 3) | 5.05 | PASS |
| L3 (pac-man) | complete-stat TIME | rgb(85, 85, 85) | rgb(7, 10, 13) | 2.67 | FAIL |
| L3 (pac-man) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(5, 7, 10) | 2.7 | FAIL |
| L3 (pac-man) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(5, 5, 7) | 2.74 | FAIL |
| L3 (pac-man) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(5, 5, 7) | 2.73 | FAIL |
| L3 (pac-man) | complete-prompt | rgb(102, 204, 255) | rgb(30, 60, 77) | 6.45 | PASS |
| L4 (galaga) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(85, 56, 5) | 5.88 | PASS |
| L4 (galaga) | complete-stat TIME | rgb(85, 85, 85) | rgb(13, 2, 15) | 2.73 | FAIL |
| L4 (galaga) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(8, 2, 11) | 2.75 | FAIL |
| L4 (galaga) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(6, 3, 8) | 2.75 | FAIL |
| L4 (galaga) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(7, 3, 9) | 2.75 | FAIL |
| L4 (galaga) | complete-prompt | rgb(255, 0, 255) | rgb(57, 0, 60) | 5.4 | PASS |
| L5 (joust) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(85, 58, 0) | 5.79 | PASS |
| L5 (joust) | complete-stat TIME | rgb(85, 85, 85) | rgb(11, 7, 2) | 2.69 | FAIL |
| L5 (joust) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(8, 6, 2) | 2.72 | FAIL |
| L5 (joust) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(5, 5, 3) | 2.73 | FAIL |
| L5 (joust) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(6, 5, 3) | 2.73 | FAIL |
| L5 (joust) | complete-prompt | rgb(255, 140, 0) | rgb(54, 30, 0) | 6.7 | PASS |
| L6 (donkey-kong) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(84, 57, 0) | 5.86 | PASS |
| L6 (donkey-kong) | complete-stat TIME | rgb(85, 85, 85) | rgb(11, 4, 3) | 2.73 | FAIL |
| L6 (donkey-kong) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(7, 4, 3) | 2.75 | FAIL |
| L6 (donkey-kong) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(5, 4, 3) | 2.75 | FAIL |
| L6 (donkey-kong) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(5, 4, 3) | 2.75 | FAIL |
| L6 (donkey-kong) | complete-prompt | rgb(232, 32, 32) | rgb(58, 12, 6) | 3.76 | WARN |
| L7 (dragons-lair) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(84, 56, 1) | 5.91 | PASS |
| L7 (dragons-lair) | complete-stat TIME | rgb(85, 85, 85) | rgb(10, 5, 11) | 2.71 | FAIL |
| L7 (dragons-lair) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(7, 3, 6) | 2.75 | FAIL |
| L7 (dragons-lair) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(5, 3, 4) | 2.76 | FAIL |
| L7 (dragons-lair) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(5, 3, 4) | 2.76 | FAIL |
| L7 (dragons-lair) | complete-prompt | rgb(204, 102, 255) | rgb(40, 19, 49) | 5.64 | PASS |
| L8 (tetris) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(74, 52, 7) | 6.4 | PASS |
| L8 (tetris) | complete-stat TIME | rgb(85, 85, 85) | rgb(2, 8, 13) | 2.7 | FAIL |
| L8 (tetris) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(2, 7, 12) | 2.72 | FAIL |
| L8 (tetris) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(3, 5, 10) | 2.74 | FAIL |
| L8 (tetris) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(2, 5, 10) | 2.74 | FAIL |
| L8 (tetris) | complete-prompt | rgb(0, 255, 255) | rgb(0, 40, 44) | 12.55 | PASS |
| L9 (super-mario-bros) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(97, 95, 86) | 3.49 | WARN |
| L9 (super-mario-bros) | complete-stat TIME | rgb(85, 85, 85) | rgb(35, 57, 96) | 1.55 | FAIL |
| L9 (super-mario-bros) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(36, 57, 96) | 1.55 | FAIL |
| L9 (super-mario-bros) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(35, 56, 94) | 1.56 | FAIL |
| L9 (super-mario-bros) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(35, 56, 94) | 1.56 | FAIL |
| L9 (super-mario-bros) | complete-prompt | rgb(92, 148, 252) | rgb(42, 69, 118) | 3.23 | WARN |
| L10 (legend-of-zelda) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(77, 58, 2) | 5.98 | PASS |
| L10 (legend-of-zelda) | complete-stat TIME | rgb(85, 85, 85) | rgb(11, 15, 5) | 2.6 | FAIL |
| L10 (legend-of-zelda) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(8, 12, 5) | 2.64 | FAIL |
| L10 (legend-of-zelda) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(6, 11, 5) | 2.67 | FAIL |
| L10 (legend-of-zelda) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(6, 10, 4) | 2.67 | FAIL |
| L10 (legend-of-zelda) | complete-prompt | rgb(232, 208, 64) | rgb(38, 39, 11) | 9.84 | PASS |
| L11 (sonic) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(99, 99, 17) | 3.44 | WARN |
| L11 (sonic) | complete-stat TIME | rgb(85, 85, 85) | rgb(21, 53, 21) | 1.82 | FAIL |
| L11 (sonic) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(20, 52, 21) | 1.84 | FAIL |
| L11 (sonic) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(23, 50, 20) | 1.87 | FAIL |
| L11 (sonic) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(15, 37, 13) | 2.18 | FAIL |
| L11 (sonic) | complete-prompt | rgb(35, 211, 83) | rgb(14, 69, 24) | 5.61 | PASS |
| L12 (street-fighter-ii) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(96, 81, 52) | 4.2 | WARN |
| L12 (street-fighter-ii) | complete-stat TIME | rgb(85, 85, 85) | rgb(26, 33, 59) | 2.12 | FAIL |
| L12 (street-fighter-ii) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(35, 21, 29) | 2.35 | FAIL |
| L12 (street-fighter-ii) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(39, 11, 7) | 2.47 | FAIL |
| L12 (street-fighter-ii) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(39, 11, 6) | 2.48 | FAIL |
| L12 (street-fighter-ii) | complete-prompt | rgb(255, 68, 0) | rgb(78, 18, 1) | 4.31 | WARN |
| L13 (myst) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(87, 62, 8) | 5.49 | PASS |
| L13 (myst) | complete-stat TIME | rgb(85, 85, 85) | rgb(11, 13, 17) | 2.6 | FAIL |
| L13 (myst) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(11, 13, 17) | 2.62 | FAIL |
| L13 (myst) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(8, 10, 15) | 2.65 | FAIL |
| L13 (myst) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(7, 9, 14) | 2.68 | FAIL |
| L13 (myst) | complete-prompt | rgb(128, 160, 184) | rgb(30, 38, 47) | 5.59 | PASS |
| L14 (donkey-kong-country) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(82, 55, 19) | 6 | PASS |
| L14 (donkey-kong-country) | complete-stat TIME | rgb(85, 85, 85) | rgb(9, 24, 15) | 2.45 | FAIL |
| L14 (donkey-kong-country) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(7, 23, 11) | 2.48 | FAIL |
| L14 (donkey-kong-country) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(7, 24, 11) | 2.47 | FAIL |
| L14 (donkey-kong-country) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(6, 22, 10) | 2.5 | FAIL |
| L14 (donkey-kong-country) | complete-prompt | rgb(68, 204, 68) | rgb(14, 50, 17) | 6.75 | PASS |
| L15 (pokemon) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(138, 100, 35) | 2.92 | FAIL |
| L15 (pokemon) | complete-stat TIME | rgb(85, 85, 85) | rgb(74, 68, 47) | 1.3 | FAIL |
| L15 (pokemon) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(72, 67, 49) | 1.33 | FAIL |
| L15 (pokemon) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(70, 65, 49) | 1.37 | FAIL |
| L15 (pokemon) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(66, 61, 45) | 1.45 | FAIL |
| L15 (pokemon) | complete-prompt | rgb(255, 204, 0) | rgb(99, 87, 40) | 4.74 | PASS |
| L16 (simcity-2000) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(83, 61, 9) | 5.64 | PASS |
| L16 (simcity-2000) | complete-stat TIME | rgb(85, 85, 85) | rgb(5, 11, 19) | 2.65 | FAIL |
| L16 (simcity-2000) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(4, 10, 16) | 2.67 | FAIL |
| L16 (simcity-2000) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(4, 9, 15) | 2.68 | FAIL |
| L16 (simcity-2000) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(5, 9, 16) | 2.68 | FAIL |
| L16 (simcity-2000) | complete-prompt | rgb(68, 136, 204) | rgb(15, 33, 53) | 4.38 | WARN |
| L17 (goldeneye-007) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(85, 59, 2) | 5.69 | PASS |
| L17 (goldeneye-007) | complete-stat TIME | rgb(85, 85, 85) | rgb(11, 10, 6) | 2.66 | FAIL |
| L17 (goldeneye-007) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(8, 8, 5) | 2.69 | FAIL |
| L17 (goldeneye-007) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(5, 5, 5) | 2.73 | FAIL |
| L17 (goldeneye-007) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(6, 5, 5) | 2.73 | FAIL |
| L17 (goldeneye-007) | complete-prompt | rgb(200, 168, 64) | rgb(39, 33, 13) | 6.94 | PASS |
| L18 (age-of-empires) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(100, 67, 1) | 4.87 | PASS |
| L18 (age-of-empires) | complete-stat TIME | rgb(85, 85, 85) | rgb(14, 10, 4) | 2.65 | FAIL |
| L18 (age-of-empires) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(11, 8, 4) | 2.69 | FAIL |
| L18 (age-of-empires) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(9, 7, 5) | 2.7 | FAIL |
| L18 (age-of-empires) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(9, 7, 5) | 2.7 | FAIL |
| L18 (age-of-empires) | complete-prompt | rgb(200, 132, 10) | rgb(64, 41, 3) | 4.37 | WARN |
| L19 (final-fantasy-vii) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(75, 58, 6) | 6.01 | PASS |
| L19 (final-fantasy-vii) | complete-stat TIME | rgb(85, 85, 85) | rgb(2, 18, 13) | 2.58 | FAIL |
| L19 (final-fantasy-vii) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(2, 13, 10) | 2.64 | FAIL |
| L19 (final-fantasy-vii) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(3, 14, 11) | 2.63 | FAIL |
| L19 (final-fantasy-vii) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(2, 14, 11) | 2.63 | FAIL |
| L19 (final-fantasy-vii) | complete-prompt | rgb(0, 232, 168) | rgb(0, 47, 34) | 9.15 | PASS |
| L20 (terminal) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(83, 57, 1) | 5.87 | PASS |
| L20 (terminal) | complete-stat TIME | rgb(85, 85, 85) | rgb(3, 9, 2) | 2.69 | FAIL |
| L20 (terminal) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(3, 6, 2) | 2.73 | FAIL |
| L20 (terminal) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(3, 4, 3) | 2.75 | FAIL |
| L20 (terminal) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(3, 4, 3) | 2.75 | FAIL |
| L20 (terminal) | complete-prompt | rgb(57, 255, 20) | rgb(12, 61, 3) | 9.22 | PASS |
| L21 (out-run) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(143, 105, 40) | 2.71 | FAIL |
| L21 (out-run) | complete-stat TIME | rgb(85, 85, 85) | rgb(20, 39, 26) | 2.12 | FAIL |
| L21 (out-run) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(23, 28, 24) | 2.32 | FAIL |
| L21 (out-run) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(20, 16, 23) | 2.52 | FAIL |
| L21 (out-run) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(21, 13, 22) | 2.56 | FAIL |
| L21 (out-run) | complete-prompt | rgb(255, 90, 160) | rgb(60, 20, 41) | 5.47 | PASS |
| L22 (qbert) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(77, 86, 43) | 4.27 | WARN |
| L22 (qbert) | complete-stat TIME | rgb(85, 85, 85) | rgb(18, 9, 18) | 2.62 | FAIL |
| L22 (qbert) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(16, 8, 19) | 2.64 | FAIL |
| L22 (qbert) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(14, 7, 19) | 2.66 | FAIL |
| L22 (qbert) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(15, 7, 19) | 2.66 | FAIL |
| L22 (qbert) | complete-prompt | rgb(255, 140, 26) | rgb(59, 31, 10) | 6.54 | PASS |
| L23 (missile-command) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(77, 51, 9) | 6.42 | PASS |
| L23 (missile-command) | complete-stat TIME | rgb(85, 85, 85) | rgb(7, 2, 12) | 2.75 | FAIL |
| L23 (missile-command) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(7, 2, 12) | 2.75 | FAIL |
| L23 (missile-command) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(5, 3, 13) | 2.75 | FAIL |
| L23 (missile-command) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(5, 2, 13) | 2.75 | FAIL |
| L23 (missile-command) | complete-prompt | rgb(255, 34, 34) | rgb(49, 5, 12) | 4.75 | PASS |
| L24 (high-score-entry) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(90, 61, 0) | 5.48 | PASS |
| L24 (high-score-entry) | complete-stat TIME | rgb(85, 85, 85) | rgb(12, 10, 3) | 2.66 | FAIL |
| L24 (high-score-entry) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(7, 6, 3) | 2.72 | FAIL |
| L24 (high-score-entry) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(4, 3, 3) | 2.76 | FAIL |
| L24 (high-score-entry) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(5, 4, 3) | 2.75 | FAIL |
| L24 (high-score-entry) | complete-prompt | rgb(255, 215, 0) | rgb(62, 51, 0) | 8.91 | PASS |
| L25 (word-processor) | complete-title (LEVEL COMPLETE) | rgb(255, 176, 0) | rgb(143, 117, 59) | 2.41 | FAIL |
| L25 (word-processor) | complete-stat TIME | rgb(85, 85, 85) | rgb(70, 72, 72) | 1.24 | FAIL |
| L25 (word-processor) | complete-stat ACCURACY | rgb(85, 85, 85) | rgb(71, 71, 71) | 1.24 | FAIL |
| L25 (word-processor) | complete-stat BEST STREAK | rgb(85, 85, 85) | rgb(71, 70, 69) | 1.27 | FAIL |
| L25 (word-processor) | complete-stat KEYS MASTERED | rgb(85, 85, 85) | rgb(70, 70, 69) | 1.27 | FAIL |
| L25 (word-processor) | complete-prompt | rgb(143, 208, 255) | rgb(89, 102, 109) | 3.57 | WARN |

## Pause Overlay (per level)

| Level | Element | Text Color | Sampled BG | Ratio | Verdict |
| --- | --- | --- | --- | --- | --- |
| L1 (breakout) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(66, 47, 1) | 7 | PASS |
| L1 (breakout) | pause-option (ESC) | rgb(85, 85, 85) | rgb(2, 6, 2) | 2.74 | FAIL |
| L1 (breakout) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 14, 11) | 2.6 | FAIL |
| L2 (space-invaders) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(68, 48, 1) | 6.86 | PASS |
| L2 (space-invaders) | pause-option (ESC) | rgb(85, 85, 85) | rgb(2, 6, 2) | 2.74 | FAIL |
| L2 (space-invaders) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 14, 11) | 2.6 | FAIL |
| L3 (pac-man) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(66, 47, 4) | 6.96 | PASS |
| L3 (pac-man) | pause-option (ESC) | rgb(85, 85, 85) | rgb(2, 6, 3) | 2.73 | FAIL |
| L3 (pac-man) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 14, 12) | 2.6 | FAIL |
| L4 (galaga) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(68, 45, 5) | 7.07 | PASS |
| L4 (galaga) | pause-option (ESC) | rgb(85, 85, 85) | rgb(3, 5, 3) | 2.74 | FAIL |
| L4 (galaga) | pause-option (Q) | rgb(85, 85, 85) | rgb(12, 14, 12) | 2.61 | FAIL |
| L5 (joust) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(68, 47, 0) | 6.95 | PASS |
| L5 (joust) | pause-option (ESC) | rgb(85, 85, 85) | rgb(2, 6, 1) | 2.74 | FAIL |
| L5 (joust) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 14, 10) | 2.6 | FAIL |
| L6 (donkey-kong) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(68, 45, 0) | 7.07 | PASS |
| L6 (donkey-kong) | pause-option (ESC) | rgb(85, 85, 85) | rgb(2, 5, 1) | 2.75 | FAIL |
| L6 (donkey-kong) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 14, 10) | 2.61 | FAIL |
| L7 (dragons-lair) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(68, 46, 3) | 7.03 | PASS |
| L7 (dragons-lair) | pause-option (ESC) | rgb(85, 85, 85) | rgb(2, 5, 1) | 2.75 | FAIL |
| L7 (dragons-lair) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 14, 10) | 2.61 | FAIL |
| L8 (tetris) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(65, 46, 3) | 7.1 | PASS |
| L8 (tetris) | pause-option (ESC) | rgb(85, 85, 85) | rgb(1, 6, 4) | 2.74 | FAIL |
| L8 (tetris) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 14, 13) | 2.6 | FAIL |
| L9 (super-mario-bros) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(74, 60, 26) | 5.87 | PASS |
| L9 (super-mario-bros) | pause-option (ESC) | rgb(85, 85, 85) | rgb(14, 26, 37) | 2.36 | FAIL |
| L9 (super-mario-bros) | pause-option (Q) | rgb(85, 85, 85) | rgb(22, 32, 42) | 2.21 | FAIL |
| L10 (legend-of-zelda) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(70, 50, 1) | 6.72 | PASS |
| L10 (legend-of-zelda) | pause-option (ESC) | rgb(85, 85, 85) | rgb(3, 8, 1) | 2.71 | FAIL |
| L10 (legend-of-zelda) | pause-option (Q) | rgb(85, 85, 85) | rgb(12, 16, 10) | 2.57 | FAIL |
| L11 (sonic) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(71, 63, 7) | 5.79 | PASS |
| L11 (sonic) | pause-option (ESC) | rgb(85, 85, 85) | rgb(11, 29, 10) | 2.35 | FAIL |
| L11 (sonic) | pause-option (Q) | rgb(85, 85, 85) | rgb(17, 31, 15) | 2.3 | FAIL |
| L12 (street-fighter-ii) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(73, 56, 20) | 6.19 | PASS |
| L12 (street-fighter-ii) | pause-option (ESC) | rgb(85, 85, 85) | rgb(20, 9, 2) | 2.64 | FAIL |
| L12 (street-fighter-ii) | pause-option (Q) | rgb(85, 85, 85) | rgb(26, 17, 11) | 2.5 | FAIL |
| L13 (myst) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(68, 48, 5) | 6.84 | PASS |
| L13 (myst) | pause-option (ESC) | rgb(85, 85, 85) | rgb(4, 9, 7) | 2.69 | FAIL |
| L13 (myst) | pause-option (Q) | rgb(85, 85, 85) | rgb(12, 16, 15) | 2.57 | FAIL |
| L14 (donkey-kong-country) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(68, 49, 7) | 6.79 | PASS |
| L14 (donkey-kong-country) | pause-option (ESC) | rgb(85, 85, 85) | rgb(3, 14, 4) | 2.64 | FAIL |
| L14 (donkey-kong-country) | pause-option (Q) | rgb(85, 85, 85) | rgb(12, 21, 13) | 2.5 | FAIL |
| L15 (pokemon) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(87, 65, 15) | 5.26 | PASS |
| L15 (pokemon) | pause-option (ESC) | rgb(85, 85, 85) | rgb(31, 33, 22) | 2.2 | FAIL |
| L15 (pokemon) | pause-option (Q) | rgb(85, 85, 85) | rgb(36, 37, 27) | 2.08 | FAIL |
| L16 (simcity-2000) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(65, 48, 6) | 6.97 | PASS |
| L16 (simcity-2000) | pause-option (ESC) | rgb(85, 85, 85) | rgb(2, 8, 7) | 2.71 | FAIL |
| L16 (simcity-2000) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 16, 16) | 2.57 | FAIL |
| L17 (goldeneye-007) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(67, 47, 1) | 6.97 | PASS |
| L17 (goldeneye-007) | pause-option (ESC) | rgb(85, 85, 85) | rgb(3, 6, 2) | 2.73 | FAIL |
| L17 (goldeneye-007) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 14, 11) | 2.6 | FAIL |
| L18 (age-of-empires) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(69, 47, 1) | 6.92 | PASS |
| L18 (age-of-empires) | pause-option (ESC) | rgb(85, 85, 85) | rgb(4, 7, 2) | 2.72 | FAIL |
| L18 (age-of-empires) | pause-option (Q) | rgb(85, 85, 85) | rgb(13, 15, 11) | 2.58 | FAIL |
| L19 (final-fantasy-vii) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(65, 49, 3) | 6.89 | PASS |
| L19 (final-fantasy-vii) | pause-option (ESC) | rgb(85, 85, 85) | rgb(1, 9, 4) | 2.7 | FAIL |
| L19 (final-fantasy-vii) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 18, 13) | 2.55 | FAIL |
| L20 (terminal) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(65, 46, 0) | 7.13 | PASS |
| L20 (terminal) | pause-option (ESC) | rgb(85, 85, 85) | rgb(1, 5, 1) | 2.75 | FAIL |
| L20 (terminal) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 14, 10) | 2.61 | FAIL |
| L21 (out-run) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(70, 58, 8) | 6.1 | PASS |
| L21 (out-run) | pause-option (ESC) | rgb(85, 85, 85) | rgb(8, 9, 8) | 2.67 | FAIL |
| L21 (out-run) | pause-option (Q) | rgb(85, 85, 85) | rgb(16, 17, 17) | 2.54 | FAIL |
| L22 (qbert) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(69, 47, 5) | 6.94 | PASS |
| L22 (qbert) | pause-option (ESC) | rgb(85, 85, 85) | rgb(6, 7, 7) | 2.71 | FAIL |
| L22 (qbert) | pause-option (Q) | rgb(85, 85, 85) | rgb(15, 15, 16) | 2.57 | FAIL |
| L23 (missile-command) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(65, 45, 3) | 7.17 | PASS |
| L23 (missile-command) | pause-option (ESC) | rgb(85, 85, 85) | rgb(2, 5, 5) | 2.74 | FAIL |
| L23 (missile-command) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 14, 14) | 2.61 | FAIL |
| L24 (high-score-entry) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(68, 47, 0) | 6.93 | PASS |
| L24 (high-score-entry) | pause-option (ESC) | rgb(85, 85, 85) | rgb(1, 5, 1) | 2.75 | FAIL |
| L24 (high-score-entry) | pause-option (Q) | rgb(85, 85, 85) | rgb(11, 14, 10) | 2.61 | FAIL |
| L25 (word-processor) | pause-title (PAUSED) | rgb(255, 176, 0) | rgb(90, 70, 25) | 4.94 | PASS |
| L25 (word-processor) | pause-option (ESC) | rgb(85, 85, 85) | rgb(36, 40, 35) | 2.01 | FAIL |
| L25 (word-processor) | pause-option (Q) | rgb(85, 85, 85) | rgb(41, 44, 40) | 1.89 | FAIL |

## Keyboard Preview — Level Accent Color vs Sampled Canvas Background

The keyboard-preview screen draws its key rows on canvas using `--level-accent` (new/active keys) and `--level-accent-dim` (already-known keys). This table compares those CSS custom-property colors directly against the sampled average background of the canvas region where the keyboard rows are drawn.

| Level | Accent (new keys) | Accent Dim (known keys) | Canvas BG | Accent Ratio | Accent Verdict | Dim Ratio | Dim Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| L1 (breakout) | #39ff14 | #1a7a0a | rgb(10, 16, 9) | 14.18 | PASS | 3.51 | WARN |
| L2 (space-invaders) | #ffff00 | #7a7a00 | rgb(17, 17, 8) | 17.62 | PASS | 4.16 | WARN |
| L3 (pac-man) | #6cf | #246 | rgb(11, 15, 23) | 10.66 | PASS | 1.91 | FAIL |
| L4 (galaga) | #f0f | #606 | rgb(17, 3, 22) | 6.39 | PASS | 1.68 | FAIL |
| L5 (joust) | #ff8c00 | #7a4000 | rgb(23, 15, 3) | 8.15 | PASS | 2.32 | FAIL |
| L6 (donkey-kong) | #e82020 | #6a0000 | rgb(19, 8, 8) | 4.38 | WARN | 1.52 | FAIL |
| L7 (dragons-lair) | #cc66ff | #550088 | rgb(16, 5, 21) | 6.56 | PASS | 1.65 | FAIL |
| L8 (tetris) | #00ffff | #006655 | rgb(3, 15, 23) | 15.42 | PASS | 2.79 | FAIL |
| L9 (super-mario-bros) | #5c94fc | #1a3060 | rgb(5, 7, 19) | 6.77 | PASS | 1.56 | FAIL |
| L10 (legend-of-zelda) | #e8d040 | #886020 | rgb(16, 16, 8) | 12.3 | PASS | 3.4 | WARN |
| L11 (sonic) | #23d353 | #0a5a20 | rgb(4, 17, 10) | 9.65 | PASS | 2.29 | FAIL |
| L12 (street-fighter-ii) | #ff4400 | #7a1800 | rgb(26, 7, 3) | 5.64 | PASS | 1.82 | FAIL |
| L13 (myst) | #80a0b8 | #2a3848 | rgb(9, 13, 17) | 7.09 | PASS | 1.63 | FAIL |
| L14 (donkey-kong-country) | #44cc44 | #1a5a1a | rgb(8, 20, 7) | 8.94 | PASS | 2.26 | FAIL |
| L15 (pokemon) | #ffcc00 | #886600 | rgb(21, 17, 4) | 12.5 | PASS | 3.55 | WARN |
| L16 (simcity-2000) | #4488cc | #1a3a5a | rgb(8, 14, 22) | 5.19 | PASS | 1.65 | FAIL |
| L17 (goldeneye-007) | #c8a840 | #5a4a10 | rgb(15, 13, 8) | 8.44 | PASS | 2.24 | FAIL |
| L18 (age-of-empires) | #c8840a | #5a3800 | rgb(15, 10, 5) | 6.33 | PASS | 1.87 | FAIL |
| L19 (final-fantasy-vii) | #00e8a8 | #004a38 | rgb(4, 19, 17) | 11.87 | PASS | 1.84 | FAIL |
| L20 (terminal) | #39ff14 | #1a7a0a | rgb(6, 16, 5) | 14.3 | PASS | 3.54 | WARN |
| L21 (out-run) | #ff5aa0 | #7a1a48 | rgb(29, 12, 28) | 6.43 | PASS | 1.84 | FAIL |
| L22 (qbert) | #ff8c1a | #7a4000 | rgb(31, 16, 32) | 7.81 | PASS | 2.22 | FAIL |
| L23 (missile-command) | #ff2222 | #7a0a0a | rgb(16, 7, 7) | 5.22 | PASS | 1.78 | FAIL |
| L24 (high-score-entry) | #ffd700 | #7a5a00 | rgb(22, 17, 4) | 13.44 | PASS | 2.95 | FAIL |
| L25 (word-processor) | #8fd0ff | #2a4a5a | rgb(20, 25, 30) | 10.63 | PASS | 1.87 | FAIL |

## Theme Canvas HUD (top-left in-canvas progress text)

Each theme draws its own progress HUD directly on canvas (e.g. "DISTANCE 0/30", "MARIO 000000", "CUBES 0/28") in the top-left region (~x 10-300, y 5-40). We cannot isolate text color from a canvas the way we can with DOM text, so instead we report the luminance spread (max - min) found in that region as a proxy for "is there visible high-contrast text here at all." A near-zero spread means the region is visually flat/uniform — i.e. no legible HUD text is standing out from its background at that sampling resolution.

| Level | Region | Min Lum | Max Lum | Spread | Flag (spread < 25 = low/no visible text) |
| --- | --- | --- | --- | --- | --- |
| L1 (breakout) | 290x35 @ (10,5) | 4 | 32 | 28 |  |
| L2 (space-invaders) | 290x35 @ (10,5) | 5 | 32 | 27 |  |
| L3 (pac-man) | 290x35 @ (10,5) | 5.4 | 95.2 | 89.8 |  |
| L4 (galaga) | 290x35 @ (10,5) | 1.4 | 157.8 | 156.4 |  |
| L5 (joust) | 290x35 @ (10,5) | 3.9 | 31 | 27.1 |  |
| L6 (donkey-kong) | 290x35 @ (10,5) | 2.5 | 30.3 | 27.8 |  |
| L7 (dragons-lair) | 290x35 @ (10,5) | 1.9 | 86.2 | 84.3 |  |
| L8 (tetris) | 290x35 @ (10,5) | 3.7 | 30.7 | 27 |  |
| L9 (super-mario-bros) | 290x35 @ (10,5) | 62.9 | 167.1 | 104.2 |  |
| L10 (legend-of-zelda) | 290x35 @ (10,5) | 3.2 | 30.5 | 27.3 |  |
| L11 (sonic) | 290x35 @ (10,5) | 46.3 | 145.7 | 99.4 |  |
| L12 (street-fighter-ii) | 290x35 @ (10,5) | 27.7 | 202 | 174.3 |  |
| L13 (myst) | 290x35 @ (10,5) | 5.1 | 66.8 | 61.7 |  |
| L14 (donkey-kong-country) | 290x35 @ (10,5) | 5.9 | 46.2 | 40.3 |  |
| L15 (pokemon) | 290x35 @ (10,5) | 84.7 | 176.8 | 92.1 |  |
| L16 (simcity-2000) | 290x35 @ (10,5) | 3.7 | 76.1 | 72.5 |  |
| L17 (goldeneye-007) | 290x35 @ (10,5) | 6.9 | 101.5 | 94.6 |  |
| L18 (age-of-empires) | 290x35 @ (10,5) | 4.7 | 86.5 | 81.8 |  |
| L19 (final-fantasy-vii) | 290x35 @ (10,5) | 3.9 | 114.4 | 110.5 |  |
| L20 (terminal) | 290x35 @ (10,5) | 1.4 | 123.7 | 122.2 |  |
| L21 (out-run) | 290x35 @ (10,5) | 16.8 | 156.6 | 139.8 |  |
| L22 (qbert) | 290x35 @ (10,5) | 11.6 | 127.7 | 116.1 |  |
| L23 (missile-command) | 290x35 @ (10,5) | 1.2 | 128.6 | 127.3 |  |
| L24 (high-score-entry) | 290x35 @ (10,5) | 2.5 | 116 | 113.5 |  |
| L25 (word-processor) | 290x35 @ (10,5) | 12.2 | 130.9 | 118.7 |  |

## Pattern Analysis

### Which element types fail most often

| Element (normalized) | Total | PASS | WARN | FAIL | Fail+Warn % |
| --- | --- | --- | --- | --- | --- |
| coin-hint (PRESS SPACE OR ENTER) | 1 | 0 | 0 | 1 | 100% |
| name-label (ENTER YOUR NAME) | 1 | 0 | 0 | 1 | 100% |
| ready-text (PRESS ENTER TO START) | 1 | 0 | 0 | 1 | 100% |
| READY | 1 | 0 | 0 | 1 | 100% |
| player name | 1 | 0 | 1 | 0 | 100% |
| level-intro | 1 | 0 | 0 | 1 | 100% |
| start-prompt (PRESS SPACE TO BEGIN) | 1 | 0 | 0 | 1 | 100% |
| select-subtitle | 5 | 0 | 0 | 5 | 100% |
| select-hint | 5 | 0 | 0 | 5 | 100% |
| kbp-title (LEVEL N) | 25 | 0 | 0 | 25 | 100% |
| hud-value #hud-name | 25 | 0 | 4 | 21 | 100% |
| hud-value #hud-accuracy | 25 | 0 | 4 | 21 | 100% |

### FAIL/WARN count per level (game screen only)

Every level shares the same static FAIL set (prompt-label, level-badge-text, hud-line label text, plus non-active key-boxes) because those elements' CSS never varies by level -- see Narrative point 1. The table below is included for completeness; the more diagnostic per-level signal is the key-box background-bleed ranking further down, where the ratio magnitude (not just pass/fail count) varies a lot by how bright/busy each level's canvas theme is.

| Level | FAIL+WARN count (of 12 game-screen elements measured) |
| --- | --- |
| L1 | 7 |
| L2 | 10 |
| L3 | 11 |
| L4 | 11 |
| L5 | 12 |
| L6 | 12 |
| L7 | 12 |
| L8 | 11 |
| L9 | 12 |
| L10 | 12 |
| L11 | 12 |
| L12 | 12 |
| L13 | 12 |
| L14 | 12 |
| L15 | 12 |
| L16 | 12 |
| L17 | 12 |
| L18 | 12 |
| L19 | 12 |
| L20 | 11 |
| L21 | 11 |
| L22 | 12 |
| L23 | 11 |
| L24 | 11 |
| L25 | 10 |

### Narrative

**1. Dim-by-design UI text is a FAIL almost everywhere it appears, independent of the level.** The `prompt-label` ("TYPE THE LETTER"), `level-badge-text`, `hud-line` label text, `coin-hint`, `select-subtitle`, `select-hint`, and `pause-option` all share the same CSS: `color: var(--atari-dim)` which resolves to `#555` (rgb 85,85,85), or `#444`/`#2a2a2a` in a couple of spots. Against the near-black (`--bg`, typically rgb 8-20 per channel) or dark canvas backgrounds used throughout the game, `#555` text lands at roughly 2.5:1-2.8:1 -- a hard FAIL regardless of which level or theme is active. This is a base.css/ screens.css problem, not a per-theme problem: the design intentionally dims secondary text to ~50% opacity ("small on-screen" mistake visibility, ambient stats), but the chosen dim gray is too close to the near-black background value to clear even the WCAG large-text minimum of 3:1.

**2. The active/accent-colored elements (`prompt-letter.active`, `key-box.active-key`, `kbp-subtitle`, `complete-title`) are consistently the strongest performers.** These use the level's bright, saturated `--level-accent` color with heavy `text-shadow` glow, which both increases the raw color contrast against dark backgrounds and adds a self-illuminating halo the sampling method partially picks up (visible in the high `bgLumSpread` values for these elements -- the glow bleeds outward into the sampled box). These are reliably PASS across nearly all 25 levels.

**3. The failure mode named in the brief ("bright/vibrant level backgrounds burying dim text") shows up specifically on `.key-box` (non-active) elements and `kbp-title`.** `key-box` uses a near-black `#444` default color with only a 2px border in `--level-accent-dim`; on levels where the theme canvas renders a lot of bright motion behind the keyboard guide (see levels flagged below), the sampled background creeps up well above the near-black CSS `--bg` value, collapsing the ratio for the *un-highlighted* key boxes even though the CSS itself never changes. `.kbp-title` is a distinct, level-independent bug: it is styled `color: var(--crt-amber-dim)` (`#7a5500`, a dark amber) sitting directly on canvas-drawn keyboard rows that render in `--level-accent`/`--level-accent-dim`, which are frequently *green* or *blue* (levels 1, 8, 9, 11, 20, 25, etc.) -- a dark amber label on top of a green/blue accent field is a near-guaranteed FAIL by color clash alone, not just luminance. This shows up as FAIL on effectively every level's keyboard-preview screen.

**4. `.hud-line` label text is architecturally unmeasurable in isolation and worth flagging as a real UX issue on its own.** Each HUD line mixes a dim label (`ACCURACY`, `STREAK`) with a bright `.hud-value` span (`100%`, `12`) in the same text run. The sampled background behind the *whole line* is pulled toward whatever the value's glow renders, which is a genuine visual artifact for players too: the label portion is markedly dimmer than the value portion sitting one word away, which could read as "flickering" or inconsistent text to a 5-year-old.

**5. No systemic difference between Acts** in terms of overall fail rate -- the failures are driven almost entirely by which *CSS class* an element has (`--atari-dim` vs `--level-accent`), not by which act/era's canvas theme is currently drawing. The one exception is the keyboard-guide `key-box` background bleed described in point 3, which does correlate with how visually "busy"/bright a given theme's canvas is.

### Levels where non-active key-box contrast is weakest (background bleed from bright canvas)

| Level | Min ratio (non-active key-box) | Avg ratio (non-active key-boxes) |
| --- | --- | --- |
| L11 | 1.00 | 1.06 |
| L12 | 1.05 | 1.31 |
| L21 | 1.10 | 1.21 |
| L15 | 1.24 | 1.96 |
| L14 | 1.27 | 1.37 |
| L19 | 1.29 | 1.40 |
| L6 | 1.36 | 1.42 |
| L18 | 1.36 | 1.40 |
| L13 | 1.44 | 1.51 |
| L16 | 1.50 | 1.52 |
