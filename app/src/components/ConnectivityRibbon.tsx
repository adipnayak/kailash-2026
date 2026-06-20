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
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Wifi, WifiOff, Signal } from '@aliimam/icons';
import { DAYS, type ConnStatus } from '../lib/trip-data';
import { useJourneyState } from '../hooks/useJourneyState';

// ---------------------------------------------------------------------------
// Per-status style tokens (Tailwind v4 / Maurten CSS vars only)
// ---------------------------------------------------------------------------
const STATUS_DOT: Record<ConnStatus, { bg: string; border: string; label: string }> = {
  good:         { bg: 'bg-emerald',   border: 'border-emerald',   label: 'Reachable'    },
  intermittent: { bg: 'bg-sacred',  border: 'border-sacred',  label: 'Limited'      },
  offline:      { bg: 'bg-destructive',     border: 'border-destructive',     label: 'Offline'      },
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
      <div className="mx-auto max-w-5xl">
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

            // Visual dimming: in before-phase, green/intermittent dots are muted
            const dimmed = phase === 'before' && !isOfflineCluster;
            // In after-phase: everything is at same opacity (static look-back)

            const { bg, border } = STATUS_DOT[d.conn_status];

            // Choose icon: good -> Wifi, intermittent -> Circle (partial), offline -> WifiOff
            const Icon =
              d.conn_status === 'good'
                ? Wifi
                : d.conn_status === 'offline'
                ? WifiOff
                : Signal;

            return (
              <li
                key={d.day}
                className={[
                  'conn-dot',
                  'flex flex-col items-center gap-1 rounded',
                  'border px-1 py-2',
                  'transition-all duration-200',
                  isToday
                    ? 'border-primary bg-card shadow-sm ring-1 ring-primary'
                    : isBeforePhaseRedHighlight
                    ? `${border} bg-card`
                    : `border-border bg-card`,
                  dimmed ? 'opacity-35' : 'opacity-100',
                ].join(' ')}
                title={`D${d.day}: ${d.conn_label}`}
                aria-label={`Day ${d.day}: ${d.conn_label}`}
              >
                {/* Dot indicator */}
                <span
                  className={[
                    'h-2 w-2 rounded-full',
                    bg,
                    isBeforePhaseRedHighlight ? 'ring-1 ring-red/50' : '',
                  ].join(' ')}
                />

                {/* Icon */}
                <Icon
                  size={12}
                  className={
                    d.conn_status === 'good'
                      ? 'text-emerald'
                      : d.conn_status === 'offline'
                      ? 'text-destructive'
                      : 'text-sacred'
                  }
                  aria-hidden
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
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-3">
            {(
              [
                ['good', 'Reachable'],
                ['intermittent', 'Limited'],
                ['offline', 'Offline'],
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
            D3-D10: GFW in Tibet. VPN required for WhatsApp.
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
