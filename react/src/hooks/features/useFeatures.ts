import {
  useQueryClient,
  UseQueryResult,
  QueryKey,
} from '@tanstack/react-query';
import { FeatureCollection } from '@hazmapper/types';
import { useGet } from '@hazmapper/requests';

interface UseFeaturesParams {
  projectId: number;
  isPublicView: boolean;
  assetTypes: string[];
  startDate?: Date;
  endDate?: Date;
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
  // TODO can be reworked as /projects can be used and /public-projects can be removed since we are no longer a WSO2 API
  const featuresRoute = isPublicView ? 'public-projects' : 'projects';
  let endpoint = `/${featuresRoute}/${projectId}/features/`;
  if (assetTypes?.length) {
    endpoint += `?assetType=${assetTypes.join(',')}`;
  }
  if (startDate && endDate && toggleDateFilter) {
    endpoint += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
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
        startDate,
        endDate,
        toggleDateFilter,
      },
    ],
    options: { ...defaultQueryOptions, ...options },
  });
  return query;
};

/**
 * A hook that retrieves the most recently updated feature collection from any active
 * useFeatures queries. This hook is useful when you need access to feature data but
 * don't know or don't want to specify the exact query parameters that were used to originally
 * fetch it.
 */
export const useCurrentFeatures = (): UseQueryResult<FeatureCollection> => {
  const queryClient = useQueryClient();
  const latestQuery = queryClient
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

  return {
    data: latestQuery?.[1],
    isSuccess: !!latestQuery?.[1],
    isLoading: false,
    isError: false,
    error: null,
  } as UseQueryResult<FeatureCollection>;
};

interface FeatureLoadingState {
  isLoading: boolean;
  isError: boolean;
}

/**
 * A hook that provides the aggregated loading and error states of all active feature queries.
 * This hook is useful for showing global loading or error states without needing to know
 * the specific parameters of individual useFeatures calls.
 */
export const useFeatureLoadingState = (): FeatureLoadingState => {
  const queryClient = useQueryClient();

  // Get all active feature queries
  const featureQueries = queryClient.getQueriesData<FeatureCollection>({
    queryKey: [KEY_USE_FEATURES],
  });

  // Get the states for all active queries
  const queryStates = featureQueries
    .map(([queryKey]) => queryClient.getQueryState(queryKey))
    .filter(Boolean);

  return {
    // If any query is loading, we're loading
    isLoading: queryStates.some((state) => state?.status === 'pending'),
    // If any query has an error, we have an error
    isError: queryStates.some((state) => state?.status === 'error'),
  };
};
