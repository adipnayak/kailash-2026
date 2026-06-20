/**
 * AltitudeChart.
 * reaviz AreaChart with Walking (altitude_peak) and Sleeping (altitude_sleep) series.
 * Dolma La (D8) marked red with GSAP breathing pulse.
 * Yellow vertical bands at D4, D6, D12 (acclimatization days).
 * Segmented control toggles between Walking / Sleeping series.
 * localStorage key: kailash_altitude_mode.
 *
 * Anti-AI rules: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Ruler, Bed, Sun } from '@aliimam/icons';
import {
  AreaChart,
  AreaSeries,
  Area,
  Gradient,
  GradientStop,
  GridlineSeries,
  Gridline,
  LinearXAxis,
  LinearYAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
  LinearYAxisTickSeries,
  LinearYAxisTickLabel,
  TooltipArea,
  ChartTooltip,
} from 'reaviz';
import gsap from 'gsap';
import { DAYS } from '../lib/trip-data';
import { mToFt } from '../lib/conversions';

// ---- types ---------------------------------------------------------------

type AltMode = 'walking' | 'sleeping';

// ---- constants -----------------------------------------------------------

const STORAGE_KEY = 'kailash_altitude_mode';
const ACCL_DAYS = [4, 6, 12]; // 1-based day numbers for yellow bands
const DOLMA_ALT_PEAK = DAYS[7].altitude_peak; // 5630
const DOLMA_ALT_SLEEP = DAYS[7].altitude_sleep; // 4670

// Dual-unit label helper: "5,000m / 16,404ft"
function altLabel(m: number): string {
  return m.toLocaleString('en-US') + 'm / ' + mToFt(m).toLocaleString('en-US') + 'ft';
}

// Short location label for X axis (trim to city name before comma)
function shortLocation(loc: string): string {
  return loc.split(',')[0].trim();
}

// Metres gained vs previous day
function mGained(dayIndex: number, mode: AltMode): number {
  if (dayIndex === 0) return 0;
  const prev =
    mode === 'walking'
      ? DAYS[dayIndex - 1].altitude_peak
      : DAYS[dayIndex - 1].altitude_sleep;
  const curr =
    mode === 'walking' ? DAYS[dayIndex].altitude_peak : DAYS[dayIndex].altitude_sleep;
  return curr - prev;
}

// Build reaviz ChartShallowDataShape array
function buildSeries(mode: AltMode) {
  return DAYS.map((d) => ({
    key: 'D' + d.day,
    data:
      mode === 'walking' ? d.altitude_peak : d.altitude_sleep,
  }));
}

// Y-axis explicit ticks
const Y_TICKS = [0, 1000, 2000, 3000, 4000, 5000, 6000];

// ---- sub-components ------------------------------------------------------

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
      className="inline-flex rounded border border-border overflow-hidden font-mono text-xs"
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

// ---- Dolma La overlay marker --------------------------------------------

interface DolmaMarkerProps {
  chartWidth: number;
  chartHeight: number;
  dolmaRef: React.RefObject<SVGCircleElement | null>;
  mode: AltMode;
}

function DolmaMarker({ chartWidth, chartHeight, dolmaRef, mode }: DolmaMarkerProps) {
  // Approximate reaviz internal margins
  const MARGIN_LEFT = 92;
  const MARGIN_RIGHT = 16;
  const MARGIN_TOP = 16;
  const MARGIN_BOTTOM = 44;

  const plotW = chartWidth - MARGIN_LEFT - MARGIN_RIGHT;
  const plotH = chartHeight - MARGIN_TOP - MARGIN_BOTTOM;

  // D8 is index 7 of 12 intervals (0-12)
  const xFraction = 7 / 12;
  const cx = MARGIN_LEFT + xFraction * plotW;

  const dolmaAlt = mode === 'walking' ? DOLMA_ALT_PEAK : DOLMA_ALT_SLEEP;
  const yFraction = 1 - dolmaAlt / 6000;
  const cy = MARGIN_TOP + yFraction * plotH;

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      width={chartWidth}
      height={chartHeight}
      aria-hidden="true"
    >
      {/* Outer breathing ring */}
      <circle ref={dolmaRef as React.RefObject<SVGCircleElement>} cx={cx} cy={cy} r={14} fill="var(--destructive)" opacity={0.2} />
      {/* Solid inner dot */}
      <circle cx={cx} cy={cy} r={6} fill="var(--destructive)" stroke="var(--card)" strokeWidth={2} />
      {/* Label */}
      <text
        x={cx + 10}
        y={cy - 8}
        fontSize={10}
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fill="var(--destructive)"
        fontWeight={600}
      >
        Dolma La
      </text>
      <text
        x={cx + 10}
        y={cy + 3}
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
  const [chartSize, setChartSize] = useState({ width: 0, height: 340 });

  const handleModeChange = useCallback((m: AltMode) => {
    setMode(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);

  // ResizeObserver for responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setChartSize((prev) => ({ ...prev, width: Math.round(width) }));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
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
  }, [chartSize.width]); // re-run when marker remounts due to width change

  const data = buildSeries(mode);

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
              13-day elevation across the Kailash Mansarovar yatra
            </p>
          </div>
          <SegmentedControl mode={mode} onChange={handleModeChange} />
        </div>

        {/* Chart container */}
        <div ref={containerRef} className="relative w-full" style={{ height: 340 }}>
          {/* Acclimatization yellow bands */}
          {chartSize.width > 0 &&
            ACCL_DAYS.map((dayNum) => {
              // dayNum is 1-based; position: (dayNum-1)/12 of plot width
              const xPct = ((dayNum - 1) / 12) * 100;
              const wPct = (1 / 12) * 100;
              return (
                <div
                  key={dayNum}
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{
                    left: xPct + '%',
                    width: wPct + '%',
                    background: 'rgba(200,160,0,0.08)',
                    borderLeft: '1px solid rgba(200,160,0,0.22)',
                    borderRight: '1px solid rgba(200,160,0,0.22)',
                  }}
                />
              );
            })}

          {/* reaviz AreaChart */}
          {chartSize.width > 0 && (
            <AreaChart
              width={chartSize.width}
              height={340}
              data={data}
              xAxis={
                <LinearXAxis
                  type="category"
                  tickSeries={
                    <LinearXAxisTickSeries
                      tickSize={28}
                      label={
                        <LinearXAxisTickLabel
                          fill="var(--muted-foreground)"
                          fontSize={11}
                          fontFamily="'JetBrains Mono', ui-monospace, monospace"
                          format={(v: string) => v}
                        />
                      }
                    />
                  }
                />
              }
              yAxis={
                <LinearYAxis
                  type="value"
                  domain={[0, 6000]}
                  tickSeries={
                    <LinearYAxisTickSeries
                      tickValues={Y_TICKS}
                      label={
                        <LinearYAxisTickLabel
                          fill="var(--muted-foreground)"
                          fontSize={10}
                          fontFamily="'JetBrains Mono', ui-monospace, monospace"
                          format={(v: number) => altLabel(v)}
                        />
                      }
                    />
                  }
                />
              }
              gridlines={
                <GridlineSeries
                  line={
                    <Gridline
                      direction="y"
                      strokeColor="var(--border)"
                      strokeDasharray="3,3"
                    />
                  }
                />
              }
              series={
                <AreaSeries
                  animated
                  interpolation="smooth"
                  colorScheme={['var(--sacred)']}
                  area={
                    <Area
                      gradient={
                        <Gradient
                          stops={[
                            <GradientStop key="top" offset="0%" stopOpacity={0.3} />,
                            <GradientStop key="bot" offset="100%" stopOpacity={0.03} />,
                          ]}
                        />
                      }
                    />
                  }
                  tooltip={
                    <TooltipArea
                      tooltip={
                        <ChartTooltip
                          content={(value: unknown) => {
                            const v = value as { key?: string } | null;
                            if (!v || !v.key) return null;
                            const dayNum = parseInt((v.key as string).replace('D', ''), 10);
                            if (!dayNum || dayNum < 1 || dayNum > 13) return null;
                            const d = DAYS[dayNum - 1];
                            const alt =
                              mode === 'walking' ? d.altitude_peak : d.altitude_sleep;
                            const idx = dayNum - 1;
                            const gained = mGained(idx, mode);
                            const gainedStr =
                              gained > 0
                                ? '+' + gained.toLocaleString('en-US') + ' m'
                                : gained < 0
                                ? gained.toLocaleString('en-US') + ' m'
                                : '0 m';
                            return (
                              <div className="bg-card border border-border rounded px-3 py-2 text-xs shadow-sm min-w-[160px]">
                                <div className="font-sans font-medium text-foreground text-sm mb-1">
                                  D{d.day} - {shortLocation(d.location)}
                                </div>
                                <div className="font-mono text-muted-foreground">{altLabel(alt)}</div>
                                <div className="font-mono text-muted-foreground mt-0.5">
                                  Gain: {gainedStr}
                                </div>
                              </div>
                            );
                          }}
                        />
                      }
                    />
                  }
                />
              }
            />
          )}

          {/* Dolma La overlay marker (D8) */}
          {chartSize.width > 0 && (
            <DolmaMarker
              chartWidth={chartSize.width}
              chartHeight={340}
              dolmaRef={dolmaRef}
              mode={mode}
            />
          )}
        </div>

        {/* Day location labels below chart */}
        <div
          className="mt-2 grid font-mono text-[10px] text-muted-foreground"
          style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}
        >
          {DAYS.map((d) => (
            <div
              key={d.day}
              className="text-center truncate px-0.5"
              title={d.location}
            >
              {shortLocation(d.location)}
            </div>
          ))}
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
