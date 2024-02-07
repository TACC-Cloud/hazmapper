import React from 'react';
import Map from '../../components/Map';
import { tileServerLayers } from '../../__fixtures__/tileServerLayerFixture';
import { useFeatures, useProject } from '../../hooks';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../core-components';

interface Props {
  /**
   * Whether or not the map project is public.
   * @default false
   */
  isPublic?: boolean;
}

/**
 * A component that displays a map project (a map and related data)
 */
const MapProject: React.FC<Props> = ({ isPublic = false }) => {
  const { projectUUID } = useParams();

  const {
    data: activeProject,
    isLoading: isActiveProjectLoading,
    error: activeProjectError,
  } = useProject({
    projectUUID,
    isPublic,
    options: { enabled: !!projectUUID },
  });

  const {
    data: featureCollection,
    isLoading: isFeaturesLoading,
    error: featuresError,
  } = useFeatures({
    projectId: activeProject?.id,
    isPublic,
    options: {
      enabled:
        !isActiveProjectLoading && !activeProjectError && !!activeProject,
    },
  });

  if (isActiveProjectLoading || isFeaturesLoading) {
    return <LoadingSpinner />;
  }
  if (activeProjectError || featuresError) {
    return null; /* TODO_REACT show error*/
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Map
        baseLayers={tileServerLayers}
        featureCollection={
          featureCollection
            ? featureCollection
            : {
                type: 'FeatureCollection',
                features: [],
              }
        }
      />
    </div>
  );
};

export default MapProject;
