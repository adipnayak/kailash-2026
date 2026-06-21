/**
 * Footer.
 * Stripped per Adip to just the brand mark + tagline. Earlier AliimamFooter
 * (nav / journey columns / copyright / Om Namah Shivaya bar) removed.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import { Mountain } from '@aliimam/icons';

export function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 space-y-3">
        <span className="flex items-center gap-2 font-medium text-sm text-foreground">
          <Mountain className="size-4" />
          Kailash 2026
        </span>
        <p className="text-muted-foreground text-xs max-w-xs">
          A sacred pilgrimage to Mount Kailash and Lake Manasarovar across the Tibetan Plateau.
        </p>
      </div>
    </footer>
  );
}
