import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/* TODO: review if best approach is to style map with .leaflet-container */

const centerPosition = [51.505, -0.09];

/**
 * A component that displays a leaflet map of hazmapper data
 */
const Map = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MapContainer
        center={centerPosition}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={centerPosition}>
          <Popup>Popup</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
