/**
 * DiamoxBookendCard -- renders a standalone Diamox dose card for the 4
 * bookend dates (28 Jun test, 6 Jul start, 20 Jul buffer, 21 Jul buffer).
 *
 * No weather, no timeline, no bags. Diamox + context note only.
 * Anchor id="diamox-{dateISO}" is used by ItineraryTab scrollspy.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { Icon } from './Icon';
import { describeDose, type DiamoxDose } from '../lib/diamox-regime';

const BADGE_FOR_DATE: Record<string, string> = {
  '2026-06-28': 'PRE-TRIP - TEST DOSE',
  '2026-07-06': 'PRE-TRIP - START TONIGHT',
  '2026-07-20': 'POST-TRIP - BUFFER',
  '2026-07-21': 'POST-TRIP - FINAL DOSE',
};

const CONTEXT_NOTE: Record<string, string> = {
  '2026-06-28': 'Test dose at home. Watch for sulfa allergy reaction within 1 hour.',
  '2026-07-06': 'Start prophylaxis tonight. From tomorrow take twice daily through 21 Jul.',
  '2026-07-20': 'Continue twice daily at home. Do not stop yet, the buffer prevents rebound.',
  '2026-07-21': 'Final twice-daily dose today. Tomorrow you can stop.',
};

export function DiamoxBookendCard({ dose }: { dose: DiamoxDose }) {
  const badge = BADGE_FOR_DATE[dose.dateISO] ?? 'DIAMOX';
  const note = CONTEXT_NOTE[dose.dateISO] ?? '';

  return (
    <div id={'diamox-' + dose.dateISO} className="scroll-mt-24 border border-border bg-card my-6">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono uppercase tracking-widest text-sacred text-[10px]">{badge}</p>
        <p className="mt-1 text-base text-foreground">{dose.dayLabel} 2026</p>
      </div>

      {/* Diamox today block */}
      <section className="border-l-4 border-sacred bg-card px-4 py-3 flex items-start gap-2 m-4">
        <Icon name="medication" size={14} className="mt-0.5 text-sacred shrink-0" />
        <div className="flex flex-1 min-w-0 flex-col">
          <p className="font-mono uppercase tracking-widest text-sacred text-[10px]">Diamox today</p>
          <p className="mt-0.5 text-sm text-foreground">{describeDose(dose)}</p>
        </div>
      </section>

      {/* Context note */}
      {note && (
        <p className="px-4 pb-4 text-sm text-muted-foreground">{note}</p>
      )}
    </div>
  );
}
