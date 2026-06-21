/**
 * SacredJourneyMap.
 * dotted-map SVG world map via aliimam/WorldMap (shailendrakumar19999 port).
 * Replaces the previous mapcn MapLibre / OpenFreeMap implementation.
 * v4 migration: lighter bundle, no tile loading, framer-motion arcs.
 *
 * Anti-AI rule: zero em-dashes, en-dashes, smart quotes, emojis.
 */

import { WorldMap, type MapDot, type Stage } from './aliimam/WorldMap';
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

// Three zoom levels (aspect held at 2.5 for all so container height stays
// stable across tweens):
//   WIDE      · lng -90..130, lat -32..56     · all 4 origins visible
//   MED       · lng 67..105, lat 23..38       · KTM, Lhasa, Mansarovar, Darchen all spaced out
//   PARIKRAMA · lng 78.75..85.5, lat 28.7..31.4 · zoom into Darchen loop, parikrama cluster fills frame
const VB_WIDE      = { x: 200, y: 75,  width: 490, height: 196 };
const VB_MED       = { x: 549, y: 115, width: 85,  height: 34  };
const VB_PARIKRAMA = { x: 575, y: 130, width: 15,  height: 6   };

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
// Narrative stages · matches the actual trip progression
// ---------------------------------------------------------------------------
//
// Arc indices reference the DOTS array above:
//   0..3  : origins (Mumbai, Dubai, Port Louis, NY) -> Kathmandu
//   4     : Kathmandu -> Lhasa
//   5     : Lhasa -> Mansarovar
//   6     : Mansarovar -> Darchen
//   7..10 : parikrama (Darchen -> Dirapuk -> Dolma La -> Zuthulphuk -> Darchen)
//   11    : return Lhasa -> Kathmandu
//
// Each stage holds for holdMs (during which its arcs draw + pause). Arcs
// accumulate across stages until cycle reset (WorldMap handles this).

const STAGES: Stage[] = [
  // 1. Wide · 4 origin arcs converge on Kathmandu
  { viewBox: VB_WIDE,      arcIndices: [0, 1, 2, 3], holdMs: 4500 },
  // 2. MED zoom · KTM -> Lhasa
  { viewBox: VB_MED,       arcIndices: [4],          tweenMs: 1800, holdMs: 2500 },
  // 3. MED · Lhasa -> Mansarovar
  { viewBox: VB_MED,       arcIndices: [5],          holdMs: 2500 },
  // 4. MED · Mansarovar -> Darchen (parikrama gateway)
  { viewBox: VB_MED,       arcIndices: [6],          holdMs: 2200 },
  // 5. PARIKRAMA zoom · Darchen -> Dirapuk (one arc per stage so the loop is followable)
  { viewBox: VB_PARIKRAMA, arcIndices: [7],          tweenMs: 1500, holdMs: 1800 },
  // 6. PARIKRAMA · Dirapuk -> Dolma La (red, high pass)
  { viewBox: VB_PARIKRAMA, arcIndices: [8],          holdMs: 1800 },
  // 7. PARIKRAMA · Dolma La -> Zuthulphuk (red, descent)
  { viewBox: VB_PARIKRAMA, arcIndices: [9],          holdMs: 1800 },
  // 8. PARIKRAMA · Zuthulphuk -> Darchen (loop closes)
  { viewBox: VB_PARIKRAMA, arcIndices: [10],         holdMs: 1800 },
  // 9. MED · Return Lhasa -> Kathmandu
  { viewBox: VB_MED,       arcIndices: [11],         tweenMs: 1500, holdMs: 2500 },
  // 10. WIDE · final pause before loop
  { viewBox: VB_WIDE,      arcIndices: [],           tweenMs: 1800, holdMs: 2500 },
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
          stages={STAGES}
          arcDrawMs={1800}
        />
      </div>
    </section>
  );
}
