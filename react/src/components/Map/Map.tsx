import React, { useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MapContainer,
  ZoomControl,
  Marker,
  Popup,
  TileLayer,
  WMSTileLayer,
  useMap,
} from 'react-leaflet';
import { TiledMapLayer } from 'react-esri-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import { TileServerLayer, FeatureCollection, Feature } from '@hazmapper/types';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { LatLngTuple, MarkerCluster } from 'leaflet';
import 'leaflet.markercluster';

import 'leaflet/dist/leaflet.css';

const MAP_CONFIG = {
  startingCenter: [40, -80] as LatLngTuple,
  maxFitBoundsInitialZoom: 18,
  maxFitBoundsSelectedFeatureZoom: 18,
  maxBounds: [
    [-90, -180], // Southwest coordinates
    [90, 180], // Northeast coordinates
  ] as L.LatLngBoundsExpression,
  minZoom: 2, // 2 typically prevents zooming out too far to see multiple earths
  maxZoom: 24,
} as const;

interface LeafletMapProps {
  /**
   * Tile servers used as base layers of map
   */
  baseLayers: TileServerLayer[];

  /**
   * Features of map
   */
  featureCollection: FeatureCollection;
}

const ClusterMarkerIcon = (childCount: number) => {
  return L.divIcon({
    html: `<div><b>${childCount}</b></div>`,
    className: 'marker-cluster',
  });
};

/**
 * Handles map bounds adjustments based on features.
 * On initial load: Fits bounds to show all features in collection
 * When activeFeatureId changes: Zooms to that specific feature
 * Uses turf.bbox() for bounding calculations with maxFitToBoundsZoom limit
 */
const FitBoundsHandler: React.FC<{ featureCollection: FeatureCollection }> = ({
  featureCollection,
}) => {
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

/**
 * A component that displays a leaflet map of hazmapper data
 *
 * Note this is not called Map as causes an issue with react-leaflet
 */
const LeafletMap: React.FC<LeafletMapProps> = ({
  baseLayers = [],
  featureCollection,
}) => {
  const activeBaseLayers = useMemo(
    () => baseLayers.filter((layer) => layer.uiOptions.isActive),
    [baseLayers]
  );

  const pointFeatures = useMemo(
    () => featureCollection.features.filter((f) => f.geometry.type === 'Point'),
    [featureCollection.features]
  );

  return (
    <MapContainer
      center={MAP_CONFIG.startingCenter}
      zoom={3}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      maxBounds={MAP_CONFIG.maxBounds}
    >
      {activeBaseLayers?.map((layer) =>
        layer.type === 'wms' ? (
          <WMSTileLayer
            key={layer.id}
            url={layer.url}
            attribution={layer.attribution}
            zIndex={layer.uiOptions.zIndex}
            opacity={layer.uiOptions.opacity}
            {...layer.tileOptions}
          />
        ) : layer.type === 'arcgis' ? (
          <TiledMapLayer key={layer.id} url={layer.url} maxZoom={24} />
        ) : (
          <TileLayer
            key={layer.id}
            url={layer.url}
            attribution={layer.attribution}
            zIndex={layer.uiOptions.zIndex}
            opacity={layer.uiOptions.opacity}
            {...layer.tileOptions}
          />
        )
      )}
      <MarkerClusterGroup
        iconCreateFunction={(cluster: MarkerCluster) =>
          ClusterMarkerIcon(cluster.getChildCount())
        }
      >
        {pointFeatures.map((f) => {
          const geometry = f.geometry as GeoJSON.Point;

          return (
            <Marker
              key={f.id}
              position={[geometry.coordinates[1], geometry.coordinates[0]]}
            >
              <Popup>{f.id}</Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
      <FitBoundsHandler featureCollection={featureCollection} />{' '}
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
};

export default LeafletMap;
