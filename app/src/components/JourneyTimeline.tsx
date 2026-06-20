/**
 * JourneyTimeline.
 * TODO (downstream Ralph): horizontal 13-day strip with day_type colour bands,
 *   connectivity ribbon underlay, sacred markers, current-day pin, GSAP scroll-link.
 *   PRD reference: section 3 (Journey Timeline).
 */
import type { JourneyState } from '../lib/journey-state';
import { DAYS } from '../lib/trip-data';

export function JourneyTimeline({ phase }: { phase: JourneyState }) {
  return (
    <section
      data-section="journey-timeline"
      className="border-b border-border bg-card px-6 py-8"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="font-sans text-2xl font-medium text-ink">Journey Timeline</h2>
        <ol className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {DAYS.map((d) => {
            const isToday = phase.tripDayIndex === d.day;
            return (
              <li
                key={d.day}
                className={
                  'shrink-0 rounded-sm border border-border bg-bg px-3 py-2 font-mono text-xs text-muted ' +
                  (isToday ? 'border-ink text-ink' : '')
                }
                title={d.headline}
              >
                D{d.day}
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-muted text-sm">
          TODO: connectivity ribbon, sacred markers, GSAP active-pin animation.
        </p>
      </div>
    </section>
  );
}
