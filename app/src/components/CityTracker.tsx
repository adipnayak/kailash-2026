/**
 * CityTracker -- horizontal yatra route strip, embedded inside the countdown bento.
 *
 * v2.4-final. Full round-trip chain. Cohort-aware (IN/AE/MU/US/OTHER/FALLBACK).
 * localStorage kailash_route_v1 persists resolved start/end across sessions.
 * sessionStorage kailash_geo_v1 1h TTL on raw ipapi.co fetch.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { Fragment, useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { getCohortChain, type CohortKey, type CohortRoute } from '../lib/city-cohort';
import type { JourneyState } from '../lib/journey-state';
import type { Tab } from '../hooks/useJourneyState';

// ---------------------------------------------------------------------------
// Storage keys + TTL
// ---------------------------------------------------------------------------
const ROUTE_LS_KEY = 'kailash_route_v1';
const GEO_SS_KEY = 'kailash_geo_v1';
const TTL_MS = 60 * 60 * 1000; // 1 hour

// ---------------------------------------------------------------------------
// Persisted shape
// ---------------------------------------------------------------------------
interface PersistedRoute {
  startCity: string;
  startCountry: string;
  endCity: string;
  endCountry: string;
  source: 'ip' | 'fallback';
  cohortKey: CohortKey;
  rawCity?: string;
  rawCountry?: string;
}

// ---------------------------------------------------------------------------
// Geo session-cache
// ---------------------------------------------------------------------------
interface GeoCache {
  countryCode: string;
  countryName: string;
  city: string;
  fetchedAt: number;
}

function readGeoCache(): GeoCache | null {
  try {
    const raw = sessionStorage.getItem(GEO_SS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeoCache;
    if (Date.now() - parsed.fetchedAt > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeGeoCache(g: GeoCache): void {
  try {
    sessionStorage.setItem(GEO_SS_KEY, JSON.stringify(g));
  } catch {
    // sessionStorage write failed (quota/private mode) -- ignore
  }
}

async function fetchGeo(): Promise<GeoCache | null> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) return null;
    const data = (await res.json()) as {
      country_code?: string;
      country_name?: string;
      city?: string;
    };
    if (!data.country_code) return null;
    const g: GeoCache = {
      countryCode: data.country_code,
      countryName: data.country_name || data.country_code,
      city: data.city || '',
      fetchedAt: Date.now(),
    };
    writeGeoCache(g);
    return g;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------
function readPersistedRoute(): PersistedRoute | null {
  try {
    const raw = localStorage.getItem(ROUTE_LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedRoute;
  } catch {
    return null;
  }
}

function writePersistedRoute(r: PersistedRoute): void {
  try {
    localStorage.setItem(ROUTE_LS_KEY, JSON.stringify(r));
  } catch {
    // localStorage write failed -- ignore
  }
}

// ---------------------------------------------------------------------------
// Route -> PersistedRoute bridge
// ---------------------------------------------------------------------------
function routeToStored(
  route: CohortRoute,
  source: 'ip' | 'fallback',
  rawCity?: string,
  rawCountry?: string,
): PersistedRoute {
  return {
    startCity: route.startCity,
    startCountry: route.startCountry,
    endCity: route.endCity,
    endCountry: route.endCountry,
    source,
    cohortKey: route.cohortKey,
    rawCity,
    rawCountry,
  };
}

// ---------------------------------------------------------------------------
// Day-to-chain-index mapping for "during" phase.
// AE/MU/US cohorts prepend one city, so all indices are shifted +1.
// ---------------------------------------------------------------------------

// Base indices assume the IN/FALLBACK chain (Kathmandu at index 1 for IN, 0 for FALLBACK).
// For IN canonical (14 nodes):
//   index 0 = Mumbai, 1 = KTM, 2 = Lhasa, 3 = Purang, 4 = Mansarovar,
//   5 = Darchen, 6 = Dirapuk, 7 = Dolma La, 8 = Zuthulphuk,
//   9 = Darchen(2), 10 = Purang(2), 11 = Lhasa(2), 12 = KTM(2), 13 = Mumbai(2)
// For FALLBACK (12 nodes, starts at KTM):
//   index 0 = KTM, 1 = Lhasa, 2 = Purang, 3 = Mansarovar,
//   4 = Darchen, 5 = Dirapuk, 6 = Dolma La, 7 = Zuthulphuk,
//   8 = Darchen(2), 9 = Purang(2), 10 = Lhasa(2), 11 = KTM(2)

const DAY_TO_INDEX_IN: Record<number, number> = {
  1: 1,   // Kathmandu (first)
  2: 1,   // Kathmandu (first)
  3: 2,   // Lhasa (first)
  4: 2,   // Lhasa (first)
  5: 4,   // Mansarovar
  6: 4,   // Mansarovar
  7: 6,   // Dirapuk
  8: 7,   // Dolma La
  9: 8,   // Zuthulphuk
  10: 11, // Lhasa (second)
  11: 12, // Kathmandu (second)
  12: 12, // Kathmandu (second)
  13: 13, // Mumbai (second)
};

const DAY_TO_INDEX_FALLBACK: Record<number, number> = {
  1: 0,   // Kathmandu (first)
  2: 0,   // Kathmandu (first)
  3: 1,   // Lhasa (first)
  4: 1,   // Lhasa (first)
  5: 3,   // Mansarovar
  6: 3,   // Mansarovar
  7: 5,   // Dirapuk
  8: 6,   // Dolma La
  9: 7,   // Zuthulphuk
  10: 10, // Lhasa (second)
  11: 11, // Kathmandu (second)
  12: 11, // Kathmandu (second)
  13: 11, // Kathmandu (second -- no Mumbai on fallback)
};

function getDuringIndex(tripDayIndex: number, cohortKey: CohortKey): number {
  const isPrepended = cohortKey === 'AE' || cohortKey === 'MU' || cohortKey === 'US';
  const offset = isPrepended ? 1 : 0;

  if (cohortKey === 'FALLBACK') {
    return DAY_TO_INDEX_FALLBACK[tripDayIndex] ?? 0;
  }

  const base = DAY_TO_INDEX_IN[tripDayIndex] ?? 1;
  return base + offset;
}

// ---------------------------------------------------------------------------
// Pill color state
// ---------------------------------------------------------------------------
type PillState = 'done' | 'current' | 'upcoming' | 'sacred';

function pillClass(state: PillState): string {
  const base =
    'inline-flex items-center gap-1 rounded-none border px-3 py-2 font-mono text-xs whitespace-nowrap';
  switch (state) {
    case 'done':
      return base + ' bg-emerald text-background border-emerald';
    case 'current':
      return base + ' bg-emerald text-background border-emerald ring-2 ring-foreground/40';
    case 'sacred':
      return base + ' bg-sacred text-sacred-foreground border-sacred';
    case 'upcoming':
    default:
      return base + ' bg-foreground text-background border-foreground';
  }
}

function computeState(
  i: number,
  currentIndex: number,
  isFallbackEntry: boolean,
  phase: string,
): PillState {
  // Sacred: FALLBACK chain's leading Kathmandu pill when no current is set.
  if (isFallbackEntry && i === 0 && currentIndex === -1) return 'sacred';

  if (currentIndex === -1) return 'upcoming';

  if (phase === 'after') {
    // All done except last which is current.
    const isLast = i === -1; // handled by caller for after phase
    void isLast;
    return 'upcoming'; // unreachable; handled in caller
  }

  if (i < currentIndex) return 'done';
  if (i === currentIndex) return 'current';
  return 'upcoming';
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface Props {
  phase: JourneyState;
  onTab: (t: Tab) => void;
}

// ---------------------------------------------------------------------------
// CityTracker
// ---------------------------------------------------------------------------
export function CityTracker({ phase }: Props) {
  const { phase: phaseKey, tripDayIndex } = phase;

  // -------------------------------------------------------------------------
  // Route state. Initialize lazily from localStorage.
  // -------------------------------------------------------------------------
  const [route, setRoute] = useState<CohortRoute | null>(() => {
    const stored = readPersistedRoute();
    if (!stored) return null;
    // Rebuild the full CohortRoute from persisted key.
    return getCohortChain(
      stored.cohortKey === 'FALLBACK' ? null : stored.cohortKey,
    );
  });

  // Raw geo for the "Watching from" label (only for OTHER cohort).
  const [rawCity, setRawCity] = useState<string>(() => {
    try {
      const stored = readPersistedRoute();
      return stored?.rawCity || '';
    } catch {
      return '';
    }
  });
  const [rawCountry, setRawCountry] = useState<string>(() => {
    try {
      const stored = readPersistedRoute();
      return stored?.rawCountry || '';
    } catch {
      return '';
    }
  });

  const stripRef = useRef<HTMLOListElement>(null);

  // -------------------------------------------------------------------------
  // Geo fetch on first mount (only if no localStorage hit).
  // -------------------------------------------------------------------------
  useEffect(() => {
    // If already resolved from localStorage, skip.
    if (route !== null) return;

    let cancelled = false;

    async function resolve() {
      // Check sessionStorage first.
      let geo = readGeoCache();

      if (!geo) {
        geo = await fetchGeo();
      }

      if (cancelled) return;

      if (!geo) {
        // Geo failed entirely -- use FALLBACK.
        const fallbackRoute = getCohortChain(null);
        setRoute(fallbackRoute);
        const stored = routeToStored(fallbackRoute, 'fallback');
        writePersistedRoute(stored);
        return;
      }

      const resolved = getCohortChain(geo.countryCode, geo.countryName);
      setRoute(resolved);
      setRawCity(geo.city);
      setRawCountry(geo.countryName);
      const stored = routeToStored(resolved, 'ip', geo.city, geo.countryName);
      writePersistedRoute(stored);
    }

    resolve().catch(() => {
      if (!cancelled) {
        const fallbackRoute = getCohortChain(null);
        setRoute(fallbackRoute);
        writePersistedRoute(routeToStored(fallbackRoute, 'fallback'));
      }
    });

    return () => {
      cancelled = true;
    };
  // Run once on mount only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------------------
  // Compute current chain index.
  // -------------------------------------------------------------------------
  const currentRoute = route ?? getCohortChain(null); // render FALLBACK while loading
  const { chain, cohortKey } = currentRoute;

  let currentIndex = -1;

  if (phaseKey === 'before') {
    if (cohortKey === 'OTHER') {
      // No green pill. currentIndex stays -1.
      currentIndex = -1;
    } else if (cohortKey === 'FALLBACK') {
      // Leading Kathmandu is SACRED, not green. currentIndex stays -1.
      currentIndex = -1;
    } else {
      // IN/AE/MU/US: leftmost pill (index 0) is green.
      currentIndex = 0;
    }
  } else if (phaseKey === 'during') {
    currentIndex = getDuringIndex(tripDayIndex, cohortKey);
  } else if (phaseKey === 'after') {
    // Last pill is "current" (green+ring), all others done.
    currentIndex = chain.length - 1;
  }

  const isFallbackEntry = cohortKey === 'FALLBACK';

  // -------------------------------------------------------------------------
  // Auto-scroll current pill into view (strip-local, never window scroll).
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (currentIndex === -1) return;
    const strip = stripRef.current;
    if (!strip) return;
    const chip = strip.querySelector<HTMLElement>(`[data-chain-index="${currentIndex}"]`);
    if (!chip) return;
    const stripRect = strip.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const delta =
      (chipRect.left + chipRect.right) / 2 - (stripRect.left + stripRect.right) / 2;
    strip.scrollBy({ left: delta, behavior: 'smooth' });
  }, [currentIndex]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-1">
      {/* "Watching from" label -- only for OTHER cohort when geo succeeded. */}
      {cohortKey === 'OTHER' && rawCity && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Watching from {rawCity}, {rawCountry}
        </p>
      )}

      <ol
        ref={stripRef}
        aria-label="Yatra route"
        className="flex gap-2 overflow-x-auto"
        style={{ overscrollBehaviorX: 'contain' }}
      >
        {chain.map((city, i) => {
          // For after phase: all done except last (current).
          let state: PillState;
          if (phaseKey === 'after') {
            if (i === chain.length - 1) {
              state = 'current';
            } else {
              state = 'done';
            }
          } else {
            state = computeState(i, currentIndex, isFallbackEntry, phaseKey);
          }

          return (
            <Fragment key={`${city}-${i}`}>
              <li
                className="shrink-0"
                data-chain-index={i}
              >
                <span
                  className={pillClass(state)}
                  aria-current={
                    state === 'current'
                      ? 'step'
                      : state === 'sacred'
                        ? 'location'
                        : undefined
                  }
                  style={{
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'rgba(0,0,0,0.05)',
                  }}
                >
                  {city}
                </span>
              </li>
              {i < chain.length - 1 && (
                <li className="shrink-0 flex items-center" aria-hidden="true">
                  <Icon
                    name="arrow_forward"
                    size={10}
                    className="text-muted-foreground"
                  />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}
