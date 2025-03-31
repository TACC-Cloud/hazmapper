import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isTokenValid } from '@hazmapper/utils/authUtils';
import { RootState } from '../../redux/store';

/**
 * useEnsureAuthenticatedUserHasValidTapisToken
 *
 * A hook that ensures the current authenticated user has a valid Tapis auth token.
 * If the token is invalid, the user is automatically redirected to the login page.
 *
 * Useful for protecting private routes or pages that require an authenticated session.
 *
 * See `hasValidTapisToken from `useAuthenticatedUser` if you want similar functionality
 * without the redirection
 *
 * @returns {void}
 */
export function useEnsureAuthenticatedUserHasValidTapisToken() {
  const navigate = useNavigate();
  const location = useLocation();
  const authToken = useSelector((state: RootState) => state.auth.authToken);

  // if user has auth token, ensure its valid and if not, redirect to login
  if (authToken && !isTokenValid(authToken)) {
    navigate(`/login?to=${encodeURIComponent(location.pathname)}`);
  }
}
