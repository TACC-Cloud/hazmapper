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

export interface TapisFilePath {
  system: string;
  path: string;
}
