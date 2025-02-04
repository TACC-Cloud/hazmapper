// Tapis file (from interacting with Tapis directly, i.e. file listings)
export interface File {
  name: string;
  path: string;
  lastModified: string;
  size: number;
  nativePermissions: string;
  mimeType: string;
  type: string;
  url: string;
}

export interface IFileImportRequest {
  system_id: string;
  path: string;
}

// Tapis file's system and path (from interacting with Geoapi backend)
// TODO look at backend; so similar to IFileImportRequest but system instead of system_id. our backend is inconsistent.
export interface TapisFilePath {
  system: string;
  path: string;
}
