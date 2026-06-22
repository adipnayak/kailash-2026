import { lazy, Suspense } from 'react';
import { useJourneyState, useTabPersist } from './hooks/useJourneyState';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { OverviewTab } from './components/tabs/OverviewTab';

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
    </div>
  );
}
