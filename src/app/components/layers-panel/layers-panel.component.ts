import { Component, OnInit } from '@angular/core';
import {GeoDataService} from "../../services/geo-data.service";

@Component({
  selector: 'app-layers-panel',
  templateUrl: './layers-panel.component.html',
  styleUrls: ['./layers-panel.component.styl']
})
export class LayersPanelComponent implements OnInit {

  basemap : string = 'sat';
  constructor(private GeoDataService: GeoDataService) { }

  ngOnInit() {
  }

  selectBasemap(bmap: string) : void {
    this.basemap = bmap;
    this.GeoDataService.basemap = this.basemap;
  }

}
