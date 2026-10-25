import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/levels');
mkdirSync(outDir, { recursive: true });

/** Normalized hit box for the cat (0–1 relative to viewBox). */
function catHit(cx, cy, size) {
  const w = size;
  const h = size * 0.85;
  return {
    x: cx - w / 2,
    y: cy - h / 2,
    w,
    h,
  };
}

function catSvg(cx, cy, size, fill, stroke = 'none') {
  const s = size * 100;
  const x = cx * 1000 - s / 2;
  const y = cy * 1000 - s * 0.42;
  return `
    <g class="hidden-cat" data-cat="1" transform="translate(${x},${y}) scale(${s / 100})">
      <ellipse cx="50" cy="58" rx="38" ry="32" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <circle cx="50" cy="28" r="26" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <polygon points="22,12 28,-8 38,14" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
      <polygon points="78,12 72,-8 62,14" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
      <circle cx="40" cy="26" r="4" fill="#1a1a2e"/>
      <circle cx="60" cy="26" r="4" fill="#1a1a2e"/>
      <path d="M 44 34 Q 50 38 56 34" fill="none" stroke="#1a1a2e" stroke-width="2"/>
      <path d="M 35 50 Q 50 55 65 50" fill="none" stroke="${stroke === 'none' ? 'rgba(0,0,0,0.15)' : stroke}" stroke-width="1"/>
    </g>`;
}

const LEVEL_DEFS = [
  {
    id: 1,
    name: 'Sunny Park',
    countdown: 45,
    bg: '#87CEEB',
    draw: (c) => `
      <rect width="1000" height="700" fill="#87CEEB"/>
      <ellipse cx="500" cy="620" rx="520" ry="90" fill="#5a9e4a"/>
      <rect x="80" y="200" width="40" height="280" fill="#6b4423"/>
      <ellipse cx="100" cy="180" rx="90" ry="100" fill="#2d6a2d"/>
      <rect x="750" y="220" width="35" height="250" fill="#5c3d1e"/>
      <ellipse cx="768" cy="200" rx="75" ry="85" fill="#3d8b3d"/>
      <circle cx="850" cy="80" r="55" fill="#FFE566"/>
      ${catSvg(c.cx, c.cy, c.size, '#f4a460', '#c97b3a')}
      <rect x="300" y="480" width="120" height="15" fill="#8B7355" rx="4"/>
      <text x="320" y="520" font-family="sans-serif" font-size="14" fill="#555">bench</text>
    `,
    cat: { cx: 0.62, cy: 0.72, size: 0.14 },
  },
  {
    id: 2,
    name: 'Cozy Kitchen',
    countdown: 42,
    draw: (c) => `
      <rect width="1000" height="700" fill="#f5e6d3"/>
      <rect x="0" y="0" width="1000" height="120" fill="#8b6914"/>
      <rect x="50" y="150" width="900" height="400" fill="#d4c4a8"/>
      <rect x="100" y="200" width="200" height="180" fill="#c0c0c0" stroke="#888"/>
      <circle cx="200" cy="290" r="40" fill="#e8e8e8"/>
      <rect x="400" y="250" width="80" height="100" fill="#ff6b6b"/>
      <rect x="500" y="250" width="60" height="80" fill="#4ecdc4"/>
      <rect x="600" y="280" width="300" height="20" fill="#654321"/>
      ${catSvg(c.cx, c.cy, c.size, '#c9a66b', '#8b7355')}
      <rect x="0" y="550" width="1000" height="150" fill="#6b5344"/>
    `,
    cat: { cx: 0.78, cy: 0.58, size: 0.12 },
  },
  {
    id: 3,
    name: 'Bookshelf Nook',
    countdown: 40,
    draw: (c) => `
      <rect width="1000" height="700" fill="#2c2416"/>
      ${Array.from({ length: 8 }, (_, i) => {
        const colors = ['#8B0000', '#006400', '#00008B', '#8B4513', '#2F4F4F', '#800080', '#D2691E', '#191970'];
        return `<rect x="${40 + i * 115}" y="80" width="95" height="520" fill="${colors[i]}" opacity="0.9"/>
          <rect x="${45 + i * 115}" y="100" width="20" height="480" fill="${colors[(i + 2) % 8]}"/>
          <rect x="${70 + i * 115}" y="120" width="25" height="460" fill="${colors[(i + 4) % 8]}"/>
          <rect x="${100 + i * 115}" y="90" width="18" height="500" fill="${colors[(i + 1) % 8]}"/>`;
      }).join('')}
      ${catSvg(c.cx, c.cy, c.size, '#4a3728', '#3d2e1f')}
      <rect x="0" y="600" width="1000" height="100" fill="#1a1408"/>
    `,
    cat: { cx: 0.35, cy: 0.55, size: 0.1 },
  },
  {
    id: 4,
    name: 'Beach Day',
    countdown: 40,
    draw: (c) => `
      <rect width="1000" height="700" fill="#4da6ff"/>
      <rect x="0" y="380" width="1000" height="320" fill="#f4d03f"/>
      <ellipse cx="200" cy="420" rx="30" ry="8" fill="#e8c547"/>
      <path d="M 0 380 Q 250 360 500 385 T 1000 375 L 1000 700 L 0 700 Z" fill="#5dade2"/>
      <circle cx="900" cy="100" r="50" fill="#FFE066"/>
      ${catSvg(c.cx, c.cy, c.size, '#e8d4a8', '#c4a574')}
      <ellipse cx="150" cy="500" rx="25" ry="12" fill="#ff7f50" opacity="0.8"/>
      <ellipse cx="700" cy="450" rx="40" ry="15" fill="#ff6b6b" opacity="0.7"/>
    `,
    cat: { cx: 0.48, cy: 0.62, size: 0.11 },
  },
  {
    id: 5,
    name: 'City Rooftop',
    countdown: 38,
    draw: (c) => `
      <rect width="1000" height="700" fill="#1a1a2e"/>
      <rect x="0" y="400" width="200" height="300" fill="#16213e"/>
      <rect x="220" y="320" width="180" height="380" fill="#0f3460"/>
      <rect x="420" y="450" width="250" height="250" fill="#533483"/>
      <rect x="700" y="280" width="150" height="420" fill="#e94560"/>
      <rect x="880" y="380" width="120" height="320" fill="#1a1a2e"/>
      ${Array.from({ length: 30 }, (_, i) =>
        `<rect x="${(i * 37) % 980}" y="${200 + (i * 23) % 180}" width="8" height="12" fill="#FFE566" opacity="${0.3 + (i % 5) * 0.15}"/>`
      ).join('')}
      ${catSvg(c.cx, c.cy, c.size, '#2d2d44', '#1f1f33')}
      <rect x="0" y="620" width="1000" height="80" fill="#333"/>
    `,
    cat: { cx: 0.55, cy: 0.68, size: 0.09 },
  },
  {
    id: 6,
    name: 'Flower Garden',
    countdown: 38,
    draw: (c) => `
      <rect width="1000" height="700" fill="#a8e6cf"/>
      <ellipse cx="500" cy="650" rx="500" ry="60" fill="#56ab2f"/>
      ${Array.from({ length: 25 }, (_, i) => {
        const x = 50 + (i * 41) % 900;
        const y = 350 + (i * 17) % 280;
        const col = ['#ff6b9d', '#c44569', '#f8b500', '#e55039', '#6a89cc'][i % 5];
        return `<circle cx="${x}" cy="${y}" r="18" fill="${col}"/><rect x="${x - 2}" y="${y}" width="4" height="40" fill="#2d5016"/>`;
      }).join('')}
      ${catSvg(c.cx, c.cy, c.size, '#7cb342', '#558b2f')}
      <rect x="100" y="100" width="800" height="30" fill="#8d6e63" opacity="0.5"/>
    `,
    cat: { cx: 0.72, cy: 0.75, size: 0.085 },
  },
  {
    id: 7,
    name: 'Office Desk',
    countdown: 36,
    draw: (c) => `
      <rect width="1000" height="700" fill="#eceff1"/>
      <rect x="0" y="450" width="1000" height="250" fill="#795548"/>
      <rect x="150" y="200" width="400" height="280" fill="#263238" rx="8"/>
      <rect x="170" y="220" width="360" height="200" fill="#37474f"/>
      <rect x="600" y="380" width="120" height="80" fill="#fff" stroke="#ccc"/>
      <rect x="750" y="350" width="180" height="120" fill="#ffecb3"/>
      ${catSvg(c.cx, c.cy, c.size, '#bdbdbd', '#9e9e9e')}
      <circle cx="850" cy="150" r="60" fill="#fff9c4" opacity="0.6"/>
      <rect x="50" y="480" width="80" height="100" fill="#5d4037"/>
    `,
    cat: { cx: 0.42, cy: 0.82, size: 0.08 },
  },
  {
    id: 8,
    name: 'Snowy Yard',
    countdown: 36,
    draw: (c) => `
      <rect width="1000" height="700" fill="#b3d9f2"/>
      <rect x="0" y="350" width="1000" height="350" fill="#fff"/>
      <ellipse cx="150" cy="200" rx="60" ry="80" fill="#fff" opacity="0.9"/>
      <ellipse cx="850" cy="180" rx="50" ry="70" fill="#fff"/>
      <rect x="400" y="250" width="200" height="150" fill="#8d6e63"/>
      <polygon points="400,250 500,150 600,250" fill="#5d4037"/>
      ${catSvg(c.cx, c.cy, c.size, '#e8e8e8', '#d0d0d0')}
      ${Array.from({ length: 40 }, (_, i) =>
        `<circle cx="${(i * 27) % 1000}" cy="${100 + (i * 19) % 250}" r="3" fill="#fff"/>`
      ).join('')}
    `,
    cat: { cx: 0.58, cy: 0.48, size: 0.075 },
  },
  {
    id: 9,
    name: 'Supermarket Aisle',
    countdown: 34,
    draw: (c) => `
      <rect width="1000" height="700" fill="#f5f5f5"/>
      ${Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 10 }, (_, col) => {
          const hues = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
          return `<rect x="${80 + col * 88}" y="${80 + row * 95}" width="70" height="75" fill="${hues[(row + col) % 6]}" rx="4"/>`;
        }).join('')
      ).join('')}
      ${catSvg(c.cx, c.cy, c.size, '#f39c12', '#d68910')}
      <rect x="0" y="650" width="1000" height="50" fill="#bdc3c7"/>
    `,
    cat: { cx: 0.28, cy: 0.42, size: 0.07 },
  },
  {
    id: 10,
    name: 'Attic Clutter',
    countdown: 34,
    draw: (c) => `
      <rect width="1000" height="700" fill="#3e2723"/>
      <polygon points="0,0 500,80 1000,0 1000,700 0,700" fill="#4e342e"/>
      <rect x="100" y="400" width="150" height="120" fill="#6d4c41"/>
      <rect x="300" y="450" width="200" height="80" fill="#5d4037"/>
      <ellipse cx="700" cy="500" rx="80" ry="50" fill="#8d6e63"/>
      <rect x="750" y="300" width="100" height="180" fill="#795548"/>
      ${catSvg(c.cx, c.cy, c.size, '#5d4037', '#4e342e')}
      <line x1="0" y1="80" x2="1000" y2="0" stroke="#3e2723" stroke-width="4"/>
    `,
    cat: { cx: 0.65, cy: 0.52, size: 0.065 },
  },
  {
    id: 11,
    name: 'Aquarium Lobby',
    countdown: 32,
    draw: (c) => `
      <rect width="1000" height="700" fill="#0d1b2a"/>
      <rect x="100" y="80" width="800" height="450" fill="#1b263b" stroke="#415a77" stroke-width="8"/>
      ${Array.from({ length: 15 }, (_, i) => {
        const x = 150 + (i * 53) % 700;
        const y = 150 + (i * 31) % 350;
        return `<ellipse cx="${x}" cy="${y}" rx="${12 + i % 8}" ry="${6 + i % 5}" fill="${['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'][i % 4]}" opacity="0.85"/>`;
      }).join('')}
      <path d="M 120 500 Q 300 480 500 510 T 880 490" fill="none" stroke="#778da9" stroke-width="3"/>
      ${catSvg(c.cx, c.cy, c.size, '#1b263b', '#0d1b2a')}
      <rect x="0" y="550" width="1000" height="150" fill="#415a77"/>
    `,
    cat: { cx: 0.38, cy: 0.35, size: 0.06 },
  },
  {
    id: 12,
    name: 'Farm Barn',
    countdown: 32,
    draw: (c) => `
      <rect width="1000" height="700" fill="#87CEEB"/>
      <rect x="0" y="500" width="1000" height="200" fill="#8B4513"/>
      <rect x="250" y="200" width="500" height="350" fill="#A0522D"/>
      <polygon points="250,200 500,80 750,200" fill="#8B0000"/>
      <rect x="420" y="350" width="160" height="200" fill="#3e2723"/>
      <rect x="50" y="520" width="120" height="100" fill="#DEB887"/>
      ${catSvg(c.cx, c.cy, c.size, '#A0522D', '#8B4513')}
      <ellipse cx="900" cy="550" rx="40" ry="25" fill="#fff"/>
    `,
    cat: { cx: 0.52, cy: 0.78, size: 0.058 },
  },
  {
    id: 13,
    name: 'Night Market',
    countdown: 30,
    draw: (c) => `
      <rect width="1000" height="700" fill="#1a0a2e"/>
      ${Array.from({ length: 8 }, (_, i) =>
        `<rect x="${50 + i * 120}" y="200" width="100" height="350" fill="#2d1b4e"/>
         <ellipse cx="${100 + i * 120}" cy="180" rx="55" ry="25" fill="${['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'][i % 4]}"/>`
      ).join('')}
      ${Array.from({ length: 50 }, (_, i) =>
        `<circle cx="${(i * 23) % 1000}" cy="${50 + (i * 17) % 150}" r="2" fill="#fff" opacity="0.8"/>`
      ).join('')}
      ${catSvg(c.cx, c.cy, c.size, '#2d1b4e', '#1a0a2e')}
      <rect x="0" y="580" width="1000" height="120" fill="#0f0618"/>
    `,
    cat: { cx: 0.82, cy: 0.45, size: 0.055 },
  },
  {
    id: 14,
    name: 'Hospital Waiting',
    countdown: 30,
    draw: (c) => `
      <rect width="1000" height="700" fill="#e8f4f8"/>
      <rect x="0" y="0" width="1000" height="80" fill="#0288d1"/>
      ${Array.from({ length: 5 }, (_, i) =>
        `<rect x="${80 + i * 180}" y="150" width="140" height="50" fill="#b3e5fc" stroke="#0288d1"/>
         <rect x="${100 + i * 180}" y="400" width="100" height="120" fill="#4fc3f7" rx="8"/>`
      ).join('')}
      <rect x="0" y="600" width="1000" height="100" fill="#cfd8dc"/>
      ${catSvg(c.cx, c.cy, c.size, '#b3e5fc', '#81d4fa')}
      <circle cx="500" cy="40" r="20" fill="#fff"/>
    `,
    cat: { cx: 0.22, cy: 0.68, size: 0.052 },
  },
  {
    id: 15,
    name: 'Jungle Trail',
    countdown: 28,
    draw: (c) => `
      <rect width="1000" height="700" fill="#1b4332"/>
      ${Array.from({ length: 20 }, (_, i) => {
        const x = (i * 53) % 1000;
        return `<ellipse cx="${x}" cy="${100 + (i * 40) % 500}" rx="60" ry="40" fill="${['#2d6a4f', '#40916c', '#52b788', '#1b4332'][i % 4]}"/>`;
      }).join('')}
      <path d="M 0 600 Q 200 550 400 620 T 800 580 L 1000 650 L 1000 700 L 0 700 Z" fill="#5c4033"/>
      ${catSvg(c.cx, c.cy, c.size, '#2d6a4f', '#1b4332')}
      <circle cx="200" cy="80" r="8" fill="#ffd93d" opacity="0.5"/>
    `,
    cat: { cx: 0.45, cy: 0.38, size: 0.048 },
  },
  {
    id: 16,
    name: 'Art Studio',
    countdown: 28,
    draw: (c) => `
      <rect width="1000" height="700" fill="#faf3e0"/>
      <rect x="80" y="100" width="350" height="450" fill="#fff" stroke="#333" stroke-width="4"/>
      <rect x="120" y="140" width="270" height="200" fill="#e74c3c" opacity="0.7"/>
      <rect x="120" y="350" width="130" height="150" fill="#3498db" opacity="0.7"/>
      <rect x="260" y="350" width="130" height="150" fill="#f1c40f" opacity="0.7"/>
      <ellipse cx="750" cy="400" rx="100" ry="80" fill="#bdc3c7"/>
      ${catSvg(c.cx, c.cy, c.size, '#e8d5b7', '#d4c4a0')}
      ${Array.from({ length: 12 }, (_, i) =>
        `<circle cx="${600 + (i % 4) * 35}" cy="${150 + Math.floor(i / 4) * 40}" r="15" fill="${['#e74c3c', '#3498db', '#2ecc71', '#9b59b6'][i % 4]}"/>`
      ).join('')}
    `,
    cat: { cx: 0.68, cy: 0.55, size: 0.045 },
  },
  {
    id: 17,
    name: 'Train Station',
    countdown: 26,
    draw: (c) => `
      <rect width="1000" height="700" fill="#dfe6e9"/>
      <rect x="0" y="0" width="1000" height="150" fill="#636e72"/>
      ${Array.from({ length: 6 }, (_, i) =>
        `<rect x="${50 + i * 30}" y="0" width="20" height="150" fill="#b2bec3"/>`
      ).join('')}
      <rect x="100" y="400" width="800" height="120" fill="#2d3436"/>
      <rect x="150" y="250" width="700" height="180" fill="#0984e3" rx="10"/>
      <rect x="200" y="280" width="80" height="60" fill="#74b9ff"/>
      <rect x="320" y="280" width="80" height="60" fill="#74b9ff"/>
      ${catSvg(c.cx, c.cy, c.size, '#636e72', '#2d3436')}
      <text x="450" y="200" font-size="48" fill="#2d3436" font-family="sans-serif">PLATFORM 3</text>
    `,
    cat: { cx: 0.88, cy: 0.32, size: 0.042 },
  },
  {
    id: 18,
    name: 'Candy Shop',
    countdown: 26,
    draw: (c) => `
      <rect width="1000" height="700" fill="#ffeaa7"/>
      ${Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 12 }, (_, col) => {
          const colors = ['#ff7675', '#fd79a8', '#fdcb6e', '#e17055', '#a29bfe', '#55efc4'];
          return `<circle cx="${60 + col * 78}" cy="${100 + row * 70}" r="22" fill="${colors[(row + col) % 6]}" stroke="#fff" stroke-width="3"/>`;
        }).join('')
      ).join('')}
      <rect x="0" y="580" width="1000" height="120" fill="#fab1a0"/>
      ${catSvg(c.cx, c.cy, c.size, '#fdcb6e', '#f39c12')}
    `,
    cat: { cx: 0.15, cy: 0.55, size: 0.04 },
  },
  {
    id: 19,
    name: 'Space Station',
    countdown: 24,
    draw: (c) => `
      <rect width="1000" height="700" fill="#0c0c1d"/>
      ${Array.from({ length: 80 }, (_, i) =>
        `<circle cx="${(i * 127) % 1000}" cy="${(i * 89) % 700}" r="${1 + i % 3}" fill="#fff" opacity="${0.3 + (i % 7) * 0.1}"/>`
      ).join('')}
      <ellipse cx="500" cy="350" rx="400" ry="200" fill="none" stroke="#4a4a6a" stroke-width="2"/>
      <rect x="200" y="300" width="600" height="100" fill="#2d2d5a"/>
      <rect x="250" y="320" width="80" height="60" fill="#00cec9" opacity="0.5"/>
      <rect x="400" y="320" width="200" height="60" fill="#6c5ce7" opacity="0.4"/>
      ${catSvg(c.cx, c.cy, c.size, '#2d2d5a', '#1a1a3a')}
      <circle cx="800" cy="150" r="40" fill="#dfe6e9" opacity="0.3"/>
    `,
    cat: { cx: 0.5, cy: 0.5, size: 0.038 },
  },
  {
    id: 20,
    name: 'Zen Rock Garden',
    countdown: 24,
    draw: (c) => `
      <rect width="1000" height="700" fill="#e8e0d5"/>
      ${Array.from({ length: 30 }, (_, i) => {
        const x1 = (i * 97) % 1000;
        const y1 = 200 + (i * 23) % 400;
        return `<path d="M ${x1} ${y1} Q ${x1 + 30} ${y1 - 10} ${x1 + 60} ${y1}" fill="none" stroke="#c4b8a8" stroke-width="2"/>`;
      }).join('')}
      <ellipse cx="300" cy="450" rx="90" ry="50" fill="#7f8c8d"/>
      <ellipse cx="650" cy="380" rx="70" ry="45" fill="#636e72"/>
      <ellipse cx="500" cy="520" rx="110" ry="60" fill="#95a5a6"/>
      ${catSvg(c.cx, c.cy, c.size, '#b2bec3', '#95a5a6')}
    `,
    cat: { cx: 0.62, cy: 0.58, size: 0.036 },
  },
  {
    id: 21,
    name: 'Haunted Hallway',
    countdown: 22,
    draw: (c) => `
      <rect width="1000" height="700" fill="#1a1a1a"/>
      <rect x="350" y="0" width="300" height="700" fill="#2d2d2d"/>
      ${Array.from({ length: 5 }, (_, i) =>
        `<rect x="${380}" y="${120 + i * 130}" width="80" height="100" fill="#3d3d3d"/>
         <ellipse cx="${420}" cy="${170 + i * 130}" rx="25" ry="35" fill="#4a3728" opacity="0.6"/>`
      ).join('')}
      <ellipse cx="500" cy="650" rx="200" ry="30" fill="#0d0d0d"/>
      ${catSvg(c.cx, c.cy, c.size, '#2d2d2d', '#1a1a1a')}
      <circle cx="500" cy="100" r="15" fill="#8b0000" opacity="0.4"/>
    `,
    cat: { cx: 0.41, cy: 0.72, size: 0.034 },
  },
  {
    id: 22,
    name: 'Master Challenge',
    countdown: 20,
    draw: (c) => `
      <rect width="1000" height="700" fill="#2c3e50"/>
      ${Array.from({ length: 100 }, (_, i) => {
        const x = (i * 37) % 1000;
        const y = (i * 23) % 700;
        const col = `hsl(${(i * 17) % 360}, 25%, ${25 + (i % 20)}%)`;
        return `<rect x="${x}" y="${y}" width="${8 + i % 12}" height="${8 + i % 10}" fill="${col}" opacity="0.7"/>`;
      }).join('')}
      ${catSvg(c.cx, c.cy, c.size, '#34495e', '#2c3e50')}
      <text x="400" y="50" font-size="28" fill="#ecf0f1" font-family="sans-serif" opacity="0.5">Where kitty?</text>
    `,
    cat: { cx: 0.73, cy: 0.28, size: 0.03 },
  },
];

const levels = LEVEL_DEFS.map((def) => {
  const hit = catHit(def.cat.cx, def.cat.cy, def.cat.size);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  ${def.draw(def.cat)}
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
