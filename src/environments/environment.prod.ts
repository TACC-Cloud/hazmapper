export interface AppEnvironment {
  jwt?: string;
  production: boolean;
}

export const environment: AppEnvironment =  {
  production: true,
};
