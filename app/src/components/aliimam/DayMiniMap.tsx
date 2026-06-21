/**
 * DayMiniMap -- stripped-down dotted-map arc for a single day's start->end route.
 * Static SVG only: no hover, no animation, no zoom, no pan, no labels.
 * Reuses the dotted-map package already installed for WorldMap.tsx.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useMemo } from 'react';
import DottedMap from 'dotted-map';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DayMiniMapProps {
  start: { lat: number; lng: number; label?: string };
  end?: { lat: number; lng: number; label?: string };
  arcColor?: string;
  width?: number;
  height?: number;
}

// ---------------------------------------------------------------------------
// Singleton dotted-map instance (created once per module load)
// ---------------------------------------------------------------------------

let _mapInstance: InstanceType<typeof DottedMap> | null = null;
let _svgCache: string | null = null;

function getMapSvg(): string {
  if (!_mapInstance) {
    _mapInstance = new DottedMap({ height: 100, grid: 'diagonal' });
  }
  if (!_svgCache) {
    _svgCache = _mapInstance.getSVG({
      radius: 0.22,
      // Theme-aware muted-foreground at 25 % opacity so the dot pattern
      // flips between light and dark themes.
      color: 'color-mix(in oklch, var(--muted-foreground) 25%, transparent)',
      shape: 'circle',
      backgroundColor: 'transparent',
    });
  }
  return _svgCache;
}

// ---------------------------------------------------------------------------
// Projection: lat/lng -> SVG user units (800 x 400 world space)
// ---------------------------------------------------------------------------

function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: (lng + 180) * (800 / 360),
    y: (90 - lat) * (400 / 180),
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DayMiniMap({
  start,
  end,
  arcColor = 'var(--sacred)',
  width = 240,
  height = 70,
}: DayMiniMapProps) {
  const svgMap = useMemo(() => getMapSvg(), []);

  const sP = project(start.lat, start.lng);
  const eP = end ? project(end.lat, end.lng) : sP;

  // Bounding box with padding in world-space units
  const PAD_X = 20;
  const PAD_Y = 15;
  const rawMinX = Math.min(sP.x, eP.x) - PAD_X;
  const rawMinY = Math.min(sP.y, eP.y) - PAD_Y;
  const rawMaxX = Math.max(sP.x, eP.x) + PAD_X;
  const rawMaxY = Math.max(sP.y, eP.y) + PAD_Y;

  let vbW = rawMaxX - rawMinX;
  let vbH = rawMaxY - rawMinY;

  // Enforce minimum dimensions so single-stop days don't produce a tiny box
  if (vbW < 60) vbW = 60;
  if (vbH < 30) vbH = 30;

  // Maintain target aspect ratio
  const targetAspect = width / height;
  const currentAspect = vbW / vbH;
  if (currentAspect < targetAspect) {
    // Too narrow: expand width
    vbW = vbH * targetAspect;
  } else {
    // Too wide: expand height
    vbH = vbW / targetAspect;
  }

  // Center the viewBox on the midpoint of the two points
  const midX = (sP.x + eP.x) / 2;
  const midY = (sP.y + eP.y) / 2;
  const vbMinX = midX - vbW / 2;
  const vbMinY = midY - vbH / 2;

  // Curved arc path (arc curves upward for movement days)
  const arcMidX = midX;
  const arcMidY = Math.min(sP.y, eP.y) - vbH * 0.12;
  const pathD = `M ${sP.x} ${sP.y} Q ${arcMidX} ${arcMidY} ${eP.x} ${eP.y}`;

  // Dot radius and stroke width proportional to viewBox size
  const dotR = Math.max(1.2, vbW / 55);
  const strokeW = Math.max(0.6, vbW / 90);

  // Image positioning: world SVG is 800x400 user units; we pan/zoom via CSS
  const imgWidthPct = (800 / vbW) * 100;
  const imgHeightPct = (400 / vbH) * 100;
  const imgLeftPct = -(vbMinX / vbW) * 100;
  const imgTopPct = -(vbMinY / vbH) * 100;

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {/* Dotted base map */}
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          width: `${imgWidthPct}%`,
          height: `${imgHeightPct}%`,
          left: `${imgLeftPct}%`,
          top: `${imgTopPct}%`,
          maxWidth: 'none',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      {/* Arc + dots overlay */}
      <svg
        viewBox={`${vbMinX} ${vbMinY} ${vbW} ${vbH}`}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {/* Arc (only when start != end) */}
        {end && (
          <path
            d={pathD}
            fill="none"
            stroke={arcColor}
            strokeWidth={strokeW}
            strokeLinecap="round"
            opacity="0.85"
          />
        )}

        {/* Start dot */}
        <circle cx={sP.x} cy={sP.y} r={dotR} fill={arcColor} />

        {/* End dot */}
        {end && (
          <circle cx={eP.x} cy={eP.y} r={dotR} fill={arcColor} />
        )}
      </svg>
    </div>
  );
}
