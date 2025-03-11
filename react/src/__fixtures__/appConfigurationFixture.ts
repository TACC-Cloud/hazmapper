import {
  AppConfiguration,
  GeoapiBackendEnvironment,
  MapillaryConfiguration,
} from '@hazmapper/types';
import { getGeoapiUrl } from '@hazmapper/hooks/environment/utils';

export const mapillaryConfig: MapillaryConfiguration = {
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

export const testDevConfiguration: AppConfiguration = {
  basePath: '/test',
  geoapiEnv: GeoapiBackendEnvironment.Test,
  geoapiUrl: getGeoapiUrl(GeoapiBackendEnvironment.Test),
  designsafePortalUrl: 'https://designsafeci.unittest',
  tapisUrl: 'https://tapis.io.unittest',
  mapillary: mapillaryConfig,
  taggitUrl: 'https://taggit.unittest',
};
