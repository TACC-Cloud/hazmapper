import {
  GeoapiBackendEnvironment,
  DesignSafePortalEnvironment,
} from '@hazmapper/types';

/**
 * Retrieves the base hostname for the Hazmapper deployment.
 */
export function getHazmapperBase(): string {
  const host = window.location.hostname;

  if (host.includes('hazmapper-tmp.tacc.utexas.edu')) {
    return 'hazmapper-tmp.tacc.utexas.edu';
  }

  return 'hazmapper.tacc.utexas.edu'; // default
}

/**
 * Retrieves the GeoAPI URL based on the provided backend environment.
 */
export function getGeoapiUrl(backend: GeoapiBackendEnvironment): string {
  const base = getHazmapperBase();

  switch (backend) {
    case GeoapiBackendEnvironment.Test:
      return 'https://geoapi.unittest';
    case GeoapiBackendEnvironment.Local:
      return 'http://localhost:8888';
    case GeoapiBackendEnvironment.Dev:
      return `https://${base}/geoapi-dev`;
    case GeoapiBackendEnvironment.Staging:
      return `https://${base}/geoapi-staging`;
    case GeoapiBackendEnvironment.Production:
      return `https://${base}/geoapi`;
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
  } else if (backend === DesignSafePortalEnvironment.PPRD) {
    return 'https://pprd.designsafe-ci.org';
  } else {
    throw new Error('Unsupported DS environment');
  }
}
