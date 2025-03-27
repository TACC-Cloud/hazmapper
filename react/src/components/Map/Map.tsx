import React, { useMemo, useCallback } from 'react';
import {
  MapContainer,
  ZoomControl,
  Marker,
  TileLayer,
  WMSTileLayer,
  GeoJSON,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { TiledMapLayer } from 'react-esri-leaflet';
import { useWatch } from 'react-hook-form';
import {
  TLayerOptionsFormData,
  Feature,
  getFeatureType,
  FeatureType,
} from '@hazmapper/types';
import { useCurrentFeatures, useFeatureSelection } from '@hazmapper/hooks';
import { MAP_CONFIG } from './config';
import FitBoundsHandler from './FitBoundsHandler';
import PositionTracker from './PositionTracker';
import { createMarkerIcon, createClusterIcon } from './markerCreators';
import { calculatePointCloudMarkerPosition } from './utils';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/styles';

const defaultGeoJsonOptions = {
  style: {
    color: '#3388ff',
    weight: 3,
    opacity: 1,
    fillOpacity: 0.2,
  },
};

const streetviewStyle = {
  default: {
    fill: false,
    weight: 10,
    color: '#22C7FF',
    opacity: 0.6,
  },
  select: {
    fill: false,
    weight: 12,
    color: '#22C7FF',
    opacity: 1,
  },
  hover: {
    fill: false,
    weight: 12,
    color: '#22C7FF',
    opacity: 0.8,
  },
};

/**
 * A component that displays a leaflet map of hazmapper data
 *
 * Note this is not called Map as causes an issue with react-leaflet
 */
const LeafletMap: React.FC = () => {
  const { data: featureCollection } = useCurrentFeatures();
  const { setSelectedFeatureId } = useFeatureSelection();

  const getFeatureStyle = useCallback((feature) => {
    if (getFeatureType(feature) === FeatureType.Streetview) {
      return streetviewStyle.default;
    }
    return feature.properties?.style || defaultGeoJsonOptions.style;
  }, []);
  const handleFeatureClick = useCallback(
    (feature: any) => {
      setSelectedFeatureId(feature.id);
    },
    [setSelectedFeatureId]
  );

  const baseLayers = useWatch<TLayerOptionsFormData, 'tileLayers'>({
    name: 'tileLayers',
    defaultValue: [],
  });

  const baseLayersKey = useMemo(() => JSON.stringify(baseLayers), [baseLayers]);

  const activeBaseLayers = useMemo(() => {
    return baseLayers
      .map((item) => item.layer)
      .filter((layer) => layer.uiOptions.isActive);
  }, [baseLayersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const { generalGeoJsonFeatures, markerFeatures, streetviewFeatures } =
    useMemo(() => {
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

      if (featureCollection == undefined) {
        return initialAccumulator;
      }

      const result = featureCollection?.features.reduce<FeatureAccumulator>(
        (accumulator, feature: Feature) => {
          if (feature.geometry.type === FeatureType.Point) {
            accumulator.markerFeatures.push(feature);
          } else {
            if (getFeatureType(feature) === FeatureType.PointCloud) {
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
      return result;
    }, [featureCollection]);

  const markerComponents = useMemo(() => {
    return markerFeatures.map((feature) => {
      const geometry = feature.geometry as GeoJSON.Point;
      return (
        <Marker
          key={feature.id}
          icon={createMarkerIcon(feature)}
          position={[geometry.coordinates[1], geometry.coordinates[0]]}
          eventHandlers={{
            click: () => handleFeatureClick(feature),
            contextmenu: () => handleFeatureClick(feature),
          }}
        />
      );
    });
  }, [markerFeatures, handleFeatureClick]); // Only rebuild if features or click handler changes

  // Memoize GeoJSON components
  const geoJsonComponents = useMemo(() => {
    const combinedFeatures = [...generalGeoJsonFeatures, ...streetviewFeatures];

    return combinedFeatures.map((feature) => (
      <GeoJSON
        key={feature.id}
        data={feature.geometry}
        style={() => getFeatureStyle(feature)}
        eventHandlers={{
          click: () => handleFeatureClick(feature),
          contextmenu: () => handleFeatureClick(feature),
        }}
      />
    ));
  }, [
    generalGeoJsonFeatures,
    streetviewFeatures,
    handleFeatureClick,
    getFeatureStyle,
  ]);

  return (
    <MapContainer
      center={MAP_CONFIG.startingCenter}
      zoom={3}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      maxBounds={MAP_CONFIG.maxBounds}
      preferCanvas={true}
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
      {geoJsonComponents}
      {/* Marker Features with Clustering (also includes point cloud markers) */}
      <MarkerClusterGroup
        zIndexOffset={1}
        iconCreateFunction={createClusterIcon}
        chunkedLoading={true}
        animate={true}
        maxFitBoundsSelectedFeatureZoom={
          MAP_CONFIG.maxFitBoundsSelectedFeatureZoom
        }
        spiderifyOnHover={true}
        spiderfyOnMaxZoom={true}
        spiderfyOnZoom={MAP_CONFIG.maxPointSelectedFeatureZoom}
        zoomToBoundsOnClick={true}
      >
        {markerComponents}
      </MarkerClusterGroup>
      {/* Handles zooming to a specific feature or to all features */}
      <FitBoundsHandler featureCollection={featureCollection} />
      <ZoomControl position="bottomright" />
      <PositionTracker />
    </MapContainer>
  );
};

export default LeafletMap;
