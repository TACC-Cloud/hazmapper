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
  apiUrl: 'https://agave.designsafe-ci.org/geo/v2',
  clientId: 'tMvAiRdcsZ52S_89lCkO4x3d6VMa',
  baseHref: '/hazmapper/',
  designSafeUrl: 'https://agave.designsafe-ci.org/'
};

