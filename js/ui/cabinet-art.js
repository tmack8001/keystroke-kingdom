const $ = (id) => document.getElementById(id);

// NOTE (2026-09-13): era strings use the word NOW, never the ∞ character.
// Press Start 2P has NO infinity glyph — measured, not assumed: at 16px every real
// glyph in this font advances exactly 16px, and '∞' advances 11.41px because the
// browser silently falls back. On screen it rendered as a period, so Acts 4 and 5
// and the Level 20 cabinet had been shipping "1993–." and "1980–." for months.
// Journal O11 is precisely this trap: screenshot any symbol you render.
const ACTS = [
  { num: 1, name: 'THE ARCADE',          era: '1976–1982', levels: [1, 2, 3, 4, 5]      },
  { num: 2, name: 'THE COMPUTER WING',   era: '1981–1986', levels: [6, 7, 8, 9, 10]     },
  { num: 3, name: 'THE BASEMENT',        era: '1991–1996', levels: [11, 12, 13, 14, 15] },
  { num: 4, name: 'THE COMMAND CENTER',  era: '1993–NOW',    levels: [16, 17, 18, 19, 20] },
  { num: 5, name: 'FULL CIRCLE',         era: '1980–NOW',    levels: [21, 22, 23, 24, 25] },
];

function getActForLevel(level) {
  return ACTS.find(a => a.levels.includes(level)) || ACTS[0];
}

// A cabinet is locked when the player hasn't earned it yet — unless the WOPR
// bypass is active (dev/parent shortcut), which lights every cabinet. Cabinets
// light up one by one as levels are completed (levels.md "The Arcade at Level 1").
function isLevelLocked(state, levelNum) {
  if (state.selectBypass) return false;
  return levelNum > (state.maxUnlockedLevel || 1);
}

// The nearest selectable level at or below `levelNum`, walking backward. Used
// so navigation never parks the cursor on a locked cabinet.
function firstUnlockedAtOrBelow(state, levels, levelNum) {
  const idx = levels.indexOf(levelNum);
  for (let i = idx; i >= 0; i--) {
    if (!isLevelLocked(state, levels[i])) return levels[i];
  }
  // Fall back to the lowest level in the list (always at least level 1 exists).
  return levels[0];
}

// ─── The back room: the bonus ACTS behind the arcade ────────────────────────
// Past the last act, the select cursor keeps walking DOWN — through a door in
// the back wall and into the bonus acts (Act 6 The Text Worlds, Act 7 The
// Speedway). They appear once the full keyboard is earned, or the WOPR dev
// bypass lights them.
//
// SHAPE (revised 2026-09-13, Trevor: "act 6 → backdoor → 7 doesn't show right on
// the wopr select screen as they render as a single act 'the back of the arcade'
// and then show up as cabinets next to each other… the speedway levels aren't
// like the back of the arcade and I was thinking they would be a separate act
// with different arcade cabinets like we had before"):
// each row below is ONE ACT, not one door. A bonus act is a page in exactly the
// same walk as Acts 1–5 — it has an act number, a name, an era, ↑/↓ to the acts
// either side of it, and a row of machines you walk along with ←/→. The door is
// still there, because the door is how the back room is entered narratively
// (levels/onboarding.md: "the arcade is never explained" — the doorway art does
// the explaining): it is drawn standing at the head of the wing's own wall.
//
// This is still a REGISTRY, never a boolean and never a branch: `state.wingIndex`
// (null | 0..N-1) is a sub-state of the 'select' screen naming which bonus act
// the cursor is in, and `state.wingEntry` names the machine within it. Adding a
// fourth wing is ONE DATA ROW here plus its entry function in main.js's
// DOOR_ENTRY map — never another edit to renderWingAct() or navigateAct().
//
// Navigation can never strand the cursor (the One Rule): ↑ from the first bonus
// act always walks back up into Act 5, ↓ stops at the last act, ←/→ walk the
// wall, and Escape leaves the select screen entirely from anywhere.
const DOOR_UNLOCK_LEVEL = 25;
function doorUnlocked(state) {
  return !!state.selectBypass || (state.maxUnlockedLevel || 1) >= DOOR_UNLOCK_LEVEL;
}

// One row per bonus act. `cabinets` lists the machines standing on that act's
// wall, in era order, by their id in WING_CABINETS below (the same id the wing's
// own hub knows a track by, so main.js can hand the choice through). A wing with
// NO cabinet list is entered through its door alone — see Act 6's note.
const BACK_WALL_DOORS = [
  { id: 'textworld',
    num: 6,
    name: 'THE TEXT WORLDS',
    // Colossal Cave (1976) at one end, a machine you can still talk to at the
    // other (research/wiki/games/colossal-cave-adventure.md).
    // 'NOW' for the present, matching every other act (see the header note: Press Start 2P has no infinity
    // glyph and silently draws a dot (journal O11), and 'NOW' is already this
    // screen's own word for the present (Levels 24–25).
    era: '1976–NOW',
    door: { art: drawTextWorldDoor, label: 'THE GREEN DRAGON', hint: 'A TEXT WORLD' },
    // Act 6 is a DOOR, not a wall of cabinets, and that is the faithful choice:
    // its five worlds are prose, tiles and a friend to talk to — a BBS "door
    // game" is literally named after the door you drop out through — and not one
    // of them was ever a coin-op cabinet. Its own hub (js/textworld/hub.js, "THE
    // TEXT WORLDS") is the room beyond, and that is where the five are chosen.
    cabinets: [],
    unlock: doorUnlocked },
  { id: 'speedway',
    num: 7,
    name: 'THE SPEEDWAY',
    // null = derived from the cabinets actually standing on the wall, so the
    // act's era stays true as the remaining nine tracks arrive
    // (docs/specs/act7-speed-racing.md §5.6b).
    era: null,
    door: { art: drawSpeedwayDoor, label: 'THE BACK ROOM', hint: '' },
    cabinets: ['monaco-gp', 'f-zero'],
    unlock: doorUnlocked },
];

// The bonus acts standing open to this player, in back-wall order.
function availableDoors(state) {
  return BACK_WALL_DOORS.filter(d => d.unlock(state));
}

// The bonus act the cursor is standing in, or null if it's still among the 25
// cabinets. Tolerates a stale/out-of-range index — it simply reads as "no wing".
export function focusedDoor(state) {
  const doors = availableDoors(state);
  const i = state.wingIndex;
  return (typeof i === 'number' && i >= 0 && i < doors.length) ? doors[i] : null;
}

// The machines standing on a bonus act's wall, in the order the player walks
// them. A wing with no cabinets offers its doorway itself — so every bonus act
// has at least one thing to select and Space is never a dead key.
function wingEntries(wing) {
  if (!wing) return [];
  const cabs = (wing.cabinets || [])
    .map(id => ({ id, cab: WING_CABINETS[id] }))
    .filter(e => e.cab);
  if (cabs.length) {
    return cabs.map(({ id, cab }) => ({
      id,
      label: `${cab.label} · ${cab.era}`,
      hint: cab.maker,
      draw: (canvas) => drawCabinetArt(canvas, cab, 2),
    }));
  }
  return [{
    id: null,                    // no specific machine — the wing's hub chooses
    label: wing.door.label,
    hint: wing.door.hint,
    draw: (canvas) => wing.door.art(canvas, 3),   // you are standing AT the door
    isDoor: true,
  }];
}

// WHERE on a bonus act's wall the cursor is standing, as an INDEX into
// wingEntries(wing). An index, not the entry object: wingEntries() builds fresh
// rows each call, so identity comparison would silently never match and nothing
// would ever render as selected. Falls back to 0, so a stale id can never leave
// the player pointing at nothing.
function focusedEntryIndex(state, wing) {
  const entries = wingEntries(wing);
  if (!entries.length) return -1;
  const i = entries.findIndex(e => e.id === state.wingEntry);
  return i >= 0 ? i : 0;
}

// What main.js needs at Space time: which wing, and which machine on its wall.
export function focusedWingEntry(state) {
  const wing = focusedDoor(state);
  if (!wing) return null;
  return { wing, entry: wingEntries(wing)[focusedEntryIndex(state, wing)] || null };
}

// Park the cursor in a named bonus act (optionally on a named machine) — a wing
// hands control back through the act it was entered from. An unknown or
// still-locked id clears the focus instead, so the cursor lands among the
// cabinets rather than nowhere.
export function focusDoor(state, id, entryId) {
  const i = availableDoors(state).findIndex(d => d.id === id);
  state.wingIndex = i >= 0 ? i : null;
  state.wingEntry = i >= 0 ? (entryId !== undefined ? entryId : state.wingEntry) : null;
}

export function clearDoorFocus(state) { state.wingIndex = null; state.wingEntry = null; }

// Pixel-art doors matching drawCabinet's 56×80 footprint. Shared shell first:
// the dark back wall, the stone frame, and the light spilling on the floor.
function drawDoorShell(canvas, scale, glowTop, glowBottom, spill) {
  const w = 56, h = 80;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = Math.round(w * scale) + 'px';
  canvas.style.height = Math.round(h * scale) + 'px';
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = '#0a0a12';        // dark back wall
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2a2a33';        // stone frame
  ctx.fillRect(12, 8, 32, 68);
  ctx.fillStyle = '#15151c';
  ctx.fillRect(15, 11, 26, 63);

  const g = ctx.createLinearGradient(0, 11, 0, 74);   // the glowing doorway
  g.addColorStop(0, glowTop);
  g.addColorStop(1, glowBottom);
  ctx.fillStyle = g;
  ctx.fillRect(17, 13, 22, 59);

  ctx.globalAlpha = 0.5;            // light spilling on the floor
  ctx.fillStyle = spill;
  ctx.fillRect(9, 74, 38, 4);
  ctx.globalAlpha = 1;
  return ctx;
}

// Act 6 — a glowing emerald doorway, gold handle, two faint dragon-eyes.
function drawTextWorldDoor(canvas, scale = 2) {
  const ctx = drawDoorShell(canvas, scale, '#0c3', '#042', '#0f6');
  ctx.fillStyle = '#ffd23f';        // gold handle
  ctx.fillRect(34, 42, 3, 4);
  ctx.fillStyle = '#7fffbf';        // two faint eyes in the glow
  ctx.fillRect(24, 34, 2, 2);
  ctx.fillRect(30, 34, 2, 2);
}

// Act 7 — a pit-lane roll-up door: chequered header board, sunset glow beyond,
// two headlights idling in it. Same 1-8 colour pixel bar as every cabinet here.
function drawSpeedwayDoor(canvas, scale = 2) {
  const ctx = drawDoorShell(canvas, scale, '#ff7b1a', '#7a0b2e', '#fb3');

  for (let c = 0; c < 6; c++) {     // chequered flag board over the doorway
    ctx.fillStyle = (c % 2 === 0) ? '#f4f4f4' : '#101018';
    ctx.fillRect(17 + c * 4, 14, 4, 3);
    ctx.fillStyle = (c % 2 === 0) ? '#101018' : '#f4f4f4';
    ctx.fillRect(17 + c * 4, 17, 4, 3);
  }

  ctx.fillStyle = '#5a1f2e';        // the road running out of the doorway
  ctx.fillRect(19, 52, 18, 20);
  ctx.fillStyle = '#f4f4f4';        // centre line, receding
  ctx.fillRect(27, 54, 2, 3);
  ctx.fillRect(27, 60, 2, 4);
  ctx.fillRect(27, 67, 2, 4);

  ctx.fillStyle = '#e8203c';        // a car idling in the doorway, facing out
  ctx.fillRect(23, 54, 11, 12);
  ctx.fillStyle = '#9fd8ff';        // windscreen
  ctx.fillRect(25, 56, 7, 4);
  ctx.fillStyle = '#101018';        // tyres
  ctx.fillRect(21, 62, 3, 5);
  ctx.fillRect(33, 62, 3, 5);
  ctx.fillStyle = '#fff6cc';        // headlights
  ctx.fillRect(24, 62, 3, 2);
  ctx.fillRect(30, 62, 3, 2);

  ctx.fillStyle = '#c9ccd6';        // chrome pull handle
  ctx.fillRect(34, 42, 3, 4);
}

// ─── Act set dressing — the machines standing in the room ───────────────────
// Act 2's own design text has asked for this since it shipped: "Computers and
// consoles from different eras line the walls, each one running a classic game"
// (.claude/rules/levels/act2.md). These are two of those machines, running the
// two programs Trevor named as childhood favourites.
//
// DRAW A REAL THING (.claude/rules/theme-authoring.md). The faithful object for
// Stickybear is an Apple II with a 5.25-inch disk in the drive, and for Gizmos &
// Gadgets a beige MS-DOS desktop — never an invented coin-op, because no
// Stickybear arcade cabinet ever existed and no Stickybear title was ever a
// side-scroller (research/wiki/pedagogy/bear-on-a-blue-screen.md).
//
// Both silhouettes were drawn from PHOTOGRAPHS looked at during authoring, not
// from memory — the same standard the Stickybear history card was held to, and
// the exact failure the hardware page warns about ("do not invent hardware
// detail from feel"). Sources and the detail list:
// research/wiki/tech/console-hardware-silhouettes.md.
//
// They are SET DRESSING, exactly like a wing's back-wall door: no data-level, no
// onPick, pointer-events:none, and the cursor walks straight past them.

// `deskY` is where the desk surface starts, so each machine can SIT on it
// instead of floating above it — the first draft left an 11px void under the
// Apple, which read as a computer hovering in a dark room.
function drawDeskShell(canvas, scale, deskY) {
  const w = 56, h = 80;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = Math.round(w * scale) + 'px';
  canvas.style.height = Math.round(h * scale) + 'px';
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#0a0a12';  ctx.fillRect(0, 0, w, h);                 // the dark room
  ctx.fillStyle = '#2b2016';  ctx.fillRect(0, deskY, w, h - deskY);      // desk top
  ctx.fillStyle = '#171009';  ctx.fillRect(0, deskY + 5, w, h - deskY - 5); // front edge
  return ctx;
}

// Act 2 — an Apple IIe: beige wedge with the keyboard built in, monitor sitting
// on top of it, Disk II drive alongside. The three details that survive at this
// size are the RAINBOW apple stripes, the Disk II's BLACK front face, and the
// blue screen. (The 1987 "Platinum" IIe is light grey — this is the earlier
// beige one, which is the machine Stickybear's 1982-88 run actually shipped for.)
function drawAppleIIe(canvas, scale = 2) {
  const ctx = drawDeskShell(canvas, scale, 62);
  const BEIGE = '#d6ccb0', SHADE = '#a89e84', KEYCAP = '#8b8370';

  ctx.fillStyle = BEIGE;    ctx.fillRect(9, 4, 34, 34);     // monitor case
  ctx.fillStyle = SHADE;    ctx.fillRect(9, 36, 34, 2);
  ctx.fillStyle = '#16161d'; ctx.fillRect(12, 7, 28, 25);    // bezel well

  // The screen is BLUE on purpose: blue is the Stickybear house palette on the
  // Apple II, verified by viewing the archived screenshots rather than assumed
  // (research/wiki/pedagogy/bear-on-a-blue-screen.md).
  ctx.fillStyle = '#1f6fd0'; ctx.fillRect(13, 8, 26, 23);
  ctx.fillStyle = '#e8622a';                                 // big orange lettering
  ctx.fillRect(25, 11, 11, 3);
  ctx.fillRect(27, 15, 7, 2);
  ctx.fillStyle = '#f0e2c4';                                 // the bear, lower-left
  ctx.fillRect(15, 20, 10, 9);
  ctx.fillRect(14, 18, 3, 3);                                // ears
  ctx.fillRect(23, 18, 3, 3);
  ctx.fillStyle = '#16161d';                                 // eyes
  ctx.fillRect(17, 23, 2, 2);
  ctx.fillRect(21, 23, 2, 2);
  ctx.fillStyle = '#e8622a';  ctx.fillRect(18, 26, 4, 2);    // muzzle

  ctx.fillStyle = BEIGE;    ctx.fillRect(3, 40, 40, 22);     // the computer = the keyboard
  ctx.fillStyle = SHADE;    ctx.fillRect(3, 59, 40, 3);

  const APPLE = ['#61bb46', '#fdb827', '#f5821f', '#e03a3e', '#963d97', '#009ddc'];
  APPLE.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(6 + i, 42, 1, 4); });

  ctx.fillStyle = KEYCAP;                                    // three rows of keycaps
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 11; col++) ctx.fillRect(7 + col * 3, 48 + row * 3, 2, 2);
  }

  ctx.fillStyle = BEIGE;    ctx.fillRect(45, 44, 10, 18);    // Disk II drive
  ctx.fillStyle = '#101014'; ctx.fillRect(45, 49, 10, 13);    // its black front face
  ctx.fillStyle = '#3a3a42'; ctx.fillRect(46, 52, 8, 3);      // the slot
  ctx.fillStyle = '#e03a3e'; ctx.fillRect(46, 58, 2, 1);      // IN USE lamp
}

// Act 3 — a beige MS-DOS desktop: horizontal case with the CRT sitting ON TOP of
// it and the keyboard in front, which is how these actually stood on a desk. The
// identifying details are the two floppy slots on the front face — a WIDE 5.25
// inch above a SMALL 3.5 inch — and the power lamp beside them.
function drawBeigePC(canvas, scale = 2) {
  const ctx = drawDeskShell(canvas, scale, 62);
  const BEIGE = '#cec5ac', SHADE = '#9b9480';

  ctx.fillStyle = BEIGE;    ctx.fillRect(12, 3, 32, 27);     // monitor
  ctx.fillStyle = SHADE;    ctx.fillRect(12, 28, 32, 2);
  ctx.fillStyle = '#14141b'; ctx.fillRect(15, 6, 26, 19);     // bezel well

  // 1993 is 256-colour VGA — the screen is the game's own loop: a machine you
  // built, on a bench, about to be raced (research/wiki/games/gizmos-and-gadgets.md).
  ctx.fillStyle = '#2c6b8f'; ctx.fillRect(16, 7, 24, 17);     // workshop wall
  ctx.fillStyle = '#b8b0a0'; ctx.fillRect(16, 19, 24, 5);     // the bench
  ctx.fillStyle = '#d8352a'; ctx.fillRect(20, 13, 13, 5);     // the car you built
  ctx.fillStyle = '#9fd8ff'; ctx.fillRect(23, 14, 5, 3);      // windscreen
  ctx.fillStyle = '#16161d'; ctx.fillRect(21, 17, 3, 3);      // wheels
  ctx.fillRect(29, 17, 3, 3);
  ctx.fillStyle = '#f2c832';                                  // a cog on the wall
  ctx.fillRect(35, 9, 4, 4);
  ctx.fillRect(34, 10, 6, 2);
  ctx.fillRect(36, 8, 2, 6);

  ctx.fillStyle = BEIGE;    ctx.fillRect(4, 32, 48, 18);      // the desktop case
  ctx.fillStyle = SHADE;    ctx.fillRect(4, 47, 48, 3);
  ctx.fillStyle = '#b5ad98';                                  // vents on the left face
  for (let i = 0; i < 4; i++) ctx.fillRect(8, 36 + i * 3, 12, 1);
  ctx.fillStyle = '#2a2a30'; ctx.fillRect(28, 36, 18, 3);      // 5.25-inch slot
  ctx.fillRect(28, 41, 11, 2);                                // 3.5-inch slot
  ctx.fillStyle = '#5fd35f'; ctx.fillRect(48, 42, 2, 2);       // power lamp

  ctx.fillStyle = BEIGE;    ctx.fillRect(8, 52, 40, 10);      // keyboard
  ctx.fillStyle = SHADE;    ctx.fillRect(8, 59, 40, 3);
  ctx.fillStyle = '#8b8370';
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 12; col++) ctx.fillRect(11 + col * 3, 54 + row * 3, 2, 2);
  }
}

// NOT YET PLACED (Trevor, 2026-09-13). These two were first stood at the head of
// Act 2's and Act 3's walls as set dressing, and on screen they were wrong:
//
//   "on the cabinet selection they look out of place next to traditional cabinets"
//
// He is right, and the reason is instructive: an arcade cabinet is a tall box you
// stand at, and a home computer is a low thing you sit at. Side by side in one row
// they read as two different KINDS of object, and the row is a row of one kind.
// The fix is not to restyle them — it is to give them their own act, "where
// different office and home computers and gaming consoles are introduced"
// (docs/ROADMAP.md §2). They are kept here, drawn and grounded, ready for it.
export const HOME_MACHINES = {
  'apple-iie': { art: drawAppleIIe, label: 'APPLE IIe',  hint: 'STICKYBEAR · 1985',        era: '1983' },
  'msdos-pc':  { art: drawBeigePC,  label: 'MS-DOS PC',  hint: 'GIZMOS & GADGETS · 1993',  era: '1993' },
};

// ─── The bonus acts' cabinets ───────────────────────────────────────────────
// Same shape as CABINET_DATA below and drawn by the same cabinet shell, because
// these ARE cabinets in the same arcade — they just stand in the back room. Keyed
// by the wing's own id for the machine (Act 7: the track id in
// js/speedway/tracks/*), so picking one on this wall can be handed straight to
// the wing's hub.
//
// GROUND TRUTH: every screen below recreates what the real machine actually put
// on its CRT, taken from research/wiki/games/*.md — never model memory, never a
// pun on the keys it teaches (project rule: cabinet art is faithful, not gimmicky).
//
// Adding a track = one row here + its id in the wing's `cabinets` list above.
const WING_CABINETS = {
  // MONACO GP — Sega, November 1979 (research/wiki/games/monaco-gp.md):
  // "one of the last arcade games made by Sega to use transistor–transistor logic
  // (TTL) based discrete logic circuits instead of a microprocessor" — over 100
  // chips, no CPU. Overhead perspective, scrolling road, FIVE areas, and the
  // difficulty escalation the wiki names: "the road narrows" and "the surface
  // changes to ice and gravel". So: ONE INK on black (a machine with no CPU had
  // no colour RAM either), a straight overhead road that steps NARROWER through
  // the areas, a stipple of ice and gravel in the far one, and two open-wheelers.
  'monaco-gp': {
    label: 'MONACO GP',
    maker: 'SEGA',
    era: '1979',
    colors: { body: '#140407', screen: '#000', accent: '#e02030', trim: '#3a1018' },
    drawScreen(ctx, x, y, w, h) {
      const INK = '#f4f4f4';
      ctx.fillStyle = '#000';
      ctx.fillRect(x, y, w, h);

      // OVERHEAD, not perspective (monaco-gp.md: "overhead perspective, scrolling
      // road") — so the road is a straight vertical band. What changes is the
      // AREA: the wiki's five areas, in which "the road narrows" and "the surface
      // changes to ice and gravel". Two visible steps fit this screen; the far
      // (upper) areas are the narrow, gravelled ones.
      const cx = x + Math.round(w / 2);
      const AREAS = [
        { top: 0,               height: Math.round(h * 0.34), half: 9,  gravel: true  },
        { top: Math.round(h * 0.34), height: Math.round(h * 0.28), half: 12, gravel: false },
        { top: Math.round(h * 0.62), height: h - Math.round(h * 0.62), half: 15, gravel: false },
      ];

      ctx.fillStyle = INK;
      for (const a of AREAS) {
        ctx.fillRect(cx - a.half - 1, y + a.top, 1, a.height);   // left verge
        ctx.fillRect(cx + a.half, y + a.top, 1, a.height);       // right verge
      }
      for (let i = 0; i < AREAS.length - 1; i++) {               // the step between areas
        const a = AREAS[i], b = AREAS[i + 1];
        const yy = y + b.top;
        ctx.fillRect(cx - b.half - 1, yy, b.half - a.half + 1, 1);
        ctx.fillRect(cx + a.half, yy, b.half - a.half + 1, 1);
      }
      for (let r = 2; r < h - 2; r += 6) {                       // the dashed centre line
        ctx.fillRect(cx, y + r, 1, 3);
      }
      const ice = AREAS[0];                                      // ice and gravel, far area
      for (let r = 1; r < ice.height - 1; r += 3) {
        ctx.fillRect(cx - ice.half + 2, y + r, 1, 1);
        ctx.fillRect(cx + ice.half - 3, y + r + 1, 1, 1);
        ctx.fillRect(cx + 3, y + r + 2, 1, 1);
      }

      // A 1979 open-wheeler seen from above: nose, four exposed wheels, tail.
      const CAR = ['.###.', '##.##', '.###.', '.###.', '##.##', '.###.'];
      const car = (ox, oy) => {
        for (let r = 0; r < CAR.length; r++)
          for (let c = 0; c < 5; c++)
            if (CAR[r][c] === '#') ctx.fillRect(ox + c, oy + r, 1, 1);
      };
      car(cx - 8, y + AREAS[1].top + 2);     // a rival, an area ahead
      car(cx - 2, y + h - 8);                // the player, near the bottom
    }
  },

  // F-ZERO — Nintendo EAD, November 21 1990 (research/wiki/games/f-zero.md): a
  // Super Famicom launch title whose whole identity is MODE 7, "a raster
  // graphical plane… rotated and scaled freely, simulating the appearance of 3D
  // environments" WITHOUT polygon processing — everything that is not the ground
  // plane is a sprite. So: a banded raster sky (no gradient — the hardware drew
  // bands), one ground plane running to a vanishing point, and the anti-gravity
  // craft as a sprite riding on it.
  'f-zero': {
    label: 'F-ZERO',
    maker: 'NINTENDO',
    era: '1990',
    colors: { body: '#0b0a24', screen: '#000', accent: '#ff2f6d', trim: '#2a1046' },
    drawScreen(ctx, x, y, w, h) {
      const horizon = y + 10;

      // The sky as RASTER BANDS — a Mode 7 machine had no gradient, it had
      // scanlines with different colours in them.
      const SKY = ['#180540', '#3a0c58', '#74185f', '#bc3468', '#ff7a4a'];
      for (let i = 0; i < SKY.length; i++) {
        ctx.fillStyle = SKY[i];
        ctx.fillRect(x, y + i * 2, w, 2);
      }

      const vx = x + w * 0.44;              // vanishing point, off horizontal centre
      const rows = h - (horizon - y);
      for (let r = 0; r < rows; r++) {
        const t = r / Math.max(1, rows - 1);
        // The ground plane, scaled by row — alternating raster bands are how the
        // scrolling ground of a Mode 7 plane reads at this size.
        ctx.fillStyle = (Math.floor(r / 2 + r * r / 26) % 2 === 0) ? '#2a1f4e' : '#1d1540';
        ctx.fillRect(x, horizon + r, w, 1);

        const half = 3 + t * 15;
        const cxr = vx + (x + w / 2 - vx) * t;
        ctx.fillStyle = '#6f6a96';           // the track surface, pale on the plane
        ctx.fillRect(Math.round(cxr - half), horizon + r, Math.round(half * 2), 1);
        const stripe = (Math.floor(r / 3) % 2 === 0) ? '#f4f4ff' : '#ff2f6d';
        ctx.fillStyle = stripe;              // the rails, widening toward the player
        ctx.fillRect(Math.round(cxr - half) - 2, horizon + r, 2, 1);
        ctx.fillRect(Math.round(cxr + half), horizon + r, 2, 1);
      }

      // Everything that is not the ground plane is a SPRITE (f-zero.md): a rival
      // far up the plane, then the player's anti-gravity craft.
      ctx.fillStyle = '#7fe8ff';
      ctx.fillRect(Math.round(vx) - 1, horizon + 3, 3, 2);

      const CRAFT = ['..#####..', '.#######.', '#########', '##.###.##'];
      const px = x + Math.round(w / 2) - 4;
      const py = y + h - 9;
      ctx.fillStyle = '#2f7fff';
      for (let r = 0; r < CRAFT.length; r++)
        for (let c = 0; c < 9; c++)
          if (CRAFT[r][c] === '#') ctx.fillRect(px + c, py + r, 1, 1);
      ctx.fillStyle = '#7fe8ff';             // canopy
      ctx.fillRect(px + 3, py + 1, 3, 1);
      ctx.fillStyle = '#ffd23f';             // thruster wash, two jets
      ctx.fillRect(px + 1, py + 4, 2, 2);
      ctx.fillRect(px + 6, py + 4, 2, 2);
      ctx.fillStyle = '#ff7a4a';
      ctx.fillRect(px + 2, py + 6, 1, 1);
      ctx.fillRect(px + 6, py + 6, 1, 1);
    }
  },
};

const CABINET_DATA = {
  1: {
    label: 'LEVEL 1',
    keys: 'J F',
    era: '1977',
    // Breakout: "rotary knob (paddle controller), horizontal movement only" — NO joystick (research/wiki/games/breakout.md)
    controls: { stick: 'knob',      buttons: 0 },
    colors: { body: '#1a1a2e', screen: '#000', accent: '#39ff14', trim: '#333' },
    drawScreen(ctx, x, y, w, h) {
      ctx.fillStyle = '#000';
      ctx.fillRect(x, y, w, h);
      const brickColors = ['#39ff14', '#2ecc40', '#01ff70', '#7fff00'];
      const brickW = Math.floor((w - 4) / 5);
      const brickH = 3;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 5; c++) {
          ctx.fillStyle = brickColors[r];
          ctx.fillRect(x + 2 + c * brickW, y + 3 + r * (brickH + 2), brickW - 1, brickH);
        }
      }
      ctx.fillStyle = '#39ff14';
      ctx.fillRect(x + w/2 - 6, y + h - 5, 12, 3);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + w/2 - 1, y + h - 12, 3, 3);
    }
  },
  2: {
    label: 'LEVEL 2',
    keys: 'D K',
    era: '1980',
    // Space Invaders: "two-way joystick (left/right) plus fire button" — and WHICH
    // cabinet matters. Museum of the Game: "Joystick: 2-way (left, right) - Left/Right
    // button on the Bally/Midway North American Version." Taito published JP/AS/EU,
    // Bally/Midway published North America, and the MIDWAY cabinet replaced the stick
    // with LEFT/RIGHT BUTTONS. We draw the TAITO cabinet — what levels/act1.md
    // specifies ("Space Invaders — Taito, 1978") and what the restoration photographs
    // of serial 000871 show. (research/wiki/tech/arcade-control-panels.md)
    controls: { stick: '2way',      buttons: 1 },
    colors: { body: '#1a1a0e', screen: '#000', accent: '#ffff00', trim: '#444' },
    drawScreen(ctx, x, y, w, h) {
      ctx.fillStyle = '#000';
      ctx.fillRect(x, y, w, h);
      const px = 2;
      const invader = [
        [0,0,1,0,0,0,1,0,0],
        [0,0,0,1,0,1,0,0,0],
        [0,0,1,1,1,1,1,0,0],
        [0,1,0,1,1,1,0,1,0],
        [1,1,1,1,1,1,1,1,1],
        [1,0,1,1,1,1,1,0,1],
        [1,0,1,0,0,0,1,0,1],
        [0,0,0,1,0,1,0,0,0],
      ];
      ctx.fillStyle = '#ffff00';
      const ox = x + (w - 9*px)/2;
      const oy = y + (h - 8*px)/2 - 4;
      for (let r = 0; r < invader.length; r++)
        for (let c = 0; c < invader[r].length; c++)
          if (invader[r][c]) ctx.fillRect(ox + c*px, oy + r*px, px, px);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(x + w/2 - 3, y + h - 6, 6, 3);
      ctx.fillRect(x + w/2 - 1, y + h - 8, 2, 2);
    }
  },
  3: {
    label: 'LEVEL 3',
    keys: 'S L',
    era: '1985',
    // Pac-Man: "four-way joystick (no diagonals)" — and no buttons at all
    controls: { stick: '4way',      buttons: 0 },
    colors: { body: '#0e1a2e', screen: '#000', accent: '#6cf', trim: '#335' },
    drawScreen(ctx, x, y, w, h) {
      ctx.fillStyle = '#000';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#2244ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x+3, y+3, w-6, h-6);
      ctx.strokeRect(x+8, y+12, 12, 8);
      ctx.strokeRect(x+w-20, y+12, 12, 8);
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(x + w/2, y + h/2 + 2, 5, 0.3, Math.PI * 2 - 0.3);
      ctx.lineTo(x + w/2, y + h/2 + 2);
      ctx.fill();
      ctx.fillStyle = '#6cf';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + 6 + i*9, y + h - 8, 2, 2);
      }
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(x + w - 12, y + h/2 - 1, 6, 7);
      ctx.fillRect(x + w - 13, y + h/2, 1, 5);
      ctx.fillRect(x + w - 6, y + h/2, 1, 5);
    }
  },
  4: {
    label: 'LEVEL 4',
    keys: 'A ?',
    era: '1991',
    // Galaga: "two-way joystick (left/right) plus fire button"
    controls: { stick: '2way',      buttons: 1 },
    colors: { body: '#1a0a2e', screen: '#000', accent: '#f0f', trim: '#424' },
    drawScreen(ctx, x, y, w, h) {
      ctx.fillStyle = '#100820';
      ctx.fillRect(x, y, w, h);
      for (let i = 0; i < h; i += 2) {
        const alpha = i / h * 0.3;
        ctx.fillStyle = `rgba(128, 0, 255, ${alpha})`;
        ctx.fillRect(x, y + i, w, 2);
      }
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(x+5, y+h-16, 4, 8);
      ctx.fillRect(x+4, y+h-18, 6, 3);
      ctx.fillRect(x+3, y+h-8, 2, 3);
      ctx.fillRect(x+7, y+h-8, 2, 3);
      ctx.fillRect(x+9, y+h-14, 4, 2);
      ctx.fillStyle = '#0088ff';
      ctx.fillRect(x+w-9, y+h-16, 4, 8);
      ctx.fillRect(x+w-10, y+h-18, 6, 3);
      ctx.fillRect(x+w-11, y+h-8, 2, 3);
      ctx.fillRect(x+w-7, y+h-8, 2, 3);
      ctx.fillRect(x+w-13, y+h-14, 4, 2);
      ctx.fillStyle = '#f0f';
      ctx.fillRect(x+w/2-3, y+h-14, 6, 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x+w/2-1, y+h-15, 2, 4);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(x+3, y+3, 14, 2);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(x+w-17, y+3, 14, 2);
    }
  },
  5: {
    label: 'LEVEL 5',
    keys: 'G H',
    era: '1982',
    // Joust: 2-way joystick + the one "Flap" button
    controls: { stick: '2way',      buttons: 1 },
    colors: { body: '#1a0800', screen: '#000', accent: '#ff6600', trim: '#442200' },
    drawScreen(ctx, x, y, w, h) {
      ctx.fillStyle = '#000';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#cc2200';
      ctx.fillRect(x, y + h - 7, w, 7);
      ctx.fillStyle = '#ff4400';
      ctx.fillRect(x + 3, y + h - 9, 5, 4);
      ctx.fillRect(x + 14, y + h - 8, 3, 3);
      ctx.fillRect(x + w - 10, y + h - 9, 5, 4);
      ctx.fillStyle = '#664400';
      ctx.fillRect(x + 3, y + h - 16, w - 6, 4);
      ctx.fillStyle = '#997722';
      ctx.fillRect(x + 3, y + h - 16, w - 6, 2);
      ctx.fillStyle = '#664400';
      ctx.fillRect(x + w/2 - 7, y + h/2 - 2, 14, 3);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(x + 7, y + h - 22, 2, 2);
      ctx.fillRect(x + 6, y + h - 20, 4, 3);
      ctx.fillRect(x + 7, y + h - 17, 2, 2);
      ctx.fillRect(x + 6, y + h - 15, 4, 2);
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(x + w - 12, y + 6, 8, 2);
      ctx.fillRect(x + w - 11, y + 8, 6, 3);
      ctx.fillRect(x + w - 10, y + 11, 4, 2);
      ctx.fillRect(x + w - 10, y + 13, 2, 2);
      ctx.fillStyle = '#ffee55';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x + 14, y + h - 20, 3, 3);
      ctx.fillRect(x + w/2 - 2, y + h/2 - 10, 3, 3);
      ctx.globalAlpha = 1;
    }
  },

  6: {
    label: 'LEVEL 6',
    keys: 'E I',
    era: '1981',
    colors: { body: '#1a0400', screen: '#000', accent: '#e82020', trim: '#440800' },
    drawScreen(ctx, x, y, w, h) {
      ctx.fillStyle = '#000';
      ctx.fillRect(x, y, w, h);
      // Girders (3 levels)
      ctx.fillStyle = '#c07030';
      ctx.fillRect(x + 2, y + h - 8, w - 4, 3);
      ctx.fillRect(x + 2, y + h - 18, w - 4, 3);
      ctx.fillRect(x + 4, y + h - 27, w - 8, 3);
      // DK at top left
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x + 3, y + 4, 8, 7);
      ctx.fillRect(x + 2, y + 6, 2, 4);
      // Mario on ladder
      ctx.fillStyle = '#e82020';
      ctx.fillRect(x + w - 12, y + h - 22, 4, 6);
      ctx.fillStyle = '#4444ff';
      ctx.fillRect(x + w - 12, y + h - 17, 4, 4);
      // Barrel rolling
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x + w/2 - 3, y + h - 13, 6, 5);
      ctx.fillStyle = '#D2691E';
      ctx.fillRect(x + w/2 - 2, y + h - 12, 4, 3);
    }
  },

  7: {
    label: 'LEVEL 7',
    keys: 'R U',
    era: '1983',
    // Dragon's Lair: "the correct directional/sword input" — a stick and one sword button
    controls: { stick: '8way',      buttons: 1 },
    colors: { body: '#0e0018', screen: '#000', accent: '#cc66ff', trim: '#330055' },
    drawScreen(ctx, x, y, w, h) {
      ctx.fillStyle = '#080010';
      ctx.fillRect(x, y, w, h);
      // Corridor walls
      ctx.fillStyle = '#180828';
      ctx.fillRect(x, y, 6, h);
      ctx.fillRect(x + w - 6, y, 6, h);
      // Torch flames
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(x + 4, y + 6, 3, 6);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(x + 5, y + 5, 2, 4);
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(x + w - 7, y + 6, 3, 6);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(x + w - 6, y + 5, 2, 4);
      // Dirk (knight) advancing
      ctx.fillStyle = '#ddaa00';
      ctx.fillRect(x + w/2 - 3, y + h - 14, 6, 8);
      ctx.fillRect(x + w/2 - 2, y + h - 18, 4, 4);
      // Sword
      ctx.fillStyle = '#ccc';
      ctx.fillRect(x + w/2 + 3, y + h - 18, 2, 10);
      // Door ahead
      ctx.fillStyle = '#440066';
      ctx.fillRect(x + w - 10, y + 4, 7, 18);
      ctx.fillStyle = '#cc44ff';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(x + w - 9, y + 5, 5, 16);
      ctx.globalAlpha = 1;
    }
  },

  8: {
    label: 'LEVEL 8',
    keys: 'T Y',
    era: '1984',
    colors: { body: '#000820', screen: '#000', accent: '#00ffff', trim: '#003355' },
    drawScreen(ctx, x, y, w, h) {
      ctx.fillStyle = '#000818';
      ctx.fillRect(x, y, w, h);
      // Tetris well border
      ctx.strokeStyle = '#003355';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 4, y + 2, w - 8, h - 4);
      // Locked rows at bottom
      const colors = ['#00ffff', '#ffff00', '#cc00ff', '#ff8800'];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
          ctx.fillStyle = colors[(row + col) % colors.length];
          ctx.fillRect(x + 6 + col * 6, y + h - 8 - row * 6, 5, 5);
        }
      }
      // Falling I-piece
      ctx.fillStyle = '#00ffff';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + 6 + 12, y + 4 + i * 6, 5, 5);
      }
    }
  },

  9: {
    label: 'LEVEL 9',
    // act2.md: "The NES in the center of the room" — a console, not a coin-op.
    shell: 'console',
    keys: 'W O',
    era: '1985',
    colors: { body: '#000820', screen: '#000', accent: '#5c94fc', trim: '#1a3060' },
    drawScreen(ctx, x, y, w, h) {
      // Sky
      ctx.fillStyle = '#5c94fc';
      ctx.fillRect(x, y, w, h);
      // Cloud
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + w/2 - 6, y + 4, 12, 5);
      ctx.fillRect(x + w/2 - 4, y + 2, 8, 4);
      // Ground
      ctx.fillStyle = '#00a800';
      ctx.fillRect(x, y + h - 10, w, 3);
      ctx.fillStyle = '#a04820';
      ctx.fillRect(x, y + h - 7, w, 7);
      // Pipe
      ctx.fillStyle = '#00aa00';
      ctx.fillRect(x + w - 14, y + h - 18, 10, 8);
      ctx.fillStyle = '#00dd00';
      ctx.fillRect(x + w - 16, y + h - 20, 14, 4);
      // Mario
      ctx.fillStyle = '#e82020';
      ctx.fillRect(x + 6, y + h - 16, 5, 3);  // cap
      ctx.fillRect(x + 5, y + h - 13, 7, 4);  // body
      ctx.fillStyle = '#4444ff';
      ctx.fillRect(x + 5, y + h - 9, 7, 5);   // legs
    }
  },

  10: {
    label: 'LEVEL 10',
    keys: 'Q P',
    era: '1986',
    colors: { body: '#020804', screen: '#000', accent: '#e8d040', trim: '#443010' },
    drawScreen(ctx, x, y, w, h) {
      // Dungeon floor
      ctx.fillStyle = '#0a140a';
      ctx.fillRect(x, y, w, h);
      // Floor tiles
      for (let tr = 0; tr < 4; tr++)
        for (let tc = 0; tc < 5; tc++) {
          ctx.fillStyle = (tr + tc) % 2 === 0 ? '#0e1e0a' : '#0a1806';
          ctx.fillRect(x + 4 + tc * 8, y + 4 + tr * 7, 7, 6);
        }
      // Walls
      ctx.fillStyle = '#1a2a10';
      ctx.fillRect(x, y, w, 4);
      ctx.fillRect(x, y + h - 4, w, 4);
      ctx.fillRect(x, y, 4, h);
      ctx.fillRect(x + w - 4, y, 4, h);
      // Link
      ctx.fillStyle = '#00aa44';
      ctx.fillRect(x + w/2 - 3, y + h/2, 6, 8);
      ctx.fillStyle = '#ddbb44';
      ctx.fillRect(x + w/2 - 2, y + h/2 - 4, 5, 4);
      // Triforce glow
      ctx.fillStyle = '#e8d040';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(x + w - 10, y + 10);
      ctx.lineTo(x + w - 6, y + 18);
      ctx.lineTo(x + w - 14, y + 18);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },

  // ═══ ACT 3 — THE BASEMENT ════════════════════════════════════════════════

  11: {
    label: 'LEVEL 11',
    keys: 'V M',
    era: '1991',
    colors: { body: '#010a08', screen: '#000', accent: '#23d353', trim: '#0a3020' },
    drawScreen(ctx, x, y, w, h) {
      // Green Hill Zone sky
      ctx.fillStyle = '#2060cc';
      ctx.fillRect(x, y, w, h * 0.55);
      // Checkerboard hills
      ctx.fillStyle = '#23d353';
      ctx.fillRect(x, y + h * 0.45, w, h * 0.3);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#1aaa44' : '#23d353';
        ctx.fillRect(x + i * 10, y + h * 0.45, 10, 8);
      }
      // Ground
      ctx.fillStyle = '#8b5e3c';
      ctx.fillRect(x, y + h * 0.75, w, h * 0.25);
      // Sonic (blue blob running)
      ctx.fillStyle = '#1e88e5';
      ctx.fillRect(x + 6, y + h * 0.6, 8, 8);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 8, y + h * 0.6 + 1, 2, 2);
      // Ring
      ctx.strokeStyle = '#ffdd00';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + w - 10, y + 10, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  },

  12: {
    label: 'LEVEL 12',
    keys: 'B N',
    era: '1991',
    // Street Fighter II: "8-way joystick + six buttons (three punch, three kick)" — the layout that became the fighting-game standard
    controls: { stick: '8way',      buttons: 6 },
    colors: { body: '#0c0000', screen: '#000', accent: '#ff4400', trim: '#3a0800' },
    drawScreen(ctx, x, y, w, h) {
      // Sky
      ctx.fillStyle = '#4488cc';
      ctx.fillRect(x, y, w, h * 0.6);
      // Temple floor
      ctx.fillStyle = '#882222';
      ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
      // Red brick detail
      for (let r = 0; r < 3; r++) {
        ctx.fillStyle = r % 2 === 0 ? '#661111' : '#882222';
        ctx.fillRect(x, y + h * 0.6 + r * 5, w, 2);
      }
      // Player (blue)
      ctx.fillStyle = '#2244cc';
      ctx.fillRect(x + 5, y + h * 0.4, 6, 12);
      ctx.fillStyle = '#ffcc44';
      ctx.fillRect(x + 6, y + h * 0.4 - 4, 4, 4);
      // Opponent (red, mirrored)
      ctx.fillStyle = '#cc2222';
      ctx.fillRect(x + w - 11, y + h * 0.4, 6, 12);
      ctx.fillStyle = '#ffcc44';
      ctx.fillRect(x + w - 10, y + h * 0.4 - 4, 4, 4);
      // Health bars
      ctx.fillStyle = '#00cc00';
      ctx.fillRect(x + 2, y + 3, 16, 3);
      ctx.fillStyle = '#cc0000';
      ctx.fillRect(x + w - 18, y + 3, 16, 3);
    }
  },

  13: {
    label: 'LEVEL 13',
    keys: 'C ,',
    era: '1993',
    colors: { body: '#04080c', screen: '#000', accent: '#80a0b8', trim: '#1a2838' },
    drawScreen(ctx, x, y, w, h) {
      // Dark sky
      ctx.fillStyle = '#06101a';
      ctx.fillRect(x, y, w, h * 0.6);
      // Water
      ctx.fillStyle = '#0a1828';
      ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
      // Water shimmer
      ctx.fillStyle = '#1a3050';
      ctx.fillRect(x + 2, y + h * 0.65, w - 4, 1);
      ctx.fillRect(x + 4, y + h * 0.75, w - 8, 1);
      // Stone pedestal
      ctx.fillStyle = '#3a3a4a';
      ctx.fillRect(x + w/2 - 5, y + h * 0.45, 10, 14);
      ctx.fillStyle = '#4a4a5a';
      ctx.fillRect(x + w/2 - 7, y + h * 0.55, 14, 4);
      // Glowing book
      ctx.fillStyle = '#604020';
      ctx.fillRect(x + w/2 - 4, y + h * 0.35, 8, 10);
      ctx.fillStyle = '#ffcc44';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(x + w/2 - 5, y + h * 0.34, 10, 12);
      ctx.globalAlpha = 1;
    }
  },

  14: {
    label: 'LEVEL 14',
    keys: 'X .',
    era: '1994',
    colors: { body: '#020a00', screen: '#000', accent: '#44cc44', trim: '#0a2a08' },
    drawScreen(ctx, x, y, w, h) {
      // Sky
      const g = ctx.createLinearGradient(x, y, x, y + h * 0.45);
      g.addColorStop(0, '#1a4aaa');
      g.addColorStop(1, '#dd8822');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h * 0.45);
      // Far jungle (dark)
      ctx.fillStyle = '#0a2a08';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(x + 6 + i * 8, y + h * 0.45, 5, Math.PI, 0);
        ctx.fill();
      }
      // Near jungle (bright)
      ctx.fillStyle = '#1a5a18';
      ctx.fillRect(x, y + h * 0.4, w, h * 0.25);
      // Ground
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(x, y + h * 0.65, w, h * 0.35);
      // Ground detail
      ctx.fillStyle = '#3a2a10';
      ctx.fillRect(x, y + h * 0.65, w, 3);
      // DK (brown pixel blob)
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(x + 4, y + h * 0.5, 10, 12);
      ctx.fillStyle = '#d4a45a';
      ctx.fillRect(x + 5, y + h * 0.5 - 4, 8, 5);
      // Barrel cannon
      ctx.fillStyle = '#4a3010';
      ctx.fillRect(x + w - 10, y + h * 0.4, 7, 14);
      ctx.fillStyle = '#6a4a20';
      ctx.fillRect(x + w - 8, y + h * 0.38, 4, 5);
    }
  },

  15: {
    label: 'LEVEL 15',
    keys: 'Z /',
    era: '1996',
    colors: { body: '#060400', screen: '#000', accent: '#ffcc00', trim: '#443300' },
    drawScreen(ctx, x, y, w, h) {
      // GB cream background
      ctx.fillStyle = '#d8cc94';
      ctx.fillRect(x, y, w, h);
      // Enemy Pokémon area (top-right)
      ctx.fillStyle = '#b8ac84';
      ctx.fillRect(x + w/2, y, w/2, h * 0.45);
      // Pikachu (yellow blob)
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(x + w - 16, y + 5, 10, 8);
      ctx.fillStyle = '#cc8800';
      ctx.fillRect(x + w - 17, y + 4, 2, 5);  // left ear
      ctx.fillRect(x + w - 7, y + 3, 2, 5);   // right ear
      ctx.fillStyle = '#111';
      ctx.fillRect(x + w - 15, y + 7, 2, 2);  // eyes
      ctx.fillRect(x + w - 11, y + 7, 2, 2);
      // Enemy HP bar
      ctx.fillStyle = '#222';
      ctx.fillRect(x + w/2 + 1, y + h * 0.46, w/2 - 2, 5);
      ctx.fillStyle = '#44cc44';
      ctx.fillRect(x + w/2 + 2, y + h * 0.47, (w/2 - 4) * 0.8, 3);
      // Player Pokémon (dark silhouette bottom-left)
      ctx.fillStyle = '#222';
      ctx.fillRect(x + 4, y + h * 0.55, 14, 12);
      ctx.fillRect(x + 6, y + h * 0.52, 10, 5);
      // Text box
      ctx.fillStyle = '#222';
      ctx.fillRect(x, y + h * 0.78, w, h * 0.22);
      ctx.fillStyle = '#d8cc94';
      ctx.fillRect(x + 1, y + h * 0.79, w - 2, h * 0.2);
    }
  },

  // ═══ ACT 4 — THE COMMAND CENTER ══════════════════════════════════════════

  16: {
    label: 'LEVEL 16',
    keys: '5 6',
    era: '1993',
    colors: { body: '#030810', screen: '#000', accent: '#4488cc', trim: '#0a1a2a' },
    drawScreen(ctx, x, y, w, h) {
      // Night sky
      ctx.fillStyle = '#020c1c';
      ctx.fillRect(x, y, w, h * 0.55);
      // City skyline
      const buildings = [
        { bx: 0, bw: 9, bh: 0.55 },
        { bx: 10, bw: 7, bh: 0.45 },
        { bx: 18, bw: 10, bh: 0.62 },
        { bx: 29, bw: 6, bh: 0.38 },
        { bx: 36, bw: 8, bh: 0.5 },
      ];
      buildings.forEach(b => {
        ctx.fillStyle = '#1a2a3a';
        ctx.fillRect(x + b.bx, Math.round(y + h * (1 - b.bh) - h * 0.08), b.bw, Math.round(h * b.bh));
        // Windows
        ctx.fillStyle = '#88aaff';
        ctx.fillRect(x + b.bx + 2, Math.round(y + h * (1 - b.bh) - h * 0.08 + 4), 2, 2);
        ctx.fillRect(x + b.bx + 5, Math.round(y + h * (1 - b.bh) - h * 0.08 + 4), 2, 2);
      });
      // Road grid
      ctx.fillStyle = '#0a1428';
      ctx.fillRect(x, y + h * 0.78, w, h * 0.22);
      ctx.strokeStyle = '#224466';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y + h * 0.78); ctx.lineTo(x + w, y + h * 0.78); ctx.stroke();
      ctx.strokeStyle = '#1a3a5a';
      ctx.beginPath(); ctx.moveTo(x + w/2, y + h * 0.78); ctx.lineTo(x + w/2, y + h); ctx.stroke();
    }
  },

  17: {
    label: 'LEVEL 17',
    keys: '4 7',
    era: '1997',
    colors: { body: '#060606', screen: '#000', accent: '#c8a840', trim: '#2a2010' },
    drawScreen(ctx, x, y, w, h) {
      // Dark corridor
      ctx.fillStyle = '#080808';
      ctx.fillRect(x, y, w, h);
      // Perspective lines
      const vx = x + w/2, vy = y + h * 0.42;
      ctx.strokeStyle = '#2a2a20';
      ctx.lineWidth = 1;
      [[0, 0], [w, 0], [0, h], [w, h]].forEach(([ex, ey]) => {
        ctx.beginPath(); ctx.moveTo(x + ex, y + ey); ctx.lineTo(vx, vy); ctx.stroke();
      });
      // Ceiling light
      ctx.fillStyle = '#c8a840';
      ctx.fillRect(x + w/2 - 6, y + 2, 12, 3);
      const grad = ctx.createRadialGradient(x + w/2, y + 8, 0, x + w/2, y + 8, 20);
      grad.addColorStop(0, 'rgba(200, 168, 64, 0.3)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h * 0.5);
      // Crosshair
      ctx.strokeStyle = '#c8a840';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + w/2, y + h * 0.42, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w/2 - 10, y + h * 0.42); ctx.lineTo(x + w/2 - 8, y + h * 0.42);
      ctx.moveTo(x + w/2 + 8, y + h * 0.42); ctx.lineTo(x + w/2 + 10, y + h * 0.42);
      ctx.moveTo(x + w/2, y + h * 0.42 - 10); ctx.lineTo(x + w/2, y + h * 0.42 - 8);
      ctx.moveTo(x + w/2, y + h * 0.42 + 8); ctx.lineTo(x + w/2, y + h * 0.42 + 10);
      ctx.stroke();
    }
  },

  18: {
    label: 'LEVEL 18',
    keys: '3 8',
    era: '1997',
    colors: { body: '#080402', screen: '#000', accent: '#c8840a', trim: '#3a1800' },
    drawScreen(ctx, x, y, w, h) {
      // Earth-tone sky
      ctx.fillStyle = '#100804';
      ctx.fillRect(x, y, w, h * 0.55);
      // Hill silhouette
      ctx.fillStyle = '#1a0e06';
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.5);
      ctx.bezierCurveTo(x + w * 0.3, y + h * 0.3, x + w * 0.6, y + h * 0.35, x + w, y + h * 0.45);
      ctx.lineTo(x + w, y + h * 0.55); ctx.lineTo(x, y + h * 0.55); ctx.closePath(); ctx.fill();
      // Castle silhouette
      ctx.fillStyle = '#2a1a0a';
      const cx2 = x + w * 0.65;
      ctx.fillRect(Math.round(cx2), y + h * 0.2, 16, h * 0.3);
      ctx.fillRect(Math.round(cx2) - 4, y + h * 0.12, 8, h * 0.18);
      ctx.fillRect(Math.round(cx2) + 14, y + h * 0.14, 8, h * 0.16);
      // Battlements
      for (let b = 0; b < 3; b++) {
        ctx.fillRect(Math.round(cx2) + b * 6, y + h * 0.1, 4, 4);
      }
      // Ground
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(x, y + h * 0.55, w, h * 0.45);
      // Flag
      ctx.strokeStyle = '#8b5e2a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(Math.round(cx2) - 1, y + h * 0.06); ctx.lineTo(Math.round(cx2) - 1, y + h * 0.14); ctx.stroke();
      ctx.fillStyle = '#c8840a';
      ctx.beginPath();
      ctx.moveTo(Math.round(cx2), y + h * 0.06);
      ctx.lineTo(Math.round(cx2) + 7, y + h * 0.09);
      ctx.lineTo(Math.round(cx2), y + h * 0.12);
      ctx.closePath(); ctx.fill();
    }
  },

  19: {
    label: 'LEVEL 19',
    keys: '2 9',
    era: '1997',
    colors: { body: '#00080a', screen: '#000', accent: '#00e8a8', trim: '#003a28' },
    drawScreen(ctx, x, y, w, h) {
      // Dark reactor background
      ctx.fillStyle = '#000a08';
      ctx.fillRect(x, y, w, h);
      // Mako glow floor
      const glow = ctx.createRadialGradient(x + w/2, y + h * 0.9, 0, x + w/2, y + h * 0.9, 25);
      glow.addColorStop(0, 'rgba(0, 232, 168, 0.3)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x, y + h * 0.5, w, h * 0.5);
      // Floor line
      ctx.strokeStyle = '#00e8a8'; ctx.shadowColor = '#00e8a8'; ctx.shadowBlur = 4;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y + h * 0.78); ctx.lineTo(x + w, y + h * 0.78); ctx.stroke();
      ctx.shadowBlur = 0;
      // Cloud silhouette
      ctx.fillStyle = '#4060a0';
      ctx.fillRect(x + 5, Math.round(y + h * 0.56), 8, 16);
      ctx.fillStyle = '#c8b040';
      for (let s = 0; s < 3; s++) ctx.fillRect(x + 4 + s * 3, Math.round(y + h * 0.51) - s * 2, 3, 5);
      // Enemy HP bar
      ctx.fillStyle = '#001810';
      ctx.fillRect(x + w/2, y + h * 0.85, w/2 - 2, 5);
      ctx.fillStyle = '#00e040';
      ctx.fillRect(x + w/2 + 1, y + h * 0.86, (w/2 - 4) * 0.6, 3);
    }
  },

  20: {
    label: 'LEVEL 20',
    keys: '1 0',
    era: '1960s–NOW',
    colors: { body: '#000400', screen: '#000', accent: '#39ff14', trim: '#1a4a0a' },
    drawScreen(ctx, x, y, w, h) {
      ctx.fillStyle = '#000400';
      ctx.fillRect(x, y, w, h);
      // CRT scanlines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      for (let sy = y; sy < y + h; sy += 3) ctx.fillRect(x, sy, w, 1);
      // Terminal text lines
      ctx.fillStyle = '#39ff14';
      ctx.font = '3px monospace';
      const termLines = ['> HELLO', '> WORLD', '> 01001000', '> RUN_'];
      termLines.forEach((line, i) => {
        if (y + 4 + i * 6 < y + h - 4)
          ctx.fillText(line, x + 2, y + 6 + i * 6);
      });
      // Blinking cursor
      const blink = Math.floor(Date.now() / 530) % 2 === 0;
      if (blink) {
        ctx.fillStyle = '#39ff14';
        ctx.fillRect(x + 2, y + h - 10, 5, 4);
      }
    },
    // The rubber duck (the hidden layer — .claude/rules/easter-eggs.md). Pure
    // set dressing on the Command Center's own machine: a tiny yellow duck
    // perched on the terminal cabinet's control panel, where a programmer
    // would actually be debugging something. Never announced, never
    // interactive, never explained. Dark while the cabinet is still locked.
    drawExtras(ctx) {
      drawRubberDuck(ctx, 39, 49);
    }
  },

  // ═══ ACT 5 — FULL CIRCLE ═════════════════════════════════════════════════

  21: {
    label: 'LEVEL 21',
    keys: '- =',
    era: '1986',
    // Out Run: "steering wheel + stick shift (high/low gear) + accelerator/brake pedals"
    // IMAGERY: the deluxe cabinet is a SIT-DOWN car — the photo shows a real wheel
    // and two floor pedals. The upright shell here keeps the wheel and shifter on
    // the panel and puts the pedals down on the base.
    controls: { stick: 'wheel', buttons: 0, pedals: true },
    colors: { body: '#2a0a2a', screen: '#000', accent: '#ff5aa0', trim: '#4a1a3a' },
    drawScreen(ctx, x, y, w, h) {
      // Sunset sky gradient
      const g = ctx.createLinearGradient(x, y, x, y + h * 0.6);
      g.addColorStop(0, '#3a1050');
      g.addColorStop(0.5, '#c8306a');
      g.addColorStop(1, '#ffb040');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h * 0.6);
      // Sun
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.42, 6, 0, Math.PI * 2);
      ctx.fill();
      // Palm silhouettes
      ctx.fillStyle = '#1a0a20';
      ctx.fillRect(x + 4, y + h * 0.32, 2, 10);
      ctx.fillRect(x + 2, y + h * 0.3, 3, 2);
      ctx.fillRect(x + 5, y + h * 0.29, 3, 2);
      // Ground / road
      ctx.fillStyle = '#221022';
      ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
      // Converging road
      ctx.fillStyle = '#3a2a3a';
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - 2, y + h * 0.6);
      ctx.lineTo(x + w / 2 + 2, y + h * 0.6);
      ctx.lineTo(x + w - 2, y + h);
      ctx.lineTo(x + 2, y + h);
      ctx.closePath();
      ctx.fill();
      // Dashed centerline
      ctx.fillStyle = '#ffe066';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(x + w / 2 - 1, y + h * 0.68 + i * 6, 2, 3);
      }
      // Car
      ctx.fillStyle = '#e83030';
      ctx.fillRect(x + w / 2 - 4, y + h - 9, 8, 5);
      ctx.fillStyle = '#111';
      ctx.fillRect(x + w / 2 - 3, y + h - 4, 2, 2);
      ctx.fillRect(x + w / 2 + 1, y + h - 4, 2, 2);
    }
  },

  22: {
    label: 'LEVEL 22',
    keys: '[ ] \\',
    era: '1982',
    // Q*bert: "four-way joystick rotated 45 degrees to match Q*bert's diagonal movement axes"
    controls: { stick: '4way-diag', buttons: 0 },
    colors: { body: '#1a0a2a', screen: '#000', accent: '#ff8c1a', trim: '#3a1a4a' },
    drawScreen(ctx, x, y, w, h) {
      // Dark violet background
      ctx.fillStyle = '#180830';
      ctx.fillRect(x, y, w, h);
      // Isometric pyramid of cubes
      const cw = 7, ch = 5;
      const rows = 5;
      const baseX = x + w / 2;
      const baseY = y + 6;
      for (let r = 0; r < rows; r++) {
        const count = r + 1;
        const rowY = baseY + r * ch;
        for (let c = 0; c < count; c++) {
          const cubeX = baseX - (count - 1) * cw / 2 + c * cw;
          const flipped = (r * 3 + c) % 2 === 0;
          // top face (2-tone flip state)
          ctx.fillStyle = flipped ? '#3ad0e0' : '#ffb020';
          ctx.fillRect(cubeX - cw / 2, rowY, cw - 1, ch - 1);
          // side shading
          ctx.fillStyle = flipped ? '#1a7a88' : '#a05c00';
          ctx.fillRect(cubeX - cw / 2, rowY + ch - 2, cw - 1, 2);
        }
      }
      // Q*bert (orange blob) hopping on one cube
      ctx.fillStyle = '#ff8c1a';
      ctx.fillRect(baseX - 3, baseY + 2 * ch - 2, 6, 6);
      ctx.fillStyle = '#111';
      ctx.fillRect(baseX - 2, baseY + 2 * ch, 1, 1);
      ctx.fillRect(baseX + 1, baseY + 2 * ch, 1, 1);
    }
  },

  23: {
    label: 'LEVEL 23',
    keys: "` '",
    era: '1980',
    // Missile Command: "trackball + three fire buttons" (arcade-museum.com; Theurer
    // chose the trackball for speed over a joystick). IMAGERY-CORRECTED: the photo
    // (research/wiki/tech/arcade-control-panels.md) shows the trackball on the RIGHT
    // and the three fire buttons as large YELLOW rectangles to its LEFT — neither
    // fact is in any text source we hold.
    controls: { stick: 'trackball', buttons: 3, stickSide: 'right',
                buttonColor: '#e8c81e', buttonShape: 'wide' },
    colors: { body: '#040404', screen: '#000', accent: '#ff2222', trim: '#2a0a0a' },
    drawScreen(ctx, x, y, w, h) {
      // Black sky
      ctx.fillStyle = '#000';
      ctx.fillRect(x, y, w, h);
      // Green ground
      ctx.fillStyle = '#0a4a10';
      ctx.fillRect(x, y + h - 6, w, 6);
      // City blocks (never destroyed — this cabinet is defensive only)
      ctx.fillStyle = '#33cc44';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + 3 + i * 9, y + h - 10, 5, 4);
      }
      // Incoming missile trails
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 2);
      ctx.lineTo(x + 14, y + h - 12);
      ctx.moveTo(x + w - 6, y + 3);
      ctx.lineTo(x + w - 16, y + h - 14);
      ctx.stroke();
      // Counter-missile trail from battery
      ctx.strokeStyle = '#66ff66';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h - 8);
      ctx.lineTo(x + w / 2 - 4, y + h * 0.4);
      ctx.stroke();
      // Explosion ring (interception, not impact)
      ctx.strokeStyle = '#ffee55';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + w / 2 - 4, y + h * 0.4, 5, 0, Math.PI * 2);
      ctx.stroke();
      // Battery
      ctx.fillStyle = '#66ff66';
      ctx.fillRect(x + w / 2 - 3, y + h - 8, 6, 3);
    }
  },

  24: {
    label: 'LEVEL 24',
    keys: 'SHIFT',
    era: 'NOW',
    colors: { body: '#241a04', screen: '#000', accent: '#ffd700', trim: '#4a3a10' },
    drawScreen(ctx, x, y, w, h) {
      ctx.fillStyle = '#0a0600';
      ctx.fillRect(x, y, w, h);
      // Score table rows suggesting a high-score board
      ctx.fillStyle = '#e8c040';
      const rowH = 4;
      for (let r = 0; r < 5; r++) {
        const ry = y + 3 + r * (rowH + 1);
        ctx.globalAlpha = r === 0 ? 1 : 0.6 - r * 0.08;
        ctx.fillRect(x + 3, ry, 10, 2);           // name block
        ctx.fillRect(x + w - 15, ry, 12, 2);       // score block
      }
      ctx.globalAlpha = 1;
      // Glowing entry row (the current player)
      ctx.fillStyle = '#fff2a8';
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 4;
      const gy = y + h - 10;
      ctx.fillRect(x + 3, gy, 12, 3);
      ctx.fillRect(x + w - 17, gy, 12, 3);
      ctx.shadowBlur = 0;
      // Blinking cursor block
      const blink = Math.floor(Date.now() / 500) % 2 === 0;
      if (blink) {
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(x + 16, gy, 2, 3);
      }
    }
  },

  25: {
    label: 'LEVEL 25',
    keys: 'SPACE ⌫',
    era: 'NOW',
    colors: { body: '#161a20', screen: '#000', accent: '#8fd0ff', trim: '#2a3038' },
    drawScreen(ctx, x, y, w, h) {
      // Dark desk background
      ctx.fillStyle = '#12151b';
      ctx.fillRect(x, y, w, h);
      // Pale page centered on the desk
      const pw = w - 10, ph = h - 8;
      const px = x + (w - pw) / 2, py = y + (h - ph) / 2;
      ctx.fillStyle = '#f7f5ee';
      ctx.fillRect(px, py, pw, ph);
      // Gray text lines
      ctx.fillStyle = '#888';
      for (let i = 0; i < 4; i++) {
        const lw = i === 3 ? pw * 0.4 : pw * 0.7;
        ctx.fillRect(px + 3, py + 4 + i * 5, lw, 2);
      }
      // Blinking cursor block
      const blink = Math.floor(Date.now() / 500) % 2 === 0;
      if (blink) {
        ctx.fillStyle = '#2255cc';
        ctx.fillRect(px + 3 + pw * 0.4 + 2, py + 4 + 3 * 5, 2, 3);
      }
    }
  }
};

// ─── The rubber duck ────────────────────────────────────────────────────────
// A 7x8 pixel duck in cabinet space (drawCabinet's 56x80 grid), drawn on the
// Level 20 terminal cabinet's control panel. Rubber-duck debugging: explaining
// the problem out loud to something that never says a word
// (research/wiki/culture/rubber-duck-debugging.md). Set dressing only — the
// game never points at it (easter-eggs.md rule 5, "eggs are for finding").
const DUCK_BODY  = '#ffd23f';
const DUCK_SHADE = '#c8900f';
const DUCK_BEAK  = '#ff8c1a';
const DUCK_EYE   = '#1a1206';

function drawRubberDuck(ctx, x, y) {
  ctx.fillStyle = DUCK_BODY;
  ctx.fillRect(x + 2, y, 3, 3);          // head
  ctx.fillRect(x, y + 2, 1, 1);          // upturned tail
  ctx.fillRect(x, y + 3, 6, 3);          // body
  ctx.fillStyle = DUCK_SHADE;
  ctx.fillRect(x + 1, y + 6, 4, 1);      // rounded waterline shadow
  ctx.fillRect(x, y + 4, 1, 2);          // tail-side shading
  ctx.fillStyle = DUCK_BEAK;
  ctx.fillRect(x + 5, y + 1, 2, 1);      // beak
  ctx.fillStyle = DUCK_EYE;
  ctx.fillRect(x + 3, y + 1, 1, 1);      // eye
}

// The cabinet shell every machine in this arcade is drawn in — the 25 curriculum
// cabinets AND the bonus acts' cabinets, because they are the same arcade. Only
// the marquee colours and the SCREEN differ, which is what "a different cabinet"
// has always meant here.
// ─── The control panel ──────────────────────────────────────────────────────
// Every cabinet used to get the same panel: one joystick and two buttons. The
// game's OWN research says otherwise on nearly every machine, and Trevor caught
// it (2026-09-13): "we should also look when we should introduce more than a
// joystick and two buttons... as eventually games got more complex with more
// buttons, more levers, etc."
//
// The panel is the one part of a cabinet a player's hands actually touched, so a
// wrong one is the same class of error as a wrong screen — and Breakout's was
// not merely generic, it was FALSE: Breakout has no joystick at all. Its own
// wiki page says "rotary knob (paddle controller), horizontal movement only."
//
// `controls` is therefore a CITED descriptor, and absent means "not yet
// sourced" — never "assume a joystick". Ground truth is research/wiki/games/*.md
// and research/arcade-cabinets-by-era.md, per theme-authoring.md's mechanics-
// fidelity rule; a machine whose controls the wiki does not document is an
// arcade-historian follow-up, not a licence to improvise.
//
//   stick:   'knob' | 'trackball' | 'wheel' | 'none'
//            | '2way' | '4way' | '4way-diag' | '8way'
//   buttons: 0-6
const DEFAULT_CONTROLS = { stick: '8way', buttons: 2 };

// Optional fields, added 2026-09-13 when photographs of real cabinets were read
// (Trevor: "make sure we base them on actual discovered text AND imagery"):
//   stickSide:   'left' (default) | 'right'   — Missile Command's trackball sits
//                RIGHT of its fire buttons, which the text source never said.
//   buttonColor: overrides the cabinet accent — Missile Command's three fire
//                buttons are large YELLOW rectangles, not small accent squares.
//   buttonShape: 'square' (default) | 'wide'
//   pedals:      true — a driving cabinet's floor pedals, drawn on the base.
function drawControlPanel(ctx, w, data) {
  const c = data.controls || DEFAULT_CONTROLS;
  const n = Math.max(0, Math.min(6, c.buttons === undefined ? DEFAULT_CONTROLS.buttons : c.buttons));
  const stickRight = c.stickSide === 'right';

  ctx.fillStyle = '#222';
  ctx.fillRect(10, 46, w - 20, 12);          // the panel itself

  ctx.save();
  ctx.translate(stickRight ? 14 : 0, 0);     // the device block, left or right
  drawStickDevice(ctx, c.stick);
  ctx.restore();

  drawPanelButtons(ctx, n, stickRight ? 11 : 28,
                   c.buttonColor || data.colors.accent, c.buttonShape);
}

// Drawn around x12-24; the caller translates it into place.
function drawStickDevice(ctx, stick) {
  switch (stick) {
    case 'none':
      break;
    case 'knob':                              // Breakout: a rotary paddle dial
      ctx.fillStyle = '#555';
      ctx.fillRect(14, 48, 8, 8);
      ctx.fillRect(13, 49, 10, 6);
      ctx.fillStyle = '#ccc';                 // the pointer, so it reads as a DIAL
      ctx.fillRect(17, 48, 2, 4);
      break;
    case 'trackball':                         // Missile Command: a big rolling ball
      ctx.fillStyle = '#888';
      ctx.fillRect(13, 47, 10, 10);
      ctx.fillRect(12, 48, 12, 8);
      ctx.fillStyle = '#ddd';                 // highlight — a sphere, not a disc
      ctx.fillRect(15, 49, 3, 3);
      break;
    case 'wheel':                             // Out Run: a wheel, and a gear shifter
      // Drawn as a RING seen from above. The first attempt drew dark spokes on a
      // dark panel and photographed as a grey plus sign — a steering wheel has to
      // read as a circle with a hole in it or it is not a steering wheel.
      ctx.fillStyle = '#9a9a9a';
      ctx.fillRect(13, 46, 10, 12);           // rim
      ctx.fillRect(12, 48, 12, 8);
      ctx.fillStyle = '#222';                 // the hole
      ctx.fillRect(15, 49, 6, 6);
      ctx.fillRect(16, 48, 4, 8);
      ctx.fillStyle = '#9a9a9a';
      ctx.fillRect(17, 51, 2, 2);             // hub
      ctx.fillStyle = '#555';                 // the stick shift, beside it
      ctx.fillRect(30, 50, 2, 6);
      ctx.fillStyle = '#c8c8c8';
      ctx.fillRect(29, 48, 4, 3);
      break;
    default: {                                // a stick: shaft, ball, and its gate
      const gate = stick === '4way' || stick === '4way-diag';
      ctx.fillStyle = '#3a3a3a';
      if (gate) ctx.fillRect(13, 48, 9, 8);   // a square gate plate reads "restricted"
      else ctx.fillRect(14, 49, 7, 6);
      ctx.fillStyle = '#666';
      ctx.fillRect(16, 48, 3, 8);             // shaft
      ctx.fillStyle = '#f00';
      ctx.fillRect(15, 46, 5, 3);             // ball top
      if (stick === '4way-diag') {            // Q*bert's stick is rotated 45 degrees
        ctx.fillStyle = '#9a9a9a';            // so its gate points at the CORNERS
        ctx.fillRect(12, 46, 3, 3);
        ctx.fillRect(20, 46, 3, 3);
        ctx.fillRect(12, 55, 3, 3);
        ctx.fillRect(20, 55, 3, 3);
      }
      break;
    }
  }
}

// Up to three across, wrapping to a second row — which is exactly how Street
// Fighter II's six (three punch, three kick) actually sat.
function drawPanelButtons(ctx, n, x0, color, shape) {
  const wide = shape === 'wide';
  const bw = wide ? 5 : 4, pitch = wide ? 6 : 6;
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    ctx.fillRect(x0 + col * pitch, (n > 3 ? 47 : 49) + row * 5, bw, wide ? 5 : 4);
  }
}

function drawCabinetArt(canvas, data, scale = 2) {
  const w = 56;
  const h = 80;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width  = Math.round(w * scale) + 'px';
  canvas.style.height = Math.round(h * scale) + 'px';
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = data.colors.body;
  ctx.fillRect(4, 0, w-8, h);

  ctx.fillStyle = data.colors.accent;
  ctx.fillRect(6, 2, w-12, 8);
  ctx.fillStyle = '#000';
  ctx.fillRect(8, 3, w-16, 6);

  const sx = 8, sy = 12, sw = w-16, sh = 30;
  ctx.fillStyle = data.colors.trim;
  ctx.fillRect(sx-1, sy-1, sw+2, sh+2);
  data.drawScreen(ctx, sx, sy, sw, sh);

  drawControlPanel(ctx, w, data);

  ctx.fillStyle = '#555';
  ctx.fillRect(w/2-3, 60, 6, 2);

  ctx.fillStyle = data.colors.body;
  ctx.fillRect(6, 64, w-12, 16);
  ctx.fillStyle = '#111';
  ctx.fillRect(10, 74, 8, 6);
  ctx.fillRect(w-18, 74, 8, 6);

  ctx.fillStyle = data.colors.accent;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(5, 10, 1, 54);
  ctx.fillRect(w-6, 10, 1, 54);
  ctx.globalAlpha = 1;

  // A driving cabinet's floor pedals. Drawn HERE, not in drawControlPanel, because
  // the panel is painted before the cabinet's base and the base was overpainting
  // them — they photographed as simply absent.
  if (data.controls && data.controls.pedals) {
    ctx.fillStyle = '#8d8d8d';
    ctx.fillRect(21, 66, 5, 7);
    ctx.fillRect(30, 66, 5, 7);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(21, 72, 5, 2);
    ctx.fillRect(30, 72, 5, 2);
  }

  // Optional per-cabinet set dressing drawn on the cabinet BODY (not its
  // screen) — see CABINET_DATA[20].drawExtras, the rubber duck.
  if (data.drawExtras) data.drawExtras(ctx, w, h);
}

// ─── Console stations — the levels that were never coin-ops ─────────────────
// Acts 2-4 have been drawn as upright arcade cabinets since Act 2 shipped, while
// the design bible names the actual object for every one of them: L9 "the NES in
// the center of the room", L10 "a gold-cartridge NES beside a wooden TV", L11 "a
// Genesis console", L15 "a Game Boy Pocket on a backlit stand"
// (.claude/rules/levels/act2.md, act3.md). That is the DRAW A REAL THING rule
// (theme-authoring.md) being violated by roughly twelve of the twenty-five, and
// it is why the Apple IIe looked out of place beside them: it was the only
// machine in the row drawn as a machine.
//
// The SCREEN is unchanged — `data.drawScreen` still paints the game, era-faithful
// as before. Only the box around it changes, from a cabinet to the machine the
// act file names.
//
// Per journal F29, each machine is drawn from a PHOTOGRAPH, not from the text
// silhouette notes alone. NES reference and licence:
// research/wiki/tech/console-hardware-silhouettes.md §Media.
function drawConsoleStation(canvas, data, scale = 2) {
  const w = 56, h = 80;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width  = Math.round(w * scale) + 'px';
  canvas.style.height = Math.round(h * scale) + 'px';
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = '#0a0a12';  ctx.fillRect(0, 0, w, h);      // the room
  ctx.fillStyle = '#2b2016';  ctx.fillRect(0, 62, w, 18);     // the floor/shelf
  ctx.fillStyle = '#171009';  ctx.fillRect(0, 68, w, 12);

  // A wooden television — act2.md L10 says "a wooden TV" in so many words.
  ctx.fillStyle = '#6b4a2a';  ctx.fillRect(4, 3, 48, 44);     // veneer cabinet
  ctx.fillStyle = '#4a3320';
  ctx.fillRect(4, 43, 48, 4);                                 // shadowed underside
  ctx.fillStyle = '#1a1a20';  ctx.fillRect(7, 6, 42, 34);     // the bezel well
  data.drawScreen(ctx, 9, 8, 38, 30);                         // the game itself
  ctx.fillStyle = '#c8a26a';                                  // two tuning knobs
  ctx.fillRect(50, 12, 3, 4);
  ctx.fillRect(50, 20, 3, 4);
  ctx.fillStyle = '#3a2816';                                  // legs
  ctx.fillRect(9, 47, 4, 5);
  ctx.fillRect(43, 47, 4, 5);

  // The NES, front-loading, two-tone grey with the red wordmark.
  ctx.fillStyle = '#d3d3d3';  ctx.fillRect(8, 53, 28, 9);     // light upper body
  ctx.fillStyle = '#9a9a9a';  ctx.fillRect(8, 59, 28, 3);     // darker lower band
  ctx.fillStyle = '#c2c2c2';  ctx.fillRect(11, 54, 17, 4);    // the cartridge door
  ctx.fillStyle = '#2a2a2e';  ctx.fillRect(30, 53, 4, 6);     // the dark right stripe
  ctx.fillStyle = '#c8202a';  ctx.fillRect(11, 60, 9, 1);     // "Nintendo" in red
  ctx.fillStyle = '#7a7a7a';                                  // POWER / RESET
  ctx.fillRect(22, 60, 3, 1);
  ctx.fillRect(26, 60, 3, 1);

  // The controller: black cross left, two red buttons right.
  ctx.fillStyle = '#cfcfcf';  ctx.fillRect(39, 55, 13, 7);
  ctx.fillStyle = '#26262a';                                  // D-pad
  ctx.fillRect(41, 57, 4, 2);
  ctx.fillRect(42, 56, 2, 4);
  ctx.fillStyle = '#8a8a8a';  ctx.fillRect(45, 58, 3, 1);     // select/start
  ctx.fillStyle = '#c8202a';                                  // A and B
  ctx.fillRect(47, 57, 2, 2);
  ctx.fillRect(50, 57, 2, 2);
  ctx.fillStyle = '#0a0a12';  ctx.fillRect(37, 58, 2, 1);     // the cable
}

function drawCabinet(canvas, levelNum, scale = 2) {
  const data = CABINET_DATA[levelNum];
  // `shell` names what this level's machine actually IS. Absent = an upright
  // arcade cabinet, which is correct for Acts 1 and 5 and is the still-unfixed
  // default for the rest (docs/ROADMAP.md §3).
  if (data.shell === 'console') drawConsoleStation(canvas, data, scale);
  else drawCabinetArt(canvas, data, scale);
}

// One row of machines, built the same way for every act in the game: a curriculum
// act passes its five cabinets, a bonus act passes its wall. `spec` rows are
// { key, className, label, keys, draw, locked, onPick }.
function renderMachineRow(container, specs) {
  container.innerHTML = '';
  for (const spec of specs) {
    const div = document.createElement('div');
    div.className = spec.className;
    if (spec.dataset) for (const [k, v] of Object.entries(spec.dataset)) div.dataset[k] = v;

    const canvas = document.createElement('canvas');
    spec.draw(canvas);

    const label = document.createElement('div');
    label.className = 'cabinet-label';
    label.textContent = spec.label;          // textContent only (security.md rule 1)

    const keys = document.createElement('div');
    keys.className = 'select-keys';
    keys.textContent = spec.keys || '';

    div.appendChild(canvas);
    div.appendChild(label);
    div.appendChild(keys);
    container.appendChild(div);

    if (spec.onPick) div.addEventListener('click', spec.onPick);
  }
}

// A bonus act's wall can hold far more machines than an act of five (Act 7 grows
// to eleven tracks, docs/specs/act7-speed-racing.md §5.6b), so the row is a
// CAMERA: one row along the wall, always centred on the machine the player is
// standing at, with the rest of the wall running off both edges. Programmatic
// scrollLeft only — the container is overflow:hidden, so there is no scrollbar to
// find and nothing for a child to have to discover.
function centreOnSelected(container) {
  const sel = container.querySelector('.select-cabinet.selected');
  const panning = container.scrollWidth > container.clientWidth + 1;
  container.classList.toggle('wing-wall-panning', panning);
  if (!sel || !panning) { container.scrollLeft = 0; return; }
  const target = sel.offsetLeft + sel.offsetWidth / 2 - container.clientWidth / 2;
  container.scrollLeft = Math.max(0, Math.min(target, container.scrollWidth - container.clientWidth));
}

export function renderSelectScreen(state) {
  mothNoteActivity();   // a render means the player is doing something
  mothStart();
  const wing = focusedDoor(state);
  if (wing) { renderWingAct(state, wing); return; }
  const act = getActForLevel(state.selectedLevel);
  const actIdx = ACTS.indexOf(act);

  const freePlayPrefix = state.freePlay ? 'FREE PLAY · ' : '';
  $('select-act-label').textContent = `${freePlayPrefix}ACT ${act.num}  ·  ${act.name}  ·  ${act.era}`;

  const promptEl = $('select-prompt');
  if (promptEl.dataset.base === undefined) {
    promptEl.dataset.base = promptEl.textContent;
  }
  promptEl.textContent = promptEl.dataset.base
    + (state.freePlay ? '  ·  F: FREE PLAY ON' : '  ·  F: FREE PLAY OFF');

  const prevAct = ACTS[actIdx - 1];
  $('select-act-prev').textContent = prevAct
    ? `▲  ACT ${prevAct.num}  —  ${prevAct.name}`
    : '';

  // Past the last curriculum act the walk continues into the bonus acts — but
  // only the ones this player has earned. A locked wing is named nowhere and
  // drawn nowhere: it does not exist yet.
  const nextAct = ACTS[actIdx + 1] || availableDoors(state)[0];
  $('select-act-next').textContent = nextAct
    ? `▼  ACT ${nextAct.num}  —  ${nextAct.name}`
    : '';

  const container = $('select-cabinets');
  container.classList.remove('wing-wall', 'wing-wall-panning');

  renderMachineRow(container, act.levels.filter(n => CABINET_DATA[n]).map(levelNum => {
    const data = CABINET_DATA[levelNum];
    const locked = isLevelLocked(state, levelNum);
    return {
      className: 'select-cabinet'
        + (levelNum === state.selectedLevel ? ' selected' : '')
        + (locked ? ' locked' : ''),
      dataset: { level: String(levelNum) },
      draw: (canvas) => drawCabinet(canvas, levelNum),
      // Locked cabinets are dark silhouettes with no game revealed yet.
      label: locked ? '???' : (data.label + ' · ' + data.era),
      keys: locked ? '' : data.keys,
      // Locked cabinets can't be selected ahead of progress.
      onPick: locked ? null : () => {
        state.selectedLevel = levelNum;
        updateSelectHighlight(state);
      },
    };
  }));
}

// A BONUS ACT's page (state.wingIndex is set) — the same page shape as Acts 1–5:
// act number, name and era up top, the acts either side on the ▲/▼ lines, and a
// row of machines walked with ◀ ▶. Act 7 stands its real cabinets here; Act 6
// stands its door, which is the honest object (see BACK_WALL_DOORS).
//
// Everything comes from the registry row, so a new wing needs no edit here.
function renderWingAct(state, wing) {
  const wings = availableDoors(state);
  const idx = wings.indexOf(wing);
  const entries = wingEntries(wing);
  const currentIdx = focusedEntryIndex(state, wing);

  $('select-act-label').textContent =
    `ACT ${wing.num}  ·  ${wing.name}  ·  ${wingEra(wing)}`;

  const promptEl = $('select-prompt');
  if (promptEl.dataset.base === undefined) promptEl.dataset.base = promptEl.textContent;
  promptEl.textContent = promptEl.dataset.base;

  const prevWing = wings[idx - 1];
  const lastAct = ACTS[ACTS.length - 1];
  $('select-act-prev').textContent = prevWing
    ? `▲  ACT ${prevWing.num}  —  ${prevWing.name}`
    : `▲  ACT ${lastAct.num}  —  ${lastAct.name}`;

  const nextWing = wings[idx + 1];
  $('select-act-next').textContent = nextWing
    ? `▼  ACT ${nextWing.num}  —  ${nextWing.name}`
    : '';

  const container = $('select-cabinets');
  container.classList.add('wing-wall');

  const specs = [];
  // The doorway you came through, standing at the head of this act's wall — the
  // back room made visible instead of announced (Trevor, 2026-09-13). It is set
  // dressing, never a target: the cursor walks cabinets only. A wing WITHOUT
  // cabinets IS its door, so it isn't drawn twice.
  if (entries.length && !entries[0].isDoor) {
    specs.push({
      className: 'select-cabinet select-wall-door',
      draw: (canvas) => wing.door.art(canvas, 2),
      label: wing.door.label,
      keys: wing.door.hint,
    });
  }

  entries.forEach((entry, i) => {
    specs.push({
      className: 'select-cabinet select-door' + (i === currentIdx ? ' selected' : ''),
      // NOT data-level — the moth only visits the curriculum's lit cabinets.
      // data-door names the WING this machine is a way into (the contract
      // tests/integration/speedway.test.mjs and docs/screenshots/capture-speedway.js
      // read); data-entry names the machine itself.
      dataset: entry.id ? { door: wing.id, entry: entry.id } : { door: wing.id },
      draw: entry.draw,
      label: entry.label,
      keys: entry.hint,
      onPick: () => {
        state.wingEntry = entry.id;
        renderSelectScreen(state);
      },
    });
  });

  renderMachineRow(container, specs);
  centreOnSelected(container);
}

// A bonus act's era: whatever the registry declares, or — for a wing whose wall
// grows — derived from the cabinets actually standing on it, so it can never
// claim an era it isn't showing.
function wingEra(wing) {
  if (wing.era) return wing.era;
  const years = (wing.cabinets || [])
    .map(id => WING_CABINETS[id] && parseInt(WING_CABINETS[id].era, 10))
    .filter(y => Number.isFinite(y));
  if (!years.length) return '';
  const lo = Math.min(...years), hi = Math.max(...years);
  return lo === hi ? String(lo) : `${lo}–${hi}`;
}

export function updateSelectHighlight(state) {
  mothNoteActivity();
  // In a bonus act there are no levels to highlight — renderWingAct owns it.
  if (focusedDoor(state)) return;
  document.querySelectorAll('.select-cabinet').forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.level) === state.selectedLevel);
  });
}

export function navigateAct(state, delta) {
  // The bonus acts sit one step BELOW the last curriculum act, and ↑/↓ walk
  // through them in registry order exactly like any other act change. ↑ from the
  // first bonus act always returns to the arcade — the back room can never trap
  // the cursor.
  const wings = availableDoors(state);
  if (focusedDoor(state)) {
    const next = state.wingIndex + delta;
    if (next < 0) { clearDoorFocus(state); renderSelectScreen(state); return; }
    if (next >= wings.length) return; // the last bonus act is the last thing here
    state.wingIndex = next;
    state.wingEntry = null;           // land at the head of the new act's wall
    renderSelectScreen(state);
    return;
  }
  const act = getActForLevel(state.selectedLevel);
  const actIdx = ACTS.indexOf(act);
  const newActIdx = actIdx + delta;
  if (newActIdx < 0) return;
  if (newActIdx >= ACTS.length) {
    // Past the final curriculum act → into the first bonus act, if it's earned.
    if (delta > 0 && wings.length > 0) {
      state.wingIndex = 0;
      state.wingEntry = null;
      renderSelectScreen(state);
    }
    return;
  }
  const newLevels = ACTS[newActIdx].levels;
  const posInAct = act.levels.indexOf(state.selectedLevel);
  const target = newLevels[posInAct];
  // Landing on a locked cabinet in the new act would strand the cursor —
  // clamp back to the last unlocked one there. (If the whole act is locked,
  // this parks on its first cabinet, which stays unselectable at Enter time.)
  state.selectedLevel = firstUnlockedAtOrBelow(state, newLevels, target);
  renderSelectScreen(state);
}

export function navigateWithinAct(state, delta) {
  // In a bonus act, ◀ ▶ walk that act's wall — the same motion as walking the
  // five cabinets of any other act.
  const wing = focusedDoor(state);
  if (wing) {
    const entries = wingEntries(wing);
    const newPos = focusedEntryIndex(state, wing) + delta;
    if (newPos < 0 || newPos >= entries.length) return;
    state.wingEntry = entries[newPos].id;
    renderSelectScreen(state);
    return;
  }
  const act = getActForLevel(state.selectedLevel);
  const pos = act.levels.indexOf(state.selectedLevel);
  const newPos = pos + delta;
  if (newPos < 0 || newPos >= act.levels.length) return;
  const target = act.levels[newPos];
  if (isLevelLocked(state, target)) return; // can't move onto a locked cabinet
  state.selectedLevel = target;
  updateSelectHighlight(state);
}

export function selectByPosition(state, pos) {
  const wing = focusedDoor(state);
  if (wing) {
    // Number keys pick along a bonus act's wall too, same as any other act.
    const entries = wingEntries(wing);
    const entry = entries[pos - 1];
    if (!entry) return;
    state.wingEntry = entry.id;
    renderSelectScreen(state);
    return;
  }
  const act = getActForLevel(state.selectedLevel);
  const levelNum = act.levels[pos - 1];
  if (!levelNum) return;
  if (isLevelLocked(state, levelNum)) return; // locked cabinets aren't pickable
  state.selectedLevel = levelNum;
  updateSelectHighlight(state);
}

export { isLevelLocked };

// ═══ THE MOTH ════════════════════════════════════════════════════════════════
// A hide-and-seek easter egg (.claude/rules/easter-eggs.md, proposed #1 — now
// built). Very rarely, while the arcade's select screen is sitting completely
// still, a tiny pixel moth flutters in and settles on one of the LIT cabinet
// screens (moths go to light; dark, unearned cabinets get none). Click it and
// the 1947 logbook line appears for a few seconds, then fades.
//
// The 1947 facts are from research/wiki/moments/mark-ii-moth-1947.md (4 cited
// sources): a moth found in a relay of the Harvard Mark II on September 9,
// 1947, taped into the operations logbook under "First actual case of bug
// being found." The text below quotes the logbook and nothing else — the wiki
// is explicit that Grace Hopper neither found nor logged it (journal F7: a
// child-facing card once overstated exactly this), and that "bug" for a
// technical fault predates 1947.
//
// Design rules this obeys: it never interrupts flow (it can only appear when
// nothing is happening, and it never pauses, gates, or steals a keypress); it
// is never advertised; missing it costs nothing and it can come back another
// time; it is a friendly visitor, never an infestation.

const MOTH_IDLE_MS    = 12000;  // the screen must sit untouched this long first
const MOTH_ROLL_MS    = 1000;   // then one quiet roll of the dice per second
const MOTH_CHANCE     = 0.03;   // ~3% a second — rare enough to be a real find
const MOTH_ARRIVE_MS  = 2200;   // flutter-in
const MOTH_REST_MS    = 16000;  // how long it sits before moving on
const MOTH_LEAVE_MS   = 1600;   // flutter-out
const MOTH_HIT_R      = 9;      // generous cabinet-space hit radius (small hands)
const MOTH_MESSAGE_MS = 7000;

const MOTH_FOUND_TEXT =
  '"FIRST ACTUAL CASE OF BUG BEING FOUND."\n' +
  'HARVARD MARK II LOGBOOK  ·  SEPTEMBER 9, 1947';

const MOTH_WING  = '#ded7c0';   // pale wing — reads on dark AND bright screens
const MOTH_SHADE = '#98907a';
const MOTH_BODY  = '#38322a';

// The moth lives on one cabinet's own 56x80 canvas, in canvas space (journal
// L16 — never DOM space). `level` is the cabinet it chose.
const moth = {
  active: false,
  found: false,        // found once per page load, then it stops coming
  level: 0,
  phase: 'arrive',     // 'arrive' | 'rest' | 'leave'
  phaseStart: 0,
  fromX: 0, fromY: 0,
  restX: 0, restY: 0,
  x: 0, y: 0,
};

let mothRaf = null;
let mothLastActivity = 0;
let mothLastRoll = 0;
let mothHiddenSince = 0;
let mothClickWired = false;
let mothMessageTimer = null;

function mothNow() {
  return (typeof performance !== 'undefined' && performance.now)
    ? performance.now()
    : Date.now();
}

// Any navigation, render, or keypress counts as "the player is here" — the moth
// only ever visits a still screen, and any activity sends it on its way.
function mothNoteActivity() {
  const now = mothNow();
  mothLastActivity = now;
  // Disturbed: it leaves the way a moth leaves — fluttering off, not blinking
  // out. Nothing is lost by it going; it can always come back another time.
  if (moth.active && moth.phase !== 'leave') {
    moth.phase = 'leave';
    moth.phaseStart = now;
  }
}

function mothHostCanvas(level) {
  const holder = document.querySelector(
    '#select-cabinets .select-cabinet[data-level="' + level + '"]');
  return holder ? holder.querySelector('canvas') : null;
}

// Put the cabinet back the way we found it and forget the visitor.
function mothDismiss() {
  if (!moth.active) return;
  const host = mothHostCanvas(moth.level);
  moth.active = false;
  if (host) drawCabinet(host, moth.level);
}

function mothStart() {
  mothWireClick();
  if (mothRaf !== null) return;
  mothLastActivity = mothNow();
  mothRaf = requestAnimationFrame(mothTick);
}

function mothStop() {
  if (mothRaf !== null) cancelAnimationFrame(mothRaf);
  mothRaf = null;
}

function mothTick(now) {
  mothRaf = requestAnimationFrame(mothTick);

  const screen = document.getElementById('select-screen');
  if (!screen || screen.classList.contains('hidden')) {
    // Not on the arcade floor right now. (renderSelectScreen can legitimately
    // run a frame or two before showScreen, so allow a short grace period.)
    if (!mothHiddenSince) mothHiddenSince = now;
    mothDismiss();
    mothLastActivity = now;
    if (now - mothHiddenSince > 1500) mothStop();
    return;
  }
  mothHiddenSince = 0;

  if (!moth.active) { mothMaybeArrive(now); return; }

  const t = Math.max(0, now - moth.phaseStart);   // clamped: never negative
  let wingsWide = true;

  if (moth.phase === 'arrive') {
    const p = Math.min(1, t / MOTH_ARRIVE_MS);
    const e = p * p * (3 - 2 * p);                // smoothstep
    const settle = 1 - e;                          // wobble fades as it lands
    moth.x = moth.fromX + (moth.restX - moth.fromX) * e + Math.sin(p * 19) * 5 * settle;
    moth.y = moth.fromY + (moth.restY - moth.fromY) * e + Math.sin(p * 13) * 3 * settle;
    wingsWide = Math.floor(t / 80) % 2 === 0;
    if (p >= 1) { moth.phase = 'rest'; moth.phaseStart = now; }

  } else if (moth.phase === 'rest') {
    // Moths rest with their wings spread flat, with the occasional shiver.
    const shiver = t % 1500 < 170;
    moth.x = moth.restX;
    moth.y = moth.restY - (shiver ? 1 : 0);
    wingsWide = !shiver;
    if (t >= MOTH_REST_MS) { moth.phase = 'leave'; moth.phaseStart = now; }

  } else {
    const p = Math.min(1, t / MOTH_LEAVE_MS);
    moth.x = moth.restX + Math.sin(p * 16) * 7 * p;
    moth.y = moth.restY - 46 * p * p;
    wingsWide = Math.floor(t / 70) % 2 === 0;
    if (p >= 1) {
      mothDismiss();
      // It has to earn its way back: a fresh idle stretch, a fresh roll.
      mothLastActivity = now;
      mothLastRoll = now;
      return;
    }
  }

  mothDraw(wingsWide);
}

function mothMaybeArrive(now) {
  if (moth.found) return;
  if (now - mothLastActivity < MOTH_IDLE_MS) return;
  if (now - mothLastRoll < MOTH_ROLL_MS) return;
  mothLastRoll = now;
  if (Math.random() >= MOTH_CHANCE) return;

  // Only lit cabinets — a moth has no reason to visit a dark silhouette, and
  // the door view (no data-level) is not a cabinet at all.
  const lit = document.querySelectorAll(
    '#select-cabinets .select-cabinet[data-level]:not(.locked)');
  if (!lit.length) return;
  const holder = lit[Math.floor(Math.random() * lit.length)];
  const level = Number(holder.dataset.level);
  if (!CABINET_DATA[level]) return;

  // Landing spot: somewhere on the cabinet's screen glass (drawCabinet draws it
  // at 8,12 → 48,42), expressed in cabinet-canvas space.
  moth.level = level;
  moth.restX = 15 + Math.floor(Math.random() * 26);
  moth.restY = 19 + Math.floor(Math.random() * 17);
  moth.fromX = moth.restX + (Math.random() * 20 - 10);
  moth.fromY = -8;
  moth.x = moth.fromX;
  moth.y = moth.fromY;
  moth.phase = 'arrive';
  moth.phaseStart = now;
  moth.active = true;
}

function mothDraw(wingsWide) {
  const host = mothHostCanvas(moth.level);
  if (!host) { moth.active = false; return; }   // the act changed under us
  drawCabinet(host, moth.level);
  const ctx = host.getContext('2d');
  drawMoth(ctx, moth.x, moth.y, wingsWide);
}

// 7x8 pixel moth in cabinet space. Wings spread (resting) or folded (mid-flap).
function drawMoth(ctx, cx, cy, wingsWide) {
  const x = Math.round(cx), y = Math.round(cy);
  if (wingsWide) {
    ctx.fillStyle = MOTH_WING;
    ctx.fillRect(x - 3, y - 2, 7, 3);      // forewings
    ctx.fillStyle = MOTH_SHADE;
    ctx.fillRect(x - 2, y + 1, 5, 2);      // hindwings, a shade darker
  } else {
    ctx.fillStyle = MOTH_WING;
    ctx.fillRect(x - 1, y - 2, 3, 4);
    ctx.fillStyle = MOTH_SHADE;
    ctx.fillRect(x - 1, y + 2, 3, 1);
  }
  ctx.fillStyle = MOTH_BODY;
  ctx.fillRect(x, y - 2, 1, 6);            // body
  ctx.fillRect(x - 1, y - 4, 1, 2);        // antennae
  ctx.fillRect(x + 1, y - 4, 1, 2);
}

// ── Finding it ──────────────────────────────────────────────────────────────
// One capture-phase listener on the cabinet row, wired once. It only ever acts
// when the moth is actually under the click; every other click passes straight
// through to the cabinet's own handler, and the keyboard is never touched.
function mothWireClick() {
  if (mothClickWired) return;
  const container = $('select-cabinets');
  if (!container) return;
  container.addEventListener('click', mothClickCapture, true);
  mothClickWired = true;
}

function mothClickCapture(e) {
  if (!moth.active || moth.found) return;
  const target = e.target;
  if (!target || target.tagName !== 'CANVAS') return;
  const holder = target.parentElement;
  if (!holder || Number(holder.dataset.level) !== moth.level) return;

  // Hit-testing INPUT (not art placement) is the one place a pixel ratio is
  // legitimate: map the click into the canvas's own 56x80 space. offsetX/Y is
  // already local to the canvas and survives the .selected CSS scale.
  const sx = target.width / (target.clientWidth || target.width);
  const sy = target.height / (target.clientHeight || target.height);
  const dx = e.offsetX * sx - moth.x;
  const dy = e.offsetY * sy - moth.y;
  if (Math.sqrt(dx * dx + dy * dy) > MOTH_HIT_R) return;

  e.stopPropagation();   // finding the moth never moves the player's cursor
  moth.found = true;
  moth.phase = 'leave';
  moth.phaseStart = mothNow();
  mothShowFoundLine();
}

// The logbook line, in the bottom strip, fading in and out. A fixed code
// literal into textContent — never innerHTML, never a user-influenced string
// (.claude/rules/security.md rules 1-2). pointer-events:none so it can never
// swallow a click, and it never gates or pauses anything (the One Rule).
function mothShowFoundLine() {
  const screen = document.getElementById('select-screen');
  if (!screen) return;
  let el = document.getElementById('moth-found-line');
  if (!el) {
    el = document.createElement('div');
    el.id = 'moth-found-line';
    el.style.cssText = 'position:absolute;left:0;right:0;bottom:4%;text-align:center;'
      + 'font-size:7px;line-height:2.2;letter-spacing:1px;white-space:pre-line;'
      + 'color:#e8d9a0;text-shadow:0 0 8px rgba(232,217,160,0.45);'
      + 'pointer-events:none;opacity:0;transition:opacity 0.5s;';
    screen.appendChild(el);
  }
  el.textContent = MOTH_FOUND_TEXT;
  el.style.opacity = '1';
  if (mothMessageTimer) clearTimeout(mothMessageTimer);
  mothMessageTimer = setTimeout(() => {
    el.style.opacity = '0';
    mothMessageTimer = null;
  }, MOTH_MESSAGE_MS);
}

// Typing anywhere is activity — the moth only visits a screen nobody is using.
// Read-only listener: it never inspects a key, never preventDefaults, and never
// stops propagation, so keyboard navigation is completely unaffected.
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('keydown', mothNoteActivity);
}
