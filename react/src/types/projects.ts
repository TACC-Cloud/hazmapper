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
}
export class Project implements Project {}
