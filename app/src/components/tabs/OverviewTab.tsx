/**
 * OverviewTab.
 * Phase-aware overview: SacredJourneyMap + AltitudeChart + AliimamStats + AliimamCta + What Matters Today.
 *
 * v4 rescue: restored Trip Stats with 6 correct stats from v3.12.
 *   - Temperature range (cold pass + warm KTM) replaces Countries
 *   - Border crossings replaces Days
 * aliimam-real: Trip Stats wrapped in AliimamStats block.
 *               CTA section uses AliimamCta block.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import type { JourneyState } from '../../lib/journey-state';
import { SacredJourneyMap } from '../SacredJourneyMap';
import { AltitudeChart } from '../AltitudeChart';
import { AliimamStats } from '../aliimam/AliimamStats';
import { AliimamCta } from '../aliimam/AliimamCta';
import { Mountain, Ruler, Snowflake, Sun, WifiOff, Globe } from '@aliimam/icons';

// AliimamStats expects { value: string; label: string }[]
// We keep our richer TRIP_STATS for the custom grid below, and pass a compact
// version to AliimamStats for the headline stat strip.
const ALIIMAM_STATS = [
  { value: '13 days', label: 'Yatra length' },
  { value: '5,630 m', label: 'Dolma La peak' },
  { value: '52 km', label: 'Parikrama circuit' },
  { value: '3 days offline', label: 'Parikrama blackout' },
];

const TRIP_STATS = [
  {
    value: '5,630 m',
    label: 'HIGHEST ALTITUDE',
    sublabel: 'Dolma La pass - Day 8',
    icon: <Mountain size={20} className="text-muted-foreground" />,
  },
  {
    value: '22 km',
    label: 'LONGEST TREK DAY',
    sublabel: '8 to 9 h - Day 8',
    icon: <Ruler size={20} className="text-muted-foreground" />,
  },
  {
    value: '-5 to +5 C',
    label: 'COLDEST EXPECTED',
    sublabel: 'Pass overnight low',
    icon: <Snowflake size={20} className="text-muted-foreground" />,
  },
  {
    value: '29 C',
    label: 'WARMEST EXPECTED',
    sublabel: 'Kathmandu monsoon',
    icon: <Sun size={20} className="text-muted-foreground" />,
  },
  {
    value: '3 days',
    label: 'OFFLINE',
    sublabel: 'Parikrama - Days 7, 8, 9',
    icon: <WifiOff size={20} className="text-muted-foreground" />,
  },
  {
    value: '2',
    label: 'BORDER CROSSINGS',
    sublabel: 'Nepal to China and back',
    icon: <Globe size={20} className="text-muted-foreground" />,
  },
];

export function OverviewTab({ phase }: { phase: JourneyState }) {
  return (
    <div data-tab="overview">
      <SacredJourneyMap phase={phase} />
      <AltitudeChart />

      {/* aliimam stats block: headline strip */}
      <AliimamStats
        headline="A once-in-a-lifetime yatra to the sacred Kailash Manasarovar."
        stats={ALIIMAM_STATS}
      />

      {/* Trip Stats: detailed 6-stat grid */}
      <section className="border-b border-border bg-card px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-sans text-2xl font-medium text-foreground mb-6">Trip at a glance</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {TRIP_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center space-y-2 px-2">
                {stat.icon}
                <div className="font-sans text-2xl font-extrabold tracking-tight text-foreground">
                  {stat.value}
                </div>
                <div className="space-y-0.5">
                  <p className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
                    {stat.label}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">{stat.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* aliimam CTA block */}
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
