import { AppConfiguration, MapillaryConfiguration } from '@hazmapper/types';

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
  geoapiUrl: 'https://geoapi.unittest',
  designsafePortalUrl: 'https://designsafeci.unittest',
  tapisUrl: 'https://tapis.io.unittest',
  mapillary: mapillaryConfig,
  taggitUrl: 'https://taggit.unittest',
};
