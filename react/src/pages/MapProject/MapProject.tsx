import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Map from '../../components/Map';
import AssetsPanel from '../../components/AssetsPanel';
import ManageMapProjectModal from '../../components/ManageMapProjectModal';
import { queryPanelKey, Panel } from '../../utils/panels';
import { useFeatures, useProject, useTileServers } from '../../hooks';
import { useParams } from 'react-router-dom';
import styles from './MapProject.module.css';
import { LoadingSpinner } from '../../core-components';
import MapProjectNavBar from '../../components/MapProjectNavBar';
import Filters from '../../components/FiltersPanel/Filter';

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
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<string[]>([]);

  useEffect(() => {
    if (initialLoad) {
      setSelectedAssetTypes([
        'Image',
        'Video',
        'PointCloud',
        'Streetview',
        'Questionnaire',
        'NoAssetVector',
      ]);
      setInitialLoad(false);
    }
  }, [initialLoad]);

  const formatAssetTypeName = (name: string) => {
    switch (name) {
      case 'PointCloud':
        return 'point_cloud';
      case 'NoAssetVector':
        return 'no_asset_vector';
      default:
        return name.toLowerCase();
    }
  };

  const formattedAssetTypes = selectedAssetTypes.map((type) =>
    formatAssetTypeName(type)
  );

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
    assetTypes: formattedAssetTypes,
  });

  const {
    data: tileServerLayers,
    isLoading: isTileServerLayersLoading,
    error: tileServerLayersError,
  } = useTileServers({
    projectId: activeProject?.id,
    isPublic,
    options: {
      enabled:
        !isActiveProjectLoading && !activeProjectError && !!activeProject,
    },
  });

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const activePanel = queryParams.get(queryPanelKey);

  if (
    isActiveProjectLoading ||
    isFeaturesLoading ||
    isTileServerLayersLoading
  ) {
    return <LoadingSpinner />;
  }
  if (activeProjectError || featuresError || tileServerLayersError) {
    return null; /* TODO_REACT show error and improve spinner https://tacc-main.atlassian.net/browse/WG-260*/
  }

  return (
    <div className={styles.root}>
      <div className={styles.topNavbar}>MapTopNavBar</div>
      <div className={styles.mapControlBar}>MapTopControlBar</div>
      <div className={styles.container}>
        <MapProjectNavBar />
        {activePanel && activePanel !== Panel.Manage && (
          <div className={styles.panelContainer}>
            {activePanel === Panel.Assets && (
              <AssetsPanel isPublic={isPublic} />
            )}
            {activePanel === Panel.Filters && (
              <Filters
                selectedAssetTypes={selectedAssetTypes}
                onFiltersChange={setSelectedAssetTypes}
              />
            )}
          </div>
        )}
        {activePanel === Panel.Manage && (
          <ManageMapProjectModal isPublic={isPublic} />
        )}
        <div className={styles.map}>
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
      </div>
    </div>
  );
};

export default MapProject;
