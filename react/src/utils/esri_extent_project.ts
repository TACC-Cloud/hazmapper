import proj4 from 'proj4';
import L from 'leaflet';
import { ExtentProperties } from '@hazmapper/types/esri';

/**
 * Maps WKID codes to proj4-compatible identifiers
 * proj4 already knows most of these, we just need to map WKID to EPSG codes
 */
function getProjectionCode(wkid: number): string | null {
  // Map common Esri WKIDs to standard EPSG codes that proj4 knows
  const wkidToEpsg: Record<number, string> = {
    4326: 'EPSG:4326', // WGS84 - proj4 knows this
    4269: 'EPSG:4269', // NAD83 - proj4 knows this
    3857: 'EPSG:3857', // Web Mercator - proj4 knows this
    102100: 'EPSG:3857', // Esri's Web Mercator = standard Web Mercator
    102113: 'EPSG:3857', // Another Esri Web Mercator variant
    // Most other codes map directly: WKID 32633 = EPSG:32633
  };

  // Check if we have a specific mapping
  if (wkidToEpsg[wkid]) {
    return wkidToEpsg[wkid];
  }

  // For most cases, WKID == EPSG code, so try that
  const epsgCode = `EPSG:${wkid}`;

  // Check if proj4 knows this EPSG code
  try {
    const def = proj4.defs(epsgCode);
    if (def) {
      return epsgCode;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // proj4 doesn't know this code
  }

  return null;
}

/**
 * Converts extent coordinates to WGS84 lat/lng for use with Leaflet
 * Uses proj4's built-in projection definitions - no manual setup needed!
 */
export function convertExtentToLatLng(
  extent: ExtentProperties
): L.LatLngBounds | null {
  // Validate input extent
  if (!extent || typeof extent !== 'object') {
    console.warn('[convertExtentToLatLng] Invalid extent object');
    return null;
  }

  const { xmin, ymin, xmax, ymax, spatialReference } = extent;

  // Validate extent coordinates
  if (
    typeof xmin !== 'number' ||
    typeof ymin !== 'number' ||
    typeof xmax !== 'number' ||
    typeof ymax !== 'number'
  ) {
    console.warn('[convertExtentToLatLng] Invalid extent coordinates:', {
      xmin,
      ymin,
      xmax,
      ymax,
    });
    return null;
  }

  // Check for valid bounds
  if (xmax <= xmin || ymax <= ymin) {
    console.warn('[convertExtentToLatLng] Invalid extent bounds:', {
      xmin,
      ymin,
      xmax,
      ymax,
    });
    return null;
  }

  // Validate spatial reference
  const wkid = spatialReference?.wkid ?? spatialReference?.latestWkid;
  if (!wkid || typeof wkid !== 'number') {
    console.warn(
      '[convertExtentToLatLng] No valid spatial reference WKID found:',
      spatialReference
    );
    return null;
  }

  // If already in WGS84, validate and use directly
  if (wkid === 4326) {
    if (xmin < -180 || xmax > 180 || ymin < -90 || ymax > 90) {
      console.warn('[convertExtentToLatLng] Invalid WGS84 coordinates:', {
        xmin,
        ymin,
        xmax,
        ymax,
      });
      return null;
    }

    try {
      return L.latLngBounds(L.latLng(ymin, xmin), L.latLng(ymax, xmax));
    } catch (leafletError) {
      console.error(
        '[convertExtentToLatLng] Leaflet bounds creation failed:',
        leafletError
      );
      return null;
    }
  }

  // Get projection code that proj4 understands
  const sourceProj = getProjectionCode(wkid);
  if (!sourceProj) {
    console.warn(
      `[convertExtentToLatLng] Unsupported WKID: ${wkid}. ` +
        `proj4 doesn't have a definition for this coordinate system.`
    );
    return null;
  }

  try {
    // Let proj4 handle the conversion using its built-in definitions
    const [minLng, minLat] = proj4(sourceProj, 'EPSG:4326', [xmin, ymin]);
    const [maxLng, maxLat] = proj4(sourceProj, 'EPSG:4326', [xmax, ymax]);

    // Validate transformed coordinates
    if (
      !isFinite(minLng) ||
      !isFinite(minLat) ||
      !isFinite(maxLng) ||
      !isFinite(maxLat)
    ) {
      console.error(
        '[convertExtentToLatLng] Transformation produced invalid coordinates:',
        { minLng, minLat, maxLng, maxLat }
      );
      return null;
    }

    // Ensure proper bounds order after transformation
    const actualMinLng = Math.min(minLng, maxLng);
    const actualMaxLng = Math.max(minLng, maxLng);
    const actualMinLat = Math.min(minLat, maxLat);
    const actualMaxLat = Math.max(minLat, maxLat);

    try {
      return L.latLngBounds(
        L.latLng(actualMinLat, actualMinLng),
        L.latLng(actualMaxLat, actualMaxLng)
      );
    } catch (leafletError) {
      console.error(
        '[convertExtentToLatLng] Leaflet bounds creation failed:',
        leafletError
      );
      return null;
    }
  } catch (projectionError) {
    console.error(
      `[convertExtentToLatLng] Projection transformation failed from ${wkid} to WGS84:`,
      projectionError
    );
    return null;
  }
}

/**
 * Safe wrapper for extent conversion with comprehensive error handling
 */
export function safeConvertExtentToLatLng(extent: ExtentProperties): {
  bounds: L.LatLngBounds | null;
  error?: string;
  warning?: string;
} {
  try {
    const bounds = convertExtentToLatLng(extent);
    return { bounds };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown projection error';
    return {
      bounds: null,
      error: `Extent conversion failed: ${errorMessage}`,
    };
  }
}

// Usage in your component:
export function createBoundsFromExtent(
  extent: ExtentProperties
): L.LatLngBounds | null {
  return convertExtentToLatLng(extent);
}
