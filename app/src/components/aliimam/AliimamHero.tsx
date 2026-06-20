/**
 * aliimam hero-01 block -- adapted for Vite/React + Maurten tokens.
 * Source: aliimam-in/aliimam registry/aliimam/blocks/hero/hero-01/hero.tsx
 * License: MIT (aliimam-in/aliimam)
 *
 * Adaptations:
 *   - Removed "use client" directive (not needed in Vite)
 *   - Replaced next/link with <a> tags
 *   - Replaced @/registry/aliimam/ui/button with inline Tailwind button
 *   - Replaced shadcn color tokens (--primary, --background) with Maurten tokens
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

interface AliimamHeroProps {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function AliimamHero({
  title = 'Kailash Manasarovar 2026',
  subtitle = 'A sacred journey across the roof of the world. 13 days. 5,630 m.',
  primaryLabel = 'View Itinerary',
  primaryHref = '#itinerary',
  secondaryLabel = 'Prepare',
  secondaryHref = '#prepare',
}: AliimamHeroProps) {
  return (
    <div className="relative flex h-screen items-center justify-center">
      <div className="absolute h-full w-full overflow-hidden">
        <div className="relative min-h-screen w-full">
          <div
            className="absolute inset-0 z-0 opacity-15"
            style={{
              backgroundImage: `
              linear-gradient(to right, var(--ink) 1px, transparent 1px),
              linear-gradient(to bottom, var(--ink) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 0',
              maskImage: `
              repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
            `,
              WebkitMaskImage: `
              repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
             `,
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in',
            }}
          />
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                'radial-gradient(125% 125% at 50% 10%, transparent 40%, var(--ink) 100%)',
              opacity: 0.04,
            }}
          />
        </div>
      </div>
      <div className="container flex flex-col text-center z-10 px-6">
        <h2 className="z-10 pt-10 text-5xl font-extrabold tracking-tighter md:text-7xl lg:text-9xl text-ink">
          {title}
        </h2>
        <div className="z-10 flex flex-col items-center justify-center space-y-6 px-6 pt-10 text-center">
          <p className="w-full max-w-lg text-sm font-light md:text-xl text-muted">
            {subtitle}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={primaryHref}>
              <button className="h-12 cursor-pointer px-8 md:h-14 md:px-10 bg-ink text-bg font-medium text-sm rounded hover:opacity-80 transition-opacity">
                {primaryLabel}
              </button>
            </a>
            <a href={secondaryHref}>
              <button className="h-12 cursor-pointer px-8 md:h-14 md:px-10 border border-border text-ink font-medium text-sm rounded hover:bg-card transition-colors">
                {secondaryLabel}
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
