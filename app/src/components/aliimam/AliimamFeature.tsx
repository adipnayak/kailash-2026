/**
 * aliimam feature-01 block -- adapted for Vite/React + Maurten tokens.
 * Source: aliimam-in/aliimam registry/aliimam/blocks/feature/feature-01/page.tsx
 * License: MIT (aliimam-in/aliimam)
 *
 * Adaptations:
 *   - Removed "use client" directive
 *   - Replaced next/link with <a>
 *   - Replaced @/registry button with inline Tailwind button
 *   - Replaced shadcn color tokens (--card, --secondary) with Maurten tokens
 *   - Made icon, title, body props configurable
 *   - Uses @aliimam/icons directly
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { Mountain, Globe, Clock, Ruler } from '@aliimam/icons';

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  body: string;
  date?: string;
}

const DEFAULT_CARDS: FeatureCard[] = [
  {
    icon: <Mountain className="size-5" />,
    title: 'Altitude profile',
    body: 'Ascent from 1,380 m (Kathmandu) to 5,630 m (Dolma La).',
    date: 'Day 1 to Day 13',
  },
  {
    icon: <Globe className="size-5" />,
    title: 'Sacred geography',
    body: 'Mount Kailash (6,638 m) encircled by 4 rivers of the subcontinent.',
    date: 'Tibet Autonomous Region',
  },
  {
    icon: <Clock className="size-5" />,
    title: 'Parikrama timing',
    body: '3-day circuit: Deraphuk, Dolma La, Zutulpuk at altitude.',
    date: 'Days 9-11',
  },
  {
    icon: <Ruler className="size-5" />,
    title: '52 km parikrama',
    body: 'Full outer kora with day-by-day distance breakdown and waypoints.',
    date: 'Days 9-11',
  },
];

interface AliimamFeatureProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  cards?: FeatureCard[];
  ctaLabel?: string;
  ctaHref?: string;
}

export function AliimamFeature({
  eyebrow = 'Journey Details',
  title = 'Every detail of the sacred circuit',
  body = 'Altitude, timing, connectivity, and spiritual significance mapped day by day.',
  cards = DEFAULT_CARDS,
  ctaLabel = 'Explore itinerary',
  ctaHref = '#itinerary',
}: AliimamFeatureProps) {
  return (
    <section className="pt-10">
      <div className="mx-6">
        {(eyebrow || title || body || ctaLabel) && (
          <div className="flex w-full flex-col items-center px-4 text-center">
            {eyebrow && (
              <span className="flex items-center gap-2 text-base font-medium text-muted">
                <Mountain className="size-5" />
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="mt-3 text-3xl font-medium text-pretty sm:text-4xl md:text-5xl text-ink">
                {title}
              </h2>
            )}
            {body && (
              <p className="mt-3 text-base text-pretty sm:text-lg text-muted">
                {body}
              </p>
            )}
            {ctaLabel && (
              <div className="mt-6 flex items-center gap-2 sm:gap-4">
                <a href={ctaHref}>
                  <button className="h-10 cursor-pointer px-6 bg-ink text-bg font-medium text-sm rounded hover:opacity-80 transition-opacity">
                    {ctaLabel}
                  </button>
                </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-12 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {cards.map((card, i) => (
              <div key={i}>
                <div className="bg-card flex flex-col rounded-md border border-border p-4 text-sm">
                  {card.icon}
                  <div className="mt-2 font-medium text-ink">{card.title}</div>
                  <p className="mt-1 text-muted text-xs">{card.body}</p>
                  {card.date && (
                    <span className="mt-2 text-xs text-muted opacity-70">
                      {card.date}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
