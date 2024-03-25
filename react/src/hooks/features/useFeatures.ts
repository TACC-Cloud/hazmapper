import { UseQueryResult } from 'react-query';
import { FeatureCollection } from '../../types';
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
  const assetTypesQueryParam = assetTypes?.length
    ? `assetType=${assetTypes.join(',')}`
    : '';
  const endpoint = `/${featuresRoute}/${projectId}/features/?${assetTypesQueryParam}`;

  const query = useGet<FeatureCollection>({
    endpoint,
    key: ['features', { projectId, isPublic, assetTypesQueryParam }],
    options: {
      ...options,
      staleTime: 1000 * 30, // 30 seconds to avoid multiple network requests, but still keep data fresh
    },
  });

  if (!projectId) {
    return {
      ...query,
      status: 'error',
      error: new Error('Unknown project'),
      data: undefined,
      isFetching: false,
    } as UseQueryResult<FeatureCollection>;
  }

  return query;
};

export default useFeatures;
