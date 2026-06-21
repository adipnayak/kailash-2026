/**
 * OverviewTab.
 * Phase-aware overview: SacredJourneyMap + Hero (bento + header strip) + AltitudeChart.
 *
 * v4 nav-top: Hero moved into Overview tab so the 4-tab nav sits at the page top.
 * Trip-highlights ShineBorder removed per Adip (those stats now live inside the
 * Hero bento itself).
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import type { JourneyState } from '../../lib/journey-state';
import { Hero } from '../Hero';
import { SacredJourneyMap } from '../SacredJourneyMap';
import { AltitudeChart } from '../AltitudeChart';

export function OverviewTab({ phase }: { phase: JourneyState }) {
  return (
    <div data-tab="overview">
      <SacredJourneyMap phase={phase} />
      <Hero phase={phase} />
      <AltitudeChart />
    </div>
  );
}
