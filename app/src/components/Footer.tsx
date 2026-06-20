/**
 * Footer.
 * Uses AliimamFooter block shell.
 * Devotional phrase: OM_NAMAH_SHIVAYA x1 (from /app/src/lib/devotional).
 * NO personal names. NO phone numbers.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */
import { AliimamFooter } from './aliimam';
import { OM_NAMAH_SHIVAYA } from '../lib/devotional';

export function Footer() {
  return (
    <AliimamFooter
      year={2026}
      attribution="Kailash Mansarovar Yatra 2026"
      devotional={OM_NAMAH_SHIVAYA}
    />
  );
}
