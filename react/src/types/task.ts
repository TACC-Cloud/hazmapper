export interface Task {
  id: number;
  status: string;
  description: string;
  project_id?: number;
  created: string;
  updated: string;
  latest_message?: string;
}
