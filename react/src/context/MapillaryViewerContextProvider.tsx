import React, {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { LatLngTuple } from 'leaflet';

interface MapillaryViewerContextType {
  sequenceId: string; // ID of the current Mapillary sequence
  setSequenceId: Dispatch<SetStateAction<string>>; // Updates the current sequence ID

  imageId: string; // ID of the currently displayed image
  setImageId: Dispatch<SetStateAction<string>>; // Updates the current image ID

  currentPosition: LatLngTuple | null; // Geographical position of the current image
  setCurrentPosition: Dispatch<SetStateAction<LatLngTuple | null>>; // Updates the position

  show: boolean; // Whether the Mapillary viewer is currently visible
  setShow: Dispatch<SetStateAction<boolean>>; // Toggles visibility of the viewer
}

/**
 * Context for managing Mapillary viewer state (visibility, sequence adn position/imageid).
 */
export const MapillaryViewerContext =
  createContext<MapillaryViewerContextType | null>(null);

export const MapillaryViewerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [sequenceId, setSequenceId] = useState<string>('');
  const [imageId, setImageId] = useState<string>('');
  const [currentPosition, setCurrentPosition] = useState<LatLngTuple | null>(
    null
  );
  const [show, setShow] = useState<boolean>(false);

  return (
    <MapillaryViewerContext.Provider
      value={{
        sequenceId,
        setSequenceId,
        imageId,
        setImageId,
        currentPosition,
        setCurrentPosition,
        show,
        setShow,
      }}
    >
      {children}
    </MapillaryViewerContext.Provider>
  );
};
