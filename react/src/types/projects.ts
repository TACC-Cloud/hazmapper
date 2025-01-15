export interface Project {
  id: number;
  uuid: string;
  name: string;
  description: string;
  public: boolean;
  system_file: string;
  system_id: string;
  system_path: string;
  deletable: boolean;
  streetview_instances?: any;
  ds_project?: DesignSafeProject;
}

interface DesignSafeProjectValue {
  dois: string[] /* always empty, deprecated? */;
  title: string;
  users: any[];
  keywords: string[];
  nhEvents: string[];
  dataTypes: string[];
  projectId: string;
  nhLatitude: string;
  nhLocation: string;
  description: string;
  nhLongitude: string;
  projectType: string;
  hazmapperMaps?: any[];
}

/**
 * Partial interface for DesignSafe project value data.
 * Note: This represents key fields only, not all available fields.
 * Some fields (e.g. dois) may be deprecated.
 */
interface DesignSafeProjectValue {
  // Core project identifiers
  projectId: string;
  title: string;
  description: string;
  projectType: string;

  // Users and access
  users: any[];

  // Location data
  nhLatitude: string;
  nhLongitude: string;
  nhLocation: string;

  // Classifications and metadata
  keywords: string[];
  dataTypes: string[];
  nhEvents: string[];
  dois: string[]; // Deprecated: appears to always empty array

  // Related features
  hazmapperMaps?: any[];
}

export interface DesignSafeProject {
  uuid: string;
  name: string;
  value: DesignSafeProjectValue;
  created: string;
  lastUpdated: string;
}

export interface DesignSafeProjectCollection {
  result?: DesignSafeProject[];
}

export class Project implements Project {}

export interface ProjectRequest {
  name: string;
  description: string;
  public?: boolean;
  system_file?: string;
  system_id?: string;
  system_path?: string;
  watch_content?: boolean;
  watch_users?: boolean;
}

export class ProjectRequest implements ProjectRequest {}
export class DesignSafeProject implements DesignSafeProject {}

export interface ProjectUser {
  id: number;
  username: string;
}
