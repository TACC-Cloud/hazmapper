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
import L, { MarkerCluster } from 'leaflet';

import {
  TileServerLayer,
  FeatureCollection,
  Feature,
  getFeatureType,
  FeatureType,
} from '@hazmapper/types';
import { useFeatureSelection } from '@hazmapper/hooks';
import { MAP_CONFIG } from './config';
import FitBoundsHandler from './FitBoundsHandler';
import { calculatePointCloudMarkerPosition } from './utils';
import styles from './Map.module.css';
import './Map.css';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/styles';

import { featureTypeToIcon } from '@hazmapper/utils/featureIconUtil';

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

// NOTE: iconCreateFunction being run by leaflet, which is not support ES6 arrow func syntax
// eslint-disable-next-line
const createClusterCustomIcon = function (cluster: MarkerCluster) {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'custom-marker-cluster',
    iconSize: L.point(25, 25, true),
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
  const { selectedFeatureId, setSelectedFeatureId } = useFeatureSelection();

  const handleFeatureClick = useCallback(
    (feature: any) => {
      debugger;
      setSelectedFeatureId(feature.id);

      //TODO handle clicking on streetview https://tacc-main.atlassian.net/browse/WG-392
    },
    [selectedFeatureId]
  );

  /*
   * move to module.css
   * circle marker for points
   * create custom icon marker
   * create circle icon marker with style
   */
  const createCustomIcon = useCallback((feature: Feature) => {
    const defaultFillColor = 'var(--global-color-accent--normal)';
    const createCircleIcon = (customStyle = {}) => {
      const defaultCustomStyle = {
        radius: 8,
        fillColor: defaultFillColor,
        color: 'black',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      };

      const style = { ...defaultCustomStyle, ...customStyle };

      // Add padding for the stroke
      const padding = style.weight;
      const totalSize = style.radius * 2 + padding * 2;
      const center = totalSize / 2;

      return L.divIcon({
        html: `
          <svg height="${totalSize}" width="${totalSize}">
            <circle 
              cx="${center}"
              cy="${center}"
              r="${style.radius}"
              fill="${style.fillColor}"
              fill-opacity="${style.fillOpacity}"
              stroke="${style.color}"
              stroke-width="${style.weight}"
              stroke-opacity="${style.opacity}"
            />
          </svg>
        `,
        className: '',
        iconSize: [totalSize, totalSize],
        iconAnchor: [center, center],
      });
    };

    const createFontAwesomeIcon = (
      faIconString: string,
      customStyle: { color?: string; backgroundColor?: string } = {}
    ) => {
      const color = customStyle?.color ?? defaultFillColor;
      const backgroundColor = customStyle?.backgroundColor ?? '#ffffff';

      const divHtml = `
        <div style="
          background-color: ${backgroundColor};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          border: 2px solid white;
        ">
          <i class="fas ${faIconString}" style="
            color: ${color};
            font-size: 20px;
          "></i>
        </div>
      `;

      return L.divIcon({
        html: divHtml,
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
    };

    const customStyle = feature.properties?.style;
    if (customStyle) {
      if (customStyle.faIcon) {
        return createFontAwesomeIcon(customStyle.faIcon, customStyle);
      } else {
        return createCircleIcon(customStyle);
      }
    }

    const featureType = getFeatureType(feature);

    if (featureType === FeatureType.Point) {
      return createCircleIcon();
    }

    const featureFAIcon = featureTypeToIcon(featureType);

    // Get SVG path directly from the icon object
    const iconPath = featureFAIcon.icon[4];

    return L.divIcon({
      html: `
          <div style="
            background-color: #ffffff;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          ">
            <svg
              viewBox="0 0 ${featureFAIcon.icon[0]} ${featureFAIcon.icon[1]}"
              style="width: 20px; height: 20px; fill: ${defaultFillColor};"
            >
              <path d="${iconPath}"></path>
            </svg>
          </div>
        `,
      className: 'custom-marker',
      iconSize: L.point(40, 40),
      iconAnchor: L.point(20, 20),
    });
  }, []);

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
        zIndexOffset={1}
        iconCreateFunction={createClusterCustomIcon}
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
        {markerFeatures.map((feature) => {
          const geometry = feature.geometry as GeoJSON.Point;
          return (
            <Marker
              key={feature.id}
              icon={createCustomIcon(feature)}
              position={[geometry.coordinates[1], geometry.coordinates[0]]}
              eventHandlers={{
                click: () => handleFeatureClick(feature),
                contextmenu: () => handleFeatureClick(feature),
              }}
            />
          );
        })}
      </MarkerClusterGroup>
      {/* Handles zooming to a specific feature or to all features */}
      <FitBoundsHandler featureCollection={featureCollection} />
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
};

export default LeafletMap;
