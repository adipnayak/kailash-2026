/**
 * day-routes.ts -- per-day start/end coordinates for the Kailash 2026 itinerary.
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

interface Coord {
  lat: number;
  lng: number;
  label?: string;
}

const COORDS: Record<string, Coord> = {
  bom:        { lat: 19.0760, lng: 72.8777, label: 'Mumbai'      },
  ktm:        { lat: 27.7172, lng: 85.3240, label: 'Kathmandu'   },
  lhasa:      { lat: 29.6500, lng: 91.1000, label: 'Lhasa'       },
  ali:        { lat: 32.5000, lng: 80.0500, label: 'Ali'         },
  mansarovar: { lat: 30.6500, lng: 81.4500, label: 'Mansarovar'  },
  darchen:    { lat: 31.0000, lng: 81.3000, label: 'Darchen'     },
  dirapuk:    { lat: 31.1500, lng: 81.2000, label: 'Dirapuk'     },
  dolmaLa:    { lat: 31.2000, lng: 81.3000, label: 'Dolma La'    },
  zuthulphuk: { lat: 31.0500, lng: 81.4500, label: 'Zuthulphuk'  },
};

interface DayRoute {
  day: number;
  start: string;
  end?: string;
}

const DAY_ROUTES: DayRoute[] = [
  { day: 1,  start: 'bom',        end: 'ktm'        },
  { day: 2,  start: 'ktm'                            },
  { day: 3,  start: 'ktm',        end: 'lhasa'      },
  { day: 4,  start: 'lhasa'                          },
  { day: 5,  start: 'lhasa',      end: 'mansarovar' },
  { day: 6,  start: 'mansarovar'                     },
  { day: 7,  start: 'mansarovar', end: 'dirapuk'    },
  { day: 8,  start: 'dirapuk',    end: 'zuthulphuk' },
  { day: 9,  start: 'zuthulphuk', end: 'darchen'    },
  { day: 10, start: 'darchen',    end: 'lhasa'      },
  { day: 11, start: 'lhasa',      end: 'ktm'        },
  { day: 12, start: 'ktm'                            },
  { day: 13, start: 'ktm',        end: 'bom'        },
];

export interface ResolvedDayRoute {
  start: Coord;
  end?: Coord;
}

/**
 * Returns start/end coords for a 0-based day index (0 = Day 1).
 * Returns null for out-of-range indices.
 */
export function getDayRoute(dayIndex: number): ResolvedDayRoute | null {
  const r = DAY_ROUTES[dayIndex];
  if (!r) return null;
  return {
    start: COORDS[r.start],
    end: r.end ? COORDS[r.end] : undefined,
  };
}
