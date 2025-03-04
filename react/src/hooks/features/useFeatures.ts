import { useMemo } from 'react';
import { create } from 'zustand';
import { UseQueryResult } from '@tanstack/react-query';
import { FeatureCollection } from '@hazmapper/types';
import { useGet } from '@hazmapper/requests';
import type { Dayjs } from 'dayjs';

interface UseFeaturesParams {
  projectId: number;
  assetTypes: string[];
  startDate?: Dayjs;
  endDate?: Dayjs;
  toggleDateFilter?: boolean;
  options?: object;
}

export const KEY_USE_FEATURES = 'activeProjectFeatures';

export const useFeatures = ({
  projectId,
  assetTypes,
  startDate,
  endDate,
  toggleDateFilter,
  options = {},
}: UseFeaturesParams): UseQueryResult<FeatureCollection> => {
  // TODO can be reworked as /projects can be used and /public-projects can be removed since we are no longer a WSO2 API
  const endpoint = `/projects/${projectId}/features/`;

  const queryParams = useMemo(() => {
    let params: Record<string, string> = {};
    if (assetTypes?.length) {
      params = {
        ...params,
        assetType: assetTypes.join(','),
      };
    }
    if (startDate && endDate && toggleDateFilter) {
      params = {
        ...params,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
    }
    return params;
  }, [assetTypes, startDate, endDate, toggleDateFilter]);

  const queryKey = useMemo(() => {
    return [KEY_USE_FEATURES, JSON.stringify(queryParams)]; // Stringify to ensure stability
  }, [queryParams]);

  const mergedOptions = useMemo(() => {
    const defaultQueryOptions = {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    };

    return { ...defaultQueryOptions, ...options };
  }, [options]);

  const query = useGet<FeatureCollection>({
    endpoint,
    key: queryKey,
    options: mergedOptions,
    params: queryParams,
  });

  return query;
};

interface CurrentFeaturesStore {
  data: FeatureCollection | undefined;
  isFetching: boolean;
  isError: boolean;
  setReset: () => void;
  setCurrentFeatures: (
    data: FeatureCollection | undefined,
    loading: boolean,
    errror: boolean
  ) => void;
  setCurrentStatus: (loading: boolean, errror: boolean) => void;
}

/**
 * Zustand store for managing the most recently retrieved feature collection
 * and tracking the loading/error state of ongoing queries.
 */
export const useCurrentFeaturesStore = create<CurrentFeaturesStore>((set) => ({
  data: { type: 'FeatureCollection', features: [] },
  isFetching: false,
  isError: false,

  // Resets the store to its initial state
  setReset: () =>
    set({
      data: { type: 'FeatureCollection', features: [] },
      isFetching: false,
      isError: false,
    }),

  // Updates the store with new feature data and marks the query as complete
  setCurrentFeatures: (data, loading, error) =>
    set({ data, isFetching: loading, isError: error }),

  // Updates the loading and error states without modifying data.
  setCurrentStatus: (loading, error) =>
    set({ isFetching: loading, isError: error }),
}));

interface CurrentFeaturesResult {
  data: FeatureCollection | undefined;
  isFetching: boolean;
  isError: boolean;
}

/**
 * A hook that provides access to the most recently retrieved feature collection,
 * along with loading and error states for ongoing queries.
 *
 * This hook tracks:
 * - The latest successfully fetched feature data.
 * - The current query’s loading and error states.
 *
 * Useful for:
 * - Accessing feature data without needing to track the exact query parameters.
 * - Displaying stale data while new data is loading.
 * - Handling loading/error states while ensuring the last known good data is available.
 *
 * This hook reflects only the main feature query used in the app.
 */
export const useCurrentFeatures = (): CurrentFeaturesResult => {
  const data = useCurrentFeaturesStore((state) => state.data);
  const isFetching = useCurrentFeaturesStore((state) => state.isFetching);
  const isError = useCurrentFeaturesStore((state) => state.isError);

  return { data, isFetching, isError };
};
