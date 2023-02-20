import React from 'react';
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  Marker,
  Popup,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import { tileServerLayer } from '../../types/tileServerLayer';

/* TODO: review if best approach is to style map with .leaflet-container */
/* TODO: consider createTileLayerComponent
/* TODO: support layers with type 'arcgis' and 'wms' (WMSTileLayer)*/

const centerPosition = [51.505, -0.09];

interface MapProps {
  /**
   * Tile servers used as base layers
   */
  baseLayers: tileServerLayer[];
}


/**
 * A component that displays a leaflet map of hazmapper data
 */
const Map: React.FC<MapProps> = ({ baseLayers }) => {

  const activeBaseLayers = baseLayers.filter((layer) => layer.uiOptions.isActive);

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

      <Marker position={centerPosition}>
        <Popup>Popup</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
