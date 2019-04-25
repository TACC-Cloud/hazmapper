import {Component, OnInit} from '@angular/core';
import {FeatureCollection} from "geojson";
import {GeoDataService} from "../../services/geo-data.service";
import {Feature} from "../../models/models";

@Component({
  selector: 'app-assets-panel',
  templateUrl: './assets-panel.component.html',
  styleUrls: ['./assets-panel.component.styl']
})
export class AssetsPanelComponent implements OnInit {
  features : FeatureCollection;
  activeFeature: Feature;
  constructor(private GeoDataService: GeoDataService) { }

  ngOnInit() {
    this.GeoDataService.features.subscribe( (fc: FeatureCollection)=> {
      this.features = fc;
    })
    this.GeoDataService.activeFeature.subscribe( (next)=>{
      console.log(next)
      this.activeFeature = next;
    })

  }

  selectFeature(feat) {
    this.GeoDataService.activeFeature = feat;
  }

}
