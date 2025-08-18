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
import { useWatch } from 'react-hook-form';
import {
  TLayerOptionsFormData,
  Feature,
  getFeatureType,
  FeatureType,
} from '@hazmapper/types';
import {
  useCurrentFeatures,
  useFeatureSelection,
  useMapillaryViewerMoveToNearestPoint,
} from '@hazmapper/hooks';
import { MAP_CONFIG } from './config';
import FitBoundsHandler from './FitBoundsHandler';
import PositionTracker from './PositionTracker';
import { createMarkerIcon, createClusterIcon } from './markerCreators';
import { calculatePointCloudMarkerPosition } from './utils';
import { getSequenceID } from '@hazmapper/utils/featureUtils';
import { getPixelBboxAroundPoint } from '@hazmapper/utils/leafletUtils';
import MapillaryPositionMarker from './MapillaryPositionMarker';
import EsriTiledMapLayer from './EsriTiledMapLayer';

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
 * Note this is not called `Map` as causes an issue with react-leaflet
 */
const LeafletMap: React.FC = () => {
  const { data: featureCollection } = useCurrentFeatures();
  const { setSelectedFeatureId } = useFeatureSelection();
  const { moveToImageNearThisPosition } =
    useMapillaryViewerMoveToNearestPoint();

  const getFeatureStyle = useCallback((feature) => {
    if (getFeatureType(feature) === FeatureType.Streetview) {
      return streetviewStyle.default;
    }
    return feature.properties?.style || defaultGeoJsonOptions.style;
  }, []);

  const handleFeatureClick = useCallback(
    async (feature: any, event: any) => {
      if (getFeatureType(feature) === FeatureType.Streetview) {
        if (event.type === 'click') {
          const map = event.target._map as L.Map;
          const sequenceID = getSequenceID(feature);
          const bounds = getPixelBboxAroundPoint(map, event.latlng, 10);
          const didMove = await moveToImageNearThisPosition(bounds, sequenceID);
          if (didMove) {
            // return early if we are handling this move to avoid
            // unselecting streeetview feature below with setSelectedFeatureId
            return;
          }
        }
      }

      // select/unselect features
      setSelectedFeatureId(feature.id);
    },
    [moveToImageNearThisPosition, setSelectedFeatureId]
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
            click: (e) => handleFeatureClick(feature, e),
            contextmenu: (e) => handleFeatureClick(feature, e),
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
          click: (e) => handleFeatureClick(feature, e),
          contextmenu: (e) => handleFeatureClick(feature, e),
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
      {/* Base layers */}
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
          <EsriTiledMapLayer
            key={layer.id}
            url={layer.url}
            maxZoom={MAP_CONFIG.maxZoom}
            zIndex={layer.uiOptions.zIndex}
            opacity={layer.uiOptions.opacity}
          />
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

      {/* This marker will automatically appear when the Mapillary viewer is active */}
      <MapillaryPositionMarker />

      {/* Handles zooming to a specific feature or to all features */}
      <FitBoundsHandler featureCollection={featureCollection} />

      <ZoomControl position="bottomright" />

      {/* Track position (which is displayed on MapControllbar */}
      <PositionTracker />
    </MapContainer>
  );
};

export default LeafletMap;
