import { Task } from './task';

interface PointCLoudFileInfo {
  name: string;
}

export interface PointCloud {
  id: number;
  description: string;
  conversion_parameters: string;
  feature_id?: number;
  task: Task;
  project_id: number;
  files_info: PointCLoudFileInfo[];
}

export interface PointCloudRequest {
  description: string;
  conversion_parameters: string;
}
