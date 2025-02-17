import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCameraRetro,
  faVideo,
  faClipboardList,
  faMapMarkerAlt,
  faDrawPolygon,
  faCloud,
  faBezierCurve,
  faRoad,
  faLayerGroup,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';

import { FeatureType, FeatureTypeNullable } from '@hazmapper/types';

const FeatureTypeToIconMap: Record<FeatureType, IconDefinition> = {
  // Asset types
  image: faCameraRetro,
  video: faVideo,
  questionnaire: faClipboardList,
  point_cloud: faCloud /* https://tacc-main.atlassian.net/browse/WG-391 */,
  streetview: faRoad,

  // Geometry types
  Point: faMapMarkerAlt,
  LineString: faBezierCurve,
  Polygon: faDrawPolygon,
  MultiPoint: faMapMarkerAlt,
  MultiLineString: faBezierCurve,
  MultiPolygon: faDrawPolygon,
  GeometryCollection: faLayerGroup,

  // Collection type
  collection: faLayerGroup,
};

/**
 * Maps a feature type to its font awesome icon.
 *
 * Returns faQuestionCircle if:
 *  - feature is null
 *  - feature is not found in FeatureTypeToIconMap
 */
export const featureTypeToIcon = (
  featureType: FeatureTypeNullable
): IconDefinition => {
  if (!featureType || !(featureType in FeatureTypeToIconMap)) {
    return faQuestionCircle;
  }
  return FeatureTypeToIconMap[featureType];
};
