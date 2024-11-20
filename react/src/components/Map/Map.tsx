import React, { useMemo, useCallback } from 'react';
import {
  MapContainer,
  ZoomControl,
  Marker,
  TileLayer,
  WMSTileLayer,
  GeoJSON,
} from 'react-leaflet';
import { TiledMapLayer } from 'react-esri-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import * as L from 'leaflet';
import { MarkerCluster } from 'leaflet';
import 'leaflet.markercluster';

import 'leaflet/dist/leaflet.css';

import {
  TileServerLayer,
  FeatureCollection,
  Feature,
  getFeatureType,
} from '@hazmapper/types';
import { useFeatureSelection } from '@hazmapper/hooks';
import { MAP_CONFIG } from './config';
import FitBoundsHandler from './FitBoundsHandler';
import { calculatePointCloudMarkerPosition } from './utils';

interface LeafletMapProps {
  /**
   * Tile servers used as base layers of map
   */
  baseLayers?: TileServerLayer[];

  /**
   * Features of map
   */
  featureCollection: FeatureCollection;
}

const defaultGeoJsonOptions = {
  style: {
    color: '#3388ff',
    weight: 3,
    opacity: 1,
    fillOpacity: 0.2,
  },
};

const getFeatureStyle = (feature: any) => {
  return feature.properties?.style || defaultGeoJsonOptions.style;
};

const ClusterMarkerIcon = (childCount: number) => {
  return L.divIcon({
    html: `<div><b>${childCount}</b></div>`,
    className: 'marker-cluster',
  });
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
  const { selectedFeatureId, setSelectedFeature } = useFeatureSelection();

  const handleFeatureClick = useCallback(
    (feature: any) => {
      setSelectedFeature(feature.id);

      //TODO handle clicking on streetview https://tacc-main.atlassian.net/browse/WG-392
    },
    [selectedFeatureId]
  );

  const activeBaseLayers = useMemo(
    () => baseLayers.filter((layer) => layer.uiOptions.isActive),
    [baseLayers]
  );
  interface FeatureAccumulator {
    generalGeoJsonFeatures: Feature[] /* non-point features, includes point cloud outlines */;
    markerFeatures: Feature[];
    streetviewFeatures: Feature[];
  }

  // Initial accumulator state
  const initialAccumulator: FeatureAccumulator = {
    generalGeoJsonFeatures: [],
    markerFeatures: [],
    streetviewFeatures: [],
  };

  const {
    generalGeoJsonFeatures,
    markerFeatures,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    streetviewFeatures /* Add streetview support https://tacc-main.atlassian.net/browse/WG-392 */,
  } = useMemo(() => {
    return featureCollection.features.reduce<FeatureAccumulator>(
      (accumulator, feature: Feature) => {
        if (feature.geometry.type === 'Point') {
          accumulator.markerFeatures.push(feature);
        } else {
          if (getFeatureType(feature) === 'point_cloud') {
            // Add a marker at the calculated position
            const markerPosition = calculatePointCloudMarkerPosition(
              feature.geometry
            );
            const pointCloudMarker: Feature = {
              ...feature,
              geometry: {
                type: 'Point',
                coordinates: [markerPosition.lng, markerPosition.lat],
              },
            };

            accumulator.markerFeatures.push(pointCloudMarker);
            // Also keep the original geometry for rendering
            accumulator.generalGeoJsonFeatures.push(feature);
          } else {
            accumulator.generalGeoJsonFeatures.push(feature);
          }
        }
        return accumulator;
      },
      initialAccumulator
    );
  }, [featureCollection.features]);

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
      {/* General GeoJSON Features (including point cloud geometries) */}
      {generalGeoJsonFeatures.map((feature) => (
        <GeoJSON
          key={feature.id}
          data={feature.geometry}
          style={() => getFeatureStyle(feature)}
          eventHandlers={{
            click: () => handleFeatureClick(feature),
            contextmenu: () => handleFeatureClick(feature),
          }}
        />
      ))}
      {/* Marker Features with Clustering (also includes point cloud markers) */}
      <MarkerClusterGroup
        iconCreateFunction={(cluster: MarkerCluster) =>
          ClusterMarkerIcon(cluster.getChildCount())
        }
        zIndexOffset={1}
      >
        {markerFeatures.map((feature) => {
          const geometry = feature.geometry as GeoJSON.Point;
          return (
            <Marker
              key={feature.id}
              position={[geometry.coordinates[1], geometry.coordinates[0]]}
              eventHandlers={{
                click: () => handleFeatureClick(feature),
                contextmenu: () => handleFeatureClick(feature),
              }}
            />
          );
        })}
      </MarkerClusterGroup>
      <FitBoundsHandler featureCollection={featureCollection} />{' '}
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
};

export default LeafletMap;
