/**
 * DayCard.
 * 6 day-type patterns with dominant chip, collapse/expand via framer-motion,
 * Level-2 inner timeline inspired by 21st.dev agent-plan UI.
 *
 * Anti-AI rules: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mountain, Clock, Ruler, Wifi, WifiOff, Bed, CircleCheck } from '@aliimam/icons';
import gsap from 'gsap';
import type { TripDay } from '../lib/trip-data';
import { formatAltitude, mToFt } from '../lib/conversions';
import { computeJourneyState } from '../lib/journey-state';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimelineEvent {
  time: string;
  label: string;
  altitude_m?: number;
  highlight?: boolean;
}

// ---------------------------------------------------------------------------
// Per-day timeline data
// ---------------------------------------------------------------------------

const DAY_TIMELINES: Record<number, TimelineEvent[]> = {
  1: [
    { time: '14:00', label: 'Arrive Tribhuvan International Airport (KTM)' },
    { time: '15:30', label: 'Transfer to hotel' },
    { time: '19:00', label: 'Welcome group dinner' },
    { time: '21:00', label: 'Rest at 1,380 m', altitude_m: 1380 },
  ],
  2: [
    { time: '09:00', label: 'Indian Embassy NOC visit' },
    { time: '12:00', label: 'Lunch break' },
    { time: '14:00', label: 'Pashupatinath Mandir visit' },
    { time: '17:00', label: 'Gear check and layer prep' },
    { time: '21:00', label: 'Rest at 1,380 m', altitude_m: 1380 },
  ],
  3: [
    { time: '07:00', label: 'Depart for Tribhuvan Airport' },
    { time: '10:00', label: 'Flight to Lhasa (LXA)' },
    { time: '13:00', label: 'Arrive Lhasa', altitude_m: 3656 },
    { time: '14:00', label: 'Transfer to hotel, no exertion' },
    { time: '20:00', label: 'Sleep at 3,656 m', altitude_m: 3656 },
  ],
  4: [
    { time: '09:00', label: 'Morning walk only, gentle pace' },
    { time: '11:00', label: 'Jokhang Temple' },
    { time: '14:00', label: 'Potala Palace (steady pace on stairs)' },
    { time: '17:00', label: 'Rest and hydrate' },
    { time: '20:00', label: 'Sleep at 3,656 m', altitude_m: 3656 },
  ],
  5: [
    { time: '07:00', label: 'Depart Lhasa by road' },
    { time: '09:00', label: 'Long transit through Tibetan plateau' },
    { time: '15:00', label: 'Approach Mansarovar', altitude_m: 4670 },
    { time: '17:00', label: 'First sight of the lake' },
    { time: '20:00', label: 'Settle at guesthouse, 4,670 m', altitude_m: 4670 },
  ],
  6: [
    { time: '05:30', label: 'Wake before dawn' },
    { time: '06:00', label: 'Mansarovar Snan at lakeside', altitude_m: 4670, highlight: true },
    { time: '08:00', label: 'Puja at the shore' },
    { time: '10:00', label: 'Rest and reflect' },
    { time: '13:00', label: 'Lunch at guesthouse' },
    { time: '20:00', label: 'Rest at 4,670 m', altitude_m: 4670 },
  ],
  7: [
    { time: '06:00', label: 'Wake at Darchen' },
    { time: '07:00', label: 'Breakfast and final gear check' },
    { time: '08:00', label: 'Yamadwar gate, Parikrama begins', altitude_m: 4675, highlight: true },
    { time: '12:00', label: 'Trek continues, north face of Kailash visible' },
    { time: '16:00', label: 'Arrive Dirapuk, 4,900 m', altitude_m: 4900 },
    { time: '21:00', label: 'Sleep at 4,900 m', altitude_m: 4900 },
  ],
  8: [
    { time: '04:00', label: 'Wake at Dirapuk' },
    { time: '05:00', label: 'Breakfast, layer up fully' },
    { time: '05:30', label: 'Trek begins in darkness', altitude_m: 4900 },
    { time: '09:30', label: 'Approach to Dolma La' },
    { time: '11:00', label: 'DOLMA LA - 5,630 m', altitude_m: 5630, highlight: true },
    { time: '14:00', label: 'Descent begins' },
    { time: '17:00', label: 'Gauri Kund, 5,100 m', altitude_m: 5100 },
    { time: '20:30', label: 'Arrive Zuthulphuk, 4,790 m', altitude_m: 4790 },
    { time: '21:30', label: 'Sleep at 4,790 m', altitude_m: 4790 },
  ],
  9: [
    { time: '07:00', label: 'Wake at Zuthulphuk, 4,790 m', altitude_m: 4790 },
    { time: '08:00', label: 'Breakfast and slow pack' },
    { time: '09:00', label: 'Final descent from Zuthulphuk' },
    { time: '13:00', label: 'Arrive Darchen, 4,760 m', altitude_m: 4760, highlight: true },
    { time: '15:00', label: 'Parikrama complete' },
    { time: '20:00', label: 'Sleep at 4,760 m', altitude_m: 4760 },
  ],
  10: [
    { time: '07:00', label: 'Depart Darchen by road' },
    { time: '10:00', label: 'Long transit, descending plateau' },
    { time: '18:00', label: 'Arrive Lhasa, St Regis', altitude_m: 3656, highlight: true },
    { time: '20:00', label: 'Stop Diamox per protocol (Day 10 evening)' },
    { time: '21:00', label: 'Sleep at 3,656 m', altitude_m: 3656 },
  ],
  11: [
    { time: '09:00', label: 'Depart Lhasa for airport' },
    { time: '12:00', label: 'Flight to Kathmandu' },
    { time: '14:00', label: 'Arrive Tribhuvan International Airport' },
    { time: '15:00', label: 'Transfer to hotel in Kathmandu' },
    { time: '21:00', label: 'Sleep at 1,380 m', altitude_m: 1380 },
  ],
  12: [
    { time: '09:00', label: 'Rest morning, no program' },
    { time: '12:00', label: 'Lunch at leisure' },
    { time: '15:00', label: 'Reflect and decompress' },
    { time: '21:00', label: 'Sleep at 1,380 m', altitude_m: 1380 },
  ],
  13: [
    { time: '04:30', label: 'Alarm, final pack' },
    { time: '05:30', label: 'Transfer to airport' },
    { time: '08:00', label: 'Depart Kathmandu' },
    { time: '14:00', label: 'Arrive home', highlight: true },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDual(m: number): string {
  return m.toLocaleString('en-US') + ' m / ' + mToFt(m).toLocaleString('en-US') + ' ft';
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
// Classify day into our 6 patterns from the spec
// ---------------------------------------------------------------------------

type CardPattern = 'travel' | 'combo' | 'rest' | 'pilgrimage' | 'trek' | 'climb';

function classifyDay(day: TripDay): CardPattern {
  if (day.day === 8) return 'climb';
  if (day.day_type === 'rest') return 'rest';
  if (day.day_type === 'holy') return 'pilgrimage';
  if (day.day === 5) return 'combo';
  // Trek days: 7, 9, 10
  if ([7, 9, 10].includes(day.day)) return 'trek';
  // Travel days: 1, 3, 11, 13
  if ([1, 3, 11, 13].includes(day.day)) return 'travel';
  return 'travel';
}

// ---------------------------------------------------------------------------
// Chip components
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

// ---------------------------------------------------------------------------
// Connectivity icon
// ---------------------------------------------------------------------------

function ConnIcon({ status }: { status: TripDay['conn_status'] }) {
  if (status === 'offline') return <WifiOff size={12} className="text-red" />;
  if (status === 'intermittent') return <Wifi size={12} className="text-accent" />;
  return <Wifi size={12} className="text-green" />;
}

// ---------------------------------------------------------------------------
// Inner timeline
// ---------------------------------------------------------------------------

interface InnerTimelineProps {
  day: TripDay;
  tripDayIndex: number; // 0 if not during
  phase: 'before' | 'during' | 'after';
}

function InnerTimeline({ day, tripDayIndex, phase }: InnerTimelineProps) {
  const events = DAY_TIMELINES[day.day] || [];
  const isToday = phase === 'during' && tripDayIndex === day.day;

  return (
    <ol className="relative mt-4 ml-1 border-l border-border pl-6 space-y-4">
      {events.map((ev, i) => {
        // Determine visual state: past / current / future
        let dotClass = 'bg-muted';
        let textClass = 'text-ink';
        let timeClass = 'text-muted';

        if (isToday) {
          // Rough heuristic: first half of events = past for demo
          if (i < Math.floor(events.length / 3)) {
            dotClass = 'bg-border';
            textClass = 'text-muted';
            timeClass = 'text-border';
          } else if (i === Math.floor(events.length / 3)) {
            dotClass = 'bg-ink ring-2 ring-ink ring-offset-2 ring-offset-card';
            textClass = 'text-ink font-medium';
          }
        } else if (phase === 'after') {
          dotClass = 'bg-green';
          textClass = 'text-muted';
        }

        if (ev.highlight) {
          dotClass = day.day_type === 'critical' ? 'bg-red' : 'bg-accent';
          textClass = day.day_type === 'critical' ? 'text-red font-semibold' : 'text-accent font-semibold';
        }

        return (
          <li key={i} className="relative">
            <span
              className={
                'absolute -left-[27px] top-[5px] h-3 w-3 rounded-full border border-card ' + dotClass
              }
            />
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className={'font-mono text-[10px] shrink-0 ' + timeClass}>{ev.time}</span>
              <span className={'text-sm ' + textClass}>
                {ev.label}
                {ev.altitude_m ? (
                  <span className="ml-2 font-mono text-[10px] text-muted">{fmtDual(ev.altitude_m)}</span>
                ) : null}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
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
  // T-3 to T-0 (daysToDeparture <= 3), during Day 8, or after Day 8 + "Completed"
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

  // Persist user override
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
      value={day.conn_status === 'offline' ? 'offline' : day.conn_status === 'intermittent' ? 'limited' : 'good'}
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
  const cardBorder = isClimb ? 'border-red' : isToday ? 'border-ink' : 'border-border';
  const cardRing = isToday && !isClimb ? 'ring-1 ring-ink' : '';

  // Completed badge for Day 8 after the phase
  const showCompleted = isClimb && phase === 'after';

  // Day 8 collapsed header banner
  const showClimbBanner = isClimb && (daysToDeparture > 3 || phase === 'before') && !expanded;

  return (
    <article
      data-day={day.day}
      data-pattern={pattern}
      className={[
        'border rounded overflow-hidden transition-shadow',
        cardBg,
        cardBorder,
        cardRing,
        isClimb ? 'shadow-md shadow-red/10' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Climb header banner */}
      {isClimb && (
        <div className="bg-red px-4 py-1.5 font-mono text-[11px] font-medium text-card tracking-widest uppercase text-center">
          {'=== DOLMA LA PASS ==='}
        </div>
      )}

      {/* Rest badge (replaces chips entirely) */}
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
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-0.5">
                SACRED - {day.sacred_label}
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
            <p className="mt-0.5 text-xs text-muted font-mono">{day.weekday} {day.date}</p>
          </div>
          <span className="font-mono text-[10px] text-muted shrink-0 mt-0.5">{formatAltitude(day.altitude_peak)}</span>
        </div>

        <p className="mt-2 text-sm text-ink leading-snug">
          {day.headline}
          {pattern === 'combo' && (
            <span className="ml-2 font-mono text-[10px] bg-accent/10 text-accent border border-accent/20 rounded px-1.5 py-0.5 uppercase tracking-wide">
              LONG DAY
            </span>
          )}
        </p>
      </header>

      {/* Chips row (not shown for rest days) */}
      {!isRest && (
        <div className="px-4 pt-2 pb-0 flex flex-wrap gap-1.5">
          {altChip}
          {distChip}
          {timeChip}
          {connChip}
          {sleepChip}
        </div>
      )}

      {/* Collapse banner for D8 pre-phase */}
      {showClimbBanner && (
        <p className="px-4 pb-2 mt-2 font-mono text-xs text-red">
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

      {/* Expanded content: Level-2 inner timeline */}
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
            <div className="px-4 pb-5 border-t border-border mt-0 pt-3">
              <InnerTimeline day={day} tripDayIndex={tripDayIndex} phase={phase} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
