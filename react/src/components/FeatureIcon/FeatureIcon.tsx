import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCameraRetro,
  faVideo,
  faClipboardList,
  faMapMarkerAlt,
  faDrawPolygon,
  faBezierCurve,
  faCloud,
  faRoad,
  faLayerGroup,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';

import { FeatureType, FeatureTypeNullable } from '@hazmapper/types';

const featureTypeToIcon: Record<FeatureType, IconDefinition> = {
  // Asset types
  image: faCameraRetro,
  video: faVideo,
  questionnaire: faClipboardList,
  point_cloud: faCloud,
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

interface Props {
  featureType: FeatureTypeNullable;
}

export const FeatureIcon: React.FC<Props> = ({ featureType }) => {
  const icon = featureType ? featureTypeToIcon[featureType] : faQuestionCircle;

  return <FontAwesomeIcon icon={icon} size="sm" />;
};
