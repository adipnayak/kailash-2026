/**
 * WeatherConfidence.
 * TODO (downstream Ralph): per-day weather card with Open Meteo refresh,
 *   confidence band (climatology vs forecast), temp/precip/wind/UV chips.
 *   PRD reference: section 7 (Weather Confidence).
 */

export function WeatherConfidence() {
  return (
    <section
      data-section="weather-confidence"
      className="border-b border-border bg-card px-6 py-8"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="font-sans text-2xl font-medium text-ink">Weather Confidence</h2>
        <p className="mt-2 text-muted">
          TODO: Open Meteo integration, climatology fallback, confidence band.
        </p>
      </div>
    </section>
  );
}
