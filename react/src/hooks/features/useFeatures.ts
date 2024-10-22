import { UseQueryResult } from 'react-query';
import { FeatureCollection } from '@hazmapper/types';
import { useGet } from '@hazmapper/requests';

interface UseFeaturesParams {
  projectId?: number;
  isPublic: boolean;
  options: object;
}

export const useFeatures = ({
  projectId,
  isPublic,
  options,
  assetTypes,
}: UseFeaturesParams & {
  assetTypes?: string[];
}): UseQueryResult<FeatureCollection> => {
  const featuresRoute = isPublic ? 'public-projects' : 'projects';
  let endpoint = `/${featuresRoute}/${projectId}/features/`;
  if (assetTypes?.length) {
    endpoint += `?assetType=${assetTypes.join(',')}`;
  }

  const query = useGet<FeatureCollection>({
    endpoint,
    key: ['activeProjectFeatures', { projectId, isPublic, assetTypes }],
    options,
  });
  return query;
};
