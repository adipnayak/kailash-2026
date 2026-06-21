/**
 * AltitudeChart.
 * recharts-based area chart via aliimam ChartArea.
 * Walking (altitude_peak) and Sleeping (altitude_sleep) series.
 * Linear (non-curved) line so peaks stay sharp. Edge-to-edge: chart bleeds
 * past the section's horizontal padding while header stays padded.
 * Y-axis metres only. Dolma La 5,630m red dotted line at D8.
 * ACCLIM / REST / BUFFER markers at D4 / D6 / D12 as light grey dotted lines.
 * Segmented control toggles Walking / Sleeping. localStorage key: kailash_altitude_mode.
 *
 * Anti-AI rules: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useState, useCallback } from 'react';
import { Ruler, Bed } from '@aliimam/icons';
import { ChartArea } from './aliimam/ChartArea';
import { DAYS } from '../lib/trip-data';

// ---- types ---------------------------------------------------------------

type AltMode = 'walking' | 'sleeping';

// ---- constants -----------------------------------------------------------

const STORAGE_KEY = 'kailash_altitude_mode';
const Y_TICKS = [0, 1000, 2000, 3000, 4000, 5000, 6000];

// Metres-only label helper: "5,000m"
function altLabel(m: number): string {
  return m.toLocaleString('en-US') + 'm';
}

// Short location label (trim to city name before comma)
function shortLocation(loc: string): string {
  return loc.split(',')[0].trim();
}

// ---- chart data ----------------------------------------------------------

// D0 (departure) + D14 (return) sit at the average sea-level altitude of
// the four origin cities: Mumbai ~14 m, Dubai ~5 m, Port Louis ~5 m,
// New York ~10 m -> avg 8.5, round to 9 m.
const ORIGIN_AVG_ALT = 9;

const chartData = [
  { day: 'D0', location: 'Origins (avg)', walking: ORIGIN_AVG_ALT, sleeping: ORIGIN_AVG_ALT },
  ...DAYS.map((d) => ({
    day: 'D' + d.day,
    location: d.location,
    walking: d.altitude_peak,
    sleeping: d.altitude_sleep,
  })),
  { day: 'D14', location: 'Origins (return)', walking: ORIGIN_AVG_ALT, sleeping: ORIGIN_AVG_ALT },
];

// ---- acclim markers ------------------------------------------------------
// ACCLIM (D4), REST (D6), BUFFER (D12) rendered as light grey dotted
// vertical reference lines.

const ACCL_LINES = [
  { x: 'D4',  label: 'ACCLIM' },
  { x: 'D6',  label: 'REST'   },
  { x: 'D12', label: 'BUFFER' },
];

// ---- SegmentedControl ---------------------------------------------------

function SegmentedControl({
  mode,
  onChange,
}: {
  mode: AltMode;
  onChange: (m: AltMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Altitude series"
      className="inline-flex rounded-none border border-border overflow-hidden font-mono text-xs"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {(['walking', 'sleeping'] as AltMode[]).map((m, i) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={[
            'px-4 py-1.5 transition-colors duration-150 cursor-pointer',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
            i > 0 ? 'border-l border-border' : '',
            mode === m
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground hover:bg-border hover:text-foreground',
          ].join(' ')}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-pressed={mode === m}
        >
          <span className="flex items-center gap-1">
            {m === 'walking' ? <Ruler size={11} /> : <Bed size={11} />}
            {m === 'walking' ? 'Walking' : 'Sleeping'}
          </span>
        </button>
      ))}
    </div>
  );
}

// ---- Tooltip content ----------------------------------------------------

function makeTooltipContent(mode: AltMode) {
  return function TooltipContent({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string }>;
    label?: string;
  }) {
    if (!active || !payload || !payload.length || !label) return null;
    const dayNum = parseInt(label.replace('D', ''), 10);
    if (isNaN(dayNum) || dayNum < 0 || dayNum > 14) return null;

    const isOrigin = dayNum === 0 || dayNum === 14;
    const alt = isOrigin
      ? ORIGIN_AVG_ALT
      : mode === 'walking'
      ? DAYS[dayNum - 1].altitude_peak
      : DAYS[dayNum - 1].altitude_sleep;
    const heading = isOrigin
      ? dayNum === 0
        ? 'D0 - Origins (avg)'
        : 'D14 - Origins (return)'
      : 'D' + dayNum + ' - ' + shortLocation(DAYS[dayNum - 1].location);

    const prevAlt =
      dayNum === 0
        ? alt
        : dayNum === 1
        ? ORIGIN_AVG_ALT
        : dayNum === 14
        ? mode === 'walking'
          ? DAYS[12].altitude_peak
          : DAYS[12].altitude_sleep
        : mode === 'walking'
        ? DAYS[dayNum - 2].altitude_peak
        : DAYS[dayNum - 2].altitude_sleep;
    const gained = dayNum > 0 ? alt - prevAlt : 0;
    const gainedStr =
      gained > 0
        ? '+' + gained.toLocaleString('en-US') + ' m'
        : gained < 0
        ? gained.toLocaleString('en-US') + ' m'
        : '0 m';

    return (
      <div className="bg-card border border-border px-3 py-2 text-xs shadow-sm min-w-[160px]">
        <div className="font-sans font-medium text-foreground text-sm mb-1">{heading}</div>
        <div className="font-mono text-muted-foreground">{altLabel(alt)}</div>
        {dayNum > 0 && (
          <div className="font-mono text-muted-foreground mt-0.5">Gain: {gainedStr}</div>
        )}
      </div>
    );
  };
}

// ---- main component ------------------------------------------------------

export function AltitudeChart() {
  const [mode, setMode] = useState<AltMode>(() => {
    if (typeof window === 'undefined') return 'walking';
    const stored = localStorage.getItem(STORAGE_KEY) as AltMode | null;
    return stored === 'sleeping' ? 'sleeping' : 'walking';
  });

  const handleModeChange = useCallback((m: AltMode) => {
    setMode(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);

  const series = [
    {
      key: mode === 'walking' ? 'walking' : 'sleeping',
      color: 'var(--foreground)',
      label: mode === 'walking' ? 'Walking altitude' : 'Sleeping altitude',
    },
  ];

  const TooltipContent = makeTooltipContent(mode);

  return (
    <section
      data-section="altitude-chart"
      className="border-b border-border bg-background px-4 py-12 md:px-6"
    >
      {/* Match the Hero bento layout exactly: padding on section, max-w-6xl
          wrapper has no internal padding so chart edges align with bento
          edges at the same viewport gutters. */}
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-sans text-2xl font-medium text-foreground">Altitude Profile</h2>
            <p className="mt-1 text-sm text-muted-foreground font-mono">
              Origin departure to home return across the Kailash Mansarovar yatra
            </p>
          </div>
          <SegmentedControl mode={mode} onChange={handleModeChange} />
        </div>

        <div className="relative w-full" style={{ height: 340 }}>
          <ChartArea
            data={chartData}
            series={series}
            xKey="day"
            height={340}
            domain={[0, 6000]}
            ticks={Y_TICKS}
            tickFormatter={(v) => altLabel(v)}
            curveType="linear"
            yAxisTick={<YAxisTick />}
            yAxisWidth={56}
            hideYAxisLine
            margin={{ top: 16, right: 8, bottom: 16, left: 0 }}
            referenceLines={ACCL_LINES}
            referencePoint={{ x: 'D8', color: 'var(--destructive)', label: 'Dolma La 5,630m' }}
            tooltipContent={(props) => <TooltipContent {...(props as Parameters<typeof TooltipContent>[0])} />}
          />
        </div>
      </div>
    </section>
  );
}

// ---- Custom YAxis tick · left-aligned at chart wrapper left edge --------

function YAxisTick(props: unknown) {
  const { y, payload } = props as { y: number; payload: { value: number } };
  return (
    <text
      x={0}
      y={y}
      dy={4}
      fontSize={10}
      fontFamily="'JetBrains Mono', ui-monospace, monospace"
      fill="var(--muted-foreground)"
      textAnchor="start"
    >
      {altLabel(payload.value)}
    </text>
  );
}
