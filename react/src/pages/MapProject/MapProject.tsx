import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { Message, Button, LoadingSpinner } from '@tacc/core-components';

import Map from '@hazmapper/components/Map';
import AssetsPanel from '@hazmapper/components/AssetsPanel';
import AssetDetail from '@hazmapper/components/AssetDetail';
import ManageMapProjectModal from '@hazmapper/components/ManageMapProjectModal';
import { queryPanelKey, Panel } from '@hazmapper/utils/panels';
import {
  useFeatures,
  useProject,
  useAuthenticatedUser,
  useTileServers,
  useFeatureSelection,
  KEY_USE_FEATURES,
} from '@hazmapper/hooks';
import * as ROUTES from '@hazmapper/constants/routes';
import MapProjectNavBar from '@hazmapper/components/MapProjectNavBar';
import MapControlBar from '@hazmapper/components/MapControlBar';
import Filters from '@hazmapper/components/FiltersPanel/Filter';
import { assetTypeOptions } from '@hazmapper/components/FiltersPanel/Filter';
import { Project } from '@hazmapper/types';
import HeaderNavBar from '@hazmapper/components/HeaderNavBar';
import { MapPositionProvider } from '@hazmapper/context/MapContext';

import styles from './MapProject.module.css';

interface MapProjectAccessErrorProps {
  error: any;
}

const MapProjectAccessError: React.FC<MapProjectAccessErrorProps> = ({
  error,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: authenticatedUser } = useAuthenticatedUser();
  const isLoggedIn = !!authenticatedUser;

  const getMessage = () => {
    if (!error?.response) {
      return 'Unable to load map project due to a server error';
    }

    switch (error.response.status) {
      case 404:
        return 'This map project does not exist';
      case 403:
        return isLoggedIn
          ? "You don't have permission to access this map project"
          : 'Please log in.'; /* no op as before this point, we ensure users are logged in non-public maps */
      case 500:
        return 'Unable to load map project due to a server error';
      default:
        return 'Unable to access this map';
    }
  };

  const is403AndNotLoggedIn = error?.response?.status === 403 && !isLoggedIn;

  return (
    <div className={styles.errorContainer}>
      <Message type="error">
        <p>{getMessage()}</p>
        {is403AndNotLoggedIn && (
          <Button
            type="link"
            className={styles.userName}
            onClick={() => {
              const url = `${ROUTES.LOGIN}?to=${encodeURIComponent(
                location.pathname
              )}`;
              navigate(url);
            }}
          >
            Login
          </Button>
        )}
      </Message>
    </div>
  );
};

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
      queryClient.removeQueries({ queryKey: [KEY_USE_FEATURES] });
    };
  }, [projectUUID, queryClient]);

  if (isLoading) {
    return (
      <div className={styles.root}>
        <HeaderNavBar />
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !activeProject) {
    return (
      <div className={styles.root}>
        <HeaderNavBar />
        <MapProjectAccessError error={error} />;
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
  const [toggleDateFilter, setToggleDateFilter] = React.useState(false);
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
    toggleDateFilter,
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

  const featureCollection = rawFeatureCollection ?? {
    type: 'FeatureCollection',
    features: [],
  };

  return (
    <MapPositionProvider>
      <div className={styles.root}>
        <HeaderNavBar />
        <MapControlBar
          activeProject={activeProject}
          isPublicView={isPublicView}
        />
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
                toggleDateFilter={toggleDateFilter}
                setToggleDateFilter={setToggleDateFilter}
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
    </MapPositionProvider>
  );
};

export default MapProject;
