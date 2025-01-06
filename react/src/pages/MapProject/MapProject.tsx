import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';

import { Message, LoadingSpinner } from '@tacc/core-components';

import Map from '@hazmapper/components/Map';
import AssetsPanel from '@hazmapper/components/AssetsPanel';
import AssetDetail from '@hazmapper/components/AssetDetail';
import ManageMapProjectModal from '@hazmapper/components/ManageMapProjectModal';
import { queryPanelKey, Panel } from '@hazmapper/utils/panels';
import {
  useFeatures,
  useProject,
  useTileServers,
  useFeatureSelection,
  KEY_USE_FEATURES,
} from '@hazmapper/hooks';
import MapProjectNavBar from '@hazmapper/components/MapProjectNavBar';
import Filters from '@hazmapper/components/FiltersPanel/Filter';
import { assetTypeOptions } from '@hazmapper/components/FiltersPanel/Filter';
import { Project } from '@hazmapper/types';
import HeaderNavBar from '@hazmapper/components/HeaderNavBar';
import styles from './MapProject.module.css';

interface MapProjectProps {
  /**
   * Whether or not the map project is public.
   * @default false
   */
  isPublicView?: boolean;
}

/**
 * A component that displays a map project including initial loading/error components
 */
const MapProject: React.FC<MapProjectProps> = ({ isPublicView = false }) => {
  const { projectUUID } = useParams();
  const queryClient = useQueryClient();

  const {
    data: activeProject,
    isLoading,
    error,
  } = useProject({
    projectUUID,
    isPublicView,
    options: { enabled: !!projectUUID },
  });

  // Clear feature queries when changing projects to prevent stale features from
  // briefly appearing and causing incorrect map bounds/zoom during navigation
  useEffect(() => {
    return () => {
      queryClient.removeQueries([KEY_USE_FEATURES]);
    };
  }, [projectUUID, queryClient]);

  if (isLoading) {
    /* TODO_REACT show error and improve spinner https://tacc-main.atlassian.net/browse/WG-260*/
    return (
      <div className={styles.root}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !activeProject) {
    /* TODO_REACT show error and improve spinner https://tacc-main.atlassian.net/browse/WG-260

      * if no access, note why (missing project vs no access to project)
      * if not logged in and project exists but they might have access, prompt to log in to see if accesable
    */

    return (
      <div className={styles.errorContainer}>
        <Message type="error">Error loading project</Message>
      </div>
    );
  }

  return (
    <LoadedMapProject
      isPublicView={isPublicView}
      activeProject={activeProject}
    />
  );
};

interface LoadedMapProject {
  /**
   * Active project
   */
  activeProject: Project;

  /**
   * Whether or not the map project is public.
   */
  isPublicView;
}

/**
 * A component that displays a map project (a map and related data)
 */
const LoadedMapProject: React.FC<LoadedMapProject> = ({
  activeProject,
  isPublicView,
}) => {
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<string[]>(
    Object.keys(assetTypeOptions)
  );
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
  const { selectedFeature, setSelectedFeatureId: toggleSelectedFeature } =
    useFeatureSelection();

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
    data: rawFeatureCollection,
    isLoading: isFeaturesLoading,
    error: featuresError,
  } = useFeatures({
    projectId: activeProject.id,
    isPublicView,
    assetTypes: formattedAssetTypes,
    startDate,
    endDate,
  });

  const {
    data: tileServerLayers,
    isLoading: isTileServerLayersLoading,
    error: tileServerLayersError,
  } = useTileServers({
    projectId: activeProject.id,
    isPublicView,
  });

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const activePanel = queryParams.get(queryPanelKey);

  const error = featuresError || tileServerLayersError;

  if (error) {
    /* TODO https://tacc-main.atlassian.net/browse/WG-260 */
    console.error(error);
  }

  const loading = isFeaturesLoading || isTileServerLayersLoading;

  const featureCollection = rawFeatureCollection ?? {
    type: 'FeatureCollection',
    features: [],
  };

  return (
    <div className={styles.root}>
      <HeaderNavBar />
      <div className={styles.mapControlBar}>
        MapTopControlBar TODO https://tacc-main.atlassian.net/browse/WG-260
        {loading && <div> loading</div>}
      </div>
      <div className={styles.container}>
        <MapProjectNavBar />
        {activePanel && activePanel !== Panel.Manage && (
          <div className={styles.panelContainer}>
            {activePanel === Panel.Assets && (
              <AssetsPanel
                project={activeProject}
                isPublicView={isPublicView}
                featureCollection={featureCollection}
              />
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
          <ManageMapProjectModal isPublicView={isPublicView} />
        )}
        <div className={styles.map}>
          <Map
            baseLayers={tileServerLayers}
            featureCollection={featureCollection}
          />
        </div>
        {selectedFeature && (
          <div className={styles.detailContainer}>
            <AssetDetail
              selectedFeature={selectedFeature}
              onClose={() => toggleSelectedFeature(selectedFeature.id)}
              isPublicView={activeProject.public}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapProject;
