import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
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

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

/** Normalized hit box centered on the cat; wider than the sprite for touch screens. */
function catHit(cx, cy, visualSize) {
  const w = Math.max(visualSize * 2.25, 0.072);
  const h = Math.max(visualSize * 2.0, 0.064);
  return {
    x: clamp01(cx - w / 2),
    y: clamp01(cy - h / 2),
    w: Math.min(w, 1),
    h: Math.min(h, 1),
  };
}

/** Tiny grey cat head peeking over a wall (reference style). */
function peekCatSvg(cx, cy, size, fill = '#c5c2bc', stroke = '#2a2a2a') {
  const localCenterX = 50;
  const localCenterY = 38;
  const x = cx * W - localCenterX * size;
  const y = cy * H - localCenterY * size;
  return `
    <g class="hidden-cat" data-cat="1" transform="translate(${x},${y}) scale(${size})">
      <path d="M 18 42 L 28 8 L 38 38 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.1"/>
      <path d="M 62 42 L 72 8 L 82 38 Z" fill="${fill}" stroke="${stroke}" stroke-width="1.1"/>
      <ellipse cx="50" cy="44" rx="34" ry="28" fill="${fill}" stroke="${stroke}" stroke-width="1.1"/>
      <circle cx="38" cy="40" r="3.2" fill="#1a1a1a"/>
      <circle cx="62" cy="40" r="3.2" fill="#1a1a1a"/>
      <path d="M 42 50 Q 50 54 58 50" fill="none" stroke="#4a4a4a" stroke-width="1.3"/>
    </g>`;
}

function svgDefsForRoof(roof) {
  return `
  <defs>
    <pattern id="roofTiles" width="5" height="8" patternUnits="userSpaceOnUse">
      <rect width="5" height="8" fill="${roof}"/>
      <line x1="2.5" y1="0" x2="2.5" y2="8" stroke="#1e1e1e" stroke-width="0.65" opacity="0.45"/>
    </pattern>
  </defs>`;
}

/** One packed gable cottage unit (matches sample line-art rooftops). */
function gableHouse(x, y, uw, uh, roof, wall, stroke, rand) {
  const peakX = x + uw / 2;
  const peakY = y;
  const baseY = y + uh;
  const midY = y + uh * 0.38;
  let s = '';
  const rf = 'url(#roofTiles)';
  s += `<polygon points="${x},${baseY} ${peakX},${peakY} ${peakX},${baseY}" fill="${rf}" stroke="${stroke}" stroke-width="0.75"/>`;
  s += `<polygon points="${peakX},${peakY} ${x + uw},${baseY} ${peakX},${baseY}" fill="${rf}" stroke="${stroke}" stroke-width="0.75"/>`;
  const wl = peakX - uw * 0.14;
  const wr = peakX + uw * 0.14;
  s += `<polygon points="${x + uw * 0.12},${baseY} ${x + uw * 0.88},${baseY} ${wr},${midY} ${wl},${midY}" fill="${wall}" stroke="${stroke}" stroke-width="0.7"/>`;
  if (rand() > 0.55) {
    const wx = x + uw * (0.35 + rand() * 0.25);
    const wy = midY + (baseY - midY) * (0.25 + rand() * 0.35);
    const ww = uw * 0.14;
    const wh = (baseY - midY) * 0.22;
    s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#e8e6e0" stroke="${stroke}" stroke-width="0.45"/>`;
  }
  if (rand() > 0.72) {
    s += `<circle cx="${peakX}" cy="${midY + (baseY - midY) * 0.15}" r="${uw * 0.055}" fill="${wall}" stroke="${stroke}" stroke-width="0.45"/>`;
  }
  return s;
}

/**
 * Dense isometric-style packed rooftop field — same genre as the sample illustration.
 */
function drawPackedRooftops(rand, opts = {}) {
  const roof = opts.roof ?? '#c85a42';
  const wall = opts.wall ?? '#f3f1ec';
  const stroke = opts.stroke ?? '#1e1e1e';
  const bg = opts.bg ?? '#f3f1ec';
  const uw = opts.uw ?? 30;
  const uh = opts.uh ?? 24;
  const cols = opts.cols ?? 30;
  const rows = opts.rows ?? 28;
  const xShift = opts.xShift ?? 0;
  const yShift = opts.yShift ?? 0;
  const tint = opts.tint ?? null;

  let svg = `${svgDefsForRoof(roof)}<rect width="${W}" height="${H}" fill="${bg}"/>`;
  if (tint) {
    svg += `<rect width="${W}" height="${H}" fill="${tint}" opacity="${opts.tintOpacity ?? 0.22}"/>`;
  }

  const startX = -uw + xShift;
  const startY = -uh + yShift;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const stagger = (row % 2) * (uw * 0.5);
      const x = startX + col * uw * 0.96 + stagger;
      const y = startY + row * uh * 0.78;
      if (x > W + uw || y > H + uh) continue;
      const jitter = (rand() - 0.5) * 2;
      svg += gableHouse(x + jitter, y + jitter * 0.5, uw, uh, roof, wall, stroke, rand);
    }
  }

  if (opts.litWindows) {
    for (let i = 0; i < 90; i++) {
      const x = rand() * W;
      const y = rand() * H;
      if (rand() > 0.6) {
        svg += `<rect x="${x}" y="${y}" width="4" height="5" fill="#ffe9a8" opacity="0.75"/>`;
      }
    }
  }

  return svg;
}

function pickCatSpot(rand, margin = 0.1) {
  return {
    cx: margin + rand() * (1 - margin * 2),
    cy: margin + rand() * (1 - margin * 2),
    size: 0.028 + rand() * 0.014,
  };
}

const LEVEL_VARIANTS = [
  { name: 'Sample Rooftops', countdown: 10, sample: true },
  { name: 'Terracotta Sea', countdown: 10, roof: '#c85a42', uw: 30, uh: 24 },
  { name: 'Old Town Tiles', countdown: 10, roof: '#b5523c', wall: '#f7f5f0', uw: 28, uh: 23, xShift: 4 },
  { name: 'Clay Roof Grid', countdown: 11, roof: '#cf6348', uw: 31, uh: 25, yShift: 6 },
  { name: 'Mediterranean Pack', countdown: 11, roof: '#c45f45', wall: '#efece6', cols: 32, rows: 30 },
  { name: 'Coral Rooftops', countdown: 11, roof: '#d0684f', uw: 29, uh: 22 },
  { name: 'Sunset Clay', countdown: 12, roof: '#c2543f', tint: '#ffb88a', tintOpacity: 0.12 },
  { name: 'Warm Gables', countdown: 12, roof: '#ba4e38', wall: '#faf8f4', xShift: -8 },
  { name: 'Packed Quarter', countdown: 12, roof: '#c85a42', uw: 27, uh: 22, cols: 34, rows: 32 },
  { name: 'Tile Maze', countdown: 13, roof: '#b84832', uw: 30, uh: 24, yShift: 10 },
  { name: 'Ridge Lines', countdown: 13, roof: '#cc5e44', wall: '#f0eee8' },
  { name: 'Dusk Roofs', countdown: 13, roof: '#a84a38', tint: '#6a7a9a', tintOpacity: 0.18, litWindows: true },
  { name: 'Evening Tiles', countdown: 14, roof: '#9e4535', tint: '#4a5568', tintOpacity: 0.25, litWindows: true },
  { name: 'Night Rooftops', countdown: 14, roof: '#8a3f32', bg: '#2a2f3a', wall: '#d8d4cc', tint: '#0f1420', tintOpacity: 0.35, litWindows: true },
  { name: 'Foggy Morning', countdown: 14, roof: '#b85a48', wall: '#e8e6e2', tint: '#dfe8f0', tintOpacity: 0.28 },
  { name: 'Harvest Hues', countdown: 15, roof: '#c06040', wall: '#f5f0e8' },
  { name: 'Copper Tiles', countdown: 15, roof: '#a65a40', uw: 32, uh: 26 },
  { name: 'Dense Alley', countdown: 15, roof: '#c4543c', cols: 34, rows: 32, uw: 26, uh: 21 },
  { name: 'Twilight Pack', countdown: 16, roof: '#9a4a38', tint: '#5c4a6a', tintOpacity: 0.2, litWindows: true },
  { name: 'Crimson Ridge', countdown: 16, roof: '#b84232', wall: '#f2efe9' },
  { name: 'Hidden Peak', countdown: 17, roof: '#c85a42', uw: 29, uh: 23, xShift: 12 },
  { name: 'Master Rooftops', countdown: 18, roof: '#b04a36', cols: 36, rows: 34, uw: 26, uh: 21 },
];

const sampleSrc = join(__dirname, '../public/levels/level-01.jpg');
const sampleArtifact = join(__dirname, '../public/levels/level-01.jpg');
if (!existsSync(sampleSrc)) {
  const fromArtifact = '/opt/cursor/artifacts/assets/level-01-sample.jpg';
  if (existsSync(fromArtifact)) {
    copyFileSync(fromArtifact, sampleSrc);
  }
}

/** Level 1 — bundled sample illustration (upper-right peeping cat). */
const LEVEL_1_HIT = {
  x: 0.76,
  y: 0.24,
  w: 0.11,
  h: 0.1,
};

const proceduralLevels = LEVEL_VARIANTS.filter((v) => !v.sample).map((def, idx) => {
  const id = idx + 2;
  const rand = mulberry32(id * 7919 + 101);
  const cat = pickCatSpot(rand, 0.11);
  cat.size = Math.max(0.022, cat.size - id * 0.0002);
  return { id, ...def, cat, rand };
});

const levels = [];

levels.push({
  id: 1,
  name: 'Sample Rooftops',
  image: '/levels/level-01.jpg',
  countdown: 10,
  hitBox: LEVEL_1_HIT,
});

for (const def of proceduralLevels) {
  const hit = catHit(def.cat.cx, def.cat.cy, def.cat.size);
  const scene = drawPackedRooftops(def.rand, {
    roof: def.roof,
    wall: def.wall,
    bg: def.bg,
    uw: def.uw,
    uh: def.uh,
    cols: def.cols,
    rows: def.rows,
    xShift: def.xShift,
    yShift: def.yShift,
    tint: def.tint,
    tintOpacity: def.tintOpacity,
    litWindows: def.litWindows,
  });
  const catFill = def.wall ?? '#c5c2bc';
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${scene}
  ${peekCatSvg(def.cat.cx, def.cat.cy, def.cat.size, catFill, '#2a2a2a')}
</svg>`;
  const filename = `level-${String(def.id).padStart(2, '0')}.svg`;
  writeFileSync(join(outDir, filename), svg, 'utf8');
  levels.push({
    id: def.id,
    name: def.name,
    image: `/levels/${filename}`,
    countdown: def.countdown,
    hitBox: hit,
  });
}

writeFileSync(join(__dirname, '../public/levels.json'), JSON.stringify({ levels }, null, 2), 'utf8');

console.log(`Generated ${levels.length} levels (level 1 sample JPG + ${proceduralLevels.length} rooftop SVGs)`);
