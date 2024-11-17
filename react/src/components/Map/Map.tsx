import React, { useEffect } from 'react';
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
import { TileServerLayer, FeatureCollection } from '@hazmapper/types';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { LatLngTuple, MarkerCluster } from 'leaflet';
import 'leaflet.markercluster';

import 'leaflet/dist/leaflet.css';

const startingCenterPosition: LatLngTuple = [40, -80];
const maxFitToBoundsZoom = 18;
const maxBounds: L.LatLngBoundsExpression = [
  [-90, -180], // Southwest coordinates
  [90, 180], // Northeast coordinates
];

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
const FitBoundsHandler = ({
  featureCollection,
}: {
  featureCollection: FeatureCollection;
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const rawSelectedFeatureId = searchParams.get('selectedFeature');
  const selectedFeatureId = rawSelectedFeatureId
    ? Number(rawSelectedFeatureId)
    : undefined;

  const map = useMap();

  // Handle zooming in on initial page load load
  useEffect(() => {
    if (featureCollection.features.length && !selectedFeatureId) {
      const bbox = turf.bbox(featureCollection);
      const southWest: [number, number] = [bbox[1], bbox[0]];
      const northEast: [number, number] = [bbox[3], bbox[2]];
      map.fitBounds([southWest, northEast], { maxZoom: maxFitToBoundsZoom });
    }
  }, [map, featureCollection]);

  // Handle zooming to selected feature
  useEffect(() => {
    if (selectedFeatureId) {
      const activeFeature = featureCollection.features.find(
        (f) => f.id === selectedFeatureId
      );

      if (activeFeature) {
        const bbox = turf.bbox(activeFeature);
        const southWest: [number, number] = [bbox[1], bbox[0]];
        const northEast: [number, number] = [bbox[3], bbox[2]];
        map.fitBounds([southWest, northEast], { maxZoom: maxFitToBoundsZoom });
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
  baseLayers,
  featureCollection,
}) => {
  const activeBaseLayers = baseLayers?.filter(
    (layer) => layer.uiOptions.isActive
  );

  const pointGeometryFeatures = featureCollection.features.filter(
    (f) => f.geometry.type === 'Point'
  );

  return (
    <MapContainer
      center={startingCenterPosition}
      zoom={3}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
      minZoom={2} // 2 typically prevents zooming out too far to see multiple earths
      maxZoom={24}
      maxBounds={maxBounds}
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
        {pointGeometryFeatures.map((f) => {
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
