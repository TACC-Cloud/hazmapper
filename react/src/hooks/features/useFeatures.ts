import {
  useQueryClient,
  UseQueryResult,
  QueryKey,
} from '@tanstack/react-query';
import { FeatureCollection } from '@hazmapper/types';
import { useGet } from '@hazmapper/requests';
import type { Dayjs } from 'dayjs';

interface UseFeaturesParams {
  projectId: number;
  isPublicView: boolean;
  assetTypes: string[];
  startDate?: Dayjs;
  endDate?: Dayjs;
  toggleDateFilter?: boolean;
  options?: object;
}

export const KEY_USE_FEATURES = 'activeProjectFeatures';

export const useFeatures = ({
  projectId,
  isPublicView,
  assetTypes,
  startDate,
  endDate,
  toggleDateFilter,
  options = {},
}: UseFeaturesParams): UseQueryResult<FeatureCollection> => {
  const endpoint = `/projects/${projectId}/features/`;

  let queryParams = {};
  if (assetTypes?.length) {
    queryParams = {
      ...queryParams,
      assetType: assetTypes.join(','),
    };
  }
  if (startDate && endDate && toggleDateFilter) {
    queryParams = {
      ...queryParams,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }

  const defaultQueryOptions = {
    /* Expensive to fetch and process so we only fetch when updated */
    staleTime: Infinity /* "" */,
    gcTime: Infinity /* "" */,
    refetchOnWindowFocus: false /* "" */,
    refetchOnMount: false /* "" */,
    refetchOnReconnect: false /* "" */,
  };

  const query = useGet<FeatureCollection>({
    endpoint,
    key: [
      KEY_USE_FEATURES,
      {
        projectId,
        isPublicView,
        assetTypes,
        queryParams,
      },
    ],
    options: { ...defaultQueryOptions, ...options },
    params: queryParams,
  });
  return query;
};

interface CurrentFeaturesResult {
  data: FeatureCollection | undefined;
  isLatestQueryPending: boolean;
  isLatestQueryError: boolean;
}
/**
 * A hook that retrieves the most recently retrieved feature collection and provides
 * access of loading/error state for ongoing queries.
 *
 * This hook tracks both the latest successful query data and the current query state.
 * It will:
 * - Always return the most recent successfully fetched data (if any exists)
 * - Show loading state when the latest query is pending
 * - Show error state if the latest query failed
 * - Keep showing stale data even during loading or error states
 *
 * This is useful when:
 * - You need access to feature data but don't know the exact query parameters used to originally fetch it
 * - You want to show stale data while new data is loading
 * - You want to handle loading/error states while preserving the last known good data
 */
export const useCurrentFeatures = (): CurrentFeaturesResult => {
  const queryClient = useQueryClient();
  const latestSuccessfulQuery = queryClient
    .getQueriesData<FeatureCollection>({ queryKey: [KEY_USE_FEATURES] })
    .filter(([, value]) => Boolean(value))
    .reduce<[QueryKey, FeatureCollection | undefined]>(
      (latest, current) => {
        const currentState = queryClient.getQueryState(current[0]);
        const latestState = latest
          ? queryClient.getQueryState(latest[0])
          : null;
        if (
          !latestState ||
          (currentState &&
            currentState.dataUpdatedAt > latestState.dataUpdatedAt)
        ) {
          return current;
        }
        return latest;
      },
      [[], undefined]
    );

  // Get the absolute latest query (might be pending or error)
  const latestQuery = queryClient
    .getQueriesData<FeatureCollection>({ queryKey: [KEY_USE_FEATURES] })
    .reduce<[QueryKey, FeatureCollection | undefined]>(
      (latest, current) => {
        const currentState = queryClient.getQueryState(current[0]);
        const latestState = latest
          ? queryClient.getQueryState(latest[0])
          : null;
        if (
          !latestState ||
          (currentState &&
            currentState.dataUpdatedAt > latestState.dataUpdatedAt)
        ) {
          return current;
        }
        return latest;
      },
      [[], undefined]
    );

  const latestQueryState =
    latestQuery[0].length > 0
      ? queryClient.getQueryState(latestQuery[0])
      : null;

  return {
    data: latestSuccessfulQuery?.[1],
    isLatestQueryPending: latestQueryState?.status === 'pending',
    isLatestQueryError: latestQueryState?.status === 'error',
  };
};
