import { usePost } from '../../requests';
import { ApiService, Feature, IFileImportRequest } from '@hazmapper/types';

export const useImportFeatureAsset = (projectId: number, featureId: number) => {
  const endpoint = `/projects/${projectId}/features/${featureId}/assets/`;
  return usePost<IFileImportRequest, Feature>({
    endpoint,
    apiService: ApiService.Geoapi,
  });
};
