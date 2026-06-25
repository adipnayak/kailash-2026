/**
 * ItineraryTab.
 * - ConnectivityRibbon at the top.
 * - Day by Day section with a sticky DayNav pill strip beneath the heading
 *   that scrolls + expands the matching DayCard when tapped.
 * - Day 1 expanded by default. Other days stay collapsed until clicked
 *   (via the sticky nav or their own header).
 * - 17-chip strip: 2 PRE bookend chips + 13 day chips + 2 POST bookend chips.
 * - 4 DiamoxBookendCard instances: 2 above D1, 2 below D13.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import type { JourneyState } from '../../lib/journey-state';
import { ConnectivityRibbon } from '../ConnectivityRibbon';
import { DayCard } from '../DayCard';
import { DAYS } from '../../lib/trip-data';
import type { TripDay } from '../../lib/trip-data';
import { getDayRoute } from '../../lib/day-routes';
import { getDayAstro } from '../../lib/astro';
import { MoonPhase } from '../MoonPhase';
import { KAILASH_FACTS } from '../../lib/kailash-facts';
import { DIAMOX_REGIME_BY_DATE, type DiamoxDose } from '../../lib/diamox-regime';
import { DiamoxBookendCard } from '../DiamoxBookendCard';
import { useLiveDayWeather } from '../../lib/weather';

// ---------------------------------------------------------------------------
// Bookend dates in order
// ---------------------------------------------------------------------------

const PRE_BOOKEND_ISOS = ['2026-06-28', '2026-07-06'] as const;
const POST_BOOKEND_ISOS = ['2026-07-20', '2026-07-21'] as const;

// ---------------------------------------------------------------------------
// Short date helper: '2026-06-28' -> '28 JUN'
// ---------------------------------------------------------------------------

function shortDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z');
  const day = d.getUTCDate();
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return day + ' ' + monthNames[d.getUTCMonth()];
}

// ---------------------------------------------------------------------------
// ChipEntry tagged union for the 17-chip strip
// ---------------------------------------------------------------------------

type ChipEntry =
  | { kind: 'day'; day: TripDay }
  | { kind: 'bookend'; dose: DiamoxDose; position: 'pre' | 'post' };

const CHIPS: ChipEntry[] = [
  { kind: 'bookend', dose: DIAMOX_REGIME_BY_DATE['2026-06-28'], position: 'pre' },
  { kind: 'bookend', dose: DIAMOX_REGIME_BY_DATE['2026-07-06'], position: 'pre' },
  ...DAYS.map((d) => ({ kind: 'day' as const, day: d })),
  { kind: 'bookend', dose: DIAMOX_REGIME_BY_DATE['2026-07-20'], position: 'post' },
  { kind: 'bookend', dose: DIAMOX_REGIME_BY_DATE['2026-07-21'], position: 'post' },
];

// ---------------------------------------------------------------------------
// DayChipTempLine -- calls useLiveDayWeather internally so each chip can
// show live temp without the parent mapping hooks in a loop.
// ---------------------------------------------------------------------------

function DayChipTempLine({ day }: { day: TripDay }) {
  const w = useLiveDayWeather(day);
  const route = getDayRoute(day.day - 1);
  const lat = route?.start.lat ?? 27.7;
  const lng = route?.start.lng ?? 85.3;
  const moonPhase = getDayAstro(day.date, lat, lng).moonPhase;
  return (
    <span className="flex items-center gap-1 font-mono text-[10px] leading-none opacity-75">
      {w.temp_low}-{w.temp_high}C
      <MoonPhase phase={moonPhase} size={12} />
    </span>
  );
}

export function ItineraryTab({ phase }: { phase: JourneyState }) {
  // Controlled expansion state. Every card starts open so a fresh tab
  // visit reads as the full trip. The sticky DayNav still adds the
  // clicked day to this set (no-op when already open) and smooth-scrolls
  // the page to it; tapping a card header collapses just that one.
  const [expandedDays, setExpandedDays] = useState<Set<number>>(
    () => new Set(DAYS.map((d) => d.day)),
  );

  // Scrollspy: track the active day (1-13) and active bookend (dateISO) independently.
  // Only one is active at a time: when a bookend enters view activeDay is cleared,
  // and vice versa.
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [activeBookend, setActiveBookend] = useState<string | null>(null);
  const dayNavRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dayVisibility = new Map<number, number>();
    const bookendVisibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute('id');
          if (!id) continue;
          if (id.startsWith('day-')) {
            const dayNum = parseInt(id.replace('day-', ''), 10);
            if (!isNaN(dayNum)) dayVisibility.set(dayNum, entry.intersectionRatio);
          } else if (id.startsWith('diamox-')) {
            const iso = id.replace('diamox-', '');
            bookendVisibility.set(iso, entry.intersectionRatio);
          }
        }

        // Pick the element with the highest intersection ratio across both maps.
        let bestDay: number | null = null;
        let bestDayRatio = 0;
        for (const [d, r] of dayVisibility) {
          if (r > bestDayRatio) { bestDayRatio = r; bestDay = d; }
        }

        let bestBookend: string | null = null;
        let bestBookendRatio = 0;
        for (const [iso, r] of bookendVisibility) {
          if (r > bestBookendRatio) { bestBookendRatio = r; bestBookend = iso; }
        }

        if (bestDayRatio >= bestBookendRatio) {
          if (bestDay !== null) { setActiveDay(bestDay); setActiveBookend(null); }
        } else {
          if (bestBookend !== null) { setActiveBookend(bestBookend); setActiveDay(null); }
        }
      },
      {
        rootMargin: '-110px 0px -30% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const d of DAYS) {
      const el = document.getElementById('day-' + d.day);
      if (el) observer.observe(el);
    }
    for (const iso of [...PRE_BOOKEND_ISOS, ...POST_BOOKEND_ISOS]) {
      const el = document.getElementById('diamox-' + iso);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-scroll the active chip into view in the horizontal strip.
  // Works for both day chips ([data-day]) and bookend chips ([data-bookend-iso]).
  useEffect(() => {
    if (!dayNavRef.current) return;
    const strip = dayNavRef.current;
    let chip: HTMLElement | null = null;
    if (activeDay !== null) {
      chip = strip.querySelector<HTMLElement>(`[data-day="${activeDay}"]`);
    } else if (activeBookend !== null) {
      chip = strip.querySelector<HTMLElement>(`[data-bookend-iso="${activeBookend}"]`);
    }
    if (!chip) return;
    const stripRect = strip.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const delta =
      (chipRect.left + chipRect.right) / 2 - (stripRect.left + stripRect.right) / 2;
    strip.scrollBy({ left: delta, behavior: 'smooth' });
  }, [activeDay, activeBookend]);

  const toggleDay = useCallback((dayNum: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNum)) {
        next.delete(dayNum);
      } else {
        next.add(dayNum);
      }
      return next;
    });
  }, []);

  const jumpToDay = useCallback((dayNum: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      next.add(dayNum);
      return next;
    });
    window.setTimeout(() => {
      const el = document.getElementById('day-' + dayNum);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 300);
  }, []);

  const jumpToBookend = useCallback((dateISO: string) => {
    window.setTimeout(() => {
      const el = document.getElementById('diamox-' + dateISO);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 50);
  }, []);

  return (
    <div data-tab="itinerary">
      <ConnectivityRibbon />
      <section className="bg-background px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-sans text-2xl font-medium text-foreground mb-4 flex items-center gap-2">
            <Icon name="calendar_month" size={20} className="text-muted-foreground" />
            Day by Day
          </h2>

          {/* Sticky 17-chip nav strip. top-12 sits under the main nav (47 px). */}
          <div className="sticky top-12 z-40 -mx-6 mb-6 border-b border-border bg-background px-6 py-4">
            <ol ref={dayNavRef} className="flex gap-2 overflow-x-auto" style={{ overscrollBehaviorX: 'contain' }}>
              {CHIPS.map((entry, idx) => {
                if (entry.kind === 'bookend') {
                  const { dose, position } = entry;
                  const isActive = activeBookend === dose.dateISO;
                  return (
                    <li key={'bookend-' + dose.dateISO} className="shrink-0">
                      <button
                        type="button"
                        data-bookend-iso={dose.dateISO}
                        onClick={() => jumpToBookend(dose.dateISO)}
                        aria-label={'Jump to ' + dose.dayLabel + ' ' + (position === 'pre' ? 'pre-trip' : 'post-trip') + ' diamox dose'}
                        aria-current={isActive ? 'true' : undefined}
                        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'rgba(0,0,0,0.05)' }}
                        className={
                          'flex flex-col items-center gap-0.5 rounded-none border px-3 py-2 font-mono cursor-pointer transition-colors ' +
                          (isActive
                            ? 'border-sacred bg-sacred text-sacred-foreground'
                            : 'border-sacred bg-card text-sacred')
                        }
                      >
                        <span className="text-[10px]">{shortDate(dose.dateISO)}</span>
                        <span className="text-[9px] opacity-75">{position === 'pre' ? 'PRE' : 'POST'}</span>
                      </button>
                    </li>
                  );
                }

                // Day chip
                const { day: d } = entry;
                const isToday = phase.tripDayIndex === d.day;
                const isDolmaLa = d.day === 8;
                const isOpen = expandedDays.has(d.day);
                const isActive = activeDay === d.day;
                return (
                  <li key={'day-' + d.day + '-' + idx} className="shrink-0">
                    <button
                      type="button"
                      data-day={d.day}
                      onClick={() => jumpToDay(d.day)}
                      aria-label={'Jump to Day ' + d.day}
                      aria-pressed={isOpen}
                      aria-current={isActive ? 'true' : undefined}
                      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'rgba(0,0,0,0.05)' }}
                      className={
                        'flex flex-col items-center gap-0.5 rounded-none border px-3 py-2 font-mono cursor-pointer transition-colors ' +
                        (isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : isOpen
                          ? 'border-primary bg-secondary text-foreground'
                          : isToday
                          ? 'border-primary bg-card text-foreground'
                          : isDolmaLa
                          ? 'border-destructive/40 bg-destructive/5 text-destructive'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground')
                      }
                      title={d.headline}
                    >
                      {/* Day label row */}
                      <span className="flex items-center gap-1 text-xs">
                        {isToday ? (
                          <Icon name="schedule" size={10} />
                        ) : isDolmaLa ? (
                          <Icon name="landscape" size={10} />
                        ) : (
                          <Icon name="calendar_month" size={10} />
                        )}
                        D{d.day}
                      </span>
                      {/* Temp + moon row (live or climatology) */}
                      <DayChipTempLine day={d} />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="space-y-6">
            {/* PRE-TRIP bookend cards */}
            {PRE_BOOKEND_ISOS.map((iso) => (
              <DiamoxBookendCard key={iso} dose={DIAMOX_REGIME_BY_DATE[iso]} />
            ))}

            {/* Trip day cards */}
            {DAYS.map((d, i) => (
              <Fragment key={d.day}>
                <div id={'day-' + d.day} className="scroll-mt-24">
                  <DayCard
                    day={d}
                    isToday={phase.tripDayIndex === d.day}
                    expanded={expandedDays.has(d.day)}
                    onToggle={() => toggleDay(d.day)}
                  />
                </div>
                {i < DAYS.length - 1 && KAILASH_FACTS[i] && (
                  <div
                    className="border-l-4 border-sacred bg-card px-4 py-3 my-2"
                    aria-label="Kailash fact"
                  >
                    <p className="font-mono uppercase tracking-widest text-sacred text-[10px]">FACT</p>
                    <p className="mt-1 text-sm text-foreground leading-snug">{KAILASH_FACTS[i].body}</p>
                    {KAILASH_FACTS[i].source && (
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">{KAILASH_FACTS[i].source}</p>
                    )}
                  </div>
                )}
              </Fragment>
            ))}

            {/* POST-TRIP bookend cards */}
            {POST_BOOKEND_ISOS.map((iso) => (
              <DiamoxBookendCard key={iso} dose={DIAMOX_REGIME_BY_DATE[iso]} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
