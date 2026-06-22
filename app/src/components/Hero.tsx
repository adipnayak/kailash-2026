/**
 * Hero component.
 * Phase-aware with 3 variants: before / during / after.
 * PRD reference: section 1 (Hero) + S0.15.0c (One Screen Test).
 *
 * v4 hero-bento: rebuilt as aliimam BentoGrid layout.
 *   - 4-col grid (lg), 3-col (md), 2-col (base)
 *   - Before phase: Hero card 2x2 + 6 stat tiles + Outstanding prep card
 *   - During/After: share the same bento shell with adapted content
 *
 * Anti-AI typography: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 * Devotional budget: JAI_BHOLE_NATH x1, YATRA_SAMPOORNA x1 (single import each).
 */

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  Mountain,
  Ruler,
  Snowflake,
  Sun,
  WifiOff,
  Globe,
  MapPin,
  Radio,
  TriangleAlert,
  Clock,
  Footprints,
} from '@aliimam/icons';
import type { JourneyState } from '../lib/journey-state';
import { JAI_BHOLE_NATH, YATRA_SAMPOORNA } from '../lib/devotional';
import { mToFt } from '../lib/conversions';
import { BentoGrid, BentoGridItem } from './aliimam/Bento';

gsap.registerPlugin(useGSAP);

// ---------------------------------------------------------------------------
// TZ toggle: shared across phases
// ---------------------------------------------------------------------------
// Prep list constants
// ---------------------------------------------------------------------------
const PREP_ITEMS: { id: string; label: string }[] = [
  { id: 'passport', label: 'Passport' },
  { id: 'flights', label: 'Flights' },
  { id: 'connectivity', label: 'Connectivity' },
  { id: 'packing', label: 'Packing' },
];

function usePrepProgress(): { completed: number; total: number; doneSet: Set<string> } {
  const total = PREP_ITEMS.length;
  if (typeof window === 'undefined') return { completed: 0, total, doneSet: new Set() };
  const doneSet = new Set(
    PREP_ITEMS.filter((item) => localStorage.getItem('prep_' + item.id) === 'true').map(
      (item) => item.id,
    ),
  );
  return { completed: doneSet.size, total, doneSet };
}

// ---------------------------------------------------------------------------
// Stat tile: canonical pattern per Adip spec
// ---------------------------------------------------------------------------
interface StatTileProps {
  value: string;
  unit?: string;
  dual?: string; // e.g. "/ 18,471 ft" - altitude only
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

function StatTile({ value, unit, dual, label, sublabel, icon }: StatTileProps) {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="text-muted-foreground mb-1">{icon}</div>
      <div className="font-sans text-3xl font-bold text-foreground leading-none">
        {value}
        {unit && (
          <span className="text-base font-medium text-muted-foreground ml-0.5">{unit}</span>
        )}
        {dual && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">{dual}</span>
        )}
      </div>
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="font-sans text-sm text-muted-foreground">{sublabel}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Connectivity icon helper
// ---------------------------------------------------------------------------
function ConnIcon({ status }: { status: 'good' | 'intermittent' | 'offline' }) {
  if (status === 'good')
    return <Radio size={12} className="text-emerald" aria-label="Good connectivity" />;
  if (status === 'intermittent')
    return <Radio size={12} className="text-sacred" aria-label="Intermittent connectivity" />;
  return <TriangleAlert size={12} className="text-destructive" aria-label="No connectivity" />;
}

// ---------------------------------------------------------------------------
// BEFORE phase: the main bento layout
// ---------------------------------------------------------------------------
function BeforeBento({ state }: { state: JourneyState }) {
  const countdownRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { completed, total, doneSet } = usePrepProgress();
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  useGSAP(() => {
    if (!countdownRef.current) return;
    const target = { val: 0 };
    gsap.to(target, {
      val: state.daysToDeparture,
      duration: 1.2,
      ease: 'power3.out',
      onUpdate() {
        if (countdownRef.current) {
          countdownRef.current.textContent = String(Math.round(target.val));
        }
      },
    });
  }, [state.daysToDeparture]);

  useGSAP(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('li');
    gsap.fromTo(
      items,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power2.out', delay: 0.6 },
    );
  }, []);

  return (
    <BentoGrid cols={{ base: 2, md: 3, lg: 4 }}>
      {/* ------------------------------------------------------------------ */}
      {/* Hero card: 2 cols x 2 rows                                          */}
      {/* ------------------------------------------------------------------ */}
      <BentoGridItem
        colSpan={2}
        className="flex flex-col items-start justify-center gap-2"
      >
        {/* Big countdown · ONLY thing in the Hero card (with JBN) */}
        <div className="flex items-baseline gap-2">
          <span
            ref={countdownRef}
            className="font-sans text-5xl md:text-6xl font-medium text-foreground leading-none tabular-nums"
            aria-live="polite"
          >
            {state.daysToDeparture}
          </span>
          <span className="font-sans text-lg md:text-xl font-medium text-muted-foreground">
            days to Kailash
          </span>
        </div>

        {/* JAI BHOLE NATH · x1 total, ochre sacred token */}
        <p className="font-mono text-xs md:text-sm text-sacred uppercase tracking-widest">
          {JAI_BHOLE_NATH}
        </p>
      </BentoGridItem>

      {/* ------------------------------------------------------------------ */}
      {/* Stat 1: Highest altitude (top right, row 1)                         */}
      {/* ------------------------------------------------------------------ */}
      <BentoGridItem>
        <StatTile
          value="5,630"
          unit="m"
          dual={'/ ' + mToFt(5630).toLocaleString('en-US') + ' ft'}
          label="HIGHEST ALTITUDE"
          sublabel="Dolma La pass - Day 8"
          icon={<Mountain size={20} />}
        />
      </BentoGridItem>

      {/* ------------------------------------------------------------------ */}
      {/* Stat 2: Longest trek day (row 2 right)                              */}
      {/* ------------------------------------------------------------------ */}
      <BentoGridItem>
        <StatTile
          value="22"
          unit="km"
          label="LONGEST TREK DAY"
          sublabel="8 to 9 h - Day 8"
          icon={<Ruler size={20} />}
        />
      </BentoGridItem>

      {/* ------------------------------------------------------------------ */}
      {/* Row 3: Outstanding prep (2 cols) + Stat 3 + Stat 4                  */}
      {/* ------------------------------------------------------------------ */}

      {/* Outstanding prep card */}
      <BentoGridItem colSpan={2} className="flex flex-col gap-4">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
          {total - completed} of {total} things left
        </p>
        <ul ref={listRef} className="space-y-1 flex-1">
          {PREP_ITEMS.map((item) => {
            const done = doneSet.has(item.id);
            return (
              <li
                key={item.id}
                className={
                  'flex items-center gap-2 font-mono text-xs ' +
                  (done ? 'text-muted-foreground line-through' : 'text-foreground')
                }
              >
                <span
                  className={
                    'inline-block w-2 h-2 rounded-full border flex-shrink-0 ' +
                    (done ? 'bg-emerald border-emerald' : 'border-muted')
                  }
                />
                {item.label}
              </li>
            );
          })}
        </ul>
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-xs text-muted-foreground">
            <span>Preparation</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1 w-full bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-sacred transition-all duration-700"
              style={{ width: pct + '%' }}
            />
          </div>
        </div>
      </BentoGridItem>

      {/* Stat 3: Coldest expected */}
      <BentoGridItem>
        <StatTile
          value="-5 to +5"
          unit="C"
          label="COLDEST EXPECTED"
          sublabel="Pass overnight low"
          icon={<Snowflake size={20} />}
        />
      </BentoGridItem>

      {/* Stat 4: Warmest expected */}
      <BentoGridItem>
        <StatTile
          value="29"
          unit="C"
          label="WARMEST EXPECTED"
          sublabel="Kathmandu monsoon"
          icon={<Sun size={20} />}
        />
      </BentoGridItem>

      {/* ------------------------------------------------------------------ */}
      {/* Row 4: Stat 5 + Stat 6 (bottom row, small cards)                   */}
      {/* ------------------------------------------------------------------ */}

      {/* Stat 5: Offline */}
      <BentoGridItem>
        <StatTile
          value="3"
          unit="days"
          label="OFFLINE"
          sublabel="Parikrama - Days 7, 8, 9"
          icon={<WifiOff size={20} />}
        />
      </BentoGridItem>

      {/* Stat 6: Border crossings */}
      <BentoGridItem>
        <StatTile
          value="2"
          label="BORDER CROSSINGS"
          sublabel="Nepal to China and back"
          icon={<Globe size={20} />}
        />
      </BentoGridItem>

      {/* Stat 7: Yatra length */}
      <BentoGridItem>
        <StatTile
          value="13"
          unit="days"
          label="YATRA LENGTH"
          sublabel="Mumbai to Mumbai door to door"
          icon={<Clock size={20} />}
        />
      </BentoGridItem>

      {/* Stat 8: Parikrama circuit */}
      <BentoGridItem>
        <StatTile
          value="52"
          unit="km"
          label="PARIKRAMA CIRCUIT"
          sublabel="Darchen loop - Days 7, 8, 9"
          icon={<Footprints size={20} />}
        />
      </BentoGridItem>
    </BentoGrid>
  );
}

// ---------------------------------------------------------------------------
// DURING phase: bento shell with live-trip content
// ---------------------------------------------------------------------------
function DuringBento({ state }: { state: JourneyState }) {
  const today = state.todayData;
  const tomorrow = state.tomorrowData;
  const daysRemaining = 13 - state.tripDayIndex;

  return (
    <BentoGrid cols={{ base: 2, md: 3, lg: 4 }}>
      {/* Main card: day + location */}
      <BentoGridItem colSpan={2} rowSpan={2} className="flex flex-col gap-4 justify-between">
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">
            Kailash Mansarovar Yatra 2026
          </p>
          <div className="flex items-baseline gap-4">
            <span className="font-sans text-7xl font-medium text-foreground leading-none tabular-nums">
              {state.tripDayIndex}
            </span>
            <span className="font-sans text-2xl font-medium text-muted-foreground">
              of 13
            </span>
          </div>
          {today && (
            <p className="font-sans text-xl font-medium text-foreground mt-2">
              {today.location}
            </p>
          )}
        </div>

        {today && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">
                {today.altitude_peak.toLocaleString('en-US')}m /{' '}
                {mToFt(today.altitude_peak).toLocaleString('en-US')}ft
              </span>
              <span className="ml-auto">
                <ConnIcon status={today.conn_status} />
              </span>
            </div>
            <p className="font-sans text-sm text-muted-foreground">{today.headline}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <span className="font-mono text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">{daysRemaining}</span> days remaining
          </span>
          <span className="text-border font-mono text-xs">|</span>
          <span className="font-mono text-xs">
            <span className="font-semibold">RETURN</span>{' '}
            <span className="text-muted-foreground">19 Jul 2026</span>
          </span>
        </div>
      </BentoGridItem>

      {/* Tomorrow card */}
      <BentoGridItem>
        {tomorrow ? (
          <div className="flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Tomorrow
              </span>
              <Clock size={12} className="text-muted-foreground" />
            </div>
            <p className="font-sans text-base font-medium text-foreground">{tomorrow.location}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {tomorrow.altitude_peak.toLocaleString('en-US')}m /{' '}
              {mToFt(tomorrow.altitude_peak).toLocaleString('en-US')}ft
            </p>
          </div>
        ) : (
          <div className="font-mono text-xs text-muted-foreground">Final day</div>
        )}
      </BentoGridItem>

      {/* Current altitude stat */}
      <BentoGridItem>
        {today && (
          <StatTile
            value={today.altitude_peak.toLocaleString('en-US')}
            unit="m"
            dual={'/ ' + mToFt(today.altitude_peak).toLocaleString('en-US') + ' ft'}
            label="TODAY ALTITUDE"
            sublabel={today.location}
            icon={<Mountain size={20} />}
          />
        )}
      </BentoGridItem>

      {/* Progress */}
      <BentoGridItem colSpan={2}>
        <div className="space-y-2 h-full flex flex-col justify-center">
          <div className="flex justify-between font-mono text-xs text-muted-foreground">
            <span>Yatra progress</span>
            <span>{state.progressPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-sacred transition-all duration-700"
              style={{ width: state.progressPct + '%' }}
            />
          </div>
        </div>
      </BentoGridItem>

      <BentoGridItem>
        <StatTile
          value="5,630"
          unit="m"
          dual={'/ ' + mToFt(5630).toLocaleString('en-US') + ' ft'}
          label="PEAK (Dolma La)"
          sublabel="Day 8 - Parikrama"
          icon={<Mountain size={20} />}
        />
      </BentoGridItem>

      <BentoGridItem>
        <StatTile
          value="3"
          unit="days"
          label="OFFLINE"
          sublabel="Parikrama - Days 7, 8, 9"
          icon={<WifiOff size={20} />}
        />
      </BentoGridItem>
    </BentoGrid>
  );
}

// ---------------------------------------------------------------------------
// AFTER phase: bento shell with completion content
// ---------------------------------------------------------------------------
function AfterBento({ state: _state }: { state: JourneyState }) {
  const returnDt = new Date('2026-07-19T00:00:00');
  const nowMid = new Date();
  nowMid.setHours(0, 0, 0, 0);
  const returnedDaysAgo = Math.max(
    0,
    Math.round((nowMid.getTime() - returnDt.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <BentoGrid cols={{ base: 2, md: 3, lg: 4 }}>
      {/* Completion hero card */}
      <BentoGridItem colSpan={2} rowSpan={2} className="flex flex-col gap-4 justify-between">
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Kailash Mansarovar Yatra 2026
          </p>
          {/* YATRA_SAMPOORNA x1 total */}
          <h2 className="font-sans text-3xl font-medium text-foreground">
            {YATRA_SAMPOORNA}
          </h2>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
            13-day parikrama complete
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground border border-border rounded-none px-4 py-2 bg-background">
          {(['KTM', 'LHASA', 'KAILASH', 'KTM'] as const).map((stop, i, arr) => (
            <span key={i} className="flex items-center gap-x-1">
              <span className="text-foreground font-medium">{stop}</span>
              {i < arr.length - 1 && <span className="text-border">{'>'}</span>}
            </span>
          ))}
        </div>

        <p className="font-sans text-sm text-muted-foreground">
          Returned {returnedDaysAgo} day{returnedDaysAgo !== 1 ? 's' : ''} ago.
          13 days. 5,630m peak. Parikrama complete.
        </p>
      </BentoGridItem>

      {/* Final stats */}
      <BentoGridItem>
        <StatTile
          value="5,630"
          unit="m"
          dual={'/ ' + mToFt(5630).toLocaleString('en-US') + ' ft'}
          label="PEAK ALTITUDE"
          sublabel="Dolma La pass - Day 8"
          icon={<Mountain size={20} />}
        />
      </BentoGridItem>

      <BentoGridItem>
        <StatTile
          value="22"
          unit="km"
          label="LONGEST TREK DAY"
          sublabel="Day 8 parikrama"
          icon={<Ruler size={20} />}
        />
      </BentoGridItem>

      <BentoGridItem>
        <StatTile
          value="13"
          unit="days"
          label="YATRA COMPLETE"
          sublabel="All legs completed"
          icon={<Globe size={20} />}
        />
      </BentoGridItem>

      <BentoGridItem>
        <StatTile
          value="2"
          label="BORDER CROSSINGS"
          sublabel="Nepal to China and back"
          icon={<Globe size={20} />}
        />
      </BentoGridItem>

      <BentoGridItem>
        <StatTile
          value="-5 to +5"
          unit="C"
          label="COLDEST REACHED"
          sublabel="Dolma La pass overnight"
          icon={<Snowflake size={20} />}
        />
      </BentoGridItem>

      <BentoGridItem>
        <StatTile
          value="3"
          unit="days"
          label="OFFLINE SURVIVED"
          sublabel="Parikrama blackout"
          icon={<WifiOff size={20} />}
        />
      </BentoGridItem>
    </BentoGrid>
  );
}

// ---------------------------------------------------------------------------
// Main Hero export
// ---------------------------------------------------------------------------
export function Hero({ phase }: { phase: JourneyState }) {
  return (
    <section
      data-section="hero"
      className="border-b border-border bg-background px-4 py-6 md:px-6 md:py-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Phase variants */}
        <AnimatePresence mode="wait">
          {phase.phase === 'before' && (
            <motion.div
              key="before"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <BeforeBento state={phase} />
            </motion.div>
          )}

          {phase.phase === 'during' && (
            <motion.div
              key="during"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <DuringBento state={phase} />
            </motion.div>
          )}

          {phase.phase === 'after' && (
            <motion.div
              key="after"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <AfterBento state={phase} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
