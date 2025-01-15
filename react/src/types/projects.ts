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

  // Users - Deprecated: no longer used in v2 DS
  pi?: string;
  coPis?: any[];
  teamMembers?: string[];
  guestMembers?: string[];

  // Location data
  nhLatitude: string;
  nhLongitude: string;
  nhLocation: string;

  // Classifications and metadata
  keywords: string[];
  dataTypes: string[];
  nhEvents: string[];
  dois: string[]; // Deprecated: appears to always empty array

  // Natural Hazard specific
  nhEvent: string;
  nhTypes: string[];

  // Related features
  hazmapperMaps?: any[];
  facilities: string[];
  associatedProjects: string[];
  referencedData: any[];

  // Other
  ef?: string;
  authors?: any[];
  frTypes?: any[];
  fileObjs?: any[];
  fileTags?: string[];
  awardNumbers?: string[];
  tombstone?: boolean;
}

export interface DesignSafeProject {
  uuid: string;
  name: string;
  value: DesignSafeProjectValue;
  created: string;
  lastUpdated: string;
  associationIds?: any[];
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
