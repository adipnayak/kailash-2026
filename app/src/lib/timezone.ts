/**
 * Timezone helpers.
 * Two modes:
 *   - 'local': use the user's chosen IANA tz (or autodetected).
 *   - 'trip':  show times in the trip-local tz for each day.
 *
 * Trip tz groups:
 *   Day 1-2  : Asia/Kathmandu (Nepal)
 *   Day 3-10 : Asia/Shanghai (Tibet)
 *   Day 11-13: Asia/Kathmandu (Nepal)
 */

import type { Phase } from './journey-state';

export type TzMode = 'local' | 'trip';

const TZ_PREF_KEY = 'kailash_tz_pref';
const TZ_MODE_KEY = 'kailash_tz_mode';

export function getTripTz(todayIdx: number, phase: Phase): string {
  if (phase === 'before') return 'Asia/Kolkata';
  if (phase === 'after') return 'Asia/Kathmandu';
  if (!todayIdx) return 'Asia/Kolkata';
  if (todayIdx <= 2 || todayIdx >= 11) return 'Asia/Kathmandu';
  return 'Asia/Shanghai';
}

export function getStoredTzPref(): string {
  if (typeof window === 'undefined') return 'Asia/Kolkata';
  return localStorage.getItem(TZ_PREF_KEY) || 'Asia/Kolkata';
}

export function setStoredTzPref(tz: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TZ_PREF_KEY, tz);
}

export function getStoredTzMode(): TzMode {
  if (typeof window === 'undefined') return 'local';
  return (localStorage.getItem(TZ_MODE_KEY) as TzMode) || 'local';
}

export function setStoredTzMode(mode: TzMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TZ_MODE_KEY, mode);
}

export function getActiveTz(todayIdx: number, phase: Phase): string {
  const mode = getStoredTzMode();
  if (mode === 'trip') return getTripTz(todayIdx, phase);
  return getStoredTzPref();
}

export function detectUserTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}
