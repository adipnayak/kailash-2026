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
        title="Kailash Manasarovar 2026"
        subtitle="A sacred journey across the roof of the world. 13 days. 5,630 m."
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
