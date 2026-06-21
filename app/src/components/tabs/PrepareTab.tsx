/**
 * PrepareTab.
 * PreparationDashboard + WeatherConfidence + before-phase callouts.
 * aliimam-real: @aliimam/icons for category section headers.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import type { JourneyState } from '../../lib/journey-state';
import { PreparationDashboard } from '../PreparationDashboard';
import { WeatherConfidence } from '../WeatherConfidence';
import { ListChecks } from '@aliimam/icons';

export function PrepareTab({ phase: _phase }: { phase: JourneyState }) {
  return (
    <div data-tab="prepare">
      <div className="border-b border-border bg-card px-6 py-6">
        <div className="mx-auto max-w-6xl flex items-center gap-2">
          <ListChecks size={20} className="text-muted-foreground" />
          <h2 className="font-sans text-2xl font-medium text-foreground">Preparation Checklist</h2>
        </div>
      </div>
      <PreparationDashboard />
      <WeatherConfidence />
    </div>
  );
}
