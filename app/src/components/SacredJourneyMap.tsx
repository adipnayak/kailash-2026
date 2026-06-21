/**
 * SacredJourneyMap.
 * dotted-map SVG world map via aliimam/WorldMap (shailendrakumar19999 port).
 * Replaces the previous mapcn MapLibre / OpenFreeMap implementation.
 * v4 migration: lighter bundle, no tile loading, framer-motion arcs.
 *
 * Anti-AI rule: zero em-dashes, en-dashes, smart quotes, emojis.
 */

import { WorldMap, type MapDot, type ViewBoxKeyframe } from './aliimam/WorldMap';
import type { JourneyState } from '../lib/journey-state';

// ---------------------------------------------------------------------------
// Route data
// ---------------------------------------------------------------------------

const ORIGINS = {
  mumbai:    { lat: 19.0760, lng: 72.8777, label: 'Mumbai'     },
  uae:       { lat: 25.2048, lng: 55.2708, label: 'Dubai'      },
  mauritius: { lat: -20.3484, lng: 57.5522, label: 'Port Louis' },
  us:        { lat: 40.7128, lng: -74.0060, label: 'New York'  },
} as const;

const STOPS = {
  kathmandu:  { lat: 27.7172, lng: 85.3240, label: 'Kathmandu',  day: 1  },
  lhasa:      { lat: 29.6500, lng: 91.1000, label: 'Lhasa',      day: 3  },
  mansarovar: { lat: 30.6500, lng: 81.4500, label: 'Mansarovar', day: 5  },
  darchen:    { lat: 31.0000, lng: 81.3000, label: 'Darchen',    day: 7  },
  dirapuk:    { lat: 31.1500, lng: 81.2000, label: 'Dirapuk',    day: 7  },
  dolmaLa:    { lat: 31.2000, lng: 81.3000, label: 'Dolma La',   day: 8  },
  zuthulphuk: { lat: 31.0500, lng: 81.4500, label: 'Zuthulphuk', day: 8  },
} as const;

// Sacred ochre for origin convergence arcs
const ORIGIN_COLOR = 'var(--sacred)';
// Ink for onward route
const ROUTE_COLOR = 'var(--foreground)';
// Red for Dolma La segment (high pass)
const DOLMA_COLOR = 'var(--destructive)';
// Muted gray for return
const RETURN_COLOR = 'oklch(0.556 0 0)';

// ---------------------------------------------------------------------------
// Zoom cycle
// ---------------------------------------------------------------------------
//
// Base 800x400 world projection: x=(lng+180)*800/360, y=(90-lat)*400/180.
// Aspect held at 2.5 across both frames so container height stays stable
// during the tween.
//
// WIDE  · lng -90..130, lat -32..56. All 4 origins visible (NY -74, Dubai,
//         Mumbai, Mauritius -20) plus the Tibet route.
// TIGHT · lng 79..104, lat 25..35. Parikrama + Kathmandu + Lhasa only;
//         Mumbai/Dubai/Mauritius/NY clipped out.

const ZOOM_KEYFRAMES: ViewBoxKeyframe[] = [
  { viewBox: { x: 200, y: 75, width: 490, height: 196 }, holdMs: 3500, tweenMs: 1800 },
  { viewBox: { x: 575, y: 122, width: 55, height: 22 },   holdMs: 4000, tweenMs: 2200 },
];

const DOTS: MapDot[] = [
  // 4 origin arcs converging on Kathmandu
  { start: ORIGINS.mumbai,    end: STOPS.kathmandu, color: ORIGIN_COLOR },
  { start: ORIGINS.uae,       end: STOPS.kathmandu, color: ORIGIN_COLOR },
  { start: ORIGINS.mauritius, end: STOPS.kathmandu, color: ORIGIN_COLOR },
  { start: ORIGINS.us,        end: STOPS.kathmandu, color: ORIGIN_COLOR },
  // Forward route
  { start: STOPS.kathmandu,  end: STOPS.lhasa,       color: ROUTE_COLOR  },
  { start: STOPS.lhasa,      end: STOPS.mansarovar,  color: ROUTE_COLOR  },
  { start: STOPS.mansarovar, end: STOPS.darchen,     color: ROUTE_COLOR  },
  // Parikrama loop
  { start: STOPS.darchen,    end: STOPS.dirapuk,     color: ROUTE_COLOR  },
  { start: STOPS.dirapuk,    end: STOPS.dolmaLa,     color: DOLMA_COLOR  },
  { start: STOPS.dolmaLa,    end: STOPS.zuthulphuk,  color: DOLMA_COLOR  },
  { start: STOPS.zuthulphuk, end: STOPS.darchen,     color: ROUTE_COLOR  },
  // Return
  { start: STOPS.lhasa,      end: STOPS.kathmandu,   color: RETURN_COLOR },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  phase: JourneyState;
  onScrollToDay?: (dayId: string) => void;
  onSwitchTab?: (tab: 'itinerary') => void;
}

// Props kept for App-level compat. Phase / scroll / tab handlers are accepted
// but not wired to the dotted-map overview (no interactive geography layer).
// Deep-dive navigation lives in the Itinerary tab day cards.
export function SacredJourneyMap({ phase: _phase, onScrollToDay: _onScrollToDay, onSwitchTab: _onSwitchTab }: Props) {
  return (
    <section
      data-section="sacred-journey-map"
      className="border-b border-border bg-background px-4 py-8 md:px-6 md:py-12"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 md:mb-8">
          <h2 className="font-sans text-2xl md:text-3xl font-medium text-foreground">
            Sacred Journey Map
          </h2>
          <p className="mt-2 font-sans text-sm md:text-base text-muted-foreground">
            23 yatris converging from 4 origins: Mumbai, Dubai, Port Louis, New York -- onward to Kathmandu, Lhasa, Mansarovar, Kailash.
          </p>
        </header>
        <WorldMap
          dots={DOTS}
          lineColor={ORIGIN_COLOR}
          dotColor="oklch(0.556 0 0 / 0.25)"
          showLabels
          animationDuration={2}
          loop
          viewBoxKeyframes={ZOOM_KEYFRAMES}
        />
      </div>
    </section>
  );
}
