export interface AgaveArrayResponse {
  version: string;
  message: string;
  result: Array<object>;
}

export interface AgaveObjectResponse {
  version: string;
  message: string;
  result: object;
}

export interface FileInfo {
  format: string;
  lastModified: string;
  length: number;
  mimeType: string;
  path: string;
  permissions: string;
  system: string;
  type: string;
  name: string;
  _links?: object;
}

