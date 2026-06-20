/**
 * SacredJourneyMap.
 * TODO (downstream Ralph): migrate the geographic SVG map with
 *   - origin rays (Mumbai, UAE, Mauritius, US) wired to resolveOrigin()
 *   - 13 day nodes positioned by lat/lon
 *   - phase variants (before: full route preview, during: progress fill, after: completed)
 *   - sacred markers and Dolma La emphasis
 *   PRD reference: section 2 (Sacred Journey Map). Keep inline SVG for geography,
 *   use lucide-react icons only for marker glyphs.
 */
import type { JourneyState } from '../lib/journey-state';

export function SacredJourneyMap({ phase }: { phase: JourneyState }) {
  return (
    <section
      data-section="sacred-journey-map"
      className="border-b border-border bg-bg px-6 py-12"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="font-sans text-2xl font-medium text-ink">Sacred Journey Map</h2>
        <p className="mt-2 text-muted">
          TODO: geographic SVG with origin rays, 13 nodes, phase variants.
          Current phase: {phase.phase}.
        </p>
      </div>
    </section>
  );
}
