// TODO_REACT consider dynamically importing local configuration but then we would need to refactor things as initial configuration is async (context?)
import { localDevelopmentConfiguration } from '@hazmapper/secret_local';
import { getGeoapiUrl, getDesignsafePortalUrl } from './utils';
import {
  AppConfiguration,
  MapillaryConfiguration,
  DesignSafePortalEnvironment,
  GeoapiBackendEnvironment,
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
  const designSafePortal =
    localDevelopmentConfiguration.designSafePortal ??
    DesignSafePortalEnvironment.PPRD;

  // Check for possible mismatch on prod or staging as those deployed envionments are matched up with DS prod and pprd
  if (
    (localDevelopmentConfiguration.geoapiBackend ===
      GeoapiBackendEnvironment.Production &&
      designSafePortal !== DesignSafePortalEnvironment.Production) ||
    (localDevelopmentConfiguration.geoapiBackend ===
      GeoapiBackendEnvironment.Staging &&
      designSafePortal !== DesignSafePortalEnvironment.PPRD)
  ) {
    const msg = `Mismatch detected: geoapiBackend is '${localDevelopmentConfiguration.geoapiBackend}', but designSafePortal is '${designSafePortal}'.`;
    throw new Error(msg);
  }

  const appConfig: AppConfiguration = {
    basePath: basePath,
    geoapiUrl: getGeoapiUrl(localDevelopmentConfiguration.geoapiBackend),
    designsafePortalUrl: getDesignsafePortalUrl(designSafePortal),
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
