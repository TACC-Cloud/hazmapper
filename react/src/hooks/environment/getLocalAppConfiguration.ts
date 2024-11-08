// TODO_REACT consider dynamically importing local configuration but then we would need to refactor things as initial configuration is async (context?)
import { localDevelopmentConfiguration } from '@hazmapper/secret_local';
import { getGeoapiUrl, getDesignsafePortalUrl } from './utils';
import {
  AppConfiguration,
  MapillaryConfiguration,
  DesignSafePortalEnvironment,
} from '@hazmapper/types';

/**
 * Get app configuration for when running locally
 *
 * Note: this is mocked when running unit tests
 */
export const getLocalAppConfiguration = (
  basePath: string,
  mapillaryConfig: MapillaryConfiguration
): AppConfiguration => {
  const appConfig: AppConfiguration = {
    basePath: basePath,
    geoapiUrl: getGeoapiUrl(localDevelopmentConfiguration.geoapiBackend),
    designsafePortalUrl: getDesignsafePortalUrl(
      DesignSafePortalEnvironment.Dev
    ),
    tapisUrl: 'https://designsafe.tapis.io',
    mapillary: mapillaryConfig,
    taggitUrl: origin + '/taggit-staging',
  };
  appConfig.mapillary.clientId = '5156692464392931';
  appConfig.mapillary.clientSecret =
    'MLY|5156692464392931|6be48c9f4074f4d486e0c42a012b349f';
  appConfig.mapillary.clientToken =
    'MLY|5156692464392931|4f1118aa1b06f051a44217cb56bedf79';
  return appConfig;
};
