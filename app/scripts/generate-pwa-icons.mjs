/**
 * generate-pwa-icons.mjs
 *
 * Generates 3 PNG icons for the Kailash 2026 PWA manifest:
 *   app/public/icon-192.png          -- 192x192 standard
 *   app/public/icon-512.png          -- 512x512 standard
 *   app/public/icon-512-maskable.png -- 512x512 maskable (glyph in 60% safe area)
 *
 * Design: sacred-ochre (#c69347) background, white mountain silhouette
 * (stylized Kailash two-peak shape). No font dependency; all geometry
 * is inline SVG paths.
 *
 * Run from app/: node scripts/generate-pwa-icons.mjs
 * npm script: "icons": "node scripts/generate-pwa-icons.mjs"
 *
 * Requires: sharp (installed as devDependency in app/package.json)
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

/**
 * Build a mountain-silhouette SVG for the PWA icon.
 *
 * @param {number} size - canvas size in px (192 or 512)
 * @param {number} glyphScale - glyph area as fraction of canvas
 *   1.0 = fills the whole canvas (standard icons)
 *   0.55 = glyph inside the 60% safe area (maskable variant)
 * @returns {string} SVG markup
 */
function buildMountainSvg(size, glyphScale) {
  // Mountain geometry is defined in a 100x100 unit space then scaled/offset
  // so the composition works at both 192 and 512.
  const glyphPx = size * glyphScale;
  const offset = (size - glyphPx) / 2;
  const scale = glyphPx / 100;

  // Secondary (right) peak -- behind, slightly lighter
  const secPeak = 'M 45,85 L 95,85 L 82,55 L 70,33 L 58,55 Z';
  // Main (left-center) Kailash peak -- in front
  const mainPeak = 'M 5,85 L 62,85 L 54,55 L 40,18 L 26,55 Z';
  // Snow cap highlights (a touch of background color creates depth)
  const snowMain = 'M 33,37 L 40,18 L 47,37 Z';
  const snowSec = 'M 65,46 L 70,33 L 75,46 Z';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#c69347"/>
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <circle cx="72" cy="28" r="16" fill="rgba(255,255,255,0.30)"/>
    <path d="${secPeak}" fill="rgba(255,255,255,0.60)"/>
    <path d="${mainPeak}" fill="white"/>
    <path d="${snowMain}" fill="#c69347" opacity="0.22"/>
    <path d="${snowSec}" fill="#c69347" opacity="0.22"/>
  </g>
</svg>`;
}

async function generateIcon(svg, outPath) {
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log('written:', outPath);
}

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    throw new Error('public dir not found: ' + PUBLIC_DIR);
  }

  // Standard 192x192
  await generateIcon(
    buildMountainSvg(192, 0.82),
    path.join(PUBLIC_DIR, 'icon-192.png'),
  );

  // Standard 512x512
  await generateIcon(
    buildMountainSvg(512, 0.82),
    path.join(PUBLIC_DIR, 'icon-512.png'),
  );

  // Maskable 512x512: glyph must stay inside the inner 60% safe area so
  // circular/squircle platform masks don't clip the mountain silhouette.
  await generateIcon(
    buildMountainSvg(512, 0.55),
    path.join(PUBLIC_DIR, 'icon-512-maskable.png'),
  );

  console.log('Done. Commit app/public/icon-*.png and replace with custom art later.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
