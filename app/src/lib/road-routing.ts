/**
 * road-routing.ts -- fetch real road geometry between two points via
 * OSRM (public Open Source Routing Machine demo server at
 * router.project-osrm.org). Returns [lat, lng][] arrays the map can use
 * as a polyline. Falls back to null on any error so the caller can fall
 * back to a straight line.
 *
 * Cached:
 *   1. in-memory Map (per session)
 *   2. sessionStorage (per tab) so HMR / route revisits don't refetch
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving/';
const SS_KEY_PREFIX = 'kailash_route_v1_';

type LatLng = [number, number];

interface Pt {
  lat: number;
  lng: number;
}

const memCache = new Map<string, LatLng[] | null>();
const inFlight = new Map<string, Promise<LatLng[] | null>>();

function key(a: Pt, b: Pt): string {
  return (
    a.lat.toFixed(4) + ',' + a.lng.toFixed(4) + '|' + b.lat.toFixed(4) + ',' + b.lng.toFixed(4)
  );
}

function readSessionCache(k: string): LatLng[] | null | undefined {
  if (typeof sessionStorage === 'undefined') return undefined;
  const raw = sessionStorage.getItem(SS_KEY_PREFIX + k);
  if (raw === null) return undefined;
  if (raw === 'null') return null;
  try {
    return JSON.parse(raw) as LatLng[];
  } catch {
    return undefined;
  }
}

function writeSessionCache(k: string, v: LatLng[] | null) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(SS_KEY_PREFIX + k, v === null ? 'null' : JSON.stringify(v));
  } catch {
    // Quota / privacy mode -- ignore.
  }
}

async function fetchOsrm(a: Pt, b: Pt): Promise<LatLng[] | null> {
  const url =
    OSRM_BASE +
    a.lng + ',' + a.lat + ';' +
    b.lng + ',' + b.lat +
    '?overview=full&geometries=geojson';
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      routes?: { geometry?: { coordinates?: [number, number][] } }[];
    };
    const coords = data.routes?.[0]?.geometry?.coordinates;
    if (!coords?.length) return null;
    // OSRM returns [lng, lat]; flip for Leaflet's [lat, lng] convention.
    return coords.map(([lng, lat]) => [lat, lng] as LatLng);
  } catch {
    return null;
  }
}

/**
 * Get a road polyline between two points. Returns null if OSRM cannot
 * route between them (e.g. one of the points is in an OSM-sparse area
 * like high-altitude Tibet -- caller should fall back to a straight line).
 */
export async function getRoadGeometry(a: Pt, b: Pt): Promise<LatLng[] | null> {
  const k = key(a, b);
  if (memCache.has(k)) return memCache.get(k) ?? null;

  const ss = readSessionCache(k);
  if (ss !== undefined) {
    memCache.set(k, ss);
    return ss;
  }

  if (inFlight.has(k)) return inFlight.get(k)!;
  const p = fetchOsrm(a, b).then((v) => {
    memCache.set(k, v);
    writeSessionCache(k, v);
    inFlight.delete(k);
    return v;
  });
  inFlight.set(k, p);
  return p;
}
