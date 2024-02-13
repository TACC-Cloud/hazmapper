import React from 'react';
import { useLocation } from 'react-router-dom';
import Map from '../../components/Map';
import AssetsPanel from '../../components/AssetsPanel';
import ManageMapProjectModal from '../../components/ManageMapProjectModal';
import { queryPanelKey, Panel } from '../../utils/panels';

import { tileServerLayers } from '../../__fixtures__/tileServerLayerFixture';
import { featureCollection } from '../../__fixtures__/featuresFixture';
import { useParams } from 'react-router-dom';
import { QueryNavItem } from '../../core-wrappers';
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

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const activePanel = queryParams.get(queryPanelKey);

  console.log(projectUUID);
  console.log(isPublic);

  return (
    <div className={styles.root}>
      <div className={styles.navbar}>MapTopNavBar</div>
      <div className={styles.mapControlBar}>MapTopControlBar</div>
      <div className={styles.container}>
        <div className={styles.panelNavigation}>
          <QueryNavItem
            icon="applications" /* TODO_REACT*/
            to={
              activePanel == Panel.Assets
                ? ''
                : `?${queryPanelKey}=${Panel.Assets}`
            }
            active={activePanel == Panel.Assets}
          >
            Assets
          </QueryNavItem>
          <QueryNavItem
            icon="upload" /* TODO_REACT*/
            to={
              activePanel == Panel.PointClouds
                ? ''
                : `?${queryPanelKey}=${Panel.PointClouds}`
            }
            active={activePanel == Panel.PointClouds}
          >
            Point Clouds
          </QueryNavItem>
          <QueryNavItem
            icon="burger" /* TODO_REACT*/
            to={
              activePanel == Panel.Layers
                ? ''
                : `?${queryPanelKey}=${Panel.Layers}`
            }
            active={activePanel == Panel.Layers}
          >
            Layers
          </QueryNavItem>
          <QueryNavItem
            icon="search" /* TODO_REACT*/
            to={
              activePanel == Panel.Filters
                ? ''
                : `?${queryPanelKey}=${Panel.Filters}`
            }
            active={activePanel == Panel.Filters}
          >
            Filters
          </QueryNavItem>
          <QueryNavItem
            icon="reverse-order" /* TODO_REACT*/
            to={
              activePanel == Panel.Streetview
                ? ''
                : `?${queryPanelKey}=${Panel.Streetview}`
            }
            active={activePanel == Panel.Streetview}
          >
            Streetview
          </QueryNavItem>
          <QueryNavItem
            icon="project" /* TODO_REACT*/
            to={
              activePanel == Panel.Manage
                ? ''
                : `?${queryPanelKey}=${Panel.Manage}`
            }
            active={activePanel == Panel.Manage}
          >
            Manage
          </QueryNavItem>
        </div>
        {activePanel && activePanel !== Panel.Manage && (
          <div className={styles.panelContainer}>
            {activePanel === Panel.Assets && <AssetsPanel />}
          </div>
        )}
        {activePanel === Panel.Manage && <ManageMapProjectModal />}
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
