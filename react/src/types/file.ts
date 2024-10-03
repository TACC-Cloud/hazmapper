export interface File {
  name: string;
  path: string;
  lastModified: string;
  length: number;
  permissions: string;
  format: string;
  system: string;
  mimeType: string;
  type: string;
  _links?: {
    self?: {
      href: string;
    };
    system?: {
      href: string;
    };
    metadata?: {
      href: string;
    };
    history?: {
      href: string;
    };
  };
}
