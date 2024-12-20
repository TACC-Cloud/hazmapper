import { LatLngTuple } from 'leaflet';

export const MAP_CONFIG = {
  startingCenter: [40, -80] as LatLngTuple,
  minZoom: 2, // 2 typically prevents zooming out too far to see multiple earths
  maxZoom: 24, // Maximum possible detail
  maxFitBoundsInitialZoom: 18,
  maxFitBoundsSelectedFeatureZoom: 18,
  maxPointSelectedFeatureZoom: 15, // Single agreed-upon zoom level for points/cluster
  maxBounds: [
    [-90, -180], // Southwest coordinates
    [90, 180], // Northeast coordinates
  ] as L.LatLngBoundsExpression,
} as const;
