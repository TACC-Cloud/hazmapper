export interface AppEnvironment {
  production: boolean;
  apiUrl: string;
  jwt?: string;
  clientId: string;
}

export const environment: AppEnvironment = {
  production: true,
  apiUrl: 'https://agave.designsafe-ci.org',
  clientId: 'RMCJHgW9CwJ6mKjhLTDnUYBo9Hka'
};
