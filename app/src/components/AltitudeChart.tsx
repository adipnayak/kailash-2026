/**
 * AltitudeChart.
 * TODO (downstream Ralph): build using reaviz AreaChart
 *   (basis for 21st.dev detailed-normalized-incident-report).
 *   Plot altitude_peak and altitude_sleep over 13 days. Mark Dolma La with annotation.
 *   PRD reference: section 4 (Altitude Chart).
 */
import { DAYS } from '../lib/trip-data';

export function AltitudeChart() {
  const peak = Math.max(...DAYS.map((d) => d.altitude_peak));
  return (
    <section
      data-section="altitude-chart"
      className="border-b border-border bg-bg px-6 py-12"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="font-sans text-2xl font-medium text-ink">Altitude Profile</h2>
        <p className="mt-2 text-muted">
          TODO: reaviz AreaChart with peak and sleep series. High point: {peak.toLocaleString('en-US')} m at Dolma La.
        </p>
      </div>
    </section>
  );
}
