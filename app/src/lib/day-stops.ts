/**
 * day-stops.ts -- intra-day waypoints with real lat/lng for each stop.
 *
 * When a day has detailed stops defined here, the ItineraryDayMap draws
 * a multi-segment polyline through them in order + shows leg distances.
 * Days without entries fall back to the high-level start/end from
 * day-routes.ts (e.g. the inter-city days where intra-day detail isn't
 * mapped yet).
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

export interface DayStop {
  lat: number;
  lng: number;
  label: string;
}

const KTM_AIRPORT: DayStop = { lat: 27.6966, lng: 85.3591, label: 'KTM Airport' };
const KTM_MARRIOTT: DayStop = { lat: 27.7117, lng: 85.3340, label: 'Marriott KTM' };
const KTM_EMBASSY: DayStop = { lat: 27.7113, lng: 85.3273, label: 'Indian Embassy' };
const PASHUPATINATH: DayStop = { lat: 27.7104, lng: 85.3489, label: 'Pashupatinath' };
const LXA_AIRPORT: DayStop = { lat: 29.2978, lng: 90.9119, label: 'Lhasa Airport' };
const LHASA_HOTEL: DayStop = { lat: 29.6543, lng: 91.1283, label: 'St Regis Lhasa' };

/**
 * Returns the ordered stops for a 1-based day number, or null if that day
 * uses the high-level fallback (start/end from day-routes.ts).
 */
export function getDayStops(dayNum: number): DayStop[] | null {
  switch (dayNum) {
    case 1:
      return [KTM_AIRPORT, KTM_MARRIOTT];
    case 2:
      return [KTM_MARRIOTT, KTM_EMBASSY, PASHUPATINATH, KTM_MARRIOTT];
    case 3:
      return [KTM_MARRIOTT, KTM_AIRPORT, LXA_AIRPORT, LHASA_HOTEL];
    default:
      return null;
  }
}

/** Haversine distance in km between two lat/lng points. */
export function haversineKm(a: DayStop, b: DayStop): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Format distance as '4.2 km' or '595 km' (no decimal once >= 100 km). */
export function fmtKm(km: number): string {
  if (km >= 100) return Math.round(km) + ' km';
  if (km >= 10) return km.toFixed(1) + ' km';
  return km.toFixed(2) + ' km';
}
