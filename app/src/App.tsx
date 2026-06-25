import { lazy, Suspense, useEffect } from 'react';
import { useJourneyState, useTabPersist } from './hooks/useJourneyState';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { OfflineBadge } from './components/OfflineBadge';
import { OverviewTab } from './components/tabs/OverviewTab';
import { PRECACHE_TILES } from './lib/precache-tiles';

// Lazy-load the non-default tabs. Each becomes its own chunk so the initial
// page load doesn't pay for JourneyTimeline / DayCard / WeatherConfidence /
// PreparationDashboard / reference content until the user clicks the tab.
const ItineraryTab = lazy(() =>
  import('./components/tabs/ItineraryTab').then((m) => ({ default: m.ItineraryTab })),
);
const PrepareTab = lazy(() =>
  import('./components/tabs/PrepareTab').then((m) => ({ default: m.PrepareTab })),
);
const ReferenceTab = lazy(() =>
  import('./components/tabs/ReferenceTab').then((m) => ({ default: m.ReferenceTab })),
);

const TILES_WARMED_KEY = 'kailash_tiles_warmed_v1';

/**
 * Fire-and-forget tile pre-warm. Runs once per browser session (tracked via
 * localStorage). Deferred 2 s after mount so it doesn't compete with the
 * initial page render or above-the-fold resources.
 *
 * Each fetch uses mode: 'no-cors' because CartoDB tiles do not send CORS
 * headers. The SW's CartoDB CacheFirst rule intercepts the opaque responses
 * and stores them in the 'cartodb-tiles' runtime cache regardless.
 *
 * The total URL count is capped at 500 in precache-tiles.ts, so the worst
 * case is 500 small PNG requests staggered over ~5 s (random jitter).
 */
function warmTiles() {
  if (typeof window === 'undefined') return;
  if (!navigator.onLine) return;
  if (localStorage.getItem(TILES_WARMED_KEY)) return;

  localStorage.setItem(TILES_WARMED_KEY, '1');

  // Stagger all fetches randomly over 0-5 s to be polite to CartoDB.
  Promise.all(
    PRECACHE_TILES.map(
      (url) =>
        new Promise<void>((resolve) => {
          setTimeout(
            () => {
              fetch(url, { mode: 'no-cors' }).catch(() => {/* ignore */}).finally(resolve);
            },
            Math.random() * 5000,
          );
        }),
    ),
  ).catch(() => {/* ignore */});
}

function TabFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 font-mono text-xs text-muted-foreground">
      Loading...
    </div>
  );
}

export default function App() {
  const phase = useJourneyState();
  const [tab, setTab] = useTabPersist();

  // Defer tile pre-warm until after the page is interactive.
  useEffect(() => {
    const id = setTimeout(warmTiles, 2000);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Persistent visually-hidden h1 for screen readers + crawlers.
          Stays in the DOM on all tabs so the page always has exactly one h1. */}
      <h1 className="sr-only">Kailash Mansarovar Yatra 2026</h1>
      <Nav tab={tab} onTab={setTab} />
      <main>
        {tab === 'overview' && <OverviewTab phase={phase} onTab={setTab} />}
        {tab !== 'overview' && (
          <Suspense fallback={<TabFallback />}>
            {tab === 'itinerary' && <ItineraryTab phase={phase} />}
            {tab === 'prepare' && <PrepareTab phase={phase} />}
            {tab === 'reference' && <ReferenceTab />}
          </Suspense>
        )}
      </main>
      <Footer onTab={setTab} />
      <BackToTop />
      <OfflineBadge />
    </div>
  );
}
