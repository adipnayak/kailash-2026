import { useJourneyState, useTabPersist } from './hooks/useJourneyState';
import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { OverviewTab } from './components/tabs/OverviewTab';
import { ItineraryTab } from './components/tabs/ItineraryTab';
import { PrepareTab } from './components/tabs/PrepareTab';
import { ReferenceTab } from './components/tabs/ReferenceTab';
import { AliimamHero } from './components/aliimam/AliimamHero';

export default function App() {
  const phase = useJourneyState();
  const [tab, setTab] = useTabPersist();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <AliimamHero
        title="Kailash Mansarovar 2026"
        subtitle="A pilgrimage to the abode of Lord Shiva. 7 to 19 July 2026 batch."
        primaryLabel="View Itinerary"
        primaryHref="#itinerary"
        secondaryLabel="Prepare"
        secondaryHref="#prepare"
      />
      <Hero phase={phase} />
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
