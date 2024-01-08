import { useMemo } from 'react';

// TODO_V3 consider dynamically importing local configuration but then we would need to refactor things as initial configuration is async (context?)
import { localDevelopmentConfiguration } from '../../secret_local';

import {
  AppConfiguration,
  MapillaryConfiguration,
  GeoapiBackendEnvironment,
  DesignSafePortalEnvironment,
} from '../../types';
import useBasePath from './useBasePath';

/**
 * Retrieves the GeoAPI URL based on the provided backend environment.
 */
function getGeoapiUrl(backend: GeoapiBackendEnvironment): string {
  switch (backend) {
    case GeoapiBackendEnvironment.Local:
      return 'http://localhost:8888';
    case GeoapiBackendEnvironment.Dev:
      return 'https://agave.designsafe-ci.org/geo-dev/v2';
    case GeoapiBackendEnvironment.Staging:
      return 'https://agave.designsafe-ci.org/geo-staging/v2';
    case GeoapiBackendEnvironment.Production:
      return 'https://agave.designsafe-ci.org/geo/v2';
    default:
      throw new Error(
        'Unsupported TARGET/GEOAPI_BACKEND Type. Please check the .env file.'
      );
  }
}

/**
 * Retrieves the DesignSafe portal URL based on the provided backend environment.
 */
function getDesignsafePortalUrl(backend: DesignSafePortalEnvironment): string {
  if (backend === DesignSafePortalEnvironment.Production) {
    return 'https://www.designsafe-ci.org/';
  } else {
    return 'https://designsafeci-dev.tacc.utexas.edu/';
  }
}

export const useAppConfiguration = (): AppConfiguration => {
  const basePath = useBasePath();

  const appConfiguration = useMemo(() => {
    const hostname = window && window.location && window.location.hostname;
    const pathname = window && window.location && window.location.pathname;

    const mapillaryConfig: MapillaryConfiguration = {
      authUrl: 'https://www.mapillary.com/connect',
      tokenUrl: 'https://graph.mapillary.com/token',
      apiUrl: 'https://graph.mapillary.com/',
      tileUrl: 'https://tiles.mapillary.com/',
      scope:
        'user:email+user:read+user:write+public:write+public:upload+private:read+private:write+private:upload',
      clientSecret: '',
      clientId: '',
      clientToken: '',
    };

    if (/^localhost/.test(hostname) || /^hazmapper.local/.test(hostname)) {
      // Check if jwt has been set properly if we are using local geoapi
      if (
        localDevelopmentConfiguration.geoapiBackend ===
        GeoapiBackendEnvironment.Local
      ) {
        if (
          localDevelopmentConfiguration.jwt.startsWith('INSERT YOUR JWT HERE')
        ) {
          console.error(
            'JWT has not been added to secret_local.ts; see README'
          );
          throw new Error('JWT has not been added to secret_local.ts');
        }
      }

      // local devevelopers can use localhost or hazmapper.local but
      // hazmapper.local has been preferred in the past as TAPIS only supported it as a frame ancestor
      // then (i.e. it allows for point cloud iframe preview)
      const clientId = /^localhost/.test(hostname)
        ? 'XgCBlhfAaqfv7jTu3NRc4IJDGdwa'
        : 'Eb9NCCtWkZ83c01UbIAITFvhD9ka';

      const appConfig: AppConfiguration = {
        basePath: basePath,
        clientId: clientId,
        geoapiBackend: localDevelopmentConfiguration.geoapiBackend,
        geoapiUrl: getGeoapiUrl(localDevelopmentConfiguration.geoapiBackend),
        designSafeUrl: 'https://agave.designsafe-ci.org/',
        designsafePortalUrl: getDesignsafePortalUrl(
          DesignSafePortalEnvironment.Dev
        ),
        mapillary: mapillaryConfig,
        jwt: localDevelopmentConfiguration.jwt,
      };
      appConfig.mapillary.clientId = '5156692464392931';
      appConfig.mapillary.clientSecret =
        'MLY|5156692464392931|6be48c9f4074f4d486e0c42a012b349f';
      appConfig.mapillary.clientToken =
        'MLY|5156692464392931|4f1118aa1b06f051a44217cb56bedf79';
      return appConfig;
    } else if (
      /^hazmapper.tacc.utexas.edu/.test(hostname) &&
      pathname.startsWith('/staging')
    ) {
      const appConfig: AppConfiguration = {
        basePath: basePath,
        clientId: 'foitdqFcimPzKZuMhbQ1oyh3Anka',
        geoapiBackend: GeoapiBackendEnvironment.Staging,
        geoapiUrl: getGeoapiUrl(GeoapiBackendEnvironment.Staging),
        designSafeUrl: 'https://agave.designsafe-ci.org/',
        designsafePortalUrl: getDesignsafePortalUrl(
          DesignSafePortalEnvironment.Dev
        ),
        mapillary: mapillaryConfig,
      };

      appConfig.mapillary.clientId = '4936281379826603';
      appConfig.mapillary.clientSecret =
        'MLY|4936281379826603|cafd014ccd8cfc983e47c69c16082c7b';
      appConfig.mapillary.clientToken =
        'MLY|4936281379826603|f8c4732d3c9d96582b86158feb1c1a7a';
      return appConfig;
    } else if (
      /^hazmapper.tacc.utexas.edu/.test(hostname) &&
      pathname.startsWith('/dev')
    ) {
      const appConfig: AppConfiguration = {
        basePath: basePath,
        clientId: 'oEuGsl7xi015wnrEpxIeUmvzc6Qa',
        geoapiBackend: GeoapiBackendEnvironment.Dev,
        geoapiUrl: getGeoapiUrl(GeoapiBackendEnvironment.Dev),
        designSafeUrl: 'https://agave.designsafe-ci.org/',
        designsafePortalUrl: getDesignsafePortalUrl(
          DesignSafePortalEnvironment.Dev
        ),
        mapillary: mapillaryConfig,
      };

      // TODO_REACT mapillary config a copy from /staging not /dev
      appConfig.mapillary.clientId = '4936281379826603';
      appConfig.mapillary.clientSecret =
        'MLY|4936281379826603|cafd014ccd8cfc983e47c69c16082c7b';
      appConfig.mapillary.clientToken =
        'MLY|4936281379826603|f8c4732d3c9d96582b86158feb1c1a7a';
      return appConfig;
    } else if (/^hazmapper.tacc.utexas.edu/.test(hostname)) {
      const appConfig: AppConfiguration = {
        basePath: basePath,
        clientId: 'tMvAiRdcsZ52S_89lCkO4x3d6VMa',
        geoapiBackend: GeoapiBackendEnvironment.Production,
        geoapiUrl: getGeoapiUrl(GeoapiBackendEnvironment.Production),
        designSafeUrl: 'https://agave.designsafe-ci.org/',
        designsafePortalUrl: getDesignsafePortalUrl(
          DesignSafePortalEnvironment.Production
        ),
        mapillary: mapillaryConfig,
      };

      appConfig.mapillary.clientId = '5156692464392931';
      appConfig.mapillary.clientSecret =
        'MLY|5156692464392931|6be48c9f4074f4d486e0c42a012b349f';
      appConfig.mapillary.clientToken =
        'MLY|5156692464392931|4f1118aa1b06f051a44217cb56bedf79';
      return appConfig;
    } else {
      console.error('Cannot find environment for host name ${hostname}');
      throw new Error('Cannot find environment for host name ${hostname}');
    }
  }, []);
  return appConfiguration;
};

export default useAppConfiguration;
