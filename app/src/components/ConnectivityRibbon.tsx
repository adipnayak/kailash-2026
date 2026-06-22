/**
 * ConnectivityRibbon.
 * 13-day strip showing connectivity status with phase-aware headlines.
 *
 * Phase logic:
 *   before - red cluster (D7-D9) anchored, headline "They will be offline for ~3 days mid-trip"
 *   during - today highlighted, headline "Today: Limited" / "Today: Offline" / "Today: Reachable"
 *   after  - static look-back, headline "3 offline days completed"
 *
 * Anti-AI: zero em-dashes, en-dashes, smart quotes, or emojis.
 */

import { Icon } from './Icon';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { DAYS, type ConnStatus } from '../lib/trip-data';
import { useJourneyState } from '../hooks/useJourneyState';

// ---------------------------------------------------------------------------
// Per-status style tokens (Tailwind v4 / Maurten CSS vars only)
// ---------------------------------------------------------------------------
const STATUS_DOT: Record<ConnStatus, { bg: string; border: string; label: string }> = {
  good:         { bg: 'bg-emerald',   border: 'border-emerald',   label: 'WiFi & phone' },
  intermittent: { bg: 'bg-sacred',  border: 'border-sacred',  label: 'Phone only'   },
  offline:      { bg: 'bg-destructive',     border: 'border-destructive',     label: 'No signal'    },
};

// ---------------------------------------------------------------------------
// Headline helpers
// ---------------------------------------------------------------------------
function beforeHeadline(): string {
  return 'They will be offline for ~3 days mid-trip (D7-D9)';
}

function duringHeadline(status: ConnStatus): string {
  const label = STATUS_DOT[status].label;
  return `Today: ${label}`;
}

function afterHeadline(): string {
  return '3 offline days completed';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ConnectivityRibbon() {
  const journey = useJourneyState();
  const { phase, tripDayIndex, connectivity_today } = journey;

  const dotsRef = useRef<HTMLOListElement>(null);
  const hasAnimated = useRef(false);

  // GSAP: dots fill in sequentially on first view (gsap.context cleanup)
  useEffect(() => {
    if (!dotsRef.current || hasAnimated.current) return;
    hasAnimated.current = true;

    const ctx = gsap.context(() => {
      gsap.from('.conn-dot', {
        scale: 0,
        opacity: 0,
        duration: 0.35,
        stagger: 0.06,
        ease: 'back.out(1.6)',
        clearProps: 'scale,opacity',
      });
    }, dotsRef);

    return () => ctx.revert();
  }, []);

  // Headline text
  let headline: string;
  if (phase === 'before') {
    headline = beforeHeadline();
  } else if (phase === 'during') {
    headline = duringHeadline(connectivity_today);
  } else {
    headline = afterHeadline();
  }

  // During phase: today's 1-based index
  const todayIdx = phase === 'during' ? tripDayIndex : null;

  return (
    <section
      data-section="connectivity-ribbon"
      className="border-b border-border bg-background px-6 py-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header row */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="font-sans text-2xl font-medium text-foreground">Connectivity</h2>
          <p className="font-sans text-sm text-muted-foreground">{headline}</p>
        </div>

        {/* 13-day dot strip */}
        <ol
          ref={dotsRef}
          className="mt-4 grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1"
        >
          {DAYS.map((d) => {
            const isToday = todayIdx === d.day;
            const isOfflineCluster = d.conn_status === 'offline';
            const isBeforePhaseRedHighlight = phase === 'before' && isOfflineCluster;

            // No dimming -- every day at the same level so Reachable / Limited
            // / Offline read at the same weight.

            const { bg, border } = STATUS_DOT[d.conn_status];

            // Pick the Material Symbol name based on connectivity status.
            const iconName =
              d.conn_status === 'good'
                ? 'wifi'
                : d.conn_status === 'offline'
                ? 'wifi_off'
                : 'signal_cellular_alt';

            return (
              <li
                key={d.day}
                className={[
                  'conn-dot',
                  'flex flex-col items-center gap-1 rounded-none',
                  'border px-1 py-2',
                  'transition-all duration-200',
                  isToday
                    ? 'border-primary bg-card shadow-sm ring-1 ring-primary'
                    : isBeforePhaseRedHighlight
                    ? `${border} bg-card`
                    : `border-border bg-card`,
                  'opacity-100',
                ].join(' ')}
                title={`D${d.day}: ${d.conn_label}`}
                aria-label={`Day ${d.day}: ${d.conn_label}`}
              >
                {/* Dot indicator */}
                <span
                  className={[
                    'h-2 w-2 rounded-full',
                    bg,
                    isBeforePhaseRedHighlight ? 'ring-1 ring-destructive/50' : '',
                  ].join(' ')}
                />

                {/* Icon */}
                <Icon
                  name={iconName}
                  size={12}
                  className={
                    d.conn_status === 'good'
                      ? 'text-emerald'
                      : d.conn_status === 'offline'
                      ? 'text-destructive'
                      : 'text-sacred'
                  }
                />

                {/* Day label */}
                <span
                  className={[
                    'font-mono text-[9px] leading-none',
                    isToday ? 'font-medium text-foreground' : 'text-muted-foreground',
                  ].join(' ')}
                >
                  D{d.day}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Legend + callout row */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-4">
            {(
              [
                ['good', 'WiFi & phone'],
                ['intermittent', 'Phone only'],
                ['offline', 'No signal'],
              ] as [ConnStatus, string][]
            ).map(([status, label]) => (
              <span key={status} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status].bg}`} />
                <span className="font-sans text-xs text-muted-foreground">{label}</span>
              </span>
            ))}
          </div>

          {/* GFW callout: visible when any day has GFW note */}
          <span className="font-sans text-xs text-muted-foreground">
            D3-D10: some apps blocked in Tibet. VPN app needed for WhatsApp.
          </span>

          {/* Sherpa sat-phone note: shown in before + during offline phase */}
          {(phase === 'before' || (phase === 'during' && connectivity_today === 'offline')) && (
            <span className="font-sans text-xs text-muted-foreground">
              Sherpa sat phone is the emergency fallback when offline.
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
