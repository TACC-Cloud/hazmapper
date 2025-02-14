import { usePost } from '../../requests';
import { useQueryClient } from '@tanstack/react-query';
import { ApiService, Feature, IFileImportRequest } from '@hazmapper/types';
import { KEY_USE_FEATURES } from './useFeatures';

export const KEY_USE_FEATURE_ASSET = 'featureAsset';

export const useImportFeatureAsset = (projectId: number, featureId: number) => {
  const queryClient = useQueryClient();
  const endpoint = `/projects/${projectId}/features/${featureId}/assets/`;
  return usePost<IFileImportRequest, Feature>({
    endpoint,
    apiService: ApiService.Geoapi,
    options: {
      onSuccess: () => {
        // Invalidate the main features query to get updated feature list
        queryClient.invalidateQueries({
          queryKey: [KEY_USE_FEATURES],
        });
        // Invalidate any queries related to this specific feature's assets
        queryClient.invalidateQueries({
          queryKey: [KEY_USE_FEATURE_ASSET, featureId],
        });
      },
    },
  });
};
