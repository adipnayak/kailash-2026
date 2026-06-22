/**
 * ItineraryTab.
 * - ConnectivityRibbon at the top.
 * - Day by Day section with a sticky DayNav pill strip beneath the heading
 *   that scrolls + expands the matching DayCard when tapped.
 * - Day 1 expanded by default. Other days stay collapsed until clicked
 *   (via the sticky nav or their own header).
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { Icon } from '../Icon';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { JourneyState } from '../../lib/journey-state';
import { ConnectivityRibbon } from '../ConnectivityRibbon';
import { DayCard } from '../DayCard';
import { DAYS } from '../../lib/trip-data';
import { getDayRoute } from '../../lib/day-routes';
import { getDayAstro } from '../../lib/astro';
import { MoonPhase } from '../MoonPhase';

export function ItineraryTab({ phase }: { phase: JourneyState }) {
  // Controlled expansion state. Every card starts open so a fresh tab
  // visit reads as the full trip. The sticky DayNav still adds the
  // clicked day to this set (no-op when already open) and smooth-scrolls
  // the page to it; tapping a card header collapses just that one.
  const [expandedDays, setExpandedDays] = useState<Set<number>>(
    () => new Set(DAYS.map((d) => d.day)),
  );

  // Scrollspy: as the user scrolls through the itinerary, the chip for the
  // day section currently sitting at the top of the viewport becomes the
  // active chip. We use IntersectionObserver with a top-biased rootMargin
  // so the "active" day is the one whose header has just crossed below
  // the sticky nav strip.
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const dayNavRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const visibility = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute('id');
          if (!id) continue;
          const dayNum = parseInt(id.replace('day-', ''), 10);
          if (isNaN(dayNum)) continue;
          visibility.set(dayNum, entry.intersectionRatio);
        }
        // Pick the day with the highest intersection ratio.
        let bestDay: number | null = null;
        let bestRatio = 0;
        for (const [d, r] of visibility) {
          if (r > bestRatio) {
            bestRatio = r;
            bestDay = d;
          }
        }
        if (bestDay !== null) setActiveDay(bestDay);
      },
      {
        // The "active zone" is roughly the band from just below the sticky
        // nav (~110 px from the viewport top) down to the bottom 30 percent.
        rootMargin: '-110px 0px -30% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );
    for (const d of DAYS) {
      const el = document.getElementById('day-' + d.day);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // Auto-scroll the active chip into view in the horizontal day-nav strip
  // so the user always sees their position. Skip when activeDay is null.
  useEffect(() => {
    if (activeDay === null || !dayNavRef.current) return;
    const chip = dayNavRef.current.querySelector<HTMLElement>(
      `[data-day="${activeDay}"]`,
    );
    if (chip) {
      chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeDay]);

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
    // Defer past the expansion animation (~250 ms) so the page measures
    // the post-expand layout before scrolling. Two rAFs alone aren't
    // enough because the DayCard expand uses a height tween.
    window.setTimeout(() => {
      const el = document.getElementById('day-' + dayNum);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
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

          {/* Sticky day-nav. top-12 sits under the main nav (47 px).
              Solid bg (no backdrop-blur) -- backdrop-filter on a
              position:sticky element breaks on iOS Safari, the element
              intermittently stops sticking as the address bar collapses. */}
          <div className="sticky top-12 z-40 -mx-6 mb-6 border-b border-border bg-background px-6 py-4">
            <ol ref={dayNavRef} className="flex gap-2 overflow-x-auto">
              {DAYS.map((d) => {
                const isToday = phase.tripDayIndex === d.day;
                const isDolmaLa = d.day === 8;
                const isOpen = expandedDays.has(d.day);
                const isActive = activeDay === d.day;
                return (
                  <li key={d.day} className="shrink-0">
                    <button
                      type="button"
                      data-day={d.day}
                      onClick={() => jumpToDay(d.day)}
                      aria-label={'Jump to Day ' + d.day}
                      aria-pressed={isOpen}
                      aria-current={isActive ? 'true' : undefined}
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
                      {/* Temp + moon row */}
                      <span className="flex items-center gap-1 font-mono text-[10px] leading-none opacity-75">
                        {d.weather.temp_low}-{d.weather.temp_high}C
                        <MoonPhase phase={(() => { const route = getDayRoute(d.day - 1); const lat = route?.start.lat ?? 27.7; const lng = route?.start.lng ?? 85.3; return getDayAstro(d.date, lat, lng).moonPhase; })()} size={12} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="space-y-6">
            {DAYS.map((d) => (
              <div key={d.day} id={'day-' + d.day} className="scroll-mt-24">
                <DayCard
                  day={d}
                  isToday={phase.tripDayIndex === d.day}
                  expanded={expandedDays.has(d.day)}
                  onToggle={() => toggleDay(d.day)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
