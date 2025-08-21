import React from 'react';
import { useAppConfiguration } from '@hazmapper/hooks';

function Logout() {
  const configuration = useAppConfiguration();
  const GEOAPI_AUTH_URL = `${configuration.geoapiUrl}/auth/logout`;

  window.location.href = GEOAPI_AUTH_URL;

  return <div>Logging out...</div>;
}

export default Logout;
