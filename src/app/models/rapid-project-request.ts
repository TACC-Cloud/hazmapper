
class RapidProjectRequest {
  system_id: string;
  path: string;

  constructor(systemId: string, path: string) {
    this.system_id = systemId;
    this.path = path;
  }
}

export {RapidProjectRequest};
