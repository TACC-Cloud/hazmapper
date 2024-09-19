import React from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Map from '../../components/Map';
import AssetsPanel from '../../components/AssetsPanel';
import ManageMapProjectModal from '../../components/ManageMapProjectModal';
import { queryPanelKey, Panel } from '../../utils/panels';
import { useFeatures, useProject, useTileServers } from '../../hooks';
import { useParams } from 'react-router-dom';
import styles from './MapProject.module.css';
import MapProjectNavBar from '../../components/MapProjectNavBar';
import Filters from '../../components/FiltersPanel/Filter';
import { assetTypeOptions } from '../../components/FiltersPanel/Filter';

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
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<string[]>(
    Object.keys(assetTypeOptions)
  );
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );

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

  const canFetchProjectFeaturesOrLayers =
    !isActiveProjectLoading && !activeProjectError && !!activeProject;

  const {
    data: rawFeatureCollection,
    isLoading: isFeaturesLoading,
    error: featuresError,
  } = useFeatures({
    projectId: activeProject?.id,
    isPublic,
    options: {
      enabled: canFetchProjectFeaturesOrLayers,
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
      enabled: canFetchProjectFeaturesOrLayers,
    },
  });

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const activePanel = queryParams.get(queryPanelKey);

  /* TODO_REACT show error and improve spinner https://tacc-main.atlassian.net/browse/WG-260*/
  const error = activeProjectError || featuresError || tileServerLayersError;

  if (error) {
    console.error(error);
  }

  const loading =
    isActiveProjectLoading || isFeaturesLoading || isTileServerLayersLoading;

  const featureCollection = rawFeatureCollection ?? {
    type: 'FeatureCollection',
    features: [],
  };

  return (
    <div className={styles.root}>
      <div className={styles.topNavbar}>MapTopNavBar</div>
      <div className={styles.mapControlBar}>
        MapTopControlBar
        {loading && <div> loading</div>}
      </div>
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
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
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
            featureCollection={featureCollection}
          />
        </div>
      </div>
    </div>
  );
};

export default MapProject;
