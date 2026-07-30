import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { Layer, LeafletMouseEvent } from 'leaflet';
import { PMTiles, FetchSource } from 'pmtiles';
import {
  leafletLayer,
  PolygonSymbolizer,
  LineSymbolizer,
  CircleSymbolizer,
  PaintRule,
} from 'protomaps-leaflet';

// Default rendering color for uploaded vector data.
// TODO(styling): replace this fixed default blue with per-feature styling —
// MapLibre-compatible styles persisted in Feature.styles (plus optional QML
// extraction for GPKG uploads). See the PMTiles ingest plan.
const DEFAULT_VECTOR_COLOR = '#3388ff';

// Pixel radius used when hit-testing a click against the vector data.
const PICK_BRUSH_SIZE = 8;

// Minimum gap between hover hit-tests, so fast mouse moves don't over-query.
const HOVER_SAMPLE_MS = 50;

/**
 * Default paint rules (polygon fill, line, and point circle) in the default
 * blue for a single vector-tile layer.
 */
const buildDefaultPaintRules = (dataLayer: string): PaintRule[] => [
  {
    dataLayer,
    symbolizer: new PolygonSymbolizer({
      fill: DEFAULT_VECTOR_COLOR,
      opacity: 0.2,
      stroke: DEFAULT_VECTOR_COLOR,
      width: 1,
    }),
  },
  {
    dataLayer,
    symbolizer: new LineSymbolizer({
      color: DEFAULT_VECTOR_COLOR,
      width: 2,
    }),
  },
  {
    dataLayer,
    symbolizer: new CircleSymbolizer({
      radius: 4,
      fill: DEFAULT_VECTOR_COLOR,
    }),
  },
];

interface PMTilesLayerProps {
  /** Full URL to the .pmtiles asset (e.g. `${geoapiUrl}/assets/${asset.path}`). */
  url: string;
  /** id of the hazmapper Feature this PMTiles asset belongs to. */
  featureId: number;
  /**
   * Called when the vector data is clicked, with the parent featureId and the
   * attribute values (`props`) of the specific clicked geometry.
   */
  onSelect: (featureId: number, properties: Record<string, unknown>) => void;
  /** Tapis token used to authenticate the range requests to /assets. */
  authToken?: string | null;
}

/**
 * Renders a PMTiles vector asset as a Leaflet layer via protomaps-leaflet.
 *
 * The vector-tile layer name(s) are read from the PMTiles metadata (tippecanoe
 * writes `vector_layers`), and each is drawn with a default style. Clicking on
 * the rendered vector data selects the parent feature.
 */
const PMTilesLayer: React.FC<PMTilesLayerProps> = ({
  url,
  featureId,
  onSelect,
  authToken,
}) => {
  const map = useMap();
  const layerRef = useRef<ReturnType<typeof leafletLayer> | undefined>(
    undefined
  );
  const hoveringRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // /assets is auth-gated, so attach the Tapis token to the range
        // requests (a plain fetch would be rejected with a 401).
        const source = authToken
          ? new FetchSource(url, new Headers({ 'X-Tapis-Token': authToken }))
          : url;
        const pmtiles = new PMTiles(source);
        const metadata = (await pmtiles.getMetadata()) as {
          vector_layers?: { id: string; maxzoom?: number }[];
        };
        if (cancelled) return;

        const vectorLayers = metadata?.vector_layers ?? [];
        const paintRules = vectorLayers.flatMap((vl) =>
          buildDefaultPaintRules(vl.id)
        );

        // The archive only contains tiles up to its own max zoom. Tell
        // protomaps-leaflet so it overzooms (scales the deepest tile) rather
        // than requesting non-existent deeper tiles — otherwise an extent that
        // fit-bounds past the data's max zoom renders nothing. (Without this
        // the library defaults maxDataZoom to 15.) Note maxzoom can legitimately
        // be 0 (e.g. globally-sparse points), so guard on `undefined`, not
        // truthiness.
        const maxzooms = vectorLayers
          .map((vl) => vl.maxzoom)
          .filter((z): z is number => typeof z === 'number');
        const maxDataZoom = maxzooms.length ? Math.max(...maxzooms) : undefined;

        const layer = leafletLayer({
          url: pmtiles,
          paintRules,
          ...(maxDataZoom !== undefined ? { maxDataZoom } : {}),
        });
        layerRef.current = layer;
        (layer as unknown as Layer).addTo(map);
      } catch (e) {
        console.warn(`[PMTilesLayer] Could not load PMTiles ${url}:`, e);
      }
    })();

    return () => {
      cancelled = true;
      const layer = layerRef.current;
      if (layer) {
        map.removeLayer(layer as unknown as Layer);
        layerRef.current = undefined;
      }
    };
  }, [map, url, authToken]);

  // Select the parent feature when its rendered vector data is clicked.
  useEffect(() => {
    const handleClick = (e: LeafletMouseEvent) => {
      const layer = layerRef.current;
      if (!layer) return;

      const picked = layer.queryTileFeaturesDebug(
        e.latlng.lng,
        e.latlng.lat,
        PICK_BRUSH_SIZE
      );
      // Find the first picked geometry across all vector layers; its `props`
      // are the attribute values of the specific point/segment/polygon clicked.
      const firstHit = Array.from(picked.values())
        .flat()
        .find((f) => f.feature);
      if (firstHit) {
        // TODO(highlight): visually highlight the clicked geometry here (a
        // filtered PaintRule + rerenderTile). Blocked on a stable per-geometry
        // id (see SelectedVectorFeatureContext).
        onSelect(featureId, firstHit.feature.props as Record<string, unknown>);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, featureId, onSelect]);

  // Show the pointer cursor while hovering rendered vector data. protomaps-leaflet
  // layers aren't Leaflet "interactive" layers, so Leaflet's built-in cursor swap
  // never fires.  Se we are doing a hit-test on move and set the cursor ourselves.
  useEffect(() => {
    let lastRun = 0;
    const handleMove = (e: LeafletMouseEvent) => {
      const layer = layerRef.current;
      if (!layer) return;
      // hit-testing every move is wasteful; sample at most every HOVER_SAMPLE_MS
      const now = e.originalEvent.timeStamp;
      if (now - lastRun < HOVER_SAMPLE_MS) return;
      lastRun = now;

      const hit = Array.from(
        layer
          .queryTileFeaturesDebug(e.latlng.lng, e.latlng.lat, PICK_BRUSH_SIZE)
          .values()
      )
        .flat()
        .some((f) => f.feature);

      if (hit) {
        map.getContainer().style.cursor = 'pointer';
        hoveringRef.current = true;
      } else if (hoveringRef.current) {
        map.getContainer().style.cursor = '';
        hoveringRef.current = false;
      }
    };

    map.on('mousemove', handleMove);
    return () => {
      map.off('mousemove', handleMove);
      if (hoveringRef.current) {
        map.getContainer().style.cursor = '';
        hoveringRef.current = false;
      }
    };
  }, [map]);

  return null;
};

export default PMTilesLayer;
