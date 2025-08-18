import L from 'leaflet';
import { ExtentProperties } from '@hazmapper/types/esri';

/**
 * Convert an ArcGIS extent to a Leaflet LatLngBounds in WGS84.
 *
 * - Returns `{ bounds, error? }`. On unsupported WKID or bad input, bounds=null.
 */
export function convertExtentToLatLng(extent: ExtentProperties): {
  bounds: L.LatLngBounds | null;
  error?: string;
} {
  try {
    if (!extent || typeof extent !== 'object') {
      throw new Error('Invalid extent object');
    }

    const { xmin, ymin, xmax, ymax, spatialReference } = extent;

    if (![xmin, ymin, xmax, ymax].every(Number.isFinite)) {
      throw new Error('Invalid extent coordinates');
    }
    if (xmax <= xmin || ymax <= ymin) {
      throw new Error('Invalid extent bounds');
    }

    const wkid = spatialReference?.latestWkid ?? spatialReference?.wkid;
    if (!wkid) {
      throw new Error('No valid WKID found');
    }

    // WGS84 (already degrees)
    if (wkid === 4326) {
      if (xmin < -180 || xmax > 180 || ymin < -90 || ymax > 90)
        throw new Error('Out-of-range 4326 coords');
      return { bounds: L.latLngBounds([ymin, xmin], [ymax, xmax]) };
    }

    // Web Mercator (meters) → unproject to lat/lng
    if (wkid === 3857 || wkid === 102100 || wkid === 102113) {
      const sw = L.CRS.EPSG3857.unproject(L.point(xmin, ymin));
      const ne = L.CRS.EPSG3857.unproject(L.point(xmax, ymax));
      return { bounds: L.latLngBounds(sw, ne) }; // Leaflet normalizes corners
    }

    // Anything else is unsupported but we could use proj4 later if we want to support other projects
    throw new Error(
      `Unsupported WKID ${wkid}; only 4326 and 3857/102100/102113 are handled`
    );
  } catch (err) {
    return {
      bounds: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
