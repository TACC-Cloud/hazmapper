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
}: UseFeaturesParams): UseQueryResult<FeatureCollection> => {
  const featuresRoute = isPublic ? 'public-projects' : 'projects';
  const endpoint = `/${featuresRoute}/${projectId}/features/`;

  /* TODO_REACT add assets filter in https://tacc-main.atlassian.net/browse/WG-242.
  Filter route looks like something like this in v2:
   "projects/1027/features/?assetType=image%2Cvideo%2Cpoint_cloud%2Cstreetview%2Cquestionnaire%2C
    no_asset_vector&&updates=null&cloneFrom=null&encoder=%5Bobject%20Object%5D&map=%5Bobject%20Map%5D&application=hazmapper"
  */
  const query = useGet<FeatureCollection>({
    endpoint,
    key: ['features', { projectId, isPublic }],
    options,
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
