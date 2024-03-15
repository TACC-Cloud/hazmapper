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
