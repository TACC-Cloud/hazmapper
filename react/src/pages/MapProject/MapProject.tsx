import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Map from '../../components/Map';
import AssetsPanel from '../../components/AssetsPanel';

import { Button } from '../../core-components';
import { tileServerLayers } from '../../__fixtures__/tileServerLayerFixture';
import { featureCollection } from '../../__fixtures__/featuresFixture';
import { useParams } from 'react-router-dom';
import styles from './MapProject.module.css';

const queryPanelKey = 'panel';

enum ActivePanel {
  Assets = 'Assets',
  PointClouds = 'PointClouds',
  Layers = 'Layers',
  Filters = 'Filters',
  Streetview = 'Streetview',
  Manage = 'Manage',
}

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
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const activePanel = queryParams.get(queryPanelKey);

  const togglePanel = (panel: ActivePanel) => {
    if (queryParams.get(queryPanelKey) == panel) {
      queryParams.delete(queryPanelKey);
    } else {
      queryParams.set(queryPanelKey, panel);
    }
    navigate({ search: queryParams.toString() });
  };

  console.log(projectUUID);
  console.log(isPublic);

  return (
    <div className={styles.root}>
      <div className={styles.navbar}>MapTopNavBar</div>
      <div className={styles.mapControlBar}>MapTopControlBar</div>
      <div className={styles.container}>
        <div className={styles.panelNavigation}>
          <Button onClick={() => togglePanel(ActivePanel.Assets)}>
            Assets
          </Button>
          <Button onClick={() => togglePanel(ActivePanel.PointClouds)}>
            Point Clouds
          </Button>
          <Button onClick={() => togglePanel(ActivePanel.Layers)}>
            Layers
          </Button>
          <Button onClick={() => togglePanel(ActivePanel.Filters)}>
            Filters
          </Button>
          <Button onClick={() => togglePanel(ActivePanel.Streetview)}>
            Streetview
          </Button>
          <Button onClick={() => togglePanel(ActivePanel.Manage)}>
            Manage
          </Button>
        </div>
        {activePanel && (
          <div className={styles.panelContainer}>
            {activePanel === ActivePanel.Assets && <AssetsPanel />}
          </div>
        )}

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
