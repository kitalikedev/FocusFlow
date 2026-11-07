import { parseColor, relativeLuminance } from '@/core/theme/color';
import type { CatalogWallpaper } from './catalog';

/**
 * Pixel and cyberpunk wallpapers, drawn from code as tiny SVG scenes on a 96 × 54 grid (16:9). Each SVG is a few
 * KB, scales without blur (`crispEdges`) and needs no image file or licence. The scenes are seeded, so a given
 * wallpaper looks the same on every visit.
 */

const WIDTH = 96;
const HEIGHT = 54;

/** Small seeded random generator (mulberry32) so scenes are reproducible. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One pixel-grid rectangle: coordinates snap to whole pixels so the art stays crisp. */
const rect = (x: number, y: number, w: number, h: number, fill: string, opacity?: number): string =>
  `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.max(1, Math.round(w))}" height="${Math.max(1, Math.round(h))}" fill="${fill}"${opacity === undefined ? '' : ` fill-opacity="${opacity}"`}/>`;

/** Average relative luminance of the main colors of a scene, precomputed instead of measured (FR-15). */
function paletteLuminance(colors: string[]): number {
  const values = colors.map((color) => parseColor(color)).filter((color) => color !== null);
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, color) => sum + relativeLuminance(color), 0) / values.length) * 1000) / 1000;
}

/** Horizontal color bands stacked from the top down to `bottom`. */
function bands(colors: string[], bottom: number): string {
  const height = bottom / colors.length;
  return colors.map((color, index) => rect(0, Math.floor(index * height), WIDTH, Math.ceil(height) + 1, color)).join('');
}

/** Filled half disc (the upper half) or full disc made of one-pixel rows. */
function disc(cx: number, cy: number, radius: number, color: (row: number) => string, from = -radius, to = radius, skip?: (row: number) => boolean): string {
  let out = '';
  for (let dy = from; dy <= to; dy += 1) {
    if (skip?.(dy)) continue;
    const half = Math.floor(Math.sqrt(radius * radius - dy * dy));
    out += rect(cx - half, cy + dy, half * 2 + 1, 1, color(dy));
  }
  return out;
}

/** Skyline or hills: one-pixel-wide columns from a smooth height function. */
function ridge(baseY: number, color: string, height: (x: number) => number): string {
  let out = '';
  for (let x = 0; x < WIDTH; x += 1) {
    const h = Math.max(1, Math.round(height(x)));
    out += rect(x, baseY - h, 1, h + 1, color);
  }
  return out;
}

/** Pixel pine tree: stacked rows that widen toward the bottom, plus a trunk. */
function pine(cx: number, baseY: number, height: number, color: string): string {
  let out = rect(cx, baseY - 1, 1, 2, color);
  for (let row = 0; row < height; row += 1) {
    const half = Math.floor(row / 2);
    out += rect(cx - half, baseY - height + row - 1, half * 2 + 1, 1, color);
  }
  return out;
}

function stars(random: () => number, count: number, maxY: number, colors: string[]): string {
  let out = '';
  for (let i = 0; i < count; i += 1) {
    out += rect(Math.floor(random() * WIDTH), Math.floor(random() * maxY), 1, 1, colors[Math.floor(random() * colors.length)]);
  }
  return out;
}

function svg(body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">${body}</svg>`;
}

export function toDataUri(markup: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;
}

// ------------------------------------------------------------------------------------------------- pixel

export function pixelNight(): string {
  const random = createRandom(11);
  let body = bands(['#070b24', '#0b1233', '#111a45', '#1a2358', '#262d6b'], 38);
  body += stars(random, 46, 30, ['#ffffff', '#ffffff', '#ffe9a8', '#9fb4ff']);
  body += disc(74, 12, 6, () => '#fdf3c4');
  body += rect(72, 9, 2, 2, '#e3d79a') + rect(76, 13, 2, 1, '#e3d79a');
  body += ridge(38, '#1b2250', (x) => 11 + 6 * Math.sin(x / 9) + 4 * Math.sin(x / 4.3 + 1));
  body += ridge(42, '#0f1438', (x) => 6 + 4 * Math.sin(x / 6 + 2) + 2 * Math.sin(x / 2.7));
  for (let i = 0; i < 9; i += 1) body += pine(5 + i * 11 + Math.floor(random() * 4), 46, 6 + Math.floor(random() * 4), '#0a0e2b');
  body += rect(0, 46, WIDTH, 8, '#080b22');
  return svg(body);
}

export function pixelSunset(): string {
  let body = bands(['#2b1055', '#5b1a6b', '#a02f78', '#e0506b', '#ff8a5c', '#ffc371'], 36);
  body += disc(48, 36, 13, (row) => (row < -6 ? '#fff6c9' : '#ffe08a'), -13, 0);
  body += ridge(38, '#3a1450', (x) => 4 + 2 * Math.sin(x / 7) + 1.5 * Math.sin(x / 3.1 + 1));
  ['#4a1658', '#3a1250', '#2c0e43', '#1f0a35'].forEach((color, index) => {
    body += rect(0, 36 + index * 5, WIDTH, 6, color);
  });
  // sun reflection on the water
  for (let i = 0; i < 8; i += 1) body += rect(48 - (12 - i), 38 + i * 2, (12 - i) * 2, 1, i % 2 === 0 ? '#ffb86b' : '#e0506b', 0.85);
  return svg(body);
}

export function pixelForest(): string {
  const random = createRandom(23);
  let body = bands(['#0b3b3a', '#14595a', '#1f7a72', '#3aa38b'], 34);
  body += disc(20, 10, 5, () => '#dff7e4', -5, 5);
  for (let i = 0; i < 12; i += 1) body += pine(3 + i * 8 + Math.floor(random() * 3), 40, 12 + Math.floor(random() * 6), '#0f4a45');
  for (let i = 0; i < 10; i += 1) body += pine(6 + i * 10 + Math.floor(random() * 4), 46, 14 + Math.floor(random() * 7), '#0a3835');
  for (let i = 0; i < 7; i += 1) body += pine(4 + i * 14 + Math.floor(random() * 6), 54, 20 + Math.floor(random() * 10), '#062726');
  body += stars(random, 16, 50, ['#fff48a', '#fff48a', '#c8ff8a']);
  return svg(body);
}

export function pixelOcean(): string {
  const random = createRandom(37);
  let body = bands(['#050a1f', '#0a1536', '#10224f', '#1b3a73'], 28);
  body += stars(random, 40, 24, ['#ffffff', '#ffffff', '#bcd2ff']);
  body += disc(70, 11, 5, () => '#eaf2ff');
  const sea = ['#1b3a73', '#173266', '#122a58', '#0e2249', '#0a1a3a', '#07132b'];
  sea.forEach((color, index) => {
    body += rect(0, 28 + index * 4.4, WIDTH, 5, color);
  });
  for (let row = 0; row < 14; row += 1) {
    const y = 29 + row * 1.8;
    body += rect(68 - row * 0.4, y, 5 + row * 0.8, 1, '#cfe0ff', 0.55 - row * 0.03);
  }
  for (let i = 0; i < 26; i += 1) body += rect(Math.floor(random() * 90), 30 + Math.floor(random() * 23), 3 + Math.floor(random() * 4), 1, '#3b63a8', 0.8);
  return svg(body);
}

// --------------------------------------------------------------------------------------------- cyberpunk

export function neonCity(): string {
  const random = createRandom(41);
  let body = bands(['#12002b', '#1d0640', '#2c0a58', '#4a1470', '#7a1f82'], 36);
  const neon = ['#00e5ff', '#ff2d95', '#ffd166'];
  const skyline = (baseY: number, color: string, minH: number, maxH: number, lit: boolean) => {
    let out = '';
    let x = -2;
    while (x < WIDTH) {
      const w = 5 + Math.floor(random() * 5);
      const h = minH + Math.floor(random() * (maxH - minH));
      out += rect(x, baseY - h, w, h + 1, color);
      if (lit) {
        for (let wx = x + 1; wx < x + w - 1; wx += 2) {
          for (let wy = baseY - h + 2; wy < baseY - 1; wy += 3) {
            if (random() < 0.3) out += rect(wx, wy, 1, 1, neon[Math.floor(random() * neon.length)]);
          }
        }
      }
      x += w + (random() < 0.4 ? 1 : 0);
    }
    return out;
  };
  body += skyline(44, '#1a0b3a', 12, 26, false);
  body += skyline(46, '#120629', 16, 32, true);
  // neon signs
  body += rect(14, 20, 1, 8, '#ff2d95') + rect(13, 19, 3, 10, '#ff2d95', 0.25);
  body += rect(70, 16, 6, 1, '#00e5ff') + rect(69, 15, 8, 3, '#00e5ff', 0.25);
  body += rect(0, 46, WIDTH, 8, '#0a0418');
  for (let i = 0; i < 18; i += 1) body += rect(Math.floor(random() * WIDTH), 47, 1, 2 + Math.floor(random() * 5), neon[Math.floor(random() * neon.length)], 0.35);
  return svg(body);
}

export function synthwaveGrid(): string {
  let body = bands(['#14052e', '#2a0a52', '#5b1384', '#a3249a', '#ff4fa3'], 30);
  // striped sun: rows at the bottom are cut out with growing gaps
  const gaps = new Set([-2, -5, -6, -9, -10, -13, -14]);
  body += disc(48, 30, 17, (row) => (row < -9 ? '#ffe66d' : row < -4 ? '#ffb36b' : '#ff6ec7'), -17, 0, (row) => gaps.has(row));
  body += ridge(30, '#1a0536', (x) => 2 + 3 * Math.abs(Math.sin(x / 8)) + 1.5 * Math.sin(x / 3.3 + 2));
  body += rect(0, 30, WIDTH, 24, '#0d0220');
  [1, 3, 6, 10, 15, 21].forEach((offset) => {
    body += rect(0, 30 + offset, WIDTH, 1, '#ff4fa3', 0.9);
  });
  for (let k = -10; k <= 10; k += 1) {
    body += `<line x1="${48 + k * 2}" y1="30" x2="${48 + k * 16}" y2="54" stroke="#ff4fa3" stroke-width="0.6" stroke-opacity="0.8"/>`;
  }
  body += rect(0, 30, WIDTH, 1, '#ff9edb');
  return svg(body);
}

export function rainyAlley(): string {
  const random = createRandom(53);
  let body = rect(0, 0, WIDTH, HEIGHT, '#06040f') + bands(['#0a0618', '#120b2a', '#1c1040'], 34);
  // walls on both sides
  body += rect(0, 0, 26, 46, '#150a30') + rect(70, 0, 26, 46, '#150a30');
  for (let y = 0; y < 46; y += 4) {
    for (let x = 0; x < 26; x += 6) {
      body += rect(x + (y % 8 === 0 ? 0 : 3), y, 5, 1, '#1f1040');
      body += rect(70 + x + (y % 8 === 0 ? 0 : 3), y, 5, 1, '#1f1040');
    }
  }
  // lit windows and signs
  for (let i = 0; i < 14; i += 1) {
    const left = random() < 0.5;
    body += rect((left ? 2 : 73) + Math.floor(random() * 18), 3 + Math.floor(random() * 38), 2, 3, random() < 0.5 ? '#ffd166' : '#00e5ff', 0.85);
  }
  body += rect(22, 8, 1, 18, '#ff2d95') + rect(21, 7, 3, 20, '#ff2d95', 0.25);
  body += rect(72, 12, 1, 14, '#00e5ff') + rect(71, 11, 3, 16, '#00e5ff', 0.25);
  // wet floor with reflections
  body += rect(0, 46, WIDTH, 8, '#0b0620');
  body += rect(22, 47, 1, 6, '#ff2d95', 0.4) + rect(72, 47, 1, 6, '#00e5ff', 0.4);
  // rain
  for (let i = 0; i < 80; i += 1) body += rect(Math.floor(random() * WIDTH), Math.floor(random() * 50), 1, 2 + Math.floor(random() * 2), '#9bd6ff', 0.3);
  return svg(body);
}

export function vaporwave(): string {
  const random = createRandom(61);
  let body = bands(['#ff9de2', '#e6a4ff', '#b9b6ff', '#8ed0ff', '#7ef9ff'], 30);
  body += disc(48, 30, 14, (row) => (row < -6 ? '#fff1a8' : '#ff8fd2'), -14, 0, (row) => row === -2 || row === -5 || row === -8);
  // pixel clouds, kept away from the sun
  for (let i = 0; i < 5; i += 1) {
    const x = (i % 2 === 0 ? 4 : 62) + Math.floor(random() * 18);
    const y = 4 + Math.floor(random() * 10);
    body += rect(x, y, 8, 2, '#ffffff', 0.85) + rect(x + 2, y - 1, 4, 1, '#ffffff', 0.85);
  }
  // checkered floor that stretches toward the viewer
  body += rect(0, 30, WIDTH, 24, '#2a0f4d');
  let y = 30;
  let row = 0;
  while (y < HEIGHT) {
    const h = 1 + Math.floor(row / 2);
    const tile = 3 + row * 2;
    for (let x = -tile; x < WIDTH + tile; x += tile * 2) body += rect(x + (row % 2 ? tile : 0), y, tile, h, '#6a2c91');
    y += h;
    row += 1;
  }
  // columns
  body += rect(6, 8, 5, 40, '#f4eaff') + rect(5, 6, 7, 2, '#ffffff') + rect(5, 48, 7, 2, '#ffffff') + rect(9, 8, 2, 40, '#cdb8ee');
  body += rect(85, 8, 5, 40, '#f4eaff') + rect(84, 6, 7, 2, '#ffffff') + rect(84, 48, 7, 2, '#ffffff') + rect(88, 8, 2, 40, '#cdb8ee');
  return svg(body);
}

// ----------------------------------------------------------------------------------------------- catalog

function entry(
  id: string,
  name: string,
  category: 'pixel' | 'cyberpunk',
  markup: string,
  palette: string[],
): CatalogWallpaper {
  return {
    id,
    name,
    category,
    background: null,
    imageUrl: toDataUri(markup),
    pixelated: category === 'pixel',
    luminance: paletteLuminance(palette),
  };
}

export const PIXEL_CYBERPUNK_WALLPAPERS: CatalogWallpaper[] = [
  entry('pixel-night', 'Pixel Night', 'pixel', pixelNight(), ['#070b24', '#111a45', '#262d6b', '#0f1438']),
  entry('pixel-sunset', 'Pixel Sunset', 'pixel', pixelSunset(), ['#2b1055', '#a02f78', '#ff8a5c', '#3a1450']),
  entry('pixel-forest', 'Pixel Forest', 'pixel', pixelForest(), ['#0b3b3a', '#1f7a72', '#0a3835', '#062726']),
  entry('pixel-ocean', 'Pixel Ocean', 'pixel', pixelOcean(), ['#050a1f', '#10224f', '#122a58', '#07132b']),
  entry('cyber-neon-city', 'Neon City', 'cyberpunk', neonCity(), ['#12002b', '#2c0a58', '#7a1f82', '#120629']),
  entry('cyber-synthwave', 'Synthwave Grid', 'cyberpunk', synthwaveGrid(), ['#14052e', '#5b1384', '#ff4fa3', '#0d0220']),
  entry('cyber-alley', 'Rainy Alley', 'cyberpunk', rainyAlley(), ['#06040f', '#150a30', '#1c1040', '#0b0620']),
  entry('cyber-vaporwave', 'Vaporwave', 'cyberpunk', vaporwave(), ['#ff9de2', '#b9b6ff', '#7ef9ff', '#2a0f4d']),
];
