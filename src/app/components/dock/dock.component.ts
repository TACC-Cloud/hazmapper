import { Component, OnInit } from '@angular/core';
import {GeoDataService} from "../../services/geo-data.service";
import {FeatureCollection} from "geojson";

@Component({
  selector: 'app-dock',
  templateUrl: './dock.component.html',
  styleUrls: ['./dock.component.styl']
})
export class DockComponent implements OnInit {

  showAssetsPanel;
  showLayersPanel: boolean = false;
  features : FeatureCollection;

  constructor(private GeoDataService: GeoDataService) { }

  ngOnInit() {
    this.showAssetsPanel = false;
    this.showLayersPanel = false;
    this.GeoDataService.features.subscribe( (fc)=> {
      this.features = fc;
      console.log(this.features)
    })
  }

}
