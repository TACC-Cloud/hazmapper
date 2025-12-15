import React, { useEffect, useCallback, useRef } from 'react';
import * as turf from '@turf/turf';
import { useMap } from 'react-leaflet';
import { FeatureCollection, Feature, TileServerLayer } from '@hazmapper/types';
import { Feature as TFeature } from 'geojson';
import { useFeatureSelection, useCurrentFeatures } from '@hazmapper/hooks';
import { MAP_CONFIG } from './config';
import L from 'leaflet';

const FitBoundsHandler: React.FC<{
  activeBaseLayers: TileServerLayer[];
}> = ({ activeBaseLayers }) => {
  const map = useMap();
  const initialBoundsSet = useRef(false);
  const { selectedFeatureId } = useFeatureSelection();
  const { data: featureCollection, isFetching: isFeaturesLoading } =
    useCurrentFeatures();

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

  /**
   * Calculates combined bounds from features and active layers.
   *
   * @returns {L.LatLngBounds | null} Combined bounds, or null if:
   *   - featureCollection is still loading (undefined/null)
   *   - activeBaseLayers is still loading (undefined/null)
   *   - Both are loaded but no features exist and no layers have bounds defined
   */
  const getCombinedBounds = useCallback(() => {
    // Wait for both featureCollection and activeBaseLayers to load before calculating bounds
    if (!featureCollection || !activeBaseLayers) {
      return null;
    }

    const allBounds: L.LatLngBounds[] = [];

    // Add feature bounds if available
    if (featureCollection.features.length) {
      const featureBounds = getBoundsFromFeature(featureCollection);
      allBounds.push(L.latLngBounds(featureBounds));
    }

    // Add layer bounds if available
    activeBaseLayers.forEach((layer) => {
      if (layer.tileOptions?.bounds) {
        // bounds format: [[south, west], [north, east]]
        const layerBounds = L.latLngBounds(layer.tileOptions.bounds);
        allBounds.push(layerBounds);
      }
    });

    // Return null if no bounds were found from either source
    if (allBounds.length === 0) {
      return null;
    }

    // Combine all bounds by extending the first bound with all others
    const combinedBounds = allBounds[0];
    for (let i = 1; i < allBounds.length; i++) {
      combinedBounds.extend(allBounds[i]);
    }

    return combinedBounds;
  }, [featureCollection, activeBaseLayers, getBoundsFromFeature]);

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

  // Handle initial bounds when features/layers are loaded
  useEffect(() => {
    // Skip if already done initial fit or if a feature is selected
    if (initialBoundsSet.current || selectedFeatureId) {
      return;
    }

    // Wait until features are done loading (even if result is empty)
    if (isFeaturesLoading || !featureCollection) {
      return;
    }

    const combinedBounds = getCombinedBounds();

    if (combinedBounds) {
      map.fitBounds(combinedBounds, {
        maxZoom: MAP_CONFIG.maxFitBoundsInitialZoom,
        padding: [50, 50],
      });
    }

    // Mark as done so we don't recalculate on subsequent updates
    initialBoundsSet.current = true;
  }, [
    map,
    featureCollection,
    isFeaturesLoading,
    activeBaseLayers,
    selectedFeatureId,
    getCombinedBounds,
  ]);

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
