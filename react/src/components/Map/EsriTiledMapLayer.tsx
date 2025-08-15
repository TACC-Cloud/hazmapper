import React, { useEffect, useMemo, useState } from 'react';
import { useMap } from 'react-leaflet';
import { TiledMapLayer } from 'react-esri-leaflet';
import { EsriMetadata } from '@hazmapper/types/esri';
import { safeConvertExtentToLatLng } from '@hazmapper/utils/esri_extent_project';

type Props = {
  url: string;
  opacity?: number;
  zIndex?: number;
  autoFitBounds?: boolean;
};

/**
 * Esri tiled map layer with automatic metadata handling.
 *
 * Fetches service metadata to set proper zoom limits and auto-fit bounds.
 *
 */
export default function EsriTiledMapLayer({
  url,
  opacity,
  zIndex,
  autoFitBounds = true,
}: Props) {
  const map = useMap();
  const [metadata, setMetadata] = useState<EsriMetadata | null>(null);

  // Fetch metadata (to extract zoom levels and extent)
  useEffect(() => {
    let cancelled = false;
    const u = `${url}${url.includes('?') ? '&' : '?'}f=json`;

    (async () => {
      try {
        const res = await fetch(u);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as EsriMetadata;
        if (!cancelled) setMetadata(data);
      } catch (e) {
        console.warn(
          `[EsriTiledMapLayer] Could not load metadata for ${url}:`,
          e
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Extract zoom levels - tiled services should have minLOD/maxLOD
  const nativeZooms = useMemo(() => {
    // Don't process until metadata is loaded
    if (!metadata) {
      return {};
    }

    // For tiled services, prefer maxLOD (actual tile availability)
    const serviceMinLOD = metadata?.minLOD;
    const serviceMaxLOD = metadata?.maxLOD;

    if (
      typeof serviceMinLOD === 'number' &&
      typeof serviceMaxLOD === 'number'
    ) {
      return {
        minNativeZoom: serviceMinLOD,
        maxNativeZoom: serviceMaxLOD,
      };
    }

    const lods = metadata?.tileInfo?.lods;
    if (lods?.length) {
      // Fallback for edge case where tiled service lacks minLOD/maxLOD
      const lodMin = lods[0].level;
      const lodMax = lods[lods.length - 1].level;

      console.warn(
        `[EsriTiledMapLayer] Tiled service missing minLOD/maxLOD for "${metadata?.name || url}". ` +
          `Using full LOD range: ${lodMin}-${lodMax} (may include levels without tiles.)`
      );

      return {
        minNativeZoom: lodMin,
        maxNativeZoom: lodMax,
      };
    }

    console.warn(
      `[EsriTiledMapLayer] No tileInfo.lods found for "${metadata?.name || url}". Native zooms will be unset.`
    );
    return {};
  }, [metadata, url]);

  // Find bounds
  const tileBounds = useMemo(() => {
    if (!metadata || !autoFitBounds) return undefined;

    const ext = metadata.fullExtent || metadata.initialExtent;
    if (!ext) return undefined;

    // Convert extent to Leaflet bounds for tile availability
    const { bounds } = safeConvertExtentToLatLng(ext);

    if (bounds && bounds.isValid()) {
      console.debug(
        `[EsriTiledMapLayer] Setting tile bounds for "${metadata.name || url}": ` +
          `[${bounds.getSouth()}, ${bounds.getWest()}] to [${bounds.getNorth()}, ${bounds.getEast()}]`
      );
      return bounds;
    }

    return undefined;
  }, [metadata, url]);

  return (
    <TiledMapLayer
      key={metadata ? `${url}-${nativeZooms.maxNativeZoom}` : url} // Force re-mount when zoom limits change
      url={url}
      opacity={opacity}
      zIndex={zIndex}
      /* not setting minNativeZoom */
      maxNativeZoom={16}
      /*bounds={tileBounds}*/
    />
  );
}
