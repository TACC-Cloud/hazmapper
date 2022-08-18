import * as L from "leaflet";

declare module "leaflet" {
  namespace vectorGrid {
    export function slicer(data: any, options?: any): any;
    export function protobuf(url: any, options?: any): any;
  }
}
