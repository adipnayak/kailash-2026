/**
 * Footer.
 * Devotional phrase rendered exactly once per locked budget.
 * Source-of-truth constant lives in src/lib/devotional.ts.
 * Wrapped in AliimamFooter block (aliimam-real adoption).
 * Dates pulled from DAYS[0] and DAYS[12] -- never hardcoded.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import { AliimamFooter } from './aliimam/AliimamFooter';
import { OM_NAMAH_SHIVAYA } from '../lib/devotional';
import { DAYS } from '../lib/trip-data';

// Derive date range from trip data (Jul 7 - Jul 19 2026 per trip-data.ts)
const startDate = DAYS[0].date;   // '2026-07-07'
const endDate = DAYS[12].date;    // '2026-07-19'

function fmtShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const TRIP_RANGE = fmtShort(startDate) + ' to ' + fmtShort(endDate);

export function Footer() {
  return (
    <>
      <AliimamFooter
        year={new Date().getFullYear()}
        attribution={'Kailash Manasarovar Yatra ' + TRIP_RANGE}
      />
      <div className="bg-card border-t border-border px-6 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          Single page. No tracking. No analytics. Weather refreshes via Open Meteo.
        </p>
        <p className="mt-3 font-sans text-xl text-sacred">{OM_NAMAH_SHIVAYA}</p>
      </div>
    </>
  );
}
