import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isTokenValid } from '@hazmapper/utils/authUtils';
import { RootState } from '@hazmapper/redux/store';

export function useEnsureAuthenticatedUserHasValidTapisToken() {
  const navigate = useNavigate();
  const location = useLocation();
  const authToken = useSelector((state: RootState) => state.auth.authToken);

  // if user has auth token, ensure its valid and if not, redirect to login
  if (authToken && !isTokenValid(authToken)) {
    navigate(`/login?to=${encodeURIComponent(location.pathname)}`);
  }
}
