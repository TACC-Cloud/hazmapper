import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { Layer, LeafletMouseEvent } from 'leaflet';
import { PMTiles } from 'pmtiles';
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
  /** Called with featureId when the vector data is clicked. */
  onSelect: (featureId: number) => void;
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
}) => {
  const map = useMap();
  const layerRef = useRef<ReturnType<typeof leafletLayer> | undefined>(
    undefined
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pmtiles = new PMTiles(url);
        const metadata = (await pmtiles.getMetadata()) as {
          vector_layers?: { id: string }[];
        };
        if (cancelled) return;

        const paintRules = (metadata?.vector_layers ?? []).flatMap((vl) =>
          buildDefaultPaintRules(vl.id)
        );

        const layer = leafletLayer({ url: pmtiles, paintRules });
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
  }, [map, url]);

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
      const hit = Array.from(picked.values()).some((f) => f.length > 0);
      if (hit) {
        // TODO(feature-values): surface the attribute values of the specific
        // geometry that was clicked (the picked protomaps Feature's `props`) —
        // e.g. a popup or details panel showing that point/segment/polygon's
        // properties, rather than only selecting the parent feature.
        onSelect(featureId);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, featureId, onSelect]);

  return null;
};

export default PMTilesLayer;
