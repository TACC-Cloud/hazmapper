/// <reference types="vite/client" />

interface Env {
  designSafeUrl: string;
  backend: string;
  apiUrl: string;
  portalUrl: string;
  clientId: string;
  host: string;
  baseHref: string;
  jwt: string;
  mapillaryAuthUrl: string;
  mapillaryTokenUrl: string;
  mapillaryApiUrl: string;
  mapillaryTileUrl: string;
  mapillaryScope: string;
  mapillaryClientSecret: string;
  mapillaryClientId: string;
  mapillaryClientToken: string;
}

interface ProcessEnv {
  env: Env
}

declare const process: ProcessEnv;
