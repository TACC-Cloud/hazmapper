import { DesignSafeEnvironmentType, EnvironmentType } from './environmentType';

export interface AppEnvironment {
  jwt?: string;
  production: boolean;
  backend: EnvironmentType;
  designSafePortal: DesignSafeEnvironmentType;
}

export const environment: AppEnvironment = {
  production: true,
  // only used during testing
  backend: EnvironmentType.Production,
  designSafePortal: DesignSafeEnvironmentType.Production,
};
