import { isTokenValid } from '@hazmapper/utils/authUtils';
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query';
import { getApiClient } from '@hazmapper/requests';
import { AuthState, AuthToken } from '@hazmapper/types';
import { useAppConfiguration } from '@hazmapper/hooks';

export type TAuthenticatedUserResponse = {
  username: string | null;
  authToken: AuthToken | null;
};

async function getAuthenticatedUser(baseUrl: string) {
  const apiClient = getApiClient();
  const endpoint = `${baseUrl}/auth/user/`;
  const res = await apiClient.get<TAuthenticatedUserResponse>(endpoint);
  return res.data;
}

export const getAuthenticatedUserQuery = (baseUrl: string) =>
  queryOptions({
    queryKey: ['authenticated-user'],
    queryFn: () => getAuthenticatedUser(baseUrl),
    staleTime: 1000 * 60 * 60 * 4 - 1000 * 60 * 5, // 3hrs 55 minutes stale time
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
    refetchIntervalInBackground: true,
    select: (data): AuthState => {
      const hasValidTapisToken = isTokenValid(data.authToken);
      return {
        username: data.username || '',
        authToken: data.authToken,
        hasValidTapisToken,
        isAuthenticated: !!data.authToken && !!data.username,
      };
    },
  });

function useAuthenticatedUser() {
  const { geoapiUrl } = useAppConfiguration();
  return useSuspenseQuery(getAuthenticatedUserQuery(geoapiUrl));
}

export default useAuthenticatedUser;
