import {
  GeoapiBackendEnvironment,
  DesignSafePortalEnvironment,
} from '@hazmapper/types';

/**
 * Retrieves the GeoAPI URL based on the provided backend environment.
 */
export function getGeoapiUrl(backend: GeoapiBackendEnvironment): string {
  switch (backend) {
    case GeoapiBackendEnvironment.Local:
      return 'http://localhost:8888';
    case GeoapiBackendEnvironment.Experimental:
      return 'https://hazmapper.tacc.utexas.edu/geoapi-experimental';
    case GeoapiBackendEnvironment.Dev:
      return 'https://hazmapper.tacc.utexas.edu/geoapi-dev';
    case GeoapiBackendEnvironment.Staging:
      return 'https://hazmapper.tacc.utexas.edu/geoapi-staging';
    case GeoapiBackendEnvironment.Production:
      return 'https://hazmapper.tacc.utexas.edu/geoapi';
    default:
      throw new Error(
        'Unsupported TARGET/GEOAPI_BACKEND Type. Please check the .env file.'
      );
  }
}

/**
 * Retrieves the DesignSafe portal URL based on the provided backend environment.
 */
export function getDesignsafePortalUrl(
  backend: DesignSafePortalEnvironment
): string {
  if (backend === DesignSafePortalEnvironment.Production) {
    return 'https://www.designsafe-ci.org';
  } else if (backend === DesignSafePortalEnvironment.Next) {
    return 'https://designsafeci-next.tacc.utexas.edu';
  } else if (backend === DesignSafePortalEnvironment.Dev) {
    return 'https://designsafeci-dev.tacc.utexas.edu';
  } else {
    throw new Error('Unsupported DS environment');
  }
}
