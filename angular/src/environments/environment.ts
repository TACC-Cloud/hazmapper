// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { jwt as devJWT } from './jwt';
import { DesignSafeEnvironmentType, EnvironmentType } from '../environments/environmentType';

export interface AppEnvironment {
  jwt?: string;
  backend: EnvironmentType;
  designSafePortal: DesignSafeEnvironmentType;
  production: boolean;
}

export const environment: AppEnvironment = {
  backend: EnvironmentType.Local,
  designSafePortal: DesignSafeEnvironmentType.Next,
  jwt: devJWT,
  production: false,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
