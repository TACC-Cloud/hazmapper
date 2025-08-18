import proj4 from 'proj4';
import L from 'leaflet';
import { ExtentProperties } from '@hazmapper/types/esri';

/**
 * Map common Esri WKIDs to standard EPSG codes that proj4 knows.
 * Many WKIDs map directly (e.g., WKID 32633 = EPSG:32633), but
 * some require manual aliases for Web Mercator variants.
 */
const wkidToEpsg: Record<number, string> = {
  4326: 'EPSG:4326', // WGS84
  4269: 'EPSG:4269', // NAD83
  3857: 'EPSG:3857', // Web Mercator
  102100: 'EPSG:3857', // Esri's Web Mercator
  102113: 'EPSG:3857', // Another Esri Web Mercator variant
};

/**
 * Return a proj4-compatible code for a WKID, or null if unsupported.
 */
function getProjectionCode(wkid: number): string | null {
  const code = wkidToEpsg[wkid] || `EPSG:${wkid}`;
  try {
    return proj4.defs(code) ? code : null;
  } catch {
    return null;
  }
}

/**
 * Convert an ArcGIS extent to a Leaflet LatLngBounds in WGS84.
 * - Handles WKID lookup and projection transformation via proj4
 * - Validates coordinates and bounds
 * - Returns `{ bounds, error? }` for safe use
 */
export function convertExtentToLatLng(extent: ExtentProperties): {
  bounds: L.LatLngBounds | null;
  error?: string;
} {
  try {
    if (!extent || typeof extent !== 'object')
      throw new Error('Invalid extent object');

    const { xmin, ymin, xmax, ymax, spatialReference } = extent;
    if ([xmin, ymin, xmax, ymax].some((n) => typeof n !== 'number'))
      throw new Error('Invalid extent coordinates');
    if (xmax <= xmin || ymax <= ymin) throw new Error('Invalid extent bounds');

    const wkid = spatialReference?.wkid ?? spatialReference?.latestWkid;
    if (!wkid) throw new Error('No valid WKID found');

    // Already in WGS84 — use directly after validating range
    if (wkid === 4326) {
      if (xmin < -180 || xmax > 180 || ymin < -90 || ymax > 90)
        throw new Error('Invalid WGS84 coordinates');
      return { bounds: L.latLngBounds([ymin, xmin], [ymax, xmax]) };
    }

    const src = getProjectionCode(wkid);
    if (!src) throw new Error(`Unsupported WKID ${wkid}`);

    const [minLng, minLat] = proj4(src, 'EPSG:4326', [xmin, ymin]);
    const [maxLng, maxLat] = proj4(src, 'EPSG:4326', [xmax, ymax]);
    if (![minLng, minLat, maxLng, maxLat].every(isFinite))
      throw new Error('Transformation produced invalid coords');

    return {
      bounds: L.latLngBounds(
        [Math.min(minLat, maxLat), Math.min(minLng, maxLng)],
        [Math.max(minLat, maxLat), Math.max(minLng, maxLng)]
      ),
    };
  } catch (error) {
    return {
      bounds: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}



