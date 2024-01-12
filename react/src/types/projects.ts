export interface Project {
  description: string;
  id?: number;
  name: string;
  title?: string;
  uuid?: string;
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
export class DesignSafeProject implements DesignSafeProject {}
