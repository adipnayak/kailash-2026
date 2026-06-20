/**
 * Hero component.
 * Phase-aware with 3 variants: before / during / after.
 * PRD reference: section 1 (Hero) + §0.15.0c (One Screen Test).
 *
 * Anti-AI typography: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 * Devotional budget: JAI_BHOLE_NATH x1, YATRA_SAMPOORNA x1 (single import each).
 *
 * v4 rescue: restored subtitle, cohort line, DEPART/RETURN dates row, tz toggle.
 */

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Mountain, MapPin, Radio, TriangleAlert, Clock, PlaneTakeoff, PlaneLanding } from '@aliimam/icons';
import type { JourneyState } from '../lib/journey-state';
import { JAI_BHOLE_NATH, YATRA_SAMPOORNA } from '../lib/devotional';
import { mToFt } from '../lib/conversions';
import { getStoredTzMode, setStoredTzMode, type TzMode } from '../lib/timezone';

gsap.registerPlugin(useGSAP);

// ---------------------------------------------------------------------------
// Shared Hero header: subtitle + cohort line + DEPART/RETURN row + TZ toggle
// Phase-stable: renders in all 3 phases.
// ---------------------------------------------------------------------------
function HeroHeader() {
  const [tzMode, setTzMode] = useState<TzMode>(() => getStoredTzMode());

  function toggleTz(mode: TzMode) {
    setTzMode(mode);
    setStoredTzMode(mode);
  }

  return (
    <div className="mb-5 space-y-2">
      {/* Cohort line (subtitle moved up to AliimamHero) */}
      <p className="font-sans text-sm text-muted-foreground">
        This is the 7 to 19 July 2026 batch. 23 yatris are joining from India, the UAE, Mauritius, and the United States.
      </p>

      {/* DEPART / RETURN date row */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground">
          <PlaneTakeoff size={13} className="text-muted-foreground" />
          <span className="font-semibold">DEPART</span>
          <span className="text-muted-foreground">07 Jul 2026 - Tue</span>
        </span>
        <span className="text-border font-mono text-xs">|</span>
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground">
          <PlaneLanding size={13} className="text-muted-foreground" />
          <span className="font-semibold">RETURN</span>
          <span className="text-muted-foreground">19 Jul 2026 - Sun</span>
        </span>
      </div>

      {/* TZ toggle */}
      <div className="flex items-center gap-2 pt-1">
        <span className="font-mono text-xs text-muted-foreground">Times shown in your local time</span>
        <div
          className="inline-flex rounded border border-border overflow-hidden"
          role="group"
          aria-label="Timezone mode"
        >
          <button
            onClick={() => toggleTz('local')}
            className={
              'px-2.5 py-1 font-mono text-xs transition-colors ' +
              (tzMode === 'local'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:text-foreground')
            }
          >
            Local
          </button>
          <button
            onClick={() => toggleTz('trip')}
            className={
              'px-2.5 py-1 font-mono text-xs border-l border-border transition-colors ' +
              (tzMode === 'trip'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:text-foreground')
            }
          >
            Trip time
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prep list: 4 REQUIRED items only (Medical = OPTIONAL excluded, Insurance REMOVED)
// ---------------------------------------------------------------------------
const PREP_ITEMS: { id: string; label: string }[] = [
  { id: 'passport', label: 'Passport' },
  { id: 'flights', label: 'Flights' },
  { id: 'connectivity', label: 'Connectivity' },
  { id: 'packing', label: 'Packing' },
];

function usePrepProgress(): { completed: number; total: number } {
  // Read from localStorage; keys match PreparationDashboard convention
  const total = PREP_ITEMS.length;
  if (typeof window === 'undefined') return { completed: 0, total };
  const completed = PREP_ITEMS.filter(
    (item) => localStorage.getItem('prep_' + item.id) === 'true',
  ).length;
  return { completed, total };
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
// BEFORE phase
// ---------------------------------------------------------------------------
function BeforeHero({ state }: { state: JourneyState }) {
  const countdownRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { completed, total } = usePrepProgress();
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // GSAP countdown: animate from 0 to daysToDeparture
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

  // GSAP stagger on prep list
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
    <div className="space-y-4">
      {/* Big countdown */}
      <div className="flex items-baseline gap-3">
        <span
          ref={countdownRef}
          className="font-sans text-7xl font-medium text-foreground leading-none tabular-nums"
          aria-live="polite"
        >
          {state.daysToDeparture}
        </span>
        <span className="font-sans text-2xl font-medium text-muted-foreground">
          days to Kailash
        </span>
      </div>

      {/* Subhead: JAI_BHOLE_NATH x1 total */}
      <p className="font-mono text-sm text-sacred uppercase tracking-widest">
        {JAI_BHOLE_NATH}
      </p>

      {/* Inline route + peak strip (fold-fix) */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground border border-border rounded px-3 py-2 bg-card">
        {['KTM', 'LHASA', 'MANSAROVAR', 'KAILASH', 'KTM'].map((stop, i, arr) => (
          <span key={i} className="flex items-center gap-x-1">
            <span className="text-foreground font-medium">{stop}</span>
            {i < arr.length - 1 && <span className="text-border">{'>'}</span>}
          </span>
        ))}
        <span className="ml-auto text-sacred font-medium">
          Peak: Dolma La 5,630m / {mToFt(5630).toLocaleString('en-US')}ft Day 8
        </span>
      </div>

      {/* Outstanding prep list */}
      <div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
          {PREP_ITEMS.length - completed} of {PREP_ITEMS.length} things left
        </p>
        <ul ref={listRef} className="space-y-1">
          {PREP_ITEMS.map((item) => {
            const done = typeof window !== 'undefined'
              ? localStorage.getItem('prep_' + item.id) === 'true'
              : false;
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
                    'inline-block w-2 h-2 rounded-full border ' +
                    (done ? 'bg-emerald border-emerald' : 'border-muted')
                  }
                />
                {item.label}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Preparation progress bar */}
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// DURING phase
// ---------------------------------------------------------------------------
function DuringHero({ state }: { state: JourneyState }) {
  const today = state.todayData;
  const tomorrow = state.tomorrowData;
  const daysRemaining = 13 - state.tripDayIndex;

  return (
    <div className="space-y-4">
      {/* Stat strip at top (fold-fix: replaces 180px blank) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground border border-border rounded px-3 py-2 bg-card">
        <span>
          <span className="text-foreground font-medium">DAY {state.tripDayIndex} OF 13</span>
        </span>
        {today && (
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            <span className="text-foreground font-medium">{today.location}</span>
            <span className="text-muted-foreground">
              {today.altitude_peak.toLocaleString('en-US')}m /
              {mToFt(today.altitude_peak).toLocaleString('en-US')}ft
            </span>
          </span>
        )}
        <span>
          <span className="text-foreground font-medium">{daysRemaining}</span>
          <span className="text-muted-foreground"> days remaining</span>
        </span>
      </div>

      {/* Today chip */}
      {today && (
        <div className="rounded border border-border bg-card px-4 py-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Today</span>
            <ConnIcon status={today.conn_status} />
          </div>
          <p className="font-sans text-sm font-medium text-foreground">{today.location}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {today.altitude_peak.toLocaleString('en-US')}m /{' '}
            {mToFt(today.altitude_peak).toLocaleString('en-US')}ft
            {' · '}
            {today.conn_label}
          </p>
          <p className="font-sans text-xs text-muted-foreground mt-1">{today.headline}</p>
        </div>
      )}

      {/* Tomorrow chip */}
      {tomorrow && (
        <div className="rounded border border-border bg-background px-4 py-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Tomorrow</span>
            <Clock size={12} className="text-muted-foreground" />
          </div>
          <p className="font-sans text-sm font-medium text-foreground">{tomorrow.location}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {tomorrow.altitude_peak.toLocaleString('en-US')}m /{' '}
            {mToFt(tomorrow.altitude_peak).toLocaleString('en-US')}ft
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AFTER phase
// ---------------------------------------------------------------------------
function AfterHero({ state: _state }: { state: JourneyState }) {
  const returnDt = new Date('2026-07-19T00:00:00');
  const nowMid = new Date();
  nowMid.setHours(0, 0, 0, 0);
  const returnedDaysAgo = Math.max(
    0,
    Math.round((nowMid.getTime() - returnDt.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <div className="space-y-4">
      {/* Shrunk headline: YATRA_SAMPOORNA x1 total */}
      <div>
        <h2 className="font-sans text-3xl font-medium text-foreground md:text-4xl">
          {YATRA_SAMPOORNA}
        </h2>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
          13-day parikrama complete
        </p>
      </div>

      {/* Recap strip (fold-fix) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground border border-border rounded px-3 py-2 bg-card">
        <span>
          <span className="text-foreground font-medium">
            Returned {returnedDaysAgo} day{returnedDaysAgo !== 1 ? 's' : ''} ago
          </span>
        </span>
        <span>
          <span className="text-foreground font-medium">Peak: Dolma La 5,630m / {mToFt(5630).toLocaleString('en-US')}ft</span>
          <span className="text-muted-foreground"> Day 8</span>
        </span>
        <span className="flex items-center gap-x-1">
          {['KTM', 'LHASA', 'KAILASH', 'KTM'].map((stop, i, arr) => (
            <span key={i} className="flex items-center gap-x-1">
              <span className="text-foreground font-medium">{stop}</span>
              {i < arr.length - 1 && <span className="text-border">{'>'}</span>}
            </span>
          ))}
        </span>
      </div>

      {/* Trip summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Days on yatra', value: '13' },
          { label: 'Peak altitude', value: '5,630m' },
          { label: 'Km trekked', value: '~52 km' },
        ].map((stat) => (
          <div key={stat.label} className="rounded border border-border bg-card px-3 py-2">
            <p className="font-sans text-xl font-medium text-foreground">{stat.value}</p>
            <p className="font-mono text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Hero export
// ---------------------------------------------------------------------------
export function Hero({ phase }: { phase: JourneyState }) {
  return (
    <section
      data-section="hero"
      className="border-b border-border bg-card px-4 py-6 md:px-6 md:py-10"
    >
      <div className="mx-auto max-w-2xl">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs uppercase tracking-widest mb-3">
          <Mountain size={14} />
          <span>Kailash Mansarovar Yatra 2026</span>
        </div>

        {/* Subtitle + cohort + dates + tz toggle: phase-stable */}
        <HeroHeader />

        {/* Phase variants with AnimatePresence */}
        <AnimatePresence mode="wait">
          {phase.phase === 'before' && (
            <motion.div
              key="before"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <BeforeHero state={phase} />
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
              <DuringHero state={phase} />
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
              <AfterHero state={phase} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
