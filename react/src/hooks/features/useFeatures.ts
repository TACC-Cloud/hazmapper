import { UseQueryResult } from 'react-query';
import { FeatureCollection } from '@hazmapper/types';
import { useGet } from '@hazmapper/requests';

interface UseFeaturesParams {
  projectId: number;
  isPublic: boolean;
  assetTypes: string[];
  options?: object;
}

export const useFeatures = ({
  projectId,
  isPublic,
  assetTypes,
  options = {},
}: UseFeaturesParams): UseQueryResult<FeatureCollection> => {
  const featuresRoute = isPublic ? 'public-projects' : 'projects';
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
    key: ['activeProjectFeatures', { projectId, isPublic, assetTypes }],
    options: { ...defaultQueryOptions, ...options },
  });
  return query;
};
