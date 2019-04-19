import { Component, OnInit } from '@angular/core';
import {GeoDataService} from "../../services/geo-data.service";
import {Feature} from "../../models/models";

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.styl']
})
export class AssetDetailComponent implements OnInit {

  feature: Feature;
  constructor(private GeoDataService: GeoDataService) { }

  ngOnInit() {
   this.GeoDataService.activeFeature.subscribe( (next)=>{
     this.feature = next;
   })
  }

  close() {
    this.GeoDataService.activeFeature = null;
  }

}
