import { useContext, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { MapContext, MapPosition } from '@hazmapper/context/MapContext';

/**
 * Hook that accesses the map context for position state
 */
export const useMapMousePosition = () => {
  const context = useContext(MapContext);
  if (!context) throw new Error('Must be used within MapPositionProvider');
  return context;
};

/**
 * Hook that tracks mouse position on map.
 * Sets position in context when mouse moves or zoom changes.
 * Must be used inside react-leaflets' MapContainer component.
 *
 */
export const useMapMousePositionWriter = () => {
  const map = useMap();
  const { setPosition } = useMapMousePosition();

  useEffect(() => {
    if (!map || !setPosition) return;

    const updatePosition = (e: L.LeafletMouseEvent) => {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        zoom: map.getZoom(),
      });
    };

    const updateZoom = () => {
      setPosition((prev: MapPosition | null) => {
        if (!prev) return null;
        return {
          ...prev,
          zoom: map.getZoom(),
        };
      });
    };

    map.on('mousemove', updatePosition);
    map.on('zoomend', updateZoom);
    map.on('mouseout', () => setPosition(null));

    return () => {
      map.off('mousemove', updatePosition);
      map.off('zoomend', updateZoom);
      map.off('mouseout', () => setPosition(null));
    };
  }, [map, setPosition]);
};
