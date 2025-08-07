import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  isTokenValid,
  removeAuthenticatedUserFromLocalStorage,
} from '@hazmapper/utils/authUtils';
import { RootState } from '@hazmapper/redux/store';

interface UseEnsureOptions {
  redirect?: boolean;
}

/**
 * useEnsureAuthenticatedUserHasValidTapisToken
 *
 * A hook that ensures the current authenticated user has a valid Tapis auth token.
 * If the token is invalid and `redirect` id true (default), the user is
 * automatically redirected to the login page.
 *
 * Useful for protecting private routes or pages that require an authenticated session.
 *
 * With `redirect` as `false`, no redirect occurs which is useful for contexts like public
 * map routes where token validation is optinal.
 *
 * See `hasValidTapisToken from `useAuthenticatedUser` if you want similar functionality
 * without the redirection
 *
 * @returns {void}
 */
export function useEnsureAuthenticatedUserHasValidTapisToken({
  redirect = true,
}: UseEnsureOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const authToken = useSelector((state: RootState) => state.auth.authToken);

  // if user has auth token, ensure its valid and if not,
  if (authToken && !isTokenValid(authToken)) {
    if (redirect) {
      navigate(`/login?to=${encodeURIComponent(location.pathname)}`);
    } else {
      // if not redirect to login, lets remove the invalid token
      removeAuthenticatedUserFromLocalStorage();
    }
  }
}
