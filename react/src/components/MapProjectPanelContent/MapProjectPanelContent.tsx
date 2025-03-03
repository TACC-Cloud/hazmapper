import React from 'react';
import { Project } from '@hazmapper/types';
import AssetsPanel from '@hazmapper/components/AssetsPanel';
import PointCloudPanel from '@hazmapper/components/PointCloudsPanel';
import LayersPanel from '@hazmapper/components/LayersPanel';
import ManageMapProjectPanel from '@hazmapper/components/ManageMapProjectPanel';
import StreetviewPanel from '@hazmapper/components/StreetviewPanel';
import PublicInfoPanel from '@hazmapper/components/PublicInfoPanel';
import { Panel as BasePanel } from '@hazmapper/components/Panel';
import { queryPanelKey, Panel } from '@hazmapper/utils/panels';
import Filters from '@hazmapper/components/FiltersPanel/Filter';
import styles from './MapProjectPanelContent.module.css';

import { Dayjs } from 'dayjs';
import { useLocation } from 'react-router-dom';

interface MapProjectPanelContentProps {
  isPublicView: boolean;
  project: Project;
  selectedAssetTypes: string[];
  onFiltersChange: (selectedAssetTypes: string[]) => void;
  startDate: Dayjs;
  setStartDate: (date: Dayjs) => void;
  endDate: Dayjs;
  setEndDate: (date: Dayjs) => void;
  toggleDateFilter: boolean;
  setToggleDateFilter: (toggleDateFilter: boolean) => void;
}

const MapProjectPanelContent: React.FC<MapProjectPanelContentProps> = ({
  isPublicView,
  project,
  selectedAssetTypes,
  onFiltersChange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  toggleDateFilter,
  setToggleDateFilter,
}) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activePanel = queryParams.get(queryPanelKey);

  if (!activePanel) return null;

  return (
    <BasePanel
      panelTitle={activePanel}
      className={
        activePanel === Panel.Manage
          ? styles.panelContainerWide
          : styles.panelContainer
      }
    >
      {activePanel === Panel.Assets && (
        <AssetsPanel project={project} isPublicView={isPublicView} />
      )}
      {activePanel === Panel.Filters && (
        <Filters
          selectedAssetTypes={selectedAssetTypes}
          onFiltersChange={onFiltersChange}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          toggleDateFilter={toggleDateFilter}
          setToggleDateFilter={setToggleDateFilter}
        />
      )}
      {activePanel === Panel.PointClouds && !isPublicView && (
        <PointCloudPanel project={project} />
      )}
      {activePanel === Panel.Layers && (
        <LayersPanel projectId={project.id} isPublicView={isPublicView} />
      )}
      {activePanel === Panel.Streetview && <StreetviewPanel />}
      {activePanel === Panel.Manage && !isPublicView && (
        <ManageMapProjectPanel project={project} />
      )}
      {activePanel === Panel.Info && isPublicView && (
        <PublicInfoPanel project={project} isPublicView={true} />
      )}
    </BasePanel>
  );
};

MapProjectPanelContent.displayName = 'MapProjectPanelContent';

export default React.memo(MapProjectPanelContent);
