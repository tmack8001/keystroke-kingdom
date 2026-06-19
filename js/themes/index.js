import * as Breakout from './breakout.js';
import * as Invaders from './invaders.js';
import * as PacMan from './pacman.js';
import * as Fighter from './fighter.js';

export const Themes = {
  1: Breakout,
  2: Invaders,
  3: PacMan,
  4: Fighter
};

export function activeTheme(level) {
  return Themes[level] || null;
}

export function stopAll() {
  Object.values(Themes).forEach(t => t.stop());
}
