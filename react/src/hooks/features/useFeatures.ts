import { UseQueryResult } from 'react-query';
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
