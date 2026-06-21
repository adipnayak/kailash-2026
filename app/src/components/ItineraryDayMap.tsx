/**
 * ItineraryDayMap. Real cartographic per-day map (Leaflet + CartoDB).
 *
 * Renders the day's route with mode-aware styling:
 *   drive / walk  -> solid line snapped to real road geometry via OSRM
 *                    (https://router.project-osrm.org). Falls back to a
 *                    straight line when OSRM has no data (e.g. very
 *                    remote Tibet trails).
 *   flight        -> dashed straight line ('4 6' dash array)
 *   trek          -> dotted dashed line ('1 5' dash array)
 *
 * Theme-aware: swaps Positron (light) / Dark Matter (dark) tiles when
 * the document's `.dark` class changes. CartoDB tile servers work
 * globally including mainland China (CDN-distributed).
 *
 * Interactivity disabled (no drag / zoom / scroll) -- this is a
 * thumbnail anchored to each day, not an explorable map.
 *
 * Anti-AI: 0 em-dashes, 0 en-dashes, 0 smart quotes, 0 emojis.
 */

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { TransportMode } from '../lib/day-stops';
import { getRoadGeometry } from '../lib/road-routing';

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
  /** Mode used to reach the NEXT point. Last point's value is ignored. */
  modeNext?: TransportMode;
}

interface ItineraryDayMapProps {
  start: MapPoint;
  end?: MapPoint;
  waypoints?: MapPoint[];
  contextStops?: MapPoint[];
  arcColor?: string;
  height?: number;
}

const LIGHT_TILES =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const DARK_TILES =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function tileUrlForCurrentTheme(): string {
  if (typeof document === 'undefined') return LIGHT_TILES;
  return document.documentElement.classList.contains('dark') ? DARK_TILES : LIGHT_TILES;
}

function getCssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function dashForMode(mode?: TransportMode): string | undefined {
  if (mode === 'flight') return '4 6';
  if (mode === 'trek') return '1 5';
  return undefined; // drive / walk -> solid
}

export function ItineraryDayMap({
  start,
  end,
  waypoints,
  contextStops = [],
  arcColor,
  height = 160,
}: ItineraryDayMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    tileRef.current = L.tileLayer(tileUrlForCurrentTheme(), {
      maxZoom: 18,
      minZoom: 2,
      crossOrigin: true,
    }).addTo(map);

    // Background dots for all other trip stops
    const mutedDot = getCssVar('--muted-foreground', '#888');
    contextStops.forEach((p) => {
      L.circleMarker([p.lat, p.lng], {
        radius: 2.5,
        fillColor: mutedDot,
        color: mutedDot,
        weight: 0,
        fillOpacity: 0.55,
      }).addTo(map);
    });

    const accent = arcColor ?? getCssVar('--sacred', '#a87b3a');
    const bgColor = getCssVar('--background', '#fff');

    // Build an ordered list of points to render. Waypoints override
    // start/end when provided.
    const points: MapPoint[] = waypoints?.length
      ? waypoints
      : end
      ? [start, end]
      : [start];

    // Drop one polyline per leg with mode-appropriate dash. Drive/walk
    // legs kick off an async OSRM fetch; when the geometry resolves we
    // replace the straight line with the real road polyline.
    const layers: L.Polyline[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const mode = a.modeNext;
      const dash = dashForMode(mode);
      const line = L.polyline(
        [
          [a.lat, a.lng],
          [b.lat, b.lng],
        ],
        {
          color: accent,
          weight: 3,
          opacity: 0.95,
          dashArray: dash,
        },
      ).addTo(map);
      layers.push(line);

      if (mode === 'drive' || mode === 'walk') {
        getRoadGeometry({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng }).then(
          (coords) => {
            if (!coords || !mapRef.current) return;
            line.setLatLngs(coords);
          },
        );
      }
    }

    // Dots
    points.forEach((p) => {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 5,
        fillColor: accent,
        color: bgColor,
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);
      if (p.label) marker.bindTooltip(p.label, { direction: 'top', offset: [0, -6] });
    });

    if (points.length >= 2) {
      const lats = points.map((p) => p.lat);
      const lngs = points.map((p) => p.lng);
      map.fitBounds(
        [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ],
        { padding: [16, 16], maxZoom: 14 },
      );
    } else {
      map.setView([start.lat, start.lng], 9);
    }

    mapRef.current = map;

    // Swap tiles when theme toggles
    const observer = new MutationObserver(() => {
      const tl = tileRef.current;
      if (!tl) return;
      tl.setUrl(tileUrlForCurrentTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      layers.forEach((l) => l.remove());
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
    };
  }, [start, end, waypoints, contextStops, arcColor]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height }}
      className="overflow-hidden border border-border"
      aria-label={
        end
          ? 'Map: ' + (start.label ?? 'start') + ' to ' + (end.label ?? 'end')
          : 'Map at ' + (start.label ?? 'location')
      }
    />
  );
}
