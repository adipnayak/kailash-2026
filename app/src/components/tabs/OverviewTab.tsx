/**
 * OverviewTab.
 * Hero renders immediately. SacredJourneyMap (framer-motion + dotted-map)
 * and AltitudeChart (recharts) are lazy-loaded so they don't block the
 * first paint.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import { lazy, Suspense } from 'react';
import type { JourneyState } from '../../lib/journey-state';
import { Hero } from '../Hero';

const SacredJourneyMap = lazy(() =>
  import('../SacredJourneyMap').then((m) => ({ default: m.SacredJourneyMap })),
);

const AltitudeChart = lazy(() =>
  import('../AltitudeChart').then((m) => ({ default: m.AltitudeChart })),
);

function MapFallback() {
  return (
    <section className="border-b border-border bg-background px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 md:mb-8">
          <h2 className="font-sans text-2xl md:text-3xl font-medium text-foreground">
            Sacred Journey Map
          </h2>
          <p className="mt-2 font-sans text-sm md:text-base text-muted-foreground">
            Loading map.
          </p>
        </header>
        <div className="w-full bg-card" style={{ aspectRatio: '2.5' }} />
      </div>
    </section>
  );
}

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

export function OverviewTab({ phase }: { phase: JourneyState }) {
  return (
    <div data-tab="overview">
      <Suspense fallback={<MapFallback />}>
        <SacredJourneyMap phase={phase} />
      </Suspense>
      <Hero phase={phase} />
      <Suspense fallback={<ChartFallback />}>
        <AltitudeChart />
      </Suspense>
    </div>
  );
}
