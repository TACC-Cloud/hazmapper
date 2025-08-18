import { EsriMetadata } from '@hazmapper/types/esri';
import { convertExtentToLatLng } from './extentProject';

export interface ParsedEsriMetadata {
  zoomLevels: {
    minNativeZoom?: number;
    maxNativeZoom?: number;
  };
  bounds?: L.LatLngBounds;
}

/**
 * Parses ArcGIS tiled service metadata to get zoom levels and bounds
 *
 * - Extracts `minNativeZoom` / `maxNativeZoom` from minLOD/maxLOD or LOD array
 * - Extracts valid `bounds` from fullExtent or initialExtent
 *
 * Note: `zoomLevels` may be empty and `bounds` may be undefined.
 */
export function parseEsriMetadata(
  metadata: EsriMetadata,
  serviceUrlForLogging: string
): ParsedEsriMetadata {
  let zoomLevels: ParsedEsriMetadata['zoomLevels'] = {};
  let bounds: L.LatLngBounds | undefined;

  // Zoom levels
  const lods = metadata.tileInfo?.lods;
  if (
    typeof metadata.minLOD === 'number' &&
    typeof metadata.maxLOD === 'number'
  ) {
    zoomLevels = {
      minNativeZoom: metadata.minLOD,
      maxNativeZoom: metadata.maxLOD,
    };
  } else if (lods?.length) {
    zoomLevels = {
      minNativeZoom: lods[0].level,
      maxNativeZoom: lods[lods.length - 1].level,
    };
    console.warn(
      `[parseEsriMetadata] Using full LOD range: ${zoomLevels.minNativeZoom}-${zoomLevels.maxNativeZoom} for "${metadata.name || serviceUrlForLogging || 'unknown service'}"`
    );
  } else {
    console.warn(
      `[parseEsriMetadata] No minLOD/maxLOD or tileInfo.lods for "${metadata.name || serviceUrlForLogging || 'unknown service'}".`
    );
  }

  // Bounds
  const ext = metadata.fullExtent;
  if (ext) {
    const { bounds: convertedBounds, error } = convertExtentToLatLng(ext);
    if (convertedBounds?.isValid()) {
      bounds = convertedBounds;
    } else if (error) {
      console.warn(
        `[parseEsriMetadata] Extent conversion failed for "${
          metadata.name || serviceUrlForLogging
        }": ${error}`
      );
    }
  }

  return { zoomLevels, bounds };
}
