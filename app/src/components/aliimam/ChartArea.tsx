/**
 * ChartArea.
 * aliimam-style area chart built on recharts + shadcn ChartContainer pattern.
 * ResponsiveContainer handles width; explicit height from props.
 *
 * Anti-AI rules: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 * No border-radius on tooltip (borderRadius: 0).
 */

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChartSeries {
  key: string;
  color: string;
  label: string;
}

export interface ChartRefArea {
  x1: string | number;
  x2: string | number;
  label?: string;
  color?: string;
}

export interface ChartRefPoint {
  x: string | number;
  y?: number;
  color: string;
  label?: string;
}

export interface ChartRefLine {
  x: string | number;
  color?: string;
  label?: string;
  labelPosition?: 'top' | 'insideTop' | 'insideTopRight' | 'insideTopLeft';
  strokeDasharray?: string;
  strokeWidth?: number;
}

export type ChartCurveType = 'linear' | 'monotone' | 'natural' | 'step' | 'stepBefore' | 'stepAfter';

export interface ChartAreaProps {
  data: Array<Record<string, string | number>>;
  series: ChartSeries[];
  xKey: string;
  yLabel?: string;
  height?: number;
  domain?: [number, number];
  ticks?: number[];
  tickFormatter?: (value: number) => string;
  referenceAreas?: ChartRefArea[];
  referencePoint?: ChartRefPoint;
  referenceLines?: ChartRefLine[];
  curveType?: ChartCurveType;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  tooltipContent?: (props: TooltipProps<number, string>) => React.ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChartArea({
  data,
  series,
  xKey,
  yLabel,
  height = 280,
  domain,
  ticks,
  tickFormatter,
  referenceAreas,
  referencePoint,
  referenceLines,
  curveType = 'monotone',
  margin,
  tooltipContent,
  className,
}: ChartAreaProps) {
  const m = { top: 16, right: 16, bottom: 16, left: 16, ...(margin ?? {}) };
  return (
    <div
      className={'w-full ' + (className ?? '')}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={m}>
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.key + '-grad'}
                id={'grad-' + s.key}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.03} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="2 2"
            vertical={false}
          />

          <XAxis
            dataKey={xKey}
            stroke="var(--border)"
            tick={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fill: 'var(--muted-foreground)',
            }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />

          <YAxis
            stroke="var(--border)"
            tick={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fill: 'var(--muted-foreground)',
            }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            domain={domain}
            ticks={ticks}
            tickFormatter={tickFormatter}
            width={yLabel ? 110 : 80}
            label={
              yLabel
                ? {
                    value: yLabel,
                    angle: -90,
                    position: 'insideLeft',
                    style: {
                      fill: 'var(--muted-foreground)',
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    },
                  }
                : undefined
            }
          />

          <Tooltip
            content={
              tooltipContent
                ? (props) => tooltipContent(props as TooltipProps<number, string>)
                : undefined
            }
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 0,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 12,
            }}
          />

          {referenceAreas?.map((band, i) => (
            <ReferenceArea
              key={i}
              x1={band.x1}
              x2={band.x2}
              fill={band.color ?? 'rgba(200,160,0,1)'}
              fillOpacity={0.09}
              stroke={band.color ?? 'rgba(200,160,0,0.22)'}
              strokeOpacity={0.5}
              label={
                band.label
                  ? {
                      value: band.label,
                      position: 'insideTop',
                      style: {
                        fontSize: 9,
                        fill: 'var(--muted-foreground)',
                        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                        letterSpacing: '0.06em',
                      },
                    }
                  : undefined
              }
            />
          ))}

          {referenceLines?.map((rl, i) => (
            <ReferenceLine
              key={'rline-' + i}
              x={rl.x}
              stroke={rl.color ?? 'var(--muted-foreground)'}
              strokeDasharray={rl.strokeDasharray ?? '3 3'}
              strokeWidth={rl.strokeWidth ?? 1}
              strokeOpacity={0.5}
              label={
                rl.label
                  ? {
                      value: rl.label,
                      position: rl.labelPosition ?? 'insideTop',
                      fill: 'var(--muted-foreground)',
                      fontSize: 9,
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    }
                  : undefined
              }
            />
          ))}

          {series.map((s) => (
            <Area
              key={s.key}
              type={curveType}
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              fill={'url(#grad-' + s.key + ')'}
              dot={false}
              activeDot={{
                r: 4,
                stroke: s.color,
                strokeWidth: 2,
                fill: 'var(--background)',
              }}
              name={s.label}
              isAnimationActive={false}
            />
          ))}

          {referencePoint && (
            <ReferenceLine
              x={referencePoint.x}
              stroke={referencePoint.color}
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={
                referencePoint.label
                  ? {
                      value: referencePoint.label,
                      position: 'top',
                      fill: referencePoint.color,
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    }
                  : undefined
              }
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
