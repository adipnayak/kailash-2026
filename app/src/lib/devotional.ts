/**
 * Devotional phrase budget, enforced at SOURCE.
 *
 * Locked counts (PRD v3.10):
 *   Jai Bhole Nath:   1   (used exactly once on the page)
 *   Yatra Sampoorna:  1   (used exactly once, after-phase journey summary)
 *   Har Har Mahadev:  0   (not used at all)
 *   Om Namah Shivaya: 1   (footer, in Devanagari, no transliteration)
 *
 * Rules:
 *   - Import the constant exactly once per locked count.
 *   - If you find yourself wanting to use a phrase twice, the design is wrong.
 *   - No runtime scrub function. The enforcement is at the import site.
 *   - Anti-AI: zero em-dashes, smart quotes, or emojis adjacent to these phrases.
 */

export const JAI_BHOLE_NATH = 'Jai Bhole Nath';
export const YATRA_SAMPOORNA = 'Yatra Sampoorna (yatra complete)';
export const OM_NAMAH_SHIVAYA = 'ॐ नमः शिवाय';

// Intentionally NOT exporting Har Har Mahadev. Budget is 0.
// If a future PRD raises the budget, add the constant here and increment in one place.
