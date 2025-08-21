import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppConfiguration } from '@hazmapper/hooks';

function Login() {
  const location = useLocation();
  const configuration = useAppConfiguration();

  const queryParams = new URLSearchParams(location.search);
  const toParam = queryParams.get('to') || '/';

  const GEOAPI_AUTH_URL = `${configuration.geoapiUrl}/auth/login?to=${toParam}`;
  window.location.href = GEOAPI_AUTH_URL;

  return <div>Logging in...</div>;
}

export default Login;
