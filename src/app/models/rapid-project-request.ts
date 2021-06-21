
class RapidProjectRequest {
  system_id: string;
  project_id: number;
  watch_content: boolean;
  path: string;

  constructor(systemId: string, path: string, watchContent: boolean, projectId?: number) {
    this.system_id = systemId;
    if (projectId) {
      this.project_id = projectId;
    }
    this.watch_content = watchContent;
    this.path = path;
  }
}

export {RapidProjectRequest};
