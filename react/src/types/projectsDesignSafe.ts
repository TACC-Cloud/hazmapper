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

export interface DesignSafePublishedProject {
  projectId: string;
  title: string;
  description: string;
  keywords: string[];
  type: string;
  dataTypes: string[];
  pi: {
    inst: string;
    role: string;
    email: string;
    fname: string;
    lname: string;
    username: string;
  };
  created: string; // ISO date string
}

export interface DesignSafePublishedProjectCollection {
  result: DesignSafePublishedProject[];
  total: number;
}

/* Much more complicated type in reality.
     -there are two versions (old and new, i.e. post july 2026
*/
export interface DesignSafePublishedProjectDetail {
  tree: {
    basePath: string;
  };
}
