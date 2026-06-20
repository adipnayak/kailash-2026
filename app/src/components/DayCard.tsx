/**
 * DayCard.
 * 6 day-type patterns with dominant chip, collapse/expand via framer-motion.
 * Full 9-section expanded body: weather, timeline, wear, food, bathroom,
 * timing, carry critical, spiritual focus, footer strip.
 * aliimam icons throughout. Day 8 double-height + critical warn banner.
 *
 * Anti-AI rules: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Mountain,
  Clock,
  Ruler,
  Wifi,
  WifiOff,
  Bed,
  CircleCheck,
  Thermometer,
  WindFilled,
  DropFilled,
  Sun,
  Backpack,
  Shirt,
  Utensils,
  ShowerHead,
  Toilet,
  GlassWater,
  AlarmClock,
  Heart,
  MapPin,
  TriangleAlert,
  CandleFilled,
  Snowflake,
  CloudRain,
  Battery,
  Phone,
  Pill,
  HardHat,
  Eye,
} from '@aliimam/icons';
import gsap from 'gsap';
import type { TripDay } from '../lib/trip-data';
import { mToFt } from '../lib/conversions';
import { computeJourneyState } from '../lib/journey-state';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDual(m: number): string {
  return m.toLocaleString('en-US') + ' m / ' + mToFt(m).toLocaleString('en-US') + ' ft';
}

// ---------------------------------------------------------------------------
// Classify day into our 6 patterns from the spec
// ---------------------------------------------------------------------------

type CardPattern = 'travel' | 'combo' | 'rest' | 'pilgrimage' | 'trek' | 'climb';

function classifyDay(day: TripDay): CardPattern {
  if (day.day === 8) return 'climb';
  if (day.day_type === 'rest') return 'rest';
  if (day.day_type === 'holy') return 'pilgrimage';
  if (day.day === 5) return 'combo';
  // Trek days: 7, 9
  if ([7, 9].includes(day.day)) return 'trek';
  // Travel days: 1, 2, 3, 4, 10, 11, 12, 13
  return 'travel';
}

// Day distance in km (approximate, per itinerary)
const DAY_DISTANCE_KM: Record<number, number | null> = {
  1: null, 2: null, 3: null, 4: null, 5: 780, 6: 5, 7: 22, 8: 20, 9: 15, 10: 780, 11: null, 12: null, 13: null,
};

const DAY_DURATION_H: Record<number, string | null> = {
  1: '6 h transit', 2: null, 3: '4 h flight', 4: null, 5: '10 h drive', 6: null,
  7: '8 h trek', 8: '16 h summit', 9: '7 h trek', 10: '11 h drive', 11: '4 h flight', 12: null, 13: '2 h transit',
};

function getDistanceLabel(day: TripDay): string | null {
  const km = DAY_DISTANCE_KM[day.day];
  if (km === null || km === undefined) return null;
  return km + ' km';
}

function getDurationLabel(day: TripDay): string | null {
  return DAY_DURATION_H[day.day] || null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  dominant?: boolean;
  red?: boolean;
}

function Chip({ icon, label, value, dominant, red }: ChipProps) {
  const base = 'flex items-center gap-1.5 rounded px-2 py-1 font-mono text-xs border';
  const color = red
    ? 'bg-red/10 border-red/30 text-red'
    : dominant
    ? 'bg-ink text-card border-ink'
    : 'bg-bg border-border text-muted';
  return (
    <span className={base + ' ' + color}>
      {icon}
      <span className="hidden sm:inline text-[10px] uppercase tracking-wide mr-0.5">{label}</span>
      <span className={dominant ? 'font-medium' : ''}>{value}</span>
    </span>
  );
}

function ConnIcon({ status }: { status: TripDay['conn_status'] }) {
  if (status === 'offline') return <WifiOff size={12} className="text-red" />;
  if (status === 'intermittent') return <Wifi size={12} className="text-accent" />;
  return <Wifi size={12} className="text-green" />;
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ label }: { label: string }) {
  return (
    <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2 mt-5 first:mt-0 border-b border-border pb-1">
      {label}
    </h4>
  );
}

// ---------------------------------------------------------------------------
// 1. Weather block
// ---------------------------------------------------------------------------

function WeatherBlock({ day }: { day: TripDay }) {
  const w = day.weather;
  return (
    <div>
      <SectionHeader label="Weather" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <Thermometer size={12} className="text-accent shrink-0" />
          <span className="font-mono text-[11px] text-muted">HIGH</span>
          <span className="font-mono text-[11px] text-ink font-medium">{w.temp_high} C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Thermometer size={12} className="text-green shrink-0" />
          <span className="font-mono text-[11px] text-muted">LOW</span>
          <span className="font-mono text-[11px] text-ink font-medium">{w.temp_low} C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Snowflake size={12} className="text-muted shrink-0" />
          <span className="font-mono text-[11px] text-muted">FEELS</span>
          <span className="font-mono text-[11px] text-ink font-medium">{w.feels_like} C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CloudRain size={12} className="text-green shrink-0" />
          <span className="font-mono text-[11px] text-muted">RAIN</span>
          <span className="font-mono text-[11px] text-ink font-medium">{w.rain_pct}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <WindFilled size={12} className="text-muted shrink-0" />
          <span className="font-mono text-[11px] text-muted">WIND</span>
          <span className="font-mono text-[11px] text-ink font-medium">{w.wind_kmh} km/h</span>
          <span className="font-mono text-[10px] text-muted">({w.wind_label})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sun size={12} className="text-accent shrink-0" />
          <span className="font-mono text-[11px] text-muted">UV</span>
          <span className="font-mono text-[11px] text-ink font-medium">{w.uv}</span>
        </div>
      </div>
      <p className="mt-1.5 font-mono text-[10px] text-muted">SOURCE: {w.source.toUpperCase()}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Timeline block (vertical)
// ---------------------------------------------------------------------------

function TimelineBlock({ day }: { day: TripDay }) {
  const events = day.timeline || [];
  return (
    <div>
      <SectionHeader label="Timeline" />
      <ol className="relative ml-1 border-l border-border pl-5 space-y-3">
        {events.map((ev, i) => {
          const isHighlight = day.day_type === 'critical' && i === Math.floor(events.length / 2);
          const dotClass = isHighlight ? 'bg-red' : 'bg-border';
          const textClass = isHighlight ? 'text-red font-semibold' : 'text-ink';
          return (
            <li key={i} className="relative">
              <span
                className={
                  'absolute -left-[23px] top-[5px] h-2.5 w-2.5 rounded-full border border-card ' + dotClass
                }
              />
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-muted shrink-0 w-[52px]">{ev.time}</span>
                <span className={'text-xs ' + textClass}>{ev.event}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. What to wear
// ---------------------------------------------------------------------------

function WearBlock({ day }: { day: TripDay }) {
  const w = day.what_to_wear;
  const rows: Array<{ label: string; value: string; icon: React.ReactNode }> = [
    { label: 'BOTTOM', value: w.bottom, icon: <Ruler size={11} className="text-muted shrink-0 mt-0.5" /> },
    { label: 'TOP', value: w.top, icon: <Shirt size={11} className="text-muted shrink-0 mt-0.5" /> },
    { label: 'FEET', value: w.feet, icon: <MapPin size={11} className="text-muted shrink-0 mt-0.5" /> },
    { label: 'HANDS', value: w.hands, icon: <Snowflake size={11} className="text-muted shrink-0 mt-0.5" /> },
    { label: 'HEAD / FACE', value: w.head_face, icon: <HardHat size={11} className="text-muted shrink-0 mt-0.5" /> },
  ];
  return (
    <div>
      <SectionHeader label="What to Wear" />
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[80px_1fr] gap-x-3 items-start">
            <div className="flex items-center gap-1">
              {r.icon}
              <span className="font-mono text-[10px] text-muted uppercase">{r.label}</span>
            </div>
            <span className="text-xs text-ink">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Food
// ---------------------------------------------------------------------------

function FoodBlock({ day }: { day: TripDay }) {
  const f = day.food;
  const rows: Array<{ label: string; value: string }> = [
    { label: 'BREAKFAST', value: f.breakfast },
    { label: 'LUNCH', value: f.lunch },
    { label: 'DINNER', value: f.dinner },
    { label: 'SNACKS', value: f.daypack_snacks },
    { label: 'HYDRATION', value: f.hydration },
  ];
  return (
    <div>
      <SectionHeader label="Food" />
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[80px_1fr] gap-x-3 items-start">
            <div className="flex items-center gap-1">
              <Utensils size={11} className="text-muted shrink-0 mt-0.5" />
              <span className="font-mono text-[10px] text-muted uppercase">{r.label}</span>
            </div>
            <span className="text-xs text-ink">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Bathroom
// ---------------------------------------------------------------------------

function BathroomBlock({ day }: { day: TripDay }) {
  const b = day.bathroom;
  const rows: Array<{ label: string; value: string; icon: React.ReactNode }> = [
    { label: 'TYPE', value: b.type, icon: <Toilet size={11} className="text-muted shrink-0 mt-0.5" /> },
    { label: 'WATER', value: b.water, icon: <GlassWater size={11} className="text-muted shrink-0 mt-0.5" /> },
    { label: 'SHOWER', value: b.shower, icon: <ShowerHead size={11} className="text-muted shrink-0 mt-0.5" /> },
    { label: 'NOTES', value: b.notes, icon: <Eye size={11} className="text-muted shrink-0 mt-0.5" /> },
  ];
  return (
    <div>
      <SectionHeader label="Bathroom" />
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[80px_1fr] gap-x-3 items-start">
            <div className="flex items-center gap-1">
              {r.icon}
              <span className="font-mono text-[10px] text-muted uppercase">{r.label}</span>
            </div>
            <span className="text-xs text-ink">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Timing
// ---------------------------------------------------------------------------

function TimingBlock({ day }: { day: TripDay }) {
  const t = day.timing;
  const rows: Array<{ label: string; value: string; icon: React.ReactNode }> = [
    { label: 'WAKE', value: t.wake, icon: <AlarmClock size={11} className="text-muted shrink-0 mt-0.5" /> },
    { label: 'WALK H', value: String(t.walk_h), icon: <Clock size={11} className="text-muted shrink-0 mt-0.5" /> },
    { label: 'TREK H', value: String(t.active_trek_h), icon: <Mountain size={11} className="text-muted shrink-0 mt-0.5" /> },
    { label: 'REST H', value: String(t.rest_h), icon: <Bed size={11} className="text-muted shrink-0 mt-0.5" /> },
    { label: 'SLEEP H', value: String(t.sleep_target_h), icon: <Bed size={11} className="text-muted shrink-0 mt-0.5" /> },
    { label: 'NOTES', value: t.notes, icon: <Eye size={11} className="text-muted shrink-0 mt-0.5" /> },
  ];
  return (
    <div>
      <SectionHeader label="Timing" />
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[80px_1fr] gap-x-3 items-start">
            <div className="flex items-center gap-1">
              {r.icon}
              <span className="font-mono text-[10px] text-muted uppercase">{r.label}</span>
            </div>
            <span className="text-xs text-ink">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Carry critical: icon-per-row heuristic
// ---------------------------------------------------------------------------

function carryIcon(item: string): React.ReactNode {
  const s = item.toLowerCase();
  if (s.includes('glass') || s.includes('sunglass') || s.includes('eye')) return <Eye size={11} className="text-accent shrink-0 mt-0.5" />;
  if (s.includes('passport') || s.includes('cash') || s.includes('card') || s.includes('wallet')) return <Backpack size={11} className="text-muted shrink-0 mt-0.5" />;
  if (s.includes('phone') || s.includes('mobile') || s.includes('power bank') || s.includes('charger')) return <Phone size={11} className="text-muted shrink-0 mt-0.5" />;
  if (s.includes('ibuprofen') || s.includes('ors') || s.includes('med') || s.includes('pill') || s.includes('diamox') || s.includes('glucose')) return <Pill size={11} className="text-red shrink-0 mt-0.5" />;
  if (s.includes('water') || s.includes('hydrat') || s.includes('bladder') || s.includes('bottle')) return <DropFilled size={11} className="text-green shrink-0 mt-0.5" />;
  if (s.includes('hand warmer') || s.includes('glove') || s.includes('liner')) return <Snowflake size={11} className="text-muted shrink-0 mt-0.5" />;
  if (s.includes('headlamp') || s.includes('battery') || s.includes('batteries')) return <Battery size={11} className="text-accent shrink-0 mt-0.5" />;
  if (s.includes('hat') || s.includes('beanie') || s.includes('cap') || s.includes('mask') || s.includes('buff')) return <HardHat size={11} className="text-muted shrink-0 mt-0.5" />;
  if (s.includes('snack') || s.includes('protein bar') || s.includes('food') || s.includes('lunch')) return <Utensils size={11} className="text-muted shrink-0 mt-0.5" />;
  if (s.includes('towel') || s.includes('soap') || s.includes('wet wipe')) return <ShowerHead size={11} className="text-muted shrink-0 mt-0.5" />;
  if (s.includes('ritual') || s.includes('holy') || s.includes('puja') || s.includes('notebook') || s.includes('sankalpa')) return <CandleFilled size={11} className="text-accent shrink-0 mt-0.5" />;
  if (s.includes('pack liner') || s.includes('zip-lock') || s.includes('bag')) return <Backpack size={11} className="text-muted shrink-0 mt-0.5" />;
  return <CircleCheck size={11} className="text-muted shrink-0 mt-0.5" />;
}

// ---------------------------------------------------------------------------
// 7. Carry critical
// ---------------------------------------------------------------------------

function CarryBlock({ day }: { day: TripDay }) {
  const items = day.carry_critical || [];
  return (
    <div>
      <SectionHeader label="Carry Critical" />
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            {carryIcon(item)}
            <span className="text-xs text-ink">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. Spiritual focus
// ---------------------------------------------------------------------------

function SpiritualBlock({ day }: { day: TripDay }) {
  if (!day.spiritual_focus) return null;
  const sf = day.spiritual_focus;
  return (
    <div>
      <SectionHeader label="Spiritual Focus" />
      <div className="border-l-2 border-accent/60 pl-3 py-1 rounded-r bg-accent/5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1 flex items-center gap-1">
          <CandleFilled size={10} className="shrink-0" />
          {sf.title}
        </p>
        <p className="text-xs text-ink leading-relaxed whitespace-pre-line">{sf.body}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 9. Footer strip: STAY + BATHING
// ---------------------------------------------------------------------------

function FooterStrip({ day }: { day: TripDay }) {
  return (
    <div className="mt-5 pt-3 border-t border-border flex flex-wrap gap-4">
      <div className="flex items-center gap-1.5">
        <Bed size={12} className="text-muted shrink-0" />
        <span className="font-mono text-[10px] text-muted uppercase mr-1">STAY</span>
        <span className="font-mono text-[11px] text-ink font-medium">{day.stay}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <ShowerHead size={12} className="text-muted shrink-0" />
        <span className="font-mono text-[10px] text-muted uppercase mr-1">BATHING</span>
        <span className="font-mono text-[11px] text-ink">{day.bathing}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Full expanded body: all 9 sections
// ---------------------------------------------------------------------------

function ExpandedBody({ day }: { day: TripDay }) {
  return (
    <div className="px-4 pb-5 border-t border-border pt-4 space-y-0">
      <WeatherBlock day={day} />
      <TimelineBlock day={day} />
      <WearBlock day={day} />
      <FoodBlock day={day} />
      <BathroomBlock day={day} />
      <TimingBlock day={day} />
      <CarryBlock day={day} />
      <SpiritualBlock day={day} />
      <FooterStrip day={day} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DayCard
// ---------------------------------------------------------------------------

const LS_PREFIX = 'kailash_daycard_';

export function DayCard({ day, isToday }: { day: TripDay; isToday: boolean }) {
  const pattern = classifyDay(day);
  const isClimb = pattern === 'climb';
  const isRest = pattern === 'rest';
  const isPilgrimage = pattern === 'pilgrimage';

  // Compute journey state for phase-aware expansion logic
  const stateRef = useRef(computeJourneyState());
  const js = stateRef.current;
  const daysToDeparture = js.daysToDeparture;
  const tripDayIndex = js.tripDayIndex;
  const phase = js.phase;

  // Day 8 auto-expand logic:
  // T-3 onward (daysToDeparture <= 3), during Day 8, or after Day 8
  const day8AutoExpand =
    isClimb &&
    (daysToDeparture <= 3 || (phase === 'during' && tripDayIndex >= 8) || phase === 'after');

  const lsKey = LS_PREFIX + day.day;

  function getInitialExpanded(): boolean {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(lsKey);
      if (stored !== null) return stored === 'true';
    }
    if (isClimb && day8AutoExpand) return true;
    return false;
  }

  const [expanded, setExpanded] = useState<boolean>(getInitialExpanded);

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(lsKey, String(next));
    }
  }

  // GSAP sacred-label gloss on first mount for pilgrimage / climb cards
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!headerRef.current) return;
    if (!isPilgrimage && !isClimb && !isToday) return;
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -6,
        duration: 0.5,
        ease: 'power2.out',
        clearProps: 'all',
      });
    });
    return () => ctx.revert();
  }, [isPilgrimage, isClimb, isToday]);

  // Chips
  const altChip = (
    <Chip
      icon={<Mountain size={11} />}
      label="alt"
      value={fmtDual(day.altitude_peak)}
      dominant={isClimb}
      red={isClimb}
    />
  );
  const distKm = getDistanceLabel(day);
  const distChip = distKm ? (
    <Chip
      icon={<Ruler size={11} />}
      label="dist"
      value={distKm}
      dominant={pattern === 'combo' || pattern === 'trek'}
    />
  ) : null;
  const durLabel = getDurationLabel(day);
  const timeChip = durLabel ? (
    <Chip
      icon={<Clock size={11} />}
      label="time"
      value={durLabel}
      dominant={pattern === 'travel'}
    />
  ) : null;
  const connChip = (
    <Chip
      icon={<ConnIcon status={day.conn_status} />}
      label="conn"
      value={
        day.conn_status === 'offline'
          ? 'offline'
          : day.conn_status === 'intermittent'
          ? 'limited'
          : 'good'
      }
    />
  );
  const sleepChip = (
    <Chip
      icon={<Bed size={11} />}
      label="sleep"
      value={fmtDual(day.altitude_sleep)}
    />
  );

  // Card border / background rules
  const cardBg = isClimb ? 'bg-red/5' : 'bg-card';
  const cardBorderWidth = isClimb ? 'border-2' : 'border';
  const cardBorderColor = isClimb ? 'border-red' : isToday ? 'border-ink' : 'border-border';
  const cardRing = isToday && !isClimb ? 'ring-1 ring-ink' : '';

  // Completed badge for Day 8 after the phase
  const showCompleted = isClimb && phase === 'after';

  // Day 8 collapsed header banner condition: T-30 to T-4 (not yet close), still collapsed
  const showClimbBanner = isClimb && (daysToDeparture > 3 || phase === 'before') && !expanded;

  // Badge color mapping
  function badgeColor(badge: string): string {
    if (badge === 'CRITICAL DAY') return 'bg-red/10 border-red/30 text-red';
    if (badge === 'SNAN AND PUJA') return 'bg-accent/10 border-accent/30 text-accent';
    if (badge === 'RECOVERY') return 'bg-green/10 border-green/30 text-green';
    return 'bg-border/30 border-border text-muted';
  }

  return (
    <>
      {/* Day 8 critical warn banner ABOVE the card */}
      {isClimb && (
        <div className="mb-2 rounded border-2 border-red bg-red/10 px-4 py-2 flex items-start gap-2">
          <TriangleAlert size={14} className="text-red shrink-0 mt-0.5" />
          <p className="font-mono text-xs text-red font-medium">
            22 km on foot. 5,630 m pass. 04:00 wake. No bailout after the pass.
          </p>
        </div>
      )}

      <article
        data-day={day.day}
        data-pattern={pattern}
        className={[
          'rounded overflow-hidden transition-shadow',
          cardBorderWidth,
          cardBg,
          cardBorderColor,
          cardRing,
          isClimb ? 'shadow-md shadow-red/10' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Climb rule header (double-height collapsed state) */}
        {isClimb && (
          <div className="bg-red px-4 py-2 font-mono text-[11px] font-medium text-card tracking-widest uppercase text-center">
            {'=== DOLMA LA PASS ==='}
          </div>
        )}

        {/* Rest badge */}
        {isRest && (
          <div className="px-4 pt-3 pb-0 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-green/10 border border-green/30 px-2 py-0.5 font-mono text-[10px] text-green uppercase tracking-wide">
              <Bed size={10} /> Rest day
            </span>
          </div>
        )}

        {/* Completed badge */}
        {showCompleted && (
          <div className="px-4 pt-2 pb-0">
            <span className="inline-flex items-center gap-1 rounded bg-green/10 border border-green/30 px-2 py-0.5 font-mono text-[10px] text-green uppercase tracking-wide">
              <CircleCheck size={10} /> Completed
            </span>
          </div>
        )}

        {/* Card header */}
        <header ref={headerRef} className="px-4 pt-3 pb-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Sacred label dominant for pilgrimage */}
              {isPilgrimage && day.sacred_label && (
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-0.5 flex items-center gap-1">
                  <Heart size={10} className="shrink-0" />
                  SACRED · {day.sacred_label}
                </p>
              )}
              {/* Climb sacred label */}
              {isClimb && day.sacred_label && (
                <p className="font-mono text-[10px] uppercase tracking-widest text-red mb-0.5">
                  {day.sacred_label}
                </p>
              )}
              <h3
                className={[
                  'font-sans font-medium leading-snug',
                  isClimb ? 'text-red text-lg' : 'text-ink text-base',
                ].join(' ')}
              >
                <span className="text-muted font-mono text-xs mr-2">D{day.day}</span>
                {day.location}
              </h3>
              <p className="mt-0.5 text-xs text-muted font-mono">
                {day.weekday} {day.date}
              </p>
            </div>
            {/* Badge (CRITICAL DAY, SNAN AND PUJA, RECOVERY) */}
            {day.badge && (
              <span
                className={[
                  'font-mono text-[10px] uppercase tracking-wide rounded border px-2 py-0.5 shrink-0 mt-0.5',
                  badgeColor(day.badge),
                ].join(' ')}
              >
                {day.badge}
              </span>
            )}
          </div>

          {/* Subtitle (description line) */}
          <p className="mt-2 text-sm text-ink leading-snug">
            {day.subtitle}
            {pattern === 'combo' && (
              <span className="ml-2 font-mono text-[10px] bg-accent/10 text-accent border border-accent/20 rounded px-1.5 py-0.5 uppercase tracking-wide">
                LONG DAY
              </span>
            )}
          </p>
        </header>

        {/* TL;DR chips row (not shown for rest days) */}
        {!isRest && (
          <div className="px-4 pt-2 pb-0 flex flex-wrap gap-1.5">
            {altChip}
            {distChip}
            {timeChip}
            {connChip}
            {sleepChip}
          </div>
        )}

        {/* Collapse banner for D8 pre-phase (note about auto-expand) */}
        {showClimbBanner && (
          <p className="px-4 pb-1 mt-2 font-mono text-[10px] text-red">
            Auto-expands T-3 before Dolma La.
          </p>
        )}

        {/* Expand / collapse toggle */}
        <div className="px-4 pt-2 pb-3">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={expanded}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors font-sans"
          >
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <ChevronDown size={14} />
            </motion.span>
            {expanded ? 'Collapse' : 'View Details'}
          </button>
        </div>

        {/* Expanded content: all 9 sections */}
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
              <ExpandedBody day={day} />
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </>
  );
}
