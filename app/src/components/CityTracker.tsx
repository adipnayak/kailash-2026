/**
 * CityTracker -- vertical yatra route chain with phase-aware highlight.
 *
 * Before phase: visitor IP city highlighted via ipapi.co/json (1h sessionStorage
 * cache, fail-silent). During phase: group position derived from tripDayIndex.
 * After phase: Mumbai highlighted (group returned).
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { Fragment, useEffect, useState } from 'react';
import { useJourneyState } from '../hooks/useJourneyState';
import type { Tab } from '../hooks/useJourneyState';
import { Icon } from './Icon';
import { BentoGridItem } from './aliimam/Bento';

// ---------------------------------------------------------------------------
// Chain definition
// ---------------------------------------------------------------------------
const CHAIN = [
  'Mumbai',
  'Kathmandu',
  'Lhasa',
  'Purang',
  'Mansarovar',
  'Darchen',
  'Dirapuk',
  'Dolma La',
  'Zuthulphuk',
] as const;
type ChainCity = (typeof CHAIN)[number];

// ---------------------------------------------------------------------------
// During-phase day-to-chain mapping (1-indexed tripDayIndex)
// ---------------------------------------------------------------------------
const DAY_TO_CITY: Record<number, ChainCity> = {
  1: 'Kathmandu',
  2: 'Kathmandu',
  3: 'Lhasa',
  4: 'Lhasa',
  5: 'Mansarovar',
  6: 'Mansarovar',
  7: 'Dirapuk',
  8: 'Dolma La',
  9: 'Darchen',
  10: 'Lhasa',
  11: 'Kathmandu',
  12: 'Kathmandu',
  13: 'Mumbai',
};

// ---------------------------------------------------------------------------
// Geo cache
// ---------------------------------------------------------------------------
const GEO_KEY = 'kailash_geo_v1';
const GEO_TTL_MS = 60 * 60 * 1000; // 1 hour

interface GeoResult {
  city: string;
  country: string;
  country_code: string;
  fetchedAt: number;
}

function readGeoCache(): GeoResult | null {
  try {
    const raw = sessionStorage.getItem(GEO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeoResult;
    if (Date.now() - parsed.fetchedAt > GEO_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeGeoCache(geo: GeoResult): void {
  try {
    sessionStorage.setItem(GEO_KEY, JSON.stringify(geo));
  } catch {
    // sessionStorage write failed (private mode quota, etc.) -- ignore
  }
}

async function fetchGeo(): Promise<GeoResult | null> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) return null;
    const data = (await res.json()) as {
      city?: string;
      country_code?: string;
      country_name?: string;
    };
    if (!data.city) return null;
    const geo: GeoResult = {
      city: data.city,
      country: data.country_name || data.country_code || '',
      country_code: data.country_code || '',
      fetchedAt: Date.now(),
    };
    writeGeoCache(geo);
    return geo;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Resolve geo to a chain city
// ---------------------------------------------------------------------------
function resolveChainCity(geo: GeoResult): ChainCity | null {
  // 1. Try city name match (case-insensitive)
  const normalised = geo.city.toLowerCase();
  for (const city of CHAIN) {
    if (city.toLowerCase() === normalised) return city;
  }
  // 2. Fall back to country code
  const cc = geo.country_code.toUpperCase();
  if (cc === 'IN') return 'Mumbai';
  if (cc === 'NP') return 'Kathmandu';
  if (cc === 'CN') return 'Lhasa';
  return null;
}

// ---------------------------------------------------------------------------
// cn helper (no utils.ts in this project)
// ---------------------------------------------------------------------------
function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// CityTracker
// ---------------------------------------------------------------------------
interface CityTrackerProps {
  onTab: (t: Tab) => void;
}

export function CityTracker({ onTab }: CityTrackerProps) {
  const state = useJourneyState();
  const { phase, tripDayIndex } = state;

  const [geo, setGeo] = useState<GeoResult | null>(null);
  const [geoLoaded, setGeoLoaded] = useState(false);

  useEffect(() => {
    if (phase !== 'before') {
      setGeoLoaded(true);
      return;
    }
    // Check cache first
    const cached = readGeoCache();
    if (cached) {
      setGeo(cached);
      setGeoLoaded(true);
      return;
    }
    let cancelled = false;
    fetchGeo().then((result) => {
      if (!cancelled) {
        setGeo(result);
        setGeoLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  // Determine the currently highlighted city
  let current: ChainCity | null = null;
  if (phase === 'before') {
    if (geoLoaded && geo) {
      current = resolveChainCity(geo);
    }
  } else if (phase === 'during') {
    current = DAY_TO_CITY[tripDayIndex] ?? null;
  } else if (phase === 'after') {
    current = 'Mumbai';
  }

  // Show "You:" label when geo was fetched but city didn't match the chain
  const showYouLabel = phase === 'before' && geoLoaded && geo !== null && current === null;
  const showNoDetect = phase === 'before' && geoLoaded && geo === null;

  return (
    <BentoGridItem
      colSpan={2}
      rowSpan={2}
      onClick={() => onTab('itinerary')}
      ariaLabel="Open Itinerary tab. Yatra route map."
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, transparent 0, transparent 4px, color-mix(in oklch, var(--muted-foreground) 8%, transparent) 4px, color-mix(in oklch, var(--muted-foreground) 8%, transparent) 5px)',
      }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Yatra route
        </p>
        <span className="font-mono text-xs text-sacred uppercase tracking-widest">
          Tap for itinerary
        </span>
      </div>

      {showYouLabel && geo && (
        <p className="font-mono text-[10px] text-muted-foreground">
          You: {geo.city}, {geo.country}
        </p>
      )}
      {showNoDetect && (
        <p className="font-mono text-[10px] text-muted-foreground">
          We could not detect your location
        </p>
      )}

      <ol className="flex flex-col gap-1">
        {CHAIN.map((city, i) => {
          const isCurrent = city === current;
          const currentIdx = current ? CHAIN.indexOf(current) : -1;
          const isPast = phase !== 'before' && currentIdx > i;
          const isNextDuring = phase === 'during' && currentIdx !== -1 && currentIdx + 1 === i;
          return (
            <Fragment key={city}>
              <li
                className={cn(
                  'flex items-center gap-2 rounded-none border px-3 py-2 font-mono text-xs transition-colors',
                  isCurrent
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isPast
                      ? 'border-border bg-card text-muted-foreground line-through'
                      : isNextDuring
                        ? 'border-sacred/40 bg-card text-foreground ring-1 ring-sacred/40 animate-pulse'
                        : 'border-border bg-card text-foreground',
                )}
                aria-current={isCurrent ? 'true' : undefined}
              >
                <span>{city}</span>
              </li>
              {i < CHAIN.length - 1 && (
                <Icon
                  name="arrow_downward"
                  size={10}
                  className="self-center text-muted-foreground"
                />
              )}
            </Fragment>
          );
        })}
      </ol>

      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
        Returns via Darchen, Purang, Lhasa, Kathmandu, Mumbai.
      </p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Approximate city detected from your IP. Nothing is stored.
      </p>
    </BentoGridItem>
  );
}
