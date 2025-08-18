import React, { useEffect, useMemo, useState } from 'react';
import { EsriMetadata } from '@hazmapper/types/esri';
import { parseEsriMetadata } from '@hazmapper/utils/esri/esriTileMetaData';
import { TiledMapLayer } from 'react-esri-leaflet';

type Props = {
  url: string;
  opacity?: number;
  zIndex?: number;
  maxZoom: number;
  autoFitBounds?: boolean;
};

/**
 * Esri tiled map layer with automatic metadata handling.
 *
 * Fetches service metadata to set proper zoom limits and bounds:
 *  - Sets `maxNativeZoom` so we scale the last available zoom level that is available.
 *  - Sets 'bounds' so tiles oustide of area aren't needeless requested
 */
export default function EsriTiledMapLayer({
  url,
  opacity,
  zIndex,
  maxZoom,
}: Props) {
  const [metadata, setMetadata] = useState<EsriMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch metadata
  useEffect(() => {
    let cancelled = false;
    const u = `${url}${url.includes('?') ? '&' : '?'}f=json`;

    (async () => {
      try {
        const res = await fetch(u);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as EsriMetadata;
        if (!cancelled) setMetadata(data);
      } catch (e: any) {
        console.warn(
          `[EsriTiledMapLayer] Could not load metadata for ${url}:`,
          e
        );
        if (!cancelled)
          setError(e?.message || 'Failed to fetch ArcGIS metadata');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Extract zoom levels and bounds from metadata
  const derived = useMemo(() => {
    if (!metadata)
      return {
        zoomLevels: {},
        bounds: undefined as L.LatLngBounds | undefined,
      };

    const { zoomLevels, bounds } = parseEsriMetadata(metadata, url);

    return { zoomLevels, bounds };
  }, [metadata, url]);

  if (!metadata && !error) return null;

  return (
    <TiledMapLayer
      url={url}
      opacity={opacity}
      zIndex={zIndex}
      maxZoom={maxZoom}
      maxNativeZoom={derived.zoomLevels.maxNativeZoom ?? maxZoom}
      bounds={derived.bounds}
    />
  );
}
