/**
 * WeatherConfidence.
 * Phase-aware weather card with Open-Meteo integration, confidence bar,
 * and static trip-weather summary.
 *
 * BEFORE: confidence bar + forecast values as caveat
 * DURING: today + tomorrow live forecasts (100% live, no confidence bar)
 * AFTER:  static trip-weather summary
 *
 * Anti-AI rule: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useState, useEffect, useRef } from 'react';
import { Thermometer, WindFilled, DropFilled, Sun } from '@aliimam/icons';
import { useJourneyState } from '../hooks/useJourneyState';
import gsap from 'gsap';

// ---------------------------------------------------------------------------
// Open-Meteo locations
// ---------------------------------------------------------------------------

interface Location {
  label: string;
  lat: number;
  lon: number;
  staticRange: { min: number; max: number };
}

const LOCATIONS: Location[] = [
  { label: 'Kathmandu',  lat: 27.7172, lon: 85.3240, staticRange: { min: 15, max: 28 } },
  { label: 'Lhasa',      lat: 29.6500, lon: 91.1000, staticRange: { min: 5,  max: 20 } },
  { label: 'Mansarovar', lat: 30.6700, lon: 81.4500, staticRange: { min: -2, max: 10 } },
];

// ---------------------------------------------------------------------------
// Confidence formula: D2D >= 17 -> 0%, D2D <= 3 -> 100%, linear in between
// ---------------------------------------------------------------------------

function computeConfidence(d2d: number): number {
  if (d2d >= 17) return 0;
  if (d2d <= 3)  return 100;
  return Math.round(((17 - d2d) / (17 - 3)) * 100);
}

// ---------------------------------------------------------------------------
// Open-Meteo types
// ---------------------------------------------------------------------------

interface WeatherPoint {
  location: string;
  tempMin: number;
  tempMax: number;
  windspeed: number;
  precipitation: number;
  weathercode: number;
}

// ---------------------------------------------------------------------------
// Cache helpers (1-hour TTL)
// ---------------------------------------------------------------------------

const CACHE_KEY = 'kailash_weather_v1';
const CACHE_TTL_MS = 60 * 60 * 1000;

interface CacheEntry {
  ts: number;
  data: WeatherPoint[];
}

function readCache(): WeatherPoint[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(data: WeatherPoint[]): void {
  try {
    const entry: CacheEntry = { ts: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // quota exceeded -- ignore
  }
}

// ---------------------------------------------------------------------------
// Fetch Open-Meteo for a single location (today only)
// ---------------------------------------------------------------------------

async function fetchLocation(loc: Location): Promise<WeatherPoint> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${loc.lat}&longitude=${loc.lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode` +
    `&forecast_days=2&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await res.json() as { daily: Record<string, number[]> };
  const d = json.daily;
  return {
    location: loc.label,
    tempMin: Math.round(d['temperature_2m_min'][0]),
    tempMax: Math.round(d['temperature_2m_max'][0]),
    windspeed: Math.round(d['windspeed_10m_max'][0]),
    precipitation: Math.round(d['precipitation_sum'][0] * 10) / 10,
    weathercode: d['weathercode'][0],
  };
}

// ---------------------------------------------------------------------------
// Weathercode to brief label
// ---------------------------------------------------------------------------

function weatherLabel(code: number): string {
  if (code === 0)  return 'Clear';
  if (code <= 3)   return 'Partly cloudy';
  if (code <= 9)   return 'Fog';
  if (code <= 19)  return 'Drizzle';
  if (code <= 29)  return 'Rain';
  if (code <= 39)  return 'Snow';
  if (code <= 49)  return 'Fog';
  if (code <= 59)  return 'Drizzle';
  if (code <= 69)  return 'Rain';
  if (code <= 79)  return 'Snow';
  if (code <= 84)  return 'Rain showers';
  if (code <= 90)  return 'Snow showers';
  if (code <= 99)  return 'Thunderstorm';
  return 'Unknown';
}

// ---------------------------------------------------------------------------
// Chip sub-component
// ---------------------------------------------------------------------------

interface ChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function Chip({ icon, label, value }: ChipProps) {
  return (
    <div className="flex items-center gap-1.5 rounded border border-border bg-background px-3 py-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground font-mono text-xs">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Weather card for one location
// ---------------------------------------------------------------------------

interface WeatherCardProps {
  point: WeatherPoint;
  badge?: string;
}

function WeatherCard({ point, badge }: WeatherCardProps) {
  return (
    <div className="rounded border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground text-sm">{point.location}</span>
        {badge && (
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{badge}</span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{weatherLabel(point.weathercode)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip
          icon={<Thermometer size={12} />}
          label="Temp"
          value={`${point.tempMin} to ${point.tempMax} C`}
        />
        <Chip
          icon={<WindFilled size={12} />}
          label="Wind"
          value={`${point.windspeed} km/h`}
        />
        <Chip
          icon={<DropFilled size={12} />}
          label="Rain"
          value={`${point.precipitation} mm`}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static fallback (before phase, confidence too low or fetch failed)
// ---------------------------------------------------------------------------

function StaticRanges() {
  return (
    <div className="mt-4 space-y-3">
      {LOCATIONS.map((loc) => (
        <div key={loc.label} className="rounded border border-border bg-card p-4">
          <span className="font-medium text-foreground text-sm">{loc.label}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip
              icon={<Thermometer size={12} />}
              label="Expected"
              value={`${loc.staticRange.min} to ${loc.staticRange.max} C`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static trip summary (AFTER phase)
// ---------------------------------------------------------------------------

function AfterSummary() {
  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-muted-foreground uppercase tracking-widest font-mono">
        Trip weather summary
      </p>
      <p className="text-foreground">Range during trip: -5 C to 18 C</p>
      <div className="flex flex-wrap gap-3">
        <Chip icon={<Thermometer size={14} />} label="Range"      value="-5 C to 18 C" />
        <Chip icon={<WindFilled size={14} />}        label="Wind days"  value="2" />
        <Chip icon={<DropFilled size={14} />}     label="Rain days"  value="0" />
        <Chip icon={<Sun size={14} />}         label="Clear days" value="8 of 13" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confidence bar with GSAP fill animation
// ---------------------------------------------------------------------------

interface ConfidenceBarProps {
  pct: number;
  d2d: number;
}

function ConfidenceBar({ pct, d2d }: ConfidenceBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fillRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fillRef.current,
        { width: '0%' },
        { width: `${pct}%`, duration: 0.8, ease: 'power2.out', delay: 0.1 },
      );
    });
    return () => { ctx.revert(); };
  }, [pct]);

  const barColor =
    pct >= 70 ? 'bg-emerald-600' :
    pct >= 40 ? 'bg-accent' :
                'bg-destructive';

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          Forecast confidence
        </span>
        <span className="font-mono text-xs font-medium text-foreground">
          {pct}% ({d2d}d out)
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-border overflow-hidden">
        <div
          ref={fillRef}
          className={`h-full rounded-full ${barColor}`}
          style={{ width: 0 }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function WeatherConfidence() {
  const state = useJourneyState();
  const { phase, daysToDeparture } = state;

  const [weather, setWeather] = useState<WeatherPoint[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (phase === 'after') return;

    const cached = readCache();
    if (cached) {
      setWeather(cached);
      return;
    }

    setLoading(true);
    Promise.all(LOCATIONS.map((loc) => fetchLocation(loc)))
      .then((points) => {
        writeCache(points);
        setWeather(points);
      })
      .catch(() => {
        // fail silently -- fall back to static
      })
      .finally(() => {
        setLoading(false);
      });
  }, [phase]);

  const confidence = phase === 'before' ? computeConfidence(daysToDeparture) : 0;
  const ktm = weather?.find((w) => w.location === 'Kathmandu');

  return (
    <section
      data-section="weather-confidence"
      className="border-b border-border bg-card px-6 py-8"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="font-sans text-2xl font-medium text-foreground">Weather</h2>

        {/* ---------------------------------------------------------------- */}
        {/* AFTER phase                                                       */}
        {/* ---------------------------------------------------------------- */}
        {phase === 'after' && <AfterSummary />}

        {/* ---------------------------------------------------------------- */}
        {/* DURING phase: live today, no confidence bar                      */}
        {/* ---------------------------------------------------------------- */}
        {phase === 'during' && (
          <div className="mt-5 space-y-3">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Live forecast
            </p>
            {loading && (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
            {!loading && weather && weather.map((pt) => (
              <WeatherCard key={pt.location} point={pt} badge="today" />
            ))}
            {!loading && !weather && (
              <p className="text-sm text-muted-foreground">
                Forecast unavailable. Check conditions with your guide.
              </p>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* BEFORE phase: confidence bar + forecast caveat or static ranges  */}
        {/* ---------------------------------------------------------------- */}
        {phase === 'before' && (
          <>
            <ConfidenceBar pct={confidence} d2d={daysToDeparture} />

            {loading && (
              <p className="mt-5 text-sm text-muted-foreground">Loading...</p>
            )}

            {!loading && confidence > 0 && weather ? (
              <div className="mt-5 space-y-3">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                  {confidence}% confidence forecast
                </p>
                {weather.map((pt) => (
                  <WeatherCard key={pt.location} point={pt} />
                ))}
                {ktm && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {confidence}% confidence · Kathmandu {ktm.tempMin} to {ktm.tempMax} C
                  </p>
                )}
              </div>
            ) : (
              !loading && (
                <div className="mt-5">
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
                    Expected ranges (climatology)
                  </p>
                  <StaticRanges />
                </div>
              )
            )}
          </>
        )}
      </div>
    </section>
  );
}
