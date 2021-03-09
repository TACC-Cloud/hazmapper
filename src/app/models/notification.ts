export interface INotification {
  id: number;
  created: Date;
  status: string;
  message: string;
  viewed: boolean;
}

export interface IProgressNotification {
  id: number;
  created: Date;
  status: string;
  message: string;
  viewed: boolean;
}
