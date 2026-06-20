/**
 * WorldMap -- dotted-map SVG world map with framer-motion arcs.
 * Manual port of shailendrakumar19999/map from 21st.dev (adapted for Vite/React,
 * no Next.js Image, no next-themes -- uses aliimam CSS tokens instead).
 *
 * Anti-AI rule: zero em-dashes, en-dashes, smart quotes, emojis.
 */

import { useRef, useState, useMemo } from 'react';
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

export interface WorldMapProps {
  dots?: MapDot[];
  lineColor?: string;
  dotColor?: string;
  showLabels?: boolean;
  animationDuration?: number;
  loop?: boolean;
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorldMap({
  dots = [],
  lineColor = 'var(--sacred)',
  dotColor = 'oklch(0.556 0 0 / 0.25)',
  showLabels = true,
  animationDuration = 2,
  loop = true,
}: WorldMapProps) {
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

  const staggerDelay = 0.3;
  const totalAnimationTime = dots.length * staggerDelay + animationDuration;
  const pauseTime = 2;
  const fullCycleDuration = totalAnimationTime + pauseTime;

  return (
    <div className="w-full aspect-[2/1] relative overflow-hidden bg-background">
      {/* Dotted base map */}
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none object-cover"
        alt=""
        draggable={false}
      />

      {/* Arc overlay */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
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
                strokeWidth="1"
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
                  r="4"
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

        {/* Endpoint dots + labels */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          const arcColor = dot.color ?? lineColor;

          return (
            <g key={`points-group-${i}`}>
              {/* Start */}
              <g key={`start-${i}`}>
                <motion.g
                  onHoverStart={() =>
                    setHoveredLocation(dot.start.label ?? `Location ${i}`)
                  }
                  onHoverEnd={() => setHoveredLocation(null)}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <circle
                    cx={startPoint.x}
                    cy={startPoint.y}
                    r="3"
                    fill={arcColor}
                    filter="url(#wm-glow)"
                  />
                  <circle
                    cx={startPoint.x}
                    cy={startPoint.y}
                    r="3"
                    fill={arcColor}
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from="3"
                      to="12"
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

                {showLabels && dot.start.label && (
                  <motion.g
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 * i + 0.3, duration: 0.5 }}
                    className="pointer-events-none"
                  >
                    <foreignObject
                      x={startPoint.x - 50}
                      y={startPoint.y - 35}
                      width="100"
                      height="30"
                    >
                      <div className="flex items-center justify-center h-full">
                        <span
                          style={{
                            fontFamily: "'Geist Mono', ui-monospace, monospace",
                            fontSize: '9px',
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                            color: 'var(--foreground)',
                            background: 'color-mix(in oklch, var(--background) 85%, transparent)',
                            padding: '1px 4px',
                            borderRadius: '2px',
                            whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                        >
                          {dot.start.label}
                        </span>
                      </div>
                    </foreignObject>
                  </motion.g>
                )}
              </g>

              {/* End */}
              <g key={`end-${i}`}>
                <motion.g
                  onHoverStart={() =>
                    setHoveredLocation(dot.end.label ?? `Destination ${i}`)
                  }
                  onHoverEnd={() => setHoveredLocation(null)}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <circle
                    cx={endPoint.x}
                    cy={endPoint.y}
                    r="3"
                    fill={arcColor}
                    filter="url(#wm-glow)"
                  />
                  <circle
                    cx={endPoint.x}
                    cy={endPoint.y}
                    r="3"
                    fill={arcColor}
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from="3"
                      to="12"
                      dur="2s"
                      begin="0.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.6"
                      to="0"
                      dur="2s"
                      begin="0.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </motion.g>

                {showLabels && dot.end.label && (
                  <motion.g
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 * i + 0.5, duration: 0.5 }}
                    className="pointer-events-none"
                  >
                    <foreignObject
                      x={endPoint.x - 50}
                      y={endPoint.y - 35}
                      width="100"
                      height="30"
                    >
                      <div className="flex items-center justify-center h-full">
                        <span
                          style={{
                            fontFamily: "'Geist Mono', ui-monospace, monospace",
                            fontSize: '9px',
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                            color: 'var(--foreground)',
                            background: 'color-mix(in oklch, var(--background) 85%, transparent)',
                            padding: '1px 4px',
                            borderRadius: '2px',
                            whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                        >
                          {dot.end.label}
                        </span>
                      </div>
                    </foreignObject>
                  </motion.g>
                )}
              </g>
            </g>
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
