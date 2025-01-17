import React, { createContext, useState, ReactNode } from 'react';

interface MapPosition {
  lat: number; // Latitude in decimal degrees
  lng: number; // Longitude in decimal degrees
  zoom: number; // Current map zoom level
}

/**
 * Context for sharing map position state across components
 */
interface MapContextType {
  position: MapPosition | null;
  setPosition: React.Dispatch<React.SetStateAction<MapPosition | null>>;
}

export const MapContext = createContext<MapContextType | null>(null);

/**
 * Provider component for map position context
 * Must wrap components that use useMapMousePosition hook
 */
export const MapPositionProvider = ({ children }: { children: ReactNode }) => {
  const [position, setPosition] = useState<MapPosition | null>(null);
  return (
    <MapContext.Provider value={{ position, setPosition }}>
      {children}
    </MapContext.Provider>
  );
};

export { type MapPosition };
