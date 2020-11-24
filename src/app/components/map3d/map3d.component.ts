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
  viewer: Cesium.Viewer;
  private useOLCesium: boolean;

  constructor() {
    this.useOLCesium = false;
  }

  ngAfterViewInit() {
    if (this.useOLCesium) {
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

      this.ol3d = new OLCesium({map: this.olMap, target: 'map3d', layers: []});

      const scene = this.ol3d.getCesiumScene();
      // tslint:disable-next-line:max-line-length
      Cesium.Ion.defaultAccessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4Zjg0YWQ0My0wNzU1LTQwODYtYWIxOS1jMjg2YmQ4NTc1OGUiLCJpZCI6MzgzMTQsImlhdCI6MTYwNjIzMTY3OH0.SkWEoWp-Xjfw7kI3kC9fN2ymmQ_zQ4Dd-UDNOKUk98g`;
      scene.terrainProvider = Cesium.createWorldTerrain();

      // 3d tile sets not showing??
      scene.primitives.add(new Cesium.Cesium3DTileset({ url: Cesium.IonResource.fromAssetId(5714) }));
      scene.primitives.add(Cesium.createOsmBuildings());

      this.ol3d.setEnabled(true);
    } else {
      this.viewer = new Cesium.Viewer('map3d', {
        terrainProvider : Cesium.createWorldTerrain(),
        //Hide the base layer picker
        baseLayerPicker : false,
        //Use OpenStreetMaps
        imageryProvider : new Cesium.OpenStreetMapImageryProvider({
          url : 'https://a.tile.openstreetmap.org/'
        }),
        // Show Columbus View map with Web Mercator projection
        mapProjection : new Cesium.WebMercatorProjection()
      });

      this.viewer.scene.primitives.add(Cesium.createOsmBuildings());

      const redRock = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url: `http://cesium.entwine.io/data/red-rocks/tileset.json`
      }));
      redRock.style = new Cesium.Cesium3DTileStyle({
        pointSize: 2
      });
      this.viewer.zoomTo(redRock);
      this.viewer.flyTo(redRock);


      this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url: `http://cesium.entwine.io/data/nyc-2/tileset.json`
      }));

    }
  }
}
