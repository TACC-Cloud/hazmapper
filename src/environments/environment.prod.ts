import {jwt} from './jwt';

export interface AppEnvironment {
  production: boolean;
  apiUrl: string;
  jwt?: string;
  clientId: string;
  baseHref: string;
}

export const environment: AppEnvironment = {
  production: true,
  apiUrl: 'http://c002.rodeo.tacc.utexas.edu:31474/',
  clientId: 'niyXUtUixEVUsGLrtEg5ZuAH1gYa',
  baseHref: '/hazmapper/'
};

