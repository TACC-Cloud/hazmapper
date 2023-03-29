import { Component, Input, OnInit } from '@angular/core';
import { Feature } from '../../models/models';
import * as turf from '@turf/turf';

@Component({
  selector: 'app-feature-geometry',
  templateUrl: './feature-geometry.component.html',
  styleUrls: ['./feature-geometry.component.styl'],
})
export class FeatureGeometryComponent implements OnInit {
  private _feature: Feature;
  private area: any;
  public bbox: any;
  private length: any;
  private hasLength: boolean;
  private hasArea: boolean;

  constructor() {}

  ngOnInit() {}

  get feature(): Feature {
    return this._feature;
  }

  @Input()
  set feature(feature: Feature) {
    this._feature = feature;

    // TODO bring this to web worker or calculate geometry data on server
    this.area = null;
    this.length = null;
    this.bbox = null;
    this.hasArea = this._feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon';
    this.hasLength = feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString';
    this.calculateGeometryInfo(this._feature).then((value) => {
      this.area = value[0];
      this.length = value[1];
      this.bbox = value[2];
    });
  }

  private calculateGeometryInfo(feature) {
    return new Promise((resolve, reject) => {
      try {
        const area = turf.area(feature.geometry);
        const length = turf.length(feature.geometry);
        const bbox = turf.bbox(feature.geometry);
        resolve([area, length, bbox]);
      } catch (e) {
        reject('unable to calculate');
      }
    });
  }
}
