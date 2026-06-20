/**
 * Journey State Engine.
 * Single function that returns all phase-derived outputs.
 * Ported from index.html (v3.12) computeJourneyState().
 */

import {
  DAYS,
  DEPART,
  RETURN_DATE,
  MILESTONES,
  WHAT_MATTERS,
  BEFORE_WHAT_MATTERS_BY_TWINDOW,
  type TripDay,
} from './trip-data';

export type Phase = 'before' | 'during' | 'after';

export interface JourneyState {
  phase: Phase;
  daysToDeparture: number;
  daysToReturn: number;
  tripDayIndex: number; // 1-13 if during, else 0
  currentLocation: string;
  currentAltitude_m: number;
  sleepAltitude_tonight_m: number;
  peakAltitude_today_m: number;
  tomorrowLocation: string;
  tomorrowHighlight: string;
  connectivity_today: 'good' | 'intermittent' | 'offline';
  nextMilestone: { label: string; daysAway: number };
  progressPct: number;
  bannerKey: string;
  whatMattersToday: string[];
  landingAnchor: string;
  todayData: TripDay | null;
  tomorrowData: TripDay | null;
}

function isoDay(d: Date): string {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

export function computePhase(now: Date): Phase {
  const dStr = isoDay(now);
  if (dStr < DEPART) return 'before';
  if (dStr > RETURN_DATE) return 'after';
  return 'during';
}

export function dayIndexDuring(now: Date): number {
  const depart = new Date(DEPART + 'T00:00:00');
  const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.floor((nowMid.getTime() - depart.getTime()) / (1000 * 60 * 60 * 24));
  if (diff >= 0 && diff < 13) return diff + 1;
  return 0;
}

export function getReferenceDate(): Date {
  if (typeof window !== 'undefined') {
    const qs = new URLSearchParams(window.location.search);
    const override = qs.get('date');
    if (override) return new Date(override + 'T00:00:00');
  }
  return new Date();
}

export function computeJourneyState(now: Date = getReferenceDate()): JourneyState {
  const phase = computePhase(now);
  const tripDayIndex = phase === 'during' ? dayIndexDuring(now) : 0;

  const departDt = new Date(DEPART + 'T00:00:00');
  const returnDt = new Date(RETURN_DATE + 'T00:00:00');
  const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysToDeparture = Math.max(
    0,
    Math.ceil((departDt.getTime() - nowMid.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const daysToReturn = Math.max(
    0,
    Math.ceil((returnDt.getTime() - nowMid.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const todayData = tripDayIndex >= 1 && tripDayIndex <= 13 ? DAYS[tripDayIndex - 1] : null;
  const tomorrowData = tripDayIndex >= 1 && tripDayIndex < 13 ? DAYS[tripDayIndex] : null;

  const currentLocation = todayData ? todayData.location : '';
  const currentAltitude_m = todayData ? todayData.altitude_peak : 0;
  const sleepAltitude_tonight_m = todayData ? todayData.altitude_sleep : 0;
  const peakAltitude_today_m = todayData ? todayData.altitude_peak : 0;
  const tomorrowLocation = tomorrowData ? tomorrowData.location : '';
  const tomorrowHighlight = tomorrowData ? tomorrowData.headline : '';
  const connectivity_today = todayData ? todayData.conn_status : 'good';

  let nextMilestone = { label: 'Departure', daysAway: daysToDeparture };
  if (phase === 'during' && tripDayIndex) {
    let found: { label: string; daysAway: number } | null = null;
    for (const m of MILESTONES) {
      const daysAway = m.dayOffset - (tripDayIndex - 1);
      if (daysAway > 0 && (!found || daysAway < found.daysAway)) {
        found = { label: m.label, daysAway };
      }
    }
    nextMilestone = found || { label: 'Return', daysAway: daysToReturn };
  }

  let progressPct = 0;
  if (phase === 'during' && tripDayIndex) {
    progressPct = Math.round(((tripDayIndex - 1) / 12) * 100);
  } else if (phase === 'after') {
    progressPct = 100;
  }
  // before-phase prep progress is computed in PreparationDashboard from localStorage.

  let bannerKey = 'none';
  if (phase === 'before') {
    if (daysToDeparture >= 7 && daysToDeparture <= 21) bannerKey = 'prep-window';
    else if (daysToDeparture > 0 && daysToDeparture < 7) bannerKey = 'final-prep';
  } else if (phase === 'during' && tripDayIndex) {
    if (tripDayIndex === 7) bannerKey = 'prepare-for-parikrama';
    else if (tripDayIndex === 8) bannerKey = 'critical-day';
    else if (tripDayIndex === 12) bannerKey = 'recovery-day';
  }

  let whatMattersToday: string[] = [
    'Rest and stay hydrated',
    'Follow the day plan',
    'Prepare for tomorrow',
  ];
  if (phase === 'during' && tripDayIndex) {
    whatMattersToday = WHAT_MATTERS[tripDayIndex] || whatMattersToday;
  } else if (phase === 'before') {
    const dtd = daysToDeparture;
    if (dtd >= 21) whatMattersToday = BEFORE_WHAT_MATTERS_BY_TWINDOW[21];
    else if (dtd >= 14) whatMattersToday = BEFORE_WHAT_MATTERS_BY_TWINDOW[14];
    else if (dtd >= 7) whatMattersToday = BEFORE_WHAT_MATTERS_BY_TWINDOW[7];
    else whatMattersToday = BEFORE_WHAT_MATTERS_BY_TWINDOW[3];
  } else if (phase === 'after') {
    whatMattersToday = ['Highest altitude reached', 'Parikrama completed', 'Returned safely'];
  }

  let landingAnchor = 'preparation-status';
  if (phase === 'during') landingAnchor = 'today';
  else if (phase === 'after') landingAnchor = 'journey-summary';

  return {
    phase,
    daysToDeparture,
    daysToReturn,
    tripDayIndex,
    currentLocation,
    currentAltitude_m,
    sleepAltitude_tonight_m,
    peakAltitude_today_m,
    tomorrowLocation,
    tomorrowHighlight,
    connectivity_today,
    nextMilestone,
    progressPct,
    bannerKey,
    whatMattersToday,
    landingAnchor,
    todayData,
    tomorrowData,
  };
}
