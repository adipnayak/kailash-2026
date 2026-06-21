/**
 * AltitudeChart.
 * recharts-based area chart via aliimam ChartArea.
 * Walking (altitude_peak) and Sleeping (altitude_sleep) series.
 * Dolma La (D8) marked red with GSAP breathing pulse dot overlay.
 * Yellow vertical bands at D4, D6, D12 (acclimatization days) via ReferenceArea.
 * Segmented control toggles between Walking / Sleeping series.
 * localStorage key: kailash_altitude_mode.
 *
 * Anti-AI rules: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Ruler, Bed, Sun } from '@aliimam/icons';
import gsap from 'gsap';
import { ChartArea } from './aliimam/ChartArea';
import { DAYS } from '../lib/trip-data';
import { mToFt } from '../lib/conversions';

// ---- types ---------------------------------------------------------------

type AltMode = 'walking' | 'sleeping';

// ---- constants -----------------------------------------------------------

const STORAGE_KEY = 'kailash_altitude_mode';
const Y_TICKS = [0, 1000, 2000, 3000, 4000, 5000, 6000];
const DOLMA_ALT_PEAK = DAYS[7].altitude_peak; // 5630
const DOLMA_ALT_SLEEP = DAYS[7].altitude_sleep; // 4670

// Dual-unit label helper: "5,000m / 16,404ft"
function altLabel(m: number): string {
  return m.toLocaleString('en-US') + 'm / ' + mToFt(m).toLocaleString('en-US') + 'ft';
}

// Short location label (trim to city name before comma)
function shortLocation(loc: string): string {
  return loc.split(',')[0].trim();
}

// ---- chart data ----------------------------------------------------------

// D0 (departure) + D14 (return) sit at the average sea-level altitude of
// the four origin cities: Mumbai ~14 m, Dubai ~5 m, Port Louis ~5 m,
// New York ~10 m -> avg 8.5, round to 9 m / 30 ft.
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

// ---- acclim ReferenceArea bands (D4, D6, D12) ---------------------------

const ACCL_BANDS = [
  { x1: 'D4', x2: 'D4', label: 'ACCLIM' },
  { x1: 'D6', x2: 'D6', label: 'REST' },
  { x1: 'D12', x2: 'D12', label: 'BUFFER' },
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
    >
      {(['walking', 'sleeping'] as AltMode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={[
            'px-4 py-1.5 transition-colors duration-150 cursor-pointer',
            mode === m
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground hover:bg-border hover:text-foreground',
          ].join(' ')}
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

// ---- DolmaMarker overlay -------------------------------------------------
// SVG overlay positioned on top of the recharts canvas.
// We use the recharts internal margin approximation to hit the D8 data point.

interface DolmaMarkerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  mode: AltMode;
  dolmaRef: React.RefObject<SVGCircleElement | null>;
}

function DolmaMarker({ containerRef, mode, dolmaRef }: DolmaMarkerProps) {
  const [pos, setPos] = useState<{ cx: number; cy: number; w: number; h: number } | null>(null);

  useEffect(() => {
    function compute() {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      // recharts margin: top 16, right 16, bottom 16, left 16 + YAxis width (~110 for dual-unit labels)
      const ML = 126; // left margin + yaxis width
      const MR = 16;
      const MT = 16;
      const MB = 32; // bottom margin + xaxis tick height

      const plotW = width - ML - MR;
      const plotH = height - MT - MB;

      // D8 is index 8 out of 14 intervals (D0..D14 = 15 points = 14 intervals)
      const xFraction = 8 / 14;
      const cx = ML + xFraction * plotW;

      const dolmaAlt = mode === 'walking' ? DOLMA_ALT_PEAK : DOLMA_ALT_SLEEP;
      const yFraction = 1 - dolmaAlt / 6000;
      const cy = MT + yFraction * plotH;

      setPos({ cx, cy, w: width, h: height });
    }
    compute();
    const obs = new ResizeObserver(compute);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [containerRef, mode]);

  if (!pos) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      width={pos.w}
      height={pos.h}
      aria-hidden="true"
    >
      {/* Outer breathing ring */}
      <circle
        ref={dolmaRef as React.RefObject<SVGCircleElement>}
        cx={pos.cx}
        cy={pos.cy}
        r={14}
        fill="var(--destructive)"
        opacity={0.2}
      />
      {/* Solid inner dot */}
      <circle
        cx={pos.cx}
        cy={pos.cy}
        r={6}
        fill="var(--destructive)"
        stroke="var(--card)"
        strokeWidth={2}
      />
      {/* Label */}
      <text
        x={pos.cx + 10}
        y={pos.cy - 8}
        fontSize={10}
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fill="var(--destructive)"
        fontWeight={600}
      >
        Dolma La
      </text>
      <text
        x={pos.cx + 10}
        y={pos.cy + 3}
        fontSize={9}
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fill="var(--destructive)"
        opacity={0.75}
      >
        5,630m / 18,471ft
      </text>
    </svg>
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

    // D0 + D14 are synthetic origin/home points, not in DAYS.
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

  const dolmaRef = useRef<SVGCircleElement | null>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleModeChange = useCallback((m: AltMode) => {
    setMode(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);

  // GSAP breathing pulse on Dolma La outer ring
  useEffect(() => {
    if (!dolmaRef.current) return;
    if (gsapCtxRef.current) gsapCtxRef.current.revert();
    gsapCtxRef.current = gsap.context(() => {
      gsap.to(dolmaRef.current, {
        scale: 1.6,
        opacity: 0.05,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: '50% 50%',
      });
    });
    return () => {
      gsapCtxRef.current?.revert();
    };
  }, [mode]);

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
      className="border-b border-border bg-background px-6 py-12"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="font-sans text-2xl font-medium text-foreground">Altitude Profile</h2>
            <p className="mt-1 text-sm text-muted-foreground font-mono">
              Origin departure to home return across the Kailash Mansarovar yatra
            </p>
          </div>
          <SegmentedControl mode={mode} onChange={handleModeChange} />
        </div>

        {/* Chart container */}
        <div ref={containerRef} className="relative w-full" style={{ height: 340 }}>
          <ChartArea
            data={chartData}
            series={series}
            xKey="day"
            height={340}
            domain={[0, 6000]}
            ticks={Y_TICKS}
            tickFormatter={(v) => altLabel(v)}
            referenceAreas={ACCL_BANDS}
            referencePoint={{ x: 'D8', color: 'var(--destructive)', label: 'Dolma La 5,630m' }}
            tooltipContent={(props) => <TooltipContent {...(props as Parameters<typeof TooltipContent>[0])} />}
          />

          {/* Dolma La breathing dot overlay */}
          <DolmaMarker containerRef={containerRef} mode={mode} dolmaRef={dolmaRef} />
        </div>

        {/* Day location labels below chart */}
        <div
          className="mt-2 grid font-mono text-[10px] text-muted-foreground"
          style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}
        >
          <div className="text-center truncate px-0.5" title="Departure from origin cities">
            Origins
          </div>
          {DAYS.map((d) => (
            <div
              key={d.day}
              className="text-center truncate px-0.5"
              title={d.location}
            >
              {shortLocation(d.location)}
            </div>
          ))}
          <div className="text-center truncate px-0.5" title="Return to origin cities (avg sea level)">
            Return
          </div>
        </div>

        {/* Legend row */}
        <div className="mt-4 flex flex-wrap items-center gap-6 font-mono text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: 'var(--destructive)' }}
            />
            Dolma La Pass (5,630m / 18,471ft)
          </span>
          <span className="flex items-center gap-1.5">
            <Sun size={11} className="text-sacred" />
            Acclimatization days (D4, D6, D12)
          </span>
        </div>
      </div>
    </section>
  );
}
