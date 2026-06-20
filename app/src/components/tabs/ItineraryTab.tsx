/**
 * ItineraryTab.
 * TODO: render JourneyTimeline + 13 DayCards with auto-scroll-to-today.
 */
import type { JourneyState } from '../../lib/journey-state';
import { JourneyTimeline } from '../JourneyTimeline';
import { ConnectivityRibbon } from '../ConnectivityRibbon';
import { DayCard } from '../DayCard';
import { DAYS } from '../../lib/trip-data';

export function ItineraryTab({ phase }: { phase: JourneyState }) {
  return (
    <div data-tab="itinerary">
      <JourneyTimeline phase={phase} />
      <ConnectivityRibbon />
      <section className="bg-bg px-6 py-8">
        <div className="mx-auto grid max-w-5xl gap-3">
          {DAYS.map((d) => (
            <DayCard key={d.day} day={d} isToday={phase.tripDayIndex === d.day} />
          ))}
        </div>
      </section>
    </div>
  );
}
