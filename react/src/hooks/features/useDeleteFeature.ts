import { useQueryClient } from '@tanstack/react-query';
import { useDelete } from '@hazmapper/requests';
import { KEY_USE_FEATURES } from './useFeatures';

type DeleteFeatureParams = {
  projectId: number;
  featureId: number;
};

export function useDeleteFeature() {
  const queryClient = useQueryClient();

  return useDelete<void, DeleteFeatureParams>({
    endpoint: ({ projectId, featureId }) =>
      `/projects/${projectId}/features/${featureId}/`,
    options: {
      onSuccess: () => {
        // invalidate *any* feature listing query
        queryClient.invalidateQueries({ queryKey: [KEY_USE_FEATURES] });
      },
    },
  });
}
