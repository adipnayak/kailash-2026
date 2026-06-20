/**
 * OverviewTab.
 * Phase-aware overview: SacredJourneyMap + AltitudeChart + Trip Stats + What Matters Today.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import type { JourneyState } from '../../lib/journey-state';
import { SacredJourneyMap } from '../SacredJourneyMap';
import { AltitudeChart } from '../AltitudeChart';
import { AliimamStats, AliimamCta } from '../aliimam';
import { Mountain, Ruler, WifiOff, Bed, MapPin, CalendarDays } from '@aliimam/icons';
import { mToFt } from '../../lib/conversions';

const TRIP_STATS = [
  {
    value: '5,630 m / ' + mToFt(5630).toLocaleString('en-US') + ' ft',
    label: 'Max Altitude (Dolma La)',
    icon: <Mountain size={16} className="text-destructive mx-auto mb-1" />,
  },
  {
    value: '52 km',
    label: 'Parikrama Trek Distance',
    icon: <Ruler size={16} className="text-muted-foreground mx-auto mb-1" />,
  },
  {
    value: '6 days',
    label: 'Offline / Limited Connectivity',
    icon: <WifiOff size={16} className="text-muted-foreground mx-auto mb-1" />,
  },
  {
    value: '4,790 m / ' + mToFt(4790).toLocaleString('en-US') + ' ft',
    label: 'Highest Sleep Altitude',
    icon: <Bed size={16} className="text-muted-foreground mx-auto mb-1" />,
  },
  {
    value: '3',
    label: 'Countries (India / Nepal / Tibet)',
    icon: <MapPin size={16} className="text-muted-foreground mx-auto mb-1" />,
  },
  {
    value: '13',
    label: 'Days on Yatra',
    icon: <CalendarDays size={16} className="text-muted-foreground mx-auto mb-1" />,
  },
];

export function OverviewTab({ phase }: { phase: JourneyState }) {
  return (
    <div data-tab="overview">
      <SacredJourneyMap phase={phase} />
      <AltitudeChart />
      <AliimamStats
        headline="13 days. 5,630 m. 3 countries. 1 parikrama."
        stats={TRIP_STATS}
      />
      <AliimamCta
        title="Prepare for the yatra"
        body="Complete your checklist before departure. Permits, fitness, gear, and connectivity all need advance planning."
        primaryLabel="Start checklist"
        primaryHref="#prepare"
        secondaryLabel="View itinerary"
        secondaryHref="#itinerary"
      />
      <section className="border-b border-border bg-card px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-sans text-2xl font-medium text-foreground">What matters today</h2>
          <ul className="mt-3 space-y-2">
            {phase.whatMattersToday.map((item, i) => (
              <li key={i} className="text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
