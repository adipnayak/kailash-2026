/**
 * ItineraryDayMap. Real cartographic per-day map (Leaflet + CartoDB).
 *
 * Renders every named trip stop as a small dot and the current day's
 * route as a thick highlighted line so the user sees the actual
 * geography (start point, end point, what gets traversed). Replaces the
 * abstract DayMiniMap dotted-map representation.
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

export interface MapPoint {
  lat: number;
  lng: number;
  label?: string;
}

interface ItineraryDayMapProps {
  start: MapPoint;
  end?: MapPoint;
  /** All other trip stops to dot in the background. */
  contextStops?: MapPoint[];
  /** Highlight colour for this day's route (CSS color string). */
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

export function ItineraryDayMap({
  start,
  end,
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
      maxZoom: 10,
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

    // Today's start dot
    L.circleMarker([start.lat, start.lng], {
      radius: 5,
      fillColor: accent,
      color: bgColor,
      weight: 2,
      fillOpacity: 1,
    }).addTo(map);

    // If a destination exists, draw the route line + end dot
    if (end) {
      L.polyline(
        [
          [start.lat, start.lng],
          [end.lat, end.lng],
        ],
        { color: accent, weight: 3, opacity: 0.95 },
      ).addTo(map);
      L.circleMarker([end.lat, end.lng], {
        radius: 5,
        fillColor: accent,
        color: bgColor,
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);
      const sLat = Math.min(start.lat, end.lat);
      const nLat = Math.max(start.lat, end.lat);
      const wLng = Math.min(start.lng, end.lng);
      const eLng = Math.max(start.lng, end.lng);
      map.fitBounds(
        [
          [sLat, wLng],
          [nLat, eLng],
        ],
        { padding: [24, 24], maxZoom: 9 },
      );
    } else {
      map.setView([start.lat, start.lng], 7);
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
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
    };
  }, [start, end, contextStops, arcColor]);

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
