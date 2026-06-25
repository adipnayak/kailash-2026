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

import { Icon } from './Icon';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TripDay, BagId, BagStateTag } from '../lib/trip-data';
import { mToFt } from '../lib/conversions';
import { computeJourneyState } from '../lib/journey-state';
import { DIAMOX_REGIME_BY_DATE, describeDose } from '../lib/diamox-regime';
import { lazy, Suspense } from 'react';
import { getDayRoute, ALL_TRIP_STOPS } from '../lib/day-routes';
import { getDayStops, haversineKm, fmtKm, modeLabel } from '../lib/day-stops';

// Lazy-load the Leaflet-based real map so its ~150 KB chunk only loads
// when the user actually opens the Itinerary tab + scrolls past a day.
const ItineraryDayMap = lazy(() =>
  import('./ItineraryDayMap').then((m) => ({ default: m.ItineraryDayMap })),
);

// ---------------------------------------------------------------------------
// useInView -- fires once when the element enters the viewport.
// rootMargin: '200px' pre-loads the map just before the user reaches it.
// ---------------------------------------------------------------------------
function useInView(rootMargin = '200px 0px'): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (inView) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  // rootMargin is a constant string -- safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, inView];
}
import { getDayAstro } from '../lib/astro';
import { MoonPhase } from './MoonPhase';
import { useLiveDayWeather, type PrecipType } from '../lib/weather';

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
// Bag state helpers
// ---------------------------------------------------------------------------

function bagDisplay(id: BagId): string {
  switch (id) {
    case 'main': return 'Main suitcase';
    case 'duffle': return 'YPO duffle';
    case 'daypack-personal': return 'Personal daypack';
    case 'daypack-ypo': return 'YPO daypack';
  }
}

function iconForBagState(s: BagStateTag): string {
  switch (s) {
    case 'with-you': return 'check_circle';
    case 'with-porters': return 'hiking';
    case 'stowed-locked': return 'lock';
    case 'stowed': return 'inventory_2';
    case 'in-transit': return 'flight';
    case 'not-yet': return 'schedule';
  }
}

function bagStateLabel(s: BagStateTag): string {
  switch (s) {
    case 'with-you': return 'WITH YOU';
    case 'with-porters': return 'WITH PORTERS';
    case 'stowed-locked': return 'STOWED LOCKED';
    case 'stowed': return 'STOWED';
    case 'in-transit': return 'IN TRANSIT';
    case 'not-yet': return 'NOT YET DISTRIBUTED';
  }
}

function bagStateBadgeClass(s: BagStateTag): string {
  switch (s) {
    case 'with-you': return 'bg-emerald text-background border border-emerald';
    case 'with-porters': return 'bg-sacred text-sacred-foreground border border-sacred';
    case 'stowed-locked': return 'bg-muted text-muted-foreground border border-border';
    case 'stowed': return 'bg-muted text-muted-foreground border border-border';
    case 'in-transit': return 'bg-sacred/30 text-foreground border border-sacred/40';
    case 'not-yet': return 'bg-muted/30 text-muted-foreground border border-border italic';
  }
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
  if (status === 'offline') return <Icon name="wifi_off" size={12} className="text-destructive" />;
  if (status === 'intermittent') return <Icon name="wifi" size={12} className="text-sacred" />;
  return <Icon name="wifi" size={12} className="text-emerald" />;
}

function connLabel(status: TripDay['conn_status']): string {
  if (status === 'offline') return 'No signal';
  if (status === 'intermittent') return 'Phone only';
  return 'WiFi & phone';
}

// ---------------------------------------------------------------------------
// Timeline event icon mapping
// ---------------------------------------------------------------------------

function TimelineIcon({ event }: { event: string }) {
  const e = event.toLowerCase();
  if (e.includes('flight') || e.includes('airport') || e.includes('ktm to lhasa') || e.includes('lhasa to ktm') || e.includes('lhasa to ali') || e.includes('ali to lhasa') || e.includes('ktm airport') || e.includes('lhasa gonggar')) {
    if (e.includes('arrival') || e.includes('landing') || e.includes('arrival')) return <Icon name="flight_land" size={13} className="text-foreground" />;
    return <Icon name="flight_takeoff" size={13} className="text-foreground" />;
  }
  if (e.includes('drive') || e.includes('transfer') || e.includes('bus') || e.includes('darchen') || e.includes('lhasa to darchen') || e.includes('ali to mansarovar') || e.includes('mansarovar to darchen')) {
    return <Icon name="directions_bus" size={13} className="text-foreground" />;
  }
  if (e.includes('dinner') || e.includes('lunch') || e.includes('breakfast') || e.includes('meal')) {
    return <Icon name="restaurant" size={13} className="text-foreground" />;
  }
  if (e.includes('trek') || e.includes('parikrama') || e.includes('descen') || e.includes('yamadwar') || e.includes('dirapuk') || e.includes('zuthulphuk') || e.includes('mani wall') || e.includes('walk')) {
    return <Icon name="directions_walk" size={13} className="text-foreground" />;
  }
  if (e.includes('check-in') || e.includes('hotel') || e.includes('arrival') || e.includes('suitcase') || e.includes('checkout')) {
    return <Icon name="hotel" size={13} className="text-foreground" />;
  }
  if (e.includes('puja') || e.includes('darshan') || e.includes('gompa') || e.includes('temple') || e.includes('snan') || e.includes('mandir') || e.includes('kora') || e.includes('dolma la')) {
    return <Icon name="local_fire_department" size={13} className="text-sacred" />;
  }
  if (e.includes('coffee') || e.includes('tea')) {
    return <Icon name="local_cafe" size={13} className="text-foreground" />;
  }
  if (e.includes('pass') || e.includes('summit') || e.includes('dolma')) {
    return <Icon name="landscape" size={13} className="text-destructive" />;
  }
  if (e.includes('shower') || e.includes('wash') || e.includes('bath')) {
    return <Icon name="shower" size={13} className="text-foreground" />;
  }
  if (e.includes('wake') || e.includes('departure') || e.includes('pre-dawn')) {
    return <Icon name="alarm" size={13} className="text-foreground" />;
  }
  if (e.includes('rest') || e.includes('sleep') || e.includes('free')) {
    return <Icon name="schedule" size={13} className="text-muted-foreground" />;
  }
  if (e.includes('signal') || e.includes('connectivity') || e.includes('wifi')) {
    return <Icon name="wifi" size={13} className="text-foreground" />;
  }
  return <Icon name="location_on" size={13} className="text-muted-foreground" />;
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
  else if (w.rain_pct >= 25) rainLabel = 'Light rain';

  let windLabel = 'Calm';
  if (w.wind_kmh > 30) windLabel = 'Strong Wind';
  else if (w.wind_kmh >= 15) windLabel = 'Breezy';

  let uvLabel = 'Low UV';
  if (w.uv >= 8) uvLabel = 'High UV';
  else if (w.uv >= 5) uvLabel = 'Moderate UV';

  const recommended: string[] = [];
  if (tempLabel === 'Cool' || tempLabel === 'Cold') recommended.push('Warm Layers');
  if (rainLabel === 'Wet' || rainLabel === 'Light rain') recommended.push('Rain Protection');
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
  void index;
  const badge = getDayTypeBadge(day);
  const isCritical = day.day === 8;
  const liveDay = useLiveDayWeather(day);
  // Show up to 4-5 timeline items as highlights
  const highlights = (day.timeline || []).slice(0, 5);
  const route = getDayRoute(day.day - 1);
  // Defer each map until its wrapper scrolls near the viewport.
  // Without this, all 13 maps mount simultaneously on first Itinerary view.
  const [mapRef, mapInView] = useInView('200px 0px');

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
        <Icon name="keyboard_arrow_down" size={16} className="text-muted-foreground shrink-0" />
      </div>

      {/* Row 2: Location + date */}
      <div className="mb-2">
        <p className="text-sm font-medium text-foreground leading-snug">{day.location}</p>
        <p className="font-mono text-[11px] text-muted-foreground">
          {day.weekday} {day.date}
        </p>
      </div>

      {/* Row 2b: Real cartographic map. Deferred until this wrapper enters
          the viewport (200px rootMargin) so only 1-3 maps mount on first
          Itinerary view instead of all 13 simultaneously. */}
      {route && (
        <div ref={mapRef} className="mb-2 isolate relative z-0" onClick={(e) => e.stopPropagation()}>
          {mapInView ? (
            <Suspense
              fallback={
                <div
                  className="w-full bg-muted border border-border"
                  style={{ height: 160 }}
                  aria-hidden
                />
              }
            >
              <ItineraryDayMap
                start={route.start}
                end={route.end}
                waypoints={getDayStops(day.day) ?? undefined}
                contextStops={ALL_TRIP_STOPS}
                arcColor={isCritical ? 'var(--destructive)' : 'var(--sacred)'}
                height={160}
              />
            </Suspense>
          ) : (
            <div
              className="w-full bg-muted border border-border"
              style={{ height: 160 }}
              aria-hidden
            />
          )}
          {/* Per-leg distances + transport mode for NAMED stops only.
              Intermediate route waypoints (parikrama trail bends) are kept
              out of the leg list so the card stays readable. Distances are
              accumulated through the intermediate points so the km total
              matches the actual path on the map. */}
          {(() => {
            const stops = getDayStops(day.day);
            if (!stops || stops.length < 2) return null;
            type Leg = { from: typeof stops[number]; to: typeof stops[number]; km: number };
            const legs: Leg[] = [];
            let segStart = stops[0];
            let acc = 0;
            for (let i = 1; i < stops.length; i++) {
              acc += haversineKm(stops[i - 1], stops[i]);
              if (!stops[i].intermediate) {
                legs.push({ from: segStart, to: stops[i], km: acc });
                segStart = stops[i];
                acc = 0;
              }
            }
            return (
              <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 font-mono text-[10px] text-muted-foreground">
                {legs.map((leg, i) => (
                  <li key={i}>
                    <span className="text-foreground">{leg.from.label}</span>
                    {' → '}
                    <span className="text-foreground">{leg.to.label}</span>
                    {' · '}
                    {fmtKm(leg.km)}
                    {' · '}
                    {modeLabel(leg.from.modeNext)}
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      )}

      {/* Row 3: Status chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Temperature (live or climatology) */}
        <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground">
          <Icon name="device_thermostat" size={10} className="shrink-0 text-muted-foreground" />
          {liveDay.temp_low}-{liveDay.temp_high}C
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
          <Icon name="landscape" size={10} className="shrink-0 text-muted-foreground" />
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
    <div className="px-4 pt-4 pb-4 border-b border-border">
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
            <Icon name="favorite" size={10} className="shrink-0" />
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
        <div className="flex items-start gap-2 bg-destructive/5 border border-destructive px-4 py-2 mb-2">
          <Icon name="warning" size={13} className="text-destructive shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] text-destructive font-medium">
            22 km on foot. 5,630 m pass. 04:00 wake. No bailout after the pass.
          </p>
        </div>
      )}

      {/* Status badges row */}
      <div className="flex flex-wrap gap-2">
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
          <Icon name="landscape" size={10} className={cn('shrink-0', isCritical ? 'text-destructive' : 'text-muted-foreground')} />
          {day.altitude_peak.toLocaleString('en-US')}m
        </span>
        <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground">
          <Icon name="hotel" size={10} className="shrink-0 text-muted-foreground" />
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
  const liveDay = useLiveDayWeather(day);
  const chips: Array<{ icon: React.ReactNode; value: string; red?: boolean }> = [];

  // Altitude
  chips.push({
    icon: <Icon name="landscape" size={12} className={cn('shrink-0', isCritical ? 'text-destructive' : 'text-muted-foreground')} />,
    value: isCritical
      ? fmtDual(day.altitude_peak)
      : day.altitude_peak.toLocaleString('en-US') + 'm',
    red: isCritical,
  });

  // Walk hours + step count
  if (day.timing.walk_h > 0 || day.timing.active_trek_h > 0) {
    const walkH = day.timing.walk_h + day.timing.active_trek_h;
    const baseLabel = day.timing.active_trek_h > 0 ? walkH + 'h trek' : walkH + 'h walk';
    const totalSteps = Math.round((day.timing.walk_h * 5500 + day.timing.active_trek_h * 4500) / 500) * 500;
    const label = totalSteps > 0 ? baseLabel + ' - ~' + totalSteps.toLocaleString('en-US') + ' steps' : baseLabel;
    chips.push({ icon: <Icon name="directions_walk" size={12} className="shrink-0 text-muted-foreground" />, value: label });
  }

  // Transit: only if significant rest but no trek (transit day)
  if (day.timing.rest_h >= 4 && day.timing.active_trek_h === 0 && day.timing.walk_h <= 1) {
    chips.push({ icon: <Icon name="directions_bus" size={12} className="shrink-0 text-muted-foreground" />, value: day.timing.rest_h + 'h transit' });
  }

  // Connectivity
  chips.push({
    icon: <ConnIcon status={day.conn_status} />,
    value: connLabel(day.conn_status),
  });

  // Temperature (live or climatology)
  chips.push({
    icon: <Icon name="device_thermostat" size={12} className="shrink-0 text-muted-foreground" />,
    value: liveDay.temp_low + '-' + liveDay.temp_high + 'C',
  });

  // Stay
  if (day.stay) {
    chips.push({
      icon: <Icon name="hotel" size={12} className="shrink-0 text-muted-foreground" />,
      value: day.stay.split(' ').slice(0, 2).join(' '),
    });
  }

  return (
    <div className="px-4 py-4 border-b border-border">
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, i) => (
          <span
            key={i}
            className={cn(
              'inline-flex items-center gap-2 rounded-none border px-2 py-1 font-mono text-[11px]',
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

  function parseMinutes(timeStr: string): number | null {
    const part = timeStr.split('-')[0].trim();
    const m = part.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }

  // Duration of each node = gap until next event start. Last node has 0.
  const parsedEvents = events.map((ev, i) => {
    const startMin = parseMinutes(ev.time);
    const nextStartMin = i < events.length - 1 ? parseMinutes(events[i + 1].time) : null;
    const durationMin =
      startMin !== null && nextStartMin !== null && nextStartMin > startMin
        ? nextStartMin - startMin
        : 0;
    return { ...ev, startMin, durationMin };
  });

  // Pick pxPerMin so the longest segment caps around 220 px on screen.
  // Each segment height is duration * pxPerMin, with a 24 px floor so even
  // sub-30 min steps still render a visible connector. The line is one
  // continuous spine: bar fills the gap between this dot and the next.
  const maxDur = parsedEvents.reduce((m, e) => Math.max(m, e.durationMin), 0);
  const pxPerMin = maxDur > 0 ? Math.min(0.8, 220 / maxDur) : 0.5;
  const isCritical = day.day === 8;

  return (
    <div className="px-4 py-4 border-b border-border">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        Timeline
      </p>
      <ol className="space-y-0">
        {parsedEvents.map((ev, i) => {
          const timePart = ev.time.split('-')[0].trim();
          const isLast = i === parsedEvents.length - 1;
          const isFirst = i === 0;
          const isHighlight =
            isCritical &&
            (ev.event.toLowerCase().includes('dolma la') ||
              ev.event.toLowerCase().includes('pass'));
          // Row's vertical slot. Each row reserves at least enough space
          // for icon + text + duration + 12px top/bottom padding. The
          // 1fr/auto/1fr grid below distributes any extra minHeight
          // equally above and below the text row so the dot stays
          // centred on the text line, and consecutive dots are spaced
          // proportionally to event duration.
          const barHeight = isLast ? 0 : Math.max(24, ev.durationMin * pxPerMin);
          const rowHeight = Math.max(78, 10 + barHeight);
          const durationText =
            !isLast && ev.durationMin > 0
              ? ev.durationMin >= 60
                ? Math.round((ev.durationMin / 60) * 10) / 10 + 'h'
                : ev.durationMin + 'min'
              : null;

          return (
            <li
              key={i}
              className="relative grid grid-cols-[52px_24px_1fr] grid-rows-[1fr_auto_1fr] gap-0"
              style={{ minHeight: rowHeight + 'px' }}
            >
              {/* Spine bar in col 2, spanning all three rows so it's
                  continuous from li to li. First li hides its top half,
                  last li hides its bottom half so the spine starts at
                  the first dot and ends at the last. */}
              <div
                className={cn(
                  'col-start-2 row-start-1 row-end-4 justify-self-center w-0.5',
                  isHighlight ? 'bg-destructive' : 'bg-foreground',
                  isFirst && 'mt-[calc(50%-5px)]',
                  isLast && 'mb-[calc(50%-5px)]',
                  isFirst && isLast && 'hidden',
                )}
                aria-hidden
              />

              {/* Row 1: icon, anchored bottom of its row so it sits just
                  above the text row. 12 px top padding per spec. */}
              <div className="col-start-3 row-start-1 flex items-end pt-3 pr-2">
                <TimelineIcon event={ev.event} />
              </div>

              {/* Row 2 (middle, auto height): time | dot | text -- all
                  vertically centred so they read on the same line. */}
              <span className="col-start-1 row-start-2 self-center text-right pr-4 font-mono text-[10px] text-muted-foreground leading-none">
                {timePart}
              </span>
              <div
                className={cn(
                  'col-start-2 row-start-2 self-center justify-self-center w-2.5 h-2.5 rounded-none border z-10',
                  isHighlight
                    ? 'bg-destructive border-destructive'
                    : 'bg-foreground border-foreground',
                )}
              />
              <span
                className={cn(
                  'col-start-3 row-start-2 self-center text-xs leading-snug',
                  isHighlight ? 'font-semibold text-destructive' : 'text-foreground',
                )}
              >
                {ev.event}
              </span>

              {/* Row 3: duration, anchored top of its row so it sits just
                  below the text row. 12 px bottom padding per spec. */}
              <div className="col-start-3 row-start-3 flex items-start pb-3 pr-2">
                {durationText && (
                  <p className="font-mono text-[10px] text-muted-foreground leading-none mt-1">
                    {durationText}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// B3b. EXPANDED MAP -- same real-cartography map as the compressed view,
// shown again at the top of the expanded card so the day's geography
// stays visible while the user reads the details below.
// ---------------------------------------------------------------------------

function ExpandedMap({ day }: { day: TripDay }) {
  const route = getDayRoute(day.day - 1);
  // Expanded maps also get IntersectionObserver deferral. When a day card
  // is expanded (e.g. Day 8 auto-expands), the map still only mounts once
  // the section scrolls within 200px of the viewport.
  const [mapRef, mapInView] = useInView('200px 0px');
  if (!route) return null;
  const isCritical = day.day === 8;
  const stops = getDayStops(day.day);
  return (
    <div ref={mapRef} className="px-4 py-4 border-b border-border isolate relative z-0" onClick={(e) => e.stopPropagation()}>
      {mapInView ? (
        <Suspense
          fallback={
            <div
              className="w-full bg-muted border border-border"
              style={{ height: 180 }}
              aria-hidden
            />
          }
        >
          <ItineraryDayMap
            start={route.start}
            end={route.end}
            waypoints={stops ?? undefined}
            contextStops={ALL_TRIP_STOPS}
            arcColor={isCritical ? 'var(--destructive)' : 'var(--sacred)'}
            height={180}
          />
        </Suspense>
      ) : (
        <div
          className="w-full bg-muted border border-border"
          style={{ height: 180 }}
          aria-hidden
        />
      )}
      {stops && stops.length >= 2 && (
        <ul className="mt-2 space-y-0.5 font-mono text-[11px] text-muted-foreground">
          {stops.slice(1).map((s, i) => (
            <li key={i}>
              <span className="text-foreground">{stops[i].label}</span>
              {' → '}
              <span className="text-foreground">{s.label}</span>
              {' · '}
              {fmtKm(haversineKm(stops[i], s))}
              {' · '}
              {modeLabel(stops[i].modeNext)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// B4. WEATHER SNAPSHOT
// ---------------------------------------------------------------------------

function precipIcon(t: PrecipType): React.ReactNode {
  if (t === 'snow') return <Icon name="ac_unit" size={11} className="shrink-0 text-muted-foreground" />;
  if (t === 'storm') return <Icon name="thunderstorm" size={11} className="shrink-0 text-muted-foreground" />;
  return <Icon name="rainy" size={11} className="shrink-0 text-muted-foreground" />;
}

function precipLabel(t: PrecipType): string {
  if (t === 'snow') return 'Snow';
  if (t === 'storm') return 'Storm';
  return 'Rain';
}

function WeatherChips({ day }: { day: TripDay }) {
  const w = useLiveDayWeather(day);
  const chips: Array<{ icon: React.ReactNode; value: string }> = [
    { icon: <Icon name="device_thermostat" size={11} className="shrink-0 text-muted-foreground" />, value: w.temp_high + 'C' },
    { icon: precipIcon(w.precip_type), value: precipLabel(w.precip_type) + ' ' + w.precip_pct + '%' },
    { icon: <Icon name="air" filled size={11} className="shrink-0 text-muted-foreground" />, value: w.wind_kmh + ' km/h' },
    { icon: <Icon name="light_mode" size={11} className="shrink-0 text-muted-foreground" />, value: 'UV ' + w.uv },
  ];
  return (
    <div className="px-4 py-4 border-b border-border">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Weather
      </p>
      <div className="flex flex-wrap gap-2">
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
    <div className="px-4 py-4 border-b border-border">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Sky
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
          <Icon name="light_mode" size={11} className="shrink-0 text-sacred" />
          Sunrise {astro.sunrise}
        </span>
        <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
          <Icon name="light_mode" size={11} className="shrink-0 text-muted-foreground" />
          Sunset {astro.sunset}
        </span>
        <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
          <MoonPhase phase={astro.moonPhase} size={12} />
          Moon &middot; {astro.moonPhaseLabel}
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
    <div className="px-4 py-4 border-b border-border">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Conditions Today
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {[exp.tempLabel, exp.rainLabel, exp.windLabel, exp.uvLabel].map((label) => (
          <span
            key={label}
            className="inline-flex items-center rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground"
          >
            {label}
          </span>
        ))}
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Recommended
      </p>
      <div className="flex flex-wrap gap-2">
        {exp.recommended.map((rec) => (
          <span
            key={rec}
            className="inline-flex items-center gap-1 rounded-none border border-emerald/30 bg-emerald/10 px-2 py-0.5 font-mono text-[11px] text-emerald"
          >
            <Icon name="check" size={10} className="shrink-0" />
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
    { icon: <Icon name="local_cafe" size={11} className="shrink-0 text-muted-foreground" />, label: 'B', value: f.breakfast },
    { icon: <Icon name="restaurant" size={11} className="shrink-0 text-muted-foreground" />, label: 'L', value: f.lunch },
    { icon: <Icon name="restaurant" size={11} className="shrink-0 text-muted-foreground" />, label: 'D', value: f.dinner },
  ];

  // Short meal name: first segment before period or comma
  function shortMeal(s: string): string {
    return s.split(/[.,]/)[0].trim();
  }

  return (
    <div className="px-4 py-4 border-b border-border">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Meals
      </p>
      <div className="flex flex-wrap gap-2">
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
            <Icon name="location_on" size={11} className="shrink-0 text-muted-foreground" />
            Snacks
          </span>
        )}
        {f.hydration && (
          <span className="inline-flex items-center gap-1 rounded-none border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
            <Icon name="local_drink" size={11} className="shrink-0 text-muted-foreground" />
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
      icon: <Icon name="shower" size={11} className="shrink-0" />,
      label: hasHotShower ? 'Hot Shower' : hasShower ? 'Shower' : 'No Shower',
      present: hasShower,
    },
    {
      icon: <Icon name="wc" size={11} className="shrink-0" />,
      label: isWestern ? 'Western Toilet' : 'Field / Pit',
      present: isWestern,
    },
    {
      icon: <Icon name="local_drink" size={11} className="shrink-0" />,
      label: hasSafeWater ? 'Hot Water' : 'No Safe Water',
      present: hasSafeWater,
    },
    {
      icon: <Icon name="wifi" size={11} className="shrink-0" />,
      label: hasWifi ? connLabel(day.conn_status) + ' WiFi' : 'No Signal',
      present: hasWifi,
    },
  ];

  return (
    <div className="px-4 py-4 border-b border-border">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Facilities
      </p>
      <div className="flex flex-wrap gap-2">
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
    <div className="px-4 py-4 border-b border-border">
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
          <Icon name="keyboard_arrow_up" size={14} className="text-muted-foreground shrink-0" />
        ) : (
          <Icon name="keyboard_arrow_down" size={14} className="text-muted-foreground shrink-0" />
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
            <div className="pt-4 space-y-4">
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
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <Icon name="check" size={10} className="mt-0.5 shrink-0 text-muted-foreground" />
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
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <Icon name="check" size={10} className="mt-0.5 shrink-0 text-muted-foreground" />
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
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <Icon name="check" size={10} className="mt-0.5 shrink-0 text-muted-foreground" />
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
                <div className="border-l-2 border-sacred pl-4 bg-sacred/5 py-2 pr-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-sacred mb-1 flex items-center gap-1">
                    <Icon name="local_fire_department" filled size={10} />
                    {day.spiritual_focus.title}
                  </p>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {day.spiritual_focus.body}
                  </p>
                </div>
              )}

              {/* Stay footer */}
              <div className="flex flex-wrap gap-4 pt-1 border-t border-border">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] text-foreground">
                  <Icon name="hotel" size={11} className="text-muted-foreground shrink-0" />
                  {day.stay}
                </span>
                <span className="inline-flex items-center gap-2 font-mono text-[11px] text-foreground">
                  <Icon name="shower" size={11} className="text-muted-foreground shrink-0" />
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
        <Icon name="keyboard_arrow_up" size={14} />
      </button>
      <DayHeader day={day} />
      <ExpandedMap day={day} />
      <SummaryStrip day={day} />
      {(() => {
        const dose = DIAMOX_REGIME_BY_DATE[day.date];
        if (!dose) return null;
        return (
          <section className="my-4 border-l-4 border-sacred bg-card px-4 py-2 flex items-start gap-2">
            <Icon name="medication" size={14} className="mt-0.5 text-sacred shrink-0" />
            <div className="flex flex-1 min-w-0 flex-col">
              <p className="font-mono uppercase tracking-widest text-sacred text-[10px]">Diamox today</p>
              <p className="mt-0.5 text-sm text-foreground">{describeDose(dose)}</p>
            </div>
          </section>
        );
      })()}
      {day.bagState && (
        <section className="px-4 py-4 border-b border-border">
          <p className="mb-2 font-mono uppercase tracking-widest text-muted-foreground text-[10px]">
            Bags today
          </p>
          <ul className="flex flex-col gap-2">
            {day.bagState.rows.map((row, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <Icon name={iconForBagState(row.state)} size={14} className="mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex flex-1 min-w-0 flex-col">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-mono uppercase tracking-wider text-xs text-muted-foreground">{row.location}</span>
                    <span className="text-foreground text-xs">{row.bags.map(bagDisplay).join(', ')}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={cn('inline-flex items-center gap-1 rounded-none px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest', bagStateBadgeClass(row.state))}>
                      {row.state === 'stowed-locked' && <Icon name="lock" size={10} />}
                      {bagStateLabel(row.state)}
                    </span>
                    {row.note && <span className="font-mono text-[10px] text-muted-foreground">{row.note}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {day.bagState.flight && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="font-mono uppercase tracking-widest text-muted-foreground text-[10px]">
                Flight allowance
              </p>
              <p className="mt-1 text-xs text-foreground">
                {day.bagState.flight.leg}{day.bagState.flight.flightNo ? ` (${day.bagState.flight.flightNo})` : ''} · Check {day.bagState.flight.checkKg} kg + Cabin {day.bagState.flight.cabinKg} kg
              </p>
            </div>
          )}
        </section>
      )}
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
    <div className="px-4 pt-4 pb-0">
      <span className="inline-flex items-center gap-1 rounded-none bg-emerald/10 border border-emerald/30 px-2 py-0.5 font-mono text-[10px] text-emerald uppercase tracking-wide">
        <Icon name="check_circle" size={10} />
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
