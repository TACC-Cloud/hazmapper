import {
  GeoapiBackendEnvironment,
  AppConfiguration,
  MapillaryConfiguration,
} from '../types';

const jwtId = 'abc_123_client_id';

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

export const localDevConfiguration: AppConfiguration = {
  basePath: '/',
  geoapiBackend: GeoapiBackendEnvironment.Local,
  geoapiUrl: 'http://localhost:8888',
  designSafeUrl: 'https://agave.designsafe-ci.org/',
  designsafePortalUrl: 'https://designsafeci-dev.tacc.utexas.edu/',
  mapillary: mapillaryConfig,
  taggitUrl: 'http://localhost:4200/taggit-staging',
  jwt: jwtId,
};
