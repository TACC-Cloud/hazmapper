import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { isTokenValid } from '../../utils/authUtils';
import { useAppConfiguration } from '../../hooks';

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) =>
    isTokenValid(state.auth.token)
  );
  const configuration = useAppConfiguration();

  const queryParams = new URLSearchParams(location.search);
  const toParam = queryParams.get('to') || '/';

  if (isAuthenticated) {
    navigate(toParam);
  } else {
    const state = Math.random().toString(36);
    // Save the authState parameter to localStorage
    localStorage.setItem('authState', state);
    localStorage.setItem('toParam', toParam);

    const callbackUrl = (window.location.origin + configuration.basePath + '/callback').replace(/([^:])(\/{2,})/g, '$1/');
    // Construct the authentication URL with the client_id, redirect_uri, scope, response_type, and state parameters
    const authUrl = `https://agave.designsafe-ci.org/authorize?client_id=${configuration.clientId}&redirect_uri=${callbackUrl}&scope=openid&response_type=token&state=${state}`;

    window.location.replace(authUrl);
  }

  return <div>Logging in...</div>;
}

export default Login;
