/**
 * JourneyTimeline.
 * Horizontal scroll strip with calendar dates (not Day 1-13).
 *
 * BEFORE phase: Day 8 (14 Jul) red anchor + countdown + other days dimmed.
 * DURING phase: auto-scroll to current day centered + visually boxed.
 *               scroll-snap-type x mandatory.
 * AFTER phase:  static completion strip, every date marked complete,
 *               Day 8 still red anchor.
 *
 * Click: scroll to day card + switch tab to itinerary (via onTabSwitch).
 * GSAP: Day 8 red anchor pulse (opacity 0.7 to 1.0, repeat -1, yoyo).
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import type { JourneyState } from '../lib/journey-state';
import { DAYS } from '../lib/trip-data';

interface JourneyTimelineProps {
  phase: JourneyState;
  /** Called when user clicks a date chip while not on the itinerary tab. */
  onTabSwitch?: () => void;
}

/** Format ISO date string as "14 Jul" */
function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]}`;
}

/** Days remaining until a target ISO date from today */
function daysUntil(targetIso: string): number {
  const now = new Date();
  const target = new Date(targetIso + 'T00:00:00');
  const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.ceil((target.getTime() - nowMid.getTime()) / (1000 * 60 * 60 * 24)));
}

const ANCHOR_DAY = 8; // Day 8 = 14 Jul, the red anchor

export function JourneyTimeline({ phase, onTabSwitch }: JourneyTimelineProps) {
  const scrollRef = useRef<HTMLOListElement>(null);
  const anchorRef = useRef<HTMLLIElement>(null);

  // Auto-scroll to current day (during phase) or anchor day (before/after)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let targetDay: number;
    if (phase.phase === 'during' && phase.tripDayIndex >= 1) {
      targetDay = phase.tripDayIndex;
    } else {
      targetDay = ANCHOR_DAY;
    }

    const chip = container.querySelector(`[data-chip="${targetDay}"]`) as HTMLElement | null;
    if (!chip) return;

    // center the chip in the scroll container
    const containerWidth = container.offsetWidth;
    const chipLeft = chip.offsetLeft;
    const chipWidth = chip.offsetWidth;
    const scrollTarget = chipLeft - containerWidth / 2 + chipWidth / 2;
    container.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
  }, [phase.phase, phase.tripDayIndex]);

  // GSAP: pulse the Day 8 red anchor dot
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const ctx = gsap.context(() => {
      gsap.to('[data-anchor-dot]', {
        opacity: 0.7,
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, anchor);

    return () => ctx.revert();
  }, []);

  function handleChipClick(dayNum: number) {
    // Switch to itinerary tab if a callback is provided
    if (onTabSwitch) {
      onTabSwitch();
    }
    // Scroll to the day card
    // Use a small delay so the tab switch renders DayCards first
    setTimeout(() => {
      const card = document.querySelector(`[data-day="${dayNum}"]`) as HTMLElement | null;
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, onTabSwitch ? 60 : 0);
  }

  const countdown8 = daysUntil('2026-07-14');
  const is8Future = countdown8 > 0;

  return (
    <section
      data-section="journey-timeline"
      className="border-b border-border bg-card px-4 py-5"
    >
      {/* Countdown label: only shown before Day 8 */}
      {phase.phase === 'before' && is8Future && (
        <p className="mb-2 font-mono text-xs text-muted mx-auto max-w-5xl">
          {countdown8} {countdown8 === 1 ? 'day' : 'days'} until 14 Jul
        </p>
      )}

      <ol
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 mx-auto max-w-5xl"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        aria-label="13-day yatra timeline"
      >
        {DAYS.map((d) => {
          const isAnchor = d.day === ANCHOR_DAY;
          const isDuringCurrent = phase.phase === 'during' && phase.tripDayIndex === d.day;
          const isPast =
            phase.phase === 'after' ||
            (phase.phase === 'during' && d.day < phase.tripDayIndex);
          const isFutureDuring = phase.phase === 'during' && d.day > phase.tripDayIndex;

          // Before phase: dim everything except anchor
          const isBeforeDimmed = phase.phase === 'before' && !isAnchor;

          let chipClass =
            'relative shrink-0 cursor-pointer rounded-sm border px-3 py-2 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink ';

          if (isDuringCurrent) {
            // Active current day: boxed, ink border, scroll-snap center
            chipClass += 'border-ink bg-ink text-card ring-1 ring-ink';
          } else if (isAnchor && phase.phase === 'before') {
            // Before phase: red anchor
            chipClass += 'border-red bg-card text-red';
          } else if (isAnchor && phase.phase === 'after') {
            // After phase: red anchor still, but completed
            chipClass += 'border-red bg-card text-red';
          } else if (isAnchor && phase.phase === 'during' && isPast) {
            // Anchor day completed during
            chipClass += 'border-red/60 bg-card text-red/70';
          } else if (isAnchor && phase.phase === 'during' && isFutureDuring) {
            // Anchor day upcoming during
            chipClass += 'border-red bg-card text-red';
          } else if (isPast) {
            chipClass += 'border-green/50 bg-green/10 text-green';
          } else if (isFutureDuring) {
            chipClass += 'border-border bg-bg text-muted';
          } else if (isBeforeDimmed) {
            chipClass += 'border-border bg-bg text-muted/50';
          } else {
            chipClass += 'border-border bg-bg text-muted';
          }

          return (
            <li
              key={d.day}
              ref={isAnchor ? anchorRef : undefined}
              data-chip={d.day}
              className={chipClass}
              style={{ scrollSnapAlign: 'center' }}
              title={d.headline}
              role="button"
              tabIndex={0}
              aria-label={`${fmtDate(d.date)}: ${d.headline}`}
              onClick={() => handleChipClick(d.day)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChipClick(d.day);
                }
              }}
            >
              {/* Calendar date label */}
              <span className="block leading-none">{fmtDate(d.date)}</span>

              {/* After phase: checkmark under every date */}
              {phase.phase === 'after' && (
                <span className="mt-1 block text-center leading-none text-green">
                  <svg
                    width="10"
                    height="8"
                    viewBox="0 0 10 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="mx-auto"
                  >
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}

              {/* Past-during: small check dot */}
              {phase.phase === 'during' && isPast && !isDuringCurrent && (
                <span className="mt-1 block text-center leading-none text-green">
                  <svg
                    width="10"
                    height="8"
                    viewBox="0 0 10 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="mx-auto"
                  >
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}

              {/* Anchor pulse dot for Day 8 */}
              {isAnchor && (phase.phase === 'before' || (phase.phase === 'during' && !isDuringCurrent && !isPast)) && (
                <span
                  data-anchor-dot
                  className="mt-1 mx-auto block h-1 w-1 rounded-full bg-red"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
