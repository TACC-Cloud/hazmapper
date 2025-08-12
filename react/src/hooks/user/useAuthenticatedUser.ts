import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { isTokenValid } from '@hazmapper/utils/authUtils';

/**
 * A hook that returns authentication-related user information
 *
 * This hook performs no side effects (e.g., no navigation or redirect).
 * For side-effect-driven authentication, use `useEnsureAuthenticatedUserHasValidTapisToken` instead.
 *
 * @returns An object containing:
 *  - `username`: the authenticated user's username (empty string if unauthenticated),
 *  - `hasValidTapisToken`: a boolean indicating whether the stored auth token is valid.
 */

const useAuthenticatedUser = (): {
  username: string;
  hasValidTapisToken: boolean;
} => {
  let username = useSelector((state: RootState) => state.auth.user?.username);

  if (!username) {
    username = '';
  }

  const authToken = useSelector((state: RootState) => state.auth.authToken);
  const hasValidTapisToken = !!authToken && isTokenValid(authToken);

  return {
    username,
    hasValidTapisToken,
  };
};

export default useAuthenticatedUser;
