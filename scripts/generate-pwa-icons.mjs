/**
 * generate-pwa-icons.mjs
 *
 * Generates 3 PNG icons for the Kailash 2026 PWA manifest:
 *   app/public/icon-192.png          -- 192x192 standard
 *   app/public/icon-512.png          -- 512x512 standard
 *   app/public/icon-512-maskable.png -- 512x512 maskable (glyph in 60% safe area)
 *
 * Design: sacred-ochre (#c69347) background, white landscape mountain glyph.
 * The glyph is rendered as inline SVG paths so there is no font dependency.
 *
 * Run: node scripts/generate-pwa-icons.mjs
 * npm script: "icons": "node scripts/generate-pwa-icons.mjs"
 *
 * Requires: sharp (npm install --save-dev sharp)
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// When invoked from repo root via `node scripts/generate-pwa-icons.mjs`,
// the script lives one level above app/. When invoked from app/ via npm
// run icons, __dirname points inside app/scripts/ which doesn't exist,
// so we resolve public/ relative to the script file regardless of cwd.
const PUBLIC_DIR = path.join(__dirname, '..', 'app', 'public');

/**
 * Build an SVG string for the icon.
 *
 * @param {number} size - canvas size in px (192 or 512)
 * @param {number} glyphScale - glyph bounding box as fraction of canvas (1.0 = fill, 0.6 = safe area)
 * @returns {string} SVG markup
 */
function buildSvg(size, glyphScale) {
  // The landscape glyph is drawn on a 24x24 unit grid (Material Symbols viewBox).
  // We scale it to glyphScale * size and center it.
  const glyphPx = size * glyphScale;
  const offset = (size - glyphPx) / 2;

  // Material Symbols "landscape" path (filled variant, 24x24 grid).
  // Source: google/material-design-icons, Apache-2.0 license.
  // Path data for the filled landscape icon.
  const landscapePath =
    'M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7V6h5l1 2h5v6z';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#c69347"/>
  <g transform="translate(${offset}, ${offset}) scale(${glyphPx / 24})">
    <path d="${landscapePath}" fill="white"/>
  </g>
</svg>`;
}

/**
 * Build a higher-fidelity landscape SVG using a mountain silhouette
 * that reads well at both 192 and 512 sizes.
 *
 * The icon shows a two-peak mountain silhouette (stylized Kailash) on
 * the sacred-ochre background.
 *
 * @param {number} size - canvas size in px
 * @param {number} glyphScale - glyph area as fraction of canvas
 * @returns {string} SVG markup
 */
function buildMountainSvg(size, glyphScale) {
  // Mountain paths are defined in a 100x100 unit space then scaled.
  const glyphPx = size * glyphScale;
  const offset = (size - glyphPx) / 2;
  const scale = glyphPx / 100;

  // Sun circle behind the peak
  const sunCx = 75, sunCy = 30, sunR = 14;

  // Main Kailash peak (higher, left-center)
  // Points: base-left, base-right, right-shoulder, peak, left-shoulder
  const mainPeak = 'M 5,85 L 60,85 L 52,55 L 40,20 L 28,55 Z';

  // Secondary peak (lower, right)
  const secPeak = 'M 45,85 L 95,85 L 82,55 L 70,35 L 58,55 Z';

  // Snow cap on main peak (smaller triangle near the tip)
  const snowMain = 'M 33,38 L 40,20 L 47,38 Z';

  // Snow cap on secondary peak
  const snowSec = 'M 65,48 L 70,35 L 75,48 Z';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#c69347"/>
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <!-- sun -->
    <circle cx="${sunCx}" cy="${sunCy}" r="${sunR}" fill="rgba(255,255,255,0.35)"/>
    <!-- secondary peak (behind) -->
    <path d="${secPeak}" fill="rgba(255,255,255,0.65)"/>
    <!-- main peak -->
    <path d="${mainPeak}" fill="white"/>
    <!-- snow caps -->
    <path d="${snowMain}" fill="#c69347" opacity="0.25"/>
    <path d="${snowSec}" fill="#c69347" opacity="0.25"/>
  </g>
</svg>`;
}

async function generateIcon(svg, outPath) {
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outPath);
  console.log('written:', outPath);
}

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    throw new Error('public dir not found: ' + PUBLIC_DIR);
  }

  // 192x192 standard
  await generateIcon(
    buildMountainSvg(192, 0.80),
    path.join(PUBLIC_DIR, 'icon-192.png'),
  );

  // 512x512 standard
  await generateIcon(
    buildMountainSvg(512, 0.80),
    path.join(PUBLIC_DIR, 'icon-512.png'),
  );

  // 512x512 maskable -- glyph must stay inside the 60% safe area
  // so circular/squircle crops don't clip the mountain.
  await generateIcon(
    buildMountainSvg(512, 0.55),
    path.join(PUBLIC_DIR, 'icon-512-maskable.png'),
  );

  console.log('Done. Commit app/public/icon-*.png.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
