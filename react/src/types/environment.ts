/**
 * Environment for Geoapi Backend
 */
export enum GeoapiBackendEnvironment {
  Production = 'production',
  Staging = 'staging',
  Dev = 'dev',
  Local = 'local',
}

/**
 * Environment for Geoapi Backend
 */
export enum DesignSafePortalEnvironment {
  Production = 'production',
  Dev = 'dev',
}

/**
 *  Known Apis
 */
export enum ApiService {
  /* Geoapi api */
  Geoapi = 'geoapi',

  /* DesignSafe api - for project listings */
  DesignSafe = 'designsafe',

  /* Tapis api - for system listings and file operations */
  Tapis = 'tapis',

  /* Mapillary */
  Mapillary = 'mapillary',
}

/**
 * Configuration settings for local development.
 *
 * These can be configured by developer in secret_local.ts (see README)
 *
 */
export interface LocalAppConfiguration {
  /* Developer's JWT token used for authentication during local development. */
  jwt: string;

  /* The type of backend environment (production, staging, development, or local) */
  geoapiBackend: GeoapiBackendEnvironment;

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

  /* The type of backend environment */
  geoapiBackend: GeoapiBackendEnvironment;

  /** URL for the GeoAPI service. */
  geoapiUrl: string;

  /** URL for the DesignSafe/tapis API. */
  designSafeUrl: string;

  /** URL for the DesignSafe portal. */
  designsafePortalUrl: string;

  /** Mapillary related configuration */
  mapillary: MapillaryConfiguration;

  /** URL for taggit */
  taggitUrl: string;

  /** Optional JWT token used for development with local geoapi service. */
  jwt?: string;
}
