export interface IpanelsDisplay {
  assets: boolean;
  layers: boolean;
  filters: boolean;
  measure: boolean;
  settings: boolean;
  pointClouds: boolean;
  streetview: boolean;
  users: boolean;
}

export const defaultPanelsDisplay: IpanelsDisplay = <IpanelsDisplay>{
  assets: false,
  layers: false,
  filters: false,
  pointClouds: false,
  measure: false,
  settings: false,
  streetview: false,
  users: false,
};
