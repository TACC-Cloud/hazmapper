import { useQueryClient } from '@tanstack/react-query';
import { useDelete } from '@hazmapper/requests';
import { useCurrentFeaturesStore } from '@hazmapper/hooks';
import { KEY_USE_FEATURES } from './useFeatures';

type DeleteFeatureParams = {
  projectId: number;
  featureId: number;
};

export function useDeleteFeature() {
  const queryClient = useQueryClient();
  const setCurrentFeatures = useCurrentFeaturesStore(
    (state) => state.setCurrentFeatures
  );
  const currentData = useCurrentFeaturesStore((state) => state.data); // Get current data

  return useDelete<void, DeleteFeatureParams>({
    endpoint: ({ projectId, featureId }) =>
      `/projects/${projectId}/features/${featureId}/`,
    options: {
      onSuccess: (_, { featureId }) => {
        if (!currentData) return;

        // Invalidate the React Query cache to fetch fresh data
        queryClient.setQueriesData(
          { queryKey: [KEY_USE_FEATURES], exact: false }, // Ensure it matches subkeys
          null
        );
        queryClient.invalidateQueries({
          queryKey: [KEY_USE_FEATURES],
          meta: { reason: 'deletion' },
        });

        // Update Zustand store
        // Remove the feature from the current data
        const updatedFeatures = currentData.features.filter(
          (feature) => feature.id !== featureId
        );

        setCurrentFeatures(
          { ...currentData, features: updatedFeatures },
          false,
          false
        );
      },
    },
  });
}
