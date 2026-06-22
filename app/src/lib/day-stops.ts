/**
 * day-stops.ts -- intra-day waypoints with real lat/lng for every stop on
 * the Kailash 2026 itinerary, plus the transport mode used to reach the
 * next stop. Mode drives the polyline style in ItineraryDayMap:
 *   - drive / walk: solid line snapped to real road geometry (via OSRM)
 *   - flight: dashed straight line (great circle approximation)
 *   - trek:  dotted dashed line
 *
 * Days without entries fall back to the high-level start/end from
 * day-routes.ts.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

export type TransportMode = 'drive' | 'walk' | 'flight' | 'trek';

export interface DayStop {
  lat: number;
  lng: number;
  label: string;
  /** Mode used to reach the NEXT stop. Ignored on the final stop. */
  modeNext?: TransportMode;
  /**
   * If true, this point is a route waypoint that bends the polyline through
   * the actual trail/road geometry but isn't a named stop in the day card's
   * leg list. Used for parikrama trek days where the trail follows valleys
   * rather than going point-to-point.
   */
  intermediate?: boolean;
}

// ---- Place coordinates ---------------------------------------------------

const BOM_AIRPORT: Omit<DayStop, 'modeNext'> = { lat: 19.0896, lng: 72.8656, label: 'Mumbai Airport' };
const KTM_AIRPORT: Omit<DayStop, 'modeNext'> = { lat: 27.6966, lng: 85.3591, label: 'KTM Airport' };
const KTM_MARRIOTT: Omit<DayStop, 'modeNext'> = { lat: 27.7117, lng: 85.3340, label: 'Marriott KTM' };
const KTM_EMBASSY: Omit<DayStop, 'modeNext'> = { lat: 27.7113, lng: 85.3273, label: 'Indian Embassy' };
const PASHUPATINATH: Omit<DayStop, 'modeNext'> = { lat: 27.7104, lng: 85.3489, label: 'Pashupatinath' };
const BOUDHANATH: Omit<DayStop, 'modeNext'> = { lat: 27.7215, lng: 85.3618, label: 'Boudhanath Stupa' };
const LXA_AIRPORT: Omit<DayStop, 'modeNext'> = { lat: 29.2978, lng: 90.9119, label: 'Lhasa Airport' };
const LHASA_HOTEL: Omit<DayStop, 'modeNext'> = { lat: 29.6543, lng: 91.1283, label: 'St Regis Lhasa' };
const JOKHANG: Omit<DayStop, 'modeNext'> = { lat: 29.6531, lng: 91.1313, label: 'Jokhang Temple' };
const BARKHOR: Omit<DayStop, 'modeNext'> = { lat: 29.6537, lng: 91.1318, label: 'Barkhor Street' };
const POTALA: Omit<DayStop, 'modeNext'> = { lat: 29.6573, lng: 91.1166, label: 'Potala Palace' };
// Purang / Burang Airport (south of Mt Kailash, near the Tibet-Nepal
// border). ~1 hour drive to Darchen, ~1.5 hour to the Mansarovar
// hotels. Previously the data pointed at Ali / Ngari Gunsa (NGQ,
// 32.10 N, 80.05 E) which is the wrong airport -- 6+ hours from
// Darchen by road. Corrected per yatri feedback.
const PURANG_AIRPORT: Omit<DayStop, 'modeNext'> = { lat: 30.275, lng: 81.20, label: 'Purang Airport' };
// Chiu village area on the NW shore of Lake Manasarovar; this is where
// pilgrim hotels actually sit. Earlier 30.71 placement was 6 km too far
// north of the lake.
const MANSAROVAR_HOTEL: Omit<DayStop, 'modeNext'> = { lat: 30.665, lng: 81.453, label: 'Mansarovar Hotel' };
const LAKE_SHORE: Omit<DayStop, 'modeNext'> = { lat: 30.638, lng: 81.450, label: 'Lake Manasarovar' };
const CHIU_GOMPA: Omit<DayStop, 'modeNext'> = { lat: 30.670, lng: 81.450, label: 'Chiu Gompa' };
// Parikrama coords tightened to the actual Kailash kora geography:
// Darchen / Tarboche (Yamadwar) at the south, Dirapuk Gompa on the
// north face, Dolma La pass between Dirapuk and Zuthulphuk on the east,
// Zuthulphuk on the south-east leg back to Darchen.
// Yamadwar / Tarboche is the parikrama gate ~3.5 km N of Darchen town
// (Darchen is at 31.013, 81.318; the gate sits up the Lha Chu valley).
const YAMADWAR: Omit<DayStop, 'modeNext'> = { lat: 31.038, lng: 81.300, label: 'Yamadwar (Tarboche)' };
const DIRAPUK: Omit<DayStop, 'modeNext'> = { lat: 31.117, lng: 81.290, label: 'Dirapuk camp' };

// ---- Parikrama trail waypoints ------------------------------------------
// Intermediate points that bend the trek polyline through the actual
// valley/ridge geography. Sources: OSM Tibet hiking data + standard
// kora landmark sequence (Tarboche -> Lha Chu valley -> Dirapuk; Dirapuk
// -> Shiva Tsal -> Dolma La -> Gauri Kund -> Lham Chukir -> Zuthulphuk;
// Zuthulphuk -> Zhong Chu valley -> Darchen).
const TARBOCHE_FLAGPOLE: DayStop = { lat: 31.045, lng: 81.298, label: 'Tarboche flagpole', intermediate: true };
const LHA_CHU_BEND: DayStop  = { lat: 31.075, lng: 81.292, label: 'Lha Chu river bend', intermediate: true };
const N_FACE_VIEW: DayStop   = { lat: 31.095, lng: 81.291, label: 'North-face viewpoint', intermediate: true };
const SHIVA_TSAL: DayStop    = { lat: 31.112, lng: 81.315, label: 'Shiva Tsal', intermediate: true };
const FINAL_ASCENT: DayStop  = { lat: 31.110, lng: 81.328, label: 'Final ascent', intermediate: true };
const GAURI_KUND: DayStop    = { lat: 31.100, lng: 81.345, label: 'Gauri Kund', intermediate: true };
const LHAM_CHUKIR: DayStop   = { lat: 31.075, lng: 81.365, label: 'Lham Chukir valley', intermediate: true };
const ZHONG_CHU_NARROWS: DayStop = { lat: 31.020, lng: 81.358, label: 'Zhong Chu narrows', intermediate: true };
const VALLEY_MOUTH: DayStop  = { lat: 31.016, lng: 81.338, label: 'Zhong Chu valley mouth', intermediate: true };
const DOLMA_LA: Omit<DayStop, 'modeNext'> = { lat: 31.108, lng: 81.336, label: 'Dolma La pass' };
const ZUTHULPHUK: Omit<DayStop, 'modeNext'> = { lat: 31.027, lng: 81.378, label: 'Zuthulphuk camp' };
const DARCHEN: Omit<DayStop, 'modeNext'> = { lat: 31.013, lng: 81.318, label: 'Darchen' };

function withMode(p: Omit<DayStop, 'modeNext'>, m?: TransportMode): DayStop {
  return { ...p, modeNext: m };
}

// ---- Per-day itineraries -------------------------------------------------

const DAY_STOPS_TABLE: Record<number, DayStop[]> = {
  // Day 1 · arrive KTM, transfer to hotel.
  1: [withMode(KTM_AIRPORT, 'drive'), withMode(KTM_MARRIOTT)],

  // Day 2 · KTM city: embassy NOC + Pashupatinath darshan, back to hotel.
  2: [
    withMode(KTM_MARRIOTT, 'drive'),
    withMode(KTM_EMBASSY, 'drive'),
    withMode(PASHUPATINATH, 'drive'),
    withMode(KTM_MARRIOTT),
  ],

  // Day 3 · transfer to KTM airport, fly to Lhasa, transfer to hotel.
  3: [
    withMode(KTM_MARRIOTT, 'drive'),
    withMode(KTM_AIRPORT, 'flight'),
    withMode(LXA_AIRPORT, 'drive'),
    withMode(LHASA_HOTEL),
  ],

  // Day 4 · Lhasa acclimatization: Jokhang + Barkhor + Potala loop.
  4: [
    withMode(LHASA_HOTEL, 'drive'),
    withMode(JOKHANG, 'walk'),
    withMode(BARKHOR, 'drive'),
    withMode(POTALA, 'drive'),
    withMode(LHASA_HOTEL),
  ],

  // Day 5 · transfer day: Lhasa -> Purang by flight -> Mansarovar by road
  // (~1.5 h drive from Purang Airport to the Mansarovar hotels).
  5: [
    withMode(LHASA_HOTEL, 'drive'),
    withMode(LXA_AIRPORT, 'flight'),
    withMode(PURANG_AIRPORT, 'drive'),
    withMode(MANSAROVAR_HOTEL),
  ],

  // Day 6 · Mansarovar lake darshan + Chiu Gompa.
  6: [
    withMode(MANSAROVAR_HOTEL, 'drive'),
    withMode(LAKE_SHORE, 'drive'),
    withMode(CHIU_GOMPA, 'drive'),
    withMode(MANSAROVAR_HOTEL),
  ],

  // Day 7 · Mansarovar -> Darchen by road, Yamadwar gate then trek up the
  // Lha Chu valley to Dirapuk camp on the north face. ~18 km of trek.
  7: [
    withMode(MANSAROVAR_HOTEL, 'drive'),
    withMode(YAMADWAR, 'trek'),
    { ...TARBOCHE_FLAGPOLE, modeNext: 'trek' },
    { ...LHA_CHU_BEND, modeNext: 'trek' },
    { ...N_FACE_VIEW, modeNext: 'trek' },
    withMode(DIRAPUK),
  ],

  // Day 8 · Dirapuk -> Dolma La pass (5,630 m) -> Zuthulphuk. ~22 km, the
  // crossing day. Steep climb to Shiva Tsal then the pass, descend past
  // Gauri Kund into the Lham Chukir valley.
  8: [
    withMode(DIRAPUK, 'trek'),
    { ...SHIVA_TSAL, modeNext: 'trek' },
    { ...FINAL_ASCENT, modeNext: 'trek' },
    withMode(DOLMA_LA, 'trek'),
    { ...GAURI_KUND, modeNext: 'trek' },
    { ...LHAM_CHUKIR, modeNext: 'trek' },
    withMode(ZUTHULPHUK),
  ],

  // Day 9 · Zuthulphuk -> Darchen along the Zhong Chu valley. ~14 km out.
  9: [
    withMode(ZUTHULPHUK, 'trek'),
    { ...ZHONG_CHU_NARROWS, modeNext: 'trek' },
    { ...VALLEY_MOUTH, modeNext: 'trek' },
    withMode(DARCHEN),
  ],

  // Day 10 · Darchen -> Purang by road (~1 h) -> Lhasa by flight.
  10: [
    withMode(DARCHEN, 'drive'),
    withMode(PURANG_AIRPORT, 'flight'),
    withMode(LXA_AIRPORT, 'drive'),
    withMode(LHASA_HOTEL),
  ],

  // Day 11 · Lhasa -> Kathmandu by flight.
  11: [
    withMode(LHASA_HOTEL, 'drive'),
    withMode(LXA_AIRPORT, 'flight'),
    withMode(KTM_AIRPORT, 'drive'),
    withMode(KTM_MARRIOTT),
  ],

  // Day 12 · KTM rest day with Boudhanath darshan.
  12: [
    withMode(KTM_MARRIOTT, 'drive'),
    withMode(BOUDHANATH, 'drive'),
    withMode(KTM_MARRIOTT),
  ],

  // Day 13 · home: KTM -> Mumbai by flight.
  13: [
    withMode(KTM_MARRIOTT, 'drive'),
    withMode(KTM_AIRPORT, 'flight'),
    withMode(BOM_AIRPORT),
  ],
};

/**
 * Returns the ordered stops for a 1-based day number, or null if that day
 * uses the high-level fallback (start/end from day-routes.ts).
 */
export function getDayStops(dayNum: number): DayStop[] | null {
  return DAY_STOPS_TABLE[dayNum] ?? null;
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

/** Verb for transport mode -- 'flight', 'drive', etc. */
export function modeLabel(m?: TransportMode): string {
  switch (m) {
    case 'flight':
      return 'flight';
    case 'walk':
      return 'walk';
    case 'trek':
      return 'trek';
    case 'drive':
    default:
      return 'drive';
  }
}
