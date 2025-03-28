import React, {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { LatLngTuple } from 'leaflet';

interface MapillaryViewerContextType {
  sequenceId: string;
  setSequenceId: Dispatch<SetStateAction<string>>;
  imageId: string;
  setImageId: Dispatch<SetStateAction<string>>;
  currentPosition: LatLngTuple | null;
  setCurrentPosition: Dispatch<SetStateAction<LatLngTuple | null>>;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
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
