import React from 'react';
import Map from '../../components/Map';
import { tileServerLayers } from '../../__fixtures__/tileServerLayerFixture';
import { featureCollection } from '../../__fixtures__/featuresFixture';
import { useParams } from 'react-router-dom';

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
  const { projectUUID } = useParams<{ projectUUID: string }>();

  console.log(projectUUID);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* TODO for above and project, should we use style-components and/or CSS modules? */}
      <Map
        baseLayers={tileServerLayers}
        featureCollection={featureCollection}
      />
    </div>
  );
};

export default MapProject;
