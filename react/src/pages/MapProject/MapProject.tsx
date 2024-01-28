import React from 'react';
import Map from '../../components/Map';
import { tileServerLayers } from '../../__fixtures__/tileServerLayerFixture';
import { featureCollection } from '../../__fixtures__/featuresFixture';
import { useParams } from 'react-router-dom';
import styles from './MapProject.module.css';

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
  console.log(isPublic);

  return (
    <div className={styles.root}>
      <div className={styles.navbar}>MapTopNavBar</div>
      <div className={styles.mapControlBar}>MapTopControlBar</div>
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          {/* NavBarPanel (name?)  
             - push button - extends panel to show asset list or other custom ui when button is active
             - some push buttons - might open Modal
             
             */}
          <div>MapLeftBar Entry 1</div>
          <div>MapLeftBar Entry 2</div>
          <div>MapLeftBar Entry 3</div>
          <div>MapLeftBar Entry 4</div>
        </div>
        <div className={styles.map}>
          <Map
            baseLayers={tileServerLayers}
            featureCollection={featureCollection}
          />
        </div>
      </div>
    </div>
  );
};

export default MapProject;
