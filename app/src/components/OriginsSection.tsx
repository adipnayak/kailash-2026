/**
 * OriginsSection.
 *
 * Follows the aliimam Card pricing-pattern layout (Card/CardHeader/CardTitle/
 * CardDescription/CardContent/CardFooter + dashed hr + Check checklist + CTA).
 *
 * 4 cards · one per known origin in the v4 cohort (Mumbai · Dubai · Port Louis ·
 * New York). The "price-like" big stat is the timezone offset (most distinctive
 * per origin and ties back to the Hero TZ toggle).
 *
 * CTA writes `kailash_origin` to localStorage and reloads so the Sacred Journey
 * Map auto-highlights the active origin ray.
 *
 * Anti-AI typography: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { Check } from '@aliimam/icons';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface Origin {
  id: 'mumbai' | 'uae' | 'mauritius' | 'us';
  city: string;
  country: string;
  tz: string;
  offset: string;
  airport: string;
  highlights: string[];
}

const ORIGINS: Origin[] = [
  {
    id: 'mumbai',
    city: 'Mumbai',
    country: 'India',
    tz: 'Asia/Kolkata',
    offset: 'UTC+5:30',
    airport: 'BOM Chhatrapati Shivaji Maharaj International',
    highlights: [
      'Direct flight BOM to KTM (1.5 to 2 hours)',
      'Operator pickup window 11:00 to 15:00 NPT',
      'INR cash easily available pre-departure',
      'Nepal entry: visa on arrival',
    ],
  },
  {
    id: 'uae',
    city: 'Dubai',
    country: 'UAE',
    tz: 'Asia/Dubai',
    offset: 'UTC+4',
    airport: 'DXB Dubai International',
    highlights: [
      'Direct flight DXB to KTM (4 hours)',
      'Operator pickup window 11:00 to 15:00 NPT',
      'USD or AED for KTM transit',
      'Nepal entry: visa on arrival',
    ],
  },
  {
    id: 'mauritius',
    city: 'Port Louis',
    country: 'Mauritius',
    tz: 'Indian/Mauritius',
    offset: 'UTC+4',
    airport: 'MRU Sir Seewoosagur Ramgoolam International',
    highlights: [
      'Connect via Mumbai or Dubai to KTM',
      'Plan a rest day pre-departure',
      'Convert to USD or INR for KTM transit',
      'Nepal entry: visa on arrival',
    ],
  },
  {
    id: 'us',
    city: 'New York',
    country: 'US East Coast',
    tz: 'America/New_York',
    offset: 'UTC-5',
    airport: 'JFK John F. Kennedy International',
    highlights: [
      'Connect via Doha, Dubai, or Delhi to KTM',
      '22 to 26 hour total transit',
      'Hard jetlag: pad rest at Lhasa Day 4',
      'Nepal entry: visa on arrival',
    ],
  },
];

function setOrigin(id: Origin['id']) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('kailash_origin', id);
  window.location.reload();
}

export function OriginsSection() {
  return (
    <section data-section="origins" className="border-b border-border bg-background px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 md:mb-10 text-center">
          <h2 className="font-sans text-2xl md:text-3xl font-medium text-foreground">
            Yatris from across the world
          </h2>
          <p className="mt-2 font-sans text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            23 yatris are joining the 7 to 19 July 2026 batch from four origins. Pick yours to highlight the route on the map.
          </p>
        </header>

        <div className="border-x border-border">
          <div className="grid md:grid-cols-2 lg:grid-cols-4">
            {ORIGINS.map((origin, i) => {
              const isLastCol = (i + 1) % 4 === 0;
              const isLastMdCol = (i + 1) % 2 === 0;
              return (
                <Card
                  key={origin.id}
                  className="flex flex-col border-x-0 border-y-0 shadow-none lg:border-r"
                  style={{
                    borderRightWidth: isLastCol ? 0 : undefined,
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold">{origin.city}</CardTitle>
                    <span className="text-sacred my-3 block text-xl md:text-2xl font-semibold font-mono">
                      {origin.offset}
                    </span>
                    <CardDescription className="text-xs md:text-sm">
                      {origin.country} · {origin.tz}
                    </CardDescription>
                    <CardDescription className="text-xs">
                      {origin.airport}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <hr className="border-dashed border-border" />
                    <ul className="list-outside space-y-3 text-sm">
                      {origin.highlights.map((item, ix) => (
                        <li key={ix} className="flex items-start gap-2 text-foreground">
                          <Check className="size-3 mt-1 shrink-0 text-muted-foreground" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="mt-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                      onClick={() => setOrigin(origin.id)}
                    >
                      Set as my origin
                    </Button>
                  </CardFooter>

                  {/* hide last-col right-border at md breakpoint */}
                  {isLastMdCol && (
                    <style>{`@media (min-width: 768px) and (max-width: 1023px) { [data-card-origin="${origin.id}"] { border-right-width: 0; } }`}</style>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
