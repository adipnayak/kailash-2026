/**
 * SacredJourneyMap.
 * MapLibre GL real-geography map via mapcn MapArc component.
 * OpenFreeMap positron tile style (no API key required).
 * v4 migration: wires useJourneyState(), resolveOrigin(), mapcn arcs + markers.
 *
 * Anti-AI rule: zero em-dashes, en-dashes, smart quotes, emojis.
 */

import { useState, useEffect, useMemo } from 'react';
import { MapArc, MapMarker, MarkerLabel } from './mapcn/MapArc';
import type { MapArcDatum } from './mapcn/MapArc';
import type { JourneyState } from '../lib/journey-state';
import { resolveOrigin, type OriginId } from '../lib/origin';
import { MapPin, Mountain as MountainIcon } from '@aliimam/icons';

// ---------------------------------------------------------------------------
// Route data
// ---------------------------------------------------------------------------

const STOPS = {
  kathmandu:  { lngLat: [85.3240, 27.7172] as [number, number], name: 'Kathmandu',  altitude: 1380, day: 1,  sacredLabel: 'Pashupatinath'    },
  lhasa:      { lngLat: [91.1000, 29.6500] as [number, number], name: 'Lhasa',      altitude: 3656, day: 3,  sacredLabel: 'Jokhang'           },
  mansarovar: { lngLat: [81.4500, 30.6500] as [number, number], name: 'Mansarovar', altitude: 4570, day: 5,  sacredLabel: 'Mansarovar Snan'   },
  darchen:    { lngLat: [81.3000, 31.0000] as [number, number], name: 'Darchen',    altitude: 4575, day: 7,  sacredLabel: null                },
  dirapuk:    { lngLat: [81.2000, 31.1500] as [number, number], name: 'Dirapuk',    altitude: 4900, day: 7,  sacredLabel: 'Kailash Darshan'   },
  dolmaLa:    { lngLat: [81.3000, 31.2000] as [number, number], name: 'Dolma La',   altitude: 5630, day: 8,  sacredLabel: 'Dolma La Crossing' },
  zuthulphuk: { lngLat: [81.4500, 31.0500] as [number, number], name: 'Zuthulphuk', altitude: 4790, day: 8,  sacredLabel: 'Gauri Kund'        },
} as const;

const ORIGINS = {
  mumbai:    { lngLat: [72.8777, 19.0760] as [number, number], name: 'Mumbai'     },
  uae:       { lngLat: [55.2708, 25.2048] as [number, number], name: 'Dubai'      },
  mauritius: { lngLat: [57.5522, -20.3484] as [number, number], name: 'Port Louis' },
  us:        { lngLat: [-74.0060, 40.7128] as [number, number], name: 'New York'  },
} as const;

// Arc paint config -- cast via unknown to avoid readonly-tuple assignability issues with MapLibre expression types
// MapLibre expression arrays are mutable by the types but we define them as literals --
// annotate as any to avoid readonly-tuple assignability mismatch.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ARC_PAINT: any = {
  'line-color': [
    'match',
    ['get', 'mode'],
    'origin-active', '#b08040',
    'origin',        '#d4b070',
    'flight',        '#212121',
    'drive',         '#212121',
    'parikrama',     '#c0432d',
    'return',        '#8a8a8a',
    '#212121',
  ],
  'line-width': [
    'match',
    ['get', 'mode'],
    'parikrama',     3.5,
    'flight',        2,
    'drive',         2,
    'origin-active', 1.5,
    'origin',        0.8,
    'return',        1,
    1.5,
  ],
  'line-opacity': [
    'match',
    ['get', 'mode'],
    'origin',        0.35,
    'origin-active', 0.85,
    'return',        0.55,
    0.9,
  ],
};

const ARC_LAYOUT = {
  'line-join': 'round' as const,
  'line-cap': 'round' as const,
};

const HOVER_PAINT = {
  'line-color': '#c0432d',
  'line-width': 4,
} as const;

// Base arc definitions (mode resolved dynamically based on detected origin)
type ArcMode = 'origin' | 'origin-active' | 'flight' | 'drive' | 'parikrama' | 'return';

type KailashArc = MapArcDatum & { mode: ArcMode; originId?: OriginId };

const BASE_ARCS: KailashArc[] = [
  { id: 'mumbai-ktm',      from: ORIGINS.mumbai.lngLat,    to: STOPS.kathmandu.lngLat,  mode: 'origin', originId: 'mumbai'    },
  { id: 'uae-ktm',         from: ORIGINS.uae.lngLat,       to: STOPS.kathmandu.lngLat,  mode: 'origin', originId: 'uae'       },
  { id: 'mauritius-ktm',   from: ORIGINS.mauritius.lngLat, to: STOPS.kathmandu.lngLat,  mode: 'origin', originId: 'mauritius' },
  { id: 'us-ktm',          from: ORIGINS.us.lngLat,        to: STOPS.kathmandu.lngLat,  mode: 'origin', originId: 'us'        },
  // Main route
  { id: 'ktm-lhasa',       from: STOPS.kathmandu.lngLat,   to: STOPS.lhasa.lngLat,      mode: 'flight'                        },
  { id: 'lhasa-mansa',     from: STOPS.lhasa.lngLat,       to: STOPS.mansarovar.lngLat, mode: 'flight'                        },
  { id: 'mansa-darchen',   from: STOPS.mansarovar.lngLat,  to: STOPS.darchen.lngLat,    mode: 'drive'                         },
  // Parikrama loop (red hero)
  { id: 'darchen-dirapuk', from: STOPS.darchen.lngLat,     to: STOPS.dirapuk.lngLat,    mode: 'parikrama'                     },
  { id: 'dirapuk-dolma',   from: STOPS.dirapuk.lngLat,     to: STOPS.dolmaLa.lngLat,    mode: 'parikrama'                     },
  { id: 'dolma-zuthul',    from: STOPS.dolmaLa.lngLat,     to: STOPS.zuthulphuk.lngLat, mode: 'parikrama'                     },
  { id: 'zuthul-darchen',  from: STOPS.zuthulphuk.lngLat,  to: STOPS.darchen.lngLat,    mode: 'parikrama'                     },
  // Return (dashed thin)
  { id: 'darchen-mansa-r', from: STOPS.darchen.lngLat,     to: STOPS.mansarovar.lngLat, mode: 'return'                        },
  { id: 'mansa-lhasa-r',   from: STOPS.mansarovar.lngLat,  to: STOPS.lhasa.lngLat,      mode: 'return'                        },
  { id: 'lhasa-ktm-r',     from: STOPS.lhasa.lngLat,       to: STOPS.kathmandu.lngLat,  mode: 'return'                        },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveArcs(origin: OriginId): KailashArc[] {
  return BASE_ARCS.map((arc) => {
    if (arc.originId == null) return arc;
    if (origin === 'all') return { ...arc, mode: 'origin' as ArcMode };
    return {
      ...arc,
      mode: (arc.originId === origin ? 'origin-active' : 'origin') as ArcMode,
    };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  phase: JourneyState;
  onScrollToDay?: (dayId: string) => void;
  onSwitchTab?: (tab: 'itinerary') => void;
}

export function SacredJourneyMap({ phase, onScrollToDay, onSwitchTab }: Props) {
  const [origin, setOrigin] = useState<OriginId>('all');

  // Origin auto-detect on mount
  useEffect(() => {
    setOrigin(resolveOrigin());
  }, []);

  const arcs = useMemo(() => resolveArcs(origin), [origin]);

  function handleStopClick(day: number) {
    if (onSwitchTab) onSwitchTab('itinerary');
    const dayId = `day-${day}`;
    if (onScrollToDay) {
      onScrollToDay(dayId);
    } else {
      const el = document.getElementById(dayId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const currentStopKey =
    phase.phase === 'during' && phase.tripDayIndex
      ? Object.keys(STOPS).find(
          (k) => STOPS[k as keyof typeof STOPS].day <= (phase.tripDayIndex ?? 0)
        )
      : null;

  return (
    <div
      id="sacred-journey-map"
      data-phase={phase.phase}
      className="relative w-full"
      style={{ height: '480px' }}
    >
      {/* Maurten light register overlay: desaturate positron tiles slightly */}
      <div
        className="kailash-map-shell w-full h-full rounded-none overflow-hidden"
        style={{ filter: 'saturate(0.6) brightness(1.02)' }}
      >
        <MapArc
          data={arcs}
          paint={ARC_PAINT}
          layout={ARC_LAYOUT}
          hoverPaint={HOVER_PAINT}
          styleUrl="https://tiles.openfreemap.org/styles/positron"
          initialView={{
            longitude: 55,
            latitude: 22,
            zoom: 2.1,
          }}
          curvature={0.18}
          className="w-full h-full"
        >
          {/* Stop markers */}
          {(Object.entries(STOPS) as [keyof typeof STOPS, typeof STOPS[keyof typeof STOPS]][]).map(
            ([key, stop]) => {
              const isDolmaLa = stop.name === 'Dolma La';
              const isCurrentStop = currentStopKey === key;

              return (
                <MapMarker
                  key={key}
                  lngLat={stop.lngLat}
                  onClick={() => handleStopClick(stop.day)}
                >
                  {/* Marker icon */}
                  <div
                    className="relative cursor-pointer flex items-center justify-center"
                    style={{ width: isDolmaLa ? 20 : 14, height: isDolmaLa ? 20 : 14 }}
                    title={stop.sacredLabel ?? stop.name}
                  >
                    {isDolmaLa ? (
                      <MountainIcon
                        size={16}
                        style={{
                          color: '#c0432d',
                          filter: isCurrentStop ? 'drop-shadow(0 0 3px rgba(192,67,45,0.5))' : undefined,
                        }}
                      />
                    ) : (
                      <MapPin
                        size={12}
                        style={{
                          color: '#212121',
                          filter: isCurrentStop ? 'drop-shadow(0 0 2px rgba(33,33,33,0.4))' : undefined,
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <MarkerLabel position="top">
                    <span
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontSize: '9px',
                        color: isDolmaLa ? '#c0432d' : '#212121',
                        fontWeight: isDolmaLa ? 700 : 500,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        background: 'rgba(255,255,255,0.82)',
                        padding: '1px 3px',
                        borderRadius: 2,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {stop.name}
                    </span>
                  </MarkerLabel>
                </MapMarker>
              );
            }
          )}

          {/* Origin markers (small dots, dimmed unless active) */}
          {(Object.entries(ORIGINS) as [OriginId, typeof ORIGINS[keyof typeof ORIGINS]][]).map(
            ([key, orig]) => {
              const isActive = origin === key || origin === 'all';
              return (
                <MapMarker key={`origin-${key}`} lngLat={orig.lngLat}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#b08040',
                      opacity: isActive ? 0.85 : 0.3,
                      border: '1.5px solid #d4b070',
                    }}
                    title={orig.name}
                  />
                  <MarkerLabel position="bottom">
                    <span
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontSize: '8px',
                        color: '#b08040',
                        opacity: isActive ? 1 : 0.4,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        background: 'rgba(255,255,255,0.75)',
                        padding: '1px 2px',
                        borderRadius: 2,
                      }}
                    >
                      {orig.name}
                    </span>
                  </MarkerLabel>
                </MapMarker>
              );
            }
          )}
        </MapArc>
      </div>

      {/* Attribution caption */}
      <div
        className="absolute bottom-1 left-2 text-[9px] pointer-events-none"
        style={{ color: '#8a8a8a', fontFamily: 'monospace' }}
      >
        Kailash Parikrama 2026
      </div>
    </div>
  );
}
