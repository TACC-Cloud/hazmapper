import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { Layer } from 'leaflet';
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
}

/**
 * Renders a PMTiles vector asset as a Leaflet layer via protomaps-leaflet.
 *
 * The vector-tile layer name(s) are read from the PMTiles metadata (tippecanoe
 * writes `vector_layers`), and each is drawn with a default style.
 */
const PMTilesLayer: React.FC<PMTilesLayerProps> = ({ url }) => {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;
    let layer: Layer | undefined;

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

        layer = leafletLayer({ url: pmtiles, paintRules }) as unknown as Layer;
        layer.addTo(map);
      } catch (e) {
        console.warn(`[PMTilesLayer] Could not load PMTiles ${url}:`, e);
      }
    })();

    return () => {
      cancelled = true;
      if (layer) {
        map.removeLayer(layer);
      }
    };
  }, [map, url]);

  return null;
};

export default PMTilesLayer;
