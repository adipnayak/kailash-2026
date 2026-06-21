/**
 * Astronomical helpers for the per-day cards.
 * Wraps suncalc: sunrise + sunset at a (lat, lng) for a given date, plus
 * moon phase. Returns local-time HH:MM strings using the location's
 * approximate timezone offset (good enough for our 4 timezones in play:
 * IST +5:30 for Mumbai, GST +4 for Dubai, MUT +4 for Port Louis,
 * EDT/EST for NY, NPT +5:45 for Kathmandu, CST +8 for Tibet).
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import * as SunCalc from 'suncalc';

export interface DayAstro {
  sunrise: string;
  sunset: string;
  moonPhase: number; // 0..1 (0=new, 0.5=full)
  moonPhaseLabel: string;
  moonIllumination: number; // 0..1 (fraction lit)
}

/**
 * Map a 0..1 SunCalc moon phase to a human label.
 * 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter.
 */
function phaseLabel(phase: number): string {
  if (phase < 0.0625 || phase >= 0.9375) return 'New Moon';
  if (phase < 0.1875) return 'Waxing Crescent';
  if (phase < 0.3125) return 'First Quarter';
  if (phase < 0.4375) return 'Waxing Gibbous';
  if (phase < 0.5625) return 'Full Moon';
  if (phase < 0.6875) return 'Waning Gibbous';
  if (phase < 0.8125) return 'Last Quarter';
  return 'Waning Crescent';
}

/**
 * Choose a UTC offset (hours) for a coordinate. Coarse but accurate
 * enough for the 5 regions on this trip; suncalc returns Date objects in
 * the runtime tz, then we shift to the location's local time.
 */
function offsetHoursFor(lat: number, lng: number): number {
  // Tibet (China) -- Beijing time year round
  if (lng > 73 && lng < 135 && lat > 18 && lat < 53) {
    if (lng > 80 && lng < 105 && lat > 27 && lat < 36) return 8; // Tibet, CST
    if (lng > 79 && lng < 89 && lat > 25 && lat < 30) return 5.75; // Nepal, NPT
    return 5.5; // default India
  }
  if (lng > 50 && lng < 60 && lat > 22 && lat < 26) return 4; // UAE
  if (lng > 55 && lng < 60 && lat < -15) return 4; // Mauritius
  if (lng > -90 && lng < -65 && lat > 35 && lat < 45) return -4; // EDT NY
  return 5.5; // India default
}

function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

function formatLocalHHMM(d: Date | null, offsetHours: number): string {
  if (!d || isNaN(d.getTime())) return '--:--';
  // SunCalc returns Date in UTC -- shift to target offset.
  const utcMs = d.getTime();
  const shifted = new Date(utcMs + offsetHours * 60 * 60 * 1000);
  return pad2(shifted.getUTCHours()) + ':' + pad2(shifted.getUTCMinutes());
}

/**
 * Compute sunrise / sunset / moon phase for a given ISO date + location.
 * dateIso example: '2026-07-08'. Time-of-day defaults to noon UTC so the
 * returned sunrise/sunset belong to that local calendar day.
 */
export function getDayAstro(dateIso: string, lat: number, lng: number): DayAstro {
  const noon = new Date(dateIso + 'T12:00:00Z');
  const offset = offsetHoursFor(lat, lng);
  const times = SunCalc.getTimes(noon, lat, lng);
  const moon = SunCalc.getMoonIllumination(noon);
  return {
    sunrise: formatLocalHHMM(times.sunrise, offset),
    sunset: formatLocalHHMM(times.sunset, offset),
    moonPhase: moon.phase,
    moonPhaseLabel: phaseLabel(moon.phase),
    moonIllumination: moon.fraction,
  };
}
