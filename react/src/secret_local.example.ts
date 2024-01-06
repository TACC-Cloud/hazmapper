import { GeoapiBackendEnvironment, LocalAppConfiguration } from './types';

// prettier-ignore
const jwt = 'INSERT YOUR JWT HERE; See README ';

export const localDevelopmentConfiguration: LocalAppConfiguration = {
  jwt: jwt,
  geoapiBackend: GeoapiBackendEnvironment.Local,
  production: false,
};
