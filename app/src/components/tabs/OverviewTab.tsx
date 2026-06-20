/**
 * OverviewTab.
 * TODO: phase-aware overview composed of SacredJourneyMap + AltitudeChart + What Matters Today.
 */
import type { JourneyState } from '../../lib/journey-state';
import { SacredJourneyMap } from '../SacredJourneyMap';
import { AltitudeChart } from '../AltitudeChart';

export function OverviewTab({ phase }: { phase: JourneyState }) {
  return (
    <div data-tab="overview">
      <SacredJourneyMap phase={phase} />
      <AltitudeChart />
      <section className="border-b border-border bg-card px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-sans text-2xl font-medium text-ink">What matters today</h2>
          <ul className="mt-3 space-y-2">
            {phase.whatMattersToday.map((item, i) => (
              <li key={i} className="text-ink">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
