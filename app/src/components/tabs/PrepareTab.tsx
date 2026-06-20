/**
 * PrepareTab.
 * TODO: PreparationDashboard + WeatherConfidence + before-phase callouts.
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
