/**
 * City cohort builder for the city-progress tracker.
 * Returns a typed CohortRoute from a visitor's IP country code.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

export type CohortKey = 'IN' | 'AE' | 'MU' | 'US' | 'OTHER' | 'FALLBACK';

export interface CohortRoute {
  chain: string[];
  cohortKey: CohortKey;
  startCity: string;
  startCountry: string;
  endCity: string;
  endCountry: string;
}

// 14-node canonical Mumbai round trip.
// Mumbai(0) -> KTM(1) -> Lhasa(2) -> Purang(3) -> Mansarovar(4) ->
// Darchen(5) -> Dirapuk(6) -> Dolma La(7) -> Zuthulphuk(8) ->
// Darchen(9) -> Purang(10) -> Lhasa(11) -> KTM(12) -> Mumbai(13)
const CANONICAL: readonly string[] = Object.freeze([
  'Mumbai',
  'Kathmandu',
  'Lhasa',
  'Purang',
  'Mansarovar',
  'Darchen',
  'Dirapuk',
  'Dolma La',
  'Zuthulphuk',
  'Darchen',
  'Purang',
  'Lhasa',
  'Kathmandu',
  'Mumbai',
]);

// 12-node fallback chain: canonical with leading + trailing Mumbai removed.
// Kathmandu(0) -> Lhasa(1) -> Purang(2) -> Mansarovar(3) ->
// Darchen(4) -> Dirapuk(5) -> Dolma La(6) -> Zuthulphuk(7) ->
// Darchen(8) -> Purang(9) -> Lhasa(10) -> Kathmandu(11)
const FALLBACK_CHAIN: readonly string[] = Object.freeze(CANONICAL.slice(1, -1));

/**
 * Returns the chain for a visitor.
 * Pass null for "geo failed entirely".
 * Pass the ipapi country_code + country_name otherwise.
 */
export function getCohortChain(
  countryCode: string | null,
  countryName?: string,
): CohortRoute {
  if (countryCode === null) {
    return {
      chain: [...FALLBACK_CHAIN],
      cohortKey: 'FALLBACK',
      startCity: 'Kathmandu',
      startCountry: 'Nepal',
      endCity: 'Kathmandu',
      endCountry: 'Nepal',
    };
  }

  const cc = countryCode.toUpperCase();

  if (cc === 'IN') {
    return {
      chain: [...CANONICAL],
      cohortKey: 'IN',
      startCity: 'Mumbai',
      startCountry: 'India',
      endCity: 'Mumbai',
      endCountry: 'India',
    };
  }

  if (cc === 'AE') {
    return {
      chain: ['Dubai', ...CANONICAL, 'Dubai'],
      cohortKey: 'AE',
      startCity: 'Dubai',
      startCountry: 'UAE',
      endCity: 'Dubai',
      endCountry: 'UAE',
    };
  }

  if (cc === 'MU') {
    return {
      chain: ['Port Louis', ...CANONICAL, 'Port Louis'],
      cohortKey: 'MU',
      startCity: 'Port Louis',
      startCountry: 'Mauritius',
      endCity: 'Port Louis',
      endCountry: 'Mauritius',
    };
  }

  if (cc === 'US') {
    return {
      chain: ['New York', ...CANONICAL, 'New York'],
      cohortKey: 'US',
      startCity: 'New York',
      startCountry: 'USA',
      endCity: 'New York',
      endCountry: 'USA',
    };
  }

  // Any other country: canonical Mumbai chain + "Watching from" label in component.
  return {
    chain: [...CANONICAL],
    cohortKey: 'OTHER',
    startCity: 'Mumbai',
    startCountry: countryName || 'India',
    endCity: 'Mumbai',
    endCountry: countryName || 'India',
  };
}
