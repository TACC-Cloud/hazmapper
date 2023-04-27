import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Retrieves the target back.
// Used for getting a dynamic backend for local development.
function getGeoapiUrl(backend: string): string {
  if (backend === 'development') {
    return 'http://localhost:8888';
  } else if (backend === 'staging') {
    return 'https://agave.designsafe-ci.org/geo-staging/v2';
  } else if (backend === 'production') {
    return 'https://agave.designsafe-ci.org/geo/v2';
  } else {
    throw new Error(
      'Unsupported TARGET/GEOAPI_BACKEND Type. Please check the .env file.'
    );
  }
}

function getDesignsafePortalUrl(backend: string): string {
  if (backend === 'production') {
    return 'https://www.designsafe-ci.org/';
  } else {
    return 'https://designsafeci-dev.tacc.utexas.edu/';
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const envFile = loadEnv(mode, process.cwd(), '');
  const targetEnvironment = envFile.TARGET;
  const env = {
    designSafeUrl: 'https://agave.designsafe-ci.org/',
    backend: envFile.GEOAPI_BACKEND,
    geoapiUrl: '',
    designsafePortalUrl: '',
    clientId: '',
    host: '',
    baseHref: '',
    jwt: '',
    mapillaryAuthUrl: 'https://www.mapillary.com/connect',
    mapillaryTokenUrl: 'https://graph.mapillary.com/token',
    mapillaryApiUrl: 'https://graph.mapillary.com/',
    mapillaryTileUrl: 'https://tiles.mapillary.com/',
    mapillaryScope:
      'user:email+user:read+user:write+public:write+public:upload+private:read+private:write+private:upload',
    mapillaryClientSecret: '',
    mapillaryClientId: '',
    mapillaryClientToken: '',
  };

  if (targetEnvironment === 'production') {
    env.geoapiUrl = getGeoapiUrl(targetEnvironment);
    env.designsafePortalUrl = getDesignsafePortalUrl(targetEnvironment);
    env.clientId = 'tMvAiRdcsZ52S_89lCkO4x3d6VMa';
    env.host = 'hazmapper.utexas.edu/hazmapper/';
    env.baseHref = '/hazmapper/';
    env.mapillaryClientId = '5156692464392931';
    env.mapillaryClientSecret =
      'MLY|5156692464392931|6be48c9f4074f4d486e0c42a012b349f';
    env.mapillaryClientToken =
      'MLY|5156692464392931|4f1118aa1b06f051a44217cb56bedf79';
  } else if (targetEnvironment === 'staging') {
    env.geoapiUrl = getGeoapiUrl(targetEnvironment);
    env.designsafePortalUrl = getDesignsafePortalUrl(targetEnvironment);
    env.clientId = 'foitdqFcimPzKZuMhbQ1oyh3Anka';
    env.host = 'hazmapper.utexas.edu/staging/';
    env.baseHref = '/staging/';
    env.mapillaryClientSecret =
      'MLY|4936281379826603|cafd014ccd8cfc983e47c69c16082c7b';
    env.mapillaryClientId = '4936281379826603';
    env.mapillaryClientToken =
      'MLY|4936281379826603|f8c4732d3c9d96582b86158feb1c1a7a';
  } else {
    env.geoapiUrl = getGeoapiUrl(envFile.GEOAPI_BACKEND);
    env.designsafePortalUrl = getDesignsafePortalUrl(envFile.GEOAPI_BACKEND);
    env.clientId = 'Eb9NCCtWkZ83c01UbIAITFvhD9ka';
    env.host = 'hazmapper.local';
    env.baseHref = '/';
    env.mapillaryClientSecret =
      'MLY|5156692464392931|6be48c9f4074f4d486e0c42a012b349f';
    env.mapillaryClientId = '5156692464392931';
    env.mapillaryClientToken =
      'MLY|5156692464392931|4f1118aa1b06f051a44217cb56bedf79';
    env.jwt = envFile.BACKEND === 'development' && envFile.JWT;
  }

  return {
    plugins: [react()],
    server: {
      port: 4200,
      base: env.baseHref,
      host: env.host,
    },
    define: {
      'process.env': env,
    },
  };
});
