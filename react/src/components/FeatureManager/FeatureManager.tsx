import React, { useEffect } from 'react';
import { Dayjs } from 'dayjs';
import { useCurrentFeaturesStore, useFeatures } from '@hazmapper/hooks';

interface FeatureManagerProps {
  projectId: number;
  assetTypes: string[];
  startDate: Dayjs;
  endDate: Dayjs;
  toggleDateFilter: boolean;
}

/**
 * FeatureManager is responsible for fetching and managing feature data using React Query (`useFeatures`)
 * and syncing the results with Zustand (`useCurrentFeaturesStore`).
 */
export const FeatureManager: React.FC<FeatureManagerProps> = ({
  projectId,
  assetTypes,
  startDate,
  endDate,
  toggleDateFilter,
}) => {
  const { setCurrentFeatures, setCurrentStatus } =
    useCurrentFeaturesStore.getState();

  const { data, isFetching, isPending, isError } = useFeatures({
    projectId,
    assetTypes,
    startDate,
    endDate,
    toggleDateFilter,
  });

  /**
   * Syncs the current query state from React Query to the Zustand store (`useCurrentFeatures`).
   * See useCurrentFeatures for more invo
   */
  useEffect(() => {
    if (data) {
      setCurrentFeatures(data, isFetching || isPending, !!isError);
    } else {
      setCurrentStatus(isFetching || isPending, !!isError);
    }
  }, [
    data,
    isFetching,
    isPending,
    isError,
    setCurrentFeatures,
    setCurrentStatus,
  ]);

  return null;
};
