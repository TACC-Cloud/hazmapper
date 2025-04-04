import { ApiService, MapillaryUserConnection } from '@hazmapper/types';
import { useGet, useDelete } from '@hazmapper/requests';
import { UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { usePost } from '@hazmapper/requests';
import { UseMutationResult } from '@tanstack/react-query';
import { useAuthenticatedUser } from '@hazmapper/hooks/';

const KEY_MAPILLARY_USER_CONNECTION = 'mapillaryUserConnection';

export const useMapillaryUserConnection =
  (): UseQueryResult<MapillaryUserConnection | null> => {
    const { hasValidTapisToken } = useAuthenticatedUser();
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

interface MapillaryTempTokenResponse {
  tempToken: string;
}

/* Get a temp token to start auth process; TODO remove after WG-472 */
export function useMapillaryTempAuthToken(): UseMutationResult<
  MapillaryTempTokenResponse,
  Error,
  void
> {
  return usePost<void, MapillaryTempTokenResponse>({
    endpoint: '/streetview/auth/mapillary/prepare',
    apiService: ApiService.Geoapi,
  });
}
