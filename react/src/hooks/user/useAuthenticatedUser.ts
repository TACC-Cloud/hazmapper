import { isTokenValid } from '@hazmapper/utils/authUtils';
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query';
import { getApiClient } from '@hazmapper/requests';
import { AuthToken, AuthState } from '@hazmapper/types';
import { useAppConfiguration } from '@hazmapper/hooks';

export type TAuthState = {
  username: string;
  authToken: AuthToken | null;
  hasValidTapisToken: boolean;
  isAuthenticated: boolean;
};

async function getAuthenticatedUser(baseUrl: string) {
  const apiClient = getApiClient();
  const endpoint = `${baseUrl}/auth/user/`;
  const res = await apiClient.get<AuthState>(endpoint);
  return res.data;
}

export const getAuthenticatedUserQuery = (baseUrl: string) =>
  queryOptions({
    queryKey: ['authenticated-user'],
    queryFn: () => getAuthenticatedUser(baseUrl),
    staleTime: 1000 * 60 * 5, // 5 minute stale time
    select: (data): TAuthState => {
      const hasValidTapisToken =
        !!data.authToken && isTokenValid(data.authToken);
      return {
        username: data.user?.username || '',
        authToken: data.authToken,
        hasValidTapisToken,
        isAuthenticated: !!data.authToken && !!data.user?.username,
      };
    },
  });

function useAuthenticatedUser() {
  const { geoapiUrl } = useAppConfiguration();
  return useSuspenseQuery(getAuthenticatedUserQuery(geoapiUrl));
}

export default useAuthenticatedUser;
