import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/levels');
mkdirSync(outDir, { recursive: true });

const W = 1000;
const H = 700;

/** Seeded PRNG for reproducible layouts. */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normalized hit box centered on the cat; wider than the sprite for touch screens. */
function catHit(cx, cy, visualSize) {
  const w = Math.max(visualSize * 2.25, 0.072);
  const h = Math.max(visualSize * 2.0, 0.064);
  return {
    x: cx - w / 2,
    y: cy - h / 2,
    w,
    h,
  };
}

/** Tiny camouflaged cat head (reference style). */
function peekCatSvg(cx, cy, size, fill = '#8a8a8a', stroke = '#5c5c5c') {
  const scale = size;
  const localW = 100;
  const localH = 72;
  const localCenterX = 50;
  const localCenterY = 38;
  const x = cx * W - localCenterX * scale;
  const y = cy * H - localCenterY * scale;
  const sc = scale;
  return `
    <g class="hidden-cat" data-cat="1" transform="translate(${x},${y}) scale(${sc})">
      <path d="M 18 42 L 28 8 L 38 38 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
      <path d="M 62 42 L 72 8 L 82 38 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
      <ellipse cx="50" cy="44" rx="34" ry="28" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
      <circle cx="38" cy="40" r="3.5" fill="#1a1a1a"/>
      <circle cx="62" cy="40" r="3.5" fill="#1a1a1a"/>
      <path d="M 42 50 Q 50 54 58 50" fill="none" stroke="#3a3a3a" stroke-width="1.5"/>
    </g>`;
}

function roofTileLines(x, y, rw, rh, color = '#c45c3e') {
  let lines = '';
  for (let i = 0; i < rh; i += 5) {
    lines += `<line x1="${x}" y1="${y + i}" x2="${x + rw}" y2="${y + i}" stroke="${color}" stroke-width="0.6" opacity="0.35"/>`;
  }
  return lines;
}

/** Dense terracotta rooftop city (reference aesthetic). */
function drawRooftopCity(rand, opts = {}) {
  const roof = opts.roof ?? '#c45c3e';
  const wall = opts.wall ?? '#f2f0ec';
  const wallStroke = opts.wallStroke ?? '#2a2a2a';
  const bg = opts.bg ?? '#e8e4df';
  const cols = opts.cols ?? 14;
  const rows = opts.rows ?? 10;
  const cellW = W / cols;
  const cellH = H / rows;
  let svg = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const jitterX = (rand() - 0.5) * cellW * 0.15;
      const jitterY = (rand() - 0.5) * cellH * 0.12;
      const x = col * cellW + jitterX + 1;
      const y = row * cellH + jitterY + 1;
      const bw = cellW - 2 + rand() * 4;
      const bh = cellH * 0.42 + rand() * 8;
      const rh = cellH * 0.48 + rand() * 10;
      const roofY = y;
      const wallY = y + rh * 0.55;
      const wallH = bh + rh * 0.45;
      svg += `<polygon points="${x},${roofY + rh} ${x + bw / 2},${roofY} ${x + bw},${roofY + rh}" fill="${roof}" stroke="${wallStroke}" stroke-width="0.8"/>`;
      svg += roofTileLines(x, roofY, bw, rh, roof);
      svg += `<rect x="${x + 2}" y="${wallY}" width="${bw - 4}" height="${wallH}" fill="${wall}" stroke="${wallStroke}" stroke-width="0.7"/>`;
      if (rand() > 0.35) {
        const wx = x + bw * (0.2 + rand() * 0.5);
        const wy = wallY + wallH * (0.25 + rand() * 0.35);
        const ww = bw * (0.12 + rand() * 0.1);
        const wh = wallH * (0.2 + rand() * 0.15);
        svg += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#d8d4ce" stroke="${wallStroke}" stroke-width="0.5"/>`;
      }
      if (rand() > 0.7) {
        const cx = x + bw / 2;
        const cy = roofY + rh * 0.35;
        svg += `<circle cx="${cx}" cy="${cy}" r="3" fill="${wall}" stroke="${wallStroke}" stroke-width="0.5"/>`;
      }
    }
  }
  return svg;
}

function drawMarketGrid(rand) {
  let svg = `<rect width="${W}" height="${H}" fill="#f5e6d0"/>`;
  const cols = 12;
  const rows = 9;
  const cw = W / cols;
  const ch = H / rows;
  const awningColors = ['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cw + 2;
      const y = row * ch + 2;
      const aw = cw - 4;
      const ah = ch * 0.35;
      const colA = awningColors[Math.floor(rand() * awningColors.length)];
      svg += `<path d="M ${x} ${y + ah} L ${x + aw / 2} ${y} L ${x + aw} ${y + ah} Z" fill="${colA}" stroke="#333" stroke-width="0.6"/>`;
      for (let s = 0; s < 5; s++) {
        const sx = x + 4 + s * (aw / 5);
        svg += `<line x1="${sx}" y1="${y + ah}" x2="${sx}" y2="${y + ah + ch * 0.55}" stroke="#555" stroke-width="0.5"/>`;
      }
      svg += `<rect x="${x + 3}" y="${y + ah}" width="${aw - 6}" height="${ch * 0.58}" fill="#fff8ef" stroke="#444" stroke-width="0.6"/>`;
      for (let p = 0; p < 8; p++) {
        const px = x + 6 + (p % 4) * (aw / 4.5);
        const py = y + ah + 8 + Math.floor(p / 4) * (ch * 0.22);
        const ps = 4 + rand() * 6;
        svg += `<rect x="${px}" y="${py}" width="${ps}" height="${ps}" fill="hsl(${rand() * 360}, 55%, 55%)" stroke="#333" stroke-width="0.4"/>`;
      }
    }
  }
  return svg;
}

function drawBeachUmbrellas(rand) {
  let svg = `<rect width="${W}" height="${H}" fill="#5dade2"/>`;
  svg += `<rect x="0" y="${H * 0.45}" width="${W}" height="${H * 0.55}" fill="#f4d03f"/>`;
  const cols = 11;
  const rows = 8;
  const cw = W / cols;
  const ch = (H * 0.55) / rows;
  const baseY = H * 0.45;
  const colors = ['#e74c3c', '#fff', '#3498db', '#f39c12', '#2ecc71'];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cw + cw / 2 + (rand() - 0.5) * 10;
      const y = baseY + row * ch + ch / 2;
      const r = 18 + rand() * 14;
      const c = colors[Math.floor(rand() * colors.length)];
      svg += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.55}" fill="${c}" stroke="#333" stroke-width="0.7"/>`;
      svg += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 22}" stroke="#8b6914" stroke-width="1.2"/>`;
      if (rand() > 0.5) {
        svg += `<rect x="${x - 8}" y="${y + 20}" width="16" height="6" fill="#d35400" stroke="#333" stroke-width="0.4" rx="1"/>`;
      }
    }
  }
  return svg;
}

function drawForestCanopy(rand) {
  let svg = `<rect width="${W}" height="${H}" fill="#1e5631"/>`;
  const cols = 13;
  const rows = 10;
  const cw = W / cols;
  const ch = H / rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cw + cw / 2 + (rand() - 0.5) * 12;
      const y = row * ch + ch / 2 + (rand() - 0.5) * 8;
      const r = 22 + rand() * 18;
      const g = 25 + Math.floor(rand() * 35);
      svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="hsl(125, 45%, ${g}%)" stroke="#0d3320" stroke-width="0.8"/>`;
      svg += `<circle cx="${x - r * 0.3}" cy="${y - r * 0.2}" r="${r * 0.55}" fill="hsl(130, 50%, ${g + 8}%)" opacity="0.85"/>`;
    }
  }
  return svg;
}

function drawParkingLot(rand) {
  let svg = `<rect width="${W}" height="${H}" fill="#5a6268"/>`;
  const cols = 10;
  const rows = 7;
  const cw = W / cols;
  const ch = H / rows;
  const carColors = ['#c0392b', '#2980b9', '#f1c40f', '#ecf0f1', '#2c3e50', '#8e44ad'];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cw + 8 + rand() * 6;
      const y = row * ch + 10 + rand() * 6;
      const cw2 = cw - 16;
      const ch2 = ch - 18;
      svg += `<rect x="${x}" y="${y}" width="${cw2}" height="${ch2}" fill="#4a4f54" stroke="#fff" stroke-width="0.8" opacity="0.35"/>`;
      const carW = cw2 * 0.75;
      const carH = ch2 * 0.55;
      const cx = x + (cw2 - carW) / 2;
      const cy = y + (ch2 - carH) / 2;
      const cc = carColors[Math.floor(rand() * carColors.length)];
      svg += `<rect x="${cx}" y="${cy}" width="${carW}" height="${carH}" rx="3" fill="${cc}" stroke="#222" stroke-width="0.7"/>`;
      svg += `<rect x="${cx + carW * 0.15}" y="${cy + 3}" width="${carW * 0.35}" height="${carH * 0.35}" fill="#87ceeb" opacity="0.7"/>`;
    }
  }
  return svg;
}

function drawBookshelfWall(rand) {
  let svg = `<rect width="${W}" height="${H}" fill="#3d2914"/>`;
  const cols = 16;
  const rows = 11;
  const cw = W / cols;
  const ch = H / rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cw + 1;
      const y = row * ch + 1;
      const hue = Math.floor(rand() * 360);
      const light = 25 + rand() * 35;
      svg += `<rect x="${x}" y="${y}" width="${cw - 2}" height="${ch - 2}" fill="hsl(${hue}, 40%, ${light}%)" stroke="#1a1008" stroke-width="0.5"/>`;
      if (rand() > 0.4) {
        svg += `<line x1="${x + 2}" y1="${y + ch / 2}" x2="${x + cw - 4}" y2="${y + ch / 2}" stroke="rgba(0,0,0,0.25)" stroke-width="0.8"/>`;
      }
    }
  }
  return svg;
}

function drawSnowRoofs(rand) {
  return drawRooftopCity(rand, {
    roof: '#b8c9d9',
    wall: '#eef2f6',
    bg: '#a8c4e0',
    cols: 15,
    rows: 11,
  });
}

function drawNightCity(rand) {
  let base = drawRooftopCity(rand, {
    roof: '#5c4a42',
    wall: '#c8c4bc',
    bg: '#1a1f2e',
    cols: 14,
    rows: 10,
  });
  const windows = Array.from({ length: 120 }, () => {
    const x = rand() * W;
    const y = rand() * H;
    if (rand() > 0.55) {
      return `<rect x="${x}" y="${y}" width="5" height="7" fill="#ffe566" opacity="0.85"/>`;
    }
    return '';
  }).join('');
  return base + windows;
}

function pickCatSpot(rand, margin = 0.08) {
  return {
    cx: margin + rand() * (1 - margin * 2),
    cy: margin + rand() * (1 - margin * 2),
    size: 0.032 + rand() * 0.016,
  };
}

function catColorsForTheme(theme) {
  const map = {
    rooftop: ['#9a9590', '#7a7570'],
    market: ['#c9b8a8', '#a89888'],
    beach: ['#d4a574', '#b8956a'],
    forest: ['#6a7a62', '#4a5a42'],
    parking: ['#7a7e82', '#5a5e62'],
    books: ['#5c4030', '#3d2914'],
    snow: ['#a8b0b8', '#889098'],
    night: ['#6a6560', '#4a4540'],
  };
  const pair = map[theme] ?? map.rooftop;
  return { fill: pair[0], stroke: pair[1] };
}

const LEVEL_THEMES = [
  { name: 'Rooftop Maze', theme: 'rooftop', countdown: 10, draw: (r) => drawRooftopCity(r) },
  { name: 'Terracotta Town', theme: 'rooftop', countdown: 10, draw: (r) => drawRooftopCity(r, { roof: '#d4634a', wall: '#faf8f5' }) },
  { name: 'Old Quarter', theme: 'rooftop', countdown: 11, draw: (r) => drawRooftopCity(r, { roof: '#a84f38', cols: 15, rows: 11 }) },
  { name: 'Market Square', theme: 'market', countdown: 11, draw: drawMarketGrid },
  { name: 'Bazaar Rush', theme: 'market', countdown: 12, draw: drawMarketGrid },
  { name: 'Sunny Beach', theme: 'beach', countdown: 12, draw: drawBeachUmbrellas },
  { name: 'Coast Crowd', theme: 'beach', countdown: 12, draw: drawBeachUmbrellas },
  { name: 'Green Canopy', theme: 'forest', countdown: 13, draw: drawForestCanopy },
  { name: 'Deep Woods', theme: 'forest', countdown: 13, draw: drawForestCanopy },
  { name: 'Parking Grid', theme: 'parking', countdown: 13, draw: drawParkingLot },
  { name: 'Library Wall', theme: 'books', countdown: 14, draw: drawBookshelfWall },
  { name: 'Winter Roofs', theme: 'snow', countdown: 14, draw: drawSnowRoofs },
  { name: 'Night Lights', theme: 'night', countdown: 14, draw: drawNightCity },
  { name: 'Suburbia', theme: 'rooftop', countdown: 15, draw: (r) => drawRooftopCity(r, { roof: '#b85a42', wall: '#ece8e2', cols: 13, rows: 9 }) },
  { name: 'Harbor Homes', theme: 'rooftop', countdown: 15, draw: (r) => drawRooftopCity(r, { bg: '#d4e4ef', roof: '#c05038' }) },
  { name: 'Festival Stalls', theme: 'market', countdown: 15, draw: drawMarketGrid },
  { name: 'Resort Strip', theme: 'beach', countdown: 16, draw: drawBeachUmbrellas },
  { name: 'Jungle Pack', theme: 'forest', countdown: 16, draw: drawForestCanopy },
  { name: 'Midnight City', theme: 'night', countdown: 17, draw: drawNightCity },
  { name: 'Alpine Village', theme: 'snow', countdown: 17, draw: drawSnowRoofs },
  { name: 'Scholar Stacks', theme: 'books', countdown: 18, draw: drawBookshelfWall },
  { name: 'Master Rooftops', theme: 'rooftop', countdown: 20, draw: (r) => drawRooftopCity(r, { cols: 16, rows: 12, roof: '#bf5038' }) },
];

const LEVEL_DEFS = LEVEL_THEMES.map((def, i) => {
  const id = i + 1;
  const rand = mulberry32(id * 9973 + 42);
  const cat = pickCatSpot(rand, 0.1);
  cat.size = Math.max(0.02, cat.size - id * 0.00025);
  return {
    id,
    name: def.name,
    countdown: def.countdown,
    theme: def.theme,
    cat,
    draw: def.draw,
    rand,
  };
});

const levels = LEVEL_DEFS.map((def) => {
  const { fill, stroke } = catColorsForTheme(def.theme);
  const hit = catHit(def.cat.cx, def.cat.cy, def.cat.size);
  const scene = def.draw(def.rand);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${scene}
  ${peekCatSvg(def.cat.cx, def.cat.cy, def.cat.size, fill, stroke)}
</svg>`;
  const filename = `level-${String(def.id).padStart(2, '0')}.svg`;
  writeFileSync(join(outDir, filename), svg, 'utf8');
  return {
    id: def.id,
    name: def.name,
    image: `/levels/${filename}`,
    countdown: def.countdown,
    hitBox: hit,
  };
});

writeFileSync(
  join(__dirname, '../public/levels.json'),
  JSON.stringify({ levels }, null, 2),
  'utf8'
);

console.log(`Generated ${levels.length} level images and levels.json`);
