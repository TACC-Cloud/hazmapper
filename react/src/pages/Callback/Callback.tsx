import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { loginSuccess } from '../../redux/authSlice';
import { AuthenticatedUser, AuthToken } from '@hazmapper/types';

export default function CallbackPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    /* TODO use hash instead of search https://tacc-main.atlassian.net/browse/WG-367 */
    const params = new URLSearchParams(location.search);
    const redirectTo = localStorage.getItem('toParam') || '/';
    const token = params.get('access_token');
    const expiresAt = params.get('expires_at');

    if (token && expiresAt) {
      const username = jwtDecode(token)['tapis/username'];

      const authToken: AuthToken = { token, expiresAt };
      const user: AuthenticatedUser = { username };

      // Save the token/username to the Redux store
      dispatch(loginSuccess({ user, authToken }));
      navigate(redirectTo);
    }
  }, [dispatch, location, navigate]);

  return <div>Logging in.</div>;
}
