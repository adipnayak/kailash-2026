import { useJourneyState, useTabPersist } from './hooks/useJourneyState';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { OverviewTab } from './components/tabs/OverviewTab';
import { ItineraryTab } from './components/tabs/ItineraryTab';
import { PrepareTab } from './components/tabs/PrepareTab';
import { ReferenceTab } from './components/tabs/ReferenceTab';

export default function App() {
  const phase = useJourneyState();
  const [tab, setTab] = useTabPersist();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav tab={tab} onTab={setTab} />
      <main>
        {tab === 'overview' && <OverviewTab phase={phase} />}
        {tab === 'itinerary' && <ItineraryTab phase={phase} />}
        {tab === 'prepare' && <PrepareTab phase={phase} />}
        {tab === 'reference' && <ReferenceTab />}
      </main>
      <Footer />
    </div>
  );
}
