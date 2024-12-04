import { useQueryClient, UseQueryResult } from 'react-query';
import { FeatureCollection } from '@hazmapper/types';
import { useGet } from '@hazmapper/requests';

interface UseFeaturesParams {
  projectId: number;
  isPublicView: boolean;
  assetTypes: string[];
  options?: object;
}

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
    key: ['activeProjectFeatures', { projectId, isPublicView, assetTypes }],
    options: { ...defaultQueryOptions, ...options },
  });
  return query;
};

export const useCurrentFeatures = (): UseQueryResult<FeatureCollection> => {
  const queryClient = useQueryClient();
  const queries = queryClient.getQueriesData(['activeProjectFeatures']);

  // Get the most recent query data
  const mostRecentQuery = queries[queries.length - 1];
  const currentData = mostRecentQuery
    ? (mostRecentQuery[1] as FeatureCollection)
    : undefined;

  return {
    data: currentData,
    isSuccess: !!currentData,
    isLoading: false,
    isError: false,
    error: null,
  } as UseQueryResult<FeatureCollection>;
};
