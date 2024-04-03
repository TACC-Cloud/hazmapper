export interface Project {
  id?: number;
  uuid?: string;
  name: string;
  description: string;
  public?: boolean;
  system_file?: string;
  system_id?: string;
  system_path?: string;
  deletable?: boolean;
  streetview_instances?: any;
  ds_project?: DesignSafeProject;
  ds_project_id?: any;
  ds_project_title?: any;
}
export interface DesignSafeProject {
  uuid: string;
  projectId: any;
  title: any;
  value: any;
}
export interface DesignSafeProjectCollection {
  projects?: DesignSafeProject[];
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

