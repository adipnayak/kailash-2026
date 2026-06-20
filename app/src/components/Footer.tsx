/**
 * Footer.
 * Devotional phrase rendered exactly once per locked budget.
 * Source-of-truth constant lives in src/lib/devotional.ts.
 */
import { OM_NAMAH_SHIVAYA } from '../lib/devotional';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-6 py-10">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm text-muted">
          Single page. No tracking. No analytics. Weather refreshes via Open Meteo.
        </p>
        <p className="mt-4 font-sans text-xl text-accent">{OM_NAMAH_SHIVAYA}</p>
      </div>
    </footer>
  );
}
