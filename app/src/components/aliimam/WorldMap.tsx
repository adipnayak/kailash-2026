/**
 * WorldMap -- dotted-map SVG world map with framer-motion arcs.
 * Manual port of shailendrakumar19999/map from 21st.dev (adapted for Vite/React,
 * no Next.js Image, no next-themes -- uses aliimam CSS tokens instead).
 *
 * Labels + dots are deduped by lat,lng so a location that appears as endpoint
 * of multiple arcs (e.g. Kathmandu, Darchen) renders only once. End-label
 * styles now use the same scaled vars as start-label (previously hardcoded
 * which made Kathmandu/Darchen labels render unscaled and stacked).
 *
 * Optional viewBoxKeyframes prop animates the viewBox through a cycle (e.g.
 * wide-origins view -> tight Tibet route -> back to wide). Each frame holds
 * for holdMs then tweens to the next over tweenMs.
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

export interface ViewBoxKeyframe {
  viewBox: ViewBox;
  holdMs?: number;
  tweenMs?: number;
}

export interface WorldMapProps {
  dots?: MapDot[];
  lineColor?: string;
  dotColor?: string;
  showLabels?: boolean;
  animationDuration?: number;
  loop?: boolean;
  /**
   * Optional static crop region in the underlying 800x400 world projection.
   * Defaults to the full world view. Ignored when viewBoxKeyframes is set.
   */
  viewBox?: ViewBox;
  /**
   * Optional sequence of viewBoxes to cycle through. The component holds at
   * each frame for holdMs then tweens to the next over tweenMs.
   * When set, takes precedence over the static viewBox prop.
   */
  viewBoxKeyframes?: ViewBoxKeyframe[];
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FULL_VB: ViewBox = { x: 0, y: 0, width: 800, height: 400 };

export function WorldMap({
  dots = [],
  lineColor = 'var(--sacred)',
  dotColor = 'oklch(0.556 0 0 / 0.25)',
  showLabels = true,
  animationDuration = 2,
  loop = true,
  viewBox,
  viewBoxKeyframes,
}: WorldMapProps) {
  const initialVb = viewBoxKeyframes?.[0]?.viewBox ?? viewBox ?? FULL_VB;
  const [vb, setVb] = useState<ViewBox>(initialVb);
  const vbRef = useRef<ViewBox>(initialVb);

  // ViewBox animation loop
  useEffect(() => {
    if (!viewBoxKeyframes || viewBoxKeyframes.length < 2) return;
    let cancelled = false;
    let rafId = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const runFrame = (idx: number) => {
      if (cancelled) return;
      const next = viewBoxKeyframes[idx % viewBoxKeyframes.length];
      const from = vbRef.current;
      const to = next.viewBox;
      const tweenMs = next.tweenMs ?? 1500;
      const holdMs = next.holdMs ?? 2500;
      const start = performance.now();

      const step = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / tweenMs);
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
          timeoutId = setTimeout(() => runFrame(idx + 1), holdMs);
        }
      };
      rafId = requestAnimationFrame(step);
    };

    // Hold initial frame briefly before starting cycle
    timeoutId = setTimeout(
      () => runFrame(1),
      viewBoxKeyframes[0].holdMs ?? 2500
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [viewBoxKeyframes]);

  const viewBoxStr = `${vb.x} ${vb.y} ${vb.width} ${vb.height}`;
  const aspect = vb.width / vb.height;

  // SVG-unit sizes scale with viewBox. Shrink dots/labels proportionally when
  // zooming so screen-rendered size stays readable.
  const labelScale = vb.width / 800;
  const labelWidth = 100 * labelScale;
  const labelHeight = 30 * labelScale;
  const labelOffsetY = 35 * labelScale;
  const dotR = 3 * labelScale;
  const dotPulseRMax = 12 * labelScale;
  const labelFontPx = 9 * labelScale;
  const arcStroke = Math.max(0.5, labelScale * 2);

  const imgStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${(800 / vb.width) * 100}%`,
    height: `${(400 / vb.height) * 100}%`,
    left: `${-(vb.x / vb.width) * 100}%`,
    top: `${-(vb.y / vb.height) * 100}%`,
    maxWidth: 'none',
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

  // Dedupe points across all arc endpoints so each location renders one
  // dot + one label regardless of how many arcs touch it.
  const uniquePoints = useMemo(() => {
    const seen = new Map<
      string,
      { x: number; y: number; label?: string; color: string }
    >();
    for (const d of dots) {
      const color = d.color ?? lineColor;
      for (const ep of [d.start, d.end] as const) {
        const k = `${ep.lat.toFixed(4)},${ep.lng.toFixed(4)}`;
        if (!seen.has(k)) {
          const p = projectPoint(ep.lat, ep.lng);
          seen.set(k, { x: p.x, y: p.y, label: ep.label, color });
        }
      }
    }
    return Array.from(seen.values());
  }, [dots, lineColor]);

  const staggerDelay = 0.3;
  const totalAnimationTime = dots.length * staggerDelay + animationDuration;
  const pauseTime = 2;
  const fullCycleDuration = totalAnimationTime + pauseTime;

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

          const startTime = (i * staggerDelay) / fullCycleDuration;
          const endTime = (i * staggerDelay + animationDuration) / fullCycleDuration;
          const resetTime = totalAnimationTime / fullCycleDuration;

          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={pathD}
                fill="none"
                stroke={arcColor}
                strokeWidth={arcStroke}
                initial={{ pathLength: 0 }}
                animate={
                  loop
                    ? { pathLength: [0, 0, 1, 1, 0] }
                    : { pathLength: 1 }
                }
                transition={
                  loop
                    ? {
                        duration: fullCycleDuration,
                        times: [0, startTime, endTime, resetTime, 1],
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatDelay: 0,
                      }
                    : {
                        duration: animationDuration,
                        delay: i * staggerDelay,
                        ease: 'easeInOut',
                      }
                }
              />

              {loop && (
                <motion.circle
                  r={dotR * 1.3}
                  fill={arcColor}
                  initial={{ offsetDistance: '0%', opacity: 0 }}
                  animate={{
                    offsetDistance: [null, '0%', '100%', '100%', '100%'],
                    opacity: [0, 0, 1, 0, 0],
                  }}
                  transition={{
                    duration: fullCycleDuration,
                    times: [0, startTime, endTime, resetTime, 1],
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatDelay: 0,
                  }}
                  style={{
                    offsetPath: `path('${pathD}')`,
                  }}
                />
              )}
            </g>
          );
        })}

        {/* Deduped endpoint dots */}
        {uniquePoints.map((p, i) => (
          <motion.g
            key={`dot-${i}`}
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
        ))}

        {/* Deduped labels (rendered after dots so they sit on top) */}
        {showLabels &&
          uniquePoints.map((p, i) =>
            p.label ? (
              <motion.g
                key={`label-${i}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                className="pointer-events-none"
              >
                <foreignObject
                  x={p.x - labelWidth / 2}
                  y={p.y - labelOffsetY}
                  width={labelWidth}
                  height={labelHeight}
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
              </motion.g>
            ) : null
          )}
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
