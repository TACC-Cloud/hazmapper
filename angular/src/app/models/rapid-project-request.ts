class RapidProjectRequest {
  system_id: string;
  project_id: number;
  file_name: string;
  watch_content: boolean;
  path: string;

  constructor(
    systemId: string,
    path: string,
    watchContent: boolean,
    projectId?: number,
    fileName?: string
  ) {
    this.system_id = systemId;
    this.project_id = projectId ? projectId : undefined;
    this.file_name = fileName ? fileName : '';
    this.watch_content = watchContent;
    this.path = path;
  }
}

export { RapidProjectRequest };
