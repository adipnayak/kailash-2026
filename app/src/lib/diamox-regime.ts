/**
 * Canonical Mumbai-cohort Diamox (acetazolamide) regime, PRD v2.7.
 * Spans 28 Jun 2026 (T-9 test dose) through 21 Jul 2026 (post-descent buffer).
 * 17 dosing days, 32 doses, 16 tabs of 250 mg (each dose = half a 250 mg tab = 125 mg).
 *
 * Anti-AI: no em-dashes, no en-dashes, no smart quotes, no emojis.
 * User-facing copy spells out "twice daily" -- never "BID".
 */

export type DiamoxDoseType = 'test' | 'start' | 'maintenance' | 'buffer';

export interface DiamoxDose {
  dateISO: string;
  dayLabel: string;     // 'Sun 28 Jun'
  phaseLabel: string;   // 'T-9' | 'T-1' | 'D1' | 'D14'
  type: DiamoxDoseType;
  doses: number;        // 1 or 2
  mg: number;           // 125
  tabs: string;         // 'half' or '1'
  schedule: 'morning' | 'evening' | 'twice-daily';
  use: string;          // human-readable, no jargon
}

export const DIAMOX_REGIME: DiamoxDose[] = [
  {
    dateISO: '2026-06-28',
    dayLabel: 'Sun 28 Jun',
    phaseLabel: 'T-9',
    type: 'test',
    doses: 1,
    mg: 125,
    tabs: 'half',
    schedule: 'evening',
    use: 'Test dose (sulfa allergy + tolerance check)',
  },
  {
    dateISO: '2026-07-06',
    dayLabel: 'Mon 6 Jul',
    phaseLabel: 'T-1',
    type: 'start',
    doses: 1,
    mg: 125,
    tabs: 'half',
    schedule: 'evening',
    use: 'Prophylactic start, evening before first altitude exposure (D3 Lhasa)',
  },
  {
    dateISO: '2026-07-07',
    dayLabel: 'Tue 7 Jul',
    phaseLabel: 'D1',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance',
  },
  {
    dateISO: '2026-07-08',
    dayLabel: 'Wed 8 Jul',
    phaseLabel: 'D2',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance',
  },
  {
    dateISO: '2026-07-09',
    dayLabel: 'Thu 9 Jul',
    phaseLabel: 'D3',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance (first altitude jump to Lhasa)',
  },
  {
    dateISO: '2026-07-10',
    dayLabel: 'Fri 10 Jul',
    phaseLabel: 'D4',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance',
  },
  {
    dateISO: '2026-07-11',
    dayLabel: 'Sat 11 Jul',
    phaseLabel: 'D5',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance (Lhasa to Mansarovar)',
  },
  {
    dateISO: '2026-07-12',
    dayLabel: 'Sun 12 Jul',
    phaseLabel: 'D6',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance',
  },
  {
    dateISO: '2026-07-13',
    dayLabel: 'Mon 13 Jul',
    phaseLabel: 'D7',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance (parikrama starts)',
  },
  {
    dateISO: '2026-07-14',
    dayLabel: 'Tue 14 Jul',
    phaseLabel: 'D8',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance (Dolma La 5,630 m)',
  },
  {
    dateISO: '2026-07-15',
    dayLabel: 'Wed 15 Jul',
    phaseLabel: 'D9',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance',
  },
  {
    dateISO: '2026-07-16',
    dayLabel: 'Thu 16 Jul',
    phaseLabel: 'D10',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance (return to Lhasa)',
  },
  {
    dateISO: '2026-07-17',
    dayLabel: 'Fri 17 Jul',
    phaseLabel: 'D11',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance',
  },
  {
    dateISO: '2026-07-18',
    dayLabel: 'Sat 18 Jul',
    phaseLabel: 'D12',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance',
  },
  {
    dateISO: '2026-07-19',
    dayLabel: 'Sun 19 Jul',
    phaseLabel: 'D13',
    type: 'maintenance',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Maintenance (return to Mumbai)',
  },
  {
    dateISO: '2026-07-20',
    dayLabel: 'Mon 20 Jul',
    phaseLabel: 'D14',
    type: 'buffer',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Post-descent buffer (do not stop abruptly)',
  },
  {
    dateISO: '2026-07-21',
    dayLabel: 'Tue 21 Jul',
    phaseLabel: 'D15',
    type: 'buffer',
    doses: 2,
    mg: 125,
    tabs: '1',
    schedule: 'twice-daily',
    use: 'Post-descent buffer',
  },
];

export const DIAMOX_REGIME_BY_DATE: Record<string, DiamoxDose> = Object.fromEntries(
  DIAMOX_REGIME.map((d) => [d.dateISO, d])
);
