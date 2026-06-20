/**
 * ConnectivityRibbon.
 * TODO (downstream Ralph): 13-cell strip of good / intermittent / offline bands
 *   with GFW callout, last-signal markers, next-signal label.
 *   Use lucide Wifi / WifiOff icons, not emojis.
 *   PRD reference: section 6 (Connectivity Ribbon).
 */
import { DAYS, type ConnStatus } from '../lib/trip-data';
import { Wifi, WifiOff, Signal } from 'lucide-react';

const ICON: Record<ConnStatus, typeof Wifi> = {
  good: Wifi,
  intermittent: Signal,
  offline: WifiOff,
};

export function ConnectivityRibbon() {
  return (
    <section
      data-section="connectivity-ribbon"
      className="border-b border-border bg-bg px-6 py-8"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="font-sans text-2xl font-medium text-ink">Connectivity</h2>
        <ol className="mt-4 grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1">
          {DAYS.map((d) => {
            const Icon = ICON[d.conn_status];
            return (
              <li
                key={d.day}
                className="flex items-center justify-center border border-border bg-card p-2"
                title={d.conn_label}
              >
                <Icon size={14} className="text-muted" />
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-muted text-sm">
          TODO: GFW callout, last-signal markers, sherpa sat-phone note.
        </p>
      </div>
    </section>
  );
}
