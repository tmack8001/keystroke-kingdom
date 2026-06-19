const $ = (id) => document.getElementById(id);

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
  }
};

function drawCabinet(canvas, levelNum) {
  const data = CABINET_DATA[levelNum];
  const w = 56;
  const h = 80;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = w * 2 + 'px';
  canvas.style.height = h * 2 + 'px';
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
  const container = $('select-cabinets');
  container.innerHTML = '';
  for (let i = 1; i <= 4; i++) {
    const data = CABINET_DATA[i];
    const div = document.createElement('div');
    div.className = 'select-cabinet' + (i === state.selectedLevel ? ' selected' : '');
    div.dataset.level = i;

    const canvas = document.createElement('canvas');
    drawCabinet(canvas, i);

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
      state.selectedLevel = i;
      updateSelectHighlight(state);
    });
  }
}

export function updateSelectHighlight(state) {
  document.querySelectorAll('.select-cabinet').forEach((el, idx) => {
    el.classList.toggle('selected', idx + 1 === state.selectedLevel);
  });
}
