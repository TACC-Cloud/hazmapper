export interface AgaveSystem {
  name: string;
  description: string;
  type: string;
  id: string;
  lastUpdated: Date;
  _links?: object;
  default: boolean;
  public: boolean;
  status: string;
}

export interface AgaveSystemsListResponse extends AgaveArrayResponse{
  result: AgaveSystem[]
}

export interface AgaveFileListingResponse extends  AgaveArrayResponse {
  result: FileInfo[]
}


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



