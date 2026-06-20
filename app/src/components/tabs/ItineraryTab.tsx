/**
 * ItineraryTab.
 * JourneyTimeline + ConnectivityRibbon + 13 DayCards with auto-scroll-to-today.
 * aliimam-real: @aliimam/icons for section header.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import type { JourneyState } from '../../lib/journey-state';
import { JourneyTimeline } from '../JourneyTimeline';
import { ConnectivityRibbon } from '../ConnectivityRibbon';
import { DayCard } from '../DayCard';
import { DAYS } from '../../lib/trip-data';
import { CalendarDays } from '@aliimam/icons';

export function ItineraryTab({ phase }: { phase: JourneyState }) {
  return (
    <div data-tab="itinerary">
      <JourneyTimeline phase={phase} />
      <ConnectivityRibbon />
      <section className="bg-background px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-sans text-2xl font-medium text-foreground mb-6 flex items-center gap-2">
            <CalendarDays size={20} className="text-muted-foreground" />
            Day by Day
          </h2>
          <div className="grid gap-3">
            {DAYS.map((d) => (
              <DayCard key={d.day} day={d} isToday={phase.tripDayIndex === d.day} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
