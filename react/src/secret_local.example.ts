import {
  DesignSafePortalEnvironment,
  GeoapiBackendEnvironment,
  LocalAppConfiguration,
} from './types';

export const localDevelopmentConfiguration: LocalAppConfiguration = {
  geoapiBackend: GeoapiBackendEnvironment.Staging,
  designSafePortal: DesignSafePortalEnvironment.PPRD,
};
