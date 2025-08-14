import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Flex } from 'antd';
import { LoadingSpinner, Message } from '@tacc/core-components';

import { FeatureManager } from '@hazmapper/components/FeatureManager';
import AssetDetail from '@hazmapper/components/AssetDetail';
import {
  useProject,
  useGetTileServers,
  useFeatureSelection,
  useGeoapiNotificationsPolling,
  useGetSystems,
  useMapillaryViewer,
} from '@hazmapper/hooks';
import MapProjectNavBar from '@hazmapper/components/MapProjectNavBar';
import MapProjectPanelContent from '@hazmapper/components/MapProjectPanelContent';
import MapProjectAccessError from '@hazmapper/components/MapProjectAccessError';
import MapControlBar from '@hazmapper/components/MapControlBar';
import { assetTypeOptions } from '@hazmapper/components/FiltersPanel/Filter';
import { Project } from '@hazmapper/types';
import HeaderNavBar from '@hazmapper/components/HeaderNavBar';
import { MapPositionProvider } from '@hazmapper/context/MapContext';

import styles from './MapProject.module.css';
import QuestionnaireModal from '@hazmapper/components/QuestionnaireModal';
import { Spinner } from '@hazmapper/common_components';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm, FormProvider } from 'react-hook-form';

import dayjs from 'dayjs';
import MapillaryViewer from '@hazmapper/components/MapillaryViewer';

import WebsocketNotifications from '@hazmapper/components/WebsocketNotifications';

const Map = React.lazy(() => import('@hazmapper/components/Map'));

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

  /* prefetch systems for non-public projects (for public projects,
   *  user might not be authed so can't get systems) as file manager
   * will need it
   */
  useGetSystems({ prefetch: !isPublicView, enabled: !isPublicView });

  /*TODO: notifications are user specific and lacking additional context.  See note in react/src/types/notification.ts and WG-431 */

  /* TODO:  to be replaced by a non-pulling approach via socket-io, WG-278 */
  // useGeoapiNotificationsPolling();

  const {
    data: activeProject,
    isLoading,
    error,
  } = useProject({
    projectUUID,
    options: { enabled: !!projectUUID },
  });

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
  if (isPublicView && activeProject.public === false) {
    return (
      <div className={styles.root}>
        <HeaderNavBar />
        <div className={styles.errorContainer}>
          <Message type="error" tagName="div">
            <p>This is not a public map</p>
          </Message>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadedMapProject
        isPublicView={isPublicView}
        activeProject={activeProject}
      />
      <WebsocketNotifications />
    </>
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
  const [startDate, setStartDate] = useState(dayjs().startOf('day'));
  const [endDate, setEndDate] = useState(dayjs().add(1, 'day').startOf('day'));

  const { selectedFeature, setSelectedFeatureId: toggleSelectedFeature } =
    useFeatureSelection();
  const { show: showMapillaryViewer, setShow: setShowMapillaryViewer } =
    useMapillaryViewer();
  const [isQuestionnaireModalOpen, setQuestionnaireModalOpen] = useState(false);
  const handleQuestionnaireClick = () => {
    setQuestionnaireModalOpen(true);
  };
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

  const { data: tileServerLayers, isLoading: isTileServerLayersLoading } =
    useGetTileServers({
      projectId: activeProject.id,
      isPublicView,
    });

  const { Content, Sider } = Layout;

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
      <MapPositionProvider>
        <Layout style={{ height: '100vh' }}>
          <HeaderNavBar />
          <MapControlBar
            activeProject={activeProject}
            isPublicView={isPublicView}
          />
          <Layout>
            <Sider width="auto">
              <Flex
                style={{
                  height: '100%',
                }}
              >
                <MapProjectNavBar isPublicView={isPublicView} />
                {!isTileServerLayersLoading && (
                  <MapProjectPanelContent
                    isPublicView={isPublicView}
                    project={activeProject}
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
              </Flex>
            </Sider>
            <Content>
              <FeatureManager
                projectId={activeProject.id}
                assetTypes={formattedAssetTypes}
                startDate={startDate}
                endDate={endDate}
                toggleDateFilter={toggleDateFilter}
              />
              {isTileServerLayersLoading ? (
                <Spinner />
              ) : (
                <Suspense fallback={<Spinner />}>
                  <Map />
                </Suspense>
              )}
              {selectedFeature && (
                <div className={styles.detailContainer}>
                  <AssetDetail
                    selectedFeature={selectedFeature}
                    onClose={() => toggleSelectedFeature(selectedFeature.id)}
                    isPublicView={isPublicView}
                    onQuestionnaireClick={handleQuestionnaireClick}
                  />
                </div>
              )}
              {selectedFeature && showMapillaryViewer && (
                <div className={styles.mapillaryViewerContainer}>
                  <MapillaryViewer
                    feature={selectedFeature}
                    onClose={() => setShowMapillaryViewer(false)}
                  />
                </div>
              )}
              {isQuestionnaireModalOpen && selectedFeature && (
                <QuestionnaireModal
                  isOpen={isQuestionnaireModalOpen}
                  close={() => setQuestionnaireModalOpen(false)}
                  feature={selectedFeature}
                />
              )}
            </Content>
          </Layout>
        </Layout>
      </MapPositionProvider>
    </FormProvider>
  );
};

export default MapProject;
