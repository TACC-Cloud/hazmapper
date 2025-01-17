import { useMapMousePositionWriter } from '@hazmapper/hooks';

/**
 * Component that tracks mouse position on a Leaflet map
 * Must be used inside a react-leaflet's MapContainer to write position state
 * Position can be read elsewhere using useMapMousePosition hook
 */
const PositionTracker = () => {
  useMapMousePositionWriter();
  return null;
};

export default PositionTracker;
