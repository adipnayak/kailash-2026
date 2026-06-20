/**
<<<<<<< HEAD
 * Hero component.
 * Phase-aware with 3 variants: before / during / after.
 * PRD reference: section 1 (Hero) + §0.15.0c (One Screen Test).
 *
 * Anti-AI typography: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 * Devotional budget: JAI_BHOLE_NATH x1, YATRA_SAMPOORNA x1 (single import each).
 */

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Mountain, MapPin, Radio, AlertTriangle, Clock } from 'lucide-react';
import type { JourneyState } from '../lib/journey-state';
import { JAI_BHOLE_NATH, YATRA_SAMPOORNA } from '../lib/devotional';
import { mToFt } from '../lib/conversions';

gsap.registerPlugin(useGSAP);

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
    return <Radio size={12} className="text-green" aria-label="Good connectivity" />;
  if (status === 'intermittent')
    return <Radio size={12} className="text-accent" aria-label="Intermittent connectivity" />;
  return <AlertTriangle size={12} className="text-red" aria-label="No connectivity" />;
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
          className="font-sans text-7xl font-medium text-ink leading-none tabular-nums"
          aria-live="polite"
        >
          {state.daysToDeparture}
        </span>
        <span className="font-sans text-2xl font-medium text-muted">
          days to Kailash
        </span>
      </div>

      {/* Subhead: JAI_BHOLE_NATH x1 total */}
      <p className="font-mono text-sm text-accent uppercase tracking-widest">
        {JAI_BHOLE_NATH}
      </p>

      {/* Inline route + peak strip (fold-fix) */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted border border-border rounded px-3 py-2 bg-card">
        {['KTM', 'LHASA', 'MANSAROVAR', 'KAILASH', 'KTM'].map((stop, i, arr) => (
          <span key={i} className="flex items-center gap-x-1">
            <span className="text-ink font-medium">{stop}</span>
            {i < arr.length - 1 && <span className="text-border">{'>'}</span>}
          </span>
        ))}
        <span className="ml-auto text-accent font-medium">
          Peak: Dolma La 5,630m / {mToFt(5630).toLocaleString('en-US')}ft Day 8
        </span>
      </div>

      {/* Outstanding prep list */}
      <div>
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">
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
                  (done ? 'text-muted line-through' : 'text-ink')
                }
              >
                <span
                  className={
                    'inline-block w-2 h-2 rounded-full border ' +
                    (done ? 'bg-green border-green' : 'border-muted')
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
        <div className="flex justify-between font-mono text-xs text-muted">
          <span>Preparation</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-700"
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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted border border-border rounded px-3 py-2 bg-card">
        <span>
          <span className="text-ink font-medium">DAY {state.tripDayIndex} OF 13</span>
        </span>
        {today && (
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            <span className="text-ink font-medium">{today.location}</span>
            <span className="text-muted">
              {today.altitude_peak.toLocaleString('en-US')}m /
              {mToFt(today.altitude_peak).toLocaleString('en-US')}ft
            </span>
          </span>
        )}
        <span>
          <span className="text-ink font-medium">{daysRemaining}</span>
          <span className="text-muted"> days remaining</span>
        </span>
      </div>

      {/* Today chip */}
      {today && (
        <div className="rounded border border-border bg-card px-4 py-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted uppercase tracking-widest">Today</span>
            <ConnIcon status={today.conn_status} />
          </div>
          <p className="font-sans text-sm font-medium text-ink">{today.location}</p>
          <p className="font-mono text-xs text-muted">
            {today.altitude_peak.toLocaleString('en-US')}m /{' '}
            {mToFt(today.altitude_peak).toLocaleString('en-US')}ft
            {' · '}
            {today.conn_label}
          </p>
          <p className="font-sans text-xs text-muted mt-1">{today.headline}</p>
        </div>
      )}

      {/* Tomorrow chip */}
      {tomorrow && (
        <div className="rounded border border-border bg-bg px-4 py-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted uppercase tracking-widest">Tomorrow</span>
            <Clock size={12} className="text-muted" />
          </div>
          <p className="font-sans text-sm font-medium text-ink">{tomorrow.location}</p>
          <p className="font-mono text-xs text-muted">
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
        <h2 className="font-sans text-3xl font-medium text-ink md:text-4xl">
          {YATRA_SAMPOORNA}
        </h2>
        <p className="font-mono text-xs text-muted uppercase tracking-widest mt-1">
          13-day parikrama complete
        </p>
      </div>

      {/* Recap strip (fold-fix) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted border border-border rounded px-3 py-2 bg-card">
        <span>
          <span className="text-ink font-medium">
            Returned {returnedDaysAgo} day{returnedDaysAgo !== 1 ? 's' : ''} ago
          </span>
        </span>
        <span>
          <span className="text-ink font-medium">Peak: Dolma La 5,630m / {mToFt(5630).toLocaleString('en-US')}ft</span>
          <span className="text-muted"> Day 8</span>
        </span>
        <span className="flex items-center gap-x-1">
          {['KTM', 'LHASA', 'KAILASH', 'KTM'].map((stop, i, arr) => (
            <span key={i} className="flex items-center gap-x-1">
              <span className="text-ink font-medium">{stop}</span>
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
            <p className="font-sans text-xl font-medium text-ink">{stat.value}</p>
            <p className="font-mono text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Hero export
// ---------------------------------------------------------------------------
=======
 * Hero.
 * TODO (downstream Ralph): migrate v3.12 hero with phase variants
 *   (before: countdown to depart, during: today's day card big-num,
 *    after: Yatra Sampoorna summary).
 *   PRD reference: section 1 (Hero).
 */
import type { JourneyState } from '../lib/journey-state';
import { Mountain } from 'lucide-react';

>>>>>>> c3f8185 (v4 foundation: React + Vite + Tailwind + GSAP + 21st.dev migration scaffold (#87))
export function Hero({ phase }: { phase: JourneyState }) {
  return (
    <section
      data-section="hero"
<<<<<<< HEAD
      className="border-b border-border bg-card px-4 py-6 md:px-6 md:py-10"
    >
      <div className="mx-auto max-w-2xl">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 text-muted font-mono text-xs uppercase tracking-widest mb-5">
          <Mountain size={14} />
          <span>Kailash Mansarovar Yatra 2026</span>
        </div>

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
=======
      className="border-b border-border bg-card px-6 py-16"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-3 text-muted font-mono text-xs uppercase tracking-widest">
          <Mountain size={16} />
          <span>Kailash 2026 yatra</span>
        </div>
        <h1 className="mt-4 font-sans text-4xl font-medium text-ink md:text-6xl">
          Phase: {phase.phase}
        </h1>
        <p className="mt-3 text-muted">
          TODO: migrate Hero variants per phase. Placeholder shows phase only.
        </p>
>>>>>>> c3f8185 (v4 foundation: React + Vite + Tailwind + GSAP + 21st.dev migration scaffold (#87))
      </div>
    </section>
  );
}
