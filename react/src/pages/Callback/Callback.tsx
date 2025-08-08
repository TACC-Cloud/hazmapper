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

    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('access_token');
    const expiresAt = searchParams.get('expires_at');

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
