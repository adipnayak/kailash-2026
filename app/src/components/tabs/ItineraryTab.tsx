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
import { useCallback, useState } from 'react';
import type { JourneyState } from '../../lib/journey-state';
import { ConnectivityRibbon } from '../ConnectivityRibbon';
import { DayCard } from '../DayCard';
import { DAYS } from '../../lib/trip-data';
import { CalendarDays, Clock, Mountain } from '@aliimam/icons';

export function ItineraryTab({ phase }: { phase: JourneyState }) {
  // Controlled expansion state. Every card starts open so a fresh tab
  // visit reads as the full trip. The sticky DayNav still adds the
  // clicked day to this set (no-op when already open) and smooth-scrolls
  // the page to it; tapping a card header collapses just that one.
  const [expandedDays, setExpandedDays] = useState<Set<number>>(
    () => new Set(DAYS.map((d) => d.day)),
  );

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
            <CalendarDays size={20} className="text-muted-foreground" />
            Day by Day
          </h2>

          {/* Sticky day-nav. top-12 sits under the main nav (47 px). */}
          <div className="sticky top-12 z-40 -mx-6 mb-6 border-b border-border bg-background/95 px-6 py-3 backdrop-blur">
            <ol className="flex gap-2 overflow-x-auto">
              {DAYS.map((d) => {
                const isToday = phase.tripDayIndex === d.day;
                const isDolmaLa = d.day === 8;
                const isOpen = expandedDays.has(d.day);
                return (
                  <li key={d.day} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => jumpToDay(d.day)}
                      aria-label={'Jump to Day ' + d.day}
                      aria-pressed={isOpen}
                      className={
                        'flex items-center gap-1 rounded-none border px-3 py-1.5 font-mono text-xs cursor-pointer transition-colors ' +
                        (isOpen
                          ? 'border-primary bg-secondary text-foreground'
                          : isToday
                          ? 'border-primary bg-card text-foreground'
                          : isDolmaLa
                          ? 'border-destructive/40 bg-destructive/5 text-destructive'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground')
                      }
                      title={d.headline}
                    >
                      {isToday ? (
                        <Clock size={10} />
                      ) : isDolmaLa ? (
                        <Mountain size={10} />
                      ) : (
                        <CalendarDays size={10} />
                      )}
                      D{d.day}
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
