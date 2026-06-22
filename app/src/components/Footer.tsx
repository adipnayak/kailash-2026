/**
 * Footer.
 * Two-column nav grid mirroring the top tabs (so the section affordance
 * isn't lost when scrolled all the way down), brand mark + one-line
 * tagline, then the contextual story of Mount Kailash, Lake Mansarovar
 * and the Parikrama.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import { Mountain, LayoutGrid, CalendarDays, ListChecks, BookOpen } from '@aliimam/icons';
import type { Tab } from '../hooks/useJourneyState';

interface FooterProps {
  onTab: (t: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',  label: 'Overview',  icon: <LayoutGrid  size={16} /> },
  { id: 'itinerary', label: 'Itinerary', icon: <CalendarDays size={16} /> },
  { id: 'prepare',   label: 'Prepare',   icon: <ListChecks  size={16} /> },
  { id: 'reference', label: 'Reference', icon: <BookOpen    size={16} /> },
];

export function Footer({ onTab }: FooterProps) {
  function handleTab(t: Tab) {
    onTab(t);
    // Take the user back to the top so they actually see the section they
    // just navigated to instead of staying at the bottom of the page.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <footer className="border-t border-border px-4 py-12 md:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Secondary nav: 2-col grid mirroring the top tabs */}
        <nav aria-label="Sections">
          <ol className="grid grid-cols-2 gap-2">
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => handleTab(t.id)}
                  className="flex w-full items-center gap-2 rounded-none border border-border bg-card px-4 py-4 font-mono text-sm uppercase tracking-wider text-foreground transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-muted-foreground" aria-hidden>{t.icon}</span>
                  {t.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-2">
          <span className="flex items-center gap-2 font-medium text-sm text-foreground">
            <Mountain className="size-4" />
            Kailash Mansarovar Yatra 2026
          </span>

          <p className="text-muted-foreground text-sm">
            A sacred pilgrimage to Mount Kailash and Lake Manasarovar across the Tibetan Plateau.
          </p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            Mount Kailash, at the western edge of the Tibetan plateau, is one of the few mountains in the world considered sacred across four religions. In Hinduism it is the abode of Lord Shiva. In Buddhism it is the dwelling of Demchok, embodiment of supreme bliss. In Jainism it is where Rishabhadeva attained liberation. In Bon it is the seat of the spiritual hierarchy of the cosmos.
          </p>
          <p>
            Lake Mansarovar, at its base, is believed to be the lake of the mind itself. The Parikrama, the 52 km circumambulation around Kailash, is undertaken once in a lifetime by many pilgrims and is said to wash away the sins of a lifetime.
          </p>
          <p>
            This yatra follows that pilgrimage. The 13 days that follow are the practical shape of an experience much older than any of us.
          </p>
        </div>
      </div>
    </footer>
  );
}
