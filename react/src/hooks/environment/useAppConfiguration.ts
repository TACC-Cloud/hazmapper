import { useMemo } from 'react';

// TODO_REACT consider dynamically importing local configuration but then we would need to refactor things as initial configuration is async (context?)
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
function getDesignsafePortalUrl(backend: DesignSafePortalEnvironment): string {
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
      const appConfig: AppConfiguration = {
        basePath: basePath,
        geoapiBackend: localDevelopmentConfiguration.geoapiBackend,
        geoapiUrl: getGeoapiUrl(localDevelopmentConfiguration.geoapiBackend),
        designsafePortalUrl: getDesignsafePortalUrl(
          DesignSafePortalEnvironment.Dev
        ),
        mapillary: mapillaryConfig,
        taggitUrl: origin + '/taggit-staging',
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
        geoapiBackend: GeoapiBackendEnvironment.Staging,
        geoapiUrl: getGeoapiUrl(GeoapiBackendEnvironment.Staging),
        designsafePortalUrl: getDesignsafePortalUrl(
          DesignSafePortalEnvironment.Dev
        ),
        mapillary: mapillaryConfig,
        taggitUrl: origin + '/taggit-staging',
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
        geoapiBackend: GeoapiBackendEnvironment.Dev,
        geoapiUrl: getGeoapiUrl(GeoapiBackendEnvironment.Dev),
        designsafePortalUrl: getDesignsafePortalUrl(
          DesignSafePortalEnvironment.Dev
        ),
        mapillary: mapillaryConfig,
        taggitUrl: origin + '/taggit-dev',
      };

      // TODO_REACT mapillary config is currently copy from /staging and not correct for /dev
      appConfig.mapillary.clientId = '4936281379826603';
      appConfig.mapillary.clientSecret =
        'MLY|4936281379826603|cafd014ccd8cfc983e47c69c16082c7b';
      appConfig.mapillary.clientToken =
        'MLY|4936281379826603|f8c4732d3c9d96582b86158feb1c1a7a';
      return appConfig;
    } else if (/^hazmapper.tacc.utexas.edu/.test(hostname)) {
      const appConfig: AppConfiguration = {
        basePath: basePath,
        geoapiBackend: GeoapiBackendEnvironment.Production,
        geoapiUrl: getGeoapiUrl(GeoapiBackendEnvironment.Production),
        designsafePortalUrl: getDesignsafePortalUrl(
          DesignSafePortalEnvironment.Production
        ),
        mapillary: mapillaryConfig,
        taggitUrl: origin + '/taggit',
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
