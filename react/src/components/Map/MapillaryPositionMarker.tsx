import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { useMapillaryViewer } from '@hazmapper/hooks/streetview';
import { createFeatureTypeMarker } from '@hazmapper/components/Map/markerCreators';
import { FeatureType } from '@hazmapper/types';

/**
 * Component that displays a marker on the map at the current Mapillary viewer position.
 * Only visible when the Mapillary viewer is active (show === true).
 */
const MapillaryPositionMarker: React.FC = () => {
  // Get the necessary context values
  const { currentPosition, show } = useMapillaryViewer();

  const markerIcon = createFeatureTypeMarker(FeatureType.Streetview);

  // Only render the marker if we have a position and the viewer is shown
  if (!show || !currentPosition) return null;

  return (
    <Marker position={currentPosition} icon={markerIcon}>
      <Popup>Current Mapillary Position</Popup>
    </Marker>
  );
};

export default MapillaryPositionMarker;
