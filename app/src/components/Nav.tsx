/**
 * Nav: 4-tab strip (Overview, Itinerary, Prepare, Reference).
 * Persistence via useTabPersist (localStorage key kailash_tab).
 */
import type { Tab } from '../hooks/useJourneyState';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'prepare', label: 'Prepare' },
  { id: 'reference', label: 'Reference' },
];

export function Nav({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav
      data-section="nav"
      className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur px-6"
    >
      <div className="mx-auto flex max-w-5xl gap-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTab(t.id)}
              aria-pressed={active}
              className={
                'border-b-2 px-3 py-3 font-mono text-sm uppercase tracking-wider transition-colors ' +
                (active
                  ? 'border-ink text-ink'
                  : 'border-transparent text-muted hover:text-ink')
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
