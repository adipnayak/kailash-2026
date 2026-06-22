/**
 * PrepareTab.
 * PreparationDashboard + WeatherConfidence + before-phase callouts.
 * Icons via Material Symbols Outlined.
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
