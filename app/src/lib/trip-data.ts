/**
 * Trip data for the 13-day Kailash Mansarovar yatra.
 * Ported from index.html (v3.12) DAYS array.
 *
 * Foundation pass: only the summary fields needed by the skeleton
 * (location, altitudes, connectivity, day_type, headline).
 * Per-day timeline, food, wear, weather, spiritual etc. are migrated
 * by downstream Ralphs and live in src/lib/trip-data-full.ts.
 *
 * Anti-AI rule: zero em-dashes, en-dashes, smart quotes, or emojis
 * in any rendered string.
 */

export type DayType = 'normal' | 'critical' | 'holy' | 'rest';
export type ConnStatus = 'good' | 'intermittent' | 'offline';
export type Risk = 'easy' | 'moderate' | 'high';

export interface TripDay {
  day: number;
  date: string; // ISO yyyy-mm-dd
  weekday: string;
  location: string;
  altitude_peak: number; // metres, the high point reached today
  altitude_sleep: number; // metres, where tonight is spent
  risk: Risk;
  conn_status: ConnStatus;
  conn_label: string;
  next_signal: string | null;
  day_type: DayType;
  headline: string;
  /**
   * Sacred label shown with a first-occurrence gloss in parentheses.
   * Example: 'Mansarovar' first occurrence renders as 'Mansarovar (the lake)'.
   */
  sacred_label?: string;
}

export const DEPART = '2026-07-07';
export const RETURN_DATE = '2026-07-19';

export const DAYS: TripDay[] = [
  {
    day: 1,
    date: '2026-07-07',
    weekday: 'Tue',
    location: 'Kathmandu, Nepal',
    altitude_peak: 1380,
    altitude_sleep: 1380,
    risk: 'easy',
    conn_status: 'good',
    conn_label: 'WhatsApp and calls usable',
    next_signal: null,
    day_type: 'normal',
    headline: 'Arrive in Kathmandu. The yatra begins here.',
  },
  {
    day: 2,
    date: '2026-07-08',
    weekday: 'Wed',
    location: 'Kathmandu, Nepal',
    altitude_peak: 1380,
    altitude_sleep: 1380,
    risk: 'easy',
    conn_status: 'good',
    conn_label: 'WhatsApp and calls usable',
    next_signal: null,
    day_type: 'normal',
    headline: 'Kathmandu. Embassy NOC and Pashupatinath.',
  },
  {
    day: 3,
    date: '2026-07-09',
    weekday: 'Thu',
    location: 'Lhasa, Tibet',
    altitude_peak: 3656,
    altitude_sleep: 3656,
    risk: 'moderate',
    conn_status: 'intermittent',
    conn_label: 'GFW. VPN required. WhatsApp via Astrill.',
    next_signal: 'after VPN reconnects',
    day_type: 'normal',
    headline: 'Crossing into Tibet. First altitude jump to 3,656 m.',
  },
  {
    day: 4,
    date: '2026-07-10',
    weekday: 'Fri',
    location: 'Lhasa, Tibet',
    altitude_peak: 3656,
    altitude_sleep: 3656,
    risk: 'easy',
    conn_status: 'intermittent',
    conn_label: 'GFW. Best to message rather than call.',
    next_signal: null,
    day_type: 'normal',
    headline: 'Lhasa. Acclimatization day at Jokhang and Potala.',
  },
  {
    day: 5,
    date: '2026-07-11',
    weekday: 'Sat',
    location: 'Mansarovar approach, Tibet',
    altitude_peak: 4670,
    altitude_sleep: 4670,
    risk: 'moderate',
    conn_status: 'intermittent',
    conn_label: 'Limited signal. Operator China phone for emergencies.',
    next_signal: 'evening at hotel',
    day_type: 'normal',
    headline: 'Toward the lake. Long drive to Mansarovar.',
    sacred_label: 'Mansarovar',
  },
  {
    day: 6,
    date: '2026-07-12',
    weekday: 'Sun',
    location: 'Mansarovar, Tibet',
    altitude_peak: 4670,
    altitude_sleep: 4670,
    risk: 'easy',
    conn_status: 'intermittent',
    conn_label: 'Limited signal at hotel. Operator China phone for emergencies.',
    next_signal: 'evening',
    day_type: 'holy',
    headline: 'Mansarovar Snan and Puja.',
    sacred_label: 'Mansarovar',
  },
  {
    day: 7,
    date: '2026-07-13',
    weekday: 'Mon',
    location: 'Yamadwar to Dirapuk, Tibet',
    altitude_peak: 4900,
    altitude_sleep: 4900,
    risk: 'moderate',
    conn_status: 'offline',
    conn_label: 'No civilian connectivity. Operator Sherpa team handles comms.',
    next_signal: 'Day 10 evening at Lhasa',
    day_type: 'normal',
    headline: 'Yamadwar to Dirapuk. The Parikrama begins.',
    sacred_label: 'Parikrama',
  },
  {
    day: 8,
    date: '2026-07-14',
    weekday: 'Tue',
    location: 'Dolma La Pass, Tibet',
    altitude_peak: 5630,
    altitude_sleep: 4670,
    risk: 'high',
    conn_status: 'offline',
    conn_label: 'No civilian connectivity. Sherpa sat phone for emergency only.',
    next_signal: 'Day 10 evening at Lhasa',
    day_type: 'critical',
    headline: 'Dolma La Pass. The high point of the yatra.',
    sacred_label: 'Dolma La',
  },
  {
    day: 9,
    date: '2026-07-15',
    weekday: 'Wed',
    location: 'Zuthulphuk to Darchen, Tibet',
    altitude_peak: 4900,
    altitude_sleep: 4760,
    risk: 'easy',
    conn_status: 'intermittent',
    conn_label: 'Limited signal returns at Darchen. Operator China phone available.',
    next_signal: 'Darchen evening (limited)',
    day_type: 'normal',
    headline: 'Zuthulphuk to Darchen. Completing the Parikrama.',
  },
  {
    day: 10,
    date: '2026-07-16',
    weekday: 'Thu',
    location: 'Darchen to Lhasa, Tibet',
    altitude_peak: 4575,
    altitude_sleep: 3656,
    risk: 'easy',
    conn_status: 'intermittent',
    conn_label: 'Back online at St Regis. GFW and VPN required.',
    next_signal: 'evening at hotel',
    day_type: 'normal',
    headline: 'Darchen to Lhasa. First shower in four days.',
  },
  {
    day: 11,
    date: '2026-07-17',
    weekday: 'Fri',
    location: 'Lhasa to Kathmandu, Nepal',
    altitude_peak: 3656,
    altitude_sleep: 1380,
    risk: 'easy',
    conn_status: 'good',
    conn_label: 'WhatsApp and calls restored at KTM',
    next_signal: null,
    day_type: 'normal',
    headline: 'Back to Kathmandu. The yatra closes.',
  },
  {
    day: 12,
    date: '2026-07-18',
    weekday: 'Sat',
    location: 'Kathmandu, Nepal',
    altitude_peak: 1380,
    altitude_sleep: 1380,
    risk: 'easy',
    conn_status: 'good',
    conn_label: 'Normal signal',
    next_signal: null,
    day_type: 'rest',
    headline: 'Day of recovery and gratitude.',
  },
  {
    day: 13,
    date: '2026-07-19',
    weekday: 'Sun',
    location: 'Home',
    altitude_peak: 1380,
    altitude_sleep: 0,
    risk: 'easy',
    conn_status: 'good',
    conn_label: 'Normal signal',
    next_signal: null,
    day_type: 'normal',
    headline: 'Home.',
  },
];

export const MILESTONES: { label: string; dayOffset: number }[] = [
  { label: 'Mansarovar', dayOffset: 4 },
  { label: 'Parikrama begins', dayOffset: 6 },
  { label: 'Dolma La', dayOffset: 7 },
];

export const WHAT_MATTERS: Record<number, string[]> = {
  1: ['Rest and recover from the flight', 'Attend the welcome group dinner', "Review tomorrow's Day 2 schedule"],
  2: ['Attend the Indian Embassy NOC visit', 'Visit Pashupatinath Mandir', 'Prepare layers for the Lhasa altitude jump'],
  3: ['Acclimatize. Rest after arrival. No exertion.', 'Hydrate aggressively. 4 L minimum.', 'No alcohol today'],
  4: ['Pace yourself at Potala. Altitude on stairs is real.', 'Reapply sun protection every 2 hours', 'Rest by 20:00'],
  5: ['Conserve energy on the long transit', 'Hydrate on the drive. 4 L.', 'Prepare gear for Mansarovar morning'],
  6: ['Attend the Mansarovar Snan at dawn', 'Hydrate and rest after the ritual', 'Set gear out tonight for Day 7 start'],
  7: ['Pack the Parikrama bag tonight', 'Pace steady. Conserve for tomorrow.', 'Sleep by 21:00. Day 8 starts at 04:00.'],
  8: ['Pace yourself. Sip water every 15 min.', 'Hydrate aggressively. 5 L.', 'Layer up before the pass. Do not wait.'],
  9: ['Recovery focus. Easy descent pace.', 'Eat warm food. Appetite matters.', 'First wash in 3 days. Take it.'],
  10: ['Stop Diamox this evening per protocol', 'Long hot shower at St Regis', 'Message family. Connectivity restored.'],
  11: ['Transit day. Rest and decompress.', 'Message family on landing at KTM', 'No strenuous activity'],
  12: ['Rest. Reflect. No formal program.', 'Hydrate and eat well', 'Write in the sankalpa notebook if you have one'],
  13: ['Early checkout. 04:30 alarm.', 'All documents and boarding pass in hand', 'Message family at home arrival'],
};

export const BEFORE_WHAT_MATTERS_BY_TWINDOW: Record<number, string[]> = {
  21: ['Passport courier dispatched to visa agent', 'Confirm operator package details', 'Begin breaking in trek boots'],
  14: ['Book doctor consult for Diamox prescription', 'Purchase overseas travel insurance with air ambulance rider', 'Book Chinese eSIM and test VPN'],
  7: ['Collect Diamox prescription from doctor', 'Download offline maps and essential apps', 'Test VPN end to end'],
  3: ['Start Diamox 2 to 3 days before departure', 'Trim toenails. Not on departure day.', 'Pre-write offline message for family'],
};
