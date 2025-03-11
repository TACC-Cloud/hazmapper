/**
 * Environment for Geoapi Backend
 */
export enum GeoapiBackendEnvironment {
  Production = 'production',
  Staging = 'staging',
  Dev = 'dev',
  Experimental = 'experimental',
  Local = 'local',
  Test = 'test', // for unit testing
}

/**
 * Environment for Geoapi Backend
 */
export enum DesignSafePortalEnvironment {
  Production = 'production' /* https://www.designsafe-ci.org/ */,
  PPRD = 'PPRD' /* https://pprd.designsafe-ci.org;  This is comparable to Geoapi's staging. */,
  Next = 'experimental' /* https://designsafeci-next.tacc.utexas.edu/ */,
  Local = 'local' /* not supported but would be designsafe.dev */,
}

/**
 *  Known Apis
 */
export enum ApiService {
  /* Geoapi api */
  Geoapi = 'geoapi',

  /* DesignSafe api - for project listings + project metadata read/update */
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
  /* The type of backend environment (production, staging, development, or local) */
  geoapiBackend: GeoapiBackendEnvironment;

  /** Type of GeoAPI service. Defaults to PPRD if not provided */
  designSafePortal?: DesignSafePortalEnvironment;
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

  /** Geoapi environments. */
  geoapiEnv: GeoapiBackendEnvironment;

  /** URL for the GeoAPI service. */
  geoapiUrl: string;

  /** URL for the DesignSafe portal and API. */
  designsafePortalUrl: string;

  /** URL for Tapis  */
  tapisUrl: string;

  /** Mapillary related configuration */
  mapillary: MapillaryConfiguration;

  /** URL for taggit */
  taggitUrl: string;
}
