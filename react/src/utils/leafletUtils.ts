import L, { Map, LatLng, LatLngBounds } from 'leaflet';

/**
 * Get a geographic bounding box (bbox) around a clicked point,
 * sized based on a pixel square (e.g., 10x10px).
 *
 * @param map - Leaflet map instance
 * @param centerLatLng - The click position (usually e.latlng)
 * @param pixelSize - How big (in px) the box should be (default: 10)
 * @returns A LatLngBounds box around the point
 */
export function getPixelBboxAroundPoint(
  map: Map,
  centerLatLng: LatLng,
  pixelSize: number = 10
): LatLngBounds {
  const half = pixelSize / 2;

  // Convert latlng to screen (pixel) space
  const centerPoint = map.latLngToContainerPoint(centerLatLng);

  // Create pixel bounds
  const topLeft = L.point(centerPoint.x - half, centerPoint.y - half);
  const bottomRight = L.point(centerPoint.x + half, centerPoint.y + half);

  // Convert back to latlng
  const southWestCorner = map.containerPointToLatLng(bottomRight);
  const northEastCorner = map.containerPointToLatLng(topLeft);

  return L.latLngBounds(southWestCorner, northEastCorner);
}
