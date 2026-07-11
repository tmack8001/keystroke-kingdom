const $ = (id) => document.getElementById(id);

const ACTS = [
  { num: 1, name: 'THE ARCADE',          era: '1976–1982', levels: [1, 2, 3, 4, 5]      },
  { num: 2, name: 'THE COMPUTER WING',   era: '1981–1986', levels: [6, 7, 8, 9, 10]     },
  { num: 3, name: 'THE BASEMENT',        era: '1991–1996', levels: [11, 12, 13, 14, 15] },
  { num: 4, name: 'THE COMMAND CENTER',  era: '1993–∞',    levels: [16, 17, 18, 19, 20] },
  { num: 5, name: 'FULL CIRCLE',         era: '1980–∞',    levels: [21, 22, 23, 24, 25] },
];

function getActForLevel(level) {
  return ACTS.find(a => a.levels.includes(level)) || ACTS[0];
}

const CABINET_DATA = {
  1: {
    label: 'LEVEL 1',
    keys: 'J F',
    era: '1977',
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
    era: '1960s–∞',
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
    }
  },

  // ═══ ACT 5 — FULL CIRCLE ═════════════════════════════════════════════════

  21: {
    label: 'LEVEL 21',
    keys: '- =',
    era: '1986',
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

function drawCabinet(canvas, levelNum, scale = 2) {
  const data = CABINET_DATA[levelNum];
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

  ctx.fillStyle = '#222';
  ctx.fillRect(10, 46, w-20, 12);
  ctx.fillStyle = '#666';
  ctx.fillRect(16, 48, 3, 8);
  ctx.fillStyle = '#f00';
  ctx.fillRect(15, 46, 5, 3);
  ctx.fillStyle = data.colors.accent;
  ctx.fillRect(28, 49, 4, 4);
  ctx.fillRect(34, 49, 4, 4);

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
}

export function renderSelectScreen(state) {
  const act = getActForLevel(state.selectedLevel);
  const actIdx = ACTS.indexOf(act);

  $('select-act-label').textContent = `ACT ${act.num}  ·  ${act.name}  ·  ${act.era}`;

  const prevAct = ACTS[actIdx - 1];
  $('select-act-prev').textContent = prevAct
    ? `▲  ACT ${prevAct.num}  —  ${prevAct.name}`
    : '';

  const nextAct = ACTS[actIdx + 1];
  $('select-act-next').textContent = nextAct
    ? `▼  ACT ${nextAct.num}  —  ${nextAct.name}`
    : '';

  const container = $('select-cabinets');
  container.innerHTML = '';

  for (const levelNum of act.levels) {
    const data = CABINET_DATA[levelNum];
    if (!data) continue;

    const div = document.createElement('div');
    div.className = 'select-cabinet' + (levelNum === state.selectedLevel ? ' selected' : '');
    div.dataset.level = levelNum;

    const canvas = document.createElement('canvas');
    drawCabinet(canvas, levelNum);

    const label = document.createElement('div');
    label.className = 'cabinet-label';
    label.textContent = data.label + ' · ' + data.era;

    const keys = document.createElement('div');
    keys.className = 'select-keys';
    keys.textContent = data.keys;

    div.appendChild(canvas);
    div.appendChild(label);
    div.appendChild(keys);
    container.appendChild(div);

    div.addEventListener('click', () => {
      state.selectedLevel = levelNum;
      updateSelectHighlight(state);
    });
  }
}

export function updateSelectHighlight(state) {
  document.querySelectorAll('.select-cabinet').forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.level) === state.selectedLevel);
  });
}

export function navigateAct(state, delta) {
  const act = getActForLevel(state.selectedLevel);
  const actIdx = ACTS.indexOf(act);
  const newActIdx = actIdx + delta;
  if (newActIdx < 0 || newActIdx >= ACTS.length) return;
  const posInAct = act.levels.indexOf(state.selectedLevel);
  state.selectedLevel = ACTS[newActIdx].levels[posInAct];
  renderSelectScreen(state);
}

export function navigateWithinAct(state, delta) {
  const act = getActForLevel(state.selectedLevel);
  const pos = act.levels.indexOf(state.selectedLevel);
  const newPos = pos + delta;
  if (newPos < 0 || newPos >= act.levels.length) return;
  state.selectedLevel = act.levels[newPos];
  updateSelectHighlight(state);
}

export function selectByPosition(state, pos) {
  const act = getActForLevel(state.selectedLevel);
  const levelNum = act.levels[pos - 1];
  if (!levelNum) return;
  state.selectedLevel = levelNum;
  updateSelectHighlight(state);
}
