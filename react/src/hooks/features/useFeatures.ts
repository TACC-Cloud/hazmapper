import { useQueryClient, UseQueryResult } from 'react-query';
import { FeatureCollection } from '@hazmapper/types';
import { useGet } from '@hazmapper/requests';

interface UseFeaturesParams {
  projectId: number;
  isPublicView: boolean;
  assetTypes: string[];
  options?: object;
}

export const KEY_USE_FEATURES = 'activeProjectFeatures';

export const useFeatures = ({
  projectId,
  isPublicView,
  assetTypes,
  options = {},
}: UseFeaturesParams): UseQueryResult<FeatureCollection> => {
  // TODO can be reworked as /projects can be used and /public-projects can be removed since we are no longer a WSO2 API
  const featuresRoute = isPublicView ? 'public-projects' : 'projects';
  let endpoint = `/${featuresRoute}/${projectId}/features/`;
  if (assetTypes?.length) {
    endpoint += `?assetType=${assetTypes.join(',')}`;
  }

  /* Expensive to fetch and process so we only fetch when updated */
  const defaultQueryOptions = {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  };

  const query = useGet<FeatureCollection>({
    endpoint,
    key: [KEY_USE_FEATURES, { projectId, isPublicView, assetTypes }],
    options: { ...defaultQueryOptions, ...options },
  });
  return query;
};

export const useCurrentFeatures = (): UseQueryResult<FeatureCollection> => {
  const queryClient = useQueryClient();

  // Get all existing queries that match the KEY_USE_FEATURES prefix
  const queries = queryClient.getQueriesData<FeatureCollection>([
    KEY_USE_FEATURES,
  ]);

  // Find first query with data - getQueriesData returns [queryKey, data] tuples
  const activeQuery = queries.find(([, queryData]) => !!queryData);
  const currentData = activeQuery ? activeQuery[1] : undefined;

  return {
    data: currentData,
    isSuccess: !!currentData,
    isLoading: false,
    isError: false,
    error: null,
  } as UseQueryResult<FeatureCollection>;
};
