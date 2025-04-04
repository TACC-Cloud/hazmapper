import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { loginSuccess } from '../../redux/authSlice';
import { Flex, Spin } from 'antd';
import { AuthenticatedUser, AuthToken } from '@hazmapper/types';

export default function CallbackPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectTo = localStorage.getItem('toParam') || '/';
    let token: string | null = '';
    let expiresAt: string | null = '';

    // First, try to get token from hash
    if (location.hash && location.hash.length > 1) {
      // Parse the hash manually (remove the # character)
      const hashParams = new URLSearchParams(location.hash.substring(1));
      token = hashParams.get('access_token');
      expiresAt = hashParams.get('expires_at');
    }

    // TODO drop using query parameters once https://tacc-main.atlassian.net/browse/WG-367
    // has made its way to prod
    // If not found in hash, try query parameters
    if (!token || !expiresAt) {
      const queryParams = new URLSearchParams(location.search);
      token = queryParams.get('access_token');
      expiresAt = queryParams.get('expires_at');
    }

    if (token && expiresAt) {
      const username = jwtDecode(token)['tapis/username'];

      const authToken: AuthToken = { token, expiresAt };
      const user: AuthenticatedUser = { username };

      // Save the token/username to the Redux store
      dispatch(loginSuccess({ user, authToken }));
      navigate(redirectTo);
    }
  }, [dispatch, location, navigate]);

  return (
    <Flex justify="center" align="center" style={{ height: '100vh' }}>
      <Spin size="large" data-testid="spin" />
    </Flex>
  );
}
