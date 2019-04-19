import { Component, OnInit } from '@angular/core';
import {GeoDataService} from "../../services/geo-data.service";
import {FeatureCollection} from "geojson";



interface IpanelsDisplay {
  assets: boolean;
  layers: boolean;
  filters: boolean;
  measure: boolean;
  settings: boolean;
}

@Component({
  selector: 'app-dock',
  templateUrl: './dock.component.html',
  styleUrls: ['./dock.component.styl']
})
export class DockComponent implements OnInit {

  features : FeatureCollection;
  panelsDisplay: IpanelsDisplay;

  constructor(private GeoDataService: GeoDataService) { }

  ngOnInit() {
    this.GeoDataService.features.subscribe( (fc)=> {
      this.features = fc;
    });

    this.panelsDisplay = <IpanelsDisplay>{
      assets: false,
      layers: false,
      filters: false,
      measure: false,
      settings: false
    }
  }

  showPanel(pname: string) {
    for (let key in this.panelsDisplay) {
      if (key != pname) this.panelsDisplay[key] = false;
    }
    this.panelsDisplay[pname] = !this.panelsDisplay[pname];

  }

}

