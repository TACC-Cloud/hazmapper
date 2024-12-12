import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { AuthenticatedUser } from '@hazmapper/types';

type SuccessResult<T> = {
  data: T;
  isLoading: false;
  error: null;
};

// TODO remove this placeholder hook
const useAuthenticatedUser = (): SuccessResult<AuthenticatedUser> => {
  let username = useSelector((state: RootState) => state.auth.user?.username);

  if (!username) {
    username = '';
  }

  return { data: { username }, isLoading: false, error: null };
};

export default useAuthenticatedUser;
