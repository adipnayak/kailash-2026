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

export function PrepareTab({ phase: _phase }: { phase: JourneyState }) {
  return (
    <div data-tab="prepare">
      <PreparationDashboard />
      <WeatherConfidence />
    </div>
  );
}
