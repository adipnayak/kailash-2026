/**
 * DayCard -- aliimam Card pricing-pattern layout.
 * CardHeader: title + price-like dominant stat + description.
 * CardContent: dashed hr + CARRY CRITICAL list with Check icons.
 * CardFooter: "View full day" CTA (outline, rounded-none).
 * Expanded: all 9 rich sections behind the CTA.
 *
 * 6 day-type dominant stat mapping (PRD v3.12 ss0.16.8):
 *   travel  -> duration label (D1 D3 D11 D13)
 *   combo   -> distance km (D5)
 *   rest    -> "REST" (D2 D4 D12)
 *   pilgrimage -> sacred label text (D6)
 *   trek    -> distance km (D7 D9 D10)
 *   climb   -> altitude m/ft in destructive red (D8)
 *
 * Day 8 critical: border-2 border-destructive, warn banner above, red title,
 *   full-width grid span, phase-conditional auto-expand.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AliimamFeature } from './aliimam/AliimamFeature';
import {
  Check,
  Mountain,
  Clock,
  Wifi,
  WifiOff,
  Bed,
  CircleCheck,
  Thermometer,
  WindFilled,
  Sun,
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
  HardHat,
  Eye,
  Ruler,
} from '@aliimam/icons';
import gsap from 'gsap';
import type { TripDay } from '../lib/trip-data';
import { mToFt } from '../lib/conversions';
import { computeJourneyState } from '../lib/journey-state';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './ui/card';
import { Button } from './ui/button';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDual(m: number): string {
  return m.toLocaleString('en-US') + ' m / ' + mToFt(m).toLocaleString('en-US') + ' ft';
}

// ---------------------------------------------------------------------------
// Classify day into 6 patterns from the spec
// ---------------------------------------------------------------------------

type CardPattern = 'travel' | 'combo' | 'rest' | 'pilgrimage' | 'trek' | 'climb';

function classifyDay(day: TripDay): CardPattern {
  if (day.day === 8) return 'climb';
  if (day.day_type === 'rest') return 'rest';
  if (day.day_type === 'holy') return 'pilgrimage';
  if (day.day === 5) return 'combo';
  if ([7, 9, 10].includes(day.day)) return 'trek';
  return 'travel';
}

// Dominant stat text per day-type (the "price-like" big text in CardHeader)
const DAY_DURATION_LABEL: Record<number, string | null> = {
  1: '6 h transit',
  3: '4 h flight',
  5: '10 h drive',
  6: null,
  7: '8 h trek',
  8: '16 h summit',
  9: '7 h trek',
  10: '11 h drive',
  11: '4 h flight',
  13: '2 h transit',
};

const DAY_DISTANCE_KM: Record<number, number | null> = {
  5: 780,
  7: 22,
  8: 20,
  9: 15,
  10: 780,
};

function getDominantStat(day: TripDay, pattern: CardPattern): string {
  switch (pattern) {
    case 'climb':
      return fmtDual(day.altitude_peak);
    case 'trek': {
      const km = DAY_DISTANCE_KM[day.day];
      return km !== null && km !== undefined ? km + ' km' : (DAY_DURATION_LABEL[day.day] ?? '--');
    }
    case 'combo': {
      const km = DAY_DISTANCE_KM[day.day];
      return km !== null && km !== undefined ? km.toLocaleString('en-US') + ' km' : '--';
    }
    case 'travel':
      return DAY_DURATION_LABEL[day.day] ?? '--';
    case 'rest':
      return 'REST';
    case 'pilgrimage':
      return day.sacred_label ?? 'SACRED';
    default:
      return '--';
  }
}

// ---------------------------------------------------------------------------
// ConnIcon
// ---------------------------------------------------------------------------

function ConnIcon({ status }: { status: TripDay['conn_status'] }) {
  if (status === 'offline') return <WifiOff size={12} className="text-destructive" />;
  if (status === 'intermittent') return <Wifi size={12} className="text-sacred" />;
  return <Wifi size={12} className="text-emerald" />;
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ label }: { label: string }) {
  return (
    <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 mt-5 first:mt-0 border-b border-border pb-1">
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
          <Thermometer size={12} className="text-sacred shrink-0" />
          <span className="font-mono text-[11px] text-muted-foreground">HIGH</span>
          <span className="font-mono text-[11px] text-foreground font-medium">{w.temp_high} C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Thermometer size={12} className="text-emerald shrink-0" />
          <span className="font-mono text-[11px] text-muted-foreground">LOW</span>
          <span className="font-mono text-[11px] text-foreground font-medium">{w.temp_low} C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Snowflake size={12} className="text-muted-foreground shrink-0" />
          <span className="font-mono text-[11px] text-muted-foreground">FEELS</span>
          <span className="font-mono text-[11px] text-foreground font-medium">{w.feels_like} C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CloudRain size={12} className="text-emerald shrink-0" />
          <span className="font-mono text-[11px] text-muted-foreground">RAIN</span>
          <span className="font-mono text-[11px] text-foreground font-medium">{w.rain_pct}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <WindFilled size={12} className="text-muted-foreground shrink-0" />
          <span className="font-mono text-[11px] text-muted-foreground">WIND</span>
          <span className="font-mono text-[11px] text-foreground font-medium">{w.wind_kmh} km/h</span>
          <span className="font-mono text-[10px] text-muted-foreground">({w.wind_label})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sun size={12} className="text-sacred shrink-0" />
          <span className="font-mono text-[11px] text-muted-foreground">UV</span>
          <span className="font-mono text-[11px] text-foreground font-medium">{w.uv}</span>
        </div>
      </div>
      <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">SOURCE: {w.source.toUpperCase()}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Timeline block
// ---------------------------------------------------------------------------

function TimelineBlock({ day }: { day: TripDay }) {
  const events = day.timeline || [];
  return (
    <div>
      <SectionHeader label="Timeline" />
      <ol className="relative ml-1 border-l border-border pl-5 space-y-3">
        {events.map((ev, i) => {
          const isHighlight = day.day_type === 'critical' && i === Math.floor(events.length / 2);
          const dotClass = isHighlight ? 'bg-destructive' : 'bg-border';
          const textClass = isHighlight ? 'text-destructive font-semibold' : 'text-foreground';
          return (
            <li key={i} className="relative">
              <span
                className={
                  'absolute -left-[23px] top-[5px] h-2.5 w-2.5 rounded-full border border-card ' + dotClass
                }
              />
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-muted-foreground shrink-0 w-[52px]">{ev.time}</span>
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
    { label: 'BOTTOM', value: w.bottom, icon: <Ruler size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
    { label: 'TOP', value: w.top, icon: <Shirt size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
    { label: 'FEET', value: w.feet, icon: <MapPin size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
    { label: 'HANDS', value: w.hands, icon: <Snowflake size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
    { label: 'HEAD / FACE', value: w.head_face, icon: <HardHat size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
  ];
  return (
    <div>
      <SectionHeader label="What to Wear" />
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[80px_1fr] gap-x-3 items-start">
            <div className="flex items-center gap-1">
              {r.icon}
              <span className="font-mono text-[10px] text-muted-foreground uppercase">{r.label}</span>
            </div>
            <span className="text-xs text-foreground">{r.value}</span>
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
              <Utensils size={11} className="text-muted-foreground shrink-0 mt-0.5" />
              <span className="font-mono text-[10px] text-muted-foreground uppercase">{r.label}</span>
            </div>
            <span className="text-xs text-foreground">{r.value}</span>
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
    { label: 'TYPE', value: b.type, icon: <Toilet size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
    { label: 'WATER', value: b.water, icon: <GlassWater size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
    { label: 'SHOWER', value: b.shower, icon: <ShowerHead size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
    { label: 'NOTES', value: b.notes, icon: <Eye size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
  ];
  return (
    <div>
      <SectionHeader label="Bathroom" />
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[80px_1fr] gap-x-3 items-start">
            <div className="flex items-center gap-1">
              {r.icon}
              <span className="font-mono text-[10px] text-muted-foreground uppercase">{r.label}</span>
            </div>
            <span className="text-xs text-foreground">{r.value}</span>
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
    { label: 'WAKE', value: t.wake, icon: <AlarmClock size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
    { label: 'WALK H', value: String(t.walk_h), icon: <Clock size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
    { label: 'TREK H', value: String(t.active_trek_h), icon: <Mountain size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
    { label: 'REST H', value: String(t.rest_h), icon: <Bed size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
    { label: 'SLEEP H', value: String(t.sleep_target_h), icon: <Bed size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
    { label: 'NOTES', value: t.notes, icon: <Eye size={11} className="text-muted-foreground shrink-0 mt-0.5" /> },
  ];
  return (
    <div>
      <SectionHeader label="Timing" />
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[80px_1fr] gap-x-3 items-start">
            <div className="flex items-center gap-1">
              {r.icon}
              <span className="font-mono text-[10px] text-muted-foreground uppercase">{r.label}</span>
            </div>
            <span className="text-xs text-foreground">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// carryIcon removed: CardContent now uses uniform Check icons per aliimam pricing pattern.
// Specialised icon imports retained below for the 9 rich sections in ExpandedBody.

// ---------------------------------------------------------------------------
// 8. Spiritual focus
// ---------------------------------------------------------------------------

function SpiritualBlock({ day }: { day: TripDay }) {
  if (!day.spiritual_focus) return null;
  const sf = day.spiritual_focus;
  return (
    <div className="-mx-4">
      <AliimamFeature
        eyebrow="Spiritual Focus"
        title={sf.title}
        body={sf.body}
        cards={[
          {
            icon: <CandleFilled size={16} className="text-sacred" />,
            title: sf.title,
            body: sf.body,
          },
        ]}
        ctaLabel=""
        ctaHref=""
      />
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
        <Bed size={12} className="text-muted-foreground shrink-0" />
        <span className="font-mono text-[10px] text-muted-foreground uppercase mr-1">STAY</span>
        <span className="font-mono text-[11px] text-foreground font-medium">{day.stay}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <ShowerHead size={12} className="text-muted-foreground shrink-0" />
        <span className="font-mono text-[10px] text-muted-foreground uppercase mr-1">BATHING</span>
        <span className="font-mono text-[11px] text-foreground">{day.bathing}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Expanded body: sections 1-2 + 3-8 + 9 footer (carry critical is above fold)
// ---------------------------------------------------------------------------

function ExpandedBody({ day }: { day: TripDay }) {
  return (
    <div className="px-6 pb-6 border-t border-border pt-4 space-y-0">
      <WeatherBlock day={day} />
      <TimelineBlock day={day} />
      <WearBlock day={day} />
      <FoodBlock day={day} />
      <BathroomBlock day={day} />
      <TimingBlock day={day} />
      <SpiritualBlock day={day} />
      <FooterStrip day={day} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Connectivity chip (inline, subtle)
// ---------------------------------------------------------------------------

function ConnLabel({ day }: { day: TripDay }) {
  const label =
    day.conn_status === 'offline'
      ? 'offline'
      : day.conn_status === 'intermittent'
      ? 'limited signal'
      : 'good signal';
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
      <ConnIcon status={day.conn_status} />
      {label}
    </span>
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

  // Journey state for phase-aware expansion logic
  const stateRef = useRef(computeJourneyState());
  const js = stateRef.current;
  const daysToDeparture = js.daysToDeparture;
  const tripDayIndex = js.tripDayIndex;
  const phase = js.phase;

  // Day 8 auto-expand: T-3 onward, during Day 8+, or after
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

  // GSAP gloss on first mount for pilgrimage / climb / today cards
  const headerRef = useRef<HTMLDivElement>(null);
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

  const dominantStat = getDominantStat(day, pattern);

  // Completed badge (Day 8 post-trip)
  const showCompleted = isClimb && phase === 'after';

  // Pre-close banner for Day 8 (collapsed, T>3)
  const showClimbBanner = isClimb && daysToDeparture > 3 && phase === 'before' && !expanded;

  // Card class overrides
  const cardCls = [
    'flex flex-col h-full overflow-hidden transition-shadow',
    isClimb ? 'border-2 border-destructive bg-destructive/5 shadow-md' : '',
    isToday && !isClimb ? 'border-primary ring-1 ring-primary' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* Day 8 warn banner ABOVE card */}
      {isClimb && (
        <div className="mb-2 rounded-none border-2 border-destructive bg-destructive/10 px-4 py-2 flex items-start gap-2">
          <TriangleAlert size={14} className="text-destructive shrink-0 mt-0.5" />
          <p className="font-mono text-xs text-destructive font-medium">
            22 km on foot. 5,630 m pass. 04:00 wake. No bailout after the pass.
          </p>
        </div>
      )}

      <Card className={cardCls} data-day={day.day} data-pattern={pattern}>
        {/* Climb rule header strip */}
        {isClimb && (
          <div className="bg-destructive px-4 py-2 font-mono text-[11px] font-medium text-destructive-foreground tracking-widest uppercase text-center">
            DOLMA LA PASS
          </div>
        )}

        {/* Completed badge for Day 8 post-trip */}
        {showCompleted && (
          <div className="px-6 pt-4 pb-0">
            <span className="inline-flex items-center gap-1 rounded-none bg-emerald/10 border border-emerald/30 px-2 py-0.5 font-mono text-[10px] text-emerald uppercase tracking-wide">
              <CircleCheck size={10} /> Completed · 5,630 m crossed
            </span>
          </div>
        )}

        {/* Rest badge */}
        {isRest && (
          <div className="px-6 pt-4 pb-0">
            <span className="inline-flex items-center gap-1 rounded-none bg-emerald/10 border border-emerald/30 px-2 py-0.5 font-mono text-[10px] text-emerald uppercase tracking-wide">
              <Bed size={10} /> Rest day
            </span>
          </div>
        )}

        {/* CardHeader */}
        <CardHeader ref={headerRef}>
          {/* Sacred label (pilgrimage + climb) */}
          {isPilgrimage && day.sacred_label && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-sacred mb-0.5 flex items-center gap-1">
              <Heart size={10} className="shrink-0" />
              SACRED
            </p>
          )}

          <div className="flex items-start justify-between gap-2">
            <CardTitle className={isClimb ? 'text-destructive' : ''}>
              Day {day.day} · {day.location}
            </CardTitle>
            {/* Badge (CRITICAL DAY, SNAN AND PUJA, RECOVERY) */}
            {day.badge && (
              <span
                className={[
                  'font-mono text-[10px] uppercase tracking-wide rounded-none border px-2 py-0.5 shrink-0 mt-1',
                  day.badge === 'CRITICAL DAY'
                    ? 'bg-destructive/10 border-destructive/30 text-destructive'
                    : day.badge === 'SNAN AND PUJA'
                    ? 'bg-sacred/10 border-sacred/30 text-sacred'
                    : 'bg-emerald/10 border-emerald/30 text-emerald',
                ].join(' ')}
              >
                {day.badge}
              </span>
            )}
          </div>

          {/* "Price-like" dominant stat */}
          <span
            className={[
              'my-3 block text-2xl font-semibold font-sans',
              isClimb ? 'text-destructive' : 'text-foreground',
            ].join(' ')}
          >
            {dominantStat}
            {pattern === 'combo' && (
              <span className="ml-3 font-mono text-[10px] bg-sacred/10 text-sacred border border-sacred/20 px-1.5 py-0.5 uppercase tracking-wide align-middle">
                LONG DAY
              </span>
            )}
          </span>

          <CardDescription>
            <span className="font-mono">{day.weekday} {day.date}</span>
            {' · '}
            <ConnLabel day={day} />
            {' · '}
            <span className="font-mono">sleep {fmtDual(day.altitude_sleep)}</span>
          </CardDescription>

          {/* Subtitle */}
          <p className="mt-2 text-sm text-foreground leading-snug">
            {day.subtitle}
          </p>
        </CardHeader>

        {/* CardContent: dashed hr + CARRY CRITICAL list with Check icons */}
        <CardContent className="space-y-4">
          <hr className="border-dashed border-border" />

          <ul className="list-outside space-y-3 text-sm">
            {(day.carry_critical || []).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-foreground">
                <Check className="size-3 mt-1 shrink-0 text-muted-foreground" />
                {item}
              </li>
            ))}
          </ul>

          {/* Pre-close banner for Day 8 (not yet close) */}
          {showClimbBanner && (
            <p className="font-mono text-[10px] text-destructive">
              Auto-expands T-3 before Dolma La.
            </p>
          )}
        </CardContent>

        {/* CardFooter: CTA */}
        <CardFooter className="mt-auto">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={toggle}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide details' : 'View full day'}
          </Button>
        </CardFooter>

        {/* Rich sections behind expand (Weather / Timeline / WTW / Food / Bathroom / Timing / Spiritual / Stay) */}
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
      </Card>
    </>
  );
}
