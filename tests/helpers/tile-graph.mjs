// Engine-equivalent reachability graph over a tile world's OWN data
// (js/textworld/tile-worlds.js) — shared by the Act 6 tests. It mirrors
// tileworld.js's buildScreens()/walkable()/nearestWalkableOnRow()/
// nearestWalkableOnCol() so a BFS over it proves exactly what a real player's
// SINGLE-STEP keypresses could reach, never more and never less (the INV-45/55
// floor: every gate CLOSED, every riddle unsolved, every creature tile blocked).
// Copied verbatim from tests/integration/textworld.test.mjs (which keeps its own
// copy; both derive from the world data, never from engine code).

import assert from 'node:assert/strict';

export function buildTileGraph(world, { gatesOpen = new Set() } = {}) {
  const wallChar = world.wallChar || '#';
  const gateChars = world.gates || '';
  const npcSlots = new Set((world.npcs || []).map((n) => n.slot));
  let start = null, goal = null;
  const npcTiles = new Set(); // `${screen}:${r}:${c}` — always non-walkable
  const npcByPos = new Map();
  const screens = world.screens.map((s, si) => {
    const rowsIn = Array.isArray(s.map) ? s.map : [];
    const maxLen = rowsIn.reduce((m, r) => Math.max(m, r.length), 1);
    const grid = rowsIn.map((r) => (r + wallChar.repeat(Math.max(0, maxLen - r.length))).split(''));
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < maxLen; c++) {
        const ch = grid[r][c];
        if (ch === '@') { start = { screen: si, r, c }; grid[r][c] = '.'; }
        else if (ch === '*') { goal = { screen: si, r, c }; grid[r][c] = '.'; }
        else if (ch >= '1' && ch <= '9') {
          if (npcSlots.has(Number(ch))) {
            npcTiles.add(`${si}:${r}:${c}`);
            npcByPos.set(`${si}:${r}:${c}`, Number(ch));
          }
          grid[r][c] = '.';
        }
      }
    }
    return { grid, ROWS: grid.length, COLS: maxLen, exits: s.exits || {} };
  });
  assert.ok(start && goal, `${world.title}: map contains both @ and *`);

  function glyphWalkable(ch) {
    const g = world.glyphs && world.glyphs[ch];
    if (g) return g.walkable !== false;
    if (ch === '.') return true;
    return false; // unknown char → solid wall (glyphSpec's own documented fallback)
  }
  function walkable(si, r, c) {
    const s = screens[si];
    if (!s || r < 0 || r >= s.ROWS || c < 0 || c >= s.COLS) return false;
    if (npcTiles.has(`${si}:${r}:${c}`)) return false;   // creatures always hold their tile
    const ch = s.grid[r][c];
    if (gateChars.includes(ch)) return gatesOpen.has(ch);
    return glyphWalkable(ch);
  }
  function nearestOnRow(si, r, nearCol) {
    const s = screens[si];
    for (let d = 0; d < s.COLS; d++) {
      for (const c of [nearCol - d, nearCol + d]) if (c >= 0 && c < s.COLS && walkable(si, r, c)) return { r, c };
    }
    return null;
  }
  function nearestOnCol(si, c, nearRow) {
    const s = screens[si];
    for (let d = 0; d < s.ROWS; d++) {
      for (const r of [nearRow - d, nearRow + d]) if (r >= 0 && r < s.ROWS && walkable(si, r, c)) return { r, c };
    }
    return null;
  }
  function anyWalkable(si) {
    const s = screens[si];
    for (let r = 0; r < s.ROWS; r++) for (let c = 0; c < s.COLS; c++) if (walkable(si, r, c)) return { r, c };
    return null;
  }

  const DIRS = [['north', -1, 0], ['south', 1, 0], ['east', 0, 1], ['west', 0, -1]];
  // One graph edge per REAL keypress: either a same-screen step, or (off a
  // screen's edge) a chained-screen crossing landing on the nearest walkable
  // tile perpendicular to the exit — exactly tileworld.js's crossTo().
  function neighbors(node) {
    const out = [];
    const s = screens[node.screen];
    for (const [dir, dr, dc] of DIRS) {
      const tr = node.r + dr, tc = node.c + dc;
      if (tr < 0 || tr >= s.ROWS || tc < 0 || tc >= s.COLS) {
        const edge = dr < 0 ? 'north' : dr > 0 ? 'south' : dc < 0 ? 'west' : 'east';
        const target = s.exits[edge];
        if (target == null || !screens[target]) continue; // an edge with no exit → nothing to add (a wall nudge)
        let entry;
        if (edge === 'north') entry = nearestOnRow(target, screens[target].ROWS - 1, node.c);
        else if (edge === 'south') entry = nearestOnRow(target, 0, node.c);
        else if (edge === 'west') entry = nearestOnCol(target, screens[target].COLS - 1, node.r);
        else entry = nearestOnCol(target, 0, node.r);
        entry = entry || anyWalkable(target) || { r: 0, c: 0 };
        out.push({ dir, node: { screen: target, r: entry.r, c: entry.c } });
        continue;
      }
      if (!walkable(node.screen, tr, tc)) continue; // a wall/closed-gate/npc tile → rejected, not an edge
      out.push({ dir, node: { screen: node.screen, r: tr, c: tc } });
    }
    return out;
  }

  return { start, goal, neighbors, npcByPos, npcSlots, gateChars, screens };
}

// BFS over the graph to any node satisfying `isTarget` (default: the world's
// own goal tile). Returns the direction-word path (e.g. ['south','east',...]).
export function bfsPath(graph, isTarget, startNode = graph.start) {
  const key = (n) => `${n.screen}:${n.r}:${n.c}`;
  const seen = new Set([key(startNode)]);
  const prev = new Map();
  const queue = [startNode];
  let found = isTarget(startNode) ? startNode : null;
  while (queue.length && !found) {
    const node = queue.shift();
    for (const { dir, node: nxt } of graph.neighbors(node)) {
      if (seen.has(key(nxt))) continue;
      seen.add(key(nxt));
      prev.set(key(nxt), { from: node, dir });
      if (isTarget(nxt)) { found = nxt; break; }
      queue.push(nxt);
    }
  }
  if (!found) return null;
  const path = [];
  let cursor = key(found);
  const startKey = key(startNode);
  while (cursor !== startKey) {
    const step = prev.get(cursor);
    path.unshift(step.dir);
    cursor = key(step.from);
  }
  return path;
}

export function isGoalNode(graph) {
  return (n) => n.screen === graph.goal.screen && n.r === graph.goal.r && n.c === graph.goal.c;
}

