import { AxiosError } from 'axios';
import { isTokenValid } from '@hazmapper/utils/authUtils';
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query';
import { getApiClient } from '@hazmapper/requests';
import { AuthState, AuthToken, ApiService } from '@hazmapper/types';
import { useAppConfiguration } from '@hazmapper/hooks';

export type TAuthenticatedUserResponse = {
  username: string | null;
  authToken: AuthToken | null;
};

async function getAuthenticatedUser(baseUrl: string, geoapiEnv: string) {
  const apiClient = getApiClient(ApiService.Geoapi, geoapiEnv);
  const endpoint = `${baseUrl}/auth/user/`;
  try {
    const res = await apiClient.get<TAuthenticatedUserResponse>(endpoint);
    return res.data;
  } catch (error) {
    // Set auth state to unauthenticated on 401 errors
    if ((error as AxiosError)?.response?.status === 401) {
      return { username: null, authToken: null };
    }
    throw error;
  }
}

export const getAuthenticatedUserQuery = (baseUrl: string, geoapiEnv: string) =>
  queryOptions({
    queryKey: ['authenticated-user'],
    queryFn: () => getAuthenticatedUser(baseUrl, geoapiEnv),
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
  const { geoapiUrl, geoapiEnv } = useAppConfiguration();
  return useSuspenseQuery(getAuthenticatedUserQuery(geoapiUrl, geoapiEnv));
}

export default useAuthenticatedUser;
