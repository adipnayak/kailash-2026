/**
 * Origin auto-detect from timezone (PRD v3.10 section 0.14.3).
 * localStorage override wins over auto-detect.
 */

export type OriginId = 'mumbai' | 'uae' | 'mauritius' | 'us' | 'all';

const ORIGIN_KEY = 'kailash_origin';

export function detectOriginFromTz(tz: string): OriginId {
  if (!tz) return 'all';
  if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'mumbai';
  if (tz === 'Asia/Dubai' || tz === 'Asia/Abu_Dhabi') return 'uae';
  if (tz === 'Indian/Mauritius') return 'mauritius';
  if (tz.indexOf('America/') === 0) return 'us';
  return 'all';
}

export function getStoredOrigin(): OriginId | 'auto' {
  if (typeof window === 'undefined') return 'auto';
  return (localStorage.getItem(ORIGIN_KEY) as OriginId | 'auto') || 'auto';
}

export function setStoredOrigin(o: OriginId | 'auto'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ORIGIN_KEY, o);
}

export function resolveOrigin(): OriginId {
  const saved = getStoredOrigin();
  if (saved && saved !== 'auto') return saved;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return detectOriginFromTz(tz);
  } catch {
    return 'all';
  }
}
