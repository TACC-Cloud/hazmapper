import { EnvironmentType, LocalAppConfiguration } from './types';

const jwt = 'INSERT YOUR JWT HERE; See Readme and ';

export const localDevelopmentConfiguration = {
  jwt: jwt,
  geoapiBackend: EnvironmentType.Local,
  production: false,
};
