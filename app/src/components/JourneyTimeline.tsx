/**
 * JourneyTimeline.
 * Horizontal 13-day strip with day chips, today pin, and Day 8 red anchor.
 * aliimam-real: @aliimam/icons per chip (CalendarDays per day, Clock for today,
 *   Mountain at Dolma La Day 8 in destructive red).
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import type { JourneyState } from '../lib/journey-state';
import { DAYS } from '../lib/trip-data';
import { CalendarDays, Clock, Mountain } from '@aliimam/icons';

export function JourneyTimeline({ phase }: { phase: JourneyState }) {
  return (
    <section
      data-section="journey-timeline"
      className="border-b border-border bg-card px-6 py-8"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="font-sans text-2xl font-medium text-foreground">Journey Timeline</h2>
        <ol className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {DAYS.map((d) => {
            const isToday = phase.tripDayIndex === d.day;
            const isDolmaLa = d.day === 8;
            return (
              <li
                key={d.day}
                className={
                  'shrink-0 flex items-center gap-1 rounded-none border px-4 py-2 font-mono text-xs ' +
                  (isToday
                    ? 'border-primary text-foreground bg-secondary'
                    : isDolmaLa
                    ? 'border-destructive/40 text-destructive bg-destructive/5'
                    : 'border-border bg-background text-muted-foreground')
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
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
