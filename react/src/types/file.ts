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

// TODO look at backend; so similar to IFileImportRequest but system instead of system_id. our backend is in consistent.
export interface TapisFilePath {
  system: string;
  path: string;
}
