import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Layout, Flex } from 'antd';
import { Message, LoadingSpinner } from '@tacc/core-components';

import Map from '@hazmapper/components/Map';
import AssetsPanel from '@hazmapper/components/AssetsPanel';
import AssetDetail from '@hazmapper/components/AssetDetail';
import LayersPanel from '@hazmapper/components/LayersPanel';
import ManageMapProjectModal from '@hazmapper/components/ManageMapProjectModal';
import { queryPanelKey, Panel } from '@hazmapper/utils/panels';
import {
  useFeatures,
  useProject,
  useGetTileServers,
  useFeatureSelection,
  KEY_USE_FEATURES,
} from '@hazmapper/hooks';
import MapProjectNavBar from '@hazmapper/components/MapProjectNavBar';
import Filters from '@hazmapper/components/FiltersPanel/Filter';
import { assetTypeOptions } from '@hazmapper/components/FiltersPanel/Filter';
import { Project } from '@hazmapper/types';
import HeaderNavBar from '@hazmapper/components/HeaderNavBar';
import styles from './MapProject.module.css';
import { Spinner } from '@hazmapper/common_components';
import { Panel as BasePanel } from '@hazmapper/components/Panel';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm, FormProvider } from 'react-hook-form';

export const tileLayerSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Required'),
  type: z.string(),
  url: z.string().url().min(1, 'Required'),
  attribution: z.string(),
  tileOptions: z.object({
    maxZoom: z.number().nullish(),
    minZoom: z.number().nullish(),
    maxNativeZoom: z.number().nullish(),
    format: z.string().nullish(),
    layers: z.string().nullish(),
  }),
  uiOptions: z.object({
    zIndex: z.number(),
    opacity: z.number(),
    isActive: z.boolean(),
    showInput: z.boolean().nullish(),
    showDescription: z.boolean().nullish(),
  }),
});

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
        <Message tagName="span" type="error">
          Error loading project
        </Message>
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
  } = useGetTileServers({
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

  const { Header, Content, Sider } = Layout;

  const formSchema = z.object({
    tileLayers: z.array(
      z.object({
        layer: tileLayerSchema, // Need to nest tile layer here since useFieldArray will add it's own `id` field, overwriting our own
      })
    ),
  });

  const initialValues = useMemo(
    () => ({
      tileLayers:
        tileServerLayers
          ?.sort((a, b) => b.uiOptions.zIndex - a.uiOptions.zIndex)
          .map((layer) => ({ layer })) || [],
    }),
    [tileServerLayers]
  );

  const methods = useForm({
    defaultValues: initialValues,
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const { reset } = methods;

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <FormProvider {...methods}>
      <Layout style={{ height: '100vh' }}>
        <Header>
          <HeaderNavBar />
          <div className={styles.mapControlBar}>
            MapTopControlBar TODO https://tacc-main.atlassian.net/browse/WG-260
          </div>
        </Header>
        <Layout>
          <Sider width="auto">
            <Flex
              style={{
                overflowY: 'auto',
                height: '100%',
              }}
            >
              <MapProjectNavBar />
              {activePanel && activePanel !== Panel.Manage && !loading && (
                <BasePanel
                  panelTitle={activePanel}
                  className={styles.panelContainer}
                >
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
                  {activePanel === Panel.Layers && (
                    <LayersPanel
                      projectId={activeProject.id}
                      isPublicView={isPublicView}
                    />
                  )}
                </BasePanel>
              )}
            </Flex>
          </Sider>
          <Content>
            {loading ? (
              <Spinner />
            ) : (
              <>
                {activePanel === Panel.Manage && (
                  <ManageMapProjectModal isPublicView={isPublicView} />
                )}
                <div className={styles.map}>
                  <Map featureCollection={featureCollection} />
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
              </>
            )}
          </Content>
        </Layout>
      </Layout>
    </FormProvider>
  );
};

export default MapProject;
