import React from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useLeaflet,
} from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import { TileServerLayer, FeatureCollection } from '../../types';
import * as L from 'leaflet';
import 'leaflet.markercluster';

import 'leaflet/dist/leaflet.css';

/* TODO: review if best approach is to style map with .leaflet-container */
/* TODO: consider createTileLayerComponent
/* TODO: support layers with type 'arcgis' and 'wms' (WMSTileLayer)*/

const centerPosition = [32.6185055555556, -80.780375];

interface MapProps {
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
 */
const Map: React.FC<MapProps> = ({ baseLayers, featureCollection }) => {
  const activeBaseLayers = baseLayers.filter(
    (layer) => layer.uiOptions.isActive
  );

  const pointGeometryFeatures = featureCollection.features.filter(
    (f) => f.geometry.type === 'Point'
  );

  return (
    <MapContainer
      center={centerPosition}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
    >
      {activeBaseLayers.map((layer) => (
        <TileLayer
          key={layer.id}
          url={layer.url}
          attribution={layer.attribution}
          options={layer.tileOptions}
          zIndex={layer.uiOptions.zIndex}
          opacity={layer.uiOptions.opacity}
        />
      ))}
      <MarkerClusterGroup
        iconCreateFunction={(cluster) =>
          ClusterMarkerIcon(cluster.getChildCount())
        }
      >
        {pointGeometryFeatures.map((f) => (
          <Marker
            key={f.id}
            position={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
          >
            <Popup>{f.id}</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default Map;
