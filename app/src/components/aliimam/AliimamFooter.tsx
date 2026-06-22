/**
 * aliimam footer-01 block -- adapted for Vite/React + Maurten tokens.
 * Source: aliimam-in/aliimam registry/aliimam/blocks/footer/footer-01/
 * License: MIT (aliimam-in/aliimam)
 *
 * Adaptations:
 *   - Removed next/link, next-themes, @aliimam/logos (brand SVGs)
 *   - Removed DropdownMenu dependency (shadcn/ui component not installed)
 *   - Replaced shadcn tokens with Maurten CSS vars
 *   - Simplified for itinerary site context (no multi-column nav needed)
 *   - Uses @aliimam/icons for icon set
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { Mountain, Globe, Clock } from '@aliimam/icons';

interface FooterLink {
  label: string;
  href: string;
}

const NAV_LINKS: FooterLink[] = [
  { label: 'Overview', href: '#overview' },
  { label: 'Itinerary', href: '#itinerary' },
  { label: 'Prepare', href: '#prepare' },
  { label: 'Reference', href: '#reference' },
];

interface AliimamFooterProps {
  year?: number;
  attribution?: string;
}

export function AliimamFooter({
  year = new Date().getFullYear(),
  attribution = 'Kailash Manasarovar Yatra 2026',
}: AliimamFooterProps) {
  return (
    <footer className="py-16 border-t border-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1 space-y-2">
            <span className="flex items-center gap-2 font-medium text-sm text-foreground">
              <Mountain className="size-4" />
              Kailash 2026
            </span>
            <p className="text-muted-foreground text-xs max-w-xs">
              A sacred pilgrimage to Mount Kailash and Lake Manasarovar across the Tibetan Plateau.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <span className="block font-medium text-foreground">Navigation</span>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground block duration-150 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <span className="block font-medium text-foreground">Journey</span>
            <span className="flex items-center gap-2 text-muted-foreground text-xs">
              <Globe className="size-3.5" />
              Tibet Autonomous Region
            </span>
            <span className="flex items-center gap-2 text-muted-foreground text-xs">
              <Clock className="size-3.5" />
              Sep-Oct 2026
            </span>
            <span className="flex items-center gap-2 text-muted-foreground text-xs">
              <Mountain className="size-3.5" />
              5,630 m peak
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border">
          <span className="text-xs text-muted-foreground">
            &copy; {year} {attribution}
          </span>
          <span className="text-xs text-muted-foreground">
            Built with aliimam blocks
          </span>
        </div>
      </div>
    </footer>
  );
}
