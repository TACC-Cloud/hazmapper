import React, { useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import * as turf from '@turf/turf';
import { useMap } from 'react-leaflet';
import { FeatureCollection, Feature } from '@hazmapper/types';
import { MAP_CONFIG } from './config';

/**
 * Handles map bounds adjustments based on features.
 * On initial load: Fits bounds to show all features in collection
 * When activeFeatureId changes: Zooms to that specific feature
 * Uses turf.bbox() for bounding calculations with maxFitToBoundsZoom limit
 */
const FitBoundsHandler: React.FC<{
  featureCollection: FeatureCollection;
}> = ({ featureCollection }) => {
  const location = useLocation();
  const map = useMap();

  const selectedFeatureId = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const rawId = searchParams.get('selectedFeature');
    return rawId ? Number(rawId) : undefined;
  }, [location.search]);

  const getBoundsFromFeature = useCallback(
    (feature: FeatureCollection | Feature) => {
      const bbox = turf.bbox(feature);
      return [
        [bbox[1], bbox[0]] as [number, number],
        [bbox[3], bbox[2]] as [number, number],
      ];
    },
    []
  );

  // Handle initial bounds
  useEffect(() => {
    if (featureCollection.features.length && !selectedFeatureId) {
      const bounds = getBoundsFromFeature(featureCollection);
      map.fitBounds(bounds, {
        maxZoom: MAP_CONFIG.maxFitBoundsInitialZoom,
      });
    }
  }, [map, featureCollection, selectedFeatureId]);

  // Handle selected feature bounds
  useEffect(() => {
    if (selectedFeatureId) {
      const activeFeature = featureCollection.features.find(
        (f) => f.id === selectedFeatureId
      );

      if (activeFeature) {
        const bounds = getBoundsFromFeature(activeFeature);
        map.fitBounds(bounds, {
          maxZoom: MAP_CONFIG.maxFitBoundsSelectedFeatureZoom,
        });
      }
    }
  }, [map, selectedFeatureId, featureCollection]);

  return null;
};

export default FitBoundsHandler;
