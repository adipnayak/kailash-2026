/**
 * OverviewTab.
 * Phase-aware overview: SacredJourneyMap + AltitudeChart + Trip Stats + What Matters Today.
 *
 * v4 rescue: restored Trip Stats with 6 correct stats from v3.12.
 *   - Temperature range (cold pass + warm KTM) replaces Countries
 *   - Border crossings replaces Days
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import type { JourneyState } from '../../lib/journey-state';
import { SacredJourneyMap } from '../SacredJourneyMap';
import { AltitudeChart } from '../AltitudeChart';
import { Mountain, Ruler, Snowflake, Sun, WifiOff, Globe } from '@aliimam/icons';

const TRIP_STATS = [
  {
    value: '5,630 m',
    label: 'HIGHEST ALTITUDE',
    sublabel: 'Dolma La pass - Day 8',
    icon: <Mountain size={20} className="text-muted" />,
  },
  {
    value: '22 km',
    label: 'LONGEST TREK DAY',
    sublabel: '8 to 9 h - Day 8',
    icon: <Ruler size={20} className="text-muted" />,
  },
  {
    value: '-5 to +5 C',
    label: 'COLDEST EXPECTED',
    sublabel: 'Pass overnight low',
    icon: <Snowflake size={20} className="text-muted" />,
  },
  {
    value: '29 C',
    label: 'WARMEST EXPECTED',
    sublabel: 'Kathmandu monsoon',
    icon: <Sun size={20} className="text-muted" />,
  },
  {
    value: '3 days',
    label: 'OFFLINE',
    sublabel: 'Parikrama - Days 7, 8, 9',
    icon: <WifiOff size={20} className="text-muted" />,
  },
  {
    value: '2',
    label: 'BORDER CROSSINGS',
    sublabel: 'Nepal to China and back',
    icon: <Globe size={20} className="text-muted" />,
  },
];

export function OverviewTab({ phase }: { phase: JourneyState }) {
  return (
    <div data-tab="overview">
      <SacredJourneyMap phase={phase} />
      <AltitudeChart />

      {/* Trip Stats */}
      <section className="border-b border-border bg-card px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-sans text-2xl font-medium text-ink mb-6">Trip at a glance</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {TRIP_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center space-y-2 px-2">
                {stat.icon}
                <div className="font-sans text-2xl font-extrabold tracking-tight text-ink">
                  {stat.value}
                </div>
                <div className="space-y-0.5">
                  <p className="font-mono text-xs font-semibold uppercase tracking-widest text-ink">
                    {stat.label}
                  </p>
                  <p className="font-mono text-xs text-muted">{stat.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
