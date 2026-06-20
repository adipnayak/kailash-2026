/**
 * OverviewTab.
 * Phase-aware overview: SacredJourneyMap + AltitudeChart + TripHighlights (ShineBorder).
 *
 * v4 dedup pass: Trip-at-a-glance / Prepare-for-the-yatra / What-matters-today
 * sections removed (duplicates of bento Hero stats / Prepare tab / stale).
 * aliimam-real: highlight section uses ShineBorder block.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import type { JourneyState } from '../../lib/journey-state';
import { SacredJourneyMap } from '../SacredJourneyMap';
import { AltitudeChart } from '../AltitudeChart';
import { ShineBorder } from '../aliimam/ShineBorder';
import { mToFt } from '../../lib/conversions';
import { Clock, Mountain, Footprints, WifiOff } from '@aliimam/icons';

interface HighlightProps {
  icon: React.ReactNode;
  value: string;
  unit?: string;
  dual?: string;
  label: string;
}

function Highlight({ icon, value, unit, dual, label }: HighlightProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div className="text-muted-foreground mb-1">{icon}</div>
      <div className="font-sans text-3xl md:text-4xl font-bold text-foreground leading-none">
        {value}
        {unit && (
          <span className="text-base font-medium text-muted-foreground ml-1">{unit}</span>
        )}
        {dual && (
          <span className="ml-1 text-xs text-muted-foreground">{dual}</span>
        )}
      </div>
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

export function OverviewTab({ phase }: { phase: JourneyState }) {
  void phase;
  return (
    <div data-tab="overview">
      <SacredJourneyMap phase={phase} />
      <AltitudeChart />

      {/* Trip Highlights · ShineBorder wrapping 4 headline stats */}
      <section data-section="trip-highlights" className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-3xl">
          <ShineBorder borderWidth={2}>
            <div className="p-8 md:p-10 text-center">
              <p className="font-sans text-lg md:text-xl text-foreground mb-8 md:mb-10 max-w-xl mx-auto">
                A once-in-a-lifetime yatra to the sacred Kailash Manasarovar.
              </p>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-4">
                <Highlight
                  icon={<Clock size={20} />}
                  value="13"
                  unit="days"
                  label="YATRA LENGTH"
                />
                <Highlight
                  icon={<Mountain size={20} />}
                  value="5,630"
                  unit="m"
                  dual={'/ ' + mToFt(5630).toLocaleString('en-US') + ' ft'}
                  label="DOLMA LA PEAK"
                />
                <Highlight
                  icon={<Footprints size={20} />}
                  value="52"
                  unit="km"
                  label="PARIKRAMA CIRCUIT"
                />
                <Highlight
                  icon={<WifiOff size={20} />}
                  value="3 days"
                  label="PARIKRAMA BLACKOUT"
                />
              </div>
            </div>
          </ShineBorder>
        </div>
      </section>
    </div>
  );
}
