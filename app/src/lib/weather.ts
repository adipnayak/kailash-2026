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

export interface DailyWeather {
  temp_high: number;
  temp_low: number;
  rain_pct: number;
  wind_kmh: number;
  uv: number;
  source: 'climatology' | 'forecast';
  /** Unix ms the forecast was fetched, if source === 'forecast'. */
  fetchedAt?: number;
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
        'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max',
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
