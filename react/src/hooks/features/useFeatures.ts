import { useQueryClient, UseQueryResult, QueryKey } from 'react-query';
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
    cacheTime: Infinity /* "" */,
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
export const useCurrentFeatures = (): UseQueryResult<FeatureCollection> => {
  const queryClient = useQueryClient();
  const latestQuery = queryClient
    .getQueriesData<FeatureCollection>([KEY_USE_FEATURES])
    .filter(([, value]) => Boolean(value))
    .reduce<[QueryKey, FeatureCollection] | null>((latest, current) => {
      const currentState = queryClient.getQueryState(current[0]);
      const latestState = latest ? queryClient.getQueryState(latest[0]) : null;
      if (
        !latestState ||
        (currentState && currentState.dataUpdatedAt > latestState.dataUpdatedAt)
      ) {
        return current;
      }
      return latest;
    }, null);

  return {
    data: latestQuery?.[1],
    isSuccess: !!latestQuery?.[1],
    isLoading: false,
    isError: false,
    error: null,
  } as UseQueryResult<FeatureCollection>;
};
