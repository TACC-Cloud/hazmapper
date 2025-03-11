import React, { useEffect, useCallback, useRef } from 'react';
import * as turf from '@turf/turf';
import { useMap } from 'react-leaflet';
import { FeatureCollection, Feature } from '@hazmapper/types';
import { Feature as TFeature } from 'geojson';
import { useFeatureSelection } from '@hazmapper/hooks';
import { MAP_CONFIG } from './config';
import L from 'leaflet';

const FitBoundsHandler: React.FC<{
  featureCollection: FeatureCollection | undefined;
}> = ({ featureCollection }) => {
  const map = useMap();
  const hasFeatures = useRef(false);
  const { selectedFeatureId } = useFeatureSelection();

  const getBoundsFromFeature = useCallback(
    (feature: FeatureCollection | Feature) => {
      const bbox = turf.bbox(feature as TFeature);
      return [
        [bbox[1], bbox[0]] as [number, number],
        [bbox[3], bbox[2]] as [number, number],
      ];
    },
    []
  );

  const zoomToFeature = useCallback(
    (feature: Feature) => {
      if (feature.geometry.type === 'Point') {
        const coordinates = feature.geometry.coordinates;
        const point = L.latLng(coordinates[1], coordinates[0]);

        map.setView(point, MAP_CONFIG.maxPointSelectedFeatureZoom, {
          animate: false,
        });
      } else {
        const bounds = getBoundsFromFeature(feature);
        map.fitBounds(bounds, {
          maxZoom: MAP_CONFIG.maxFitBoundsSelectedFeatureZoom,
          padding: [50, 50],
          animate: false,
        });
      }
    },
    [map, getBoundsFromFeature]
  );

  // Handle initial bounds when features are loaded
  useEffect(() => {
    // Guard against undefined featureCollection
    if (featureCollection === undefined) return;

    if (
      featureCollection.features.length &&
      !selectedFeatureId &&
      !hasFeatures.current
    ) {
      const bounds = getBoundsFromFeature(featureCollection);
      map.fitBounds(bounds, {
        maxZoom: MAP_CONFIG.maxFitBoundsInitialZoom,
        padding: [50, 50],
      });
      hasFeatures.current = true;
    }
  }, [map, featureCollection, selectedFeatureId, getBoundsFromFeature]);

  // Handle selected feature bounds
  useEffect(() => {
    // Guard against undefined featureCollection
    if (featureCollection === undefined) return;

    if (selectedFeatureId) {
      const activeFeature = featureCollection.features.find(
        (f) => f.id === selectedFeatureId
      );

      if (activeFeature) {
        zoomToFeature(activeFeature);
      }
    }
  }, [map, selectedFeatureId, featureCollection, zoomToFeature]);

  return null;
};

export default FitBoundsHandler;
