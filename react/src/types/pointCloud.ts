import { Task } from './task';

export interface PointCloud {
  id: number;
  description: string;
  conversion_parameters: string;
  feature_id?: number;
  task: Task;
  project_id: number;
  files_info: string;
}

export interface PointCloudRequest {
  description: string;
  conversion_parameters: string;
}
