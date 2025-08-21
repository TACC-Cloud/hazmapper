import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isTokenValid } from '@hazmapper/utils/authUtils';
import { AuthToken } from '@hazmapper/types';

interface UseEnsureOptions {
  isTapisTokenRequest: boolean;
  authToken: AuthToken | null;
}

/**
 * useEnsureAuthenticatedUserHasValidTapisToken
 *
 * A hook that ensures the current authenticated user has a valid Tapis auth token.
 * If the token is invalid and `redirect` is true (default), the user is
 * automatically redirected to the login page.
 *
 * Useful for protecting private routes or pages that require an authenticated session.
 *
 * With `redirect` as `false`, no redirect occurs which is useful for contexts like public
 * map routes where token validation is optinal.
 *
 * See `hasValidTapisToken from `useAuthenticatedUser` if you want similar functionality
 * without the possibility of redirection
 *
 * @returns {void}
 */
export function useEnsureAuthenticatedUserHasValidTapisToken({
  isTapisTokenRequest,
  authToken,
}: UseEnsureOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  // if user has auth token but is expired, we need to determine if we need
  // to redirect to login. This should no longer occur with `useAuthenticatedUser`
  // which refetches every 30 minutes to ensure the token is valid.

  useEffect(() => {
    if (isTapisTokenRequest && authToken && !isTokenValid(authToken)) {
      navigate(`/login?to=${encodeURIComponent(location.pathname)}`);
    }
  }, [isTapisTokenRequest, authToken, location.pathname, navigate]);
}
