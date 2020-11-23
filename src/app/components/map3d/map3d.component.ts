import {AfterViewInit, Component} from '@angular/core';

import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import * as olProj from 'ol/proj';

import * as Cesium from 'cesium';
import OLCesium from 'ol-cesium';

@Component({
  selector: 'app-map3d',
  templateUrl: './map3d.component.html',
  styleUrls: ['./map3d.component.styl']
})
export class Map3dComponent implements AfterViewInit {
  olMap: Map;
  ol3d: OLCesium;

  constructor() { }

  ngAfterViewInit() {
    this.olMap = new Map({
      target: 'map3d',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        }),
      ],
      view: new View({
        center: olProj.fromLonLat([105.2, 39.66]),
        zoom: 4
      })
    });


    this.ol3d = new OLCesium({map: this.olMap});
    this.ol3d.setEnabled(true);

    const scene = this.ol3d.getCesiumScene();
    // tslint:disable-next-line:max-line-length
    Cesium.Ion.defaultAccessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4Zjg0YWQ0My0wNzU1LTQwODYtYWIxOS1jMjg2YmQ4NTc1OGUiLCJpZCI6MzgzMTQsImlhdCI6MTYwNjIzMTY3OH0.SkWEoWp-Xjfw7kI3kC9fN2ymmQ_zQ4Dd-UDNOKUk98g`;
    scene.terrainProvider = Cesium.createWorldTerrain();
  }
}
