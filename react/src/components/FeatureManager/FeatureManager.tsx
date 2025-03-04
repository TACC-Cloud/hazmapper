import React, { useEffect } from 'react';
import { Dayjs } from 'dayjs';
import {
  useCurrentFeaturesStore,
  useFeatures,
  KEY_USE_FEATURES,
} from '@hazmapper/hooks';
import { useQueryClient } from '@tanstack/react-query';

interface FeatureManagerProps {
  projectId: number;
  assetTypes: string[];
  startDate: Dayjs;
  endDate: Dayjs;
  toggleDateFilter: boolean;
}

/**
 * FeatureManager is responsible for fetching and managing feature data using React Query (`useFeatures`)
 * and syncing the results with Zustand (so that `useCurrentFeaturesStore` can be used in different places).
 */
export const FeatureManager: React.FC<FeatureManagerProps> = ({
  projectId,
  assetTypes,
  startDate,
  endDate,
  toggleDateFilter,
}) => {
  const queryClient = useQueryClient();
  const { setCurrentFeatures, setCurrentStatus, setReset } =
    useCurrentFeaturesStore.getState();

  const { data, isFetching, isPending, isError } = useFeatures({
    projectId,
    assetTypes,
    startDate,
    endDate,
    toggleDateFilter,
  });

  // Clear feature queries and our stored data when changing projects to prevent stale features from
  // briefly appearing and causing incorrect map bounds/zoom during navigation
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: [KEY_USE_FEATURES] });
      setReset();
    };
  }, [projectId, setReset, queryClient]);

  /**
   * Syncs the current query state from React Query to the Zustand store (`useCurrentFeatures`).
   * See useCurrentFeatures for more information.
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
