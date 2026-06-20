/**
 * Hero.
 * TODO (downstream Ralph): migrate v3.12 hero with phase variants
 *   (before: countdown to depart, during: today's day card big-num,
 *    after: Yatra Sampoorna summary).
 *   PRD reference: section 1 (Hero).
 */
import type { JourneyState } from '../lib/journey-state';
import { Mountain } from 'lucide-react';

export function Hero({ phase }: { phase: JourneyState }) {
  return (
    <section
      data-section="hero"
      className="border-b border-border bg-card px-6 py-16"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-3 text-muted font-mono text-xs uppercase tracking-widest">
          <Mountain size={16} />
          <span>Kailash 2026 yatra</span>
        </div>
        <h1 className="mt-4 font-sans text-4xl font-medium text-ink md:text-6xl">
          Phase: {phase.phase}
        </h1>
        <p className="mt-3 text-muted">
          TODO: migrate Hero variants per phase. Placeholder shows phase only.
        </p>
      </div>
    </section>
  );
}
