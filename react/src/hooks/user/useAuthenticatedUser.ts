import { UseQueryResult } from 'react-query';
import { ApiService, AuthenticatedUser } from '../../types';
import { useGet } from '../../requests';

const useAuthenticatedUser = (): UseQueryResult<AuthenticatedUser> => {
  return useGet<AuthenticatedUser>({
    endpoint: '/oauth2/userinfo?schema=openid',
    key: ['username'],
    apiService: ApiService.Tapis,
    transform: (data) => ({
      username: data.name,
      email: data.email,
    }),
  });
};

export default useAuthenticatedUser;
