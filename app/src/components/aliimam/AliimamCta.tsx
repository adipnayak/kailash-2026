/**
 * aliimam cta-01 block -- adapted for Vite/React + Maurten tokens.
 * Source: aliimam-in/aliimam registry/aliimam/blocks/cta/cta-01/cta.tsx
 * License: MIT (aliimam-in/aliimam)
 *
 * Adaptations:
 *   - Removed next/link, @aliimam/logos (WhatsApp), @/registry button
 *   - Replaced shadcn tokens with Maurten CSS vars
 *   - Removed WhatsApp-specific SVG (not relevant for itinerary site)
 *   - Made title, body, and CTA props configurable
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

interface AliimamCtaProps {
  title?: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function AliimamCta({
  title = 'Prepare for the yatra',
  body = 'Complete your checklist before departure. Permits, fitness, gear, and connectivity all need advance planning.',
  primaryLabel = 'Start checklist',
  primaryHref = '#prepare',
  secondaryLabel = 'View map',
  secondaryHref = '#overview',
}: AliimamCtaProps) {
  return (
    <section className="relative container flex w-full flex-col items-center justify-center overflow-hidden py-32 px-6">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, var(--border) 0%, var(--bg) 75%)',
          opacity: 0.7,
        }}
      >
        <div
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)',
            backgroundImage:
              'repeating-radial-gradient(circle at 50% 100%, transparent 0px, transparent 20px, var(--border) 20px, var(--border) 21px)',
            height: '100%',
            left: '0',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)',
            opacity: '0.5',
            pointerEvents: 'none',
            position: 'absolute',
            top: '0',
            width: '100%',
          }}
        />
      </div>
      <div className="relative overflow-hidden">
        <div className="relative z-10 space-y-3 text-center">
          <div className="space-y-3 pb-10">
            <h2 className="text-xl font-medium uppercase md:text-4xl text-ink">
              {title}
            </h2>
            <p className="text-muted max-w-2xl text-sm md:text-xl">
              {body}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <a href={primaryHref}>
              <button className="h-12 w-44 cursor-pointer bg-ink text-bg font-medium text-sm rounded hover:opacity-80 transition-opacity">
                {primaryLabel}
              </button>
            </a>
            <a href={secondaryHref}>
              <button className="h-12 w-44 cursor-pointer border border-border text-ink font-medium text-sm rounded hover:bg-card transition-colors">
                {secondaryLabel}
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
