export interface INotification {
  id: number;
  created: Date;
  status: string;
  message: string;
  viewed: boolean;
}

export interface IProgressNotification {
  id: number;
  uuid: string;
  progress: number;
  created: Date;
  status: string;
  message: string;
  viewed: boolean;
  logs: any;
}
