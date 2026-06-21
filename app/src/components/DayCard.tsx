/**
 * DayCard v2 -- Google-Calendar-inspired timeline-first design.
 *
 * Information architecture:
 *   A. Day Compression Mode (default): day badge + location + 3 chips + timeline highlights + expand
 *   B. Expanded view: Day Header + Summary Strip + Visual Timeline (hero 40%) +
 *      Weather chips + Exposure Conditions + Meals + Facilities + Operational Details (nested)
 *
 * Day 8 critical: border-2 border-destructive, CRITICAL DAY badge, auto-expand T-3+.
 * Phase-aware: T-3+ or during/after phase => Day 8 auto-expanded.
 * Q12b: 0 emojis. All icons are aliimam.
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes.
 * Mobile-first 375px. rounded-none everywhere (sharp corners).
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mountain,
  Clock,
  Wifi,
  WifiOff,
  Bed,
  CircleCheck,
  Thermometer,
  WindFilled,
  Sun,
  Utensils,
  ShowerHead,
  Toilet,
  GlassWater,
  AlarmClock,
  Heart,
  MapPin,
  TriangleAlert,
  CandleFilled,
  CloudRain,
  PlaneTakeoff,
  PlaneLanding,
  Bus,
  Coffee,
  Footprints,
  Flame,
  ChevronDown,
  ChevronUp,
  Check,
} from '@aliimam/icons';
import type { TripDay } from '../lib/trip-data';
import { mToFt } from '../lib/conversions';
import { computeJourneyState } from '../lib/journey-state';
import { DayMiniMap } from './aliimam/DayMiniMap';
import { getDayRoute } from '../lib/day-routes';
import { getDayAstro } from '../lib/astro';
import { MoonPhase } from './MoonPhase';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

function fmtDual(m: number): string {
  return m.toLocaleString('en-US') + ' m / ' + mToFt(m).toLocaleString('en-US') + ' ft';
}

// ---------------------------------------------------------------------------
// Day-type badge text
// ---------------------------------------------------------------------------

type DayBadgeType = 'TRANSIT' | 'LONG DAY' | 'REST' | 'PILGRIMAGE' | 'TREK' | 'CRITICAL DAY';

function getDayTypeBadge(day: TripDay): DayBadgeType {
  if (day.day === 8) return 'CRITICAL DAY';
  if (day.day_type === 'rest') return 'REST';
  if (day.day_type === 'holy') return 'PILGRIMAGE';
  if (day.day === 5) return 'LONG DAY';
  if ([7, 9].includes(day.day)) return 'TREK';
  return 'TRANSIT';
}

function dayTypeBadgeCls(badge: DayBadgeType): string {
  const base =
    'font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border rounded-none shrink-0';
  switch (badge) {
    case 'CRITICAL DAY':
      return cn(base, 'bg-destructive/10 border-destructive text-destructive');
    case 'PILGRIMAGE':
      return cn(base, 'bg-sacred/10 border-sacred text-sacred');
    case 'REST':
      return cn(base, 'bg-emerald/10 border-emerald text-emerald');
    case 'TREK':
      return cn(base, 'bg-primary/5 border-border text-foreground');
    case 'LONG DAY':
      return cn(base, 'bg-sacred/10 border-sacred/40 text-sacred');
    default:
      return cn(base, 'bg-muted border-border text-muted-foreground');
  }
}

// ---------------------------------------------------------------------------
// Connectivity icon + label
// ---------------------------------------------------------------------------

function ConnIcon({ status }: { status: TripDay['conn_status'] }) {
  if (status === 'offline') return <WifiOff size={12} className="text-destructive" />;
  if (status === 'intermittent') return <Wifi size={12} className="text-sacred" />;
  return <Wifi size={12} className="text-emerald" />;
}

function connLabel(status: TripDay['conn_status']): string {
  if (status === 'offline') return 'Offline';
  if (status === 'intermittent') return 'Limited';
  return 'Good Signal';
}

// ---------------------------------------------------------------------------
// Timeline event icon mapping
// ---------------------------------------------------------------------------

function TimelineIcon({ event }: { event: string }) {
  const e = event.toLowerCase();
  if (e.includes('flight') || e.includes('airport') || e.includes('ktm to lhasa') || e.includes('lhasa to ktm') || e.includes('lhasa to ali') || e.includes('ali to lhasa') || e.includes('ktm airport') || e.includes('lhasa gonggar')) {
    if (e.includes('arrival') || e.includes('landing') || e.includes('arrival')) return <PlaneLanding size={13} className="text-foreground" />;
    return <PlaneTakeoff size={13} className="text-foreground" />;
  }
  if (e.includes('drive') || e.includes('transfer') || e.includes('bus') || e.includes('darchen') || e.includes('lhasa to darchen') || e.includes('ali to mansarovar') || e.includes('mansarovar to darchen')) {
    return <Bus size={13} className="text-foreground" />;
  }
  if (e.includes('dinner') || e.includes('lunch') || e.includes('breakfast') || e.includes('meal')) {
    return <Utensils size={13} className="text-foreground" />;
  }
  if (e.includes('trek') || e.includes('parikrama') || e.includes('descen') || e.includes('yamadwar') || e.includes('dirapuk') || e.includes('zuthulphuk') || e.includes('mani wall') || e.includes('walk')) {
    return <Footprints size={13} className="text-foreground" />;
  }
  if (e.includes('check-in') || e.includes('hotel') || e.includes('arrival') || e.includes('suitcase') || e.includes('checkout')) {
    return <Bed size={13} className="text-foreground" />;
  }
  if (e.includes('puja') || e.includes('darshan') || e.includes('gompa') || e.includes('temple') || e.includes('snan') || e.includes('mandir') || e.includes('kora') || e.includes('dolma la')) {
    return <Flame size={13} className="text-sacred" />;
  }
  if (e.includes('coffee') || e.includes('tea')) {
    return <Coffee size={13} className="text-foreground" />;
  }
  if (e.includes('pass') || e.includes('summit') || e.includes('dolma')) {
    return <Mountain size={13} className="text-destructive" />;
  }
  if (e.includes('shower') || e.includes('wash') || e.includes('bath')) {
    return <ShowerHead size={13} className="text-foreground" />;
  }
  if (e.includes('wake') || e.includes('departure') || e.includes('pre-dawn')) {
    return <AlarmClock size={13} className="text-foreground" />;
  }
  if (e.includes('rest') || e.includes('sleep') || e.includes('free')) {
    return <Clock size={13} className="text-muted-foreground" />;
  }
  if (e.includes('signal') || e.includes('connectivity') || e.includes('wifi')) {
    return <Wifi size={13} className="text-foreground" />;
  }
  return <MapPin size={13} className="text-muted-foreground" />;
}

// ---------------------------------------------------------------------------
// Exposure conditions derivation
// ---------------------------------------------------------------------------

interface ExposureConditions {
  tempLabel: string;
  rainLabel: string;
  windLabel: string;
  uvLabel: string;
  recommended: string[];
}

function deriveExposure(day: TripDay): ExposureConditions {
  const w = day.weather;

  let tempLabel = 'Warm';
  if (w.temp_high >= 25) tempLabel = 'Warm';
  else if (w.temp_high >= 10) tempLabel = 'Mild';
  else if (w.temp_high >= 0) tempLabel = 'Cool';
  else tempLabel = 'Cold';

  let rainLabel = 'Dry';
  if (w.rain_pct > 50) rainLabel = 'Wet';
  else if (w.rain_pct >= 25) rainLabel = 'Showers';

  let windLabel = 'Calm';
  if (w.wind_kmh > 30) windLabel = 'Strong Wind';
  else if (w.wind_kmh >= 15) windLabel = 'Breezy';

  let uvLabel = 'Low UV';
  if (w.uv >= 8) uvLabel = 'High UV';
  else if (w.uv >= 5) uvLabel = 'Moderate UV';

  const recommended: string[] = [];
  if (tempLabel === 'Cool' || tempLabel === 'Cold') recommended.push('Warm Layers');
  if (rainLabel === 'Wet' || rainLabel === 'Showers') recommended.push('Rain Protection');
  if (uvLabel === 'High UV') recommended.push('Sun Protection');
  if (uvLabel === 'Moderate UV') recommended.push('Sun Protection');
  if (windLabel === 'Strong Wind') recommended.push('Wind Protection');
  if ((tempLabel === 'Cold' || tempLabel === 'Cool') && windLabel === 'Strong Wind') {
    if (!recommended.includes('Insulation')) recommended.push('Insulation');
  }
  if (recommended.length === 0) recommended.push('Light Layers');

  return { tempLabel, rainLabel, windLabel, uvLabel, recommended };
}

// ---------------------------------------------------------------------------
// Medical / gear heuristic for carry_critical
// ---------------------------------------------------------------------------

const MED_KEYWORDS = ['ibuprofen', 'ors', 'diamox', 'meds', 'medical', 'tablet', 'drug', 'altitude med'];
const GEAR_KEYWORDS = ['headlamp', 'sunglasses', 'gloves', 'poles', 'compeed', 'powerbank', 'power bank', 'pack liner', 'zip-lock', 'spare', 'batteries', 'tp roll', 'wet wipes'];

function isMed(item: string): boolean {
  const l = item.toLowerCase();
  return MED_KEYWORDS.some((k) => l.includes(k));
}
function isGear(item: string): boolean {
  const l = item.toLowerCase();
  return GEAR_KEYWORDS.some((k) => l.includes(k));
}

// ---------------------------------------------------------------------------
// A. COMPRESSED VIEW
// ---------------------------------------------------------------------------

function CompressedView({
  day,
  index = 0,
  onToggle,
}: {
  day: TripDay;
  index?: number;
  onToggle: () => void;
}) {
  const badge = getDayTypeBadge(day);
  const isCritical = day.day === 8;
  // Show up to 4-5 timeline items as highlights
  const highlights = (day.timeline || []).slice(0, 5);
  const route = getDayRoute(index);

  return (
    <button
      type="button"
      className="w-full text-left p-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      onClick={onToggle}
      aria-label={`Day ${day.day} - ${day.location}. Tap to expand.`}
    >
      {/* Row 1: DAY badge + type badge + expand arrow */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'font-mono text-[11px] font-semibold px-2 py-0.5 rounded-none border uppercase tracking-widest',
              isCritical
                ? 'bg-destructive text-destructive-foreground border-destructive'
                : 'bg-foreground text-background border-foreground',
            )}
          >
            DAY {day.day}
          </span>
          <span className={dayTypeBadgeCls(badge)}>{badge}</span>
        </div>
        <ChevronDown size={16} className="text-muted-foreground shrink-0" />
      </div>

      {/* Row 2: Location + date */}
      <div className="mb-2">
        <p className="text-sm font-medium text-foreground leading-snug">{day.location}</p>
        <p className="font-mono text-[11px] text-muted-foreground">
          {day.weekday} {day.date}
        </p>
      </div>

      {/* Row 2b: Mini-map (start -> end arc for this day) */}
      {route && (
        <div className="mb-2">
          <DayMiniMap
            start={route.start}
            end={route.end}
            arcColor={isCritical ? 'var(--destructive)' : 'var(--sacred)'}
            width={240}
            height={70}
          />
        </div>
      )}

      {/* Row 3: Status chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {/* Temperature */}
        <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground">
          <Thermometer size={10} className="shrink-0 text-muted-foreground" />
          {day.weather.temp_low}-{day.weather.temp_high}C
        </span>
        {/* Connectivity */}
        <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground">
          <ConnIcon status={day.conn_status} />
          {connLabel(day.conn_status)}
        </span>
        {/* Altitude */}
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-none border px-2 py-0.5 font-mono text-[10px]',
            isCritical
              ? 'border-destructive bg-destructive/10 text-destructive'
              : 'border-border bg-muted text-foreground',
          )}
        >
          <Mountain size={10} className="shrink-0 text-muted-foreground" />
          {day.altitude_peak.toLocaleString('en-US')}m
        </span>
      </div>

      {/* Row 4: Timeline highlights (compact) */}
      <ol className="space-y-1">
        {highlights.map((ev, i) => {
          // Extract time portion only (before any space after time part)
          const timePart = ev.time.split('-')[0].trim();
          return (
            <li key={i} className="flex items-start gap-2">
              <span className="font-mono text-[10px] text-muted-foreground w-[40px] shrink-0 pt-px">
                {timePart}
              </span>
              <span className="text-[11px] text-foreground leading-tight line-clamp-1">{ev.event}</span>
            </li>
          );
        })}
      </ol>
    </button>
  );
}

// ---------------------------------------------------------------------------
// B1. DAY HEADER
// ---------------------------------------------------------------------------

function DayHeader({ day }: { day: TripDay; index?: number }) {
  const badge = getDayTypeBadge(day);
  const isCritical = day.day === 8;
  const isPilgrimage = day.day_type === 'holy';

  return (
    <div className="px-4 pt-4 pb-3 border-b border-border">
      {/* Day badge row */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'font-mono text-[11px] font-semibold px-2 py-0.5 rounded-none border uppercase tracking-widest',
              isCritical
                ? 'bg-destructive text-destructive-foreground border-destructive'
                : 'bg-foreground text-background border-foreground',
            )}
          >
            DAY {day.day}
          </span>
          {day.badge && (
            <span className={dayTypeBadgeCls(badge)}>{day.badge}</span>
          )}
          {!day.badge && <span className={dayTypeBadgeCls(badge)}>{badge}</span>}
        </div>
        {isPilgrimage && day.sacred_label && (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-sacred uppercase tracking-widest">
            <Heart size={10} className="shrink-0" />
            SACRED
          </span>
        )}
      </div>

      {/* Location */}
      <p className="text-base font-medium text-foreground leading-tight">{day.location}</p>
      <p className="font-mono text-[11px] text-muted-foreground mb-2">
        {day.weekday} {day.date}
      </p>

      {/* Day 8 critical warn */}
      {isCritical && (
        <div className="flex items-start gap-2 bg-destructive/5 border border-destructive px-3 py-2 mb-2">
          <TriangleAlert size={13} className="text-destructive shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] text-destructive font-medium">
            22 km on foot. 5,630 m pass. 04:00 wake. No bailout after the pass.
          </p>
        </div>
      )}

      {/* Status badges row */}
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground">
          <ConnIcon status={day.conn_status} />
          {connLabel(day.conn_status)}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-none border px-2 py-0.5 font-mono text-[10px]',
            isCritical
              ? 'border-destructive bg-destructive/10 text-destructive'
              : 'border-border bg-muted text-foreground',
          )}
        >
          <Mountain size={10} className={cn('shrink-0', isCritical ? 'text-destructive' : 'text-muted-foreground')} />
          {day.altitude_peak.toLocaleString('en-US')}m
        </span>
        <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground">
          <Bed size={10} className="shrink-0 text-muted-foreground" />
          Sleep {day.altitude_sleep.toLocaleString('en-US')}m
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// B2. SUMMARY STRIP
// ---------------------------------------------------------------------------

function SummaryStrip({ day }: { day: TripDay }) {
  const isCritical = day.day === 8;
  const chips: Array<{ icon: React.ReactNode; value: string; red?: boolean }> = [];

  // Altitude
  chips.push({
    icon: <Mountain size={12} className={cn('shrink-0', isCritical ? 'text-destructive' : 'text-muted-foreground')} />,
    value: isCritical
      ? fmtDual(day.altitude_peak)
      : day.altitude_peak.toLocaleString('en-US') + 'm',
    red: isCritical,
  });

  // Walk hours
  if (day.timing.walk_h > 0 || day.timing.active_trek_h > 0) {
    const walkH = day.timing.walk_h + day.timing.active_trek_h;
    const label = day.timing.active_trek_h > 0 ? walkH + 'h trek' : walkH + 'h walk';
    chips.push({ icon: <Footprints size={12} className="shrink-0 text-muted-foreground" />, value: label });
  }

  // Transit: only if significant rest but no trek (transit day)
  if (day.timing.rest_h >= 4 && day.timing.active_trek_h === 0 && day.timing.walk_h <= 1) {
    chips.push({ icon: <Bus size={12} className="shrink-0 text-muted-foreground" />, value: day.timing.rest_h + 'h transit' });
  }

  // Connectivity
  chips.push({
    icon: <ConnIcon status={day.conn_status} />,
    value: connLabel(day.conn_status),
  });

  // Temperature
  chips.push({
    icon: <Thermometer size={12} className="shrink-0 text-muted-foreground" />,
    value: day.weather.temp_low + '-' + day.weather.temp_high + 'C',
  });

  // Stay
  if (day.stay) {
    chips.push({
      icon: <Bed size={12} className="shrink-0 text-muted-foreground" />,
      value: day.stay.split(' ').slice(0, 2).join(' '),
    });
  }

  return (
    <div className="px-4 py-3 border-b border-border">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip, i) => (
          <span
            key={i}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-none border px-2 py-1 font-mono text-[11px]',
              chip.red
                ? 'border-destructive bg-destructive/10 text-destructive'
                : 'border-border bg-muted text-foreground',
            )}
          >
            {chip.icon}
            {chip.value}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// B3. VISUAL TIMELINE (Google Calendar Day View style)
// ---------------------------------------------------------------------------

function VisualTimeline({ day }: { day: TripDay }) {
  const events = day.timeline || [];
  if (events.length === 0) return null;

  // Parse minutes from "HH:MM" (use first time if range like "08:30-13:30")
  function parseMinutes(timeStr: string): number | null {
    const part = timeStr.split('-')[0].trim();
    const m = part.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }

  // Compute durations: from start to next event start
  const parsedEvents = events.map((ev, i) => {
    const startMin = parseMinutes(ev.time);
    const nextStartMin = i < events.length - 1 ? parseMinutes(events[i + 1].time) : null;
    const durationMin =
      startMin !== null && nextStartMin !== null && nextStartMin > startMin
        ? nextStartMin - startMin
        : null;
    const isShortStop = durationMin !== null && durationMin <= 30;
    return { ...ev, startMin, durationMin, isShortStop };
  });

  const isCritical = day.day === 8;

  return (
    <div className="px-4 py-4 border-b border-border">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        Timeline
      </p>
      <div className="relative">
        {/* Vertical rail */}
        <div className="absolute left-[52px] top-0 bottom-0 w-px bg-border" />

        <ol className="space-y-0">
          {parsedEvents.map((ev, i) => {
            const timePart = ev.time.split('-')[0].trim();
            const isLast = i === parsedEvents.length - 1;
            const isHighlight = isCritical && (ev.event.toLowerCase().includes('dolma la') || ev.event.toLowerCase().includes('pass'));
            const hasDuration = ev.durationMin !== null && ev.durationMin > 30;

            return (
              <li key={i} className="relative flex items-start gap-0">
                {/* Time column */}
                <span className="font-mono text-[10px] text-muted-foreground w-[52px] shrink-0 pt-1 text-right pr-3 leading-none">
                  {timePart}
                </span>

                {/* Dot + rail */}
                <div className="relative flex flex-col items-center mr-3">
                  {/* Dot */}
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-none border z-10 mt-1 shrink-0',
                      isHighlight
                        ? 'bg-destructive border-destructive'
                        : hasDuration
                        ? 'bg-foreground border-foreground'
                        : 'bg-background border-border',
                    )}
                  />
                  {/* Duration bar (colored vertical segment) */}
                  {hasDuration && !isLast && (
                    <div
                      className={cn(
                        'w-0.5 mt-0',
                        isHighlight ? 'bg-destructive' : 'bg-foreground',
                      )}
                      style={{
                        height: Math.max(20, Math.min(60, (ev.durationMin || 30) / 2)) + 'px',
                      }}
                    />
                  )}
                </div>

                {/* Event content */}
                <div
                  className={cn(
                    'flex-1 pb-3 pt-0.5',
                    isHighlight ? 'text-destructive' : 'text-foreground',
                  )}
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <TimelineIcon event={ev.event} />
                    <span
                      className={cn(
                        'text-[12px] leading-snug',
                        isHighlight ? 'font-semibold text-destructive' : 'text-foreground',
                      )}
                    >
                      {ev.event}
                    </span>
                  </div>
                  {hasDuration && ev.durationMin && (
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      {ev.durationMin >= 60
                        ? Math.round(ev.durationMin / 60 * 10) / 10 + 'h'
                        : ev.durationMin + 'min'}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// B4. WEATHER SNAPSHOT
// ---------------------------------------------------------------------------

function WeatherChips({ day }: { day: TripDay }) {
  const w = day.weather;
  const chips: Array<{ icon: React.ReactNode; value: string }> = [
    { icon: <Thermometer size={11} className="shrink-0 text-muted-foreground" />, value: w.temp_high + 'C' },
    { icon: <CloudRain size={11} className="shrink-0 text-muted-foreground" />, value: w.rain_pct + '%' },
    { icon: <WindFilled size={11} className="shrink-0 text-muted-foreground" />, value: w.wind_kmh + ' km/h' },
    { icon: <Sun size={11} className="shrink-0 text-muted-foreground" />, value: 'UV ' + w.uv },
  ];
  return (
    <div className="px-4 py-3 border-b border-border">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Weather
      </p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground"
          >
            {chip.icon}
            {chip.value}
          </span>
        ))}
        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground self-center px-1">
          {w.source}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// B4b. SKY -- sunrise / sunset / moon phase
// ---------------------------------------------------------------------------

function SkyChips({ day }: { day: TripDay }) {
  const route = getDayRoute(day.day - 1);
  if (!route) return null;
  const { lat, lng } = route.start;
  const astro = getDayAstro(day.date, lat, lng);
  return (
    <div className="px-4 py-3 border-b border-border">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Sky
      </p>
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
          <Sun size={11} className="shrink-0 text-sacred" />
          Sunrise {astro.sunrise}
        </span>
        <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
          <Sun size={11} className="shrink-0 text-muted-foreground" />
          Sunset {astro.sunset}
        </span>
        <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
          <MoonPhase phase={astro.moonPhase} size={12} />
          {astro.moonPhaseLabel}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// B5. EXPOSURE CONDITIONS
// ---------------------------------------------------------------------------

function ExposureConditions({ day }: { day: TripDay }) {
  const exp = deriveExposure(day);
  return (
    <div className="px-4 py-3 border-b border-border">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Conditions Today
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {[exp.tempLabel, exp.rainLabel, exp.windLabel, exp.uvLabel].map((label) => (
          <span
            key={label}
            className="inline-flex items-center rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground"
          >
            {label}
          </span>
        ))}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
        Recommended
      </p>
      <div className="flex flex-wrap gap-1.5">
        {exp.recommended.map((rec) => (
          <span
            key={rec}
            className="inline-flex items-center gap-1 rounded-none border border-emerald/30 bg-emerald/10 px-2 py-0.5 font-mono text-[11px] text-emerald"
          >
            <Check size={10} className="shrink-0" />
            {rec}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// B6. MEALS CHIPS
// ---------------------------------------------------------------------------

function MealsChips({ day }: { day: TripDay }) {
  const f = day.food;
  const meals: Array<{ icon: React.ReactNode; label: string; value: string }> = [
    { icon: <Coffee size={11} className="shrink-0 text-muted-foreground" />, label: 'B', value: f.breakfast },
    { icon: <Utensils size={11} className="shrink-0 text-muted-foreground" />, label: 'L', value: f.lunch },
    { icon: <Utensils size={11} className="shrink-0 text-muted-foreground" />, label: 'D', value: f.dinner },
  ];

  // Short meal name: first segment before period or comma
  function shortMeal(s: string): string {
    return s.split(/[.,]/)[0].trim();
  }

  return (
    <div className="px-4 py-3 border-b border-border">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Meals
      </p>
      <div className="flex flex-wrap gap-1.5">
        {meals.map((m) => (
          <span
            key={m.label}
            className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground"
          >
            {m.icon}
            {shortMeal(m.value)}
          </span>
        ))}
        {f.daypack_snacks && f.daypack_snacks.toLowerCase() !== 'none' && f.daypack_snacks.toLowerCase() !== 'none needed.' && (
          <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
            <MapPin size={11} className="shrink-0 text-muted-foreground" />
            Snacks
          </span>
        )}
        {f.hydration && (
          <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
            <GlassWater size={11} className="shrink-0 text-muted-foreground" />
            {f.hydration}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// B7. FACILITIES
// ---------------------------------------------------------------------------

function FacilitiesBadges({ day }: { day: TripDay }) {
  const b = day.bathroom;

  const hasHotShower = b.shower.toLowerCase().includes('hot');
  const hasShower = b.shower.toLowerCase() !== 'none' && !b.shower.toLowerCase().includes('no shower');
  const isWestern = b.type.toLowerCase().includes('western');
  const hasSafeWater = b.water.toLowerCase().includes('hot') || b.water.toLowerCase().includes('safe') || b.water.toLowerCase().includes('24 h');
  const hasWifi = day.conn_status !== 'offline';

  const badges: Array<{ icon: React.ReactNode; label: string; present: boolean }> = [
    {
      icon: <ShowerHead size={11} className="shrink-0" />,
      label: hasHotShower ? 'Hot Shower' : hasShower ? 'Shower' : 'No Shower',
      present: hasShower,
    },
    {
      icon: <Toilet size={11} className="shrink-0" />,
      label: isWestern ? 'Western Toilet' : 'Field / Pit',
      present: isWestern,
    },
    {
      icon: <GlassWater size={11} className="shrink-0" />,
      label: hasSafeWater ? 'Hot Water' : 'No Safe Water',
      present: hasSafeWater,
    },
    {
      icon: <Wifi size={11} className="shrink-0" />,
      label: hasWifi ? connLabel(day.conn_status) + ' WiFi' : 'No Signal',
      present: hasWifi,
    },
  ];

  return (
    <div className="px-4 py-3 border-b border-border">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Facilities
      </p>
      <div className="flex flex-wrap gap-1.5">
        {badges.map((badge) => (
          <span
            key={badge.label}
            className={cn(
              'inline-flex items-center gap-1 rounded-none border px-2 py-0.5 font-mono text-[11px]',
              badge.present
                ? 'border-emerald/30 bg-emerald/10 text-emerald'
                : 'border-border bg-muted text-muted-foreground line-through',
            )}
          >
            {badge.icon}
            {badge.label}
          </span>
        ))}
      </div>
      {b.notes && (
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">{b.notes}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// B8. OPERATIONAL DETAILS (nested expand)
// ---------------------------------------------------------------------------

function OperationalDetails({ day }: { day: TripDay }) {
  const [open, setOpen] = useState(false);
  const f = day.food;

  const meds = day.carry_critical.filter(isMed);
  const gear = day.carry_critical.filter(isGear);
  const other = day.carry_critical.filter((item) => !isMed(item) && !isGear(item));

  return (
    <div className="px-4 py-3 border-b border-border">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Operational Details
        </span>
        {open ? (
          <ChevronUp size={14} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-muted-foreground shrink-0" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="op-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-4">
              {/* Hydration */}
              {f.hydration && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Hydration</p>
                  <p className="text-xs text-foreground">{f.hydration}</p>
                </div>
              )}

              {/* Medical carry */}
              {meds.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Medical</p>
                  <ul className="space-y-1">
                    {meds.map((m, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                        <Check size={10} className="mt-0.5 shrink-0 text-muted-foreground" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gear carry */}
              {gear.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Gear</p>
                  <ul className="space-y-1">
                    {gear.map((g, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                        <Check size={10} className="mt-0.5 shrink-0 text-muted-foreground" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Other carry critical */}
              {other.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Pack</p>
                  <ul className="space-y-1">
                    {other.map((o, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                        <Check size={10} className="mt-0.5 shrink-0 text-muted-foreground" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Food specifics */}
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Food Detail</p>
                <div className="space-y-1 text-xs text-foreground">
                  <p><span className="text-muted-foreground">B:</span> {f.breakfast}</p>
                  <p><span className="text-muted-foreground">L:</span> {f.lunch}</p>
                  <p><span className="text-muted-foreground">D:</span> {f.dinner}</p>
                  {f.daypack_snacks && <p><span className="text-muted-foreground">Snacks:</span> {f.daypack_snacks}</p>}
                </div>
              </div>

              {/* Contingency / timing notes */}
              {day.timing.notes && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Notes</p>
                  <p className="text-xs text-foreground">{day.timing.notes}</p>
                </div>
              )}

              {/* Spiritual focus */}
              {day.spiritual_focus && (
                <div className="border-l-2 border-sacred pl-3 bg-sacred/5 py-2 pr-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-sacred mb-1 flex items-center gap-1">
                    <CandleFilled size={10} />
                    {day.spiritual_focus.title}
                  </p>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {day.spiritual_focus.body}
                  </p>
                </div>
              )}

              {/* Stay footer */}
              <div className="flex flex-wrap gap-3 pt-1 border-t border-border">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-foreground">
                  <Bed size={11} className="text-muted-foreground shrink-0" />
                  {day.stay}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-foreground">
                  <ShowerHead size={11} className="text-muted-foreground shrink-0" />
                  {day.bathing}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EXPANDED VIEW (B1 through B8)
// ---------------------------------------------------------------------------

function ExpandedView({ day, onToggle }: { day: TripDay; index?: number; onToggle: () => void }) {
  return (
    <div>
      {/* Collapse button */}
      <button
        type="button"
        className="w-full flex items-center justify-end gap-1 px-4 py-2 border-b border-border text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={onToggle}
        aria-label="Collapse day"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest">Collapse</span>
        <ChevronUp size={14} />
      </button>
      <DayHeader day={day} />
      <SummaryStrip day={day} />
      <VisualTimeline day={day} />
      <WeatherChips day={day} />
      <SkyChips day={day} />
      <ExposureConditions day={day} />
      <MealsChips day={day} />
      <FacilitiesBadges day={day} />
      <OperationalDetails day={day} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPLETED BADGE (Day 8 post-trip)
// ---------------------------------------------------------------------------

function CompletedBadge() {
  return (
    <div className="px-4 pt-3 pb-0">
      <span className="inline-flex items-center gap-1 rounded-none bg-emerald/10 border border-emerald/30 px-2 py-0.5 font-mono text-[10px] text-emerald uppercase tracking-wide">
        <CircleCheck size={10} />
        Completed · 5,630 m crossed
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DAYCARD (main export)
// ---------------------------------------------------------------------------

const LS_PREFIX = 'kailash_daycard_v2_';

interface DayCardProps {
  day: TripDay;
  index?: number;
  expanded?: boolean;
  onToggle?: () => void;
  /** Legacy prop: keep same call-site compat with ItineraryTab */
  isToday?: boolean;
}

export function DayCard({ day, index = 0, expanded: controlledExpanded, onToggle, isToday }: DayCardProps) {
  const isCritical = day.day === 8;

  // Journey state for phase-aware expansion logic
  const stateRef = useRef(computeJourneyState());
  const js = stateRef.current;

  // Day 8 auto-expand: T-3 onward, during Day 8+, or after
  const day8AutoExpand =
    isCritical &&
    (js.daysToDeparture <= 3 ||
      (js.phase === 'during' && js.tripDayIndex >= 8) ||
      js.phase === 'after');

  const lsKey = LS_PREFIX + day.day;

  function getInitialExpanded(): boolean {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(lsKey);
      if (stored !== null) return stored === 'true';
    }
    if (day8AutoExpand) return true;
    return false;
  }

  const [internalExpanded, setInternalExpanded] = useState<boolean>(getInitialExpanded);
  const expanded = controlledExpanded ?? internalExpanded;

  const handleToggle =
    onToggle ??
    (() => {
      const next = !internalExpanded;
      setInternalExpanded(next);
      if (typeof window !== 'undefined') {
        localStorage.setItem(lsKey, String(next));
      }
    });

  const showCompleted = isCritical && js.phase === 'after';

  return (
    <article
      className={cn(
        'border bg-card overflow-hidden',
        isCritical ? 'border-2 border-destructive' : 'border-border',
        isToday && !isCritical ? 'border-primary' : '',
      )}
      data-day={day.day}
    >
      {/* Completed overlay for Day 8 post-trip */}
      {showCompleted && <CompletedBadge />}

      {/* COMPRESSED: default collapsed view */}
      {!expanded && (
        <CompressedView day={day} index={index} onToggle={handleToggle} />
      )}

      {/* EXPANDED: full detail view */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <ExpandedView day={day} index={index} onToggle={handleToggle} />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
