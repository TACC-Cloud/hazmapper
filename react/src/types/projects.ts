import { DesignSafeProject } from './projectsDesignSafe';
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
  designsafe_project_id?: string;
  ds_project?: DesignSafeProject;
}
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

export interface ProjectUser {
  id: number;
  username: string;
}
