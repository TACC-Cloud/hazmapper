import {jwt} from './jwt';

export interface AppEnvironment {
  production: boolean;
  apiUrl: string;
  jwt?: string;
  clientId: string;
  baseHref: string;
  designSafeUrl: string;
}

export const environment: AppEnvironment = {
  production: true,
  apiUrl: 'https://agave.designsafe-ci.org/geo/v2/',
  clientId: 'niyXUtUixEVUsGLrtEg5ZuAH1gYa',
  baseHref: '/hazmapper/',
  designSafeUrl: 'https://agave.designsafe-ci.org/'
};

