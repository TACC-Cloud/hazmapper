import { usePost } from '../../requests';
import { useQueryClient } from '@tanstack/react-query';
import { ApiService, Feature, IFileImportRequest } from '@hazmapper/types';
import { KEY_USE_FEATURES } from './useFeatures';

export const useImportFeatureAsset = (projectId: number, featureId: number) => {
  const queryClient = useQueryClient();
  const endpoint = `/projects/${projectId}/features/${featureId}/assets/`;
  return usePost<IFileImportRequest, Feature>({
    endpoint,
    apiService: ApiService.Geoapi,
    options: {
      onSuccess: () => {
        // Invalidate the main features query to get updated feature list
        // This isn't done in a celery task, so onSuccess works to invalidate
        queryClient.invalidateQueries({
          queryKey: [KEY_USE_FEATURES],
        });
      },
    },
  });
};
