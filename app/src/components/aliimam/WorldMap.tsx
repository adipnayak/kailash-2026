/**
 * WorldMap -- dotted-map SVG world map with stage-driven narrative animation.
 * Manual port of shailendrakumar19999/map from 21st.dev (adapted for Vite/React,
 * no Next.js Image, no next-themes -- uses aliimam CSS tokens instead).
 *
 * Animation model: pass a `stages` sequence. Each stage tweens the viewBox
 * (per-stage holdMs + tweenMs) then activates a subset of arcs which draw
 * their pathLength 0 -> 1. Arcs accumulate across stages (prior arcs stay
 * drawn) and reset at cycle end. Endpoint dots + labels fade in only after
 * an arc that touches them activates, so the narrative matches the journey.
 *
 * Anti-AI rule: zero em-dashes, en-dashes, smart quotes, emojis.
 */

import { useRef, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DottedMap from 'dotted-map';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MapDot {
  start: { lat: number; lng: number; label?: string };
  end: { lat: number; lng: number; label?: string };
  color?: string;
}

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Stage {
  /** Target viewBox for this stage. */
  viewBox: ViewBox;
  /** Indices into the dots array. These arcs draw during this stage. */
  arcIndices: number[];
  /** Tween duration from prior stage's viewBox into this one (ms). */
  tweenMs?: number;
  /** Hold duration after arrival (ms). Arcs draw during this hold. */
  holdMs: number;
}

export interface WorldMapProps {
  dots?: MapDot[];
  lineColor?: string;
  dotColor?: string;
  showLabels?: boolean;
  /** Static viewBox crop. Used when stages is not provided. */
  viewBox?: ViewBox;
  /** Stage sequence for narrative animation. Cycles automatically. */
  stages?: Stage[];
  /** Pause at end of cycle before replay (ms). */
  loopGapMs?: number;
  /** Per-arc draw duration when activated (ms). */
  arcDrawMs?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function projectPoint(lat: number, lng: number): { x: number; y: number } {
  const x = (lng + 180) * (800 / 360);
  const y = (90 - lat) * (400 / 180);
  return { x, y };
}

function createCurvedPath(
  start: { x: number; y: number },
  end: { x: number; y: number }
): string {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 50;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function pointKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FULL_VB: ViewBox = { x: 0, y: 0, width: 800, height: 400 };

export function WorldMap({
  dots = [],
  lineColor = 'var(--sacred)',
  dotColor = 'oklch(0.556 0 0 / 0.25)',
  showLabels = true,
  viewBox,
  stages,
  loopGapMs = 1500,
  arcDrawMs = 1400,
}: WorldMapProps) {
  const initialVb = stages?.[0]?.viewBox ?? viewBox ?? FULL_VB;
  const [vb, setVb] = useState<ViewBox>(initialVb);
  const vbRef = useRef<ViewBox>(initialVb);

  // Cycle key forces a fresh mount of arc/dot motion components on loop
  // restart so pathLength animations replay from 0.
  const [cycleKey, setCycleKey] = useState(0);

  // Set of arc indices currently drawn/drawing. When stages is not provided,
  // all arcs are active from the start (static / unsequenced mode).
  const [activeArcs, setActiveArcs] = useState<Set<number>>(() =>
    stages ? new Set(stages[0]?.arcIndices ?? []) : new Set(dots.map((_, i) => i))
  );

  // Stage runner
  useEffect(() => {
    if (!stages || stages.length === 0) return;
    let cancelled = false;
    let rafId = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const tween = (from: ViewBox, to: ViewBox, ms: number) =>
      new Promise<void>((resolve) => {
        if (ms <= 0) {
          vbRef.current = to;
          setVb(to);
          resolve();
          return;
        }
        const start = performance.now();
        const step = (now: number) => {
          if (cancelled) {
            resolve();
            return;
          }
          const t = Math.min(1, (now - start) / ms);
          const e = easeInOutQuad(t);
          const interp: ViewBox = {
            x: from.x + (to.x - from.x) * e,
            y: from.y + (to.y - from.y) * e,
            width: from.width + (to.width - from.width) * e,
            height: from.height + (to.height - from.height) * e,
          };
          vbRef.current = interp;
          setVb(interp);
          if (t < 1) {
            rafId = requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        rafId = requestAnimationFrame(step);
      });

    const sleep = (ms: number) =>
      new Promise<void>((r) => {
        timeoutId = setTimeout(r, ms);
      });

    const runCycle = async () => {
      while (!cancelled) {
        // Reset cycle
        setCycleKey((k) => k + 1);
        setActiveArcs(new Set());
        // Snap to first stage's viewBox without tween
        vbRef.current = stages[0].viewBox;
        setVb(stages[0].viewBox);
        // Yield one frame so React commits the reset
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        if (cancelled) return;

        const accumulated = new Set<number>();
        for (let i = 0; i < stages.length; i++) {
          if (cancelled) return;
          const stage = stages[i];

          // Tween into this stage's viewBox (skipped on stage 0)
          if (i > 0 && stage.tweenMs && stage.tweenMs > 0) {
            await tween(vbRef.current, stage.viewBox, stage.tweenMs);
          } else if (i > 0) {
            vbRef.current = stage.viewBox;
            setVb(stage.viewBox);
          }
          if (cancelled) return;

          // Activate this stage's arcs (accumulate)
          stage.arcIndices.forEach((idx) => accumulated.add(idx));
          setActiveArcs(new Set(accumulated));

          // Hold for the stage duration so arcs draw + pause
          await sleep(stage.holdMs);
        }
        if (cancelled) return;

        // Pause before replay
        await sleep(loopGapMs);
      }
    };

    runCycle();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [stages, loopGapMs]);

  const viewBoxStr = `${vb.x} ${vb.y} ${vb.width} ${vb.height}`;
  const aspect = vb.width / vb.height;

  // SVG-unit sizes scale with viewBox. Shrink dots/labels proportionally
  // when zooming so screen-rendered size stays readable at any zoom.
  const labelScale = vb.width / 800;
  const labelWidth = 100 * labelScale;
  const labelHeight = 30 * labelScale;
  const labelOffsetY = 35 * labelScale;
  const dotR = 3 * labelScale;
  const dotPulseRMax = 12 * labelScale;
  const labelFontPx = 9 * labelScale;
  const arcStroke = Math.max(0.5, labelScale * 2);

  // Base map dots magnify with the viewBox crop. At deep zoom they become
  // huge circles that overwhelm the arcs. Fade the layer in proportion to
  // zoom so it stays a subtle backdrop instead of competing for attention.
  const baseMapOpacity = Math.min(1, vb.width / 250);

  const imgStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${(800 / vb.width) * 100}%`,
    height: `${(400 / vb.height) * 100}%`,
    left: `${-(vb.x / vb.width) * 100}%`,
    top: `${-(vb.y / vb.height) * 100}%`,
    maxWidth: 'none',
    opacity: baseMapOpacity,
    transition: 'opacity 200ms linear',
  };

  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const map = useMemo(() => new DottedMap({ height: 100, grid: 'diagonal' }), []);

  const svgMap = useMemo(
    () =>
      map.getSVG({
        radius: 0.22,
        color: dotColor,
        shape: 'circle',
        backgroundColor: 'transparent',
      }),
    [map, dotColor]
  );

  // Deduped endpoint locations -- one dot + one label per unique lat,lng.
  const uniquePoints = useMemo(() => {
    const byKey = new Map<
      string,
      { key: string; x: number; y: number; label?: string; color: string }
    >();
    for (const d of dots) {
      const color = d.color ?? lineColor;
      for (const ep of [d.start, d.end] as const) {
        const k = pointKey(ep.lat, ep.lng);
        if (!byKey.has(k)) {
          const p = projectPoint(ep.lat, ep.lng);
          byKey.set(k, { key: k, x: p.x, y: p.y, label: ep.label, color });
        }
      }
    }
    return Array.from(byKey.values());
  }, [dots, lineColor]);

  // For each unique point, the set of arc indices that touch it. A point is
  // visible iff any of those arcs is currently active.
  const pointToArcs = useMemo(() => {
    const m = new Map<string, number[]>();
    dots.forEach((d, i) => {
      for (const ep of [d.start, d.end] as const) {
        const k = pointKey(ep.lat, ep.lng);
        const arr = m.get(k) ?? [];
        arr.push(i);
        m.set(k, arr);
      }
    });
    return m;
  }, [dots]);

  return (
    <div
      className="w-full relative overflow-hidden bg-background"
      style={{ aspectRatio: `${aspect}` }}
    >
      {/* Dotted base map */}
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="[mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        style={imgStyle}
        alt=""
        draggable={false}
      />

      {/* Arc overlay */}
      <svg
        ref={svgRef}
        viewBox={viewBoxStr}
        className="w-full h-full absolute inset-0 pointer-events-auto select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="wm-glow">
            <feMorphology operator="dilate" radius="0.5" />
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Arcs */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const pathD = createCurvedPath(startPoint, endPoint);
          const arcColor = dot.color ?? lineColor;
          const active = activeArcs.has(i);

          return (
            <g key={`arc-${cycleKey}-${i}`}>
              <motion.path
                d={pathD}
                fill="none"
                stroke={arcColor}
                strokeWidth={arcStroke}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: active ? 1 : 0 }}
                transition={{ duration: arcDrawMs / 1000, ease: 'easeInOut' }}
              />
              {active && (
                <motion.circle
                  r={dotR * 1.3}
                  fill={arcColor}
                  initial={{ offsetDistance: '0%', opacity: 0 }}
                  animate={{
                    offsetDistance: '100%',
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: arcDrawMs / 1000,
                    times: [0, 0.15, 0.85, 1],
                    ease: 'easeInOut',
                  }}
                  style={{ offsetPath: `path('${pathD}')` }}
                />
              )}
            </g>
          );
        })}

        {/* Endpoint dots + labels, deduped per location */}
        {uniquePoints.map((p, i) => {
          const arcs = pointToArcs.get(p.key) ?? [];
          const visible = arcs.some((idx) => activeArcs.has(idx));
          return (
            <motion.g
              key={`point-${cycleKey}-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: visible ? 1 : 0 }}
              transition={{ duration: 0.5, delay: visible ? 0.15 : 0 }}
            >
              <motion.g
                onHoverStart={() => setHoveredLocation(p.label ?? `Location ${i}`)}
                onHoverEnd={() => setHoveredLocation(null)}
                className="cursor-pointer"
                whileHover={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={dotR}
                  fill={p.color}
                  filter="url(#wm-glow)"
                />
                <circle cx={p.x} cy={p.y} r={dotR} fill={p.color} opacity="0.5">
                  <animate
                    attributeName="r"
                    from={dotR}
                    to={dotPulseRMax}
                    dur="2s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="2s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              </motion.g>

              {showLabels && p.label && (
                <foreignObject
                  x={p.x - labelWidth / 2}
                  y={p.y - labelOffsetY}
                  width={labelWidth}
                  height={labelHeight}
                  className="pointer-events-none"
                >
                  <div className="flex items-center justify-center h-full">
                    <span
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontSize: `${labelFontPx}px`,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: 'var(--foreground)',
                        background:
                          'color-mix(in oklch, var(--background) 85%, transparent)',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      {p.label}
                    </span>
                  </div>
                </foreignObject>
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* Mobile hover tooltip */}
      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 bg-background/90 text-foreground px-3 py-2 text-xs font-medium backdrop-blur-sm sm:hidden border border-border"
            style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}
          >
            {hoveredLocation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
