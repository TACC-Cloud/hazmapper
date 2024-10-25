import { useQueryClient, UseMutationOptions } from 'react-query';
import { AxiosError } from 'axios';
import { useDelete } from '@hazmapper/requests';

type UseDeleteFeatureParams<ResponseType> = {
  projectId: number;
  featureId: number;
};

/*
export function useDeleteFeature<ResponseType>({
  projectId,
  featureId,
}: UseDeleteFeatureParams<ResponseType>) {
  const queryClient = useQueryClient();

  return useDelete<void, ResponseType>({
    endpoint: `/geoapi/project/${projectId}/features/${featureId}/`,
    options: {
      onSuccess: () => {
        // Invalidate feature-listing query after feature deletion
        queryClient.invalidateQueries(['features', projectId]);
      },
    },
  });
}*/
type DeleteFeatureParams = {
  projectId: number;
  featureId: number;
};

export function useDeleteFeature() {
  const queryClient = useQueryClient();

  return useDelete<void, DeleteFeatureParams>({
    // Construct the full URL at mutation time using the variables
    endpoint: ({ projectId, featureId }) =>
      `/projects/${projectId}/features/${featureId}/`,
    options: {
      onSuccess: () => {
        // invalidate *any* feature listing query
        queryClient.invalidateQueries(['activeProjectFeatures']);
      },
    },
  });
}
