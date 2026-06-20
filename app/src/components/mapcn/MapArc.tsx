/**
 * MapArc -- mapcn MapLibre component (manual port from 21st.dev/r/mapcn/mapcn-map-arc).
 * Adapted for kailash-2026 v4: no emojis, no em-dashes, TypeScript strict.
 */

/// <reference types="geojson" />
import MapLibreGL, { type MarkerOptions } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used within a Map component');
  return ctx;
}

const MarkerContext = createContext<{
  marker: MapLibreGL.Marker;
  map: MapLibreGL.Map | null;
} | null>(null);

// ---------------------------------------------------------------------------
// Map container
// ---------------------------------------------------------------------------

type MapViewport = {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
};

type MapStyleOption = string | MapLibreGL.StyleSpecification;

export type MapContainerProps = {
  children?: ReactNode;
  className?: string;
  styleUrl?: string;
  styles?: {
    light?: MapStyleOption;
    dark?: MapStyleOption;
  };
  initialView?: MapViewport;
  viewport?: Partial<MapViewport>;
  onViewportChange?: (v: MapViewport) => void;
  minZoom?: number;
  maxZoom?: number;
  interactive?: boolean;
};

export type MapHandle = MapLibreGL.Map;

export const Map = forwardRef<MapHandle, MapContainerProps>(function Map(
  {
    children,
    className,
    styleUrl,
    styles,
    initialView,
    viewport,
    onViewportChange,
    minZoom,
    maxZoom,
    interactive = true,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);

  const resolvedStyle: MapStyleOption =
    styleUrl ??
    styles?.light ??
    'https://tiles.openfreemap.org/styles/positron';

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: resolvedStyle as string,
      center: initialView
        ? [initialView.longitude, initialView.latitude]
        : [82, 28],
      zoom: initialView?.zoom ?? 3.4,
      bearing: initialView?.bearing ?? 0,
      pitch: initialView?.pitch ?? 0,
      minZoom,
      maxZoom,
      interactive,
    });

    mapRef.current = map;

    map.on('load', () => {
      setIsLoaded(true);
      setMapInstance(map);
    });

    map.on('move', () => {
      if (!onViewportChange) return;
      const c = map.getCenter();
      onViewportChange({
        longitude: c.lng,
        latitude: c.lat,
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setIsLoaded(false);
      setMapInstance(null);
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controlled viewport sync
  const prevViewport = useRef<Partial<MapViewport> | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded || !viewport) return;
    const prev = prevViewport.current;
    const changed =
      !prev ||
      prev.longitude !== viewport.longitude ||
      prev.latitude !== viewport.latitude ||
      prev.zoom !== viewport.zoom;
    if (changed && viewport.longitude != null && viewport.latitude != null) {
      map.easeTo({
        center: [viewport.longitude, viewport.latitude],
        zoom: viewport.zoom,
        bearing: viewport.bearing,
        pitch: viewport.pitch,
        duration: 300,
      });
    }
    prevViewport.current = viewport;
  }, [viewport, isLoaded]);

  useImperativeHandle(ref, () => mapRef.current as MapLibreGL.Map, [isLoaded]);

  return (
    <MapContext.Provider value={{ map: mapInstance, isLoaded }}>
      <div ref={containerRef} className={className ?? 'w-full h-full'} />
      {isLoaded && mapInstance && children}
    </MapContext.Provider>
  );
});

// ---------------------------------------------------------------------------
// MapArc
// ---------------------------------------------------------------------------

export type MapArcDatum = {
  id: string | number;
  from: [number, number];
  to: [number, number];
  mode?: string;
  [key: string]: unknown;
};

export type MapArcEvent<T extends MapArcDatum = MapArcDatum> = {
  arc: T;
  longitude: number;
  latitude: number;
  originalEvent: MapLibreGL.MapMouseEvent;
};

type MapArcLinePaint = NonNullable<MapLibreGL.LineLayerSpecification['paint']>;
type MapArcLineLayout = NonNullable<MapLibreGL.LineLayerSpecification['layout']>;

export type MapArcProps<T extends MapArcDatum = MapArcDatum> = {
  children?: ReactNode;
  data: T[];
  id?: string;
  curvature?: number;
  samples?: number;
  paint?: MapArcLinePaint;
  layout?: MapArcLineLayout;
  hoverPaint?: MapArcLinePaint;
  onClick?: (e: MapArcEvent<T>) => void;
  onHover?: (e: MapArcEvent<T> | null) => void;
  interactive?: boolean;
  beforeId?: string;
  styleUrl?: string;
  initialView?: MapViewport;
  className?: string;
};

const DEFAULT_ARC_PAINT: MapArcLinePaint = {
  'line-color': '#4285F4',
  'line-width': 2,
  'line-opacity': 0.85,
};

const DEFAULT_ARC_LAYOUT: MapArcLineLayout = {
  'line-join': 'round',
  'line-cap': 'round',
};

const ARC_HIT_MIN_WIDTH = 12;
const ARC_HIT_PADDING = 6;
const DEFAULT_ARC_CURVATURE = 0.2;
const DEFAULT_ARC_SAMPLES = 64;

function mergeArcPaint(
  paint: MapArcLinePaint,
  hoverPaint: MapArcLinePaint | undefined
): MapArcLinePaint {
  if (!hoverPaint) return paint;
  const merged: Record<string, unknown> = { ...paint };
  for (const [key, hoverValue] of Object.entries(hoverPaint)) {
    if (hoverValue === undefined) continue;
    const baseValue = merged[key];
    merged[key] =
      baseValue === undefined
        ? hoverValue
        : [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            hoverValue,
            baseValue,
          ];
  }
  return merged as MapArcLinePaint;
}

function buildArcCoordinates(
  from: [number, number],
  to: [number, number],
  curvature: number,
  samples: number
): [number, number][] {
  const [x0, y0] = from;
  const [x2, y2] = to;
  const dx = x2 - x0;
  const dy = y2 - y0;
  const distance = Math.hypot(dx, dy);

  if (distance === 0 || curvature === 0) return [from, to];

  const mx = (x0 + x2) / 2;
  const my = (y0 + y2) / 2;
  const nx = -dy / distance;
  const ny = dx / distance;
  const offset = distance * curvature;
  const cx = mx + nx * offset;
  const cy = my + ny * offset;

  const points: [number, number][] = [];
  const segments = Math.max(2, Math.floor(samples));
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const inv = 1 - t;
    const x = inv * inv * x0 + 2 * inv * t * cx + t * t * x2;
    const y = inv * inv * y0 + 2 * inv * t * cy + t * t * y2;
    points.push([x, y]);
  }
  return points;
}

function MapArcLayer<T extends MapArcDatum = MapArcDatum>({
  data,
  id: propId,
  curvature = DEFAULT_ARC_CURVATURE,
  samples = DEFAULT_ARC_SAMPLES,
  paint,
  layout,
  hoverPaint,
  onClick,
  onHover,
  interactive = true,
  beforeId,
}: Omit<MapArcProps<T>, 'children' | 'styleUrl' | 'initialView' | 'className'>) {
  const { map, isLoaded } = useMap();
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `arc-source-${id}`;
  const layerId = `arc-layer-${id}`;
  const hitLayerId = `arc-hit-layer-${id}`;

  const mergedPaint = useMemo(
    () => mergeArcPaint({ ...DEFAULT_ARC_PAINT, ...paint }, hoverPaint),
    [paint, hoverPaint]
  );
  const mergedLayout = useMemo(
    () => ({ ...DEFAULT_ARC_LAYOUT, ...layout }),
    [layout]
  );

  const hitWidth = useMemo(() => {
    const w = paint?.['line-width'] ?? DEFAULT_ARC_PAINT['line-width'];
    const base = typeof w === 'number' ? w : ARC_HIT_MIN_WIDTH;
    return Math.max(base + ARC_HIT_PADDING, ARC_HIT_MIN_WIDTH);
  }, [paint]);

  const geoJSON = useMemo<GeoJSON.FeatureCollection<GeoJSON.LineString>>(
    () => ({
      type: 'FeatureCollection',
      features: data.map((arc) => {
        const { from, to, ...properties } = arc;
        return {
          type: 'Feature',
          properties,
          geometry: {
            type: 'LineString',
            coordinates: buildArcCoordinates(from, to, curvature, samples),
          },
        };
      }),
    }),
    [data, curvature, samples]
  );

  const latestRef = useRef({ data, onClick, onHover });
  latestRef.current = { data, onClick, onHover };

  useEffect(() => {
    if (!isLoaded || !map) return;

    map.addSource(sourceId, {
      type: 'geojson',
      data: geoJSON,
      promoteId: 'id',
    });

    map.addLayer(
      {
        id: hitLayerId,
        type: 'line',
        source: sourceId,
        layout: DEFAULT_ARC_LAYOUT,
        paint: {
          'line-color': 'rgba(0, 0, 0, 0)',
          'line-width': hitWidth,
          'line-opacity': 1,
        },
      },
      beforeId
    );

    map.addLayer(
      {
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: mergedLayout,
        paint: mergedPaint,
      },
      beforeId
    );

    return () => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getLayer(hitLayerId)) map.removeLayer(hitLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore cleanup errors
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map]);

  useEffect(() => {
    if (!isLoaded || !map) return;
    const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined;
    source?.setData(geoJSON);
  }, [isLoaded, map, geoJSON, sourceId]);

  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return;
    for (const [key, value] of Object.entries(mergedPaint)) {
      map.setPaintProperty(layerId, key as keyof MapArcLinePaint, value as never);
    }
    for (const [key, value] of Object.entries(mergedLayout)) {
      map.setLayoutProperty(layerId, key as keyof MapArcLineLayout, value as never);
    }
    if (map.getLayer(hitLayerId)) {
      map.setPaintProperty(hitLayerId, 'line-width', hitWidth);
    }
  }, [isLoaded, map, layerId, hitLayerId, mergedPaint, mergedLayout, hitWidth]);

  useEffect(() => {
    if (!isLoaded || !map || !interactive) return;

    let hoveredId: string | number | null = null;

    const setHover = (next: string | number | null) => {
      if (next === hoveredId) return;
      const sourceExists = !!map.getSource(sourceId);
      if (hoveredId != null && sourceExists) {
        map.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
      }
      hoveredId = next;
      if (next != null && sourceExists) {
        map.setFeatureState({ source: sourceId, id: next }, { hover: true });
      }
    };

    const findArc = (featureId: string | number | undefined) =>
      featureId == null
        ? undefined
        : latestRef.current.data.find((arc) => String(arc.id) === String(featureId));

    const handleMouseMove = (e: MapLibreGL.MapLayerMouseEvent) => {
      const featureId = e.features?.[0]?.id as string | number | undefined;
      if (featureId == null || featureId === hoveredId) return;
      setHover(featureId);
      map.getCanvas().style.cursor = 'pointer';
      const arc = findArc(featureId);
      if (arc) {
        latestRef.current.onHover?.({
          arc: arc as T,
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
          originalEvent: e,
        });
      }
    };

    const handleMouseLeave = () => {
      setHover(null);
      map.getCanvas().style.cursor = '';
      latestRef.current.onHover?.(null);
    };

    const handleClick = (e: MapLibreGL.MapLayerMouseEvent) => {
      const arc = findArc(e.features?.[0]?.id as string | number | undefined);
      if (!arc) return;
      latestRef.current.onClick?.({
        arc: arc as T,
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        originalEvent: e,
      });
    };

    map.on('mousemove', hitLayerId, handleMouseMove);
    map.on('mouseleave', hitLayerId, handleMouseLeave);
    map.on('click', hitLayerId, handleClick);

    return () => {
      map.off('mousemove', hitLayerId, handleMouseMove);
      map.off('mouseleave', hitLayerId, handleMouseLeave);
      map.off('click', hitLayerId, handleClick);
      setHover(null);
      map.getCanvas().style.cursor = '';
    };
  }, [isLoaded, map, hitLayerId, sourceId, interactive]);

  return null;
}

/**
 * MapArc: top-level export that wraps Map container + arc layer.
 * Also accepts children (markers etc.) rendered inside the map context.
 */
export function MapArc<T extends MapArcDatum = MapArcDatum>({
  children,
  styleUrl,
  initialView,
  className,
  ...arcProps
}: MapArcProps<T>) {
  return (
    <Map
      styleUrl={styleUrl}
      initialView={initialView}
      className={className ?? 'w-full h-full'}
    >
      <MapArcLayer {...arcProps} />
      {children}
    </Map>
  );
}

// ---------------------------------------------------------------------------
// MapMarker
// ---------------------------------------------------------------------------

export type MapMarkerProps = {
  lngLat: [number, number];
  children?: ReactNode;
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
} & Omit<MarkerOptions, 'element'>;

export function MapMarker({
  lngLat,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();
  const containerRef = useRef<HTMLDivElement>(document.createElement('div'));

  const callbacksRef = useRef({ onClick, onMouseEnter, onMouseLeave });
  callbacksRef.current = { onClick, onMouseEnter, onMouseLeave };

  const marker = useMemo(() => {
    const el = containerRef.current;
    const m = new MapLibreGL.Marker({
      ...markerOptions,
      element: el,
    }).setLngLat(lngLat);

    const handleClick = (e: MouseEvent) => callbacksRef.current.onClick?.(e);
    const handleEnter = (e: MouseEvent) => callbacksRef.current.onMouseEnter?.(e);
    const handleLeave = (e: MouseEvent) => callbacksRef.current.onMouseLeave?.(e);

    el.addEventListener('click', handleClick);
    el.addEventListener('mouseenter', handleEnter);
    el.addEventListener('mouseleave', handleLeave);

    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, marker]);

  // Update position if lngLat changes
  if (
    marker.getLngLat().lng !== lngLat[0] ||
    marker.getLngLat().lat !== lngLat[1]
  ) {
    marker.setLngLat(lngLat);
  }

  return createPortal(
    <MarkerContext.Provider value={{ marker, map }}>
      <div className="relative flex items-center justify-center">
        {children}
      </div>
    </MarkerContext.Provider>,
    containerRef.current
  );
}

// ---------------------------------------------------------------------------
// MarkerLabel
// ---------------------------------------------------------------------------

export type MarkerLabelProps = {
  children: ReactNode;
  className?: string;
  position?: 'top' | 'bottom';
  offset?: [number, number];
};

export function MarkerLabel({
  children,
  className,
  position = 'top',
}: MarkerLabelProps) {
  const positionClasses = {
    top: 'bottom-full mb-1',
    bottom: 'top-full mt-1',
  };

  return (
    <div
      className={[
        'absolute left-1/2 -translate-x-1/2 whitespace-nowrap',
        'text-[10px] font-medium',
        positionClasses[position],
        className ?? '',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

// Re-export useMap for external use
export { useMap };
