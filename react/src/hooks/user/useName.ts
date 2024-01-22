import { UseQueryResult } from 'react-query';
import { ApiService, AuthenticatedUser } from '../../types';
import { useGet } from '../../requests';

const useName = (): UseQueryResult<AuthenticatedUser> => {
  const query = useGet<AuthenticatedUser>({
    endpoint: '/oauth2/userinfo?schema=openid',
    key: ['username'],
    apiService: ApiService.Tapis,
  });
  return query;
};

export default useName;
