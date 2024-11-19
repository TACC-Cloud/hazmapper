import React, { useMemo } from 'react';
import {
  MapContainer,
  ZoomControl,
  Marker,
  Popup,
  TileLayer,
  WMSTileLayer,
} from 'react-leaflet';
import { TiledMapLayer } from 'react-esri-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import * as L from 'leaflet';
import { MarkerCluster } from 'leaflet';
import 'leaflet.markercluster';

import 'leaflet/dist/leaflet.css';

import { TileServerLayer, FeatureCollection } from '@hazmapper/types';
import { MAP_CONFIG } from './config';
import FitBoundsHandler from './FitBoundsHandler';

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
