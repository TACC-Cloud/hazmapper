import {Component, OnInit} from '@angular/core';
import {FeatureCollection} from "geojson";
import {GeoDataService} from "../../services/geo-data.service";

@Component({
  selector: 'app-assets-panel',
  templateUrl: './assets-panel.component.html',
  styleUrls: ['./assets-panel.component.styl']
})
export class AssetsPanelComponent implements OnInit {
  features : FeatureCollection;
  constructor(private GeoDataService: GeoDataService) { }

  ngOnInit() {
    this.GeoDataService.features.subscribe( (fc: FeatureCollection)=> {
      this.features = fc;
      console.log(fc)
    })
  }

  selectFeature(feat) {
    this.GeoDataService.activeFeature = feat;
  }

}
