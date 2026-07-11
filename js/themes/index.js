import * as Breakout from './breakout.js';
import * as Invaders from './invaders.js';
import * as PacMan from './pacman.js';
import * as Fighter from './fighter.js';
import * as Joust from './joust.js';
import * as DonkeyKong from './donkeykong.js';
import * as DragonLair from './dragonlair.js';
import * as Tetris from './tetris.js';
import * as Mario from './mario.js';
import * as Zelda from './zelda.js';
import * as Sonic from './sonic.js';
import * as StreetFighter from './streetfighter.js';
import * as Myst from './myst.js';
import * as DKC from './dkc.js';
import * as Pokemon from './pokemon.js';
import * as SimCity from './simcity.js';
import * as GoldenEye from './goldeneye.js';
import * as AgeOfEmpires from './ageofempires.js';
import * as FF7 from './ff7.js';
import * as Terminal from './terminal.js';
import * as OutRun from './outrun.js';
import * as Qbert from './qbert.js';
import * as MissileCommand from './missilecommand.js';
import * as HighScore from './highscore.js';
import * as WordProcessor from './wordprocessor.js';

export const Themes = {
  1: Breakout,       // Breakout — Atari, 1976
  2: Invaders,       // Space Invaders — Taito, 1978
  3: PacMan,         // Pac-Man — Namco, 1980
  4: Fighter,        // Galaga — Namco, 1981
  5: Joust,          // Joust — Williams, 1982
  6: DonkeyKong,     // Donkey Kong — Nintendo, 1981
  7: DragonLair,     // Dragon's Lair — Cinematronics, 1983
  8: Tetris,         // Tetris — Pajitnov / Nintendo, 1984
  9: Mario,          // Super Mario Bros — Nintendo, 1985
  10: Zelda,         // The Legend of Zelda — Nintendo, 1986
  11: Sonic,         // Sonic the Hedgehog — Sega, 1991
  12: StreetFighter, // Street Fighter II — Capcom, 1991
  13: Myst,          // Myst — Cyan, 1993
  14: DKC,           // Donkey Kong Country — Rare/Nintendo, 1994
  15: Pokemon,       // Pokémon Red/Blue — Game Freak/Nintendo, 1996
  16: SimCity,       // SimCity 2000 — Maxis, 1993
  17: GoldenEye,     // GoldenEye 007 — Rare, 1997
  18: AgeOfEmpires,  // Age of Empires — Ensemble, 1997
  19: FF7,           // Final Fantasy VII — Square, 1997
  20: Terminal,      // Terminal / Command Line — 1960s–∞
  21: OutRun,         // Out Run — Sega, 1986
  22: Qbert,          // Q*bert — Gottlieb, 1982
  23: MissileCommand, // Missile Command — Atari, 1980
  24: HighScore,      // High Score Entry — the player's own name
  25: WordProcessor,  // Word Processor — first sentences
};

export function activeTheme(level) {
  return Themes[level] || null;
}

export function stopAll() {
  Object.values(Themes).forEach(t => t.stop());
}
