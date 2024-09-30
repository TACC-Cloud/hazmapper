import { UseQueryResult } from 'react-query';
import { FeatureCollection } from '@hazmapper/types';
import { useGet } from '../../requests';

interface UseFeaturesParams {
  projectId?: number;
  isPublic: boolean;
  options: object;
}

const useFeatures = ({
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
    key: ['features', { projectId, isPublic, assetTypes }],
    options,
  });
  return query;
};

export default useFeatures;
