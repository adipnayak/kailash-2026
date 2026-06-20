/**
 * JourneyTimeline.
 * Horizontal 13-day strip with day_type colour bands, current-day pin.
 * aliimam icons: CalendarDays per date, Clock for today indicator, Mountain for Day 8.
 * PRD reference: section 3 (Journey Timeline).
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import { CalendarDays, Clock, Mountain } from '@aliimam/icons';
import type { JourneyState } from '../lib/journey-state';
import { DAYS } from '../lib/trip-data';

export function JourneyTimeline({ phase }: { phase: JourneyState }) {
  return (
    <section
      data-section="journey-timeline"
      className="border-b border-border bg-card px-6 py-8"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="font-sans text-2xl font-medium text-foreground flex items-center gap-2">
          <CalendarDays size={20} className="text-muted-foreground" />
          Journey Timeline
        </h2>
        <ol className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {DAYS.map((d) => {
            const isToday = phase.tripDayIndex === d.day;
            const isDay8 = d.day === 8;
            return (
              <li
                key={d.day}
                className={[
                  'shrink-0 rounded-sm border px-3 py-2 font-mono text-xs flex flex-col items-center gap-1',
                  isDay8
                    ? 'border-destructive text-destructive bg-destructive/5'
                    : isToday
                    ? 'border-foreground text-foreground bg-background'
                    : 'border-border bg-background text-muted-foreground',
                ].join(' ')}
                title={d.headline}
              >
                {isDay8 ? (
                  <Mountain size={11} className="text-destructive" />
                ) : isToday ? (
                  <Clock size={11} className="text-foreground" />
                ) : (
                  <CalendarDays size={11} className="text-muted-foreground" />
                )}
                D{d.day}
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-muted-foreground text-sm">
          TODO: connectivity ribbon, sacred markers, GSAP active-pin animation.
        </p>
      </div>
    </section>
  );
}
