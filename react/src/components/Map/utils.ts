import { LatLng } from 'leaflet';
import * as turf from '@turf/turf';
import GeoJSON from 'geojson';

/**
 * Calculates the top-left corner position of a point cloud polygon
 */
export function calculatePointCloudMarkerPosition(
  geometry: GeoJSON.Geometry
): LatLng {
  const bbox = turf.bbox(geometry);
  // bbox format is [minX, minY, maxX, maxY]
  const north = bbox[3]; // maxY
  const west = bbox[0]; // minX
  return new LatLng(north, west);
}
