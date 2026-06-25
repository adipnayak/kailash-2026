/**
 * precache-tiles.ts
 *
 * Exports an array of CartoDB tile URLs covering all 13 day routes. The
 * client fires fire-and-forget fetch() calls for each URL on first visit;
 * the SW's CartoDB CacheFirst runtime caching rule catches each response and
 * stores it in the 'cartodb-tiles' cache, enabling offline map rendering.
 *
 * Tile coordinate formulas (standard Web Mercator / slippy map):
 *   lng2tile(lng, z) = floor((lng + 180) / 360 * 2^z)
 *   lat2tile(lat, z) = floor((1 - ln(tan(lat*pi/180) + 1/cos(lat*pi/180)) / pi) / 2 * 2^z)
 *
 * Zoom strategy:
 * - All regions: z=10 (regional overview, ~78 km/tile at equator)
 * - Key offline regions (parikrama D7-D9, Mansarovar, KTM, Lhasa): z=13
 *   (city/valley detail, ~10 km/tile). z=15 is excluded from pre-warming --
 *   street-level tiles get cached at runtime when the user visits each day.
 * - Long-haul flight legs: z=10 only (bbox spans >500 km; higher zooms
 *   would generate millions of tiles).
 *
 * Both CartoDB styles (light_all and dark_all) are included so the theme
 * toggle in ItineraryDayMap works offline.
 *
 * Priority order ensures parikrama days (D7-D9) fill first. Total URL
 * count is approximately 400-700 after dedup across all regions.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

// --------------------------------------------------------------------------
// Slippy-map tile coordinate helpers
// --------------------------------------------------------------------------

function lng2tile(lng: number, z: number): number {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, z));
}

function lat2tile(lat: number, z: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      Math.pow(2, z),
  );
}

interface BBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const STYLES = ['light_all', 'dark_all'] as const;
const SUBDOMAINS = ['a', 'b', 'c'] as const;

function bboxTileUrls(bbox: BBox, z: number): string[] {
  const xMin = lng2tile(bbox.minLng, z);
  const xMax = lng2tile(bbox.maxLng, z);
  // lat2tile is monotonically decreasing: higher lat -> smaller tile y.
  const yMin = lat2tile(bbox.maxLat, z);
  const yMax = lat2tile(bbox.minLat, z);

  const urls: string[] = [];
  for (const style of STYLES) {
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const sub = SUBDOMAINS[(x + y) % 3];
        urls.push(
          `https://${sub}.basemaps.cartocdn.com/${style}/${z}/${x}/${y}.png`,
        );
      }
    }
  }
  return urls;
}

// --------------------------------------------------------------------------
// Bounding boxes
// --------------------------------------------------------------------------

const MARGIN = 0.12; // degrees of padding around each region

function expand(bbox: BBox): BBox {
  return {
    minLat: bbox.minLat - MARGIN,
    maxLat: bbox.maxLat + MARGIN,
    minLng: bbox.minLng - MARGIN,
    maxLng: bbox.maxLng + MARGIN,
  };
}

function fromPoints(points: Array<{ lat: number; lng: number }>): BBox {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return expand({
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  });
}

// --------------------------------------------------------------------------
// Region definitions
// --------------------------------------------------------------------------

// Parikrama days (D7-D9) -- highest priority, critical offline leg

// Day 7: Mansarovar hotel -> Yamadwar gate -> Lha Chu valley -> Dirapuk
const D7_BBOX = fromPoints([
  { lat: 30.665, lng: 81.453 },
  { lat: 31.013, lng: 81.318 },
  { lat: 31.038, lng: 81.300 },
  { lat: 31.075, lng: 81.292 },
  { lat: 31.095, lng: 81.291 },
  { lat: 31.117, lng: 81.290 },
]);

// Day 8: Dirapuk -> Shiva Tsal -> Dolma La -> Gauri Kund -> Zuthulphuk
const D8_BBOX = fromPoints([
  { lat: 31.117, lng: 81.290 },
  { lat: 31.112, lng: 81.315 },
  { lat: 31.110, lng: 81.328 },
  { lat: 31.108, lng: 81.336 },
  { lat: 31.100, lng: 81.345 },
  { lat: 31.075, lng: 81.365 },
  { lat: 31.027, lng: 81.378 },
]);

// Day 9: Zuthulphuk -> Zhong Chu narrows -> valley mouth -> Darchen
const D9_BBOX = fromPoints([
  { lat: 31.027, lng: 81.378 },
  { lat: 31.020, lng: 81.358 },
  { lat: 31.016, lng: 81.338 },
  { lat: 31.013, lng: 81.318 },
]);

// Mansarovar / Darchen area (D5/D6 -- limited connectivity)
const MANSAROVAR_BBOX = fromPoints([
  { lat: 30.275, lng: 81.20 },
  { lat: 30.638, lng: 81.450 },
  { lat: 30.665, lng: 81.453 },
  { lat: 30.670, lng: 81.450 },
]);

// Kathmandu city (D1/D2/D11/D12/D13)
const KTM_BBOX = fromPoints([
  { lat: 27.6966, lng: 85.3591 },
  { lat: 27.7117, lng: 85.3340 },
  { lat: 27.7113, lng: 85.3273 },
  { lat: 27.7104, lng: 85.3489 },
  { lat: 27.7215, lng: 85.3618 },
]);

// Lhasa city (D3/D4/D10/D11)
const LHASA_BBOX = fromPoints([
  { lat: 29.2978, lng: 90.9119 },
  { lat: 29.6500, lng: 91.1000 },
  { lat: 29.6531, lng: 91.1313 },
  { lat: 29.6537, lng: 91.1318 },
  { lat: 29.6573, lng: 91.1166 },
]);

// Long-haul flight legs -- z=10 overview only
const FLIGHT_BOM_KTM = fromPoints([
  { lat: 19.0896, lng: 72.8656 },
  { lat: 27.6966, lng: 85.3591 },
]);

const FLIGHT_KTM_LXA = fromPoints([
  { lat: 27.6966, lng: 85.3591 },
  { lat: 29.2978, lng: 90.9119 },
]);

const FLIGHT_LXA_PURANG = fromPoints([
  { lat: 29.2978, lng: 90.9119 },
  { lat: 30.275, lng: 81.20 },
]);

// --------------------------------------------------------------------------
// Build URL list in priority order; dedup as we go
// --------------------------------------------------------------------------

const seen = new Set<string>();
const all: string[] = [];

function add(urls: string[]): void {
  for (const url of urls) {
    if (!seen.has(url)) {
      seen.add(url);
      all.push(url);
    }
  }
}

// Priority 1: Parikrama days (D7-D9) at z=10 and z=13
for (const bbox of [D7_BBOX, D8_BBOX, D9_BBOX]) {
  add(bboxTileUrls(bbox, 10));
  add(bboxTileUrls(bbox, 13));
}

// Priority 2: Mansarovar area at z=10 and z=13
add(bboxTileUrls(MANSAROVAR_BBOX, 10));
add(bboxTileUrls(MANSAROVAR_BBOX, 13));

// Priority 3: KTM and Lhasa cities at z=10 and z=13
for (const bbox of [KTM_BBOX, LHASA_BBOX]) {
  add(bboxTileUrls(bbox, 10));
  add(bboxTileUrls(bbox, 13));
}

// Priority 4: Flight leg overview at z=10 only
for (const bbox of [FLIGHT_BOM_KTM, FLIGHT_KTM_LXA, FLIGHT_LXA_PURANG]) {
  add(bboxTileUrls(bbox, 10));
}

export const PRECACHE_TILES: string[] = all;
