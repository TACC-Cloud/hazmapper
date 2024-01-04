export enum EnvironmentType {
  Production = 'production',
  Staging = 'staging',
  Dev = 'dev',
  Local = 'local',
}

/**
 * Configuration settings for local development.
 *
 * @param jwt
 * @param geoapiBackend The type of backend environment (production, staging, or development).
 * @param production A boolean indicating whether the app is running in production mode.
 */
export interface LocalAppConfiguration {
  /* JWT token used for authentication during local development. */
  jwt: string;

  /* The type of backend environment (production, staging, development, or local) */
  geoapiBackend: EnvironmentType;

  /* TODO */
  production: boolean;
}

/**
 * Mapillary configuration
 */
export interface MapillaryConfiguration {
  authUrl: string;
  tokenUrl: string;
  apiUrl: string;
  tileUrl: string;
  scope: string;
  clientSecret: string;
  clientId: string;
  clientToken: string;
}

/**
 * Configuration for the application
 * related to Geoapi backend, auth and other services
 */
export interface AppConfiguration {
  /** Base URL path for the application. */
  basePath: string;

  /** Client ID used for Tapis authentication. */
  clientId: string;

  /** URL for the GeoAPI service. */
  geoapiUrl: string;

  /** URL for the DesignSafe API. */
  designSafeUrl: string;

  /** URL for the DesignSafe portal. */
  designsafePortalUrl: string;

  /** Mapillary related configuration */
  mapillary: MapillaryConfiguration;

  /** Optional JWT token used for development with local geoapi service. */
  jwt?: string;
}
