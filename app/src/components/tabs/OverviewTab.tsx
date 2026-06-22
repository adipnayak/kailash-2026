/**
 * OverviewTab.
 * Hero (countdown + stats bento) renders immediately. AltitudeChart
 * (recharts) is lazy-loaded so it doesn't block first paint.
 *
 * SacredJourneyMap removed per Adip · the per-day Itinerary maps carry
 * the geographic story now, and dropping the overview map cuts the
 * dotted-map + framer-motion chunk from the critical path.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import { lazy, Suspense } from 'react';
import type { JourneyState } from '../../lib/journey-state';
import type { Tab } from '../../hooks/useJourneyState';
import { Hero } from '../Hero';

const AltitudeChart = lazy(() =>
  import('../AltitudeChart').then((m) => ({ default: m.AltitudeChart })),
);

function ChartFallback() {
  return (
    <section className="border-b border-border bg-background px-4 py-12 md:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-sans text-2xl font-medium text-foreground">Altitude Profile</h2>
        <div className="mt-6 w-full bg-card" style={{ height: 340 }} />
      </div>
    </section>
  );
}

export function OverviewTab({ phase, onTab }: { phase: JourneyState; onTab: (t: Tab) => void }) {
  return (
    <div data-tab="overview">
      <Hero phase={phase} onTab={onTab} />
      <Suspense fallback={<ChartFallback />}>
        <AltitudeChart />
      </Suspense>
    </div>
  );
}
