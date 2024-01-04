import { useState, useEffect } from 'react';

import {
  AppConfiguration,
  MapillaryConfiguration,
  LocalAppConfiguration,
  EnvironmentType,
} from '../../types';
import useBasePath from './useBasePath';

/**
 * Retrieves the GeoAPI URL based on the provided backend environment.
 */
function getGeoapiUrl(backend: EnvironmentType): string {
  switch (backend) {
    case EnvironmentType.Local:
      return 'http://localhost:8888';
    case EnvironmentType.Dev:
      return 'https://agave.designsafe-ci.org/geo-dev/v2';
    case EnvironmentType.Staging:
      return 'https://agave.designsafe-ci.org/geo-staging/v2';
    case EnvironmentType.Production:
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
function getDesignsafePortalUrl(backend: string): string {
  if (backend === EnvironmentType.Production) {
    return 'https://www.designsafe-ci.org/';
  } else {
    return 'https://designsafeci-dev.tacc.utexas.edu/';
  }
}

export const useAppConfiguration = (): AppConfiguration | null => {
  const [config, setConfig] = useState<AppConfiguration | null>(null);
  const basePath = useBasePath();

  const hostname = window && window.location && window.location.hostname;
  const pathname = window && window.location && window.location.pathname;
  const origin = window && window.location.origin;

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

  useEffect(() => {
    const loadConfig = async () => {
      if (/^localhost/.test(hostname) || /^hazmapper.local/.test(hostname)) {
        // Dynamically import the local secret configuration file
        let localConfig: LocalAppConfiguration;
        try {
          const secretModule = await import('../../secret_local');
          localConfig = secretModule.localDevelopmentConfiguration;
        } catch (err) {
          console.error(
            'Failed to load configuration file needed for local development',
            err
          );
          throw new Error(
            'Failed to load configuration file needed for local development'
          );
        }

        // local devevelopers can use localhost or hazmapper.local but
        // hazmapper.local is preferred as TAPIS supports it as a frame ancestor
        // (i.e. it allows for point cloud iframe preview)
        const clientId = /^localhost/.test(hostname)
          ? 'XgCBlhfAaqfv7jTu3NRc4IJDGdwa'
          : 'Eb9NCCtWkZ83c01UbIAITFvhD9ka';

        const appConfig: AppConfiguration = {
          basePath: basePath,
          clientId: clientId,
          geoapiUrl: getGeoapiUrl(localConfig.geoapiBackend),
          designSafeUrl: 'https://agave.designsafe-ci.org/',
          designsafePortalUrl: getDesignsafePortalUrl(
            localConfig.geoapiBackend
          ),
          mapillary: mapillaryConfig,
          jwt: localConfig.jwt,
        };
        appConfig.mapillary.clientId = '5156692464392931';
        appConfig.mapillary.clientSecret =
          'MLY|5156692464392931|6be48c9f4074f4d486e0c42a012b349f';
        appConfig.mapillary.clientToken =
          'MLY|5156692464392931|4f1118aa1b06f051a44217cb56bedf79';
        setConfig(appConfig);
      } else if (
        /^hazmapper.tacc.utexas.edu/.test(hostname) &&
        pathname.startsWith('/staging')
      ) {
        const appConfig: AppConfiguration = {
          basePath: basePath,
          clientId: 'foitdqFcimPzKZuMhbQ1oyh3Anka',
          geoapiUrl: getGeoapiUrl(EnvironmentType.Staging),
          designSafeUrl: 'https://agave.designsafe-ci.org/',
          designsafePortalUrl: getDesignsafePortalUrl(EnvironmentType.Staging),
          mapillary: mapillaryConfig,
        };

        appConfig.mapillary.clientId = '4936281379826603';
        appConfig.mapillary.clientSecret =
          'MLY|4936281379826603|cafd014ccd8cfc983e47c69c16082c7b';
        appConfig.mapillary.clientToken =
          'MLY|4936281379826603|f8c4732d3c9d96582b86158feb1c1a7a';
        setConfig(appConfig);
      } else if (
        /^hazmapper.tacc.utexas.edu/.test(hostname) &&
        pathname.startsWith('/dev')
      ) {
        const appConfig: AppConfiguration = {
          basePath: basePath,
          clientId: 'oEuGsl7xi015wnrEpxIeUmvzc6Qa',
          geoapiUrl: getGeoapiUrl(EnvironmentType.Dev),
          designSafeUrl: 'https://agave.designsafe-ci.org/',
          designsafePortalUrl: getDesignsafePortalUrl(EnvironmentType.Dev),
          mapillary: mapillaryConfig,
        };

        // TODO_REACT mapillary config a copy from /staging not /dev
        appConfig.mapillary.clientId = '4936281379826603';
        appConfig.mapillary.clientSecret =
          'MLY|4936281379826603|cafd014ccd8cfc983e47c69c16082c7b';
        appConfig.mapillary.clientToken =
          'MLY|4936281379826603|f8c4732d3c9d96582b86158feb1c1a7a';
        setConfig(appConfig);
      } else if (/^hazmapper.tacc.utexas.edu/.test(hostname)) {
        const appConfig: AppConfiguration = {
          basePath: basePath,
          clientId: 'tMvAiRdcsZ52S_89lCkO4x3d6VMa',
          geoapiUrl: getGeoapiUrl(EnvironmentType.Production),
          designSafeUrl: 'https://agave.designsafe-ci.org/',
          designsafePortalUrl: getDesignsafePortalUrl(
            EnvironmentType.Production
          ),
          mapillary: mapillaryConfig,
        };

        appConfig.mapillary.clientId = '5156692464392931';
        appConfig.mapillary.clientSecret =
          'MLY|5156692464392931|6be48c9f4074f4d486e0c42a012b349f';
        appConfig.mapillary.clientToken =
          'MLY|5156692464392931|4f1118aa1b06f051a44217cb56bedf79';
        setConfig(appConfig);
      } else {
        console.error('Cannot find environment for host name ${hostname}');
      }
    };

    loadConfig();
  }, []);

  return config;
};

export default useAppConfiguration;
