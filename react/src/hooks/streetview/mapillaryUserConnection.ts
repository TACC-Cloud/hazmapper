import { ApiService, MapillaryUserConnection } from '@hazmapper/types';
import { useGet, useDelete } from '@hazmapper/requests';
import { UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedUser } from '@hazmapper/hooks';

const KEY_MAPILLARY_USER_CONNECTION = 'mapillaryUserConnection';

export const useMapillaryUserConnection =
  (): UseQueryResult<MapillaryUserConnection | null> => {
    const {
      data: { hasValidTapisToken },
    } = useAuthenticatedUser();
    const endpoint = `/streetview/services/`;

    return useGet<MapillaryUserConnection[], MapillaryUserConnection | null>({
      endpoint,
      apiService: ApiService.Geoapi,
      key: [KEY_MAPILLARY_USER_CONNECTION],
      transform: (data) =>
        data.find(
          (streetviewUserConnection) =>
            streetviewUserConnection.service === 'mapillary'
        ) || null,
      options: { enabled: hasValidTapisToken },
    });
  };

export function useDeleteMapillaryUserConnection() {
  const queryClient = useQueryClient();

  return useDelete<void, void>({
    endpoint: `/streetview/auth/mapillary/`,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [KEY_MAPILLARY_USER_CONNECTION],
        });
      },
    },
  });
}
