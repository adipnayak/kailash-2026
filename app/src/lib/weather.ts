/**
 * Open-Meteo daily forecast fetcher with hourly refresh + climatology fallback.
 *
 * Open-Meteo's forecast horizon is 16 days. For trip dates within that window
 * we return live forecast data; for dates further out (or on network failure)
 * we fall back to the day's static `weather` block from trip-data.ts.
 *
 * Data is cached in-memory keyed by (date, lat, lng) for 1 hour so a single
 * card render doesn't trigger N parallel fetches, and a page idle longer than
 * 1 hour will refetch on next access.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useEffect, useState } from 'react';
import type { TripDay } from './trip-data';
import { getDayRoute } from './day-routes';

export interface DailyWeather {
  temp_high: number;
  temp_low: number;
  rain_pct: number;
  wind_kmh: number;
  uv: number;
  weather_code?: number;
  source: 'climatology' | 'forecast';
  /** Unix ms the forecast was fetched, if source === 'forecast'. */
  fetchedAt?: number;
}

// ---------------------------------------------------------------------------
// Precip type derivation
// ---------------------------------------------------------------------------

export type PrecipType = 'rain' | 'snow' | 'storm';

export function precipTypeFromCode(code: number | undefined | null): PrecipType {
  if (typeof code !== 'number') return 'rain';
  if (code >= 95 && code <= 99) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  return 'rain';
}

// ---------------------------------------------------------------------------
// LiveDayWeather shape -- unified surface for all 5 temp/weather UIs
// ---------------------------------------------------------------------------

export interface LiveDayWeather {
  temp_low: number;
  temp_high: number;
  precip_pct: number;
  precip_type: PrecipType;
  wind_kmh: number;
  uv: number;
  source: 'live' | 'climatology';
}

interface CacheEntry {
  weather: DailyWeather | null;
  fetchedAt: number;
  inFlight?: Promise<DailyWeather | null>;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const FORECAST_HORIZON_DAYS = 16;
const cache = new Map<string, CacheEntry>();

function cacheKey(dateIso: string, lat: number, lng: number): string {
  return dateIso + '|' + lat.toFixed(4) + '|' + lng.toFixed(4);
}

function daysFromToday(dateIso: string, now: Date): number {
  const target = new Date(dateIso + 'T12:00:00Z');
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const ms = target.getTime() - today.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

async function fetchOpenMeteo(
  dateIso: string,
  lat: number,
  lng: number,
): Promise<DailyWeather | null> {
  const url =
    'https://api.open-meteo.com/v1/forecast?' +
    new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      daily:
        'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,weather_code,snowfall_sum',
      timezone: 'auto',
      start_date: dateIso,
      end_date: dateIso,
    }).toString();
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      daily?: {
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        precipitation_probability_max?: number[];
        wind_speed_10m_max?: number[];
        uv_index_max?: number[];
        weather_code?: number[];
        snowfall_sum?: number[];
      };
    };
    const d = data.daily;
    if (!d || !d.temperature_2m_max?.length) return null;
    return {
      temp_high: Math.round(d.temperature_2m_max[0]),
      temp_low: Math.round(d.temperature_2m_min?.[0] ?? d.temperature_2m_max[0]),
      rain_pct: Math.round(d.precipitation_probability_max?.[0] ?? 0),
      wind_kmh: Math.round(d.wind_speed_10m_max?.[0] ?? 0),
      uv: Math.round(d.uv_index_max?.[0] ?? 0),
      weather_code: d.weather_code?.[0],
      source: 'forecast',
      fetchedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * Fetch live forecast (cached) or return null if out of forecast window
 * or on error. Callers should fall back to climatology when this returns null.
 */
export async function getLiveWeather(
  dateIso: string,
  lat: number,
  lng: number,
): Promise<DailyWeather | null> {
  const days = daysFromToday(dateIso, new Date());
  if (days < 0 || days > FORECAST_HORIZON_DAYS) return null;

  const k = cacheKey(dateIso, lat, lng);
  const cached = cache.get(k);
  if (cached) {
    if (cached.inFlight) return cached.inFlight;
    if (Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.weather;
  }

  const inFlight = fetchOpenMeteo(dateIso, lat, lng).then((w) => {
    cache.set(k, { weather: w, fetchedAt: Date.now() });
    return w;
  });
  cache.set(k, {
    weather: cached?.weather ?? null,
    fetchedAt: cached?.fetchedAt ?? 0,
    inFlight,
  });
  return inFlight;
}

/**
 * React hook: returns live weather when in forecast window, else null
 * (caller falls back to climatology). Refetches on mount + every 1 hour
 * while the component stays mounted.
 */
export function useLiveWeather(
  dateIso: string,
  lat: number,
  lng: number,
): DailyWeather | null {
  const [weather, setWeather] = useState<DailyWeather | null>(() => {
    const cached = cache.get(cacheKey(dateIso, lat, lng));
    return cached?.weather ?? null;
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const w = await getLiveWeather(dateIso, lat, lng);
      if (!cancelled) setWeather(w);
    };
    load();
    const tick = window.setInterval(load, CACHE_TTL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(tick);
    };
  }, [dateIso, lat, lng]);

  return weather;
}

// ---------------------------------------------------------------------------
// Climatology precip-type heuristic: high-altitude + freezing -> snow
// ---------------------------------------------------------------------------

function climatologyPrecipType(day: TripDay): PrecipType {
  if (
    day.altitude_peak >= 4500 &&
    (day.weather.temp_high <= 0 || day.weather.temp_low <= -5)
  ) {
    return 'snow';
  }
  return 'rain';
}

/**
 * Unified hook: returns live weather for a single trip day merged into the
 * LiveDayWeather shape, falling back to day.weather (climatology) when live
 * data is unavailable (outside forecast window or network failure).
 *
 * Consumers get a stable shape regardless of source. The 'source' field
 * distinguishes live vs climatology so confidence surfaces can display it.
 */
export function useLiveDayWeather(day: TripDay): LiveDayWeather {
  const route = getDayRoute(day.day - 1);
  const lat = route?.start.lat ?? 0;
  const lng = route?.start.lng ?? 0;
  const live = useLiveWeather(day.date, lat, lng);

  if (live) {
    return {
      temp_low: live.temp_low,
      temp_high: live.temp_high,
      precip_pct: live.rain_pct,
      precip_type: precipTypeFromCode(live.weather_code),
      wind_kmh: live.wind_kmh,
      uv: live.uv,
      source: 'live',
    };
  }

  return {
    temp_low: day.weather.temp_low,
    temp_high: day.weather.temp_high,
    precip_pct: day.weather.rain_pct,
    precip_type: climatologyPrecipType(day),
    wind_kmh: day.weather.wind_kmh,
    uv: day.weather.uv,
    source: 'climatology',
  };
}

/**
 * Aggregator hook: calls useLiveDayWeather for every trip day and returns
 * the overall coldest temp_low and warmest temp_high across all 13 days.
 * DAYS is a stable 13-entry array so hook call order is fixed.
 */
import { DAYS } from './trip-data';

export function useLiveTripExtremes(): { coldest: number; warmest: number } {
  // One hook call per day -- order is stable because DAYS is a module-level
  // constant array of exactly 13 entries. React rules of hooks are satisfied.
  const weathers = DAYS.map((d) => useLiveDayWeather(d));
  const coldest = Math.min(...weathers.map((w) => w.temp_low));
  const warmest = Math.max(...weathers.map((w) => w.temp_high));
  return { coldest, warmest };
}
