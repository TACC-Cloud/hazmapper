export interface System {
  description: string;
  id: string;
  name: string;
  default: boolean;
  lastUpdated: string;
  public: boolean;
  status: string;
  type: string;
}
export class System implements System {}
