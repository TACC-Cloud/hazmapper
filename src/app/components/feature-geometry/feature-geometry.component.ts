import {Component, Input, OnInit} from '@angular/core';
import {Feature} from "../../models/models";
import * as turf from '@turf/turf';
import {AllGeoJSON} from "@turf/helpers";

@Component({
  selector: 'app-feature-geometry',
  templateUrl: './feature-geometry.component.html',
  styleUrls: ['./feature-geometry.component.styl']
})
export class FeatureGeometryComponent implements OnInit {

  private _feature: Feature;
  private area: any;

  constructor() {
  }

  ngOnInit() {
  }

  get feature(): Feature{
    return this._feature;
  }

  @Input()
  set feature(feature: Feature){
    this._feature = feature;
    this.calculateArea().then(value => {
      // TODO bring this to web worker or calculate geometry data on server
      this.area = value
    });
  }

  calculateArea() {
    return new Promise(resolve => {
      let value = turf.area(<AllGeoJSON>this.feature.geometry);

      resolve((value) ? value.toFixed(2) : "-----");
    });
  }

}
