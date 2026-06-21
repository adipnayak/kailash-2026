/**
 * Nav: 4-tab strip (Overview, Itinerary, Prepare, Reference).
 * Persistence via useTabPersist (localStorage key kailash_tab).
 * aliimam-real: @aliimam/icons used left of each tab label.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import type { Tab } from '../hooks/useJourneyState';
import { LayoutGrid, CalendarDays, ListChecks, BookOpen } from '@aliimam/icons';
import { ThemeToggle } from './ThemeToggle';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',  label: 'Overview',   icon: <LayoutGrid  size={14} /> },
  { id: 'itinerary', label: 'Itinerary',  icon: <CalendarDays size={14} /> },
  { id: 'prepare',   label: 'Prepare',    icon: <ListChecks  size={14} /> },
  { id: 'reference', label: 'Reference',  icon: <BookOpen    size={14} /> },
];

export function Nav({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav
      data-section="nav"
      className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur px-6"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTab(t.id)}
              aria-pressed={active}
              className={
                'flex items-center gap-1.5 border-b-2 px-3 py-3 font-mono text-sm uppercase tracking-wider transition-colors ' +
                (active
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground')
              }
              title={t.label}
            >
              {t.icon}
              {active ? (
                <span>{t.label}</span>
              ) : (
                <span className="sr-only">{t.label}</span>
              )}
            </button>
          );
        })}
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
