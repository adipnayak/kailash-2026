/**
 * Footer.
 * Brand mark + one-line tagline + the contextual story of Mount Kailash,
 * Lake Mansarovar and the Parikrama. Full-bleed width with side padding.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import { Mountain } from '@aliimam/icons';

export function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="px-4 md:px-6 space-y-6">
        <span className="flex items-center gap-2 font-medium text-sm text-foreground">
          <Mountain className="size-4" />
          Kailash 2026
        </span>

        <p className="text-muted-foreground text-sm">
          A sacred pilgrimage to Mount Kailash and Lake Manasarovar across the Tibetan Plateau.
        </p>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Mount Kailash, at the western edge of the Tibetan plateau, is one of the few mountains in the world considered sacred across four religions. In Hinduism it is the abode of Lord Shiva. In Buddhism it is the dwelling of Demchok, embodiment of supreme bliss. In Jainism it is where Rishabhadeva attained liberation. In Bon it is the seat of the spiritual hierarchy of the cosmos.
          </p>
          <p>
            Lake Mansarovar, at its base, is believed to be the lake of the mind itself. The Parikrama, the 52 km circumambulation around Kailash, is undertaken once in a lifetime by many pilgrims and is said to wash away the sins of a lifetime.
          </p>
          <p>
            This yatra follows that pilgrimage. The 13 days that follow are the practical shape of an experience much older than any of us.
          </p>
        </div>
      </div>
    </footer>
  );
}
