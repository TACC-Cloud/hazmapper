import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { AuthenticatedUser } from '@hazmapper/types';
import { useState } from 'react';

type SuccessResult<T> = {
  data: T;
  isLoading: false;
  error: null;
  refetch: () => void;
};

// TODO remove this placeholder hook
const useAuthenticatedUser = (): SuccessResult<AuthenticatedUser> => {
  const [, forceRerender] = useState({});
  let username = useSelector((state: RootState) => state.auth.user?.username);

  if (!username) {
    username = '';
  }
  const refetch = () => {
    forceRerender({});
  };

  return { data: { username }, isLoading: false, error: null, refetch };
};

export default useAuthenticatedUser;
