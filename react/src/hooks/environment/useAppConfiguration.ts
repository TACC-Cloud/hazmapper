import { useMemo } from 'react';

import {
  AppConfiguration,
  MapillaryConfiguration,
  GeoapiBackendEnvironment,
  DesignSafePortalEnvironment,
} from '@hazmapper/types';
import { getGeoapiUrl, getDesignsafePortalUrl } from './utils';
import useBasePath from './useBasePath';
import { getLocalAppConfiguration } from './getLocalAppConfiguration';

/**
 * A hook that provides environment-specific application configuration based on the current hostname and path.
 *
 * This hook determines the appropriate configuration for various environments:
 * - Local development (localhost or hazmapper.local)
 * - Staging (/staging path on hazmapper.tacc.utexas.edu)
 * - Development (/dev path on hazmapper.tacc.utexas.edu)
 * - Production (hazmapper.tacc.utexas.edu without path prefix)
 */
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
      return getLocalAppConfiguration(basePath, mapillaryConfig);
    } else if (
      /^hazmapper.tacc.utexas.edu/.test(hostname) &&
      pathname.startsWith('/staging')
    ) {
      const appConfig: AppConfiguration = {
        basePath: basePath,
        geoapiUrl: getGeoapiUrl(GeoapiBackendEnvironment.Staging),
        designsafePortalUrl: getDesignsafePortalUrl(
          DesignSafePortalEnvironment.PPRD
        ),
        tapisUrl: 'https://designsafe.tapis.io',
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
        geoapiUrl: getGeoapiUrl(GeoapiBackendEnvironment.Dev),
        designsafePortalUrl: getDesignsafePortalUrl(
          DesignSafePortalEnvironment.PPRD
        ),
        tapisUrl: 'https://designsafe.tapis.io',
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
        geoapiUrl: getGeoapiUrl(GeoapiBackendEnvironment.Production),
        designsafePortalUrl: getDesignsafePortalUrl(
          DesignSafePortalEnvironment.Production
        ),
        tapisUrl: 'https://designsafe.tapis.io',
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
