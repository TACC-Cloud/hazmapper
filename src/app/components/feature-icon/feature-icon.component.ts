import {Component, Input, OnInit} from '@angular/core';
import {Feature} from "geojson";

@Component({
  selector: 'app-feature-icon',
  templateUrl: './feature-icon.component.html',
  styleUrls: ['./feature-icon.component.styl']
})
export class FeatureIconComponent implements OnInit {

  @Input() feature: Feature;

  constructor() { }

  ngOnInit() {
  }

  featureType(feat: Feature) : string {
    if (feat.properties.assets &&
      feat.properties.assets.length == 1 &&
      feat.properties.assets[0].asset_type == 'image') {
      return 'image'
    } else if (feat.properties.assets &&
      feat.properties.assets.length == 1 &&
      feat.properties.assets[0].asset_type == 'video') {
      return 'video'
    } else if (feat.properties.assets &&
      feat.properties.assets.length == 1 &&
      feat.properties.assets[0].asset_type == 'audio') {
      return 'audio'
    } else if (feat.properties.assets &&
      feat.properties.assets.length == 1 &&
      feat.properties.assets[0].asset_type == 'lidar') {
      return 'lidar'
    }
  }
}
