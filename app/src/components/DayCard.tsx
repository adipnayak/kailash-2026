/**
 * DayCard.
 * TODO (downstream Ralph): per-day expanded card with
 *   - 21st.dev agent-plan inspired inner timeline (vertical stepper)
 *   - timeline events, wear, stay, food, bathroom, timing, carry, spiritual, weather
 *   - day_type chip (normal | critical | holy | rest) using lucide icons not emojis
 *   - is-today emphasis + GSAP first-occurrence sacred-label gloss
 *   PRD reference: section 5 (Day Cards).
 */
import type { TripDay } from '../lib/trip-data';
import { formatAltitude } from '../lib/conversions';

export function DayCard({ day, isToday }: { day: TripDay; isToday: boolean }) {
  return (
    <article
      data-day={day.day}
      className={
        'border border-border bg-card p-4 ' + (isToday ? 'ring-1 ring-ink' : '')
      }
    >
      <header className="flex items-baseline justify-between">
        <h3 className="font-sans text-lg font-medium text-ink">
          Day {day.day}: {day.location}
        </h3>
        <span className="font-mono text-xs text-muted">{day.date}</span>
      </header>
      <p className="mt-2 text-ink">{day.headline}</p>
      <p className="mt-1 font-mono text-xs text-muted">
        Peak {formatAltitude(day.altitude_peak)}
      </p>
      <p className="mt-3 text-xs text-muted">
        TODO: agent-plan inner timeline, wear, food, weather sections.
      </p>
    </article>
  );
}
