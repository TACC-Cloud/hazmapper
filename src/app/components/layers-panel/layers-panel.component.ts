import { Component, OnInit } from '@angular/core';
import {GeoDataService} from "../../services/geo-data.service";
import {Overlay} from "../../models/models";
import {AppEnvironment, environment} from "../../../environments/environment";

@Component({
  selector: 'app-layers-panel',
  templateUrl: './layers-panel.component.html',
  styleUrls: ['./layers-panel.component.styl']
})
export class LayersPanelComponent implements OnInit {

  basemap : string;
  overlays : Array<Overlay>;
  environment: AppEnvironment;

  constructor(private GeoDataService: GeoDataService) {

  }

  ngOnInit() {
    this.environment = environment;
    this.GeoDataService.overlays.subscribe((ovs)=>{
      this.overlays = ovs;
    })
    this.GeoDataService.basemap.subscribe( (next)=>{
      this.basemap = next;
    })
  }

  selectBasemap(bmap: string) : void {
    this.basemap = bmap;
    this.GeoDataService.basemap = this.basemap;
  }

  selectOverlay(ov) : void {
    this.GeoDataService.activeOverlay = ov;
  }

}
