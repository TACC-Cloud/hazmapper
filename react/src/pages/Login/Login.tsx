import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { isTokenValid } from '@hazmapper/utils/authUtils';
import { useAppConfiguration } from '@hazmapper/hooks';

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) =>
    isTokenValid(state.auth.authToken)
  );
  const configuration = useAppConfiguration();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const toParam = queryParams.get('to') || '/';

    if (isAuthenticated) {
      navigate(toParam);
    } else {
      // Save the "to" parameter to localStorage
      localStorage.setItem('toParam', toParam);

      const GEOAPI_AUTH_URL = `${configuration.geoapiUrl}/auth/login?to=${toParam}`;
      window.location.href = GEOAPI_AUTH_URL;
    }
  }, []);

  return <div>Logging in...</div>;
}

export default Login;
